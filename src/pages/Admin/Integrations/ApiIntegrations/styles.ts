import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  position: relative;
`;

export const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
`;

export const ContainerButtonOpen = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-items: center;
  z-index: 12;
  bottom: 0;
  transform: translateY(125%);
  min-width: 216px;
  border: 0.8px solid #5050502B;
  border-radius: 8px;
  background: #FFFFFF;
  overflow-x: hidden;
  height: max-content;
  width: 100%;
  cursor: pointer;
  `;

export const OptionsButtonsTypeAPI = styled.p<{ disabled?: boolean }>`
  padding: 15px;
  margin: 0;
  transition: filter 0.2s ease;
  cursor: pointer;
  font-size: 12px;
  width: 100%;

  ${({ disabled }) => disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    &:hover {
      filter: none;
    }
  `}
`;

export const ButtonOptions = styled.div<{ disabled?: boolean }>(
  ({ disabled }) => `
  padding: 5px;
  display: flex;
  gap: 5px;
  min-width: 100px;
  flex-direction: row;
  height: max-content;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  border-radius: 11px;
  border: 1px solid;
  border-color: #e3e3e3;
  cursor: pointer;
  box-shadow: 0px 3px 3px 0px #00000014;

    ${disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`,
);

export const NoApiReturn = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    border: 1px solid #0000000F;
    border-radius: 10px;

    background: #F9F9F9;

    height: 273px;

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

export const ModalTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
`;

export const ModalSubTitle = styled.p`
  font-size: 11px;
  font-weight: 400;
  margin-bottom: 50px
`;

export const ContainerModal = styled.div`
  padding: 25px 80px 0px 80px
`;

export const ContainerModalInputs = styled.div`
  margin-top: 0px;
  display: flex;
  flex-direction: column;
`;

export const ContainerColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 200px;
  justify-content: 'center';
`;

export const ContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

export const Form = styled.form`
  display: flex;
  width: '100&';
  flex-direction: column;
  `;

export const Label = styled.label`
  position: relative;
  display: inline-block;
  width: 100%;
  margin-top: 1px;
  margin-left: 16px;
  margin-right: 16px;
  color: #202370;
  font-size: 11px;
  font-weight: bold;
`;

export const TextLine = styled.div`
  display: flex;
  align-items: center;
  color: #5d5d5d;
`;

export const TableWrapper = styled.div`
  padding: 20px 29px 20px 21px;
`;

export const ContainerButtonStatusOpen = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-items: center;
  z-index: 12;
  border: 0.8px solid #5050502B;
  border-radius: 4px;
  background: #FFFFFF;
  overflow-x: hidden;
  height: max-content;
  width: 110px;
  cursor: pointer;
  `;

export const OptionsButtonsStatus = styled.p<{ disabled?: boolean }>`
  padding: 5px;
  margin: 0;
  transition: filter 0.2s ease;
  cursor: pointer;
  font-size: 12px;
  width: 100%;
  display: flex;
  align-items: center;


  ${({ disabled }) => disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    &:hover {
      filter: none;
    }
  `}
`;
