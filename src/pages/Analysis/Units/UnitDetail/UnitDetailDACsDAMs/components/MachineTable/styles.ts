import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { healthLevelColor } from '~/components/HealthIcon';

const getStatusColor = (isPrimary: boolean, status: number) => {
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

export const TableExpandButton = styled.button`
  width: 25px;
  height: 25px;

  background-color: #ffffff;
  border: 0.8px solid rgba(71, 71, 71, 0.31);
  border-radius: 8px;

  cursor: pointer;
`;

export const Icon = styled.div<{ health: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 19px;
  height: 19px;
  border-radius: 5px;
  background-color: ${({ health }) => healthLevelColor(health)};

  > svg {
    width: 11px;
    height: 11px;
  }
`;

export const StatusBox = styled.div<{ isPrimary: boolean, status: number, dat?: boolean }>`
  width: 40px;
  height: 13px;
  display: flex;
  justify-content: center;
  align-items: center;

  border: 1px solid ${({ isPrimary, status, dat }) => (dat ? '#B8B8B8' : getStatusColor(isPrimary, status).border)};
  background-color: ${({ isPrimary, status, dat }) => (dat ? '#FFFFFF' : getStatusColor(isPrimary, status).background)};
  border-radius: 4px;

  color: ${({ isPrimary, status, dat }) => (dat ? '#B8B8B8' : getStatusColor(isPrimary, status).font)};
  font-weight: bold;
  font-size: 6px;
  line-height: 7px;
  text-transform: uppercase;

  & + & {
    margin-left: 6px;
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

export const TableItemCell = styled.div`
  font-size: 12.6px;
`;
