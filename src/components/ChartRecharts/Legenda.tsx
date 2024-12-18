import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import { SketchPicker } from 'react-color';
import { AccordionV2 } from 'components/Accordion';
import styled from 'styled-components';
import { colors } from '../../styles/colors';
import { useStateVar } from '../../helpers/useStateVar';
import { Flex } from 'reflexbox';

interface LineInfo {
  id: string
  name: string
  unit?: string
  color: string
  checked?: boolean
}

export function LegendaGroup(props: {
  groups: {
    name: string
    lines: LineInfo[]
  }[]
  onCheckboxChanging: () => void
  onColorChanging: (color: { hex: string }, lineInfo: LineInfo, group: { name: string }) => void
}) {
  const {
    groups, onCheckboxChanging, onColorChanging, ...cProps
  } = props;
  function setAllGroup(list: { checked?: boolean }[]) {
    const shouldBeChecked = list.some((group) => !group.checked);
    for (const group of list) {
      group.checked = shouldBeChecked;
    }
    props.onCheckboxChanging();
  }

  return (
    <div {...cProps}>
      {props.groups.map((group) => (
        <AccordionV2
          key={group.name}
          title={group.name}
          style={{ marginTop: '10px' }}
          opened
          openedExtraHeader={(
            <div>
              <Checkbox color="primary" checked={group.lines.every((line) => line.checked)} onClick={() => setAllGroup(group.lines)} />
              <span style={{ fontWeight: 'bold' }}>Selecionar Todos</span>
            </div>
          )}
        >
          <Legenda
            lines={group.lines}
            onCheckboxChanging={(_lineInfo) => {
              props.onCheckboxChanging();
            }}
            onColorChanging={(color, lineInfo) => {
              props.onColorChanging(color, lineInfo, group);
            }}
          />
        </AccordionV2>
      ))}
    </div>
  );
}

export function Legenda(props: {
  lines: LineInfo[]
  onCheckboxChanging: (lineInfo: LineInfo) => void
  onColorChanging: (color: { hex: string }, lineInfo: LineInfo) => void
}) {
  const [state, _render, setState] = useStateVar({
    displayColorPickerFor: null as null|LineInfo,
  });

  function onLineColorClick(lineInfo: LineInfo) {
    setState({ displayColorPickerFor: lineInfo });
  }

  function onBackgroundClick() {
    setState({ displayColorPickerFor: null });
  }

  return (
    <div>
      {props.lines.map((lineInfo) => (
        <CheckboxLine key={lineInfo.id}>
          <Flex>
            <Checkbox
              checked={lineInfo.checked}
              value={lineInfo.checked}
              color="primary"
              onChange={() => { lineInfo.checked = !lineInfo.checked; props.onCheckboxChanging(lineInfo); }}
              style={{ padding: '3px' }}
            />
            <Text>
              {lineInfo.name}
              {lineInfo.unit && ` [${lineInfo.unit}]`}
            </Text>
          </Flex>
          <div
            style={{
              marginLeft: '10px',
              background: '#fff',
              borderRadius: '1px',
              display: 'inline-block',
              cursor: 'pointer',
            }}
            onClick={() => onLineColorClick(lineInfo)}
          >
            <div
              style={{
                width: '36px',
                height: '14px',
                borderRadius: '2px',
                background: `${lineInfo.color}`,
              }}
            />
          </div>
        </CheckboxLine>
      ))}
      {(state.displayColorPickerFor) && (
        <div style={{ position: 'absolute', zIndex: 2 }}>
          <div
            style={{
              position: 'fixed',
              top: '0px',
              right: '0px',
              bottom: '0px',
              left: '0px',
            }}
            onClick={() => onBackgroundClick()}
          />
          <SketchPicker color={state.displayColorPickerFor.color} onChange={(color) => { props.onColorChanging && props.onColorChanging(color, state.displayColorPickerFor!); }} />
        </div>
      )}
    </div>
  );
}

const Text = styled.span`
  font-weight: normal;
  font-size: 1em;
  line-height: 26px;
  color: ${colors.Grey400};
`;

const CheckboxLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
