import "./index.css"

function Card({ children, ...props }) {
    return (
        <div className="Card" {...props}>
            {children}
        </div>
    )
}

export default Card
