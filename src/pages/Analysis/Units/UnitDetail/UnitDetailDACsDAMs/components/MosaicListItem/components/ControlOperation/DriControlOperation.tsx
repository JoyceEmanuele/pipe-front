import {
  ReactElement,
  useRef,
  useState,
} from 'react';
import {
  ControlButton, ControlButtonIcon, ControlButtonLabel, DriSelectContainer,
  LoaderContainer,
} from './styles';

import img_mode_cool from 'assets/img/cool_ico/mode_cool.svg';
import img_mode_fan from 'assets/img/cool_ico/mode_fan.svg';
import img_mode_off from 'assets/img/cool_ico/power_1_color.svg';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { ArrowDownIcon } from '~/icons';
import { useOuterClickNotifier } from '~/hooks';
import { sendDriOperationMode } from '~/helpers/driAutomation';
import { Loader } from '~/components';

interface DriControlOperationProps {
  driId: string;
  currentOperationMode: number;
  currentSetPoint?: number;
  setCurrentOperationMode: (value: number) => void;
  status?: 'ONLINE' | 'OFFLINE';
}

export function DriControlOperation({
  driId,
  currentOperationMode,
  currentSetPoint,
  setCurrentOperationMode,
  status,
}: DriControlOperationProps): ReactElement {
  const { t } = useTranslation();
  const selectContainerReference = useRef<HTMLDivElement>(null);
  const [openSelectList, setOpenSelectList] = useState(false);
  const [loading, setLoading] = useState(false);

  useOuterClickNotifier(onClickOutside, selectContainerReference);

  function onClickOutside() {
    if (openSelectList) {
      setOpenSelectList(false);
    }
  }

  function getOperationModeIcon(operationMode: number | null) {
    if (operationMode === null) return undefined;
    switch (operationMode) {
      case 0: return img_mode_cool;
      case 1: return img_mode_fan;
      case 2: return img_mode_off;
    }
  }

  function onClickControlButton() {
    if (openSelectList) return;
    setOpenSelectList(true);
  }

  async function setOperationMode(operationMode: number) {
    const oldOperationMode = currentOperationMode;
    setCurrentOperationMode(operationMode);
    try {
      setOpenSelectList(false);

      toast.success(t('iniciandoTrocaDeModoDeOperacao'));
      setLoading(true);
      await sendDriOperationMode(driId, operationMode, currentSetPoint);
      setLoading(false);
    } catch (err) {
      setCurrentOperationMode(oldOperationMode);
      console.error(err);
      toast.error(t('erro'));
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <LoaderContainer>
        <Loader />
      </LoaderContainer>
    );
  }

  return (
    <>
      <ControlButton
        onClick={onClickControlButton}
        disabled={status !== 'ONLINE'}
        style={{ gap: '4px' }}
      >
        <ControlButtonIcon
          status={status}
          alt="mode"
          src={getOperationModeIcon(currentOperationMode)}
        />
        <ArrowDownIcon heigth="8px" color={status !== 'OFFLINE' ? '#000000' : '#B3B3B3'} />
        {openSelectList && status === 'ONLINE' && (
          <DriSelectContainer ref={selectContainerReference}>
            <div>
              <ControlButton
                isActive={currentOperationMode === 0}
                onClick={() => setOperationMode(0)}
                style={{ width: '120px' }}
                noBorder
              >
                <ControlButtonIcon
                  isActive={currentOperationMode === 0}
                  alt="cool"
                  src={img_mode_cool}
                />
                <ControlButtonLabel isActive={currentOperationMode === 0}>
                  {t('refrigerar')}
                </ControlButtonLabel>
              </ControlButton>
            </div>
            <div>
              <ControlButton
                isActive={currentOperationMode === 1}
                onClick={() => setOperationMode(1)}
                style={{ width: '120px' }}
                noBorder
              >
                <ControlButtonIcon
                  isActive={currentOperationMode === 1}
                  alt="fan"
                  src={img_mode_fan}
                />
                <ControlButtonLabel isActive={currentOperationMode === 1}>
                  {t('ventilar')}
                </ControlButtonLabel>
              </ControlButton>
            </div>
            <div>
              <ControlButton
                isActive={currentOperationMode === 2}
                onClick={() => setOperationMode(2)}
                style={{ width: '120px' }}
                noBorder
              >
                <ControlButtonIcon
                  isActive={currentOperationMode === 2}
                  alt="off"
                  src={img_mode_off}
                />
                <ControlButtonLabel isActive={currentOperationMode === 2}>
                  {t('desligar')}
                </ControlButtonLabel>
              </ControlButton>
            </div>
          </DriSelectContainer>
        )}
      </ControlButton>
    </>
  );
}
