document.addEventListener("DOMContentLoaded", () => {
  // 🔹 초기 셋업
  const app = document.getElementById("app");
  const container = document.createElement("div");
  Object.assign(container.style, {
    fontFamily: "Arial, sans-serif",
    color: "#000000",
    backgroundColor: "#ffffff",
    position: "relative",
    height: "100%",
    padding: "0.5rem",
    paddingBottom: "60px",
    boxSizing: "border-box",
    overflowY: "auto"
  });
  app.appendChild(container);

  let currentCategory = null;
  let historyStack = [];

  //뒤로가기, 닫기버튼
  function renderHeader({ showBack = false, backHandler = null }) {
    const oldHeader = document.getElementById("header-buttons");
    if (oldHeader) oldHeader.remove();

    const header = document.createElement("div");
    header.id = "header-buttons";

    if (showBack) {
      const back = document.createElement("button");
      back.textContent = "←";
      back.title = "뒤로가기";
      Object.assign(back.style, {
        position: "absolute",
        left: "2px",
        top: "2px",
        background: "transparent",
        border: "none",
        fontWeight: "bold",
        fontSize: "20px",
        cursor: "pointer"
      });
      back.onclick = backHandler;
      header.appendChild(back);
    }

    const close = document.createElement("button");
    close.textContent = "X";
    close.title = "닫기";
    Object.assign(close.style, {
      position: "absolute",
      right: "2px",
      top: "2px",
      background: "transparent",
      border: "none",
      fontSize: "14px",
      cursor: "pointer"
    });
    close.onclick = () => {
      window.parent.postMessage({ action: "close-chatbot" }, "*");
    };
    header.appendChild(close);

    container.appendChild(header);
  }
  

  // 🔹 카테고리 목록 렌더링
  function renderCategories() {
    container.innerHTML = "<h3 style='font-size: 20px;'>VisualPro bot</h3>";

    renderHeader({ showBack: false });
    renderReviewCheckButton();        // ✅ 그 다음 버튼 추가! (문의하기도 여기 쓰고 있으면 같이)

    chatbotData.forEach(cat => {
      const li = document.createElement("div");
      li.textContent = cat.category;
      Object.assign(li.style, {
        cursor: "pointer",
        marginBottom: "0.5rem",
        padding: "0.5rem",
        fontSize: "18px"
      });
      li.onclick = () => {
        currentCategory = cat;
        historyStack = [];
        historyStack.push(() => renderCategories());
        renderItemList(cat.items, cat.category);
      };
      container.appendChild(li);
    });
  }

  // 🔹 카테고리별 질문 리스트 렌더링
  function renderItemList(items, title) {
    container.innerHTML = `<h3 style="font-size: 17px;">${title}</h3>`;
    renderHeader({
      showBack: historyStack.length > 0,
      backHandler: () => {
        const previous = historyStack.pop();
        if (typeof previous === 'function') previous();
      }
    });

    items.forEach(item => {
      const li = document.createElement("div");
      li.textContent = item.question;
      Object.assign(li.style, {
        cursor: "pointer",
        marginBottom: "0.5rem",
        padding: "0.4rem",
        fontSize: "16px"
      });
      li.onclick = () => {
        historyStack.push(() => renderItemList(items, title));
        historyStack.push(() => renderQA(item));
        renderQA(item);
      };
      container.appendChild(li);
    });
  }

  // 🔹 상세 설명 렌더링
  function renderDetail(detailText, parentNode) {
    container.innerHTML = `<h4 style="font-size: 16px;"><b>자세한 설명</b></h4>`;
    renderHeader({
      showBack: true,
      backHandler: () => renderQA(parentNode)
    });
    const detail = document.createElement("p");
    detail.innerHTML = detailText;
    detail.style.fontSize = "16px";
    container.appendChild(detail);
  }

  // 🔹 Q&A 렌더링
  function renderQA(node) {
    container.innerHTML = `<h4 style="font-size: 16px;"><b>Q. ${node.question || "질문 없음"}</b></h4>`;
    renderHeader({
      showBack: historyStack.length > 0,
      backHandler: () => {
        const previous = historyStack.pop();
        if (typeof previous === 'function') previous();
      }
    });

    if (typeof node.answer === "string") {
      const p = document.createElement("p");
      p.innerHTML = `<b>A.</b> ${node.answer}`;
      p.style.fontSize = "16px";
      container.appendChild(p);
    } else if (Array.isArray(node.answer)) {
      node.answer.forEach(sub => {
        const li = document.createElement("div");
        li.textContent = sub.question || "(하위 질문 없음)";
        Object.assign(li.style, {
          cursor: "pointer",
          marginBottom: "0.5rem",
          fontSize: "16px"
        });
        li.onclick = () => {
          historyStack.push(() => renderQA(node));
          renderQA(sub);
        };
        container.appendChild(li);
      });
    } else if (typeof node.answer === "object" && node.answer !== null) {
      const sub = node.answer;
      const li = document.createElement("div");
      li.textContent = sub.question || "(하위 질문 없음)";
      Object.assign(li.style, {
        cursor: "pointer",
        marginBottom: "0.5rem",
        fontSize: "16px"
      });
      li.onclick = () => {
        historyStack.push(() => renderQA(node));
        renderQA(sub);
      };
      container.appendChild(li);
    }

    // 🔸 상세 설명 버튼 + 링크 버튼
    if (node.detail) {
      const toggle = document.createElement("button");
      let expanded = false;
      const detailTitle = node.detailTitle || "자세한 설명 보기 ▼";
      toggle.textContent = detailTitle;
      Object.assign(toggle.style, {
        marginTop: "1rem",
        padding: "0.5rem 1rem",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "4px",
        fontSize: "14px",
        cursor: "pointer"
      });

      const detailBox = document.createElement("div");
      detailBox.style.display = "none";
      detailBox.style.marginTop = "0.5rem";
      detailBox.innerHTML = `<p style="font-size: 14px;">${node.detail}</p>`;

      if (node.link) {
        const linkBtn = document.createElement("button");
        linkBtn.textContent = node.linkTitle || "자세한 내용 보기";
        Object.assign(linkBtn.style, {
          marginTop: "0.5rem",
          padding: "0.3rem 0.8rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "13px",
          cursor: "pointer"
        });
        linkBtn.onclick = () => window.open(node.link, "_blank");
        detailBox.appendChild(linkBtn);
      }

      toggle.onclick = () => {
        expanded = !expanded;
        toggle.textContent = expanded
          ? detailTitle.replace("보기", "닫기")
          : detailTitle;
        detailBox.style.display = expanded ? "block" : "none";
      };

      container.appendChild(toggle);
      container.appendChild(detailBox);
    } else if (node.link) {
      const detailBtn = document.createElement("button");
      detailBtn.textContent = node.linkTitle || "자세한 내용 보기";
      Object.assign(detailBtn.style, {
        marginTop: "1rem",
        padding: "0.5rem 1rem",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        fontSize: "14px",
        cursor: "pointer"
      });
      detailBtn.onclick = () => window.open(node.link, "_blank");
      container.appendChild(detailBtn);
    }
  }

  // 🔹 검색창 + 버튼 UI
  const searchBox = document.createElement("div");
  Object.assign(searchBox.style, {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    boxSizing: "border-box",
    padding: "8px",
    background: "white",
    borderTop: "1px solid #ccc",
    zIndex: "9999"
  });
  searchBox.innerHTML = `
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <input type="text" id="search-input" placeholder="검색어를 입력하세요..." style="flex: 1; padding: 8px; font-size: 14px; border: 1px solid #ddd; border-radius: 4px;">
      <button id="search-btn" style="padding: 8px 12px; font-size: 14px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">🔍</button>
    </div>
    <div id="search-results" style="margin-top: 8px;"></div>
  `;
  document.body.appendChild(searchBox);

  // 🔹 문의하기 팝업 UI
  const feedbackPopup = document.createElement("div");
  Object.assign(feedbackPopup.style, {
    position: "fixed",
    top: "100px",
    left: "20px",
    width: "300px",
    backgroundColor: "#f8f9fa",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    zIndex: "9999",
    display: "none"
  });
  feedbackPopup.innerHTML = `
    <div style="font-weight:bold; margin-bottom:8px;">VisualPro bot 문의사항을 남겨주세요.</div>
    <textarea id="feedback-text" rows="4" style="width:100%; padding:6px; font-size:14px; resize: none;"></textarea>
    <p style="font-size: 12px; color: #888; margin-top: 6px;">Enter 키로 전송됩니다.<br/>문의하기 기능은 구현중입니다. 직접 문의해주세요.</p>
  `;
  document.body.appendChild(feedbackPopup);

  document.addEventListener("keydown", e => {
    const feedbackInput = document.getElementById("feedback-text");
    if (feedbackInput && document.activeElement === feedbackInput && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const message = feedbackInput.value.trim();
      if (message) {
        alert("✅ 전송됨: " + message);
        feedbackInput.value = "";
        feedbackPopup.style.display = "none";
      }
    }
  });

  // 🔹 실시간 검색
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  function highlightText(text, keyword) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);
  }

  function renderSearchResults(results) {
    container.innerHTML = "<h3 style='font-size: 17px;'>검색 결과</h3>";
    renderHeader({ showBack: true, backHandler: () => renderCategories() });
    results.slice(0, 10).forEach(({ item, highlighted }) => {
      const li = document.createElement("div");
      li.innerHTML = highlighted;
      Object.assign(li.style, {
        cursor: "pointer",
        marginBottom: "0.5rem",
        padding: "0.4rem",
        fontSize: "16px"
      });
      li.onclick = () => {
        historyStack.push(() => renderSearchResults(results));
        renderQA(item);
      };
      container.appendChild(li);
    });
  }

  function performSearch() {
    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword) {
      renderCategories();
      return;
    }

    const keywords = keyword.split(/\s+/);
    let results = [];

    chatbotData.forEach(cat => {
      cat.items.forEach(item => {
        const questionText = item.question || "";
        const answerText = typeof item.answer === "string" ? item.answer : "";
        const combinedText = (questionText + " " + answerText).toLowerCase();

        let score = 0;
        keywords.forEach(word => {
          score += (combinedText.split(word).length - 1);
        });

        if (score > 0) {
          let highlighted = questionText;
          keywords.forEach(word => {
            const regex = new RegExp(`(${word})`, "gi");
            highlighted = highlighted.replace(regex, `<mark>$1</mark>`);
          });

          results.push({ item, score, highlighted });
        }
      });
    });

    results.sort((a, b) => b.score - a.score);
    if (results.length > 0) {
      renderSearchResults(results);
    } else {
      container.innerHTML = "<p style='padding:1rem; font-size:16px;'>검색 결과가 없습니다.</p>";
    }
  }

  //검증검토 버튼
  function renderReviewCheckButton() {
    const reviewBtn = document.createElement("div");
    reviewBtn.textContent = "검증검토";
    Object.assign(reviewBtn.style, {
      position: "absolute",
      top: "2px",
      right: "25px", // X버튼 왼쪽
      backgroundColor: "#FFFFFF",
      color: "black",
      padding: "1px 1px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      zIndex: "10000"
    });
  
    reviewBtn.onclick = () => {
      window.parent.postMessage({ action: "check-review-status" }, "*");
    };
  
    container.appendChild(reviewBtn);
  }

  //문의하기 버튼
  function renderFeedbackButton() {
    const feedbackBtn = document.createElement("div");
    feedbackBtn.textContent = "문의하기";
    Object.assign(feedbackBtn.style, {
      position: "absolute",
      top: "2px",
      left: "5px",
      backgroundColor: "#FFFFFF",
      color: "black",
      padding: "1px 1px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      zIndex: "10000"
    });

    feedbackBtn.onclick = () => {
      feedbackPopup.style.display = feedbackPopup.style.display === "none" ? "block" : "none";
    };

    container.appendChild(feedbackBtn);
  }
  
  // 🔹 초기 실행
  searchInput.addEventListener("input", performSearch);
  searchBtn.addEventListener("click", performSearch);

  renderCategories();
  renderFeedbackButton();
});
