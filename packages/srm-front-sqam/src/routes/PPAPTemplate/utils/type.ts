// eslint-disable-next-line no-shadow
export enum ListCustomizeCode {
  TableCode = 'SQAM.PPAP_LIST.GRID',
  SearchBarCode = 'SQAM.PPAP_LIST.SEARCH_BAR',
}

export type Operate = 'edit' | 'view' | 'copy';


export type SubmitType = 'create' | 'save' | 'copy' | 'release';


export const stepNameList = ['TEMPLATE_CREATE', 'APPROVE_CREATE', 'DOCUMENT_CREATE', 'STAGE_CREATE', 'END'];

// eslint-disable-next-line no-shadow
export enum RegEx {
  ISNUMBER = '^[0-9]+$',
};

export const TempTableCustCode = 'SQAM.PPAP_DELIVERY_TEMP_DEFINITION.LIST';

export const TempSearchCustCode = 'SQAM.PPAP_DELIVERY_TEMP_DEFINITION.QUOTE_SEARCH';

export const TemplateStatusCode = {
  DISABLE: 'red',
  UNPUBLISHED: 'yellow',
  PUBLISHED: 'green',
  INVALID: 'gray',
};
const permBtnCodePrefix = 'srm.sqam.ppap.template.button';
export const permissionCodeMap = {
  create: `${permBtnCodePrefix}.create`,
  edit: `${permBtnCodePrefix}.edit`,
  disable: `${permBtnCodePrefix}.disable`,
  publish: `${permBtnCodePrefix}.publish`,
};
