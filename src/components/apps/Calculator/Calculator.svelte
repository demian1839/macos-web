<script>
  // Die Funktion, die aufgerufen wird, wenn der "Zurück"-Button geklickt wird.
  function goBack() {
    // Verwendet die history.back()-Methode, um zur vorherigen Seite zu navigieren.
    history.back();
  }
</script>

<svelte:head>
  <title>PuriBrowse</title>
</svelte:head>

<main>
  <div class="iframe-container">
    <div class="button-container">
      <button on:click={goBack}>Zurück</button>
    </div>
    <iframe src="https://www.google.com/?igu=1" title="WebUntis" frameborder="0"></iframe>
  </div>
</main>

<style>
  :root {
    --primary-color: #4A90E2;
    --background-color: #f0f4f8;
    --card-background: #ffffff;
    --text-color: #333;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--background-color);
    margin: 0;
    padding: 2em;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }

  .iframe-container {
    background: var(--card-background);
    padding: 2em;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    max-width: 100%;
    width: 900px;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .button-container {
    width: 100%;
    text-align: left; /* Richtet den Button links aus */
    margin-bottom: 1em; /* Fügt Abstand unter dem Button hinzu */
  }

  button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #357ABD; /* Ein etwas dunklerer Farbton beim Hover */
  }

  h2 {
    color: var(--primary-color);
    margin-top: 0;
  }

  p {
    color: var(--text-color);
  }

  iframe {
    width: 100%;
    height: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-top: 1em;
  }
</style>
