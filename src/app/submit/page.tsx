'use client';

import { useState } from 'react';
import Link from 'next/link';

type Category = 'deceased' | 'infants' | 'animals' | null;

interface Record {
  name: string;
  date: string;
}

interface RecordsData {
  deceased: Record[];
  infants: Record[];
  animals: Record[];
}

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [deathDate, setDeathDate] = useState('');
  const [category, setCategory] = useState<Category>(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // 获取北京时间（UTC+8）
  const getBeijingDate = () => {
    const now = new Date();
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
    return {
      today: beijingTime.toISOString().split('T')[0],
      fortyNineDaysAgo: (() => {
        const d = new Date(beijingTime);
        d.setDate(d.getDate() - 49);
        return d.toISOString().split('T')[0];
      })(),
    };
  };
  const { today, fortyNineDaysAgo: minDate } = getBeijingDate();

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!category) {
        setError('请选择分类');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!deathDate) {
        setError('请选择往生日期');
        return;
      }
      setStep(3);
    }
  };

  const handlePrev = () => {
    setError('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('请输入姓名');
      return;
    }
    if (name.length > 12) {
      setError('姓名不能超过12个字');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          death_date: deathDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '提交失败');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setDeathDate('');
    setCategory(null);
    setName('');
    setSubmitted(false);
    setError('');
  };

  const getCategoryLabel = (cat: Category) => {
    switch (cat) {
      case 'deceased': return '亡者姓名';
      case 'infants': return '堕胎婴灵姓名';
      case 'animals': return '旁生姓名';
      default: return '';
    }
  };

  const getCategoryHint = (cat: Category) => {
    switch (cat) {
      case 'infants': return '若无名字，填写：父母之一姓名+"堕胎婴灵"';
      case 'animals': return '请填写具体昵称，勿填写如虫、鸟、猫、狗等泛称。';
      default: return '';
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#8b6914]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8b6914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif text-[#2c2c2c] mb-2">提交成功</h2>
            <p className="text-[#6b6560] text-sm">名单已添加，将持续回向49日</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-3 px-6 bg-[#2c2c2c] text-white rounded hover:bg-[#2c2c2c]/90 transition-colors font-serif"
            >
              点击查看名单
            </Link>
            <button
              onClick={handleReset}
              className="block w-full py-3 px-6 border border-[#2c2c2c]/20 text-[#2c2c2c] rounded hover:bg-[#2c2c2c]/5 transition-colors font-serif"
            >
              再填一个名单
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-[#e8e4df] z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg text-[#2c2c2c] hover:text-[#8b6914] transition-colors">
            PW影院助念名单
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-[#6b6560] hover:text-[#2c2c2c] transition-colors">
              查看名单
            </Link>
          </nav>
        </div>
      </header>

      {/* 主内容 */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl text-[#2c2c2c] mb-3">填写助念名单</h1>
            <div className="w-12 h-0.5 bg-[#8b6914] mx-auto mb-4"></div>
            <p className="text-[#6b6560] text-sm leading-relaxed">
              名单为<span className="text-[#2c2c2c] font-medium">49日内往生</span>之众生，<span className="text-[#2c2c2c] font-medium">请勿重复填写</span>
              <br />
              名单将保留7周持续回向
            </p>
          </div>

          {/* 进度指示器 */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif transition-all ${
                    s === step
                      ? 'bg-[#8b6914] text-white'
                      : s < step
                      ? 'bg-[#2c2c2c] text-white'
                      : 'bg-[#e8e4df] text-[#6b6560]'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && (
                  <div className={`w-8 h-0.5 ${s < step ? 'bg-[#2c2c2c]' : 'bg-[#e8e4df]'}`}></div>
                )}
              </div>
            ))}
          </div>

          {/* 表单内容 */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-[#e8e4df]">
            {/* 第1步：分类选择 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block font-serif text-lg text-[#2c2c2c] mb-2">
                    49日内回向名单
                  </label>
                  <p className="text-[#6b6560] text-sm mb-4">请选择要填写的名单类型</p>
                  <div className="space-y-3">
                    {[
                      { value: 'deceased', label: '亡者' },
                      { value: 'infants', label: '堕胎婴灵' },
                      { value: 'animals', label: '旁生' },
                    ].map((item) => (
                      <label
                        key={item.value}
                        className={`flex items-center p-4 border rounded cursor-pointer transition-all ${
                          category === item.value
                            ? 'border-[#8b6914] bg-[#8b6914]/5'
                            : 'border-[#e8e4df] hover:border-[#8b6914]/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={item.value}
                          checked={category === item.value}
                          onChange={(e) => setCategory(e.target.value as Category)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          category === item.value ? 'border-[#8b6914]' : 'border-[#e8e4df]'
                        }`}>
                          {category === item.value && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#8b6914]"></div>
                          )}
                        </div>
                        <span className="font-serif text-[#2c2c2c]">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 第2步：往生日期 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block font-serif text-lg text-[#2c2c2c] mb-2">
                    往生日期
                  </label>
                  <p className="text-[#6b6560] text-sm mb-4">请选择亡者往生的日期</p>
                  <input
                    type="date"
                    value={deathDate}
                    min={minDate}
                    max={today}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="w-full px-4 py-3 border border-[#e8e4df] rounded focus:outline-none focus:border-[#8b6914] font-serif text-[#2c2c2c] bg-[#faf8f5]"
                  />
                  <p className="text-[#6b6560] text-xs mt-2">点击日期框选择日期（可选择的范围：{minDate} 至 {today}）</p>
                </div>
              </div>
            )}
            {/* 第3步：姓名输入 */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block font-serif text-lg text-[#2c2c2c] mb-2">
                    {getCategoryLabel(category)}
                  </label>
                  {getCategoryHint(category) && (
                    <p className="text-[#6b6560] text-sm mb-4">{getCategoryHint(category)}</p>
                  )}
                  <p className="text-[#6b6560] text-sm mb-4">
                    一次一位，请勿重复填写，名单将保留7周持续回向。
                  </p>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={12}
                    placeholder={`请输入${getCategoryLabel(category)}`}
                    className="w-full px-4 py-3 border border-[#e8e4df] rounded focus:outline-none focus:border-[#8b6914] font-serif text-[#2c2c2c] bg-[#faf8f5]"
                  />
                  <p className="text-[#6b6560] text-xs mt-2">{name.length}/12</p>
                </div>

            </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* 按钮 */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 border border-[#e8e4df] text-[#2c2c2c] rounded hover:bg-[#faf8f5] transition-colors font-serif"
                >
                  上一步
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-[#2c2c2c] text-white rounded hover:bg-[#2c2c2c]/90 transition-colors font-serif"
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-[#8b6914] text-white rounded hover:bg-[#8b6914]/90 transition-colors font-serif disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '提交中...' : '提交'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
