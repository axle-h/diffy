import { DiffResult, GenerateCommitDiffRequest } from '@/app/api/schema'
import { assertOk } from '@/app/api/api-error'
import { useAppState } from '@/components/state'
import { SWRResponse } from 'swr'
import useSWRImmutable from 'swr/immutable'

async function generateGithubCommitDiff(
    request: GenerateCommitDiffRequest
): Promise<DiffResult> {
    const response = await fetch('/api/diff/github', {
        method: 'POST',
        body: JSON.stringify(request),
    })
    await assertOk(response, 'generate github commit diff')

    return response.json()
}

export function useGenerateGithubCommitDiff(): SWRResponse<DiffResult> {
    const { state } = useAppState()
    const request = state.currentRequest || {
        owner: '',
        repository: '',
        commitReference: '',
    }

    return useSWRImmutable(
        request.owner && request.repository && request.commitReference
            ? `POST /api/diff/github/${request.owner}/${request.repository}/${request.commitReference}`
            : null,
        () => generateGithubCommitDiff(request)
    )
}
