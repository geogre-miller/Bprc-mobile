import { AppHeader } from '@/components/app-header';

import { HOME_REGION } from './use-dashboard-data';

/** Home's top bar: the shared brand header with the seller's own region. */
export function DashboardHeader() {
  return <AppHeader region={HOME_REGION} />;
}
