import './index.css'

const SectionList = ({ children }) => {
    return (
        <div className="sectionList">
            {children}
        </div>
    );
}

SectionList.Item = ({ children }) => {
    return (
        <div className="section">
            {children}
        </div>
    )
}

export default SectionList