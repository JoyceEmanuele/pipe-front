import styled from 'styled-components';
import { colors } from 'styles/colors';
import { Link } from 'react-router-dom';

export const Title = styled.h1`
  font-size: 1.25em;
  color: #363BC4;
  font-weight: bold;
  margin-bottom: 16px;
`;

export const NotyIconStyle = styled.div`
  width: 180px;
  position: relative;
  display: inline;
`;

export const ConfirmContainer = styled.div`
  display: flex;
  justify-content: space-between;
  text-align: center;
  width: 85%;
`;

export const TitleColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const NotyNumStyle = styled.div`
  position: absolute;
  right: 0px;
  top: -10px;
  background-color: #363BC4;
  font-size: 11px;
  color: white;
  display: inline;
  padding: 2px 8px;
  border-radius: 25px;
  font-weight: bold;
`;

export const InfoItem = styled.div`
width: 150px;
margin-right: 20px;
margin-bottom: 30px;
`;

export const ControlButton = styled.div<{ isActive?: boolean, noBorder?: boolean }>`
  border: 1px solid ${colors.GreyDefaultCardBorder};
  ${({ noBorder }) => (noBorder ? 'border: 0;' : '')}
  border-radius: 10px;
  width: 160px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  ${({ isActive }) => (isActive ? `background-color: ${colors.BlueSecondary};` : '')}
`;

export const ControlButtonIcon = styled.img<{ isActive?: boolean, status?: string }>`
  width: 13%;
  ${({ isActive }) => (isActive ? 'filter: brightness(10)' : '')};
  ${({ status }) => (status === 'ONLINE' ? '' : 'filter: contrast(0)')};
`;

export const Wrapper = styled.div`
  div {
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const StyledLink = styled(Link)`
  color: ${(props) => props.color ?? colors.Grey400};

  & + a {
    margin-right: 20px;
  }
`;

export const IconDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const ExternalLink = styled.a`
  color: ${(props) => props.color ?? colors.Grey400};
  margin-right: 20px;
  text-decoration: none;
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
      text-align: left;
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

export const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 10px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const DesktopWrapper = styled.div`
display: none;
@media (min-width: 768px) {
  display: block;
}
`;

export const MobileWrapper = styled.div`
display: block;
@media (min-width: 768px) {
  display: none;
}
`;

export const DataText = styled.span<{ fontWeight? }>(
  ({ color = colors.Grey400, fontWeight = 'normal' }) => `
  font-size: 12px;
  font-weight: ${fontWeight};
  color: ${color};
`,
);

export const IconWrapper = styled.div<{ width?, height? }>(
  ({ width, height }) => `
  display: inline-block;
  width: ${width || '19'}px;
  height: ${height || '25'}px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  svg {
    width: ${width}px;
    height: ${height}px;
  }
`,
);
