/**
 * 게시글 로더 모듈
 * 마크다운 파일 로딩, 파싱, Giscus 댓글 시스템
 */

class PostLoader {
  constructor() {
    this.postTitle = document.getElementById('post-title');
    this.postDate = document.getElementById('post-date');
    this.postTags = document.getElementById('post-tags');
    this.postBody = document.getElementById('post-body');
    this.postTagsList = document.getElementById('post-tags-list');
    this.giscusContainer = document.getElementById('giscus-container');

    this.init();
  }

  init() {
    // URL 파라미터에서 파일명 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file');

    if (fileName) {
      this.loadPost(fileName);
    } else {
      this.showError('게시글 파일을 찾을 수 없습니다.');
    }
  }

  async loadPost(fileName) {
    try {
      console.log(`게시글 로딩 중: ${fileName}`);

      // 마크다운 파일 로드
      const response = await fetch(`pages/${fileName}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const markdown = await response.text();

      // 마크다운 파싱 및 렌더링
      this.renderPost(markdown, fileName);

      // Giscus 로드
      this.loadGiscus(fileName);

      console.log(`게시글 로딩 완료: ${fileName}`);

    } catch (error) {
      console.error('게시글 로딩 실패:', error);
      this.showError('게시글을 불러오는 중 오류가 발생했습니다.');
    }
  }

  renderPost(markdown, fileName) {
    // Front Matter 파싱
    const { metadata, content } = this.parseFrontMatter(markdown);

    // 제목 설정
    if (this.postTitle) {
      this.postTitle.textContent = metadata.title || fileName.replace('.md', '');
    }

    // 날짜 설정
    if (this.postDate) {
      this.postDate.textContent = this.formatDate(metadata.date);
    }

    // 태그 설정
    if (this.postTags) {
      this.postTags.textContent = metadata.tags ? metadata.tags.join(', ') : '';
    }

    // 본문 렌더링
    if (this.postBody && window.marked) {
      // marked 옵션 설정
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
      });

      this.postBody.innerHTML = marked.parse(content);
    }

    // 태그 목록 렌더링
    if (this.postTagsList && metadata.tags) {
      this.renderTagsList(metadata.tags);
    }

    // 코드 하이라이팅 적용
    if (window.Prism) {
      setTimeout(() => {
        Prism.highlightAll();
      }, 100);
    }
  }

  parseFrontMatter(markdown) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontMatterRegex);

    let metadata = {};
    let content = markdown;

    if (match) {
      const frontMatter = match[1];
      content = match[2];

      // Front Matter 파싱
      const lines = frontMatter.split('\n');
      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();

          // 따옴표 제거
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }

          // 배열 파싱 (tags)
          if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
            try {
              value = JSON.parse(value);
            } catch {
              value = value.slice(1, -1)
                .split(',')
                .map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
            }
          }

          metadata[key] = value;
        }
      });
    }

    return { metadata, content };
  }

  renderTagsList(tags) {
    this.postTagsList.innerHTML = '';

    tags.forEach(tag => {
      const tagButton = document.createElement('button');
      tagButton.className = 'tag-button';
      tagButton.textContent = tag;
      tagButton.addEventListener('click', () => {
        // 메인 페이지로 이동하며 태그 필터 적용
        window.location.href = `index.html?tag=${encodeURIComponent(tag)}`;
      });
      this.postTagsList.appendChild(tagButton);
    });
  }

  loadGiscus(fileName) {
    if (!this.giscusContainer) return;

    // 기존 Giscus 제거
    this.giscusContainer.innerHTML = '';

    // Giscus 스크립트 생성
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    // Giscus 설정
    script.setAttribute('data-repo', 'piwalla/piwalla.github.io');
    script.setAttribute('data-repo-id', 'R_kgDOQLHJng');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOQLHJns4CxMbq');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'ko');

    // 로딩 메시지
    this.giscusContainer.innerHTML = '<p>댓글을 불러오는 중...</p>';

    // 스크립트 로드
    this.giscusContainer.appendChild(script);

    console.log('Giscus 댓글 시스템이 로드되었습니다.');
  }

  formatDate(dateString) {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  showError(message) {
    if (this.postTitle) {
      this.postTitle.textContent = '오류';
    }
    if (this.postBody) {
      this.postBody.innerHTML = `<p style="color: red;">${message}</p>`;
    }
  }
}

// 메인 페이지에서 URL 파라미터 처리 (태그 필터)
function handleMainPageFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const tag = urlParams.get('tag');

  if (tag && window.searchManager) {
    // 태그 필터 적용
    setTimeout(() => {
      window.searchManager.toggleTagFilter(tag);
    }, 500); // posts.json 로딩 후 적용
  }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 현재 페이지가 post.html인지 확인
  if (document.getElementById('post-title')) {
    window.postLoader = new PostLoader();
  } else {
    // 메인 페이지 필터 처리
    handleMainPageFilters();
  }
});
