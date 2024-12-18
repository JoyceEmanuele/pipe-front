import { CloseIcon } from '../../icons';
import { colors } from '../../styles/colors';
import {
  IconWrapper,
  SelectedContainer,
  Selected,
} from './styles';

export const ClearSelect = (cProps: {
  value?: any;
  onClickClear;
}): JSX.Element => {
  const {
    value,
    ...props
  } = cProps;
  return (
    <SelectedContainer style={{
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      maxWidth: '100%',
    }}
    >
      <IconWrapper
        disabled={false}
        onClick={() => props.onClickClear('')}
      >
        <CloseIcon color={colors.Grey400} />
      </IconWrapper>
      <Selected>{value}</Selected>
    </SelectedContainer>
  );
};
