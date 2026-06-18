// components/ui/DeleteButton.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface DeleteButtonProps {
  onDelete: () => void | Promise<void>;
  className?: string;
}

export default function DeleteButton({ onDelete, className = '' }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
      toast.success('تم الحذف بنجاح');
      setShowConfirm(false);
    } catch (error) {
      toast.error('خطأ في الحذف');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'جاري...' : 'أكد'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          إلغاء
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition ${className}`}
    >
      🗑️ حذف
    </button>
  );
}
