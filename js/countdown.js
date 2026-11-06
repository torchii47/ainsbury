// Exam countdown plus "this week's revision" from the 8-week revision planner.
// Needs js/dates.js. Fills any element with class="exam-countdown".
//   data-course="gcse"   GCSE dates and planner (default is the T Level)
//   data-base            path to the guide's folder from the current page,
//                        e.g. "revision/" on the homepage or "" inside the guide

(function () {
    const courses = {
        tlevel: {
            dates: () => (typeof keyDates !== 'undefined' ? keyDates : []),
            paper1: /paper 1/i,
            paper2: /paper 2/i,
            extra: /^ESP/i,
            provisional: () => typeof keyDatesProvisional !== 'undefined' && keyDatesProvisional,
            // The two ESP weeks come after planner week 6, so the planner pauses for them.
            // Counted back from Paper 1, so check this if the ESP dates change.
            pause: {
                after: 6,
                weeks: 2,
                text: base => `<strong>ESP weeks:</strong> put your time into your <a href="${base}esp.html">ESP tasks</a>. The revision planner pauses until they're finished, so keep other revision light: just your <a href="${base}index.html#today">due flashcards</a>.`
            },
            // Same as the planner on revision/exams.html
            planner: [
                [['CA1 Problem solving', 'ca1.html'], ['CA5 Business context', 'ca5.html']],
                [['CA2.1–2.6 Data types to actions', 'ca2.html#s2-1'], ['CA6.1–6.6 Data and formats', 'ca6.html#s6-1']],
                [['CA2.7–2.12 Functions to testing', 'ca2.html#s2-7'], ['CA6.7–6.12 Data systems and models', 'ca6.html#s6-7']],
                [['CA3 Emerging issues', 'ca3.html'], ['CA7.1–7.3 Hardware, software, networks', 'ca7.html#s7-1']],
                [['CA4 Legislation', 'ca4.html'], ['CA7.4–7.6 Virtual, cloud, resilience', 'ca7.html#s7-4']],
                [['CA1 + CA2 retrieval quiz', 'ca1.html#quiz'], ['CA8 Security', 'ca8.html']],
                [['Mock Paper 1 (timed)', 'mock1.html'], ['Mock Paper 2 (timed)', 'mock2.html']],
                [['Re-do your weakest questions', 'index.html#progress'], ['Re-do your weakest questions', 'index.html#progress']]
            ],
            afterPaper1: [['CA5', 'ca5.html'], ['CA6', 'ca6.html'], ['CA7', 'ca7.html'], ['CA8', 'ca8.html'], ['Mock Paper 2', 'mock2.html']]
        },
        gcse: {
            dates: () => (typeof gcseDates !== 'undefined' ? gcseDates : []),
            paper1: /J277\/01/,
            paper2: /J277\/02/,
            extra: null,
            provisional: () => typeof gcseDatesProvisional !== 'undefined' && gcseDatesProvisional,
            // Same as the planner on gcse/exams.html
            planner: [
                [['1.1 Systems architecture', 'topic1-1.html'], ['2.1 Algorithms', 'topic2-1.html']],
                [['1.2 Memory and storage (units, binary, hex)', 'topic1-2.html#s1-2-3'], ['2.2 Programming fundamentals', 'topic2-2.html']],
                [['1.2 Images, sound and compression', 'topic1-2.html#s1-2-4c'], ['2.3 Producing robust programs', 'topic2-3.html']],
                [['1.3 Networks, connections and protocols', 'topic1-3.html'], ['2.4 Boolean logic', 'topic2-4.html']],
                [['1.4 Network security', 'topic1-4.html'], ['2.5 Languages and IDEs', 'topic2-5.html']],
                [['1.5 Systems software + 1.6 Impacts', 'topic1-5.html'], ['Practical programming tasks', 'programming.html']],
                [['Mock Paper 1 (timed)', 'mock1.html'], ['Mock Paper 2 (timed)', 'mock2.html']],
                [['Re-do your weakest questions', 'index.html#progress'], ['Re-do your weakest questions', 'index.html#progress']]
            ],
            afterPaper1: [['2.1', 'topic2-1.html'], ['2.2', 'topic2-2.html'], ['2.3', 'topic2-3.html'], ['2.4', 'topic2-4.html'], ['2.5', 'topic2-5.html'], ['Mock Paper 2', 'mock2.html']]
        }
    };

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
        const course = courses[holder.dataset.course] || courses.tlevel;
        const base = holder.dataset.base || '';
        const dates = course.dates()
            .map(item => Object.assign({}, item, { when: toDate(item.date) }))
            .sort((a, b) => a.when - b.when);

        const paper1 = dates.find(item => course.paper1.test(item.title));
        const paper2 = dates.find(item => course.paper2.test(item.title));
        const nextEsp = course.extra ? dates.find(item => course.extra.test(item.title) && daysUntil(item.when) >= 0) : null;

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
            const pause = course.pause;
            const pauseWeeks = pause ? pause.weeks : 0;
            const totalWeeks = course.planner.length + pauseWeeks;
            // Counts calendar days, so the clocks changing can't move it to the day before
            const plannerStart = new Date(paper1.when);
            plannerStart.setDate(plannerStart.getDate() - totalWeeks * 7);

            if (toPaper1 > totalWeeks * 7) {
                const break_ = pause ? ', with a break for the ESP' : '';
                plan = `The ${course.planner.length}-week revision planner starts on <strong>${nice(plannerStart)}</strong>${break_}. Until then, follow <a href="${base}index.html#today">today's revision</a>.`;
            } else if (toPaper1 >= 0) {
                const calendarWeek = Math.min(totalWeeks, totalWeeks - Math.floor((toPaper1 - 1) / 7));
                if (pause && calendarWeek > pause.after && calendarWeek <= pause.after + pauseWeeks) {
                    plan = pause.text(base);
                } else {
                    const week = pause && calendarWeek > pause.after ? calendarWeek - pauseWeeks : calendarWeek;
                    const [p1, p2] = course.planner[week - 1];
                    plan = `<strong>Revision planner week ${week} of ${course.planner.length}:</strong> Paper 1: ${link(base, p1)} · Paper 2: ${link(base, p2)}`;
                }
            } else if (paper2 && daysUntil(paper2.when) >= 0) {
                const links = course.afterPaper1.map(item => link(base, item));
                plan = `Paper 1 is done. Now focus on Paper 2: ${links.slice(0, -1).join(', ')} and ${links[links.length - 1]}.`;
            }
        }

        const note = course.provisional() ? '<p class="post-date">These dates are provisional. Check them with your school or college.</p>' : '';
        holder.innerHTML = `<ul class="countdown-list">${lines.join('')}</ul>${note}${plan ? `<p class="countdown-plan">${plan}</p>` : ''}`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.exam-countdown').forEach(render);
    });
})();
