// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
if (navToggle) {
  navToggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// ===== Animated stat counters =====
const stats = document.querySelectorAll('.stat strong[data-count]');
const animateCount = (el) => {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
};

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
stats.forEach(el => statObserver.observe(el));

// ===== Back to top button =====
const backTop = document.getElementById('backTop');
if (backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('show', window.scrollY > 500);
  });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== Search form (UI only — redirects to jobs page) =====
const searchForm = document.getElementById('searchForm');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('q').value.trim();
    const loc = document.getElementById('loc').value.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (loc) params.set('loc', loc);
    window.location.href = `jobs.html${params.toString() ? '?' + params.toString() : ''}`;
  });
}

// ===== Popular keyword chips fill the search box =====
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const input = document.getElementById('q');
    if (input) input.value = chip.textContent;
  });
});

// ===== Newsletter form (UI only) =====
const newsForm = document.getElementById('newsForm');
if (newsForm) {
  newsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsForm.querySelector('input');
    const button = newsForm.querySelector('button');
    const original = button.textContent;
    button.textContent = 'Subscribed ✓';
    input.value = '';
    setTimeout(() => (button.textContent = original), 2200);
  });
}

// ===== Pagination buttons (UI only) =====
document.querySelectorAll('.page-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
    if (!isNaN(parseInt(btn.textContent))) btn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ===== Contact form (UI only) =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('formNote').textContent = "Thanks — we'll get back to you within one business day.";
    contactForm.reset();
  });
}

// ===== Login / Signup forms (UI only) =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('This is a frontend-only demo — login is not connected to a backend yet.');
  });
}
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('This is a frontend-only demo — account creation is not connected to a backend yet.');
  });
}

// =========================================================
// JOBS PAGE — real client-side filtering (no backend needed)
// =========================================================
const jobCardsWrap = document.getElementById('jobCards');
if (jobCardsWrap) {
  const allCards = Array.from(jobCardsWrap.querySelectorAll('.job-list-card'));
  const searchInput = document.getElementById('q');
  const salaryRange = document.getElementById('salaryRange');
  const salaryValueLabel = document.getElementById('salaryValue');
  const noJobsMsg = document.getElementById('noJobs');
  const countLabel = document.getElementById('job-count-label');
  const resultsEyebrow = document.getElementById('resultsCount');
  const clearBtn = document.getElementById('clearFilters');
  const jobsSearchForm = document.getElementById('jobsSearchForm');

  // Pre-fill search box from Home page redirect (index.html?q=...&loc=...)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('q') && searchInput) searchInput.value = urlParams.get('q');

  const getCheckedValues = (groupName) => {
    const group = document.querySelector(`.filter-group[data-group="${groupName}"]`);
    if (!group) return [];
    return Array.from(group.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
  };

  function applyFilters() {
    const keyword = (searchInput?.value || '').trim().toLowerCase();
    const categories = getCheckedValues('category');
    const types = getCheckedValues('type');
    const experiences = getCheckedValues('experience');
    const minSalary = salaryRange ? parseInt(salaryRange.value, 10) : 30;

    if (salaryValueLabel) {
      salaryValueLabel.textContent = minSalary <= 30 ? 'Any' : `${minSalary}k+`;
    }

    let visibleCount = 0;

    allCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardType = card.getAttribute('data-type');
      const cardExperience = card.getAttribute('data-experience');
      const cardMax = parseInt(card.getAttribute('data-max'), 10);
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const company = card.querySelector('.job-company')?.textContent.toLowerCase() || '';

      const matchesKeyword = !keyword || title.includes(keyword) || company.includes(keyword);
      const matchesCategory = categories.length === 0 || categories.includes(cardCategory);
      const matchesType = types.length === 0 || types.includes(cardType);
      const matchesExperience = experiences.length === 0 || experiences.includes(cardExperience);
      const matchesSalary = minSalary <= 30 || cardMax >= minSalary;

      const isMatch = matchesKeyword && matchesCategory && matchesType && matchesExperience && matchesSalary;
      card.style.display = isMatch ? '' : 'none';
      if (isMatch) visibleCount++;
    });

    if (noJobsMsg) noJobsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    if (countLabel) countLabel.textContent = `Showing ${visibleCount} of ${allCards.length} roles`;
    if (resultsEyebrow) resultsEyebrow.textContent = `${visibleCount} open role${visibleCount === 1 ? '' : 's'}`;
  }

  // Wire up every checkbox in the three filter groups
  document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });

  // Salary slider
  if (salaryRange) salaryRange.addEventListener('input', applyFilters);

  // Live search as you type
  if (searchInput) searchInput.addEventListener('input', applyFilters);

  // Search form submit (prevents page reload, just re-applies filters)
  if (jobsSearchForm) {
    jobsSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      applyFilters();
      jobCardsWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Clear all filters
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => (cb.checked = false));
      if (searchInput) searchInput.value = '';
      if (document.getElementById('loc')) document.getElementById('loc').value = '';
      if (salaryRange) salaryRange.value = 30;
      applyFilters();
    });
  }

  // Run once on page load (handles ?q= from Home page redirect too)
  applyFilters();
}
