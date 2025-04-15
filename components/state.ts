import useSWR, { useSWRConfig } from 'swr'
import {
    GithubCommit,
    GithubRepository,
    GithubUser,
} from '@/components/github/client'

const STATE_KEY = '/app/state'

export interface State {
    user?: GithubUser
    repository?: GithubRepository
    commit?: GithubCommit
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
