import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const StyledLink = styled(Link)`
  color: ${colors.Grey400};
`;

export const StyledSpan = styled.span`
  color: ${colors.Grey400};
`;

export const ModalContent = styled.div`
  width: 400px;
`;

export const FileInput = styled.label`
  border-radius: 32px;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  font-size: 1em;
  font-family: 'Open Sans', sans-serif;
  font-weight: bold;
  outline: none;
  padding: 8px 0px;
  text-decoration: none;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;
  width: 100%;
  box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
  background-color: ${colors.Pink200};
  border-color: ${colors.Pink200};
  color: ${colors.White};
  transition: all 0.3s ease-in-out;
  &:hover {
    background-color: ${colors.Pink300};
    border-color: ${colors.Pink300};
    box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.35), 0px 11px 15px rgba(85, 97, 115, 0.25);
  }
`;

export const FwVersTable = styled.div<{ limitSize }>(({ limitSize }) => `
  display: flex;
  flex-wrap: nowrap;
  margin-top: 30px;
  border-left: 1px solid lightgrey;
  ${limitSize ? 'max-height: 240px; overflow-y: hidden;' : ''}
`);
export const ViewMoreArrow = styled.p<{ viewMore }>(
  ({ viewMore }) => `
  span {
    font-size: 1em;
    color: ${colors.Grey400};
  }
  &:hover {
    cursor: pointer;
  }
  svg {
    margin-left: 12px;
    transition: all 0.2s;
    transform: rotate(${viewMore ? '-180' : '0'}deg);
  }
`,
);
export const TableNew = styled.table`
  white-space: nowrap;
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;

export const TableNew2 = styled.table`
  white-space: nowrap;
  box-shadow: rgba(62, 71, 86, 0.2) 0px 2px 8px;
  border-collapse: collapse;
  & tbody {
    border: 1px solid ${colors.Grey};
    & tr {
      height: 35px;
      &:not(:last-child) {
        border-bottom: 1px solid ${colors.Grey};
      }
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    & td {
      text-align: left;
      color: ${colors.DarkGrey};
      padding: 0 10px;
      font-size: 0.71rem
    }
  }
  & thead {
    & tr {
      height: 40px;
      display: table-row;
    }
    & th {
      flex: 1;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
      word-break: normal;
      border-bottom: solid 1px ${colors.Grey};
      font-size: 0.75rem;
      background-color: ${colors.Blue300};
      color: ${colors.White};
      &:first-child {
        border-top-left-radius: 10px;
      }
      &:last-child {
        border-top-right-radius: 10px;
      }
    }
  }
`;

/*
TODO:
Criar um outro modal que permite escolher uma versão de firmware para cada hw_rev e mostra uma tabela com os DEVs, a versão atual, a versão enviada e o resultado da requisição.
*/
