import { useState, useCallback, useEffect } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import { Loader, ModalWindow, Button } from '..';
import { ArrowIcon, DownloadImageIcon } from '../../icons';
import { colors } from '../../styles/colors';
import { useTranslation, Trans } from 'react-i18next';
import Compressor from 'compressorjs';

import {
  CustomSlider,
  DownloadBox,
  EmptyText,
  EmptyImages,
  ContainerSlider,
  ContainerOptions,
  ContainerImageSecondary,
  ContainerImage,
  Image,
  ImageSecondary,
  ButtonAdd,
  Arrow,
  Close,
  CloseModal,
  ModalTitle,
  ModalText,
  ModalCancel,
} from './styles';

interface CarouselParams {
  getImages: () => Promise<{ list: string[] }>,
  postImage: (photo: Blob) => Promise<unknown>,
  deleteImage: (imageUrl: string) => Promise<unknown>,
  showButton?: boolean,
  index?: number,
  forceReload?: number
}

export const Carousel = ({
  getImages, postImage, deleteImage, showButton = true, index, forceReload,
}: CarouselParams): JSX.Element => {
  const { t } = useTranslation();
  const [images, setImages] = useState([] as string[]);
  const [isOver, setIsOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentImageUrlToModal, setCurrentImageUrlToModal] = useState('');

  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true);
      const { list } = await getImages();
      setImages(list);
    } catch (err) {
      console.log(err);
      toast.error(t('erroImagens'));
    } finally {
      setIsLoading(false);
    }
  }, [forceReload]);

  const handleUploadImage = async (e) => {
    try {
      setIsLoading(true);
      const file = e.target.files[0];
      let fileResult;

      // Utilize uma Promise para tornar o callback success assíncrono
      const compressPromise = new Promise(async (resolve, reject) => {
        await new Compressor(file, {
          quality: 0.6,
          success(result) {
            fileResult = result;
            resolve(result);
          },
          error(err) {
            console.log(err.message);
            reject(err);
          },
        });
      });
      // Aguarde a conclusão da operação assíncrona antes de continuar
      await compressPromise;

      await postImage(fileResult);
    } catch (err) {
      console.log(err);
      toast.error(t('erroAdicionarImagem'));
    } finally {
      await fetchImages();
      setIsLoading(false);
    }
  };

  const CustomArrow = (props) => (
    <Arrow {...props} className={props.next ? 'next' : 'prev'}>
      <ArrowIcon color={colors.White} />
    </Arrow>
  );
  const settings = {
    dots: true,
    dotsClass: 'slick-thumb',
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <CustomArrow next />,
    prevArrow: <CustomArrow next={false} />,
    appendDots: (dots) => (
      <>
        <ContainerOptions>
          <ContainerImageSecondary>{dots}</ContainerImageSecondary>
        </ContainerOptions>
        {showButton
        && (
        <Flex justifyContent="center" alignContent="center">
          <Box justifyContent="center" p="0 10px 20px 10px" alignItems="center" width={1}>
            <ButtonAdd onChange={(e) => handleUploadImage(e)}>
              {t('botaoAdicionarImagem')}
              <input type="file" accept="image/png, image/jpeg" hidden />
            </ButtonAdd>
          </Box>
        </Flex>
        )}
      </>
    ),
    customPaging: (index) => <ImageSecondary src={images[index]} />,
  };

  const removeImage = async () => {
    try {
      setIsLoading(true);
      await deleteImage(currentImageUrlToModal);
      toast.success(t('sucessoDeletarImagem'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroDeletarImagem'));
    } finally {
      await fetchImages();
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const handleDelete = (imageUrl) => {
    setCurrentImageUrlToModal(imageUrl);
    setShowModal(true);
  };

  useEffect(() => {
    fetchImages();
  }, [fetchImages, index]);

  return (
    <>
      {!isLoading ? (
        <ContainerSlider>
          <CustomSlider {...settings}>
            {!!images.length
              && images.map((imageUrl) => (
                <>
                  <ContainerImage
                    key={imageUrl}
                    onMouseEnter={() => setIsOver(true)}
                    onMouseLeave={() => setIsOver(false)}
                  >
                    <Image src={imageUrl} />
                    {isOver && (
                      <>
                        <Close onClick={() => handleDelete(imageUrl)} />

                        <DownloadBox href={imageUrl} download>
                          <DownloadImageIcon color={colors.White} />
                          <p>{t('baixarImagem')}</p>
                        </DownloadBox>
                      </>
                    )}
                  </ContainerImage>
                  {images.length === 1 && showButton && (
                    <Flex justifyContent="center" alignContent="center">
                      <Box justifyContent="center" p="0 10px 20px 10px" alignItems="center" width={1}>
                        <ButtonAdd onChange={(e) => handleUploadImage(e)}>
                          {t('botaoAdicionarImagem')}
                          <input type="file" accept="image/png, image/jpeg" hidden />
                        </ButtonAdd>
                      </Box>
                    </Flex>
                  )}
                </>
              ))}
            {!images.length && showButton && (
              <>
                <Flex flexDirection="column" justifyContent="center" alignItems="center">
                  <Box justifyContent="center" p="0 10px 20px 10px" alignItems="center" width={1}>
                    <EmptyImages>{!images.length && <EmptyText>{t('adicionarImagensDispositivoMaquina')}</EmptyText>}</EmptyImages>
                  </Box>
                  <Box justifyContent="center" p="0 10px 20px 10px" alignItems="center" width={1}>
                    <ButtonAdd onChange={(e) => handleUploadImage(e)}>
                      {t('botaoAdicionarImagem')}
                      <input type="file" accept="image/png, image/jpeg" hidden />
                    </ButtonAdd>
                  </Box>
                </Flex>
              </>
            )}
          </CustomSlider>
        </ContainerSlider>
      ) : (
        <Flex justifyContent="center" alignItems="center" height="350px">
          <Box width={1}>
            <Loader />
          </Box>
        </Flex>
      )}
      {
        showModal && (
        <ModalWindow borderTop onClickOutside={() => setShowModal(false)}>
          <Flex justifyContent="center" flexDirection="column" alignItems="center">

            <Flex justifyContent="space-between" width={1} flexDirection="row" alignItems="center">
              <ModalTitle><b>{t('deletarImagem')}</b></ModalTitle>
              <CloseModal onClick={() => setShowModal(false)} />
            </Flex>
            <Box justifyContent="left" width={1}>
              <ModalText>
                <Trans
                  i18nKey="desejaDeletarEssaImagemPerfilDispositivo"
                >
                  Tem certeza que deseja
                  <b>
                    &nbsp;
                    deletar essa imagem
                    &nbsp;
                  </b>
                  do Perfil do seu dispositivo?
                </Trans>
              </ModalText>
            </Box>
            <Flex justifyContent="center" alignItems="center" flexDirection="column" width="45%">
              <Button onClick={() => removeImage()} variant="red">{t('botaoDeletar')}</Button>
              <ModalCancel onClick={() => setShowModal(false)}>{t('botaoCancelar')}</ModalCancel>
            </Flex>
          </Flex>
        </ModalWindow>
        )
      }
    </>
  );
};
