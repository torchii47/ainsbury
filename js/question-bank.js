// Turns the CSV in js/questions.js into a list of question objects.
// Used by the random question page, the homepage question of the day
// and the "Quiz me" boxes in the revision guide.
// Load js/questions.js first.

// Turn CSV text into an array of objects, one per row.
// Handles quoted fields containing commas, "" and new lines.
function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"' && text[i + 1] === '"') {
                field += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                field += char;
            }
        } else if (char === '"') {
            inQuotes = true;
        } else if (char === ',') {
            row.push(field);
            field = '';
        } else if (char === '\n') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else if (char !== '\r') {
            field += char;
        }
    }

    if (field !== '' || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    const headers = rows.shift();
    return rows
        .filter(cells => cells.length > 1)
        .map(cells => Object.fromEntries(headers.map((name, index) => [name, cells[index] || ''])));
}

// Questions that only make sense with the original slide or code
const skipQuestionIds = ['a6cfde0023', '6a29bf8d56', '2f5f13f113', '32d3839f61', '8c595328bc'];

const questionBank = (typeof questionBankCsv === 'undefined' ? [] : parseCsv(questionBankCsv))
    .filter(q =>
        q.type !== 'context' &&
        !q.answer.startsWith('Needs the') &&
        !skipQuestionIds.includes(q.id)
    );

// Some rows list two topics, e.g. "7.2 Software; 7.3 Networks". Use the first.
questionBank.forEach(q => {
    q.mainTopic = q.topic.split(';')[0].trim();
    // parseInt copes with both "2.10 Robust code" and "2 Programming"
    q.area = parseInt(q.mainTopic, 10);
});

const questionTypeNames = {
    mcq: 'Multiple choice',
    recall: 'Quick recall',
    exam: 'Exam-style',
    exit: 'Exit ticket',
    discussion: 'Discussion'
};

// Sort topics by number, so 2.10 comes after 2.9
function compareTopics(a, b) {
    const numA = a.split(' ')[0].split('.').map(Number);
    const numB = b.split(' ')[0].split('.').map(Number);
    return (numA[0] - numB[0]) || ((numA[1] || 0) - (numB[1] || 0));
}

// The options for a multiple choice question, and which one is correct
function questionOptions(q) {
    if (q.type !== 'mcq' || !q.options) return null;
    const options = q.options.split(' | ');
    // Use the letter if there is one, otherwise match the answer text
    const correct = q.correct ? q.correct.charCodeAt(0) - 65 : options.indexOf(q.answer);
    return { options, correct };
}
