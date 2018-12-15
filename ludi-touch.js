// Touch handling

function registerTouchHandlers() {
    var targets = document.getElementsByClassName('target');
    for (var i = 0; i < targets.length; i++) {
        targets[i].addEventListener('click', onTargetTouched);
    }

    var sources = document.getElementsByClassName('source');
    for (var i = 0; i < sources.length; i++) {
        sources[i].addEventListener('click', onSourceTouched);
    }
}

function onTargetTouched(event) {
    console.log('Target was touched!  ' + event.target.id);
    setHotTarget(event.target);
}

function setHotTarget(hotTarget) {
    var targets = document.getElementsByClassName('target');
    for (var i = 0; i < targets.length; i++) {
        if (targets[i] == hotTarget) {
            addHotness(targets[i]);
        } else  {
            removeHotness(targets[i]);
        }
    }
}

function onSourceTouched(event) {
    console.log('Source was touched!  ' + event.target.id);
    moveSourceToHotTarget(event.target);
    advanceHotTarget();
}

function moveSourceToHotTarget(source) {
    var hotTarget = document.getElementsByClassName('hot-target')[0];
    if (hotTarget == null) {
        return;
    }
    hotTarget.appendChild(source);
}

function advanceHotTarget() {
    var hotTarget = document.getElementsByClassName('hot-target')[0];
    if (hotTarget == null) {
        return;
    }
    removeHotness(hotTarget);

    var targetSequence = [
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
    ]

    var nextIndex = targetSequence.indexOf(hotTarget.id) + 1;
    if (nextIndex == targetSequence.length) {
        ;
    } else {
        var nextHotTarget = document.getElementById(targetSequence[nextIndex]);
        addHotness(nextHotTarget);
    }
}

function addHotness(target) {
    target.classList.add('hot-target');
}

function removeHotness(target) {
    target.classList.remove('hot-target');
}

// Checking answers

function checkAnswers() {
    var correctness = [];
    var dropTargets = document.getElementsByClassName("drop-target");
    for (var i = 0; i < dropTargets.length; i++) {
        correctness.push(checkAnswer(dropTargets[i]));
    }

    if (correctness.every(function(e) { return !!e; })) {
        var button = document.getElementById("check-answers-button");
        var youWin = document.getElementById("you-win");
        button.style.display = "none";
        youWin.style.display = "inline";

    }
}

function checkAnswer(dropTarget) {
    if (dropTarget.firstChild == null) {
        setDropTargetIncorrectness(dropTarget);
        return false;
    }

    var answers = {
        "nominative-singular": "ending-a",
        "genitive-singular": "ending-ae",
        "dative-singular": "ending-ae",
        "accusative-singular": "ending-am",
        "ablative-singular": "ending-a",
        "nominative-plural": "ending-ae",
        "genitive-plural": "ending-arum",
        "dative-plural": "ending-is",
        "accusative-plural": "ending-as",
        "ablative-plural": "ending-is",
    };

    var answer = answers[dropTarget.id];
    var draggableId = dropTarget.firstChild.id.split(".")[0];
    if (draggableId == answer) {
        return true;
    } else {
        setDropTargetIncorrectness(dropTarget);
        return false;
    }
}

function setDropTargetIncorrectness(dropTarget) {
    dropTarget.style.backgroundColor = "salmon";
}

function clearDropTargetIncorrectness(dropTarget) {
    dropTarget.style.backgroundColor = "white";
}

// Shuffling

function shufflePile() {
    var pile = document.getElementById("the-pile");
    for (var i = pile.children.length; i > 0; i--) {
        pile.appendChild(pile.children[Math.random() * i | 0]);
    }
}

function onLoad() {
    registerTouchHandlers();
    shufflePile();
}

window.onload = onLoad
