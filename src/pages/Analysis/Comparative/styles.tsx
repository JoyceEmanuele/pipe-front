import styled from 'styled-components';

import { Button } from '~/components';
import { colors } from '~/styles/colors';

export const ActionButton = styled(Button)`
  padding: 5px;
  width: 35px;
  border-width: 0;
  background-color: white;
  `;

export const CustomInput = styled.div`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  color: #000;
  width: 100%;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
  border: 0.7px solid ${colors.GreyInputBorder}
  align-content: center;
  align-items: center;
  justify-content: center;

  .select-search__option {
    height: auto;
    min-height: 36px;
  }
`;

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;
