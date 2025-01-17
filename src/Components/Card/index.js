import * as styles from "./Card.module.scss"

function Card({ children, ...props }) {
    return (
        <div className={styles.root} {...props}>
            {children}
        </div>
    )
}

export default Card
