export default class BookCard {
  constructor(wishlistService) {
    this.wishlistService = wishlistService;
  }

  createBookCard(book) {
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

    const wishlistIconClass = this.wishlistService.isWishlisted(bookId)
      ? "wishlist-icon active"
      : "wishlist-icon";

    const wishlistButtonTitle = this.wishlistService.isWishlisted(bookId)
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
      const isActive = this.wishlistService.toggleWishlist(id);
      wishlistBtn.classList.toggle("active", isActive);
      wishlistBtn.title = isActive ? "Remove from wishlist" : "Add to wishlist";
    });

    bookCard.addEventListener("click", () => {
      window.location.hash = `book/${bookId}`;
    });

    return bookCard;
  }
}
