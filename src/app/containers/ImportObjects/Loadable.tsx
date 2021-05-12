/**
 * Asynchronously loads the component for NotFoundPage
 */

import * as React from 'react';
import { lazyLoad } from 'app/utils/loadable';
import { LoadingIndicator } from 'app/components/LoadingIndicator';

export const ImportObjects = lazyLoad(
  () => import('./index'),
  module => module.ImportObjects,
  {
    fallback: <LoadingIndicator />,
  },
);
