document.addEventListener("DOMContentLoaded", () => {
  const booksContainer = document.getElementById("books-container");
  const loadingElement = document.getElementById("loading");
  const errorElement = document.getElementById("error");
  const searchInput = document.getElementById("search-input");
  const genreSelect = document.getElementById("genre-select");
  const wishlistToggle = document.getElementById("wishlist-toggle");

  const API_URL = "https://gutendex.com/books";
  let searchTimeout = null;
  let currentSearchTerm = "";
  let currentGenre = "";
  let wishlist = {};
  let showingWishlist = false;
  let allBooks = [];

  loadWishlist();
  fetchBooks();

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

    if (showingWishlist) {
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
    if (showingWishlist) {
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
      return;
    }

    booksContainer.innerHTML = "";
    loadingElement.classList.remove("hidden");
    errorElement.classList.add("hidden");
    fetchBooks("", "", wishlistIds);
  }

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);

    const searchTerm = e.target.value.trim();

    searchTimeout = setTimeout(() => {
      currentSearchTerm = searchTerm;
      booksContainer.innerHTML = "";
      loadingElement.classList.remove("hidden");
      errorElement.classList.add("hidden");

      if (showingWishlist) {
        fetchWishlistBooks();
      } else {
        fetchBooks(currentSearchTerm, currentGenre);
      }
    }, 500);
  });

  genreSelect.addEventListener("change", (e) => {
    currentGenre = e.target.value;
    booksContainer.innerHTML = "";
    loadingElement.classList.remove("hidden");
    errorElement.classList.add("hidden");

    if (showingWishlist) {
      fetchWishlistBooks();
    } else {
      fetchBooks(currentSearchTerm, currentGenre);
    }
  });

  wishlistToggle.addEventListener("click", () => {
    showingWishlist = !showingWishlist;
    wishlistToggle.textContent = showingWishlist
      ? "Show All Books"
      : "Show Wishlist";
    wishlistToggle.classList.toggle("active");

    if (showingWishlist) {
      fetchWishlistBooks();
    } else {
      fetchBooks(currentSearchTerm, currentGenre);
    }
  });

  async function fetchBooks(searchTerm = "", genre = "", bookIds = []) {
    try {
      let url = API_URL;
      const params = [];

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

      if (bookIds.length > 0) {
        displayBooks(data.results);
      } else {
        allBooks = data.results;
        displayBooks(allBooks);
      }

      loadingElement.classList.add("hidden");
    } catch (error) {
      loadingElement.classList.add("hidden");
      errorElement.classList.remove("hidden");
      errorElement.textContent = `Error fetching books: ${error.message}`;
      console.error("Error fetching books:", error);
    }
  }

  function displayBooks(books) {
    booksContainer.innerHTML = "";

    if (!books || books.length === 0) {
      errorElement.classList.remove("hidden");
      errorElement.textContent = showingWishlist
        ? "Your wishlist is empty. Add some books by clicking the heart icon."
        : "No books found matching your search.";
      return;
    }

    books.forEach((book) => {
      const bookCard = createBookCard(book);
      booksContainer.appendChild(bookCard);
    });
  }

  function createBookCard(book) {
    const bookCard = document.createElement("div");
    bookCard.className = "book-card";

    const coverImage = book.formats["image/jpeg"] || "";
    const title = book.title || "Unknown Title";
    const bookId = book.id || "N/A";

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
                </div>
            </div>
            <button class="${wishlistIconClass}" data-book-id="${bookId}" title="${wishlistButtonTitle}">♥</button>
        `;

    bookCard.innerHTML = cardContent;

    const wishlistBtn = bookCard.querySelector(".wishlist-icon");
    wishlistBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = wishlistBtn.getAttribute("data-book-id");
      toggleWishlist(id);
      wishlistBtn.classList.toggle("active");
      wishlistBtn.title = isWishlisted(id)
        ? "Remove from wishlist"
        : "Add to wishlist";
    });

    return bookCard;
  }
});
