'use client'

import { useAppState } from '@/components/state'
import { useCurrentRepositoryCommits } from '@/components/github/client'
import { NativeSelect, Spinner } from '@chakra-ui/react'

export function SelectGithubCommit() {
    const { state, patchState } = useAppState()
    const { data: commits, isLoading } = useCurrentRepositoryCommits()

    function setSelectedCommit(selected: string | undefined) {
        const commit = selected
            ? commits?.find((r) => r.sha === selected)
            : null
        if (commit) {
            patchState({ commit })
        } else if (!!state.commit) {
            patchState({ commit: undefined })
        }
    }

    return (
        <NativeSelect.Root
            disabled={!commits || isLoading || commits.length === 0}
        >
            <NativeSelect.Field
                placeholder="Select commit"
                value={state.commit?.sha || ''}
                onChange={(e) => setSelectedCommit(e.currentTarget.value)}
            >
                {commits?.map((commit) => (
                    <option key={commit.sha} value={commit.sha}>
                        {commit.sha.substring(0, 8)} - {commit.commit.message}
                    </option>
                )) || <></>}
            </NativeSelect.Field>
            {isLoading ? (
                <NativeSelect.Indicator>
                    <Spinner />
                </NativeSelect.Indicator>
            ) : (
                <NativeSelect.Indicator />
            )}
        </NativeSelect.Root>
    )
}
