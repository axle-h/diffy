import { useAppState } from '@/components/state'
import { Button } from '@/components/ui/button'
import { useCurrentCommitFiles } from '@/components/github/client'
import { useEffect } from 'react'

export function SubmitGithubDiff() {
    const { data: files, isLoading } = useCurrentCommitFiles()

    useEffect(() => {
        console.log(files)
    }, [files])

    return (
        <Button
            variant="outline"
            colorPalette="teal"
            disabled={!files}
            loading={isLoading}
        >
            Submit
        </Button>
    )
}
