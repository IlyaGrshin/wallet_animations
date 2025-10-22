import PropTypes from "prop-types"
import * as m from "motion/react-m"
import * as cellStyles from "../../../../../components/Cells/Cell.module.scss"
import Text from "../../../../../components/Text"
import { useApple } from "../../../../../hooks/DeviceProvider"
import { getAssetIcon } from "../../../../../utils/AssetsMap"
import { TRANSITIONS } from "../../../../../utils/animations"
import HiddenEye from "../../../../../icons/avatars/HiddenEyeIcon.svg"

export default function AnimatedCellMoreButton({ onClick, state }) {
    const transition = TRANSITIONS.MATERIAL_STANDARD

    const jettonsSize = useApple
        ? { position: "relative", width: "40px", height: "40px" }
        : {
              position: "relative",
              width: "42px",
              height: "42px",
              marginLeft: "-6px",
          }

    const jettonsMotion = useApple
        ? [
              {
                  src: getAssetIcon("HMSTR"),
                  variants: {
                      collapsed: { scale: 0.6, top: "-6px", left: "-6px" },
                      expanded: { scale: 1, opacity: 0, top: 0, left: 0 },
                  },
              },
              {
                  src: getAssetIcon("NOT"),
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
                  src: getAssetIcon("HMSTR"),
                  variants: {
                      collapsed: { scale: 0.6, top: "-6px", left: 0 },
                      expanded: { scale: 1, top: 0, left: "6px" },
                  },
              },
              {
                  src: getAssetIcon("NOT"),
                  variants: {
                      collapsed: {
                          scale: 0.6,
                          opacity: 1,
                          top: "6px",
                          left: "12px",
                      },
                      expanded: { scale: 0, opacity: 0, top: 0, left: "18px" },
                  },
              },
          ]

    const HiddenEyeMotion = useApple
        ? {
              variants: {
                  collapsed: {
                      scale: 0.6,
                      opacity: 0,
                      top: "-6px",
                      left: "-6px",
                  },
                  expanded: { scale: 1, opacity: 1, top: 0, left: 0 },
              },
          }
        : {
              variants: {
                  collapsed: { scale: 0.6, opacity: 0, top: "-6px", left: 0 },
                  expanded: { scale: 1, opacity: 1, top: 0, left: "6px" },
              },
          }

    const variants = {
        TextMoreAssets: {
            collapsed: { opacity: 1, top: "calc(50% - 11px)" },
            expanded: { opacity: 0, top: "calc(50% - 20px)" },
        },
        TextHideLowBalances: {
            collapsed: { opacity: 0, top: "calc(50% - 20px)" },
            expanded: { opacity: 1, top: "calc(50% - 11px)" },
        },
    }

    return (
        <m.div onClick={onClick}>
            <div className={cellStyles.root}>
                <div className={cellStyles.start}>
                    <div className="assetIcon" style={jettonsSize}>
                        <m.div
                            className={cellStyles.image}
                            variants={HiddenEyeMotion.variants}
                            transition={transition}
                            animate={state ? "expanded" : "collapsed"}
                            style={{
                                backgroundImage: `url(${HiddenEye})`,
                                position: "absolute",
                                zIndex: 3,
                            }}
                            key={`stack-asset-3`}
                            initial={false}
                        ></m.div>
                        {jettonsMotion.map((jetton, index) => (
                            <m.div
                                className={cellStyles.image}
                                variants={jetton.variants}
                                transition={transition}
                                animate={state ? "expanded" : "collapsed"}
                                style={{
                                    backgroundImage: `url(${jetton.src})`,
                                    position: "absolute",
                                    zIndex: 2 - index,
                                }}
                                key={`stack-asset-${index}`}
                                initial={false}
                            ></m.div>
                        ))}
                    </div>
                </div>
                <div
                    className={cellStyles.body}
                    style={{ position: "relative" }}
                >
                    <m.div
                        variants={variants.TextMoreAssets}
                        transition={transition}
                        animate={state ? "expanded" : "collapsed"}
                        style={{
                            transformOrigin: "0% 50%",
                            position: "absolute",
                        }}
                    >
                        <Text
                            apple={{ variant: "body", weight: "medium" }}
                            material={{ variant: "body1", weight: "medium" }}
                        >
                            More Assets
                        </Text>
                    </m.div>
                    <m.div
                        variants={variants.TextHideLowBalances}
                        transition={transition}
                        animate={state ? "expanded" : "collapsed"}
                        initial={false}
                        style={{
                            transformOrigin: "0% 50%",
                            position: "absolute",
                        }}
                    >
                        <Text
                            apple={{ variant: "body", weight: "medium" }}
                            material={{ variant: "body1", weight: "medium" }}
                        >
                            Hide Low Balances
                        </Text>
                    </m.div>
                </div>
            </div>
        </m.div>
    )
}

AnimatedCellMoreButton.propTypes = {
    onClick: PropTypes.func,
    state: PropTypes.bool,
}
