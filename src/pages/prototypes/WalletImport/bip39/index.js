import WORDLIST from "./wordlist"

export const PHRASE_LENGTH = 24

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
 * Empty for a prefix no BIP-39 word can complete.
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

const INDEX_BITS = 11

/**
 * Resolves true when the phrase's trailing checksum bits match the SHA-256 of
 * its entropy, i.e. the words could have come out of a real wallet. Every
 * entry must already pass `isWord`.
 */
export const hasValidChecksum = async (words) => {
    const bits = words
        .map((word) =>
            WORDLIST.indexOf(word).toString(2).padStart(INDEX_BITS, "0")
        )
        .join("")
    const checksumLength = bits.length / 33
    const entropyBits = bits.slice(0, bits.length - checksumLength)
    const entropy = new Uint8Array(entropyBits.length / 8)
    entropy.forEach((_, i) => {
        entropy[i] = parseInt(entropyBits.slice(i * 8, i * 8 + 8), 2)
    })
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", entropy))
    const expected = hash[0]
        .toString(2)
        .padStart(8, "0")
        .slice(0, checksumLength)
    return bits.slice(-checksumLength) === expected
}

// Only whitespace goes: everything else the user types stays in the field and
// reads as a word the list does not know.
export const sanitize = (value) => value.toLowerCase().replace(/\s/g, "")

/** Splits pasted text into candidate words, e.g. a full phrase from a note. */
export const splitPhrase = (text) =>
    text
        .split(/[^a-zA-Z]+/)
        .map((part) => part.toLowerCase())
        .filter(Boolean)
