import intl from 'srm-front-boot/lib/utils/intl';
import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

// TODO: 提测前删除
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL, DSTF } from '@/utils/common';

function flowContextFormDataSet(flowId?) {
  const material: DataSetProps = {
    autoCreate: false,
    paging: false,

    fields: [
      {
        name: 'inputParameter',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.inputParameter').d('事务流-入参'),
        required: true,
      },
      {
        name: 'outputParameter',
        type: FieldType.object,
        label: intl.get('hmde.processDefinition.view.flowContext.outputParameter').d('事务流-出参'),
        required: true,
      },
      {
        name: 'customVariable',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.customVariable').d('自定义变量'),
        required: true,
      },
    ],

    transport: {
      read: () => {
        return {
          url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-scripts/${flowId}`,
          method: 'GET',
        };
      },
      submit: ({ data, dataSet }) => {
        const params = {
          ...(dataSet?.getState('params') || {}),
          ...data[0],
          customDataSet: undefined,
          inputDataSet: undefined,
          outputDataSet: undefined,
          _status: undefined,
          __id: undefined,
        };
        return {
          url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-scripts`,
          method: 'PUT',
          data: params,
        };
      },
    },
  };

  return new DataSet(material);
}

function flowContextTreeDataSet() {
  const material: DataSetProps = {
    // primaryKey: 'businessObjectFieldCode',
    autoQuery: false,
    autoCreate: false,
    selection: DataSetSelection.multiple,
    paging: false,
    parentField: 'showParentId',
    idField: 'showId',
    fields: [
      {
        name: 'type',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.type').d('类型'),
      },
      {
        name: 'name',
        type: FieldType.object,
        label: intl.get('hmde.processDefinition.view.flowContext.name').d('名称'),
      },
      {
        name: 'code',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.code').d('编码'),
      },
      // { name: 'id', type: FieldType.string },
      // { name: 'parentId', type: FieldType.string },
      { name: 'showId', type: FieldType.string },
      { name: 'showParentId', type: FieldType.string },
    ],
  };

  return new DataSet(material);
}

function flowContextEditDataSet(props: { handleUpdate?: Function; commonType?: string }) {
  const { handleUpdate = () => {}, commonType = 'output' } = props;
  const material: DataSetProps = {
    autoCreate: false,

    fields: [
      {
        name: 'parentId',
        type: FieldType.number,
        label: intl.get('hmde.processDefinition.view.flowContext.parentId').d('父级'),
        defaultValue: 1,
      },
      {
        name: 'commonType',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.commonType').d('类型'),
        defaultValue: commonType,
      },
      {
        name: 'inputParamType',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.inputParamType').d('参数类型'),
        computedProps: {
          required: ({ record }) => record.get('commonType') === 'input',
        },
      },
      {
        name: 'formattedObject',
        type: FieldType.object,
        label: intl
          .get('hmde.processDefinition.view.flowContext.formattedObject')
          .d('入参JSON结构'),
      },
      {
        name: 'datasetData',
        type: FieldType.object,
        label: intl.get('hmde.processDefinition.view.flowContext.datasetData').d('解析参数'),
      },
      {
        name: 'code',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.code').d('编码'),
        required: true,
        // bind: 'businessObject.businessObjectCode',
        computedProps: {
          bind: ({ record }) =>
            record.get('inputParamType') !== 'custom' ? 'businessObject.businessObjectCode' : '',
        },
        pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
      },
      {
        name: 'businessObject',
        type: FieldType.object,
        label: intl.get('hmde.processDefinition.view.flowContext.businessObject').d('业务对象'),
        lovCode: 'HMDE.BUSINESS_OBJECT.SITE',
        computedProps: {
          lovPara: ({ dataSet }) => ({
            businessObjectType: dataSet.getState('businessObjectType'),
          }),
          required: ({ record }) => record.get('inputParamType') !== 'custom',
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'businessObjectName',
        type: FieldType.string,
        bind: 'businessObject.businessObjectName',
        computedProps: {
          required: ({ record }) => record.get('inputParamType') !== 'custom',
        },
      },
      {
        name: 'businessObjectCode',
        type: FieldType.string,
        bind: 'businessObject.businessObjectCode',
        computedProps: {
          required: ({ record }) => record.get('inputParamType') !== 'custom',
        },
      },
      {
        name: 'businessObjectId',
        type: FieldType.string,
        bind: 'businessObject.businessObjectId',
      },
      {
        name: 'id',
        type: FieldType.string,
        bind: 'businessObject.businessObjectCode',
      },
      {
        name: 'partFlag',
        type: FieldType.boolean,
        label: intl.get('hmde.processDefinition.view.flowContext.partFlag').d('部分字段'),
        defaultValue: 0,
        ...DSTF,
      },
      {
        name: 'businessField',
        type: FieldType.object,
        label: intl.get('hmde.processDefinition.view.flowContext.businessField').d('选择字段'),
      },
    ],

    transport: {
      submit: ({ data }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-contexts`,
        method: 'PUT',
        data: data[0],
      }),
    },

    events: {
      update: handleUpdate,
    },
  };

  return new DataSet(material);
}

// 参数解析DS
function analyticalParamsDataSet() {
  const material: DataSetProps = {
    paging: false,
    selection: false,
    parentField: 'parentId',
    idField: 'id',
    fields: [
      {
        name: 'code',
        type: FieldType.string,
        label: '参数编码',
        required: true,
      },
      {
        name: 'type',
        type: FieldType.string,
        label: '参数类型',
        required: true,
      },
    ],
  };

  return new DataSet(material);
}

function flowContextCustomEditDataSet(props: { handleUpdate?: Function }) {
  const { handleUpdate = () => {} } = props;

  const material: DataSetProps = {
    autoCreate: false,
    primaryKey: 'code',

    fields: [
      {
        name: 'parentId',
        type: FieldType.number,
        label: intl.get('hmde.processDefinition.view.flowContext.parentId').d('父级'),
        defaultValue: 1,
      },
      {
        name: 'commonType',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.commonType').d('类型'),
        defaultValue: 'custom',
      },
      {
        name: 'code',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.sign').d('标识'),
        required: true,
        pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
        maxLength: 50,
        defaultValidationMessages: {
          patternMismatch: intl
            .get('hzero.common.validation.code')
            .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
        },
        max: 50,
      },
      {
        name: 'type',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.paramsType').d('参数类型'),
        lookupCode: 'HMDE.FLOW.PARAMETER_TYPE',
        required: true,
        // unique: true,
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.remark').d('描述'),
        // unique: true,
      },
    ],

    transport: {
      submit: ({ data }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flow-contexts`,
        method: 'PUT',
        data: data[0],
      }),
    },

    events: {
      update: handleUpdate,
    },
  };

  return new DataSet(material);
}

function flowContextTableDataSet({ handleSelect }) {
  const material: DataSetProps = {
    autoQuery: false,
    paging: false,
    primaryKey: 'businessObjectFieldId',
    // queryFields: [
    //   {
    //     name: 'businessObjectFieldName',
    //     type: FieldType.string,
    //     label: intl
    //       .get('hmde.processDefinition.view.flowContext.businessObjectFieldName')
    //       .d('字段'),
    //   },
    //   {
    //     name: 'componentType',
    //     type: FieldType.string,
    //     label: intl.get('hmde.processDefinition.view.flowContext.componentType').d('字段类型'),
    //     lookupCode: 'HMDE.BUSINESS_OBJECT.FIELD_TYPE',
    //   },
    // ],
    fields: [
      {
        name: 'businessObjectFieldName',
        type: FieldType.string,
        label: intl
          .get('hmde.processDefinition.view.flowContext.businessObjectFieldName')
          .d('字段'),
      },
      {
        name: 'businessObjectFieldCode',
        type: FieldType.string,
        label: intl
          .get('hmde.processDefinition.view.flowContext.businessObjectFieldCode')
          .d('编码'),
      },
      {
        name: 'componentType',
        type: FieldType.string,
        label: intl.get('hmde.processDefinition.view.flowContext.componentType').d('字段类型'),
        lookupCode: 'HMDE.BUSINESS_OBJECT.FIELD_TYPE',
      },
    ],

    transport: {
      read: () => {
        return {
          // url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-fields/list`,
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-fields/list-by-code`,
          method: 'GET',
        };
      },
    },

    events: {
      select: () => handleSelect(),
      unSelect: () => handleSelect(),
      selectAll: ({ dataSet }) => handleSelect(dataSet.selected),
      unSelectAll: () => handleSelect([]),
    },
  };

  return new DataSet(material);
}

export {
  flowContextFormDataSet,
  flowContextTreeDataSet,
  flowContextEditDataSet,
  analyticalParamsDataSet,
  flowContextCustomEditDataSet,
  flowContextTableDataSet,
};
