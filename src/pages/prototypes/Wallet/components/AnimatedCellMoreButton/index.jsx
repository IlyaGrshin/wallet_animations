import PropTypes from "prop-types"
import * as m from "motion/react-m"
import * as cellStyles from "../../../../../components/Cells/Cell.module.scss"
import Tappable from "../../../../../components/Tappable"
import Text from "../../../../../components/Text"
import { useSkin } from "../../../../../hooks/DeviceProvider"
import { getAssetIcon } from "../../../../../utils/AssetsMap"
import { TRANSITIONS } from "../../../../../utils/animations"
import HiddenEye from "../../../../../icons/avatars/HiddenEyeIcon.svg"

const ICON_TRANSITION = "transform 0.3s ease, opacity 0.3s ease"

export default function AnimatedCellMoreButton({ onClick, state }) {
    const { isApple } = useSkin()
    const transition = TRANSITIONS.MATERIAL_STANDARD

    const iconSize = isApple ? 40 : 42
    const hiddenEyeX = isApple ? (state ? 0 : -6) : state ? 6 : 0
    const jettonsSize = isApple
        ? { position: "relative", width: "40px", height: "40px" }
        : {
              position: "relative",
              width: "42px",
              height: "42px",
              marginLeft: "-6px",
          }

    // HMSTR иконка — при expanded исчезает
    const hmstrStyles = isApple
        ? {
              collapsed: { scale: 0.6, y: -6, x: -6, opacity: 1 },
              expanded: { scale: 1, y: 0, x: 0, opacity: 0 },
          }
        : {
              collapsed: { scale: 0.6, y: -6, x: 0, opacity: 1 },
              expanded: { scale: 1, y: 0, x: 6, opacity: 0 },
          }

    // NOT иконка — при expanded исчезает
    const notStyles = isApple
        ? {
              collapsed: { scale: 0.6, y: 6, x: 6, opacity: 1 },
              expanded: { scale: 0, y: 0, x: 0, opacity: 0 },
          }
        : {
              collapsed: { scale: 0.6, y: 6, x: 12, opacity: 1 },
              expanded: { scale: 0, y: 0, x: 18, opacity: 0 },
          }

    const jettons = [
        { src: getAssetIcon("HMSTR"), styles: hmstrStyles, zIndex: 2 },
        { src: getAssetIcon("NOT"), styles: notStyles, zIndex: 1 },
    ]

    const variants = {
        TextMoreAssets: {
            collapsed: { opacity: 1, y: 0 },
            expanded: { opacity: 0, y: -9 },
        },
        TextHideLowBalances: {
            collapsed: { opacity: 0, y: -9 },
            expanded: { opacity: 1, y: 0 },
        },
    }

    return (
        <Tappable className={cellStyles.root} onClick={onClick}>
            <div className={cellStyles.start}>
                <div className="assetIcon" style={jettonsSize}>
                    <img
                        src={HiddenEye}
                        alt=""
                        className={cellStyles.image}
                        style={{
                            position: "absolute",
                            zIndex: 3,
                            width: iconSize,
                            height: iconSize,
                            top: 0,
                            left: 0,
                            opacity: state ? 1 : 0,
                            transform: `translate(${hiddenEyeX}px, ${state ? 0 : -6}px) scale(${state ? 1 : 0.6})`,
                            transition: ICON_TRANSITION,
                        }}
                    />
                    {jettons.map((jetton, index) => {
                        const s = state
                            ? jetton.styles.expanded
                            : jetton.styles.collapsed
                        return (
                            <img
                                src={jetton.src}
                                alt=""
                                className={cellStyles.image}
                                style={{
                                    position: "absolute",
                                    zIndex: jetton.zIndex,
                                    width: iconSize,
                                    height: iconSize,
                                    top: 0,
                                    left: 0,
                                    opacity: s.opacity,
                                    transform: `translate(${s.x}px, ${s.y}px) scale(${s.scale})`,
                                    transition: ICON_TRANSITION,
                                }}
                                key={`stack-asset-${index}`}
                            />
                        )
                    })}
                </div>
            </div>
            <div className={cellStyles.body} style={{ position: "relative" }}>
                <m.div
                    variants={variants.TextMoreAssets}
                    transition={transition}
                    animate={state ? "expanded" : "collapsed"}
                    style={{
                        transformOrigin: "0% 50%",
                        position: "absolute",
                        top: "calc(50% - 11px)",
                    }}
                >
                    <Text variant="body" weight="medium">
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
                        top: "calc(50% - 11px)",
                    }}
                >
                    <Text variant="body" weight="medium">
                        Hide Low Balances
                    </Text>
                </m.div>
            </div>
        </Tappable>
    )
}

AnimatedCellMoreButton.propTypes = {
    onClick: PropTypes.func,
    state: PropTypes.bool,
}
