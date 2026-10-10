import Foundation

public extension ClipItem {
    /// One-line human title for menus and compact rows.
    var menuTitle: String { menuTitle(hidingSecrets: false) }

    /// The user-assigned `title` when set, otherwise `menuTitle`.
    var displayTitle: String { displayTitle(hidingSecrets: false) }

    /// `menuTitle`, with any API key or other secret in it masked when `hidingSecrets`
    /// (see `SecretDetector`).
    func menuTitle(hidingSecrets: Bool) -> String {
        switch kind {
        case .image:
            return "Image"
        case .file:
            return plainText?.components(separatedBy: "\n").first ?? "File"
        default:
            let source = plainText ?? ""
            let head = hidingSecrets ? SecretDetector.maskedPrefix(source, count: 200) : String(source.prefix(200))
            let text = head
                .replacingOccurrences(of: "\n", with: " ")
                .trimmingCharacters(in: .whitespaces)
            return text.count > 50 ? String(text.prefix(50)) + "…" : text
        }
    }

    /// `displayTitle`, masking secrets in the derived title when `hidingSecrets`. A title
    /// the user typed is shown as written.
    func displayTitle(hidingSecrets: Bool) -> String {
        title?.isEmpty == false ? title! : menuTitle(hidingSecrets: hidingSecrets)
    }
}
