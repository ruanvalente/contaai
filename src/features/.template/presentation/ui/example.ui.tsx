type ExampleUIProps = {
  label: string;
};

export function ExampleUI({ label }: ExampleUIProps) {
  return <span className="font-medium">{label}</span>;
}