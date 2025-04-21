import { OkOrErrorResponse, handleServerError } from '@/app/api/api-error'
import { NextResponse } from 'next/server'
import { GenerateCommitDiffRequest, DiffResult, Schema } from '@/app/api/schema'
import { llmDiff } from '@/app/api/diff/llm-diff'
import { githubClient } from '@/components/github/client'

export const dynamic = 'force-dynamic'

export async function POST(
    request: Request
): Promise<OkOrErrorResponse<DiffResult, GenerateCommitDiffRequest>> {
    try {
        const generateDiffRequest = Schema.GenerateCommitDiffRequest.parse(
            await request.json()
        )
        const githubDiff =
            await githubClient.getCommitFiles(generateDiffRequest)
        const files = githubDiff
            .map((f) => ({
                filename: f.filename,
                diff: f.patch || '',
            }))
            .filter((f) => !!f.diff)
        const result = await llmDiff({ files })
        return NextResponse.json(result)
    } catch (e) {
        return handleServerError(e)
    }
}
