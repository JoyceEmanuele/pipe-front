import styled from 'styled-components';

import { colors } from '~/styles/colors';

type ContainerProps = {
  doesPictureUriExists: boolean;
  labelSpanVisible: boolean;
}

export const Container = styled.div<ContainerProps>`
  cursor: ${(props) => (props.doesPictureUriExists ? 'cursor' : 'not-allowed')};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 35px;
  border-radius: 5px;
  color: ${colors.BlueSecondary};
  font-weight: bold;
  border: 1px solid ${colors.BlueSecondary};
  font-size: 14px;
  padding: 5px;
  position: relative;

  .ant-image {
    width: 120px !important;
    height: 35px !important;
  }

  .ant-image-mask-info {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ant-image-img {
    display: none;
  }

  .image-label {
    position: absolute;
    z-index: ${(props) => (props.labelSpanVisible ? 5 : -1)};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }
`;
