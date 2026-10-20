/*
 * @Description:
 * @Date: 2020-09-06 10:38:14
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SIEC } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const lineDS = () => ({
  primaryKey: 'templateId',
  autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'templateStatusMeaning',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.templateStatus').d('状态'),
    },
    {
      name: 'templateCode',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.templateCode').d('反馈单模板编码'),
    },
    {
      name: 'templateName',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.templateName').d('反馈单模板名称'),
    },
    {
      name: 'templateDesc',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.templateDesc').d('说明'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sodr.feedback.model.feedback.exec.creationDate').d('创建日期'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sodr.feedback.model.feedback.enabledFlag').d('启用状态'),
    },
    {
      name: 'templateType',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.templateType').d('类型'),
    },
    {
      name: 'fieldConfig',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.newFieldConfig').d('模板配置'),
    },
    {
      name: 'action',
      label: intl.get('sodr.feedback.model.feedback.action').d('操作'),
    },
  ],
  queryFields: [
    {
      name: 'templateCodeOrName',
      type: 'string',
      label: intl.get('sodr.feedback.model.feedback.templateCodeOrName').d('反馈单模板名称/编号'),
    },
    {
      name: 'userId',
      type: 'object',
      label: intl.get('sodr.feedback.model.feedback.create').d('创建人'),
      lovCode: 'SPCM.ACCEPT_USER',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: (value) => value && value.userId,
    },
  ],
  transport: {
    read: ({ data }) => {
      const paramsUrl = isTenantRoleLevel() ? 'list' : 'platform-list';
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/template/${paramsUrl}`,
        method: 'GET',
        data,
      };
    },
  },
});

const formDS = () => ({
  fields: [
    {
      name: 'templateCode',
      label: intl.get('sodr.feedback.model.feedback.templateCode').d('反馈单模板编码'),
      required: true,
      validator: (value) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(value)) {
          return intl.get('sodr.feedback.model.validation.notChinese').d('模板编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'templateName',
      type: 'intl',
      label: intl.get('sodr.feedback.model.feedback.templateName').d('反馈单模板名称'),
      required: true,
    },
    {
      name: 'templateCreateType',
      label: intl.get('sodr.feedback.view.title.feedbackType').d('反馈单模板类型'),
      lookupCode: 'SFBK.FEEDBACK_TEMPLATE_CREATE_TYPE',
      required: true,
      defaultValue: 'REFERENCING_DOC',
    },
    {
      name: 'enabledFlag',
      label: intl.get('sodr.feedback.model.feedback.enabledFlag').d('是否启用'),
      lookupCode: 'HPFM.FLAG',
      required: true,
    },
    {
      name: 'splitFlag',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('sodr.feedback.model.feedback.splitFlag').d('是否允许拆行'),
      defaultValue: 0,
    },
    {
      name: 'splitName',
      type: 'intl',
      label: intl.get('sodr.feedback.model.feedback.splitName').d('拆行字段名称'),
      dynamicProps: ({ record }) => {
        return {
          required: +record.get('splitFlag') === 1,
        };
      },
    },
    {
      name: 'splitLocation',
      label: intl.get('sodr.feedback.model.feedback.splitLocation').d('拆行字段位置'),
      lookupCode: 'SFBK.FEEDBACK_SPLIT_LOCATION',
      dynamicProps: ({ record }) => {
        return {
          required: +record.get('splitFlag') === 1,
        };
      },
    },
    {
      label: intl.get('sodr.feedback.model.feedback.splitCamp').d('拆行阵营'),
      name: 'splitCamp',
      lookupCode: 'SFBK.FEEDBACK_SPLIT_CAMP',
      dynamicProps: {
        required({ record }) {
          return record.get('splitFlag') === '1';
        },
      },
      defaultValue: 'SUPPLIER',
    },
    {
      name: 'templateDesc',
      type: 'intl',
      label: intl.get('sodr.feedback.model.feedback.header.templateDesc').d('模板说明'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'splitFlag') {
        if (+value === 1) {
          record.set('splitLocation', 'LAST');
          record.set('splitCamp', 'SUPPLIER');
        } else {
          record.set('splitName', null);
          record.set('splitLocation', null);
          record.set('splitCamp', null);
        }
      }
    },
  },
});

export { lineDS, formDS };
