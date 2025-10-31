// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return "";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock useAnimatedNumber hook
jest.mock("@/hooks/useAnimatedNumber", () => ({
  useAnimatedNumber: (value: number) => value,
}));

// Mock framer-motion
jest.mock("framer-motion", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");

  interface MotionProps {
    children?: React.ReactNode;
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    transition?: unknown;
    whileHover?: unknown;
    whileTap?: unknown;
    variants?: unknown;
    [key: string]: unknown;
  }

  const createMotionComponent = (Component: string) => {
    // eslint-disable-next-line react/display-name, @typescript-eslint/no-explicit-any
    return React.forwardRef((props: MotionProps, ref: any) => {
      // Destructure motion-specific props to exclude them from HTML props
      const {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        whileHover: _whileHover,
        whileTap: _whileTap,
        variants: _variants,
        ...htmlProps
      } = props;
      return React.createElement(
        Component,
        { ...htmlProps, ref },
        props.children,
      );
    });
  };

  return {
    motion: {
      div: createMotionComponent("div"),
      section: createMotionComponent("section"),
      span: createMotionComponent("span"),
      button: createMotionComponent("button"),
      li: createMotionComponent("li"),
      h1: createMotionComponent("h1"),
      h2: createMotionComponent("h2"),
      h3: createMotionComponent("h3"),
      p: createMotionComponent("p"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    animate: jest.fn(
      (
        _from: number,
        to: number,
        options: { onUpdate?: (value: number) => void },
      ) => {
        // For tests, immediately call onUpdate with the final value
        // Use setTimeout to ensure React has time to process the update
        if (options.onUpdate) {
          // Call with initial value first
          options.onUpdate(_from);
          // Then immediately with final value
          setTimeout(() => options.onUpdate && options.onUpdate(to), 0);
        }
        return {
          stop: jest.fn(),
        };
      },
    ),
  };
});
