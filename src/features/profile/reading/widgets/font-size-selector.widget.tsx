"use client";

const FONT_SIZES = [
  { value: 14, label: "14px" },
  { value: 16, label: "16px" },
  { value: 18, label: "18px" },
  { value: 20, label: "20px" },
];

type FontSizeSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

export function FontSizeSelector({ value, onChange }: FontSizeSelectorProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">Tamanho da fonte</p>
        <p className="text-sm text-gray-500">Ajuste o tamanho do texto</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-4 py-2 border border-primary-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
      >
        {FONT_SIZES.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
    </div>
  );
}
