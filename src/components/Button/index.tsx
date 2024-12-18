import {
  Base,
  Primary,
  Green,
  Secondary,
  Disabled,
  Red,
  RedInvert,
  BlueInvert,
  Blue,
  BorderBlue,
  BlueWhite,
  RedInvertWithBorder,
} from './styles';

type Variant = 'primary' | 'secondary' | 'blue-inv' | 'blue' | 'borderblue' | 'greendiel'| 'red' | 'red-inv' | 'disabled' | 'grey' | 'blue-white' | 'red-inv-border';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &{
  variant?: Variant;
  children: JSX.Element | string;
}

export const Button = ({ variant, children, ...props }: ButtonProps): JSX.Element => {
  switch (variant) {
    case 'primary':
      return <Primary {...props}>{children}</Primary>;
    case 'secondary':
      return <Secondary {...props}>{children}</Secondary>;
    case 'blue-inv':
      return <BlueInvert {...props}>{children}</BlueInvert>;
    case 'blue':
      return <Blue {...props}>{children}</Blue>;
    case 'borderblue':
      return <BorderBlue {...props}>{children}</BorderBlue>;
    case 'greendiel':
      return <Green {...props}>{children}</Green>;
    case 'red-inv':
      return <RedInvert {...props}>{children}</RedInvert>;
    case 'blue-white':
      return <BlueWhite {...props}>{children}</BlueWhite>;
    case 'red':
      return <Red {...props}>{children}</Red>;
    case 'red-inv-border':
      return <RedInvertWithBorder {...props}>{children}</RedInvertWithBorder>;
    case 'disabled':
      return (
        <Disabled disabled {...props}>
          {children}
        </Disabled>
      );
    default:
      return <Base {...props}>{children}</Base>;
  }
};
