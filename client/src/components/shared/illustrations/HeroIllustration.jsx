function HeroIllustration({ className = '' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 480 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Background blob */}
            <ellipse cx="240" cy="320" rx="200" ry="60" fill="rgba(47,124,113,0.07)" />

            {/* Desk */}
            <rect x="80" y="270" width="320" height="16" rx="8" fill="#d4e6e1" />
            <rect x="130" y="286" width="12" height="50" rx="6" fill="#c2d8d3" />
            <rect x="338" y="286" width="12" height="50" rx="6" fill="#c2d8d3" />

            {/* Laptop */}
            <rect x="160" y="200" width="160" height="72" rx="8" fill="#2f7c71" />
            <rect x="166" y="206" width="148" height="60" rx="5" fill="#1a5c54" />
            {/* Screen glow lines */}
            <rect x="178" y="220" width="80" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
            <rect x="178" y="233" width="56" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
            <rect x="178" y="246" width="68" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
            {/* Laptop base */}
            <rect x="148" y="270" width="184" height="10" rx="5" fill="#3d9487" />

            {/* Person body */}
            <ellipse cx="340" cy="240" rx="32" ry="38" fill="#e8f4f1" />
            {/* Head */}
            <circle cx="340" cy="188" r="26" fill="#f5d5b8" />
            {/* Hair */}
            <ellipse cx="340" cy="170" rx="26" ry="16" fill="#3d2b1f" />
            <ellipse cx="316" cy="178" rx="10" ry="18" fill="#3d2b1f" />
            {/* Face features */}
            <ellipse cx="333" cy="192" rx="3" ry="3.5" fill="#e8b89a" />
            <ellipse cx="347" cy="192" rx="3" ry="3.5" fill="#e8b89a" />
            <path d="M334 200 Q340 206 346 200" stroke="#c4856a" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Arms */}
            <path d="M312 240 Q295 260 290 272" stroke="#f5d5b8" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M368 240 Q380 258 380 272" stroke="#f5d5b8" strokeWidth="14" strokeLinecap="round" fill="none" />

            {/* Plant 1 */}
            <rect x="90" y="235" width="14" height="36" rx="7" fill="#b5cfc9" />
            <ellipse cx="97" cy="235" rx="22" ry="28" fill="#3d9487" />
            <ellipse cx="83" cy="228" rx="14" ry="18" fill="#2f7c71" />
            <ellipse cx="111" cy="226" rx="14" ry="18" fill="#2f7c71" />
            <ellipse cx="97" cy="218" rx="12" ry="16" fill="#4aab9f" />

            {/* Floating card 1 */}
            <rect x="68" y="148" width="86" height="56" rx="12" fill="white" stroke="#e1efe8" strokeWidth="1.5" />
            <rect x="78" y="160" width="40" height="6" rx="3" fill="#2f7c71" opacity="0.7" />
            <rect x="78" y="172" width="60" height="4" rx="2" fill="#cce0db" />
            <rect x="78" y="182" width="50" height="4" rx="2" fill="#cce0db" />
            <circle cx="134" cy="165" r="8" fill="#e8f4f1" />
            <path d="M131 165 L133 167 L137 163" stroke="#2f7c71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Floating card 2 (mood tracker) */}
            <rect x="330" y="130" width="90" height="64" rx="12" fill="white" stroke="#e1efe8" strokeWidth="1.5" />
            <rect x="342" y="142" width="50" height="5" rx="2.5" fill="#2f7c71" opacity="0.7" />
            <circle cx="348" cy="165" r="7" fill="#dfe8c8" />
            <circle cx="365" cy="165" r="7" fill="#e8f4f1" />
            <circle cx="382" cy="165" r="7" fill="#fde8e8" />
            <text x="345" y="169" fontSize="8" fill="#2f7c71">😊</text>
            <text x="362" y="169" fontSize="8" fill="#2f7c71">😐</text>
            <text x="379" y="169" fontSize="8" fill="#c0392b">😔</text>
            <rect x="342" y="180" width="38" height="4" rx="2" fill="#cce0db" />

            {/* Small floating dots */}
            <circle cx="240" cy="120" r="5" fill="#2f7c71" opacity="0.3" />
            <circle cx="260" cy="108" r="3" fill="#2f7c71" opacity="0.2" />
            <circle cx="222" cy="110" r="4" fill="#dfe8c8" opacity="0.6" />
        </svg>
    );
}

export default HeroIllustration;
