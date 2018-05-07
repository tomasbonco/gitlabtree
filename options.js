var sidebarcontainer = document.querySelector("#sidebartoggle");

// Store the currently selected settings using browser.storage.local.
function storeSettings() {
  var sidebarenabled = { value: sidebarcontainer.checked };
  browser.storage.local.set({
      'gitlabtree_sidebarstorevalue': sidebarenabled.value
  });
}

// Update the options UI with the settings values retrieved from storage,
// or the default settings if the stored settings are empty.
function updateUI(restoredSettings) {
  sidebarcontainer.checked = restoredSettings.gitlabtree_sidebarstorevalue;
}

function onError(e) {
  console.error(e);
}

// On opening the options page, fetch stored settings and update the UI with them.
browser.storage.local.get('gitlabtree_sidebarstorevalue').then(updateUI, onError)

// Whenever the contents of the textarea changes, save the new values
sidebarcontainer.addEventListener("change", storeSettings);
