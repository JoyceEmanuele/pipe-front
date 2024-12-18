import { useEffect } from 'react';
import { Button } from 'components';
import { CicleType } from './ClientPanel';
import { RateCicleType } from './Tables/TableModels';

type Props = {
  onCancel: () => void,
  openCreateEditCicle: () => void,
  cicleInfo: CicleType
  itemToEdit?: null | RateCicleType,
}

export const FormEditCicle = ({
  onCancel, openCreateEditCicle, itemToEdit,
}: Props): JSX.Element => {
  useEffect(() => { });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '250px', justifyContent: 'space-between', padding: '5%', alignItems: 'center',
    }}
    >
      <h2 style={{ fontWeight: 'bold' }}>
        { itemToEdit ? 'Editar Ciclo' : 'Criar novo Ciclo'}
      </h2>
      <h3>
        { itemToEdit ? 'Editar um ciclo existente, prosseguir ?' : 'Será criado um novo ciclo, prosseguir?'}
      </h3>
      {/* eslint-disable-next-line react/jsx-no-bind */}
      <Button style={{ width: '85%' }} onClick={openCreateEditCicle} variant="primary">
        { itemToEdit ? 'Editar' : 'Criar' }
      </Button>
      {/* @ts-ignore */}
      <h4 style={{ textDecoration: 'underline', color: '#6C6B6B' }} onClick={onCancel}>
        Cancelar
      </h4>
    </div>
  );
};
