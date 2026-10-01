import AppKit

/// Trackpad haptics for shelf interactions, in three strengths so every call site reads
/// as intent rather than as an `NSHapticFeedbackManager` pattern name. All of it sits
/// behind the "Haptic Feedback" setting (`SettingsStore.hapticFeedback`), which flips
/// `isEnabled` here; nothing else needs to consult the store.
///
/// Used sparingly, per Apple's guidance: a haptic marks something the user *did*
/// (switched, filed, pasted, dragged), never a passive update, and never a key repeat
/// such as arrowing through cards.
@MainActor
enum Haptics {
    /// Mirrors `SettingsStore.hapticFeedback`. Defaults on, like the setting.
    static var isEnabled = true

    /// A light tap: something lined up or switched — a tab change, a drag landing on a
    /// board, a drag starting.
    static func tap() { perform(.alignment) }

    /// A firmer click: a state committed — a card filed on a board, a tab reordered,
    /// the shelf opening.
    static func snap() { perform(.levelChange) }

    /// A confirming tick: an action completed — a paste, a favorite, a delete, an undo.
    static func confirm() { perform(.generic) }

    private static func perform(_ pattern: NSHapticFeedbackManager.FeedbackPattern) {
        guard isEnabled else { return }
        NSHapticFeedbackManager.defaultPerformer.perform(pattern, performanceTime: .now)
    }
}
