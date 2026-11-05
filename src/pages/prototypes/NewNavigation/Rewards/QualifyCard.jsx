import Text from "../../../../components/Text"
import Tappable from "../../../../components/Tappable"
import ImageAvatar from "../../../../components/ImageAvatar"

import ClockIcon from "../../../../icons/16/Clock Fill.svg?react"
import DiamondIcon from "../../../../icons/16/Diamond Highlight.svg?react"

import { QUALIFY } from "./data"

import * as styles from "./QualifyCard.module.scss"

// Squad challenge: deadline, goal, the squad's progress towards it and the
// way into the leaderboard.
export default function QualifyCard() {
    return (
        <div className={styles.qualify}>
            <div className={styles.qualifyBody}>
                <div className={styles.endsIn}>
                    <ClockIcon />
                    <Text
                        apple={{ variant: "footnote", weight: "semibold" }}
                        material={{ variant: "footnote", weight: "medium" }}
                    >
                        {QUALIFY.endsIn}
                    </Text>
                </div>
                <Text
                    apple={{ variant: "title3", weight: "bold" }}
                    material={{ variant: "title3", weight: "medium" }}
                >
                    {QUALIFY.title}
                </Text>
                <Text
                    apple={{ variant: "subheadline1", weight: "regular" }}
                    material={{ variant: "subheadline1", weight: "regular" }}
                    className={styles.qualifyText}
                >
                    {QUALIFY.description}{" "}
                    <Tappable
                        as="button"
                        type="button"
                        mode="opacity"
                        className={styles.inlineLink}
                    >
                        <Text
                            apple={{
                                variant: "subheadline1",
                                weight: "regular",
                                chevron: true,
                            }}
                            material={{
                                variant: "subheadline1",
                                weight: "regular",
                            }}
                        >
                            See all prizes
                        </Text>
                    </Tappable>
                </Text>
            </div>

            <div
                className={styles.progress}
                role="img"
                aria-label={`${QUALIFY.points} points, ${QUALIFY.goal}`}
            >
                <span className={styles.progressFill}>
                    <DiamondIcon />
                    <Text
                        apple={{
                            variant: "footnote",
                            weight: "semibold",
                            rounded: true,
                        }}
                        material={{ variant: "footnote", weight: "medium" }}
                    >
                        {QUALIFY.points}
                    </Text>
                </span>
                <span className={styles.progressGoal}>
                    <DiamondIcon />
                    <Text
                        apple={{ variant: "footnote", weight: "semibold" }}
                        material={{ variant: "footnote", weight: "medium" }}
                    >
                        {QUALIFY.goal}
                    </Text>
                </span>
            </div>

            <Tappable
                as="button"
                type="button"
                mode="opacity"
                className={styles.leaderboard}
            >
                <span className={styles.members}>
                    {QUALIFY.members.map((src) => (
                        <ImageAvatar
                            key={src}
                            src={src}
                            size={18}
                            className={styles.member}
                        />
                    ))}
                </span>
                <Text
                    apple={{
                        variant: "subheadline2",
                        weight: "regular",
                        chevron: true,
                    }}
                    material={{ variant: "subheadline2", weight: "regular" }}
                >
                    Open Squad Leaderboard
                </Text>
            </Tappable>
        </div>
    )
}
