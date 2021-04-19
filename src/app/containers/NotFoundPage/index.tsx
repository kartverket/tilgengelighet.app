/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import * as React from 'react';

import H1 from 'app/components/H1';

export function NotFoundPage() {
  return (
    <article>
      <H1>Page not found</H1>
    </article>
  );
}
