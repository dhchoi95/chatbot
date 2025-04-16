document.addEventListener("DOMContentLoaded", () => {
  // ✅ 주요 DOM 요소 초기화
  const chatWindow = document.getElementById("chat-window");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  const feedbackBtn = document.getElementById("feedback-btn");
  const backBtn = document.getElementById("back-btn");
  const reviewBtn = document.getElementById("review-btn");
  const closeBtn = document.getElementById("close-btn");
  const feedbackPopup = document.getElementById("feedback-popup");

  // ✅ 뒤로가기 이력 저장용 스택
  const historyStack = [];

  // ✅ 사용자 이름 기본값 (콘텐츠에서 받아올 때 갱신됨)
  let username = "사용자";

  // ✅ 콘텐츠 영역(content.js)에서 사용자 이름 수신
  window.addEventListener("message", (event) => {
    if (event.data.action === "send-username") {
      username = event.data.username;
      clearChat();  // 이름을 받은 후 챗봇 초기화
    }
  });

  // ✅ 채팅창 맨 아래로 스크롤
  const scrollToBottom = () => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  };

  // ✅ 채팅 전체 초기화 후 인사말 표시
  const clearChat = () => {
    chatWindow.innerHTML = "";
    showGreeting();
  };

  // ✅ 메시지를 출력하는 함수 (로딩 후 표시)
  const showMessage = (message, isUser = false) => {
    return new Promise(resolve => {
      if (isUser) {
        // 사용자 말풍선
        const userBubble = document.createElement("div");
        userBubble.className = "user-bubble";
        userBubble.innerHTML = message;
        chatWindow.appendChild(userBubble);
        scrollToBottom();
        return resolve();
      }

      // 챗봇 로딩 말풍선 (... 표시)
      const loadingBubble = document.createElement("div");
      loadingBubble.className = "bot-bubble loading";
      loadingBubble.textContent = "...";
      chatWindow.appendChild(loadingBubble);
      scrollToBottom();

      // 0.8초 후 실제 챗봇 메시지 출력
      setTimeout(() => {
        loadingBubble.remove();

        const finalBubble = document.createElement("div");
        finalBubble.className = "bot-bubble";
        finalBubble.innerHTML = message.replace(/\n/g, "<br/>");
        chatWindow.appendChild(finalBubble);
        scrollToBottom();
        resolve();
      }, 800);
    });
  };

  // ✅ 버튼 그룹 출력 함수
  const showButtons = (options, callback, isFinal = false) => {
    return new Promise(resolve => {
      const wrapper = document.createElement("div");
      wrapper.className = "bot-bubble";
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.gap = "6px";
  
      options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.className = "option-btn";
        btn.onclick = () => {
          callback(opt);
          resolve();
        };
        wrapper.appendChild(btn);
      });
  
      if (!isFinal) {
        const fallbackBtn = document.createElement("button");
        fallbackBtn.textContent = lang.labels.fallback;
        fallbackBtn.className = "option-btn";
        fallbackBtn.onclick = () => {
          clearChat();
          resolve();
        };
        wrapper.appendChild(fallbackBtn);
      }
  
      chatWindow.appendChild(wrapper);
      scrollToBottom();
    });
  };

  // ✅ 인사말 메시지 + 카테고리 버튼 표시
  const showGreeting = async () => {
    const greetingFormat = lang.greetingFormat;
    const randomFollowup = lang.greetingMessages[Math.floor(Math.random() * lang.greetingMessages.length)];
    const greeting = greetingFormat.replace("{username}", username);
    await showMessage(`${greeting} ${randomFollowup}`);

    const categories = chatbotData.map(cat => cat.category);
    await showButtons(categories, (selectedCategory) => {
      const cat = chatbotData.find(c => c.category === selectedCategory);
      if (cat) {
        showMessage(selectedCategory, true);
        historyStack.push(() => showGreeting());
        showQuestions(cat.items);
      }
    }, true); // 첫 화면에는 fallback 제외
  };

  // ✅ 질문 리스트 표시
  const showQuestions = async(items) => {
    const questions = items.map(i => i.question);
    await showMessage(lang.labels.subQuestionPrompt);
    await showButtons(questions, (selectedQ) => {
      const item = items.find(i => i.question === selectedQ);
      if (item) showUserAndBot(item.question, item);
    });
  };

  // ✅ 질문과 응답 흐름 처리
  const showUserAndBot = async (question, item) => {
    await showMessage(question, true);  // 사용자 입력 출력
    await handleAnswer(item);          // 챗봇 응답 처리
  };

  // ✅ 응답 처리: 일반 텍스트 또는 하위 질문
  const handleAnswer = async (item) => {
    if (typeof item.answer === "string") {
      await showMessage(`<b>A.</b> ${item.answer}`);
      if (item.link) showLink(item.link, item.linkTitle);
    } else if (Array.isArray(item.answer)) {
      await showMessage(lang.labels.subQuestionPrompt);
      await showButtons(item.answer.map(sub => sub.question), async (selectedQ) => {
        const sub = item.answer.find(a => a.question === selectedQ);
        if (sub) await showUserAndBot(sub.question, sub);
      }, false);
    }
  };

  // ✅ 링크 버튼 생성
  const showLink = (url, title = lang.labels.defaultLinkTitle) => {
    const linkBtn = document.createElement("button");
    linkBtn.textContent = title;
    linkBtn.className = "link-btn";
    linkBtn.onclick = () => window.open(url, "_blank");
    chatWindow.appendChild(linkBtn);
    scrollToBottom();
  };

  // ✅ 유사 질문 탐색 (하위 질문 포함)
  const findSimilarQuestions = (input) => {
    const results = [];

    chatbotData.forEach(cat => {
      cat.items.forEach(item => {
        // 최상위 질문/답변 점수 계산
        const combined = item.question + " " + (typeof item.answer === "string" ? item.answer : "");
        const score = inputScore(input, combined);
        results.push({ item, score });

        // 하위 answer가 배열이면 그 안도 유사도 비교
        if (Array.isArray(item.answer)) {
          item.answer.forEach(sub => {
            const subCombined = sub.question + " " + (typeof sub.answer === "string" ? sub.answer : "");
            const subScore = inputScore(input, subCombined);

            // 하위 질문도 하나의 항목처럼 다룬다
            results.push({ item: sub, score: subScore });
          });
        }
      });
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 3).map(r => r.item);
  };

  // ✅ 유사도 점수 계산 (문자열 포함 여부 + 유사 키워드 수)
  const inputScore = (input, text) => {
    const normalizedInput = input.toLowerCase();
    const normalizedText = text.toLowerCase();
    return normalizedText.includes(normalizedInput) ? 100 : similarity(normalizedInput, normalizedText);
  };

  // ✅ 단순 키워드 일치 수를 기반으로 유사도 측정
  const similarity = (a, b) => {
    let match = 0;
    a.split(" ").forEach(word => {
      if (b.includes(word)) match++;
    });
    return match;
  };

  // ✅ 사용자 직접 입력 시 처리 흐름
  const handleFreeInput = async (text) => {
    await showMessage(text, true);  // 사용자 입력 출력
    const suggestions = findSimilarQuestions(text);
    if (suggestions.length === 0) {
      await showMessage(lang.labels.noResult);
      return;
    }

    await showMessage(lang.labels.suggestionPrompt);
    await showButtons(suggestions.map(s => s.question), (selected) => {
      const item = suggestions.find(s => s.question === selected);
      if (item) showUserAndBot(item.question, item);
    });
  };

  // ✅ 전송 버튼 클릭 시 입력 처리
  sendBtn.onclick = () => {
    const value = input.value.trim();
    if (value) {
      handleFreeInput(value);
      input.value = "";
    }
  };

  // ✅ Enter 키 입력 시 전송
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  // ✅ 상단 버튼 기능 설정
  feedbackBtn.onclick = () => {
    feedbackPopup.style.display = feedbackPopup.style.display === "none" ? "block" : "none";
  };
  backBtn.onclick = () => {
    clearChat(); // 초기화
  };
  reviewBtn.onclick = () => {
    window.parent.postMessage({ action: "check-review-status" }, "*");
  };
  closeBtn.onclick = () => {
    window.parent.postMessage({ action: "close-chatbot" }, "*");
  };


  // 문의하기 기능
  document.getElementById("submit-feedback-btn").addEventListener("click", async () => {
    const type = document.querySelector('input[name="feedback-type"]:checked').value;
    //const content = document.getElementById("feedback-text").value.trim();
  
    //if (!content) return alert("내용을 입력해주세요.");
  
    //const confirmSend = confirm("제출하시겠습니까?");
    const confirmSend = confirm("이동 하시겠습니까?");
    if (!confirmSend) return;
  
    const targetUrl = type === "bug"
      ? "http://192.168.20.79/#/project/431/workitem/12763/list"
      : "http://192.168.20.79/#/project/431/workitem/20615/list";
  
    // 새 탭으로 VisualPro 문서 열기
    const win = window.open(targetUrl, "_blank");
  
    console.log("ddd");
    // 메세지 전달 방식 사용 필요
    win.addEventListener("load", () => {
      win.postMessage({ action: "inject-feedback", content, type }, "*");
    });
  
    // 팝업 닫기 및 내용 초기화
    document.getElementById("feedback-popup").style.display = "none";
    document.getElementById("feedback-text").value = "";
  });
  
});
