import Foundation

/// Finds secrets in copied text (API keys, tokens, private keys, card numbers) so the app
/// can show them masked. Masking is display-only: the stored item and what gets pasted are
/// untouched.
///
/// Deliberately conservative, like `CodeDetector`: it prefers missing an unusual secret to
/// masking ordinary text. It recognizes provider key formats by their fixed prefixes, and a
/// generic `name = value` only where the shape is unambiguous: a quoted value, an
/// ALL-CAPS `.env`-style name, or a URL query parameter. An unquoted lowercase
/// `api_key=value` is skipped on purpose, because code (`login(password=user_password1)`)
/// looks exactly like it.
public enum SecretDetector {
    /// The character a masked secret is drawn with.
    public static let maskCharacter: Character = "•"

    /// Whether `text` contains anything `masked(_:)` would hide.
    public static func containsSecret(_ text: String) -> Bool {
        masked(text) != text
    }

    /// `containsSecret` without the display cache, for scanning a whole history: caching
    /// every item's text would only push out the entries the shelf is drawing.
    public static func scan(_ text: String) -> Bool {
        computeMasked(text) != text
    }

    /// `text` with the middle of each secret replaced by `maskCharacter`.
    ///
    /// The result always has the same length as `text`, in characters and in UTF-16 units:
    /// every hidden character is ASCII and is swapped one-for-one. Syntax-highlight token
    /// ranges computed against the original text therefore still line up with the masked one.
    public static func masked(_ text: String) -> String {
        let key = text as NSString
        if let cached = cache.object(forKey: key) { return cached as String }
        let result = computeMasked(text)
        cache.setObject(result as NSString, forKey: key)
        return result
    }

    /// The first `count` characters of `text`, masked. Scans a little past the cutoff, so a
    /// secret the cutoff slices in half is still recognized instead of showing its first part.
    public static func maskedPrefix(_ text: String, count: Int) -> String {
        String(masked(String(text.prefix(count + cutoffMargin))).prefix(count))
    }

    // MARK: - Detection

    /// How a matched secret is hidden.
    private enum Style {
        /// Keep a few characters at each end, so a key is still recognizable.
        case token
        /// Keep only the last four digits; separators stay.
        case card
        /// Hide every character but keep the line breaks (a private key's body).
        case block
    }

    private struct Rule {
        let regex: NSRegularExpression
        /// The capture group holding the secret; 0 is the whole match.
        let group: Int
        let style: Style
    }

    private static let cutoffMargin = 4_096
    /// Bounds the work on a huge paste; text past this is left as it is.
    private static let scanLimit = 250_000
    private static let maskUnit = maskCharacter.utf16.first!

    private static let cache: NSCache<NSString, NSString> = {
        let cache = NSCache<NSString, NSString>()
        cache.countLimit = 600
        return cache
    }()

    /// Names that mark a value as a secret, for the generic `name = value` rules.
    private static let secretName = "(?:api[_-]?key|secret|token|passw(?:or)?d)"
    /// What a generic unquoted value may contain. No `.`, `(`, `&` or `$`: those are
    /// property accesses, calls, the next URL parameter and variable references.
    private static let bareValue = "[A-Za-z0-9_+/=~!@#%^*-]"
    /// A generic value must contain a letter and a digit, and not be a path, a variable
    /// reference or a URL. `valueClass` is the character class the value is made of.
    private static func looksLikeSecret(_ valueClass: String) -> String {
        "(?![/~.$]|https?:)(?=\(valueClass)*[A-Za-z])(?=\(valueClass)*[0-9])"
    }

    private static let rules: [Rule] = {
        func rule(_ pattern: String, group: Int = 0, style: Style = .token,
                  options: NSRegularExpression.Options = []) -> Rule {
            // The patterns are literals, so a failure here is a typo caught by the tests.
            Rule(regex: try! NSRegularExpression(pattern: pattern, options: options), group: group, style: style)
        }
        let quotedValue = "[\\x21\\x23-\\x26\\x28-\\x7E]"   // printable ASCII except quotes
        return [
            // Provider formats, identified by their fixed prefix.
            rule("\\b(?:AKIA|ASIA)[0-9A-Z]{16}\\b"),                               // AWS access key ID
            rule("\\bgh[pousr]_[A-Za-z0-9]{36,}\\b"),                              // GitHub token
            rule("\\bgithub_pat_[A-Za-z0-9_]{50,}\\b"),                            // GitHub fine-grained token
            rule("\\bsk-(?=[A-Za-z0-9_-]*[0-9])[A-Za-z0-9_-]{20,}"),               // OpenAI, Anthropic
            rule("\\b[sr]k_(?:live|test)_[A-Za-z0-9]{16,}"),                       // Stripe
            rule("\\bwhsec_[A-Za-z0-9]{24,}"),                                     // Stripe webhook secret
            rule("\\bxox[abprs]-[A-Za-z0-9-]{10,}"),                               // Slack
            rule("\\bAIza[0-9A-Za-z_-]{35}(?![0-9A-Za-z_-])"),                     // Google API key
            rule("\\bnpm_[A-Za-z0-9]{36}\\b"),                                     // npm
            rule("\\bSG\\.[A-Za-z0-9_-]{16,}\\.[A-Za-z0-9_-]{16,}"),               // SendGrid
            rule("\\beyJ[A-Za-z0-9_-]{8,}\\.eyJ[A-Za-z0-9_-]{8,}\\.[A-Za-z0-9_-]{8,}"), // JWT
            rule("\\bbearer\\s+(?=[A-Za-z0-9._~+/=-]*[0-9])([A-Za-z0-9._~+/=-]{20,})",
                 group: 1, options: [.caseInsensitive]),
            // A private key: hide the body, keep the BEGIN/END lines. An unterminated block
            // (the cutoff landed inside it) is hidden to the end.
            rule("-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----([\\s\\S]*?)(?:-----END [A-Z0-9 ]*PRIVATE KEY-----|\\z)",
                 group: 1, style: .block),
            // name = "value", in any language or config format.
            rule("\(secretName)[A-Za-z0-9_-]{0,40}[\"']?\\s{0,4}[:=]\\s{0,4}[\"']"
                 + "\(looksLikeSecret(quotedValue))(\(quotedValue){12,})[\"']",
                 group: 1, options: [.caseInsensitive]),
            // NAME=value, the .env and shell form. Case-sensitive on purpose: see the type's
            // doc comment.
            rule("(?<![A-Za-z0-9_])[A-Z0-9_]{0,40}(?:API_?KEY|SECRET|TOKEN|PASSWORD|PASSWD)[A-Z0-9_]{0,40}="
                 + "\(looksLikeSecret(bareValue))(\(bareValue){12,})",
                 group: 1),
            // ?token=value in a URL.
            rule("[?&][A-Za-z0-9_.-]{0,40}(?:\(secretName)|signature)[A-Za-z0-9_-]{0,40}="
                 + "\(looksLikeSecret("[A-Za-z0-9_+/=~%.-]"))([A-Za-z0-9_+/=~%.-]{12,})",
                 group: 1, options: [.caseInsensitive]),
            // A run of 15 or 16 digits, optionally grouped; `isCardNumber` then checks it.
            rule("(?<![A-Za-z0-9])(?<![0-9][ -])(?:[0-9][ -]?){14,15}[0-9](?![A-Za-z0-9])(?![ -]?[0-9])",
                 style: .card),
        ]
    }()

    private static func computeMasked(_ text: String) -> String {
        var units = Array(text.utf16)
        let source = text as NSString
        let scanRange = NSRange(location: 0, length: min(source.length, scanLimit))
        var changed = false

        // Every rule runs against the original text; the masks are then laid over each
        // other, so where two rules overlap a character shows only if both leave it visible.
        for rule in rules {
            for match in rule.regex.matches(in: text, options: [], range: scanRange) {
                let range = match.range(at: rule.group)
                guard range.location != NSNotFound, range.length > 0 else { continue }
                switch rule.style {
                case .token:
                    let keep = range.length >= 16 ? 4 : (range.length >= 8 ? 2 : 0)
                    for index in (range.location + keep)..<(range.location + range.length - keep) {
                        units[index] = maskUnit
                    }
                case .card:
                    let digits = (range.location..<(range.location + range.length))
                        .filter { isDigit(source.character(at: $0)) }
                    guard isCardNumber(digits.map { source.character(at: $0) }) else { continue }
                    for index in digits.dropLast(4) { units[index] = maskUnit }
                case .block:
                    for index in range.location..<(range.location + range.length)
                    where !isLineBreak(source.character(at: index)) {
                        units[index] = maskUnit
                    }
                }
                changed = true
            }
        }
        return changed ? String(utf16CodeUnits: units, count: units.count) : text
    }

    private static func isDigit(_ unit: unichar) -> Bool { unit >= 48 && unit <= 57 }
    private static func isLineBreak(_ unit: unichar) -> Bool { unit == 10 || unit == 13 }

    /// A payment card number: a known issuer prefix for its length, and a valid Luhn
    /// checksum. Without the prefix check one random 16-digit number in ten would pass.
    private static func isCardNumber(_ units: [unichar]) -> Bool {
        let digits = units.map { Int($0) - 48 }
        let firstTwo = digits[0] * 10 + digits[1]
        switch digits.count {
        case 15:
            guard firstTwo == 34 || firstTwo == 37 else { return false }             // American Express
        case 16:
            let knownIssuer = digits[0] == 4                                         // Visa
                || (51...55).contains(firstTwo) || (22...27).contains(firstTwo)      // Mastercard
                || firstTwo == 35 || digits[0] == 6                                  // JCB, Discover
            guard knownIssuer else { return false }
        default:
            return false
        }
        var sum = 0
        for (offset, digit) in digits.reversed().enumerated() {
            let doubled = offset % 2 == 1 ? digit * 2 : digit
            sum += doubled > 9 ? doubled - 9 : doubled
        }
        return sum % 10 == 0
    }
}
