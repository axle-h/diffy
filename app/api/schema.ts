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

export type GenerateCommitDiffRequest = z.infer<(typeof Schema)['GenerateCommitDiffRequest']>

export interface DiffResult {
    message: string
}