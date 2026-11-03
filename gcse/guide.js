// GCSE guide settings for revision.js. Load before revision.js.
// The exam dates are in js/dates.js (gcseDates).

window.guideConfig = {
    name: 'GCSE Computer Science Revision Guide',
    storagePrefix: 'gcse:',
    backupId: 'gcse-revision-guide',
    analyticsName: 'gcse',

    // Link to the Microsoft Form students paste their progress summary into
    // (leave as '' to hide the button)
    summaryForm: '',

    pages: [
        { id: 'index', file: 'index.html', short: 'Home', title: 'Guide home' },
        { id: 'exams', file: 'exams.html', short: 'Exams', title: 'Part A: Your exams' },
        { id: 'topic1-1', file: 'topic1-1.html', short: '1.1', title: 'Systems architecture', tracked: true },
        { id: 'topic1-2', file: 'topic1-2.html', short: '1.2', title: 'Memory and storage', tracked: true },
        { id: 'topic1-3', file: 'topic1-3.html', short: '1.3', title: 'Networks, connections and protocols', tracked: true },
        { id: 'topic1-4', file: 'topic1-4.html', short: '1.4', title: 'Network security', tracked: true },
        { id: 'topic1-5', file: 'topic1-5.html', short: '1.5', title: 'Systems software', tracked: true },
        { id: 'topic1-6', file: 'topic1-6.html', short: '1.6', title: 'Ethical, legal, cultural and environmental impacts', tracked: true },
        { id: 'topic2-1', file: 'topic2-1.html', short: '2.1', title: 'Algorithms', tracked: true },
        { id: 'topic2-2', file: 'topic2-2.html', short: '2.2', title: 'Programming fundamentals', tracked: true },
        { id: 'topic2-3', file: 'topic2-3.html', short: '2.3', title: 'Producing robust programs', tracked: true },
        { id: 'topic2-4', file: 'topic2-4.html', short: '2.4', title: 'Boolean logic', tracked: true },
        { id: 'topic2-5', file: 'topic2-5.html', short: '2.5', title: 'Programming languages and IDEs', tracked: true },
        { id: 'programming', file: 'programming.html', short: 'Code', title: 'Practical programming' },
        { id: 'mock1', file: 'mock1.html', short: 'Mock 1', title: 'Mock Paper 1', tracked: true },
        { id: 'mock2', file: 'mock2.html', short: 'Mock 2', title: 'Mock Paper 2', tracked: true },
        { id: 'organisers', file: 'organisers.html', short: 'Print', title: 'All knowledge organisers' },
        { id: 'glossary', file: 'glossary.html', short: 'A–Z', title: 'Glossary' }
    ],

    reminders: [
        ['Read the question twice', 'Underline the command word and the number of marks before you start writing.'],
        ['Match the marks', 'A 2-mark "describe" usually wants two linked points. A 4-mark "explain two" wants two points, each with a reason.'],
        ['Use the context', 'If the question mentions a shop, a school or a game, refer to it. Generic answers lose marks.'],
        ["Explain, don't list", "Use 'because', 'so' and 'which means' to turn a point into an explanation."],
        ['Show your working', 'For binary, hex and file size questions, write every step. Method marks are available even if the final answer is wrong.'],
        ['Trace before you answer', 'Draw a trace table for any "what is output" question. It catches off-by-one errors.'],
        ['Code in Section B', 'Paper 2 Section B must be answered in OCR Exam Reference Language or a high-level language like Python. Indent your code.'],
        ['Units matter', 'Say whether your answer is in bits, bytes, KB or MB. A number without a unit can lose the mark.'],
        ['No calculators', 'Neither paper allows a calculator. Practise multiplying and dividing by 8 and 1000 by hand.'],
        ['Use correct terms', "Write 'register', 'latency', 'validation' and 'authentication' rather than everyday words."],
        ['Plan the 8-marker', 'For the Paper 1 extended question, cover ethical, legal, cultural, environmental and privacy points, both sides, then conclude.'],
        ['Leave nothing blank', 'A sensible attempt can earn a mark. A blank space never does.']
    ],

    // Levels for the 8-mark question
    levelText: [
        'No response or no response worthy of credit.',
        'Basic knowledge with limited understanding. Points are mostly isolated, with little or no application to the context. The answer may be a list with little reasoning.',
        'Reasonable knowledge and understanding, applied to the context with some development. There is a line of reasoning, with some structure and some consideration of both sides.',
        'Thorough knowledge and understanding, applied consistently to the context. A well-developed, logical discussion that considers different points of view and is supported by relevant examples.'
    ],
    levelMarks(max, level) {
        const bands = {
            8: ['0', '1–2', '3–5', '6–8'],
            6: ['0', '1–2', '3–4', '5–6']
        };
        if (bands[max]) return bands[max][level];
        const band = max / 3;
        return level === 0 ? '0' : `${Math.round((level - 1) * band) + 1}–${Math.round(level * band)}`;
    },

    // Both J277 papers are 1 hour 30 minutes, 80 marks
    mock: {
        mock1: {
            minutes: 90,
            phases: [
                [3, 'First 3 min: read the paper.'],
                [80, '80 marks in 90 minutes: about 1 minute per mark.'],
                [Infinity, 'Last 10 min: check your answers and units.']
            ]
        },
        mock2: {
            minutes: 90,
            phases: [
                [3, 'First 3 min: read the paper.'],
                [55, 'Section A (50 marks): about 52 min.'],
                [85, 'Section B (30 marks): about 30 min. Write code in ERL or Python.'],
                [Infinity, 'Last 5 min: check your code and trace tables.']
            ]
        }
    }
};
