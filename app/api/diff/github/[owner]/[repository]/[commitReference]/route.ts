import { LlmStream } from '@/app/api/diff/llm-diff'
import { GenerateCommitDiffRequest, Schema } from '@/app/api/schema'
import { githubClient } from '@/components/github/client'
import { handleServerError } from '@/app/api/api-error'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<GenerateCommitDiffRequest> }
) {
    try {
        const generateDiffRequest = Schema.GenerateCommitDiffRequest.parse(
            await params
        )
        const githubDiff =
            await githubClient.getCommitFiles(generateDiffRequest)
        const files = githubDiff
            .map((f) => ({
                filename: f.filename,
                diff: f.patch || '',
            }))
            .filter((f) => !!f.diff)
        const stream = new ReadableStream(new LlmStream({ files }))
        return new Response(stream, {
            // Set the headers for Server-Sent Events (SSE)
            headers: {
                Connection: 'keep-alive',
                'Content-Encoding': 'none',
                'Cache-Control': 'no-cache, no-transform',
                'Content-Type': 'text/event-stream; charset=utf-8',
            },
        })
    } catch (e) {
        return handleServerError(e)
    }
}
