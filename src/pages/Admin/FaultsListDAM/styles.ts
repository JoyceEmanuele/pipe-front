import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const LoaderContainer = styled.div`
position: absolute;
left: 0;
top: 0;
width: 100%;
height: 100%;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
z-index: 2;
background-color: rgba(255, 255, 255, 0.5);
`;

export const Scroll = styled.div`
overflow-x: auto;
`;

export const FaultsRow = styled.div`
display: flex;
flex-direction: column;
align-items: flex-start;
justify-content: space-around;
`;

export const StyledLink = styled(Link)`
color: ${colors.LightBlue};
`;

export const TransparentLink = styled(Link)`
color: inherit;
text-decoration: inherit;
`;

export const SelectContainer = styled.div`
font-weight: bold;
position: fixed;
background: white;
border: 2px solid #d3d3d3;
border-radius: 10px;
box-shadow: 5px 6px 11px rgba(0,0,0,0.24), 0px 14px 15px rgba(0,0,0,0.12);
`;
