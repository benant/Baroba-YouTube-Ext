// 팝업 레이어 HTML 구조 생성
const popupHTML = `
  <div id="popup" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); justify-content: center; align-items: center; z-index: 9000;">
    <div style="position: relative; width: 100%; max-width: 1200px; background: white; padding: 20px; border-radius: 8px;">
      <button id="closePopup" style="position: absolute; top: 10px; right: 10px;">닫기</button>
      <iframe id="videoFrame" width="100%" height="675" frameborder="0" allowfullscreen></iframe>
    </div>
  </div>
`;

// 팝업 레이어가 이미 존재하지 않을 때만 추가
if (!document.getElementById('popup')) {
  document.body.insertAdjacentHTML('beforeend', popupHTML);
}

// 썸네일에 아이콘 추가 함수
const addIconToThumbnails = () => {
  const thumbnails = document.querySelectorAll('a#thumbnail, a.reel-item-endpoint, a.ytp-videowall-still, div.ytThumbnailViewModelImage');
  // const thumbnails = document.querySelectorAll('a#thumbnail');
  // console.log(`썸네일 개수: ${thumbnails.length}`); // 썸네일 개수 로그

  thumbnails.forEach(thumbnail => {
    // 이미 아이콘이 추가된 경우는 건너뜁니다.
    if (thumbnail.querySelector('.popup-icon')) {
      // console.log('아이콘이 이미 추가된 썸네일 건너뜀');
      return;
    }

    // 팝업 아이콘 생성
    const icon = document.createElement('div');
    icon.className = 'popup-icon';
    icon.style.position = 'absolute';
    icon.style.top = 'calc(50% - 15px)';
    icon.style.left = 'calc(50% - 15px)';
    icon.style.width = '30px';
    icon.style.height = '30px';
    icon.style.padding = '0 2px 5px 3px';
    icon.style.fontSize = '20px';
    icon.style.backgroundColor = 'rgba(255, 0, 0, 0.8)'; // 배경색을 검은색으로 변경
    icon.style.borderRadius = '50%';
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.cursor = 'pointer';
    icon.innerHTML = '▶️'; // 아이콘으로 사용할 문자

    // 썸네일의 부모 요소에 position: relative; 추가
    const parent = thumbnail.parentElement;
    if (parent) {
      parent.style.position = 'relative'; // 부모 요소의 위치를 상대적으로 설정
    }

    // 썸네일에 아이콘 추가
    thumbnail.appendChild(icon);
    // console.log('아이콘 추가됨:', thumbnail.href); // 아이콘 추가된 썸네일 로그

    // 아이콘 클릭 이벤트
    icon.addEventListener('click', (event) => {
      event.stopPropagation(); // 클릭 이벤트 전파 방지
      event.preventDefault(); // 기본 동작 방지
      let link = thumbnail.href ? thumbnail.href : $(icon).closest('a').attr('href');
      console.log('link is ',link);

      const videoId = extractVideoId(link);
      if (videoId) {
        // @todo https://www.youtube.com/iframe_api 으로 변경하기. view-source:https://www.shop-plus.kr/tv_and/ 참고
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`; // 자동 실행을 위한 쿼리 추가
        const videoFrame = document.getElementById('videoFrame');
        videoFrame.src = embedUrl; // iframe에 embed URL 설정

        // .ytp-pause-overlay 숨김처리
        setTimeout(function(){
          // console.log('.ytp-pause-overlay 숨김처리');
          const pauseOverlay = videoFrame.contentDocument.querySelector('.ytp-pause-overlay'); // iframe 내부의 .ytp-pause-overlay 선택
          // console.log('pauseOverlay:', pauseOverlay);
          if (pauseOverlay) {
              pauseOverlay.innerHTML = ''; // .ytp-pause-overlay의 내용을 비웁니다.
          }
        }, 2000);

        const popup = document.getElementById('popup');
        popup.style.display = 'flex'; // 팝업 레이어 표시
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

// 팝업 닫기 버튼 이벤트
document.getElementById('closePopup').addEventListener('click', () => {
  const popup = document.getElementById('popup');
  popup.style.display = 'none'; // 팝업 레이어 숨기기
  const videoFrame = document.getElementById('videoFrame');
  videoFrame.src = ''; // iframe src 초기화
});

// MutationObserver를 사용하여 동적으로 추가되는 썸네일에도 아이콘 추가
const observer = new MutationObserver(addIconToThumbnails);
observer.observe(document.body, { childList: true, subtree: true });

// 초기 썸네일에 아이콘 추가
addIconToThumbnails();

// 미리보기 ... 영상이 가림 ... 숨김 처리함
document.getElementById('video-preview').style.display = 'none';

setInterval(function(){
  
  chrome.storage.sync.get(['popupView'], (data) => {
    if(data.popupView == 'N') {
      $('.popup-icon').hide();
    } else {
      $('.popup-icon').show();
    }
  });

}, 1000)