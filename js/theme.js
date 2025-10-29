/**
 * 테마 관리 모듈
 * 다크/라이트 모드 토글 및 저장 기능
 */

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.currentTheme = this.getStoredTheme() || 'light';
    this.init();
  }

  init() {
    // 초기 테마 설정
    this.setTheme(this.currentTheme);

    // 토글 버튼 이벤트 리스너
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // 시스템 테마 변경 감지
    this.watchSystemTheme();
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (e) {
      console.warn('localStorage에 접근할 수 없습니다:', e);
      return null;
    }
  }

  setStoredTheme(theme) {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('localStorage에 저장할 수 없습니다:', e);
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.updateToggleButton(theme);
    this.setStoredTheme(theme);

    // Prism.js 테마 재적용 (필요한 경우)
    if (window.Prism) {
      setTimeout(() => {
        Prism.highlightAll();
      }, 100);
    }

    console.log(`테마가 ${theme} 모드로 변경되었습니다.`);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  updateToggleButton(theme) {
    if (!this.themeToggle) return;

    if (theme === 'dark') {
      this.themeToggle.textContent = '☀️';
      this.themeToggle.setAttribute('aria-label', '라이트 모드로 전환');
    } else {
      this.themeToggle.textContent = '🌙';
      this.themeToggle.setAttribute('aria-label', '다크 모드로 전환');
    }
  }

  watchSystemTheme() {
    // 시스템 테마 변경 감지 (미디어 쿼리)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 초기 로드 시 시스템 테마 확인 (저장된 테마가 없는 경우)
    if (!this.getStoredTheme()) {
      if (mediaQuery.matches) {
        this.setTheme('dark');
      }
    }

    // 시스템 테마 변경 이벤트 리스너
    mediaQuery.addEventListener('change', (e) => {
      // 사용자가 수동으로 테마를 설정한 경우 시스템 테마 변경 무시
      if (this.getStoredTheme()) return;

      const newTheme = e.matches ? 'dark' : 'light';
      this.setTheme(newTheme);
    });
  }

  // 외부에서 테마 확인용
  getCurrentTheme() {
    return this.currentTheme;
  }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});

// 전역 함수로 노출 (디버깅용)
window.toggleTheme = () => {
  if (window.themeManager) {
    window.themeManager.toggleTheme();
  }
};
