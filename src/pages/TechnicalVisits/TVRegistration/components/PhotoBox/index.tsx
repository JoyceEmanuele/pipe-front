import { useCallback, useState } from 'react';

import { Image } from 'antd';
import { FaTimes } from 'react-icons/fa';

import { colors } from '~/styles/colors';

import { Container } from './styles';

type Picture = {
  label: string;
  value: string;
}

type PhotoBoxProps = {
  picture: Picture;
  onDeleteRequest: (picture: Picture) => void;
}

export const PhotoBox = ({ picture, onDeleteRequest }: PhotoBoxProps): JSX.Element => {
  const [previewOverlayContainerHeight, setPreviewOverlayContainerHeight] = useState(null);
  const [previewOverlayContainerWidth, setPreviewOverlayContainerWidth] = useState(null);

  const spanRef = useCallback((node) => {
    if (node !== null) {
      setPreviewOverlayContainerHeight(node.getBoundingClientRect().height + 6);
      setPreviewOverlayContainerWidth(node.getBoundingClientRect().width + 6);
    }
  }, []);

  return (
    <Container>
      <Image width={previewOverlayContainerWidth || 0} height={previewOverlayContainerHeight || 0} src={picture.value} />
      { !previewOverlayContainerWidth && (
        <span style={{ display: 'inline-block', visibility: 'hidden' }} ref={spanRef}>
          {picture.label}
        </span>
      )}
      <span className="image-label">
        {picture.label}
      </span>
      <FaTimes color={colors.BlueSecondary} size={12} style={{ marginLeft: 5, cursor: 'pointer' }} role="button" onClick={() => onDeleteRequest(picture)} />
    </Container>
  );
};
