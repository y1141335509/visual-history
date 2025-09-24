'use client';

import { useState } from 'react';
import SearchInput from '@/components/SearchInput';
import Timeline from '@/components/Timeline';
import EventModal from '@/components/EventModal';
import { HistoryEvent, TimelineData } from '@/types/timeline';

export default function Home() {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = async (keyword: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTimelineData(data);
    } catch (error) {
      console.error('Error generating timeline:', error);
      setError('生成时间轴失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: HistoryEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            历史时间轴
          </h1>
          <p className="text-gray-600 text-center">
            AI驱动的交互式历史可视化工具
          </p>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 搜索区域 */}
        <div className="mb-8">
          <SearchInput onSearch={handleSearch} loading={loading} />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Loading 状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">正在生成历史时间轴...</p>
          </div>
        )}

        {/* 时间轴区域 */}
        {timelineData && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {timelineData.keyword} - 历史时间轴
              </h2>
              <p className="text-gray-600 text-sm">
                共 {timelineData.events.length} 个重要历史事件
              </p>
            </div>
            <Timeline
              events={timelineData.events}
              onEventClick={handleEventClick}
            />
          </div>
        )}

        {/* 首次访问提示 */}
        {!timelineData && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              欢迎使用历史时间轴工具
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              输入任何历史主题，AI将为您生成精美的交互式时间轴，帮助您更好地理解历史脉络。
            </p>
          </div>
        )}
      </main>

      {/* 事件详情模态框 */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* 底部 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>由 Claude AI 驱动 · 让历史更生动</p>
        </div>
      </footer>
    </div>
  );
}
