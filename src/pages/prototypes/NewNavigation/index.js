import { BackButton } from "@twa-dev/sdk/react"

import NativePageTransition from "../../../components/NativePageTransition"
import NavigationPanel from "./components/NavigationPanel"
import PageContent from "./components/PageContent"
import { useAvatarUrl } from "./hooks/useAvatarUrl"
import { useSegmentNavigation } from "./hooks/useSegmentNavigation"

function NewNavigation() {
    const { activeSegment, view, handleSegmentChange } = useSegmentNavigation()
    const avatarUrl = useAvatarUrl()

    return (
        <>
            <BackButton />
            <NativePageTransition>
                <NavigationPanel
                    avatarUrl={avatarUrl}
                    activeSegment={activeSegment}
                    onSegmentChange={handleSegmentChange}
                />
                <PageContent view={view} />
            </NativePageTransition>
        </>
    )
}

export default NewNavigation
