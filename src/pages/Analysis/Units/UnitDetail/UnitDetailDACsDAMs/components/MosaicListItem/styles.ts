import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const getStatusColor = (isPrimary: boolean, status: number) => {
  if (isPrimary) {
    if (status === 1) {
      return { background: '#363BC4', border: '#363BC4', font: '#FFFFFF' };
    }

    return { background: '#B8B8B8', border: '#B8B8B8', font: '#FFFFFF' };
  }

  if (status === 1) {
    return { background: '#FFFFFF', border: '#3DD598', font: '#3DD598' };
  }

  return { background: '#FFFFFF', border: '#FF5454', font: '#FF5454' };
};

export const StatusBox = styled.div<{ isPrimary: boolean, status: number, dat?: boolean }>`
  width: 80px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  border: 1px solid ${({ isPrimary, status, dat }) => (dat ? '#B8B8B8' : getStatusColor(isPrimary, status).border)};
  background-color: ${({ isPrimary, status, dat }) => (dat ? '#FFFFFF' : getStatusColor(isPrimary, status).background)};
  border-radius: 4px;

  color: ${({ isPrimary, status, dat }) => (dat ? '#B8B8B8' : getStatusColor(isPrimary, status).font)};
  font-weight: bold;
  font-size: 9px;
  text-transform: uppercase;
`;

export const SuperiorBar = styled.div<{ size: number }>`
  background-color: #363BC4;
  border-radius: 4px 4px 0 0;

  width: 100%; // subtrair automação
  height: 7.5px;
`;

export const ListItemContainer = styled.div<{ size: number }>`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  width: auto; // subtrair automação

  border: 1px solid rgba(0, 0, 0, 0.21);
  border-top: 0;
  border-radius: 0 0 4px 4px;
  height: 100%;
`;

export const ListItemDataContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  > div {
    padding-top: 15px;
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 199px;
    width: 220px;
    height: 100%;
    margin-right: 18px;
    padding-left: 20px;
    &:first-child {
      margin-right: 0;
    }
    &:last-child .healthContainer {
      border-right: 0;
    }
  }

`;

export const Title = styled.strong`
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  margin: 10px 0 0 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #DCDCDC;
`;

export const Title2 = styled.strong`
  font-size: 14px;
  font-weight: 700;
  line-height: normal;
  padding: 0 15px;
`;

export const TransparentLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
  line-height: normal;
  display: block;
  width: max-content;
  &:hover {
    color: inherit;
    text-decoration: inherit;
  }
`;

export const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;

  > span {
    font-size: 9px;
    line-height: 11px;
    color: #656565;
  }

  > strong {
    font-size: 10px;
    line-height: 12px;
  }
`;

export const IconWiFiRealTime = styled.div`
display: flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;


  svg {
    width: 16px;
    height: 16px;
  }
`;

export const DataContainer = styled.div<{ expanded: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  line-height: normal;
  width: 170px;
  height: 100%;
  /* margin: 0 15px; */
  margin-top: ${({ expanded }) => !expanded && '5px'};
`;
