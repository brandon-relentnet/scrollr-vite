(function () {
  if (document.getElementById("scrollr-ticker-iframe")) {
    return; // Avoid injecting multiple times
  }
  console.log("injectIframe.js is running");

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("content.html");
  iframe.style.position = "fixed";
  iframe.style.bottom = "0";
  iframe.style.left = "0";
  iframe.style.width = "100%";
  iframe.style.height = "0"; // Start with height 0
  iframe.style.zIndex = "9999";
  iframe.style.border = "none";
  iframe.id = "scrollr-ticker-iframe";
  iframe.style.pointerEvents = "none"; // Allow clicks to pass through initially
  iframe.style.overflow = "hidden"; // Ensure no overflow
  iframe.scrolling = "no"; // Remove scrollbars
  document.body.appendChild(iframe);

  window.addEventListener("message", (event) => {
    if (event.source !== iframe.contentWindow) {
      return; // Ignore messages not from the iframe
    }
    console.log("Parent received message:", event.data);
    if (event.data.type === "iframeHeight") {
      const height = event.data.height;
      console.log("Setting iframe height to:", height);
      iframe.style.height = `${height}px`;
      iframe.style.pointerEvents = "auto"; // Enable pointer events within the iframe area

      // Adjust the body's bottom padding to prevent content from being covered
      document.body.style.paddingBottom = `${height}px`;
    }
  });
})();
