/**
 * 검색 및 필터링 모듈
 * 게시글 검색, 태그 필터링, 카테고리 필터링 기능
 */

class SearchManager {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.postsList = document.getElementById('posts-list');
    this.tagButtons = document.getElementById('tag-buttons');
    this.categoryButtons = document.getElementById('category-buttons');
    this.noResults = document.getElementById('no-results');
    this.loading = document.getElementById('loading');

    this.allPosts = [];
    this.filteredPosts = [];
    this.currentFilters = {
      search: '',
      tags: [],
      categories: []
    };

    this.init();
  }

  init() {
    if (!this.searchInput || !this.postsList) return;

    // 이벤트 리스너 설정
    this.searchInput.addEventListener('input', (e) => {
      this.currentFilters.search = e.target.value.trim();
      this.applyFilters();
    });

    // 엔터 키로 검색
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.applyFilters();
      }
    });

    console.log('검색 모듈이 초기화되었습니다.');
  }

  setPosts(posts) {
    this.allPosts = posts;
    this.filteredPosts = [...posts];
    this.generateFilterButtons();
    this.renderPosts();
  }

  generateFilterButtons() {
    if (!this.tagButtons || !this.categoryButtons) return;

    // 태그 버튼 생성
    const allTags = new Set();
    const allCategories = new Set();

    this.allPosts.forEach(post => {
      post.tags.forEach(tag => allTags.add(tag));
      if (post.category) allCategories.add(post.category);
    });

    // 태그 버튼
    this.tagButtons.innerHTML = '';
    Array.from(allTags).sort().forEach(tag => {
      const button = document.createElement('button');
      button.className = 'tag-button';
      button.textContent = tag;
      button.addEventListener('click', () => this.toggleTagFilter(tag));
      this.tagButtons.appendChild(button);
    });

    // 카테고리 버튼
    this.categoryButtons.innerHTML = '';
    Array.from(allCategories).sort().forEach(category => {
      const button = document.createElement('button');
      button.className = 'category-button';
      button.textContent = category;
      button.addEventListener('click', () => this.toggleCategoryFilter(category));
      this.categoryButtons.appendChild(button);
    });
  }

  toggleTagFilter(tag) {
    const index = this.currentFilters.tags.indexOf(tag);
    if (index > -1) {
      this.currentFilters.tags.splice(index, 1);
    } else {
      this.currentFilters.tags.push(tag);
    }
    this.updateFilterButtons();
    this.applyFilters();
  }

  toggleCategoryFilter(category) {
    const index = this.currentFilters.categories.indexOf(category);
    if (index > -1) {
      this.currentFilters.categories.splice(index, 1);
    } else {
      this.currentFilters.categories.push(category);
    }
    this.updateFilterButtons();
    this.applyFilters();
  }

  updateFilterButtons() {
    // 태그 버튼 상태 업데이트
    if (this.tagButtons) {
      const tagButtons = this.tagButtons.querySelectorAll('.tag-button');
      tagButtons.forEach(button => {
        const tag = button.textContent;
        if (this.currentFilters.tags.includes(tag)) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }

    // 카테고리 버튼 상태 업데이트
    if (this.categoryButtons) {
      const categoryButtons = this.categoryButtons.querySelectorAll('.category-button');
      categoryButtons.forEach(button => {
        const category = button.textContent;
        if (this.currentFilters.categories.includes(category)) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }
  }

  applyFilters() {
    this.filteredPosts = this.allPosts.filter(post => {
      // 검색어 필터링
      const searchMatch = this.matchesSearch(post, this.currentFilters.search);

      // 태그 필터링
      const tagMatch = this.currentFilters.tags.length === 0 ||
        this.currentFilters.tags.some(tag => post.tags.includes(tag));

      // 카테고리 필터링
      const categoryMatch = this.currentFilters.categories.length === 0 ||
        this.currentFilters.categories.includes(post.category);

      return searchMatch && tagMatch && categoryMatch;
    });

    this.renderPosts();
    console.log(`필터 적용됨: ${this.filteredPosts.length}개 게시글 표시`);
  }

  matchesSearch(post, searchTerm) {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(term) ||
      post.excerpt.toLowerCase().includes(term) ||
      post.tags.some(tag => tag.toLowerCase().includes(term)) ||
      (post.category && post.category.toLowerCase().includes(term))
    );
  }

  renderPosts() {
    if (!this.postsList) return;

    // 로딩 상태 숨기기
    if (this.loading) {
      this.loading.style.display = 'none';
    }

    // 결과 없음 표시
    if (this.noResults) {
      this.noResults.style.display = this.filteredPosts.length === 0 ? 'block' : 'none';
    }

    // 게시글 렌더링
    this.postsList.innerHTML = '';

    this.filteredPosts.forEach(post => {
      const postCard = this.createPostCard(post);
      this.postsList.appendChild(postCard);
    });
  }

  createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';

    const tagsHtml = post.tags.map(tag =>
      `<span class="post-card-tag">${tag}</span>`
    ).join('');

    card.innerHTML = `
      <h3 class="post-card-title">
        <a href="post.html?file=${encodeURIComponent(post.file)}">${post.title}</a>
      </h3>
      <div class="post-card-meta">
        <span class="post-card-date">${this.formatDate(post.date)}</span>
        <div class="post-card-tags">${tagsHtml}</div>
      </div>
      <p class="post-card-excerpt">${post.excerpt}</p>
      <a href="post.html?file=${encodeURIComponent(post.file)}" class="post-card-read-more">더 읽기 →</a>
    `;

    return card;
  }

  formatDate(dateString) {
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

  // 외부에서 필터 초기화용
  clearFilters() {
    this.currentFilters.search = '';
    this.currentFilters.tags = [];
    this.currentFilters.categories = [];

    if (this.searchInput) {
      this.searchInput.value = '';
    }

    this.updateFilterButtons();
    this.applyFilters();
  }

  // 현재 필터 상태 반환
  getCurrentFilters() {
    return { ...this.currentFilters };
  }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.searchManager = new SearchManager();
});
