// Импорт всех ChevronRight SVG компонентов
import ChevronRight_Body_Medium from "./ChevronRight_Body_Medium.svg?react"
import ChevronRight_Body_Regular from "./ChevronRight_Body_Regular.svg?react"
import ChevronRight_Body_Semibold from "./ChevronRight_Body_Semibold.svg?react"
import ChevronRight_Callout_Medium from "./ChevronRight_Callout_Medium.svg?react"
import ChevronRight_Callout_Regular from "./ChevronRight_Callout_Regular.svg?react"
import ChevronRight_Callout_Semibold from "./ChevronRight_Callout_Semibold.svg?react"
import ChevronRight_Caption1_Medium from "./ChevronRight_Caption1_Medium.svg?react"
import ChevronRight_Caption1_Regular from "./ChevronRight_Caption1_Regular.svg?react"
import ChevronRight_Caption1_Semibold from "./ChevronRight_Caption1_Semibold.svg?react"
import ChevronRight_Caption2_Medium from "./ChevronRight_Caption2_Medium.svg?react"
import ChevronRight_Caption2_Regular from "./ChevronRight_Caption2_Regular.svg?react"
import ChevronRight_Caption2_Semibold from "./ChevronRight_Caption2_Semibold.svg?react"
import ChevronRight_Footnote_Medium from "./ChevronRight_Footnote_Medium.svg?react"
import ChevronRight_Footnote_Regular from "./ChevronRight_Footnote_Regular.svg?react"
import ChevronRight_Footnote_Semibold from "./ChevronRight_Footnote_Semibold.svg?react"
import ChevronRight_Headline_Medium from "./ChevronRight_Headline_Medium.svg?react"
import ChevronRight_Headline_Regular from "./ChevronRight_Headline_Regular.svg?react"
import ChevronRight_Headline_Semibold from "./ChevronRight_Headline_Semibold.svg?react"
import ChevronRight_Subheadline1_Medium from "./ChevronRight_Subheadline1_Medium.svg?react"
import ChevronRight_Subheadline1_Regular from "./ChevronRight_Subheadline1_Regular.svg?react"
import ChevronRight_Subheadline1_Semibold from "./ChevronRight_Subheadline1_Semibold.svg?react"
import ChevronRight_Subheadline2_Medium from "./ChevronRight_Subheadline2_Medium.svg?react"
import ChevronRight_Subheadline2_Regular from "./ChevronRight_Subheadline2_Regular.svg?react"
import ChevronRight_Subheadline2_Semibold from "./ChevronRight_Subheadline2_Semibold.svg?react"
import ChevronRight_Title1_Medium from "./ChevronRight_Title1_Medium.svg?react"
import ChevronRight_Title1_Regular from "./ChevronRight_Title1_Regular.svg?react"
import ChevronRight_Title1_Semibold from "./ChevronRight_Title1_Semibold.svg?react"
import ChevronRight_Title2_Medium from "./ChevronRight_Title2_Medium.svg?react"
import ChevronRight_Title2_Regular from "./ChevronRight_Title2_Regular.svg?react"
import ChevronRight_Title2_Semibold from "./ChevronRight_Title2_Semibold.svg?react"
import ChevronRight_Title3_Medium from "./ChevronRight_Title3_Medium.svg?react"
import ChevronRight_Title3_Regular from "./ChevronRight_Title3_Regular.svg?react"
import ChevronRight_Title3_Semibold from "./ChevronRight_Title3_Semibold.svg?react"

// Мапа для быстрого доступа к компонентам
const chevronMap = {
    body: {
        regular: ChevronRight_Body_Regular,
        medium: ChevronRight_Body_Medium,
        semibold: ChevronRight_Body_Semibold,
    },
    callout: {
        regular: ChevronRight_Callout_Regular,
        medium: ChevronRight_Callout_Medium,
        semibold: ChevronRight_Callout_Semibold,
    },
    caption1: {
        regular: ChevronRight_Caption1_Regular,
        medium: ChevronRight_Caption1_Medium,
        semibold: ChevronRight_Caption1_Semibold,
    },
    caption2: {
        regular: ChevronRight_Caption2_Regular,
        medium: ChevronRight_Caption2_Medium,
        semibold: ChevronRight_Caption2_Semibold,
    },
    footnote: {
        regular: ChevronRight_Footnote_Regular,
        medium: ChevronRight_Footnote_Medium,
        semibold: ChevronRight_Footnote_Semibold,
    },
    headline: {
        regular: ChevronRight_Headline_Regular,
        medium: ChevronRight_Headline_Medium,
        semibold: ChevronRight_Headline_Semibold,
    },
    subheadline1: {
        regular: ChevronRight_Subheadline1_Regular,
        medium: ChevronRight_Subheadline1_Medium,
        semibold: ChevronRight_Subheadline1_Semibold,
    },
    subheadline2: {
        regular: ChevronRight_Subheadline2_Regular,
        medium: ChevronRight_Subheadline2_Medium,
        semibold: ChevronRight_Subheadline2_Semibold,
    },
    title1: {
        regular: ChevronRight_Title1_Regular,
        medium: ChevronRight_Title1_Medium,
        semibold: ChevronRight_Title1_Semibold,
    },
    title2: {
        regular: ChevronRight_Title2_Regular,
        medium: ChevronRight_Title2_Medium,
        semibold: ChevronRight_Title2_Semibold,
    },
    title3: {
        regular: ChevronRight_Title3_Regular,
        medium: ChevronRight_Title3_Medium,
        semibold: ChevronRight_Title3_Semibold,
    },
}

/**
 * Получает компонент ChevronRight на основе variant и weight
 * @param {string} variant - вариант текста (например, "body", "title1")
 * @param {string} weight - вес текста (например, "regular", "medium", "semibold")
 * @returns {React.Component|null} - компонент ChevronRight или null, если не найден
 */
export const getChevronRight = (variant, weight = "regular") => {
    if (!variant) return null

    const variantKey = variant.toLowerCase()
    const weightKey = weight.toLowerCase()

    return chevronMap[variantKey]?.[weightKey] || null
}

export default chevronMap
