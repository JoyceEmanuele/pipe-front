import { UnitMapListMaps } from './UnitMapListMaps';
import { UnitMapViewMap } from './UnitMapViewMap';
import { useUnitMap } from './UnitMapContext';

export const UnitMap: React.FC<{ unitName: string }> = ({ unitName }) => {
  const { isShowList, unitMapData } = useUnitMap();

  return (
    <>
      {!isShowList && unitMapData ? (
        <UnitMapViewMap unitMapData={unitMapData} unitName={unitName} />
      ) : (
        <UnitMapListMaps />
      )}
    </>
  );
};
