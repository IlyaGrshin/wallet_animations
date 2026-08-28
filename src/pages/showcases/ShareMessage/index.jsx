import { useState } from "react"

import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import { useSnackbar } from "../../../components/Snackbar"

import { BackButton, canShareMessage, shareMessage } from "../../../lib/twa"

import prepareMessage from "./prepareMessage"

const PREPARE_HINT =
    "The endpoint checks initData, calls the Bot API savePreparedInlineMessage with the bot token and returns the identifier. Empty text falls back to a default line."

const UNAVAILABLE_HINT =
    "Sharing works inside Telegram on a client with Bot API 8.0 or newer."

const RESULT_HINT =
    "What savePreparedInlineMessage answered. Past the expiry the identifier stops working and a fresh one has to be prepared."

const formatExpiry = (expiresAt) =>
    expiresAt
        ? `Valid until ${new Date(expiresAt * 1000).toLocaleTimeString()}`
        : undefined

const ShareMessageShowcase = () => {
    const [text, setText] = useState("")
    const [prepared, setPrepared] = useState(null)
    const [preparing, setPreparing] = useState(false)
    const snackbar = useSnackbar()

    const available = canShareMessage()

    const notify = (options) =>
        snackbar.show({ position: "bottom", duration: 3000, ...options })

    const share = async (id) => {
        if (!available) {
            notify({
                title: "Sharing is unavailable here",
                description: UNAVAILABLE_HINT,
                duration: 4000,
            })
            return
        }

        try {
            const sent = await shareMessage(id)
            notify({ title: sent ? "Message sent" : "Closed without sending" })
        } catch (error) {
            notify({
                title: "Share failed",
                description: error?.message ?? String(error),
                duration: 4000,
            })
        }
    }

    const prepareAndShare = async () => {
        setPreparing(true)
        try {
            const result = await prepareMessage(text.trim())
            setPrepared(result)
            await share(result.id)
        } catch (error) {
            notify({
                title: "Could not prepare the message",
                description: error?.message ?? String(error),
                duration: 4000,
            })
        } finally {
            setPreparing(false)
        }
    }

    return (
        <>
            <BackButton />
            <Page>
                <SectionList>
                    <SectionList.Item
                        header="Message"
                        description={
                            available
                                ? PREPARE_HINT
                                : `${PREPARE_HINT} ${UNAVAILABLE_HINT}`
                        }
                    >
                        <Cell>
                            <Cell.Editable
                                label="Message text"
                                value={text}
                                onChange={setText}
                                onClear={() => setText("")}
                                autoComplete="off"
                                autoCorrect="off"
                            />
                        </Cell>
                        <Cell
                            onClick={preparing ? undefined : prepareAndShare}
                        >
                            <Cell.Text
                                type="Accent"
                                title={
                                    preparing
                                        ? "Preparing…"
                                        : "Prepare and share"
                                }
                            />
                        </Cell>
                    </SectionList.Item>

                    {prepared && (
                        <SectionList.Item
                            header="Prepared identifier"
                            description={RESULT_HINT}
                        >
                            <Cell>
                                <Cell.Text
                                    title={prepared.id}
                                    description={formatExpiry(
                                        prepared.expiresAt
                                    )}
                                />
                            </Cell>
                        </SectionList.Item>
                    )}
                </SectionList>
            </Page>
        </>
    )
}

export default ShareMessageShowcase
