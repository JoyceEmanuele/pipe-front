import styled from 'styled-components';
import { colors } from '../../../styles/colors';

export const EmptyCard = styled.div`
  width: 100%;
  height: 33px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  justify-content: center;
  background: ${colors.Grey030};
  color: ${colors.Grey200};
  margin-bottom: 0.5rem;
  border-radius: 8px;
  text-align: center;
  font-size: 10px;
`;

export const Card = styled.div`
  width: 48%;
  height: 33px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  justify-content: space-between;
  background: white;
  margin-right: 3px;
  margin-left: 3px;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  border-radius: 8px;
  border: 1px solid ${colors.GreyDefaultCardBorder};
  cursor: move;

  &.expanded {
    width: 100%;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${colors.Grey030};
    border: 1px solid ${colors.Grey030};
  }

  p {
    font-size: 10px;
    font-weight: 700;
    margin-bottom: 0;
  }
`;

export const HorizontalLine = styled.div`
  width: 100%;
  height: 1px;
  background: ${colors.Grey100};
  margin: 0.5rem 0;
`;

export const Title = styled.span`
  text-align: right;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
`;

export const AddCard = styled.div`
  cursor: pointer;
  width: auto;
  height: 30px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  margin-right: 0.5rem;
  justify-content: space-between;
  background: white;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: ${colors.Blue300};
  border: 2px solid ${colors.Blue300}
`;
