import Text from "../Text"

import "./index.css"

const PanelHeader = ({ children }) => {
    return (
        <div className="PanelHeader modal-height">
            <div className="body">
                <div className="left">
                    <Text
                        apple={{
                            variant: "body",
                        }}
                        material={{
                            variant: "body1",
                        }}
                    >
                        Close
                    </Text>
                </div>
                <div className="right">
                    <Text
                        apple={{
                            variant: "body",
                            weight: "semibold",
                        }}
                        material={{
                            variant: "body1",
                            weight: "medium",
                        }}
                    >
                        Done
                    </Text>
                </div>
            </div>
            <div className="middle">
                <Text
                    apple={{
                        variant: "body",
                        weight: "semibold",
                    }}
                    material={{
                        variant: "headline6",
                    }}
                >
                    {children}
                </Text>
            </div>
        </div>
    )
}

export default PanelHeader
