// 유튜브 쇼츠 자동 스크롤 스크립트
// 유튜브 쇼츠가 재생이 끝나면 다음 쇼츠로 자동으로 이동시킵니다.
// 2025.05.13 테스트 중... 뭔가 버그가..
let gotoNext = true;
$(function () {

  // 쇼츠 영상이 끝나면 다음 영상으로 자동 이동하는 코드
  function goNextShorts(video) {
    
    chrome.storage.sync.get(['gotoNext'], (data) => {
      if(data.gotoNext == 'N') {
        gotoNext = false ;  
      } else {
        gotoNext = true ;  
      }
    });
    console.log('gotoNext : ',gotoNext);
    if (gotoNext) {
      video.loop = false; // 반복 재생 끄기
      // shorts-container가 스크롤로 다음 영상 전환을 담당
      const container = document.getElementById('shorts-container');
      if (container) {
        container.scrollBy(0, 1); // 아래로 아주 조금 스크롤 → 다음 영상 로딩
      } else {
        // fallback: 다음 버튼이 있으면 클릭
        const nextBtn = document.querySelector('button[aria-label="다음"]');
        if (nextBtn) nextBtn.click();
      }
    } else {
      video.loop = true; // 반복 재생 켜기
    }
  }

  function addEndedListenerToShorts() {
    // 모든 쇼츠 비디오에 ended 이벤트 리스너 추가
    document.querySelectorAll('ytd-reel-video-renderer.ytd-shorts video.video-stream.html5-main-video').forEach(video => {
      video.loop = false; // 반복 재생 끄기
      video.addEventListener('ended', () => goNextShorts(video), { once: true });
    });
  }

  // 쇼츠 페이지에서 비디오가 동적으로 바뀔 수 있으므로 주기적으로 리스너 등록
  setInterval(addEndedListenerToShorts, 1000);

});