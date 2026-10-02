import { useEffect } from "react"

import Page from "../../../components/Page"
import Text from "../../../components/Text"
import { RegularButton } from "../../../components/Button"
import WebApp, { BackButton, lockVerticalSwipes } from "../../../lib/twa"

import PhraseField from "./components/PhraseField"
import { PHRASE_LENGTH } from "./bip39"
import { usePhraseImport } from "./usePhraseImport"

import * as styles from "./WalletImport.module.scss"

const WalletImport = () => {
    const {
        words,
        isComplete,
        hasBadChecksum,
        registerRef,
        setWord,
        commitWord,
        navigate,
        fillFrom,
    } = usePhraseImport()

    const handleContinue = () => {
        WebApp.HapticFeedback?.notificationOccurred("success")
    }

    // A long form drags a lot; vertical swipes would close the Mini App.
    useEffect(() => lockVerticalSwipes(), [])

    return (
        <Page mode="primary">
            <BackButton />
            <div className={styles.page}>
                <header className={styles.intro}>
                    <Text
                        apple={{ variant: "title1", weight: "semibold" }}
                        material={{ variant: "title1", weight: "medium" }}
                    >
                        Import Wallet
                    </Text>
                    <Text
                        apple={{ variant: "callout", weight: "regular" }}
                        material={{ variant: "subheadline1" }}
                    >
                        Enter the {PHRASE_LENGTH}-word recovery phrase from
                        another wallet you own.
                    </Text>
                </header>

                <div className={styles.list}>
                    {words.map((word, index) => (
                        <PhraseField
                            key={index}
                            index={index}
                            value={word}
                            registerRef={registerRef}
                            onChange={setWord}
                            onCommit={commitWord}
                            onNavigate={navigate}
                            onPasteWords={fillFrom}
                            canPaste={index === 0}
                        />
                    ))}
                </div>

                <div className={styles.footer}>
                    {hasBadChecksum && (
                        <div className={styles.checksumError} role="alert">
                            <Text
                                apple={{
                                    variant: "footnote",
                                    weight: "regular",
                                }}
                                material={{ variant: "subheadline2" }}
                            >
                                These words don’t form a valid recovery phrase.
                                Check their order.
                            </Text>
                        </div>
                    )}
                    <RegularButton
                        variant={isComplete ? "filled" : "disabled"}
                        label="Continue"
                        isFill
                        isShine={isComplete}
                        disabled={!isComplete}
                        onClick={isComplete ? handleContinue : undefined}
                    />
                </div>
            </div>
        </Page>
    )
}

export default WalletImport
