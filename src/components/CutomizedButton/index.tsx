import { DownloadImageIcon } from '../../icons';
import {
  Base, IconArea,
} from './styles';

type Variant = 'download';

export type ButtonProps = {
  variant?: Variant;
  description: string;
  colorIcon?: string
}

export const CustomizedButton = ({
  variant,
  description,
  colorIcon,
  ...props
}: ButtonProps): JSX.Element => {
  if (variant === 'download') {
    return (
      <Base {...props}>
        <IconArea>
          <DownloadImageIcon color={colorIcon ?? '#363BC4'} />
        </IconArea>
        {description}
      </Base>
    );
  }

  return <Base {...props}>{description}</Base>;
};
