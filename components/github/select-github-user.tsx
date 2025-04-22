'use client'

import { Input, InputGroup, Spinner, Field } from '@chakra-ui/react'
import useDebounce from '@/components/debounce'
import { useEffect, useState } from 'react'
import { CheckCircleIcon } from '@/components/icons'
import { useAppState } from '@/components/state'
import { useGithubUser } from '@/components/github/hooks'

export function SelectGithubUser() {
    const { state, patchState } = useAppState()
    const [username, setUsername] = useState<string>(state.user?.login || '')
    const { data: user, isLoading } = useGithubUser(username)
    useEffect(() => {
        if (user) {
            if (!state.user || user.login !== state.user.login) {
                patchState({
                    user,
                    repository: undefined,
                    commit: undefined,
                })
            }
        } else if (state.user) {
            patchState({
                user: undefined,
                repository: undefined,
                commit: undefined,
            })
        }
    }, [state, user, patchState])

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
                    disabled={state.generating}
                    onChange={(e) => debouncedUpdate(e.target.value)}
                />
            </InputGroup>
        </Field.Root>
    )
}
