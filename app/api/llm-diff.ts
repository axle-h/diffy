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
    controller: LLMController
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
            controller.onContent(content)
        }
    }
    controller.onDone()
}

function chunk<T>(array: T[], chunkSize: number): T[][] {
    const source = [...array]
    const chunks = []
    while (source.length > 0) {
        chunks.push(source.splice(0, chunkSize))
    }
    return chunks
}

export interface LLMProgressEvent {
    totalFiles: number
    processedFiles: number
    percentDone: number
}

export interface LLMContentEvent {
    content: string
}

export class LLMController {
    private readonly encoder = new TextEncoder()
    constructor(private readonly controller: ReadableByteStreamController) {}

    onContent(content: string) {
        const data: LLMContentEvent = { content }
        this.send('content', data)
    }

    onProgress(totalFiles: number, processedFiles: number) {
        const data: LLMProgressEvent = {
            totalFiles,
            processedFiles,
            percentDone: Math.round((100 * processedFiles) / totalFiles),
        }
        this.send('progress', data)
    }

    onDone() {
        this.send('done', {})
    }

    private send(event: 'content' | 'done' | 'progress', data: any) {
        this.controller.enqueue(
            this.encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
            )
        )
    }
}

export class LLMStream implements UnderlyingByteSource {
    type: 'bytes' = 'bytes'
    private cancelled = false

    constructor(private readonly request: DiffRequest) {}

    start(controller: ReadableByteStreamController) {
        this.llmStream(new LLMController(controller))
    }

    private async llmStream(controller: LLMController) {
        const files = this.request.files.filter(
            (f) => !f.filename.endsWith('package-lock.json')
        )
        const fileDiffs = files.sort((a, b) => a.diff.length - b.diff.length)

        const chunks = [fileDiffs] // one big chunk to start
        const summaryChunks = []
        const totalFiles = fileDiffs.length
        let doneFiles = 0

        // TODO send progress
        let currentChunk = chunks.pop()
        while (!this.cancelled && currentChunk) {
            const chunkFiles = currentChunk.map((cnk) => cnk.filename).join(',')
            const chunkDiff = currentChunk.map((cnk) => cnk.diff).join('\n')
            try {
                const chunkResult = await chat(
                    SMALL_MODEL,
                    SUMMARIZE_FILE_DIFF_CONTEXT,
                    chunkDiff
                )
                summaryChunks.push(chunkFiles + ':\n' + chunkResult)
                console.debug(
                    `remaining: ${chunks.length}, done: ${summaryChunks.length}`
                )
                doneFiles += currentChunk.length
                controller.onProgress(totalFiles, doneFiles)
            } catch (e) {
                if (
                    e instanceof APIError &&
                    e.status === 400 &&
                    e.message.toLowerCase().includes('context length')
                ) {
                    if (currentChunk.length > 1) {
                        console.debug(
                            `context too long, re-chunking ${chunkFiles}`
                        )
                        // split the chunk in half and requeue it
                        const smallerChunks = chunk(
                            currentChunk,
                            Math.ceil(currentChunk.length / 2)
                        )
                        chunks.push(...smallerChunks)
                    } else {
                        console.debug(`file diff too long ${chunkFiles}`)
                        doneFiles += currentChunk.length
                        controller.onProgress(totalFiles, doneFiles)
                    }
                } else {
                    // TODO ignore file?
                    throw e
                }
            }

            currentChunk = chunks.pop()
        }

        if (this.cancelled) {
            controller.onDone()
            return
        }

        await chatStream(
            BIG_MODEL,
            GENERATE_COMMIT_FROM_SUMMARY_CONTEXT,
            summaryChunks.join('\n'),
            controller
        )
    }

    cancel(reason: any) {
        this.cancelled = true
    }
}
