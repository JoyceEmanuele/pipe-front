import { Box, Dialog } from '@material-ui/core';
import { ColorChangeBtn } from '../../icons/ColorChange';
import { useState } from 'react';
import { SketchPicker } from 'react-color';
import { t } from 'i18next';

export type ChangeColorProps = {
  data: {color:string, description: string, index: number}[];
  setColor?: any;
  blueVersion?: boolean;
}

export type ButtonChangeColorProps = {
  onClick?: any;
  blueVersion?: boolean;
}

export type ChangeColorDialogProps = {
  onClose?:any;
  open: boolean;
  data: {color:string, description: string, index: number}[];
  setColor: any;
}

export function ChangeColor({ data, setColor, blueVersion }: ChangeColorProps): JSX.Element {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <>
      <ButtonChangeColor blueVersion={blueVersion} onClick={() => setShowDialog(!showDialog)} />
      <ChangeColorDialog
        onClose={() => setShowDialog(false)}
        open={showDialog}
        data={data}
        setColor={setColor}
      />
    </>
  );
}

export function ButtonChangeColor({ onClick, blueVersion }: ButtonChangeColorProps): JSX.Element {
  return (
    <Box display="flex" justifyContent="center" flexDirection="row" alignItems="center" textAlign="center" width="154px" height="31px" style={{ cursor: 'pointer', border: '0.8px solid rgba(80, 80, 80, 0.31)', borderRadius: '10px' }}>
      <ColorChangeBtn blueVersion />
      <div
        style={{
          paddingLeft: '8px', lineHeight: '20px', fontSize: '13px', fontWeight: blueVersion ? 'bold' : '',
        }}
        onClick={onClick}
      >
        {t('alterarCores')}
      </div>
    </Box>
  );
}

export function ChangeColorDialog({
  onClose, open, data, setColor,
}: ChangeColorDialogProps): JSX.Element {
  const [selected, setSelected] = useState({ color: '', description: '', index: 0 });
  const [showPickerColor, setShowPickerColor] = useState(false);

  return (
    <Dialog onClose={onClose} open={open} maxWidth="lg">
      <Box width={showPickerColor ? '700px' : '450px'} margin="30px">
        <Box borderBottom="1px solid rgba(0, 0, 0, 0.2)" height="60px" display="flex" alignItems="center">
          <h3 style={{ fontWeight: 700 }}>Alterar Cores</h3>
        </Box>
        <Box width="100%" display="flex" marginTop="30px">
          <Box width={showPickerColor ? '64%' : '100%'}>
            {data.map((itemData) => (
              <Box display="flex" alignItems="center" alignContent="center" height="40px">
                <div
                  onClick={() => { setSelected(itemData); setShowPickerColor(true); }}
                  style={{
                    width: '16px', height: '16px', background: itemData.color, borderRadius: '5px', marginRight: '10px', cursor: 'pointer',
                  }}
                />
                <div style={{
                  fontSize: '13px', fontWeight: '700px', color: '#525252',
                }}
                >
                  {itemData.description}
                </div>
              </Box>
            ))}
          </Box>
          <Box width={showPickerColor ? '32%' : '0%'} marginLeft="2%">
            {showPickerColor && (
              <SketchPicker
                color={selected.color}
                onChangeComplete={(color) => setColor(color, selected.index)}
                size="small"
              />
            )}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

export const ChangeColorSample = (option, setColor, color) => {
  const [showPickerColor, setShowPickerColor] = useState(false);
  return (
    <>
      <div style={{ backgroundColor: color, width: 18, height: 18 }} onClick={() => setShowPickerColor(!showPickerColor)} />
      <Box width={showPickerColor ? '100%' : '0%'} marginLeft="2%" zIndex={100}>
        {showPickerColor && (
          <SketchPicker
            color={color}
            onChangeComplete={(color) => setColor(color, option.index)}
          />
        )}
      </Box>
    </>
  );
};
