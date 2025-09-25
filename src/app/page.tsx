'use client';

import { useState } from 'react';
import SearchInput from '@/components/SearchInput';
import Timeline from '@/components/Timeline';
import TimelineJS from '@/components/TimelineJS';
import EventModal from '@/components/EventModal';
import { HistoryEvent, TimelineData } from '@/types/timeline';

export default function Home() {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timelineType, setTimelineType] = useState<'vis' | 'timelinejs'>('timelinejs');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              历史时间轴
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              AI 驱动的交互式历史可视化工具，让历史生动起来
            </p>
            <div className="flex items-center justify-center mt-4 space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>智能生成</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>交互可视化</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>详实内容</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 搜索区域 */}
        <div className="mb-8">
          <SearchInput onSearch={handleSearch} loading={loading} />
        </div>

        {/* 模版选择 */}
        {timelineData && !loading && (
          <div className="mb-6 flex justify-center">
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setTimelineType('timelinejs')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timelineType === 'timelinejs'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                📚 历史叙事模版
              </button>
              <button
                onClick={() => setTimelineType('vis')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timelineType === 'vis'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                📊 交互数据模版
              </button>
            </div>
          </div>
        )}

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
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                      📖
                    </span>
                    {timelineData.keyword} - 历史时间轴
                  </h2>
                  <p className="text-gray-600 ml-11">
                    共 {timelineData.events.length} 个重要历史事件 • 点击事件查看详情
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                    <span>政治事件</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                    <span>社会变迁</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full"></div>
                    <span>文化发展</span>
                  </div>
                </div>
              </div>
            </div>
            {timelineType === 'timelinejs' ? (
              <TimelineJS
                events={timelineData.events}
                onEventClick={handleEventClick}
              />
            ) : (
              <Timeline
                events={timelineData.events}
                onEventClick={handleEventClick}
              />
            )}
          </div>
        )}

        {/* 首次访问提示 */}
        {!timelineData && !loading && !error && (
          <div className="text-center py-16">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-8">
                <span className="text-4xl">🚀</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                开启您的历史探索之旅
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                输入任何历史主题，AI 将为您生成详实的交互式时间轴，
                <br className="hidden md:block" />
                提供历史叙事与数据可视化两种展示模式。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xl mb-4 mx-auto">
                    📚
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">历史叙事模版</h3>
                  <p className="text-sm text-gray-600">专为历史内容设计，精美的视觉叙述体验</p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xl mb-4 mx-auto">
                    📊
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">交互数据模版</h3>
                  <p className="text-sm text-gray-600">强大的交互功能，缩放拖拽探索时间轴</p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xl mb-4 mx-auto">
                    🤖
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI 智能生成</h3>
                  <p className="text-sm text-gray-600">基于 Claude，生成详实的历史内容和分析</p>
                </div>
              </div>
            </div>
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
