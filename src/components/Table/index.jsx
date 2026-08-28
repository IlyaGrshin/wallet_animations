import PropTypes from "prop-types"

import Text from "../Text"
import * as styles from "./Table.module.scss"

const Table = ({ head = null, rows, align = [], className }) => {
    const cellStyle = (i) => (align[i] ? { textAlign: align[i] } : undefined)

    return (
        <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
            <div className={styles.scroll}>
                <table className={styles.table}>
                    {head ? (
                        <thead className={styles.head}>
                            <tr>
                                {head.map((cell, i) => (
                                    <Text
                                        key={i}
                                        as="th"
                                        apple={{
                                            variant: "subheadline1",
                                            weight: "semibold",
                                        }}
                                        material={{
                                            variant: "subheadline2",
                                            weight: "medium",
                                        }}
                                        className={styles.cell}
                                        style={cellStyle(i)}
                                    >
                                        {cell}
                                    </Text>
                                ))}
                            </tr>
                        </thead>
                    ) : null}
                    <tbody className={styles.body}>
                        {rows.map((row, r) => (
                            <tr key={r}>
                                {row.map((cell, i) => (
                                    <Text
                                        key={i}
                                        as="td"
                                        apple={{ variant: "subheadline1" }}
                                        material={{ variant: "subheadline2" }}
                                        className={styles.cell}
                                        style={cellStyle(i)}
                                    >
                                        {cell}
                                    </Text>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

Table.propTypes = {
    head: PropTypes.arrayOf(PropTypes.node),
    rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.node)).isRequired,
    align: PropTypes.arrayOf(PropTypes.oneOf(["left", "center", "right"])),
    className: PropTypes.string,
}

export default Table
