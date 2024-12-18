import styled from 'styled-components';
import { colors } from '~/styles/colors';

export const OrderColumnModal = styled.div`
  list-style-type: none;
  padding: 7px;
  border: 1px solid lightgrey;
  font-weight: bold;
  font-size: 12px;
  border-radius: 10px;
  height: 36px;
  width: 100%;
  min-width: 250px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  cursor: grab;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 22px;
  width: 22px;
`;

export const ModalCancel = styled.p`
  font-size: 13px;
  color: ${colors.Blue300};
  text-decoration: underline;
  text-align: initial;
  margin-top: 8px;
  &:hover {
    color: ${colors.Blue400};
  }
`;

export const ModalTitle = styled.span`
  text-align: right;
  font-size: 13px;
  font-weight: 700;
`;

export const ModalSubTitle = styled.p`
  font-size: 11px;
  font-weight: 400;
`;

export const HorizontalLine = styled.div`
  width: 100%;
  height: 2px;
  background: ${colors.Grey100};
  margin: 10px 0;
`;
