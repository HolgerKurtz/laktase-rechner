(function (window) {
  // Load Bootstrap CSS
  loadCSS();

  // Food items data
  const foodItems = {
    Croissant: { portionSize: "180 g", lactoseContent: "4,1 g" },
    Milchreis: { portionSize: "200 g", lactoseContent: "5,6 g" },
    Kakao: { portionSize: "200 ml", lactoseContent: "7,6 g" },
    Tiramisu: { portionSize: "200 g", lactoseContent: "22,8 g" },
    "1 Liter Milch": { portionSize: "1000 ml", lactoseContent: "49 g" },
  };

  // Create and append widget to the body
  const widgetDiv = document.createElement("div");
  widgetDiv.innerHTML = generateWidgetHTML();
  document.body.appendChild(widgetDiv);

  // On Button Click
  const calculateButton = document.getElementById("calculate");
  calculateButton.addEventListener("click", updateInfo);

  // Expose the updateInfo function to the global scope
  window.FoodInfoWidget = { updateInfo };

  function loadCSS() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/gh/HolgerKurtz/laktase-rechner@latest/lactase-widget-main.css";
    document.head.appendChild(link);
  }

  function generateWidgetHTML() {
    return `
    <div class="widget-container">
    <div class="widget-row">
      <div class="widget-col">
      <h2 class="widget-header"> Laktase FCC Rechner</h2>
      <small class="widget-disclaimer"> Hinweise zum kostenlosen Laktase-Rechner unter <a href="https://www.lactojoy.com">LactoJoy.com</a></small>
      <div class="widget-input-group">
        <input class="widget-input" list="food-items" id="food-item" placeholder="Cappuccino, Milchreis etc."/>
        <datalist id="food-items">
          ${Object.keys(foodItems)
            .map((item) => `<option value="${item}">${item}</option>`)
            .join("")}
        </datalist>
      </div>
      <button id="calculate" class="widget-btn-primary" onclick="window.FoodInfoWidget.updateInfo()">Calculate</button>
      <div id="info"></div>
      </div>
    </div>
    `;
  }

  function updateInfo() {
    const foodItemElement = document.getElementById("food-item");
    const infoElement = document.getElementById("info");
    const foodItem = foodItemElement.value;
    // If no food item has been entered, don't display any message
    if (!foodItem) {
      infoElement.textContent = "";
      return;
    }

    // If the food item is not found in the list, display "Food item not found."
    if (!foodItems[foodItem]) {
      infoElement.textContent = "Nicht in der Auswahl vorhanden";
      return;
    }

    const { portionSize, lactoseContent } = foodItems[foodItem];
    const [fccUnits, pillsNeeded] = calculateLactase(lactoseContent);

    infoElement.innerHTML = `
    <div class="widget-card">
    <div class="widget-card-body">
      <h5 class="widget-card-title">Ergebnisse:</h5>
      <p class="widget-card-text">
      <ul class="widget-list-group">
      <li class="widget-list-group-item">ø Portionsgröße (${foodItem}): <span class="widget-badge widget-badge-primary"><b>${portionSize}</b></span><br> </li>
      <li class="widget-list-group-item">Laktase pro Portion:  <span class="widget-badge widget-badge-danger"><b>${lactoseContent}</b></span><br></li>
      <li class="widget-list-group-item">Benötigte FCC Anzahl: <span class="widget-badge widget-badge-secondary"><b>${fccUnits}</b></span><br></li>
      <li class="widget-list-group-item">LactoJoy Tabletten (Anzahl): <span class="widget-badge widget-badge-success"><b>${pillsNeeded}</b></span></li>
      </ul>
    </div>
  </div>
    `;
  }

  function calculateLactase(lactoseContent) {
    if (lactoseContent === "-") return ["N/A", "N/A"];

    const lactoseGrams = parseFloat(
      lactoseContent.replace(" g", "").replace(",", ".")
    );
    const fccUnits = lactoseGrams * 750;
    const pillsNeeded = Math.ceil((fccUnits / 14500) * 2) / 2;

    return [fccUnits, pillsNeeded];
  }

  // Call updateInfo to initialize the info
  updateInfo();
})(window);
