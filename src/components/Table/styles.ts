import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ArrowIcon } from '../../icons';
import { colors } from '../../styles/colors';

const selectTableHeadProps = (variant) => {
  switch (variant) {
    case 'primary':
      return colors.White;
    case 'secondary':
      return colors.Blue300;
    default:
      return colors.White;
  }
};

export const selectTableHeadContentColor = (variant) => {
  switch (variant) {
    case 'primary':
      return colors.Black;
    case 'secondary':
      return colors.White;
    default:
      return colors.Black;
  }
};

type ArrowTableProps = {
  isopen?: boolean;
  dense?: boolean;
}

export const ArrowTable = styled(ArrowIcon)<ArrowTableProps>(
  ({ isopen, dense }) => `
  margin-left: ${dense ? '5px' : '12px'};
  transition: all 0.2s;
  transform: rotate(${isopen ? '-180' : '0'}deg);
`,
);

export const StyledLink = styled(Link)`
  color: #000;
`;

export const StyledCell = styled.td<{ dense, border }>(({ dense, border }) => `
  border-bottom: ${border ? `2px solid ${colors.Grey050}` : 'none'};
  padding: ${dense ? '0 5px' : '0 10px'};
  height: 35px;
  white-space: nowrap;
  span,
  a {
    font-size: 0.9em;
  }
`);

export const StyledTableHeader = styled.th<{ variant, dense, noBorderBottom }>(({ variant, dense, noBorderBottom }) => `
  color: ${selectTableHeadContentColor(variant)};
  padding: ${dense ? '5px 5px' : '5px 10px'};
  text-align: left;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  border-bottom: ${noBorderBottom ? 'none' : '0.7px solid rgba(0, 0, 0, 0.2)'};
  width: 1%;
  &.collapse {
    width: 0.0000000001%;
  }

  &:last-child {
    border-right: 0;
  }
  height: 40px;
  white-space: nowrap;
`);

export const StyledTableRow = styled.tr<{ backgroundColor?: string, borderRow?: string }>`
  font-size: 0.9em;

  ${((props) => (props.backgroundColor && `background-color: ${props.backgroundColor};`) || '')}

  .assets-header {
  border-left: 1px solid rgba(199, 197, 197, 1);
  border-right: 1px solid rgba(199, 197, 197, 1);
  border-top: 1px solid rgba(199, 197, 197, 1);
}

.assets-row {
    border-left: 1px solid rgba(199, 197, 197, 1);
    border-right: 1px solid rgba(199, 197, 197, 1);
}

.assets-row:last-child {
  border-bottom: 1px solid rgba(199, 197, 197, 1);
}
`;

export const StyledBody = styled.tbody<{ borderRow?: string }>`
  ${StyledTableRow} {
    &:last-child {
      td {
        border-bottom: 0;
      }
    }
  }
  .assets-header {
  box-shadow: inset 0px 15px 15px -15px rgba(0, 0, 0, 10%),
              inset 15px 0px 15px -15px rgba(0, 0, 0, 10%),
              inset -15px 0px 15px -15px rgba(0, 0, 0, 10%);
  }

.assets-row {
  box-shadow: inset 15px 0px 15px -15px rgba(0, 0, 0, 10%),
              inset -15px 0px 15px -15px rgba(0, 0, 0, 10%);
}

.assets-row:last-child {
  box-shadow: inset 0px -15px 15px -15px rgba(0, 0, 0, 10%),
              inset 15px 0px 15px -15px rgba(0, 0, 0, 10%),
              inset -15px 0px 15px -15px rgba(0, 0, 0, 10%);
  border-bottom: 'unset';
}
`;
export const StyledTable = styled.table`
  display: block;
  border-radius: 10px;
  border-collapse: collapse;
  overflow-y: hidden;
  overflow-x: auto;
  width: 100%;
  border-spacing: 0;
`;

export const StyledHead = styled.thead<{ variant }>(
  ({ variant }) => `
  background-color: ${selectTableHeadProps(variant)};
  color: white;
  height: 40px;
  position: sticky;
  top: 0;
`,
);

export const NoDataComponent = styled.div<{minHeight?: string}>(
  ({ minHeight }) => `
  background-color: #F9F9F9;
  color: #7D7D7D;
  text-align: center;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: ${minHeight || '200px'};
  border: 1px solid #E8E8E8;
  margin: 0 10px 20px 10px;
`,
);

export const TitleColumn = styled.div`
  justify-content: flex-start;
  align-items: center;
  display: flex;
  gap: 8px;
  flex-direction: row;
`;

export const OrderColumn = styled.div`
  padding-left: 5px;
  padding-right: 5px;
  padding-bottom: 4px
  border-radius: 8px;
  border: 1px solid #D7D7D7;
  cursor: pointer;
`;

export const OrderColumnArrow = styled.div`
  display: flex;
  align-items: center;
  width: 25px;
  justify-content: center;
  border: 1px solid lightgrey;
  cursor: pointer;
  border-radius: 8px;
`;

export const ButtonFilters = styled.div<{hasFilter?: boolean}>(
  ({ hasFilter }) => `
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    gap: 4px;

    font-size: 11px;
    text-align: center;
    padding: 5px;
    border-radius: 8px;
    border: ${hasFilter ? '1px solid #D7D7D7' : 'none'};
    color: #686868;
    min-width: 80px;
    cursor: ${hasFilter ? 'pointer' : 'unset !important'};
  `,
);

export const PopoverContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding: 8px;

  border-radius: 9px;
  border: 1px solid #e3e3d3;
  box-shadow: 0px 2px 8px rgba(62, 71, 86, 0.2);

  background: white;
`;

export const PopoverHeader = styled.div`
  display: flex;
  align-items: center;

  gap: 8px;

  h2 {
    margin: 0;
    color: #000;

    font-family: Inter;
    font-size: 10px;
    font-weight: 600;
  }
`;

export const SearchInput = styled.div`
  margin: 0;

  border: 1px solid #EFEFEF;
  border-radius: 8px;

  font-size: 12px;
  color: #000;

  label {
    width: fit-content;
  }

  input {
    border-radius: 8px;
  }

  .select-search__option {
    height: auto;
    min-height: 35px;
  }
`;

export const Label = styled.label`
position: relative;
display: inline-block;
width: 100%;
margin-left: 16px;
margin-right: 16px;
color: #202370;
font-size: 11px;
font-weight: bold;
`;

export const TooltipContainer = styled.div`
  max-width: 146px;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  gap: 8px;

  p{
    color: #fff;

    font-family: Inter;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: 10.89px;

    margin: 0;
  }

  span{
    color: #fff;

    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    line-height: 10.89px;

    text-align: start;

    word-break: break-word;
    white-space: normal;
  }
`;

export const StyledSubTable = styled.table`
  width: 100%;
  border-collapse: collapse;


  td {
    border-bottom: 1px solid #ccc;
    padding: 16px 10px;
    text-align: left;
  }

  th {
    padding: 5px 10px;
    text-align: left;
  }

  tbody tr:nth-child(even) {
    background-color: #eeeeee75;
  }
`;

export const StyledSubTableHeader = styled.th<{ dense }>(({ dense }) => `
  text-align: left;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  height: 40px;
  white-space: nowrap;
  padding: ${dense ? '0 14px' : '0 10px'};
`);

export const StyledSubCell = styled.td<{ dense, border }>(({ dense, border }) => `
  border-bottom: ${border ? `2px solid ${colors.Grey050}` : 'none'};
  padding: ${dense ? '0 5px' : '0 10px'};
  height: 35px;
  font-size: 12px;
  white-space: nowrap;
  span,
  a {
    font-size: 0.9em;
  }
`);

export const LineSubTable = styled.div`
  border: 1px dashed rgba(163, 163, 163, 45%);
  position: absolute;
  top: 0px;
  height: 64px;
  width: 1px;
  left: 10px;
`;

export const LineSubItemTable = styled.div`
  border: 1px dashed rgba(163, 163, 163, 45%);
  position: absolute;
  top: 25px;
  height: 1px;
  width: 16px;
  left: 11px;
`;
