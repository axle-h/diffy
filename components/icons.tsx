import { FiCheckCircle, FiGithub, FiMoon, FiSun } from 'react-icons/fi'
import { Icon, IconProps } from '@chakra-ui/react'
import { IconType } from 'react-icons'
import React from 'react'

function toChakraIcon(IconType: IconType) {
    return function ChakraIcon(props: IconProps) {
        return (
            <Icon {...props}>
                <IconType />
            </Icon>
        )
    }
}
export const CheckCircleIcon = toChakraIcon(FiCheckCircle)
export const SunIcon = toChakraIcon(FiSun)
export const MoonIcon = toChakraIcon(FiMoon)
export const GithubIcon = toChakraIcon(FiGithub)

export function DiffyIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <svg
                width="20"
                height="32.571915"
                viewBox="0 0 20 32.571914"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                version="1.1"
                id="svg2"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs id="defs2" />
                <line
                    x1="4"
                    y1="16.805809"
                    x2="4"
                    y2="25.73473"
                    id="line1"
                    style={{ strokeWidth: 1.7252 }}
                />
                <line
                    x1="3.9884391"
                    y1="7.8528247"
                    x2="3.9884391"
                    y2="16.781746"
                    id="line1-8"
                    style={{ strokeWidth: 1.7252 }}
                />
                <circle cx="16" cy="16.571918" r="3" id="circle1" />
                <circle cx="4.1356688" cy="4" r="3" id="circle1-5" />
                <circle cx="4" cy="28.571915" r="3" id="circle2" />
                <path d="m 16,19.571917 a 9,9 0 0 1 -9,9" id="path2" />
                <path
                    d="m 16.122761,12.783456 a 9,9 0 0 0 -9,-9.0000008"
                    id="path2-6"
                />
            </svg>
        </Icon>
    )
}
