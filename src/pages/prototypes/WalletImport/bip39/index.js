import WORDLIST from "./wordlist"

export const PHRASE_LENGTH = 24

// Suggestions appear only once the guess is narrow enough to be useful.
export const MIN_PREFIX_LENGTH = 2

export const MAX_SUGGESTIONS = 3

const WORDSET = new Set(WORDLIST)

// Index of the first word that is >= `prefix`. The list is sorted, so every
// word starting with `prefix` sits in one contiguous run from there.
const lowerBound = (prefix) => {
    let lo = 0
    let hi = WORDLIST.length
    while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (WORDLIST[mid] < prefix) lo = mid + 1
        else hi = mid
    }
    return lo
}

/**
 * Up to `limit` wordlist entries starting with `prefix`, in list order.
 * Empty for a prefix no BIP-39 word can complete — that is what drives the
 * tooltip's error state.
 */
export const suggest = (prefix, limit = MAX_SUGGESTIONS) => {
    if (!prefix) return []
    const matches = []
    for (let i = lowerBound(prefix); i < WORDLIST.length; i++) {
        if (!WORDLIST[i].startsWith(prefix)) break
        matches.push(WORDLIST[i])
        if (matches.length === limit) break
    }
    return matches
}

export const isWord = (value) => WORDSET.has(value)

// BIP-39 words are lowercase, and whitespace is what ends one. Everything else
// the user types stays in the field and reads as a word the list does not know.
export const sanitize = (value) => value.toLowerCase().replace(/\s/g, "")

/** Splits pasted text into candidate words, e.g. a full phrase from a note. */
export const splitPhrase = (text) =>
    text
        .split(/[^a-zA-Z]+/)
        .map((part) => part.toLowerCase())
        .filter(Boolean)

export default WORDLIST
