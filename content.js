// ✅ 1. 챗봇 토글 버튼 생성 및 iframe 삽입
if (!document.getElementById("my-chatbot-toggle")) {
  const button = document.createElement("div");
  button.id = "my-chatbot-toggle";
  Object.assign(button.style, {
    position: "fixed",
    bottom: "15px",
    right: "10px",
    width: "96px",
    height: "96px",
    cursor: "pointer",
    zIndex: "9999"
  });

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("bot-icon.png");
  img.alt = "Chatbot Icon";
  Object.assign(img.style, {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  });

  button.appendChild(img);
  document.body.appendChild(button);

  let iframe = null;

  // 버튼 클릭 시 iframe 토글 (열기/닫기)
  button.onclick = () => {
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.src = chrome.runtime.getURL("bot.html");
      iframe.id = "my-chatbot-frame";
      Object.assign(iframe.style, {
        position: "fixed",
        bottom: "60px",
        right: "90px",
        width: "410px",
        height: "500px",
        border: "2px solid #aaa",
        borderRadius: "10px",
        zIndex: "9999"
      });
      document.body.appendChild(iframe);
    } else {
      iframe.remove();
      iframe = null;
    }
  };

  // 챗봇 내부에서 'X' 누를 경우 iframe 제거
  window.addEventListener("message", (event) => {
    if (event.data.action === "close-chatbot") {
      const iframe = document.getElementById("my-chatbot-frame");
      if (iframe) iframe.remove();
    }
  });
}

let isReviewRunning = false; // 검토 중 여부 상태

// ✅ 2. 우측 패널 탭 로딩 대기
function waitForPanelContent(maxWait = 3000, interval = 200) {
  return new Promise(async (resolve, reject) => {
    const maxTries = Math.ceil(maxWait / interval);
    for (let i = 0; i < maxTries; i++) {
      const tabs = Array.from(document.querySelectorAll(".right-collapse-title"));
      const bodies = Array.from(document.querySelectorAll(".el-col"));
      const splitterVisible = Array.from(document.querySelectorAll(".splitpanes__splitter"))
        .some(el => el.style.display === "block");

      if (tabs.length > 0 && splitterVisible) {
        console.log("✅ 우측 패널 로딩 완료 (splitter visible)");
        await new Promise(res => setTimeout(res, 1000)); // ✅ 1초 대기 추가
        resolve({ tabs, bodies });
        return;
      }

      await new Promise(res => setTimeout(res, interval));
    }

    // ❌ 실패 시 자동 중지 처리
    console.warn("❌ 우측 패널 로딩 실패 (splitter 미표시)");
    isReviewRunning = false;
    document.getElementById("stop-review-btn")?.remove();
    alert("❗ 우측 패널을 열고 다시 검증검토를 요청해주세요.");
    reject(new Error("우측 패널 로딩 실패"));
  });
}




// ✅ 3. 개별 항목(item)에 대한 상태 확인 함수
async function checkReviewStatusByItem(item) {
  item.scrollIntoView({ behavior: "auto", block: "center" });
  item.click();
  const allHeaders = Array.from(document.querySelectorAll("header.doc-header h3"));
  const target = allHeaders.find(titletext => titletext.textContent.trim() === item.textContent.trim());

  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.click();
  }

  const result = await waitForPanelContent();
  const tabs = result?.tabs ?? [];
  
  const matched = await waitForMatchingBody(item); // ✨ await 꼭 필요!
  await new Promise(res => setTimeout(res,1100)); // ✅ 1.1초 대기 추가

  if (!matched) {
    console.warn("본문 일치 실패");
  }
  let commentCount = 0;
  let reviewCount = 0;

  tabs.forEach(tab => {
    const text = tab.textContent;
    if (text.includes("댓글")) {
      const match = text.match(/\d+/);
      if (match) commentCount = parseInt(match[0]);
    }
    if (text.includes("검증검토")) {
      const match = text.match(/\d+/);
      if (match) reviewCount = parseInt(match[0]);
    }
  });

  return { commentCount, reviewCount };
}

// 패널 로딩 후, 텍스트 일치할 때까지 기다리는 함수 (번호/코드 제거 버전)
async function waitForMatchingBody(item, maxWait = 5000, interval = 200) {
  // 🔹 번호와 대괄호 제거 + 공백 제거
  const normalize = (text) =>
    text
      .replace(/^\d+(\.\d+)*\.?/, "")// 예: 1. 또는 1.2. 또는 1.2.3. 제거
      .replace(/\[.*?\]/g, "")       // [코드] 제거
      .replace(/\s+/g, "");          // 모든 공백 제거

  const targetText = normalize(item.textContent);

  const maxTries = Math.ceil(maxWait / interval);
  for (let i = 0; i < maxTries; i++) {
    const bodies = Array.from(document.querySelectorAll(".el-col"));
    for (const body of bodies) {
      const bodyText = normalize(body.textContent);
      if (bodyText === targetText) {
        return true;
      }
    }
    await new Promise(res => setTimeout(res, interval));
  }
  return false; // 최종 실패
}




// ✅ 4. 전체 목차 항목에 대한 상태 표시
async function markReviewStatusOnTreeViewOnly() {
  const allItems = Array.from(document.querySelectorAll("#documentTreeviewId li .k-in"));
  const selectedItem = document.querySelector("#documentTreeviewId li[aria-selected='true'] .k-in");//현재 선택된 항목 찾기
  const startIndex = allItems.findIndex(item => item === selectedItem); // 선택된 항목의 인덱스 찾기
  const treeItems = allItems.slice(startIndex); //이후 항목만 추출 (선택된 항목 포함)

  isReviewRunning = true;

  for (const item of treeItems) {
    if (!isReviewRunning) break;

    //forceOpenRightPanelIfNeeded();  // 우측 패널 열기 시도
    item.scrollIntoView({ behavior: "auto", block: "center" });
    item.click();

    const { commentCount, reviewCount } = await checkReviewStatusByItem(item);

    // 기존 상태 제거 후 다시 추가
    const existing = item.querySelector(".tree-status");
    if (existing) existing.remove();

    const span = document.createElement("span");
    span.className = "tree-status";
    Object.assign(span.style, {
      marginLeft: "8px",
      fontSize: "0.9em",
      color: "#888"
    });
    span.textContent = `💬 ${commentCount} | ✅ ${reviewCount}`;
    item.appendChild(span);
  }

  isReviewRunning = false;
}

// ✅ 5. 우측 패널이 닫혀 있을 경우 강제로 열기
async function forceOpenRightPanelIfNeeded(startIndex) {
  //const tabs = document.querySelectorAll(".right-collapse-title");
  //if (tabs.length === 0) {
    const headerToClick = document.querySelector("header.el-header.doc-header");
    if (headerToClick) {
      headerToClick.scrollIntoView({ behavior: "auto", block: "center" });
      headerToClick.click();
      console.log("✅ 헤더 클릭으로 탭 강제 오픈 시도");
      await new Promise(res => setTimeout(res, 2000)); // ⏱️ 2초 대기
    }
  //}
}


// ✅ 6. 중지 버튼 생성 함수
function createStopButton() {
  if (document.getElementById("stop-review-btn")) return;

  const stopBtn = document.createElement("div");
  stopBtn.id = "stop-review-btn";
  stopBtn.textContent = "⏹ 중지";
  Object.assign(stopBtn.style, {
    position: "fixed",
    bottom: "570px",
    right: "95px",
    backgroundColor: "#ffdddd",
    color: "#000",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer",
    zIndex: "99999"
  });

  stopBtn.onclick = () => {
    isReviewRunning = false;
    stopBtn.remove();
    alert("⛔ 검증검토가 중지되었습니다.");
  };

  document.body.appendChild(stopBtn);
}

// ✅ 7. 챗봇으로부터 메시지 수신 시 검토 시작 트리거
window.addEventListener("message", async (event) => {
  if (event.data.action === "check-review-status") {
    if (!isReviewRunning) {
      isReviewRunning = true;
      createStopButton();
      await markReviewStatusOnTreeViewOnly();
      document.getElementById("stop-review-btn")?.remove();
      isReviewRunning = false;
    }
  }
});
