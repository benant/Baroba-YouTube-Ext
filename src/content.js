// 팝업 레이어 HTML 구조 생성
const popupHTML = `
  <div id="popup">
    <div id="popupContent">
      <div class="baroba-popup-controls">
        <button id="closePopup" type="button">닫기</button>
      </div>
      <iframe id="videoFrame" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"></iframe>
    </div>
  </div>
`;

// 팝업 레이어가 이미 존재하지 않을 때만 추가
if (!document.getElementById('popup')) {
  document.body.insertAdjacentHTML('beforeend', popupHTML);
}

// 썸네일 호스트(아이콘 부착 위치) 찾기
const getIconHost = (element) => {
  const viewModel = element.closest('yt-thumbnail-view-model') || element.querySelector('yt-thumbnail-view-model');
  if (viewModel) return viewModel;
  return element.closest('a#thumbnail, a.reel-item-endpoint, a.ytp-videowall-still') || element;
};

// 영상 링크 요소 찾기
const getLinkElement = (element, host) => {
  return element.closest('a[href*="/watch"], a[href*="/shorts/"], a[href*="youtu.be"]')
    || host.closest('a[href*="/watch"], a[href*="/shorts/"], a[href*="youtu.be"]');
};

// 썸네일에 아이콘 추가 함수
const addIconToThumbnails = () => {
  const thumbnails = document.querySelectorAll('a#thumbnail, a.reel-item-endpoint, a.ytp-videowall-still, a.ytLockupViewModelContentImage, div.ytThumbnailViewModelImage');
  const processedHosts = new Set();

  thumbnails.forEach(thumbnail => {
    const host = getIconHost(thumbnail);
    if (!host || processedHosts.has(host)) return;
    processedHosts.add(host);

    const linkElement = getLinkElement(thumbnail, host);
    const existingIcon = host.querySelector('.popup-icon');

    // 호버 미리보기 오버레이가 추가되면 아이콘을 맨 위로 다시 올림
    if (existingIcon) {
      host.style.position = 'relative';
      if (host.lastElementChild !== existingIcon) {
        host.appendChild(existingIcon);
      }
      return;
    }

    // 팝업 아이콘 생성
    const icon = document.createElement('div');
    icon.className = 'popup-icon';
    icon.innerHTML = '▶';

    host.style.position = 'relative';
    host.appendChild(icon);

    // 아이콘 클릭 이벤트
    icon.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();

      let link = linkElement?.href || $(icon).closest('a').attr('href') || '';
      if (link.startsWith('/')) {
        link = 'https://www.youtube.com' + link;
      }

      const videoId = extractVideoId(link);
      if (videoId) {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const playerUrl = `${chrome.runtime.getURL('player-frame.html')}?url=${encodeURIComponent(youtubeUrl)}`;
        const videoFrame = document.getElementById('videoFrame');

        openPopupLayer();
        videoFrame.src = playerUrl;

        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      } else {
        alert('영상 ID를 추출할 수 없습니다.');
      }
    });
  });
};

// 유튜브 영상 ID 추출 함수
const extractVideoId = (url) => {
  // const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/|watch\?v=)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null; // 영상 ID 반환
};

const popup = document.getElementById('popup');

const openPopupLayer = () => {
  popup.style.display = 'flex';
  document.body.classList.add('baroba-popup-open');
};

const closePopupLayer = () => {
  popup.style.display = 'none';
  document.getElementById('videoFrame').src = '';
  document.body.classList.remove('baroba-popup-open');
  chrome.storage.sync.get(['popupView'], (data) => {
    if (chrome.runtime.lastError) return;
    if (data.popupView !== 'N') {
      $('.popup-icon').show();
    }
  });
};

// 팝업 닫기 버튼 이벤트
document.getElementById('closePopup').addEventListener('click', closePopupLayer);

// MutationObserver를 사용하여 동적으로 추가되는 썸네일에도 아이콘 추가
const observer = new MutationObserver(addIconToThumbnails);
observer.observe(document.body, { childList: true, subtree: true });

// 초기 썸네일에 아이콘 추가
addIconToThumbnails();

// 미리보기 ... 영상이 가림 ... 숨김 처리함
const videoPreview = document.getElementById('video-preview');
if (videoPreview) {
  videoPreview.style.display = 'none';
}

const isExtensionContextValid = () => {
  try {
    return Boolean(chrome.runtime && chrome.runtime.id);
  } catch (error) {
    return false;
  }
};

const popupViewInterval = setInterval(function () {
  if (!isExtensionContextValid()) {
    clearInterval(popupViewInterval);
    return;
  }

  try {
    chrome.storage.sync.get(['popupView'], (data) => {
      if (!isExtensionContextValid() || chrome.runtime.lastError) return;
      if (data.popupView == 'N') {
        $('.popup-icon').hide();
      } else if (!document.body.classList.contains('baroba-popup-open')) {
        $('.popup-icon').show();
      }
    });
  } catch (error) {
    clearInterval(popupViewInterval);
  }
}, 1000);