import { Flex } from 'reflexbox';
import { Button, ModalWindow } from '~/components';
import {
  ModalCancel,
  ModalSubTitle,
  ModalTitle,
  HorizontalLine,
} from './styles';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { Row } from './Row';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function ModalOrderColumns(props: {
  handleSubmitModal;
  handleCancelModal;
  handleChangeColumns;
  columns;
  isDesktop;
  handleDragColumn;
  handleResetColumns;
}): JSX.Element {
  const {
    handleSubmitModal,
    handleCancelModal,
    columns,
    handleChangeColumns,
    isDesktop,
    handleDragColumn,
    handleResetColumns,
  } = props;

  const [originalColumns, setOriginalColumns] = useState(columns);
  const [hasColumnVisible, setHasColumnVisible] = useState(
    columns.some((column) => column.visible === true),
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setOriginalColumns(columns);
  }, []);

  function handleSave() {
    if (!hasColumnVisible) {
      setHasError(true);
      return;
    }
    handleSubmitModal();
  }

  function handleVisibility(column) {
    const hasColumnVisibleAux = handleChangeColumns(column);
    setHasColumnVisible(hasColumnVisibleAux);

    if (hasError) {
      setHasError(false);
    }
  }

  return (
    <>
      <ModalWindow
        borderTop
        style={{
          width: isDesktop ? '550px' : '300px',
          paddingLeft: '0',
          paddingRight: '0',
        }}
        onClickOutside={() => {
          handleResetColumns(originalColumns);
          handleCancelModal();
        }}
      >
        <Flex
          flexDirection="column"
          alignItems="flex-start"
          paddingX="20px"
          justifyContent="center"
          zIndex="100000"
        >
          <ModalTitle>{t('ordenarColunas')}</ModalTitle>
          <ModalSubTitle>
            {t('organizarOrdemColunasSelecioneQualVisualizar')}
          </ModalSubTitle>
        </Flex>
        <HorizontalLine />
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          paddingY="20px"
          paddingX="100px"
          style={{
            gap: '10px',
            maxHeight: '450px',
            display: 'flex',
            justifyContent: 'flex-start',
            overflowY: 'auto',
          }}
        >
          <DndProvider backend={HTML5Backend}>
            {columns.map((column, index) => (
              <Row
                index={index}
                key={column.id}
                column={column}
                handleChangeVisibility={handleVisibility}
                handleMoveItem={handleDragColumn}
              />
            ))}
          </DndProvider>
        </Flex>
        {!hasColumnVisible && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                color: hasError ? 'red' : '#8F8F8F',
                textAlign: 'center',
              }}
            >
              {t('paraSalvarNecessarioUmaColunaVisivel')}
            </span>
          </div>
        )}
        <HorizontalLine />
        <Flex
          justifyContent="space-between"
          paddingTop="20px"
          paddingX="20px"
          alignItems="center"
          flexDirection="row"
          width="100%"
          style={{ gap: '8px' }}
        >
          <ModalCancel
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleResetColumns(originalColumns);
              handleCancelModal();
            }}
          >
            {t('botaoCancelar')}
          </ModalCancel>
          <Button
            style={{ maxWidth: '150px' }}
            onClick={handleSave}
            variant="primary"
          >
            {t('botaoSalvar')}
          </Button>
        </Flex>
      </ModalWindow>
    </>
  );
}
