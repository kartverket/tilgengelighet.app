/**
 * Asynchronously loads the component for NotFoundPage
 */

import { lazyLoad } from 'app/utils/loadable';

export const NotFoundPage = lazyLoad(
  () => import('./index'),
  module => module.NotFoundPage,
);
