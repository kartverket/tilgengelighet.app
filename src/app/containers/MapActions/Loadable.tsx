/**
 * Asynchronously loads the component for NotFoundPage
 */

import * as React from 'react';
import { lazyLoad } from 'app/utils/loadable';
import { LoadingIndicator } from 'app/components/LoadingIndicator';

export const MapActions = lazyLoad(
  () => import('./index'),
  module => module.MapActions,
  {
    fallback: <LoadingIndicator />,
  },
);
