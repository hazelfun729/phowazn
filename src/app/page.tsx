'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { SiteData, NameEntry } from '@/lib/data-store';

function filterWithin49Days(
  entries: NameEntry[],
  referenceDate: Date
): NameEntry[] {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - 49);

  const seen = new Set<string>();
  const result: NameEntry[] = [];

  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    if (entryDate < cutoff) continue;
    if (seen.has(entry.name)) continue;
    seen.add(entry.name);
    result.push(entry);
  }

  return result;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatUpdateTime(isoStr: string): string {
  const d = new Date(isoStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hour}:${minute}`;
}

/* ======== 导航组件 ======== */
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#faf8f5]/95 backdrop-blur-sm shadow-[0_1px_0_#e8e4df]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <a
          href="#hero"
          className="font-serif text-lg tracking-widest text-[#2c2c2c]"
        >
          PW影院助念名单
        </a>
        <div className="flex gap-6 font-serif text-sm tracking-wide text-[#6b6560]">
          <a href="#deceased" className="transition-colors hover:text-[#2c2c2c]">
            亡者
          </a>
          <a href="#infants" className="transition-colors hover:text-[#2c2c2c]">
            堕胎婴灵
          </a>
          <a href="#animals" className="transition-colors hover:text-[#2c2c2c]">
            旁生
          </a>
          <a
            href="#conclusion"
            className="transition-colors hover:text-[#2c2c2c]"
          >
            回向
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ======== HERO 区域 ======== */
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      {/* 背景图 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/hero-lotus.jpeg)' }}
      />
      {/* 轻柔暖色遮罩 - 保持明亮有希望感 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-[#faf8f5]/60" />

      {/* 内容 */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
        {/* 莲花装饰符号 */}
        <div className="mb-10 text-[#8b6914]/40">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="mx-auto"
          >
            <path
              d="M24 4C24 4 18 14 12 18C18 22 24 32 24 32C24 32 30 22 36 18C30 14 24 4 24 4Z"
              fill="currentColor"
              opacity="0.5"
            />
            <path
              d="M24 10C24 10 14 16 8 22C16 24 24 34 24 34C24 34 32 24 40 22C34 16 24 10 24 10Z"
              fill="currentColor"
              opacity="0.25"
            />
          </svg>
        </div>

        <h1 className="section-title mb-6 font-serif text-4xl font-bold tracking-[0.25em] text-[#2c2c2c] md:text-5xl">
          PW影院助念名单
        </h1>

        <p className="mb-12 font-serif text-lg tracking-[0.15em] text-[#6b6560] md:text-xl">
          往生超度 &middot; 功德回向
        </p>

        {/* 分隔线 */}
        <div className="ink-divider" />

        <div className="mx-auto mt-10 max-w-2xl font-serif text-base leading-[2.4] tracking-wide text-[#4a4540] md:text-lg">
          <p className="mb-6">
            人去世的时候会非常可怜，就像中阴窍诀所描述的：
            <br />
            前有阎罗狱卒牵引，后有业风吹动。
            <br />
            虽然万般不情愿，却不得不舍弃今生的一切，
            <br />
            踏上通往来世的中阴长道，
            <br />
            独自面对各种恐怖的景象。
          </p>
          <p className="mb-6">
            在这个时候，亡者最需要亲友的帮助。
          </p>
          <p className="font-serif text-base text-[#2c2c2c] md:text-lg">
            Pw影院每周定期为有缘亡者助念，
            <br />
            让我们一起发慈悲之心，
            <br />
            帮助这些独自漂泊在中阴的无助亡者们！
          </p>
        </div>

        {/* 向下引导 */}
        <div className="mt-20 animate-bounce text-[#6b6560]/40">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ======== 名单栏目组件 ======== */
function NameListSection({
  id,
  title,
  subtitle,
  entries,
  updatedAt,
}: {
  id: string;
  title: string;
  subtitle: string;
  entries: NameEntry[];
  updatedAt: string | null;
}) {
  return (
    <section id={id} className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="section-title mb-4 text-center font-serif text-2xl font-semibold tracking-[0.15em] text-[#2c2c2c] md:text-3xl">
          {title}
        </h2>
        <p className="mb-2 text-center font-serif text-sm tracking-wide text-[#6b6560]">
          {subtitle}
        </p>

        <div className="ink-divider" />

        {entries.length > 0 ? (
          <div className="mt-8">
            <p className="name-list text-base md:text-lg">
              {entries.map((e) => e.name).join('、')}
            </p>
            <p className="mt-8 text-center font-serif text-xs text-[#a09a94]">
              共 {entries.length} 位 &middot; 按往生日期排序（49日内）
            </p>
          </div>
        ) : (
          <p className="mt-12 text-center font-serif text-sm text-[#a09a94]">
            暂无
          </p>
        )}
      </div>
    </section>
  );
}

/* ======== 结语区域 ======== */
function ConclusionSection() {
  return (
    <section
      id="conclusion"
      className="bg-[#f5f2ed] px-6 py-20 md:py-28"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="section-title mb-12 font-serif text-2xl font-semibold tracking-[0.15em] text-[#2c2c2c] md:text-3xl">
          回向
        </h2>

        <div className="space-y-12">
          {/* 往生愿文 */}
          <div>
            <h3 className="mb-6 font-serif text-lg tracking-widest text-[#8b6914]">
              往生愿文
            </h3>
            <p className="prayer-text">
              以以上众生为主的一切亡者，
              <br />
              愿业障消除，福慧增长，
              <br />
              蒙佛光摄受，慈悲接引，
              <br />
              往生西方极乐世界，
              <br />
              早日乘愿再来，广度众生。
            </p>
          </div>

          <div className="ink-divider" />

          {/* 愿生净土文 */}
          <div>
            <h3 className="mb-6 font-serif text-lg tracking-widest text-[#8b6914]">
              愿生净土文
            </h3>
            <p className="prayer-text">
              愿生西方净土中，九品莲花为父母，
              <br />
              华开见佛悟无生，不退菩萨为伴侣。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======== 页脚 ======== */
function Footer({ updatedAt }: { updatedAt: string | null }) {
  return (
    <footer className="border-t border-[#e8e4df] px-6 py-10">
      <div className="mx-auto max-w-3xl text-center">
        {updatedAt && (
          <p className="mb-4 font-serif text-xs text-[#a09a94]">
            数据更新于：{formatUpdateTime(updatedAt)}
          </p>
        )}
        <p className="font-serif text-xs text-[#a09a94]">
          &copy; {new Date().getFullYear()} PW影院助念名单 &middot;
          所有数据仅供内部回向使用
        </p>
        <p className="mt-2 font-serif text-xs text-[#b8b2ab]">
          隐私声明：本页所有姓名信息仅用于功德回向，不作任何其他用途。
          我们尊重并保护每一位众生的隐私。
        </p>
      </div>
    </footer>
  );
}

/* ======== 主页面 ======== */
export default function Home() {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date>(new Date());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json: SiteData = await res.json();
        setData(json);
      }
    } catch {
      // 数据加载失败时保持空状态
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // 每分钟刷新一次时间
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // 监听文件变化自动刷新（开发环境）
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Intersection Observer for fade-in
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-section');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((s) => observerRef.current?.observe(s));

    return () => observerRef.current?.disconnect();
  }, [loading]);

  const deceasedFiltered = data
    ? filterWithin49Days(data.deceased, now)
    : [];
  const infantsFiltered = data
    ? filterWithin49Days(data.infants, now)
    : [];
  const animalsFiltered = data
    ? filterWithin49Days(data.animals, now)
    : [];

  const updatedAt = data?.updatedAt ?? null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-serif text-sm tracking-widest text-[#6b6560]">
          加载中...
        </p>
      </div>
    );
  }

  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <NameListSection
          id="deceased"
          title="亡者"
          subtitle="四十九日内往生者名单"
          entries={deceasedFiltered}
          updatedAt={updatedAt}
        />
        <div className="ink-divider" />
        <NameListSection
          id="infants"
          title="堕胎婴灵"
          subtitle="四十九日内堕胎婴灵名单"
          entries={infantsFiltered}
          updatedAt={updatedAt}
        />
        <div className="ink-divider" />
        <NameListSection
          id="animals"
          title="旁生"
          subtitle="四十九日内旁生众生名单"
          entries={animalsFiltered}
          updatedAt={updatedAt}
        />
        <ConclusionSection />
      </main>
      <Footer updatedAt={updatedAt} />
    </>
  );
}
