import BooksAPI from "./api/BooksAPI.js";
import WishlistService from "./services/WishlistService.js";
import UserPreferencesService from "./services/UserPreferencesService.js";
import BookCard from "./components/BookCard.js";
import BookDetails from "./components/BookDetails.js";
import Pagination from "./components/Pagination.js";
import Router from "./router/Router.js";

class App {
  constructor() {
    this.booksAPI = new BooksAPI();
    this.wishlistService = new WishlistService();
    this.userPreferences = new UserPreferencesService();
    this.bookCardComponent = new BookCard(this.wishlistService);
    this.bookDetailsComponent = new BookDetails(this.wishlistService);

    this.setupDOMElements();
    this.setupPagination();
    this.setupRouter();
    this.setupEventListeners();

    this.allBooks = [];
    this.currentSearchTerm = this.userPreferences.getSearchTerm();
    this.currentGenre = this.userPreferences.getGenre();

    this.searchInput.value = this.currentSearchTerm;
    this.genreSelect.value = this.currentGenre;
  }

  setupDOMElements() {
    this.booksContainer = document.getElementById("books-container");
    this.loadingElement = document.getElementById("loading");
    this.errorElement = document.getElementById("error");
    this.searchInput = document.getElementById("search-input");
    this.genreSelect = document.getElementById("genre-select");
    this.navHome = document.getElementById("nav-home");
    this.navWishlist = document.getElementById("nav-wishlist");
    this.paginationContainer = document.getElementById("pagination-container");
    this.prevPageBtn = document.getElementById("prev-page");
    this.nextPageBtn = document.getElementById("next-page");
    this.pageNumbersContainer = document.getElementById("page-numbers");
  }

  setupPagination() {
    this.pagination = new Pagination(
      this.paginationContainer,
      this.pageNumbersContainer,
      this.prevPageBtn,
      this.nextPageBtn
    );

    this.pagination.setPageChangeHandler((page, url) => {
      this.loadingElement.classList.remove("hidden");
      this.booksContainer.innerHTML = "";

      if (url) {
        this.loadPageFromUrl(url);
      } else {
        const isWishlist = window.location.hash === "#wishlist";
        this.fetchBooks(
          this.currentSearchTerm,
          this.currentGenre,
          isWishlist ? this.wishlistService.getWishlistIds() : [],
          page
        );
      }
    });

    this.pagination.setupEventListeners();
  }

  setupRouter() {
    this.router = new Router();

    this.router.addRoute("#home", () => {
      this.fetchBooks(this.currentSearchTerm, this.currentGenre);
    });

    this.router.addRoute("#wishlist", () => {
      this.fetchWishlistBooks();
    });

    this.router.addRoute("#book", (bookId) => {
      this.fetchBookDetails(bookId);
    });

    this.router.init();
  }

  setupEventListeners() {
    let searchTimeout = null;

    this.searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);

      const searchTerm = e.target.value.trim();

      searchTimeout = setTimeout(() => {
        this.currentSearchTerm = searchTerm;
        this.booksContainer.innerHTML = "";
        this.loadingElement.classList.remove("hidden");
        this.errorElement.classList.add("hidden");

        this.userPreferences.savePreferences(
          this.currentSearchTerm,
          this.currentGenre
        );

        if (window.location.hash === "#wishlist") {
          this.fetchWishlistBooks();
        } else {
          this.fetchBooks(this.currentSearchTerm, this.currentGenre);
        }
      }, 500);
    });

    this.genreSelect.addEventListener("change", (e) => {
      this.currentGenre = e.target.value;
      this.booksContainer.innerHTML = "";
      this.loadingElement.classList.remove("hidden");
      this.errorElement.classList.add("hidden");

      this.userPreferences.savePreferences(
        this.currentSearchTerm,
        this.currentGenre
      );

      if (window.location.hash === "#wishlist") {
        this.fetchWishlistBooks();
      } else {
        this.fetchBooks(this.currentSearchTerm, this.currentGenre);
      }
    });
  }

  async fetchBooks(searchTerm = "", genre = "", bookIds = [], page = 1) {
    try {
      this.loadingElement.classList.remove("hidden");
      this.errorElement.classList.add("hidden");

      const data = await this.booksAPI.fetchBooks(
        searchTerm,
        genre,
        bookIds,
        page
      );
      this.pagination.updatePaginationData(data);

      if (bookIds.length > 0) {
        this.displayBooks(data.results);
      } else {
        this.allBooks = data.results;
        this.displayBooks(this.allBooks);
      }

      this.loadingElement.classList.add("hidden");
    } catch (error) {
      this.handleFetchError(error);
    }
  }

  async loadPageFromUrl(url) {
    try {
      this.loadingElement.classList.remove("hidden");
      const data = await this.booksAPI.loadPageFromUrl(url);
      this.pagination.updatePaginationData(data);
      this.displayBooks(data.results);
      this.loadingElement.classList.add("hidden");
    } catch (error) {
      this.handleFetchError(error);
    }
  }

  fetchWishlistBooks() {
    const wishlistIds = this.wishlistService.getWishlistIds();
    if (wishlistIds.length === 0) {
      this.errorElement.classList.remove("hidden");
      this.errorElement.textContent =
        "Your wishlist is empty. Add some books by clicking the heart icon.";
      this.booksContainer.innerHTML = "";
      this.loadingElement.classList.add("hidden");
      this.paginationContainer.style.display = "none";
      return;
    }

    this.booksContainer.innerHTML = "";
    this.loadingElement.classList.remove("hidden");
    this.errorElement.classList.add("hidden");
    this.fetchBooks(this.currentSearchTerm, this.currentGenre, wishlistIds);
  }

  async fetchBookDetails(bookId) {
    this.booksContainer.innerHTML = "";
    this.loadingElement.classList.remove("hidden");
    this.errorElement.classList.add("hidden");
    this.paginationContainer.style.display = "none";

    try {
      const book = await this.booksAPI.fetchBookDetails(bookId);
      this.bookDetailsComponent.displayBookDetails(book, this.booksContainer);
      this.loadingElement.classList.add("hidden");
    } catch (error) {
      this.loadingElement.classList.add("hidden");
      this.errorElement.classList.remove("hidden");
      this.errorElement.textContent = `Error fetching book details: ${error.message}. The book ID may be invalid.`;
      console.error("Error fetching book details:", error);
    }
  }

  handleFetchError(error) {
    this.loadingElement.classList.add("hidden");
    this.errorElement.classList.remove("hidden");
    this.errorElement.textContent = `Error fetching books: ${error.message}`;
    console.error("Error fetching books:", error);
    this.paginationContainer.style.display = "none";
  }

  displayBooks(books) {
    this.booksContainer.innerHTML = "";
    const isWishlist = window.location.hash === "#wishlist";

    if (!books || books.length === 0) {
      this.errorElement.classList.remove("hidden");
      this.errorElement.textContent = isWishlist
        ? "No wishlist books match your current filters."
        : "No books found matching your search.";
      this.paginationContainer.style.display = "none";
      return;
    }

    this.errorElement.classList.add("hidden");
    books.forEach((book) => {
      const bookCard = this.bookCardComponent.createBookCard(book);
      this.booksContainer.appendChild(bookCard);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App();
});
