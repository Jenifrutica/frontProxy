interface SectionHeadProps {
  id?: string;
  index: string;
  title: string;
  hint?: string;
  meta?: string;
}

export function SectionHead({ id, index, title, hint, meta }: SectionHeadProps) {
  return (
    <div id={id} className="section-head">
      <span className="section-head__index">{index}</span>
      <div className="section-head__text">
        <h2 className="section-head__title">{title}</h2>
        {hint && <p className="section-head__hint">{hint}</p>}
      </div>
      <span className="section-head__line" />
      {meta && <span className="section-head__meta">{meta}</span>}
    </div>
  );
}
