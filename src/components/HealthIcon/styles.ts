import styled from 'styled-components';

export const HealthWrapper = styled.div(
  ({ color }) => `
  display: flex;
  span {
    margin-left: 6px;
    color ${color};
    font-weight: bold;
    font-size: 0.875em;
    line-height: 18px;
    text-align: center;
    white-space: nowrap;
  }
`,
);
