interface Props {
  title: string;
  description: string;
}

export default function FeatureCard({ title, description }: Props) {
  return (
    <div className="card text-left">
      <h3 className="text-xl font-semibold mb-3 text-blue-600">
        {title}
      </h3>
      <p className="text-slate-600">
        {description}
      </p>
    </div>
  );
}