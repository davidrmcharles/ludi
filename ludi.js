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
    _audio.init();
    registerTouchHandlers();
    _tiles.show();
    _timer.start();
    hideElement(getStartButton());
    setHotTarget(document.getElementById('nominative-singular'));
}

_audio = {

    _context: null,
    _tileAudioElements: [],
    _shuffleAudioElement: null,
    _yayAudioElement: null,

    init: function() {
        if (this._context != null) {
            return;
        }

        this._context = new window.AudioContext();
        this._initTileAudioElements();
        this._initShuffleAudioElement();
        this._initYayAudioElement();
    },

    _initTileAudioElements: function() {
        var audioElements = document.getElementsByClassName('audio');
        for (var audioElement of audioElements) {
            this._connectAudioElement(audioElement);
            var endingId = this._audioIdToEndingId(audioElement.id)
            this._tileAudioElements[endingId] = audioElement
        }
    },

    _initShuffleAudioElement: function() {
        this._shuffleAudioElement = document.getElementById('shuffle');
        this._connectAudioElement(this._shuffleAudioElement);
    },

    _initYayAudioElement: function() {
        this._yayAudioElement = document.getElementById('yay');
        this._connectAudioElement(this._yayAudioElement);
    },

    _connectAudioElement: function(audioElement) {
        var media = this._context.createMediaElementSource(audioElement);
        media.connect(this._context.destination);
    },

    playTileSound: function(tile) {
        var endingId = this._tileIdToEndingId(tile.id);
        this._tileAudioElements[endingId].play();
    },

    playShuffleSound: function() {
        this._shuffleAudioElement.play();
    },

    playYaySound: function() {
        setTimeout(
            function() {
                _audio._yayAudioElement.play();
            },
            1000);
    },

    _audioIdToEndingId: function(audioId) {
        return audioId.substring(audioId.indexOf('-') + 1);
    },

    _tileIdToEndingId: function(tileId) {
        var indexOfDash = tileId.indexOf('-');
        return tileId.substring(indexOfDash + 1);
    },

}

function registerTouchHandlers() {
    for (var target of getTargets()) {
        target.addEventListener('click', onTargetTouched);
    }

}

_tiles = {

    _tileElements: null,
    _pileElement: null,

    show: function() {
        this._initElements();
        this._registerTouchHandlers();
        this._shuffle();
        this._show();
    },

    _initElements: function() {
        this._tileElements = document.getElementsByClassName('tile');
        this._pileElement = document.getElementById('pile');
    },

    _registerTouchHandlers: function() {
        for (var tileElement of this._tileElements) {
            tileElement.addEventListener('click', onTileTouched);
        }
    },

    _shuffle: function() {
        for (var i = this._pileElement.children.length; i > 0; i--) {
            this._pileElement.appendChild(
                this._pileElement.children[Math.random() * i | 0]);
        }

        for (var target of getTargets()) {
            moveTileToPile(target.firstChild);
        }

        _audio.playShuffleSound();
    },

    _show: function() {
        for (var child of this._pileElement.children) {
            if (child.classList.contains('tile')) {
                showElement(child);
            }
        }
    },

    hide: function() {
        this._unregisterTouchHandlers();
        this._hide();
    },

    _unregisterTouchHandlers: function() {
        for (var tileElement of this._tileElements) {
            tileElement.removeEventListener('click', onTileTouched);
        }

    },

    _hide: function() {
        for (var child of this._pileElement.children) {
            if (child.classList.contains('tile')) {
                hideElement(child);
            }
        }
    },

}

// Stopping the Game

function stopGame() {
    _tiles.hide();
    _timer.stop();
    unregisterTouchHandlers();
    showElement(getWinBanner());
    _audio.playYaySound();
    setTimeout(
        function() {
            hideElement(getWinBanner());
            showElement(getStartButton());
        },
        3000);
}

function unregisterTouchHandlers() {
    for (var target of getTargets()) {
        target.removeEventListener('click', onTargetTouched);
    }
}

_timer = {

    _timerId: null,
    _elapsedTime: null,
    _timerElement: null,

    start: function() {
        this._elapsedTime = 0;
        this._timerElement = document.getElementById('timer');
        this._updateDisplay();
        showElement(this._timerElement);
        this._timerId = setInterval(
            function() {
                _timer._tick();
            },
            1000);
    },

    stop: function() {
        clearInterval(this._timerId);
    },

    _tick: function() {
        this._elapsedTime++;
        this._updateDisplay();
    },

    _updateDisplay: function() {
        this._timerElement.innerHTML = this._elapsedTime + ' second(s)';
    },

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
    if (event.target.parentElement != _tiles._pileElement) {
        // This event will be handled by onTargetTouched.
        return;
    }

    if (event.target.classList.contains('assigned')) {
        // The tile is already assigned.
        return;
    }

    _audio.playTileSound(event.target);
    moveTileToHotTarget(event.target);
    var allTargetsAreFull = advanceHotTarget();
    if (allTargetsAreFull) {
        checkAnswers();
    }
}

function tileIdToEnding(tileId) {
    var indexOfDash = tileId.indexOf('-');
    var indexOfDot = tileId.indexOf('.');
    if (indexOfDot < 0) {
        tileId.length;
    }
    return tileId.substring(indexOfDash + 1, indexOfDot);

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
    var ending = tileIdToEnding(target.firstChild.id);
    if (ending == answer) {
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

function getTargets() {
    return document.getElementsByClassName('target');
}

function getHotTarget() {
    return document.getElementsByClassName('hot')[0];
}

function getStartButton() {
    return document.getElementById('start-button');
}

function getWinBanner() {
    return document.getElementById('you-win');
}

