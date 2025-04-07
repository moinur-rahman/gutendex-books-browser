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
      displayFilteredBooks();
    }
  }

  function isWishlisted(bookId) {
    return !!wishlist[bookId];
  }

  function displayFilteredBooks() {
    if (showingWishlist) {
      const wishlistedBooks = allBooks.filter((book) => isWishlisted(book.id));
      displayBooks(wishlistedBooks);
    } else {
      displayBooks(allBooks);
    }
  }

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);

    const searchTerm = e.target.value.trim();

    searchTimeout = setTimeout(() => {
      currentSearchTerm = searchTerm;
      booksContainer.innerHTML = "";
      loadingElement.classList.remove("hidden");
      errorElement.classList.add("hidden");
      fetchBooks(currentSearchTerm, currentGenre);
    }, 500);
  });

  genreSelect.addEventListener("change", (e) => {
    currentGenre = e.target.value;
    booksContainer.innerHTML = "";
    loadingElement.classList.remove("hidden");
    errorElement.classList.add("hidden");
    fetchBooks(currentSearchTerm, currentGenre);
  });

  wishlistToggle.addEventListener("click", () => {
    showingWishlist = !showingWishlist;
    wishlistToggle.textContent = showingWishlist
      ? "Show All Books"
      : "Show Wishlist";
    wishlistToggle.classList.toggle("active");

    displayFilteredBooks();
  });

  async function fetchBooks(searchTerm = "", genre = "") {
    try {
      let url = API_URL;
      const params = [];

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
      allBooks = data.results;
      displayFilteredBooks();

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

    const cardContent = `
            <div class="book-cover">
                ${
                  coverImage
                    ? `<img src="${coverImage}" alt="Cover for ${title}">`
                    : "<div>No cover available</div>"
                }
                <button class="${wishlistIconClass}" data-book-id="${bookId}">♥</button>
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
        `;

    bookCard.innerHTML = cardContent;

    const wishlistBtn = bookCard.querySelector(".wishlist-icon");
    wishlistBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = wishlistBtn.getAttribute("data-book-id");
      toggleWishlist(id);
      wishlistBtn.classList.toggle("active");
    });

    return bookCard;
  }
});
