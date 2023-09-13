class Router {
  constructor() {
    this.tree = {
      $default: {},
    };

    this.api_route = null;
    this.client_folder = null;
  }

  use(path, router) {
    this.addTreeBranch(path, router.tree);
  }

  get(path, handler) {
    this.addMethod('GET', path, handler);
  }

  post(path, handler) {
    this.addMethod('POST', path, handler);
  }

  put(path, handler) {
    this.addMethod('PUT', path, handler);
  }

  delete(path, handler) {
    this.addMethod('DELETE', path, handler);
  }

  addMethod(method, path, handler) {
    if (path == null || path === '' || path === '/') path = '$default';

    if (path.split('/').filter(Boolean).length > 1) {
      throw new Error('Path must be a single segment');
    }

    if (path.startsWith('/')) { path = path.substring(1); }

    if (this.tree[path] == null) { this.tree[path] = {}; }

    this.tree[path][method] = handler;
  }

  /**
   * @param {string} route Default: '/api'
   */
  serveAPI(route) {
    if (route == null || route === '') route = '/api/';

    if (!route.startsWith('/')) { route = '/' + route; }
    if (!route.endsWith('/')) { route = route + '/'; }

    this.api_route = route;
  }

  serveClient(clientFolder) {
    if (clientFolder == null || clientFolder === '') clientFolder = 'client';
    this.client_folder = clientFolder;
  }

  async handle(req) {
    let urlPath = new URL(req.url).pathname;

    if (this.api_route && urlPath.startsWith(this.api_route)) {
      urlPath = urlPath.substring(this.api_route.length);

      const method = req.method;
      const pathParts = urlPath.split('/').filter(Boolean);
      let branch = this.tree;
      for (const part of pathParts) {
        if (branch[part] == null) {
          return null;
        }
        branch = branch[part];
      }

      if (branch[method] === undefined) branch = branch.$default;
      return await branch[method](req);
    }

    if (this.client_folder) {
      let fileToServe = this.client_folder;

      if (urlPath == null || urlPath === '/') {
        fileToServe += '/index.html';
      } else {
        fileToServe += urlPath;
      }

      return new Response(Bun.file(fileToServe));
    }
  }

  addTreeBranch(path, treeToAdd) {
    const pathParts = path.split('/').filter(Boolean);
    let branch = this.tree;
    for (const part of pathParts) {
      if (branch[part] == null) {
        branch[part] = {};
      }
      branch = branch[part];
    }

    if (treeToAdd != null) { Object.assign(branch, treeToAdd); }
  }

  treeAtPath(path) {
    const pathParts = path.split('/').filter(Boolean);
    let branch = this.tree;
    for (const part of pathParts) {
      if (branch[part] == null) {
        return null;
      }
      branch = branch[part];
    }
    return branch;
  }
}

module.exports = Router;
