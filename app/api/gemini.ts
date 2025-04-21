import { GoogleGenAI, GoogleGenAIOptions } from '@google/genai'
import {
    ChatRequest,
    LLMClient,
    LLMEventSubject,
    ModelOptions,
    ModelSize,
} from '@/app/api/llms'

export class GeminiLLM implements LLMClient {
    private readonly client: GoogleGenAI
    private readonly models: Record<ModelSize, string>

    static fromEnv(): GeminiLLM {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            throw new Error('No Gemini API key provided')
        }
        return new GeminiLLM({
            apiKey,
            models: {
                sm: 'gemini-2.0-flash-lite',
                lg: 'gemini-2.0-flash',
            },
        })
    }

    constructor({
        models,
        ...options
    }: GoogleGenAIOptions & { models: ModelOptions }) {
        this.client = new GoogleGenAI(options)
        this.models = models
    }

    async chat(request: ChatRequest): Promise<string> {
        const response = await this.client.models.generateContent({
            model: this.models[request.model],
            contents: request.prompt,
            config: {
                systemInstruction: request.context,
            },
        })
        return response.text || ''
    }

    async chatAsync(
        request: ChatRequest,
        subject: LLMEventSubject
    ): Promise<void> {
        const response = await this.client.models.generateContentStream({
            model: this.models[request.model],
            contents: request.prompt,
            config: {
                systemInstruction: request.context,
            },
        })

        for await (const chunk of response) {
            if (chunk.text) {
                subject.onEvent({
                    type: 'content',
                    content: chunk.text,
                })
            }
        }

        subject.onEvent({ type: 'done' })
    }
}
