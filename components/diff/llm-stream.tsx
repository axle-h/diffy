'use client'

import { useEffect, useState } from 'react'
import { Code, HStack, Progress, Stack } from '@chakra-ui/react'
import { LLMEvent, LLMProgressEvent, toDiffUri, Schema } from '@/app/api/schema'
import { Button } from '@/components/ui/button'
import { toDiffRequest, useAppState } from '@/components/state'
import { toaster } from '@/components/ui/toaster'

export function LLMStream() {
    const { loading, disabled, startStream, progress, messages } =
        useLLMStream()

    return (
        <Stack gap={3}>
            <Button
                variant="outline"
                colorPalette="teal"
                loading={loading}
                disabled={disabled}
                onClick={startStream}
            >
                Generate Diff
            </Button>

            {progress !== null && (
                <Progress.Root value={progress.percentDone} mt={4}>
                    <HStack gap="5">
                        <Progress.Label>Files</Progress.Label>
                        <Progress.Track flex="1">
                            <Progress.Range />
                        </Progress.Track>
                        <Progress.ValueText>
                            {progress.processedFiles} of {progress.totalFiles}
                        </Progress.ValueText>
                    </HStack>
                </Progress.Root>
            )}

            {messages.length > 0 && (
                <Code
                    mt={4}
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

function useLLMStream() {
    const { state, patchState } = useAppState()
    const [lastRequestUri, setLastRequestUri] = useState<string | null>()
    const [messages, setMessages] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState<LLMProgressEvent | null>(null)

    const currentRequest = toDiffRequest(state)
    const requestOk =
        Schema.GenerateCommitDiffRequest.safeParse(currentRequest).success
    const requestUri = toDiffUri(currentRequest)

    useEffect(() => {
        if (lastRequestUri && lastRequestUri !== requestUri) {
            setLastRequestUri(null)
            setMessages([])
        }
    }, [requestUri, lastRequestUri, setLastRequestUri, setMessages])

    const startStream = () => {
        setIsLoading(true)
        setMessages([])
        patchState({ generating: true })
        setLastRequestUri(requestUri)
        setProgress(null)

        const eventSource = new EventSource(requestUri)

        function close() {
            patchState({ generating: false })
            setIsLoading(false)
            setProgress(null)
            eventSource.close()
        }

        eventSource.onmessage = (messageEvent) => {
            const event = JSON.parse(messageEvent.data) as LLMEvent
            switch (event.type) {
                case 'content':
                    if (event.content) {
                        setMessages((prev) => [...prev, event.content])
                    }
                    break
                case 'progress':
                    if (event.totalFiles > 10) {
                        setProgress(event)
                    }
                    break
                case 'done':
                    setMessages((msgs) => [msgs.join('').trim()])
                    close()
                    break
            }
        }

        eventSource.onerror = (event) => {
            console.error(event)
            toaster.error({
                title: 'Error',
                description: 'Something went wrong',
                duration: 3000,
            })
            close()
        }
        return () => close()
    }

    return {
        loading: isLoading,
        disabled: !requestOk,
        startStream,
        progress,
        messages,
    }
}
