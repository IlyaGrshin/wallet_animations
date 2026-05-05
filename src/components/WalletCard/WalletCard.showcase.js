import WalletCard from "."
import Page from "../Page"
import { BackButton, getUser } from "../../lib/twa"

const tgUser = getUser()
const tgName = tgUser
    ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ")
    : ""

const wrapperStyle = { padding: "24px 12px" }

const WalletCardShowcase = () => (
    <>
        <BackButton />
        <Page>
            <div style={wrapperStyle}>
                <WalletCard name={tgName || undefined} />
            </div>
        </Page>
    </>
)

export default WalletCardShowcase
