import styled from 'styled-components';

import { colors } from 'styles/colors';

export const LabelWrap = styled.label<{ uncheckedColor, cursor }>(({ uncheckedColor, cursor }) => `
  display: inline-flex;
  align-items: center;
  color: ${uncheckedColor};
  cursor: ${cursor}
`);

export const Radio = styled.div`
  line-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.37em;
  border-radius: 50%;
  border: 0.143em solid ${({ color }) => color};
  background-color: ${colors.White};
`;
export const Cursor = styled.div`
  line-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0.8em;
  height: 0.8em;
  margin: 0.143em;
  border: 0;
  border-radius: 50%;
  background-color:${({ color }) => color};
`;
