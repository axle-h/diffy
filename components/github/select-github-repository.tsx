'use client'

import { NativeSelect, Spinner } from '@chakra-ui/react'
import { useAppState } from '@/components/state'

import { useCurrentUserRepositories } from '@/components/github/hooks'

export function SelectGithubRepository() {
    const { state, patchState } = useAppState()
    const { data: repositories, isLoading } = useCurrentUserRepositories()

    function setSelectedRepository(selected: string) {
        const repository = selected
            ? repositories?.find((r) => r.name === selected)
            : null
        if (repository) {
            if (
                !state.repository ||
                repository.name !== state.repository.name
            ) {
                patchState({
                    repository,
                    commit: undefined,
                })
            }
        } else if (state.repository) {
            patchState({
                repository: undefined,
                commit: undefined,
            })
        }
    }

    return (
        <NativeSelect.Root
            disabled={
                state.generating ||
                !repositories ||
                isLoading ||
                repositories.length === 0
            }
        >
            <NativeSelect.Field
                placeholder="Select repository"
                value={state.repository?.name || ''}
                onChange={(e) => setSelectedRepository(e.currentTarget.value)}
            >
                {repositories?.map((repository) => (
                    <option key={repository.name} value={repository.name}>
                        {repository.name}
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
