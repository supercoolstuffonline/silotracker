const hashedPassword = "c8f255311d7d6c4cc67bdc29e2ea70c9cfd6bab1185e82e57f7d9c6773dfce8c";

const encryptedViews = {
  all: "U2FsdGVkX18TBFWBfjEUlpIe/u6NL4WCc1GtzeVNhcARJxcxXO9aasEWQ72uuZ6zBPvTgRdamdYBE4UIWZukAVchvVE/Zox2HaUNc7mxfyhlvwu5hljWpS+KUgFxu5Cwpbd4LPZ+BlQF1mBkpMezMBkWmnsNspce9QuJ5nM5b+/a/TKx+WyREktHujm9bSab"
};

const labelMapping = {
  green: "WILGOYNE",
  red: "BARLEY",
  blue: "OATS",
  white: "EMPTY"
};

let views = {};
let selectedSquare = null;

const passwordPrompt = document.getElementById("password-prompt");
const mainContent = document.getElementById("main-content");
const passwordInput = document.getElementById("password-input");
const passwordSubmit = document.getElementById("password-submit");
const gridContainer = document.getElementById("grid-container");
const infoBox = document.getElementById("info-box");

function hashPassword(password) {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
}

function decryptData(encryptedData, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) throw new Error("Decryption failed: Resulting string is empty.");
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Error decrypting data:", error);
    return Array(16).fill("white");
  }
}

passwordSubmit.onclick = () => {
  const enteredPassword = passwordInput.value;
  if (hashPassword(enteredPassword) === hashedPassword) {
    passwordPrompt.style.display = "none";
    mainContent.style.display = "flex";
    views["all"] = decryptData(encryptedViews.all, enteredPassword);
    renderGrid();
  } else {
    alert("Incorrect password. Please try again.");
  }
};

function renderGrid() {
  gridContainer.innerHTML = "";

  // Create vertical "North" grid
  renderVerticalGrid(views["all"].slice(0, 6), "N");

  // Create horizontal grids
  const horizontalContainer = document.createElement("div");
  horizontalContainer.className = "row";

  renderHorizontalGrid(views["all"].slice(6, 22), "E", horizontalContainer);
  renderHorizontalGrid(views["all"].slice(22, 38), "C", horizontalContainer);
  renderHorizontalGrid(views["all"].slice(38), "W", horizontalContainer);

  gridContainer.appendChild(horizontalContainer);
}

function renderVerticalGrid(colors, prefix) {
  const grid = document.createElement("div");
  grid.className = "grid vertical";

  colors.forEach((color, index) => {
    const square = document.createElement("div");
    square.className = `square active ${["green", "blue"].includes(color) ? "dark" : ""}`;
    square.style.backgroundColor = color;
    square.dataset.index = index;
    square.innerText = `${prefix}${index + 1}`;
    square.onclick = () => selectSquare(index, color);
    grid.appendChild(square);
  });

  gridContainer.appendChild(grid);
}

function renderHorizontalGrid(colors, prefix, container) {
  const grid = document.createElement("div");
  grid.className = "grid";

  colors.forEach((color, index) => {
    const square = document.createElement("div");
    square.className = `square active ${["green", "blue"].includes(color) ? "dark" : ""}`;
    square.style.backgroundColor = color;
    square.dataset.index = index;
    square.innerText = `${prefix}${index + 1}`;
    square.onclick = () => selectSquare(index, color);
    grid.appendChild(square);
  });

  container.appendChild(grid);
}

function selectSquare(index, color) {
  selectedSquare = { index, color };
  infoBox.innerHTML = `<p>Square: ${index + 1}</p>
                       <p>Label: ${labelMapping[color]}</p>`;
}

document.getElementById("submit-button").onclick = () => {
  if (!selectedSquare) {
    infoBox.innerHTML = "<p>Please select a square first.</p>";
    return;
  }
  const { index, color } = selectedSquare;
  const selectedColor = document.getElementById("color-picker").value;
  const oldLabel = labelMapping[color];
  const newLabel = labelMapping[selectedColor];

  views["all"][index] = selectedColor;
  renderGrid();
  infoBox.innerHTML = `<p>Square: ${index + 1}</p>
                       <p>Label changed from: ${oldLabel} to: ${newLabel}</p>`;
};
