import { AppShell } from "../../components/layout/AppShell";
import { StatCard } from "../../components/dashboard/StatCard";
import { ChartCard } from "../../components/dashboard/ChartCard";
import { DataTable } from "../../components/dashboard/DataTable";
import { DonutSections } from "../../components/dashboard/DonutSections";
import {
  kpiCards,
  monthlyCalls,
  todayCalls,
  todayReminders,
} from "../../lib/mockDashboard";

export default function DasboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
          <ChartCard
            title="Total des appels"
            subtitle="Volume cumulé par mois (connectés + manqués)."
            totalLabel="Total"
            totalValue="42.4K"
            points={monthlyCalls}
          />
          <div className="grid gap-4">
            {kpiCards.slice(0, 2).map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
            <div className="grid grid-cols-2 gap-4">
              {kpiCards.slice(2).map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </div>
        </div>

        <DonutSections />

        <div className="grid gap-6 lg:grid-cols-2">
          <DataTable title="Appels du jour" rows={todayCalls} />
          <DataTable title="Rappels du jour" rows={todayReminders} />
        </div>
      </div>
    </AppShell>
  );
}

