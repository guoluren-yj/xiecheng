/* eslint-disable no-unused-vars */
import React, { createContext } from 'react';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import DataSet from 'choerodon-ui/dataset/data-set/DataSet';
import type { FieldProps } from 'choerodon-ui/dataset/data-set/Field';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { useLocalStore } from 'mobx-react-lite';
import { getCurrentOrganizationId, getCurrentTenant, isTenantRoleLevel, getCurrentUser } from 'hzero-front/lib/utils/utils';
import { HZERO_RPT } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { isNil } from 'lodash';
import { runInAction } from 'mobx';

const Store = createContext({});
export default Store;

export interface IStore {
  tenantId: number | string;
  tenantNum?: string;
  isTenant: boolean;
  currentDocument: any;
  selectedKeys: string[];
  editing: boolean;
  setCurrentDocument: (document: any) => void;
  setSelectedKeys(selectedKeys: string[]): void;
  setEditing: (flag?: boolean) => void;
  canEdit: boolean;
  autoOpenModal: boolean;
  setAutoOpenModal: (flag: boolean) => void;
  currentTemplate: any;
  setCurrentTemplate: (template: any) => void;
}

export const StoreProvider = (props) => {
  const { loginName } = getCurrentUser() || {};
  const isAdmin = loginName === 'admin'; 
  const store: IStore = useLocalStore(() => ({
    canEdit: isAdmin || isTenantRoleLevel() || ((window as any).$$env || {}).HRPT_ADD_FIELD === "true",
    tenantId: getCurrentOrganizationId(),
    tenantNum: (getCurrentTenant() || {}).tenantNum,
    isTenant: isTenantRoleLevel(),
    currentDocument: { [idField]: rootDirCode },
    setCurrentDocument(docuemnt) {
      this.currentDocument = docuemnt;
    },
    selectedKeys: [rootDirCode] as string[],
    setSelectedKeys(selectedKeys: string[]) {
      this.selectedKeys = selectedKeys;
    },
    editing: false as boolean,
    setEditing(flag?: boolean) {
      this.editing = !!flag;
    },
    autoOpenModal: false as boolean,
    setAutoOpenModal(flag: boolean) {
      this.autoOpenModal = flag;
    },
    currentTemplate: undefined,
    setCurrentTemplate(template) {
      this.currentTemplate = template;
    },
  }));

  return (
    <Store.Provider value={{ store }}>
      {props.children}
    </Store.Provider>
  );
};

export const rootDirCode = '__root__';
export const idField = '__code__';
export const parentField = '__parentCode__';
export const expandField = '__isExpand__';
export const treeIdField = '__id__';
export const treeParentIdField = '__parentId__';
export const treeTypeField = '__type__';
export const treeExpandField = '__expand__';

export function getDirFormDsConfig(createFlag: boolean) {
  return {
    fields: [
      {
        name: 'directoryCode',
        label: intl.get("hrpt.printTemplate.model.directoryCode").d("目录编码"),
        required: createFlag,
      },
      {
        name: 'directoryName',
        label: intl.get("hrpt.printTemplate.model.directoryName").d("目录名称"),
        type: FieldType.intl,
        required: true,
      },
      {
        name: 'menuGroupCode',
        label: intl.get("hrpt.printTemplate.model.menuGroupCode").d("父级目录"),
        disabled: true,
        required: createFlag,
      },
      {
        name: 'menuGroupName',
        label: intl.get("hrpt.printTemplate.model.menuGroupName").d("父级目录"),
        disabled: true,
      },
    ],
  };
}

export function getDocFormDsConfig() {
  return {
    fields: [
      { name: 'docCode', label: intl.get("hrpt.printTemplate.model.docCode").d("单据编码"), required: true },
      {
        name: 'docName',
        type: FieldType.intl,
        label: intl.get("hrpt.printTemplate.model.docName").d("单据名称"),
        required: true,
      },
      {
        name: 'sceneCode',
        label: intl.get("hrpt.printTemplate.model.sceneCode").d("场景编码"),
        required: true,
        lookupCode: 'HRPT.NEW_PRINT.EXPRESSION_SCENE',
      },
      {
        name: 'combineLov',
        type: FieldType.object,
        label: intl.get("hrpt.printTemplate.model.combineObject").d("组合业务对象"),
        required: true,
        ignore: FieldIgnore.always,
        lovCode: 'HMDE.BUSINESS_COMBINE.LIST',
        lovPara: { businessObjectType: 'COMBINE' },
      },
      { name: 'combineCode', bind: 'combineLov.businessObjectCode' },
      { name: 'remark', type: FieldType.intl, label: intl.get("hrpt.printTemplate.model.docDesc").d("功能描述") },
      { name: 'dirName', label: intl.get("hrpt.printTemplate.model.parentDirName").d("父级目录"), disabled: true },
    ],
  } as DataSetProps;
}

export function getDocumentDsFields() {
  return [
    {
      name: 'docCode',
      label: intl.get('hrpt.printTemplate.model.field.docCode').d('单据编码'),
      required: true,
    },
    {
      name: 'docName',
      label: intl.get('hrpt.printTemplate.model.field.docName').d('单据名称'),
      required: true,
    },
    {
      name: 'sceneCode',
      label: intl.get('hrpt.printTemplate.model.field.sceneCode').d('场景编码'),
      required: true,
    },
    {
      name: 'combineLov',
      label: intl.get('hrpt.printTemplate.model.field.combine').d('组合业务对象'),
      required: true,
      type: FieldType.object,
      lovCode: 'HMDE.BUSINESS_COMBINE.LIST',
      lovPara: { businessObjectType: 'COMBINE' },
    },
    {
      name: 'combineCode',
      label: intl.get('hrpt.printTemplate.model.field.combineCode').d('组合业务对象'),
      bind: 'combineLov.businessObjectCode',
    },
    {
      name: 'combineName',
      bind: 'combineLov.businessObjectName',
    },
    {
      name: 'remark',
      label: intl.get('hrpt.printTemplate.model.field.docDesc').d('功能描述'),
    },
  ] as FieldProps[];
}

export function getTemplateFormDsConfig(docId) {
  const isTenant = isTenantRoleLevel();
  return {
    paging: false,
    fields: [
      {
        name: 'docCode',
        label: intl.get('hrpt.printTemplate.model.field.docCode').d('单据编码'),
        required: true,
        disabled: true,
      },
      {
        name: 'docName',
        label: intl.get('hrpt.printTemplate.model.field.docName').d('单据名称'),
        required: true,
        type: FieldType.intl,
        disabled: isTenant,
      },
      {
        name: 'sceneCode',
        label: intl.get('hrpt.printTemplate.model.field.sceneCode').d('场景编码'),
        lookupCode: 'HRPT.NEW_PRINT.EXPRESSION_SCENE',
        required: true,
        disabled: true,
      },
      {
        name: 'combineLov',
        label: intl.get('hrpt.printTemplate.model.field.combine').d('组合业务对象'),
        required: true,
        disabled: true,
        ignore: FieldIgnore.always,
        type: FieldType.object,
        lovCode: 'HMDE.BUSINESS_COMBINE.LIST',
        lovPara: { businessObjectType: 'COMBINE' },
      },
      {
        name: 'combineCode',
        label: intl.get('hrpt.printTemplate.model.field.combineCode').d('组合业务对象'),
        bind: 'combineLov.businessObjectCode',
      },
      {
        name: 'combineName',
        bind: 'combineLov.businessObjectName',
      },
      {
        name: 'remark',
        label: intl.get('hrpt.printTemplate.model.field.docDesc').d('功能描述'),
        type: FieldType.intl,
        disabled: isTenant,
      },
      {
        name: 'enabledOutTypeFlag',
        label: intl.get('hrpt.printTemplate.model.field.enableFileTypeConfig').d('开启打印文件输出格式配置'),
        type: 'boolean',
      },
    ],
    transport: {
      read: () => {
        return {
          url:
            isTenantRoleLevel() ?
              `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-documents/${docId}` :
              `${HZERO_RPT}/v1/print-documents/${docId}`,
          method: 'GET',
        };
      },
    },
  } as DataSetProps;
}

export function getTemplateTableDsConfig(docId) {
  return {
    selection: false,
    fields: [
      {
        label: intl.get('hrpt.printTemplate.report.reportCode').d('模板编码'),
        name: 'reportCode',
      },
      {
        label: intl.get('hrpt.printTemplate.report.reportName').d('模板名称'),
        name: 'reportName',
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.reportRemake').d('模板描述'),
        name: 'remark',
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.labelCode').d('模板使用方'),
        name: 'labelCode',
        type: FieldType.string,
        lookupCode: 'AUTH_LABEL',
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.datasetName').d('数据集名称'),
        name: 'datasetName',
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.reportFileType').d('模板输出文件类型'),
        name: 'reportType',
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.status').d('状态'),
        name: 'enabledFlag',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const url = isTenantRoleLevel()
          ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-reports`
          : `${HZERO_RPT}/v1/print-reports`;
        return {
          url,
          method: 'get',
          params: {
            ...data,
            ...params,
            docId,
          },
        };
      },
    },
  } as DataSetProps;
}

export function getFilterTableDsConfig() {
  return {
    selection: false,
    fields: [
      ...getDocumentDsFields(),
      {
        name: 'reportCode',
        label: intl.get('hrpt.printTemplate.report.reportCode').d('模板编码'),
        type: FieldType.string,
      },
      {
        name: 'reportName',
        label: intl.get('hrpt.printTemplate.report.reportName').d('模板名称'),
        type: FieldType.string,
      },
      {
        name: 'datasetCode',
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.dataSetCode').d('数据集编码'),
        type: FieldType.string,
      },
      {
        name: 'datasetName',
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.datasetName').d('数据集名称'),
        type: FieldType.string,
      },
      {
        label: intl.get('hrpt.printTemplate.model.reportDefinition.status').d('状态'),
        name: 'enabledFlag',
      },
    ],
    pageSize: 20,
    transport: {
      read: ({ params, data }) => {
        return {
          url:
            isTenantRoleLevel() ?
              `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-reports` :
              `${HZERO_RPT}/v1/print-reports`,
          method: 'GET',
          params,
          data,
        };
      },
    },
  } as DataSetProps;
}

export function getParamTableDsConfig() {
  return {
    selection: false,
    fields: [
      {
        name: 'fieldCode',
        label: intl.get('hrpt.printTemplate.model.paramCode').d('参数编码'),
        required: true,
      },
      {
        name: 'fieldName',
        label: intl.get('hrpt.printTemplate.model.paramName').d('参数名称'),
        required: true,
      },
      {
        name: 'fieldWidget',
        label: intl.get('hrpt.printTemplate.model.paramWidget').d('参数类型'),
        required: true,
        options: new DataSet({
          selection: DataSetSelection.single,
          paging: false,
          data: [
            { value: 'TEXT_FIELD', meaning: intl.get('hrpt.printTemplate.fieldWidget.input').d('文本框') },
            { value: 'FLOAT', meaning: intl.get('hrpt.printTemplate.fieldWidget.inputNumber').d('数字框') },
            { value: 'SELECT', meaning: intl.get('hrpt.printTemplate.fieldWidget.select').d('下拉框') },
            { value: 'LOV', meaning: intl.get('hrpt.printTemplate.fieldWidget.lov').d('值集') },
            { value: 'DATETIME_SELECTION_BOX', meaning: intl.get('hrpt.printTemplate.fieldWidget.datePicker').d('日期选择框') },
          ],
        }),
      },
      {
        name: 'sourceCode',
        label: intl.get('hrpt.printTemplate.model.sourceCode').d('值集编码'),
        type: FieldType.object,
        dynamicProps: {
          required: ({ record }) => {
            switch (record.get('fieldWidget')) {
              case 'LOV':
              case 'SELECT':
              case 'RADIOGROUP':
                return true;
              default:
            }
          },
          disabled: ({ record }) => {
            switch (record.get('fieldWidget')) {
              case 'LOV':
              case 'SELECT':
              case 'RADIOGROUP':
                return false;
              default: return true;
            }
          },
          lovCode: ({ record }) => {
            switch (record.get('fieldWidget')) {
              case 'LOV':
                return isTenantRoleLevel() ? 'HPFM.LOV.VIEW.ORG' : 'HPFM.LOV_VIEW';
              case 'SELECT':
              case 'RADIOGROUP':
                return isTenantRoleLevel() ? 'HPFM.LOV.LOV_DETAIL_CODE.ORG' : 'HPFM.LOV.LOV_DETAIL_CODE';
              default:
            }
          },
          lovPara: () => {
            if (!isTenantRoleLevel()) return { tenantId: 0 };
          },
          textField: ({ record }) => {
            switch (record.get('fieldWidget')) {
              case 'LOV':
                return 'viewCode';
              case 'SELECT':
              case 'RADIOGROUP':
                return 'lovCode';
              default:
            }
          },

          valueField: ({ record }) => {
            switch (record.get('fieldWidget')) {
              case 'LOV':
                return 'viewCode';
              case 'SELECT':
              case 'RADIOGROUP':
                return 'lovCode';
              default:
            }
          },
        },
        transformRequest(value, record) {
          const valueField = record.getField("sourceCode")!.get("valueField");
          return value && value[valueField];
        },
        transformResponse(_, data) {
          if (data.fieldWidget && data.sourceCode) {
            return {
              lovCode: data.sourceCode,
              viewCode: data.sourceCode,
            };
          }
        },
      },
      {
        name: 'enabledFlag',
        label: intl.get('hrpt.printTemplate.model.enabledFlag').d('状态'),
        defaultValue: 1,
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'fieldCode' && isNil(value)) {
          record.set('fieldName', undefined);
        }
        if (name === 'fieldWidget' && isNil(value)) {
          record.set('sourceCode', undefined);
        }
      },
    },
    transport: {
      read: ({ data }) => {
        const { docId } = data;
        return {
          url: isTenantRoleLevel() ?
            `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-doc-condition-params/${docId}/page?includeDeprecatedField=true` :
            `${HZERO_RPT}/v1/print-doc-condition-params/${docId}/page?includeDeprecatedField=true`,
          method: 'GET',
        };
      },
    },
  } as DataSetProps;
}

export function getFieldTableDsConfig() {
  return {
    cacheModified: true,
    cacheSelection: true,
    paging: false,
    selection: DataSetSelection.single,
    primaryKey: treeIdField,
    idField: treeIdField,
    parentField: treeParentIdField,
    expandField: treeExpandField,
    fields: [
      {
        name: 'fieldCode',
        label: intl.get('hrpt.printTemplate.model.fieldCode').d('字段编码'),
      },
      {
        name: 'fieldName',
        label: intl.get('hrpt.printTemplate.model.fieldName').d('字段名称'),
      },
    ],
    events: {
      load: ({ dataSet }) => {
        runInAction(() => {
          dataSet.forEach(record => {
            if (record.get(treeTypeField) === 'object') {
              record.selectable = false;
            }
          });
        });
      },
    },
  } as DataSetProps;
}