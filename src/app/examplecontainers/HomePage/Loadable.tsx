/**
 * Asynchronously loads the component for HomePage
 */

import { lazyLoad } from 'app/utils/loadable';

export const HomePage = lazyLoad(
  () => import('./index'),
  module => module.HomePage,
);
