import './index.css'
import SectionHeader from '../../Components/SectionHeader'
import Card from '../../Components/Card'

const SectionList = ({ children }) => {
    return (
        <div className="sectionList">
            {children}
        </div>
    );
}

SectionList.Item = ({ children, header, footer }) => {
    return (
        <>
            <div className="section">
                {header && (<SectionHeader title={header} />)}
                <Card>{children}</Card>
                {footer && (<SectionHeader type="Footer" title={footer} />)}
            </div>
        </>
    )
}

export default SectionList