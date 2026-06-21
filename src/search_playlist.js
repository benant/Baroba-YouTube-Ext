// 저장된 설정 불러와서 설정 여부
let playlistSearchEnabled = true;

$(function () {
  const SEARCH_BOX_ID = 'box-search-playlist';
  const SEARCH_INPUT_ID = 'search_playlist';

  const searchHTML = `
    <div id="${SEARCH_BOX_ID}" class="baroba-playlist-search">
      <label for="${SEARCH_INPUT_ID}">검색:</label>
      <input
        type="text"
        name="search_playlist"
        id="${SEARCH_INPUT_ID}"
        placeholder="검색어를 입력해주세요"
        autocomplete="off"
        class="baroba-playlist-search-input"
      >
    </div>
  `;

  const isExtensionContextValid = () => {
    try {
      return Boolean(chrome.runtime && chrome.runtime.id);
    } catch (error) {
      return false;
    }
  };

  const loadPlaylistSearchSetting = () => {
    if (!isExtensionContextValid()) return;

    try {
      chrome.storage.sync.get(['playlistSearch'], (data) => {
        if (!isExtensionContextValid() || chrome.runtime.lastError) return;
        playlistSearchEnabled = data.playlistSearch !== 'N';
      });
    } catch (error) {
      // Extension context invalidated
    }
  };

  const scheduleNextCheck = () => {
    if (!isExtensionContextValid()) return;
    setTimeout(checkAndAddSearch, 500);
  };

  const getSaveLocationSheet = () =>
    $('yt-contextual-sheet-layout:visible').filter(function () {
      const $sheet = $(this);
      return (
        $sheet.find('.ytPanelHeaderViewModelTrailingButtons').length > 0 &&
        $sheet.find('toggleable-list-item-view-model').length > 0
      );
    }).first();

  const getPlaylistTitle = ($item) => {
    const titleFromDom = $.trim($item.find('.ytListItemViewModelTitle').first().text());
    if (titleFromDom) return titleFromDom;

    const legacyTitle = $.trim($item.find('.yt-list-item-view-model__title').first().text());
    if (legacyTitle) return legacyTitle;

    const ariaLabel = $item.find('yt-list-item-view-model').attr('aria-label') || '';
    return $.trim(ariaLabel.split(',')[0]);
  };

  const syncSearchColors = ($sheet, $searchBox) => {
    const $title = $sheet.find('.ytPanelHeaderViewModelTitle').first();
    if (!$title.length) return;

    const color = $title.css('color');
    if (color) {
      $searchBox.find('label, input').css({ color, caretColor: color });
    }
  };

  const sortPlaylists = ($sheet) => {
    const $list = $sheet.find('yt-list-view-model').first();
    if (!$list.length || $list.attr('data-baroba-sorted') === '1') return;

    const $items = $list.children('toggleable-list-item-view-model').detach();
    const sorted = $items.get().sort((a, b) =>
      getPlaylistTitle($(a)).localeCompare(getPlaylistTitle($(b)), undefined, { sensitivity: 'base' })
    );

    $list.append(sorted);
    $list.attr('data-baroba-sorted', '1');
  };

  const filterPlaylists = ($sheet, searchKey) => {
    const $items = $sheet.find('toggleable-list-item-view-model');
    $items.show();

    if (!searchKey) return;

    const escaped = searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    $items.each(function () {
      const title = getPlaylistTitle($(this));
      if (!regex.test(title)) {
        $(this).hide();
      }
    });
  };

  const attachSearchHandlers = ($sheet, $input) => {
    $input
      .off('input.barobaSearch keyup.barobaSearch')
      .on('input.barobaSearch keyup.barobaSearch', function () {
        filterPlaylists($sheet, $.trim($(this).val()));
      });
  };

  const checkAndAddSearch = () => {
    if (!isExtensionContextValid()) return;

    if (!playlistSearchEnabled) {
      scheduleNextCheck();
      return;
    }

    const $sheet = getSaveLocationSheet();
    const $trailingButtons = $sheet.find('.ytPanelHeaderViewModelTrailingButtons').first();

    if ($trailingButtons.length > 0) {
      sortPlaylists($sheet);

      const $searchBox = $trailingButtons.find(`#${SEARCH_BOX_ID}`);
      if ($searchBox.length < 1) {
        $trailingButtons.append(searchHTML);

        const $newSearchBox = $trailingButtons.find(`#${SEARCH_BOX_ID}`);
        const $input = $newSearchBox.find(`#${SEARCH_INPUT_ID}`);
        syncSearchColors($sheet, $newSearchBox);
        attachSearchHandlers($sheet, $input);

        $newSearchBox.on('click', function (e) {
          e.stopPropagation();
        });

        $input.focus();
      } else {
        syncSearchColors($sheet, $searchBox);
      }
    } else {
      $('yt-contextual-sheet-layout:visible toggleable-list-item-view-model').show();
    }

    scheduleNextCheck();
  };

  loadPlaylistSearchSetting();

  if (isExtensionContextValid()) {
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (!isExtensionContextValid()) return;
        if (area === 'sync' && changes.playlistSearch) {
          playlistSearchEnabled = changes.playlistSearch.newValue !== 'N';
        }
      });
    } catch (error) {
      // Extension context invalidated
    }
  }

  checkAndAddSearch();
});
