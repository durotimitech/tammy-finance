// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { initial, animate, exit, transition, ...divProps } = props
      return <div {...divProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))