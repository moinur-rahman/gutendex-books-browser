document.addEventListener("DOMContentLoaded", () => {
  const booksContainer = document.getElementById("books-container");
  const loadingElement = document.getElementById("loading");
  const errorElement = document.getElementById("error");
  const searchInput = document.getElementById("search-input");
  const genreSelect = document.getElementById("genre-select");
  const navHome = document.getElementById("nav-home");
  const navWishlist = document.getElementById("nav-wishlist");
  const paginationContainer = document.getElementById("pagination-container");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageNumbersContainer = document.getElementById("page-numbers");

  const API_URL = "https://gutendex.com/books";
  let searchTimeout = null;
  let currentSearchTerm = "";
  let currentGenre = "";
  let wishlist = {};
  let allBooks = [];
  let currentPage = 1;
  let totalBooks = 0;
  let nextPageUrl = null;
  let prevPageUrl = null;
  let totalPages = 0;
  const BOOKS_PER_PAGE = 32;

  let currentRoute = window.location.hash || "#home";

  loadWishlist();
  loadUserPreferences();
  handleRouteChange();

  window.addEventListener("hashchange", handleRouteChange);

  function handleRouteChange() {
    currentRoute = window.location.hash || "#home";

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    if (currentRoute === "#home" || currentRoute === "") {
      navHome.classList.add("active");
      fetchBooks(currentSearchTerm, currentGenre);
    } else if (currentRoute === "#wishlist") {
      navWishlist.classList.add("active");
      fetchWishlistBooks();
    } else if (currentRoute.startsWith("#book/")) {
      const bookId = currentRoute.split("/")[1];
      if (bookId) {
        fetchBookDetails(bookId);
      } else {
        window.location.hash = "home";
      }
    }
  }

  function loadUserPreferences() {
    const storedPreferences = localStorage.getItem("gutendexPreferences");
    if (storedPreferences) {
      const preferences = JSON.parse(storedPreferences);
      currentSearchTerm = preferences.searchTerm || "";
      currentGenre = preferences.genre || "";

      searchInput.value = currentSearchTerm;
      genreSelect.value = currentGenre;
    }
  }

  function saveUserPreferences() {
    const preferences = {
      searchTerm: currentSearchTerm,
      genre: currentGenre,
    };
    localStorage.setItem("gutendexPreferences", JSON.stringify(preferences));
  }

  function loadWishlist() {
    const storedWishlist = localStorage.getItem("gutendexWishlist");
    if (storedWishlist) {
      wishlist = JSON.parse(storedWishlist);
    }
  }

  function saveWishlist() {
    localStorage.setItem("gutendexWishlist", JSON.stringify(wishlist));
  }

  function toggleWishlist(bookId) {
    if (wishlist[bookId]) {
      delete wishlist[bookId];
    } else {
      wishlist[bookId] = true;
    }
    saveWishlist();

    if (currentRoute === "#wishlist") {
      fetchWishlistBooks();
    }
  }

  function isWishlisted(bookId) {
    return !!wishlist[bookId];
  }

  function getWishlistIds() {
    return Object.keys(wishlist);
  }

  function displayFilteredBooks() {
    if (currentRoute === "#wishlist") {
      fetchWishlistBooks();
    } else {
      displayBooks(allBooks);
    }
  }

  function fetchWishlistBooks() {
    const wishlistIds = getWishlistIds();
    if (wishlistIds.length === 0) {
      errorElement.classList.remove("hidden");
      errorElement.textContent =
        "Your wishlist is empty. Add some books by clicking the heart icon.";
      booksContainer.innerHTML = "";
      loadingElement.classList.add("hidden");
      paginationContainer.style.display = "none";
      return;
    }

    booksContainer.innerHTML = "";
    loadingElement.classList.remove("hidden");
    errorElement.classList.add("hidden");
    fetchBooks(currentSearchTerm, currentGenre, wishlistIds);
  }

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);

    const searchTerm = e.target.value.trim();

    searchTimeout = setTimeout(() => {
      currentSearchTerm = searchTerm;
      currentPage = 1;
      booksContainer.innerHTML = "";
      loadingElement.classList.remove("hidden");
      errorElement.classList.add("hidden");

      saveUserPreferences();

      if (currentRoute === "#wishlist") {
        fetchWishlistBooks();
      } else {
        fetchBooks(currentSearchTerm, currentGenre);
      }
    }, 500);
  });

  genreSelect.addEventListener("change", (e) => {
    currentGenre = e.target.value;
    currentPage = 1;
    booksContainer.innerHTML = "";
    loadingElement.classList.remove("hidden");
    errorElement.classList.add("hidden");

    saveUserPreferences();

    if (currentRoute === "#wishlist") {
      fetchWishlistBooks();
    } else {
      fetchBooks(currentSearchTerm, currentGenre);
    }
  });

  navHome.addEventListener("click", (e) => {
    window.location.hash = "home";
  });

  navWishlist.addEventListener("click", (e) => {
    window.location.hash = "wishlist";
  });

  prevPageBtn.addEventListener("click", () => {
    if (prevPageUrl) {
      loadingElement.classList.remove("hidden");
      booksContainer.innerHTML = "";
      loadPageFromUrl(prevPageUrl);
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (nextPageUrl) {
      loadingElement.classList.remove("hidden");
      booksContainer.innerHTML = "";
      loadPageFromUrl(nextPageUrl);
    }
  });

  async function loadPageFromUrl(url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      updatePaginationData(data);
      displayBooks(data.results);
      updatePaginationUI();
      loadingElement.classList.add("hidden");
    } catch (error) {
      handleFetchError(error);
    }
  }

  function updatePaginationData(data) {
    totalBooks = data.count;
    nextPageUrl = data.next;
    prevPageUrl = data.previous;
    totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);

    if (prevPageUrl) {
      const urlParams = new URLSearchParams(new URL(prevPageUrl).search);
      const prevPage = urlParams.get("page");
      currentPage = prevPage ? parseInt(prevPage) + 1 : 1;
    } else if (nextPageUrl) {
      const urlParams = new URLSearchParams(new URL(nextPageUrl).search);
      const nextPage = urlParams.get("page");
      currentPage = nextPage ? parseInt(nextPage) - 1 : 1;
    } else {
      currentPage = 1;
    }
  }

  function updatePaginationUI() {
    if (totalBooks <= BOOKS_PER_PAGE) {
      paginationContainer.style.display = "none";
      return;
    }

    paginationContainer.style.display = "flex";
    prevPageBtn.disabled = !prevPageUrl;
    nextPageBtn.disabled = !nextPageUrl;

    pageNumbersContainer.innerHTML = "";

    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons && startPage > 1) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    if (startPage > 1) {
      appendPageNumber(1);
      if (startPage > 2) {
        appendEllipsis();
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      appendPageNumber(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        appendEllipsis();
      }
      appendPageNumber(totalPages);
    }
  }

  function appendPageNumber(pageNum) {
    const pageBtn = document.createElement("button");
    pageBtn.className = "page-num";
    pageBtn.textContent = pageNum;

    if (pageNum === currentPage) {
      pageBtn.classList.add("current");
    }

    pageBtn.addEventListener("click", () => {
      if (pageNum !== currentPage) {
        currentPage = pageNum;
        loadingElement.classList.remove("hidden");
        booksContainer.innerHTML = "";
        fetchBooks(
          currentSearchTerm,
          currentGenre,
          showingWishlist ? getWishlistIds() : [],
          pageNum
        );
      }
    });

    pageNumbersContainer.appendChild(pageBtn);
  }

  function appendEllipsis() {
    const ellipsis = document.createElement("span");
    ellipsis.className = "ellipsis";
    ellipsis.textContent = "...";
    pageNumbersContainer.appendChild(ellipsis);
  }

  async function fetchBooks(
    searchTerm = "",
    genre = "",
    bookIds = [],
    page = 1
  ) {
    try {
      let url = API_URL;
      const params = [];

      if (page > 1) {
        params.push(`page=${page}`);
      }

      if (bookIds.length > 0) {
        params.push(`ids=${bookIds.join(",")}`);
      }

      if (searchTerm) {
        params.push(`search=${encodeURIComponent(searchTerm)}`);
      }

      if (genre) {
        params.push(`topic=${encodeURIComponent(genre)}`);
      }

      if (params.length > 0) {
        url = `${API_URL}?${params.join("&")}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      updatePaginationData(data);

      if (bookIds.length > 0) {
        displayBooks(data.results);
      } else {
        allBooks = data.results;
        displayBooks(allBooks);
      }

      updatePaginationUI();
      loadingElement.classList.add("hidden");
    } catch (error) {
      handleFetchError(error);
    }
  }

  function handleFetchError(error) {
    loadingElement.classList.add("hidden");
    errorElement.classList.remove("hidden");
    errorElement.textContent = `Error fetching books: ${error.message}`;
    console.error("Error fetching books:", error);
    paginationContainer.style.display = "none";
  }

  function displayBooks(books) {
    booksContainer.innerHTML = "";

    if (!books || books.length === 0) {
      errorElement.classList.remove("hidden");
      errorElement.textContent = showingWishlist
        ? "No wishlist books match your current filters."
        : "No books found matching your search.";
      paginationContainer.style.display = "none";
      return;
    }

    errorElement.classList.add("hidden");
    books.forEach((book) => {
      const bookCard = createBookCard(book);
      booksContainer.appendChild(bookCard);
    });
  }

  function createBookCard(book) {
    const bookCard = document.createElement("div");
    bookCard.className = "book-card";
    bookCard.dataset.bookId = book.id;

    const coverImage = book.formats["image/jpeg"] || "";
    const title = book.title || "Unknown Title";
    const bookId = book.id || "N/A";
    const downloadCount = book.download_count || 0;

    const authors =
      book.authors
        .map(
          (author) =>
            `${author.name}${
              author.birth_year && author.death_year
                ? ` (${author.birth_year}-${author.death_year})`
                : ""
            }`
        )
        .join(", ") || "Unknown Author";

    const subjects = book.subjects || [];

    const wishlistIconClass = isWishlisted(bookId)
      ? "wishlist-icon active"
      : "wishlist-icon";

    const wishlistButtonTitle = isWishlisted(bookId)
      ? "Remove from wishlist"
      : "Add to wishlist";

    const cardContent = `
            <div class="book-cover">
                ${
                  coverImage
                    ? `<img src="${coverImage}" alt="Cover for ${title}">`
                    : "<div>No cover available</div>"
                }
            </div>
            <div class="book-info">
                <h2 class="book-title">${title}</h2>
                <div class="book-author">${authors}</div>
                
                ${
                  subjects.length > 0
                    ? `
                <div class="book-subjects">
                    ${subjects
                      .slice(0, 3)
                      .map(
                        (subject) =>
                          `<span class="subject-tag">${subject}</span>`
                      )
                      .join("")}
                    ${
                      subjects.length > 3
                        ? `<span class="subject-tag">+${
                            subjects.length - 3
                          } more</span>`
                        : ""
                    }
                </div>`
                    : ""
                }
                
                <div class="book-meta">
                    <span class="book-id">ID: ${bookId}</span>
                    <span class="book-downloads">${downloadCount.toLocaleString()} downloads</span>
                </div>
            </div>
            <button class="${wishlistIconClass}" data-book-id="${bookId}" title="${wishlistButtonTitle}">♥</button>
        `;

    bookCard.innerHTML = cardContent;

    const wishlistBtn = bookCard.querySelector(".wishlist-icon");
    wishlistBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = wishlistBtn.getAttribute("data-book-id");
      toggleWishlist(id);
      wishlistBtn.classList.toggle("active");
      wishlistBtn.title = isWishlisted(id)
        ? "Remove from wishlist"
        : "Add to wishlist";
    });

    bookCard.addEventListener("click", () => {
      window.location.hash = `book/${bookId}`;
    });

    return bookCard;
  }

  async function fetchBookDetails(bookId) {
    booksContainer.innerHTML = "";
    loadingElement.classList.remove("hidden");
    errorElement.classList.add("hidden");
    paginationContainer.style.display = "none";

    try {
      const url = `${API_URL}/${bookId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const book = await response.json();
      displayBookDetails(book);
      loadingElement.classList.add("hidden");
    } catch (error) {
      loadingElement.classList.add("hidden");
      errorElement.classList.remove("hidden");
      errorElement.textContent = `Error fetching book details: ${error.message}. The book ID may be invalid.`;
      console.error("Error fetching book details:", error);
    }
  }

  function displayBookDetails(book) {
    const bookId = book.id;
    const title = book.title || "Unknown Title";
    const coverImage = book.formats["image/jpeg"] || "";

    const authors =
      book.authors
        .map(
          (author) =>
            `${author.name}${
              author.birth_year && author.death_year
                ? ` (${author.birth_year}-${author.death_year})`
                : ""
            }`
        )
        .join(", ") || "Unknown Author";

    const subjects = book.subjects || [];
    const bookshelves = book.bookshelves || [];
    const languages = book.languages || [];
    const downloadCount = book.download_count || 0;
    const formats = book.formats || {};
    const summaries = book.summaries || [];

    const wishlistIconClass = isWishlisted(bookId)
      ? "wishlist-icon active"
      : "wishlist-icon";

    const wishlistButtonTitle = isWishlisted(bookId)
      ? "Remove from wishlist"
      : "Add to wishlist";

    let formatButtons = "";
    Object.entries(formats).forEach(([type, url]) => {
      if (type !== "image/jpeg" && url) {
        const formatType = type.split("/")[1] || type;
        formatButtons += `<a href="${url}" target="_blank" class="format-button">${formatType}</a>`;
      }
    });

    const detailsHTML = `
      <div class="book-details">
        <div class="details-header">
          <button id="back-button" class="back-button">← Back</button>
          <button class="${wishlistIconClass}" id="details-wishlist-btn" data-book-id="${bookId}" title="${wishlistButtonTitle}">♥</button>
        </div>
        
        <div class="details-content">
          <div class="details-cover">
            ${
              coverImage
                ? `<img src="${coverImage}" alt="Cover for ${title}">`
                : "<div class='no-cover'>No cover available</div>"
            }
          </div>
          
          <div class="details-info">
            <h1 class="details-title">${title}</h1>
            <div class="details-author">${authors}</div>
            
            ${
              summaries && summaries.length > 0
                ? `<div class="details-summary">
                    <h3>Summary</h3>
                    <p>${summaries[0]}</p>
                   </div>`
                : ""
            }
            
            <div class="details-meta">
              ${
                languages.length > 0
                  ? `<div class="details-languages">
                      <h3>Languages</h3>
                      <p>${languages.join(", ").toUpperCase()}</p>
                     </div>`
                  : ""
              }
              
              <div class="details-downloads">
                <h3>Download Count</h3>
                <p>${downloadCount.toLocaleString()}</p>
              </div>
            </div>
            
            ${
              subjects.length > 0
                ? `<div class="details-subjects">
                    <h3>Subjects</h3>
                    <div class="tag-container">
                      ${subjects
                        .map(
                          (subject) =>
                            `<span class="subject-tag">${subject}</span>`
                        )
                        .join("")}
                    </div>
                   </div>`
                : ""
            }
            
            ${
              bookshelves.length > 0
                ? `<div class="details-bookshelves">
                    <h3>Bookshelves</h3>
                    <div class="tag-container">
                      ${bookshelves
                        .map(
                          (shelf) =>
                            `<span class="bookshelf-tag">${shelf}</span>`
                        )
                        .join("")}
                    </div>
                   </div>`
                : ""
            }
            
            <div class="details-formats">
              <h3>Available Formats</h3>
              <div class="formats-container">
                ${formatButtons}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    booksContainer.innerHTML = detailsHTML;

    document.getElementById("back-button").addEventListener("click", () => {
      window.history.back();
    });

    const wishlistBtn = document.getElementById("details-wishlist-btn");
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", () => {
        const id = wishlistBtn.getAttribute("data-book-id");
        toggleWishlist(id);
        wishlistBtn.classList.toggle("active");
        wishlistBtn.title = isWishlisted(id)
          ? "Remove from wishlist"
          : "Add to wishlist";
      });
    }
  }
});
