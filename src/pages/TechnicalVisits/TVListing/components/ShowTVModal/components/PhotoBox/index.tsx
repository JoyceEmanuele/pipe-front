import { useCallback, useState } from 'react';

import { Image } from 'antd';

import { Container } from './styles';

type Props = {
  pictureUri?: string[];
}

export const PhotoBox = ({ pictureUri }: Props): JSX.Element => {
  const [previewOverlayContainerHeight, setPreviewOverlayContainerHeight] = useState(null);
  const [previewOverlayContainerWidth, setPreviewOverlayContainerWidth] = useState(null);
  const [labelSpanVisible, setLabelSpanVisible] = useState(true);

  const spanRef = useCallback((node) => {
    if (node !== null) {
      setPreviewOverlayContainerHeight(node.getBoundingClientRect().height + 6);
      setPreviewOverlayContainerWidth(node.getBoundingClientRect().width + 6);
    }
  }, []);

  return (
    <Container doesPictureUriExists={!!pictureUri} labelSpanVisible={labelSpanVisible} onMouseEnter={() => !!pictureUri && setLabelSpanVisible(false)} onMouseLeave={() => !!pictureUri && setLabelSpanVisible(true)}>
      {
        pictureUri
          ? (
            <Image width={previewOverlayContainerWidth || 0} height={previewOverlayContainerHeight || 0} src={pictureUri[0]} />
          )
          : <></>
      }
      { !previewOverlayContainerWidth && (
        <span style={{ display: 'inline-block', visibility: 'hidden' }} ref={spanRef}>
          Visualizar
        </span>
      )}
      <span className="image-label">
        Visualizar
      </span>
    </Container>
  );
};
