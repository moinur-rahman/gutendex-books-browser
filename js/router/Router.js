export default class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = window.location.hash || "#home";
    this.defaultRoute = "#home";

    window.addEventListener("hashchange", this.handleRouteChange.bind(this));
  }

  addRoute(route, handler) {
    this.routes[route] = handler;
  }

  init() {
    this.handleRouteChange();
  }

  navigateTo(route) {
    window.location.hash = route;
  }

  handleRouteChange() {
    this.currentRoute = window.location.hash || this.defaultRoute;

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    if (this.currentRoute === "#home" || this.currentRoute === "") {
      document.getElementById("nav-home").classList.add("active");
      if (this.routes["#home"]) {
        this.routes["#home"]();
      }
    } else if (this.currentRoute === "#wishlist") {
      document.getElementById("nav-wishlist").classList.add("active");
      if (this.routes["#wishlist"]) {
        this.routes["#wishlist"]();
      }
    } else if (this.currentRoute.startsWith("#book/")) {
      const bookId = this.currentRoute.split("/")[1];
      if (bookId && this.routes["#book"]) {
        this.routes["#book"](bookId);
      } else {
        this.navigateTo("home");
      }
    }
  }
}
