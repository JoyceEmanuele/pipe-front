import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Wrapper = styled.div`
display: flex;
flex-direction: column;
margin-bottom: 20px;
`;

export const StyledList = styled.ul`
display: flex;
flex-direction: row;
align-items: center;
justify-content: flex-start;
list-style: none;
padding: 0;
margin-bottom: -1px;
li:not(:first-child) {
  margin-left: 32px;
}
.active {
  color: ${colors.Blue300}; // texto nav maior
}
`;

export const StyledItem = styled.li`
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
white-space: nowrap;
gap: 5px;
padding-top: 10px;
`;

export const Content = styled.div`
display: flex;
align-items: center;
overflow-x: auto;
overflow-y: hidden;
margin: 5px 5px 0 5px;
padding: 0;
height: 40px;
max-width: 100%;
border-bottom: 1px solid ${colors.Grey100};
justify-content: space-between;
margin: 0px;
@media (max-width: 1241px) {
  height: 41px;
  overflow-x: scroll;
}
`;

export const StyledLine = styled.div<{ isActive }>(
  ({ isActive }) => `
  background: ${isActive ? colors.Blue300 : 'transparent'};
  width: 100%;
  height: 10px;
  animation: grow .5s;
  border-radius: 3px 3px 0px 0px;
  @keyframes grow {
    from {
      width: 0;
    }
    to{
      width: 100%;
    }
  }
  @media (max-width: 1241px) {
    height: 7px;
    margin-top: 3px;
  }
  `,
);

export const StyledLabel = styled.div<{ isActive }>(
  ({ isActive }) => `
  color: ${isActive ? colors.Blue300 : '#5B5B5B'};
  font-size: 13px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  `,
);

export const ContainerParameters = styled.div`
  margin-bottom: 50px;
  h3 {
    font-size: 16px;
  }
`;

export const SearchInputStyled = styled.div`
  width: 100%;
  .select-search__option.is-selected {
    background-color: transparent;
    color: black;
  }
  .select-search__option.is-highlighted.is-selected, .select-search__option.is-selected:hover, .select-search__option:not(.is-selected):hover {
    background-color: transparent;
    color: black;
  }
`;

export const SelectOptionStyled = styled.button<{ disabled }>(
  ({ disabled }) => `
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  width: 100%;

  border: none;
  background: transparent;
  padding: 0 8px;

  border-left: 5px solid transparent;
  ${disabled && `
    div {
    color: red;
    }
    `}
`,
);

export const SelectedContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: start;
  input {
    padding: 0px;
    margin: 0px;
    border: none;
    border-radius: 10px;
    width: 40px;
    background-color: transparent;
  }
`;

export const HorizontalLineSelectParameters = styled.div`
  width: 10px;
  border-bottom: 1px dashed #D0D0D0;
  margin-left: 8px;
`;

export const BorderSubItem = styled.div<{model?: string}>(
  ({ model }) => `
  border-left: 1px dashed #D0D0D0;
  height: ${model === 'XA' ? '322px' : model === 'XA_HVAR' ? '710px' : '950px'};
  position: absolute;
  top: -13px;
  left: 21px;
  z-index: 10;
`,
);

export const InfoSelected = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  input {
    width: 18px;
    height: 18px;
  }
`;

export const InputStyledSelected = styled.input<{ isLeft }>(
  ({ isLeft }) => `
  width: 20px;
  height: 20px;
  cursor: pointer;
  position: absolute;
  opacity: 0;
  left: ${isLeft ? '20px' : '0px'}
`,
);

export const ChillerGraph = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

export const ChillerGraphGeral = styled.div<{ marginTop, height, groupGraph }>(
  ({ height, groupGraph }) => `
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${`${height}px` || '400px'};
  margin-top: 20px;
  .containerCircle {
    display: flex;
    gap: 5px;
    align-items: center;
  }
  p {
    margin: 0;
  }
  .circleGreen {
    background: #4EB73B;
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(142, 210, 130, 1);
    margin-right: 5px;
    height: 11px;
    width: 11px;
    transform: scale(1);
    animation: greenPulse 2s infinite;
  
    @keyframes greenPulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(142, 210, 130, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
      }
    }
  }
  .circleRed {
    background: #FF1818;
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(255, 103, 103, 1);
    margin-right: 5px;
    height: 11px;
    width: 11px;
    transform: scale(1);
    animation: redPulse 2s infinite;
  
    @keyframes redPulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(255, 103, 103, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
      }
    }
  }
  .circleYellow {
    background: #EDA800;
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(255, 206, 0, 1);
    margin-right: 5px;
    height: 11px;
    width: 11px;
    transform: scale(1);
    animation: yellowPulse 2s infinite;
  
    @keyframes yellowPulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(255, 206, 0, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
      }
    }
  }
`,
);

export const ContainerNotSelectedParams = styled.div`
  background-color: #F9F9F9;
  width: 100%;
  height: 458px;
  gap: 0px;
  border-radius: 10px;
  color: #7D7D7D;
  opacity: 0px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  align-items: center;
  margin-top: 20px;
  span {
    font-size: 12px;
  }
  padding: 10px;
`;

export const ContainerGraphParamsChange = styled.div<{ groupGraph, lengthArraySample }>(
  ({ groupGraph, lengthArraySample }) => `
  ${groupGraph ? `
  width: 85%;
  div {
    top: ${lengthArraySample > 0 ? '-70px' : '10px'};
  }` : `
  div {
    top: ${lengthArraySample > 0 ? '-30px' : '-50px'};
  }
  `}
`,
);

export const MenuFixedContainer = styled.div<{ historySelected }>(
  ({ historySelected }) => `
  display: flex;
  align-items: center;
  margin: 5px;
  justify-content: start;
  gap: 10px;
  margin-bottom: 20px;
 ${historySelected ? `
    position: sticky;
    top: 39px;
    width: 100%;
    background-color: white;
    z-index: 100;
    margin-left: -5px;
    padding: 5px 5px 15px 15px;
    ` : ''}   
`,
);
