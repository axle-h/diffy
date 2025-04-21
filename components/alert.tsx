'use client'

import {
    Alert,
    Box,
    Center,
    Spinner,
} from '@chakra-ui/react'
import React, { useEffect } from 'react'

type AlertProps = Alert.RootProps

function LeftAccentAlert(props: AlertProps) {
    return (
        <Alert.Root
            {...props}
            variant="subtle"
            borderStartWidth="3px"
            borderStartColor="colorPalette.600"
        />
    )
}

export function ErrorAlert({
    error,
    title = 'Something went wrong',
    ...props
}: AlertProps & { error: any; title?: string }) {
    useEffect(() => console.log(error), [error])
    return (
        <LeftAccentAlert {...props} status="error">
            <Alert.Indicator />
            <Box>
                <Alert.Title>{title}</Alert.Title>
                <Alert.Description>{error.toString()}</Alert.Description>
            </Box>
        </LeftAccentAlert>
    )
}

export function Loading() {
    return (
        <Center py={4}>
            <Spinner />
        </Center>
    )
}
