import "./index.css"
import SectionHeader from "../../Components/SectionHeader"
import Card from "../../Components/Card"

const SectionList = ({ children }) => {
    return <section className="list">{children}</section>
}

SectionList.Item = ({ children, header, footer }) => {
    return (
        <section>
            {header && <SectionHeader title={header} />}
            <Card>{children}</Card>
            {footer && <SectionHeader type="Footer" title={footer} />}
        </section>
    )
}

export default SectionList
