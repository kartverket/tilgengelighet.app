/**
 * Asynchronously loads the component for NotFoundPage
 */

import * as React from 'react';
import { lazyLoad } from 'app/utils/loadable';
import { LoadingIndicator } from 'app/components/LoadingIndicator';

export const ObjectPage = lazyLoad(
  () => import('./index'),
  module => module.ObjectPage,
  {
    fallback: <LoadingIndicator />,
  },
);
