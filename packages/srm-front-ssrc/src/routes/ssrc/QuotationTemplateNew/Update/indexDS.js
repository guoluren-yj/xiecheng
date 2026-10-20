import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'hzero-ui';

import { SRM_SSRC } from '_utils/config';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';

const promptCode = 'ssrc.quotationTemplate';

const formDS = () => ({
  autoQuery: false,
  autoCreate: false,
  fields: [
    {
      label: intl.get(`${promptCode}.model.template.code`).d('报价模板编码'),
      name: 'templateNum',
      required: true,
      format: 'uppercase',
      maxLength: 30,
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('templateNum'))) {
          return intl.get(`${promptCode}.validation.templateNum`).d('模块代码不能为中文');
        }
        return true;
      },
    },
    {
      label: intl.get(`${promptCode}.model.template.name`).d('报价模板名称'),
      name: 'templateName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`${promptCode}.model.template.dimension`).d('模板维度'),
      name: 'templateDimension',
      lookupCode: 'SSRC.QUOTATION_TEMPLATE_DIMENSION',
      required: true,
      defaultValue: 'ITEM_CATEGORY',
    },
    {
      label: intl.get(`${promptCode}.model.template.moduleRule`).d('模板规则'),
      help: intl
      .get(`${promptCode}.view.message.moduleRule.tips`)
      .d('【用于定义报价模板是否划分为多个模块，按模块分别定义明细列、行。】'),
      name: 'moduleRule',
      lookupCode: 'SSRC_QUOTATION_TEMPLATE_RULE',
      required: true,
      defaultValue: 'NO_DISTINCTION',
    },
    {
      label: intl.get(`${promptCode}.model.template.allowCreateFlag`).d('允许供应商新建明细行'),
      name: 'allowCreateFlag',
      labelWidth: 150,
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
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
      defaultValue: 1,
    },
    {
      label: intl.get(`${promptCode}.model.template.attachment`).d('供应商附件必传'),
      name: 'attachmentNeedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
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
      ...(ChunkUploadProps || {}),
      bucketDirectory: 'quotation-template',
    },
  ],
  transport: {
    submit: () => {
      const organizationId = getCurrentOrganizationId();
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-templates`,
        method: 'POST',
        params: {
          customizeUnitCode: 'SSRC.QUOTATIONTEMPLATE_UPDATE.BASE_FORM',
        },
      };
    },
  },
});

export { formDS };
