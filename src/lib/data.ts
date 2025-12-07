import { SiNextdotjs, SiTypescript, SiVercel, SiTailwindcss } from "react-icons/si"
import { LucideIcon, icons } from "lucide-react"
import type { IconType } from "react-icons"

export const STACK_DATA = [
    {
        name: 'Next.js',
        icons: SiNextdotjs,
        reason: "App Router & Server Actions for full-stack type safety."
    },
    {
        name: 'Convex',
        icons: icons.Database,
        reason: "Real-time by default, TypeScript-first, serverless."
    },
    {
        name: 'Vercel',
        icons: SiVercel,
        reason: "CI/CD pipelines and Edge Network deployment."
    },
    {
        name: 'TypeScript',
        icons: SiTypescript,
        reason: "Type safe. Strict mode."
    },
    {
        name: 'Tailwind CSS',
        icons: SiTailwindcss,
        reason: "Accessible, accessible-first components with utility-first styling."
    }
]