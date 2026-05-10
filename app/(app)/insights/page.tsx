import { PageHeader } from "@/components/layout/page-header";
import { InsightsClient } from "./insights-client";

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Insights"
        description="On-demand narrative brief — what improved, what worsened, what to investigate."
      />
      <InsightsClient />
    </div>
  );
}
