import { useEffect } from "react"

import Page from "../../../components/Page"
import Text from "../../../components/Text"
import { RegularButton } from "../../../components/Button"
import { useMediaQuery } from "../../../hooks/useMediaQuery"
import WebApp, { BackButton } from "../../../lib/twa"

import PhraseField from "./components/PhraseField"
import { PHRASE_LENGTH } from "./bip39"
import { usePhraseImport } from "./usePhraseImport"

import * as styles from "./WalletImport.module.scss"

const HOTKEYS = [
    ["← →", "choose word"],
    ["Enter", "accept"],
    ["↑ ↓", "move between words"],
    ["Esc", "hide suggestions"],
]

const WalletImport = () => {
    const {
        words,
        validCount,
        isComplete,
        registerRef,
        setWord,
        commitWord,
        navigate,
        fillFrom,
    } = usePhraseImport()

    // Hardware keyboard present: only then are the shortcuts reachable.
    const isDesktop = useMediaQuery("(hover: hover) and (pointer: fine)")

    // Prototype end of the road: the phrase is complete and valid.
    const handleContinue = () => {
        WebApp.HapticFeedback?.notificationOccurred("success")
    }

    useEffect(() => {
        // A long form drags a lot; vertical swipes would close the Mini App.
        WebApp.disableVerticalSwipes()
        return () => WebApp.enableVerticalSwipes()
    }, [])

    return (
        <Page mode="primary">
            <BackButton />
            <div className={styles.page}>
                <header className={styles.intro}>
                    <Text
                        apple={{ variant: "title1", weight: "bold" }}
                        material={{ variant: "title1", weight: "medium" }}
                    >
                        Import Wallet
                    </Text>
                    <div className={styles.description}>
                        <Text
                            apple={{ variant: "body", weight: "regular" }}
                            material={{ variant: "subheadline1" }}
                        >
                            Enter the {PHRASE_LENGTH}-word recovery phrase from
                            another wallet you own.
                        </Text>
                    </div>
                </header>

                <div className={styles.list}>
                    {words.map((word, index) => (
                        <PhraseField
                            key={index}
                            index={index}
                            value={word}
                            registerRef={registerRef}
                            onChange={(value) => setWord(index, value)}
                            onCommit={(value) => commitWord(index, value)}
                            onNavigate={(delta) => navigate(index, delta)}
                            onPasteWords={(pasted) => fillFrom(index, pasted)}
                        />
                    ))}
                </div>

                {isDesktop && (
                    <ul className={styles.hotkeys}>
                        {HOTKEYS.map(([keys, action]) => (
                            <li key={keys}>
                                <Text
                                    apple={{ variant: "caption1" }}
                                    material={{ variant: "caption2" }}
                                >
                                    <span className={styles.key}>{keys}</span>
                                    {action}
                                </Text>
                            </li>
                        ))}
                    </ul>
                )}

                <div className={styles.footer}>
                    <div className={styles.progress}>
                        <Text
                            apple={{ variant: "footnote" }}
                            material={{ variant: "caption2" }}
                        >
                            {validCount} of {PHRASE_LENGTH} words
                        </Text>
                    </div>
                    <RegularButton
                        variant={isComplete ? "filled" : "disabled"}
                        label="Continue"
                        isFill
                        isShine={isComplete}
                        onClick={isComplete ? handleContinue : undefined}
                    />
                </div>
            </div>
        </Page>
    )
}

export default WalletImport
