import { Children, createContext, isValidElement, useContext } from "react"
import PropTypes from "prop-types"
import MarkdownToJsx from "markdown-to-jsx"

import Text from "../Text"
import SharedTable from "../Table"
import { HEADING, BODY, QUOTE } from "./variants"
import * as styles from "./Markdown.module.scss"

const QuoteContext = createContext(false)

function textTag(as, variant, className) {
    const Component = ({ children, className: incoming, ...props }) => (
        <Text
            as={as}
            apple={variant.apple}
            material={variant.material}
            className={[className, incoming].filter(Boolean).join(" ") || undefined}
            {...props}
        >
            {children}
        </Text>
    )
    Component.propTypes = { children: PropTypes.node, className: PropTypes.string }
    return Component
}

function plainTag(Tag, className) {
    const Component = ({ children, className: incoming, ...props }) => (
        <Tag
            className={[className, incoming].filter(Boolean).join(" ") || undefined}
            {...props}
        >
            {children}
        </Tag>
    )
    Component.propTypes = { children: PropTypes.node, className: PropTypes.string }
    return Component
}

const Code = ({ children, className }) => (
    <code className={className?.startsWith("lang-") ? className : styles.inlineCode}>
        {children}
    </code>
)
Code.propTypes = { children: PropTypes.node, className: PropTypes.string }

const Strong = ({ children, ...props }) => (
    <Text
        as="strong"
        apple={{ weight: "semibold" }}
        material={{ weight: "medium" }}
        {...props}
    >
        {children}
    </Text>
)
Strong.propTypes = { children: PropTypes.node }

const Anchor = ({ children, href }) => (
    <a
        href={href}
        className={styles.link}
        target="_blank"
        rel="noopener noreferrer"
    >
        {children}
    </a>
)
Anchor.propTypes = { children: PropTypes.node, href: PropTypes.string }

const cellsOf = (tr) => Children.toArray(tr.props.children)

const MarkdownTable = ({ children }) => {
    let head = null
    const rows = []
    const align = []
    Children.forEach(children, (section) => {
        if (!isValidElement(section)) return
        const trs = Children.toArray(section.props.children)
        if (section.type === "thead") {
            const cells = cellsOf(trs[0])
            head = cells.map((c) => c.props.children)
            cells.forEach((c, i) => {
                align[i] = c.props.style?.textAlign || "left"
            })
        } else {
            trs.forEach((tr) => {
                rows.push(cellsOf(tr).map((c) => c.props.children))
            })
        }
    })
    return (
        <SharedTable
            head={head}
            rows={rows}
            align={align}
            className={styles.table}
        />
    )
}
MarkdownTable.propTypes = { children: PropTypes.node }

const UnsupportedImage = () => (
    <em className={styles.unsupported}>unsupported image</em>
)

const Paragraph = ({ children, className: incoming, ...props }) => {
    const variant = useContext(QuoteContext) ? QUOTE : BODY
    return (
        <Text
            as="p"
            apple={variant.apple}
            material={variant.material}
            className={incoming || undefined}
            {...props}
        >
            {children}
        </Text>
    )
}
Paragraph.propTypes = { children: PropTypes.node, className: PropTypes.string }

const Blockquote = ({ children }) => (
    <blockquote className={styles.blockquote}>
        <QuoteContext.Provider value>{children}</QuoteContext.Provider>
    </blockquote>
)
Blockquote.propTypes = { children: PropTypes.node }

const overrides = {
    h1: textTag("h1", HEADING[1], styles.heading),
    h2: textTag("h2", HEADING[2], styles.heading),
    h3: textTag("h3", HEADING[3], styles.heading),
    h4: textTag("h4", HEADING[4], styles.heading),
    h5: textTag("h5", HEADING[5], styles.heading),
    h6: textTag("h6", HEADING[6], styles.heading),
    p: Paragraph,
    li: textTag("li", BODY),
    ul: plainTag("ul", styles.list),
    ol: plainTag("ol", styles.list),
    blockquote: Blockquote,
    pre: plainTag("pre", styles.codeBlock),
    hr: () => <hr className={styles.hr} />,
    code: Code,
    a: Anchor,
    strong: Strong,
    table: MarkdownTable,
    img: UnsupportedImage,
}

const MARKDOWN_OPTIONS = {
    overrides,
    disableParsingRawHTML: true,
    forceWrapper: true,
    wrapper: "div",
}

const Markdown = ({ children, className }) => (
    <MarkdownToJsx
        options={MARKDOWN_OPTIONS}
        className={[styles.root, className].filter(Boolean).join(" ")}
    >
        {children || ""}
    </MarkdownToJsx>
)

Markdown.propTypes = {
    children: PropTypes.string,
    className: PropTypes.string,
}

export default Markdown
