import { z } from 'zod'

export class Schema {
    static readonly Boolean = z
        .union([z.boolean(), z.literal('true'), z.literal('false')])
        .transform((value) => value === true || value === 'true')

    static readonly GenerateCommitDiffRequest = z.object({
        owner: z.string().nonempty(),
        repository: z.string().nonempty(),
        commitReference: z.string().nonempty(),
    })
}

export type GenerateCommitDiffRequest = z.infer<
    (typeof Schema)['GenerateCommitDiffRequest']
>

export function toDiffUri(request: GenerateCommitDiffRequest) {
    return `/api/diff/github/${request.owner}/${request.repository}/${request.commitReference}`
}

export interface DiffResult {
    message: string
}

export interface DiffRequest {
    uri: string
    files: { filename: string; diff: string }[]
}

export interface LLMProgressEvent {
    type: 'progress'
    totalFiles: number
    processedFiles: number
    percentDone: number
}

export interface LLMContentEvent {
    type: 'content'
    content: string
}

export interface LLMDoneEvent {
    type: 'done'
}

export type LLMEvent = LLMProgressEvent | LLMContentEvent | LLMDoneEvent
