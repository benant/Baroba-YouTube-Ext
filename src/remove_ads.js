// 저장된 설정 불러와서 설졍 여부 
let removeAds = true;
$(function () {
  const remove_ads = () => {
    chrome.storage.sync.get(['popupView', 'playlistSearch', 'removeAds'], (data) => {
      if(data.removeAds == 'N') {
        removeAds = false ;  
      } else {
        removeAds = true ;  
      }
    });
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