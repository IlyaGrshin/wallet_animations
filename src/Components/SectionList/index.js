import * as styles from "./SectionList.module.scss"
import SectionHeader from "../../components/SectionHeader"

const SectionList = ({ children, ...props }) => {
    return (
        <section className={styles.root} {...props}>
            {children}
        </section>
    )
}

SectionList.Item = ({ children, header, footer, ...props }) => {
    return (
        <section {...props}>
            {header && <SectionHeader title={header} />}
            <div className={styles.container}>{children}</div>
            {footer && <SectionHeader type="Footer" title={footer} />}
        </section>
    )
}

export default SectionList
