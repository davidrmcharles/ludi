function allowDrop(e) {
    e.preventDefault();
}

function drag(e) {
    e.dataTransfer.setData("text", e.target.id);
    clearDropTargetIncorrectness(e.target.parentNode);
}

function drop(e) {
    e.preventDefault();

    var target = e.target;
    if (e.target.localName != "td") {
        target = target.parentNode;
    }

    if (target.hasChildNodes()) {
        var pile = document.getElementById("the-pile");
        pile.appendChild(target.firstChild);
    }

    var data = e.dataTransfer.getData("text");
    target.appendChild(document.getElementById(data));
    clearDropTargetIncorrectness(target);
}

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

function shufflePile() {
    var pile = document.getElementById("the-pile");
    for (var i = pile.children.length; i > 0; i--) {
        pile.appendChild(pile.children[Math.random() * i | 0]);
    }
}

window.onload = shufflePile
