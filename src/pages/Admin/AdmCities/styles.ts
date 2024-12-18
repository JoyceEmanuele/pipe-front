import styled from 'styled-components';
import { Button } from '~/components';
import { colors } from '~/styles/colors';
import { CloseIcon } from '~/icons';

export const SimpleButton = styled(Button)`
  width: initial;
  padding: 8px 15px;
  margin: 7px 7px;
`;

export const ContainerInputs = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 42rem;
  justify-content: center`;

export const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
  position: relative;
`;

export const LoaderContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
  width: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Scroll = styled.div`
  overflow-x: auto;
`;

export const Container = styled.table`
  width: 100%;
`;

export const Head = styled.thead`
  text-align: left;
`;

export const Body = styled.tbody`
  overflow-x: scroll;
`;

export const HeaderCell = styled.th`
  padding: 0 10px;
  color: ${colors.DarkGrey};
  background-color: ${colors.White};
  border-bottom: solid 1px ${colors.Grey};
`;

export const HeaderTitle = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  position: relative;
  font-size: 0.75em;
`;

export const Data = styled.td`
  color: ${colors.DarkGrey};
  min-width: 100px;
  padding: 0 10px;
`;

export const Row = styled.tr`
  height: 50px;
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.Grey};
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export const SelectButton = styled.span`
  padding: 5px 10px;
  border-radius: 3px;
  border: 1px solid ${colors.DarkGrey};
  cursor: pointer;
`;

export const CloseModal = styled(CloseIcon)`
  width: 0.8rem;
  height: 0.8rem;
  cursor: pointer;
`;

export const ModalTitle = styled.h3`
  color: ${colors.Blue500};
`;

export const ModalText = styled.p`
  font-size: 1em;
  color: ${colors.Grey400};
  width: 95%;
  margin-bottom: 35px;
`;

export const ModalCancel = styled.p`
  font-size: 1em;
  color: ${colors.Blue300};
  text-decoration: underline;
  width: 100%;
  text-align: center;
  margin-top: 8px;
  &:hover {
    color: ${colors.Blue400};
  }
`;
