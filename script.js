
(function () {
  const families = window.__LLM_FAMILIES__ || [];
  const timeline = window.__LLM_TIMELINE__ || [];
  const builtAt = new Date().toLocaleString();
  document.getElementById('builtAt').textContent = builtAt;

  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.id.replace('tab', 'panel')).classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tabs.forEach(t => { if (t !== tab) t.setAttribute('aria-selected', 'false'); });
    });
  });

  // Filters and search
  const searchInput = document.getElementById('searchInput');
  const licenseFilter = document.getElementById('licenseFilter');
  const modalityFilter = document.getElementById('modalityFilter');
  const sortSelect = document.getElementById('sortSelect');
  const cardsEl = document.getElementById('cards');

  function norm(s){ return (s || '').toString().toLowerCase(); }
  function includes(list, value){
    return (list || []).some(x => norm(x).includes(norm(value)));
  }

  function sortData(arr, mode) {
    const getYear = (s) => {
      const m = (s || '').match(/(\d{4})/);
      return m ? parseInt(m[1], 10) : 0;
    };
    const c = [...arr];
    switch(mode){
      case 'family-asc':
        return c.sort((a,b)=> norm(a.family).localeCompare(norm(b.family)));
      case 'steward-asc':
        return c.sort((a,b)=> norm(a.steward).localeCompare(norm(b.steward)));
      case 'initial-asc':
        return c.sort((a,b)=> getYear(a.initial_release) - getYear(b.initial_release));
      case 'initial-desc':
        return c.sort((a,b)=> getYear(b.initial_release) - getYear(a.initial_release));
      default: return c;
    }
  }

  function passesFilters(item){
    const q = norm(searchInput.value);
    const lic = norm(licenseFilter.value);
    const mod = norm(modalityFilter.value);

    const textHaystack = [
      item.family, item.steward, item.license, item.initial_release, item.current_release,
      ...(item.traits || [])
    ].join(' ').toLowerCase();

    const searchOk = !q || textHaystack.includes(q);
    const licenseOk = !lic || norm(item.license) === lic;
    const modalityOk = !mod || includes(item.modalities || [], modalityFilter.value);

    return searchOk && licenseOk && modalityOk;
  }

  function renderCards(){
    const filtered = sortData(families.filter(passesFilters), sortSelect.value);
    cardsEl.innerHTML = '';
    if (!filtered.length){
      const empty = document.createElement('p');
      empty.textContent = 'No results. Try clearing a filter.';
      empty.className = 'meta';
      cardsEl.appendChild(empty);
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <h3>${item.family}</h3>
        <div class="meta">${item.steward} • <em>${item.license}</em></div>
        <div class="meta">${item.initial_release} → ${item.current_release}</div>
        <div class="badges">${(item.modalities||[]).map(m=>`<span class="badge" title="Modality">${m}</span>`).join('')}</div>
        <div class="traits">• ${((item.traits||[]).join(' • '))}</div>
        <details>
          <summary>More</summary>
          <p><strong>Context window:</strong> ${item.context_window || '—'}</p>
          ${ (item.links && item.links.length) ?
            `<p><strong>Links:</strong> ${item.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join(' · ')}</p>` : ''}
        </details>
      `;
      cardsEl.appendChild(card);
    });
  }

  // Timeline
  function renderTimeline(){
    const list = document.getElementById('timelineList');
    list.innerHTML = '';
    timeline.forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="phase">${t.phase}</div>
        <div class="event">${t.event}</div>
        <div class="why">${t.why}</div>
      `;
      list.appendChild(li);
    });
  }

  // Wire up events
  [searchInput, licenseFilter, modalityFilter, sortSelect].forEach(el => {
    el && el.addEventListener('input', renderCards);
    el && el.addEventListener('change', renderCards);
  });

  // Initial render
  renderCards();
  renderTimeline();
})();
