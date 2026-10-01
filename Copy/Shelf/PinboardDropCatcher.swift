import SwiftUI
import UniformTypeIdentifiers

/// DnD-DEBUG: temporary drag-and-drop tracing. Filter the Xcode console for "Copy DnD".
func dndLog(_ message: String) {
    NSLog("Copy DnD: %@", message)
}

/// Frames of each pinboard tab, keyed by pinboard id, in the shelf's `"shelfRoot"`
/// coordinate space. Each `TabPill` publishes its own frame; `ShelfRootView` collects them
/// so the shelf-level `PinboardDropDelegate` can tell which tab a drop landed on.
///
/// Pinboard-related drops can't be caught reliably by a per-tab `.onDrop`: inside the shelf's
/// borderless, non-activating Liquid Glass panel, a small nested pill never establishes a
/// working SwiftUI drop region (a `.onDrop` on the whole shelf, by contrast, fires
/// reliably). So the shelf handles the drop once at its root and maps the drop location to
/// a tab via these frames.
struct PinboardTabFramesKey: PreferenceKey {
    static var defaultValue: [Int64: CGRect] { [:] }
    static func reduce(value: inout [Int64: CGRect], nextValue: () -> [Int64: CGRect]) {
        value.merge(nextValue(), uniquingKeysWith: { _, new in new })
    }
}

/// Maps a point in the shelf's top-left coordinate space (`"shelfRoot"`, which is also the
/// hosting view's) to the pinboard tab under it, using the frames each tab publishes.
enum PinboardTabHitTest {
    static func pinboard(at point: CGPoint, in frames: [Int64: CGRect]) -> Int64? {
        guard !frames.isEmpty else { return nil }
        // Exact hit first (cursor squarely inside a pill).
        if let hit = frames.first(where: { $0.value.contains(point) })?.key { return hit }
        // Otherwise resolve by column, not by an inflated rectangle: the pills are only ~24pt
        // tall and sit in a single row, so matching a raw point against thin, near-touching
        // frames misses at edges and picks arbitrarily where inflated frames overlap. Instead,
        // accept any drop within the tab-row's vertical band and map it to the tab whose X
        // range holds the cursor — or the nearest tab center when between columns.
        let rowTop = frames.values.map(\.minY).min() ?? 0
        let rowBottom = frames.values.map(\.maxY).max() ?? 0
        guard point.y >= rowTop - 14, point.y <= rowBottom + 14 else { return nil }
        if let column = frames.first(where: { point.x >= $0.value.minX && point.x <= $0.value.maxX })?.key {
            return column
        }
        return frames.min(by: { abs($0.value.midX - point.x) < abs($1.value.midX - point.x) })?.key
    }
}

/// Shelf-level drop target for reordering pinboards by dragging their tabs. Small per-tab
/// drop targets don't work reliably in the shelf panel, so this resolves the tab under the
/// pointer from the frames published by `PinboardTabFramesKey`.
///
/// Card → pinboard filing is not handled here: a card drag starts inside the card row's
/// scroll view, and SwiftUI stops delivering drop updates once that drag crosses into the
/// header, so the tabs never see it. The shelf's hosting view (`ShelfHostingView` in
/// `ShelfPanelController.swift`) takes card drags instead.
struct PinboardDropDelegate: DropDelegate {
    /// Pinboard tab frames in the same coordinate space this delegate's `.onDrop` uses.
    var tabFrames: () -> [Int64: CGRect]
    /// Reports the reorder target and whether the insertion point is after its midpoint.
    var onReorderTargetChange: (Int64?, Bool) -> Void
    /// Moves one dragged pinboard before or after the target pinboard.
    var onMove: (Int64, Int64, Bool) -> Void

    private func pinboard(at point: CGPoint) -> Int64? {
        PinboardTabHitTest.pinboard(at: point, in: tabFrames())
    }

    /// Accepts any pinboard drag, wherever it enters. SwiftUI asks this once, as the drag
    /// enters the shelf, and ignores the rest of the session on `false`, so the location
    /// is enforced in `dropUpdated` and `performDrop` instead.
    func validateDrop(info: DropInfo) -> Bool {
        info.hasItemsConforming(to: [UTType.copyPinboard])
    }

    func dropEntered(info: DropInfo) {
        updateTarget(for: info)
    }

    func dropUpdated(info: DropInfo) -> DropProposal? {
        updateTarget(for: info)
        return DropProposal(operation: pinboard(at: info.location) != nil ? .move : .cancel)
    }

    func dropExited(info: DropInfo) {
        clearTarget()
    }

    func performDrop(info: DropInfo) -> Bool {
        // Checked by type, not by `itemProviders(for:)`: that call also returns providers of
        // other generic-data types (a card), whose pinboard payload then fails to load.
        guard info.hasItemsConforming(to: [UTType.copyPinboard]),
              let id = pinboard(at: info.location),
              let provider = info.itemProviders(for: [UTType.copyPinboard]).first else {
            clearTarget()
            return false
        }
        let placeAfterTarget = placesAfterTarget(id, at: info.location)
        clearTarget()
        provider.loadDataRepresentation(forTypeIdentifier: UTType.copyPinboard.identifier) { data, _ in
            DispatchQueue.main.async {
                // Clear again after any trailing dropUpdated, whether or not the load worked.
                defer { clearTarget() }
                guard let data,
                      let rawID = String(data: data, encoding: .utf8),
                      let sourceID = Int64(rawID) else { return }
                onMove(sourceID, id, placeAfterTarget)
            }
        }
        return true
    }

    private func updateTarget(for info: DropInfo) {
        let target = pinboard(at: info.location)
        onReorderTargetChange(target, target.map { placesAfterTarget($0, at: info.location) } ?? false)
    }

    private func placesAfterTarget(_ id: Int64, at point: CGPoint) -> Bool {
        guard let frame = tabFrames()[id] else { return false }
        return point.x >= frame.midX
    }

    private func clearTarget() {
        onReorderTargetChange(nil, false)
    }
}
