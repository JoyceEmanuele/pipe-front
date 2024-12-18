import { memo, ReactElement, useState } from 'react';
import { Box } from 'reflexbox';
import { Label, SearchInput } from '../../styles';
import SelectSearch, { fuzzySearch } from 'react-select-search';

interface SelectDevTypeProps {
  defaultDev: string;
  onFilterDevChange: (devType: string) => void;
}

const devTypesList = [
  { value: 'DAM', name: 'DAM' },
  { value: 'DUT', name: 'DUT' },
  { value: 'Iluminação', name: 'Iluminação' },
];

export const SelectDevType = memo(({ defaultDev, onFilterDevChange }: SelectDevTypeProps): ReactElement => {
  const [selectedDevType, setSelectedDevType] = useState<string>(defaultDev ?? '');

  function onChangeDevType(devType): void {
    setSelectedDevType(devType);
    onFilterDevChange(devType as string);
  }

  return (
    <Box width={[1, 1, 1, 1, 1, 1 / 5]}>
      <SearchInput>
        <div style={{ width: '100%', paddingTop: 3 }}>
          <Label>Tipo de Dispositivo</Label>
          <SelectSearch
            options={devTypesList}
            value={selectedDevType}
            printOptions="on-focus"
            search
            filterOptions={fuzzySearch}
            placeholder="Selecione o tipo de dispositivo"
            onChange={onChangeDevType}
          />
        </div>
      </SearchInput>
    </Box>
  );
});
