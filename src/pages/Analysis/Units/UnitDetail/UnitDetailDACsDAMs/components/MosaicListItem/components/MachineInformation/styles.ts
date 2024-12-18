import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { healthLevelColor } from '~/components/HealthIcon';

export const Title = styled.strong`
  font-size: 13px;
  /* margin-bottom: 4px; */
`;

export const Subtitle = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #6D6D6D;
`;

export const HealthContainer = styled.div<{ expanded: boolean }>`
  display: flex;
  justify-content: space-around;
  margin-top: ${({ expanded }) => !expanded && '5px'};

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    margin: ${({ expanded }) => expanded && '18px 0'};

    > strong {
      font-size: 12px;
    }

    > span {
      font-size: 14px;
      font-weight: bold;
      color: #110202;
    }
  }
`;

export const DuoTempContainer = styled.div<{ expanded: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: ${({ expanded }) => !expanded && '3px'};

  > div {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    margin: ${({ expanded }) => expanded && '10px 0'};

    > strong {
      font-size: 12px;
    }

    > span {
      font-size: 17px;
      font-weight: bold;
      color: #110202;
      > span {
        font-size: 14px;
      }
    }
  }
`;

export const UsageContainer = styled.div<{ dat?: boolean }>`
  display: flex;
  padding-top: 10px;

  > strong, span {
    font-size: 10px;

    color: ${({ dat }) => dat && '#B8B8B8'};
  }

  > span {
    padding-left: 2px;
  }
`;

export const StatusContainer = styled.div`
  display: flex;
  margin-top: 4px;
  min-width: 160px;
  gap: 6px;
  align-items: center;
`;

export const Icon = styled.div<{ health: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  border-radius: 5px;
  background-color: ${({ health }) => healthLevelColor(health)};

  > svg {
    width: 14px;
    height: 14px;
  }
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
