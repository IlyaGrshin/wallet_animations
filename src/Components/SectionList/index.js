// TODO: Use CSS Modules
import "./index.css"
import SectionHeader from "../../Components/SectionHeader"
import Card from "../../Components/Card"

const SectionList = ({ children, ...props }) => {
    return (
        <section className="list" {...props}>
            {children}
        </section>
    )
}

SectionList.Item = ({ children, header, footer, ...props }) => {
    return (
        <section {...props}>
            {header && <SectionHeader title={header} />}
            <Card>{children}</Card>
            {footer && <SectionHeader type="Footer" title={footer} />}
        </section>
    )
}

export default SectionList
