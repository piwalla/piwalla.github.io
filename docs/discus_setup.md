# Giscus 댓글 시스템 설정 가이드

Giscus는 GitHub Discussions를 기반으로 한 댓글 시스템입니다.

## 1단계: GitHub Discussions 활성화

1. GitHub 저장소 (`seungwonme.github.io`)로 이동
2. **Settings** 탭 클릭
3. **Features** 섹션에서 **Discussions** 체크박스 활성화

## 2단계: Giscus 앱 설치

1. [https://github.com/apps/giscus](https://github.com/apps/giscus) 접속
2. **Install** 버튼 클릭
3. 설치할 저장소 선택:
   - **Only select repositories** 선택
   - `seungwonme.github.io` 저장소 선택
4. **Install** 클릭

## 3단계: Giscus 설정 정보 가져오기

1. [https://giscus.app/ko](https://giscus.app/ko) 접속
2. **저장소** 섹션에서 `seungwonme/seungwonme.github.io` 입력
3. 설정 옵션:
   - **페이지 ↔️ Discussions 매핑**: `pathname` 선택 (권장)
   - **Discussion 카테고리**: `General` 또는 `Announcements` 선택
   - **기능**:
     - ✅ 메인 포스트에 반응 남기기 활성화
   - **테마**: `preferred_color_scheme` (자동으로 다크/라이트 모드 전환)

4. 페이지 하단의 **giscus 활성화** 섹션에서 생성된 코드 확인:
   - `data-repo-id` 값 복사
   - `data-category-id` 값 복사

## 4단계: 블로그에 설정 적용

1. `js/post-loader.js` 파일 열기
2. `loadGiscus()` 함수에서 다음 값 업데이트:
   ```javascript
   script.setAttribute('data-repo', 'seungwonme/seungwonme.github.io');
   script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // 3단계에서 복사한 값으로 변경
   script.setAttribute('data-category', 'General'); // 선택한 카테고리 이름
   script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // 3단계에서 복사한 값으로 변경
   ```

## 5단계: 저장소 push

```bash
git add .
git commit -m "feat: Giscus 댓글 시스템 설정"
git push origin main
```

## 완료!

이제 게시글 페이지에서 댓글 시스템이 작동합니다.

### 참고사항

- 댓글은 GitHub 계정이 있는 사용자만 작성할 수 있습니다
- 댓글은 GitHub Discussions에 자동으로 생성됩니다
- 다크/라이트 모드 전환 시 댓글 테마도 자동으로 변경됩니다