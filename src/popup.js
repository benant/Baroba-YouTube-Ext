document.addEventListener('DOMContentLoaded', function () {
	const popupViewCheckbox = document.getElementById('popupView');
	const playlistSearchCheckbox = document.getElementById('playlistSearch');
	const gotoNextCheckbox = document.getElementById('gotoNext');

	// 저장된 설정 불러오기
	chrome.storage.sync.get(['popupView', 'playlistSearch', 'gotoNext'], (data) => {
		popupViewCheckbox.checked = data.popupView == 'N' ? false : true;
		playlistSearchCheckbox.checked = data.playlistSearch == 'N' ? false : true;
		gotoNextCheckbox.checked = data.gotoNext == 'N' ? false : true;
	});

	// 체크박스 변경되면 저장하기
	popupViewCheckbox.addEventListener('change', function () {
		chrome.storage.sync.set({ popupView: popupViewCheckbox.checked ? 'Y' : 'N' });
	});

	playlistSearchCheckbox.addEventListener('change', function () {
		chrome.storage.sync.set({ playlistSearch: playlistSearchCheckbox.checked ? 'Y' : 'N' });
	});

	gotoNextCheckbox.addEventListener('change', function () {
		chrome.storage.sync.set({ gotoNext: gotoNextCheckbox.checked ? 'Y' : 'N' });
	});
});
