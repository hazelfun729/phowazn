const SUPABASE_URL = 'https://ekgbhbvbnxgqtnhjhqag.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZ2JoYnZibnhncXRuaGpocWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzOTg0OTQsImV4cCI6MjEwMTk3NDQ5NH0.0ddEEOIE7sFkWVnM6LhrK-jESoTPQJLXtRu1AW01IGw';

async function loadData() {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/records`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load data');
    }

    const data = await response.json();

    renderList('deceased-list', 'deceased-count', data.deceased, '人');
    renderList('infants-list', 'infants-count', data.infants, '位');
    renderList('animals-list', 'animals-count', data.animals, '位');

    if (data.updatedAt) {
      const updateDate = new Date(data.updatedAt);
      const formattedDate = updateDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      document.getElementById('footer-update').textContent = `数据更新时间：${formattedDate}`;
    }

  } catch (error) {
    console.error('Load data error:', error);
    document.getElementById('deceased-list').innerHTML = '<p class="loading">加载失败，请刷新页面</p>';
    document.getElementById('infants-list').innerHTML = '<p class="loading">加载失败，请刷新页面</p>';
    document.getElementById('animals-list').innerHTML = '<p class="loading">加载失败，请刷新页面</p>';
  }
}

function renderList(listId, countId, items, unit) {
  const listElement = document.getElementById(listId);
  const countElement = document.getElementById(countId);

  if (!items || items.length === 0) {
    listElement.innerHTML = '<p class="loading">暂无</p>';
    countElement.textContent = '';
    return;
  }

  const names = items.map(item => item.name).join('，');
  listElement.innerHTML = `<p>${names}</p>`;
  countElement.textContent = `共 ${items.length} ${unit}`;
}

document.addEventListener('DOMContentLoaded', function() {
  loadData();

  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
  });

  const sections = document.querySelectorAll('.section');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  sections.forEach(function(section) {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
  });
});
