import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { title: "Dropship", desc: "Dropshippers list products and set commission." },
  { title: "Curate", desc: "Influencers add products to their LinkCart store." },
  { title: "Earn", desc: "Customers buy, influencers earn commission, suppliers fulfill." },
];

export function Steps() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-4 sm:grid-cols-3">
        {data.map((s, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>{s.desc}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </section>
  );
}


