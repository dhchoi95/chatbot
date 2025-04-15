const chatbotData = [
    {
      category: "1. 자주 묻는 질문",
      items: [
        {
          question:"1. 계획서에 일정/인력/산출물/개발도구 등 내용이 프로젝트 계획서와 중복됩니다.",
          answer: `<br/>
            산출물의 일정/인력/산출물/개발도구는 상위 계획서(프로젝트 계획서) 
            또는 WBS 등을 참조한다고 작성하셔도 됩니다.<br/>
            단, 참초로 작성할 때는 정확한 경로를 적거나 참조하는 문서의 링크(Ctrl + K)를 걸어야 합니다.
          `,
          link: "http://192.168.20.79/#/project/431/workitem/25950/list",
          linkTitle: "VP 자주 묻는 질문"
        },
        {
          question:"2. 테스트가 불가능한 항목의 예외처리 방법",
          answer: `<br/>
            APACHE_U의 [HIR-0017]과 같이 테스트가 불가능한 경우 아래의 방법으로 조치해주시면 됩니다.<br/>
            1. 테스트 케이스 작성<br/>
            2. 테스트 케이스 상태값 SKIP 등록<br/>
            3. 테스트 결과서 작성 및 테스트 케이스 연결<br/>
            4. VisualPro > 테스트 결과서 > 'Exceptional Case 추가' 클릭 후 테스트 케이스 및 사유 작성
          `,
          link: "http://192.168.20.79/#/project/431/workitem/25950/list",
          linkTitle: "VP 자주 묻는 질문"
        },
        {
          question:"3. 첨부파일 문서(FMEA, DFA 등)에 대한 검증검토는 VP에서 어떻게 작성하나요?",
          answer: `<br/>
            첨부파일 검증검토는 개별 결함 등록 시 수동으로 등록하시면 됩니다.<br/>
            결함이 너무 많다면 PMO팀에 문의해주세요.
          `,
          link: "http://192.168.20.79/#/project/431/workitem/25950/list",
          linkTitle: "VP 자주 묻는 질문"
        },
        {
          question:"4. 부적합 시정조치 관리대장 결재라인 문의",
          answer: `<br/>
            부적합 및 시정조치 관리대장은 FSM, PMO팀이 작성하고 각 상위관리자에게 결재받는 문서입니다.
            PM은 부적합 시정조치 완료 후 FSM, PMO팀에 합의로 결재 요청 부탁드립니다.<br/>
            자세한 내용은 아래 링크 확인 바랍니다.
          `,
          link: "http://192.168.20.79/#/project/431/workitem/25950/list",
          linkTitle: "VP 자주 묻는 질문"
        },
        {
          question:"5. VP 문서 작성 중 표 넓이를 조절하고 싶어요.",
          answer: `<br/>
            표 내부 클릭 후 생기는 팝업의 4번째 항목을 클릭합니다.<br/>
            활성화된 팝업에서 Dimensions 값 설정으로 조절할 수 있으며,
            일반적으로 width를 100%로 설정합니다.
          `,
          link: "http://192.168.20.79/#/project/431/workitem/25950/list",
          linkTitle: "VP 자주 묻는 질문"
        }
      ]
    },
    {
      category: "2. VP 작성 요령",
      items: [
        {
          question: "1. VP 기본 사용법 및 임포팅 방법",
          answer:`<br/>
            1. 첨부파일은 누적해서 업로드<br/>
            2. 다이어그램은 Draw.io 이용<br/>
            3. 문서 작성 후 버전 등록 필수<br/>
            4. 관련 문서/구분자에 대한 연결 수립<br/>
            5. 문서 내용 삭제는 신중하게<br/>
            6. 테스트 결과서, 체크리스트 등 결과서에 꼭 첨부!<br/>
            <br/>
            
          `,
          detail: `임포팅은 최초 임포팅과 기존 내용 수정을 위한 임포팅으로 구분돼요.<br/>
            각각의 방법은 아래의 링크를 통해 사용자 메뉴얼에서 확인해주세요.`,
          detailTitle: "임포팅 방법",
          link: "http://192.168.20.79/#/project/447/workitem/15041/list",
          linkTitle: "VP 매뉴얼 보기"
        },
        {
          question: "2. WBS 사용법",
          answer:`<br/>
            WBS는 마일스톤에 따라 작성하는 것을 권장하며 3단계 ~ 5단계로 계층적 설계가 가능해요.<br/>
            WBS 최초 작성 시 기본 들을 excel로 잡아 import 하는 것을 권장하며
            계획 공수, 산출물, 계획 시작/종료일, 상태 값, 선/후행 Task를 입력해야 해요.<br/>
            (WBS 임포팅은 최초 임포팅만 가능해요.)<br/>
            <br/>
            진행 중인 업무가 종료됐다면 실제 시작/종료일과 개별 투입 공수를 입력하고 업무 상태를 완료로 바꿔주세요.
            상위 task의 일정은 하위 task의 일정에 따라 자동으로 설정돼요!           
          `,
          link: "http://192.168.20.79/#/project/447/workitem/15041/list",
          linkTitle: "VP 매뉴얼 보기"

        },
        {
          question: "3. 문서 버전 등록, 결재 요청 및 승인 방법",
          answer: `<br/>
            버전 등록 및 변경은 우측 상단 버전 아이콘을 클릭한 뒤
            버전 변경 버튼을 통해 등록할 수 있어요.
            버전을 입력하고 나면 자동으로 결재 요청을 할 수 있어요.<br/>
            수동으로 결재 요청을 하고 싶다면 우측 상단 더보기 버튼 클릭 후
            승인을 눌러 직접 할 수 있어요.<br/>
            <br/>
            결재 승인은 VisualPro 상단 결재함에서 진행할 수 있어요.<br/>
          `,
          link: "http://192.168.20.79/#/project/447/workitem/15041/list",
          linkTitle: "VP 매뉴얼 보기"

        },
        {
          question: "4. 일반문서 작성 방법",
          answer: `<br/>
            로그인 후 좌측 탭에서 원하는 프로젝트로 진입해요.
            <br/>
            상단 '업무' 탭으로 진입하고 작성할 문서를 클릭하면 문서를 작성할 수 있어요.
            문서 작성 방법에 대한 자세한 내용은 메뉴얼을 확인해요. 
          `,
          link: "http://192.168.20.79/#/project/447/workitem/15041/list",
          linkTitle: "VP 매뉴얼 보기"

        },
        {
          question: "5. 검증검토 수행 절차",
          answer: [
            {
              question: "1. 인스펙션",
              answer: `<br/>
                  인스펙션은 사전설명회 - 개별 검증검토 - 인스펙션 회의로 진행돼요.
                  <br/>사전설명회는 산출물 작성자의 판단으로 수행여부를 결정해요.
                  <br/>개별 검증검토 수행 시 검증검토 대상 문서에서 결함 등록을 진행해요.
                  <br/>인스펙션 회의 진행 후 확정된 결함의 정보를 입력하고 결함관리대장에 등록해요.
                  <br/>검증검토 투입 공수 입력하는 것을 잊지마세요!
                  <br/><br/>
                  개별 검토자의 체크리스트를 모두 등록해야 돼요.
                `,
                link: "http://192.168.20.79/#/project/447/workitem/15041/list",
                linkTitle: "VP 매뉴얼 보기"
            },
            {
              question: "2. 워크스루",
              answer: `<br/>
                  워크스루는 사전설명회와 개별 검증검토를 수행하지 않아요.
                  <br/>워크스루 회의를 진행할 때 문서를 다같이 보며 결함을 찾고 결함관리대장에 등록해요.
                  <br/>검증검토 투입 공수 입력하는 것을 잊지마세요!
                  <br/><br/>
                  회의에서 사용한 체크리스트 1건만 등록하면 돼요.
                `,
                link: "http://192.168.20.79/#/project/447/workitem/15041/list",
                linkTitle: "VP 매뉴얼 보기"
            }
          ]
        },
        {
          question: "6. 변경 관리",
          answer: `<br/>
            변경관리대장에 진입하여 '추가' 버튼을 클릭,
            변경 요청 정보를 작성하고 변경 문서를 추가해요.
            <br/><br/>
            변경 요청 검토 후 변경 계획을 작성하고 필요한 경우 CCB 심의를 진행해요.<br/>
            변경 요청이 승인된 산출물은 형상관리대장에서 '잠김여부'가 UNLOCKED으로 변해요.<br/>
            변경 완료 후 변경관리대장 상태 완료로 전환 시 자동으로 문서가 잠깁니다.
          `,
          link: "http://192.168.20.79/#/project/447/workitem/15041/list",
          linkTitle: "VP 매뉴얼 보기"

        },
        {
          question: "7. 기술안전 요구사항 정의 및 분석 결과서",
          answer:`<br/>
            기술안전 요구사항 정의 및 분석 결과서 작성 전 구분자가 정확하게 설정돼 있는지 확인해야 해요.
            우측 상단 더보기 버튼 클릭 후 '업무 설정'으로 들어가면 구분자를 볼 수 있어요.<br/>
            (업무 설정은 권한에 따라 진입이 불가할 수 있어요.)<br/>
            <br/>
            구분자를 확인했다면 본문 헤드라인 좌측에 있는 아이콘을 활용해서 작성해주면 돼요.
            Use case는 표 내용을 직접 수정해서 작성해주세요.
            이때, TSR, TR 등 구분자가 있는 내용은 각 항목의 헤드라인 클릭 후 우측 필드에 값을 입력해주세요.
            필드에 모든 값을 입력했다면 필드 바로 위에 있는 저장 버튼을 누르고 표 데이터 생성을 해주세요.
            (표 데이터 내용만 바꾸면 데이터가 저장되지 않습니다!!!)<br/>
            <br/>
          `,
          link: "http://192.168.20.79/#/project/447/workitem/15041/list",
          linkTitle: "VP 매뉴얼 보기"
        },
        {
          question: "8. 시스템/HW/SW 요구사항 명세서",
          answer:`<br/>
            시스템/HW/SW 요구사항 작성 전 구분자가 정확하게 설정돼 있는지 확인해야 해요.
            우측 상단 '더보기' 버튼 클릭 후 '업무 설정'으로 들어가면 구분자를 볼 수 있어요.<br/>
            (업무 설정은 권한에 따라 진입이 불가할 수 있어요.)<br/>
            <br/>
            구분자를 확인했다면 본문 헤드라인 좌측에 있는 아이콘을 활용해서 작성해주면 돼요.
            이때, TSR, TR, HR, SR 등 구분자가 있는 내용은 각 항목의 헤드라인 클릭 후 우측 필드에 값을 입력해주세요.
            필드에 모든 값을 입력했다면 필드 바로 위에 있는 저장 버튼을 누르고 표 데이터 생성을 해주세요.
            (표 데이터 내용만 바꾸면 데이터가 저장되지 않습니다!!!)<br/>
            <br/>
            추가적으로 시스템 요구사항 명세서서 TR, TSR 작성 시 우측 상단 '더보기' 메뉴의 SEooC 불러오기를 활용할 수 있습니다.
          `,
          link: "http://192.168.20.79/#/project/447/workitem/15041/list",
          linkTitle: "VP 매뉴얼 보기"
        },
        {
          question: "9. 시스템/HW/SW 설계서",
          answer:`<br/>
            시스템/HW/SW 설계서 작성 전 구분자가 정확하게 설정돼 있는지 확인해야 해요.
            우측 상단 '더보기' 버튼 클릭 후 '업무 설정'으로 들어가면 구분자를 볼 수 있어요.<br/>
            (업무 설정은 권한에 따라 진입이 불가할 수 있어요.)<br/>
            <br/>
            구분자를 확인했다면 본문 헤드라인 좌측에 있는 아이콘을 활용해서 작성해주면 돼요.
            이때, PDE, HDP, SM 등 구분자가 있는 내용은 각 항목의 헤드라인 클릭 후 우측 필드에 값을 입력해주세요.
            필드에 모든 값을 입력했다면 필드 바로 위에 있는 저장 버튼을 누르고 표 데이터 생성을 해주세요.
            (표 데이터 내용만 바꾸면 데이터가 저장되지 않습니다!!!)
          `,
          link: "http://192.168.20.79/#/project/447/workitem/15041/list",
          linkTitle: "VP 매뉴얼 보기"
        },
        {
          question: "10. HW IP 테스트 케이스 및 결과서",
          answer:`<br/>
            작성 전 구분자가 정확하게 설정돼 있는지 확인해주세요.<br/>
            <br/>
            HW IP 테스트 케이스는 기본 서식을 Export하여 작성해야 해요.<br/>
            Import 시 ID 유효성 검사에서 HW 설계서 / Part ID 선택 시 자동으로 연결관계가 수립돼요.<br/>
            <br/>
            테스트 결과서 작성 시 기존에 작성한 HW IP 테스트 케이스를 불러와요.<br/>
            이때, 현 시점에서 테스트가 불가능한 항목이 있다면 Exceptional case를 통해 해결할 수 있어요.<br/>
            마지막으로 Part(IP)별 결과 가져오기 기능을 사용해요.
          `,
          link: "http://192.168.20.79/#/project/447/workitem/15041/list",
          linkTitle: "VP 매뉴얼 보기"

        },
        {
          question: "11. SW 단위 테스트 케이스",
          answer:`<br/>
            작성 전 구분자가 정확하게 설정돼 있는지 확인해주세요.<br/>
            SW 단위 테스트 케이스는 기본 서식을 Export하여 작성해야 해요.<br/>
            Import 이후 필드 데이터 자동완성에서 해당하는 SW 상세 설계서를 선택해요.<br/>
            Function ID와 Name 자동완성이 적절하게 됐는지 확인해주세요.
            <br/><br/>
            테스트 케이스 수정을 위한 임포팅은 아래의 VP 메뉴얼을 참고해주세요.
          `,
          link: "http://192.168.20.79/#/project/447/workitem/15041/list",
          linkTitle: "VP 매뉴얼 보기"

        }
      ]
    },
    {
      category: "3. 다른 프로젝트 보기",
      items: [
        {
          question:"APACHE_U",
          //answer: "",
          link: "http://192.168.20.79/#/project/329/workitem/dashboard",
          linkTitle: "APACHE_U 프로젝트"
        },
        {
          question:"APACHE_U2",
          //answer: "",
          link: "http://192.168.20.79/#/project/485/workitem/dashboard",
          linkTitle: "APACHE_U2 프로젝트"
        },
        {
          question:"AURORA1_TX",
          //answer: "",
          link: "http://192.168.20.79/#/project/450/workitem/dashboard",
          linkTitle: "AURORA1_TX 프로젝트"
        },
        {
          question:"AURORA1_RX",
          //answer: "",
          link: "http://192.168.20.79/#/project/484/workitem/dashboard",
          linkTitle: "AURORA1_RX 프로젝트"
        },
        {
          question:"APACHE6",
          //answer: "",
          link: "http://192.168.20.79/#/project/366/workitem/dashboard",
          linkTitle: "APACHE6 프로젝트"
        }
      ]
    }
  ];
  