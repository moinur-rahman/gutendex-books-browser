export default class BookDetails {
  constructor(wishlistService) {
    this.wishlistService = wishlistService;
  }

  displayBookDetails(book, container) {
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

    const wishlistIconClass = this.wishlistService.isWishlisted(bookId)
      ? "wishlist-icon active"
      : "wishlist-icon";

    const wishlistButtonTitle = this.wishlistService.isWishlisted(bookId)
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

    container.innerHTML = detailsHTML;

    document.getElementById("back-button").addEventListener("click", () => {
      window.history.back();
    });

    const wishlistBtn = document.getElementById("details-wishlist-btn");
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", () => {
        const id = wishlistBtn.getAttribute("data-book-id");
        const isActive = this.wishlistService.toggleWishlist(id);
        wishlistBtn.classList.toggle("active", isActive);
        wishlistBtn.title = isActive
          ? "Remove from wishlist"
          : "Add to wishlist";
      });
    }
  }
}
