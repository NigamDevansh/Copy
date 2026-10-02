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
    /// -1 or 1 while the pointer is held at the row's leading or trailing edge, where the
    /// row scrolls to bring more cards under the sweep; 0 otherwise.
    private(set) var edgeScroll = 0

    @ObservationIgnored private var cardFrames: [String: CGRect] = [:]
    @ObservationIgnored private var contentOrigin: CGPoint = .zero
    /// The card row's visible area, in the shelf's `"shelfRoot"` space.
    @ObservationIgnored var viewportFrame: CGRect = .zero
    /// Where the sweep started, in content space. Non-nil while sweeping.
    @ObservationIgnored private var start: CGPoint?
    /// The pointer's latest position, in the shelf's space.
    @ObservationIgnored private var pointer: CGPoint = .zero

    /// How close to the row's edge the pointer has to be for the row to scroll.
    private static let edgeScrollMargin: CGFloat = 28

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
        edgeScroll = 0
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

    /// While the pointer is held at an edge: the next card past that edge, in `order`, to
    /// scroll into view. Nil when there is none or the pointer isn't at an edge.
    func scrollTarget(in order: [String]) -> String? {
        guard edgeScroll != 0 else { return nil }
        let fullyVisible = order.indices.filter { index in
            guard let frame = cardFrames[order[index]] else { return false }
            return frame.minX + contentOrigin.x >= 0 && frame.maxX + contentOrigin.x <= viewportFrame.width
        }
        let next = edgeScroll > 0 ? fullyVisible.last.map { $0 + 1 } : fullyVisible.first.map { $0 - 1 }
        guard let next, order.indices.contains(next) else { return nil }
        return order[next]
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
        if pointer.x > viewportFrame.maxX - Self.edgeScrollMargin {
            edgeScroll = 1
        } else if pointer.x < viewportFrame.minX + Self.edgeScrollMargin {
            edgeScroll = -1
        } else {
            edgeScroll = 0
        }
    }
}

/// The drag-select rectangle, drawn over the whole shelf (in its `"shelfRoot"` space) so a
/// sweep that starts in the header shows from there. Its own view so only it redraws as
/// the rectangle changes.
struct CardSweepRectangle: View {
    let sweep: CardSweep

    var body: some View {
        ZStack(alignment: .topLeading) {
            Color.clear
            if let rect = sweep.rectInShelf {
                // Neutral, like Finder's: the cards' own selected look carries the result.
                Rectangle()
                    .fill(Color.primary.opacity(0.08))
                    .overlay(Rectangle().strokeBorder(Color.primary.opacity(0.28), lineWidth: 1))
                    .frame(width: rect.width, height: rect.height)
                    .offset(x: rect.minX, y: rect.minY)
            }
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}
