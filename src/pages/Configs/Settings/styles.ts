import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Text = styled.p<{ isBold? }>(
  ({ isBold }) => `
  margin-bottom: ${isBold ? 0 : '1em'};
  margin-top: 0;
  color: ${isBold ? colors.Grey300 : colors.Grey400};
  font-weight: ${isBold ? 'bold' : 'normal'};
`,
);

export const CardWrapper = styled.div`
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
  width: 100%;
  background-color: ${colors.White};
  border-radius: 16px;
  padding: 32px 24px;
`;

export const EditLink = styled.span`
  cursor: pointer;
  text-decoration: underline;
`;

export const StyleSelectedOptions = styled.div`
  img {
    max-width: 24px;
    max-height: 16px;
    margin-right: 5px;
    border-radius: 2px;
  }
  height: 58.84px;
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
  p {
    font-family: 'Inter';
    font-style: normal; 
    font-weight: 400;
    font-size: 12px;
    line-height: 15px;
  }
  label {
    color: #202370;
    position: absolute;
    z-index: 1;
    margin: 5px;
    margin-left: 10px;
    font-size: 11px;
    padding-top: 3px;
    padding-left: 5px;
    font-weight: bold;
  }
  div {
    align-items: flex-start;
    align-content: center;
    justify-content: space-between;
    padding: 28px 16px;
    display: flex;
  }
`;
