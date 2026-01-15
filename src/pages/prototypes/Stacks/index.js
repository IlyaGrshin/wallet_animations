// TODO: Use CSS Modules
import { useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"

import "./index.css"

import { useApple } from "../../hooks/DeviceProvider"
import Card from "../../components/Card"
import Cell from "../../components/Cells"
import Text from "../../components/Text"
import { TRANSITIONS } from "../../utils/animations"

import {
    ASSETS,
    getAnimatedCellConfig,
    getAssetColorFill,
    getItemVariant,
    getItemVariantInside,
    getSpringValue,
} from "./stacksConfig"

function AnimatedCell({ expandedAssets, index }) {
    const transition = TRANSITIONS.MATERIAL_STANDARD
    const { logos, logosStyle, animatedVariants } =
        getAnimatedCellConfig(useApple)

    return (
        <m.div className="asset" style={{ zIndex: 10 - index }}>
            <div className="Cell">
                <div className="start">
                    <div className="assetIcon" style={logosStyle}>
                        {logos.map((logo, index) => (
                            <m.div
                                className="image"
                                variants={logo.variants}
                                transition={transition}
                                animate={
                                    expandedAssets ? "expanded" : "collapsed"
                                }
                                style={{
                                    backgroundImage: `url(${logo.src})`,
                                    position: "absolute",
                                    zIndex: logo.zIndex,
                                }}
                                key={`stack-asset-${index}`}
                            ></m.div>
                        ))}
                    </div>
                </div>
                <div className="body" style={{ position: "relative" }}>
                    <m.div
                        variants={animatedVariants.moreAssets}
                        transition={transition}
                        animate={expandedAssets ? "expanded" : "collapsed"}
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
                        variants={animatedVariants.bodyTitle}
                        transition={transition}
                        animate={expandedAssets ? "expanded" : "collapsed"}
                        style={{
                            transformOrigin: "0% 50%",
                            position: "absolute",
                        }}
                    >
                        <Text
                            apple={{ variant: "body", weight: "medium" }}
                            material={{ variant: "body1", weight: "medium" }}
                            className="label"
                        >
                            Toncoin
                        </Text>
                    </m.div>
                    <m.div
                        variants={animatedVariants.bodySubtitle}
                        transition={transition}
                        animate={expandedAssets ? "expanded" : "collapsed"}
                        style={{
                            transformOrigin: "0% 50%",
                            position: "absolute",
                        }}
                    >
                        <Text
                            apple={{
                                variant: "subheadline2",
                                weight: "regular",
                            }}
                            material={{
                                variant: "subtitle2",
                                weight: "regular",
                            }}
                            className="caption"
                        >
                            100 TON
                        </Text>
                    </m.div>
                </div>
                <div className="end">
                    <m.div
                        variants={animatedVariants.endTitle1}
                        transition={transition}
                        animate={expandedAssets ? "expanded" : "collapsed"}
                        style={{
                            transformOrigin: "0% 50%",
                            position: "absolute",
                        }}
                    >
                        <Text
                            apple={{ variant: "body", weight: "regular" }}
                            material={{ variant: "body1", weight: "regular" }}
                            className="label"
                        >
                            $150.00
                        </Text>
                    </m.div>
                    <m.div
                        variants={animatedVariants.endTitle2}
                        transition={transition}
                        animate={expandedAssets ? "expanded" : "collapsed"}
                        style={{
                            transformOrigin: "0% 50%",
                            position: "absolute",
                        }}
                    >
                        <Text
                            apple={{ variant: "body", weight: "regular" }}
                            material={{ variant: "body1", weight: "regular" }}
                            className="label"
                        >
                            $201.92
                        </Text>
                    </m.div>
                </div>
            </div>
        </m.div>
    )
}

AnimatedCell.propTypes = {
    expandedAssets: PropTypes.bool,
    index: PropTypes.number,
}

function Stacks() {
    const [expandedAssets, setExpandedAssets] = useState(false)

    const toggleAssets = () => {
        setExpandedAssets((value) => !value)
    }
    const springValue = getSpringValue(useApple)

    return (
        <AnimatePresence initial={false}>
            <m.div
                animate={expandedAssets ? "expanded" : "collapsed"}
                className={expandedAssets ? "expanded" : "collapsed"}
                onClick={toggleAssets}
            >
                <Card className="assets">
                    {ASSETS.map((asset, index) => {
                        if (asset.isAnimated) {
                            return (
                                <AnimatedCell
                                    key={`animated-cell-${index}`}
                                    expandedAssets={expandedAssets}
                                    index={index}
                                />
                            )
                        }

                        return (
                            <m.div
                                className="asset"
                                key={`asset-${index}`}
                                animate={getItemVariant({
                                    index,
                                    expandedAssets,
                                    isApple: useApple,
                                })}
                                transition={springValue}
                            >
                                <m.div
                                    className="assetColorFill"
                                    animate={getAssetColorFill({
                                        index,
                                        expandedAssets,
                                    })}
                                    transition={{
                                        ease: "linear",
                                        duration: 0.15,
                                    }}
                                />
                                <m.div
                                    animate={getItemVariantInside({
                                        index,
                                        expandedAssets,
                                    })}
                                    transition={{
                                        ease: "linear",
                                        duration: 0.15,
                                    }}
                                    style={{ position: "relative" }}
                                >
                                    <Cell
                                        start={
                                            <Cell.Start
                                                type="Image"
                                                src={asset.image}
                                            />
                                        }
                                        end={<Cell.Text title={asset.value} />}
                                        key={`tx-${index}`}
                                    >
                                        <Cell.Text
                                            title={asset.name}
                                            description={asset.coins}
                                            bold
                                        />
                                    </Cell>
                                </m.div>
                            </m.div>
                        )
                    })}
                </Card>
            </m.div>
        </AnimatePresence>
    )
}

export default Stacks
