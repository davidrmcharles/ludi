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

window.onload = function() {
    _targets.init();
}

// Starting the Game

function startGame() {
    _audio.init();
    _targets.activate();
    _tiles.show();
    _timer.start();
    _tools.hideElement(getStartButton());
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

_targets = {

    _targetElements: null,
    _targetIds: null,
    _answers: {},

    // Initialization

    init: function() {
        this._targetElements = document.getElementsByClassName('target');

        var answersList = document.getElementById('answers');
        for (child of answersList.children) {
            this._answers[child.id] = child.textContent;
        }

        this._targetIds = Object.keys(this._answers);
    },

    // Activation

    activate: function() {
        this._registerTouchHandlers();
        this.setHotTarget(document.getElementById('nominative-singular'));
    },

    _registerTouchHandlers: function() {
        for (var target of this._targetElements) {
            target.addEventListener('click', onTargetTouched);
        }

    },

    // Deactivation

    deactivate: function() {
        this._unregisterTouchHandlers();
    },

    _unregisterTouchHandlers: function() {
        for (var target of this._targetElements) {
            target.removeEventListener('click', onTargetTouched);
        }
    },

    // The Hot Target

    getHotTarget: function() {
        return document.getElementsByClassName('hot')[0];
    },

    setHotTarget: function(newHotTarget) {
        for (var target of this._targetElements) {
            if (target === newHotTarget) {
                this._addHotness(target);
            } else  {
                this._removeHotness(target);
            }
        }
    },

    advanceHotTarget: function() {
        // Remove hotness from the current hot target.
        var hotTarget = this.getHotTarget();
        if (hotTarget == null) {
            return false;
        }
        this._removeHotness(hotTarget);

        // Add hotness to the next target.
        var nextHotTarget = this._nextEmptyOrErroneousTarget(hotTarget);
        if (nextHotTarget != null) {
            this._addHotness(nextHotTarget);
            return false;
        } else {
            return true;
        }
    },

    _nextEmptyOrErroneousTarget: function(target) {
        var startIndex = (this._targetIds.indexOf(target.id) + 1) % this._targetIds.length;
        var targetIds_ = this._targetIds.slice(startIndex).concat(
            this._targetIds.slice(0, startIndex));
        for (var index = 0; index < targetIds_.length; ++index) {
            var target_ = document.getElementById(targetIds_[index]);
            if (target_.firstChild == null) {
                return target_;
            } else if (target_.classList.contains('erroneous')) {
                return target_;
            }
        }

        return null;
    },

    _addHotness: function(element) {
        element.classList.add('hot');
    },

    _removeHotness: function(element) {
        element.classList.remove('hot');
    },

    // Answer Checking

    checkAnswers: function() {
        var correctness = [];
        for (var target of this._targetElements) {
            correctness.push(this._checkAnswer(target));
        }

        if (correctness.every(function(e) { return !!e; })) {
            stopGame();
        }
    },

    _checkAnswer: function(target) {
        if (target.firstChild == null) {
            this._addErroneousness(target);
            return false;
        }

        var answer = this._answers[target.id];
        var ending = tileIdToEnding(target.firstChild.id);
        if (ending == answer) {
            this._removeErroneousness(target);
            return true;
        } else {
            this._addErroneousness(target);
            return false;
        }
    },

    _addErroneousness: function(target) {
        if (!target.classList.contains('erroneous')) {
            target.classList.add('erroneous');
        }
    },

    _removeErroneousness: function(target) {
        if (target.classList.contains('erroneous')) {
            target.classList.remove('erroneous');
        }
    },

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

        for (var target of _targets._targetElements) {
            moveTileToPile(target.firstChild);
        }

        _audio.playShuffleSound();
    },

    _show: function() {
        for (var child of this._pileElement.children) {
            if (child.classList.contains('tile')) {
                _tools.showElement(child);
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
                _tools.hideElement(child);
            }
        }
    },

}

// Stopping the Game

function stopGame() {
    _tiles.hide();
    _timer.stop();
    _targets.deactivate();
    _tools.showElement(getWinBanner());
    _audio.playYaySound();
    setTimeout(
        function() {
            _tools.hideElement(getWinBanner());
            _tools.showElement(getStartButton());
        },
        3000);
}

_timer = {

    _timerId: null,
    _elapsedTime: null,
    _timerElement: null,

    start: function() {
        this._elapsedTime = 0;
        this._timerElement = document.getElementById('timer');
        this._updateDisplay();
        _tools.showElement(this._timerElement);
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
    _targets.setHotTarget(target);
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
    var allTargetsAreFull = _targets.advanceHotTarget();
    if (allTargetsAreFull) {
        _targets.checkAnswers();
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
    var hotTarget = _targets.getHotTarget();
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

    _targets._removeErroneousness(hotTarget);
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

// Important Elements

function getStartButton() {
    return document.getElementById('start-button');
}

function getWinBanner() {
    return document.getElementById('you-win');
}

_tools = {

    hideElement: function(element) {
        element.classList.add('hidden');
    },

    showElement: function(element) {
        element.classList.remove('hidden');
    }

}
