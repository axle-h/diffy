import {FiCheckCircle, FiGitBranch, FiGitCommit, FiGitMerge, FiMoon, FiSun, FiUser} from 'react-icons/fi'
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
export const GitBranchIcon = toChakraIcon(FiGitBranch)
export const GitCommitIcon = toChakraIcon(FiGitCommit)
export const UserIcon = toChakraIcon(FiUser)

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


export function DiffyIcon2(props: IconProps) {
    return (
        <Icon {...props}>
            <svg
                width="82.628273"
                height="42.714203"
                viewBox="0 0 82.628273 42.714202"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-git-branch"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg">
                <defs
                    id="defs2"/>
                <line
                    x1="4"
                    y1="16.805809"
                    x2="4"
                    y2="25.73473"
                    id="line1"
                    style={{ strokeWidth: 1.7252 }}/>
                <circle
                    cx="16"
                    cy="16.571918"
                    r="3"
                    id="circle1"/>
                <circle
                    cx="4.1356688"
                    cy="4"
                    r="3"
                    id="circle1-5"/>
                <circle
                    cx="4"
                    cy="28.571915"
                    r="3"
                    id="circle2"/>
                <path
                    d="m 16,19.571917 a 9,9 0 0 1 -9,9"
                    id="path2"/>
                <path
                    d="m 16.122761,12.783456 a 9,9 0 0 0 -9,-9.0000008"
                    id="path2-6"/>
                <line
                    x1="47.769356"
                    y1="15.970687"
                    x2="41.052311"
                    y2="15.970687"
                    id="line1-5-2"
                    style={{ strokeWidth: 1.7252 }}/>
                <circle
                    cx="38.367104"
                    cy="16.137638"
                    r="3"
                    id="circle1-5-2"/>
                <path
                    d="m 38.112363,12.296753 a 9,9 0 0 1 9,-9.0000006"
                    id="path2-7"/>
                <line
                    x1="51.97456"
                    y1="19.089897"
                    x2="51.97456"
                    y2="29.712379"
                    id="line1-5-3"
                    style={{ strokeWidth: 1.7252 }}/>
                <line
                    x1="38.249447"
                    y1="19.368608"
                    x2="38.249447"
                    y2="29.991091"
                    id="line1-5-3-1"
                    style={{ strokeWidth: 1.7252 }}/>
                <circle
                    cx="26.998224"
                    cy="16.274343"
                    r="3"
                    id="circle1-5-2-5"/>
                <line
                    x1="26.880568"
                    y1="19.505314"
                    x2="26.880568"
                    y2="30.127798"
                    id="line1-5-3-1-6"
                    style={{ strokeWidth: 1.7252 }}/>
                <line
                    x1="61.415012"
                    y1="15.739556"
                    x2="54.697968"
                    y2="15.739556"
                    id="line1-5-2-1"
                    style={{ strokeWidth: 1.7252 }}/>
                <circle
                    cx="52.01276"
                    cy="15.830474"
                    r="3"
                    id="circle1-5-2-4"/>
                <path
                    d="m 51.758018,11.989588 a 9,9 0 0 1 9,-8.9999999"
                    id="path2-7-8"/>
                <line
                    x1="78.646507"
                    y1="13.605822"
                    x2="78.646507"
                    y2="24.850212"
                    id="line1-5-3-2"
                    style={{ strokeWidth: 1.7252 }}/>
                <circle
                    cx="65.4366"
                    cy="15.74673"
                    r="3"
                    id="circle1-5-2-4-5"/>
                <circle
                    cx="78.628273"
                    cy="28.366562"
                    r="3"
                    id="circle2-7-5-3"/>
                <path
                    d="m 74.257892,28.785342 a 9,9 0 0 1 -9.000001,-9"
                    id="path2-7-8-8"/>
                <path
                    d="m 78.81325,32.7142 a 9,9 0 0 1 -9,9.000001"
                    id="path2-7-8-8-5"/>
            </svg>

        </Icon>
    )
}