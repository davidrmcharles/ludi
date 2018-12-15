// Touch Handling

function registerTouchHandlers() {
    var targets = getTargets();
    for (var i = 0; i < targets.length; i++) {
        targets[i].addEventListener('click', onTargetTouched);
    }

    var sources = getSources();
    for (var i = 0; i < sources.length; i++) {
        sources[i].addEventListener('click', onSourceTouched);
    }
}

function onTargetTouched(event) {

    var target = event.target;
    if (!target.classList.contains('target')) {
        target = target.parentElement;
    }

    moveSourceToThePile(target.firstChild);
    setHotTarget(target);
}

function setHotTarget(hotTarget) {
    var targets = getTargets();
    for (var i = 0; i < targets.length; i++) {
        if (targets[i] == hotTarget) {
            addHotness(targets[i]);
        } else  {
            removeHotness(targets[i]);
        }
    }
}

function onSourceTouched(event) {
    if (event.target.parentElement != getThePile()) {
        // This event will be handled by onTargetTouched.
        return;
    }

    moveSourceToHotTarget(event.target);
    advanceHotTarget();
}

function moveSourceToHotTarget(source) {
    var hotTarget = getTheHotTarget();
    if (hotTarget == null) {
        return;
    }

    moveSourceToThePile(hotTarget.firstChild);
    hotTarget.appendChild(source);
}

function moveSourceToThePile(source) {
    if (source == null) {
        return;
    }
    getThePile().appendChild(source);
}

function advanceHotTarget() {
    // Remove hotness from the current hot target.
    var hotTarget = getTheHotTarget();
    if (hotTarget == null) {
        return;
    }
    removeHotness(hotTarget);

    // Add hotness to the next target.
    var nextHotTarget = nextEmptyTarget(hotTarget);
    if (nextHotTarget != null) {
        addHotness(nextHotTarget);
    }
}

function nextEmptyTarget(target) {
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

    for (var i = targetIds.indexOf(target.id) + 1; i != targetIds.length; i++) {
        var nextTarget = document.getElementById(targetIds[i]);
        if (nextTarget.firstChild == null) {
            return nextTarget;
        }
    }

    return null;
}

function addHotness(target) {
    target.classList.add('hot-target');
}

function removeHotness(target) {
    target.classList.remove('hot-target');
}

// Answer Checking

function checkAnswers() {
    var correctness = [];
    var targets = getTargets();
    for (var i = 0; i < targets.length; i++) {
        correctness.push(checkAnswer(targets[i]));
    }

    if (correctness.every(function(e) { return !!e; })) {
        var button = document.getElementById('check-answers-button');
        var youWin = document.getElementById('you-win');
        button.style.display = 'none';
        youWin.style.display = 'inline';
    }
}

function checkAnswer(target) {
    if (target.firstChild == null) {
        setTargetIncorrectness(target);
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
        clearTargetIncorrectness(target);
        return true;
    } else {
        setTargetIncorrectness(target);
        return false;
    }
}

function setTargetIncorrectness(target) {
    target.style.backgroundColor = 'salmon';
}

function clearTargetIncorrectness(target) {
    target.style.backgroundColor = 'white';
}

// Shuffling the Pile

function shuffleThePile() {
    var thePile = getThePile();
    for (var i = thePile.children.length; i > 0; i--) {
        thePile.appendChild(thePile.children[Math.random() * i | 0]);
    }
}

// Important Elements

function getThePile() {
    return document.getElementById('the-pile');
}

function getTargets() {
    return document.getElementsByClassName('target');
}

function getTheHotTarget() {
    return document.getElementsByClassName('hot-target')[0];
}

function getSources() {
    return document.getElementsByClassName('source');
}

// Would you call this 'Main'?

window.onload = function() {
    registerTouchHandlers();
    shuffleThePile();
}
