# Safari Tab Compress (사파리 탭 컴프레스)

**Safari Tab Compress**는 브라우저 메모리를 최적화하고 지저분한 탭 레이아웃을 깔끔하게 정리해 주는 프리미엄 macOS Safari 전용 웹 확장 프로그램(Web Extension)입니다. Tab Wrangler에서 영감을 받아 구현되었으며, 오랫동안 사용하지 않은 비활성 탭을 자동으로 종료하고, 종료된 탭들은 "Corral(보관함)" 아카이브에 안전하게 보관하여 언제든 클릭 한 번으로 다시 열 수 있도록 지원합니다.

Safari의 엄격한 백그라운드 실행 환경에서 최고의 성능과 절대적인 안정성을 보장하기 위해, 어떠한 외부 라이브러리도 사용하지 않는 **Zero-Dependency** 기반의 순수 Manifest V3 표준 API 및 Vanilla CSS HSL 변수, Isomorphic Javascript로 처음부터 자체 설계되었습니다.

---

## 🔒 철저한 개인정보 보호 및 보안 (Security & Privacy First)

- **개인정보 보호 브라우징 완벽 격리 (Incognito Isolation)**: 개인정보 보호 모드(Private Browsing)에서 작동 중인 탭들은 자동 정리 대상에서 완전히 배제됩니다. 어떠한 경우에도 개인정보 보호 탭의 데이터(URL, 제목 등)는 로컬 저장소에 절대 기록되거나 저장되지 않으며, 확장 프로그램의 실시간 목록에서도 완벽히 차단 및 격리되어 개인 검색 기록이 유출되는 것을 원천 차단합니다.
- **Zero-Dependency & 외부 트래킹 차단**: 유닛 테스트를 위한 Jest 외에 프로덕션 코드에는 단 하나의 외부 라이브러리도 사용하지 않아 공급망 취약점 문제를 사전에 방지합니다. 모든 탭 데이터는 외부 서버 전송 없이 사용자의 macOS 샌드박스 보안 로컬 저장소(`chrome.storage.local`) 안에서만 영구 격리됩니다.

---

## 🌟 주요 핵심 기능

1. **비활성 탭 자동 정리**: 오랫동안 접근하지 않은 탭들을 감시하여 사용자가 설정한 대기 시간(기본값 30분)이 지나면 자동으로 안전하게 닫습니다.
2. **Safari 절전 모드 우회 엔진**: Safari의 백그라운드 서비스 워커가 잠자기(Sleep) 상태로 전환되는 제약을 극복하기 위해 `chrome.alarms` API(1분 주기)를 도입하여 백그라운드 엔진을 안정적으로 주기적으로 활성화합니다.
3. **닫힌 탭 보관함 (Corral)**: 종료된 탭의 제목, URL, 닫힌 시각을 최대 100개까지 배열로 안전하게 백업합니다. 실시간 텍스트 검색을 통해 빠르게 검색하고 원클릭으로 탭을 복원할 수 있습니다.
4. **영구적인 탭 잠금 (Lock Tabs persistence)**: 현재 켜져 있는 탭 리스트에서 탭을 수동으로 잠글(Lock) 수 있습니다. URL 패턴을 기반으로 잠금이 동작하여 탭이 새로고침되거나 브라우저를 재시작해도 잠금 상태가 안정적으로 유지됩니다.
5. **도메인 제외 목록 (Whitelist)**: `github.com` 등 특정 도메인을 화이트리스트에 추가해 두면 해당 도메인에 속한 모든 탭은 자동 정리 로직에서 영구적으로 제외되어 안전하게 보호됩니다.
6. **프리미엄 HSL 테마 및 UI**: macOS 네이티브 스타일과 고급 다크 모드 감성에 부합하는 Glassmorphic 반투명 효과, HSL CSS 변수 기반의 부드러운 스케일 애니메이션 및 세련된 스크롤바가 탑재된 3-Tab 팝업창을 제공합니다.

---

## 📁 디렉토리 및 파일 구조

```
safari-tab-compress/
├── manifest.json             # Manifest V3 확장 프로그램 설정 규격
├── background.js             # 1분 주기 알람 및 탭 상태 감시 백그라운드 엔진
├── popup/
│   ├── popup.html            # Popover 3-Tab 사용자 레이아웃 마크업
│   ├── popup.css             # Glassmorphism 테마 기반 전용 스타일시트
│   └── popup.js              # 설정 제어 및 보관함 연동 팝업 컨트롤러
├── src/
│   └── tab-filter.js         # Isomorphic 순수 탭 필터링 및 예외처리 유틸리티
├── tests/
│   └── tab-filter.test.js    # 8가지 핵심 예외처리를 검증하는 Jest 테스트 스위트
└── package.json              # Jest TDD 환경 패키지 명세
```

---

## 🛠️ 개발자 TDD 유닛 테스트 가이드

이 프로젝트는 SOLID 원칙과 철저한 **TDD(테스트 주도 개발)**를 기반으로 작성되었습니다. 브라우저 런타임에 올리기 전 Node.js 환경에서 필터 핵심 로직을 완벽하게 테스트할 수 있습니다.

### 유닛 테스트 실행 방법
1. 테스트 관련 의존성 설치:
   ```bash
   npm install
   ```
2. Jest 유닛 테스트 스위트 실행:
   ```bash
   npm test
   ```

개인정보 격리 및 화이트리스트 매칭을 검증하는 8개의 테스트 케이스가 모두 **PASS**되어야 안전한 빌드로 간주됩니다.

---

## 🚀 macOS Safari 확장 프로그램 컴파일 & 빌드 가이드

Apple의 보안 정책상 macOS Safari용 확장 프로그램은 웹 확장 코드 단독 로드가 불가능하며, macOS Xcode 앱 프로젝트로 감싸서(Wrapping) 빌드해야 합니다. 아래 단계에 따라 터미널 명령어 한 줄로 즉시 컴파일하고 빌드할 수 있습니다.

### 1단계: Xcode 및 명령줄 도구 준비
1. Mac App Store에서 **Xcode**가 설치되어 있는지 확인합니다.
2. 터미널을 실행한 뒤 Xcode 명령줄 도구를 설치합니다 (이미 설치된 경우 자동으로 넘어갑니다):
   ```bash
   xcode-select --install
   ```

### 2단계: Web Extension 변환 도구를 통해 Xcode 프로젝트 빌드
Apple이 제공하는 내장 변환 도구(`safari-web-extension-converter`)를 사용하여 현재 웹 확장 프로그램 디렉토리를 macOS 네이티브 앱 프로젝트로 감싸줍니다:
```bash
xcrun safari-web-extension-converter /Users/hunchulchoi/projects/workspace/myside/safari-tab-compress
```
- 실행 중 "출력 언어(Language)로 Swift를 사용할 것인가?" 등의 프롬프트가 나오면 기본값(Swift/macOS)을 선택하고 계속 진행합니다.
- 변환 및 초기 프로젝트 생성 작업이 완료되면 자동으로 생성된 Xcode 프로젝트(`.xcodeproj`)가 화면에 실행됩니다.

### 3단계: Xcode에서 컴파일 및 빌드
1. 열린 Xcode 프로젝트 화면에서 좌측 상단 스키마 설정(Target)이 **`Safari Tab Compress (macOS)`** 또는 **`macOS App`**으로 설정되어 있는지 확인합니다.
2. 단축키 `Cmd + R`을 누르거나 상단 좌측의 **실행(Run / Play 아이콘)** 버튼을 클릭하여 컴파일 빌드합니다.
3. 빌드가 완료되면 macOS 호스팅 애플리케이션 창이 화면에 구동됩니다. 이 호스팅 앱이 구동되는 시점에 Safari 확장 프로그램 목록에 플러그인이 자동으로 연동 및 샌드박스 등록됩니다.

### 4단계: Safari 브라우저에서 활성화 및 로드
1. **Safari** 브라우저를 실행합니다.
2. 상단 메뉴에서 **[Safari] -> [설정(Settings / 환경설정)] -> [고급(Advanced)]** 탭으로 이동합니다.
3. 맨 아래에 있는 **"메뉴 막대에서 개발자용 메뉴 보기(Show Develop menu in menu bar)"** 옵션을 체크하여 켭니다.
4. 새로 활성화된 상단 메뉴바의 **[개발자용(Develop)]** 메뉴를 클릭하고, **"서명되지 않은 확장 프로그램 허용(Allow Unsigned Extensions)"** 옵션을 체크합니다.
   - *주의: 이 안전 옵션은 Safari가 완전히 꺼지면 보안상 자동으로 비활성화되므로, 개발 모드로 테스트 시 매번 체크를 확인해 주는 것이 좋습니다.*
5. 다시 **[Safari 설정] -> [확장 프로그램(Extensions)]** 탭으로 이동하여 목록에 추가된 **`Safari Tab Compress`**의 체크박스를 켜주면 Safari 툴바에 ⏱️ 아이콘이 추가됩니다!
