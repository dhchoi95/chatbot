// ✅ 1. 챗봇 토글 버튼
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

  window.addEventListener("message", (event) => {
    if (event.data.action === "close-chatbot") {
      const iframe = document.getElementById("my-chatbot-frame");
      if (iframe) iframe.remove();
    }
  });
}

// ✅ 2. 패널 탭 로딩 대기
function waitForPanelContent(maxWait = 3000, interval = 200) {
  return new Promise(async (resolve) => {
    const maxTries = Math.ceil(maxWait / interval);
    for (let i = 0; i < maxTries; i++) {
      const tabs = Array.from(document.querySelectorAll(".right-collapse-title"));
      const bodies = Array.from(document.querySelectorAll(".el-collapse-item"));
      const filled = bodies.some(body => body.textContent.trim().length > 0);
      if (tabs.length > 0 && filled) {
        resolve({ tabs, bodies });
        return;
      }
      await new Promise(res => setTimeout(res, interval));
    }
    resolve({ tabs: [], bodies: [] }); // 실패 시
  });
}

// ✅ 3. 단일 h3에 대한 상태 확인
async function checkReviewStatusByH3(h3) {
  h3.scrollIntoView({ behavior: "auto", block: "center" });
  h3.click();

  const { tabs, bodies } = await waitForPanelContent();
  if (bodies.length === 0) {
    console.warn("⚠️ 패널 본문 로딩 실패:", h3.textContent.trim());
    return { commentCount: -1, reviewCount: -1 };
  }

  const reviewTab = tabs.find(tab => tab.textContent.includes("검증검토"));
  if (reviewTab && !reviewTab.classList.contains("active")) {
    reviewTab.click();
    await new Promise(res => setTimeout(res, 2000));
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

// ✅ 4. 본문 h3에 상태 표시
async function markReviewStatusOnH3() {
  const h3List = Array.from(document.querySelectorAll("h3"))
    .filter(h3 => !h3.classList.contains("workitem-name"));

  for (const h3 of h3List) {
    const { commentCount, reviewCount } = await checkReviewStatusByH3(h3);

    const existing = h3.querySelector(".review-status");
    if (existing) existing.remove();

    const span = document.createElement("span");
    span.className = "review-status";
    Object.assign(span.style, {
      marginLeft: "10px",
      fontSize: "0.9em",
      color: "#888"
    });
    span.textContent = `💬 ${commentCount} | ✅ ${reviewCount}`;
    h3.appendChild(span);
  }
}

// ✅ 5. 목차 항목 옆 상태 표시
async function markReviewStatusOnTreeView() {
  const treeItems = document.querySelectorAll("#documentTreeviewId li .k-in");
  for (const item of treeItems) {
    const titleText = item.textContent.trim().replace(/\[\d+\]/g, "").trim();
    const matchingH3 = Array.from(document.querySelectorAll("h3"))
      .find(h3 => h3.textContent.trim() === titleText && !h3.classList.contains("workitem-name"));

    if (!matchingH3) continue;

    const { commentCount, reviewCount } = await checkReviewStatusByH3(matchingH3);

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
}

// ✅ 6. 챗봇 메시지 수신 (트리거)
window.addEventListener("message", (event) => {
  if (event.data.action === "check-review-status") {
    markReviewStatusOnH3();
    markReviewStatusOnTreeView();
  }
});
