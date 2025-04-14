export default class Pagination {
  constructor(container, pageNumbersContainer, prevBtn, nextBtn) {
    this.container = container;
    this.pageNumbersContainer = pageNumbersContainer;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.currentPage = 1;
    this.totalPages = 0;
    this.totalBooks = 0;
    this.nextPageUrl = null;
    this.prevPageUrl = null;
    this.BOOKS_PER_PAGE = 32;
    this.onPageChange = null;
  }

  setPageChangeHandler(handler) {
    this.onPageChange = handler;
  }

  updatePaginationData(data) {
    this.totalBooks = data.count;
    this.nextPageUrl = data.next;
    this.prevPageUrl = data.previous;
    this.totalPages = Math.ceil(this.totalBooks / this.BOOKS_PER_PAGE);

    if (this.nextPageUrl) {
      const urlParams = new URLSearchParams(new URL(this.nextPageUrl).search);
      const nextPage = urlParams.get("page");
      this.currentPage = nextPage ? parseInt(nextPage) - 1 : 1;
    } else if (this.prevPageUrl) {
      const urlParams = new URLSearchParams(new URL(this.prevPageUrl).search);
      const prevPage = urlParams.get("page");
      this.currentPage = prevPage ? parseInt(prevPage) + 1 : 1;
    } else {
      this.currentPage = 1;
    }

    this.updateUI();
  }

  updateUI() {
    if (this.totalBooks <= this.BOOKS_PER_PAGE) {
      this.container.style.display = "none";
      return;
    }

    this.container.style.display = "flex";
    this.prevBtn.disabled = !this.prevPageUrl;
    this.nextBtn.disabled = !this.nextPageUrl;

    this.pageNumbersContainer.innerHTML = "";

    const maxPageButtons = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxPageButtons / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons && startPage > 1) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    if (startPage > 1) {
      this.appendPageNumber(1);
      if (startPage > 2) {
        this.appendEllipsis();
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      this.appendPageNumber(i);
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        this.appendEllipsis();
      }
      this.appendPageNumber(this.totalPages);
    }
  }

  appendPageNumber(pageNum) {
    const pageBtn = document.createElement("button");
    pageBtn.className = "page-num";
    pageBtn.textContent = pageNum;

    if (pageNum === this.currentPage) {
      pageBtn.classList.add("current");
    }

    pageBtn.addEventListener("click", () => {
      if (pageNum !== this.currentPage) {
        this.currentPage = pageNum;
        if (this.onPageChange) {
          this.onPageChange(pageNum);
        }
      }
    });

    this.pageNumbersContainer.appendChild(pageBtn);
  }

  appendEllipsis() {
    const ellipsis = document.createElement("span");
    ellipsis.className = "ellipsis";
    ellipsis.textContent = "...";
    this.pageNumbersContainer.appendChild(ellipsis);
  }

  setupEventListeners() {
    this.prevBtn.addEventListener("click", () => {
      if (this.prevPageUrl && this.onPageChange) {
        this.onPageChange(null, this.prevPageUrl);
      }
    });

    this.nextBtn.addEventListener("click", () => {
      if (this.nextPageUrl && this.onPageChange) {
        this.onPageChange(null, this.nextPageUrl);
      }
    });
  }
}
