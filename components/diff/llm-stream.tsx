'use client'

import { useState } from 'react'
import { Code, Stack } from '@chakra-ui/react'
import { LLMContentEvent } from '@/app/api/diff/llm-diff'
import { GenerateCommitDiffRequest, Schema } from '@/app/api/schema'
import { Button } from '@/components/ui/button'
import { useAppState } from '@/components/state'

export function LLMStream() {
    const { state, patchState } = useAppState()
    const [messages, setMessages] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const owner = state.user?.login || ''
    const repository = state.repository?.name || ''
    const commitReference = state.commit?.sha || ''
    const currentRequest: GenerateCommitDiffRequest = {
        owner,
        repository,
        commitReference,
    }
    const requestOk =
        Schema.GenerateCommitDiffRequest.safeParse(currentRequest).success

    async function streamResult() {
        setIsLoading(true)
        setMessages([])
        patchState({ currentRequest })

        const eventSource = new EventSource(
            `/api/diff/github/${owner}/${repository}/${commitReference}`
        )

        function close() {
            patchState({ currentRequest: undefined })
            setIsLoading(false)
            eventSource.close()
        }

        eventSource.addEventListener('content', (event) => {
            const { content, done } = JSON.parse(event.data) as LLMContentEvent
            if (content) {
                setMessages((prev) => [...prev, content])
            }
            if (done) {
                close()
            }
        })

        eventSource.onopen = () => {
            // TODO set connected
        }

        eventSource.onerror = close
        return close
    }

    return (
        <Stack gap={3}>
            <Button
                variant="outline"
                colorPalette="teal"
                loading={isLoading}
                disabled={!requestOk}
                onClick={streamResult}
            >
                Generate Diff
            </Button>

            {messages.length > 0 && (
                <Code
                    whiteSpace="pre"
                    display="block"
                    padding={2}
                    rounded="md"
                    overflow="auto"
                    bg="gray.200"
                    _dark={{ bg: 'gray.800' }}
                >
                    {messages}
                </Code>
            )}
        </Stack>
    )
}
