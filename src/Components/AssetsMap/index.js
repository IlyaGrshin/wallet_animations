import DollarsLogo from "../../Icons/Avatars/Dollars.svg"
import BitcoinLogo from "../../Icons/Avatars/Bitcoin.svg"
import ToncoinLogo from "../../Icons/Avatars/Toncoin.svg"
import NotcoinLogo from "../../Icons/Avatars/Notcoin.svg"
import MajorLogo from "../../Icons/Avatars/Major.svg"
import HamsterLogo from "../../Icons/Avatars/Hamster.webp"
import XEmpireLogo from "../../Icons/Avatars/XEmpire.svg"
import CatizenLogo from "../../Icons/Avatars/Catizen.webp"

const AssetsMap = {
    USDT: DollarsLogo,
    TON: ToncoinLogo,
    BTC: BitcoinLogo,
    NOT: NotcoinLogo,
    MAJOR: MajorLogo,
    HMSTR: HamsterLogo,
    X: XEmpireLogo,
    CATI: CatizenLogo,
}

export const getAssetIcon = (ticker) => AssetsMap[ticker] || null
