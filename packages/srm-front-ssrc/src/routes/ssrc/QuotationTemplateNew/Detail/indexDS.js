import React, { Fragment } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'hzero-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

const promptCode = 'ssrc.quotationTemplate';
const organizationId = getCurrentOrganizationId();

const formDS = (templateId, { pageReadonly = false, }) => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get(`${promptCode}.model.template.code`).d('报价模板编码'),
      name: 'templateNum',
      disabled: true,
    },
    {
      label: intl.get(`${promptCode}.model.template.name`).d('报价模板名称'),
      name: 'templateName',
      // required: true,
      type: 'intl',
      dynamicProps: {
        required({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus !== 'RELEASED';
          return flag;
        },
        disabled({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus === 'RELEASED';
          return flag;
        },
      },
    },
    {
      label: intl.get(`${promptCode}.model.template.quotationDimension`).d('模板维度'),
      name: 'templateDimension',
      lookupCode: 'SSRC.QUOTATION_TEMPLATE_DIMENSION',
      // required: true,
      defaultValue: 'ITEM_CATEGORY',
      dynamicProps: {
        required({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus !== 'RELEASED';
          return flag;
        },
        disabled({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus === 'RELEASED';
          return flag;
        },
      },
    },
    {
      label: intl.get(`${promptCode}.model.template.moduleRule`).d('模板规则'),
      help: intl
      .get(`${promptCode}.view.message.moduleRule.tips`)
      .d('【用于定义报价模板是否划分为多个模块，按模块分别定义明细列、行。】'),
      name: 'moduleRule',
      lookupCode: 'SSRC_QUOTATION_TEMPLATE_RULE',
      // required: true,
      defaultValue: 'NO_DISTINCTION',
      dynamicProps: {
        required({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus !== 'RELEASED';
          return flag;
        },
        disabled({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus === 'RELEASED';
          return flag;
        },
      },
    },
    {
      label: intl.get(`${promptCode}.model.template.allowCreateFlag`).d('允许供应商新建明细行'),
      name: 'allowCreateFlag',
      labelWidth: 150,
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        required({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus !== 'RELEASED';
          return flag;
        },
        disabled({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus === 'RELEASED';
          return flag;
        },
      },
    },
    {
      label: intl
        .get(`ssrc.quotationTemplate.model.template.allowPurCreateFlag`)
        .d('允许采购方新建明细行'),
      name: 'allowPurCreateFlag',
      labelWidth: 150,
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        required({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus !== 'RELEASED';
          return flag;
        },
        disabled({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus === 'RELEASED';
          return flag;
        },
      },
    },
    {
      label: intl.get(`${promptCode}.model.template.attachment`).d('供应商附件必传'),
      name: 'attachmentNeedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        required({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus !== 'RELEASED';
          return flag;
        },
        disabled({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus === 'RELEASED';
          return flag;
        },
      },
    },
    {
      label: intl.get(`${promptCode}.model.template.assignOperation`).d('分配适用品类或物料'),
      name: 'distribute',
      type: 'string',
    },
    {
      label: intl.get(`${promptCode}.model.template.purchaserAttachment`).d('采购方附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'quotation-template',
      ...(ChunkUploadProps || {}),
      dynamicProps: {
        readOnly({ record }) {
          const { templateStatus } = record.get(['templateStatus']);
          const flag = templateStatus === 'RELEASED' || pageReadonly;
          return flag;
        },
      },
    },
    {
      name: 'templateStatus',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSRC}/v1/${organizationId}/quotation-templates/${templateId}`,
      method: 'GET',
    },
  },
});

const moduleFormDS = (templateId) => ({
  fields: [
    {
      label: intl.get(`${promptCode}.model.template.templateNum`).d('模块代码'),
      name: 'templateNum',
      required: true,
      format: 'uppercase',
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('templateNum'))) {
          return intl.get(`${promptCode}.validation.templateNum`).d('模块代码不能为中文');
        }
        return true;
      },
    },
    {
      label: intl.get(`${promptCode}.model.template.templateName`).d('模块名称'),
      name: 'templateName',
      type: 'intl',
      required: true,
    },
  ],
  transport: {
    submit: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-templates/module/save`,
        data: data.map((item) => ({
          ...item,
          parentTplId: templateId,
        })),
        method: 'POST',
      };
    },
  },
});

const copyTemplateDS = (templateId) => ({
  primaryKey: 'dimensionId',
  selection: 'single',

  fields: [
    {
      name: 'itemCode',
    },
    {
      name: 'itemName',
    },
    {
      name: "templateNum",
      label: intl.get('ssrc.common.view.templateNum').d('模板编码'),
    },
    {
      name: "templateName",
      label: intl.get('ssrc.common.view.templateName').d('模板名称'),
    },
  ],

  queryFields: [
    {
      name: 'itemCode',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('templateDimension') === 'ITEM'
            ? intl.get(`${promptCode}.model.assignedTempMaterial.code`).d('物料编码')
            : intl.get(`${promptCode}.model.assignedTempCategory.code`).d('品类编码'),
      },
    },
    {
      name: 'itemName',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('templateDimension') === 'ITEM'
            ? intl.get(`${promptCode}.model.assignedTempMaterial.name`).d('物料名称')
            : intl.get(`${promptCode}.model.assignedTempCategory.name`).d('品类名称'),
      },
    },
    {
      name: "templateNum",
      label: intl.get('ssrc.common.view.templateNum').d('模板编码'),
    },
    {
      name: "templateName",
      label: intl.get('ssrc.common.view.templateName').d('模板名称'),
    },
  ],

  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-dimensions`,
        method: 'GET',
        data: { ...data, templateId },
      };
    },
  },
});

const copyModuleDS = () => ({
  primaryKey: 'templateId',
  selection: 'single',

  fields: [
    {
      name: 'templateNum',
      label: intl.get(`${promptCode}.model.template.code`).d('报价模板编码'),
    },
    {
      name: 'templateName',
      label: intl.get(`${promptCode}.model.template.name`).d('报价模板名称'),
    },
    {
      name: 'templateId',
    },
  ],

  queryFields: [
    {
      name: 'templateNum',
      label: intl.get(`${promptCode}.model.template.code`).d('报价模板编码'),
    },
    {
      name: 'templateName',
      label: intl.get(`${promptCode}.model.template.name`).d('报价模板名称'),
    },
  ],

  transport: {
    read: ({ dataSet, data }) => {
      const {
        queryParameter: { templateId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-templates/module/clone/list`,
        method: 'GET',
        data: { ...data, templateId },
      };
    },
  },
});

const columnTableDS = ({ templateId, templateStatus, pageReadonly }) => ({
  primaryKey: 'quotationColumnId',
  selection: templateStatus === 'RELEASED' || pageReadonly ? false : 'multiple',
  fields: [
    {
      label: intl.get(`${promptCode}.model.template.columnCode`).d('报价明细列编码'),
      name: 'columnCode',
      required: true,
      trim: 'both',
      type: 'string',
      validator: (value, _, record) => {
        const reg = /^[a-z]+$/i;
        if (!reg.test(record.get('columnCode'))) {
          return intl
            .get(`${promptCode}.validation.columnCode`)
            .d('报价明细列编码只能由英文字母组成');
        }
        return true;
      },
    },
    {
      label: intl.get(`${promptCode}.model.template.columnName`).d('报价明细列名称'),
      name: 'columnName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`${promptCode}.model.template.rowLine`).d('列顺序(从左到右)'),
      name: 'columnSequence',
      required: true,
    },
    {
      label: intl.get(`${promptCode}.model.template.compents`).d('组件'),
      name: 'componentLov',
      type: 'object',
      lovCode: 'SSRC.QUOTATION_CMPT_TYPE',
      queryParams: { enabledFlag: 1 },
      required: true,
    },
    {
      name: 'componentId',
      bind: 'componentLov.componentId',
    },
    {
      name: 'componentType',
      bind: 'componentLov.componentType',
    },
    {
      name: 'componentDescription',
      bind: 'componentLov.componentDescription',
    },
    {
      label: intl.get(`${promptCode}.model.template.batchs`).d('值集'),
      name: 'lovCodeLov',
      type: 'object',
      ignore: 'always',
      lovPara: { enabledFlag: 1, lovQueryFlag: 1, tenantId: organizationId },
      dynamicProps: {
        lovCode: ({ record }) =>
          record.get('componentType') === 'Lov' ? 'HPFM.LOV_VIEW.CODE' : 'HPFM.LOV_IDP',
        disabled: ({ record }) =>
          record.get('componentType') !== 'ValueList' && record.get('componentType') !== 'Lov',
        required: ({ record }) =>
          templateStatus !== 'RELEASED' &&
          (record.get('componentType') === 'ValueList' || record.get('componentType') === 'Lov'),
        textField: ({ record }) => (record.get('componentType') === 'Lov' ? 'viewCode' : 'lovCode'),
        lovQueryAxiosConfig: ({ record }) => {
          if (record.get('componentType') === 'ValueList') {
            return {
              url: `/hpfm/v1/${getCurrentOrganizationId()}/lov-headers`,
              method: 'GET',
            };
          }
        },
      },
    },
    {
      name: 'lovId',
      bind: 'lovCodeLov.lovId',
    },
    {
      name: 'lovCode',
      dynamicProps: {
        bind: ({ record }) =>
          record.get('componentType') === 'Lov' ? 'lovCodeLov.viewCode' : 'lovCodeLov.lovCode',
      },
    },
    {
      label: intl.get(`${promptCode}.model.template.calculationRule`).d('计算规则'),
      help: intl
      .get(`${promptCode}.view.message.calcRule.tips`)
      .d(
        '【用于定义报价明细字段的计算逻辑。例：行金额=单价*数量，行金额字段配置的计算规则为Quantity*Price】'
      ),
      name: 'calculationRule',
      dynamicProps: {
        disabled: ({ record }) => record.get('componentType') !== 'InputNumber',
      },
    },
    //  {
    //   label: intl.get(`${promptCode}.model.template.disabled`).d('默认值配置'),
    //   name: 'disabled',
    //   type: 'boolean',
    //   trueValue: 1,
    //   falseValue: 0,
    //   dynamicProps: {
    //     disabled: ({ record }) => (record.get('componentType') !== 'InputNumber' && record.get('componentType') !== 'Input') || record.get('calculationRule'),
    //    },
    // },
    //  {
    //   label: intl.get(`${promptCode}.model.template.whetherTrue`).d('是否必输'),
    //   name: 'requiredFlag',
    //   type: 'boolean',
    //   trueValue: 1,
    //   falseValue: 0,
    //   dynamicProps: {
    //     disabled: ({ record }) => record.get('disabled'),
    //    },
    // },
    {
      label: intl.get('hzero.common.status.enable').d('启用'),
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'templateId',
      dynamicProps: {
        defaultValue: ({ dataSet }) => dataSet?.queryParameter?.moduleTemplateId || templateId,
      },
    },
  ],

  events: {
    update: ({ name, value, record }) => {
      // disabled "0" 仅外部可编辑 "1" 都可编辑 "2" 仅内部可编辑 "3" 都不可编辑
      // visible "0" 仅供应商可见 "1" 都可见 "2" 仅采购方可见
      // 组件类型
      if (name === 'componentType') {
        if (value) {
          // 类型不为数值并且calculationRule有值
          // calculationRule只针对数值
          if (value !== 'InputNumber' && record.get('calculationRule')) {
            record.set('calculationRule', null);
          }
          // 类型不为数值，文本并且disabled有值
          // 默认值只针对数值和文本类型
          if ((value !== 'InputNumber' || value !== 'Input') && record.get('disabled') !== '0') {
            record.set('disabled', '0');
          }
        } else if (!value) {
          if (record.get('calculationRule')) {
            record.set('calculationRule', null);
          }
          if (record.get('disabled') !== '0') {
            record.set('disabled', '0');
          }
        }
      }
      // 计算规则有值，默认值为'3'，都不可编辑;计算规则无值，默认值为'0'，仅供应商可编辑;
      if (name === 'calculationRule') {
        if (value) {
          record.set('disabled', '3');
        } else if (!value) {
          record.set('disabled', '0');
        }
      }
    },
  },

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { moduleTemplateId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-column/${moduleTemplateId || templateId}`,
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-column`,
        data: data.map((i) => i.quotationColumnId),
        method: 'DELETE',
      };
    },
    submit: ({ data, dataSet }) => {
      const {
        queryParameter: { moduleTemplateId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-column/${
          moduleTemplateId || templateId
        }/save`,
        data: data.map((item) => ({
          ...item,
          templateId: moduleTemplateId || templateId,
        })),
        method: 'POST',
      };
    },
  },
});

// 处理报价明细项数据
const handleDataSource = (source, templateStatus) => {
  const newSource = source.map((item) => {
    const { quotationColumns = [], ...otherItem } = item;
    let elementValue = {};
    // eslint-disable-next-line no-unused-expressions
    quotationColumns?.forEach((elementItem) => {
      const lovFlag =
        (elementItem.disabled === 1 || elementItem.disabled === 2) &&
        elementItem.componentType === 'Lov';
      elementValue = {
        ...elementValue,
        [lovFlag ? `${elementItem.columnCode}Lov` : elementItem.columnCode]: handleColumnValue(
          item,
          elementItem,
          templateStatus
        ),
      };
    });
    return {
      ...otherItem,
      ...elementValue,
      quotationColumns,
      expand: false, // 控制树形是否默认展开
    };
  });
  return newSource;
};

// 处理动态单元格显示值
const handleColumnValue = (item = {}, elementItem = {}, templateStatus) => {
  let value;
  // 已发布
  if (templateStatus === 'RELEASED') {
    value = elementItem.quotationColumnValue;
    if (item.quotationDetailType === 'NO') {
      value =
        elementItem.disabled === 1 || elementItem.disabled === 2
          ? elementItem.componentType === 'Lov'
            ? elementItem.columnDefaultValueMeaning
            : elementItem.columnDefaultValue
          : elementItem.quotationColumnValue;
    } else if (item.quotationDetailType === 'RULE') {
      value =
        elementItem.componentType === 'InputNumber'
          ? elementItem.quoTplDtlCalculationRule
          : elementItem.quotationColumnValue;
    }
  } else {
    // 未发布
    value = elementItem.quotationColumnValue;
    if (item.quotationDetailType === 'NO') {
      value =
        elementItem.disabled === 1 || elementItem.disabled === 2
          ? elementItem.componentType === 'Lov'
            ? {
                [elementItem.valueField]: elementItem.columnDefaultValue,
                [elementItem.displayField]: elementItem.columnDefaultValueMeaning,
              }
            : elementItem.columnDefaultValue
          : elementItem.quotationColumnValue;
    } else if (item.quotationDetailType === 'RULE') {
      value =
        elementItem.componentType === 'InputNumber'
          ? elementItem.quoTplDtlCalculationRule
          : elementItem.quotationColumnValue;
    }
  }
  return value;
};

const itemTableDS = ({ templateId, templateStatus, pageReadonly }) => ({
  primaryKey: 'templateDetailId',
  paging: 'server',
  idField: 'templateDetailId',
  parentField: 'parentDetailId',
  expandField: 'expand',
  checkField: templateStatus === 'RELEASED' || pageReadonly ? null : 'enabledFlag',
  selection: templateStatus === 'RELEASED' || pageReadonly ? false : 'multiple',
  fields: [
    {
      label: intl.get(`${promptCode}.model.template.configCode`).d('报价明细项编码'),
      name: 'configCode',
      required: true,
      trim: 'both',
      type: 'string',
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('configCode'))) {
          return intl.get(`${promptCode}.validation.configCode`).d('报价明细列编码不能为中文');
        }
        return true;
      },
    },
    {
      label: intl.get(`${promptCode}.model.template.configName`).d('报价明细项名称'),
      name: 'configName',
      // type: 'intl',
      required: true,
    },
    {
      label: intl.get(`${promptCode}.model.template.lineSequence`).d('行顺序(从上到下)'),
      name: 'lineSequence',
      required: true,
      precision: 0,
      min: 0,
    },
    {
      label: intl.get(`${promptCode}.model.template.quotationDetailType`).d('明细项类型'),
      name: 'quotationDetailType',
      required: true,
      lookupCode: 'SSRC.QUOTATION_DETAIL_TYPE',
      defaultValue: 'NO',
    },
    {
      label: intl.get(`${promptCode}.model.template.summaryItemList`).d('指定范围'),
      name: 'summaryItemList',
      multiple: true,
      dynamicProps: {
        required: ({ record }) => record.get('quotationDetailType') === 'SCOPE',
        disabled: ({ record }) => record.get('quotationDetailType') !== 'SCOPE',
      },
    },
    {
      label: intl.get('hzero.common.status.enable').d('启用'),
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'expand',
      type: 'boolean',
      label: intl.get(`${promptCode}.model.template.expand`).d('是否展开'),
    },
  ],

  events: {
    update: ({ name, record, value, oldValue }) => {
      if (name === 'quotationDetailType') {
        if (value === 'SCOPE') {
          if (oldValue === 'NO' || oldValue === 'ALL' || oldValue === 'RULE') {
            // eslint-disable-next-line no-unused-expressions
            record.get('quotationColumns')?.forEach((item) => {
              record.getField(item.columnCode).set('lookupCode', 'SSRC.QUOTATION_DETAIL_SUMMARY');
              record.set(item.columnCode, 'NO');
              if ((item.disabled === 1 || item.disabled === 2) && item.componentType === 'Lov') {
                record
                  .getField(`${item.columnCode}Lov`)
                  .set('lookupCode', 'SSRC.QUOTATION_DETAIL_SUMMARY');
                record.set(`${item.columnCode}Lov`, 'NO');
              }
            });
          }
        } else if (value === 'ALL') {
          if (oldValue === 'SCOPE') {
            record.set('summaryItemList', null);
            // eslint-disable-next-line no-unused-expressions
            record.get('quotationColumns')?.forEach((item) => {
              record.set(item.columnCode, 'NO');
              if ((item.disabled === 1 || item.disabled === 2) && item.componentType === 'Lov') {
                record.set(`${item.columnCode}Lov`, 'NO');
              }
            });
          } else if (oldValue === 'NO' || oldValue === 'RULE') {
            // eslint-disable-next-line no-unused-expressions
            record.get('quotationColumns')?.forEach((item) => {
              record.getField(item.columnCode).set('lookupCode', 'SSRC.QUOTATION_DETAIL_SUMMARY');
              record.set(item.columnCode, 'NO');
              if ((item.disabled === 1 || item.disabled === 2) && item.componentType === 'Lov') {
                record
                  .getField(`${item.columnCode}Lov`)
                  .set('lookupCode', 'SSRC.QUOTATION_DETAIL_SUMMARY');
                record.set(`${item.columnCode}Lov`, 'NO');
              }
            });
          }
        } else if (value === 'NO') {
          if (oldValue === 'SCOPE') {
            record.set('summaryItemList', null);
            // eslint-disable-next-line no-unused-expressions
            record.get('quotationColumns')?.forEach((item) => {
              record.set(item.columnCode, null);
              if ((item.disabled === 1 || item.disabled === 2) && item.componentType === 'Lov') {
                record.set(`${item.columnCode}Lov`, null);
              }
            });
          } else if (oldValue === 'ALL') {
            // eslint-disable-next-line no-unused-expressions
            record.get('quotationColumns')?.forEach((item) => {
              record.set(item.columnCode, null);
              if ((item.disabled === 1 || item.disabled === 2) && item.componentType === 'Lov') {
                record.set(`${item.columnCode}Lov`, null);
              }
            });
          } else if (oldValue === 'RULE') {
            // eslint-disable-next-line no-unused-expressions
            record.get('quotationColumns')?.forEach((item) => {
              if (item.componentType === 'InputNumber') {
                record.set(item.columnCode, null);
              }
              if (
                (item.disabled === 1 || item.disabled === 2) &&
                ['Lov', 'ValueList'].includes(item.componentType)
              ) {
                if (item.componentType === 'Lov') {
                  record.set(`${item.columnCode}Lov`, null);
                } else {
                  record.set(item.columnCode, null);
                }
              }
            });
          }
        } else if (value === 'RULE') {
          if (oldValue === 'NO') {
            // eslint-disable-next-line no-unused-expressions
            record.get('quotationColumns')?.forEach((item) => {
              if (['InputNumber', 'Input', 'ValueList'].includes(item.componentType)) {
                record.set(item.columnCode, null);
              }
              if (item.componentType === 'Lov') {
                record.set(`${item.columnCode}Lov`, null);
              }
            });
          } else if (oldValue === 'SCOPE') {
            record.set('summaryItemList', null);
            // eslint-disable-next-line no-unused-expressions
            record.get('quotationColumns')?.forEach((item) => {
              record.set(item.columnCode, null);
              if (item.componentType === 'Lov') {
                record.set(`${item.columnCode}Lov`, null);
              }
            });
          } else if (oldValue === 'ALL') {
            // eslint-disable-next-line no-unused-expressions
            record.get('quotationColumns')?.forEach((item) => {
              record.set(item.columnCode, null);
              if (item.componentType === 'Lov') {
                record.set(`${item.columnCode}Lov`, null);
              }
            });
          }
        }
      }
    },
  },

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { moduleTemplateId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-column/${
          moduleTemplateId || templateId
        }/line`,
        method: 'GET',
        transformResponse: (res) => {
          const result = JSON.parse(res);
          if (result && !result.failed) {
            const { content = [], ...pages } = result;
            const data = handleDataSource(content, templateStatus);
            return { ...pages, content: data };
          }
          notification.error({
            description: result.message,
          });
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-tpl-dtl`,
        data: data.map((i) => i.templateDetailId),
        method: 'DELETE',
      };
    },
  },
});

const attrChildrenTableDataSet = ({ quotationColumnId, }) => {
  return {
    selection: null,
    paging: false,
    primaryKey: 'quotationColumnCmptId',
    fields: [
      {
        label: intl.get(`${promptCode}.model.definition.attrName`).d('属性名称'),
        name: 'attributeName',
      },
      {
        label: intl.get(`${promptCode}.model.definition.attrDesc`).d('属性描述'),
        name: 'attributeDescription',
      },
      {
        label: intl.get(`${promptCode}.model.definition.attrVal`).d('属性值'),
        name: 'attributeValue',
      },
    ],
    transport: {
      read: {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-column-cmpts/${quotationColumnId}`,
        method: 'GET',
      },
      submit: {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-column-cmpts/update`,
        method: 'PUT',
      },
    },
  };
};

export { formDS, moduleFormDS, copyTemplateDS, copyModuleDS, columnTableDS, itemTableDS, attrChildrenTableDataSet, };
