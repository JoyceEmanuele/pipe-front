import styled, { css } from 'styled-components';
import { FileDrop, ModalWindow } from '~/components';
import { colors } from '~/styles/colors';

export const UnitMapModalStyled = styled(ModalWindow)`
  width: 680px;

  display: flex;
  flex-direction: column;
  gap: 22px;

  input {
    border-radius: 5px;
    border: 1px solid #DADADA;
  }

  .container {
    div {
      margin: 0;
    }
  }
`;

export const UnitMapHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  h2 {
    color: #000;

    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;

    margin: 0;
  }
`;

export const FileDropStyled = styled(FileDrop)<{disabled?: boolean}>`
  ${({ disabled = false }) => disabled
    && css`
      pointer-events:none;
      cursor: not-allowed;
    `}
`;

export const FileDropContent = styled.div<{fileDropHasError?: boolean}>`
  background: #FFFFFF;
  border: 2px dashed ${colors.MediumGrey};
  border-radius: 8px;

  cursor: pointer;

  ${({ fileDropHasError = false }) => fileDropHasError
    && css`
      border: 2px dashed ${colors.RedDark};
      color: ${colors.RedDark};
    `}

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: 8px;

  padding: 40px

  span {
    color: #AEAEAE;

    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  p {
    margin: 0;

    color: ${colors.Black};

    font-family: Inter;
    font-size: 13px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;

    .highlight {
      color: #363BC4;

      text-decoration-line: underline;
    }
  }

  .filename {
    display: flex;
    align-items: center;
    gap: 8px;

    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;

    color: #363BC4;

    text-decoration-line: underline;
  }
`;

export const UnitMapFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  a {
    color: #363BC4;

    font-family: Inter;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-decoration-line: underline;
  }

  button {
    width: 30%;
  }
`;
