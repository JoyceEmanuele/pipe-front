import moment from 'moment';
import React, {
  ReactNode, createContext, useContext, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import i18n from '~/i18n';
import {
  UnitMapData,
  UnitMapPoints,
  UnitMapPointsResponseData,
} from '~/metadata/UnitMap.model';
import { ApiResps, apiCall, apiCallFormData } from '~/providers';

interface UnitMapContextData {
  pinsData: UnitMapPointsResponseData[];
  addPin: (pin: UnitMapPointsResponseData) => void;
  removePin: (pinId: number) => void;
  movePin: (id: string | number, x: number, y: number) => void;
  switchPins: (oldPinId: string | number, newPin: UnitMapPointsResponseData) => void;
  setPins: (pins: UnitMapPointsResponseData[]) => void;
  resetPins: () => void;
  isShowList: boolean;
  setIsShowListUnitMap: (isShowList: boolean) => void;
  isEditing: boolean;
  setIsEditingFlow: (isEditing: boolean) => void;
  unitMapData: UnitMapData | undefined;
  setUnitMap: (unitMap: UnitMapData) => void;
  resetUnitMap: () => void;
  handleListUnitMap: (
    unitId: number,
    searchTerm?: string
  ) => Promise<ApiResps['/unit/get-ground-plans']>;
  handleDeleteUnitMap: (
    unitId: number,
    unitMapId: number[]
  ) => Promise<boolean>;
  handleCreateUnitMap: (
    unitId: string,
    unitMap: UnitMapData
  ) => Promise<number>;
  handleEditUnitMap: (unitMap: UnitMapData) => Promise<boolean>;
  handleAddPoints: (
    groundPlanId: number,
    unitId: number,
    points: UnitMapPoints[]
  ) => Promise<boolean>;
}

const UnitMapContext = createContext({} as UnitMapContextData);

interface UnitMapProviderProps {
  children: ReactNode;
}

export const UnitMapProvider: React.FC<UnitMapProviderProps> = ({
  children,
}) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isShowList, setIsShowList] = useState<boolean>(true);
  const [unitMapData, setUnitMapData] = useState<UnitMapData | undefined>();
  const [pinsData, setPinsData] = useState<UnitMapPointsResponseData[]>([]);

  const setUnitMap = (unitMap: UnitMapData) => setUnitMapData((prevData) => ({ ...prevData, ...unitMap }));

  const addPin = (pin: UnitMapPointsResponseData) => setPinsData((pins) => [...pins, pin]);

  const removePin = (pinId: number) => {
    const newPins = pinsData.filter((pin) => pin.DUT_ID !== pinId);

    setPinsData(newPins);
  };

  const movePin = (id: string | number, x: number, y: number) => {
    const updatedPins = pinsData.map((pin) => (pin.DUT_ID === id ? { ...pin, POINT_X: x, POINT_Y: y } : pin));
    setPinsData(updatedPins);
  };

  const switchPins = (oldPinId: string | number, newPin: UnitMapPointsResponseData) => {
    const updatedPins = pinsData.map((pin) => (pin.DUT_ID === oldPinId ? newPin : pin));
    setPinsData(updatedPins);
  };

  const setPins = (pins: UnitMapPointsResponseData[]) => setPinsData(pins);

  const resetPins = () => {
    setPins([]);
  };

  const setIsShowListUnitMap = (showList: boolean) => setIsShowList(showList);

  const resetUnitMap = () => setUnitMapData(undefined);

  const setIsEditingFlow = (editing: boolean) => setIsEditing(editing);

  const handleListUnitMap = async (unitId, searchTerm = '') => {
    try {
      const response = await apiCall('/unit/get-ground-plans', {
        UNIT_ID: unitId,
        PARAMS: searchTerm,
      });
      return response;
    } catch (e) {
      toast.error(t('erroBuscarMapasUnidade'));
      return [];
    }
  };

  const handleDeleteUnitMap = async (unitId: number, unitMapId: number[]) => {
    try {
      await apiCall('/unit/delete-ground-plan', {
        GROUND_PLAN_IDS: unitMapId,
        UNIT_ID: unitId,
      });
      toast.success(t('mapaRemovidoComSucesso'));
      return true;
    } catch (e) {
      toast.error(t('naoFoiPossivelRemoveMapaUnidade'));
      return false;
    }
  };

  const handleCreateUnitMap = async (unitId: string, unitMap: UnitMapData) => {
    try {
      if (!unitMap.file) {
        toast.error(t('naoFoiPossivelCriarMapaUnidade'));
        return -1;
      }

      const groundPlanId = await apiCallFormData(
        '/unit/upload-ground-plan',
        {
          UNIT_ID: unitId,
          NAME_GP: unitMap.NAME_GP,
          FILE_NAME: unitMap.file.name,
        },
        { photo: unitMap.file },
      );

      return groundPlanId;
    } catch (e) {
      toast.error(t('naoFoiPossivelCriarMapaUnidade'));
      return -1;
    }
  };

  const handleEditUnitMap = async (unitMap) => {
    try {
      await apiCall('/unit/update-ground-plan', {
        GROUNDPLAN_ID: unitMap.GROUNDPLAN_ID,
        UNIT_ID: unitMap.UNIT_ID,
        NAME_GP: unitMap.NAME_GP,
        POINTS: unitMap.POINTS,
      });
      return true;
    } catch (e) {
      toast.error(t('naoFoiPossivelEditarMapaUnidade'));
      return false;
    }
  };

  const handleAddPoints = async (groundPlanId, unitId, points) => {
    try {
      await apiCall('/unit/set-points-ground-plan', {
        GROUNDPLAN_ID: groundPlanId,
        UNIT_ID: unitId,
        POINTS: points,
      });
      return true;
    } catch (e) {
      toast.error(t('naoFoiPossivelAdicionarPontosMapaUnidade'));
      return false;
    }
  };

  return (
    <UnitMapContext.Provider
      value={{
        unitMapData,
        pinsData,
        isEditing,
        isShowList,
        setIsShowListUnitMap,
        setUnitMap,
        addPin,
        removePin,
        movePin,
        switchPins,
        setPins,
        resetPins,
        resetUnitMap,
        setIsEditingFlow,
        handleListUnitMap,
        handleDeleteUnitMap,
        handleCreateUnitMap,
        handleEditUnitMap,
        handleAddPoints,
      }}
    >
      {children}
    </UnitMapContext.Provider>
  );
};

export const useUnitMap = () => useContext(UnitMapContext);
