import styled from 'styled-components';
import { Menu } from '@material-ui/core';
import screens from '../../../../utils/screens';

export default styled(Menu)`
  @media ${screens['md-down']} {
    .MuiPaper-root {
      left: 0 !important;
      bottom: 0;
      min-width: 100vw;
      max-height: 50vh;
      top: unset !important;
    }
  }
`;
