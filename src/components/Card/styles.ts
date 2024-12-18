import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const CardUntitled = styled.div`
padding: 32px;
margin-top: 24px;
border-radius: 16px;
box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const Wrapper = styled.div<{overflowHidden: boolean}>(({ overflowHidden }) => `
width: 100%;
height: 100%;
border: 1px solid #D7D7D7;
border-radius: 4px;
background-color: ${colors.White};
${overflowHidden && 'overflow: hidden'};
`);
export const Title = styled.div`
display: flex;
border-radius: 4px 4px 0 0;
justify-content: space-between;
align-items: center;
padding: 5px 12px;
background-color: ${colors.BlueSecondary};
`;
export const ChildrenWrapper = styled.div`
padding: 20px 29px;
min-height: 0;
border-radius: 0 0 4px 4px;
position: relative;
@media (min-width: 992px) {
  padding: 16px 30px;
}
`;
export const ChildrenWrapperNoPadding = styled.div`
min-height: 0;
border-radius: 0 0 4px 4px;
background-color: ${colors.White};
`;
export const Text = styled.span`
font-weight: bold;
font-size: 1.125em;
color: ${colors.White};
`;

export const ChildrenWrapperNoPaddingRelative = styled.div`
min-height: 0;
border-radius: 0 0 4px 4px;
position: relative;
background-color: ${colors.White};
`;
