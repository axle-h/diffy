import OpenAI, { APIError } from 'openai'

export interface DiffRequest {
    files: { filename: string; diff: string }[]
}

const openai = new OpenAI({
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'not-used',
})

const BIG_MODEL = 'gemma-3-27b-it'
const SMALL_MODEL = 'qwen2.5-7b-instruct-1m'

const GENERATE_COMMIT_FROM_SUMMARY_CONTEXT = `
You will receive a list of summarised file changes that you will summarize into a very short commit message.
The response will be passed to git commit and should be formatted EXACTLY:

A single line summary of the entire change
* Change 1
* Change 2 etc

* Be concise & descriptive, NOT conversational
* Do not list individual changed files, instead try to group changes across files into logical features, bug fixes or just related changes
* Try to explain WHY a change has been made rather than the actual content
* Mention refactoring where it is relevant in summary, do not be overly specific about renaming variables or files
* Do not use business terms like 'customer engagement', be more technical
* Try to be witty where appropriate but not silly or offensive
* Use emojis liberally
* If there are none or very little changes then output the smallest message
`

const SUMMARIZE_FILE_DIFF_CONTEXT = `
You will receive a git patch that you will summarize to be more concise:
* List changes as concise bullet points
* Do not try to reason why a change has been made, just summarize to be more concise
* The response should be shorter than the input
* Do not list anything that has no functional change for example renaming a variable
* Do not mention formatting changes like adding a semi colon or changing whitespace
`

async function chat(model: string, context: string, prompt: string) {
    const response = await openai.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: context },
            { role: 'user', content: prompt },
        ],
    })

    return response.choices[0]?.message?.content || ''
}

async function chatStream(
    model: string,
    context: string,
    prompt: string,
    callback: (content: string) => void
) {
    const stream = await openai.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: context },
            { role: 'user', content: prompt },
        ],
        stream: true,
    })
    for await (const part of stream) {
        const content = part.choices[0]?.delta?.content || ''
        if (content) {
            callback(content)
        }
    }
}

function chunk<T>(array: T[], chunkSize: number): T[][] {
    const source = [...array]
    const chunks = []
    while (source.length > 0) {
        chunks.push(source.splice(0, chunkSize))
    }
    return chunks
}

interface DiffProgressEvent {
    progress: number
}

export interface LLMContentEvent {
    content: string
    done: boolean
}

export class LlmStream implements UnderlyingByteSource {
    type: 'bytes' = 'bytes'
    private closed = false

    constructor(private readonly request: DiffRequest) {}

    start(controller: ReadableByteStreamController) {
        this.llmStream(controller)
    }

    private async llmStream(controller: ReadableByteStreamController) {
        const encoder = new TextEncoder()

        const files = this.request.files.filter(
            (f) => !f.filename.endsWith('package-lock.json')
        )
        const fileDiffs = files.sort((a, b) => a.diff.length - b.diff.length)

        const chunks = [fileDiffs] // one big chunk to start
        const summaryChunks = []

        // TODO send progress
        let nextChunk = chunks.pop()
        while (!this.closed && nextChunk) {
            const files = nextChunk.map((cnk) => cnk.filename).join(',')
            const diff = nextChunk.map((cnk) => cnk.diff).join('\n')
            try {
                const chunkResult = await chat(
                    SMALL_MODEL,
                    SUMMARIZE_FILE_DIFF_CONTEXT,
                    diff
                )
                summaryChunks.push(files + ':\n' + chunkResult)
                console.debug(
                    `remaining: ${chunks.length}, done: ${summaryChunks.length}`
                )
            } catch (e) {
                if (
                    e instanceof APIError &&
                    e.status === 400 &&
                    e.message.toLowerCase().includes('context length')
                ) {
                    if (nextChunk.length > 1) {
                        console.debug(`context too long, re-chunking ${files}`)
                        // split the chunk in half and requeue it
                        const smallerChunks = chunk(
                            nextChunk,
                            Math.ceil(nextChunk.length / 2)
                        )
                        chunks.push(...smallerChunks)
                    } else {
                        console.debug(`file diff too long ${files}`)
                    }
                } else {
                    throw e
                }
            }

            nextChunk = chunks.pop()
        }

        if (this.closed) {
            return
        }

        await chatStream(
            BIG_MODEL,
            GENERATE_COMMIT_FROM_SUMMARY_CONTEXT,
            summaryChunks.join('\n'),
            (content) => {
                const event: LLMContentEvent = { content, done: false }
                controller.enqueue(
                    encoder.encode(
                        `event: content\ndata: ${JSON.stringify(event)}\n\n`
                    )
                )
            }
        )

        // TODO end event should be another type
        controller.enqueue(
            encoder.encode(
                `event: content\ndata: ${JSON.stringify({ content: '', done: true })}\n\n`
            )
        )
    }

    cancel(reason: any) {
        closed = true
    }
}
