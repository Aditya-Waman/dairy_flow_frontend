import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Placeholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="grid place-items-center py-10">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description ?? "This page is scaffolded. Continue prompting to flesh out the full functionality when ready."}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="#" onClick={(e)=>{e.preventDefault(); window.print();}}>Export PDF</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
