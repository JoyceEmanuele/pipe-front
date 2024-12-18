import React, { useState } from 'react';
import { CloseEyeIcon, OpenEyeIcon } from '~/icons';
import { colors } from '~/styles/colors';
import styled from 'styled-components';

export const IconWrapper = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-top: 15px;
  margin-right: 15px;
  svg {
    width: 18px;
    height: 18px;
  }
`;

export const usePasswordToggle = () => {
  const [visible, setVisiblity] = useState(false);

  const Icon = (
    <IconWrapper onClick={() => setVisiblity((visiblity) => !visiblity)}>
      {!visible ? <OpenEyeIcon /> : <CloseEyeIcon />}
    </IconWrapper>
  );

  const InputType = visible ? 'text' : 'password';

  return [InputType, Icon];
};
