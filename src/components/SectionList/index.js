import * as styles from "./SectionList.module.scss"
import PropTypes from "prop-types"
import SectionHeader from "../../components/SectionHeader"

const SectionList = ({ children, ...props }) => {
    return (
        <section className={styles.root} {...props}>
            {children}
        </section>
    )
}

SectionList.Item = ({ children, header, description, ...props }) => {
    return (
        <section {...props}>
            {header && <SectionHeader title={header} />}
            <div className={styles.container}>{children}</div>
            {description && <SectionHeader type="Footer" title={description} />}
        </section>
    )
}

SectionList.propTypes = {
    children: PropTypes.node,
}
SectionList.Item.propTypes = {
    children: PropTypes.node,
    header: PropTypes.string,
    description: PropTypes.string,
}
export default SectionList
