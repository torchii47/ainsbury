// Seasonal themes. Works out the season from today's date and adds it to the page,
// e.g. <html data-season="winter">, which css/style.css uses to re-style the site.
// Load it in the <head>, straight after site-info.js, so the page never flashes the wrong look.
//
// It also adds a small theme icon to the taskbar, next to the clock (like a Windows 95
// system tray). Pages without a taskbar get it at the end of the strip of links at the bottom.
// Clicking it lets anyone pick a season, the original look, or the Terminal or XP theme
// (those two are never picked by date). The choice is saved in their browser only;
// "Automatic" goes back to following the date.
//
// To preview a season in one tab without saving anything: ?season=autumn (or ?season=none)

(function () {
    // from and to are 'MM-DD' and include both days. A season can run over New Year.
    // colour is the browser bar colour on phones.
    const seasons = [
        { name: 'spring', label: 'Spring', from: '03-01', to: '05-31', colour: '#2e6b3f' },
        { name: 'summer', label: 'Summer', from: '06-01', to: '08-31', colour: '#a33a0b' },
        { name: 'autumn', label: 'Autumn', from: '09-01', to: '11-14', colour: '#8a3b12' },
        { name: 'winter', label: 'Winter', from: '11-15', to: '02-29', colour: '#1d4f91' }
    ];
    const original = { name: 'none', label: 'Original', colour: '#860c5d' };

    // Themes that are never picked by date, only from the menu
    const extras = [
        { name: 'terminal', label: 'Terminal', colour: '#000000', extra: true },
        { name: 'xp', label: 'XP', colour: '#0a5ee6', extra: true }
    ];

    // 16 x 16 tray icons
    const icons = {
        spring: "<circle cx='8' cy='4' r='3' fill='#f7a1c4'/><circle cx='12' cy='7.5' r='3' fill='#f7a1c4'/><circle cx='10.5' cy='12' r='3' fill='#f7a1c4'/><circle cx='5.5' cy='12' r='3' fill='#f7a1c4'/><circle cx='4' cy='7.5' r='3' fill='#f7a1c4'/><circle cx='8' cy='8.5' r='2' fill='#ffd84d'/>",
        summer: "<g stroke='#e8a200' stroke-width='1.6' stroke-linecap='round'><path d='M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3'/></g><circle cx='8' cy='8' r='3.6' fill='#ffd23f' stroke='#e8a200'/>",
        autumn: "<path d='M8 1C12 4 13 9 8 13C3 9 4 4 8 1Z' fill='#e8742a' stroke='#a0522d'/><path d='M8 4V15' stroke='#6b3410' stroke-width='1.2'/>",
        winter: "<g stroke='#2f6fb3' stroke-width='1.5' stroke-linecap='round'><path d='M8 1v14M2 4.5l12 7M2 11.5l12-7M6 2.5L8 4l2-1.5M6 13.5L8 12l2 1.5'/></g>",
        none: "<path d='M8 1l1.9 4.6L15 6l-3.8 3.3L12.3 15 8 12.3 3.7 15l1.1-5.7L1 6l5.1-.4Z' fill='#ff5fa2' stroke='#860c5d'/>",
        terminal: "<rect x='0.5' y='1.5' width='15' height='13' rx='1' fill='#000' stroke='#1fa83f'/><path d='M3 5.5l3 2.5-3 2.5' fill='none' stroke='#33ff66' stroke-width='1.5'/><path d='M8 11h5' stroke='#33ff66' stroke-width='1.5'/>",
        xp: "<path d='M1 3.5Q4 2 7.3 3.3V7.6Q4 6.4 1 7.8Z' fill='#f35325'/><path d='M8.7 3.6Q12 5 15 3.5V7.8Q12 9.2 8.7 7.9Z' fill='#81bc06'/><path d='M1 9.2Q4 7.8 7.3 9V13.3Q4 12 1 13.5Z' fill='#05a6f0'/><path d='M8.7 9.3Q12 10.6 15 9.2V13.5Q12 14.9 8.7 13.6Z' fill='#ffba08'/>"
    };
    const iconSvg = name => `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${icons[name]}</svg>`;

    function seasonFor(date) {
        const day = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        return seasons.find(s => s.from <= s.to
            ? day >= s.from && day <= s.to
            : day >= s.from || day <= s.to);
    }

    const today = seasonFor(new Date());

    function read(area, key) {
        try { return window[area].getItem(key); } catch (error) { return null; }
    }
    function write(area, key, value) {
        try {
            if (value === null) window[area].removeItem(key);
            else window[area].setItem(key, value);
        } catch (error) { /* storage blocked: the choice just isn't remembered */ }
    }

    // ?season= previews in this tab only
    const asked = new URLSearchParams(location.search).get('season');
    if (asked !== null) write('sessionStorage', 'season', asked);

    // 'auto' follows the date, 'none' is the original pink look
    function chosen() {
        return read('sessionStorage', 'season') || read('localStorage', 'seasonChoice') || 'auto';
    }

    function themeFor(choice) {
        if (choice === 'none') return original;
        return seasons.concat(extras).find(s => s.name === choice) || today || original;
    }

    // Seasons go in data-season, Terminal and XP in data-theme
    function apply(choice) {
        const theme = themeFor(choice);
        const root = document.documentElement;
        delete root.dataset.season;
        delete root.dataset.theme;
        if (theme.extra) root.dataset.theme = theme.name;
        else if (theme !== original) root.dataset.season = theme.name;
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme.colour;
        // Lets pages that draw their own colours (the algorithm visualiser) redraw
        document.dispatchEvent(new CustomEvent('themechange', { detail: theme.name }));
    }

    apply(chosen());

    // ---------- Theme icon and menu ----------
    function buildTray() {
        // Only on pages styled by css/style.css (the demos have their own look)
        if (!getComputedStyle(document.documentElement).getPropertyValue('--magenta').trim()) return;

        const tray = document.createElement('span');
        tray.className = 'tray';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tray-btn';
        button.setAttribute('aria-haspopup', 'menu');
        button.setAttribute('aria-expanded', 'false');

        const menu = document.createElement('div');
        menu.className = 'tray-menu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', 'Theme');
        menu.hidden = true;

        const heading = document.createElement('p');
        heading.className = 'tray-menu-title';
        heading.textContent = 'Theme';
        heading.setAttribute('aria-hidden', 'true');
        menu.appendChild(heading);

        const options = [{ value: 'auto', label: `Automatic (${today ? today.label : 'Original'})`, icon: today ? today.name : 'none' }]
            .concat(seasons.map(s => ({ value: s.name, label: s.label, icon: s.name })),
                [{ value: 'none', label: 'Original', icon: 'none' }],
                extras.map(t => ({ value: t.name, label: t.label, icon: t.name, gapBefore: t === extras[0] })));

        const items = options.map(option => {
            const item = document.createElement('button');
            item.type = 'button';
            item.setAttribute('role', 'menuitemradio');
            item.dataset.value = option.value;
            item.innerHTML = `<span class="tray-tick" aria-hidden="true"></span>${iconSvg(option.icon)}<span></span>`;
            item.lastChild.textContent = option.label;
            item.addEventListener('click', () => {
                write('sessionStorage', 'season', null);
                write('localStorage', 'seasonChoice', option.value === 'auto' ? null : option.value);
                apply(option.value);
                update();
                close(true);
            });
            const separator = () => menu.appendChild(Object.assign(document.createElement('hr'), { className: 'tray-sep' }));
            if (option.gapBefore) separator();
            menu.appendChild(item);
            if (option.value === 'auto') separator();
            return item;
        });

        function update() {
            const choice = chosen();
            const theme = themeFor(choice);
            const label = `Theme: ${theme.label}${choice === 'auto' ? ' (automatic)' : ''}. Change theme`;
            button.innerHTML = iconSvg(theme.name);
            button.setAttribute('aria-label', label);
            button.title = label.replace('. Change theme', '');
            items.forEach(item => item.setAttribute('aria-checked', String(item.dataset.value === choice)));
        }

        function open() {
            menu.hidden = false;
            button.setAttribute('aria-expanded', 'true');
            // Near the left edge of a narrow screen, open to the right instead
            menu.classList.remove('tray-menu-left');
            if (menu.getBoundingClientRect().left < 8) menu.classList.add('tray-menu-left');
            (items.find(item => item.getAttribute('aria-checked') === 'true') || items[0]).focus();
        }

        function close(returnFocus) {
            if (menu.hidden) return;
            menu.hidden = true;
            button.setAttribute('aria-expanded', 'false');
            if (returnFocus) button.focus();
        }

        button.addEventListener('click', () => (menu.hidden ? open() : close(false)));
        menu.addEventListener('keydown', event => {
            const at = items.indexOf(document.activeElement);
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const step = event.key === 'ArrowDown' ? 1 : -1;
                items[(at + step + items.length) % items.length].focus();
            } else if (event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                items[event.key === 'Home' ? 0 : items.length - 1].focus();
            } else if (event.key === 'Escape') {
                close(true);
            } else if (event.key === 'Tab') {
                close(false);
            }
        });
        document.addEventListener('click', event => {
            if (!tray.contains(event.target)) close(false);
        });

        tray.append(menu, button);
        update();

        // Beside the clock on the taskbar, like a system tray.
        // No taskbar: the end of the links strip that site-info.js adds to every page.
        const taskbar = document.querySelector('.taskbar');
        const clock = taskbar && taskbar.querySelector('.clock');
        if (clock) {
            clock.replaceWith(tray);
            tray.appendChild(clock);
        } else if (taskbar) {
            taskbar.appendChild(tray);
        } else {
            const strip = document.querySelector('.site-info');
            if (!strip) return;
            tray.classList.add('tray-in-strip');
            strip.appendChild(tray);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildTray);
    else buildTray();
})();
