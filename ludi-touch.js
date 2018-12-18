// Touch Handling

function onTargetTouched(event) {

    var target = event.target;
    if (!target.classList.contains('target')) {
        target = target.parentElement;
    }

    moveSourceToThePile(target.firstChild);
    setHotTarget(target);
}

function onSourceTouched(event) {
    if (event.target.parentElement != getThePile()) {
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
    var hotTarget = getTheHotTarget();
    if (hotTarget == null) {
        return;
    }

    moveSourceToThePile(hotTarget.firstChild);

    cloneOfSource = source.cloneNode();
    cloneOfSource.id = decorateSourceId(cloneOfSource.id);
    hotTarget.appendChild(cloneOfSource);
    source.classList.add('assigned')

    removeErroneousness(hotTarget);
}

function moveSourceToThePile(source) {
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
    var targets = getTargets();
    for (var i = 0; i < targets.length; i++) {
        if (targets[i] == hotTarget) {
            addHotness(targets[i]);
        } else  {
            removeHotness(targets[i]);
        }
    }
}

function advanceHotTarget() {
    // Remove hotness from the current hot target.
    var hotTarget = getTheHotTarget();
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

    for (var i = targetIds.indexOf(target.id) + 1; i != targetIds.length; i++) {
        var nextTarget = document.getElementById(targetIds[i]);
        if (nextTarget.firstChild == null) {
            return nextTarget;
        } else if (nextTarget.classList.contains('erroneous')) {
            return nextTarget;
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

function getThePile() {
    return document.getElementById('the-pile');
}

function getTargets() {
    return document.getElementsByClassName('target');
}

function getTheHotTarget() {
    return document.getElementsByClassName('hot')[0];
}

function getSources() {
    return document.getElementsByClassName('source');
}

// Initialization

window.onload = function() {
    registerTouchHandlers();
    shuffleThePile();
}

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

function shuffleThePile() {
    var thePile = getThePile();
    for (var i = thePile.children.length; i > 0; i--) {
        thePile.appendChild(thePile.children[Math.random() * i | 0]);
    }
}
