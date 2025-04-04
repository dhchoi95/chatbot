document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  const container = document.createElement("div");
  Object.assign(container.style, {
    fontFamily: "Arial, sans-serif",
    color: "#000000",
    backgroundColor: "#ffffff",
    position: "relative",
    height: "100%",
    padding: "0.5rem",
    boxSizing: "border-box",
    overflowY: "auto"
  });
  app.appendChild(container);

  let currentCategory = null;
  let currentItem = null;

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
        left: "3px",
        top: "3px",
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
      right: "6px",
      top: "6px",
      background: "transparent",
      border: "none",
      fontSize: "12px",
      cursor: "pointer"
    });
    close.onclick = () => {
      window.parent.postMessage({ action: "close-chatbot" }, "*");
    };
    header.appendChild(close);

    container.appendChild(header);
  }

  function renderCategories() {
    container.innerHTML = "<h3 style='font-size: 20px;'>VisualPro bot</h3>";
    renderHeader({ showBack: false });

    chatbotData.forEach(cat => {
      const li = document.createElement("div");
      li.textContent = cat.category;
      li.style.cursor = "pointer";
      li.style.marginBottom = "0.5rem";
      li.style.padding = "0.5rem";
      li.style.fontSize = "18px";
      li.onclick = () => {
        currentCategory = cat;
        renderQuestions(cat);
      };
      container.appendChild(li);
    });
  }

  function renderQuestions(category) {
    container.innerHTML = `<h3 style="font-size: 17px;">${category.category}</h3>`;
    renderHeader({ showBack: true, backHandler: renderCategories });

    category.items.forEach(item => {
      const li = document.createElement("div");
      li.textContent = item.question;
      li.style.cursor = "pointer";
      li.style.marginBottom = "0.5rem";
      li.style.padding = "0.4rem";
      li.style.fontSize = "17px";
      li.onclick = () => {
        currentItem = item;
        renderAnswer(item);
      };
      container.appendChild(li);
    });
  }

  function renderAnswer(item) {
    container.innerHTML = `<h4 style="font-size: 16px;"><b>Q. ${item.question}</b></h4>`;
    renderHeader({ showBack: true, backHandler: () => renderQuestions(currentCategory) });
  
    item.answers.forEach((answerObj, idx) => {
      const answerBlock = document.createElement("div");
      answerBlock.innerHTML = `<p style="font-size: 16px;"><b>A${item.answers.length > 1 ? idx + 1 : ""}.</b> ${answerObj.content}</p>`;
      container.appendChild(answerBlock);
  
      // followUp이 있는 경우 버튼 추가
      if (answerObj.followUp) {
        const followBtn = document.createElement("div");
        followBtn.textContent = answerObj.title + " ▶";
        followBtn.style.margin = "4px 0 10px 0";
        followBtn.style.cursor = "pointer";
        followBtn.onclick = () => renderFollowUp(answerObj.followUp, item);
        container.appendChild(followBtn);
      }
    });
  
    // 자세한 내용 보러가기 버튼 (선택적으로 맨 아래 고정)
    const detailBtn = document.createElement("button");
    detailBtn.textContent = "자세한 내용 보러가기";
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
    detailBtn.onclick = () => {
      window.open("http://192.168.20.79/#/project/447/workitem/15041/list", "_blank");
    };
    container.appendChild(detailBtn);
  }
  
  function renderFollowUp(followUp, parentItem) {
    container.innerHTML = `<h4 style="font-size: 16px;"><b>${followUp.title}</b></h4>`;
    renderHeader({ showBack: true, backHandler: () => renderAnswer(parentItem) });
  
    followUp.items.forEach(sub => {
      const li = document.createElement("div");
      li.textContent = sub.question;
      li.style.cursor = "pointer";
      li.style.marginBottom = "0.5rem";
      li.style.fontSize = "16px";
      li.onclick = () => {
        container.innerHTML = `<h4 style="font-size: 16px;"><b>Q. ${sub.question}</b></h4><p style="font-size: 16px;">A. ${sub.answer}</p>`;
        renderHeader({ showBack: true, backHandler: () => renderFollowUp(followUp, parentItem) });
  
        // 하위 followUp이 또 있다면 재귀 호출
        if (sub.followUp) {
          const btn = document.createElement("button");
          btn.textContent = "자세히 보기 ▶";
          btn.style.marginTop = "0.5rem";
          btn.onclick = () => renderFollowUp(sub.followUp, sub);
          container.appendChild(btn);
        }
      };
      container.appendChild(li);
    });
  }

  renderCategories();
});
