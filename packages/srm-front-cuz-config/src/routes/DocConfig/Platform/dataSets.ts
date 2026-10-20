import { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";
import { FieldProps } from "choerodon-ui/dataset/data-set/Field";
import { DataToJSON, FieldType } from "choerodon-ui/pro/lib/data-set/enum";
import { isNil } from 'lodash';
import { isCreate, isUpdate } from "../../../utils/constConfig.js";

export function docDsFields(intl, { dsStatus = 0 }): FieldProps[] {
  const createMode = dsStatus & isCreate;
  const updateMode = dsStatus & isUpdate;
  return [
    {
      name: 'docCode',
      required: true,
      pattern: /^[_A-Z0-9]+(\.[_A-Z0-9]*)*$/,
      label: intl.get('hpfm.doc.common.docCode').d("单据编码"),
      format: "uppercase",
      disabled: !createMode,
    },
    {
      name: 'docName',
      label: intl.get('hpfm.doc.common.docName').d('单据名称'),
      type: FieldType.intl,
      required: !!updateMode,
    },
    {
      name: 'enabledFlag',
      label: intl.get('hpfm.doc.common.enabledFlag').d('启用'),
      lookupCode: "HPFM.ENABLED_FLAG",
      disabled: !updateMode,
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'moduleCode',
      label: intl.get('hpfm.doc.common.moduleName').d("所属分类"),
      lovCode: "HPFM.CUST.DOC.MODULE.LIST",
      type: FieldType.object,
      required: true,
      transformRequest(value){
        return value && value.moduleCode;
      },
      transformResponse(moduleCode, data){
        return moduleCode && {moduleCode, moduleName: data.moduleName};
      },
    },
  ];
}

export function pageDs(dsData: any = [], intl): DataSetProps {
  const isUpdateFlag = dsData.length > 0;
  return {
    autoCreate: true,
    data: dsData,
    fields: [
      {
        name: 'pageCode',
        required: true,
        pattern: /^[_A-Z0-9]+(\.[_A-Z0-9]*)*$/,
        label: intl.get('hpfm.doc.common.pageCode').d("页面编码"),
        disabled: isUpdateFlag,
        format: "uppercase",
      },
      {
        name: 'pageName',
        label: intl.get('hpfm.doc.common.pageName').d('页面名称'),
        type: FieldType.intl,
        required: true,
      },
      {
        name: 'orderSeq',
        label: intl.get('hpfm.doc.common.orderSeq').d("顺序"),
        type: FieldType.number,
        step: 1,
        min: 0,
        required: true,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hpfm.doc.common.enabledFlag').d('启用'),
        required: true,
        lookupCode: "HPFM.ENABLED_FLAG",
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
    ],
  };
}

export function stageDs(dsData: any = [], intl): DataSetProps {
  const isUpdateFlag = dsData.length > 0;
  return {
    autoCreate: true,
    data: dsData,
    fields: [
      {
        name: 'stageCode',
        required: true,
        pattern: /^[_A-Z0-9]+(\.[_A-Z0-9]*)*$/,
        label: intl.get('hpfm.doc.common.stageCode').d("阶段编码"),
        disabled: isUpdateFlag,
        format: "uppercase",
      },
      {
        name: 'stageName',
        label: intl.get('hpfm.doc.common.stageName').d('阶段名称'),
        type: FieldType.intl,
        required: true,
      },
      {
        name: 'orderSeq',
        label: intl.get('hpfm.doc.common.orderSeq').d("顺序"),
        type: FieldType.number,
        step: 1,
        min: 0,
        required: true,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hpfm.doc.common.enabledFlag').d('启用'),
        required: true,
        lookupCode: "HPFM.ENABLED_FLAG",
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
    ],
  };
}

export function unitFieldsDs(intl, {
  unitInfoFun = (): any => undefined,
}): DataSetProps {
  return {
    paging: false,
    fields: [
      {
        label: intl.get('hpfm.customize.common.fieldCode').d('字段编码'),
        name: 'fieldCode',
        disabled: true,
      },
      {
        label: intl.get('hpfm.customize.common.fieldName').d('字段名称'),
        name: 'fieldName',
        disabled: true,
      },
      {
        label: intl.get('hpfm.customize.common.defaultActive').d('默认激活'),
        name: 'defaultActive',
        type: FieldType.boolean,
        disabled: true,
        transformRequest(value) {
          return value ? 1 : 0;
        },
        transformResponse(value) {
          return value === undefined ? undefined : !!value;
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.helpMessage').d('气泡提示'),
        name: 'helpMessage',
        disabled: true,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.fieldType').d('字段类型'),
        name: 'field.fieldCategoryMeaning',
        disabled: true,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.fieldAlias').d('字段别名'),
        name: 'fieldCodeAlias',
        disabled: true,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.model').d('所属模型'),
        name: 'field.modelName',
        disabled: true,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.bindField').d('字段绑定'),
        name: 'bindField',
        disabled: true,
      },
      {
        name: 'labelWrapperCol',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.labelWrapperCol').d('标签组件比例'),
        disabled: true,
        transformResponse(_value, rowData) {
          if (rowData.labelCol === undefined || rowData.wrapperCol === undefined) return undefined;
          return `${rowData.labelCol || 0}/24 - ${rowData.wrapperCol || 0}/24`;
        },
        transformRequest() {
          return undefined;
        },
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.widgetType').d('组件类型'),
        name: 'widget.fieldWidget',
        disabled: true,
        dynamicProps: {
          lookupCode: () => {
            const { unitType } = unitInfoFun();
            if (unitType === "BTNGROUP") return 'HPFM.CUST.TABLE_BTN_TYPE';
            return 'HPFM.CUST.FIELD_COMPONENT';
          },
        },
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.renderType').d('渲染方式'),
        lookupCode: 'HPFM.CUST.RENDER_OPTIONS',
        name: 'renderOptions',
        disabled: true,
      },
      {
        label: intl.get('hpfm.individual.model.config.showFieldSet').d('预展示字段'),
        name: 'showFieldFlag',
        type: FieldType.boolean,
        disabled: true,
        transformRequest(value) {
          return value ? 1 : 0;
        },
        transformResponse(value) {
          return value === undefined ? undefined : !!value;
        },
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.position').d('位置'),
        name: 'gridSeq',
        disabled: true,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.fixed').d('冻结'),
        name: 'gridFixed',
        disabled: true,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.row').d('行'),
        name: 'formRow',
        disabled: true,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.col').d('列'),
        name: 'formCol',
        disabled: true,
      },
      {
        label: intl.get('hpfm.customize.common.specialProps').d('UI特性'),
        name: "uiFeature",
        type: FieldType.string,
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.sortedFlag').d('可排序'),
        name: 'sortedFlag',
        type: FieldType.boolean,
        transformRequest(value) {
          return value ? 1 : 0;
        },
        transformResponse(value) {
          return value === undefined ? undefined : !!value;
        },
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.mutilFlag').d('多选'),
        name: 'widget.multipleFlag',
        type: FieldType.boolean,
        transformRequest(value) {
          return value ? 1 : 0;
        },
        transformResponse(value) {
          return value === undefined ? undefined : !!value;
        },
      },
      {
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.mergeQuery').d('合并查询'),
        name: 'mergeFlag',
        type: FieldType.boolean,
        transformRequest(value) {
          return value ? 1 : 0;
        },
        transformResponse(value) {
          return value === undefined ? undefined : !!value;
        },
      },
      {
        label: intl.get('hpfm.individual.model.config.visible').d('显示'),
        name: 'fieldVisible',
        type: FieldType.boolean,
        transformRequest(value) {
          return value ? 1 : 0;
        },
        transformResponse(value) {
          return !isNil(value) && value !== -1 ? !!value : true;
        },
      },
    ],
  };
}

export function unitInfoDs(intl): DataSetProps {
  return {
    autoQuery: false,
    autoCreate: false,
    paging: false,
    fields: [
      {
        name: 'unitCode',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.unitCode').d('单元编码'),
        disabled: true,
      },
      {
        name: 'unitName',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.unitName').d('单元名称'),
        disabled: true,
      },
      {
        name: 'unitType',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.unitType').d('单元类型'),
        lookupCode: 'HPFM.CUST.UNIT_TYPE',
        disabled: true,
      },
      {
        name: 'menuName',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.menuName').d('所属功能'),
        disabled: true,
      },
      {
        name: 'combineName',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.combinObj').d('关联业务对象组合'),
        disabled: true,
      },
      {
        name: 'relateGroup',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.relateGroup').d('所属单元组'),
        disabled: true,
      },
      {
        name: 'unitGroupName',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.relateGroup').d('所属单元组'),
        disabled: true,
      },
      {
        name: 'formMaxCol',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.formMaxCol').d('表单列数'),
        disabled: true,
      },
      {
        name: 'labelWrapperCol',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.labelWrapperCol').d('标签组件比例'),
        disabled: true,
        transformResponse(_value, rowData) {
          if (rowData.labelCol === undefined || rowData.wrapperCol === undefined) return undefined;
          return `${rowData.labelCol || 0}/24 - ${rowData.wrapperCol || 0}/24`;
        },
        transformRequest() {
          return undefined;
        },
      },
      {
        name: 'enableFlag',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.enableFlag').d('启用'),
        lookupCode: "HPFM.ENABLED_FLAG",
        disabled: true,
      },
      {
        name: 'unitTag',
        label: intl.get('hpfm.customize.common.unitTag').d('单元标签'),
        lookupCode: 'HPFM.CUST.UNIT_LABEL',
        disabled: true,
        multiple: ",",
      },
      {
        name: 'sqlIds',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.sqlIds').d('SQL IDs'),
        multiple: ',',
        disabled: true,
      },
      {
        name: "cardMaxCount",
        label: intl.get('hpfm.customize.common.cardMaxCount').d('自定义卡片数量'),
        disabled: true,
      },
      {
        name: 'sortedEnabled',
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.sortedEnabled').d('启用排序'),
        lookupCode: "HPFM.ENABLED_FLAG",
        disabled: true,
      },
    ],
  };
}

export function condParaDs(intl): DataSetProps {
  return {
    paging: false,
    dataToJSON: DataToJSON.normal,
    fields: [
      {
        name: "fieldAlias",
        label: intl.get("hpfm.doc.common.paramKey").d("参数编码"),
        type: FieldType.string,
        required: true,
        transformRequest(value){
          if(value && !value.startsWith("doc_")) return `doc_${value}`;
          return value;
        },
      },
      {
        name: "fieldName",
        label: intl.get("hpfm.doc.common.paramName").d("参数名称"),
        type: FieldType.intl,
        required: true,
      },
      {
        name: "fieldWidget",
        label: intl.get("hpfm.doc.common.paramType").d("参数类型"),
        lookupCode: "HPFM.CUST.FIELD_COMPONENT",
        type: FieldType.string,
        required: true,
      },
      {
        name: "sourceCode",
        label: intl.get("hpfm.doc.common.sourceCode").d("值集编码"),
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
          lovCode: ({ record }) => {
            switch (record.get('fieldWidget')) {
              case 'LOV':
                return 'HPFM.LOV_VIEW';
              case 'SELECT':
              case 'RADIOGROUP':
                return 'HPFM.LOV.LOV_DETAIL_CODE';
              default:
            }
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
        transformRequest(value, record){
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
        name: "enabledFlag",
        label: intl.get("hzero.common.button.status").d("状态"),
        defaultValue: 1,
      },
    ],
    events: {
      update({name, record}){
        switch(name){
          case "fieldWidget":
            record.set("sourceCode", undefined);
            break;
          default:;
        }
      },
    },
  };
}