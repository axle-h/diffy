import { Octokit } from 'octokit'
import useSWRImmutable from 'swr/immutable'
import { useAppState } from '@/components/state'

export const octokit = new Octokit()

async function getUserOrNull(username: string) {
    try {
        const { data } = await octokit.rest.users.getByUsername({ username })
        return data
    } catch (e) {
        return null
    }
}

export type GithubUser = Exclude<
    Awaited<ReturnType<typeof getUserOrNull>>,
    null
>

export function useGithubUser(queryUsername: string | null) {
    const username = queryUsername?.trim() || ''
    return useSWRImmutable(username ? `GET /users/${username}` : null, () =>
        getUserOrNull(username)
    )
}

async function listUserRepositories(username: string) {
    try {
        const { data } = await octokit.rest.repos.listForUser({ username })
        return data
    } catch (e) {
        return []
    }
}

export type GithubRepository = Awaited<
    ReturnType<typeof listUserRepositories>
>[0]

export function useCurrentUserRepositories() {
    const { state } = useAppState()
    const username = state.user?.login
    return useSWRImmutable(
        username ? `GET /users/${username}/repos` : null,
        () => listUserRepositories(username || '')
    )
}

async function listCommits(owner: string, repo: string) {
    try {
        const { data } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            per_page: 100,
        })
        return data
    } catch (e) {
        return []
    }
}

export type GithubCommit = Awaited<ReturnType<typeof listCommits>>[0]

export function useCurrentRepositoryCommits() {
    const { state } = useAppState()
    const owner = state.user?.login
    const repo = state.repository?.name
    return useSWRImmutable(
        owner && repo ? `GET /users/${owner}/${repo}/commits` : null,
        () => listCommits(owner || '', repo || '')
    )
}

export type GithubFile = Exclude<GithubCommit['files'], undefined>[0]
async function getCommitFiles(owner: string, repo: string, ref: string) {
    try {
        const { data } = await octokit.rest.repos.getCommit({
            owner,
            repo,
            ref,
        })
        return data.files || []
    } catch (e) {
        return []
    }
}

export function useCurrentCommitFiles() {
    const { state } = useAppState()
    const owner = state.user?.login
    const repo = state.repository?.name
    const ref = state.commit?.sha
    return useSWRImmutable(
        owner && repo && ref
            ? `GET /users/${owner}/${repo}/commits/${ref}`
            : null,
        () => getCommitFiles(owner || '', repo || '', ref || '')
    )
}
