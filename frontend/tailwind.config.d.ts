declare const _default: {
    darkMode: ["class"];
    content: string[];
    theme: {
        extend: {
            colors: {
                background: string;
                foreground: string;
                card: string;
                cardForeground: string;
                muted: string;
                mutedForeground: string;
                border: string;
                input: string;
                primary: string;
                primaryForeground: string;
                secondary: string;
                secondaryForeground: string;
                accent: string;
                accentForeground: string;
                destructive: string;
                destructiveForeground: string;
                ring: string;
            };
            borderRadius: {
                xl: string;
                '2xl': string;
            };
            boxShadow: {
                glow: string;
            };
            keyframes: {
                fadeUp: {
                    '0%': {
                        opacity: string;
                        transform: string;
                    };
                    '100%': {
                        opacity: string;
                        transform: string;
                    };
                };
                shimmer: {
                    '0%': {
                        backgroundPosition: string;
                    };
                    '100%': {
                        backgroundPosition: string;
                    };
                };
            };
            animation: {
                fadeUp: string;
                shimmer: string;
            };
        };
    };
    plugins: {
        handler: () => void;
    }[];
};
export default _default;
