// 저장된 설정 불러와서 설졍 여부 
let playlistSearch = true;
$(function () {
  // 팝업 레이어 HTML 구조 생성
  const searchHTML = `<div id="box-search-playlist" style="color:var(--yt-spec-text-primary);position: absolute;right: 6px;top: 6px;"><label>검색:</lavel><input type="text" naem="search_playlist" id="search_playlist" placeholder="검색어를 입력해주세요" autocomplete="off" class="ytSearchboxComponentInput yt-searchbox-input title" style=" margin-left: 1rem; width: 15rem;border: 1px solid gray;border-radius: 1rem;padding: 5px 1rem;"></div>`;
  // let i = 0;
  const checkAndAddSearch = () => {
    chrome.storage.sync.get(['popupView', 'playlistSearch'], (data) => {
      if(data.playlistSearch == 'N') {
        playlistSearch = false ;  
      } else {
        playlistSearch = true ;  
      }
    });
    if (playlistSearch) {
      // console.log(i++);
      // const targetElement = $('ytd-add-to-playlist-renderer:visible').find('#header ytd-menu-title-renderer:visible');
      const targetElement = $('yt-contextual-sheet-layout:visible').find('.ytContextualSheetLayoutHeaderContainer .ytPanelHeaderViewModelTitleHeader:visible');
      if (targetElement.length > 0) {
        const searchBox = targetElement.find('#box-search-playlist');
        if (searchBox.length < 1) {
          targetElement.append(searchHTML);
          $('yt-contextual-sheet-layout').find('#search_playlist').on('keyup', function () {
            // console.log($(this).val());
            const search_key = $.trim($(this).val());
            $('yt-contextual-sheet-layout toggleable-list-item-view-model').show();
            if (search_key) {
              const regex = new RegExp(search_key, 'i');
              $('yt-contextual-sheet-layout').find('toggleable-list-item-view-model').each(function () {
                const playlist_title = $.trim($(this).find('.yt-list-item-view-model__title').text());
                if (!playlist_title.match(regex)) {
                  $(this).hide();
                }
              });
            }
          });
          // console.log('재생목록에 추가 에 검색 추가 완료');
        }
      } else {
        $('yt-contextual-sheet-layout toggleable-list-item-view-model').show(); // 원래대로 playlist는 모두 보이도록 
      }
      // 검색 박스 노출되면 커서 이동 시키기
      $('yt-contextual-sheet-layout').find('#search_playlist').focus();
      $('yt-contextual-sheet-layout').find('#box-search-playlist').on('click', function(){ return false; })
    }
    setTimeout(checkAndAddSearch, 500);
  };

  checkAndAddSearch();

});