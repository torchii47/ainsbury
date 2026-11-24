// Arithmetic operator practice for arithmetic.html. Every question is made up on the spot.
// The student picks how many operators each question has, which ones to use and whether
// to include brackets, then types what Python would print.
//
// The generator and the step-by-step working don't touch the page, so they can be tested
// on their own: arithQuestion(3, ['+', '*', '//'], true) returns
// { code, answer, text, steps, flat }. Values follow Python 3 rules exactly:
// / always gives a float, // and % round towards minus infinity, ** binds tightest and
// works right to left. Questions with messy floats (like 10 / 3) are thrown away.

const arithOperators = ['+', '-', '*', '/', '//', '%', '**'];

const arithNames = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide',
    '//': 'floor (integer) division',
    '%': 'modulus (remainder)',
    '**': 'power'
};

// Higher number = done first
const arithLevel = { '+': 1, '-': 1, '*': 2, '/': 2, '//': 2, '%': 2, '**': 3 };

// Keeps answers to a size you can work out on paper
const arithLimit = 10000;

const arithRand = (low, high) => low + Math.floor(Math.random() * (high - low + 1));
const arithPick = list => list[Math.floor(Math.random() * list.length)];

// A value is { v: number, f: true if it's a float }
function arithFormat(value) {
    if (!value.f) return String(value.v);
    return Number.isInteger(value.v) ? value.v.toFixed(1) : String(value.v);
}

// A float Python would print with no more than 3 decimal places
function arithNice(value) {
    if (!Number.isFinite(value.v) || Math.abs(value.v) > arithLimit) return false;
    if (Object.is(value.v, -0)) return false;
    return !value.f || Number(value.v.toFixed(3)) === value.v;
}

// Python's float // and %, copied from float_divmod in CPython. The simple
// a - b * floor(a / b) can be out in the last digit, e.g. 23 % 3.9.
function arithFloatDivmod(a, b) {
    let left = a % b; // JS % is C's fmod, which is exact
    let div = (a - left) / b;
    if (left && (b < 0) !== (left < 0)) {
        left += b;
        div -= 1;
    }
    let whole = Math.floor(div);
    if (div - whole > 0.5) whole += 1;
    return [whole, left];
}

// Applies one operator the way Python 3 does. Returns null for anything we don't want
// in a question (dividing by zero, huge numbers, negative or float powers, messy floats).
function arithApply(op, a, b) {
    const f = a.f || b.f;
    let result;
    if (op === '+') result = { v: a.v + b.v, f };
    else if (op === '-') result = { v: a.v - b.v, f };
    else if (op === '*') result = { v: a.v * b.v, f };
    else if (op === '/') {
        if (b.v === 0) return null;
        result = { v: a.v / b.v, f: true };
    } else if (op === '//' || op === '%') {
        if (b.v === 0) return null;
        const [whole, left] = f ? arithFloatDivmod(a.v, b.v) : [Math.floor(a.v / b.v), a.v - b.v * Math.floor(a.v / b.v)];
        result = { v: op === '//' ? whole : left, f };
    } else if (op === '**') {
        if (b.f || b.v < 0 || b.v > 4) return null;
        result = { v: a.v ** b.v, f: a.f };
    }
    return arithNice(result) ? result : null;
}

/* ----------------------------------------------------------
   Expressions are trees: { num: value } or { op, left, right, brackets }
   ---------------------------------------------------------- */

// tokens: numbers and operator strings, with '(' and ')'.
// flat = true ignores the order of operations (but keeps brackets), to spot that mistake.
function arithParse(tokens, flat) {
    let position = 0;

    function primary() {
        const token = tokens[position++];
        if (token === '(') {
            const inside = expression(1);
            position++; // the ')'
            inside.brackets = true;
            return inside;
        }
        return { num: { v: token, f: false } };
    }

    // Precedence climbing. ** is right-associative, everything else left
    function expression(minLevel) {
        let left = primary();
        while (position < tokens.length) {
            const op = tokens[position];
            if (op === ')') break;
            const level = flat ? 1 : arithLevel[op];
            if (level < minLevel) break;
            position++;
            const right = expression(op === '**' && !flat ? level : level + 1);
            left = { op, left, right };
        }
        return left;
    }

    return expression(1);
}

function arithCopy(node) {
    return node.num ? { num: node.num } : { op: node.op, left: arithCopy(node.left), right: arithCopy(node.right), brackets: node.brackets };
}

// The next operation to show, in the order students are taught: brackets, then **,
// then * / // %, then + -, leftmost first. Any operator whose two sides are already plain
// numbers can be done without changing the answer, so this always gives Python's result.
// Returns the path to it, from the top of the tree down.
function arithNext(root) {
    let best = null;
    let bestKey = null;
    let position = 0;
    (function visit(node, path, inBrackets) {
        if (node.num) return;
        const here = [...path, node];
        const bracketed = inBrackets || !!node.brackets;
        visit(node.left, here, bracketed);
        position++;
        if (node.left.num && node.right.num) {
            const key = [bracketed ? 1 : 0, arithLevel[node.op], -position];
            if (!bestKey || key[0] > bestKey[0] || (key[0] === bestKey[0] && (key[1] > bestKey[1] || (key[1] === bestKey[1] && key[2] > bestKey[2])))) {
                best = here;
                bestKey = key;
            }
        }
        visit(node.right, here, bracketed);
    })(root, [], false);
    return best;
}

// Writes the expression out. The target node is wrapped in \u0001...\u0002 so it can be highlighted.
function arithWrite(node, target, child) {
    let text;
    if (node.num) {
        text = arithFormat(node.num);
        if (child && node.num.v < 0) text = `(${text})`;
    } else {
        text = `${arithWrite(node.left, target, true)} ${node.op} ${arithWrite(node.right, target, true)}`;
        if (node.brackets) text = `(${text})`;
    }
    return node === target ? `\u0001${text}\u0002` : text;
}

// Explains one calculation, e.g. "17 // 5 = 3" and why
function arithExplain(op, a, b, result) {
    const [x, y, r] = [a, b, result].map(arithFormat);
    const calc = `${x} ${op} ${y} = ${r}`;
    let note = '';
    if (op === '/') {
        note = Number.isInteger(result.v) ? '/ always gives a float, even when it divides exactly.' : '/ always gives a float.';
    } else if (op === '//') {
        const exact = Number((a.v / b.v).toFixed(4));
        note = `${x} ÷ ${y} = ${exact}, rounded down to ${r}.`;
        if (a.v / b.v < 0 && !Number.isInteger(a.v / b.v)) note += ' // always rounds down, so negative answers move further from 0.';
    } else if (op === '%') {
        const times = arithFormat({ v: Math.floor(a.v / b.v), f: a.f || b.f });
        note = `${x} = ${y} × ${times} + ${r}, so the remainder is ${r}.`;
    } else if (op === '**') {
        if (b.v === 0) note = 'Any number to the power 0 is 1.';
        else if (b.v === 1) note = 'Any number to the power 1 is itself.';
        else note = `${x} ** ${y} means ${Array(b.v).fill(a.v < 0 ? `(${x})` : x).join(' × ')}.`;
    }
    if (op !== '/' && result.f && (!a.f || !b.f)) {
        note += (note ? ' ' : '') + 'One side is a float, so the answer is a float.';
    } else if (op !== '/' && result.f) {
        note += (note ? ' ' : '') + 'Both sides are floats, so the answer is a float.';
    }
    return { calc, note };
}

// Why this operation comes next
function arithReason(path, operatorsLeft) {
    if (operatorsLeft === 1) return '';
    const node = path[path.length - 1];
    const parent = path[path.length - 2];
    let reason;
    if (path.some(step => step.brackets)) reason = 'Brackets first.';
    else if (node.op === '**') reason = '** comes before every other operator.';
    else if (arithLevel[node.op] === 2) reason = '*, /, // and % come before + and -.';
    else reason = '+ and - come last.';

    if (parent && !node.brackets && arithLevel[parent.op] === arithLevel[node.op]) {
        if (node.op === '**' && parent.right === node) reason += ' ** works right to left.';
        else if (parent.left === node) reason += ' Same level, so work left to right.';
    }
    return reason;
}

function arithCount(node) {
    return node.num ? 0 : 1 + arithCount(node.left) + arithCount(node.right);
}

// Works the expression out one step at a time. Returns null if any step breaks the rules.
function arithSolve(tree) {
    const root = { top: arithCopy(tree) };
    const steps = [];
    let trivial = 0;
    while (!root.top.num) {
        const path = arithNext(root.top);
        const node = path[path.length - 1];
        const [a, b] = [node.left.num, node.right.num];
        const result = arithApply(node.op, a, b);
        if (!result) return null;
        // Steps that teach little, like 0 % 35 or 7 ** 1. One is fine, a run of them isn't
        if (((node.op === '%' || node.op === '//') && Math.abs(a.v) < Math.abs(b.v)) ||
            (node.op === '**' && b.v < 2) || (node.op === '*' && (a.v === 0 || b.v === 0)) ||
            (node.op !== '**' && a.v === 0)) trivial++;
        const before = arithWrite(root.top, node, false);
        const reason = arithReason(path, arithCount(root.top));
        const { calc, note } = arithExplain(node.op, node.left.num, node.right.num, result);

        // Replace the node with its answer
        const parent = path[path.length - 2];
        const done = { num: result };
        if (!parent) root.top = done;
        else if (parent.left === node) parent.left = done;
        else parent.right = done;

        steps.push({ before, reason, calc, note });
    }
    return { answer: root.top.num, steps, trivial };
}

// The answer you'd get ignoring the order of operations (null if it's the same or invalid)
function arithFlatAnswer(tokens, answer) {
    let tree = arithParse(tokens, true);
    function value(node) {
        if (node.num) return node.num;
        const a = value(node.left);
        const b = a && value(node.right);
        return b && arithApply(node.op, a, b);
    }
    const flat = value(tree);
    return flat && (flat.v !== answer.v || flat.f !== answer.f) ? flat : null;
}

// Picks operands that suit their operators, so questions come out tidy more often
function arithOperands(ops) {
    const count = ops.length + 1;
    const big = ops.length > 3 ? 12 : 20;
    const numbers = Array.from({ length: count }, () => arithRand(1, big));
    // Left-hand numbers first, then divisors, so a divisor is never replaced by a big number
    ops.forEach((op, i) => {
        if (op === '/') numbers[i] = arithRand(2, 40);
        else if (op === '//' || op === '%') numbers[i] = arithRand(10, 50);
        else if (op === '-' && Math.random() < 0.6) numbers[i] = arithRand(5, 30);
    });
    ops.forEach((op, i) => {
        if (op === '/') numbers[i + 1] = arithPick([2, 2, 4, 4, 5, 8, 10, arithRand(2, 9)]);
        else if (op === '//' || op === '%') numbers[i + 1] = arithRand(2, 9);
    });
    // Powers last, so small bases and exponents win
    ops.forEach((op, i) => {
        if (op === '**') {
            numbers[i] = arithRand(2, 5);
            numbers[i + 1] = arithPick([2, 2, 2, 3, 3, 0, 1]);
        }
    });
    return numbers;
}

// Makes one question. count = how many operators, allowed = which ones, brackets = true/false
function arithQuestion(count, allowed, brackets) {
    const choices = allowed && allowed.length ? allowed : arithOperators;
    for (let attempt = 0; attempt < 3000; attempt++) {
        const ops = Array.from({ length: count }, () => arithPick(choices));
        const numbers = arithOperands(ops);

        // Brackets around a run of at least two numbers, but not the whole thing
        let open = -1;
        let close = -1;
        if (brackets && count >= 2 && Math.random() < 0.8) {
            open = arithRand(0, count - 1);
            close = arithRand(open + 1, count);
            if (open === 0 && close === count) open = -1;
        }

        const tokens = [];
        numbers.forEach((number, i) => {
            if (i === open) tokens.push('(');
            tokens.push(number);
            if (i === close && open !== -1) tokens.push(')');
            if (i < ops.length) tokens.push(ops[i]);
        });

        const tree = arithParse(tokens, false);
        // Pointless brackets, e.g. (2 * 3) + 4, are fine now and then but not every time
        if (open !== -1 && attempt < 2000 && Math.random() < 0.7) {
            const plain = arithParse(tokens.filter(t => t !== '(' && t !== ')'), false);
            const a = arithSolve(tree);
            const b = arithSolve(plain);
            if (a && b && a.answer.v === b.answer.v) continue;
        }

        const solved = arithSolve(tree);
        if (!solved || (solved.trivial > 1 && attempt < 2500)) continue;

        const text = tokens.join(' ').replace(/\( /g, '(').replace(/ \)/g, ')');
        return {
            code: `print(${text})`,
            text,
            answer: solved.answer,
            printed: arithFormat(solved.answer),
            steps: solved.steps,
            flat: arithFlatAnswer(tokens, solved.answer)
        };
    }
    return null;
}

// Marks a typed answer. Returns { right, message }
function arithMark(typed, item) {
    const text = typed.trim();
    if (!/^-?\d+(\.\d+)?$/.test(text)) {
        return { right: null, message: 'Type a number exactly as Python would print it, e.g. 7, -2 or 3.5.' };
    }
    const value = Number(text);
    const isFloat = text.includes('.');
    const answer = item.answer;
    const sameValue = Math.abs(value - answer.v) < 1e-9;

    if (sameValue && isFloat === answer.f) {
        return { right: true, message: `Correct. Python prints ${item.printed}.` };
    }
    if (sameValue && answer.f) {
        return { right: false, message: `Nearly. The value is right, but Python prints ${item.printed}. The answer is a float, so it always shows a decimal point. Check the working for where it became a float.` };
    }
    if (sameValue) {
        return { right: false, message: `Nearly. The value is right, but Python prints ${item.printed}. Every number is an int and there's no /, so the answer is an int with no .0 on the end.` };
    }
    if (item.flat && Math.abs(value - item.flat.v) < 1e-9) {
        return { right: false, message: `Not quite. Python prints ${item.printed}. You worked straight from left to right, but Python does brackets first, then **, then * / // %, then + and -.` };
    }
    return { right: false, message: `Not quite. Python prints ${item.printed}. Follow the working below to see where it went differently.` };
}

/* ----------------------------------------------------------
   The page
   ---------------------------------------------------------- */
function buildArithmetic() {
    const holder = document.getElementById('arith');
    if (!holder) return;

    const settings = load('arith:settings', { count: 2, ops: arithOperators.slice(), brackets: false });
    settings.ops = settings.ops.filter(op => arithOperators.includes(op));
    if (!settings.ops.length) settings.ops = arithOperators.slice();
    const tally = load('arith:tally', { right: 0, asked: 0, streak: 0, best: 0 });

    // Settings: how many operators
    const countRow = make('div', 'arith-setting');
    const countLabel = make('p', 'arith-label', 'Operators in each question:');
    countLabel.id = 'arith-count-label';
    const countButtons = make('div', 'arith-count');
    countButtons.setAttribute('role', 'group');
    countButtons.setAttribute('aria-labelledby', 'arith-count-label');
    for (let n = 1; n <= 6; n++) {
        const button = makeButton(String(n), () => {
            settings.count = n;
            saveSettings();
            next();
        });
        button.dataset.count = n;
        button.setAttribute('aria-label', `${n} operator${n > 1 ? 's' : ''}`);
        countButtons.appendChild(button);
    }
    countRow.append(countLabel, countButtons);

    // Settings: which operators
    const opsRow = make('fieldset', 'arith-setting arith-ops');
    opsRow.appendChild(make('legend', 'arith-label', 'Use these operators:'));
    const opsMessage = make('span', 'arith-warning');
    arithOperators.forEach(op => {
        const label = make('label', 'arith-op');
        const box = make('input');
        box.type = 'checkbox';
        box.value = op;
        box.checked = settings.ops.includes(op);
        box.addEventListener('change', () => {
            const picked = [...opsRow.querySelectorAll('input:checked')].map(input => input.value);
            if (!picked.length) {
                box.checked = true;
                opsMessage.textContent = 'Keep at least one operator ticked.';
                return;
            }
            opsMessage.textContent = '';
            settings.ops = picked;
            saveSettings();
            next();
        });
        const code = make('code', null, op);
        label.append(box, code, make('span', 'arith-op-name', arithNames[op]));
        opsRow.appendChild(label);
    });
    opsRow.appendChild(opsMessage);

    // Settings: brackets
    const bracketLabel = make('label', 'arith-setting arith-op');
    const bracketBox = make('input');
    bracketBox.type = 'checkbox';
    bracketBox.checked = settings.brackets;
    bracketBox.addEventListener('change', () => {
        settings.brackets = bracketBox.checked;
        saveSettings();
        next();
    });
    bracketLabel.append(bracketBox, make('span', null, 'Include brackets (when there are 2 or more operators)'));

    function saveSettings() {
        save('arith:settings', settings);
        countButtons.querySelectorAll('button').forEach(button => {
            button.setAttribute('aria-pressed', String(Number(button.dataset.count) === settings.count));
        });
    }

    // The question
    const prompt = make('p', 'quiz-question', 'What does this code print?');
    const code = make('pre', 'run-out arith-code');
    const answerRow = make('form', 'arith-answer');
    const input = make('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.id = 'arith-input';
    const inputLabel = make('label', 'arith-label', 'Python prints:');
    inputLabel.htmlFor = 'arith-input';
    const checkButton = make('button', 'button', 'Check');
    checkButton.type = 'submit';
    const showButton = makeButton('Show me', () => finish(null));
    const nextButton = makeButton('Next question ▶', () => next());
    answerRow.append(inputLabel, input, checkButton, showButton, nextButton);

    const feedback = make('div', 'quiz-answer arith-feedback');
    feedback.setAttribute('aria-live', 'polite');
    const result = make('p', 'arith-result');
    const workingTitle = make('h3', null, 'The working');
    const working = make('ol', 'arith-steps');
    feedback.append(result, workingTitle, working);

    const score = make('span', 'spec-summary');
    let item = null;
    let answered = false;

    function updateScore() {
        score.textContent = tally.asked
            ? `Score: ${tally.right} / ${tally.asked} (${Math.round(tally.right / tally.asked * 100)}%) · Streak: ${tally.streak} · Best streak: ${tally.best}`
            : 'Your score will show here.';
    }

    // Splits "\u0001...\u0002" into text with a highlighted part
    function highlighted(text) {
        const line = make('code', 'arith-line');
        text.split(/(\u0001[^\u0002]*\u0002)/).forEach(part => {
            if (part.startsWith('\u0001')) line.appendChild(make('mark', null, part.slice(1, -1)));
            else if (part) line.appendChild(document.createTextNode(part));
        });
        return line;
    }

    function showWorking() {
        working.replaceChildren();
        item.steps.forEach(step => {
            const row = make('li');
            row.appendChild(highlighted(step.before));
            if (step.reason) row.appendChild(make('span', 'arith-reason', step.reason));
            const calc = make('span', 'arith-calc');
            calc.append(make('code', null, step.calc));
            if (step.note) calc.append(' ', make('span', null, step.note));
            row.appendChild(calc);
            working.appendChild(row);
        });
        const last = make('li', 'arith-final');
        last.append('Python prints ', make('code', null, item.printed));
        working.appendChild(last);
    }

    // right: true, false, or null for "Show me"
    function finish(right, message) {
        if (answered) return;
        answered = true;
        input.readOnly = true;
        checkButton.hidden = true;
        showButton.hidden = true;
        nextButton.hidden = false;

        tally.asked++;
        if (right) {
            tally.right++;
            tally.streak++;
            tally.best = Math.max(tally.best, tally.streak);
        } else {
            tally.streak = 0;
        }
        save('arith:tally', tally);
        updateScore();
        track('answered arithmetic');

        feedback.classList.toggle('arith-right', right === true);
        feedback.classList.toggle('arith-wrong', right !== true);
        result.textContent = message || `Python prints ${item.printed}.`;
        showWorking();
        feedback.hidden = false;
        nextButton.focus();
    }

    answerRow.addEventListener('submit', event => {
        event.preventDefault();
        if (answered) {
            next();
            return;
        }
        const marked = arithMark(input.value, item);
        if (marked.right === null) {
            result.textContent = marked.message;
            working.replaceChildren();
            workingTitle.hidden = true;
            feedback.classList.remove('arith-right', 'arith-wrong');
            feedback.hidden = false;
            input.focus();
            return;
        }
        workingTitle.hidden = false;
        finish(marked.right, marked.message);
    });

    function next() {
        item = arithQuestion(settings.count, settings.ops, settings.brackets);
        answered = false;
        answerRow.hidden = !item;
        prompt.textContent = item ? 'What does this code print?' : 'No question fits these settings.';
        code.textContent = item ? item.code : `With only ${settings.ops.join(' ')} and ${settings.count} operators, the numbers get too big to work out by hand. Choose fewer operators or tick another one.`;
        input.value = '';
        input.readOnly = false;
        checkButton.hidden = false;
        showButton.hidden = false;
        nextButton.hidden = true;
        feedback.hidden = true;
        workingTitle.hidden = false;
        if (document.activeElement && holder.contains(document.activeElement)) input.focus();
    }

    const settingsBox = make('div', 'arith-settings');
    settingsBox.append(countRow, opsRow, bracketLabel);

    const bottom = make('div', 'button-row');
    bottom.append(score, makeConfirmButton('Reset score', () => {
        Object.assign(tally, { right: 0, asked: 0, streak: 0, best: 0 });
        save('arith:tally', tally);
        updateScore();
    }));

    holder.replaceChildren(settingsBox, prompt, code, answerRow, feedback, bottom);
    saveSettings();
    updateScore();
    next();
}

if (typeof document !== 'undefined') buildArithmetic();
if (typeof module !== 'undefined') module.exports = { arithQuestion, arithMark, arithFormat, arithOperators };
