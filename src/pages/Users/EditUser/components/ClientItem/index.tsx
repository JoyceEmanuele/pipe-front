import { Checkbox, Radio } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ActionButton,
  SelectMultiple,
} from '~/components';
import { handlePaste } from '~/helpers/pasteHelper';
import { getUserProfile } from '~/helpers/userProfile';
import { DeleteOutlineIcon } from '~/icons';
import { colors } from '~/styles/colors';

type ClientItemProps = {
  client: { CLIENT_ID: number, NAME: string };
  userType: string;
  handleClientTypeChange: (e: any, clientId: string) => void;
  checkClients: (clients: any) => void;
  setClients: (clients: any) => void;
  cProfiles: { [clientId: string]: string };
  cProg: { [clientId: string]: boolean };
  clients: any;
  unitsList: null|({ UNIT_NAME: string, UNIT_ID: number, checked?: boolean }[]);
  onChangeUnitsSelection: () => void;
}

export const ClientItem = (props: ClientItemProps): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const [programacaoMultipla, setProgramacaoMultipla] = useState(false);
  const [listUnits, setListUnits] = useState(props.unitsList);
  const toggleCheckbox = () => {
    setProgramacaoMultipla(!programacaoMultipla);

    props.cProg[String(props.client.CLIENT_ID)] = !programacaoMultipla;
  };

  const {
    client, userType, handleClientTypeChange, checkClients, setClients, cProfiles, clients, cProg,
  } = props;

  useEffect(() => {
    if (cProg[String(client.CLIENT_ID)]) {
      setProgramacaoMultipla(cProg[String(client.CLIENT_ID)]);
    } else {
      setProgramacaoMultipla(false);
    }
  }, []);

  useEffect(() => {
    setListUnits(props.unitsList);
  }, [props.unitsList]);

  function changeMultipleSelection(item, list, newValues) {
    if (item) {
      item.checked = !item.checked;
    } else {
      for (const elem of list) { elem.checked = false; }
    }
    props.onChangeUnitsSelection();
  }

  function selectAllOptions(list: { checked?: boolean }[]) {
    const shouldBeChecked = list.some((el) => !el.checked);

    if (shouldBeChecked) {
      for (const elem of list) {
        elem.checked = true;
      }
    } else {
      for (const elem of list) {
        elem.checked = false;
      }
    }

    props.onChangeUnitsSelection();
  }

  function selectTypeProfile(userType) {
    if (userType === 'mantenedor') {
      return <Radio value="[M]">{t('Manutenção')}</Radio>;
    }
    if (['instalador', 'mantenedorv2'].some((x) => x === userType)) {
      return (
        <>
        </>
      );
    }
    return (
      <>
        <Radio value="[U]">{t('usuario')}</Radio>
        <Radio value="[C]">{t('Admin')}</Radio>
      </>
    );
  }
  function setUnits(pastedItems) {
    const matchingUnits = (listUnits || []).filter((unit) => pastedItems?.includes(unit.UNIT_NAME)).map((unit) => unit);
    const onlyIds = matchingUnits.map((item) => item.UNIT_ID);
    setListUnits((listUnits || []).map((item) => {
      if (onlyIds.includes(item.UNIT_ID)) item.checked = true;
      return item;
    }));
  }

  return (
    <div>
      <div style={{
        width: 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px',
      }}
      >
        <span style={{ width: 150 }}>
          {client.NAME}
          :
        </span>

        <Radio.Group onChange={(e) => handleClientTypeChange(e, String(client.CLIENT_ID))} value={cProfiles[String(client.CLIENT_ID)]}>
          {selectTypeProfile(userType)}
        </Radio.Group>
        <ActionButton
          onClick={() => {
            const newClients = clients.filter((x) => x !== client);
            setClients(newClients);
            checkClients(newClients);
          }}
          variant="red-inv"
        >
          <DeleteOutlineIcon colors={colors.Black} />
        </ActionButton>
      </div>
      {
          profile.manageAllClients && cProfiles[String(client.CLIENT_ID)] === '[C]' && userType === 'cliente' && (
            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <Checkbox checked={programacaoMultipla} onChange={toggleCheckbox} value={cProg[String(client.CLIENT_ID)]}>{t('possuiPermissaoControlarAutomacao')}</Checkbox>
            </div>
          )
        }
      {(listUnits && listUnits.length > 0) && (
        <div
          style={{
            width: 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px',
          }}
          onPaste={(e) => handlePaste(e, setUnits)}
        >
          <SelectMultiple
            emptyLabel={`${t('todas')}`}
            propLabel="UNIT_NAME"
            options={listUnits}
            values={listUnits.filter((x) => x.checked)}
            haveFuzzySearch
            haveSelectAll
            selectAllOptions={selectAllOptions}
            onSelect={changeMultipleSelection}
            placeholder={`${t('Selecione as unidades')}`}
            style={{ width: '280px' }}
          />
        </div>
      )}
    </div>
  );
};
