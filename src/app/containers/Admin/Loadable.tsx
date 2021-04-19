/**
 * Asynchronously loads the component for NotFoundPage
 */

import * as React from 'react';
import { lazyLoad } from 'app/utils/loadable';
import { LoadingIndicator } from 'app/components/LoadingIndicator';

export const AdminPage = lazyLoad(
  () => import('./index'),
  module => module.AdminPage,
  {
    fallback: <LoadingIndicator />,
  },
);
