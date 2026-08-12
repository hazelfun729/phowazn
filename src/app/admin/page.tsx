'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';

interface Record {
  id: number;
  name: string;
  category: string;
  death_date: string;
  created_at: string;
}

interface UploadLog {
  id: number;
  uploaded_at: string;
  ip_address: string;
  user_agent: string;
  file_name: string;
  record_count: number;
  source: string;
}

export default function AdminPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // 获取所有记录
  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records/all');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('获取记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取上传日志
  const fetchUploadLogs = async () => {
    try {
      const res = await fetch('/api/upload-logs');
      const data = await res.json();
      if (data.success) {
        setUploadLogs(data.data);
      }
    } catch (error) {
      console.error('获取上传日志失败:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchUploadLogs();
  }, []);

  // 文件上传处理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadResult({ success: false, message: '仅支持 CSV 格式文件' });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUploadResult({ success: true, message: data.message });
        await fetchRecords(); // 刷新列表
      } else {
        setUploadResult({ success: false, message: data.error });
      }
    } catch (error) {
      setUploadResult({ success: false, message: '上传失败，请重试' });
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  // 下载最新名单
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch('/api/records/all');
      const data = await res.json();

      if (!data.success) {
        alert('获取数据失败');
        return;
      }

      // 生成与原始问卷格式一致的 CSV
      const csvRows: string[] = [];
      // 表头
      csvRows.push('编号，开始答题时间，结束答题时间，答题时长，1.往生日期，2.49 日内回向名单，3.亡者姓名，4.堕胎婴灵姓名（若无名字，填写：父母之一姓名+"堕胎婴灵"），5.旁生姓名（请填写具体昵称，勿填写如虫、鸟、猫、狗等泛称。）');

      const now = new Date().toISOString();
      data.data.forEach((record: Record, index: number) => {
        const categoryMap: { [key: string]: string } = {
          deceased: 'A.亡者',
          infants: 'B.堕胎婴灵',
          animals: 'C.旁生',
        };
        const categoryText = categoryMap[record.category] || '';
        const deceasedName = record.category === 'deceased' ? record.name : '';
        const infantName = record.category === 'infants' ? record.name : '';
        const animalName = record.category === 'animals' ? record.name : '';

        csvRows.push(
          `${index + 1},${now},${now},,${record.death_date},${categoryText},${deceasedName},${infantName},${animalName}`
        );
      });

      // 添加 BOM 确保 Excel 正确显示中文
      const csvContent = '\uFEFF' + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `助念名单_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  // 删除单条记录
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        await fetchRecords(); // 刷新列表
      } else {
        alert('删除失败：' + data.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      alert('请先选择要删除的记录');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.length} 条记录吗？`)) return;

    try {
      const res = await fetch('/api/records/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();

      if (data.success) {
        setSelectedIds([]);
        await fetchRecords();
      } else {
        alert('批量删除失败：' + data.error);
      }
    } catch (error) {
      console.error('批量删除失败:', error);
      alert('批量删除失败，请重试');
    }
  };

  // 批量修改分类
  const handleBatchCategoryChange = async (newCategory: string) => {
    if (selectedIds.length === 0) {
      alert('请先选择要修改的记录');
      return;
    }

    try {
      const res = await fetch('/api/records/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, category: newCategory }),
      });

      const data = await res.json();

      if (data.success) {
        setSelectedIds([]);
        await fetchRecords();
      } else {
        alert('批量修改失败：' + data.error);
      }
    } catch (error) {
      console.error('批量修改失败:', error);
      alert('批量修改失败，请重试');
    }
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    try {
      const res = await fetch(`/api/records/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRecord),
      });

      const data = await res.json();

      if (data.success) {
        setEditingRecord(null);
        await fetchRecords();
      } else {
        alert('保存失败：' + data.error);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.id));
    }
  };

  // 切换单个选择
  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 过滤记录
  const filteredRecords = records.filter(record => {
    const matchSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || record.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const categoryLabels: { [key: string]: string } = {
    deceased: '亡者',
    infants: '堕胎婴灵',
    animals: '旁生',
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'STZhongsong, SimSun, serif', letterSpacing: '0.1em' }}>
            数据管理
          </h1>
          <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: '#8b6914' }}></div>
        </div>

        {/* 返回链接 */}
        <div className="mb-8">
          <Link href="/" className="text-sm hover:opacity-80 transition-opacity" style={{ color: '#6b6560' }}>
            ← 返回名单页面
          </Link>
        </div>

        {/* 上传区域 */}
        <div className="mb-12 p-8 border border-dashed rounded-lg" style={{ borderColor: '#e8e4df', backgroundColor: '#faf8f5' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'STZhongsong, SimSun, serif' }}>
            上传数据
          </h2>
          <p className="text-sm mb-6" style={{ color: '#6b6560' }}>
            上传 CSV 文件，自动解析并分类（A.亡者 / B.堕胎婴灵 / C.旁生）
          </p>

          <label className="block">
            <span className="inline-block px-6 py-3 text-sm font-medium rounded-lg cursor-pointer transition-all hover:opacity-80"
              style={{ backgroundColor: '#8b6914', color: '#faf8f5' }}>
              {isUploading ? '上传中...' : '选择 CSV 文件'}
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {uploadResult && (
            <div className={`mt-4 p-4 rounded-lg text-sm ${uploadResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {uploadResult.message}
            </div>
          )}
        </div>

        {/* 下载按钮 */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-6 py-3 text-sm font-medium rounded-lg transition-all hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: '#8b6914', color: '#faf8f5' }}
          >
            {isDownloading ? '下载中...' : '下载最新名单'}
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="px-6 py-3 text-sm font-medium rounded-lg transition-all hover:opacity-80"
            style={{ backgroundColor: '#6b6560', color: '#faf8f5' }}
          >
            {showLogs ? '隐藏上传日志' : '查看上传日志'}
          </button>
        </div>

        {/* 上传日志区域 */}
        {showLogs && (
          <div className="mb-8 border rounded-lg p-6" style={{ borderColor: '#e8e4df', backgroundColor: '#faf8f5' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'STZhongsong, SimSun, serif' }}>
              上传日志
            </h2>
            {uploadLogs.length === 0 ? (
              <p className="text-sm" style={{ color: '#6b6560' }}>暂无上传记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#e8e4df' }}>
                      <th className="text-left py-2 px-2">上传时间</th>
                      <th className="text-left py-2 px-2">来源</th>
                      <th className="text-left py-2 px-2">文件名</th>
                      <th className="text-left py-2 px-2">IP地址</th>
                      <th className="text-left py-2 px-2">记录数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadLogs.map((log) => (
                      <tr key={log.id} className="border-b" style={{ borderColor: '#e8e4df' }}>
                        <td className="py-2 px-2">{new Date(log.uploaded_at).toLocaleString('zh-CN')}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.source === 'form' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {log.source === 'form' ? '表单提交' : 'CSV上传'}
                          </span>
                        </td>
                        <td className="py-2 px-2 max-w-xs truncate">{log.file_name}</td>
                        <td className="py-2 px-2 font-mono text-xs">{log.ip_address}</td>
                        <td className="py-2 px-2">{log.record_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 记录管理区域 */}
        <div className="border rounded-lg p-8" style={{ borderColor: '#e8e4df', backgroundColor: '#faf8f5' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'STZhongsong, SimSun, serif' }}>
              记录管理
            </h2>
            <span className="text-sm" style={{ color: '#6b6560' }}>
              共 {filteredRecords.length} 条记录
            </span>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="搜索姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: '#e8e4df', backgroundColor: '#fff' }}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: '#e8e4df', backgroundColor: '#fff' }}
            >
              <option value="all">全部分类</option>
              <option value="deceased">亡者</option>
              <option value="infants">堕胎婴灵</option>
              <option value="animals">旁生</option>
            </select>
          </div>

          {/* 批量操作按钮 */}
          {selectedIds.length > 0 && (
            <div className="flex gap-2 mb-4 p-4 rounded-lg" style={{ backgroundColor: '#f5f2ed' }}>
              <span className="text-sm" style={{ color: '#6b6560' }}>
                已选择 {selectedIds.length} 条
              </span>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1 text-xs rounded hover:opacity-80"
                style={{ backgroundColor: '#dc2626', color: '#fff' }}
              >
                批量删除
              </button>
              <button
                onClick={() => handleBatchCategoryChange('deceased')}
                className="px-3 py-1 text-xs rounded hover:opacity-80"
                style={{ backgroundColor: '#8b6914', color: '#fff' }}
              >
                改为亡者
              </button>
              <button
                onClick={() => handleBatchCategoryChange('infants')}
                className="px-3 py-1 text-xs rounded hover:opacity-80"
                style={{ backgroundColor: '#8b6914', color: '#fff' }}
              >
                改为堕胎婴灵
              </button>
              <button
                onClick={() => handleBatchCategoryChange('animals')}
                className="px-3 py-1 text-xs rounded hover:opacity-80"
                style={{ backgroundColor: '#8b6914', color: '#fff' }}
              >
                改为旁生
              </button>
            </div>
          )}

          {/* 记录列表 */}
          {loading ? (
            <div className="text-center py-12" style={{ color: '#6b6560' }}>
              加载中...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#6b6560' }}>
              暂无记录
            </div>
          ) : (
            <>
              {/* 表头 - 固定在顶部 */}
              <div className="flex items-center gap-2 px-4 py-2 font-medium text-sm sticky top-0 z-10" style={{ backgroundColor: '#f5f2ed' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
                <span className="flex-1">姓名</span>
                <span className="w-24">分类</span>
                <span className="w-28">往生日期</span>
                <span className="w-32">上传时间</span>
                <span className="w-16">操作</span>
              </div>

              {/* 记录列表 - 可滚动 */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {/* 记录行 */}
                {filteredRecords.map(record => (
                <div
                  key={record.id}
                  className="flex items-center gap-2 px-4 py-3 border-b hover:bg-opacity-50 transition-colors"
                  style={{ borderColor: '#e8e4df' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(record.id)}
                    onChange={() => handleToggleSelect(record.id)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1 text-sm">{record.name}</span>
                  <span className="w-24 text-sm" style={{ color: '#6b6560' }}>
                    {categoryLabels[record.category]}
                  </span>
                  <span className="w-28 text-sm" style={{ color: '#6b6560' }}>
                    {record.death_date}
                  </span>
                  <span className="w-32 text-xs" style={{ color: '#6b6560' }}>
                    {new Date(record.created_at).toLocaleString('zh-CN', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <div className="w-16">
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="px-2 py-1 text-xs rounded hover:opacity-80"
                      style={{ backgroundColor: '#8b6914', color: '#fff' }}
                    >
                      编辑
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
        </div>

        {/* 编辑对话框 */}
        {editingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: 'STZhongsong, SimSun, serif' }}>
                编辑记录
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6b6560' }}>
                    姓名
                  </label>
                  <input
                    type="text"
                    value={editingRecord.name}
                    onChange={(e) => setEditingRecord({ ...editingRecord, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e8e4df' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6b6560' }}>
                    分类
                  </label>
                  <select
                    value={editingRecord.category}
                    onChange={(e) => setEditingRecord({ ...editingRecord, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e8e4df' }}
                  >
                    <option value="deceased">亡者</option>
                    <option value="infants">堕胎婴灵</option>
                    <option value="animals">旁生</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6b6560' }}>
                    往生日期
                  </label>
                  <input
                    type="date"
                    value={editingRecord.death_date}
                    onChange={(e) => setEditingRecord({ ...editingRecord, death_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e8e4df' }}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 px-4 py-2 text-sm rounded-lg border hover:opacity-80"
                  style={{ borderColor: '#e8e4df', color: '#6b6560' }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg hover:opacity-80"
                  style={{ backgroundColor: '#8b6914', color: '#faf8f5' }}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
