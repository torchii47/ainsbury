// Page view counter using GoatCounter (no cookies, nothing personal stored).
// Stats: https://ainsbury.goatcounter.com
// Also logs clicks on links to other sites, e.g. student portfolios.

(function () {
    const GOATCOUNTER_CODE = 'ainsbury';

    if (GOATCOUNTER_CODE === 'YOUR-CODE') return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://gc.zgo.at/count.js';
    script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
    document.head.appendChild(script);

    // Links that leave the site show up as "outbound: ..." events
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="http"]');
        if (!link || link.hostname === location.hostname) return;
        if (!window.goatcounter || !window.goatcounter.count) return;
        window.goatcounter.count({
            path: `outbound: ${link.hostname}${link.pathname.replace(/\/$/, '')}`,
            title: link.textContent.trim(),
            event: true
        });
    });
})();
