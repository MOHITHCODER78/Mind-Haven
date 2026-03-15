function LoginIllustration({ className = '' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 400 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Background glow */}
            <circle cx="200" cy="180" r="130" fill="rgba(47,124,113,0.06)" />
            <circle cx="200" cy="180" r="90" fill="rgba(47,124,113,0.08)" />

            {/* Central orb */}
            <circle cx="200" cy="180" r="60" fill="url(#orbGradient)" />
            <circle cx="200" cy="180" r="60" fill="rgba(255,255,255,0.15)" />

            {/* Heart inside orb */}
            <path d="M200 200 C200 200 176 185 176 170 C176 162 182 156 190 158 C194 158 198 161 200 165 C202 161 206 158 210 158 C218 156 224 162 224 170 C224 185 200 200 200 200Z" fill="white" opacity="0.9" />

            {/* Floating leaf 1 */}
            <ellipse cx="120" cy="120" rx="22" ry="12" transform="rotate(-30 120 120)" fill="#3d9487" opacity="0.7" />
            <line x1="120" y1="108" x2="120" y2="132" stroke="#2f7c71" strokeWidth="1.5" opacity="0.5" />

            {/* Floating leaf 2 */}
            <ellipse cx="290" cy="110" rx="18" ry="10" transform="rotate(25 290 110)" fill="#4aab9f" opacity="0.6" />
            <line x1="290" y1="100" x2="290" y2="120" stroke="#2f7c71" strokeWidth="1.5" opacity="0.5" />

            {/* Floating leaf 3 */}
            <ellipse cx="310" cy="260" rx="16" ry="9" transform="rotate(-15 310 260)" fill="#3d9487" opacity="0.5" />

            {/* Floating leaf 4 */}
            <ellipse cx="95" cy="250" rx="20" ry="11" transform="rotate(20 95 250)" fill="#4aab9f" opacity="0.65" />

            {/* Stars / sparkles */}
            <circle cx="148" cy="78" r="4" fill="#dfe8c8" />
            <circle cx="260" cy="85" r="3" fill="#2f7c71" opacity="0.5" />
            <circle cx="320" cy="175" r="5" fill="#dfe8c8" opacity="0.8" />
            <circle cx="80" cy="200" r="4" fill="#2f7c71" opacity="0.4" />
            <circle cx="160" cy="290" r="3" fill="#dfe8c8" opacity="0.7" />
            <circle cx="280" cy="275" r="4" fill="#3d9487" opacity="0.5" />
            <circle cx="200" cy="55" r="3" fill="#2f7c71" opacity="0.3" />

            {/* OTP floating card */}
            <rect x="260" y="200" width="100" height="52" rx="14" fill="white" stroke="#e1efe8" strokeWidth="1.5" />
            <rect x="272" y="214" width="30" height="6" rx="3" fill="#2f7c71" opacity="0.5" />
            <rect x="272" y="228" width="64" height="8" rx="4" fill="#e8f4f1" />
            <rect x="274" y="230" width="8" height="4" rx="2" fill="#2f7c71" />
            <rect x="285" y="230" width="8" height="4" rx="2" fill="#2f7c71" />
            <rect x="296" y="230" width="8" height="4" rx="2" fill="#2f7c71" />
            <rect x="307" y="230" width="8" height="4" rx="2" fill="#2f7c71" />

            {/* Lock icon floating */}
            <rect x="44" y="140" width="52" height="52" rx="14" fill="white" stroke="#e1efe8" strokeWidth="1.5" />
            <rect x="57" y="158" width="26" height="20" rx="4" fill="#e8f4f1" stroke="#2f7c71" strokeWidth="1.5" />
            <path d="M63 158 C63 148 77 148 77 158" stroke="#2f7c71" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="70" cy="166" r="3" fill="#2f7c71" />
            <rect x="69" y="168" width="2" height="5" rx="1" fill="#2f7c71" />

            <defs>
                <radialGradient id="orbGradient" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#4aab9f" />
                    <stop offset="100%" stopColor="#2f7c71" />
                </radialGradient>
            </defs>
        </svg>
    );
}

export default LoginIllustration;
