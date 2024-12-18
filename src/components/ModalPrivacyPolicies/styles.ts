import styled from 'styled-components';
import { ModalWindow } from '../ModalWindow';

export const StyledModalPrivacyPolicies = styled(ModalWindow)`
  max-width: 290px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  color: #2E2E2E;

  @media (max-width: 768px) {
    min-width: fit-content;
  }
`;

export const ModalPrivacyPoliciesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    color: #2E2E2E;
    font-family: Inter;
    font-size: 17.154px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;

    margin: 0;
  }

  a {
    color: #2E2E2E;
    text-align: center;
    font-family: Inter;
    font-size: 10.866px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-decoration-line: underline;
  }
`;

export const ModalPrivacyPoliciesActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  a {
    color: #6C6B6B;

    text-align: center;
    font-family: Inter;
    font-size: 10.866px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-decoration-line: underline;
  }

  button {
    width: 50%;
  }
`;
