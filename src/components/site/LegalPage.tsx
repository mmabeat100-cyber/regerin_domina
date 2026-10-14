import { PageHeader } from "./Breadcrumbs";

export function LegalPage({ eyebrow, title, sections }: { eyebrow: string; title: string; sections: { h: string; p: string }[] }) {
  return (
    <div className="container-site max-w-3xl">
      <PageHeader eyebrow={eyebrow} title={title} />
      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-2xl">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export const legalMeta = (title: string, description: string) => ({
  meta: [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ],
});
