import styled from 'styled-components';

import { colors } from '~/styles/colors';

export const Container = styled.div`
  border: 1px solid ${colors.BlueSecondary};
  color: ${colors.BlueSecondary};
  border-radius: 5px;
  padding: 6px;
  display: flex;
  align-items: center;
  font-size: 10px;
  margin-right: 7px;
  margin-bottom: 7px;
  position: relative;

  .ant-image-img {
    display: none;
  }

  .ant-image-mask-info {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-label {
    position: absolute;
    z-index: -1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
`;
