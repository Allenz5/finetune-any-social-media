const onFeed = location.pathname.startsWith('/feed');
console.log('[finetune] linkedin content script loaded', {
  url: location.href,
  onFeed,
});
