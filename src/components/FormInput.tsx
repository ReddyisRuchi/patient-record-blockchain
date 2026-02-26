export default function FormInput(props: any) {
  const { label, name, type = 'text', placeholder } = props;
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-sm text-white/80">{label}</span>}
      <input name={name} type={type} placeholder={placeholder} className="p-3 rounded bg-white/10" />
    </label>
  );
}
