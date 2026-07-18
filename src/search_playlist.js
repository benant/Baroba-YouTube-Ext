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

  // A/B: 구형 polymer 팝업 + 신규 contextual sheet 둘 다 지원
  const DOM_VARIANTS = [
    {
      name: 'addToPlaylist',
      sheetSelector: 'ytd-add-to-playlist-renderer[dialog]',
      itemSelector: 'ytd-playlist-add-to-option-renderer',
      listSelector: '#playlists',
      titleSelectors: [
        'yt-formatted-string#label',
      ],
      colorTitleSelector: '#header ytd-menu-title-renderer',
      isMatch: ($sheet) =>
        $sheet.find('#header').length > 0 &&
        $sheet.find('ytd-playlist-add-to-option-renderer').length > 0,
      getMountTarget: ($sheet) => $sheet.find('#header').first(),
      insertSearch: ($mount, html) => $mount.after(html),
    },
    {
      name: 'contextualSheet',
      sheetSelector: 'yt-contextual-sheet-layout',
      itemSelector: 'toggleable-list-item-view-model',
      listSelector: 'yt-list-view-model',
      titleSelectors: [
        '.ytListItemViewModelTitle',
        '.yt-list-item-view-model__title',
      ],
      colorTitleSelector: '.ytPanelHeaderViewModelTitle',
      isMatch: ($sheet) =>
        $sheet.find('.ytPanelHeaderViewModelTrailingButtons').length > 0 &&
        $sheet.find('toggleable-list-item-view-model').length > 0,
      getMountTarget: ($sheet) =>
        $sheet.find('.ytPanelHeaderViewModelTrailingButtons').first(),
      insertSearch: ($mount, html) => $mount.append(html),
    },
  ];

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

  const getSaveLocationSheet = () => {
    for (const variant of DOM_VARIANTS) {
      const $sheet = $(`${variant.sheetSelector}:visible`)
        .filter(function () {
          return variant.isMatch($(this));
        })
        .first();

      if ($sheet.length > 0) {
        return { $sheet, variant };
      }
    }
    return null;
  };

  const getPlaylistTitle = ($item, variant) => {
    for (const selector of variant.titleSelectors) {
      const $el = $item.find(selector).first();
      if (!$el.length) continue;

      const titleAttr = $.trim($el.attr('title') || '');
      if (titleAttr) return titleAttr;

      const text = $.trim($el.text());
      if (text) return text;

      const ariaLabel = $el.attr('aria-label') || '';
      if (ariaLabel) return $.trim(ariaLabel.split(',')[0]);
    }

    // contextual sheet 폴백: list-item aria-label
    const ariaLabel =
      $item.find('yt-list-item-view-model').attr('aria-label') ||
      $item.attr('aria-label') ||
      '';
    return $.trim(ariaLabel.split(',')[0]);
  };

  const syncSearchColors = ($sheet, $searchBox, variant) => {
    const $title = $sheet.find(variant.colorTitleSelector).first();
    if (!$title.length) return;

    const color = $title.css('color');
    if (color) {
      $searchBox.find('label, input').css({ color, caretColor: color });
    }
  };

  const sortPlaylists = ($sheet, variant) => {
    const $list = $sheet.find(variant.listSelector).first();
    if (!$list.length || $list.attr('data-baroba-sorted') === '1') return;

    const $items = $list.children(variant.itemSelector).detach();
    const sorted = $items.get().sort((a, b) =>
      getPlaylistTitle($(a), variant).localeCompare(
        getPlaylistTitle($(b), variant),
        undefined,
        { sensitivity: 'base' }
      )
    );

    $list.append(sorted);
    $list.attr('data-baroba-sorted', '1');
  };

  const filterPlaylists = ($sheet, variant, searchKey) => {
    const $items = $sheet.find(variant.itemSelector);
    $items.show();

    if (!searchKey) return;

    const escaped = searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    $items.each(function () {
      const title = getPlaylistTitle($(this), variant);
      if (!regex.test(title)) {
        $(this).hide();
      }
    });
  };

  const attachSearchHandlers = ($sheet, variant, $input) => {
    $input
      .off('input.barobaSearch keyup.barobaSearch')
      .on('input.barobaSearch keyup.barobaSearch', function () {
        filterPlaylists($sheet, variant, $.trim($(this).val()));
      });
  };

  const resetVisibleItems = () => {
    DOM_VARIANTS.forEach((variant) => {
      $(`${variant.sheetSelector}:visible ${variant.itemSelector}`).show();
    });
  };

  const checkAndAddSearch = () => {
    if (!isExtensionContextValid()) return;

    if (!playlistSearchEnabled) {
      scheduleNextCheck();
      return;
    }

    const matched = getSaveLocationSheet();

    if (matched) {
      const { $sheet, variant } = matched;
      const $mount = variant.getMountTarget($sheet);

      if ($mount.length > 0) {
        sortPlaylists($sheet, variant);

        const $searchBox = $sheet.find(`#${SEARCH_BOX_ID}`);
        if ($searchBox.length < 1) {
          variant.insertSearch($mount, searchHTML);

          const $newSearchBox = $sheet.find(`#${SEARCH_BOX_ID}`);
          const $input = $newSearchBox.find(`#${SEARCH_INPUT_ID}`);
          syncSearchColors($sheet, $newSearchBox, variant);
          attachSearchHandlers($sheet, variant, $input);

          $newSearchBox.on('click', function (e) {
            e.stopPropagation();
          });

          $input.focus();
        } else {
          syncSearchColors($sheet, $searchBox, variant);
        }
      }
    } else {
      resetVisibleItems();
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
