import DollarsLogo from "../../icons/avatars/Dollars.png"
import BitcoinLogo from "../../icons/avatars/Bitcoin.png"
import ToncoinLogo from "../../icons/avatars/TON.png"

export const getAnimatedCellConfig = (isApple) => {
    const logos = isApple
        ? [
              {
                  src: ToncoinLogo,
                  zIndex: 2,
                  variants: {
                      collapsed: { scale: 0.6, top: "-6px", left: "-6px" },
                      expanded: { scale: 1, top: 0, left: 0 },
                  },
              },
              {
                  src: BitcoinLogo,
                  zIndex: 1,
                  variants: {
                      collapsed: {
                          scale: 0.6,
                          opacity: 1,
                          top: "6px",
                          left: "6px",
                      },
                      expanded: { scale: 0, opacity: 0, top: 0, left: 0 },
                  },
              },
          ]
        : [
              {
                  src: ToncoinLogo,
                  zIndex: 2,
                  variants: {
                      collapsed: { scale: 0.6, top: "-6px", left: 0 },
                      expanded: { scale: 1, top: 0, left: "6px" },
                  },
              },
              {
                  src: BitcoinLogo,
                  zIndex: 1,
                  variants: {
                      collapsed: {
                          scale: 0.6,
                          opacity: 1,
                          top: "6px",
                          left: "12px",
                      },
                      expanded: {
                          scale: 0,
                          opacity: 0,
                          top: 0,
                          left: "18px",
                      },
                  },
              },
          ]

    const logosStyle = isApple
        ? { position: "relative", width: "40px", height: "40px" }
        : {
              position: "relative",
              width: "42px",
              height: "42px",
              marginLeft: "-6px",
          }

    const animatedVariants = isApple
        ? {
              moreAssets: {
                  collapsed: { opacity: 1, top: "calc(50% - 11px)" },
                  expanded: { opacity: 0, top: "calc(50% - 20px)" },
              },
              bodyTitle: {
                  collapsed: { opacity: 0, top: "calc(50% - 11px)" },
                  expanded: { opacity: 1, top: "calc(50% - 20px)" },
              },
              bodySubtitle: {
                  collapsed: { opacity: 0, top: "calc(50% + 11px)" },
                  expanded: { opacity: 1, top: "calc(50% + 2px)" },
              },
              endTitle1: {
                  collapsed: {
                      opacity: 0,
                      top: "calc(50% - 2px)",
                      right: "16px",
                  },
                  expanded: {
                      opacity: 1,
                      top: "calc(50% - 11px)",
                      right: "16px",
                  },
              },
              endTitle2: {
                  collapsed: {
                      opacity: 1,
                      top: "calc(50% - 11px)",
                      right: "16px",
                  },
                  expanded: {
                      opacity: 0,
                      top: "calc(50% - 20px)",
                      right: "16px",
                  },
              },
          }
        : {
              moreAssets: {
                  collapsed: { opacity: 1, top: "calc(50% - 10px)" },
                  expanded: { opacity: 0, top: "calc(50% - 20px)" },
              },
              bodyTitle: {
                  collapsed: { opacity: 0, top: "calc(50% - 10px)" },
                  expanded: { opacity: 1, top: "calc(50% - 20px)" },
              },
              bodySubtitle: {
                  collapsed: { opacity: 0, top: "calc(50% + 12px)" },
                  expanded: { opacity: 1, top: "calc(50% + 3px)" },
              },
              endTitle1: {
                  collapsed: {
                      opacity: 0,
                      top: "calc(50% - 3px)",
                      right: "20px",
                  },
                  expanded: {
                      opacity: 1,
                      top: "calc(50% - 10px)",
                      right: "20px",
                  },
              },
              endTitle2: {
                  collapsed: {
                      opacity: 1,
                      top: "calc(50% - 10px)",
                      right: "20px",
                  },
                  expanded: {
                      opacity: 0,
                      top: "calc(50% - 20px)",
                      right: "20px",
                  },
              },
          }

    return { logos, logosStyle, animatedVariants }
}

export const ASSETS = [
    {
        name: "Dollars",
        coins: "50 USDT",
        value: "$50.00",
        image: DollarsLogo,
    },
    { isAnimated: true },
    {
        name: "Bitcoin",
        coins: "0.000011 BTC",
        value: "$50.64",
        image: BitcoinLogo,
    },
    {
        name: "1 Bitcoin",
        coins: "0.000011 BTC",
        value: "$50.64",
        image: BitcoinLogo,
    },
    {
        name: "2 Bitcoin",
        coins: "0.000011 BTC",
        value: "$50.64",
        image: BitcoinLogo,
    },
]

export const getItemVariant = ({ index, expandedAssets, isApple }) => {
    const baseVariant = {
        scale: 1,
        opacity: 1,
        marginTop: 0,
        zIndex: 10 - index,
        top: 0,
        backgroundColor: "var(--tg-theme-section-bg-color)",
    }

    if (expandedAssets) {
        return baseVariant
    }

    const scaleValueDefault = isApple ? 0.82 : 1
    const scaleValueArray = isApple ? [1, 1, 0.91, 0.82] : [1, 1, 1, 1]

    switch (index) {
        case 0:
            return baseVariant
        case 1:
            return {}
        case 2:
            return {
                ...baseVariant,
                scale: scaleValueArray[index],
                opacity: 0.9,
                marginTop: "-60px",
                backgroundColor: "var(--tg-theme-secondary-bg-color)",
            }
        case 3:
            return {
                ...baseVariant,
                scale: scaleValueArray[index],
                opacity: 0.8,
                marginTop: "-70px",
                top: "9px",
                backgroundColor: "var(--tg-theme-secondary-bg-color)",
            }
        default:
            return {
                ...baseVariant,
                scale: scaleValueDefault,
                opacity: 0,
                marginTop: "-70px",
                top: "9px",
                backgroundColor: "var(--tg-theme-secondary-bg-color)",
            }
    }
}

export const getItemVariantInside = ({ index, expandedAssets }) => {
    if (index > 1) {
        return { opacity: expandedAssets ? 1 : 0 }
    }
    return {}
}

export const getAssetColorFill = ({ index, expandedAssets }) => {
    if (expandedAssets) {
        return { opacity: 0 }
    }

    const opacities = {
        2: 0.72,
        3: 0.32,
    }

    return { opacity: opacities[index] || 0 }
}

export const getSpringValue = (isApple) =>
    isApple
        ? { type: "spring", stiffness: 640, damping: 40 }
        : { type: "spring", stiffness: 800, damping: 60, mass: 1 }
