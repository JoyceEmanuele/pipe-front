/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import {
  useEffect, useRef, useState,
} from 'react';
import { ImageZoomActionButton, ImageZoomActions, ImageZoomWrapper } from './styles';
import {
  ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from 'react-zoom-pan-pinch';
import Draggable from 'react-draggable';
import { Pin } from '../Pin';
import { ResetZoomIcon, ZoomLessIcon, ZoomMoreIcon } from '~/icons';
import { UnitMapPointsResponseData } from '~/metadata/UnitMap.model';
import { PinEditModal } from '../PinEditModal';
import { PinTooltip } from '../PinTooltip';
import { useUnitMap } from '~/pages/Analysis/Units/UnitProfile/UnitMap/UnitMapContext';
import { LoaderOverlay } from '~/pages/Analysis/Units/EnergyEfficiency/TelemetryDemandCard/styles';
import { Loader } from '../Loader';

interface ImageZoomProps {
  imageUrl: string;
  pins: UnitMapPointsResponseData[];
  hasDragPin?: boolean
  onPinDrag: (id: string | number, x: number, y: number) => void;
}

export const ImageZoom: React.FC<ImageZoomProps> = ({
  imageUrl,
  pins,
  onPinDrag,
  hasDragPin = true,
}) => {
  const [imageScale, setImageScale] = useState(1);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [imagePosition, setImagePosition] = useState({
    positionX: 0,
    positionY: 0,
  });

  const [updatePosition, setUpdatePosition] = useState(0);

  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [showImage, setShowImage] = useState(false);

  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
  const [selectedPinId, setSelectedPinId] = useState<number | undefined>();

  const {
    isShowList,
  } = useUnitMap();

  const handleZoomIn = () => {
    if (transformRef.current) {
      transformRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (transformRef.current) {
      transformRef.current.zoomOut();
    }
  };

  const handleResetZoom = () => {
    if (transformRef.current) {
      transformRef.current.setTransform(imagePosition.positionX, imagePosition.positionY, 1);
    }
  };

  const handleOnLoadImage = () => {
    if (transformRef.current) {
      const wrapperElement: HTMLElement | null = document.querySelector('.react-transform-wrapper');

      if (!wrapperElement) return;

      const adjustXValue = (wrapperElement.offsetWidth - imageWidth) / 2;
      const adjustYValue = (wrapperElement.offsetHeight - imageHeight) / 2;

      setImagePosition({
        positionX: adjustXValue,
        positionY: adjustYValue,
      });

      transformRef.current.setTransform(adjustXValue, adjustYValue, 1);
    }
  };

  const handleSetImageSize = () => {
    const imageElement = document.getElementById('image-map-element');
    if (!imageElement) return;

    setImageWidth(imageElement.offsetWidth);
    setImageHeight(imageElement.offsetHeight);
    setUpdatePosition(updatePosition + 1);
    setIsLoadingImage(false);
  };

  useEffect(() => {
    handleOnLoadImage();
  }, [updatePosition, imageWidth, imageHeight]);

  useEffect(() => {
    setIsLoadingImage(true);
    setShowImage(false);
  }, [imageUrl]);

  function handleMouseOver(pin) {
    let dutType = 'dut';

    if ((pin.eCO2 !== undefined && pin.eCO2 !== null) && (pin.HUMIDITY != null)) dutType = 'dutQA';

    const horizontalAdjusts = {
      dut: {
        left: '50%',
        right: '-130%',
      },
      dutQA: {
        left: '115%',
        right: '-190%',
      },
    };

    const popover = document.getElementById(`${pin.DUT_ID}-popover`);
    if (!popover) return;

    popover.style.left = '-40%';
    popover.style.top = 'unset';
    popover.style.bottom = '115%';
    popover.style.display = 'block';

    const draggElement = document.getElementById(`dragg-${pin.DUT_ID}-popover`);
    if (!draggElement) return;

    draggElement.style.zIndex = '99999';

    const wrapperElement = document.querySelector('.react-transform-wrapper');
    if (!wrapperElement) return;

    const rectTooltip = popover.getBoundingClientRect();
    const rectWrapper = wrapperElement.getBoundingClientRect();
    const style = window.getComputedStyle(wrapperElement);
    const transformation = style.transform;
    let scaleFactor = 1;

    if (transformation && transformation !== 'none') {
      const values = transformation.split('(')[1].split(')')[0].split(',');
      scaleFactor = parseFloat(values[0]);
    }

    const adjustedTop = rectTooltip.top / scaleFactor;
    const adjustedLeft = rectTooltip.left / scaleFactor;

    if (adjustedTop < rectWrapper.top) {
      popover.style.bottom = 'unset';
      popover.style.top = '115%';
    }

    if (adjustedLeft < rectWrapper.left) {
      popover.style.left = horizontalAdjusts[dutType].left;
    } else if (adjustedLeft + rectTooltip.width > rectWrapper.right) {
      popover.style.left = horizontalAdjusts[dutType].right;
    }
  }

  return (
    <ImageZoomWrapper>
      {isLoadingImage ? (
        <div>
          <LoaderOverlay>
            <Loader variant="primary" size="large" />
          </LoaderOverlay>
          <img
            id="image-map-element"
            src={imageUrl}
            alt="Fake"
            style={{ pointerEvents: 'none', maxWidth: '100%', visibility: 'hidden' }}
            onLoad={handleSetImageSize}
          />
        </div>
      ) : (
        <>
          <TransformWrapper
            ref={transformRef}
            centerOnInit
            options={{ disabled: true }}
            onTransformed={(_, state) => {
              setImageScale(state.scale);

              if (state.positionX === imagePosition.positionX && state.positionY === imagePosition.positionY) setShowImage(true);
            }}
            maxScale={2}
            minScale={0.5}
          >
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                cursor: 'grab',
              }}
            >
              <div style={{ visibility: showImage ? 'unset' : 'hidden' }}>
                <img
                  src={imageUrl}
                  alt="Map"
                  style={{ pointerEvents: 'none' }}
                />
                {pins.map((pin) => (
                  <Draggable
                    key={pin.DUT_ID}
                    position={{ x: Number(pin.POINT_X), y: Number(pin.POINT_Y) }}
                    disabled={!hasDragPin}
                    onDrag={(e, data) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onPinDrag(pin.DUT_ID, data.x, data.y);
                    }}
                  >
                    <div
                      id={`dragg-${pin.DUT_ID}-popover`}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                      }}
                      onMouseOver={() => handleMouseOver(pin)}
                      onMouseOut={(e) => {
                        const popover = document.getElementById(`${pin.DUT_ID}-popover`);
                        if (!popover) return;
                        popover.style.display = 'none';

                        const draggElement = document.getElementById(`dragg-${pin.DUT_ID}-popover`);
                        if (!draggElement) return;

                        draggElement.style.zIndex = 'unset';
                      }}
                    >
                      {isShowList && <PinTooltip tooltipId={`${pin.DUT_ID}-popover`} pin={pin} />}
                      <Pin pin={pin} handleEditPin={(pinId) => setSelectedPinId(pinId)} />
                    </div>
                  </Draggable>
                ))}
              </div>
            </TransformComponent>
          </TransformWrapper>
          <ImageZoomActions>
            <ImageZoomActionButton isActive={imageScale < 2} onClick={() => imageScale < 2 && handleZoomIn()}>
              <ZoomMoreIcon />
            </ImageZoomActionButton>
            <ImageZoomActionButton isActive={imageScale > 0.5} onClick={() => imageScale > 0.5 && handleZoomOut()}>
              <ZoomLessIcon />
            </ImageZoomActionButton>
            <ImageZoomActionButton isActive={imageScale !== 1} onClick={() => imageScale !== 1 && handleResetZoom()}>
              <ResetZoomIcon />
            </ImageZoomActionButton>
          </ImageZoomActions>
        </>
      )}
      {selectedPinId && <PinEditModal pinId={selectedPinId} handleCloseModal={() => setSelectedPinId(undefined)} />}
    </ImageZoomWrapper>
  );
};
