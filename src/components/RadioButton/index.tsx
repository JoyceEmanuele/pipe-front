import { colors } from 'styles/colors';

import {
  LabelWrap,
  Radio,
  Cursor,
} from './styles';

export const RadioButton = ({
  label, checked, checkedColor = colors.Blue300, uncheckedColor = colors.Grey400, onClick, ...props
}): JSX.Element => (
  <LabelWrap
    uncheckedColor={uncheckedColor}
    onClick={onClick}
    cursor={onClick ? 'pointer' : ''}
    {...props}
  >
    <Radio color={checked ? checkedColor : uncheckedColor}>
      <Cursor color={checked ? checkedColor : colors.White} />
    </Radio>
    {label && <span style={{ paddingLeft: '0.6em' }}>{label}</span>}
  </LabelWrap>
);
