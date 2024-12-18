import { useState } from 'react';

import { CheckboxIcon } from 'icons';

import { Label, Base } from './styles';
import styled from 'styled-components';

import { colors } from '../../styles/colors';
import { Link } from 'react-router-dom';

export const Checkbox = (props: {
  label?: string;
  onClick?: (event: any) => void;
  checked?: boolean|null;
  checkableItem?: { checked?: boolean };
  size?: number;
  alignLeft?: boolean;
  borderRadius?: number;
  link?: string;
}): JSX.Element => {
  const {
    label, onClick, checked, checkableItem, alignLeft, size, borderRadius, link, ...extraProps
  } = props;
  const isChecked = checked || (checkableItem && checkableItem.checked);
  const [, setState] = useState({});
  function checkHandler() {
    if (checkableItem) {
      checkableItem.checked = !checkableItem.checked;
      setState({});
    }
  }
  return (
    <Label
      style={{
        display: 'flex', flexFlow: 'row nowrap', justifyContent: alignLeft ? 'start' : 'center',
      }}
      {...extraProps}
    >
      <Base style={{ cursor: 'pointer', borderRadius }} onClick={onClick || (checkableItem && checkHandler)} size={size} checked={isChecked}>{isChecked ? <CheckboxIcon size={size} /> : null}</Base>
      {label && !link
      && (
      <span
        style={{
          cursor: 'pointer',
          paddingLeft: '10px',
          hyphens: 'auto',
        }}
        onClick={onClick || (checkableItem && checkHandler)}
      >
          {label}
      </span>
      )}
      {link && <StyledLink to={link}>{label}</StyledLink>}

    </Label>
  );
};

const StyledLink = styled(Link)`
  color: ${colors.Grey400};
  margin: 0 8px 0 8px;
  &:hover {
    text-decoration: underline;
    color: ${colors.Grey400};
  }
`;
