$(function() {
  // jQuery 코드 사용 가능
  // alert($("h1").text());

  // 팝업 레이어 HTML 구조 생성
  const searchHTML = `<div id="box-search-playlist"><label>검색:</lavel><input type="text" naem="search_playlist" id="search_playlist" placeholder="검색어를 입력해주세요" autocomplete="off" class="ytSearchboxComponentInput yt-searchbox-input title" style=" margin-left: 1rem; width: 15rem;border: 1px solid gray;border-radius: 1rem;padding: 5px 1rem;"></div>`;
  // let i = 0;
  const checkAndAddSearch = () => {
    // console.log(i++);
    const targetElement = $('ytd-add-to-playlist-renderer:visible').find('#header ytd-menu-title-renderer:visible');
    if(targetElement.length > 0 ) {
      const searchBox = targetElement.find('#box-search-playlist');
      if (searchBox.length < 1) {
        targetElement.append(searchHTML);
        $('ytd-add-to-playlist-renderer').find('#search_playlist').on('keyup', function() {
          // console.log($(this).val());
          const search_key = $.trim($(this).val());
          $('ytd-add-to-playlist-renderer ytd-playlist-add-to-option-renderer').show();
          if (search_key) {
            const regex = new RegExp(search_key, 'i');
            $('ytd-add-to-playlist-renderer').find('ytd-playlist-add-to-option-renderer').each(function() {
              const playlist_title = $.trim($(this).find('yt-formatted-string#label').text());
              if (!playlist_title.match(regex)) {
                $(this).hide();
              }
            });
          }
        });
        // console.log('재생목록에 추가 에 검색 추가 완료');
      }
    }
    setTimeout(checkAndAddSearch, 500);
  };
  checkAndAddSearch();

});