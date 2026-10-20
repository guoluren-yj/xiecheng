import React from 'react';
import { ConditionHeaderDTO, ConValid, FieldConfig, UnitConfig } from './interfaces';
import { statementToJs, innerFunctionMap } from './utils';

export type Cache = {
  type: string;
  [extProp: string]: any;
  getValue(fieldCode: string, others: any, namespace?: string, options?: any): any;
  getAllValue(rowKey?: string | number, namespace?: string): Object;
};
type State = {
  loading: boolean;
  willUpdateCode?: string[];
  [extProp: string]: any;
};
export default class Customize extends React.Component<any, State> {
  cache: { [code: string]: Cache } = {};

  manualQuery?: boolean | "INCREMENT";

  custConfig: { [code: string]: UnitConfig } = {};

  contextParams: any = {};

  attachmentsCount?: { [uCode: string]: { [uuid: string]: number } };
}

export const CustomizeContext = React.createContext(
  {} as {
    cache: { [code: string]: Cache };
    custConfig: { [code: string]: UnitConfig };
    contextParams: any;
  }
);
export function transformFieldCondition(field: FieldConfig){
  if (field.conditionHeaderDTOs && field.conditionHeaderDTOs.length) {
    const newConditionHeaderDTOs: ConditionHeaderDTO[] = [];
    field.conditionHeaderDTOs.forEach((i) => {
      if (!i) return;
      switch (i.conType) {
        case 'defaultValue':
          field.defaultValueConDTO = (i as unknown) as ConValid;
          break;
        case 'fieldName':
          field.fieldNameConDTO = (i as unknown) as ConValid;
          break;
        case 'valid':
          field.conValidDTO = (i as unknown) as ConValid;
          break;
        case 'helpMessage':
          field.helpMessageConDTO = (i as unknown) as ConValid;
          break;
        case 'attachment':
          field.attachmentTplConDTO = (i as unknown) as ConValid;
        default:
          i.lines = i.conLineList;
          newConditionHeaderDTOs.push(i);
      }
    });
    field.conditionHeaderDTOs = newConditionHeaderDTOs;
  }
}
export function transformFixExpDefaultValue(field: FieldConfig, parentThis: Customize){
  if (field.proDefaultFlag && field.defaultValue) {
    const str = field.defaultValue;
    try {
      const getPristineValue = field.fieldType === 'LOV';
      // eslint-disable-next-line no-new-func,no-param-reassign
      field.defaultValue = new Function(
        'ctx,cache,innerFunctionMap',
        statementToJs(str, { getPristineValue }).join('\r\n')
      )(parentThis.contextParams, parentThis.cache, innerFunctionMap);
    } catch (e) {
      console.log(e);
      // eslint-disable-next-line no-param-reassign
      field.defaultValue = undefined;
    }
  }
}