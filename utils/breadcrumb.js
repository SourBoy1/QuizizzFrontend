class Breadcrumb {
  constructor() {
    this.actions = [];
    this.mutations = [];
    this.breadcrumbs = [];
  }

  addBreadcrumb(payload) {
    const currentDate = new Date();
    this.breadcrumbs = [`${payload}|${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`, ...(this.breadcrumbs.slice(0, 200))];
  }

  addAction(payload) {
    const currentDate = new Date();
    this.actions = [`${payload}|${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`, ...(this.actions.slice(0, 200))];
  }

  addMutation(payload) {
    const currentDate = new Date();
    this.mutations = [`${payload}|${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`, ...(this.mutations.slice(0, 500))];
  }

  getActions() {
    return this.actions;
  }

  getMutations() {
    return this.mutations;
  }

  getBreadcrumbs() {
    return this.breadcrumbs;
  }
}

let instance = null;

export default function getInstance() {
  if (!instance) {
    instance = new Breadcrumb();
  }
  return instance;
}
