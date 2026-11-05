import DollarsLogo from "../../icons/avatars/Dollars.svg"
import BitcoinLogo from "../../icons/avatars/Bitcoin.svg"
import ToncoinLogo from "../../icons/avatars/Toncoin.svg"
import NotcoinLogo from "../../icons/avatars/Notcoin.svg"
import MajorLogo from "../../icons/avatars/Major.svg"
import HamsterLogo from "../../icons/avatars/Hamster.webp"
import XEmpireLogo from "../../icons/avatars/XEmpire.svg"
import CatizenLogo from "../../icons/avatars/Catizen.webp"
import GramLogo from "../../icons/avatars/Gram.svg"
import EthereumLogo from "../../icons/avatars/Ethereum.png"
import DogsLogo from "../../icons/avatars/DOGS.svg"
import TacLogo from "../../icons/avatars/TAC.png"
import NvidiaLogo from "../../icons/avatars/Nvidia.svg"
import XrpLogo from "../../icons/avatars/XRP.svg"

const AssetsMap = {
    USDT: DollarsLogo,
    TON: ToncoinLogo,
    BTC: BitcoinLogo,
    NOT: NotcoinLogo,
    MAJOR: MajorLogo,
    HMSTR: HamsterLogo,
    X: XEmpireLogo,
    CATI: CatizenLogo,
    GRAM: GramLogo,
    ETH: EthereumLogo,
    DOGS: DogsLogo,
    TAC: TacLogo,
    NVDAX: NvidiaLogo,
    XRP: XrpLogo,
}

// Not a React hook; rename to avoid rules-of-hooks false positives
export const getAssetIcon = (ticker) => AssetsMap[ticker] || null
