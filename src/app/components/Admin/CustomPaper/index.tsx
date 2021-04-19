import styled from 'styled-components';
import { Paper } from '@material-ui/core';

interface Props {
  custom_radius?: string;
}

const CustomPaper = styled(Paper)<Props>`
  border-radius: ${props => props.custom_radius};
`;

export default CustomPaper;
