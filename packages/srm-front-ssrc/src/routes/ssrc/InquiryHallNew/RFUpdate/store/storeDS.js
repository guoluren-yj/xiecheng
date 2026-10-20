import React from 'react';
import { Tooltip, DataSet } from 'choerodon-ui/pro';
import { isEmpty, omit, isNil } from 'lodash';
import uuid from 'uuid/v4';

import intl from 'utils/intl';
import { getDateTimeFormat, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
// import notification from 'utils/notification';
import { getUomName, getQtyName, getLadderFrom, getLadderTo } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

const basicFormDS = ({ rfHeaderId, sourceCategory }) => ({
  autoQuery: true,
  paging: false,
  dataToJSON: 'all',
  fields: [
    // 基本信息
    {
      name: 'rfTitle',
      label: intl.get('ssrc.rf.model.rf.rfiTitle').d('征询书标题'),
      required: true,
      maxLength: 200,
    },
    {
      name: 'templateLov',
      label: intl.get('ssrc.rf.model.rf.template').d('征询模板'),
      type: 'object',
      lovCode: 'SSRC.RF_TEMPLATE',
      required: true,
      lovPara: {
        sourceCategory,
        latestFlag: 'Y',
      },
    },
    {
      name: 'templateNum',
      bind: 'templateLov.templateNum',
    },
    {
      name: 'templateName',
      bind: 'templateLov.templateName',
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`ssrc.rf.model.rf.sourceProject`).d('寻源项目'),
      disabled: true,
      dynamicProps: {
        help: ({ record }) =>
          `${record.get('sourceProjectNum')} - ${record.get('sourceProjectName')}`,
      },
    },
    {
      name: 'progressNodes',
      label: intl.get(`ssrc.rf.model.rf.progressNodes`).d('寻源节点'),
      disabled: true,
    },
    {
      name: 'rfRemark',
      label: intl.get('ssrc.rf.model.rf.rfRemark').d('备注'),
      maxLength: 1000,
    },
    // 采购组织及人员
    {
      name: 'companyLov',
      label: intl.get('ssrc.common.company').d('公司'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      textField: 'companyName',
      valueField: 'companyId',
      lovPara: { enabledFlag: 1 },
      required: true,
    },
    {
      name: 'companyId',
      bind: 'companyLov.companyId',
    },
    {
      name: 'companyName',
      bind: 'companyLov.companyName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.unitName`).d('需求部门'),
      name: 'unitLov',
      type: 'object',
      ignore: 'always',
      textField: 'unitName',
      valueField: 'unitId',
      lovPara: { tenantId: organizationId },
      lovCode: 'HPFM.USER_UNIT_TREE',
      optionsProps: {
        childrenField: 'children',
      },
    },
    {
      name: 'unitId',
      bind: 'unitLov.unitId',
    },
    {
      name: 'unitName',
      bind: 'unitLov.unitName',
    },
    {
      name: 'purOrganizationIdLov',
      label: intl.get(`ssrc.rf.model.rf.purchOrgName`).d('采购组织名称'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.PURORG',
      textField: 'organizationName',
      valueField: 'purchaseOrgId',
    },
    {
      name: 'purOrganizationId',
      bind: 'purOrganizationIdLov.purchaseOrgId',
    },
    {
      name: 'purOrganizationName',
      bind: 'purOrganizationIdLov.organizationName',
    },
    {
      name: 'purchaseLov',
      label: intl.get(`ssrc.rf.model.rf.purchaseAgentName`).d('采购员'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      lovPara: { organizationId },
    },
    {
      name: 'purAgentId',
      bind: 'purchaseLov.purchaseAgentId',
    },
    {
      name: 'purAgentName',
      bind: 'purchaseLov.purchaseAgentName',
    },
    // 邀请范围
    {
      name: 'sourceMethod',
      label: intl.get('ssrc.rf.model.rf.sourceType').d('寻源方式'),
      required: true,
      lookupCode: 'SSRC.SOURCE_METHOD',
      dynamicProps: {
        help: ({ record }) =>
          ['OPEN', 'ALL_OPEN'].includes(record.get('sourceMethod'))
            ? intl
                .get('ssrc.common.validate.sourceMethod')
                .d(
                  '为保护您的个人信息，建议使用您的商务联系方式（如办公电话、商业邮箱，办公室地址等），而非私人联系信息。'
                )
            : null,
      },
    },
    {
      name: 'allowSourceSupplierStages',
      label: intl.get('ssrc.rf.model.rf.allowSourceSupplierStages').d('可参与寻源供应商阶段'),
      disabled: true,
    },
    // 附件
    {
      name: 'rfiAttachmentUuid',
      required: true,
      type: 'attachment',
    },
    {
      name: 'techAttachmentUuid',
      required: true,
      type: 'attachment',
    },
    {
      name: 'businessAttachmentUuid',
      required: true,
      type: 'attachment',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.HEADER_${sourceCategory},SSRC.INQUIRY_HALL.RF_EDIT.ORGANIZATION_${sourceCategory},SSRC.INQUIRY_HALL.RF_EDIT.INVITE_RANGE_${sourceCategory},SSRC.INQUIRY_HALL.RF_EDIT.${sourceCategory}_ATTACHMENT`,
      },
    }),
  },
});

const sourceGroupDS = ({ rfHeaderId, sourceCategory }) => ({
  primaryKey: 'rfMemberId',
  autoQuery: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'loginNameLov',
      label: intl.get(`ssrc.rf.model.rf.account`).d('账号'),
      type: 'object',
      lovCode: 'SSRC.TENANT.USER',
      lovPara: { organizationId },
      textField: 'loginName',
    },
    {
      name: 'loginName',
      bind: 'loginNameLov.loginName',
    },
    {
      name: 'contactName',
      label: intl.get(`ssrc.rf.model.rf.contactName`).d('名称'),
      required: true,
      maxLength: 200,
    },
    {
      name: 'contactPhone',
      label: intl.get(`ssrc.rf.model.rf.contactPhone`).d('手机'),
      required: true,
      type: 'tel',
      regionField: 'internationalTelCode',
      dynamicProps: {
        pattern: ({ record }) => {
          return record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE;
        },
      },
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      required: true,
    },
    {
      name: 'contactMail',
      label: intl.get(`ssrc.rf.model.rf.contactMail`).d('邮箱'),
      required: true,
      validator: (value, _, record) => {
        if (value && !EMAIL.test(record.get('contactMail'))) {
          return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
        }
        return true;
      },
    },
    {
      name: 'memberUserId',
    },
    {
      name: 'publicContactFlag',
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.rf.model.rf.contactPublicTip')
            .d('该列控制是否将联系方式显示在公告以及供应商查看界面')}
        >
          {intl.get('ssrc.rf.model.rf.publicContactFlag').d('公布联系方式')}
        </Tooltip>
      ),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
  ],

  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/members`,
      method: 'GET',
      data: {
        rfHeaderId,
        customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.MEMBER_${sourceCategory}`,
      },
    }),
    destroy: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/members`,
      method: 'DELETE',
    }),
    submit: ({ data }) => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/members`,
      method: 'POST',
      params: {
        rfHeaderId,
        customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.MEMBER_${sourceCategory}`,
      },
      data,
    }),
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'loginNameLov') {
        if (value) {
          const { realName, phone, internationalTelCode, email, loginName, id } = value || {};
          record.set({
            contactName: realName,
            contactPhone: phone,
            internationalTelCode,
            contactMail: email,
            loginName,
            memberUserId: id,
          });
        } else {
          record.set({
            contactName: null,
            contactPhone: null,
            internationalTelCode: null,
            contactMail: null,
            loginName: null,
            memberUserId: null,
          });
        }
      } else if (name === 'internationalTelCode') {
        // 设置自身 为了触发自定义校验
        record.set('contactPhone', record.get('contactPhone'));
      }
    },
  },
});

const rfItemLineDS = ({ ds, rfHeaderId, sourceCategory }) => {
  return {
    primaryKey: 'rfLineItemId',
    autoQuery: true,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.rf.model.rf.lineNum`).d('行号'),
        name: 'rfLineItemNum',
      },
      {
        name: 'sectionCode',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionCode').d('标段编码'),
        dynamicProps: {
          options() {
            return new DataSet({ paging: false, data: ds?.current?.get('sectionList') || [] });
          },
        },
        valueField: 'sectionCode',
        textField: 'sectionCode',
      },
      {
        name: 'rfLineSectionId',
        type: 'string',
      },
      {
        name: 'sectionName',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionName').d('标段名称'),
      },
      {
        label: intl.get(`ssrc.rf.model.rf.businessUnit`).d('业务实体'),
        name: 'ouIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        valueField: 'ouId',
        dynamicProps: {
          lovPara() {
            const companyId = ds?.current?.get('companyId');
            return {
              companyId,
            };
          },
        },
      },
      {
        name: 'ouName',
        bind: 'ouIdLov.ouName',
      },
      {
        name: 'ouId',
        bind: 'ouIdLov.ouId',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'HPFM.INV_ORG',
        textField: 'organizationName',
        valueField: 'organizationId',
        dynamicProps: {
          disabled({ record }) {
            return !record.get('ouId');
          },
          lovPara({ record }) {
            return {
              ouId: record.get('ouId'),
              enabledFlag: 1,
              organizationId,
            };
          },
        },
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationIdLov.organizationName',
      },
      {
        name: 'invOrganizationId',
        bind: 'invOrganizationIdLov.organizationId',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.itemCode`).d('物料编码'),
        name: 'itemIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.NEW_CUSTOMER_ITEM',
        textField: 'itemCode',
        valueField: 'itemId',
        dynamicProps: {
          lovPara({ record }) {
            const companyId = ds?.current?.get('companyId');
            return {
              ouId: record.get('ouId'),
              invOrganizationId: record.get('invOrganizationId'),
              companyId,
              asyncCountFlag: 'Y',
            };
          },
        },
      },
      {
        name: 'itemId',
        bind: 'itemIdLov.itemId',
      },
      {
        name: 'itemCode',
        bind: 'itemIdLov.itemCode',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.itemName`).d('物料名称'),
        name: 'itemName',
        maxLength: 200,
        required: true,
        // bind: 'itemIdLov.itemName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.itemCategory`).d('物料类别'),
        name: 'itemCategoryIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        textField: 'categoryName',
        valueField: 'categoryId',
        optionsProps: {
          paging: 'server',
          // childrenField: 'children',
          events: {
            load: ({ dataSet }) => {
              const { current } = dataSet.queryDataSet || {};
              if (!isEmpty(omit(current.toData(), '__dirty'))) {
                dataSet.forEach((record = {}) => {
                  Object.assign(record, { isExpanded: true });
                });
              }
            },
          },
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                  idField: 'categoryId',
                  parentField: 'parentCategoryId',
                  expandField: 'isExpanded',
                };
              },
            ],
          };
        },
        dynamicProps: {
          lovPara({ dataSet, record }) {
            const { companyId = null } = dataSet.queryParameter.company || {};
            return {
              tenantId: organizationId,
              itemId: record.get('itemId'),
              companyId,
              businessObjectCode: 'SRM_C_SRM_SSRC_RF_HEADER',
            };
          },
        },
      },
      {
        name: 'itemCategoryId',
        bind: 'itemCategoryIdLov.categoryId',
      },
      {
        name: 'itemCategoryName',
        bind: 'itemCategoryIdLov.categoryName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
        min: 0.000001,
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomIdLov',
        type: 'object',
        ignore: 'always',
        textField: 'uomName',
        valueField: 'uomId',
        dynamicProps: {
          disabled({ record }) {
            return !!record.get('itemCode');
          },
          lovCode: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag && record?.get('itemId') ? 'SMDM_ITEM_ORG_UOM' : 'SSRC.UOM';
          },
          lovPara: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag && record?.get('itemId')
              ? { itemId: record?.get('itemId'), primaryUomId: record.get('uomId') }
              : {};
          },
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag;
          },
        },
      },
      {
        name: 'secondaryUomName',
        bind: 'secondaryUomIdLov.uomName',
      },
      {
        name: 'secondaryUomId',
        bind: 'secondaryUomIdLov.uomId',
      },
      {
        // 开启双单位 名称为基本数量 不开启 名称为需求数量
        name: 'demandQuantity',
        type: 'number',
        min: 0.000001,
        max: '99999999999999999999',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
          disabled({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag;
          },
        },
      },
      {
        // 开启双单位 名称为基本单位 不开启 名称为单位
        name: 'uomIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.UOM',
        textField: 'uomName',
        valueField: 'uomId',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag || !!record.get('itemCode');
          },
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return !doubleUnitFlag;
          },
        },
      },
      {
        name: 'uomName',
        bind: 'uomIdLov.uomName',
      },
      {
        name: 'uomId',
        bind: 'uomIdLov.uomId',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.priceQuantity`).d('价格批量'),
        name: 'priceBatch',
        type: 'number',
        defaultValue: 1,
        min: 0,
        max: '99999999999999999999',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemCode, secondaryUomId, uomId } = record.get([
              'itemCode',
              'secondaryUomId',
              'uomId',
            ]);
            if (itemCode && doubleUnitFlag && secondaryUomId !== uomId) {
              return true;
            } else {
              return false;
            }
          },
          required({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemCode, secondaryUomId, uomId } = record.get([
              'itemCode',
              'secondaryUomId',
              'uomId',
            ]);
            if (itemCode && doubleUnitFlag && secondaryUomId !== uomId) {
              return false;
            } else {
              return true;
            }
          },
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get(`ssrc.rf.model.rf.taxRate`).d('税率（%）'),
        name: 'taxIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.TAX',
        // textField: 'taxRate',
        valueField: 'taxId',
        dynamicProps: {
          disabled({ record }) {
            return !record.get('taxIncludedFlag');
          },
          required({ record }) {
            return record.get('taxIncludedFlag');
          },
        },
      },
      {
        name: 'taxId',
        bind: 'taxIdLov.taxId',
        align: 'right',
      },
      {
        name: 'taxRate',
        bind: 'taxIdLov.taxRate',
        align: 'right',
      },
      {
        name: 'taxCode',
        bind: 'taxIdLov.taxCode',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: 'YYYY-MM-DD',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderOffer',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.prNum`).d('采购申请号'),
        name: 'prNum',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.prLineNum`).d('采购申请行号'),
        name: 'prDisplayLineNum',
      },
      {
        name: 'projectTaskId',
        label: intl.get('ssrc.common.model.common.projectTaskNme').d('项目任务名称'),
        lovCode: 'SIEC.PROJECT_TASK_TREE',
        type: 'object',
        textField: 'taskName',
        valueField: 'taskId',
        optionsProps: {
          childrenField: 'children',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        transformRequest: (value = {}) => {
          return value?.taskId || null;
        },
        transformResponse: (value) => {
          return value
            ? {
                taskId: value,
              }
            : null;
        },
        lovPara: {
          businessObjectCode: 'SRM_C_SRM_SSRC_RF_HEADER',
        },
        dynamicProps: {
          disabled({ record }) {
            return Number(record.get('projectTaskDisableFlag')) === 1;
          },
        },
      },
      {
        name: 'projectTaskName',
        bind: 'projectTaskId.taskName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.attachmentUuid`).d('附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rf-rfitem',
      },
    ],
    events: {
      update: ({ record, name, value = {}, dataSet }) => {
        const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
        if (name === 'ouIdLov') {
          record.set('invOrganizationName', null);
          record.set('invOrganizationId', null);
          record.set('itemId', null);
          record.set('itemName', null);
          record.set('itemCode', null);
        } else if (name === 'invOrganizationIdLov') {
          record.set('itemId', null);
          record.set('itemName', null);
          record.set('itemCode', null);
        } else if (name === 'itemIdLov') {
          if (value) {
            record.set('itemCategoryId', value.categoryId);
            record.set('itemCategoryName', value.categoryName);
            record.set('uomId', value.orderUomId || value.primaryUomId);
            record.set('uomName', value.orderUomName || value.uomName);
            if (doubleUnitFlag) {
              record.set('secondaryUomIdLov', {
                secondaryUomId: value.secondaryUomId || value.orderUomId || value.primaryUomId,
                secondaryUomName: value.secondaryUomName || value.orderUomName || value.uomName,
              });
              record.set(
                'secondaryUomId',
                value.secondaryUomId || value.orderUomId || value.primaryUomId
              );
              record.set(
                'secondaryUomName',
                value.secondaryUomName || value.orderUomName || value.uomName
              );
              if (record.get('secondaryUomId') !== record.get('uomId')) {
                record.set('priceBatch', 1);
              }
            } else {
              record.set('secondaryUomIdLov', {
                secondaryUomId: value.orderUomId || value.primaryUomId,
                secondaryUomName: value.orderUomName || value.uomName,
              });
              record.set('secondaryUomId', value.orderUomId || value.primaryUomId);
              record.set('secondaryUomName', value.orderUomName || value.uomName);
            }
          } else if (!value) {
            record.set('itemCategoryId', null);
            record.set('itemCategoryName', null);
            record.set('uomId', null);
            record.set('uomName', null);
            record.set('secondaryUomId', null);
            record.set('secondaryUomName', null);
          }

          record.set({
            itemName: value?.itemName ?? null,
          });
        } else if (name === 'taxIncludedFlag') {
          record.set('taxId', null);
          record.set('taxRate', null);
        } else if (name === 'sectionCode') {
          const data = (ds?.current?.get('sectionList') || []).filter(
            (item) => item.sectionCode === record.get('sectionCode')
          );
          if (data.length > 0) {
            record.set('rfLineSectionId', data[0].rfLineSectionId);
            record.set('sectionName', data[0].sectionName);
          } else {
            record.set('rfLineSectionId', '');
            record.set('sectionName', '');
          }
        } else if (name === 'secondaryUomIdLov') {
          if (doubleUnitFlag && !record.get('itemId')) {
            record.set('secondaryUomId', (value || {}).uomId || null);
            record.set('secondaryUomName', (value || {}).uomCodeAndName || null);
            record.set('uomId', (value || {}).uomId || null);
            record.set('uomName', (value || {}).uomCodeAndName || null);
          }
        }
      },
    },
    transport: {
      read: () => ({
        url: `${SRM_SSRC}/v1/${organizationId}/rf/items`,
        method: 'GET',
        data: {
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.LINE_ITEM_${sourceCategory}`,
        },
      }),
      destroy: () => ({
        url: `${SRM_SSRC}/v1/${organizationId}/rf/items`,
        method: 'DELETE',
      }),
      submit: () => ({
        url: `${SRM_SSRC}/v1/${organizationId}/rf/items`,
        method: 'POST',
        params: {
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.LINE_ITEM_${sourceCategory}`,
        },
      }),
    },
  };
};

const noticeDS = ({ rfHeaderId, sourceCategory, basicFormDs }) => {
  return {
    autoQuery: true,
    dataToJSON: 'all',
    paging: false,
    fields: [
      {
        label: intl.get('ssrc.rf.model.rf.noticeTitle').d('公告标题'),
        name: 'noticeTitle',
        required: basicFormDs?.current?.get('sourceMethod') !== 'INVITE',
      },
      {
        name: 'noticeDays',
        label: intl.get('ssrc.rf.model.rf.noticeDays').d('公告天数'),
        type: 'number',
        min: 0,
        defaultValue: 30,
        required: basicFormDs?.current?.get('sourceMethod') !== 'INVITE',
      },
      {
        name: 'noticeAttachmentUuid',
        label: intl.get(`ssrc.rf.model.rf.noticeAttachment`).d('公告附件'),
      },
      {
        name: 'noticePreview',
        label: intl.get('ssrc.rf.model.rf.noticePreview').d('公告预览'),
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SSRC}/v1/${organizationId}/source-notices/${sourceCategory}/BR/${rfHeaderId}`,
        method: 'GET',
        data: {
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.NOTICES_${sourceCategory}`,
        },
      }),
    },
  };
};

const ruleFormDS = ({ rfHeaderId, sourceCategory }) => ({
  autoQuery: true,
  paging: false,
  dataToJSON: 'all',
  fields: [
    {
      name: 'expertScoreType',
      lookupCode: 'SSRC.EXPERT_SCORE_TYPE',
      label: intl.get('ssrc.rf.model.rf.expertScoreType').d('专家评分'),
      defaultValue: 'NONE',
      help: intl
        .get('ssrc.rf.model.rf.score.chooseTip')
        .d(
          '选择了线上专家评分，该方案邀请书在供应商回复后会进入专家评分环节，评分后会将分数显示在确定入围名单环节。'
        ),
    },
    {
      label: intl.get(`ssrc.rf.model.rf.startFlag`).d('发布即开始'),
      name: 'startFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'quotationRunningDuration',
      type: 'number',
    },
    {
      name: 'quotationDay',
      type: 'number',
      placeholder: intl.get('ssrc.rf.view.rf.startQuotationRunningDayDuration').d('运行时间(天)'),
      step: 1,
      min: 0,
      defaultValidationMessages: { valueMissingNoLabel: '' },
      dynamicProps: {
        required({ record }) {
          const startFlag = record.get('startFlag');
          const quotationHour = record.get('quotationHour');
          const quotationMinute = record.get('quotationMinute');
          const quotationDay = record.get('quotationDay');

          return startFlag && !quotationHour && !quotationMinute && !quotationDay;
        },
      },
    },
    {
      name: 'quotationHour',
      type: 'number',
      step: 1,
      min: 0,
      defaultValidationMessages: { valueMissingNoLabel: '' },
      dynamicProps: {
        required({ record }) {
          const startFlag = record.get('startFlag');
          const quotationHour = record.get('quotationHour');
          const quotationMinute = record.get('quotationMinute');
          const quotationDay = record.get('quotationDay');
          return startFlag && !quotationHour && !quotationMinute && !quotationDay;
        },
      },
    },
    {
      name: 'quotationMinute',
      type: 'number',
      step: '0.1',
      min: 0,
      dynamicProps: {
        required({ record }) {
          const startFlag = record.get('startFlag');
          const quotationHour = record.get('quotationHour');
          const quotationMinute = record.get('quotationMinute');
          const quotationDay = record.get('quotationDay');
          return startFlag && !quotationHour && !quotationMinute && !quotationDay;
        },
      },
    },
    {
      label:
        sourceCategory === 'RFP'
          ? intl.get(`ssrc.rf.model.rf.answerStartTime`).d('回复开始时间')
          : intl.get(`ssrc.rf.model.rf.quotationStartTime`).d('征询开始时间'),
      name: 'quotationStartDate',
      type: 'dateTime',
      format: getDateTimeFormat(),
      dynamicProps: {
        required({ record }) {
          return !record.get('startFlag');
        },
        min({ record }) {
          return !record.get('startFlag') && new Date();
        },
      },
    },
    {
      label:
        sourceCategory === 'RFP'
          ? intl.get(`ssrc.rf.model.rf.answerDeadline`).d('回复截止时间')
          : intl.get(`ssrc.rf.model.rf.quotationDeadline`).d('征询截止时间'),
      name: 'quotationEndDate',
      type: 'dateTime',
      format: getDateTimeFormat(),
      dynamicProps: {
        required({ record }) {
          return !record.get('startFlag');
        },
        min({ record }) {
          return !record.get('startFlag') && record.get('quotationStartDate');
        },
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.currency`).d('币种'),
      name: 'currencyLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
      textField: 'currencyCode',
      valueField: 'currencyCode',
      dynamicProps: {
        required({ record }) {
          return record.get('lineItemsFlag');
        },
      },
    },
    {
      name: 'currencyCode',
      bind: 'currencyLov.currencyCode',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.multiCurrency`).d('允许多币种报价'),
      name: 'multiCurrencyFlag',
      type: 'boolean',
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      transformResponse: (value) => (value ? 1 : 0),
    },
    {
      label: intl.get(`ssrc.rf.model.rf.bidRuleType`).d('标书规则'),
      lookupCode: 'SSRC.BID_RULE_TYPE',
      name: 'bidRuleType',
      defaultValue: 'NONE',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.openBidOrder`).d('评标步制'),
      lookupCode: 'SSRC.OPEN_BID_ORDER',
      name: 'openBidOrder',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.scoreType`).d('评分方式'),
      lookupCode: 'SSRC.TEMPLATE_SCORE_TYPE',
      name: 'scoreType',
    },
    {
      name: 'templateLov',
      label: intl.get(`ssrc.inquiryHall.view.button.referTemplate`).d('参考模板'),
      type: 'object',
      lovCode: 'SSRC.SCORE_TEMPL',
      dynamicProps: {
        lovPara({ record }) {
          const bidRuleType = record.get('bidRuleType');
          const scoreType = record.get('scoreType') || null;
          return {
            enabledFlag: 1,
            scoreMode: bidRuleType,
            templatePurpose: 'EXPERT_SCORE',
            scoreTemplateScoreType: scoreType, // 模板评分类型,WEIGHT/SCORE/SCORE_NEW
          };
        },
      },
    },
    {
      name: 'scoreTemplateCode',
      bind: 'templateLov.templateCode',
    },
    {
      name: 'scoreTemplateId',
      bind: 'templateLov.templateId',
    },
    // 权重
    {
      name: 'technologyWeight',
      type: 'number',
      step: 0.01,
      precision: 2,
      min: 0.01,
      max: 100,
    },
    {
      name: 'businessWeight',
      type: 'number',
      step: 0.01,
      precision: 2,
      min: 0.01,
      max: 100,
    },
    {
      label: intl.get(`ssrc.rf.model.rf.clarifyEndDate`).d('澄清截止时间'),
      name: 'clarifyEndDate',
      type: 'dateTime',
      format: getDateTimeFormat(),
      min: new Date(),
    },
    {
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.replyMethod`).d('回复方式'),
      lookupCode: 'SSRC.RF_REPLY_TYPE',
      name: 'replyType',
      required: true,
    },
  ],
  events: {
    load: ({ dataSet }) => {
      // 设置报价运行时间
      // eslint-disable-next-line no-unused-expressions
      dataSet?.records?.forEach((record) => {
        const quotationRunningDuration = record.get('quotationRunningDuration');
        if (quotationRunningDuration === null) return;
        const quoteDay = Math.floor(quotationRunningDuration / 1440);
        const quoteHour =
          quoteDay > 0
            ? Math.floor((quotationRunningDuration - quoteDay * 1440) / 60)
            : quotationRunningDuration
            ? Math.floor(quotationRunningDuration / 60)
            : quotationRunningDuration;
        const quoteMinute =
          quoteHour > 0 || quoteDay > 0
            ? quotationRunningDuration - quoteDay * 1440 - quoteHour * 60
            : quotationRunningDuration;

        record.set('quotationDay', quoteDay || null);
        record.set('quotationHour', quoteHour || null);
        record.set('quotationMinute', quoteMinute || null);
      });
    },
  },
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/rule`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.CONF_RULE_${sourceCategory},SSRC.INQUIRY_HALL.RF_EDIT.CONF_RULE_STAGE_${sourceCategory},SSRC.INQUIRY_HALL.RF_EDIT.SCORE_RULE_${sourceCategory},SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_CONFIG_${sourceCategory}`,
      },
    }),
  },
});

const supplierTableDS = ({ rfHeaderId, sourceCategory, basicFormDs }) => ({
  primaryKey: 'rfLineSupplierId',
  autoQuery: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'supplierCompanyId',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.supplierCompanyNum`).d('供应商编码'),
      name: 'supplierCompanyNum',
    },
    {
      name: 'supplierTenantId',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.lifeCycle`).d('生命周期阶段'),
      name: 'stageDescription',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.contacts`).d('联系人'),
      name: 'contactNameLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSRC.SUPPLIER_CONTANCTS',
      textField: 'contactName',
      valueField: 'supplierContactId',
      dynamicProps: {
        lovPara({ record }) {
          const supplierCompanyId = record.get('supplierCompanyId');

          return {
            supplierCompanyId,
            tenantId: organizationId,
            companyId: basicFormDs?.current?.get('companyId'),
          };
        },
      },
    },
    {
      name: 'supplierContactId',
      bind: 'contactNameLov.supplierContactId',
    },
    {
      name: 'contactName',
      bind: 'contactNameLov.contactName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.contactPhone`).d('联系电话'),
      name: 'contactPhone',
      required: true,
      type: 'tel',
      regionField: 'internationalTelCode',
      dynamicProps: {
        pattern: ({ record }) => {
          return record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE;
        },
      },
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      required: true,
    },
    {
      label: intl.get(`ssrc.rf.model.rf.email`).d('电子邮件'),
      name: 'contactMail',
      required: true,
      validator: (value, _, record) => {
        if (value && !EMAIL.test(record.get('contactMail'))) {
          return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
        }
        return true;
      },
    },
  ],
  events: {
    update: ({ name, record = {}, value = {} }) => {
      if (name === 'contactNameLov') {
        const {
          mobilephone = null,
          mail = null,
          name: contactName = null,
          companyContactId = null,
          internationalTelCode = null,
        } = value || {};
        record.set('contactPhone', mobilephone);
        record.set('internationalTelCode', internationalTelCode);
        record.set('contactMail', mail);
        record.set('contactName', contactName);
        record.set('supplierContactId', companyContactId);
      } else if (name === 'internationalTelCode') {
        // 设置自身 为了触发自定义校验
        record.set('contactPhone', record.get('contactPhone'));
      }
    },
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/suppliers`,
        method: 'GET',
        data: {
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.LINE_SUPPLIER_${sourceCategory}`,
        },
      };
    },
    destroy: () => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/suppliers`,
        method: 'DELETE',
      };
    },
    submit: () => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/suppliers`,
        method: 'POST',
        params: {
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.LINE_SUPPLIER_${sourceCategory}`,
        },
      };
    },
  },
});

const ladderQuotationTableDS = () => ({
  primaryKey: 'ladderInquiryId',
  paging: false,
  fields: [
    {
      name: 'rfLadderLineNum',
      type: 'string',
      label: intl.get('ssrc.rf.model.rf.rfLadderLineNum').d('行号'),
    },
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: intl.get('ssrc.rf.model.rf.ladderFromRange').d('数量从（>=）'),
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('doubleUnitFlag'),
      },
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: intl.get('ssrc.rf.model.rf.ladderToRange').d('数量至(<)'),
      dynamicProps: {
        required: ({ record, dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag && record.index < dataSet.length - 1;
        },
      },
    },
    {
      // 开启双单位显示-基本数量从 不开启显示-数量从
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return `${getLadderFrom(doubleUnitFlag)} (>=)`;
        },
        required: ({ dataSet }) => !dataSet.getState('doubleUnitFlag'),
        disabled: ({ dataSet }) => dataSet.getState('doubleUnitFlag'),
      },
    },
    {
      // 开启双单位显示-基本数量至 不开启显示-数量至
      name: 'ladderTo',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return `${getLadderTo(doubleUnitFlag)} (<)`;
        },
        required: ({ record, dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return !doubleUnitFlag && record.index < dataSet.length - 1;
        },
        disabled: ({ dataSet }) => dataSet.getState('doubleUnitFlag'),
      },
    },
    {
      name: 'ladderRemark',
      type: 'string',
      label: intl.get('ssrc.rf.model.rf.remark').d('备注'),
    },
  ],

  events: {
    // load: ({ dataSet }) => {
    //   const { records } = dataSet;
    //   records.forEach((record = {}) => {
    //     const ladderInquiryId = record.get('ladderInquiryId');
    //     const rfLadderLineNum = record.get('rfLadderLineNum');
    //     if (ladderInquiryId && rfLadderLineNum < records.length) {
    //       Object.assign(record, { selectable: false });
    //     }
    //   });
    // },
  },

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { rfLineItemId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfLineItemId}/ladder-inquiry`,
        method: 'GET',
      };
    },
    submit: ({ dataSet }) => {
      const {
        queryParameter: { rfLineItemId },
        records,
      } = dataSet;
      const dataSource = records.map((i, index) => ({ ...i.toData(), rfLadderLineNum: index + 1 }));
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfLineItemId}/ladder-inquiry`,
        method: 'POST',
        data: dataSource,
      };
    },
    destroy: ({ data }) => {
      // const { records } = dataSet;
      // if (data[0]?.rfLadderLineNum < records?.length) {
      //   notification.warning({
      //     message: intl
      //       .get(`ssrc.rf.model.rf.onlySelectedLast`)
      //       .d('只能从最后一行已保存行开始删除!'),
      //   });
      //   return;
      // }
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/ladder-inquiry`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const rfFormDS = ({ rfHeaderId, sourceCategory }) => ({
  autoQuery: true,
  paging: false,
  // dataKey: null,
  fields: [
    {
      name: 'rfContent',
      label: intl.get('ssrc.rf.model.rf.rfContent').d('内容'),
      maxLength: 5000,
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/form`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.FORM_${sourceCategory}`,
      },
    },
  },
});

// 专家
const expertTableDS = ({ ruleFormDs, rfHeaderId, sourceCategory }) => {
  return {
    autoQuery: true,
    primaryKey: 'rfExpertId',
    paging: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.rf.model.rf.expertSubAccount`).d('专家子账户'),
        name: 'expertLov',
        type: 'object',
        ignore: 'always',
        textField: 'loginName',
        valueField: 'id',
        lovCode: 'SSRC.EXPERT_SUB_ACCOUNT',
        lovPara: { tenantId: getCurrentTenant().tenantId },
        required: true,
      },
      {
        name: 'loginName',
        bind: 'expertLov.loginName',
      },
      {
        name: 'expertUserId',
        bind: 'expertLov.id',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.expertName`).d('专家姓名'),
        name: 'expertName',
        bind: 'expertLov.realName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.expertRole`).d('职责'),
        name: 'expertRole',
        required: true,
        lookupCode: 'SSRC.EXPERT_DUTY',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.currentScoringType`).d('本次评分类别'),
        name: 'scoreCategory',
        lookupCode: 'SSRC.EXPERT_TEAM',
        required: ruleFormDs.current?.get('bidRuleType') === 'NONE',
        dynamicProps: {
          defaultValue: () =>
            ruleFormDs.current?.get('bidRuleType') === 'NONE' ? 'BUSINESS_TECHNOLOGY' : null,
          required: () => ruleFormDs.current?.get('bidRuleType') === 'DIFF',
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.expertType`).d('专家类型'),
        name: 'expertType',
        lookupCode: 'SSRC.EXPERT_TYPE',
        defaultValue: 'INTERNAL',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.rfxPhone`).d('联系电话'),
        name: 'phone',
        bind: 'expertLov.phone',
      },
      {
        name: 'internationalTelCode',
        lookupCode: 'HPFM.IDD',
        bind: 'expertLov.internationalTelCode',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.rfxEmail`).d('电子邮箱'),
        name: 'email',
        bind: 'expertLov.mail',
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/experts`,
        method: 'GET',
        data: {
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_EXPERTS_${sourceCategory}`,
        },
      }),
      destroy: () => {
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/experts`,
          method: 'DELETE',
        };
      },
      submit: ({ data }) => ({
        url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/experts`,
        method: 'POST',
        data,
      }),
    },
  };
};

const scoringElementDS = ({ expertCategory, ruleFormDs, rfHeaderId, customizeUnitCode }) => {
  return {
    autoQuery: true,
    primaryKey: 'rfIndicateId',
    idField: 'rfIndicateId',
    parentField: 'parentRfIndicateId',
    expandField: 'expand',
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.rf.model.rf.indicateCode`).d('要素编码'),
        name: 'indicateLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.SCORE_INDIC',
        textField: 'indicateCode',
        valueField: 'indicateId',
        dynamicProps: {
          lovPara() {
            return {
              expertCategory,
              // indicateType: 'SCORE',
            };
          },
        },
      },
      {
        name: 'indicateCode',
        dynamicProps: {
          bind: ({ record }) =>
            record.get('parentRfIndicateId') === null && 'indicateLov.indicateCode',
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.indicateName`).d('要素名称'),
        name: 'indicateName',
        maxLength: 200,
        required: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateTypeMeaning`).d('要素类型'),
        name: 'indicateType',
        type: 'string',
        lookupCode: 'SSRC.INDICATE_TYPE',
        dynamicProps: {
          required({ record }) {
            return record?.get('parentRfIndicateId') === null && !record.children;
          },
          disabled({ record }) {
            return (
              (record?.get('parentRfIndicateId') === null && record.children) ||
              record?.get('parentRfIndicateId')
            );
          },
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.scoreRemark`).d('评分细则'),
        name: 'indicateRemark',
        maxLength: 1000,
      },
      {
        label: intl.get(`ssrc.rf.model.rf.weightPercent`).d('权重(%)'),
        name: 'indicateWeight',
        type: 'number',
        max: 100,
        min: 0.01,
        step: 0.01,
        precision: 2,
        validator: (value) => {
          if (value && (value <= 0 || value > 100)) {
            return intl
              .get(`ssrc.rf.model.rf.weightPercentRemind`)
              .d('权重范围必须大于0且小于或等于100');
          }
          return true;
        },
        dynamicProps: {
          required({ record }) {
            return (
              record.get('indicateType') !== 'PASS' &&
              ruleFormDs?.record?.get('scoreType') === 'WEIGHT'
            );
          },
          disabled({ record }) {
            return record.get('indicateType') === 'PASS';
          },
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.minScore`).d('最低分'),
        name: 'minScore',
        type: 'number',
        min: 0,
        step: 0.01,
        dynamicProps: {
          required({ record }) {
            // 当前为一级且只有一级或当前为二级
            return (
              record.get('indicateType') !== 'PASS' &&
              ((record?.get('parentRfIndicateId') === null && !record.children) ||
                record?.get('parentRfIndicateId')) &&
              ['SCORE', 'SCORE_NEW'].includes(ruleFormDs?.current?.get('scoreType'))
            );
          },
          disabled({ record }) {
            // 当前为一级且存在二级
            return (
              record.get('indicateType') === 'PASS' ||
              (record?.get('parentRfIndicateId') === null &&
                record.children &&
                ['SCORE', 'SCORE_NEW'].includes(ruleFormDs?.current?.get('scoreType')))
            );
          },
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.maxScore`).d('最高分'),
        name: 'maxScore',
        type: 'number',
        // max: 100,
        min: 'minScore',
        step: 0.01,
        dynamicProps: {
          required({ record }) {
            // 当前为一级且只有一级或当前为二级
            return (
              record.get('indicateType') !== 'PASS' &&
              ((record?.get('parentRfIndicateId') === null && !record.children) ||
                record?.get('parentRfIndicateId')) &&
              ['SCORE', 'SCORE_NEW'].includes(ruleFormDs?.current?.get('scoreType'))
            );
          },
          disabled({ record }) {
            // 当前为一级且存在二级
            return (
              record.get('indicateType') === 'PASS' ||
              (record?.get('parentRfIndicateId') === null &&
                record.children &&
                ['SCORE', 'SCORE_NEW'].includes(ruleFormDs?.current?.get('scoreType')))
            );
          },
        },
      },
    ],
    events: {
      select: ({ record }) => {
        const selectChildrenData = (item) => {
          const cascadeData = item.children;
          if (cascadeData) {
            // 如果是数组
            if (cascadeData.length > 0) {
              const selectedItem = cascadeData.find(
                (cascadeDataItem) => cascadeDataItem.isSelected
              );
              if (selectedItem) {
                return;
              }
              cascadeData.forEach((cascadeDataItem) => {
                // eslint-disable-next-line
                cascadeDataItem.isSelected = true;
                selectChildrenData(cascadeDataItem);
              });
            } else {
              // 单个对象
              cascadeData.isSelected = true;
              selectChildrenData(cascadeData);
            }
          }
        };
        selectChildrenData(record);
      },
      unSelect: ({ record }) => {
        const unSelectChildrenData = (item) => {
          const cascadeData = item.children;
          if (cascadeData) {
            // 如果是数组
            if (cascadeData.length > 0) {
              cascadeData.forEach((cascadeDataItem) => {
                // eslint-disable-next-line
                cascadeDataItem.isSelected = false;
                unSelectChildrenData(cascadeDataItem);
              });
            } else {
              // 单个对象
              cascadeData.isSelected = false;
              unSelectChildrenData(cascadeData);
            }
          }
        };

        const unSelectParentData = (item) => {
          const cascadeData = item.parent;
          if (cascadeData) {
            // 是否有同级数据已选中
            // const peer = cascadeData.children;
            // if (peer) {
            //   if (peer.length > 0) {
            //     const peerSelected = peer.find((peerItem) => peerItem.isSelected);
            //     if (!peerSelected) {
            //       cascadeData.isSelected = false;
            //       unSelectParentData(cascadeData);
            //     }
            //   } else {
            //     cascadeData.isSelected = false;
            //     unSelectParentData(cascadeData);
            //   }
            // } else {

            // }
            cascadeData.isSelected = false;
            unSelectParentData(cascadeData);
          }
        };
        unSelectChildrenData(record);
        unSelectParentData(record);
      },
      update: ({ dataSet, record = {}, name, value = {} }) => {
        if (name === 'indicateLov') {
          const {
            indicateName,
            indicateId,
            indicateCode,
            minScore = null,
            maxScore = null,
            weight,
            remark,
            indicateType,
            scoreIndicList = [],
          } = value || {};
          record.set('indicateName', indicateName);
          record.set('indicateId', indicateId);
          record.set('indicateCode', indicateCode);
          record.set('indicateType', indicateType);
          record.set('minScore', minScore);
          record.set('maxScore', maxScore);
          record.set('indicateWeight', weight);
          record.set('indicateRemark', remark);

          // 切换要素lov，清空二级要素
          if (record.children) {
            dataSet.delete(record.children, false);
          }

          // 根据一级要素创建二级要素
          // eslint-disable-next-line no-unused-expressions
          scoreIndicList?.forEach((i, index) => {
            // 一级是新建行
            if (record.get('tempIndicateId')) {
              const key = uuid();
              const data = {
                ...i,
                rfIndicateId: key,
                parentRfIndicateId: record.get('rfIndicateId'), // 一级细项标记
                tempIndicateId: key, // 新建给后端父子结构的标记字段
                tempParentIndicateId: record.get('rfIndicateId'),
                indicateRemark: i.remark,
              };
              dataSet.create(data, index);
            } else {
              const data = {
                ...i,
                parentRfIndicateId: record.get('rfIndicateId'), // 一级细项标记
              };
              dataSet.create(data, index);
            }
          });
        }
      },
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/indicates`,
          method: 'GET',
          data: {
            scoreCategory: expertCategory,
            customizeUnitCode,
          },
        };
      },
      submit: ({ data }) => {
        // 处理新增数据主键问题
        const newData = data?.map((i) => {
          const { rfIndicateId, parentRfIndicateId, ...others } = i;
          if (i.tempIndicateId) {
            return { ...others, scoreCategory: expertCategory };
          }
          return { ...i, scoreCategory: expertCategory };
        });
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/indicates`,
          method: 'POST',
          data: newData,
        };
      },
      destroy: () => {
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/indicates`,
          method: 'DELETE',
        };
      },
    },
  };
};

const expertModalDS = ({ rfHeaderId, sourceCategory }) => {
  return {
    primaryKey: 'indicAssginId',
    paging: false,
    selection: false,
    forceValidate: true,
    fields: [
      {
        label: intl.get(`ssrc.rf.model.rf.expertSubAccount`).d('专家子账户'),
        name: 'loginName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.expertName`).d('专家姓名'),
        name: 'expertName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.whetherAssign`).d('是否分配'),
        name: 'assignFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get('ssrc.rf.model.rf.expertWeight').d('专家权重'),
        name: 'expertWeight',
        type: 'number',
        precision: 2,
        validator: (value) => {
          if (!isNil(value) && (value <= 0 || value >= 100)) {
            return intl
              .get(`ssrc.rf.model.rf.expertWeightRemind`)
              .d('仅允许输入大于0且小于100的最多两位小数的数字');
          }
          return true;
        },
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { rfIndicateId = null },
        } = dataSet;

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/expert-assign`,
          method: 'GET',
          data: {
            rfIndicateId,
            customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_ASSIGN_${sourceCategory}`,
          },
        };
      },
      submit: ({ data }) => ({
        url: `${SRM_SSRC}/v1/${organizationId}/rf/expert-assign`,
        method: 'PUT',
        params: {
          rfHeaderId,
          // customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.MEMBER_${sourceCategory}`,
        },
        data,
      }),
    },
  };
};

export {
  basicFormDS,
  sourceGroupDS,
  rfItemLineDS,
  ruleFormDS,
  supplierTableDS,
  noticeDS,
  ladderQuotationTableDS,
  rfFormDS,
  expertTableDS,
  scoringElementDS,
  expertModalDS,
};
