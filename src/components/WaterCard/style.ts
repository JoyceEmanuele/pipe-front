import styled from 'styled-components';

export const ContainerCardWater = styled.div`
  width: 100%;
  height: 324px;
  margin-top: 35px;
  margin-bottom: 49px;
  .tooltip .tooltiptext::after {
    content: " ";
    position: absolute;
    top: 100%; /* At the bottom of the tooltip */
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: black transparent transparent transparent;
  }
`;

export const TableContainer = styled.div`
::-webkit-scrollbar-track {
    background-color: #F4F4F4;
}
scrollbar-width: thin;
::-webkit-scrollbar-thumb {
    background: #dad7d7;
}
display: flex;
flex-direction: column;
align-items: center;
gap: 10px;
margin-left: 10px;
`;

export const NoAnalisysSelected = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
    align-items: center;
    height: 250px;
    margin-left: 10px;
    width: 96%;
    border: 1px solid #0000000F;
    border-radius: 10px;

    background: #F9F9F9;

    color: #7D7D7D;

    span {
      margin: 0;

      font-family: Inter;
      font-size: 13px;
      font-weight: 700;
      text-align: center;
    }

    p {
      margin: 0;

      font-family: Inter;
      font-size: 10px;
      font-weight: 500;
      text-align: center;
    }
`;

export const BackgroundCardItem = styled.div`
  display: grid;
  grid-template-columns: 150px 6px 150px auto;
  height: 5px;
  span {
    border-top: 1px solid lightgrey;
    border-right: 1px solid lightgrey;
    border-radius: 6px 6px 0px 0px;
  }
`;

export const NameCardItem = styled.span`
  border-right: 1px solid lightgrey;
  text-align: center;
  font-size: 90%;
  border: 1px solid lightgrey;
  border-radius: 5px 5px 0px 0px;
  padding: 2px;
  margin-right: 3px;
  display: flex;
  justify-content: center;
`;

export const BorderSpan = styled.span`
  border-bottom: 1px solid lightgrey;
  position: absolute;
  width: 100%;
  bottom: 0px;
`;

export const ContainerCalendar = styled.div`
  font-size: 12px;
  display: flex;
  position: relative;
`;

export const ContainerInfoCalendar = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 24px;
  span {
    font-family: Inter;
    font-size: 12px;
    font-weight: 600;
    line-height: normal;
    cursor: pointer;
  }
`;

export const ContainerDatesCalendar = styled.div`
  position: absolute;
  display: grid;
  justify-items: center;
  grid-template-columns: 1fr 1fr 1fr;
  z-index: 12;
  bottom: -540%;
  right: -50px;
  width: 200px;
  height: 90px;
  border: 1px solid #E3E3E3;
  border-radius: 5px;
  background: #FFFFFF;
  padding: 16px;
  overflow: scroll;
  overflow-x: hidden;
`;

function isSelected(selected) {
  if (selected) {
    return 'rgba(54, 59, 196, 1)';
  }
  return '#FFFFFF';
}

export const ContainerItemDateCalendar = styled.div<{haveData, selected}>(({ haveData, selected }) => `
  background-color: ${haveData ? isSelected(selected) : 'rgba(142, 142, 142, 0.2)'};
  border-radius: 5px;
  color: ${selected ? 'white' : 'black'}
  padding: 2px 5px 0px 5px;
  text-align: center;
  margin-bottom: 8px;
  font-family: Inter;
  font-size: 12px;
  font-weight: 400;
  line-height: 14.52px;
  cursor: ${haveData ? 'pointer' : 'not-allowed'};
`);
