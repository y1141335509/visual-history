'use client';

import { useState } from 'react';

interface SearchInputProps {
  onSearch: (keyword: string) => void;
  loading: boolean;
}

export default function SearchInput({ onSearch, loading }: SearchInputProps) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim() && !loading) {
      onSearch(keyword.trim());
    }
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const exampleKeywords = [
    '唐朝兴衰', '丝绸之路', '明朝郑和下西洋', '二战太平洋战争', '工业革命'
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="输入历史主题，如'唐朝兴衰'、'丝绸之路'等..."
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!keyword.trim() || loading}
            className="absolute right-2 top-2 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '生成中...' : '生成时间轴'}
          </button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-gray-600 mb-3">推荐主题：</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {exampleKeywords.map((example, index) => (
            <button
              key={index}
              onClick={() => setKeyword(example)}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}