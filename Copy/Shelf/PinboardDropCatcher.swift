import SwiftUI
import UniformTypeIdentifiers

/// DnD-DEBUG: temporary drag-and-drop tracing. Filter the Xcode console for "Copy DnD".
func dndLog(_ message: String) {
    NSLog("Copy DnD: %@", message)
}

/// DnD-DEBUG: last tab reported by `dropUpdated`, so the trace logs target changes only.
private var dndLastLoggedTarget: Int64?? = .none

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

/// Shelf-level drop target for both card filing and pinboard reordering. Small per-tab
/// drop targets don't work reliably in the shelf panel, so both paths resolve the tab
/// under the pointer from the frames published by `PinboardTabFramesKey`.
struct PinboardDropDelegate: DropDelegate {
    /// Pinboard tab frames in the same coordinate space this delegate's `.onDrop` uses.
    var tabFrames: () -> [Int64: CGRect]
    /// Reports the card-filing target for the existing full-tab highlight.
    var onFileTargetChange: (Int64?) -> Void
    /// Reports the reorder target and whether the insertion point is after its midpoint.
    var onReorderTargetChange: (Int64?, Bool) -> Void
    /// Files the dragged card uuid(s) into the given pinboard.
    var onFile: (Int64, [String]) -> Void
    /// Moves one dragged pinboard before or after the target pinboard.
    var onMove: (Int64, Int64, Bool) -> Void

    private func pinboard(at point: CGPoint) -> Int64? {
        let frames = tabFrames()
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

    /// Accepts any card or pinboard drag, wherever it enters. SwiftUI asks this once, as
    /// the drag enters the shelf, and ignores the rest of the session on `false`. A card
    /// drag starts over the cards, never over a tab, so gating on the location here
    /// rejected every card drag. The location is enforced where it belongs instead:
    /// `dropUpdated` cancels off-tab and `performDrop` ignores a release off-tab.
    func validateDrop(info: DropInfo) -> Bool {
        let result = info.hasItemsConforming(to: [UTType.copyPinboard])
            || info.hasItemsConforming(to: [UTType.copyItem])
        dndLog("validateDrop at \(info.location) copyItem=\(info.hasItemsConforming(to: [UTType.copyItem])) copyPinboard=\(info.hasItemsConforming(to: [UTType.copyPinboard])) tab=\(String(describing: pinboard(at: info.location))) tabFrames=\(tabFrames()) -> \(result)") // DnD-DEBUG
        return result
    }

    func dropEntered(info: DropInfo) {
        dndLog("dropEntered at \(info.location) tab=\(String(describing: pinboard(at: info.location)))") // DnD-DEBUG
        dndLastLoggedTarget = .none // DnD-DEBUG
        updateTarget(for: info)
    }

    func dropUpdated(info: DropInfo) -> DropProposal? {
        let target = pinboard(at: info.location)
        if dndLastLoggedTarget != .some(target) { // DnD-DEBUG
            dndLog("dropUpdated: now over tab \(String(describing: target)) at \(info.location)") // DnD-DEBUG
            dndLastLoggedTarget = .some(target) // DnD-DEBUG
        } // DnD-DEBUG
        updateTarget(for: info)
        let operation: DropOperation = info.hasItemsConforming(to: [UTType.copyPinboard])
            ? .move
            : .copy
        return DropProposal(operation: target != nil ? operation : .cancel)
    }

    func dropExited(info: DropInfo) {
        dndLog("dropExited at \(info.location)") // DnD-DEBUG
        clearTargets()
    }

    func performDrop(info: DropInfo) -> Bool {
        dndLog("performDrop at \(info.location) tab=\(String(describing: pinboard(at: info.location)))") // DnD-DEBUG
        guard let id = pinboard(at: info.location) else { return false }

        if let provider = info.itemProviders(for: [UTType.copyPinboard]).first {
            let placeAfterTarget = placesAfterTarget(id, at: info.location)
            clearTargets()
            provider.loadDataRepresentation(forTypeIdentifier: UTType.copyPinboard.identifier) { data, _ in
                guard let data,
                      let rawID = String(data: data, encoding: .utf8),
                      let sourceID = Int64(rawID) else { return }
                DispatchQueue.main.async {
                    onMove(sourceID, id, placeAfterTarget)
                    clearTargets()
                }
            }
            return true
        }

        clearTargets()
        guard let provider = info.itemProviders(for: [UTType.copyItem]).first else {
            dndLog("performDrop: no copyItem provider in the drop") // DnD-DEBUG
            return false
        }
        provider.loadDataRepresentation(forTypeIdentifier: UTType.copyItem.identifier) { data, error in
            dndLog("performDrop: payload loaded bytes=\(data?.count ?? -1) error=\(String(describing: error))") // DnD-DEBUG
            guard let data, let payload = String(data: data, encoding: .utf8) else { return }
            let uuids = payload.split(separator: "\n").map(String.init)
            guard !uuids.isEmpty else { return }
            DispatchQueue.main.async {
                dndLog("performDrop: filing \(uuids.count) card(s) into tab \(id)") // DnD-DEBUG
                onFile(id, uuids)
                // Clear the highlight again after any trailing dropUpdated: SwiftUI doesn't
                // call dropExited after a successful drop, so without this the filed-into
                // tab keeps its drop border.
                clearTargets()
            }
        }
        return true
    }

    private func updateTarget(for info: DropInfo) {
        let target = pinboard(at: info.location)
        if info.hasItemsConforming(to: [UTType.copyPinboard]) {
            onFileTargetChange(nil)
            onReorderTargetChange(target, target.map { placesAfterTarget($0, at: info.location) } ?? false)
        } else {
            onReorderTargetChange(nil, false)
            onFileTargetChange(target)
        }
    }

    private func placesAfterTarget(_ id: Int64, at point: CGPoint) -> Bool {
        guard let frame = tabFrames()[id] else { return false }
        return point.x >= frame.midX
    }

    private func clearTargets() {
        onFileTargetChange(nil)
        onReorderTargetChange(nil, false)
    }
}
