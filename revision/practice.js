// Endless practice questions for practice.html. Every question is made up on the spot.
// Each topic's make() returns { question, code (optional), options, answer, why }.
// The generators don't touch the page, so they can be tested on their own.

const drillRand = (low, high) => low + Math.floor(Math.random() * (high - low + 1));
const drillPick = list => list[Math.floor(Math.random() * list.length)];

// How Python prints a number: a float always shows its decimal point
const drillFloat = number => (Number.isInteger(number) ? number.toFixed(1) : String(number));

// The correct answer plus up to three different wrong ones, in a random order
function drillOptions(answer, wrong) {
    const options = [answer];
    wrong.forEach(option => {
        if (options.length < 4 && !options.includes(option)) options.push(option);
    });
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
}

const drillTopics = {
    types: {
        title: '2.1 Data types',
        link: 'ca2.html#s2-1',
        make() {
            const names = ['Integer', 'Float', 'String', 'Boolean'];
            const [text, answer, why] = drillPick([
                [String(drillRand(2, 99)), 'Integer', 'It is a whole number with no quotes.'],
                [String(-drillRand(2, 99)), 'Integer', 'Whole numbers can be negative.'],
                [`${drillRand(1, 20)}.${drillRand(1, 9)}9`, 'Float', 'It has a decimal part.'],
                [`${drillRand(1, 20)}.0`, 'Float', 'The decimal point makes it a float, even when the decimal part is 0.'],
                [`"${drillRand(10, 99)}"`, 'String', 'The quotes make it text, even though it contains digits.'],
                [`"0770${drillRand(1000, 9999)}"`, 'String', 'Quotes make it text. Phone numbers are stored as text to keep the leading 0.'],
                ['True', 'Boolean', 'True and False are the two Boolean values.'],
                ['False', 'Boolean', 'True and False are the two Boolean values.'],
                ['"True"', 'String', 'The quotes make it text, so it is not a Boolean.']
            ]);
            return { question: 'What is the data type of this value?', code: text, options: drillOptions(answer, names), answer, why };
        }
    },

    casting: {
        title: '2.2 Conversion',
        link: 'ca2.html#s2-2',
        make() {
            const a = drillRand(2, 9);
            const b = drillRand(2, 9);
            const c = drillRand(1, 8);
            const [code, answer, wrong, why] = drillPick([
                [`print(int("${a}") + ${b})`, String(a + b), [`${a}${b}`, 'An error', String(a * b)], 'int() turns the string into a number, so the values are added.'],
                [`print(str(${a}) + "${b}")`, `${a}${b}`, [String(a + b), 'An error', String(a * b)], 'Both sides are strings, so + joins them together.'],
                [`print(float(${a}))`, `${a}.0`, [String(a), `"${a}"`, 'An error'], 'float() adds a decimal part.'],
                [`print(int(${a}.${c}))`, String(a), [`${a}.${c}`, String(a + 1), 'An error'], 'int() removes the decimal part. It does not round.'],
                [`print("${a}" * ${b})`, String(a).repeat(b), [String(a * b), 'An error', `${a}${b}`], 'Multiplying a string repeats it.'],
                [`print("${a}" + ${b})`, 'An error', [String(a + b), `${a}${b}`, String(a * b)], 'A string cannot be joined to an int, so Python raises a TypeError.']
            ]);
            return { question: 'What does this code do?', code, options: drillOptions(answer, wrong), answer, why };
        }
    },

    operators: {
        title: '2.4 Operators',
        link: 'ca2.html#s2-4',
        make() {
            const b = drillRand(2, 6);
            const a = b * drillRand(2, 6) + drillRand(1, b - 1);
            const c = drillRand(2, 5);
            const d = drillRand(2, 5);
            const whole = Math.floor(a / b);
            const left = a % b;
            const even = drillPick([2, 4]);
            const top = even * drillRand(2, 9) + even / 2;
            const [code, answer, wrong, why] = drillPick([
                [`print(${a} // ${b})`, String(whole), [String(left), String(whole + 2), String(whole + 1)], '// is floor division: the whole number of times it goes in.'],
                [`print(${a} % ${b})`, String(left), [String(whole), String(left + 1), String(a - b)], '% gives the remainder after dividing.'],
                [`print(${c} ** ${d})`, String(c ** d), [String(c * d), String(c + d), String(d ** c + 1)], '** means to the power of.'],
                [`print(${top} / ${even})`, drillFloat(top / even), [String(Math.floor(top / even)), String(top % even), String(top - even)], '/ always gives a float.'],
                [`print(${c} + ${d} * ${b})`, String(c + d * b), [String((c + d) * b), String(c * d + b), String(c + d + b)], 'Multiplication happens before addition.'],
                [`print((${c} + ${d}) * ${b})`, String((c + d) * b), [String(c + d * b), String(c * d + b), String(c + d + b)], 'Brackets are worked out first.'],
                [`print(${a} > ${b} and ${c} == ${c + 1})`, 'False', ['True', 'An error'], 'and needs both sides to be True.'],
                [`print(${a} > ${b} or ${c} == ${c + 1})`, 'True', ['False', 'An error'], 'or needs at least one side to be True.'],
                [`print(not ${a} > ${b})`, 'False', ['True', 'An error'], 'The comparison is True, and not flips it.']
            ]);
            return { question: 'What does this code print?', code, options: drillOptions(answer, wrong), answer, why };
        }
    },

    loops: {
        title: '2.6 Loops',
        link: 'ca2.html#s2-6',
        make() {
            const start = drillRand(1, 4);
            const stop = start + drillRand(2, 5);
            const step = drillRand(2, 3);
            const numbers = [];
            for (let i = start; i < stop; i++) numbers.push(i);
            const stepped = [];
            for (let i = start; i < stop + 4; i += step) stepped.push(i);
            const sum = list => list.reduce((total, n) => total + n, 0);
            const add = sum(numbers);
            const limit = stop + 4;

            const [code, answer, wrong, why] = drillPick([
                [`total = 0\nfor i in range(${start}, ${stop}):\n    total = total + i\nprint(total)`, String(add), [String(add + stop), String(add - start), String(numbers.length)], `range(${start}, ${stop}) stops before ${stop}, so it gives ${numbers.join(', ')}.`],
                [`count = 0\nfor i in range(${start}, ${stop}):\n    count = count + 1\nprint(count)`, String(numbers.length), [String(numbers.length + 1), String(stop), String(add)], `The loop runs for ${numbers.join(', ')}.`],
                [`total = 0\nfor i in range(${start}, ${limit}, ${step}):\n    total = total + i\nprint(total)`, String(sum(stepped)), [String(sum(stepped) + limit), String(stepped.length), String(sum(stepped) - start)], `The step is ${step}, so it gives ${stepped.join(', ')}.`],
                [`n = ${start}\nwhile n < ${stop}:\n    n = n + ${step}\nprint(n)`, String(start + Math.ceil((stop - start) / step) * step), [String(stop - 1), String(start), String(start + Math.ceil((stop - start) / step) * step + step)], `The loop stops as soon as n is ${stop} or more.`]
            ]);
            return { question: 'What does this code print?', code, options: drillOptions(answer, wrong), answer, why };
        }
    },

    validation: {
        title: '2.8 Validation',
        link: 'ca2.html#s2-8',
        make() {
            const checks = ['Presence', 'Length', 'Range', 'Type', 'Format', 'Check digit'];
            const low = drillRand(1, 20);
            const high = low + drillRand(5, 60);
            const size = drillRand(6, 12);
            const [text, answer, why] = drillPick([
                ['A surname box cannot be left blank.', 'Presence', 'A presence check makes sure something has been entered.'],
                ['A delivery address must be filled in.', 'Presence', 'A presence check makes sure something has been entered.'],
                [`A password must be at least ${size} characters.`, 'Length', 'A length check counts the characters.'],
                [`A membership number must be exactly ${size} characters.`, 'Length', 'A length check counts the characters.'],
                [`A quantity must be from ${low} to ${high}.`, 'Range', 'A range check tests a lower and an upper limit.'],
                [`A score must be between ${low} and ${high}.`, 'Range', 'A range check tests a lower and an upper limit.'],
                ['A quantity must be a whole number.', 'Type', 'A type check tests the data type.'],
                ['A price must be a number, not text.', 'Type', 'A type check tests the data type.'],
                ['A postcode must look like LS1 4AP.', 'Format', 'A format check tests the pattern of the data.'],
                ['An email address must contain @ and a dot after it.', 'Format', 'A format check tests the pattern of the data.'],
                ['The last digit of a barcode is calculated from the other digits.', 'Check digit', 'A check digit is calculated from the rest of the number.'],
                ['An ISBN is checked using its final calculated digit.', 'Check digit', 'A check digit is calculated from the rest of the number.']
            ]);
            return { question: 'Which validation check is this?', text, options: drillOptions(answer, checks.filter(check => check !== answer).sort(() => Math.random() - 0.5)), answer, why };
        }
    },

    testing: {
        title: '2.12 Test data',
        link: 'ca2.html#s2-12',
        make() {
            const types = ['Valid', 'Invalid', 'Boundary', 'Erroneous'];
            const low = drillRand(1, 20);
            const high = low + drillRand(8, 40);
            const field = drillPick(['number of tickets', 'quantity', 'age', 'number of hours']);
            const [value, answer, why] = drillPick([
                [String(low + drillRand(2, high - low - 2)), 'Valid', 'It is well inside the limits, so it should be accepted.'],
                [String(low), 'Boundary', 'It is exactly on the lower limit.'],
                [String(high), 'Boundary', 'It is exactly on the upper limit.'],
                [String(low - 1), 'Boundary', 'It is just outside the lower limit.'],
                [String(high + 1), 'Boundary', 'It is just outside the upper limit.'],
                [String(high + drillRand(5, 50)), 'Invalid', 'It is the right data type but breaks the rule, and it is not next to a limit.'],
                [String(-drillRand(5, 50)), 'Invalid', 'It is the right data type but breaks the rule, and it is not next to a limit.'],
                ['"four"', 'Erroneous', 'It is the wrong data type.'],
                [`${low + 2}.5`, 'Erroneous', 'The rule needs a whole number, so a decimal is the wrong data type.'],
                ['blank', 'Erroneous', 'Nothing has been entered, so it is the wrong type of data.']
            ]);
            return {
                question: `An app accepts a ${field} from ${low} to ${high} (whole numbers only). What type of test data is this?`,
                code: value,
                options: drillOptions(answer, types),
                answer,
                why
            };
        }
    }
};

function buildDrills() {
    const holder = document.getElementById('drill');
    if (!holder) return;

    const tally = load('drill:tally', { right: 0, asked: 0 });
    const select = make('select', 'quiz-select');
    select.append(new Option('All topics', ''));
    Object.entries(drillTopics).forEach(([id, topic]) => select.append(new Option(topic.title, id)));
    select.setAttribute('aria-label', 'Topic');

    const meta = make('p', 'quiz-meta');
    const question = make('p', 'quiz-question');
    const code = make('pre', 'run-out');
    const options = make('ul', 'quiz-options');
    const feedback = make('div', 'quiz-answer');
    const score = make('span', 'spec-summary');

    function updateScore() {
        score.textContent = tally.asked
            ? `Your score: ${tally.right} / ${tally.asked} (${Math.round(tally.right / tally.asked * 100)}%)`
            : 'Your score will show here.';
    }

    function next() {
        const id = select.value || drillPick(Object.keys(drillTopics));
        const topic = drillTopics[id];
        const item = topic.make();

        meta.replaceChildren(topic.title + ' · ');
        const link = make('a', null, 'Read the notes');
        link.href = topic.link;
        meta.appendChild(link);

        question.textContent = item.text ? `${item.question} ${item.text}` : item.question;
        code.textContent = item.code || '';
        code.hidden = !item.code;
        feedback.hidden = true;
        options.replaceChildren();

        item.options.forEach((text, index) => {
            const row = make('li');
            const button = makeButton(`${String.fromCharCode(65 + index)}. ${text}`, () => {
                const right = text === item.answer;
                options.querySelectorAll('button').forEach((other, i) => {
                    other.disabled = true;
                    if (item.options[i] === item.answer) other.classList.add('correct');
                    else if (i === index) other.classList.add('wrong');
                });
                feedback.textContent = item.why;
                feedback.hidden = false;
                tally.asked++;
                if (right) tally.right++;
                save('drill:tally', tally);
                updateScore();
                track('answered drill');
            });
            button.classList.add('quiz-option');
            row.appendChild(button);
            options.appendChild(row);
        });
    }

    select.addEventListener('change', next);

    const top = make('div', 'button-row');
    top.append(select, makeButton('Next question ▶', next));
    const bottom = make('div', 'button-row');
    bottom.append(score, makeConfirmButton('Reset score', () => {
        tally.right = 0;
        tally.asked = 0;
        save('drill:tally', tally);
        updateScore();
    }));

    holder.replaceChildren(top, meta, question, code, options, feedback, bottom);
    updateScore();
    next();
}

if (typeof document !== 'undefined') buildDrills();
