// ludi.js
//
// The logic behind first-declension.html
//
// Internal Overview:
//
// * Starting the Game
// * Stopping the Game
// * The Timer
// * Touch Event Handling
// * The Hot Target
// * Answer Checking
// * Important Elements

// Starting the Game

function startGame() {
    registerTouchHandlers();
    shufflePile();
    showPile();
    showElement(getTimer());
    startTimer();
    hideElement(getStartButton());
    showElement(getStopButton());
    setHotTarget(document.getElementById('nominative-singular'));
}

function registerTouchHandlers() {
    for (var target of getTargets()) {
        target.addEventListener('click', onTargetTouched);
    }

    for (var tile of getTiles()) {
        tile.addEventListener('click', onTileTouched);
    }
}

function shufflePile() {
    var pile = getPile();
    for (var i = pile.children.length; i > 0; i--) {
        pile.appendChild(pile.children[Math.random() * i | 0]);
    }
}

function showPile() {
    for (var tile of getPile().children) {
        showElement(tile);
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

    for (var tile of getTiles()) {
        tile.removeEventListener('click', onTileTouched);
    }
}

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

// Touch Event Handling

function onTargetTouched(event) {

    var target = event.target;
    if (!target.classList.contains('target')) {
        target = target.parentElement;
    }

    moveTileToPile(target.firstChild);
    setHotTarget(target);
}

function onTileTouched(event) {
    if (event.target.parentElement != getPile()) {
        // This event will be handled by onTargetTouched.
        return;
    }

    if (event.target.classList.contains('assigned')) {
        // The tile is already assigned.
        return;
    }

    moveTileToHotTarget(event.target);
    advanceHotTarget();
}

function moveTileToHotTarget(tile) {
    var hotTarget = getHotTarget();
    if (hotTarget == null) {
        return;
    }

    moveTileToPile(hotTarget.firstChild);

    cloneOfTile = tile.cloneNode();
    cloneOfTile.id = decorateTileId(cloneOfTile.id);
    hotTarget.appendChild(cloneOfTile);
    tile.classList.add('assigned')

    removeErroneousness(hotTarget);
}

function moveTileToPile(tile) {
    if (tile == null) {
        return;
    }

    tile.parentElement.removeChild(tile);
    tileId = undecorateTileId(tile.id);
    document.getElementById(tileId).classList.remove('assigned');
}

function decorateTileId(id) {
    return id + '.clone';
}

function undecorateTileId(id) {
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
    var tileId = target.firstChild.id.split('.')[0];
    if (tileId == answer) {
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

function getTiles() {
    return document.getElementsByClassName('tile');
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
