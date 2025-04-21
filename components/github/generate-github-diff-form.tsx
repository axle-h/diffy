'use client'

import { Stack, useSteps } from '@chakra-ui/react'
import { SelectGithubUser } from '@/components/github/select-github-user'
import { useAppState } from '@/components/state'
import { useEffect } from 'react'
import { SelectGithubRepository } from '@/components/github/select-github-repository'
import { Steps } from '@chakra-ui/react'
import { SelectGithubCommit } from '@/components/github/select-github-commit'
import { LLMStream } from '@/components/diff/llm-stream'

export function GenerateGithubDiffForm() {
    return (
        <Stack gap={3} w="100%">
            <Stepper />
            <SelectGithubUser />
            <SelectGithubRepository />
            <SelectGithubCommit />
            <LLMStream />
        </Stack>
    )
}

function Stepper() {
    const { state } = useAppState()

    const steps = useSteps({
        defaultStep: 0,
        count: STEP_NAMES.length,
    })

    useEffect(() => {
        const currentStep = !!state.commit
            ? 3
            : !!state.repository
              ? 2
              : !!state.user
                ? 1
                : 0
        if (steps.value !== currentStep) {
            steps.setStep(currentStep)
        }
    }, [steps, state])

    return (
        <Steps.RootProvider value={steps} variant="solid" marginBottom={4}>
            <Steps.List>
                {STEP_NAMES.map((step, index) => (
                    <Steps.Item key={step} index={index} title={step}>
                        <Steps.Indicator />
                        <Steps.Title>{step}</Steps.Title>
                        <Steps.Separator />
                    </Steps.Item>
                ))}
            </Steps.List>
        </Steps.RootProvider>
    )
}

const STEP_NAMES = ['User', 'Repository', 'Commit']
