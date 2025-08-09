// Simple client-side router
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.onRouteChange = null;
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.history.pushState({}, '', `#${path}`);
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const route = this.routes[hash];
    
    if (route) {
      this.currentRoute = hash;
      if (this.onRouteChange) {
        this.onRouteChange(hash);
      }
      route();
    } else {
      // Default to home
      this.navigate('home');
    }
  }

  init() {
    window.addEventListener('popstate', () => this.handleRoute());
    this.handleRoute();
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  setOnRouteChange(callback) {
    this.onRouteChange = callback;
  }
}

export const router = new Router();