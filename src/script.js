console.log('dvdsd');
const input = document.querySelector('input');
const textExample = document.querySelector('#textExample');
const symbolsPerMinute = document.querySelector('#symbolsPerMinute');
const errorPercent = document.querySelector('#errorPercent');
const letters = Array.from(document.querySelectorAll('[data-letters]'));
const specs = Array.from(document.querySelectorAll('[data-spec]'));
const text = `Их родина - Центральная Азия, где многочисленные племена кочевников-скотоводов образовали могучее военное государство.
Среди племен, носивших различные названия, сильнейшим было племя татар.
Поэтому соседние народы распространили это название и на другие монгольские племена.
Их родина – Центральная Азия, где многочисленные племена кочевников-скотоводов образовали могучее военное государство.
Среди племен, носивших различные названия, сильнейшим было племя татар.
Поэтому соседние народы распространили это название и на другие монгольские племена.`
 
const party = createParty(text);
init();

function init () {
    input.addEventListener('keydown', keydownHandler);
    input.addEventListener('keyup', keyupHandler);
    viewUpdate();
}

function keydownHandler (e) {
    e.preventDefault();
    const letter = letters.find( (x) => x.dataset.letters.includes(e.key));
    if (letter) {
        letter.classList.add('pressed');
        return
    }
    const ownSpecs = specs.filter(x => x.dataset.spec === e.key.toLowerCase());
    if (ownSpecs.length) {
        for (let item of ownSpecs) {
            item.classList.add('pressed');
        }
        return
    }
    console.warn('Unknown key', e);
}

function keyupHandler (e) {
    e.preventDefault();
    const letter = letters.find( (x) => x.dataset.letters.includes(e.key));
    if (letter) {
        press(e.key);
        letter.classList.remove('pressed');
        return
    }
    if (e.key.toLowerCase() == ' ') {
        press(' ');
    }

    if (e.key.toLowerCase() == 'enter') {
        press('\n');
    }
    const ownSpecs = specs.filter(x => x.dataset.spec === e.key.toLowerCase());
    if (ownSpecs.length) {

        for (let item of ownSpecs) {
            item.classList.remove('pressed');
        }
        return
    }
}

function createParty(text) {
    const party = {
        text,
        strings: [],
        maxStringLength: 70,
        maxShownStrinds: 3,
        currentStringIndex: 0,
        currentPressedIndex: 0,
        errors: [],
        started: false,
        startTime: 0,
        statisticFlag: false,
        timerCounter: 0,
        errorsCounter: 0,
        commonCounter: 0,
    };

    party.text = party.text.replace(/\n/g, '\n ');
    const words = party.text.split(' ');
    
    let string = [];
    for (const word of words) {
        let newStringLength = [...string, word].join(' ').length + !word.includes('\n');

        if (newStringLength > party.maxStringLength) {
            party.strings.push(string.join(' ') + ' ');
            string = [];
        }
        string.push(word);

        if (word.includes('\n')) {
            party.strings.push(string.join(' '));
            string = [];
        }
    }

    if (string.length) {
        party.strings.push(string.join(' '));
    }

    return party;
}

function press(letter) {
    party.started = true;
    if (!party.statisticFlag) {
        party.statisticFlag = true;
        party.startTime = Date.now();
    }
    const string = party.strings[party.currentStringIndex];
    const mustLetter = string[party.currentPressedIndex];

    if (letter == mustLetter) {
        party.currentPressedIndex++;
        if (string.length <= party.currentPressedIndex) {
            party.currentPressedIndex = 0;
            party.currentStringIndex++;

            party.statisticFlag = false;
            party.timerCounter = Date.now() - party.startTime;
        }
    } else if (!party.errors.includes(mustLetter)) {
        party.errors.push(mustLetter);
        party.errorsCounter++;
    }
    party.commonCounter++;
    viewUpdate();
}

function viewUpdate() {
    const string = party.strings[party.currentStringIndex];
    const showedStrings = party.strings.slice(party.currentStringIndex, party.currentStringIndex + party.maxShownStrinds)
    const div = document.createElement('div');

    const firstLine = document.createElement('div');
    div.classList.add('line');

    const done = document.createElement('span');
    done.classList.add('done');
    done.textContent = string.slice(0, party.currentPressedIndex);
    firstLine.append(done, ...string.slice(party.currentPressedIndex).split('').map(letter => {
        if (letter == ' ') {
            return '·'
        } else if (letter == '\n') {
            return '¶'
        }

        if (party.errors.includes(letter)) {
            const errorSpan = document.createElement('span');
            errorSpan.classList.add('hint');
            errorSpan.textContent = letter;
            return errorSpan;
        }
        return letter;
    }));
    div.append(firstLine);

    textExample.innerHTML = '';
    textExample.append(div);

    for (let i = 1; i < showedStrings.length; i++) {
        const line = document.createElement('div');
        div.classList.add('line');

        line.append(...showedStrings[i].split('').map(letter => {
            if (letter == ' ') {
                return '·'
            } else if (letter == '\n') {
                return '¶'
            } if (party.errors.includes(letter)) {
                const errorSpan = document.createElement('span');
                errorSpan.classList.add('hint');
                errorSpan.textContent = letter;
                return errorSpan;
            }
            return letter;
        }));
        div.append(line);
    }

    input.value = string.slice(0, party.currentPressedIndex);

    if (!party.statisticFlag) {
        symbolsPerMinute.textContent = party.commonCounter ? (party.commonCounter / (party.timerCounter / 1000 / 60)).toFixed(2) : 0;
        errorPercent.textContent = party.errorsCounter ? (party.errorsCounter / party.commonCounter).toFixed(2) + '%' : "0%";
    }
}