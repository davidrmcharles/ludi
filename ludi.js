// ludi.js
//
// Put the Latin endings into order!

window.onload = function() {
    ludus.onLoadInit()
}

ludus = {

    _startButton: null,
    _winBanner: null,

    onLoadInit: function() {
        this._startButton = document.getElementById('start-button');
        this._winBanner = document.getElementById('you-win');
        _targets.onLoadInit();
        _tiles.onLoadInit();
    },

    start: function() {
        _audio.onStartInit();
        _targets.activate();
        _tiles.show();
        _timer.start();
        _tools.hideElement(this._startButton);
    },

    stop: function() {
        _tiles.hide();
        _timer.stop();
        _targets.deactivate();
        _tools.showElement(this._winBanner);
        _audio.playYaySound();
        setTimeout(
            function() {
                _tools.hideElement(this._winBanner);
                _tools.showElement(this._startButton);
            }.bind(this),
            3000);
    },

    onTileTouched: function(event) {
        if (event.target.parentElement != _tiles._pileElement) {
            // This event will be handled by onTargetTouched.
            return;
        }

        if (event.target.classList.contains('assigned')) {
            // The tile is already assigned.
            return;
        }

        _audio.playTileSound(event.target);

        this._moveTileToHotTarget(event.target);  // Does two things?

        var allTargetsAreFull = _targets.advanceHotTarget();
        if (allTargetsAreFull) {
            _targets.checkAnswers();
        }
    },

    _moveTileToHotTarget: function(tile) {
        // Target-side changes
        var hotTarget = _targets.getHotTarget();
        cloneOfTile = tile.cloneNode();
        cloneOfTile.id = this._decorateTileId(cloneOfTile.id);
        cloneOfTile.style.padding = '0px';
        cloneOfTile.style.border = 'none';
        hotTarget.appendChild(cloneOfTile);
        _targets._removeErroneousness(hotTarget);

        // Tile-side changes
        tile.classList.add('assigned')
    },

    _decorateTileId: function(id) {
        return id + '.clone';
    },

    onTargetTouched: function(event) {
        // Normalize target.
        var target = event.target;
        if (!target.classList.contains('target')) {
            target = target.parentElement;
        }

        this._moveTileToPile(target.firstChild);
        _targets.setHotTarget(target);
    },

    _moveTileToPile: function(tile) {
        if (tile == null) {
            return;
        }

        tile.parentElement.removeChild(tile);
        tileId = this._undecorateTileId(tile.id);
        document.getElementById(tileId).classList.remove('assigned');
    },

    _undecorateTileId: function(id) {
        tokens = id.split('.');
        tokens.pop();
        return tokens.join('.');
    },

}

_audio = {

    _context: null,
    _tileAudioElements: [],
    _shuffleAudioElement: null,
    _yayAudioElement: null,

    onStartInit: function() {
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
                this._yayAudioElement.play();
            }.bind(this),
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
    _onTargetTouched: null,

    // Initialization

    onLoadInit: function() {
        this._targetElements = document.getElementsByClassName('target');

        var answersList = document.getElementById('answers');
        for (child of answersList.children) {
            this._answers[child.id] = child.textContent;
        }

        this._targetIds = Object.keys(this._answers);

        this._onTargetTouched = ludus.onTargetTouched.bind(ludus);
    },

    // Activation

    activate: function() {
        this._registerTouchHandlers();
        this.setHotTarget(document.getElementById('nominative-singular'));
    },

    _registerTouchHandlers: function() {
        for (var target of this._targetElements) {
            target.addEventListener('click', this._onTargetTouched);
        }

    },

    // Deactivation

    deactivate: function() {
        this._unregisterTouchHandlers();
    },

    _unregisterTouchHandlers: function() {
        for (var target of this._targetElements) {
            target.removeEventListener('click', this._onTargetTouched);
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
            ludus.stop();
        }
    },

    _checkAnswer: function(target) {
        if (target.firstChild == null) {
            this._addErroneousness(target);
            return false;
        }

        var answer = this._answers[target.id];
        var ending = this._tileIdToEnding(target.firstChild.id);
        if (ending == answer) {
            this._removeErroneousness(target);
            return true;
        } else {
            this._addErroneousness(target);
            return false;
        }
    },

    _tileIdToEnding: function(tileId) {
        var indexOfDash = tileId.indexOf('-');
        var indexOfDot = tileId.indexOf('.');
        if (indexOfDot < 0) {
            tileId.length;
        }
        return tileId.substring(indexOfDash + 1, indexOfDot);

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
    _onTileTouched: null,

    onLoadInit: function() {
        this._onTileTouched = ludus.onTileTouched.bind(ludus);
    },

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
            tileElement.addEventListener('click', this._onTileTouched);
        }
    },

    _shuffle: function() {
        for (var i = this._pileElement.children.length; i > 0; i--) {
            this._pileElement.appendChild(
                this._pileElement.children[Math.random() * i | 0]);
        }

        for (var target of _targets._targetElements) {
            ludus._moveTileToPile(target.firstChild);
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
            tileElement.removeEventListener('click', this._onTileTouched);
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
                this._tick();
            }.bind(this),
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

_tools = {

    hideElement: function(element) {
        element.classList.add('hidden');
    },

    showElement: function(element) {
        element.classList.remove('hidden');
    }

}
