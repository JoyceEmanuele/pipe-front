import { SessionData } from '.';
import { BinaryRouteResponse, ExtraRouteParams } from './backendTypes';

export default API_uploadService;
export type ReferenceType = 'DACS'|'DAMS'|'DUTS'|'DRIS'|'DMAS'|'DALS'|'DMTS'|'SIMCARDS'|'ASSETS'|'MACHINES'|'LAAGER'|'ILLUMINATIONS'|'NOBREAKS';

export interface API_uploadService {
  ['/upload-service/upload-image']: (
    reqParams: {
        referenceId: number,
        referenceType: ReferenceType,
    },
    session: SessionData,
    extra: ExtraRouteParams
  ) => Promise<{
    referenceId: number,
    referenceType: ReferenceType,
    fileName: string,
  }>

  ['/upload-service/get-images']: (
    reqParams: {
      referenceId: number,
      referenceType: ReferenceType,
    },
    session: SessionData
  ) => Promise<{ list: string[] }>

  ['/upload-service/delete-image']: (
    reqParams: {
      referenceId: number,
      referenceType: string,
      filename: string,
    },
    session: SessionData
  ) => Promise<string>

  ['/upload-service/upload-sketch']: (reqParams: {
    unitId: number,
    isVisible: boolean,
    nameSketch: string,
  }, session: SessionData, extra: ExtraRouteParams) => Promise<BinaryRouteResponse>

  ['/upload-service/get-sketches-list']: (reqParams: { unitId: number }, session: SessionData) => Promise<{
    list: {
      ID: number;
      FILENAME: string;
      IS_VISIBLE: boolean;
      SKETCH_NAME: string;
    }[]
  }>

  ['/upload-service/delete-sketch']: (reqParams: { unitId: number, filename: string }, session: SessionData) => Promise<string>

  ['/upload-service/edit-sketch']: (reqParams: {
    sketchList: {
      unitSketchId: number;
      filename: string;
      isVisible: boolean;
      nameSketch: string;
    }[],
    unitId: number,
  }, session: SessionData) => Promise<{
    ID: number
    FILENAME: string
    IS_VISIBLE: number
    SKETCH_NAME: string
  }[]>

  ['/upload-service/download-sketches']: (reqParams: {
    unitId: number,
    unitSketchId: number,
    filename: string,
  }, session: SessionData, extra: ExtraRouteParams) => Promise<BinaryRouteResponse>
  // []: (reqParams: {}, session: SessionData) => Promise<string>
}
