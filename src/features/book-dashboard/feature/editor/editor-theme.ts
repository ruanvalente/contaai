export const editorTheme = {
  paragraph: "mb-4 leading-7 text-gray-700",
  heading: {
    h1: "text-4xl font-bold mb-6 font-display text-gray-900",
    h2: "text-3xl font-bold mb-5 font-display text-gray-900",
    h3: "text-2xl font-semibold mb-4 font-display text-gray-900",
  },
  list: {
    ul: "list-disc ml-6 mb-4 space-y-1",
    ol: "list-decimal ml-6 mb-4 space-y-1",
    listitem: "mb-1",
  },
  quote:
    "border-l-4 border-accent-500 pl-4 italic text-gray-600 my-4 bg-primary-50 py-2 pr-2 rounded-r",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-gray-100 px-1 py-0.5 rounded font-mono text-sm text-accent-600",
  },
  code: "bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto",
  link: "text-accent-500 underline hover:text-accent-600",
} as const;

export type EditorTheme = typeof editorTheme;
