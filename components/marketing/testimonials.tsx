import { testimonials } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-4 sm:grid-cols-2">
        {testimonials.map((t, i) => (
          <Card key={i}>
            <CardContent>
              <blockquote className="text-lg">“{t.quote}”</blockquote>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t.name} — {t.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}


