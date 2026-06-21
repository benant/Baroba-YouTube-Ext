// 저장된 설정 불러와서 설졍 여부 
let removeAds = true;
$(function () {
  const isExtensionContextValid = () => {
    try {
      return Boolean(chrome.runtime && chrome.runtime.id);
    } catch (error) {
      return false;
    }
  };

  const remove_ads = () => {
    if (!isExtensionContextValid()) return;

    try {
      chrome.storage.sync.get(['popupView', 'playlistSearch', 'removeAds'], (data) => {
        if (!isExtensionContextValid() || chrome.runtime.lastError) return;
        if (data.removeAds == 'N') {
          removeAds = false;
        } else {
          removeAds = true;
        }
      });
    } catch (error) {
      return;
    }

    if (removeAds) {
      $('ytd-ad-slot-renderer').closest('ytd-rich-item-renderer').remove();
      $('#player-ads').remove();
      $('.ytp-pause-overlay-container').remove();
      $('ytd-ad-slot-renderer').remove();
      $('ytd-ads-engagement-panel-content-renderer').closest('ytd-engagement-panel-section-list-renderer').remove();
    }
    setTimeout(remove_ads, 500);
  };

  remove_ads();

});