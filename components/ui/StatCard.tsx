
// components/ui/StatCard.tsx
'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-fekrti-navy">{value}</h3>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      {trend && <p className="text-sm text-green-600 font-semibold">{trend}</p>}
    </div>
  );
}
