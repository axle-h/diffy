import { APIError } from 'openai'
import { DiffRequest, LLMEvent } from '@/app/api/schema'
import { clearInterval } from 'node:timers'
import { OpenAILLM } from '@/app/api/openai'

const GENERATE_COMMIT_BODY = `
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

const GENERATE_COMMIT_FROM_SUMMARY_CONTEXT =
    'You will receive a list of summarised file changes that you will summarize into a very short commit message.' +
    GENERATE_COMMIT_BODY

const GENERATE_COMMIT_FROM_DIFF_CONTEXT =
    'You will receive set of titled git patches that you will summarize into a very short commit message.' +
    GENERATE_COMMIT_BODY

const SUMMARIZE_FILE_DIFF_CONTEXT = `
You will receive a git patch that you will summarize to be more concise:
* List changes as concise bullet points
* Do not try to reason why a change has been made, just summarize to be more concise
* The response should be shorter than the input
* Do not list anything that has no functional change for example renaming a variable
* Do not mention formatting changes like adding a semi colon or changing whitespace
`

export interface ModelOptions {
    sm: string
    lg: string
}

export type ModelSize = keyof ModelOptions

export interface ChatRequest {
    model: ModelSize
    context: string
    prompt: string
}

export interface LLMClient {
    chat(request: ChatRequest): Promise<string>
    chatAsync(request: ChatRequest, subject: LLMEventSubject): Promise<void>
}

function chunk<T>(array: T[], chunkSize: number): T[][] {
    const source = [...array]
    const chunks = []
    while (source.length > 0) {
        chunks.push(source.splice(0, chunkSize))
    }
    return chunks
}

export class LLMEventSubject {
    private readonly encoder = new TextEncoder()
    private readonly replayCache: LLMEvent[] = []
    private readonly controllers: ReadableByteStreamController[] = []
    private started = false
    created = new Date().getTime()

    toReadableStream() {
        return new ReadableStream(new LLMEventByteSource(this))
    }

    addController(controller: ReadableByteStreamController): void {
        for (let event of this.replayCache) {
            const payload = this.toPayload(event)
            controller.enqueue(payload)
        }
        this.controllers.push(controller)
        this.started = true
    }

    removeController(controller: ReadableByteStreamController): void {
        const index = this.controllers.indexOf(controller)
        if (index >= 0) {
            this.controllers.splice(index, 1)
        }
    }

    get isRunning() {
        return !this.started || this.controllers.length > 0
    }

    onEvent(event: LLMEvent) {
        this.replayCache.push(event)
        this.enqueue(event)
    }

    private enqueue(event: LLMEvent) {
        const payload = this.toPayload(event)
        for (let controller of this.controllers) {
            try {
                controller.enqueue(payload)
            } catch (e) {}
        }
    }

    private toPayload(event: LLMEvent) {
        return this.encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
    }
}

class LLMEventByteSource implements UnderlyingByteSource {
    type: 'bytes' = 'bytes'
    private stream: ReadableByteStreamController | null = null

    constructor(private readonly controller: LLMEventSubject) {}

    start(controller: ReadableByteStreamController) {
        this.stream = controller
        this.controller.addController(controller)
    }

    cancel(reason: any) {
        if (this.stream) {
            this.controller.removeController(this.stream)
            this.stream = null
        }
    }
}

export class LLMDiffs {
    static readonly instance = new LLMDiffs(OpenAILLM.local, 'summary-first')

    constructor(
        private readonly client: LLMClient,
        private readonly mode:
            | 'single-shot-sm'
            | 'single-shot-lg'
            | 'summary-first'
    ) {}

    private readonly subjects: Record<string, LLMEventSubject> = {}

    private readonly cleanUp = setInterval(() => {
        const epoch = new Date().getTime() + 3600000
        for (let id in this.subjects) {
            if (this.subjects[id].created > epoch) {
                delete this.subjects[id]
            }
        }
    }, 60000)

    add(request: DiffRequest): LLMEventSubject {
        if (request.id in this.subjects) {
            return this.subjects[request.id]
        }
        const subject = new LLMEventSubject()
        this.subjects[request.id] = subject

        switch (this.mode) {
            case 'single-shot-sm':
                this.newSingleShotDiff(request, subject, 'sm')
                break
            case 'single-shot-lg':
                this.newSingleShotDiff(request, subject, 'lg')
                break
            case 'summary-first':
                this.newSummaryFirstDiff(request, subject)
                break
        }
        return subject
    }

    close() {
        clearInterval(this.cleanUp)
    }

    private files(request: DiffRequest) {
        return request.files.filter(
            (f) => !f.filename.endsWith('package-lock.json')
        )
    }

    private async newSingleShotDiff(
        request: DiffRequest,
        subject: LLMEventSubject,
        model: ModelSize
    ) {
        const diff = this.files(request)
            .map(({ filename, diff }) => `# ${filename}\n${diff}`)
            .join('\n\n')

        await this.client.chatAsync(
            {
                model,
                context: GENERATE_COMMIT_FROM_DIFF_CONTEXT,
                prompt: diff,
            },
            subject
        )
    }

    private async newSummaryFirstDiff(
        request: DiffRequest,
        subject: LLMEventSubject
    ) {
        const files = this.files(request)
        const fileDiffs = files.sort((a, b) => a.diff.length - b.diff.length)

        const chunks = [fileDiffs] // one big chunk to start
        const summaryChunks = []
        const totalFiles = fileDiffs.length
        let processedFiles = 0

        let currentChunk = chunks.pop()
        while (subject.isRunning && currentChunk) {
            const chunkFiles = currentChunk.map((cnk) => cnk.filename).join(',')
            const chunkDiff = currentChunk.map((cnk) => cnk.diff).join('\n')
            try {
                const chunkResult = await this.client.chat({
                    model: 'sm',
                    context: SUMMARIZE_FILE_DIFF_CONTEXT,
                    prompt: chunkDiff,
                })
                summaryChunks.push(chunkFiles + ':\n' + chunkResult)
                console.debug(
                    `remaining: ${chunks.length}, done: ${summaryChunks.length}`
                )
                processedFiles += currentChunk.length
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
                        processedFiles += currentChunk.length
                    }
                } else {
                    // TODO ignore file?
                    throw e
                }
            }

            subject.onEvent({
                type: 'progress',
                totalFiles,
                processedFiles,
                percentDone: Math.round((100 * processedFiles) / totalFiles),
            })

            currentChunk = chunks.pop()
        }

        if (!subject.isRunning) {
            return
        }

        await this.client.chatAsync(
            {
                model: 'lg',
                context: GENERATE_COMMIT_FROM_SUMMARY_CONTEXT,
                prompt: summaryChunks.join('\n'),
            },
            subject
        )
    }
}
