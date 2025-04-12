const API_URL = "https://gutendex.com/books";

export default class BooksAPI {
  async fetchBooks(searchTerm = "", genre = "", bookIds = [], page = 1) {
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

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async fetchBookDetails(bookId) {
    try {
      const url = `${API_URL}/${bookId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async loadPageFromUrl(url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}
