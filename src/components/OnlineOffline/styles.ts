import styled from 'styled-components';

export const StatusText = styled.span`
font-family: Roboto;
font-style: normal;
font-weight: 500;
font-size: 0.75em;
line-height: 14px;
text-align: center;
margin: 0 20px 0 20px;
color: ${({ color }) => color};
`;

export const Container = styled.div<{ margin }>`
min-width: 62px;
max-height: 25px;
margin: ${({ margin }) => `${margin}px 0 ${margin}px 0`};
display: inline-block;
border-radius: 3px;
background-color: ${({ color }) => color};
`;
