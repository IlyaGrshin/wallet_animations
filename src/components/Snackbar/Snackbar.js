import PropTypes from "prop-types"
import Text from "../Text"
import * as styles from "./Snackbar.module.scss"

const Snackbar = ({ icon, title, description, link, action }) => {
    const hasDescription = Boolean(description)

    return (
        <div className={styles.root} role="status" aria-live="polite">
            {icon ? (
                <div className={styles.icon} aria-hidden="true">
                    {icon}
                </div>
            ) : null}
            <div className={styles.content}>
                <Text
                    as="p"
                    className={styles.title}
                    apple={{
                        variant: "subheadline2",
                        ...(hasDescription && { weight: "semibold" }),
                    }}
                    material={{
                        variant: "subheadline2",
                        weight: "medium",
                    }}
                >
                    {title}
                </Text>
                {description ? (
                    <Text
                        as="p"
                        className={styles.description}
                        apple={{ variant: "subheadline2" }}
                        material={{ variant: "subheadline2" }}
                    >
                        {description}
                    </Text>
                ) : null}
                {link ? (
                    <button
                        type="button"
                        className={styles.link}
                        onClick={link.onClick}
                    >
                        <Text
                            as="span"
                            apple={{ variant: "subheadline2" }}
                            material={{ variant: "subheadline2" }}
                        >
                            {link.label}
                        </Text>
                    </button>
                ) : null}
            </div>
            {action ? (
                <button
                    type="button"
                    className={styles.action}
                    onClick={action.onClick}
                >
                    <Text
                        as="span"
                        apple={{ variant: "body" }}
                        material={{
                            variant: "subheadline2",
                            weight: "medium",
                        }}
                    >
                        {action.label}
                    </Text>
                </button>
            ) : null}
        </div>
    )
}

export const triggerShape = PropTypes.shape({
    label: PropTypes.node.isRequired,
    onClick: PropTypes.func,
})

Snackbar.propTypes = {
    icon: PropTypes.node,
    title: PropTypes.node.isRequired,
    description: PropTypes.node,
    link: triggerShape,
    action: triggerShape,
}

export default Snackbar
