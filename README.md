# Gutendex Books Browser

A modern web application for browsing Project Gutenberg's extensive collection of free ebooks through the Gutendex API.

## Live Demo

Access the live application: [Gutendex Books Browser](https://moinur-rahman.github.io/gutendex-books-browser/)

## Features

- Browse books from Project Gutenberg's collection
- Search for books by title or author
- Filter books by genre
- Add books to your wishlist
- Responsive design for various screen sizes
- Pagination support
- Book detail view

## Project Structure

```
gutendex-books-browser/
├── index.html         # Main HTML entry point
├── css/
│   └── styles.css     # Main stylesheet
└── js/
    ├── app.js         # Main application entry point
    ├── api/
    │   └── BooksAPI.js # API integration with Gutendex
    ├── components/
    │   ├── BookCard.js       # Book card display component
    │   ├── BookDetails.js    # Book details view component
    │   └── Pagination.js     # Pagination component
    ├── router/
    │   └── Router.js         # Client-side router
    ├── services/
    │   ├── UserPreferencesService.js  # User preferences management
    │   └── WishlistService.js         # Wishlist management
```

## Usage

- **Browsing Books**: The home page displays books in a grid format with pagination
- **Searching**: Type in the search box to find books by title or author
- **Filtering by Genre**: Use the dropdown to filter books by genre
- **Wishlist**: Click the heart icon on a book card to add it to your wishlist
- **Book Details**: Click on a book card to view detailed information

## API Integration

This project uses the [Gutendex API](https://gutendex.com/) - a JSON web API for Project Gutenberg ebook metadata.


## Acknowledgments

- [Project Gutenberg](https://www.gutenberg.org/) for providing free ebooks
- [Gutendex](https://gutendex.com/) for providing the API
