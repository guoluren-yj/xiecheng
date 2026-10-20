/*
 * @Description:
 * @Date: 2021-11-24 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const indexDS = () => ({
  dataToJSON: 'all',
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'nodeConfigCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.nodeConfigCode').d('节点编码'),
      required: true,
      pattern: '^[0-9a-zA-Z_-]{1,}$',
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('canEditLineFlag') === 0;
        },
      },
    },
    {
      name: 'nodeConfigName',
      type: 'intl',
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
        // disabled: ({ record }) => record.get('nodeConfigId'),
        disabled: ({ record }) => record.get('nodeConfigId') && record.get('canEditLineFlag') === 0,
      },
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
            nodeTemplateCode: record.get('nodeTemplateCode'),
          };
        },
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.cuszDocTmplCodeObjDetailExplain')
        .d(
          '根据【单据类型】自动获取对应类型下可选择的页面个性化列表单元，每一个个性化单元只能选择一次，若选择值集为空，则说明此类型下不可再新增节点。'
        ),
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
      lovCode: 'HPFM.CUSZ.DOC_TEMPLATE_LAST',
      valueField: 'templateCode',
      textField: 'templateName',
      dynamicProps: {
        lovPara: ({ record }) => {
          return { docCode: `SLOD.DELIVERY_WORKBENCH.${record.get('nodeTemplateCode')}` };
        },
        disabled: ({ record }) =>
          record.get('canEditCuszFlag') === 0 ||
          (!record.get('nodeTemplateCode') && record.get('canEditCuszFlag') === 1),
        // disabled: ({ record }) => record.get('canEditCuszFlag') === 0,
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.customizeCodesExplain')
        .d('根据【单据类型】自动获取对应类型下可选择的“已发布”的单据样式模板'),
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
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
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
      type: 'intl',
      label: intl.get('slod.shipmentsConfiguration.model.nodeRemark').d('节点详细说明'),
      required: true,
      maxLength: 100,
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
        record.init({ tenantId: organizationId });
      });
    },
    // update: ({ record, name, value }) => {
    //   if (name === 'nodeTemplateCode') {
    //     if (value === 'PLAN') {
    //       record.set('documentCodeRuleMeaning', '计划单编码规则');
    //       record.set('documentCodeRule', 'SLOD.PLAN_NUM');
    //     }
    //     if (value === 'LABEL') {
    //       record.set('documentCodeRuleMeaning', '标签编码规则');
    //       record.set('documentCodeRule', 'SLOD.LABEL_NUM');
    //       record.set('uniqueLabelCodeRuleMeaning', '');
    //       record.set('uniqueLabelCodeRule', '');
    //     }
    //     if (value === 'UNIQUE_LABEL') {
    //       record.set('documentCodeRuleMeaning', '标签编码规则');
    //       record.set('documentCodeRule', 'SLOD.LABEL_NUM');
    //       record.set('uniqueLabelCodeRuleMeaning', '唯一标签编码规则');
    //       record.set('uniqueLabelCodeRule', 'SLOD.UNIQUE_LABEL_NUM');
    //     }
    //     if (value === 'ASN') {
    //       record.set('documentCodeRuleMeaning', '送货单编码规则');
    //       record.set('documentCodeRule', 'SLOD.ASN_NUM');
    //     }
    //   }
    //   // if (name === 'nodeTemplateCode') {
    //   //   record.set('customerUnitCode', '');
    //   //   record.set('customerUnitCodeMeaning', '');
    //   //   record.set('cuszDocTmplCode', '');
    //   //   record.set('documentCodeRule', null);
    //   //   record.set('documentCodeRuleMeaning', null);
    //   //   record.set('documentCodeRuleAll', null);
    //   // }
    // },
  },
});

export { indexDS };
