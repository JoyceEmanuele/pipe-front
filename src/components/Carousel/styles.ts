import Slider from 'react-slick';
import styled from 'styled-components';

import { CloseIcon } from '../../icons';
import { colors } from '../../styles/colors';

export const CustomSlider = styled(Slider)`
  width: 100%;
`;

export const DownloadBox = styled.a`
  position: absolute;
  width: 100%;
  height: 32px;
  top: 89%;
  padding-left: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  text-decoration: none;
  background: rgba(93, 93, 93, 0.7);
  p {
    color: #fff;
    font-weight: bold;
    margin-left: 10px;
  }
  &:hover {
    cursor: pointer;
  }
`;

export const EmptyText = styled.p`
  font-size: 1em;
  color: ${colors.Blue300};
  text-align: center;
`;

export const EmptyImages = styled.div`
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 2px solid ${colors.Blue300};
  padding: 0 30px;
  @media (max-width: 470px) {
    padding: 0 10px;
  }
`;

export const ContainerSlider = styled.div`
  width: 100%;
  background-color: ${colors.White};
`;

export const ContainerOptions = styled.div`
  display: flex;
  margin: 16px 0 0 0;
`;

export const ContainerImageSecondary = styled.ul`
  display: flex;
  margin: 0;
  padding: 0;
  list-style-type: none;
  cursor: pointer;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
`;

export const ContainerImage = styled.div`
  display: flex;
  background-color: ${colors.White};
  align-items: center;
  position: relative;
  margin: 0;
  margin-bottom: 20px;
  padding: 0;
`;

export const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  min-height: 80px;
  margin: 0 auto;
`;

export const ImageSecondary = styled.img`
  width: 67px;
  height: 65px;
  margin: 0 20px 0 0;

  @media (min-width: 768px) {
    width: 123px;
    height: 123px;
  }
`;

export const ButtonAdd = styled.label`
  border-radius: 10px;
  border-style: solid;
  border-width: 1px;
  font-size: 1em;
  font-weight: bold;
  outline: none;
  padding: 16px 0px;
  text-decoration: none;
  text-transform: uppercase;
  box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.12), 0px 11px 15px rgba(85, 97, 115, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.Blue300};
  border-color: ${colors.Blue300};
  color: ${colors.White};
  transition: all 0.3s ease-in-out;
  margin-top: 24px;
  &:hover {
    background-color: ${colors.Blue500};
    border-color: ${colors.Blue500};
    box-shadow: 0px 7px 12px rgba(83, 104, 111, 0.35), 0px 11px 15px rgba(85, 97, 115, 0.25);
  }
`;

export const Arrow = styled.div`
  width: 24px;
  height: 24px;
  background: rgba(93, 93, 93, 0.7);
  text-align: center;
  position: absolute;
  top: 40%;
  z-index: 1;
  cursor: pointer;
  &.next {
    transform: rotate(-90deg);
    right: 0;
  }
  &.prev {
    transform: rotate(90deg);
    left: 0;
  }
`;

export const Close = styled(CloseIcon)`
  position: absolute;
  right: 10px;
  top: 10px;
  width: 40px;
  height: 40px;
  cursor: pointer;
`;

export const CloseModal = styled(CloseIcon)`
  width: 0.8rem;
  height: 0.8rem;
  cursor: pointer;
`;

export const ModalTitle = styled.h3`
  color: ${colors.Blue500};
`;

export const ModalText = styled.p`
  font-size: 1em;
  color: ${colors.Grey400};
  width: 95%;
  margin-bottom: 35px;
`;

export const ModalCancel = styled.p`
  font-size: 1em;
  color: ${colors.Blue300};
  text-decoration: underline;
  width: 100%;
  text-align: center;
  margin-top: 8px;
  &:hover {
    color: ${colors.Blue400};
  }
`;
