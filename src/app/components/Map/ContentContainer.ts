import styled from 'styles/styled-components';

const ContentContainer = styled.div`
  padding: 20px 16px;
  position: absolute;
  width: 340px;
  z-index: 200;
  @media only screen and (max-width: 600px) {
    width: 100%;
}
`;

export default ContentContainer;
