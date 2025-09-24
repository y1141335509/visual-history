'use client';

import { HistoryEvent } from '@/types/timeline';

interface EventModalProps {
  event: HistoryEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!isOpen || !event) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {event.title}
              </h2>
              <p className="text-lg text-blue-600 font-medium">
                {event.date}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              aria-label="关闭"
            >
              ×
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">事件概述</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              {event.description}
            </p>

            {event.content && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">详细信息</h3>
                <div className="text-gray-700 leading-relaxed">
                  {event.content}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 底部 */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}