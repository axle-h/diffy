import { typeToFlattenedError, ZodError } from 'zod'
import { NextResponse } from 'next/server'

export interface UnknownServerError {
    message: string
    name: string
}

export type ServerError<T> = UnknownServerError | typeToFlattenedError<T>

export type OkOrErrorResponse<T, E = T> = NextResponse<T | ServerError<E>>

export function handleServerError<T>(e: any): NextResponse<ServerError<T>> {
    console.error(e)

    if (!(e instanceof Error)) {
        return NextResponse.json(
            { message: e?.toString() ?? 'Unknown error', name: 'unknown' },
            { status: 500 }
        )
    }

    if (e instanceof ZodError) {
        return NextResponse.json(e.flatten(), { status: 400 })
    }

    return NextResponse.json(
        { message: e.message.trim(), name: e.name },
        { status: 500 }
    )
}

export function notFound(entity: string): NextResponse<UnknownServerError> {
    return NextResponse.json(
        {
            message: `${entity} does not exist`,
            name: 'NotFound',
        },
        { status: 404 }
    )
}

export class ClientError extends Error {
    constructor(
        actionName: string,
        readonly status: number,
        readonly statusText: string,
        readonly body: string
    ) {
        super(`could not ${actionName} ${status} ${statusText}: ${body}`)
    }
}

export async function assertOk(response: Response, name: string) {
    if (!response.ok) {
        throw new ClientError(
            name,
            response.status,
            response.statusText,
            await response.text()
        )
    }
}
