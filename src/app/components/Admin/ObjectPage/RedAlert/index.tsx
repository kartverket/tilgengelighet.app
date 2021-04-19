import styled from 'styled-components';
import { Alert } from '@material-ui/lab';
import screen from '../../../../utils/screens';

export default styled(Alert)`
  background-color: rgba(176, 0, 32, 0.1);
  .MuiSvgIcon-root {
    color: #b00020;
  }

  .MuiTypography-body1 {
    font-family: 'Arial MT', Arial;
    color: black;
  }

  @media ${screen['md-down']} {
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
      0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.2);
  }
`;
