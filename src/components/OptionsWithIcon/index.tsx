import { useEffect, useRef } from 'react';
import moment from 'moment';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import {
  IconWrapper,
  Data,
  DataText,
  StatusBox,
} from './styles';
import { getUserProfile } from 'helpers/userProfile';
import { colors } from 'styles/colors';
import { useWebSocketLazy } from 'helpers/wsConnection';
import { toast } from 'react-toastify';

import {
  NoSignalIcon,
  BadSignalIcon,
  RegularSignalIcon,
  GoodSignalIcon,
  GreatSignalIcon,
  InformationIcon,
} from '~/icons';

interface ComponentProps {
  options: {
    icon: JSX.Element,
    iconSelected,
    label: string,
    selected: boolean,
    mode: string
  }[],
  disabled: boolean,
  handleSelect,
}

export const OptionsWithIcon = (props: ComponentProps): JSX.Element => {
  const [state, render, _setState] = useStateVar(() => {
    const innerState = {
      options: props.options as {
        icon: JSX.Element,
        iconSelected,
        label: string,
        selected: boolean,
        mode: string
      }[],
      mainOption: props.options.find((item) => item.selected) || props.options[0] as null|{
        icon: JSX.Element,
        iconSelected,
        label: string,
        selected: boolean,
        mode: string
      },
      expand: false,
    };
    return innerState;
  });
  const refModal = useRef<any>(null);

  useEffect(() => {
    (async function () {
      state.mainOption = props.options.find((item) => item.selected) || null;
      render();
    }());

    function handleClickOutside(event) {
      if (refModal.current && !refModal.current.contains(event.target)) {
        state.expand = false;
        render();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [props]);

  function selectItem(index) {
    if (!state.options[index].selected) {
      const selectedPrevious = state.options.find((item) => item.selected);
      if (selectedPrevious) {
        selectedPrevious.selected = false;
      }
      state.options[index].selected = true;
      state.mainOption = state.options[index];
      state.expand = false;
      render();
      props.handleSelect(state.options);
    }
    state.expand = false;
    render();
  }

  return (
    <>
      {!state.expand && (
        <Flex
          flexWrap="nowrap"
          flexDirection="column"
          height="49px"
          width="141px"
          alignItems="left"
          style={{
            border: '1px solid lightgrey',
            borderRadius: '10px',
            cursor: !props.disabled ? 'pointer' : 'default',
            opacity: !props.disabled ? '1' : '0.5',
          }}
          onClick={() => { if (!props.disabled) { state.expand = true; render(); } }}
        >
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            mt="5px"
          >
            <IconWrapper>
              {state.mainOption?.icon}
            </IconWrapper>
            <DataText
              style={{
                marginLeft: '10px', fontSize: '12px', width: 'fit-content', height: '36px', lineHeight: state.mainOption?.label ? (state.mainOption?.label?.length < 11 ? '36px' : 'unset') : 'unset',
              }}
              color="#363BC4"
              fontWeight="bold"
            >
              {state.mainOption?.label}
            </DataText>
          </Flex>
        </Flex>
      )}
      {state.expand && (
        <Flex
          flexWrap="nowrap"
          flexDirection="column"
          width="141px"
          alignItems="left"
          style={{
            border: '1px solid lightgrey',
            borderRadius: '10px',
          }}
        >
          {state.options.map((option, index) => (
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              style={{
                borderBottom: index < state.options.length - 1 ? '1px solid lightgrey' : '0px',
                cursor: 'pointer',
                backgroundColor: !option.selected ? 'white' : '#363BC4',
              }}
              onClick={() => { selectItem(index); }}
            >
              <IconWrapper style={{ marginLeft: '13px', marginTop: '11px' }}>
                {!option.selected ? option.icon : option.iconSelected}
              </IconWrapper>
              <DataText
                style={{
                  marginLeft: '10px', marginTop: '6px', fontSize: '11px', width: '80px', height: '36px', lineHeight: option.label.length < 11 ? '36px' : 'none',
                }}
                color={!option.selected ? '#363BC4' : 'white'}
                fontWeight="bold"
              >
                {option.label}
              </DataText>
            </Flex>
          ))}
        </Flex>
      )}
    </>
  );
};
