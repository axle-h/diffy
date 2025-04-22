import useSWR, { useSWRConfig } from 'swr'
import {
    GithubCommit,
    GithubRepository,
    GithubUser,
} from '@/components/github/client'
import { GenerateCommitDiffRequest } from '@/app/api/schema'

const STATE_KEY = '/app/state'

export interface State {
    user?: GithubUser
    repository?: GithubRepository
    commit?: GithubCommit
    generating?: boolean
}

export function toDiffRequest(state: State): GenerateCommitDiffRequest {
    const owner = state.user?.login || ''
    const repository = state.repository?.name || ''
    const commitReference = state.commit?.sha || ''
    return { owner, repository, commitReference }
}

export function useAppState(): {
    state: State
    patchState(state: Partial<State>): void
} {
    const { cache } = useSWRConfig()
    const { data, mutate } = useSWR(
        STATE_KEY,
        () => cache.get(STATE_KEY)?.data || {}
    )

    const state = data || {}

    return {
        state,
        patchState(patch: Partial<State>) {
            mutate({ ...state, ...patch }).then()
        },
    }
}
