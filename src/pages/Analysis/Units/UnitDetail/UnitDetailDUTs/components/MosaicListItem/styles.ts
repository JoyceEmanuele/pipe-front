import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const SuperiorBar = styled.div`
  background-color: #363BC4;
  border-radius: 4px 4px 0 0;

  width: 100%;
  height: 7.5px;
`;

export const LateralBar = styled.div<{ color?: string }>`
  background-color: ${(props) => props.color || '#B1B1B1'};
  border-radius: 3px;
  margin: 7px 7px 10px 9px;

  width: 6px;
  height: 92%;
`;

export const ListItemContainer = styled.div`
  display: flex;
  flex: 1;

  width: 100%;
  height: 100%;

  border: 1px solid rgba(0, 0, 0, 0.21);
  border-top: 0;
  border-radius: 0 0 4px 4px;

  cursor: pointer;
`;

export const ListItemDataContainer = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  padding: 8px 0 8px 15px;
`;

export const ListItemDutQA = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto 50px;
  grid-column-gap: 5px;
  grid-row-gap: 10px;
  height: 63%;
`;

export const ItemAreaColorHealth = styled.div<{ color?: string }>`
  background-color: ${(props) => props.color || '#B1B1B1'};
  border-radius: 3px;
  width: 6px;
  height: 80%;
`;

export const Title = styled.strong`
  font-size: 14px;
  line-height: 12px;
`;

export const InformationContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: flex-end;
  margin-top: 2px;
`;

export const InformationLabel = styled.span`
  font-size: 14px;
  line-height: 11px;
  font-weight: 600;
  color: #181842;
  padding-bottom: 4px;
`;

export const InformationValue = styled.strong`
  display: contents;

  font-size: 22px;
  line-height: 22px;
  font-weight: 800;
`;

export const InformationUnit = styled.span`
  display: contents;

  font-size: 12px;
  line-height: 15px;
  font-weight: 500;
  color: #7A7A7A;
`;

export const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;

  background-color: #ffffff;

  font-family: 'Inter';
  font-size: 12px;
  line-height: 11px;

  div {
    display: flex;
    justify-content: space-between;

    div {
      display: flex;
      flex-direction: column;
    }
  }

  strong {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  span {
    margin: 0;
    padding: 2px 0;
  }
`;

export const TransparentLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
  &:hover {
    color: inherit;
    text-decoration: inherit;
  }
`;
