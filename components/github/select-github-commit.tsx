'use client'

import { useAppState } from '@/components/state'
import { NativeSelect, Spinner } from '@chakra-ui/react'
import { useCurrentRepositoryCommits } from '@/components/github/hooks'

export function SelectGithubCommit() {
    const { state, patchState } = useAppState()
    const { data: commits, isLoading } = useCurrentRepositoryCommits()

    function setSelectedCommit(selected: string | undefined) {
        const commit = selected
            ? commits?.find((r) => r.sha === selected)
            : null
        if (commit) {
            if (!state.commit || commit.sha !== state.commit.sha) {
                patchState({ commit, currentRequest: undefined })
            }
        } else if (state.commit) {
            patchState({ commit: undefined, currentRequest: undefined })
        }
    }

    return (
        <NativeSelect.Root
            disabled={
                !!state.currentRequest ||
                !commits ||
                isLoading ||
                commits.length === 0
            }
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
