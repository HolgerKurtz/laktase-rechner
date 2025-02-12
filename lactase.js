(function (window) {
  // Load Bootstrap CSS
  loadCSS();
  // URL PREFIX for Translations
  let translation_prefix =
    "https://raw.githubusercontent.com/HolgerKurtz/laktase-rechner/refs/heads/main/";
  // Declare foodItems in a broader scope
  let foodItems = {};

  // Function to get the language from the script's data attribute
  function getScriptLanguage() {
    const script =
      document.currentScript || document.querySelector("script[data-lang]");
    return script ? script.getAttribute("data-lang") : "de"; // Default to 'de' if no attribute is provided
  }

  // Load translations based on the script parameter
  function loadTranslations() {
    const lang = getScriptLanguage();
    const translationsUrl = `${translation_prefix}translations/${lang}.json`;

    return fetch(translationsUrl)
      .then((response) => response.json())
      .catch(() => {
        console.error(`Could not load translations for language: ${lang}`);
        return {}; // Return an empty object if the fetch fails
      });
  }

  // Load food items based on the script parameter
  function loadFoodItems() {
    const lang = getScriptLanguage();
    const foodItemsUrl = `${translation_prefix}translations/groceries/foodItems_${lang}.json`;

    return fetch(foodItemsUrl)
      .then((response) => response.json())
      .catch(() => {
        console.error(`Could not load food items for language: ${lang}`);
        return {}; // Return an empty object if the fetch fails
      });
  }

  loadTranslations().then((translations) => {
    loadFoodItems().then((loadedFoodItems) => {
      foodItems = loadedFoodItems; // Assign the loaded food items to the broader scoped variable
      const widgetHTML = generateWidgetHTML(foodItems, translations);
      const widgetDiv = document.createElement("div");
      widgetDiv.innerHTML = widgetHTML;
      document.getElementById("myWidget").appendChild(widgetDiv);

      // Pass translations to the updateInfo function
      const calculateButton = document.getElementById("calculate");
      calculateButton.addEventListener("click", () => updateInfo(translations));
    });
  });

  // Expose the updateInfo function to the global scope
  window.FoodInfoWidget = { updateInfo };

  function loadCSS() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/gh/HolgerKurtz/laktase-rechner@latest/lactase-widget-main.css";
    document.head.appendChild(link);
  }

  function generateWidgetHTML(foodItems, translations) {
    return `
    <div class="widget-container">
    <div class="widget-row">
      <div class="widget-col">
      <h2 class="widget-header">${translations.widgetHeader}</h2>
      <small class="widget-disclaimer">${translations.widgetDisclaimer}</small>
      <div class="widget-input-group">
        <input class="widget-input" list="food-items" id="food-item" placeholder="Cappuccino, Croissant …"/>
        <datalist id="food-items">
          ${Object.keys(foodItems)
            .map((item) => `<option value="${item}">${item}</option>`)
            .join("")}
        </datalist>
      </div>
      <button id="calculate" class="widget-btn-primary" onclick="window.FoodInfoWidget.updateInfo()">${
        translations.calculateButton
      }</button>
      <div id="info"></div>
      </div>
    </div>
    `;
  }

  function updateInfo(translations) {
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
      infoElement.textContent =
        translations.foodItemNotFound || "Food item not found.";
      return;
    }

    const { portionSize, lactoseContent } = foodItems[foodItem];
    const [fccUnits, pillsNeeded] = calculateLactase(lactoseContent);

    infoElement.innerHTML = `
    <div class="widget-card">
    <div class="widget-card-body">
      <h5 class="widget-card-title">${translations.resultsTitle}</h5>
      <p class="widget-card-text">
      <ul class="widget-list-group">
      <li class="widget-list-group-item">${translations.portionSizeLabel} (${foodItem}): <span class="widget-badge widget-badge-primary"><b>${portionSize}</b></span><br> </li>
      <li class="widget-list-group-item">${translations.lactasePerPortionLabel}: <span class="widget-badge widget-badge-danger"><b>${lactoseContent}</b></span><br></li>
      <li class="widget-list-group-item">${translations.fccUnitsLabel}: <span class="widget-badge widget-badge-secondary"><b>${fccUnits}</b></span><br></li>
      <li class="widget-list-group-item">${translations.pillsNeededLabel}: <span class="widget-badge widget-badge-success"><b>${pillsNeeded}</b></span></li>
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
