import React from 'react';
import { isEmpty, omit, noop, isArray, isNil } from 'lodash';
import { Tooltip } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Prefix, getDocumentTypeName } from '@/utils/globalVariable';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import { PRIVATE_BUCKET } from '_utils/config';
import { getQtyName, getUomName } from '@/utils/utils';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

import { batchUpdateLines } from './utils/utils';

const ItemLineTableDS = (props) => {
  const { doubleUnitFlag = false, bidFlag = false, getBatchUpdateFlag = noop, rfxInfoDS = {} } =
    props || {};

  /**
   * 从头ds中批量获取值
   */
  const getHeaderDsFieldsValue = (fields = []) => {
    const { current } = rfxInfoDS || {};
    let values = {};

    if (!current || isEmpty(fields)) {
      return values;
    }

    values = current.get(fields);
    return values;
  };

  return {
    primaryKey: 'rfxLineItemId',
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        valueField: 'ouId',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return record.get('prHeaderId') || allowChangeItemsFlag;
          },
          lovPara({ dataSet }) {
            const { companyId = null } = dataSet.queryParameter.headers || {};
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'HPFM.INV_ORG',
        textField: 'organizationName',
        valueField: 'organizationId',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return record.get('prHeaderId') || allowChangeItemsFlag;
          },
          lovPara({ dataSet, record }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            const { companyId = null } = dataSet.queryParameter.headers || {};
            return {
              ouId: record.get('ouId'),
              companyId,
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.NEW_CUSTOMER_ITEM',
        textField: 'itemCode',
        valueField: 'itemId',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return record.get('prHeaderId') || allowChangeItemsFlag;
          },
          lovPara({ dataSet, record }) {
            const { companyId = null } = dataSet.queryParameter.company || {};
            const {
              templateNum,
              expandResultsFlag,
              resultsExpandingHierarchy,
              resultsExpandingDimensions,
            } =
              rfxInfoDS?.current?.get([
                'templateNum',
                'expandResultsFlag',
                'resultsExpandingHierarchy',
                'resultsExpandingDimensions',
              ]) || {};
            const expandCompany =
              resultsExpandingDimensions !== 'ITEM_LINE'
                ? rfxInfoDS?.current?.get('expandCompany')
                : record.get('expandCompany');
            const expandInvOrganization =
              resultsExpandingDimensions !== 'ITEM_LINE'
                ? rfxInfoDS?.current?.get('expandInvOrganization')
                : record.get('expandInvOrganization');
            const commonParams = {
              ouId: record.get('ouId'),
              invOrganizationId: record.get('invOrganizationId'),
              companyId,
              asyncCountFlag: 'Y',
              from: 'ITEM_LIMIT',
              templateNum,
            };
            if (expandResultsFlag !== 1) {
              return commonParams;
            }

            if (expandResultsFlag === 1) {
              // 拓展公司需要考虑单选和多选的情况
              const _expandCompany = isArray(expandCompany)
                ? (expandCompany || []).map((item) => item.companyId).join(',')
                : expandCompany?.companyId;
              const _expandInvOrganization =
                expandInvOrganization &&
                (expandInvOrganization || []).map((item) => item.organizationId).join(',');
              return {
                ...commonParams,
                expandCompany: _expandCompany,
                expandInvOrganization:
                  resultsExpandingHierarchy === 'INV_ORGANIZATION'
                    ? _expandInvOrganization
                    : undefined,
              };
            }
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        type: 'string',
        maxLength: 600,
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return record.get('prHeaderId') || allowChangeItemsFlag;
          },
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return !allowChangeItemsFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        name: 'specs',
        type: 'string',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return record.get('prHeaderId') || allowChangeItemsFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        textField: 'categoryName',
        valueField: 'categoryId',
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
                };
              },
            ],
          };
        },
        dynamicProps: {
          required({ dataSet }) {
            const { allowChangeItemsFlag = 0, matchRestrictFlag = 0 } =
              dataSet.queryParameter.headers || {};
            return matchRestrictFlag || !allowChangeItemsFlag;
          },
          lovPara({ dataSet, record }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            const { companyId = null } = dataSet.queryParameter.company || {};
            return {
              tenantId: organizationId,
              itemId: record.get('itemId'),
              companyId,
              businessObjectCode: bidFlag
                ? 'SRM_C_SRM_SSRC_BID_HEADER'
                : 'SRM_C_SRM_SSRC_RFX_HEADER',
            };
          },
          disabled({ dataSet }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return allowChangeItemsFlag;
          },
          optionsProps({ dataSet }) {
            const lovCode = dataSet.getField('itemCategoryIdLov')?.get('lovCode');
            let otherProps = {};
            if (lovCode === 'SMDM.TREE_ITEM_CATEGORY') {
              // 返回直接是树形
              otherProps = {
                childrenField: 'children',
                parentIdField: 'parentCategoryId',
              };
            } else if (lovCode === 'SMDM.TREE_ITEM_CATEGORY_TILED_NEW') {
              otherProps = {
                parentField: 'parentCategoryId',
                record: {
                  // 针对于SMDM.TREE_ITEM_CATEGORY_TILED_NEW这个值集，只能选择最后一级
                  dynamicProps: {
                    selectable: (record) => record.get('isCheck') !== false,
                  },
                },
              };
            } else {
              otherProps = {
                parentField: 'parentCategoryId',
                record: {
                  dynamicProps: {
                    selectable: (record) => record.get('isCheck') !== false,
                  },
                },
              };
            }
            return {
              paging: 'server',
              ...otherProps,
              events: {
                load: ({ dataSet: lovDataSet }) => {
                  const { current } = lovDataSet.queryDataSet || {};
                  if (!isEmpty(omit(current.toData(), '__dirty'))) {
                    lovDataSet.forEach((record = {}) => {
                      Object.assign(record, { isExpanded: true });
                    });
                  }
                },
              },
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
        min: '0.000001',
        step: 0,
        max: '99999999999999999999',
        dynamicProps: {
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const flag = doubleUnitFlag && !allowChangeItemsFlag;
            return flag;
          },
          disabled: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return allowChangeItemsFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomIdLov',
        type: 'object',
        ignore: 'always',
        textField: 'uomName',
        valueField: 'uomId',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const { setting000112 = null } = dataSet.queryParameter.settings || {};
            return (setting000112 === '1' && record.get('itemCode')) || allowChangeItemsFlag;
          },
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return !allowChangeItemsFlag && doubleUnitFlag;
          },
          lovCode: ({ record }) => {
            return props?.doubleUnitFlag && record?.get('itemId')
              ? 'SMDM_ITEM_ORG_UOM'
              : 'SSRC.UOM';
          },
          lovPara: ({ record }) => {
            return props?.doubleUnitFlag && record?.get('itemId')
              ? { itemId: record?.get('itemId'), primaryUomId: record.get('uomId') }
              : {};
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
        // label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
        name: 'rfxQuantity',
        type: 'number',
        step: 0,
        max: '99999999999999999999',
        dynamicProps: {
          label: () => {
            return getQtyName(doubleUnitFlag);
          },
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const flag = !doubleUnitFlag && !allowChangeItemsFlag;
            return flag;
          },
          disabled: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const flag = allowChangeItemsFlag || doubleUnitFlag;
            return flag;
          },
        },
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        name: 'uomIdLov',
        type: 'object',
        ignore: 'always',
        textField: 'uomName',
        valueField: 'uomId',
        lovCode: 'SSRC.UOM',
        dynamicProps: {
          label: () => {
            return getUomName(doubleUnitFlag);
          },
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const { setting000112 = null } = dataSet.queryParameter.settings || {};
            const flag =
              (setting000112 === '1' && record.get('itemCode')) ||
              allowChangeItemsFlag ||
              doubleUnitFlag;
            return flag;
          },
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return !allowChangeItemsFlag && !doubleUnitFlag;
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        name: 'batchPrice',
        align: 'right',
        type: 'number',
        defaultValue: 1,
        step: 0,
        min: '0',
        max: '99999999999999999999',
        dynamicProps: {
          required: ({ record }) => {
            const { itemId, uomId, secondaryUomId } = record.get([
              'itemId',
              'uomId',
              'secondaryUomId',
            ]);
            return !(doubleUnitFlag && itemId && secondaryUomId && uomId !== secondaryUomId);
          },
          disabled: ({ record }) => {
            // const { doubleUnitFlag = false } = props;
            const { itemId, uomId, secondaryUomId } = record.get([
              'itemId',
              'uomId',
              'secondaryUomId',
            ]);
            return doubleUnitFlag && itemId && secondaryUomId && uomId !== secondaryUomId;
          },
        },
        // dynamicProps: {
        //   required: ({ dataSet }) => {
        //     const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
        //     return !allowChangeItemsFlag;
        //   },
        // },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          defaultValue({ dataSet }) {
            const { templateTaxIncludedFlag = 0 } = dataSet.queryParameter?.headers || {};
            return templateTaxIncludedFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.TAX',
        valueField: 'taxId',
        dynamicProps: {
          disabled({ record }) {
            return !record.get('taxIncludedFlag');
          },
          required({ record, dataSet }) {
            const { taxChangeFlag = 0 } = dataSet.queryParameter?.headers || {};
            const taxIncludedFlag = record.get('taxIncludedFlag');
            const flag = !taxChangeFlag && taxIncludedFlag;
            return flag;
          },
        },
      },
      {
        name: 'taxId',
        bind: 'taxIdLov.taxId',
      },
      {
        name: 'taxRate',
        bind: 'taxIdLov.taxRate',
      },
      {
        name: 'taxCode',
        bind: 'taxIdLov.taxCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: 'YYYY-MM-DD',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startLadderLevel`).d('启用阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'boolean',
        align: 'center',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderOffer',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTemplate`).d('报价模板'),
        name: 'quotationTemplateIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.QUOTATION_TEMPLATE',
        textField: 'templateName',
        valueField: 'quotationTemplateId',
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              tenantId: organizationId,
            };
          },
        },
      },
      {
        name: 'quotationTemplateId',
        bind: 'quotationTemplateIdLov.templateId',
      },
      {
        name: 'templateName',
        bind: 'quotationTemplateIdLov.templateName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        name: 'quotationDetail',
      },
      {
        label: (
          <Tooltip
            title={intl
              .get(`ssrc.inquiryHall.view.message.floatingMoneyDetail`)
              .d('浮动方式：最小价格幅度的计算按照金额或者比率！')}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式')}
          </Tooltip>
        ),
        name: 'floatType',
        type: 'string',
        // lookupCode: 'SSRC.FLOAT_TYPE',
        defaultValue: 'money',
        computedProps: {
          lookupCode({ dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = dataSet.getState('newBiddingFlag');
            return newBiddingFlag ? 'SSRC.BIDDING_FLOAT_TYPE' : 'SSRC.FLOAT_TYPE';
          },
          // defaultValue() {
          //   // const newBiddingFlag = dataSet.getState('newBiddingFlag');
          //   // return newBiddingFlag ? 'money' : '';
          //   return 'money';
          // },
        },
      },
      {
        label: (
          <Tooltip
            title={intl
              .get(`ssrc.inquiryHall.view.message.floatingRatioDetail`)
              .d('报价幅度：最小价格幅度，下次报价至少符合此价格浮动范围！')}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}
          </Tooltip>
        ),
        name: 'quotationRange',
        type: 'number',
        min: 0,
        max: 9999999999,
        dynamicProps: {
          disabled({ record }) {
            return !record.get('floatType');
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        name: 'prNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        name: 'prDisplayLineNum',
        type: 'string',
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
        dynamicProps: {
          disabled({ record }) {
            return Number(record.get('projectTaskDisableFlag')) === 1;
          },
          lovPara() {
            return {
              businessObjectCode: bidFlag
                ? 'SRM_C_SRM_SSRC_BID_HEADER'
                : 'SRM_C_SRM_SSRC_RFX_HEADER',
            };
          },
        },
      },
      {
        name: 'projectTaskName',
        bind: 'projectTaskId.taskName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.RFxAttachment`).d('询价单附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
        ...(ChunkUploadProps || {}),
        dynamicProps: {
          label() {
            const documentTypeName = getDocumentTypeName(bidFlag);
            return intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commonRFxAttachment`, { documentTypeName })
              .d('{documentTypeName}附件');
          },
        },
      },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.filterSupplier`).d('筛选供应商'),
      //   name: 'filterSupplier',
      //   type: 'string',
      // },
      {
        name: 'rfxHeaderId',
        type: 'string',
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
      {
        name: 'prHeaderId',
        type: 'string',
      },
      {
        name: 'organizationId',
        type: 'string',
      },
      {
        name: 'freightIncludedFlag',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'sampleRequestedFlag',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'currentRoundNumber',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.estimatedUnitPrice`)
          .d('预估单价(含税)'),
        name: 'estimatedPrice',
        type: 'number',
        min: '0',
        step: 0,
        max: '99999999999999999999',
        defaultValue: 0,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
          .d('预估单价(不含税)'),
        name: 'netEstimatedPrice',
        type: 'number',
        min: '0',
        step: 0,
        max: '99999999999999999999',
        defaultValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`).d('预估行金额(含税)'),
        name: 'estimatedAmount',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
          .d('预估行金额(不含税)'),
        name: 'netEstimatedAmount',
      },
      {
        name: 'expandCompany',
        type: 'object',
        multiple: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expandCompany`).d('拓展公司'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        lovPara: { enabledFlag: 1 },
        dynamicProps: {
          required() {
            const { expandResultsFlag, resultsExpandingDimensions, resultsExpandingHierarchy } =
              rfxInfoDS?.current?.get([
                'expandResultsFlag',
                'resultsExpandingDimensions',
                'resultsExpandingHierarchy',
              ]) || {};
            return (
              [1, '1'].includes(expandResultsFlag) &&
              resultsExpandingDimensions === 'ITEM_LINE' &&
              resultsExpandingHierarchy === 'INV_ORGANIZATION'
            );
          },
        },
        transformResponse: (value, data) => {
          const { expandCompany, expandCompanyMeaning } = data || {};
          const idList = expandCompany?.split(',') || [];
          const nameList = expandCompanyMeaning?.split(',') || [];
          return value
            ? idList.map((item, index) => ({
                companyId: item,
                companyName: nameList[index],
              }))
            : null;
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.companyId).join(',');
        },
      },
      {
        name: 'expandCompanyMeaning',
        bind: 'expandCompany.companyName',
        multiple: ',',
      },
      {
        name: 'expandInvOrganization',
        type: 'object',
        multiple: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.expandInvOrganization`)
          .d('拓展库存组织'),
        lovCode: 'HPFM_INV_ORGANIZATION_LIST',
        dynamicProps: {
          required() {
            const { expandResultsFlag, resultsExpandingDimensions, resultsExpandingHierarchy } =
              rfxInfoDS?.current?.get([
                'expandResultsFlag',
                'resultsExpandingDimensions',
                'resultsExpandingHierarchy',
              ]) || {};
            return (
              [1, '1'].includes(expandResultsFlag) &&
              resultsExpandingDimensions === 'ITEM_LINE' &&
              resultsExpandingHierarchy === 'INV_ORGANIZATION'
            );
          },
          disabled({ record }) {
            return isEmpty(record.get('expandCompany'));
          },
          lovPara({ record }) {
            const companyIds = record?.get('expandCompany');
            const param = {
              companyIds: companyIds?.map((item) => item.companyId)?.join(','),
            };
            return param;
          },
        },
        transformResponse: (value, data) => {
          const { expandInvOrganization, expandInvOrganizationMeaning } = data || {};
          const idList = expandInvOrganization?.split(',') || [];
          const nameList = expandInvOrganizationMeaning?.split(',') || [];
          return value
            ? idList.map((item, index) => ({
                organizationId: Number(item), // 值集值字段默认数字类型 若是后期值集主键加密 需要再次处理
                organizationName: nameList[index],
              }))
            : null;
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.organizationId).join(',');
        },
      },
      {
        name: 'expandInvOrganizationMeaning',
        bind: 'expandInvOrganization.organizationName',
        multiple: ',',
      },
      {
        name: 'startingBiddingPrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          label() {
            // 竞价方式为拍卖 - 起拍价；竞价方式为竞价 - 起竞价
            if (rfxInfoDS?.current?.get('biddingQuotationMethod') === 'AUCTION') {
              return intl
                .get('ssrc.inquiryHall.model.biddingRules.startingAuctionPrice')
                .d('起拍价');
            }
            return intl.get('ssrc.inquiryHall.model.biddingRules.startingBiddingPrice').d('起竞价');
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.safePrice').d('安全价'),
        name: 'safePrice',
        type: 'number',
        step: 0,
        min: '0',
        max: '99999999999999999999',
        // validator: (value) => {
        //   if (!isNil(value) && value === 0) {
        //     return intl
        //       .get(`ssrc.inquiryHall.model.inquiryHall.tip.integerThanZero`)
        //       .d('请输入非负非零的整数');
        //   }
        //   return true;
        // },
      },
      {
        label: (
          <Tooltip
            title={intl
              .get(`ssrc.inquiryHall.view.message.floatingRatioDetail`)
              .d('报价幅度：最小价格幅度，下次报价至少符合此价格浮动范围！')}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}
          </Tooltip>
        ),
        name: 'biddingQuotationRange',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.targetPriceLowerLimit').d('目标价下限'),
        name: 'targetPriceLowerLimit',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          required() {
            const { isBritishBidTrafficLight, biddingTarget } =
              getHeaderDsFieldsValue(['isBritishBidTrafficLight', 'biddingTarget']) || {};

            const flag = isBritishBidTrafficLight === 1 && biddingTarget === 'UNIT_PRICE';
            return flag;
          },
          disabled() {
            const { isBritishBidTrafficLight, biddingTarget } = getHeaderDsFieldsValue([
              'isBritishBidTrafficLight',
              'biddingTarget',
            ]);

            const flag = isBritishBidTrafficLight !== 1 || biddingTarget !== 'UNIT_PRICE';
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.targetPriceUpperLimit').d('目标价上限'),
        name: 'targetPriceUpperLimit',
        type: 'number',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          required() {
            const { isBritishBidTrafficLight, biddingTarget } =
              getHeaderDsFieldsValue(['isBritishBidTrafficLight', 'biddingTarget']) || {};
            const flag = isBritishBidTrafficLight === 1 && biddingTarget === 'UNIT_PRICE';
            return flag;
          },
          disabled() {
            const { isBritishBidTrafficLight, biddingTarget } = getHeaderDsFieldsValue([
              'isBritishBidTrafficLight',
              'biddingTarget',
            ]);
            const flag = isBritishBidTrafficLight !== 1 || biddingTarget !== 'UNIT_PRICE';
            return flag;
          },
          min({ record }) {
            let min = '0';
            const currentField = record.getField('targetPriceUpperLimit');
            const precisionNum = record.getState('currency_precision') || 0;

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            // 2.竞价方式=竞价/拍卖时，前端需校验:试竞价/目标价上限要大于试竞价/目标价下限;
            const targetPriceLowerLimit = record.get('targetPriceLowerLimit');
            if (isNil(targetPriceLowerLimit)) {
              return min;
            }

            min = math.plus(targetPriceLowerLimit, math.div(1, math.pow(10, precisionNum)));

            return min;
          },
        },
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.trialTargetPriceLowerLimit')
          .d('试竞价目标价下限'),
        name: 'trialTargetPriceLowerLimit',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          required() {
            const { isBritishBidTrafficLight, biddingTarget, biddingTrialBiddingFlag } =
              getHeaderDsFieldsValue([
                'isBritishBidTrafficLight',
                'biddingTarget',
                'biddingTrialBiddingFlag',
              ]) || {};

            const flag =
              isBritishBidTrafficLight === 1 &&
              biddingTarget === 'UNIT_PRICE' &&
              biddingTrialBiddingFlag === 1;
            return flag;
          },
          disabled() {
            const {
              isBritishBidTrafficLight,
              biddingTarget,
              biddingTrialBiddingFlag,
            } = getHeaderDsFieldsValue([
              'isBritishBidTrafficLight',
              'biddingTarget',
              'biddingTrialBiddingFlag',
            ]);
            const flag =
              isBritishBidTrafficLight !== 1 ||
              biddingTarget !== 'UNIT_PRICE' ||
              biddingTrialBiddingFlag !== 1;
            return flag;
          },
        },
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.trialTargetPriceUpperLimit')
          .d('试竞价目标价上限'),
        name: 'trialTargetPriceUpperLimit',
        type: 'number',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          required() {
            const { isBritishBidTrafficLight, biddingTarget, biddingTrialBiddingFlag } =
              getHeaderDsFieldsValue([
                'isBritishBidTrafficLight',
                'biddingTarget',
                'biddingTrialBiddingFlag',
              ]) || {};
            const flag =
              isBritishBidTrafficLight === 1 &&
              biddingTarget === 'UNIT_PRICE' &&
              biddingTrialBiddingFlag === 1;
            return flag;
          },
          disabled() {
            const { isBritishBidTrafficLight, biddingTarget, biddingTrialBiddingFlag } =
              getHeaderDsFieldsValue([
                'isBritishBidTrafficLight',
                'biddingTarget',
                'biddingTrialBiddingFlag',
              ]) || {};
            const flag =
              isBritishBidTrafficLight !== 1 ||
              biddingTarget !== 'UNIT_PRICE' ||
              biddingTrialBiddingFlag !== 1;
            return flag;
          },
          min({ record }) {
            let min = '0';
            const currentField = record.getField('targetPriceUpperLimit');
            const precisionNum = record.getState('currency_precision') || 0;

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            // 2.竞价方式=竞价/拍卖时，前端需校验:试竞价/目标价上限要大于试竞价/目标价下限;
            const trialTargetPriceLowerLimit = record.get('trialTargetPriceLowerLimit');

            if (isNil(trialTargetPriceLowerLimit)) {
              return min;
            }

            min = math.plus(trialTargetPriceLowerLimit, math.div(1, math.pow(10, precisionNum)));

            return min;
          },
        },
      },
    ],
    events: {
      load: ({ dataSet }) => {
        if (!dataSet) {
          return;
        }

        const { batchEditRfxLineItemDTO, allEditFlag, batchMaintainItemDS } =
          getBatchUpdateFlag() || {};
        if (allEditFlag === 1) {
          // line update
          batchUpdateLines({
            batchEditRfxLineItemDTO,
            itemLineDS: dataSet,
            rfxInfoDS,
            batchMaintainItemDS,
            allEditFlag,
          });
        }

        // const { allowChangeItemsFlag = false } = dataSet.queryParameter.headers || {};

        dataSet.forEach((record = {}) => {
          const batchPrice = record.get('batchPrice');

          // if (allowChangeItemsFlag) {
          //   Object.assign(record, { selectable: false });
          // }

          if (!batchPrice && batchPrice !== 0) {
            record.set('batchPrice', 1);
          }
        });
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, rfxHeaderId, projectLineSectionId, ...otherParams } = commonProps;

        if (!rfxHeaderId || rfxHeaderId === 'null') {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/items/${rfxHeaderId}/${projectLineSectionId}`,
          method: 'GET',
          data: otherParams,
        };
      },
      submit: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const {
          organizationId,
          rfxHeaderId,
          projectLineSectionId,
          customizeUnitCode,
        } = commonProps;

        if (!rfxHeaderId || rfxHeaderId === 'null') {
          notification.warning({
            message: intl
              .get('ssrc.inquiryHall.view.inquiryHall.saveItemMustRfxId')
              .d('请先保存报价单'),
          });
          return;
        }

        const newData = data.map((item) => {
          return {
            ...item,
            sourceFrom: 'RFX',
            tenantId: organizationId,
            rfxHeaderId,
            projectLineSectionId,
          };
        });

        // 头数据 后端需要根据（如果行数据的编辑逻辑根据头字段控制，需要给到后端，用于全量编辑赋值）
        // const rfxHeaderData = RfxInfoDS?.current?.toData();
        const { allEditFlag, batchEditRfxLineItemData, integrationPageData = noop } =
          getBatchUpdateFlag() || {};
        const { rfxHeader } = integrationPageData() || {};
        if (allEditFlag === 1) {
          return {
            url: `${Prefix}/${organizationId}/rfx/items/batch-edit`,
            method: 'POST',
            params: { rfxHeaderId, customizeUnitCode },
            data: {
              projectSectionId: projectLineSectionId,
              customizeUnitCode,
              rfxHeaderDTO: rfxHeader,
              rfxLineItemList: newData,
              allEditFlag,
              batchEditRfxLineItemDTO: batchEditRfxLineItemData,
            },
          };
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/items`,
          method: 'POST',
          params: { rfxHeaderId, customizeUnitCode },
          data: newData,
        };
      },
      destroy: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId = null, customizeUnitCode = null } = commonProps;

        return {
          url: `${Prefix}/${organizationId}/rfx/items/items`,
          method: 'DELETE',
          params: customizeUnitCode,
          data,
          transformResponse: async (res) => {
            let result = JSON.parse(res) || null;
            result = getResponse(result);

            if (!isEmpty(result)) {
              dataSet.query(undefined, undefined, true);
              const header = await props.fetchInquiryHeader();
              if (header) {
                props.updateHeaderInfo(header.projectLineSections);
              }
            }
          },
        };
      },
    },
  };
};

export default ItemLineTableDS;
