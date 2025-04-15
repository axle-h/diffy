'use client'

import { Input, InputGroup, Spinner, Field } from '@chakra-ui/react'
import useDebounce from '@/components/debounce'
import { useGithubUser } from '@/components/github/client'
import { useEffect, useState } from 'react'
import { CheckCircleIcon } from '@/components/icons'
import { useAppState } from '@/components/state'

export function SelectGithubUser() {
    const { state, patchState } = useAppState()
    const [username, setUsername] = useState<string>(state.user?.login || '')
    const { data: user, isLoading } = useGithubUser(username)
    useEffect(() => {
        if (user) {
            patchState({ user })
        } else {
            patchState({
                user: undefined,
                repository: undefined,
                commit: undefined,
            })
        }
    }, [user, patchState])

    const debouncedUpdate = useDebounce(setUsername, 1000)

    const icon = isLoading ? (
        <Spinner />
    ) : !!user ? (
        <CheckCircleIcon color="green" />
    ) : null

    return (
        <Field.Root>
            <InputGroup endElement={icon}>
                <Input
                    placeholder="Github user"
                    variant="outline"
                    onChange={(e) => debouncedUpdate(e.target.value)}
                />
            </InputGroup>
        </Field.Root>
    )
}
