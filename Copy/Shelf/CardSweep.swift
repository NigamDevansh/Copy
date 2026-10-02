import SwiftUI

/// Frames of the cards currently built in the card row, keyed by item uuid, in the row's
/// content space (`CardSweep.contentSpace`), which scrolls with the cards. The row is
/// lazy, so this only ever holds the cards on or near the screen.
struct CardFramesKey: PreferenceKey {
    static var defaultValue: [String: CGRect] { [:] }
    static func reduce(value: inout [String: CGRect], nextValue: () -> [String: CGRect]) {
        value.merge(nextValue(), uniquingKeysWith: { _, new in new })
    }
}

/// The geometry of a drag-select: pressing in the shelf's empty space — in the card row or
/// up in the header beside the tabs — and sweeping a rectangle over cards selects them, as
/// in Finder. Pressing on a card or a pinboard tab is not a sweep; that drags it instead.
///
/// This holds only the geometry — the rectangle, which cards it touches, and whether the
/// pointer is parked at an edge so the row should scroll. `ShelfViewModel` turns the cards
/// it touches into the selection. The pointer is reported in the shelf's `"shelfRoot"`
/// space; the rectangle is kept in the row's content space, so its starting corner stays
/// with the cards it started beside while the row scrolls under the pointer.
@MainActor
@Observable
final class CardSweep {
    /// Coordinate space of the scroll view's visible area.
    static let viewportSpace = "shelfRowViewport"
    /// Coordinate space of the scrolling content; card frames and `rect` are measured here.
    static let contentSpace = "shelfRowContent"

    /// The selection rectangle, in content space, while a sweep is in progress.
    private(set) var rect: CGRect?

    @ObservationIgnored private var cardFrames: [String: CGRect] = [:]
    @ObservationIgnored private var contentOrigin: CGPoint = .zero
    /// The card row's visible area, in the shelf's `"shelfRoot"` space.
    @ObservationIgnored var viewportFrame: CGRect = .zero
    /// Where the sweep started, in content space. Non-nil while sweeping.
    @ObservationIgnored private var start: CGPoint?
    /// The pointer's latest position, in the shelf's space.
    @ObservationIgnored private var pointer: CGPoint = .zero
    /// The card row's scroll view, scrolled directly while the pointer is held at an edge.
    @ObservationIgnored weak var scrollView: NSScrollView?
    /// Points to scroll per tick while the pointer is in an edge zone: negative toward
    /// the leading edge, positive toward the trailing one, 0 when it is in neither.
    @ObservationIgnored private var edgeScrollStep: CGFloat = 0
    @ObservationIgnored private var edgeScrollTimer: Timer?

    /// How close to the row's edge the pointer has to be for the row to scroll.
    private static let edgeScrollMargin: CGFloat = 44
    /// The fastest the row scrolls, in points per tick (60 ticks a second), reached when
    /// the pointer is at or past the edge. It eases in from the start of the edge zone.
    private static let edgeScrollMaxStep: CGFloat = 16

    var isActive: Bool { start != nil }

    /// The row's lazy stack drops cards that scroll away, so during a sweep the frames are
    /// accumulated: a card swept earlier stays selected after it leaves the screen.
    func cardFramesChanged(_ frames: [String: CGRect]) {
        if isActive {
            cardFrames.merge(frames, uniquingKeysWith: { _, new in new })
        } else {
            cardFrames = frames
        }
    }

    /// Starts a sweep at `point` (shelf space). Returns false, starting nothing, when the
    /// press is on a card or inside one of `draggables` (the pinboard tabs, in shelf space).
    func begin(at point: CGPoint, avoiding draggables: [CGRect]) -> Bool {
        let origin = contentPoint(point)
        guard !cardFrames.values.contains(where: { $0.contains(origin) }),
              !draggables.contains(where: { $0.contains(point) }) else { return false }
        start = origin
        pointer = point
        refresh()
        return true
    }

    func move(to point: CGPoint) {
        guard isActive else { return }
        pointer = point
        refresh()
    }

    /// The content moved inside the viewport (the row scrolled). Returns whether a sweep is
    /// in progress, in which case the rectangle now reaches different cards.
    func contentMoved(to origin: CGPoint) -> Bool {
        contentOrigin = origin
        guard isActive else { return false }
        refresh()
        return true
    }

    func end() {
        start = nil
        rect = nil
        setEdgeScrollStep(0)
    }

    /// The selection rectangle in the shelf's space, for drawing over the whole shelf.
    var rectInShelf: CGRect? {
        rect?.offsetBy(dx: contentOrigin.x + viewportFrame.minX, dy: contentOrigin.y + viewportFrame.minY)
    }

    /// The cards the rectangle touches.
    var hits: Set<String> {
        guard let rect else { return [] }
        return Set(cardFrames.filter { $0.value.intersects(rect) }.keys)
    }

    /// Of the cards the rectangle touches, the one nearest the pointer.
    var nearestHit: String? {
        guard let rect else { return nil }
        let x = contentPoint(pointer).x
        return cardFrames
            .filter { $0.value.intersects(rect) }
            .min(by: { abs($0.value.midX - x) < abs($1.value.midX - x) })?.key
    }

    private func contentPoint(_ shelfPoint: CGPoint) -> CGPoint {
        CGPoint(x: shelfPoint.x - viewportFrame.minX - contentOrigin.x,
                y: shelfPoint.y - viewportFrame.minY - contentOrigin.y)
    }

    private func refresh() {
        guard let start else { return }
        let current = contentPoint(pointer)
        rect = CGRect(x: min(start.x, current.x), y: min(start.y, current.y),
                      width: abs(current.x - start.x), height: abs(current.y - start.y))
        // How far into an edge zone the pointer is: 0 at the zone's start, 1 at the edge.
        let trailing = (pointer.x - (viewportFrame.maxX - Self.edgeScrollMargin)) / Self.edgeScrollMargin
        let leading = ((viewportFrame.minX + Self.edgeScrollMargin) - pointer.x) / Self.edgeScrollMargin
        if trailing > 0 {
            setEdgeScrollStep(min(trailing, 1) * Self.edgeScrollMaxStep)
        } else if leading > 0 {
            setEdgeScrollStep(-min(leading, 1) * Self.edgeScrollMaxStep)
        } else {
            setEdgeScrollStep(0)
        }
    }

    /// Runs the edge-scroll timer only while there is something to scroll.
    private func setEdgeScrollStep(_ step: CGFloat) {
        edgeScrollStep = step
        if step == 0 {
            edgeScrollTimer?.invalidate()
            edgeScrollTimer = nil
        } else if edgeScrollTimer == nil {
            let timer = Timer(timeInterval: 1.0 / 60, repeats: true) { [weak self] _ in
                MainActor.assumeIsolated { self?.edgeScrollTick() }
            }
            // `.common` so it keeps firing while the mouse is held down in the drag.
            RunLoop.main.add(timer, forMode: .common)
            edgeScrollTimer = timer
        }
    }

    /// Scrolls the row a small step, the way a trackpad scroll would: continuous and
    /// unanimated, so the rectangle and the selection follow it frame by frame (through
    /// `contentMoved`) instead of chasing an animation.
    private func edgeScrollTick() {
        guard let scrollView, let document = scrollView.documentView else { return }
        let clip = scrollView.contentView
        let maxX = max(0, document.frame.width - clip.bounds.width)
        let x = min(max(clip.bounds.origin.x + edgeScrollStep, 0), maxX)
        guard x != clip.bounds.origin.x else { return }
        clip.setBoundsOrigin(NSPoint(x: x, y: clip.bounds.origin.y))
        scrollView.reflectScrolledClipView(clip)
    }
}

/// The drag-select rectangle, drawn over the whole shelf (in its `"shelfRoot"` space) so a
/// sweep that starts in the header shows from there. Its own view so only it redraws as
/// the rectangle changes.
struct CardSweepRectangle: View {
    let sweep: CardSweep

    var body: some View {
        // Drawn as a path in the shelf's coordinates rather than as a sized, offset view:
        // once the row has scrolled, the rectangle reaches far past the shelf's edge, and
        // a view wider than its container gets re-centered by layout, which pulled the
        // rectangle away from the pointer.
        // Neutral, like Finder's: the cards' own selected look carries the result.
        let outline = Path(sweep.rectInShelf ?? .zero)
        ZStack {
            outline.fill(Color.primary.opacity(0.08))
            outline.stroke(Color.primary.opacity(0.28), lineWidth: 1)
        }
        // Never animated: it has to sit exactly under the pointer, and an animation picked
        // up from elsewhere (a scroll, a selection change) would leave it trailing behind.
        .transaction { $0.animation = nil }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}

/// Hands the card row's `NSScrollView` to `CardSweep`. Sits in the row's content, where
/// AppKit's `enclosingScrollView` is the scroll view SwiftUI built for the row.
struct CardRowScrollViewFinder: NSViewRepresentable {
    let onFind: (NSScrollView?) -> Void

    func makeNSView(context: Context) -> FinderView {
        let view = FinderView()
        view.onFind = onFind
        return view
    }

    func updateNSView(_ nsView: FinderView, context: Context) {
        nsView.onFind = onFind
    }

    final class FinderView: NSView {
        var onFind: ((NSScrollView?) -> Void)?

        override func viewDidMoveToWindow() {
            super.viewDidMoveToWindow()
            // The scroll view is this view's ancestor only once the hierarchy is assembled.
            DispatchQueue.main.async { [weak self] in
                guard let self else { return }
                self.onFind?(self.enclosingScrollView)
            }
        }
    }
}
