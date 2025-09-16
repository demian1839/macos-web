<script>
  import { onMount, tick } from 'svelte';

  // --- 1. Game State ---
  let day = 1;
  let money = 100;
  let lemons = 0;
  let sugar = 0;
  let cups = 0;

  // Prices and costs
  const LEMON_COST = 0.5;
  const SUGAR_COST = 0.2;
  const CUP_COST = 0.1;

  let lemonadePrice = 1.0;
  let advertisingLevel = 0;
  let customersToday = 0;
  let salesToday = 0;

  let message = "Willkommen bei deinem Limonadenstand!";

  // --- 2. User Actions ---
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

  // --- 3. The Game Loop (selling a day) ---
  function nextDay() {
    day++;
    customersToday = 0;
    salesToday = 0;

    const baseCustomers = 10;
    const adBonus = advertisingLevel * 5;
    const priceEffect = 1.5 - lemonadePrice; // Simple price-elasticity model

    customersToday = Math.floor(baseCustomers + adBonus + (priceEffect * 10));

    if (customersToday < 0) customersToday = 0; // Prevent negative customers

    const maxSales = Math.min(customersToday, lemons, sugar, cups);

    if (maxSales > 0) {
      salesToday = maxSales;
      money += salesToday * lemonadePrice;
      lemons -= salesToday;
      sugar -= salesToday;
      cups -= salesToday;
    }

    message = `Tag ${day} ist vorbei. Du hast ${salesToday} Limonaden verkauft und $${(salesToday * lemonadePrice).toFixed(2)} verdient.`;

    // Check for game over
    if (money < 0 && (lemons + sugar + cups) === 0) {
      message = `Spiel vorbei! Du bist pleite. Du hast ${day} Tage überlebt.`;
    }
  }

  // --- 4. Game Initialization ---
  onMount(async () => {
    // This is where you could load saved game state, if you had one.
    // For now, we'll just start with the initial state defined above.
    await tick(); // Wait for the component to be rendered
    message = "Willkommen bei deinem Limonadenstand!";
  });

</script>

<main>
  <h1>Limonadenstand Tycoon</h1>

  <section class="info">
    <h2>Tag {day}</h2>
    <p>Geld: <strong>${money.toFixed(2)}</strong></p>
    <p>Limonadenpreis: <strong>${lemonadePrice.toFixed(2)}</strong></p>
    <p>Werbelevel: <strong>{advertisingLevel}</strong></p>
  </section>

  <section class="inventory">
    <h2>Inventar</h2>
    <p>Zitronen: {lemons}</p>
    <p>Zucker: {sugar}</p>
    <p>Becher: {cups}</p>
  </section>

  <p class="message">{message}</p>

  <section class="actions">
    <div class="action-group">
      <h3>Einkaufen</h3>
      <button on:click={() => buyLemons(10)}>10 Zitronen (${(10 * LEMON_COST).toFixed(2)})</button>
      <button on:click={() => buySugar(10)}>10 Zucker (${(10 * SUGAR_COST).toFixed(2)})</button>
      <button on:click={() => buyCups(10)}>10 Becher (${(10 * CUP_COST).toFixed(2)})</button>
    </div>

    <div class="action-group">
      <h3>Verkauf</h3>
      <button on:click={() => changePrice(0.1)} disabled={lemonadePrice >= 5.0}>Preis erhöhen (+0.10)</button>
      <button on:click={() => changePrice(-0.1)} disabled={lemonadePrice <= 0.1}>Preis senken (-0.10)</button>
      <button on:click={hireAdvertiser}>Werben (${(50 * (advertisingLevel + 1)).toFixed(2)})</button>
    </div>

    <div class="action-group">
      <h3>Tag beenden</h3>
      <button on:click={nextDay}>Nächster Tag</button>
    </div>
  </section>
</main>

<style>
  main {
    font-family: sans-serif;
    max-width: 600px;
    margin: 2em auto;
    padding: 2em;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f0f8ff;
    display: flex;
    flex-direction: column;
    gap: 1.5em;
  }

  h1 {
    text-align: center;
    color: #4CAF50;
  }

  section {
    padding: 1em;
    border: 1px solid #eee;
    border-radius: 6px;
    background-color: #fff;
  }

  .message {
    text-align: center;
    font-weight: bold;
    color: #333;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 1em;
  }

  .action-group {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    flex: 1;
    min-width: 150px;
  }

  button {
    padding: 0.7em 1em;
    border: none;
    border-radius: 4px;
    background-color: #007BFF;
    color: white;
    cursor: pointer;
    font-size: 0.9em;
  }

  button:hover {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
</style>
