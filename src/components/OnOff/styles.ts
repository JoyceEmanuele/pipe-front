import styled from 'styled-components';

export const StatusText = styled.span<{ color }>`
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 0.75em;
  line-height: 14px;
  text-align: center;
  margin: 0 20px 0 20px;
  white-space: nowrap;
  color: ${({ color }) => (color === 'ONLINE' || color === 1 ? '#299656' : '#D94438')};
`;
export const Container = styled.div<{ color, margin }>`
  min-width: 62px;
  max-height: 25px;
  margin: ${({ margin }) => `${margin}px 0 ${margin}px 0`};
  display: inline-block;
  border-radius: 3px;
  background-color: ${({ color }) => (color === 'ONLINE' || color === 1 ? 'rgba(41, 150, 86, 0.3)' : 'rgba(217, 68, 56, 0.3)')};
`;
