import styled from 'styled-components';

import { StatusBox } from '~/components';
import { DottedLineIcon, LineIcon } from '~/icons';
import { colors } from '~/styles/colors';

export const StatusL1 = styled(StatusBox)`
margin-left: 12px;
min-width: 100px;
`;

export const ColoredDottedLine = styled(DottedLineIcon)(
  ({ color }) => `
margin-left: 10px;
color: ${color}
`,
);

export const ColoredLine = styled(LineIcon)(
  ({ color }) => `
margin-left: 10px;
color: ${color}
`,
);

export const CheckboxLine = styled.div`
display: flex;
justify-content: flex-start;
align-items: center;
`;

export const Text = styled.span`
font-weight: normal;
font-size: 1em;
line-height: 26px;
color: ${colors.Grey400};
`;

export const Container = styled.div`
min-height: 410px;
width: 100%;
border-radius: 8px;
background-color: ${colors.White};
padding: 32px 24px;
box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const CardWrapper = styled.div`
padding: 32px 16px;
border-radius: 8px;
min-height: 118px;
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

export const DivisionLine = styled.div`
position: absolute;
left: 50%;
top: 0;
bottom: 0;
height: 100%;
width: 2px;
background: ${colors.Grey100};
`;
