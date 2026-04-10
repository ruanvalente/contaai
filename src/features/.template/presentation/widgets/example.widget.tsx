"use client";

type ExampleWidgetProps = {
  title: string;
};

export function ExampleWidget({ title }: ExampleWidgetProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
}