import { useAppState } from '@/components/state'
import useSWRImmutable from 'swr/immutable'
import { githubClient } from '@/components/github/client'

export function useGithubUser(queryUsername: string | null) {
    const username = queryUsername?.trim() || ''
    return useSWRImmutable(
        !!username ? `GET /github/users/${username}` : null,
        () => githubClient.getUserOrNull(username)
    )
}

export function useCurrentUserRepositories() {
    const { state } = useAppState()
    const username = state.user?.login || ''
    return useSWRImmutable(
        username ? `GET /github/users/${username}/repos` : null,
        () => githubClient.listUserRepositories(username)
    )
}

export function useCurrentRepositoryCommits() {
    const { state } = useAppState()
    const owner = state.user?.login || ''
    const repo = state.repository?.name || ''
    return useSWRImmutable(
        owner && repo ? `GET /github/users/${owner}/${repo}/commits` : null,
        () => githubClient.listCommits(owner, repo)
    )
}
