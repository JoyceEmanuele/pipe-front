import { memo, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'reflexbox';
import { Checkbox } from '~/components';

interface SelectAllDevicesProps {
  onClickSelect: () => void;
  isAllSelected: boolean;
}

export const SelectAllDevices = memo(({
  isAllSelected,
  onClickSelect,
}: SelectAllDevicesProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <Box marginTop="15px" alignSelf="end">
      <Checkbox
        label={t('Selecionar todos')}
        checked={isAllSelected}
        onClick={onClickSelect}
      />
    </Box>
  );
});
