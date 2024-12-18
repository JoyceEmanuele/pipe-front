import styled from 'styled-components';

export const InputSearchDesktopWrapper = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

export const InputSearchMobileWrapper = styled.div`
  display: block;
  @media (min-width: 768px) {
    display: none;
  }
`;
