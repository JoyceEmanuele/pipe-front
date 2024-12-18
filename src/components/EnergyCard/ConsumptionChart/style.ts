import styled from 'styled-components';

export const CheckboxLine = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  border: 1px solid #C5C5C58F;
  border-radius: 8px;
  padding: 8px;

  height: 40px;
  width: 140px;

  span {
    color: #000;
    font-family: Inter;
    font-size: 10px;
    font-style: normal;
    font-weight: bold;
    line-height: normal;
  }
`;

export const CheckboxContent = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  padding: 8px;

  height: 40px;
  width: 200px;
  margin-left: 60px;

  span {
    color: #000;
    font-family: Inter;
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }
`;

export const SelectedDate = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  cursor: pointer;

  span {
    color: #000;
    font-family: Inter;
    font-size: 9px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
`;

export const BarchartWrapper = styled.div`
  width: 100%;
  height: 335px;
`;
