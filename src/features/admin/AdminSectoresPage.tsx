import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { IndustryProfiles } from './components/IndustryProfiles';

export function AdminSectoresPage() {
  return (
    <AppShell wide>
      <div className="w-full mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
        <PageHeader
          title="Sectores Productivos"
          description="Perfiles de industria que usa el clasificador automático para identificar el rubro de cada empresa."
        />
        <div className="mt-8">
          <IndustryProfiles />
        </div>
      </div>
    </AppShell>
  );
}
