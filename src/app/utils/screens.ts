export const up = {
  'sm-up': 576,
  'md-up': 768,
  'lg-up': 992,
  'xl-up': 1200,
};

export const down = {
  'xs-down': 575.98,
  'sm-down': 767.98,
  'md-down': 991.98,
  'lg-down': 1199.98,
};
// these values based on bootstrap 4 breakpoints

const minWidthScreens = Object.keys(up).reduce(
  (total, key) => ({
    ...total,
    [key]: `(min-width: ${up[key]}px)`,
  }),
  {},
);

const maxWidthScreens = Object.keys(down).reduce(
  (total, key) => ({
    ...total,
    [key]: `(max-width: ${down[key]}px)`,
  }),
  {},
);

export default { ...minWidthScreens, ...maxWidthScreens };
