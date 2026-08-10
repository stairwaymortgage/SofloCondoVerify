import { jsonLdHtml } from "@/lib/schema";

/** Emits one application/ld+json block for the schemas it is handed. */
export default function JsonLd({ schemas }: { schemas: Record<string, unknown>[] }) {
  if (schemas.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(schemas) }}
    />
  );
}
