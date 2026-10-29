/* ==========================================================
   Core Revision Guide: shared script for every page in /revision/
   It turns plain HTML into revision tools: contents, checklists,
   flashcards, mark schemes, self-marking, a mock timer and notes.
   Everything you tick, type or score is saved in THIS browser only
   (localStorage). Nothing is sent anywhere.
   ========================================================== */

// Every page in the guide, in reading order
const pages = [
    { id: 'index', file: 'index.html', short: 'Home', title: 'Guide home' },
    { id: 'exams', file: 'exams.html', short: 'Exams', title: 'Part A: Your exams' },
    { id: 'ca1', file: 'ca1.html', short: 'CA1', title: 'Problem Solving' },
    { id: 'ca2', file: 'ca2.html', short: 'CA2', title: 'Introduction to Programming' },
    { id: 'ca3', file: 'ca3.html', short: 'CA3', title: 'Emerging Issues' },
    { id: 'ca4', file: 'ca4.html', short: 'CA4', title: 'Legislation' },
    { id: 'ca5', file: 'ca5.html', short: 'CA5', title: 'Business Context' },
    { id: 'ca6', file: 'ca6.html', short: 'CA6', title: 'Data' },
    { id: 'ca7', file: 'ca7.html', short: 'CA7', title: 'Digital Environments' },
    { id: 'ca8', file: 'ca8.html', short: 'CA8', title: 'Security' },
    { id: 'esp', file: 'esp.html', short: 'ESP', title: 'Employer Set Project' },
    { id: 'specialism', file: 'specialism.html', short: 'OS', title: 'Occupational specialism' },
    { id: 'mock1', file: 'mock1.html', short: 'Mock 1', title: 'Mock Paper 1' },
    { id: 'mock2', file: 'mock2.html', short: 'Mock 2', title: 'Mock Paper 2' },
    { id: 'organisers', file: 'organisers.html', short: 'Print', title: 'All knowledge organisers' },
    { id: 'glossary', file: 'glossary.html', short: 'A–Z', title: 'Glossary' }
];

// Exam reminders from the guide, shown one at a time in the sidebar
const reminders = [
    ['Read the stem twice', 'Underline the command word, the number of marks and any context words before you start writing.'],
    ['Match the marks', "A 4-mark 'explain two' question wants two points, each with a linked reason. Separate them clearly."],
    ['Name the scenario', "In Section B, use the organisation's name and details in every answer. Generic answers are capped."],
    ["Explain, don't list", "Use 'because', 'so' and 'which means' to turn a point into an explanation."],
    ['Trace before you answer', 'For output questions, draw a quick trace table. It catches loop and condition errors.'],
    ['Check the code basics', 'Colons, brackets, indentation, == versus =, and converting input() to int or float.'],
    ['Balance discuss answers', "Give both sides. A conclusion isn't needed for 'discuss', but it is for 'evaluate'."],
    ['Judge with reasons', "For 'evaluate', finish with a clear judgement and the reason it outweighs the other side."],
    ['Watch the clock', "About 1.5 minutes per mark. Move on if you're stuck and come back at the end."],
    ['Use correct terms', "Write 'validation', 'authentication', 'latency' rather than everyday words. Precise terms earn marks."],
    ['Leave nothing blank', 'A sensible attempt can still earn a mark. A blank space never does.'],
    ['Cross out cleanly', "Draw a single line through work you don't want marked and write the replacement clearly."]
];

// Levels-based mark scheme descriptors (the same for every * question)
const levelText = [
    'No rewardable material.',
    'Isolated knowledge with limited understanding. Points are generic and not linked to the context. Little or no balance. Any judgement is unsupported.',
    'Accurate knowledge and understanding, mostly applied to the context. Some development of points and some consideration of both sides. Judgement or conclusion partly supported.',
    'Accurate, thorough knowledge applied throughout to the context. Well-developed, linked points that consider different sides. Judgement or conclusion clearly supported by the points made.'
];

const currentPage = document.body.dataset.page;

/* ----------------------------------------------------------
   Helpers
   ---------------------------------------------------------- */

// Saving is wrapped in try/catch because private windows can block it
function load(key, fallback) {
    try {
        const value = localStorage.getItem('rev:' + key);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function save(key, value) {
    try {
        localStorage.setItem('rev:' + key, JSON.stringify(value));
    } catch (error) {
        // The page still works, it just won't remember
    }
}

function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function makeButton(text, onClick) {
    const button = make('button', 'button', text);
    button.type = 'button';
    button.addEventListener('click', onClick);
    return button;
}

// A button that needs two clicks, for anything that deletes your work
function makeConfirmButton(text, onConfirm) {
    const button = makeButton(text, () => {
        if (button.dataset.armed) {
            onConfirm();
        } else {
            button.dataset.armed = 'yes';
            button.textContent = 'Click again to confirm';
            setTimeout(() => {
                delete button.dataset.armed;
                button.textContent = text;
            }, 3000);
        }
    });
    return button;
}

function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

/* ----------------------------------------------------------
   Navigation, contents sidebar and previous/next links
   ---------------------------------------------------------- */
function buildNav() {
    const nav = document.getElementById('rev-nav');
    if (!nav) return;

    const home = make('a', null, '← Main site');
    home.href = '../index.html';
    nav.appendChild(home);

    pages.forEach(page => {
        const link = make('a', 'tab-' + page.id, page.short);
        link.href = page.file;
        link.title = page.title;
        if (page.id === currentPage) link.setAttribute('aria-current', 'page');
        nav.appendChild(link);
    });
}

function buildSidebar() {
    const sidebar = document.getElementById('rev-toc');
    if (!sidebar) return;

    const headings = document.querySelectorAll('main section.window[id] > h2');

    if (headings.length > 1) {
        const details = make('details', 'toc-box');
        details.open = window.innerWidth > 900;
        details.appendChild(make('summary', null, 'On this page'));

        const list = make('ol');
        headings.forEach(heading => {
            const item = make('li');
            const link = make('a', null, heading.textContent);
            link.href = '#' + heading.parentElement.id;
            item.appendChild(link);
            list.appendChild(item);
        });
        details.appendChild(list);
        sidebar.appendChild(details);

        // Highlight the section you are reading
        if ('IntersectionObserver' in window) {
            const links = list.querySelectorAll('a');
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        links.forEach(link => {
                            link.classList.toggle('active', link.hash === '#' + entry.target.id);
                        });
                    }
                });
            }, { rootMargin: '0px 0px -70% 0px' });
            headings.forEach(heading => observer.observe(heading.parentElement));
        }
    }

    // Option to hide code outputs so you predict them first
    if (document.querySelector('pre.out')) {
        const label = make('label', 'toc-option');
        const box = make('input');
        box.type = 'checkbox';
        box.checked = load('opt:hideOutputs', true);
        box.addEventListener('change', () => {
            save('opt:hideOutputs', box.checked);
            document.querySelectorAll('.out-label .button').forEach(button => {
                if (button.dataset.shown === 'yes' === box.checked) button.click();
            });
        });
        label.append(box, ' Hide code outputs until I predict them');
        sidebar.appendChild(label);
    }

    // Random exam reminder, like the boxes in the printed guide
    const reminderBox = make('div', 'reminder-box');
    const title = make('strong', null, 'EXAM REMINDER');
    const text = make('p');
    let index = Math.floor(Math.random() * reminders.length);

    function showReminder() {
        text.innerHTML = '';
        text.append(make('b', null, reminders[index][0] + ': '), reminders[index][1]);
    }

    reminderBox.append(title, text, makeButton('Next reminder', () => {
        index = (index + 1) % reminders.length;
        showReminder();
    }));
    sidebar.appendChild(reminderBox);
    showReminder();
}

function buildPager() {
    const main = document.querySelector('main');
    const index = pages.findIndex(page => page.id === currentPage);
    if (!main || index < 0) return;

    const pager = make('nav', 'pager');
    pager.setAttribute('aria-label', 'Previous and next page');

    if (index > 0) {
        const prev = pages[index - 1];
        const link = make('a', 'button', '← ' + prev.short + ': ' + prev.title);
        link.href = prev.file;
        pager.appendChild(link);
    }

    if (index < pages.length - 1) {
        const next = pages[index + 1];
        const link = make('a', 'button pager-next', next.short + ': ' + next.title + ' →');
        link.href = next.file;
        pager.appendChild(link);
    }

    main.appendChild(pager);
}

/* ----------------------------------------------------------
   Spec checklist: rate each point Secure / Unsure / Revise
   ---------------------------------------------------------- */
function buildSpecChecklists() {
    document.querySelectorAll('table.spec').forEach(table => {
        const key = 'spec:' + currentPage;
        const ratings = load(key, {});
        const rows = [...table.querySelectorAll('tr')];
        const levels = ['secure', 'unsure', 'revise'];

        table.createTHead().innerHTML = '<tr><th>Ref</th><th>I can...</th><th>Secure</th><th>Unsure</th><th>Revise</th></tr>';

        rows.forEach((row, index) => {
            levels.forEach(level => {
                const cell = row.insertCell();
                const input = make('input');
                input.type = 'radio';
                input.name = currentPage + '-spec-' + index;
                input.value = level;
                input.checked = ratings[index] === level;
                input.setAttribute('aria-label', level + ': ' + row.cells[0].textContent);
                input.addEventListener('change', () => {
                    ratings[index] = level;
                    save(key, ratings);
                    update();
                });
                cell.appendChild(input);
            });
        });

        // Remember the wording so the guide home can list your 'Revise' points
        save('specText:' + currentPage, rows.map(row => [row.cells[0].textContent, row.cells[1].textContent]));

        const summary = make('p', 'spec-summary');
        const filterButton = makeButton('Show only Unsure and Revise', () => {
            const on = table.classList.toggle('only-weak');
            filterButton.textContent = on ? 'Show every point' : 'Show only Unsure and Revise';
        });
        const clearButton = makeConfirmButton('Clear my ratings', () => {
            Object.keys(ratings).forEach(k => delete ratings[k]);
            table.querySelectorAll('input').forEach(input => { input.checked = false; });
            save(key, ratings);
            update();
        });
        const controls = make('div', 'button-row');
        controls.append(filterButton, clearButton);
        table.after(summary, controls);

        function update() {
            const counts = { secure: 0, unsure: 0, revise: 0 };
            rows.forEach((row, index) => {
                row.className = ratings[index] ? 'rated-' + ratings[index] : '';
                if (ratings[index]) counts[ratings[index]]++;
            });
            const unrated = rows.length - counts.secure - counts.unsure - counts.revise;
            summary.textContent = `Secure: ${counts.secure} · Unsure: ${counts.unsure} · Revise: ${counts.revise} · Not rated: ${unrated}. Start with your 'Revise' points.`;
        }

        update();
    });
}

/* ----------------------------------------------------------
   Quick recall boxes: cover the definitions and test yourself
   ---------------------------------------------------------- */
function buildRecall() {
    document.querySelectorAll('dl.recall').forEach(list => {
        const box = make('div', 'recall-box');
        const head = make('div', 'recall-head');
        head.append(make('strong', null, 'QUICK RECALL'), make('span', null, 'Cover the definitions and test yourself.'));

        const button = makeButton('Cover definitions', () => {
            const covered = list.classList.toggle('covered');
            button.textContent = covered ? 'Show all definitions' : 'Cover definitions';
            list.querySelectorAll('dd').forEach(dd => {
                dd.classList.remove('shown');
                dd.tabIndex = covered ? 0 : -1;
            });
        });
        head.appendChild(button);

        list.before(box);
        box.append(head, list);

        function reveal(dd) {
            if (dd && list.classList.contains('covered')) dd.classList.toggle('shown');
        }

        list.addEventListener('click', event => reveal(event.target.closest('dd')));
        list.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                reveal(event.target.closest('dd'));
            }
        });
    });
}

/* ----------------------------------------------------------
   Flashcards. Used on every content area page (built from the
   quick recall boxes) and by the glossary page.
   cards is a list of [term, definition] pairs.

   Spaced repetition: each card sits in a box from 0 (new) to 5.
   "Got it" moves it up a box and hides it for longer each time;
   "Not yet" puts it back in box 1 and shows it again in a few cards.
   Progress is saved per term, so the same term on a content area
   page and in the glossary shares its progress.
   ---------------------------------------------------------- */
const srsDays = [0, 1, 3, 7, 14, 30];   // days until a card is due again, by box
const dayMs = 86400000;

function cardState(term) {
    return load('srs:' + term, { box: 0, due: 0 });
}

function makeFlashcards(holder, cards) {
    if (!cards.length) return;

    let dueOnly = load('opt:dueOnly', true);
    let order = [];
    let position = 0;
    let flipped = false;
    let termFirst = true;

    const card = make('button', 'flashcard');
    card.type = 'button';
    const face = make('span', 'flashcard-face');
    const hint = make('span', 'flashcard-hint');
    card.append(face, hint);
    const counter = make('span', 'flashcard-count');
    const stats = make('p', 'srs-stats');

    function buildOrder() {
        const now = Date.now();
        order = cards.map((c, index) => index).filter(index => !dueOnly || cardState(cards[index][0]).due <= now);
        position = 0;
        flipped = false;
    }

    function updateStats() {
        const now = Date.now();
        const count = { due: 0, fresh: 0, learning: 0, mastered: 0 };
        cards.forEach(([term]) => {
            const state = cardState(term);
            if (state.due <= now) count.due++;
            if (state.box === 0) count.fresh++;
            else if (state.box >= 4) count.mastered++;
            else count.learning++;
        });
        stats.textContent = `Due now: ${count.due} · New: ${count.fresh} · Learning: ${count.learning} · Mastered: ${count.mastered}`;
    }

    function show() {
        updateStats();
        rateRow.hidden = !flipped || !order.length;

        if (!order.length) {
            face.textContent = 'All caught up! 🎉';
            hint.textContent = 'NOTHING DUE · CHOOSE "ALL CARDS" TO KEEP PRACTISING';
            card.classList.remove('flipped');
            counter.textContent = '0 due';
            return;
        }

        const [term, definition] = cards[order[position]];
        const front = termFirst ? term : definition;
        const back = termFirst ? definition : term;
        face.textContent = flipped ? back : front;
        hint.textContent = flipped ? 'DID YOU KNOW IT? CHOOSE BELOW' : 'CLICK TO FLIP';
        card.classList.toggle('flipped', flipped);
        counter.textContent = `${position + 1} / ${order.length}`;
    }

    function move(step) {
        if (!order.length) return;
        position = (position + step + order.length) % order.length;
        flipped = false;
        show();
    }

    function rate(gotIt) {
        const index = order[position];
        const term = cards[index][0];
        const state = cardState(term);

        if (gotIt) {
            state.box = Math.min(5, state.box + 1);
            state.due = Date.now() + srsDays[state.box] * dayMs;
        } else {
            state.box = 1;
            state.due = Date.now();
        }
        save('srs:' + term, state);

        order.splice(position, 1);
        if (!gotIt) {
            // Bring it back three cards later
            order.splice(Math.min(position + 3, order.length), 0, index);
        } else if (!dueOnly) {
            order.push(index);
        }
        if (position >= order.length) position = 0;
        flipped = false;
        show();
    }

    card.addEventListener('click', () => {
        if (!order.length) return;
        flipped = !flipped;
        show();
    });

    const rateRow = make('div', 'button-row srs-rate');
    const gotButton = makeButton('✔ Got it', () => rate(true));
    gotButton.classList.add('srs-got');
    const notButton = makeButton('✘ Not yet', () => rate(false));
    notButton.classList.add('srs-not');
    rateRow.append(gotButton, notButton);

    const modeButton = makeButton('', () => {
        dueOnly = !dueOnly;
        save('opt:dueOnly', dueOnly);
        modeButton.textContent = dueOnly ? 'Showing: due cards' : 'Showing: all cards';
        buildOrder();
        show();
    });
    modeButton.textContent = dueOnly ? 'Showing: due cards' : 'Showing: all cards';

    const controls = make('div', 'button-row');
    controls.append(
        makeButton('◀ Prev', () => move(-1)),
        makeButton('Next ▶', () => move(1)),
        makeButton('Shuffle', () => {
            shuffle(order);
            position = 0;
            flipped = false;
            show();
        }),
        makeButton('Swap sides', () => {
            termFirst = !termFirst;
            flipped = false;
            show();
        }),
        modeButton,
        counter
    );

    const reset = makeConfirmButton('Reset progress for these cards', () => {
        cards.forEach(([term]) => {
            try { localStorage.removeItem('rev:srs:' + term); } catch (error) { /* ignore */ }
        });
        buildOrder();
        show();
    });
    reset.classList.add('srs-reset');

    buildOrder();
    holder.replaceChildren(card, rateRow, controls, stats, reset);

    // The glossary rebuilds its cards when you filter, so swap out the old key handler
    if (holder.keyHandler) holder.removeEventListener('keydown', holder.keyHandler);
    holder.keyHandler = event => {
        if (event.key === 'ArrowRight') move(1);
        if (event.key === 'ArrowLeft') move(-1);
    };
    holder.addEventListener('keydown', holder.keyHandler);
    show();
}

function buildPageFlashcards() {
    const cards = [...document.querySelectorAll('dl.recall dt')].map(dt => [
        dt.textContent.trim(),
        dt.nextElementSibling ? dt.nextElementSibling.textContent.trim() : ''
    ]);

    document.querySelectorAll('.flashcards:not([data-manual])').forEach(holder => makeFlashcards(holder, cards));
}

/* ----------------------------------------------------------
   Knowledge organiser: 'test me' mode blurs every fact
   ---------------------------------------------------------- */
function buildOrganisers() {
    document.querySelectorAll('.ko').forEach(organiser => {
        const button = makeButton('Test me: hide the facts', () => {
            const on = organiser.classList.toggle('quiz');
            button.textContent = on ? 'Show all the facts' : 'Test me: hide the facts';
            organiser.querySelectorAll('li').forEach(item => {
                item.classList.remove('seen');
                item.tabIndex = on ? 0 : -1;
            });
        });
        const row = make('div', 'button-row');
        const printLink = make('a', 'button', '🖨 Print every knowledge organiser');
        printLink.href = 'organisers.html';
        row.append(button, printLink);
        organiser.before(row);

        function reveal(item) {
            if (item && organiser.classList.contains('quiz')) item.classList.toggle('seen');
        }

        organiser.addEventListener('click', event => reveal(event.target.closest('li')));
        organiser.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                reveal(event.target.closest('li'));
            }
        });
    });
}

/* ----------------------------------------------------------
   Code: line numbers, copy button, and outputs you predict first
   ---------------------------------------------------------- */
// The original text of each code block, kept for Copy and the Python runner
const codeSources = new Map();

function buildCode() {
    document.querySelectorAll('pre.code').forEach(pre => {
        const source = pre.textContent.replace(/^\n/, '').replace(/\n\s*$/, '');
        codeSources.set(pre, source);
        pre.textContent = '';
        source.split('\n').forEach(line => pre.appendChild(make('span', 'ln', line)));

        const wrap = make('div', 'code-wrap');
        pre.before(wrap);
        wrap.appendChild(pre);

        if (navigator.clipboard) {
            const copy = make('button', 'copy-btn', 'Copy');
            copy.type = 'button';
            copy.addEventListener('click', () => {
                navigator.clipboard.writeText(source).then(() => {
                    copy.textContent = 'Copied!';
                    setTimeout(() => { copy.textContent = 'Copy'; }, 1500);
                }).catch(() => {});
            });
            wrap.appendChild(copy);
        }
    });

    const hideOutputs = load('opt:hideOutputs', true);

    document.querySelectorAll('pre.out').forEach(out => {
        out.textContent = out.textContent.replace(/^\n/, '').replace(/\n\s*$/, '');
        const label = make('div', 'out-label');
        const toggle = makeButton('', () => setShown(out.hidden));

        function setShown(shown) {
            out.hidden = !shown;
            toggle.dataset.shown = shown ? 'yes' : 'no';
            toggle.textContent = shown ? 'Hide output' : 'Predict the output, then show it';
        }

        label.append(make('strong', null, 'Output'), toggle);
        out.before(label);
        setShown(!hideOutputs);
    });
}

/* ----------------------------------------------------------
   Questions: write an answer, reveal the mark scheme, mark yourself
   ---------------------------------------------------------- */
function buildLevels() {
    document.querySelectorAll('.levels').forEach(holder => {
        const max = Number(holder.dataset.max);
        const band = max / 3;
        const rows = levelText.map((text, level) => {
            const marks = level === 0 ? '0' : `${(level - 1) * band + 1}–${level * band}`;
            return `<tr><td>${level}</td><td>${marks}</td><td>${text}</td></tr>`;
        }).join('');
        holder.innerHTML = `<table><thead><tr><th>Level</th><th>Marks</th><th>Descriptor</th></tr></thead><tbody>${rows}</tbody></table>`;
    });
}

function buildQuestionSets() {
    document.querySelectorAll('.qset').forEach(set => {
        const id = set.dataset.set;
        const locked = set.hasAttribute('data-locked') && !load('finished:' + id, false);
        const scores = load('score:' + id, {});
        const answers = load('answer:' + id, {});
        const questions = [...set.querySelectorAll('.q')];
        const total = questions.reduce((sum, q) => sum + Number(q.dataset.m), 0);
        save('total:' + id, total);

        const board = make('div', 'scoreboard');
        const scoreText = make('span', 'score-text');
        const showAll = makeButton('Show all mark schemes', () => {
            set.querySelectorAll('.ms-toggle').forEach(button => {
                if (button.dataset.open !== 'yes') button.click();
            });
        });
        showAll.classList.add('ms-all');
        showAll.hidden = locked;
        const reset = makeConfirmButton('Clear my answers and marks', () => {
            save('score:' + id, {});
            save('answer:' + id, {});
            save('finished:' + id, false);
            save('timer:' + id, null);
            location.reload();
        });
        board.append(scoreText, showAll, reset);
        set.prepend(board);

        function updateScore() {
            let got = 0;
            let possible = 0;
            questions.forEach(q => {
                if (scores[q.dataset.n] !== undefined) {
                    got += scores[q.dataset.n];
                    possible += Number(q.dataset.m);
                }
            });
            scoreText.textContent = possible
                ? `My score: ${got} / ${possible} marked so far (${Math.round(got / possible * 100)}%) · Total for the set: ${total} marks`
                : `Total: ${total} marks. Check each mark scheme, then give yourself a mark to see your score.`;
            save('score:' + id, scores);
        }

        questions.forEach((q, index) => {
            if (!q.dataset.n) q.dataset.n = String(index + 1);
            const n = q.dataset.n;
            const marks = Number(q.dataset.m);

            q.prepend(make('span', 'q-num', n));
            const first = q.querySelector('p');
            const tag = make('span', 'q-marks', `[${marks} mark${marks === 1 ? '' : 's'}]`);
            (first || q).append(' ', tag);

            const scheme = q.querySelector('.ms');
            const answer = make('textarea', 'q-answer');
            answer.rows = marks >= 6 ? 7 : marks >= 3 ? 4 : 2;
            answer.placeholder = 'Write your answer here (saved on this device)';
            answer.value = answers[n] || '';
            answer.setAttribute('aria-label', 'Your answer to question ' + n);
            answer.addEventListener('input', () => {
                answers[n] = answer.value;
                save('answer:' + id, answers);
            });

            const row = make('div', 'button-row q-tools');
            const toggle = makeButton('Show mark scheme', () => {
                scheme.hidden = !scheme.hidden;
                toggle.dataset.open = scheme.hidden ? 'no' : 'yes';
                toggle.textContent = scheme.hidden ? 'Show mark scheme' : 'Hide mark scheme';
            });
            toggle.classList.add('ms-toggle');
            toggle.hidden = locked;

            const markLabel = make('label', 'q-self', 'My mark: ');
            const select = make('select', 'quiz-select');
            select.append(new Option('–', ''));
            for (let k = 0; k <= marks; k++) select.append(new Option(String(k), String(k)));
            select.value = scores[n] !== undefined ? String(scores[n]) : '';
            select.addEventListener('change', () => {
                if (select.value === '') delete scores[n];
                else scores[n] = Number(select.value);
                updateScore();
            });
            markLabel.append(select, ` / ${marks}`);

            row.append(toggle, markLabel);
            if (scheme) {
                scheme.hidden = true;
                scheme.before(answer, row);
            } else {
                toggle.remove();
                q.append(answer, row);
            }
        });

        updateScore();
    });
}

/* ----------------------------------------------------------
   Mock papers: 2 h 15 min timer and locked mark schemes
   ---------------------------------------------------------- */
function buildMockBar() {
    const bar = document.getElementById('mock-bar');
    if (!bar) return;

    const id = currentPage;
    const limit = 135 * 60;
    let remaining = load('timer:' + id, null);
    if (remaining === null) remaining = limit;
    let timer = null;

    const display = make('span', 'clock mock-clock');
    const status = make('span', 'mock-status');

    function render() {
        const h = Math.floor(remaining / 3600);
        const m = Math.floor(remaining % 3600 / 60);
        const s = remaining % 60;
        display.textContent = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        const used = (limit - remaining) / 60;
        if (remaining === 0) status.textContent = "Time's up! Pens down.";
        else if (used < 5) status.textContent = 'First 5 min: read the paper.';
        else if (used < 45) status.textContent = 'Section A (30 marks): about 40 min.';
        else if (used < 125) status.textContent = 'Section B (60 marks): about 80 min.';
        else status.textContent = 'Last 10 min: check your answers.';
    }

    function stop() {
        clearInterval(timer);
        timer = null;
        startButton.textContent = remaining === limit ? 'Start timer' : 'Resume';
    }

    const startButton = makeButton('Start timer', () => {
        if (timer) {
            stop();
            return;
        }
        timer = setInterval(() => {
            remaining = Math.max(0, remaining - 1);
            save('timer:' + id, remaining);
            render();
            if (remaining === 0) stop();
        }, 1000);
        startButton.textContent = 'Pause';
    });

    const resetButton = makeConfirmButton('Reset timer', () => {
        stop();
        remaining = limit;
        save('timer:' + id, remaining);
        render();
        startButton.textContent = 'Start timer';
    });

    const finishButton = makeConfirmButton("I've finished: show mark schemes", () => {
        stop();
        save('finished:' + id, true);
        document.querySelectorAll('.ms-toggle, .ms-all').forEach(button => { button.hidden = false; });
        finishButton.hidden = true;
        status.textContent = 'Mark schemes unlocked. Mark each answer with the drop-down.';
    });
    finishButton.hidden = load('finished:' + id, false);

    if (remaining !== limit) startButton.textContent = 'Resume';
    bar.append(display, startButton, resetButton, finishButton, status);
    render();
}

/* ----------------------------------------------------------
   Saved fields: any checkbox or textarea with data-save
   ---------------------------------------------------------- */
function buildSavedFields() {
    document.querySelectorAll('[data-save]').forEach(field => {
        const key = 'field:' + field.dataset.save;
        if (field.type === 'checkbox') {
            field.checked = load(key, false);
            field.addEventListener('change', () => save(key, field.checked));
        } else {
            field.value = load(key, '');
            field.addEventListener('input', () => save(key, field.value));
        }
    });
}

/* ----------------------------------------------------------
   Sorters: match each scenario to the right answer.
   <div class="sorter" data-options="A|B|C">
       <p data-a="B">A scenario...</p>
   </div>
   ---------------------------------------------------------- */
function buildSorters() {
    document.querySelectorAll('.sorter').forEach(sorter => {
        const options = sorter.dataset.options.split('|');
        const items = [...sorter.querySelectorAll('p[data-a]')];
        const table = make('table');
        table.innerHTML = '<thead><tr><th>Scenario</th><th>Your answer</th><th>Result</th></tr></thead>';
        const body = table.createTBody();
        const score = make('p', 'spec-summary');
        let correct = 0;

        items.forEach(item => {
            const row = body.insertRow();
            row.insertCell().textContent = item.textContent;
            const select = make('select', 'quiz-select');
            select.append(new Option('Choose...', ''));
            options.forEach(option => select.append(new Option(option, option)));
            select.setAttribute('aria-label', 'Answer for: ' + item.textContent);
            row.insertCell().appendChild(select);
            const result = row.insertCell();
            let wasRight = false;

            select.addEventListener('change', () => {
                const right = select.value === item.dataset.a;
                result.textContent = right ? '✔ Correct' : `✘ It's ${item.dataset.a}`;
                if (right !== wasRight) correct += right ? 1 : -1;
                wasRight = right;
                score.textContent = `${correct} / ${items.length} correct`;
            });
        });

        sorter.replaceChildren(table, score);
    });
}

// Wide tables scroll sideways on phones instead of breaking the page
function wrapTables() {
    document.querySelectorAll('main table').forEach(table => {
        if (table.parentElement.classList.contains('table-wrap')) return;
        const wrap = make('div', 'table-wrap');
        table.before(wrap);
        wrap.appendChild(table);
    });
}

/* ----------------------------------------------------------
   Guide home: progress dashboard and search
   ---------------------------------------------------------- */
function buildDashboard() {
    const holder = document.getElementById('dashboard');
    if (!holder) return;

    const table = make('table');
    table.innerHTML = '<thead><tr><th>Part</th><th>Spec checklist</th><th>Questions</th><th>Quiz me</th></tr></thead>';
    const body = table.createTBody();
    const reviseList = make('ul', 'revise-list');

    pages.filter(page => page.id.startsWith('ca') || page.id.startsWith('mock')).forEach(page => {
        const row = body.insertRow();
        const nameCell = row.insertCell();
        const link = make('a', null, page.short + ': ' + page.title);
        link.href = page.file;
        nameCell.appendChild(link);

        const specCell = row.insertCell();
        const specText = load('specText:' + page.id, null);
        if (page.id.startsWith('mock')) {
            specCell.textContent = '–';
        } else if (!specText) {
            specCell.textContent = 'Not opened yet';
        } else {
            const ratings = load('spec:' + page.id, {});
            const counts = { secure: 0, unsure: 0, revise: 0 };
            Object.values(ratings).forEach(level => counts[level]++);

            const bar = make('div', 'mini-bar');
            ['secure', 'unsure', 'revise'].forEach(level => {
                const part = make('span', 'mini-' + level);
                part.style.width = (counts[level] / specText.length * 100) + '%';
                bar.appendChild(part);
            });
            specCell.append(bar, `${counts.secure} secure, ${counts.unsure} unsure, ${counts.revise} revise (of ${specText.length})`);

            Object.entries(ratings).forEach(([index, level]) => {
                if (level === 'revise' && specText[index]) {
                    const item = make('li');
                    const revLink = make('a', null, `${page.short} ${specText[index][0]}`);
                    revLink.href = page.file + '#spec';
                    item.append(revLink, ' ' + specText[index][1]);
                    reviseList.appendChild(item);
                }
            });
        }

        const scoreCell = row.insertCell();
        const scores = Object.values(load('score:' + page.id, {}));
        const total = load('total:' + page.id, null);
        if (!scores.length) {
            scoreCell.textContent = total ? `Not marked yet (${total} marks)` : 'Not started';
        } else {
            const got = scores.reduce((a, b) => a + b, 0);
            scoreCell.textContent = `${got} marks from ${scores.length} question${scores.length === 1 ? '' : 's'} marked${total ? ' · set total ' + total : ''}`;
        }

        const quizCell = row.insertCell();
        const quiz = load('quiz:' + page.id, null);
        quizCell.textContent = page.id.startsWith('mock') ? '–' : quiz && quiz.asked ? `${quiz.right} / ${quiz.asked} right` : 'Not tried';
    });

    holder.replaceChildren(table);
    const listHolder = document.getElementById('revise-list');
    if (listHolder) {
        if (reviseList.children.length) listHolder.replaceChildren(reviseList);
        else listHolder.textContent = "Nothing on your 'Revise' list yet. Rate yourself on each content area's spec checklist and your 'Revise' points will appear here.";
    }
}

function buildSearch() {
    const form = document.getElementById('search-form');
    if (!form) return;

    const input = form.querySelector('input');
    const results = document.getElementById('search-results');
    let index = null;

    async function getIndex() {
        if (index) return index;
        const parser = new DOMParser();
        const entries = [];
        for (const page of pages) {
            if (page.id === 'index') continue;
            const response = await fetch(page.file);
            const doc = parser.parseFromString(await response.text(), 'text/html');
            doc.querySelectorAll('main section.window[id]').forEach(section => {
                const heading = section.querySelector('h2');
                entries.push({
                    page,
                    id: section.id,
                    title: heading ? heading.textContent : page.title,
                    text: section.textContent.replace(/\s+/g, ' ')
                });
            });
        }
        index = entries;
        return entries;
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const query = input.value.trim().toLowerCase();
        if (query.length < 2) {
            results.textContent = 'Type at least two letters.';
            return;
        }
        results.textContent = 'Searching...';

        try {
            const words = query.split(/\s+/);
            const matches = (await getIndex()).filter(entry => {
                const text = entry.text.toLowerCase();
                return words.every(word => text.includes(word));
            });

            if (!matches.length) {
                results.textContent = `No sections mention "${input.value.trim()}". Try a shorter word, or check the glossary.`;
                return;
            }

            const list = make('ul', 'search-list');
            matches.slice(0, 40).forEach(entry => {
                const item = make('li');
                const link = make('a', null, `${entry.page.short} · ${entry.title}`);
                link.href = entry.page.file + '#' + entry.id;
                const at = entry.text.toLowerCase().indexOf(words[0]);
                const start = Math.max(0, at - 60);
                const snippet = (start > 0 ? '…' : '') + entry.text.slice(start, at + 100) + '…';
                item.append(link, make('span', 'search-snippet', snippet));
                list.appendChild(item);
            });
            results.replaceChildren(make('p', null, `${matches.length} section${matches.length === 1 ? '' : 's'} found${matches.length > 40 ? ' (showing the first 40)' : ''}:`), list);
        } catch (error) {
            results.textContent = 'Search reads the other pages of the guide, so it only works when the site is online (not opened from a file). Use Ctrl+F on a page instead.';
        }
    });
}

/* ----------------------------------------------------------
   Quiz me: random questions from the site's question bank
   (js/questions.js + js/question-bank.js) for one content area.
   <div class="quiz-me" data-area="1"></div>
   ---------------------------------------------------------- */
function buildQuiz() {
    document.querySelectorAll('.quiz-me').forEach(holder => {
        if (typeof questionBank === 'undefined' || !questionBank.length) {
            holder.textContent = 'The question bank did not load.';
            return;
        }

        const area = Number(holder.dataset.area);
        const key = 'quiz:ca' + area;
        const tally = load(key, { right: 0, asked: 0 });
        const pool = questionBank.filter(q => q.area === area);
        const topics = [...new Set(pool.map(q => q.mainTopic))].sort(compareTopics);

        const topicSelect = make('select', 'quiz-select');
        topicSelect.append(new Option(`All topics (${pool.length} questions)`, ''));
        topics.forEach(topic => {
            const count = pool.filter(q => q.mainTopic === topic).length;
            topicSelect.append(new Option(`${topic} (${count})`, topic));
        });
        topicSelect.setAttribute('aria-label', 'Topic');

        const typeSelect = make('select', 'quiz-select');
        typeSelect.append(new Option('All question types', ''));
        Object.entries(questionTypeNames).forEach(([value, text]) => {
            if (pool.some(q => q.type === value)) typeSelect.append(new Option(text, value));
        });
        typeSelect.setAttribute('aria-label', 'Question type');

        const meta = make('p', 'quiz-meta');
        const question = make('p', 'quiz-question');
        const options = make('ul', 'quiz-options');
        const answerBox = make('div', 'quiz-answer');
        const answerText = make('p');
        answerBox.append(make('strong', null, 'Answer'), answerText);
        const tallyText = make('span', 'spec-summary');

        const showButton = makeButton('Show answer', () => {
            answerBox.hidden = false;
            showButton.hidden = true;
            selfRow.hidden = answered;
        });
        const selfRow = make('div', 'button-row');
        selfRow.append(
            make('span', null, 'Did you get it? '),
            makeButton('✔ Yes', () => record(true)),
            makeButton('✘ Not yet', () => record(false))
        );

        let current = null;
        let answered = false;

        function updateTally() {
            tallyText.textContent = tally.asked
                ? `Your score for CA${area}: ${tally.right} / ${tally.asked} (${Math.round(tally.right / tally.asked * 100)}%)`
                : `Your score for CA${area} will show here.`;
        }

        function record(right) {
            if (answered) return;
            answered = true;
            tally.asked++;
            if (right) tally.right++;
            save(key, tally);
            selfRow.hidden = true;
            updateTally();
        }

        function next() {
            const choices = pool.filter(q =>
                (!topicSelect.value || q.mainTopic === topicSelect.value) &&
                (!typeSelect.value || q.type === typeSelect.value));
            if (!choices.length) {
                meta.textContent = '';
                question.textContent = 'No questions match. Choose a different topic or type.';
                options.replaceChildren();
                showButton.hidden = true;
                answerBox.hidden = true;
                selfRow.hidden = true;
                return;
            }

            let pick = choices[Math.floor(Math.random() * choices.length)];
            if (choices.length > 1) {
                while (pick === current) pick = choices[Math.floor(Math.random() * choices.length)];
            }
            current = pick;
            answered = false;

            const marks = Number(pick.marks) || 1;
            meta.textContent = `${pick.mainTopic} · ${questionTypeNames[pick.type] || pick.type} · ${marks} mark${marks === 1 ? '' : 's'}`;
            question.textContent = pick.question;
            answerText.textContent = pick.answer;
            answerBox.hidden = true;
            selfRow.hidden = true;
            options.replaceChildren();

            const mcq = questionOptions(pick);
            showButton.hidden = Boolean(mcq);
            if (mcq) {
                mcq.options.forEach((text, index) => {
                    const item = make('li');
                    const button = makeButton(`${String.fromCharCode(65 + index)}. ${text}`, () => {
                        options.querySelectorAll('button').forEach((b, i) => {
                            b.disabled = true;
                            if (i === mcq.correct) b.classList.add('correct');
                            else if (i === index) b.classList.add('wrong');
                        });
                        answerBox.hidden = false;
                        record(index === mcq.correct);
                    });
                    button.classList.add('quiz-option');
                    item.appendChild(button);
                    options.appendChild(item);
                });
            }
        }

        topicSelect.addEventListener('change', next);
        typeSelect.addEventListener('change', next);

        const top = make('div', 'button-row');
        top.append(topicSelect, typeSelect, makeButton('Next question ▶', next));
        const bottom = make('div', 'button-row');
        bottom.append(tallyText, makeConfirmButton('Reset score', () => {
            tally.right = 0;
            tally.asked = 0;
            save(key, tally);
            updateTally();
        }));

        holder.replaceChildren(top, meta, question, options, showButton, answerBox, selfRow, bottom);
        updateTally();
        next();
    });
}

/* ----------------------------------------------------------
   Guide home: back up progress to a file, load it on another
   computer, and copy a short summary to send to your teacher
   ---------------------------------------------------------- */
function progressSummary(name) {
    const lines = [`Core Revision Guide progress${name ? ' for ' + name : ''} (${new Date().toLocaleDateString('en-GB')})`, ''];
    const revise = [];

    pages.filter(page => page.id.startsWith('ca') || page.id.startsWith('mock')).forEach(page => {
        const parts = [];
        const specText = load('specText:' + page.id, null);
        if (specText) {
            const counts = { secure: 0, unsure: 0, revise: 0 };
            const ratings = load('spec:' + page.id, {});
            Object.entries(ratings).forEach(([index, level]) => {
                counts[level]++;
                if (level === 'revise' && specText[index]) revise.push(`${page.short} ${specText[index][0]}: ${specText[index][1]}`);
            });
            parts.push(`checklist ${counts.secure} secure, ${counts.unsure} unsure, ${counts.revise} revise (of ${specText.length})`);
        }
        const scores = Object.values(load('score:' + page.id, {}));
        if (scores.length) {
            const total = load('total:' + page.id, null);
            parts.push(`questions ${scores.reduce((a, b) => a + b, 0)} marks from ${scores.length} marked${total ? ' (set total ' + total + ')' : ''}`);
        }
        const quiz = load('quiz:' + page.id, null);
        if (quiz && quiz.asked) parts.push(`quiz ${quiz.right}/${quiz.asked}`);
        lines.push(`${page.short} ${page.title}: ${parts.length ? parts.join('; ') : 'not started'}`);
    });

    lines.push('', revise.length ? 'My Revise list:' : 'My Revise list: (empty)');
    revise.forEach(item => lines.push('- ' + item));
    return lines.join('\n');
}

function buildBackup() {
    const holder = document.getElementById('backup');
    if (!holder) return;

    const status = make('p', 'spec-summary');
    status.setAttribute('aria-live', 'polite');

    // Export: every saved value from the guide, plus display settings
    const exportButton = makeButton('💾 Download my progress file', () => {
        const data = {};
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('rev:')) data[key] = localStorage.getItem(key);
            }
        } catch (error) {
            status.textContent = 'Your browser is blocking saved data, so there is nothing to download.';
            return;
        }
        const file = JSON.stringify({ app: 'core-revision-guide', version: 1, exported: new Date().toISOString(), data });
        const link = make('a');
        link.href = URL.createObjectURL(new Blob([file], { type: 'application/json' }));
        link.download = `revision-progress-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        status.textContent = `Downloaded ${Object.keys(data).length} saved items. Keep the file somewhere safe, e.g. your OneDrive.`;
    });

    // Import: read the file, check it, then replace what's saved here
    const fileInput = make('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.hidden = true;
    let pending = null;

    const applyButton = makeConfirmButton('Replace my progress with this file', () => {
        try {
            Object.keys(localStorage).filter(key => key.startsWith('rev:')).forEach(key => localStorage.removeItem(key));
            Object.entries(pending.data).forEach(([key, value]) => {
                if (key.startsWith('rev:')) localStorage.setItem(key, value);
            });
            status.textContent = 'Progress loaded. Reloading...';
            setTimeout(() => location.reload(), 600);
        } catch (error) {
            status.textContent = 'Could not save the progress in this browser.';
        }
    });
    applyButton.hidden = true;

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        file.text().then(text => {
            const parsed = JSON.parse(text);
            if (parsed.app !== 'core-revision-guide' || typeof parsed.data !== 'object') throw new Error('wrong file');
            pending = parsed;
            applyButton.hidden = false;
            status.textContent = `This file was saved on ${new Date(parsed.exported).toLocaleString('en-GB')} with ${Object.keys(parsed.data).length} items. Loading it replaces the progress saved in this browser.`;
        }).catch(() => {
            pending = null;
            applyButton.hidden = true;
            status.textContent = "That isn't a Core Revision Guide progress file.";
        });
        fileInput.value = '';
    });

    const importButton = makeButton('📂 Load a progress file', () => fileInput.click());

    // Summary to paste into Teams, Forms or an email
    const nameLabel = make('label', 'sub-label', 'Your name: ');
    const nameInput = make('input', 'quiz-select');
    nameInput.dataset.save = 'summary-name';
    nameLabel.appendChild(nameInput);
    const summaryBox = make('textarea', 'q-answer');
    summaryBox.rows = 10;
    summaryBox.readOnly = true;
    summaryBox.setAttribute('aria-label', 'Progress summary');
    summaryBox.hidden = true;
    const summaryButton = makeButton('📋 Make my progress summary', () => {
        summaryBox.value = progressSummary(nameInput.value.trim());
        summaryBox.hidden = false;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(summaryBox.value)
                .then(() => { status.textContent = 'Summary copied. Paste it wherever your teacher asked.'; })
                .catch(() => { status.textContent = 'Select the summary below and copy it.'; });
        } else {
            status.textContent = 'Select the summary below and copy it.';
        }
    });

    const backupRow = make('div', 'button-row');
    backupRow.append(exportButton, importButton, applyButton, fileInput);
    const summaryRow = make('div', 'button-row');
    summaryRow.append(nameLabel, summaryButton);

    holder.append(make('h3', null, 'Move your progress to another computer'), backupRow,
        make('h3', null, 'Send your progress to your teacher'), summaryRow, summaryBox, status);
}

/* ----------------------------------------------------------
   Run Python in the browser with Pyodide (Python compiled to
   WebAssembly). It runs in a Web Worker so a stuck loop can be
   stopped without freezing the page. Downloads about 10 MB the
   first time, then the browser caches it.
   ---------------------------------------------------------- */
const pyodideUrl = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
let pyWorker = null;
let pyReady = null;
let pyBusy = false;

// Python run before each program: answers input() from the Inputs box
const pySetup = [
    'import builtins, os, warnings',
    "os.environ['MPLBACKEND'] = 'AGG'",
    "warnings.filterwarnings('ignore', message='.*non-interactive.*')",
    '_queue = list(_input_lines)',
    "def _input(prompt=''):",
    '    if not _queue:',
    "        raise EOFError('No more inputs. Add another line to the Inputs box.')",
    '    value = _queue.pop(0)',
    '    print(str(prompt) + value)',
    '    return value',
    'builtins.input = _input'
].join('\n');

// Python run after each program: turns any matplotlib charts into images
const pySaveFigures = [
    'import sys',
    '_images = []',
    "if 'matplotlib.pyplot' in sys.modules:",
    '    import io, base64',
    '    import matplotlib.pyplot as _plt',
    '    for _number in _plt.get_fignums():',
    '        _buffer = io.BytesIO()',
    "        _plt.figure(_number).savefig(_buffer, format='png', dpi=90, bbox_inches='tight')",
    '        _images.append(base64.b64encode(_buffer.getvalue()).decode())',
    "    _plt.close('all')",
    '_images'
].join('\n');

const pyWorkerSource = [
    `importScripts('${pyodideUrl}pyodide.js');`,
    `const ready = loadPyodide({ indexURL: '${pyodideUrl}' });`,
    "ready.then(() => postMessage({ type: 'ready' }), error => postMessage({ type: 'failed', text: String(error) }));",
    'function tidy(error) {',
    "    const lines = String(error.message || error).split('\\n');",
    "    const start = lines.findIndex(line => line.includes('File \"<exec>\"'));",
    "    return (start >= 0 ? ['Traceback (most recent call last):'].concat(lines.slice(start)) : lines).join('\\n').trim() + '\\n';",
    '}',
    'onmessage = async event => {',
    '    const { code, inputs, setup, saveFigures } = event.data;',
    '    const py = await ready;',
    "    py.setStdout({ batched: text => postMessage({ type: 'out', text: text + '\\n' }) });",
    "    py.setStderr({ batched: text => postMessage({ type: 'out', text: text + '\\n' }) });",
    '    try {',
    "        postMessage({ type: 'status', text: 'Loading any libraries the code imports...' });",
    '        await py.loadPackagesFromImports(code);',
    "        postMessage({ type: 'status', text: 'Running...' });",
    "        py.globals.set('_input_lines', py.toPy(inputs));",
    '        py.runPython(setup);',
    "        const namespace = py.globals.get('dict')();",
    '        await py.runPythonAsync(code, { globals: namespace });',
    '        const images = py.runPython(saveFigures).toJs();',
    "        images.forEach(data => postMessage({ type: 'img', data }));",
    "        postMessage({ type: 'done' });",
    '    } catch (error) {',
    "        postMessage({ type: 'out', text: tidy(error) });",
    "        postMessage({ type: 'done', error: true });",
    '    }',
    '};'
].join('\n');

function getPython() {
    if (pyReady) return pyReady;
    pyWorker = new Worker(URL.createObjectURL(new Blob([pyWorkerSource], { type: 'text/javascript' })));
    const worker = pyWorker;
    pyReady = new Promise((resolve, reject) => {
        const handler = event => {
            if (event.data.type === 'ready') {
                worker.removeEventListener('message', handler);
                resolve(worker);
            } else if (event.data.type === 'failed') {
                reject(new Error('Python could not load: ' + event.data.text));
            }
        };
        worker.addEventListener('message', handler);
        worker.addEventListener('error', () => reject(new Error('Python could not load. It needs an internet connection the first time.')));
    });
    return pyReady;
}

function stopPython() {
    if (pyWorker) pyWorker.terminate();
    pyWorker = null;
    pyReady = null;
    pyBusy = false;
}

// Work out what was typed in the example output, so the Inputs box starts filled in
function guessInputs(source, outText) {
    const prompts = [...source.matchAll(/input\(\s*"([^"]*)"/g)]
        .map(match => match[1].trimEnd())
        .sort((a, b) => b.length - a.length);
    const answers = [];
    outText.split('\n').forEach(line => {
        const prompt = prompts.find(p => p && line.startsWith(p));
        if (prompt) answers.push(line.slice(prompt.length).replace(/^ /, ''));
    });
    return answers.join('\n');
}

function buildRunners() {
    document.querySelectorAll('.code-wrap').forEach(wrap => {
        const pre = wrap.querySelector('pre.code');
        if (!pre || pre.classList.contains('no-run')) return;
        const source = codeSources.get(pre);
        const needsInput = /\binput\(/.test(source);

        // The shown output (if any) sits just after the code
        let next = wrap.nextElementSibling;
        if (next && next.classList.contains('out-label')) next = next.nextElementSibling;
        const shownOutput = next && next.matches('pre.out') ? next.textContent : '';

        const openButton = make('button', 'run-btn', '▶ Run');
        openButton.type = 'button';
        openButton.title = 'Edit and run this code in your browser';
        wrap.appendChild(openButton);

        let panel = null;

        openButton.addEventListener('click', () => {
            if (panel) {
                panel.hidden = !panel.hidden;
                return;
            }

            panel = make('div', 'runner');
            const editor = make('textarea', 'code-edit');
            editor.value = source;
            editor.rows = Math.min(24, source.split('\n').length + 1);
            editor.spellcheck = false;
            editor.setAttribute('aria-label', 'Python code to run');

            let inputBox = null;
            const inputLabel = make('label', 'runner-label', 'Inputs: one line for each time the program asks you to type something');
            if (needsInput) {
                inputBox = make('textarea', 'code-edit run-inputs');
                inputBox.rows = 3;
                inputBox.value = guessInputs(source, shownOutput);
                inputBox.setAttribute('aria-label', 'Inputs for the program');
            }

            const status = make('span', 'runner-status');
            const output = make('pre', 'run-out');
            output.hidden = true;
            const images = make('div', 'run-images');

            const runButton = makeButton('▶ Run', run);
            const stopButton = makeButton('■ Stop', () => {});
            stopButton.disabled = true;
            const resetButton = makeButton('↺ Reset code', () => { editor.value = source; });

            async function run() {
                if (pyBusy) {
                    status.textContent = 'Another program is still running. Stop it first.';
                    return;
                }
                pyBusy = true;
                output.textContent = '';
                output.hidden = false;
                images.replaceChildren();
                runButton.disabled = true;
                stopButton.disabled = false;
                status.textContent = pyWorker ? 'Starting...' : 'Loading Python (about 10 MB the first time, then it is cached)...';

                let worker;
                try {
                    worker = await getPython();
                } catch (error) {
                    status.textContent = error.message;
                    stopPython();
                    runButton.disabled = false;
                    stopButton.disabled = true;
                    return;
                }

                const slow = setTimeout(() => {
                    status.textContent = 'Still running... press Stop if it is stuck in a loop.';
                }, 6000);

                function finish(text) {
                    clearTimeout(slow);
                    worker.removeEventListener('message', onMessage);
                    pyBusy = false;
                    runButton.disabled = false;
                    stopButton.disabled = true;
                    status.textContent = text;
                    if (!output.textContent) output.textContent = '(no output)';
                }

                function onMessage(event) {
                    const message = event.data;
                    if (message.type === 'out') output.textContent += message.text;
                    else if (message.type === 'status') status.textContent = message.text;
                    else if (message.type === 'img') {
                        const image = make('img');
                        image.src = 'data:image/png;base64,' + message.data;
                        image.alt = 'Chart drawn by the program';
                        images.appendChild(image);
                    } else if (message.type === 'done') {
                        finish(message.error ? 'Finished with an error (see the last lines above).' : 'Finished.');
                    }
                }

                worker.addEventListener('message', onMessage);
                stopButton.onclick = () => {
                    stopPython();
                    finish('Stopped. Python will reload next time you press Run.');
                };

                const typed = inputBox && inputBox.value !== '' ? inputBox.value.replace(/\n$/, '').split('\n') : [];
                worker.postMessage({ code: editor.value, inputs: typed, setup: pySetup, saveFigures: pySaveFigures });
            }

            const buttons = make('div', 'button-row');
            buttons.append(runButton, stopButton, resetButton, status);
            panel.append(make('p', 'runner-label', 'Edit the code if you like, then press Run. Your changes are not saved.'), editor);
            if (inputBox) panel.append(inputLabel, inputBox);
            panel.append(buttons, output, images);
            wrap.after(panel);
            panel.querySelector('textarea').focus();
        });
    });
}

/* ----------------------------------------------------------
   Run everything (order matters a little: levels and checklists
   add tables before they are wrapped)
   ---------------------------------------------------------- */
buildNav();
buildPageFlashcards();
buildRecall();
buildSpecChecklists();
buildOrganisers();
buildLevels();
buildCode();
buildRunners();
buildQuestionSets();
buildMockBar();
buildQuiz();
buildBackup();
buildSavedFields();
buildSorters();
wrapTables();
buildSidebar();
buildPager();
buildDashboard();
buildSearch();
