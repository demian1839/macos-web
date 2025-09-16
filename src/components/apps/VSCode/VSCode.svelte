<script>
  // Wir verwenden keine reaktiven Variablen oder Animationen, da der Inhalt
  // statisch von der eingebetteten Seite stammt.
</script>

<svelte:head>
  <title>WebUntis in Svelte</title>
</svelte:head>

<main>
  <div class="iframe-container">
    <h2>WebUntis in Svelte</h2>
    <p>
      Dies ist ein Versuch, WebUntis einzubetten. Aufgrund von Sicherheitsbeschränkungen
      (X-Frame-Options) wird dies wahrscheinlich nicht funktionieren.
    </p>
    
    <iframe src="https://webuntis.com/" title="WebUntis" frameborder="0"></iframe>
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
    height: 700px; /* Die Höhe des Containers anpassen */
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
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
