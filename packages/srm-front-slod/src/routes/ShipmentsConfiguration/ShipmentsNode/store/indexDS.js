/*
 * @Description:
 * @Date: 2021-11-24 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'utils/intl';
import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const nodeDS = () => ({
  name: 'user',
  dataToJSON: 'all',
  autoQuery: true,
  cacheSelection: true,
  // cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'nodeConfigCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.nodeConfigCode').d('节点编码'),
      required: true,
      pattern: '^[0-9a-zA-Z_-]{1,}$',
      dynamicProps: {
        // disabled: ({ record }) => record.get('nodeConfigId'), // 肖璐让编辑
      },
    },
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.nodeConfigName').d('节点名称'),
      required: true,
    },
    {
      name: 'nodeTemplateCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.nodeTemplateCodes').d('单据类型'),
      required: true,
      lookupCode: 'SLOD.NODE_TMPL_CODE',
      dynamicProps: {
        disabled: ({ record }) => record.get('nodeConfigId') && record.get('canEditLineFlag') === 0,
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.nodeTemplateCodeDetail')
        .d('不同单据类型的主要区别在于：页面业务字段差异化，可根据不同的业务场景选择单据类型'),
    },
    {
      name: 'customerUnitCodeAll',
      type: 'object',
      label: intl.get('slod.shipmentsConfiguration.model.customerUnitCode').d('个性化单元组'),
      required: true,
      lovCode: 'SLOD.NODE_CUSTOMIZE_UNIT',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            nodeTemplateCode: record?.get('nodeTemplateCode'),
          };
        },
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.customerUnitCodeAllDetail')
        .d('用于节点配置具体个性化单元路径（包括【展示列表】及【查询条件】的个性化配置）'),
    },
    {
      name: 'customerUnitCode',
      type: 'string',
      bind: 'customerUnitCodeAll.groupCode',
    },
    {
      name: 'customerUnitCodeMeaning',
      type: 'string',
      bind: 'customerUnitCodeAll.groupName',
    },
    {
      name: 'cuszDocTmplCodeObj',
      type: 'object',
      label: intl.get('slod.shipmentsConfiguration.model.customizeCodes').d('单据样式模板'),
      // required: true,
      lovCode: 'HPFM.CUSZ.DOC_TEMPLATE_LAST',
      valueField: 'templateCode',
      textField: 'templateName',
      /**
       * HPFM.CUSZ.DOC_TEMPLATE_LAST	查询最新版本的模板列表
       * HPFM.CUSZ.DOC_TEMPLATE_ALL	查询所有有效模板信息
       */
      dynamicProps: {
        lovPara: ({ record }) => {
          return { docCode: `SLOD.DELIVERY_WORKBENCH.${record.get('nodeTemplateCode')}` };
        },
        disabled: ({ record }) => record?.get('canEditCuszFlag') === 0,
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.cuszDocTmplCodeObjDetail')
        .d('用于节点单据详情配置具体个性化路径（包括【单据明细头、行】字段）'),
    },
    {
      name: 'cuszDocTmplCode',
      type: 'string',
      bind: 'cuszDocTmplCodeObj.templateCode',
    },
    {
      name: 'cuszDocTmplCodeMeaning',
      type: 'string',
      bind: 'cuszDocTmplCodeObj.templateName',
    },
    {
      name: 'documentCodeRuleAll',
      type: 'object',
      label: intl.get('slod.shipmentsConfiguration.model.documentCodeRule').d('单据编码生成规则'),
      required: true,
      lovCode: 'HMDE.CODE_RULE',
      // transformRequest: (value) => value?.ruleCode,
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
      // dynamicProps: {
      //   disabled: ({ record }) => record.get('nodeConfigId'),
      // },
    },
    {
      name: 'documentCodeRule',
      type: 'string',
      bind: 'documentCodeRuleAll.ruleCode',
    },
    {
      name: 'documentCodeRuleMeaning',
      type: 'string',
      bind: 'documentCodeRuleAll.ruleName',
    },
    {
      name: 'uniqueLabelCodeRuleAll',
      type: 'object',
      label: intl
        .get('slod.shipmentsConfiguration.model.uniqueLabelCodeRule')
        .d('唯一标签编码生成规则'),
      lovCode: 'HMDE.CODE_RULE',
      ignore: 'always',
      // defaultValue: 'SCUX.SPUC.INV.LABEL_CODE',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
          };
        },
        required: (
          { record } // 产品需要必输
        ) => record.get('nodeTemplateCode') && record.get('nodeTemplateCode') === 'UNIQUE_LABEL',
        disabled: ({ record }) =>
          !record.get('nodeTemplateCode') ||
          (record.get('nodeTemplateCode') && record.get('nodeTemplateCode') !== 'UNIQUE_LABEL'),
      },
    },
    {
      name: 'uniqueLabelCodeRule',
      type: 'string',
      bind: 'uniqueLabelCodeRuleAll.ruleCode',
    },
    {
      name: 'uniqueLabelCodeRuleMeaning',
      type: 'string',
      bind: 'uniqueLabelCodeRuleAll.ruleName',
    },
    {
      name: 'nodeRemark',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.nodeRemark').d('节点详细说明'),
      required: true,
      maxLength: 100,
      help: intl
        .get('slod.shipmentsConfiguration.model.nodeRemarkDetail')
        .d('用于解释当前节点的主要作用场景，体现在工作台页面节点下方展示'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.operation').d('操作'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        Object.assign(record, { status: 'update' });
        // if (record.get('nodeTemplateCode') === 'PLAN') {
        //   record.set('documentCodeRuleAll', 'SLOD.PLAN_NUM');
        // }
        // if (record.get('nodeTemplateCode') === 'LABLE') {
        //   record.set('documentCodeRuleAll', 'SLOD.LABLE_LINE_NUM');
        // }
        // if (record.get('nodeTemplateCode') === 'UNIQUE_LABEL') {
        //   record.set('documentCodeRuleAll', 'SLOD.LABLE_NUM');
        // }
        // if (record.get('nodeTemplateCode') === 'ASN') {
        //   record.set('documentCodeRuleAll', 'SLOD.ASN_NUM');
        // }
      });
    },
    update: ({ record, name, value }) => {
      if (name === 'nodeTemplateCode') {
        if (value === 'PLAN') {
          record.set('documentCodeRuleMeaning', '计划单编码规则');
          record.set('documentCodeRule', 'SLOD.PLAN_NUM');
        }
        if (value === 'LABEL') {
          record.set('documentCodeRuleMeaning', '标签编码规则');
          record.set('documentCodeRule', 'SLOD.LABEL_NUM');
        }
        if (value === 'UNIQUE_LABEL') {
          // record.set('documentCodeRuleMeaning', '标签行唯一编码');
          // record.set('documentCodeRule', 'SLOD.LABEL_LINE_NUM');
          record.set('documentCodeRuleMeaning', '唯一标签编码规则');
          record.set('documentCodeRule', 'SLOD.UNIQUE_LABEL_NUM');
        }
        if (value === 'ASN') {
          record.set('documentCodeRuleMeaning', '送货单编码规则');
          record.set('documentCodeRule', 'SLOD.ASN_NUM');
        }
      }
      if (name === 'nodeTemplateCode') {
        record.set('customerUnitCode', '');
        record.set('customerUnitCodeMeaning', '');
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/node-config/list`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { nodeDS };
