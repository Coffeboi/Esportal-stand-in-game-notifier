// Schedule the initial check when the extension is installed or the browser starts
chrome.runtime.onInstalled.addListener(checkGameAvailability);
chrome.runtime.onStartup.addListener(checkGameAvailability);

// Schedule periodic checks every 10 seconds
setInterval(checkGameAvailability, 10000);

// Perform the game availability check
function checkGameAvailability() {
  const apiUrl = "https://esportal.com/api/live_games/list?_=1686514952413&region_id=0&quickjoin=true";

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        const availableGames = data.filter((game) => game && game.id);
        if (availableGames.length > 0) {
          const game = availableGames[0];
          showNotification(`Game Available: ${game.id}`, game.id);
        } else {
          clearNotification();
        }
      } else {
        clearNotification();
      }
    })
    .catch((error) => {
      console.error("Error checking game availability:", error);
      clearNotification();
    });
}

// Display a pop-up notification
function showNotification(message, gameId) {
  const gameLink = `https://esportal.com/en/match/${gameId}`;
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Stand-In Game Notifier",
    message: message,
    buttons: [{ title: "Go to Game" }],
  }, function(notificationId) {
    chrome.notifications.onButtonClicked.addListener(function(clickedNotificationId, buttonIndex) {
      if (clickedNotificationId === notificationId && buttonIndex === 0) {
        chrome.tabs.create({ url: gameLink });
      }
    });
  });
}

// Clear any existing notifications
function clearNotification() {
  chrome.notifications.clear();
}
