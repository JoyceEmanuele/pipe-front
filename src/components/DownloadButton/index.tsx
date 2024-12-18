import { Wrapper } from './styles';
import downloadButton from '../../assets/img/download.svg';

export const DownloadButton = (props: any): JSX.Element => (
  <Wrapper onClick={props.handleClick}>
    <img src={downloadButton} alt="download button" />
  </Wrapper>
);
