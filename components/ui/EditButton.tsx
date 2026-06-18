
// components/ui/EditButton.tsx
'use client';

import Link from 'next/link';

interface EditButtonProps {
  href: string;
  className?: string;
}

export default function EditButton({ href, className = '' }: EditButtonProps) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition inline-block ${className}`}
    >
      ✏️ تعديل
    </Link>
  );
}
