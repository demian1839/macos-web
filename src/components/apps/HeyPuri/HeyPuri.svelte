<script>
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // --- 1. Game State ---
  let day = 1;
  let money = 100;
  let lemons = 0;
  let sugar = 0;
  let cups = 0;

  // Preise und Kosten
  const LEMON_COST = 0.5;
  const SUGAR_COST = 0.2;
  const CUP_COST = 0.1;

  let lemonadePrice = 1.0;
  let advertisingLevel = 0;
  let salesToday = 0;

  let message = "Willkommen bei deinem Limonadenstand!";

  // --- 2. Animierte Svelte Stores ---
  const animatedMoney = tweened(money, { duration: 500, easing: cubicOut });
  const animatedSales = tweened(0, { duration: 500, easing: cubicOut });
  const animatedLemons = tweened(lemons, { duration: 500, easing: cubicOut });
  const animatedSugar = tweened(sugar, { duration: 500, easing: cubicOut });
  const animatedCups = tweened(cups, { duration: 500, easing: cubicOut });

  $: animatedMoney.set(money);
  $: animatedSales.set(salesToday);
  $: animatedLemons.set(lemons);
  $: animatedSugar.set(sugar);
  $: animatedCups.set(cups);

  // --- 3. Benutzeraktionen ---
  function buyLemons(amount) {
    const cost = amount * LEMON_COST;
    if (money >= cost) {
      money -= cost;
      lemons += amount;
      message = `Du hast ${amount} Zitronen für $${cost.toFixed(2)} gekauft.`;
    } else {
      message = "Nicht genug Geld!";
    }
  }

  function buySugar(amount) {
    const cost = amount * SUGAR_COST;
    if (money >= cost) {
      money -= cost;
      sugar += amount;
      message = `Du hast ${amount} Einheiten Zucker für $${cost.toFixed(2)} gekauft.`;
    } else {
      message = "Nicht genug Geld!";
    }
  }

  function buyCups(amount) {
    const cost = amount * CUP_COST;
    if (money >= cost) {
      money -= cost;
      cups += amount;
      message = `Du hast ${amount} Becher für $${cost.toFixed(2)} gekauft.`;
    } else {
      message = "Nicht genug Geld!";
    }
  }

  function hireAdvertiser() {
    const adCost = 50 * (advertisingLevel + 1);
    if (money >= adCost) {
      money -= adCost;
      advertisingLevel++;
      message = `Du hast für $${adCost.toFixed(2)} geworben. Dein Werbelevel ist jetzt ${advertisingLevel}.`;
    } else {
      message = "Nicht genug Geld, um zu werben.";
    }
  }

  function changePrice(change) {
    lemonadePrice += change;
    if (lemonadePrice < 0.1) lemonadePrice = 0.1;
    message = `Der Preis pro Limonade ist jetzt $${lemonadePrice.toFixed(2)}.`;
  }

  // --- 4. Der Spielzyklus ---
  function nextDay() {
    day++;
    salesToday = 0;
    const baseCustomers = 10;
    const adBonus = advertisingLevel * 5;
    const priceEffect = 1.5 - lemonadePrice;
    let customersToday = Math.floor(baseCustomers + adBonus + (priceEffect * 10));

    if (customersToday < 0) customersToday = 0;
    const maxSales = Math.min(customersToday, lemons, sugar, cups);

    if (maxSales > 0) {
      salesToday = maxSales;
      money += salesToday * lemonadePrice;
      lemons -= salesToday;
      sugar -= salesToday;
      cups -= salesToday;
    }

    message = `Tag ${day} ist vorbei. Du hast ${salesToday} Limonaden verkauft und $${(salesToday * lemonadePrice).toFixed(2)} verdient.`;

    if (money < 0 && (lemons + sugar + cups) === 0) {
      message = `Spiel vorbei! Du bist pleite. Du hast ${day} Tage überlebt.`;
    }
  }

  // --- 5. Spiel-Initialisierung ---
  onMount(() => {
    message = "Willkommen bei deinem Limonadenstand!";
  });

  // --- 6. Fortschrittsbalkenlogik ---
  $: totalInventory = 100;
  $: moneyPercentage = (money / 500) * 100;
  $: lemonsPercentage = (lemons / totalInventory) * 100;
  $: sugarPercentage = (sugar / totalInventory) * 100;
  $: cupsPercentage = (cups / totalInventory) * 100;
</script>

<main>
  <h1>🍋 Limonadenstand Tycoon 🍋</h1>
  <p class="message">{message}</p>

  <section class="dashboard">
    <div class="stat-card day-card">
      <h3>Tag</h3>
      <div class="stat-value">{day}</div>
    </div>
    <div class="stat-card">
      <h3>Geld</h3>
      <div class="stat-value">${$animatedMoney.toFixed(2)}</div>
      <div class="progress-bar-container">
        <div class="progress-bar money-bar" style="width: {moneyPercentage > 100 ? 100 : moneyPercentage}%;"></div>
      </div>
    </div>
    <div class="stat-card">
      <h3>Verkäufe</h3>
      <div class="stat-value">{$animatedSales}</div>
    </div>
  </section>

  <section class="inventory-section">
    <h2>Inventar</h2>
    <div class="inventory-grid">
      <div class="inventory-item">
        <span class="icon">🍋</span>
        <div class="item-details">
          <p>Zitronen</p>
          <span class="item-value">{$animatedLemons}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar lemons-bar" style="width: {lemonsPercentage}%;"></div>
        </div>
      </div>
      <div class="inventory-item">
        <span class="icon">🍚</span>
        <div class="item-details">
          <p>Zucker</p>
          <span class="item-value">{$animatedSugar}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar sugar-bar" style="width: {sugarPercentage}%;"></div>
        </div>
      </div>
      <div class="inventory-item">
        <span class="icon">🥤</span>
        <div class="item-details">
          <p>Becher</p>
          <span class="item-value">{$animatedCups}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar cups-bar" style="width: {cupsPercentage}%;"></div>
        </div>
      </div>
    </div>
  </section>

  <section class="actions">
    <div class="action-group">
      <h3>Einkaufen</h3>
      <button on:click={() => buyLemons(10)}>Kauf 10 Zitronen (${(10 * LEMON_COST).toFixed(2)})</button>
      <button on:click={() => buySugar(10)}>Kauf 10 Zucker (${(10 * SUGAR_COST).toFixed(2)})</button>
      <button on:click={() => buyCups(10)}>Kauf 10 Becher (${(10 * CUP_COST).toFixed(2)})</button>
    </div>

    <div class="action-group">
      <h3>Verkauf & Werbung</h3>
      <button on:click={() => changePrice(0.1)} disabled={lemonadePrice >= 5.0}>Preis erhöhen (+0.10)</button>
      <button on:click={() => changePrice(-0.1)} disabled={lemonadePrice <= 0.1}>Preis senken (-0.10)</button>
      <button on:click={hireAdvertiser}>Werben (${(50 * (advertisingLevel + 1)).toFixed(2)})</button>
    </div>
  </section>

  <button class="next-day-button" on:click={nextDay}>Nächster Tag</button>
</main>

<style>
  :root {
    --primary-color: #4CAF50;
    --secondary-color: #FFC107;
    --background-color: #F0F8FF;
    --card-background: #FFFFFF;
    --text-color: #333;
    --transition-speed: 0.3s;
  }

  body {
    background-color: var(--background-color);
  }

  main {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 800px;
    margin: 2em auto;
    padding: 2em;
    border-radius: 12px;
    background-color: var(--card-background);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    
    max-height: 90vh;
    overflow-y: auto;
  }

  h1 {
    text-align: center;
    color: var(--primary-color);
    margin-bottom: 1em;
  }

  .message {
    text-align: center;
    font-weight: bold;
    color: var(--text-color);
    padding: 1em;
    border-radius: 8px;
    background-color: #E8F5E9;
    border: 1px solid #C8E6C9;
    margin-bottom: 2em;
  }

  section {
    margin-bottom: 2em;
  }

  .dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5em;
    margin-bottom: 2em;
  }

  .stat-card {
    background: #F9F9F9;
    padding: 1.5em;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    transition: transform var(--transition-speed) ease;
  }

  .stat-card:hover {
    transform: translateY(-5px);
  }

  .stat-card h3 {
    margin: 0 0 0.5em 0;
    color: #555;
  }

  .stat-value {
    font-size: 2em;
    font-weight: bold;
    color: var(--primary-color);
  }

  .progress-bar-container {
    width: 100%;
    height: 8px;
    background-color: #eee;
    border-radius: 4px;
    margin-top: 0.5em;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    transition: width var(--transition-speed) ease-in-out;
    border-radius: 4px;
  }

  .money-bar { background-color: #4CAF50; }
  .lemons-bar { background-color: #FFEB3B; }
  .sugar-bar { background-color: #E0E0E0; }
  .cups-bar { background-color: #B2EBF2; }

  .inventory-section {
    text-align: center;
  }

  .inventory-grid {
    display: flex;
    justify-content: center;
    gap: 2em;
  }

  .inventory-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
    min-width: 120px;
  }

  .icon {
    font-size: 2.5em;
  }

  .item-details p {
    margin: 0;
    font-weight: bold;
  }

  .item-value {
    font-size: 1.5em;
    color: #555;
    font-weight: bold;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2em;
  }

  .action-group {
    background: #F9F9F9;
    padding: 1.5em;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  button {
    padding: 1em;
    border: none;
    border-radius: 8px;
    background-color: var(--primary-color);
    color: white;
    cursor: pointer;
    font-size: 1em;
    font-weight: bold;
    transition: background-color var(--transition-speed) ease, transform var(--transition-speed) ease;
  }

  button:hover {
    background-color: #43A047;
    transform: translateY(-2px);
  }

  button:disabled {
    background-color: #BDBDBD;
    cursor: not-allowed;
    transform: none;
  }

  .next-day-button {
    width: 100%;
    background-color: var(--secondary-color);
  }

  .next-day-button:hover {
    background-color: #FFA000;
  }
</style>
