import { Octokit } from 'octokit'
import { GenerateCommitDiffRequest } from '@/app/api/schema'

class GithubClient {
    private readonly octokit = new Octokit()

    async getUserOrNull(username: string) {
        try {
            const { data } = await this.octokit.rest.users.getByUsername({
                username,
            })
            return data
        } catch (e) {
            return null
        }
    }

    async listUserRepositories(username: string) {
        try {
            const { data } = await this.octokit.rest.repos.listForUser({
                username,
            })
            return data
        } catch (e) {
            return []
        }
    }

    async listCommits(owner: string, repo: string) {
        try {
            const { data } = await this.octokit.rest.repos.listCommits({
                owner,
                repo,
                per_page: 100,
            })
            return data
        } catch (e) {
            return []
        }
    }

    async getCommitFiles({ owner, repository, commitReference }: GenerateCommitDiffRequest): Promise<GithubFile[]> {
        try {
            const { data } = await this.octokit.rest.repos.getCommit({
                owner,
                repo: repository,
                ref: commitReference,
            })
            return data.files || []
        } catch (e) {
            return []
        }
    }
}

export const githubClient = new GithubClient()

type GithubReturnType<F extends keyof GithubClient> = Awaited<
    ReturnType<GithubClient[F]>
>

export type GithubUser = Exclude<GithubReturnType<'getUserOrNull'>, null>
export type GithubRepository = GithubReturnType<'listUserRepositories'>[0]
export type GithubCommit = GithubReturnType<'listCommits'>[0]
export type GithubFile = Exclude<GithubCommit['files'], undefined>[0]
