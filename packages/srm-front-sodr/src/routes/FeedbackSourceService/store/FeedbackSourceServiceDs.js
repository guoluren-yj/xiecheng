import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SIEC } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();

const listLineDS = () => ({
  autoQuery: true,
  selection: false,
  // table表单显示的字段
  fields: [
    {
      name: 'feedbackSourceCode',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.feedbackSourceCode').d('反馈来源服务编码'),
    },
    {
      name: 'feedbackSourceName',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.feedbackSourceName').d('反馈来源服务名称'),
    },
    {
      name: 'feedbackSourceDesc',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.feedbackSourceDesc').d('服务说明'),
    },
    {
      name: 'logicDetail',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.logicDetail').d('详细逻辑'),
    },
    {
      name: 'templateName',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.templateName').d('模板'),
    },
    // {
    //   name: 'functionName',
    //   type: 'string',
    //   label: intl.get('sodr.feedbackService.model.common.functionName').d('函数名'),
    // },
    {
      name: 'dataSource',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.dataSource').d('来源'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedbackService.model.common.enabledFlag').d('启用状态'),
    },
    {
      name: 'creatorName',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.creatorName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sodr.feedbackService.model.common.creationDate').d('创建日期'),
    },
    {
      name: 'edit',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.action').d('操作'),
    },
  ],
  // 查询表单字段
  queryFields: [
    {
      name: 'feedbackSourceCode',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.feedbackSourceCode').d('服务编码'),
    },
    {
      name: 'feedbackSourceName',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.feedbackSourceName').d('服务名称'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: isTenant
          ? `${SRM_SIEC}/v1/${organizationId}/feedback/list`
          : `${SRM_SIEC}/v1/${organizationId}/feedback-site/list`,
        method: 'GET',
      };
    },
  },
});

// drawer form ds
const drawerFormDS = () => ({
  // autoQuery: true,
  autoCreate: true,
  dataToJSON: 'all-self',
  // table表单显示的字段
  fields: [
    {
      name: 'feedbackSourceCode',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.feedbackSourceCode').d('反馈来源服务编码'),
      required: true,
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('feedbackSourceCode'))) {
          return intl
            .get('sodr.feedbackService.serviceCode.validation.notChinese')
            .d('服务编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'feedbackSourceName',
      type: 'intl',
      label: intl.get('sodr.feedbackService.model.common.feedbackSourceName').d('反馈来源服务名称'),
      required: true,
    },
    {
      name: 'enabledFlag',
      lookupCode: 'HPFM.FLAG',
      defaultValue: 1,
      label: intl.get('sodr.feedbackService.model.common.enabledFlag').d('是否启用'),
    },
    {
      name: 'templateIdLov',
      type: 'object',
      lovCode: 'SFBK.TEMPLATE_DATA_SOURCE',
      lovPara: { tenantId: organizationId },
      label: intl.get('sodr.feedbackService.model.common.templateIdLov').d('反馈单模板'),
      textField: 'templateName',
      valueField: 'templateCode',
      required: true,
      ignore: 'always',
    },
    {
      name: 'templateHeaderId',
      type: 'string',
      bind: 'templateIdLov.templateHeaderId',
    },
    {
      name: 'templateCode',
      type: 'string',
      bind: 'templateIdLov.templateCode',
    },
    {
      name: 'templateName',
      type: 'string',
      bind: 'templateIdLov.templateName',
    },
    {
      name: 'feedbackSourceDesc',
      type: 'intl',
      label: intl.get('sodr.feedbackService.model.common.feedbackSourceDesc').d('服务说明'),
    },
    {
      name: 'logicDetail',
      type: 'intl',
      label: intl.get('sodr.feedbackService.model.common.logicDetail').d('详细逻辑'),
      required: true,
    },
    // {
    //   name: 'functionName',
    //   required: true,
    //   label: intl.get('sodr.feedbackService.model.common.functionName').d('函数名'),
    // },
    {
      name: 'structureCodeLov',
      label: intl.get('sodr.feedbackService.model.common.structureCode').d('结构定义参数编码'),
      type: 'object',
      required: true,
      textField: 'entityCode',
      lovCode: 'SFBK.FEEDBACK_STRUCTURE',
      // transfromRequest: value => value?.entityCode,
      transformResponse: (value, object) => ({
        entityCode: object?.entityCode,
        entityName: object?.entityName,
      }),
      ignore: 'always',
    },
    {
      name: 'structureCode',
      bind: 'structureCodeLov.entityCode',
    },
  ],
});

// drawer form ds
const templateFormDs = () => ({
  autoQuery: true,
  // autoCreate: true,

  // table表单显示的字段
  fields: [
    {
      name: 'feedbackSourceCode',
      type: 'string',
      label: intl.get('sodr.feedbackService.model.common.feedbackSourceCode').d('反馈来源服务编码'),
      required: true,
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('feedbackSourceCode'))) {
          return intl
            .get('sodr.feedbackService.serviceCode.validation.notChinese')
            .d('服务编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'templateIdLov',
      type: 'object',
      lovCode: 'SFBK.TEMPLATE_DATA_SOURCE',
      lovPara: { tenantId: organizationId },
      label: intl.get('sodr.feedbackService.model.common.templateIdLov').d('反馈单模板'),
      textField: 'templateName',
      valueField: 'templateCode',
      required: true,
    },
    {
      name: 'templateHeaderId',
      type: 'string',
      bind: 'templateIdLov.templateHeaderId',
    },
    {
      name: 'templateCode',
      type: 'string',
      bind: 'templateIdLov.templateCode',
    },
    {
      name: 'templateName',
      type: 'string',
      bind: 'templateIdLov.templateName',
    },
  ],
  transport: {
    submit: (val) => {
      return {
        url: isTenant
          ? `${SRM_SIEC}/v1/${organizationId}/feedback/copy`
          : `${SRM_SIEC}/v1/${organizationId}/feedback-sita/copy`,
        data: val.data[0],
        method: 'POST',
      };
    },
  },
});

const parameterDs = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'sourceFieldLov',
      label: intl.get(`sodr.feedbackService.model.common.sourceField`).d('来源参数编码'),
      type: 'object',
      lovCode: isTenant ? 'SFBK.ENTITY_FIELD_ORG' : 'SFBK.ENTITY_FIELD_SITE',
      required: true,
      dynamicProps: {
        // disabled({ dataSet }) {
        //   return !dataSet.parent.current.get('structureCode');
        // },
        lovPara({ dataSet }) {
          return {
            entityCode: dataSet.parent.current.get('structureCode'),
          };
        },
      },
      ignore: 'always',
      transformResponse: (value, object) => ({
        sourceField: object?.sourceField,
        sourceName: object?.sourceName,
      }),
    },
    {
      name: 'sourceField',
      bind: 'sourceFieldLov.name',
    },
    {
      name: 'sourceName',
      label: intl.get(`sodr.feedbackService.model.common.sourceName`).d('来源参数描述'),
      bind: 'sourceFieldLov.description',
    },
    {
      name: 'fieldIdLov',
      label: intl.get(`sodr.feedbackService.model.common.fieldCode`).d('反馈字段编码'),
      type: 'object',
      lovCode: 'SFBK.FEEDBACK_FIELD',
      required: true,
      dynamicProps: {
        // disabled({ dataSet }) {
        //   return !dataSet.parent.current.get('templateHeaderId');
        // },
        lovPara({ dataSet }) {
          return {
            tenantId: organizationId,
            templateId: dataSet.parent.current.get('templateHeaderId'),
          };
        },
      },
      ignore: 'always',
      // transformResponse: (value, object) => ({
      //   fieldId: object?.fieldId,
      //   fieldCode: object?.fieldCode,
      //   fieldName: object?.fieldName,
      // }),
    },
    {
      name: 'fieldCode',
      bind: 'fieldIdLov.fieldCode',
    },
    {
      name: 'fieldId',
      bind: 'fieldIdLov.fieldId',
    },
    {
      name: 'fieldName',
      label: intl.get(`sodr.feedbackService.model.common.fieldName`).d('反馈字段描述'),
      bind: 'fieldIdLov.fieldName',
    },
    {
      name: 'enabledFlag',
      label: intl.get(`sodr.feedbackService.model.common.enabledFlag`).d('是否启用'),
      lookupCode: 'HPFM.FLAG',
      defaultValue: '1',
      required: true,
    },
    {
      name: 'action',
      label: intl.get(`sodr.feedbackService.model.common.action`).d('操作'),
    },
  ],
  transport: {
    read({ data: { templateHeaderId: templateId }, params }) {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mapping/list`,
        method: 'get',
        data: {},
        params: { ...params, templateId },
      };
    },
  },
});

export { listLineDS, drawerFormDS, templateFormDs, parameterDs };
