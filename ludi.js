// ludi.js
//
// The logic behind first-declension.html
//
// Internal Overview:
//
// * Initialization
// * Starting the Game
// * Stopping the Game
// * The Timer
// * Touch Event Handling
// * The Hot Target
// * Answer Checking
// * Important Elements

// Initialization

_targetIds = [];
_answers = {};

window.onload = function() {
    var answersList = document.getElementById('answers');
    for (child of answersList.children) {
        _answers[child.id] = child.textContent;
    }

    _targetIds = Object.keys(_answers);
}

// Starting the Game

function startGame() {
    initAudio();
    registerTouchHandlers();
    shuffleTiles();
    showTiles();
    showElement(getTimer());
    startTimer();
    hideElement(getStartButton());
    setHotTarget(document.getElementById('nominative-singular'));
}

function initAudio() {
    _audioContext = new window.AudioContext();
    initAudioElements();
    initShuffleAudioElement();
    initYayAudioElement();
}

function initAudioElements() {
    _audioElements = []
    var audioElements = document.getElementsByClassName('audio');
    for (var audioElement of audioElements) {
        var media = _audioContext.createMediaElementSource(audioElement);
        media.connect(_audioContext.destination);
        var endingId = audioIdToEndingId(audioElement.id)
        _audioElements[endingId] = audioElement
    }
}

function initShuffleAudioElement() {
    _shuffleAudioElement = document.getElementById('shuffle');
    var media = _audioContext.createMediaElementSource(_shuffleAudioElement);
    media.connect(_audioContext.destination);
}

function initYayAudioElement() {
    _yayAudioElement = document.getElementById('yay');
    var media = _audioContext.createMediaElementSource(_yayAudioElement);
    media.connect(_audioContext.destination);
}

function audioIdToEndingId(audioId) {
    return audioId.substring(audioId.indexOf('-') + 1);
}

function registerTouchHandlers() {
    for (var target of getTargets()) {
        target.addEventListener('click', onTargetTouched);
    }

    for (var tile of getTiles()) {
        tile.addEventListener('click', onTileTouched);
    }
}

function shuffleTiles() {
    var pile = getPile();
    for (var i = pile.children.length; i > 0; i--) {
        pile.appendChild(pile.children[Math.random() * i | 0]);
    }
    playShuffleSound();
}

function playShuffleSound() {
    _shuffleAudioElement.play();
}

function showTiles() {
    for (var child of getPile().children) {
        if (child.classList.contains('tile')) {
            showElement(child);
        }
    }
}

function hideTiles() {
    for (var child of getPile().children) {
        if (child.classList.contains('tile')) {
            hideElement(child);
        }
    }
}

// Stopping the Game

function stopGame() {
    hideTiles();
    stopTimer();
    unregisterTouchHandlers();
    showElement(getWinBanner());
    playYaySound();
}

function playYaySound() {
    setTimeout(
        function() {
            _yayAudioElement.play();
        },
        1000);
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
    showTiles();
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

    playTileSound(event.target);
    moveTileToHotTarget(event.target);
    var allTargetsAreFull = advanceHotTarget();
    if (allTargetsAreFull) {
        checkAnswers();
    }
}

function playTileSound(tile) {
    var endingId = tileIdToEndingId(tile.id);
    _audioElements[endingId].play();
}

function tileIdToEndingId(tileId) {
    var indexOfDash = tileId.indexOf('-');
    return tileId.substring(indexOfDash + 1);
}

function moveTileToHotTarget(tile) {
    var hotTarget = getHotTarget();
    if (hotTarget == null) {
        return;
    }

    moveTileToPile(hotTarget.firstChild);

    cloneOfTile = tile.cloneNode();
    cloneOfTile.id = decorateTileId(cloneOfTile.id);
    cloneOfTile.style.padding = '0px';
    cloneOfTile.style.border = 'none';
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
        return false;
    }
    removeHotness(hotTarget);

    // Add hotness to the next target.
    var nextHotTarget = nextEmptyOrErroneousTarget(hotTarget);
    if (nextHotTarget != null) {
        addHotness(nextHotTarget);
        return false;
    } else {
        return true;
    }
}

function nextEmptyOrErroneousTarget(target) {
    var startIndex = (_targetIds.indexOf(target.id) + 1) % _targetIds.length;
    var targetIds_ = _targetIds.slice(startIndex).concat(
        _targetIds.slice(0, startIndex));
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

    var answer = _answers[target.id];
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
    return document.getElementById('pile');
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
    return document.getElementById('start-button');
}

function getWinBanner() {
    return document.getElementById('you-win');
}

function getTimer() {
    return document.getElementById('timer');
}
