chrome.runtime.onInstalled.addListener(() => {
  console.log('[finetune] extension installed');
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
