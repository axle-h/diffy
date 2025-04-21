import OpenAI, { ClientOptions } from 'openai'
import {
    ChatRequest,
    LLMClient,
    LLMEventSubject,
    ModelOptions,
    ModelSize,
} from '@/app/api/llms'

export class OpenAILLM implements LLMClient {
    static readonly local = new OpenAILLM({
        baseURL: 'http://localhost:1234/v1',
        apiKey: 'not-used',
        models: {
            sm: 'qwen2.5-7b-instruct-1m',
            lg: 'gemma-3-27b-it',
        },
    })

    private readonly client: OpenAI
    private readonly models: ModelOptions

    constructor({
        models,
        ...options
    }: ClientOptions & { models: ModelOptions }) {
        this.client = new OpenAI(options)
        this.models = models
    }

    async chat(request: ChatRequest): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: this.model(request.model),
            messages: [
                { role: 'system', content: request.context },
                { role: 'user', content: request.prompt },
            ],
        })

        return response.choices[0]?.message?.content || ''
    }

    async chatAsync(
        request: ChatRequest,
        subject: LLMEventSubject
    ): Promise<void> {
        const stream = await this.client.chat.completions.create({
            model: this.model(request.model),
            messages: [
                { role: 'system', content: request.context },
                { role: 'user', content: request.prompt },
            ],
            stream: true,
        })

        for await (const part of stream) {
            const content = part.choices[0]?.delta?.content || ''
            if (content) {
                subject.onEvent({ type: 'content', content })
            }
        }
        subject.onEvent({ type: 'done' })
    }

    private model(size: ModelSize): string {
        return this.models[size]
    }
}
