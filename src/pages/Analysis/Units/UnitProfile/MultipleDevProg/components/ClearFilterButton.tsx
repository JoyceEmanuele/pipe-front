import { useTranslation } from 'react-i18next';
import { UnderlineBtn } from '../../styles';
import { memo, ReactElement } from 'react';

export const ClearFilterButton = memo((props: {onClick: () => void}): ReactElement => {
  const { t } = useTranslation();

  return (
    <UnderlineBtn
      onClick={props.onClick}
    >
      {t('limparFiltro')}
    </UnderlineBtn>
  );
});
