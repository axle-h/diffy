import { Container, Flex, Heading } from '@chakra-ui/react'
import { GenerateGithubDiffForm } from '@/components/github/generate-github-diff-form'
import { MobileNav } from '@/components/nav'

export default function Home() {
    return (
        <Flex h="100dvh" flexDirection="column">
            <MobileNav />

            <Flex alignItems="center" justifyContent="center" flexGrow={1}>
                <Container maxW="800px" p={4}>
                    <Flex
                        alignItems="center"
                        flexDirection="column"
                        bg="white"
                        _dark={{
                            bg: 'gray.900',
                        }}
                        p={12}
                        px={8}
                        borderRadius={8}
                        boxShadow="lg"
                    >
                        <GenerateGithubDiffForm />
                    </Flex>
                </Container>
            </Flex>
        </Flex>
    )
}
