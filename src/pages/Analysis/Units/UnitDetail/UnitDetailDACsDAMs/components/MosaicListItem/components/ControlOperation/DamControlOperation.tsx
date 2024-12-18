import {
  ReactElement, useMemo, useRef,
  useState,
} from 'react';
import {
  ControlButton, ControlButtonIcon, SelectContainer,
} from './styles';
import { ArrowDownIcon } from 'icons';
import { useOuterClickNotifier } from 'hooks';

import img_mode_cool from 'assets/img/cool_ico/mode_cool.svg';
import img_mode_fan from 'assets/img/cool_ico/mode_fan.svg';
import img_mode_off from 'assets/img/cool_ico/power_grey_slash.svg';

type DamOperationMode = 'allow' | 'onlyfan' | 'forbid';

interface DamControlOperationProps {
  currentOption: string;
  sendOperation: (mode: DamOperationMode, option: string) => void;
  status?: 'ONLINE' | 'OFFLINE';
  disabled?: boolean;
}

export function DamControlOperation({
  currentOption,
  disabled,
  sendOperation,
  status,
}: DamControlOperationProps): ReactElement {
  const selectContainerReference = useRef<HTMLDivElement>(null);
  const [openSelectList, setOpenSelectList] = useState(false);

  const currentOperation = useMemo(() => getOperationModeByOption(currentOption),
    [currentOption]);

  useOuterClickNotifier(onClickOutside, selectContainerReference);

  function onClickOutside() {
    if (openSelectList && status === 'ONLINE') {
      setOpenSelectList(false);
    }
  }

  function getOperationModeIcon(operationMode: DamOperationMode | null) {
    if (operationMode === null) return undefined;
    switch (operationMode) {
      case 'allow': return img_mode_cool;
      case 'onlyfan': return img_mode_fan;
      case 'forbid': return img_mode_off;
    }
  }

  function onClickControlButton() {
    if (openSelectList) return;
    setOpenSelectList(true);
  }

  function getOptionByOperationMode(operationMode: DamOperationMode): string {
    switch (operationMode) {
      case 'allow': return 'Refrigerar';
      case 'onlyfan': return 'Ventilar';
      default: return 'Bloquear';
    }
  }

  function getOperationModeByOption(option: string): DamOperationMode {
    switch (option) {
      case 'Refrigerar': return 'allow';
      case 'Ventilar': return 'onlyfan';
      default: return 'forbid';
    }
  }

  async function setOperationMode(operationMode: DamOperationMode) {
    setOpenSelectList(false);
    sendOperation(operationMode, getOptionByOperationMode(operationMode));
  }

  return (
    <>
      <ControlButton
        onClick={onClickControlButton}
        disabled={status !== 'ONLINE' || disabled}
        style={{ gap: '4px' }}
      >
        <ControlButtonIcon
          status={status}
          alt="mode"
          src={getOperationModeIcon(currentOperation)}
        />
        <ArrowDownIcon heigth="8px" color="#B3B3B3" />
        {openSelectList && status === 'ONLINE' && (
          <SelectContainer ref={selectContainerReference}>
            {currentOperation !== 'allow' && (
              <div>
                <ControlButton
                  isActive={false}
                  onClick={() => setOperationMode('allow')}
                  noBorder
                >
                  <ControlButtonIcon
                    isActive={false}
                    alt="cool"
                    src={img_mode_cool}
                  />
                </ControlButton>
              </div>
            )}
            {currentOperation !== 'onlyfan' && (
              <div>
                <ControlButton
                  isActive={false}
                  onClick={() => setOperationMode('onlyfan')}
                  noBorder
                >
                  <ControlButtonIcon
                    isActive={false}
                    alt="fan"
                    src={img_mode_fan}
                  />
                </ControlButton>
              </div>
            )}
            {currentOperation !== 'forbid' && (
              <div>
                <ControlButton
                  isActive={false}
                  onClick={() => setOperationMode('forbid')}
                  noBorder
                >
                  <ControlButtonIcon
                    isActive={false}
                    alt="off"
                    src={img_mode_off}
                  />
                </ControlButton>
              </div>
            )}
          </SelectContainer>
        )}
      </ControlButton>
    </>
  );
}
