import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const Title = styled.strong`
  font-size: 12px;
  margin-bottom: 2px;
`;

export const Subtitle = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: #6D6D6D;
`;

export const RealTimeContainer = styled.div<{ dat?: boolean }>`
  padding-top: 10px;
  display: flex;
  flex-direction: column;

  > strong, span {
    font-size: 11px;
    color: ${({ dat }) => dat && '#B8B8B8'};
  }

  > span {
    padding-left: 2px;
    font-size: 17px;
    font-weight: bold;
    > span {
      font-weight: normal;
      font-size: 13px;
      color: '#B8B8B8';
    }

  }
`;

export const StatusContainer = styled.div`
  display: flex;
  gap: 25px;
  margin-top: 4px;
  min-width: 160px;
  justify-content: flex-start;
`;

export const Dot = styled.div`
  height: 13px;
  width: 13px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 1px;
`;

export const TransparentLink = styled(Link)`
  display: flex;
  flex-direction: column;
  color: inherit;
  text-decoration: inherit;
  &:hover {
    color: inherit;
    text-decoration: inherit;
    cursor: pointer;
  }
`;
