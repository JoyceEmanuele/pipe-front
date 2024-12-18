type UnitMapFile = File & { preview?: string }

interface UnitMapData {
  NAME_GP: string;
  file?: UnitMapFile;
  FILENAME?: string;
  IMAGE?: string;
  POINTS?: UnitMapPointsResponseData[]
}

interface UnitMapApiResponseData {
  GROUNDPLAN_ID: number,
  NAME_GP: string,
  IMAGE: string,
  POINTS?: UnitMapPointsResponseData[]
}

interface UnitMapPoints {
  DUT_ID: number;
  x: number;
  y: number;
}

interface UnitMapPointsResponseData {
  POINT_ID?: number,
  DUT_ID: number,
  POINT_X: string | number,
  POINT_Y: string | number,
  DEV_ID: string
  ROOM_NAME: string
  ENVIRONMENT_ID: number
  HUMIMAX?: number
  HUMIMIN?: number
  TUSEMAX?: number
  TUSEMIN?: number
  CO2MAX?: number
  TEMPERATURE?: number
  TEMPERATURE_1?: number
  HUMIDITY?: number
  eCO2?: number
  ISVISIBLE?: number
}

interface DeviceResponseData {
  DEV_ID: string
  DUT_ID: number
  ROOM_NAME: string
  HUMIMAX: number
  HUMIMIN: number
  TUSEMAX: number
  TUSEMIN: number
  CO2MAX: number
  ENVIRONMENT_ID: number
  TEMPERATURE?: number
  TEMPERATURE_1?: number
  HUMIDITY?: number
  eCO2?: number
}

export type {
  UnitMapFile,
  UnitMapData,
  UnitMapApiResponseData,
  UnitMapPoints,
  UnitMapPointsResponseData,
  DeviceResponseData,
};
