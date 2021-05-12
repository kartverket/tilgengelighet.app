import styled from 'styled-components';
import { Button } from '@material-ui/core';

interface Props {
  custom_color?: string;
  custom_text_transform?: string;
  custom_border?: string;
  custom_background_color?: string;
  custom_background_color_hover?: string;
  is_pill_button?: 1 | undefined;
  is_bold_text?: 1 | undefined;
}

export default styled(Button)<Props>`
  color: ${props => props.custom_color};
  background-color: ${props => props.custom_background_color};

  text-transform: ${props => props.custom_text_transform};
  border: ${props => props.custom_border};

  border-radius: ${({ is_pill_button }) => is_pill_button && '20px'};

  font-weight: ${({ is_bold_text }) => is_bold_text && 'bold'};

  &:hover {
    color: ${props => props.custom_color};
    background-color: ${({
      custom_background_color,
      custom_background_color_hover,
    }) => custom_background_color_hover || custom_background_color};
    border: ${props => props.custom_border};
  }
`;
