'use client'

import { useState } from 'react'
import { Code, HStack, Progress, Stack } from '@chakra-ui/react'
import { LLMContentEvent, LLMProgressEvent } from '@/app/api/llm-diff'
import { GenerateCommitDiffRequest, Schema } from '@/app/api/schema'
import { Button } from '@/components/ui/button'
import { useAppState } from '@/components/state'

export function LLMStream() {
    const { state, patchState } = useAppState()
    const [messages, setMessages] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState<LLMProgressEvent | null>(null)

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
        setProgress(null)

        // TODO replace this with a POST and GET && have a retry, maybe hash based


        const eventSource = new EventSource(
            `/api/diff/github/${owner}/${repository}/${commitReference}`
        )

        function close() {
            patchState({ currentRequest: undefined })
            setIsLoading(false)
            setProgress(null)
            eventSource.close()
        }

        eventSource.addEventListener('content', (event) => {
            const { content } = JSON.parse(event.data) as LLMContentEvent
            if (content) {
                setMessages((prev) => [...prev, content])
            }
        })

        eventSource.addEventListener('progress', (event) => {
            const data = JSON.parse(event.data) as LLMProgressEvent
            if (data.totalFiles > 10) {
                setProgress(data)
            }
        })
        eventSource.addEventListener('done', () => {
            close()
            setMessages((msgs) => [msgs.join('').trim()])
        })

        eventSource.onopen = () => {
            // TODO set connected
        }

        eventSource.onerror = () => close()
        return () => close()
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

            {progress !== null && (
                <Progress.Root value={progress.percentDone}>
                    <HStack gap="5">
                        <Progress.Label>Files</Progress.Label>
                        <Progress.Track flex="1">
                            <Progress.Range />
                        </Progress.Track>
                        <Progress.ValueText>{progress.processedFiles} of {progress.totalFiles}</Progress.ValueText>
                    </HStack>
                </Progress.Root>
            )}

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
