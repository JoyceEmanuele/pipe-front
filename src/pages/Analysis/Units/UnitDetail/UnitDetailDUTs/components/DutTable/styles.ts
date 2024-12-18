import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const TableItemLabel = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;

  span{
    font-size: 12.6px;
  }

  > div {
    height: 15px;
    width: 15px;
    margin-right: 10px;
    border-radius: 5px;

    background-color: ${(props) => props.color || '#B1B1B1'};
  }
`;

export const TableItemTemperature = styled.div<{ color?: string }>`
  display: grid;
  grid-template-columns: 1fr 5fr;

  > div + div {
    margin-left: 14px;

    color: #858585;
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
  font-size: 12.6px ;
`;

export const InfoInvisibleDuts = styled.div`
  padding: 10px;
  background: #FFFFFF;
  border-top: 1px solid #D7D7D7;
  width: 100%;
  display: flex;
  align-items: baseline;
  p {
    margin-bottom: 0;
    margin-left: 29px;
  }
  h6 {
    margin-bottom:  0;
    font-size: 12px;
    color: blue;
    margin-left: 5px;
  }
`;
