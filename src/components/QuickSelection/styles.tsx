import styled from 'styled-components';
import { colors } from 'styles/colors';

export const SelectButton = styled.div`
  margin-right: 10px;
  padding: 2px;
  border-radius: 3px;
  color: ${colors.BlueSecondary};
  background-color:  ${colors.White};
  :hover {
    background-color: ${colors.GreyLight}
  })
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  flex-wrap: wrap;
`;

export const Item = styled.div`
`;
