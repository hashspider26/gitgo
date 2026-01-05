import { faqs } from "@/lib/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FAQs() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((f, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-base">{f.q}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">{f.a}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}


