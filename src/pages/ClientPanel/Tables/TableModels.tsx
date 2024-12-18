import { useState } from 'react';
import styled from 'styled-components';
import { ActionButton } from '~/components';
import { getUserProfile } from '~/helpers/userProfile';
import {
  ArrowDownIcon, ArrowUpIcon, DeleteOutlineIcon, EditIcon, AddPlusIcon,
} from '~/icons';
import { colors } from '~/styles/colors';
import { useStateVar } from '~/helpers/useStateVar';
import { CicleType } from '../ClientPanel';

export type RateCicleType = {
  CICLE_ID: number
  MODEL_ID: number
  START_CICLE_DATE : string
  END_CICLE_DATE: string
  PIS: number
  COFINS: number
  ICMS: number
  CONVENTIONALRATE_PARAMETERS?: {
    RATE: string
    CONVENTIONALRATE_ID: number,
  }
  WHITERATE_PARAMETERS?: {
    WHITERATE_ID: number,
    RATE_PONTA: string,
    RATE_OUTPONTA: string,
    START_PONTA: string,
    END_PONTA: string,
    FIRST_MID_RATE: string,
    START_FIRST_MID_RATE: string,
    END_FIRST_MID_RATE: string,
    LAST_MID_RATE?: string,
    START_LAST_MID_RATE: string,
    END_LAST_MID_RATE: string,
  },
}

export type RateModels = {
  hide: boolean,
  modelName: string,
  modelId: number,
  distributorId: number,
  subGroupId: number,
  subGroupName: string,
  rateGroupId: number,
  groupName: string,
  rateModalityId: number,
  rateModalityName: string,
  distributorTag: string,
  distributorLabel: string,
  rateCicles: RateCicleType[]
}

type ModelProps = {
  rateModels: RateModels[],
  onDeleteModelClick: (item: { MODEL_ID: number, MODEL_NAME: string }) => Promise<void>,
  onDeleteCicleClick: (item: { CICLE_ID: number, CICLE_NAME: string }) => Promise<void>,
  onEditClick: () => void,
  clientId: number,
  openEditCicle: (ModelRate: CicleType, itemToEdit?: RateCicleType) => void,
  openCreateEditModel: (itemToEdit?) => void,
}

export const TableModels = ({
  rateModels,
  onDeleteModelClick,
  onDeleteCicleClick,
  openEditCicle,
  openCreateEditModel,
}: ModelProps): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const [, render] = useStateVar({
    isLoading: true,
    classesUnitsList: [] as {}[][],
    models: [],
  });

  function onClickHide(item) {
    rateModels.forEach((model) => {
      if (model.modelId === item.modelId) {
        model.hide = !model.hide;
      }
      render();
    });
  }

  return (
    <TableContainer>
      <TableHead>
        <HeaderRow>
          <HeaderCell style={{ width: '1%' }} />
          <HeaderCell>Modelo</HeaderCell>
          <HeaderCell>Vigência</HeaderCell>
          <HeaderCell>Modalidade</HeaderCell>
          <HeaderCell>Subgrupo</HeaderCell>
          <HeaderCell>Distribuidora</HeaderCell>
          {(profile.manageAllClients)
            && <HeaderCell />}
        </HeaderRow>
      </TableHead>
      <TableBody>
        { rateModels && rateModels.map((item) => (
          <>
            <Row key={item.modelId}>
              <DataCell style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30px', width: '30px',
              }}
              >
                <div onClick={() => onClickHide(item)}>
                  { item.hide ? <ArrowUpIcon heigth="10px" width="10px" /> : <ArrowDownIcon heigth="10px" width="10px" />}
                </div>
              </DataCell>
              <DataCell>{item.modelName}</DataCell>
              <DataCell />
              <DataCell>{item.rateModalityName}</DataCell>
              <DataCell>{item.subGroupName}</DataCell>
              <DataCell>{item.distributorLabel}</DataCell>
              {(profile.manageAllClients)
            && (
            <DataCell>
              <ActionButton onClick={() => onDeleteModelClick({ MODEL_ID: item.modelId, MODEL_NAME: item.modelName })} variant="red-inv">
                <DeleteOutlineIcon colors={colors.Red} />
              </ActionButton>
              <ActionButton onClick={() => openCreateEditModel(item)} variant="blue-inv">
                <EditIcon color={colors.LightBlue} />
              </ActionButton>
            </DataCell>
            )}
            </Row>

            { item.hide && item.rateCicles?.length > 0 ? item.rateCicles.map((cicle, key) => (
              <Row key={item.modelId} style={{ backgroundColor: '#F2F0F0' }}>
                <DataCell width="1px" />
                <DataCell style={{
                  display: 'flex', justifyContent: 'left', alignItems: 'center', height: '30px', paddingTop: '5px',
                }}
                >
                  { key === 0 ? (
                    <div onClick={() => openEditCicle({
                      modelId: item.modelId, groupName: item.groupName, subGroupName: item.subGroupName, rateModalityName: item.rateModalityName,
                    })}
                    >
                      <AddPlusIcon />
                    </div>
                  ) : <div style={{ width: '30px' }} />}
                  <p style={{ paddingTop: '15px' }}>
                    {`Ciclo ${key + 1}`}
                  </p>
                </DataCell>
                <DataCell>
                  { `${cicle.START_CICLE_DATE} - ${cicle.END_CICLE_DATE ? cicle.END_CICLE_DATE : ''}` }
                </DataCell>
                <DataCell />
                <DataCell />
                <DataCell />
                {(profile.manageAllClients)
            && (
            <DataCell>
              <ActionButton onClick={() => onDeleteCicleClick({ CICLE_ID: cicle.CICLE_ID, CICLE_NAME: `Ciclo ${key + 1}` })} variant="red-inv">
                <DeleteOutlineIcon colors={colors.Red} />
              </ActionButton>
              <ActionButton
                variant="blue-inv"
                onClick={() => openEditCicle({
                  modelId: item.modelId, groupName: item.groupName, subGroupName: item.subGroupName, rateModalityName: item.rateModalityName,
                }, cicle)}
              >
                <EditIcon color={colors.LightBlue} />
              </ActionButton>
            </DataCell>
            )}
              </Row>
            )) : item.hide && (
              <Row key={item.modelId} style={{ backgroundColor: '#F2F0F0' }}>
                <DataCell width="1px" />
                <DataCell style={{
                  display: 'flex', justifyContent: 'left', alignItems: 'center', height: '30px', paddingTop: '5px',
                }}
                >
                  <div onClick={() => openEditCicle({
                    modelId: item.modelId, groupName: item.groupName, subGroupName: item.subGroupName, rateModalityName: item.rateModalityName,
                  })}
                  >
                    <AddPlusIcon />
                  </div>
                  <p style={{ paddingTop: '15px' }}>
                    Criar novo ciclo
                  </p>
                </DataCell>
                <DataCell />
                <DataCell />
                <DataCell />
                <DataCell />
                {(profile.manageAllClients) && item.hide && item.rateCicles?.length > 0
                  ? (
                    <DataCell>
                      <ActionButton onClick={() => {}} variant="red-inv">
                        <DeleteOutlineIcon colors={colors.Red} />
                      </ActionButton>
                      <ActionButton onClick={() => {}} variant="blue-inv">
                        <EditIcon color={colors.LightBlue} />
                      </ActionButton>
                    </DataCell>
                  ) : (<DataCell />)}
              </Row>
            ) }
          </>
        ))}
      </TableBody>
    </TableContainer>
  );
};

const TableContainer = styled.table`
  width: 100%;
  box-shadow: rgba(62, 71, 86, 0.2) 0px 2px 8px;
  border-collapse: collapse;
`;
const TableHead = styled.thead`
`;
const TableBody = styled.tbody`
  border: 1px solid ${colors.Grey};
`;
const HeaderCell = styled.th`
  text-align: left;
  padding: 0 10px;
  border-bottom: solid 1px ${colors.Grey};
  font-size: 0.75rem;
  background-color: ${colors.Blue300};
  color: ${colors.White};
  &:first-child {
    border-top-left-radius: 10px;
  }
  &:last-child {
    border-top-right-radius: 10px;
  }
`;
const DataCell = styled.td`
  text-align: left;
  color: ${colors.DarkGrey};
  min-width: 50px;
  padding: 0 10px;
  font-size: 0.71rem
`;
const Row = styled.tr`
  height: 40px;
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.Grey};
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;
const HeaderRow = styled.tr`
  height: 40px;
  display: table-row;
`;
