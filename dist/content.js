const popupHTML='\n  <div id="popup" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); justify-content: center; align-items: center; z-index: 9000;">\n    <div style="position: relative; width: 100%; max-width: 1200px; background: white; padding: 20px; border-radius: 8px;">\n      <button id="closePopup" style="position: absolute; top: 10px; right: 10px;">닫기</button>\n      <iframe id="videoFrame" width="100%" height="675" frameborder="0" allowfullscreen></iframe>\n    </div>\n  </div>\n';document.getElementById("popup")||document.body.insertAdjacentHTML("beforeend",popupHTML);const addIconToThumbnails=()=>{const e=document.querySelectorAll("a#thumbnail");e.forEach(e=>{if(e.querySelector(".popup-icon"))return;const t=document.createElement("div");t.className="popup-icon",t.style.position="absolute",t.style.top="calc(50% - 15px)",t.style.left="calc(50% - 15px)",t.style.width="30px",t.style.height="30px",t.style.padding="0 2px 5px 3px",t.style.fontSize="20px",t.style.backgroundColor="rgba(255, 0, 0, 0.8)",t.style.borderRadius="50%",t.style.display="flex",t.style.alignItems="center",t.style.justifyContent="center",t.style.cursor="pointer",t.innerHTML="▶️";const o=e.parentElement;o&&(o.style.position="relative"),e.appendChild(t),t.addEventListener("click",t=>{t.stopPropagation(),t.preventDefault();const o=extractVideoId(e.href);if(o){const e=`https://www.youtube.com/embed/${o}`,t=document.getElementById("videoFrame");t.src=e;const n=document.getElementById("popup");n.style.display="flex"}else alert("영상 ID를 추출할 수 없습니다.")})})},extractVideoId=e=>{const t=/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,o=e.match(t);return o?o[1]:null};document.getElementById("closePopup").addEventListener("click",()=>{const e=document.getElementById("popup");e.style.display="none";const t=document.getElementById("videoFrame");t.src=""});const observer=new MutationObserver(addIconToThumbnails);observer.observe(document.body,{childList:!0,subtree:!0}),addIconToThumbnails(),document.getElementById("video-preview").style.display="none";