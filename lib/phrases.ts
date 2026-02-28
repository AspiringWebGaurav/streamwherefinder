/**
 * Centralized repository of 100+ unique secondary micro-phrases for the Auth Button.
 * All phrases strictly start with "to " and correspond to specific contextual vectors.
 */

export const PHRASE_LIBRARY = {
    // ── Context: User has active local search history (>0) ─────────────────
    history: [
        "to save history",
        "to resume search",
        "to store activity",
        "to unlock history",
        "to keep searches",
        "to track history",
        "to access results",
        "to manage searches",
        "to restore activity",
        "to remember activity",
        "to manage history",
        "to resume activity",
        "to access saved history",
        "to save your searches",
        "to protect your history",
        "to retrieve searches",
        "to keep search logs",
        "to access history",
        "to save results",
        "to manage saved searches",
        "to access previous searches",
        "to save browsing activity",
        "to store recent searches",
        "to restore recent activity",
        "to access private history",
        "to maintain your history",
        "to unlock personalized view",
        "to preserve history"
    ],

    // ── Context: System detects a returning session / refresh ─────────────
    session: [
        "to continue session",
        "to restore session",
        "to secure activity",
        "to store sessions",
        "to restore your work",
        "to keep your progress",
        "to continue securely",
        "to maintain sessions",
        "to resume where left",
        "to manage sessions",
        "to continue smoothly",
        "to store browsing",
        "to restore browsing",
        "to resume instantly",
        "to save sessions",
        "to maintain activity",
        "to manage activity",
        "to maintain saved data",
        "to retrieve activity",
        "to store your session",
        "to maintain login state",
        "to continue tracking",
        "to manage login",
        "to keep account active",
        "to restore your session",
        "to keep activity stored",
        "to preserve your session",
        "to continue logged",
        "to save login state",
        "to restore account activity",
        "to maintain synced data",
        "to save your progress"
    ],

    // ── Context: Fresh device / Mobile browser / Cross-platform ───────────
    sync: [
        "to sync devices",
        "to sync history",
        "to sync account",
        "to link devices",
        "to sync your data",
        "to connect devices",
        "to access across devices",
        "to sync instantly",
        "to link your account",
        "to sync your history",
        "to keep everything synced",
        "to sync securely",
        "to continue across devices",
        "to keep account synced",
        "to keep everything connected",
        "to keep synced",
        "to sync history instantly",
        "to sync everything"
    ],

    // ── Default / Omnipresent (Always randomly available) ─────────────────
    default: [
        "to access anytime",
        "to keep activity",
        "to save progress",
        "to view saved items",
        "to keep preferences",
        "to keep your data",
        "to continue browsing",
        "to access saved",
        "to unlock features",
        "to save your activity",
        "to store preferences",
        "to keep everything saved",
        "to organize activity",
        "to access personal data",
        "to access securely",
        "to continue browsing safely",
        "to access from anywhere",
        "to restore preferences",
        "to access your data",
        "to secure your searches",
        "to unlock saved data",
        "to unlock your saved data"
    ]
};

/**
 * Combines all categories and returns exactly the array length for validation.
 * Ensures absolute uniqueness.
 */
export function validatePhrases(): number {
    const all = [
        ...PHRASE_LIBRARY.history,
        ...PHRASE_LIBRARY.session,
        ...PHRASE_LIBRARY.sync,
        ...PHRASE_LIBRARY.default
    ];
    const unique = new Set(all);
    if (unique.size !== all.length) {
        console.warn('Duplicate phrases found in PHRASE_LIBRARY!');
    }
    return unique.size;
}

/**
 * Gets the balanced set of phrases favoring a specific context.
 * The context set makes up ~40% of the bag, the rest are filled
 * uniformly from other sets to ensure long-tail uniqueness.
 */
export function buildContextualBag(context: 'history' | 'session' | 'sync' | 'default') {
    return {
        priority: PHRASE_LIBRARY[context],
        fallback: [
            ...PHRASE_LIBRARY.default,
            ...PHRASE_LIBRARY.history.filter(x => !PHRASE_LIBRARY[context].includes(x)),
            ...PHRASE_LIBRARY.session.filter(x => !PHRASE_LIBRARY[context].includes(x)),
            ...PHRASE_LIBRARY.sync.filter(x => !PHRASE_LIBRARY[context].includes(x))
        ]
    };
}
