// Debugging challenges for debug.html and esp-practice.html.
// Each task has:
//   id, title    used by <div class="debug-task" data-id="..."></div>
//   brief        what the code is meant to do
//   code         the faulty code the student starts with
//   tests        [Python expression, the value it should equal] pairs
//   hint         optional nudge
//   fixes        [line, defect, error type, correction] rows
//   fix          working code. Every test must pass against it
//   timeout      optional, in milliseconds. Tasks using pandas need longer
//
// After changing anything here, open debug.html?selftest in a browser.
// It checks that every faulty program fails and every fix passes.

const debugChallenges = [
    {
        id: 'adult',
        title: 'Missing punctuation',
        brief: 'is_adult(age) should return True for an age of 18 or over, and False otherwise. The program will not run at all.',
        code: `def vat_price(price):
    total = price * 1.2
    return round(total, 2)

def is_adult(age)
    if age >= 18:
        return True
    return False`,
        tests: [['vat_price(10)', '12.0'], ['is_adult(18)', 'True'], ['is_adult(17)', 'False']],
        hint: 'Python tells you which line it could not understand. Compare that line with line 1.',
        fixes: [['5', 'The function header has no colon', 'Syntax', 'def is_adult(age):']],
        fix: `def vat_price(price):
    total = price * 1.2
    return round(total, 2)

def is_adult(age):
    if age >= 18:
        return True
    return False`
    },
    {
        id: 'ticket',
        title: 'Ticket prices',
        brief: 'Under-5s go free. Ages 5 to 15 pay £4. People aged 65 or over pay £5. Everyone else pays £8.',
        code: `def ticket_price(age):
    if age < 5:
        return 0
    elif age < 16:
        return 4
    elif age > 65:
        return 5
    else:
        return 8`,
        tests: [['ticket_price(4)', '0'], ['ticket_price(5)', '4'], ['ticket_price(15)', '4'], ['ticket_price(16)', '8'], ['ticket_price(64)', '8'], ['ticket_price(65)', '5']],
        hint: 'Try the ages right at the edge of each price band.',
        fixes: [['6', 'A 65-year-old should pay £5, but > leaves out exactly 65', 'Logic', 'elif age >= 65:']],
        fix: `def ticket_price(age):
    if age < 5:
        return 0
    elif age < 16:
        return 4
    elif age >= 65:
        return 5
    else:
        return 8`
    },
    {
        id: 'total',
        title: 'Adding up',
        brief: 'total_to(n) should add every whole number from 1 to n, including n.',
        code: `def total_to(n):
    total = 0
    for number in range(1, n):
        total = total + number
    return total`,
        tests: [['total_to(1)', '1'], ['total_to(3)', '6'], ['total_to(10)', '55']],
        hint: 'What is the last number that range() gives you?',
        fixes: [['3', 'range() stops before its end value, so n is never added', 'Logic', 'for number in range(1, n + 1):']],
        fix: `def total_to(n):
    total = 0
    for number in range(1, n + 1):
        total = total + number
    return total`
    },
    {
        id: 'receipt',
        title: 'Receipt line',
        brief: 'receipt("Tea", 2, 1.5) should return exactly "Tea x2 = £3.00", with the total always shown to two decimal places.',
        code: `def receipt(item, quantity, price):
    total = quantity * price
    return item + " x" + quantity + " = £" + total`,
        tests: [['receipt("Tea", 2, 1.5)', '"Tea x2 = £3.00"'], ['receipt("Scone", 1, 2.75)', '"Scone x1 = £2.75"']],
        hint: 'You can only join strings to strings. format(number, ".2f") gives a string with two decimal places.',
        fixes: [
            ['3', 'quantity is an int, so it cannot be joined to a string', 'Runtime (TypeError)', 'str(quantity)'],
            ['3', 'total is a number, and needs two decimal places', 'Runtime (TypeError)', 'format(total, ".2f")']
        ],
        fix: `def receipt(item, quantity, price):
    total = quantity * price
    return item + " x" + str(quantity) + " = £" + format(total, ".2f")`
    },
    {
        id: 'average',
        title: 'Average',
        brief: 'average(numbers) should return the mean of a list of numbers. For an empty list it should return 0.',
        code: `def average(numbers):
    for number in numbers:
        total = 0
        total = total + number
    return total / len(numbers)`,
        tests: [['average([2, 4, 6])', '4.0'], ['average([5])', '5.0'], ['average([])', '0']],
        hint: 'Trace the value of total through a list of three numbers.',
        fixes: [
            ['3', 'total goes back to 0 on every pass of the loop', 'Logic', 'Set total = 0 before the loop'],
            ['5', 'An empty list has no total to return and would divide by zero', 'Runtime', 'Return 0 first if len(numbers) == 0']
        ],
        fix: `def average(numbers):
    if len(numbers) == 0:
        return 0
    total = 0
    for number in numbers:
        total = total + number
    return total / len(numbers)`
    },
    {
        id: 'highest',
        title: 'Highest temperature',
        brief: 'highest(temperatures) should return the largest value in a list that has at least one item. The list may contain negative numbers.',
        code: `def highest(temperatures):
    best = 0
    for temperature in temperatures:
        if temperature > best:
            best = temperature
    return best`,
        tests: [['highest([3, 9, 2])', '9'], ['highest([-5, -2, -8])', '-2']],
        hint: 'What happens on a very cold day, when every reading is below zero?',
        fixes: [['2', 'Starting at 0 gives the wrong answer if every value is negative', 'Logic', 'best = temperatures[0]']],
        fix: `def highest(temperatures):
    best = temperatures[0]
    for temperature in temperatures:
        if temperature > best:
            best = temperature
    return best`
    },
    {
        id: 'find',
        title: 'Finding a name',
        brief: 'find_name(names, target) should return True if target is anywhere in the list, and False if it is not.',
        code: `def find_name(names, target):
    for name in names:
        if name == target:
            return True
        return False`,
        tests: [['find_name(["Ali", "Sam"], "Sam")', 'True'], ['find_name(["Ali", "Sam"], "Jo")', 'False'], ['find_name([], "Jo")', 'False']],
        hint: 'How many names does the loop actually look at? Check the indentation.',
        fixes: [['5', 'return False is inside the loop, so the search gives up after the first name', 'Logic', 'Move return False out of the loop, level with for']],
        fix: `def find_name(names, target):
    for name in names:
        if name == target:
            return True
    return False`
    },
    {
        id: 'password',
        title: 'Password rules',
        brief: 'strong_password(password) should return True if the password has at least 8 characters and at least one digit.',
        code: `def strong_password(password):
    has_digit = False
    for character in password:
        if character.isdigit():
            has_digit = True
        else:
            has_digit = False
    return len(password) > 8 and has_digit`,
        tests: [['strong_password("abc12def")', 'True'], ['strong_password("1abcdefgh")', 'True'], ['strong_password("abcdefgh")', 'False'], ['strong_password("a1")', 'False']],
        hint: 'Trace "1abcdefgh". What is has_digit after the last character? Then try a password of exactly 8 characters.',
        fixes: [
            ['6–7', 'A later letter sets has_digit back to False', 'Logic', 'Remove the else branch'],
            ['8', '> 8 rejects a password of exactly 8 characters', 'Logic', 'len(password) >= 8']
        ],
        fix: `def strong_password(password):
    has_digit = False
    for character in password:
        if character.isdigit():
            has_digit = True
    return len(password) >= 8 and has_digit`
    },
    {
        id: 'quantity',
        title: 'Reading a file',
        brief: 'total_quantity(lines) gets lines from a CSV file. The first line is a header, and the rest look like "tea,2". It should return the total of the quantities.',
        code: `def total_quantity(lines):
    total = 0
    for line in lines:
        parts = line.split(",")
        total = total + parts[1]
    return total`,
        tests: [['total_quantity(["item,quantity", "tea,2", "scone,3"])', '5'], ['total_quantity(["item,quantity"])', '0']],
        hint: 'Everything read from a text file is a string. And what is on the first line?',
        fixes: [
            ['3', 'The header line is treated as data', 'Runtime (TypeError)', 'for line in lines[1:]:'],
            ['5', 'parts[1] is a string, so it cannot be added to a number', 'Runtime (TypeError)', 'total = total + int(parts[1])']
        ],
        fix: `def total_quantity(lines):
    total = 0
    for line in lines[1:]:
        parts = line.split(",")
        total = total + int(parts[1])
    return total`
    },
    {
        id: 'divide',
        title: 'Safe division',
        brief: 'safe_divide(a, b) should return a divided by b, or 0 if b is zero. It must not crash.',
        code: `def safe_divide(a, b):
    try:
        result = a / b
    except ValueError:
        result = 0
    return result`,
        tests: [['safe_divide(6, 3)', '2.0'], ['safe_divide(1, 0)', '0']],
        hint: 'Run it with b as 0 and read the name of the error Python gives you.',
        fixes: [['4', 'Dividing by zero raises ZeroDivisionError, not ValueError', 'Runtime (ZeroDivisionError)', 'except ZeroDivisionError:']],
        fix: `def safe_divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        result = 0
    return result`
    },
    {
        id: 'top',
        title: 'Top three',
        brief: 'top_three(scores) should return the three highest scores, highest first.',
        code: `def top_three(scores):
    ordered = scores.sort(reverse=True)
    return ordered[0:3]`,
        tests: [['top_three([1, 5, 3, 9])', '[9, 5, 3]'], ['top_three([2, 1])', '[2, 1]']],
        hint: 'What does list.sort() return? Compare it with sorted().',
        fixes: [['2', '.sort() changes the list and returns None, so ordered is None', 'Runtime (TypeError)', 'ordered = sorted(scores, reverse=True)']],
        fix: `def top_three(scores):
    ordered = sorted(scores, reverse=True)
    return ordered[0:3]`
    },
    {
        id: 'binary',
        title: 'Binary search',
        brief: 'binary_search(items, target) should return the index of target in a sorted list, or -1 if it is missing. This code can get stuck, so the check stops it after a few seconds.',
        code: `def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        elif items[middle] < target:
            low = middle
        else:
            high = middle - 1
    return -1`,
        tests: [['binary_search([1, 3, 5, 7], 7)', '3'], ['binary_search([1, 3, 5, 7], 1)', '0'], ['binary_search([1, 3, 5, 7], 4)', '-1'], ['binary_search([], 1)', '-1']],
        hint: 'Trace it with [1, 3] and a target of 3. Does low ever change?',
        fixes: [['9', 'low can stay the same forever, so the loop never ends', 'Logic (infinite loop)', 'low = middle + 1']],
        fix: `def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        elif items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1`
    },

    // Practice ESP: Moorside Bike Hire
    {
        id: 'esp-cost',
        title: 'Hire cost',
        brief: 'hire_cost(hours, bike_type, member) should follow the price list in the pre-release. Hires must be 1 to 8 hours, and anything else returns -1. This program has three defects.',
        code: `def hire_cost(hours, bike_type, member):
    if hours < 1 or hours > 8:
        return -1
    cost = 6 + hours * 4
    if bike_type = "electric":
        cost = cost + 10
    if member:
        cost = cost * 0.1
    return round(cost, 2)`,
        tests: [['hire_cost(1, "standard", False)', '6'], ['hire_cost(3, "standard", False)', '14'], ['hire_cost(3, "electric", False)', '24'], ['hire_cost(2, "standard", True)', '9.0'], ['hire_cost(3, "electric", True)', '21.6'], ['hire_cost(0, "standard", False)', '-1'], ['hire_cost(9, "standard", False)', '-1']],
        hint: 'The first hour costs £6, and only the extra hours cost £4. A 10% discount means paying 90%.',
        fixes: [
            ['4', 'Charges £4 for every hour, including the first', 'Logic', 'cost = 6 + (hours - 1) * 4'],
            ['5', '= assigns a value. A comparison needs ==', 'Syntax', 'if bike_type == "electric":'],
            ['8', 'Multiplying by 0.1 charges 10% instead of taking 10% off', 'Logic', 'cost = cost * 0.9']
        ],
        fix: `def hire_cost(hours, bike_type, member):
    if hours < 1 or hours > 8:
        return -1
    cost = 6 + (hours - 1) * 4
    if bike_type == "electric":
        cost = cost + 10
    if member:
        cost = cost * 0.9
    return round(cost, 2)`
    },
    {
        id: 'esp-available',
        title: 'Bikes available',
        brief: 'available(stock, hires, location) should return how many bikes are at a hire point now: its stock minus the bikes hired from there that have not come back. This program has three defects.',
        code: `def available(stock, hires, location):
    out = 0
    for hire in hires:
        if hire["location"] == location or hire["returned"] == False:
            out =+ 1
    return stock[location] + out`,
        tests: [
            ['available({"Station": 5}, [{"location": "Station", "returned": False}, {"location": "Station", "returned": True}, {"location": "Castle", "returned": False}], "Station")', '4'],
            ['available({"Station": 5}, [{"location": "Station", "returned": False}, {"location": "Station", "returned": False}], "Station")', '3'],
            ['available({"Station": 5}, [], "Station")', '5']
        ],
        hint: 'A bike only counts as out if both things are true. Also look closely at =+ on line 5.',
        fixes: [
            ['4', 'or counts bikes from other hire points and bikes already returned', 'Logic', 'Use and instead of or'],
            ['5', '=+ sets out to 1 each time instead of adding 1', 'Logic', 'out += 1'],
            ['6', 'Bikes that are out should be taken away, not added', 'Logic', 'return stock[location] - out']
        ],
        fix: `def available(stock, hires, location):
    out = 0
    for hire in hires:
        if hire["location"] == location and hire["returned"] == False:
            out += 1
    return stock[location] - out`
    },
    {
        id: 'esp-income',
        title: 'Income by hire point',
        brief: 'income_by_location(lines) gets lines from a CSV file with a header. Each line after that looks like "Station,6.00". It should return a dictionary of the total income for each hire point. This program has one defect.',
        code: `def income_by_location(lines):
    totals = {}
    for line in lines[1:]:
        location, cost = line.strip().split(",")
        if location in totals:
            totals[location] = cost
        else:
            totals[location] = float(cost)
    return totals`,
        tests: [['income_by_location(["location,cost", "Station,6.00", "Station,10.00", "Castle,14.50"])', '{"Station": 16.0, "Castle": 14.5}'], ['income_by_location(["location,cost"])', '{}']],
        hint: 'Trace what happens the second time a hire point appears.',
        fixes: [['6', 'Replaces the running total with a string instead of adding to it', 'Logic', 'totals[location] = totals[location] + float(cost)']],
        fix: `def income_by_location(lines):
    totals = {}
    for line in lines[1:]:
        location, cost = line.strip().split(",")
        if location in totals:
            totals[location] = totals[location] + float(cost)
        else:
            totals[location] = float(cost)
    return totals`
    },
    {
        id: 'esp-build',
        title: 'Hire system prototype',
        brief: 'Complete all four functions so the checks pass. Copy your corrected hire_cost from Task 2. valid_hours takes text as typed by a user. add_hire stores a valid hire in the list and returns True, or returns False and stores nothing. income_report uses pandas and returns a dictionary of total income for each hire point.',
        timeout: 120000,
        code: `import pandas as pd

def valid_hours(entry):
    pass

def hire_cost(hours, bike_type, member):
    pass

def add_hire(hires, location, bike_type, entry, member):
    pass

def income_report(hires):
    pass`,
        tests: [
            ['valid_hours("3")', 'True'], ['valid_hours("1")', 'True'], ['valid_hours("8")', 'True'],
            ['valid_hours("0")', 'False'], ['valid_hours("9")', 'False'], ['valid_hours("nine")', 'False'], ['valid_hours("")', 'False'],
            ['hire_cost(3, "electric", True)', '21.6'],
            ['add_hire([], "Station", "standard", "2", False)', 'True'],
            ['add_hire([], "Station", "standard", "nine", False)', 'False'],
            ['(lambda h: (add_hire(h, "Castle", "standard", "2", False), h[0]["cost"]))([])[1]', '10'],
            ['(lambda h: (add_hire(h, "Castle", "standard", "0", False), len(h)))([])[1]', '0'],
            ['income_report([{"location": "Station", "cost": 6.0}, {"location": "Station", "cost": 14.0}, {"location": "Castle", "cost": 9.0}])', '{"Castle": 9.0, "Station": 20.0}']
        ],
        hint: 'Build one function at a time and press Check after each one. Test valid_hours first, because add_hire depends on it.',
        fixes: [],
        fix: `import pandas as pd

def valid_hours(entry):
    if not entry.isdigit():
        return False
    return 1 <= int(entry) <= 8

def hire_cost(hours, bike_type, member):
    if hours < 1 or hours > 8:
        return -1
    cost = 6 + (hours - 1) * 4
    if bike_type == "electric":
        cost = cost + 10
    if member:
        cost = cost * 0.9
    return round(cost, 2)

def add_hire(hires, location, bike_type, entry, member):
    if not valid_hours(entry):
        return False
    hours = int(entry)
    hires.append({
        "location": location,
        "bike_type": bike_type,
        "hours": hours,
        "cost": hire_cost(hours, bike_type, member)
    })
    return True

def income_report(hires):
    data = pd.DataFrame(hires)
    return data.groupby("location")["cost"].sum().to_dict()`
    }
];
