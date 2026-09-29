export interface GuideArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  relatedToolId?: string;
  relatedToolName?: string;
  relatedToolPath?: string;
  keywords: string[];
  contentHtml: string;
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'webp-vs-jpg-png-comparison',
    title: 'WebP vs JPG vs PNG 완벽 비교: 내 웹사이트 속도를 높이는 최적의 포맷은?',
    excerpt: '차세대 이미지 포맷 WebP의 압축 효율과 브라우저 지원 현황, 구글 Core Web Vitals(LCP) 점수를 극대화하기 위한 포맷 선택 가이드를 상세히 분석합니다.',
    category: '포맷 분석 & 최적화',
    date: '2026-09-20',
    readTime: '6분 읽기',
    author: '이미지 테크 에디터',
    relatedToolId: 'jpg-to-webp',
    relatedToolName: 'JPG → WebP 변환기 바로가기',
    relatedToolPath: '/jpg-to-webp',
    keywords: ['WebP', 'JPG', 'PNG', '이미지 포맷 비교', '웹 속도 최적화', 'SEO', 'Core Web Vitals'],
    contentHtml: `
      <h2>1. 웹 환경에서 이미지 최적화가 필수적인 이유</h2>
      <p>
        현대 웹사이트에서 전체 페이지 용량의 <strong>60% 이상</strong>을 차지하는 요소는 바로 이미지 에셋입니다.
        구글(Google)은 검색 순위 평가 지표인 <strong>Core Web Vitals(LCP: Largest Contentful Paint)</strong>에 웹페이지 로딩 속도를 매우 중요한 가중치로 반영하고 있습니다.
        고해상도 원본 이미지를 그대로 웹에 게시하면 사용자 이탈률이 급증하고 모바일 데이터 소비가 가중됩니다.
      </p>

      <h2>2. JPG, PNG, WebP 포맷별 핵심 특징 비교</h2>
      <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left border-collapse border border-slate-200">
          <thead class="bg-slate-100 text-slate-700 font-bold">
            <tr>
              <th class="p-3 border border-slate-200">포맷</th>
              <th class="p-3 border border-slate-200">압축 방식</th>
              <th class="p-3 border border-slate-200">투명 배경(Alpha)</th>
              <th class="p-3 border border-slate-200">평균 용량 절감</th>
              <th class="p-3 border border-slate-200">추천 용도</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr>
              <td class="p-3 font-semibold text-blue-600">JPG (JPEG)</td>
              <td class="p-3">손실 압축</td>
              <td class="p-3 text-red-500">지원 안 함</td>
              <td class="p-3">기준 (100%)</td>
              <td class="p-3">풍경 사진, 복잡한 인물 촬영본</td>
            </tr>
            <tr>
              <td class="p-3 font-semibold text-indigo-600">PNG</td>
              <td class="p-3">무손실 압축</td>
              <td class="p-3 text-emerald-600 font-bold">지원 (완벽 보존)</td>
              <td class="p-3">JPG 대비 2~4배 큼</td>
              <td class="p-3">로고, 텍스트 배너, 아이콘</td>
            </tr>
            <tr class="bg-blue-50/50">
              <td class="p-3 font-bold text-emerald-700">WebP</td>
              <td class="p-3">손실 및 무손실 모두 지원</td>
              <td class="p-3 text-emerald-600 font-bold">지원 (손실/무손실 둘 다)</td>
              <td class="p-3 font-bold text-emerald-700">JPG 대비 25~34% 절감</td>
              <td class="p-3 font-semibold">모든 웹 에셋, 이커머스 상품 사진</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>3. WebP 포맷의 혁신: 구글이 WebP를 강력 권장하는 이유</h2>
      <p>
        WebP는 구글이 개발한 오픈소스 이미지 포맷으로, <strong>VP8 비디오 코덱의 화면 내 예측(Intra-frame prediction) 기술</strong>을 이미지 압축에 응용했습니다.
        인접한 픽셀 블록 간의 색상 차이를 예측하여 차이값만 저장하기 때문에, 시각적으로는 원본과 동일한 품질을 유지하면서도 파일 크기를 획기적으로 줄여줍니다.
      </p>
      <ul>
        <li><strong>무손실 압축 시:</strong> 동일 품질의 PNG 파일 대비 평균 <strong>26% 작음</strong></li>
        <li><strong>손실 압축 시:</strong> 동일한 SSIM 품질 지수의 JPEG 파일 대비 평균 <strong>25% ~ 34% 작음</strong></li>
        <li><strong>알파 채널(투명도) 지원:</strong> JPEG에는 없는 투명 배경을 손실 압축에서도 지원하므로, 투명 누끼 이미지 용량을 60~70%까지 절감 가능</li>
      </ul>

      <h2>4. 실전 가이드: 언제 어떤 포맷을 선택해야 할까?</h2>
      <p>
        실무에서 웹사이트나 블로그를 운영할 때는 다음의 단순 명료한 룰을 적용해 보세요:
      </p>
      <ol>
        <li><strong>웹사이트, 쇼핑몰, 블로그 업로드용:</strong> 무조건 <strong>WebP</strong> 변환을 기본값으로 추천합니다. 웹 브라우저(Chrome, Safari, Edge, Firefox) 지원율이 현재 97%를 초과합니다.</li>
        <li><strong>공공기관, 관공서, 은행 제출 서류:</strong> 오래된 전산망이나 인쇄 출력 시스템의 경우 WebP를 인식하지 못할 수 있으므로 표준 <strong>JPG</strong>를 사용하는 것이 안전합니다.</li>
        <li><strong>인쇄용 디자인 파일 및 원본 보관:</strong> 무손실 <strong>PNG</strong> 또는 고해상도 TIFF 형식이 유리합니다.</li>
      </ol>

      <h2>5. 브라우저에서 서버 업로드 없이 WebP 변환하는 방법</h2>
      <p>
        저희 <strong>이미지 매직(Image Magic)</strong>은 파일을 외부 서버로 전송하지 않고 사용자의 컴퓨터/스마트폰 브라우저 내 HTML5 Canvas 및 WebAssembly 엔진을 사용하여 초고속으로 WebP 변환을 처리합니다.
        민감한 개인 사진이나 비즈니스 자료도 유출 걱정 없이 안전하게 변환할 수 있습니다.
      </p>
    `
  },
  {
    slug: 'reduce-image-size-under-1mb',
    title: '화질 손실 없이 이미지 용량 80% 줄이기: 이력서·공공기관 제출용 500KB 맞추기',
    excerpt: '고화질을 유지하면서 파일 용량만 획기적으로 줄이는 최신 브라우저 압축 기술과 리사이징 노하우를 알아봅니다.',
    category: '용량 압축 노하우',
    date: '2026-09-22',
    readTime: '5분 읽기',
    author: '이미지 테크 에디터',
    relatedToolId: 'compress',
    relatedToolName: '스마트 이미지 압축기 바로가기',
    relatedToolPath: '/compress-image',
    keywords: ['이미지 압축', '사진 용량 줄이기', '500KB 줄이기', '이력서 사진', '공공기관 제출용', '화질 유지'],
    contentHtml: `
      <h2>1. 왜 채용 사이트와 공공기관은 사진 용량을 500KB~1MB로 제한할까?</h2>
      <p>
        정부24, 국세청 홈택스, 대기업 채용 사이트 등 공공 포털에 사진을 등록할 때 흔히 <em>"파일 용량이 500KB(또는 1MB)를 초과할 수 없습니다"</em>라는 오류 메시지를 마주하게 됩니다.
        수십만 명의 사용자가 동시에 서류를 제출하는 시스템에서는 대용량 이미지가 서버 스토리지와 대역폭을 마비시킬 수 있기 때문에 철저한 파일 용량 제한을 두고 있습니다.
      </p>

      <h2>2. 일반적인 실수의 원인: 무작정 캡처하거나 크기만 줄이기</h2>
      <p>
        많은 분들이 용량을 줄이기 위해 스마트폰 화면에서 사진을 화면 캡처(스크린샷)하거나 그림판에서 임의로 줄이곤 합니다.
        하지만 이러한 방식은 <strong>텍스트가 번지거나 얼굴 윤곽선이 심하게 흐려지는 치명적인 화질 저하</strong>를 유발합니다.
        올바른 압축은 픽셀 해상도와 압축 퀄리티(Quality)를 정밀하게 균형 맞추는 것입니다.
      </p>

      <h2>3. '골디락스 압축 퀄리티(Quality 80%)'의 비밀</h2>
      <p>
        디지털 이미지 처리 공학에서는 흔히 <strong>"80% 압축의 법칙"</strong>이 통용됩니다.
      </p>
      <ul>
        <li><strong>압축률 100%:</strong> 파일 용량이 매우 크며, 사람의 눈으로 구별할 수 없는 불필요한 미세 고주파 데이터까지 모두 보존합니다.</li>
        <li><strong>압축률 80~85%:</strong> 인간의 시신경(망막)으로는 원본과 차이를 거의 식별할 수 없지만, 파일 용량은 <strong>60%~80% 이상 급격히 감소</strong>합니다.</li>
        <li><strong>압축률 60% 이하:</strong> 그라데이션 영역에 계단 현상(Banding)이나 모자이크 블록(Artifacts)이 육안으로 관찰되기 시작합니다.</li>
      </ul>

      <h2>4. 500KB 이하로 최적화하는 3단계 실천 공식</h2>
      <ol>
        <li><strong>적정 해상도 리사이즈:</strong> 4000x3000 픽셀의 원본 사진은 스마트폰/모니터용으로 지나치게 큽니다. 가로 폭을 <strong>1600px ~ 1920px(FHD)</strong> 수준으로 리사이즈하세요.</li>
        <li><strong>품질 80% 적용:</strong> 스마트 압축 도구에서 퀄리티 슬라이더를 80% 내외로 설정하면 5MB짜리 원본이 단숨에 300~400KB로 줄어듭니다.</li>
        <li><strong>불필요한 메타데이터 제거:</strong> 카메라 센서 정보, GPS 위치 등의 메타데이터를 삭제하는 것만으로도 파일 크기에서 추가 20~50KB를 덜어낼 수 있습니다.</li>
      </ol>

      <h2>5. 보안 걱정 없는 브라우저 단독 압축</h2>
      <p>
        주민등록증 사본, 운전면허증, 가족관계증명서, 입사지원 증명사진 같은 개인정보 민감 문서는 서버 업로드형 사이트에 올릴 경우 유출 위험이 있습니다.
        <strong>이미지 매직(Image Magic)</strong>은 브라우저 내부에서만 연산되므로 100% 안전하게 규격 용량을 맞출 수 있습니다.
      </p>
    `
  },
  {
    slug: 'remove-exif-metadata-privacy',
    title: '스마트폰 사진 속 GPS 위치와 카메라 정보, 인터넷 업로드 전 반드시 삭제해야 하는 이유',
    excerpt: '사진 한 장에 담긴 촬영 위치(위도/경도), 집 주소, 스마트폰 기종 등 EXIF 메타데이터의 위험성과 간편 삭제 방법을 알아봅니다.',
    category: '보안 & 개인정보 보호',
    date: '2026-09-24',
    readTime: '5분 읽기',
    author: '정보보안 칼럼니스트',
    relatedToolId: 'compress',
    relatedToolName: 'EXIF 자동 삭제 압축기 바로가기',
    relatedToolPath: '/compress-image',
    keywords: ['EXIF 메타데이터', '사진 위치 정보 삭제', 'GPS 정보 삭제', '개인정보 보호', '디지털 프라이버시'],
    contentHtml: `
      <h2>1. 사진 파일 뒤에 숨겨진 비밀: EXIF 메타데이터란?</h2>
      <p>
        스마트폰(아이폰, 갤럭시)이나 디지털 카메라로 사진을 촬영할 때, 카메라 앱은 눈에 보이는 이미지 픽셀뿐만 아니라 수많은 부가 정보를 사진 파일(JPEG, HEIC) 내부에 자동으로 기록합니다.
        이를 <strong>EXIF(Exchangeable Image File Format)</strong>라고 부릅니다.
      </p>

      <h2>2. EXIF에 기록되는 민감한 개인정보 항목들</h2>
      <div class="bg-red-50 p-5 rounded-2xl border border-red-200 my-4 text-slate-700">
        <h4 class="font-bold text-red-900 mb-2">사진 한 장에 포함된 실제 메타데이터 예시:</h4>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li><strong>정밀 GPS 좌표:</strong> 촬영 장소의 위도, 경도, 고도 (오차 범위 1~3m 수준으로 집 주소나 아파트 동호수까지 추정 가능)</li>
          <li><strong>촬영 시각:</strong> 년, 월, 일, 시, 분, 초 단위의 정밀 타임스탬프</li>
          <li><strong>기기 사양:</strong> 스마트폰 모델명(예: iPhone 15 Pro, Galaxy S24 Ultra), 렌즈 정보, OS 버전</li>
          <li><strong>촬영 설정:</strong> 셔터 스피드, ISO 감도, 플래시 발광 여부, 화각</li>
        </ul>
      </div>

      <h2>3. 중고거래 및 블로그 업로드 시 발생하는 위험 사례</h2>
      <p>
        중고나라, 당근마켓, 오픈채팅방, 개인 블로그 등에 집 안에서 찍은 물품 사진이나 반려동물 사진을 원본 그대로 업로드할 경우,
        누구나 사진 뷰어 프로그램이나 간단한 온라인 툴로 <strong>촬영자의 거주지 위치와 생활 패턴</strong>을 파악할 수 있는 스토킹 및 범죄 표적이 될 수 있습니다.
        비록 메이저 SNS(인스타그램, 페이스북)는 서버에서 자체적으로 EXIF를 제거하지만, 웹 커뮤니티나 직접 파일 전송 시에는 원본 EXIF가 고스란히 남아있습니다.
      </p>

      <h2>4. 안전하게 사진 속 메타데이터를 제거하는 방법</h2>
      <ol>
        <li><strong>스마트폰 촬영 설정 변경:</strong> 카메라 설정에서 '위치 태그(GPS 태그) 저장'을 비활성화할 수 있습니다.</li>
        <li><strong>브라우저 캔버스 변환 활용:</strong> 사진을 이미지 매직과 같은 브라우저 캔버스 도구로 변환하거나 압축하면, 이미지 픽셀 데이터만 다시 그려내고 비필수적인 EXIF 태그는 원천적으로 완전히 제거됩니다.</li>
      </ol>

      <h2>5. 이미지 매직의 100% 프라이버시 보호 시스템</h2>
      <p>
        이미지 매직에서 JPG, PNG, WebP로 파일을 변환하거나 압축할 때, <strong>브라우저 메모리 상에서 불필요한 메타데이터와 위치 태그를 영구 소멸</strong>시켜 다운로드해 드립니다.
        인터넷 커뮤니티나 웹사이트에 사진을 올리기 전에 변환을 거치시면 안전하게 사생활을 보호하실 수 있습니다.
      </p>
    `
  },
  {
    slug: 'transparent-png-to-webp',
    title: '투명 배경(Alpha 채널)을 유지하면서 WebP로 용량 70% 줄이는 비법',
    excerpt: '로고, 아이콘, 누끼 딴 이미지의 투명도를 완벽하게 보존하면서 PNG보다 70% 가볍게 변환하는 실무 테크닉을 공유합니다.',
    category: '그래픽 디자인 & 웹개발',
    date: '2026-09-25',
    readTime: '4분 읽기',
    author: '웹 퍼포먼스 엔지니어',
    relatedToolId: 'png-to-webp',
    relatedToolName: 'PNG → WebP 변환기 바로가기',
    relatedToolPath: '/png-to-webp',
    keywords: ['투명 배경 유지', 'PNG WebP 변환', 'Alpha 채널', '누끼 이미지 압축', '로고 최적화'],
    contentHtml: `
      <h2>1. 투명 배경 PNG 이미지가 항상 무거운 이유</h2>
      <p>
        디자이너와 마케터들이 가장 많이 다루는 에셋 중 하나는 배경이 투명한(누끼) 상품 사진이나 로고, 일러스트입니다.
        전통적으로 투명 배경을 지원하는 대표 포맷은 <strong>PNG-24</strong>였습니다.
        하지만 PNG-24는 픽셀마다 빨강(R), 초록(G), 파랑(B) 외에도 <strong>투명도 정보인 알파(Alpha) 채널 8비트</strong>를 무손실로 저장하기 때문에 파일 크기가 수 메가바이트(MB)에 달할 정도로 육중합니다.
      </p>

      <h2>2. WebP의 압도적인 투명도 압축 메커니즘</h2>
      <p>
        구글의 <strong>WebP</strong> 포맷은 과거 JPEG의 치명적인 단점이었던 '투명 배경 미지원'을 완벽하게 극복했습니다.
        WebP는 무손실 압축뿐만 아니라 <strong>손실 압축(Lossy) 모드에서도 투명 알파 채널을 보존</strong>할 수 있도록 설계되었습니다.
      </p>
      <ul>
        <li>색상 데이터(RGB)는 사람 눈이 눈치채지 못할 수준으로 효율적인 손실 압축을 적용합니다.</li>
        <li>투명도 마스크(Alpha) 데이터는 경계선이 뭉개지지 않도록 정밀하게 보존합니다.</li>
        <li>그 결과 <strong>기존 PNG-24 파일 대비 용량이 65% ~ 80% 절감</strong>되는 놀라운 최적화 결과를 얻을 수 있습니다.</li>
      </ul>

      <h2>3. 누끼 이미지 변환 시 테두리 흰색 번짐(Halo 현상) 방지법</h2>
      <p>
        종종 잘못된 변환기를 사용할 때 투명 경계선 주변에 하얀 테두리 선(Halo Artifact)이 생겨 디테일이 망가지는 경우가 있습니다.
        이는 배경 색상이 투명(Alpha 0)인 픽셀의 기본 RGB 값을 흰색(#FFFFFF)으로 잘못 채워넣기 때문입니다.
        완벽한 투명 변환을 위해서는 안티앨리어싱 경계값을 올바르게 보존하는 <strong>RGBA 프리멀티플라이드(Premultiplied) 연산</strong>을 지원하는 최신 캔버스 파이프라인을 사용해야 합니다.
      </p>

      <h2>4. 실무 디자이너를 위한 권장 체크리스트</h2>
      <ol>
        <li>웹사이트 로고 및 헤더 그래픽: <strong>WebP (무손실 또는 품질 90% 이상)</strong></li>
        <li>쇼핑몰 상품 상세페이지 누끼 컷: <strong>WebP (품질 80~85%)</strong>로 대량 변환</li>
        <li>다크 모드와 라이트 모드 모두 자연스러운 투명 블렌딩 확인</li>
      </ol>
    `
  },
  {
    slug: 'heic-to-jpg-browser-conversion',
    title: '아이폰 사진(HEIC)을 윈도우와 관공서 사이트에서 바로 열 수 있는 JPG로 초고속 변환하기',
    excerpt: '애플 고효율 이미지 포맷 HEIC의 장점과 호환성 문제 해결법, 별도 프로그램 설치 없이 브라우저에서 대량 변환하는 방법입니다.',
    category: '기기 호환성 팁',
    date: '2026-09-27',
    readTime: '5분 읽기',
    author: '모바일 테크 리뷰어',
    relatedToolId: 'heic-to-jpg',
    relatedToolName: 'HEIC → JPG 변환기 바로가기',
    relatedToolPath: '/heic-to-jpg',
    keywords: ['HEIC JPG 변환', '아이폰 사진 윈도우', 'HEIF 호환성', '사진 변환', '무료 HEIC 변환'],
    contentHtml: `
      <h2>1. HEIC 포맷이란 무엇이며 애플은 왜 기본값으로 채택했을까?</h2>
      <p>
        iOS 11 이후 애플은 아이폰 카메라의 기본 사진 저장 형식을 기존의 JPEG에서 <strong>HEIC(High Efficiency Image Container)</strong>로 전면 전환했습니다.
        HEIC는 HEVC(H.265) 비디오 압축 기술에 기반한 차세대 컨테이너 포맷으로, <strong>동일한 화질에서 기존 JPEG 대비 저장 공간을 정확히 절반(50%)만 차지</strong>합니다.
        아이폰 사용자들의 저장 공간을 획기적으로 아껴주는 매우 우수한 기술입니다.
      </p>

      <h2>2. 하지만 발생하는 치명적인 호환성 문제</h2>
      <p>
        아이폰 내부에서는 완벽하게 보이지만, 이 사진을 PC로 옮기거나 관공서, 은행, 채용 사이트, 중고거래 사이트에 업로드할 때 문제가 발생합니다:
      </p>
      <ul>
        <li><strong>윈도우 PC 기본 뷰어 미지원:</strong> 윈도우 10/11에서는 별도의 유료 코덱(HEIF 이미지 확장)을 마이크로소프트 스토어에서 구매하지 않으면 썸네일도 뜨지 않습니다.</li>
        <li><strong>웹사이트 업로드 오류:</strong> 대다수의 한국 웹사이트는 오직 JPG/PNG 확장자만 허용하므로 <em>"지원하지 않는 파일 형식입니다"</em>라는 거부 창이 뜹니다.</li>
      </ul>

      <h2>3. 아이폰 카메라에서 앞으로 찍을 사진을 JPG로 바꾸는 법</h2>
      <p>
        만약 앞으로 촬영하는 사진을 아예 JPG로 저장하고 싶다면 아이폰 설정을 다음과 같이 변경하시면 됩니다:
      </p>
      <div class="bg-slate-100 p-4 rounded-xl border border-slate-200 text-sm font-medium my-3">
        아이폰 [설정] 앱 &gt; [카메라] &gt; [포맷] 선택 &gt; <strong>'높은 호환성'</strong> 선택
      </div>
      <p class="text-xs text-slate-500">
        *주의: '높은 호환성'으로 바꾸면 파일 호환성은 좋아지지만 사진 용량이 약 2배로 증가하여 아이폰 용량이 더 빨리 찰 수 있습니다.
      </p>

      <h2>4. 이미 촬영된 HEIC 사진을 브라우저에서 안전하게 변환하는 법</h2>
      <p>
        많은 유료 변환 프로그램이나 정체불명의 무료 사이트는 변환을 위해 사용자의 소중한 개인 사진을 원격 해외 서버로 전송받습니다.
        <strong>이미지 매직(Image Magic)</strong>은 클라이언트 측 디코더를 활용하여 컴퓨터 메모리 내에서 즉시 HEIC를 표준 고화질 JPG/PNG로 변환해 냅니다.
        프로그램 설치 없이 수십 장의 사진을 한 번에 드래그하여 안전하게 변환해 보세요.
      </p>
    `
  },
  {
    slug: 'lossless-vs-lossy-compression',
    title: '무손실 압축 vs 손실 압축: 원리 이해와 실전 파일 포맷별 최적화 가이드',
    excerpt: '디지털 이미지 압축의 두 가지 핵심 방식인 무손실과 손실 압축의 기술적 원리를 쉽게 이해하고 상황별 최적의 압축률을 찾아보세요.',
    category: '기술 가이드',
    date: '2026-09-28',
    readTime: '6분 읽기',
    author: '컴퓨터 그래픽스 연구원',
    relatedToolId: 'compress',
    relatedToolName: '이미지 최적화 압축기 바로가기',
    relatedToolPath: '/compress-image',
    keywords: ['무손실 압축', '손실 압축', '이산 코사인 변환', 'DCT', '화질 최적화', '디지털 이미지 공학'],
    contentHtml: `
      <h2>1. 디지털 이미지가 압축을 필요로 하는 이유</h2>
      <p>
        비압축 24비트 트루컬러(True Color) 4K 해상도(3840x2160) 이미지 한 장의 순수 원본 픽셀 용량은 약 <strong>24.8 메가바이트(MB)</strong>에 달합니다.
        이러한 비압축 이미지를 그대로 인터넷망으로 전송하거나 저장하는 것은 현대 네트워크 환경에서도 막대한 비용과 낭비를 초래합니다.
        따라서 불필요한 중복 정보를 제거하는 <strong>압축 알고리즘</strong>이 필수적입니다.
      </p>

      <h2>2. 손실 압축(Lossy Compression): 인간의 시각적 한계를 이용하다</h2>
      <p>
        손실 압축은 <em>"원본으로 100% 되돌릴 수 없는 영구적인 데이터 손실"</em>을 감수하는 대신 <strong>극단적인 파일 용량 축소(최대 90% 이상)</strong>를 달성하는 기술입니다.
      </p>
      <ul>
        <li><strong>원리:</strong> 인간의 눈은 밝기(Luminance) 변화에는 매우 민감하지만, 색상(Chrominance)의 미세한 변화나 복잡한 고주파(High Frequency) 영역의 노이즈에는 둔감합니다.</li>
        <li><strong>알고리즘:</strong> JPEG의 핵심인 <strong>이산 코사인 변환(DCT, Discrete Cosine Transform)</strong>은 이미지를 8x8 블록으로 쪼갠 뒤 사람이 잘 보지 못하는 미세한 색상 진동수를 과감히 잘라냅니다.</li>
        <li><strong>적합한 경우:</strong> 일상 사진, 풍경, 웹사이트 배너, 유튜브 썸네일 등 육안 식별이 주 목적인 콘텐츠.</li>
      </ul>

      <h2>3. 무손실 압축(Lossless Compression): 단 1비트의 손상도 용납하지 않는다</h2>
      <p>
        무손실 압축은 압축을 풀었을 때 <strong>원본 파일과 바이트 단위로 100% 동일한 상태</strong>로 완벽 복원되는 방식입니다.
      </p>
      <ul>
        <li><strong>원리:</strong> 데이터 내의 중복 패턴을 찾아 기호화하는 통계적 기법(예: Huffman 코딩, LZ77, Deflate 알고리즘)을 사용합니다. 예를 들어 "AAAAABBB"라는 픽셀 데이터를 "5A3B"로 치환하여 저장하는 방식입니다.</li>
        <li><strong>적합한 경우:</strong> 텍스트가 포함된 문서 스캔본, 선과 도형이 뚜렷한 UI 그래픽, 의료 영상(X-ray, MRI), 인쇄 출판용 원판.</li>
      </ul>

      <h2>4. 압축 알고리즘 선택 매트릭스</h2>
      <div class="overflow-x-auto my-4">
        <table class="w-full text-sm text-left border-collapse border border-slate-200">
          <thead class="bg-slate-100 text-slate-700 font-bold">
            <tr>
              <th class="p-3 border border-slate-200">목적 및 대상</th>
              <th class="p-3 border border-slate-200">추천 압축 방식</th>
              <th class="p-3 border border-slate-200">권장 포맷</th>
              <th class="p-3 border border-slate-200">목표 퀄리티</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr>
              <td class="p-3 font-semibold">웹사이트 게시 사진</td>
              <td class="p-3 text-blue-600 font-medium">손실 압축</td>
              <td class="p-3">WebP / JPG</td>
              <td class="p-3">80% ~ 85%</td>
            </tr>
            <tr>
              <td class="p-3 font-semibold">기업 로고 / 아이콘</td>
              <td class="p-3 text-emerald-600 font-medium">무손실 압축</td>
              <td class="p-3">PNG / SVG</td>
              <td class="p-3">100% (Lossless)</td>
            </tr>
            <tr>
              <td class="p-3 font-semibold">공공기관 제출용 서류</td>
              <td class="p-3 text-blue-600 font-medium">약한 손실 압축</td>
              <td class="p-3">JPG / PDF</td>
              <td class="p-3">85% ~ 90%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>5. 결론: 실전에서의 황금 비율</h2>
      <p>
        가장 이상적인 접근법은 <strong>"목적에 맞는 압축 타깃 설정"</strong>입니다.
        저희 <strong>이미지 매직(Image Magic)</strong>은 기본값으로 화질과 용량의 절충점인 80% 압축을 추천해 드리며, 사용자가 필요에 따라 10%부터 100%까지 세밀하게 브라우저 실시간 프리뷰를 보며 조절할 수 있습니다.
      </p>
    `
  }
];

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find(article => article.slug === slug);
}
