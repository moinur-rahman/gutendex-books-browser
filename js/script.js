document.addEventListener("DOMContentLoaded", () => {
  const booksContainer = document.getElementById("books-container");
  const loadingElement = document.getElementById("loading");
  const errorElement = document.getElementById("error");

  const API_URL = "https://gutendex.com/books";

  fetchBooks();

  async function fetchBooks() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      displayBooks(data.results);

      loadingElement.classList.add("hidden");
    } catch (error) {
      loadingElement.classList.add("hidden");
      errorElement.classList.remove("hidden");
      errorElement.textContent = `Error fetching books: ${error.message}`;
      console.error("Error fetching books:", error);
    }
  }

  function displayBooks(books) {
    if (!books || books.length === 0) {
      errorElement.classList.remove("hidden");
      errorElement.textContent = "No books found.";
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
    const bookId = book.id || "N/A";

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
        `;

    bookCard.innerHTML = cardContent;
    return bookCard;
  }
});
