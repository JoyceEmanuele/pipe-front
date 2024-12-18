export type IMachineTableItem = {
  GROUP_ID: number, // groupId
  GROUP_NAME: string, // title
  DAC_ID: string, // id
  DAC_NAME: string, // tag
  DAT_ID?: string, // client_assets_id
  H_INDEX: number; // health
  status: string; // status
  Lcmp: number; // lcmp
  lastCommTs: string; // history
  DAC_KW?: number;
  isExpandable?: boolean,
  isExpanded?: boolean,
  hide?: boolean
  backgroundColor?: string
  RSSI?: number
  isVAV?: boolean
}[];
