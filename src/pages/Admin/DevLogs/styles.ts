import styled from 'styled-components';

export const ContainerInputs = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 300px;
`;

export const DynRow = styled.div`
  display: grid;
  grid-template-columns: 190px 200px auto;
`;

export const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;
