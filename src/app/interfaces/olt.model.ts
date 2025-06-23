export enum OLTs {
  ASI_OLT_01 = "ASI_OLT_01",
  ASI_OLT_02 = "ASI_OLT_02",
  ASI_OLT_03 = "ASI_OLT_03",
  CMD_OLT_01 = "CMD_OLT_01",
}

export const OLTsLabels: Record<OLTs, string> = {
  [OLTs.ASI_OLT_01]: "ASI OLT 01", 
  [OLTs.ASI_OLT_02]: "ASI OLT 02",
  [OLTs.ASI_OLT_03]: "ASI OLT 03",
  [OLTs.CMD_OLT_01]: "CMD OLT 01",
};

export interface CreateOltUserDto {
  username: string;
  password: string;
  olt: OLTs;
}

export interface ViewOltUserDto {
  id: string;
  username: string;
  olt: OLTs;
  createdAt: string;
  updatedAt: string;
}

export interface SlotInfoSummaryDto {
  port: string;
  total: number;
  online: number;
  onus: OntInfoSummaryDto[];
}

export interface OntInfoSummaryDto {
    ontId: string;
    runState: string;
    lastUpTime: string;
    lastDownTime: string;
    lastDownCause: string;
    sn: string;
    type: string;
    distance: string;
    rxTx: string;
    description: string;
}

export interface OntInfoBySnDto {
    olt: OLTs;
    frameSlotPon: string;
    ontId: string;
    controlFlag: string;
    runState: string;
    configState: string;
    matchState: string;
    dbaType: string;
    ontDistance_M: string;
    ontLastDistance_M: string;
    ontBatteryState: string;
    ontPowerType: string;
    memoryOccupation: string;
    cpuOccupation: string;
    temperature: string;
    authenticType: string;
    sn: string;
    managementMode: string;
    softwareWorkMode: string;
    isolationState: string;
    description: string;
    lastDownCause: string;
    lastUpTime: string;
    lastDownTime: string;
    lastDyingGaspTime: string;
    ontOnlineDuration: string;
    ontSystemUpDuration: string;
    typeCSupport: string;
    interoperabilityMode: string;
    powerReductionStatus: string;
    fecUpstreamState: string;
}
