document.addEventListener('DOMContentLoaded', () => {
  // Navigation Setup
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanelId = btn.id.replace('tab-', 'panel-');
      document.getElementById(activePanelId).classList.add('active');

      if (btn.id === 'tab-lock') {
        renderLockList();
      } else if (btn.id === 'tab-corral') {
        renderCorralList();
      }
    });
  });

  // Settings Setup
  const timerSlider = document.getElementById('close-timer');
  const timerValue = document.getElementById('timer-val');
  const whitelistAddBtn = document.getElementById('whitelist-add');
  const whitelistInput = document.getElementById('whitelist-input');
  const whitelistList = document.getElementById('whitelist-list');

  chrome.storage.local.get(['settings'], (res) => {
    const settings = res.settings || { autoCloseMinutes: 30, whitelist: [] };
    timerSlider.value = settings.autoCloseMinutes;
    timerValue.textContent = settings.autoCloseMinutes;
    renderWhitelist(settings.whitelist);
  });

  timerSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    timerValue.textContent = val;
    chrome.storage.local.get(['settings'], (res) => {
      const settings = res.settings || {};
      settings.autoCloseMinutes = parseInt(val, 10);
      chrome.storage.local.set({ settings });
    });
  });

  // Whitelist Render & Add/Remove
  function renderWhitelist(whitelist) {
    whitelistList.innerHTML = '';
    (whitelist || []).forEach(domain => {
      const li = document.createElement('li');
      li.className = 'whitelist-item';
      li.innerHTML = `
        <span>${domain}</span>
        <button class="del-btn" data-domain="${domain}">✕</button>
      `;
      whitelistList.appendChild(li);
    });

    // Add remove actions
    document.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetDomain = e.target.getAttribute('data-domain');
        chrome.storage.local.get(['settings'], (res) => {
          const settings = res.settings || {};
          settings.whitelist = (settings.whitelist || []).filter(d => d !== targetDomain);
          chrome.storage.local.set({ settings }, () => {
            renderWhitelist(settings.whitelist);
          });
        });
      });
    });
  }

  whitelistAddBtn.addEventListener('click', () => {
    const rawVal = whitelistInput.value.trim().toLowerCase();
    if (!rawVal) return;

    chrome.storage.local.get(['settings'], (res) => {
      const settings = res.settings || {};
      const whitelist = settings.whitelist || [];
      if (!whitelist.includes(rawVal)) {
        whitelist.push(rawVal);
        settings.whitelist = whitelist;
        chrome.storage.local.set({ settings }, () => {
          renderWhitelist(whitelist);
          whitelistInput.value = '';
        });
      }
    });
  });

  // Corral List rendering and search and restore
  const corralList = document.getElementById('corral-list');
  const corralSearch = document.getElementById('corral-search');
  const corralClear = document.getElementById('corral-clear');

  function renderCorralList() {
    chrome.storage.local.get(['closedTabs'], (res) => {
      const closedTabs = res.closedTabs || [];
      const query = corralSearch.value.trim().toLowerCase();
      corralList.innerHTML = '';

      const filtered = closedTabs.filter(t => 
        (t.title || '').toLowerCase().includes(query) || (t.url || '').toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        corralList.innerHTML = '<p class="panel-desc" style="text-align:center;margin-top:20px;">No closed tabs archived.</p>';
        return;
      }

      filtered.forEach(tab => {
        const item = document.createElement('div');
        item.className = 'tab-item';
        
        const timeStr = formatTimeAgo(tab.closedAt);
        const faviconUrl = tab.faviconUrl || '../icons/icon-16.png'; // default fallback icon

        item.innerHTML = `
          <div class="tab-info" data-url="${tab.url}">
            <img class="tab-favicon" src="${faviconUrl}" onerror="this.src='../icons/icon-16.png'">
            <span class="tab-title" title="${tab.title || tab.url}">${tab.title || tab.url}</span>
          </div>
          <span class="tab-time">${timeStr}</span>
        `;
        corralList.appendChild(item);
      });

      // Restore click action
      document.querySelectorAll('#panel-corral .tab-info').forEach(info => {
        info.addEventListener('click', () => {
          const url = info.getAttribute('data-url');
          chrome.tabs.create({ url });
          
          // Remove from Corral archive list
          chrome.storage.local.get(['closedTabs'], (res2) => {
            let list = res2.closedTabs || [];
            list = list.filter(t => t.url !== url);
            chrome.storage.local.set({ closedTabs: list }, () => {
              renderCorralList();
            });
          });
        });
      });
    });
  }

  corralSearch.addEventListener('input', renderCorralList);
  corralClear.addEventListener('click', () => {
    chrome.storage.local.set({ closedTabs: [] }, renderCorralList);
  });

  function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  }

  // Lock List Controls
  const lockList = document.getElementById('lock-list');

  function renderLockList() {
    chrome.storage.local.get(['lockedUrls'], (res) => {
      const lockedUrls = res.lockedUrls || [];
      
      chrome.tabs.query({}, (tabs) => {
        lockList.innerHTML = '';
        
        // Filter out private browsing tabs completely
        const filteredTabs = tabs.filter(t => !t.incognito);

        if (filteredTabs.length === 0) {
          lockList.innerHTML = '<p class="panel-desc" style="text-align:center;">No active tabs.</p>';
          return;
        }

        filteredTabs.forEach(tab => {
          const item = document.createElement('div');
          item.className = 'tab-item';
          
          const isLocked = lockedUrls.includes(tab.url);
          const lockIcon = isLocked ? '🔒' : '🔓';
          const favicon = tab.favIconUrl || '../icons/icon-16.png';

          item.innerHTML = `
            <div class="tab-info">
              <img class="tab-favicon" src="${favicon}" onerror="this.src='../icons/icon-16.png'">
              <span class="tab-title" title="${tab.title || tab.url}">${tab.title || tab.url}</span>
            </div>
            <button class="lock-btn" data-url="${tab.url}">${lockIcon}</button>
          `;
          lockList.appendChild(item);
        });

        // Lock Toggle Event Handler
        document.querySelectorAll('.lock-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            chrome.storage.local.get(['lockedUrls'], (res2) => {
              let list = res2.lockedUrls || [];
              if (list.includes(url)) {
                list = list.filter(u => u !== url);
              } else {
                list.push(url);
              }
              chrome.storage.local.set({ lockedUrls: list }, () => {
                renderLockList();
              });
            });
          });
        });
      });
    });
  }

  // Initialize Corral List as default render
  renderCorralList();
});
