/**
 * 메인 애플리케이션 모듈
 * posts.json 로딩 및 앱 초기화
 */

class BlogApp {
  constructor() {
    this.posts = [];
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      console.log('블로그 앱 초기화 중...');

      // posts.json 로드
      await this.loadPosts();

      // 검색 매니저에 게시글 설정
      if (window.searchManager) {
        window.searchManager.setPosts(this.posts);
      }

      this.isInitialized = true;
      console.log(`블로그 앱 초기화 완료. ${this.posts.length}개 게시글 로드됨.`);

    } catch (error) {
      console.error('블로그 앱 초기화 실패:', error);
      this.showError('게시글 목록을 불러올 수 없습니다.');
    }
  }

  async loadPosts() {
    try {
      console.log('posts.json 로딩 중...');

      const response = await fetch('posts.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 데이터 검증
      if (!Array.isArray(data)) {
        throw new Error('posts.json 형식이 올바르지 않습니다.');
      }

      this.posts = data;

      // 추가 검증 및 기본값 설정
      this.posts.forEach((post, index) => {
        if (!post.file) {
          console.warn(`게시글 ${index}: file 속성이 없습니다.`);
          post.file = `post-${index}.md`;
        }
        if (!post.title) {
          post.title = post.file.replace('.md', '');
        }
        if (!post.date) {
          post.date = new Date().toISOString().split('T')[0];
        }
        if (!Array.isArray(post.tags)) {
          post.tags = [];
        }
        if (!post.excerpt) {
          post.excerpt = '';
        }
      });

      console.log(`posts.json 로딩 완료: ${this.posts.length}개 게시글`);

    } catch (error) {
      console.error('posts.json 로딩 실패:', error);

      // 개발 모드에서 빈 배열로 폴백
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn('개발 모드: 빈 게시글 목록으로 폴백합니다.');
        this.posts = [];
      } else {
        throw error;
      }
    }
  }

  showError(message) {
    const postsList = document.getElementById('posts-list');
    const loading = document.getElementById('loading');

    if (loading) {
      loading.style.display = 'none';
    }

    if (postsList) {
      postsList.innerHTML = `
        <div class="error-message" style="
          text-align: center;
          padding: 2rem;
          color: #dc3545;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
        ">
          <h3>오류 발생</h3>
          <p>${message}</p>
          <p style="font-size: 0.9rem; margin-top: 1rem;">
            문제가 지속되면 개발자에게 문의해주세요.
          </p>
        </div>
      `;
    }
  }

  // 게시글 검색
  searchPosts(query) {
    if (!this.isInitialized) return [];

    const lowerQuery = query.toLowerCase();
    return this.posts.filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      (post.category && post.category.toLowerCase().includes(lowerQuery))
    );
  }

  // 태그로 필터링
  filterByTag(tag) {
    if (!this.isInitialized) return [];

    return this.posts.filter(post => post.tags.includes(tag));
  }

  // 카테고리로 필터링
  filterByCategory(category) {
    if (!this.isInitialized) return [];

    return this.posts.filter(post => post.category === category);
  }

  // 게시글 가져오기
  getPostByFile(fileName) {
    return this.posts.find(post => post.file === fileName);
  }

  // 모든 게시글 가져오기
  getAllPosts() {
    return [...this.posts];
  }

  // 앱 상태 확인
  isReady() {
    return this.isInitialized;
  }
}

// 전역 앱 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
  window.blogApp = new BlogApp();
});

// 디버깅용 전역 함수들
window.debugBlogApp = () => {
  if (window.blogApp) {
    console.log('블로그 앱 상태:', {
      isInitialized: window.blogApp.isInitialized,
      postsCount: window.blogApp.posts.length,
      posts: window.blogApp.posts
    });
  } else {
    console.log('블로그 앱이 초기화되지 않았습니다.');
  }
};

window.searchPosts = (query) => {
  if (window.blogApp) {
    const results = window.blogApp.searchPosts(query);
    console.log(`"${query}" 검색 결과: ${results.length}개`, results);
    return results;
  }
  return [];
};
