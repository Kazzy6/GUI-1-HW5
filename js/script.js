let bag = [];
let score = 0;
let placedThisRound = [];
let draggedTile = null;

const board = document.getElementById("board");
const rack = document.getElementById("rack");


const bonusMap = {
    2: "double-word",
    6: "double-letter",
    8: "double-letter",
    12: "double-word"
};

function buildBag() {
    bag = [];
    for (let letter in ScrabbleTiles) {
        for (let i = 0; i < ScrabbleTiles[letter]["number-remaining"]; i++) {
            bag.push({
                letter: letter,
                value: ScrabbleTiles[letter].value
            });
        }
    }
    bag.sort(() => Math.random() - 0.5);
}

/*Board setup */
function buildBoard() {
    board.innerHTML = "";

    for (let i = 0; i < 15; i++) {
        const square = document.createElement("div");
        square.classList.add("square");

        if (bonusMap[i]) {
            square.classList.add(bonusMap[i]);
            const label = document.createElement("span");
            label.textContent =
                bonusMap[i] === "double-word"
                    ? "DOUBLE WORD SCORE"
                    : "DOUBLE LETTER SCORE";
            square.appendChild(label);
        }

        square.dataset.index = i;
        square.ondragover = e => e.preventDefault();
        square.ondrop = dropTile;

        board.appendChild(square);
    }
}

/*where tile is being created */
function createTile(letter, value) {
    const tile = document.createElement("img");
    tile.src = `images/Scrabble_Tiles/Scrabble_Tile_${letter}.jpg`;
    tile.className = "tile";
    tile.draggable = true;
    tile.dataset.letter = letter;
    tile.dataset.value = value;
    tile.ondragstart = dragTile;
    return tile;
}

function refillRack() {
    while (rack.children.length < 7 && bag.length > 0) {
        const t = bag.pop();
        rack.appendChild(createTile(t.letter, t.value));
    }
}

function dragTile(e) {
    draggedTile = this;
    e.dataTransfer.setData("text/plain", "");
}

/*checks if its adjacent*/
function isAdjacent(index) {
    if (placedThisRound.length === 0) return true;

    return placedThisRound.some(p => {
        return Math.abs(parseInt(p.square.dataset.index) - index) === 1;
    });
}


function dropTile(e) {
    e.preventDefault();
    if (!draggedTile) return;
    if (this.querySelector(".tile")) return;

    const index = parseInt(this.dataset.index);
    if (!isAdjacent(index)) return;

    placedThisRound = placedThisRound.filter(
        p => p.tile !== draggedTile
    );

    this.appendChild(draggedTile);
    placedThisRound.push({ tile: draggedTile, square: this });

    updateScore();
    draggedTile = null;
}

rack.ondragover = e => e.preventDefault();

rack.ondrop = e => {
    e.preventDefault();
    if (!draggedTile) return;

    if (draggedTile.parentElement.id === "rack") return;

    placedThisRound = placedThisRound.filter(
        p => p.tile !== draggedTile
    );

    rack.appendChild(draggedTile);
    updateScore();
    draggedTile = null;
};

/*this is where the score update */
function updateScore() {
    let roundScore = 0;
    let wordMultiplier = 1;

    placedThisRound.forEach(p => {
        let value = parseInt(p.tile.dataset.value);

        if (p.square.classList.contains("double-letter")) {
            value *= 2;
        }
        if (p.square.classList.contains("double-word")) {
            wordMultiplier *= 2;
        }

        roundScore += value;
    });

    document.getElementById("score").textContent =
        `Score: ${score + roundScore * wordMultiplier}`;
}


document.getElementById("nextWord").onclick = () => {
    score = parseInt(
        document.getElementById("score").textContent.split(": ")[1]
    );
    placedThisRound = [];
    buildBoard();
    refillRack();
};

document.getElementById("restart").onclick = startGame;

/*this is where the game starts */
function startGame() {
    buildBag();
    rack.innerHTML = "";
    score = 0;
    placedThisRound = [];
    document.getElementById("score").textContent = "Score: 0";
    buildBoard();
    refillRack();
}

startGame();
