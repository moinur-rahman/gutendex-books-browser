export default class WishlistService {
  constructor() {
    this.wishlist = {};
    this.loadWishlist();
  }

  loadWishlist() {
    const storedWishlist = localStorage.getItem("gutendexWishlist");
    if (storedWishlist) {
      this.wishlist = JSON.parse(storedWishlist);
    }
    return this.wishlist;
  }

  saveWishlist() {
    localStorage.setItem("gutendexWishlist", JSON.stringify(this.wishlist));
  }

  toggleWishlist(bookId) {
    if (this.wishlist[bookId]) {
      delete this.wishlist[bookId];
    } else {
      this.wishlist[bookId] = true;
    }
    this.saveWishlist();
    return this.isWishlisted(bookId);
  }

  isWishlisted(bookId) {
    return !!this.wishlist[bookId];
  }

  getWishlistIds() {
    return Object.keys(this.wishlist);
  }
}
