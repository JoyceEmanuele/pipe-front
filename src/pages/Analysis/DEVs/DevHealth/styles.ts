import { Box } from 'reflexbox';
import styled from 'styled-components';

import { Button } from '~/components';
import { healthLevelColor } from '~/components/HealthIcon';
import { colors } from '~/styles/colors';
import { ExportWorksheetIcon } from 'icons';

export const SelectedStatusText = styled.span<{ health }>(
  ({ health }) => `
  margin-top: 12px;
  position: absolute;
  font-weight: bold;
  color:  ${healthLevelColor(health)};
`,
);

export const StatusText = styled.p<{ isBold? }>(
  ({ isBold }) => `
  margin-bottom: ${isBold ? 0 : '1em'};
  margin-top: ${isBold ? '24px' : 0};
  color: ${isBold ? colors.Grey300 : colors.Grey400};
  font-weight: ${isBold ? 'bold' : 'normal'};
`,
);

export const StyledBox = styled(Box)(
  (props: { health, selected }) => `
  div {
    width: ${props.selected ? '48px' : '32px'};
    height: ${props.selected ? '48px' : '32px'};
    background-color: ${healthLevelColor(props.health)};
  }
  svg {
    width: ${props.selected ? '28px' : '20px'};
    height: ${props.selected ? '28px' : '20px'};
  }
`,
);

export const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  border-radius: 8px;
`;

export const CardWrapper = styled.div`
  padding: 32px 16px;
  min-height: 118px;
  border-radius: 16px;
  background-color: ${colors.White};
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
  @media (min-width: 992px) {
    padding: 32px;
  }
`;

export const CardTitle = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 1.5em;
  color: ${colors.Grey400};
`;

export const CustomButton = styled(Button)`
  min-height: 24px;
  max-width: 110px;
  display: inline-block;
  justify-content: center;
  padding-left: 5px;
  padding-right: 5px;
  margin-right: 10px;
`;

type CustomButtonProps = {
  selected: boolean;
}

export const GreenButton = styled(CustomButton)<CustomButtonProps>`
  background-color: rgba(41, 150, 86, 1);
  border-color: ${({ selected }) => (selected ? 'black' : 'rgba(41, 150, 86, 1)')};
  color: ${({ selected }) => (selected ? 'black' : colors.White)};
  &:hover {
    background-color: rgba(41, 150, 86, 0.8);
  }
`;

type YellowButtonProps = {
  selected: boolean;
}

export const YellowButton = styled(CustomButton)<YellowButtonProps>`
  background-color: rgba(234, 203, 62, 1);
  border-color: ${({ selected }) => (selected ? 'black' : 'rgba(234, 203, 62, 1)')};
  color: ${({ selected }) => (selected ? 'black' : colors.White)};
  &:hover {
    background-color: rgba(234, 203, 62, 0.8);
  }
`;

type OrangeButtonProps = {
  selected: boolean;
}

export const OrangeButton = styled(CustomButton)<OrangeButtonProps>`
  background-color: rgba(229, 149, 77, 1);
  border-color: ${({ selected }) => (selected ? 'black' : 'rgba(229, 149, 77, 1)')};
  color: ${({ selected }) => (selected ? 'black' : colors.White)};
  &:hover {
    background-color: rgba(229, 149, 77, 0.8);
  }
`;

type RedButtonProps = {
  selected: boolean;
}

export const RedButton = styled(CustomButton)<RedButtonProps>`
  background-color: rgba(217, 68, 56, 1);
  border-color: ${({ selected }) => (selected ? 'black' : 'rgba(217, 68, 56, 1)')};
  color: ${({ selected }) => (selected ? 'black' : colors.White)};
  &:hover {
    background-color: rgba(217, 68, 56, 0.8);
  }
`;

type GreyButtonProps = {
  selected: boolean;
}

export const GreyButton = styled(CustomButton)<GreyButtonProps>`
  background-color: rgba(171, 176, 180, 1);
  border-color: ${({ selected }) => (selected ? 'black' : 'rgba(171, 176, 180, 1)')};
  color: ${({ selected }) => (selected ? 'black' : colors.White)};
  &:hover {
    background-color: rgba(171, 176, 180, 0.8);
  }
`;

type DarkGreyButtonProps = {
  selected: boolean;
}

export const DarkGreyButton = styled(CustomButton)<DarkGreyButtonProps>`
  background-color: rgba(85, 85, 85, 1);
  border-color: ${({ selected }) => (selected ? 'black' : 'rgba(171, 176, 180, 1)')};
  color: ${({ selected }) => (selected ? 'black' : colors.White)};
  max-width: 130px;
  &:hover {
    background-color: rgba(85, 85, 85, 0.8);
  }
`;

export const SaveButton = styled(Button)`
  min-height: 24px;
  max-width: 120px;
  display: flex;
  justify-content: center;
`;

export const TContainer = styled.table`
  width: 100%;
`;

export const THeader = styled.th`
  padding: 0 10px;
  color: ${colors.DarkGrey};
  background-color: ${colors.White};
  border-bottom: solid 1px ${colors.Grey};
`;

export const TableHead = styled.thead`
  text-align: left;
`;

export const TableBody = styled.tbody`
  overflow-x: scroll;
`;

export const HeaderTitle = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  position: relative;
  font-size: 12px;
`;

export const Data = styled.td<{ thereIsValue? }>`
  color: ${({ thereIsValue }) => (thereIsValue ? colors.LightBlue : colors.DarkGrey)};
  ${({ thereIsValue }) => (thereIsValue ? 'cursor: pointer;' : '')}
  text-decoration: ${({ thereIsValue }) => (thereIsValue ? 'underline' : 'none')};
  min-width: 100px;
  padding: 0 10px;
`;

export const DataCentered = styled.td<{ thereIsValue? }>`
  color: ${({ thereIsValue }) => (thereIsValue ? colors.LightBlue : colors.DarkGrey)};
  ${({ thereIsValue }) => (thereIsValue ? 'cursor: pointer;' : '')}
  text-decoration: ${({ thereIsValue }) => (thereIsValue ? 'underline' : 'none')};
  padding: 0 10px;
  text-align: center
`;

export const Row = styled.tr`
  height: 50px;
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.Grey};
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export const ExportWorksheet = styled(ExportWorksheetIcon)(
  () => `
  color: #363BC4
`,
);

export const Text = styled.text`
color: ${colors.Black};
`;

export const BtnExport = styled.div`
  cursor: pointer;
  color: #363BC4;
  padding: 14px 20px;
  border: 1px solid ${colors.GreyLight};
  margin-left: 10px;
  font-weight: 400;
  border-radius: 12px;
  height: 41px;
  display: flex;
  text-align: center;
  align-items: center;
  :hover {
    color: ${colors.White}
    background-color: #363BC4
    ${Text} {
      color: ${colors.White}
    }
  }
`;

export const ModalTitle = styled.span`
  font-weight: bold;
  font-size: 1.25em;
  line-height: 27px;
  color: ${colors.Grey400};
`;
