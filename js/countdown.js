// Exam countdown plus "this week's revision" from the 8-week revision planner.
// Needs js/dates.js (keyDates). Fills any element with class="exam-countdown".
// Set data-base on that element to the path of the revision folder from the
// current page, e.g. data-base="revision/" on the homepage or "" inside it.

(function () {
    // Week-by-week plan from the revision guide (A5). Paths are inside revision/
    const planner = [
        [['CA1 Problem solving', 'ca1.html'], ['CA5 Business context', 'ca5.html']],
        [['CA2.1–2.6 Data types to actions', 'ca2.html#s2-1'], ['CA6.1–6.6 Data and formats', 'ca6.html#s6-1']],
        [['CA2.7–2.12 Functions to testing', 'ca2.html#s2-7'], ['CA6.7–6.12 Data systems and models', 'ca6.html#s6-7']],
        [['CA3 Emerging issues', 'ca3.html'], ['CA7.1–7.3 Hardware, software, networks', 'ca7.html#s7-1']],
        [['CA4 Legislation', 'ca4.html'], ['CA7.4–7.6 Virtual, cloud, resilience', 'ca7.html#s7-4']],
        [['CA1 + CA2 retrieval quiz', 'ca1.html#quiz'], ['CA8 Security', 'ca8.html']],
        [['Mock Paper 1 (timed)', 'mock1.html'], ['Mock Paper 2 (timed)', 'mock2.html']],
        [['Re-do your weakest questions', 'index.html#progress'], ['Re-do your weakest questions', 'index.html#progress']]
    ];

    function toDate(text) {
        const [y, m, d] = text.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    function nice(date) {
        return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }

    function daysUntil(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.round((date - today) / 86400000);
    }

    function link(base, [text, file]) {
        return `<a href="${base}${file}">${text}</a>`;
    }

    function render(holder) {
        const base = holder.dataset.base || '';
        const dates = (typeof keyDates !== 'undefined' ? keyDates : [])
            .map(item => Object.assign({}, item, { when: toDate(item.date) }))
            .sort((a, b) => a.when - b.when);

        const paper1 = dates.find(item => /paper 1/i.test(item.title));
        const paper2 = dates.find(item => /paper 2/i.test(item.title));
        const nextEsp = dates.find(item => /^ESP/i.test(item.title) && daysUntil(item.when) >= 0);

        const lines = [];
        [paper1, paper2, nextEsp].forEach(item => {
            if (!item) return;
            const days = daysUntil(item.when);
            if (days < 0) return;
            const label = days === 0 ? 'TODAY' : days === 1 ? 'tomorrow' : `${days} days`;
            lines.push(`<li><strong>${item.title}:</strong> <span class="countdown-days">${label}</span> <span class="post-date">(${nice(item.when)})</span></li>`);
        });

        if (!lines.length) {
            holder.innerHTML = '<p>No upcoming exams in the key dates list.</p>';
            return;
        }

        let plan = '';
        if (paper1) {
            const toPaper1 = daysUntil(paper1.when);
            const plannerStart = new Date(paper1.when.getTime() - 56 * 86400000);

            if (toPaper1 > 56) {
                plan = `The 8-week revision planner starts on <strong>${nice(plannerStart)}</strong>. Until then, rate yourself on each spec checklist and keep up with the questions.`;
            } else if (toPaper1 >= 0) {
                const week = Math.min(8, 8 - Math.floor((toPaper1 - 1) / 7));
                const [p1, p2] = planner[week - 1];
                plan = `<strong>Revision planner week ${week} of 8:</strong> Paper 1: ${link(base, p1)} · Paper 2: ${link(base, p2)}`;
            } else if (paper2 && daysUntil(paper2.when) >= 0) {
                plan = `Paper 1 is done. Now focus on Paper 2: ${link(base, ['CA5', 'ca5.html'])}, ${link(base, ['CA6', 'ca6.html'])}, ${link(base, ['CA7', 'ca7.html'])}, ${link(base, ['CA8', 'ca8.html'])} and ${link(base, ['Mock Paper 2', 'mock2.html'])}.`;
            }
        }

        holder.innerHTML = `<ul class="countdown-list">${lines.join('')}</ul>${plan ? `<p class="countdown-plan">${plan}</p>` : ''}`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.exam-countdown').forEach(render);
    });
})();
