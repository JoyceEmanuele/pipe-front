import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Title = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: ${colors.Blue500};
`;

export const Content = styled.div`
  position: relative;
  margin: 30px 100px 40px;
  display: flex;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
    margin: 20px 10px;
    align-items: center;
  }
`;

export const Col = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 45%;

  @media (max-width: 768px) {
    width: 90%;
  }
`;

export const ColSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  .ant-checkbox-group-item {
    display: flex;
    margin-right: 0;
  }
`;

export const SectionTitle = styled.span`
  font-size: 13px;
  color: ${colors.Blue700};
  font-weight: bold;
`;

export const SectionDescription = styled.span`
  font-size: 12px;
  color: #4B4B4B;
`;

export const ClimatizationParameterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 1372px) {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 10px;
  }
`;

export const ClimatizationValueBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  margin-left: 15px;

  @media (max-width: 768px) {
    margin-top: 10px;
  }
`;

export const ClimatizationSwitchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 18px;
`;

export const UploadPhotoBtn = styled.button`
  border: none;
  cursor: pointer;
  background-color: ${colors.Blue700};
  height: 50px;
  width: 50px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Footer = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 45px;
`;
