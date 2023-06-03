import { App } from 'vue';

import { Router, createRouter, createWebHistory } from 'vue-router';
import multiguard from 'vue-router-multiguard';

import generatedRoutes from 'virtual:generated-pages';
import { setupLayouts } from 'virtual:generated-layouts';

import * as middlewares from '../middleware/index';
import CookieService from './CookieService';

const routes = setupLayouts(generatedRoutes);

export function createInternalRouter(app: App<Element>) {
  routes.forEach((route, routeIndex) => {
    const typedMiddleware : { [index: string]:any } = middlewares;
    if (route.meta?.middleware) {
      const namesOfMiddlewares: any = route.meta.middleware;
      const middlewaresToAdd = namesOfMiddlewares
        .split(',')
        .map((name: string) => typedMiddleware[name]);
      const defaultMiddlewares = [middlewares.msTeamsSessionHandler];
      routes[routeIndex].beforeEnter = multiguard([...defaultMiddlewares, ...middlewaresToAdd]);
    }
  });

  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  router.beforeEach(async (to, from) => {
    // only update feature flag when page changes
    if (to.name !== from.name) {
      await app.config.globalProperties.$featureFlags.updateFeatureFlags();
      app.config.globalProperties.$featureFlags.setUserAttributes({
        ...app.config.globalProperties.$user.userStore,
        isSuper: app.config.globalProperties.$user.isSuper || false,
        requestCountry: app.config.globalProperties?.store?.state?.serverData?.requestCountry || 'US',
        quizizz_uid: CookieService.get('quizizz_uid'),
        slot: CookieService.get('QUIZIZZ_EXP_SLOT') || '0',
        experiment: CookieService.get('QUIZIZZ_EXP_NAME') || 'main',
      });
    }

    // adding the property $appData rather than $data because $data is modified by each component
    app.config.globalProperties.$appData = {
      ...(app.config.globalProperties?.$appData || {}),
      ...(to.params || {}),
    };
  });

  router.afterEach((to) => {
    // replace it with any utility if needed
  });

  return router;
}

let routerInstance: Router | null = null;

export default function getRouter(app: App<Element> | null = null) : Router {
  if (!routerInstance) {
    if (!app) {
      throw new Error('App is needed to create a Router, its created in main.ts during app initialization');
    }
    routerInstance = createInternalRouter(app!);
  }
  return routerInstance;
}
