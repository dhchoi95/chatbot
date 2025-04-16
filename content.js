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

  // ✅ 챗봇 토글 버튼 클릭 시 iframe 열기/닫기
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

      // ✅ iframe 로드 완료 시 사용자 이름 전달
      iframe.addEventListener("load", () => {
        const userEl = document.querySelector(".user-name");
        if (userEl && iframe?.contentWindow) {
          const username = userEl.textContent.trim().replace(/\s+/g, "");
          iframe.contentWindow.postMessage({ action: "send-username", username }, "*");
        }
      });

    } else {
      // 이미 열려있으면 제거
      iframe.remove();
      iframe = null;
    }
  };

  // ✅ 챗봇 내부에서 'X' 누르면 iframe 제거
  window.addEventListener("message", (event) => {
    if (event.data.action === "close-chatbot") {
      const iframe = document.getElementById("my-chatbot-frame");
      if (iframe) iframe.remove();
    }
  });
}

let isReviewRunning = false; // ✅ 검증검토 진행 중 여부

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
        await new Promise(res => setTimeout(res, 1000));
        resolve({ tabs, bodies });
        return;
      }

      await new Promise(res => setTimeout(res, interval));
    }

    console.warn("❌ 우측 패널 로딩 실패");
    isReviewRunning = false;
    document.getElementById("stop-review-btn")?.remove();
    alert("❗ 우측 패널을 열고 다시 검증검토를 요청해주세요.");
    reject(new Error("우측 패널 로딩 실패"));
  });
}

// ✅ 3. 개별 항목(item)의 상태 확인
async function checkReviewStatusByItem(item) {
  item.scrollIntoView({ behavior: "auto", block: "center" });
  item.click();

  const allHeaders = Array.from(document.querySelectorAll("header.doc-header h3"));
  const target = allHeaders.find(title => title.textContent.trim() === item.textContent.trim());

  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.click();
  }

  const result = await waitForPanelContent();
  const tabs = result?.tabs ?? [];

  const matched = await waitForMatchingBody(item);
  await new Promise(res => setTimeout(res, 1100));

  let commentCount = 0;
  let reviewCount = 0;

  tabs.forEach(tab => {
    const text = tab.textContent;
    const match = text.match(/\d+/);
    if (text.includes("댓글") && match) commentCount = parseInt(match[0]);
    if (text.includes("검증검토") && match) reviewCount = parseInt(match[0]);
  });

  return { commentCount, reviewCount };
}

// ✅ 4. 본문 일치 여부 확인 (번호/코드 제거 후 비교)
async function waitForMatchingBody(item, maxWait = 5000, interval = 200) {
  const normalize = text =>
    text
      .replace(/^\d+(\.\d+)*\.?/, "") // 숫자 제거 (1., 1.2. 등)
      .replace(/\[.*?\]/g, "")        // 대괄호 제거
      .replace(/\s+/g, "");           // 공백 제거

  const targetText = normalize(item.textContent);

  const maxTries = Math.ceil(maxWait / interval);
  for (let i = 0; i < maxTries; i++) {
    const bodies = Array.from(document.querySelectorAll(".el-col"));
    for (const body of bodies) {
      const bodyText = normalize(body.textContent);
      if (bodyText === targetText) return true;
    }
    await new Promise(res => setTimeout(res, interval));
  }
  return false;
}

// ✅ 5. 전체 항목에 상태 표시
async function markReviewStatusOnTreeViewOnly() {
  const allItems = Array.from(document.querySelectorAll("#documentTreeviewId li .k-in"));
  const selectedItem = document.querySelector("#documentTreeviewId li[aria-selected='true'] .k-in");
  const startIndex = allItems.findIndex(item => item === selectedItem);
  const treeItems = allItems.slice(startIndex);

  isReviewRunning = true;

  for (const item of treeItems) {
    if (!isReviewRunning) break;

    item.scrollIntoView({ behavior: "auto", block: "center" });
    item.click();

    const { commentCount, reviewCount } = await checkReviewStatusByItem(item);

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

// ✅ 6. 검증검토 강제 패널 오픈
async function forceOpenRightPanelIfNeeded() {
  const headerToClick = document.querySelector("header.el-header.doc-header");
  if (headerToClick) {
    headerToClick.scrollIntoView({ behavior: "auto", block: "center" });
    headerToClick.click();
    console.log("✅ 헤더 클릭으로 강제 패널 오픈");
    await new Promise(res => setTimeout(res, 2000));
  }
}

// ✅ 7. 중지 버튼 생성
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

// ✅ 8. 챗봇에서 메시지 수신 시 검증검토 실행
window.addEventListener("message", async (event) => {
  if (event.data.action === "check-review-status" && !isReviewRunning) {
    isReviewRunning = true;
    createStopButton();
    await markReviewStatusOnTreeViewOnly();
    document.getElementById("stop-review-btn")?.remove();
    isReviewRunning = false;
  }
});

//문의하기 기능 조작
window.addEventListener("message", async (event) => {
  if (event.data.action === "inject-feedback") {
    console.log("되나");
    const content = event.data.content;

    // "추가" 버튼을 기다렸다가 누름
    const waitForButton = async () => {
      const maxWait = 10000;
      const interval = 300;
      const end = Date.now() + maxWait;

      while (Date.now() < end) {
        const spans = Array.from(document.querySelectorAll("button span"));
        const addBtnSpan = spans.find(span => span.textContent.trim() === "추가");
        if (addBtnSpan) {
          const btn = addBtnSpan.closest("button");
          if (btn) {
            btn.click();
            break;
          }
        }
        await new Promise(r => setTimeout(r, interval));
      }
    };

    const waitForEditor = async () => {
      const maxWait = 10000;
      const interval = 300;
      const end = Date.now() + maxWait;

      while (Date.now() < end) {
        const editor = document.querySelector('div[role="textbox"][contenteditable="true"]');
        if (editor) return editor;
        await new Promise(r => setTimeout(r, interval));
      }
      return null;
    };

    await waitForButton();
    const editor = await waitForEditor();
    if (editor) {
      editor.focus();
      editor.innerHTML = `<p>${content.replace(/"/g, '&quot;')}</p>`;
    }
  }
});


