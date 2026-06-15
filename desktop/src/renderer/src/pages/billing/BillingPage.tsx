import { PageHeader } from "../../components/ui";
import { BillingPanel } from "../../components/settings/BillingPanel";

export function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Billing"
        description="Choose the plan that fits your sales workflow."
      />
      <BillingPanel />
    </div>
  );
}
