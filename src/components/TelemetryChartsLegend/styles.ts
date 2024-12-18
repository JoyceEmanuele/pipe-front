import styled from 'styled-components';
import { colors } from '../../styles/colors';

export const CardFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 20px

  padding: 10px 36px 24px 36px;
`;

export const FooterInfos = styled.div`
  width: fit-content;

  h3 {
    color: ${colors.Black};

    font-family: Inter;
    font-size: 13px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  .infos {
    display: flex;
    gap: 21px;

    p {
      color: ${colors.Black};
      font-family: Inter;
      font-size: 14px;
      font-style: normal;
      font-weight: 700;
      line-height: 20px;
      letter-spacing: 0.5px;

      margin: 0;

      span {
        color: ${colors.Black};
        font-weight: 400;
      }
    }

    span {
      color: #838383;
      font-family: Inter;
      font-size: 13px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      letter-spacing: 0.5px;
    }
  }
`;
