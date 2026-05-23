const deployUrl = "https://deploy.workers.cloudflare.com/?url=https://github.com/ericbae/playdoom-template";
const copyButton = document.querySelector("#copy-repo");

copyButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(deployUrl);
    copyButton.textContent = "Copied";
  } catch {
    copyButton.textContent = "Copy failed";
  }

  window.setTimeout(() => {
    copyButton.textContent = "Copy deploy URL";
  }, 1800);
});
