import styled from 'styled-components';
import { Checkbox } from '@material-ui/core';

interface testCustomProps {
  custom_color: string;
}

export default styled(Checkbox)<testCustomProps>`
  &.Mui-checked,
  &.MuiCheckbox-indeterminate {
    svg {
      color: ${props => props.custom_color || 'gray'};
    }
  }
`;
