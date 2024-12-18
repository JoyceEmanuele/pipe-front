import styled from 'styled-components';
import {
  Select,
} from 'components';
import { colors } from '~/styles/colors';

export const ItemTitle = styled.h3`
  margin-bottom: 0;
  font-weight: bold;
  font-size: 15px;
  line-height: 27px;
  color: #4B2FDB;
`;

export const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;
export const Data = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;
export const DataText = styled.span<{ fontWeight? }>(
  ({ color = colors.Grey400, fontWeight = 'normal' }) => `
  font-size: 1em;
  font-weight: ${fontWeight};
  color: ${color};
`,
);
export const Title = styled.h1`
  font-size: 1.5em;
  color: ${colors.Grey400};
`;

export const Text = styled.span`
  margin-left: 7px;
`;
export const TextLine = styled.div`
  display: flex;
  align-items: center;
  color: #5d5d5d;
`;

export const CustomSelect = styled(Select)`
  margin-bottom: 20px;
`;
export const ContainerInfo = styled.div`
  display: flex;
  padding: 25px 0 0 0;
  height: auto;
`;
export const ContainerText = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

export const OverLay = styled.div`
  position: absolute;
  display: flex;
  background-color: #eceaea;
  width: 100%;
  height: 100%;
  z-index: 10000000;
  opacity: 0.4;
  filter: alpha(opacity=40);
  top: 0;
  left: 0;
`;

export const Wrapper = styled.div`
  div {
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const SpanType1 = styled.span<{ showExceptions }>(
  ({ showExceptions }) => `
  border-right: 1px solid lightgrey;
  border-left: 1px solid lightgrey;
  text-align: center;
  font-size: 90%;
  border-bottom: ${showExceptions ? '1px solid lightgrey' : 'none'};
  background-color: ${showExceptions ? '#f4f4f4' : 'transparent'};
  cursor: ${showExceptions ? 'pointer' : undefined};
  font-weight: ${showExceptions ? 'normal' : 'bold'};
`,
);

export const SpanType2 = styled.span<{ showExceptions }>(
  ({ showExceptions }) => `
  border-left: 1px solid lightgrey;
  border-right: 1px solid lightgrey;
  text-align: center;
  font-size: 90%;
  border-bottom: ${showExceptions ? 'none' : '1px solid lightgrey'},
  background-color: ${showExceptions ? 'transparent' : '#f4f4f4'},
  cursor: ${!showExceptions ? 'pointer' : undefined},
  font-weight: ${!showExceptions ? 'normal' : 'bold'},
`,
);

export const ContainerEcoMode = styled.div`
  display: flex;
  align-items: center;
`;

export const HoverEcoLocal = styled.span`
  display: flex;
  flex-direction: column;
  max-width: 247px;
  padding-inline: 20px;
  padding-block: 15px;
  color: white;
  span{
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 13px;
  }
`;
