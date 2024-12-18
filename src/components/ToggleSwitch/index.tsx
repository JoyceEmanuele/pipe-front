import { CSSProperties, MouseEventHandler } from 'react';
import {
  Slider,
  StateLabelChecked,
  StateLabelUnchecked,
  Cursor,
  Container,
  SliderMini,
  CursorMini,
} from './styles';

const variantWidth = {
  auto: 100,
  bloq: 90,
};

interface CProps {
  checked: boolean
  label?: string
  variant?: keyof typeof variantWidth
  sLabel?: string;
  disabled?: boolean;
}

interface ToggleSwitchMiniProps {
  checked: boolean;
  disabled?: boolean;
  label?: string;
  onOff?: boolean;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const ToggleSwitch = ({
  label = undefined, checked, disabled, variant = undefined, sLabel = undefined, ...props
}: CProps): JSX.Element => (
  <Container {...props} disabled={disabled}>
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Slider checked={checked} variant={variant} width={(variant && variantWidth[variant]) || 44}>
        <Cursor checked={checked} variant={variant} />
        {(variant === 'auto') && (checked) && <StateLabelChecked width={variantWidth.auto}>AUTOMÁTICO</StateLabelChecked>}
        {(variant === 'auto') && (!checked) && <StateLabelUnchecked width={variantWidth.auto}>MANUAL</StateLabelUnchecked>}
        {(variant === 'bloq') && (checked) && <StateLabelChecked width={variantWidth.bloq}>{sLabel || 'LIBERADO'}</StateLabelChecked>}
        {(variant === 'bloq') && (!checked) && <StateLabelUnchecked width={variantWidth.bloq}>{sLabel || 'BLOQUEADO'}</StateLabelUnchecked>}
      </Slider>
      {label && <span style={{ paddingLeft: '8px' }}>{label}</span>}
    </div>
  </Container>
);

export const ToggleSwitchMini = ({
  checked,
  label = undefined,
  onOff = false,
  disabled = false,
  ...props
}: ToggleSwitchMiniProps): JSX.Element => (
  <Container {...props} disabled={disabled}>
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <SliderMini checked={checked}>
        <CursorMini onOff={onOff} checked={checked} />
      </SliderMini>
      {label && <span style={{ paddingLeft: '8px' }}>{label}</span>}
    </div>
  </Container>
);
