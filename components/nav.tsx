'use client'

import { Flex, FlexProps, HStack, IconButton, Text } from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'
import { DiffyIcon, GithubIcon, MoonIcon, SunIcon } from '@/components/icons'

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
            _dark={{
                bg: 'gray.900',
                borderBottomColor: 'gray.700',
            }}
            {...props}
        >
            <Flex flex={1} />

            <Flex alignItems="center">
                <AppName />
            </Flex>

            <Flex flex={1} justifyContent="end">
                <HStack>
                    <IconButton variant="ghost" asChild>
                        <a
                            href="https://github.com/axle-h/diffy"
                            target="_blank"
                        >
                            <GithubIcon />
                        </a>
                    </IconButton>
                    <IconButton onClick={toggleColorMode} variant="ghost">
                        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                    </IconButton>
                </HStack>
            </Flex>
        </Flex>
    )
}

export function AppName() {
    return (
        <>
            <DiffyIcon size="2xl" />
            <Text ml={-1}>
                <b>iffy</b>
            </Text>
        </>
    )
}
