import React from 'react';
import { Tooltip, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const promptCode = 'ssrc.quotationTemplate';
const organizationId = getCurrentOrganizationId();

const tableDS = () => ({
  primaryKey: 'templateId',
  selection: false,
  autoQuery: true,
  pageSize: 20,
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
    },
    {
      label: (
        <span>
          {intl.get(`${promptCode}.model.template.moduleRule`).d('模板规则')}
          <Tooltip
            title={intl
              .get(`${promptCode}.view.message.moduleRule.tips`)
              .d('【用于定义报价模板是否划分为多个模块，按模块分别定义明细列、行。】')}
          >
            <Icon style={{ marginLeft: '4px' }} type="question-circle-o" />
          </Tooltip>
        </span>
      ),
      name: 'moduleRule',
      lookupCode: 'SSRC_QUOTATION_TEMPLATE_RULE',
      required: true,
      defaultValue: 'NO_DISTINCTION',
    },
    {
      label: intl.get(`${promptCode}.model.template.version`).d('版本'),
      name: 'versionNumber',
    },
    {
      label: intl.get(`${promptCode}.model.template.status`).d('状态'),
      name: 'templateStatusMeaning',
    },
  ],
  // queryFields: [
    // {
    //   label: intl.get(`${promptCode}.model.template.code`).d('报价模板编码'),
    //   name: 'templateNum',
    // },
    // {
    //   label: intl.get(`${promptCode}.model.template.name`).d('报价模板名称'),
    //   name: 'templateName',
    // },
    // {
    //   label: intl.get(`${promptCode}.model.template.dimension`).d('模板维度'),
    //   name: 'templateDimension',
    //   lookupCode: 'SSRC.QUOTATION_TEMPLATE_DIMENSION',
    // },
    // {
    //   label: intl.get(`${promptCode}.model.template.category`).d('品类'),
    //   name: 'itemCategoryId',
    //   type: 'object',
    //   lovCode: 'SSRC.QUOTATION_TPL.ITEM_CAT',
    //   lovPara: { tenantId: organizationId },
    //   transformRequest: (value) => value?.itemCategoryId,
    // },
    // {
    //   label: intl.get(`${promptCode}.model.template.code`).d('报价模板编码'),
    //   name: 'itemId',
    //   type: 'object',
    //   lovCode: 'SSRC.QUOTATION_TPL.ITEM',
    //   lovPara: { tenantId: organizationId },
    //   transformRequest: (value) => value?.itemId,
    // },
    // {
    //   label: intl.get(`${promptCode}.model.template.categorys`).d('适用品类'),
    //   name: 'itemCategoryLov',
    //   type: 'object',
    //   lovCode: 'SSRC.QUOTATION_TPL.ITEM_CAT',
    //   lovPara: { tenantId: organizationId },
    //   multiple: true,
    //   ignore: 'always',
    // },
    // {
    //   name: 'itemCategoryIds',
    //   bind: 'itemCategoryLov.categoryId',
    //   transformRequest: (value) => {
    //     return value?.join(',');
    //   },
    // },
    // {
    //   name: 'categoryName',
    //   bind: 'itemCategoryLov.categoryName',
    //   ignore: 'always',
    // },
    // {
    //   label: intl.get(`${promptCode}.model.template.item`).d('适用物料'),
    //   name: 'itemLov',
    //   type: 'object',
    //   lovCode: 'SSRC.CUSTOMER_ITEM',
    //   lovPara: { tenantId: organizationId },
    //   multiple: true,
    //   ignore: 'always',
    //   textField: 'itemName',
    // },
    // {
    //   name: 'itemIds',
    //   bind: 'itemLov.itemId',
    //   transformRequest: (value) => {
    //     return value?.join(',');
    //   },
    // },
    // {
    //   name: 'itemName',
    //   bind: 'itemLov.itemName',
    //   ignore: 'always',
    // },
  // ],
  transport: {
    read: ({ data, dataSet, }) => {
      const { searchBar = {}, ...others } = data || {};
      const {
        queryParameter,
      } = dataSet;

      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-templates`,
        method: 'GET',
        data: {
          ...(searchBar || {}),
          ...(others || {}),
          customizeUnitCode: 'SSRC.QUOTATION_TEMPLATE_LIST.TABLE,SSRC.QUOTATION_TEMPLATE_LIST.LINE_FILTER',
        },
      };
    },
    // submit: {
    //   url: `${SRM_SSRC}/v1/${organizationId}/quotation-templates`,
    //   method: 'POST',
    //   params: {
    //     customizeUnitCode: 'SSRC.QUOTATION_TEMPLATE_LIST.TABLE',
    //   },
    // },
  },
});

const unAssignedTableDS = ({ templateId, templateCode, templateStatus, pageReadonly = false, }) => ({
  primaryKey: 'itemCategoryId',
  autoQuery: true,
  selection: templateStatus === 'RELEASED' || pageReadonly ? false : 'multiple',
  cacheSelection: true,
  fields: [
    {
      label: intl.get(`${promptCode}.modal.material.code`).d('物料编码'),
      name: 'itemCategoryCode',
    },
    {
      label: intl.get(`${promptCode}.modal.material.name`).d('物料名称'),
      name: 'itemCategoryName',
    },
  ],
  queryFields: [
    {
      label: intl.get(`${promptCode}.modal.material.code`).d('物料编码'),
      name: 'itemCategoryCode',
    },
    {
      label: intl.get(`${promptCode}.modal.material.name`).d('物料名称'),
      name: 'itemCategoryName',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-dimensions/assignableOfItem`,
        method: 'GET',
        data: { templateId, templateCode, ...data },
      };
    },
  },
});

const assignedTableDS = ({ templateId, templateStatus, pageReadonly, }) => ({
  primaryKey: 'dimensionId',
  autoQuery: true,
  selection: templateStatus === 'RELEASED' || pageReadonly ? false : 'multiple',
  cacheSelection: true,
  fields: [
    {
      label: intl.get(`${promptCode}.modal.material.code`).d('物料编码'),
      name: 'itemCategoryCode',
    },
    {
      label: intl.get(`${promptCode}.modal.material.name`).d('物料名称'),
      name: 'itemCategoryName',
    },
  ],
  queryFields: [
    {
      label: intl.get(`${promptCode}.modal.material.code`).d('物料编码'),
      name: 'itemCategoryCode',
    },
    {
      label: intl.get(`${promptCode}.modal.material.name`).d('物料名称'),
      name: 'itemCategoryName',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-dimensions/assignedOfItem`,
        method: 'GET',
        data: { templateId, ...data },
      };
    },
  },
});

const categoryTableDS = (handleOkCategory) => ({
  primaryKey: 'itemCategoryId',
  idField: 'itemCategoryId',
  parentField: 'parentItemCategoryId',
  paging: 'server',
  fields: [
    {
      label: intl.get(`${promptCode}.model.category.code`).d('品类编码'),
      name: 'itemCategoryCode',
    },
    {
      label: intl.get(`${promptCode}.model.category.name`).d('品类名称'),
      name: 'itemCategoryName',
    },
  ],
  queryFields: [
    {
      label: intl.get(`${promptCode}.model.category.code`).d('品类编码'),
      name: 'itemCategoryCode',
    },
    {
      label: intl.get(`${promptCode}.model.category.name`).d('品类名称'),
      name: 'itemCategoryName',
    },
  ],
  events: {
    beforeLoad: ({ dataSet, data }) => {
      const {
        params: { templateId, templateDimension },
      } = dataSet.queryParameter || {};
      if (data.length) {
        handleOkCategory(templateId, templateDimension);
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        const {
          params: { templateStatus },
        } = dataSet.queryParameter;
        if (templateStatus === 'RELEASED' || record.get('disableFlag')) {
          Object.assign(record, { selectable: false });
        }
        if (record.get('assignFlag')) {
          Object.assign(record, { isSelected: true });
        }
      });
    },
    beforeAppend: ({ dataSet, data }) => {
      dataSet.setState('latestData', data);
    },
    append: ({ dataSet }) => {
      const {
        params: { templateStatus },
      } = dataSet.queryParameter;
      const latestData = dataSet.getState('latestData') || [];
      const latestDataIds = latestData.map((item) => item.itemCategoryId);
      dataSet.forEach((record) => {
        if (latestDataIds.includes(record.get('itemCategoryId'))) {
          if (templateStatus === 'RELEASED' || record.get('disableFlag')) {
            Object.assign(record, { selectable: false });
          }
          if (record.get('assignFlag')) {
            Object.assign(record, { isSelected: true });
          }
        }
      });
    },
    batchSelect: ({ records }) => {
      const changeRecodStatus = (item) => {
        if (!item.getState('dirty')) {
          item.setState('dirty', true);
        }
      };
      records.forEach((record) => changeRecodStatus(record));
    },
    batchUnSelect: ({ records }) => {
      const changeRecodStatus = (item) => {
        if (!item.getState('dirty')) {
          item.setState('dirty', true);
        }
      };
      records.forEach((record) => changeRecodStatus(record));
    },
    select: ({ record }) => {
      record.setState('dirty', true);
    },
    unSelect: ({ record }) => {
      record.setState('dirty', true);
    },
  },
  transport: {
    read: ({ data, dataSet }) => {
      const {
        params: { templateId, templateCode },
      } = dataSet.queryParameter || {};
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-dimensions/tempalteCategory`,
        method: 'GET',
        data: { templateId, templateCode, ...data },
      };
    },
  },
});

export { tableDS, unAssignedTableDS, assignedTableDS, categoryTableDS };
