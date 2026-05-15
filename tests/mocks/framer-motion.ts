import { vi } from 'vitest'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef((props: any, ref) => React.createElement('div', { ...props, ref })),
    span: React.forwardRef((props: any, ref) => React.createElement('span', { ...props, ref })),
    button: React.forwardRef((props: any, ref) => React.createElement('button', { ...props, ref })),
    section: React.forwardRef((props: any, ref) => React.createElement('section', { ...props, ref })),
    nav: React.forwardRef((props: any, ref) => React.createElement('nav', { ...props, ref })),
    ul: React.forwardRef((props: any, ref) => React.createElement('ul', { ...props, ref })),
    li: React.forwardRef((props: any, ref) => React.createElement('li', { ...props, ref })),
    p: React.forwardRef((props: any, ref) => React.createElement('p', { ...props, ref })),
    h1: React.forwardRef((props: any, ref) => React.createElement('h1', { ...props, ref })),
    h2: React.forwardRef((props: any, ref) => React.createElement('h2', { ...props, ref })),
    h3: React.forwardRef((props: any, ref) => React.createElement('h3', { ...props, ref })),
    img: React.forwardRef((props: any, ref) => React.createElement('img', { ...props, ref })),
    main: React.forwardRef((props: any, ref) => React.createElement('main', { ...props, ref })),
    article: React.forwardRef((props: any, ref) => React.createElement('article', { ...props, ref })),
    header: React.forwardRef((props: any, ref) => React.createElement('header', { ...props, ref })),
    footer: React.forwardRef((props: any, ref) => React.createElement('footer', { ...props, ref }))
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn()
  }),
  useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
  useTransform: () => ({ get: () => 0 }),
  useScroll: () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } }),
  useSpring: (value: any) => value,
  useMotionValueEvent: vi.fn(),
  domAnimation: null,
  LayoutGroup: ({ children }: any) => React.createElement(React.Fragment, null, children)
}))
