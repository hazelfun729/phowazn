'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

interface UploadStats {
  deceased: number;
  infants: number;
  animals: number;
  updatedAt: string;
}

export default function AdminPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchCurrentData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data.updatedAt) {
          setStats({
            deceased: data.deceased?.length ?? 0,
            infants: data.infants?.length ?? 0,
            animals: data.animals?.length ?? 0,
            updatedAt: data.updatedAt,
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCurrentData();
  }, [fetchCurrentData]);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv')) {
        setMessage({ type: 'error', text: '仅支持CSV格式文件' });
        return;
      }

      setUploading(true);
      setMessage(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await res.json();

        if (res.ok && result.success) {
          setMessage({ type: 'success', text: result.message });
          setStats(result.stats);
        } else {
          setMessage({
            type: 'error',
            text: result.error || '上传失败',
          });
        }
      } catch {
        setMessage({ type: 'error', text: '网络错误，请重试' });
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(true);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <h1 className="section-title mb-4 text-center font-serif text-2xl font-semibold tracking-[0.15em] text-[#2c2c2c]">
          数据管理
        </h1>
        <p className="mb-10 text-center font-serif text-sm text-[#6b6560]">
          上传CSV数据文件，系统将自动解析并更新页面数据
        </p>

        {/* 上传区域 */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`rounded-sm border-2 border-dashed p-10 text-center transition-colors ${
            dragOver
              ? 'border-[#8b6914] bg-[#f5f2ed]'
              : 'border-[#e8e4df] hover:border-[#d4cfc8]'
          }`}
        >
          <div className="mb-4 text-[#6b6560]">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="mb-2 font-serif text-sm text-[#6b6560]">
            {uploading ? '正在上传...' : '拖拽CSV文件到此处，或点击选择文件'}
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="inline-block cursor-pointer border border-[#2c2c2c] px-6 py-2 font-serif text-sm tracking-wide text-[#2c2c2c] transition-colors hover:bg-[#2c2c2c] hover:text-[#faf8f5]"
          >
            {uploading ? '上传中...' : '选择文件'}
          </label>
        </div>

        {/* 消息提示 */}
        {message && (
          <div
            className={`mt-6 p-4 text-center font-serif text-sm ${
              message.type === 'success'
                ? 'bg-[#f0f5e8] text-[#4a6b2a]'
                : 'bg-[#f5e8e8] text-[#8b3a3a]'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 当前数据统计 */}
        {stats && (
          <div className="mt-10 border border-[#e8e4df] p-6">
            <h3 className="mb-4 text-center font-serif text-sm tracking-widest text-[#6b6560]">
              当前数据概况
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-serif text-2xl text-[#2c2c2c]">
                  {stats.deceased}
                </p>
                <p className="mt-1 font-serif text-xs text-[#6b6560]">
                  亡者
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl text-[#2c2c2c]">
                  {stats.infants}
                </p>
                <p className="mt-1 font-serif text-xs text-[#6b6560]">
                  堕胎婴灵
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl text-[#2c2c2c]">
                  {stats.animals}
                </p>
                <p className="mt-1 font-serif text-xs text-[#6b6560]">
                  旁生
                </p>
              </div>
            </div>
            <p className="mt-4 text-center font-serif text-xs text-[#a09a94]">
              最后更新：{formatTime(stats.updatedAt)}
            </p>
          </div>
        )}

        {/* 返回链接 */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="font-serif text-sm text-[#6b6560] underline decoration-[#e8e4df] underline-offset-4 transition-colors hover:text-[#2c2c2c]"
          >
            返回前台页面
          </Link>
        </div>
      </div>
    </div>
  );
}
