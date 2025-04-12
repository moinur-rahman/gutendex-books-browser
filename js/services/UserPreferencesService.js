export default class UserPreferencesService {
  constructor() {
    this.preferences = {
      searchTerm: "",
      genre: "",
    };
    this.loadPreferences();
  }

  loadPreferences() {
    const storedPreferences = localStorage.getItem("gutendexPreferences");
    if (storedPreferences) {
      this.preferences = JSON.parse(storedPreferences);
    }
    return this.preferences;
  }

  savePreferences(searchTerm, genre) {
    this.preferences = {
      searchTerm,
      genre,
    };
    localStorage.setItem(
      "gutendexPreferences",
      JSON.stringify(this.preferences)
    );
  }

  getSearchTerm() {
    return this.preferences.searchTerm;
  }

  getGenre() {
    return this.preferences.genre;
  }
}
