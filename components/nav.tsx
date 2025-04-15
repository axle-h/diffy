'use client'

import {
    Box,
    Flex,
    FlexProps,
    HStack,
    IconButton,
    Text,
} from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'
import {DiffyIcon, DiffyIcon2, MoonIcon, SunIcon} from '@/components/icons'

export function MobileNav(props: FlexProps) {
    const { colorMode, toggleColorMode } = useColorMode()
    return (
        <Flex
            px={4}
            height="20"
            alignItems="center"
            bg="white"
            borderBottomWidth="1px"
            borderBottomColor="gray.200"
            justifyContent="space-between"
            _dark={{
                bg: 'gray.900',
                borderBottomColor: 'gray.700',
            }}
            {...props}
        >
            <Box />
            <Flex alignItems="center">
                <DiffyIcon size="2xl" />
                <AppName />
            </Flex>

            <HStack gap={{ base: '1', md: '3' }}>
                <IconButton
                    onClick={toggleColorMode}
                    variant="ghost"
                    aria-label="change colour mode"
                >
                    {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                </IconButton>
            </HStack>
        </Flex>
    )
}

export function AppName() {
    return (
        <Text ml={1}>
            <b>DIFFY</b>
        </Text>
    )
}
