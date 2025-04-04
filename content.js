console.log("✅ content.js 실행됨");

// 이미 존재하는 버튼이 있으면 생성하지 않음
if (!document.getElementById("my-chatbot-toggle")) {
  // 🟦 1. BOT 이미지 버튼 생성
  const button = document.createElement("div");
  button.id = "my-chatbot-toggle";
  button.style.position = "fixed";
  button.style.bottom = "15px";
  button.style.right = "10px";
  button.style.width = "96px";
  button.style.height = "96px";
  button.style.cursor = "pointer";
  button.style.zIndex = "9999";

  // 🟦 로봇 아이콘 이미지
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("bot-icon.png"); // 반드시 manifest에 등록되어 있어야 함
  img.alt = "Chatbot Icon";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "contain";

  /* // 디버깅용 스타일 (원할 경우 제거 가능)
  img.onload = () => console.log("✅ 이미지 로드 성공!");
  img.onerror = () => console.log("❌ 이미지 로드 실패!");
  // img.style.border = "2px solid red";
  // img.style.backgroundColor = "yellow";*/

  button.appendChild(img);
  document.body.appendChild(button);

  // 🟦 2. iframe 열고 닫는 토글 로직
  let iframe = null;

  button.onclick = () => {
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.src = chrome.runtime.getURL("bot.html");
      iframe.id = "my-chatbot-frame";
      iframe.style.position = "fixed";
      iframe.style.bottom = "60px"; // 버튼 위
      iframe.style.right = "90px";
      iframe.style.width = "400px";
      iframe.style.height = "500px";
      iframe.style.maxWidth = "100%";
      iframe.style.overflowX = "hidden";
      iframe.style.border = "2px solid #aaa"; // ✅ 연한 회색 테두리
      iframe.style.borderRadius = "10px";
      iframe.style.zIndex = "9999";
      document.body.appendChild(iframe);
    } else {
      iframe.remove();
      iframe = null;
    }
  };

  // 🟦 3. 외부에서 닫기 요청 처리
  window.addEventListener("message", (event) => {
    if (event.data.action === "close-chatbot") {
      const iframe = document.getElementById("my-chatbot-frame");
      if (iframe) iframe.remove();
    }
  });
}
