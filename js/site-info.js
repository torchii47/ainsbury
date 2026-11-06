// Adds the "Report a problem / Terms / Privacy" strip to the bottom of every page,
// and gives other scripts reportLink() for "report this question" links.
// Load it in the <head>, straight after analytics.js.

(function () {
    // Where reports go. Put a form link ('https://forms.office.com/...') or an
    // email address here. Until it's set, pages/report.html says reporting isn't open yet.
    window.reportDestination = 'https://docs.google.com/forms/d/e/1FAIpQLSdzCm-d3ia0iyIavfqTjPhZzhsfvVx8TAeCMrkBVUoQfQ68zA/viewform';

    // This file is in js/, so the site root is one folder up
    const root = new URL('..', document.currentScript.src).href;

    // The link to the report page, filled in with this page and (optionally) a question
    window.reportLink = function (item) {
        const page = location.href.split(/[?#]/)[0].replace(root, '') || 'index.html';
        const details = new URLSearchParams({ page });
        if (item) details.set('item', item);
        return `${root}pages/report.html?${details}`;
    };

    // Offline support (see sw.js). Service workers only run on https
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        navigator.serviceWorker.register(`${root}sw.js`).catch(() => { /* the site still works online */ });
    }

    function addLink(bar, text, href, newTab) {
        const link = document.createElement('a');
        link.textContent = text;
        link.href = href;
        // A new tab, so reporting a problem doesn't interrupt a timed mock
        if (newTab) {
            link.target = '_blank';
            link.rel = 'noopener';
        }
        bar.appendChild(link);
    }

    document.addEventListener('DOMContentLoaded', () => {
        // The styles live here because the demo pages don't load css/style.css
        const style = document.createElement('style');
        style.textContent = `
            .site-info { flex-shrink: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 18px;
                padding: 6px 10px; background: #c0c0c0; color: #000; font: 14px Arial, Helvetica, sans-serif; }
            .site-info a { color: #00006e; text-decoration: underline; }
            @media print { .site-info { display: none; } }`;
        document.head.appendChild(style);

        const bar = document.createElement('nav');
        bar.className = 'site-info';
        bar.setAttribute('aria-label', 'Site information');
        addLink(bar, 'Search', `${root}pages/search.html`);
        addLink(bar, 'About', `${root}pages/about.html`);
        addLink(bar, 'Accessibility', `${root}pages/accessibility.html`);
        addLink(bar, 'Report a problem', window.reportLink(), true);
        addLink(bar, 'Terms of use', `${root}pages/terms.html`);
        addLink(bar, 'Privacy', `${root}pages/privacy.html`);
        (document.querySelector('.site') || document.body).appendChild(bar);
    });
})();
