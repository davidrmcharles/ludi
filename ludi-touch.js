// The Timer

_timerId = null;
_elapsedTime = 0

function startTimer() {
    _timerId = setInterval(tick, 1000);
}

function stopTimer() {
    clearInterval(_timerId);
}

function tick() {
    _elapsedTime++;
    getTimer().innerHTML = formatTime(_elapsedTime);
}

function formatTime(seconds) {
    return seconds + ' second(s)';
}

// Touch Handling

function onTargetTouched(event) {

    var target = event.target;
    if (!target.classList.contains('target')) {
        target = target.parentElement;
    }

    moveSourceToPile(target.firstChild);
    setHotTarget(target);
}

function onSourceTouched(event) {
    if (event.target.parentElement != getPile()) {
        // This event will be handled by onTargetTouched.
        return;
    }

    if (event.target.classList.contains('assigned')) {
        // The source is already assigned.
        return;
    }

    moveSourceToHotTarget(event.target);
    advanceHotTarget();
}

function moveSourceToHotTarget(source) {
    var hotTarget = getHotTarget();
    if (hotTarget == null) {
        return;
    }

    moveSourceToPile(hotTarget.firstChild);

    cloneOfSource = source.cloneNode();
    cloneOfSource.id = decorateSourceId(cloneOfSource.id);
    hotTarget.appendChild(cloneOfSource);
    source.classList.add('assigned')

    removeErroneousness(hotTarget);
}

function moveSourceToPile(source) {
    if (source == null) {
        return;
    }

    source.parentElement.removeChild(source);
    sourceId = undecorateSourceId(source.id);
    document.getElementById(sourceId).classList.remove('assigned');
}

function decorateSourceId(id) {
    return id + '.clone';
}

function undecorateSourceId(id) {
    tokens = id.split('.');
    tokens.pop();
    return tokens.join('.');
}

// The Hot Target

function setHotTarget(hotTarget) {
    for (var target of getTargets()) {
        if (target === hotTarget) {
            addHotness(target);
        } else  {
            removeHotness(target);
        }
    }
}

function advanceHotTarget() {
    // Remove hotness from the current hot target.
    var hotTarget = getHotTarget();
    if (hotTarget == null) {
        return;
    }
    removeHotness(hotTarget);

    // Add hotness to the next target.
    var nextHotTarget = nextEmptyOrErroneousTarget(hotTarget);
    if (nextHotTarget != null) {
        addHotness(nextHotTarget);
    }
}

function nextEmptyOrErroneousTarget(target) {
    var targetIds = [
        'nominative-singular',
        'genitive-singular',
        'dative-singular',
        'accusative-singular',
        'ablative-singular',
        'nominative-plural',
        'genitive-plural',
        'dative-plural',
        'accusative-plural',
        'ablative-plural',
    ];

    var startIndex = (targetIds.indexOf(target.id) + 1) % targetIds.length;
    var targetIds_ = targetIds.slice(startIndex).concat(
        targetIds.slice(0, startIndex));
    for (var index = 0; index < targetIds_.length; ++index) {
        var target_ = document.getElementById(targetIds_[index]);
        if (target_.firstChild == null) {
            return target_;
        } else if (target_.classList.contains('erroneous')) {
            return target_;
        }
    }

    return null;
}

function addHotness(target) {
    target.classList.add('hot');
}

function removeHotness(target) {
    target.classList.remove('hot');
}

function hideElement(elem) {
    elem.classList.add('hidden');
}

function showElement(elem) {
    elem.classList.remove('hidden');
}

// Answer Checking

function checkAnswers() {
    var correctness = [];
    for (var target of getTargets()) {
        correctness.push(checkAnswer(target));
    }

    if (correctness.every(function(e) { return !!e; })) {
        stopGame();
    }
}

function checkAnswer(target) {
    if (target.firstChild == null) {
        addErroneousness(target);
        return false;
    }

    var answers = {
        'nominative-singular': 'ending-a',
        'genitive-singular': 'ending-ae',
        'dative-singular': 'ending-ae',
        'accusative-singular': 'ending-am',
        'ablative-singular': 'ending-a',
        'nominative-plural': 'ending-ae',
        'genitive-plural': 'ending-arum',
        'dative-plural': 'ending-is',
        'accusative-plural': 'ending-as',
        'ablative-plural': 'ending-is',
    };

    var answer = answers[target.id];
    var sourceId = target.firstChild.id.split('.')[0];
    if (sourceId == answer) {
        removeErroneousness(target);
        return true;
    } else {
        addErroneousness(target);
        return false;
    }
}

function addErroneousness(target) {
    if (!target.classList.contains('erroneous')) {
        target.classList.add('erroneous');
    }
}

function removeErroneousness(target) {
    if (target.classList.contains('erroneous')) {
        target.classList.remove('erroneous');
    }
}

// Important Elements

function getPile() {
    return document.getElementById('the-pile');
}

function getTargets() {
    return document.getElementsByClassName('target');
}

function getHotTarget() {
    return document.getElementsByClassName('hot')[0];
}

function getSources() {
    return document.getElementsByClassName('source');
}

function getStartButton() {
    return document.getElementById('start-game-button');
}

function getStopButton() {
    return document.getElementById('check-answers-button');
}

function getWinBanner() {
    return document.getElementById('you-win');
}

function getTimer() {
    return document.getElementById('timer');
}

// Starting the Game

function startGame() {
    registerTouchHandlers();
    shufflePile();
    showPile();
    showElement(getTimer());
    startTimer();
    hideElement(getStartButton());
    showElement(getStopButton());
}

function registerTouchHandlers() {
    for (var target of getTargets()) {
        target.addEventListener('click', onTargetTouched);
    }

    for (var source of getSources()) {
        source.addEventListener('click', onSourceTouched);
    }
}

function shufflePile() {
    var pile = getPile();
    for (var i = pile.children.length; i > 0; i--) {
        pile.appendChild(pile.children[Math.random() * i | 0]);
    }
}

function showPile() {
    for (var source of getPile().children) {
        showElement(source);
    }
}

// Stopping the Game

function stopGame() {
    stopTimer();
    unregisterTouchHandlers();
    hideElement(getStopButton());
    showElement(getWinBanner());
}

function unregisterTouchHandlers() {
    for (var target of getTargets()) {
        target.removeEventListener('click', onTargetTouched);
    }

    for (var source of getSources()) {
        source.removeEventListener('click', onSourceTouched);
    }
}
