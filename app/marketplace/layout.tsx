// app/marketplace/layout.tsx

import Providers from '@/components/dashboard/Providers';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
