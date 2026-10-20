import React from 'react';
import { isEmpty, omit, noop, isArray, isNil } from 'lodash';
import { Tooltip } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import { PRIVATE_BUCKET } from '_utils/config';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

import { Prefix } from '@/utils/globalVariable';
import { getQtyName, getUomName, TooltipTitle } from '@/utils/utils';
import { commonValidationRules } from './utils/dsUtils';
import { batchUpdateLines } from './utils/utils';

/**
 * 物料行ds
 * @param {*} RfxInfoDS
 * @param {*} documentTypeName
 * @protected 此ds被【绝味】二开（修改了itemIdLov的valueFiled字段）
 */
const ItemLineTableDS = (RfxInfoDS, documentTypeName, otherDsProps = {}) => {
  /**
   * 从头ds中批量获取值
   */
  const getHeaderDsFieldsValue = (fields = []) => {
    const { current } = RfxInfoDS || {};
    let values = {};

    if (!current || isEmpty(fields)) {
      return values;
    }

    values = current.get(fields);
    return values;
  };

  /**
   * 是否是竞价大厅标识
   * @param { object } record
   * @param { object } dataSet
   */
  const isNewBiddingFlag = () => {
    // const biddingHallFlag = RfxInfoDS.getState('biddingHallFlag'); // 开启竞价大厅配置
    const { sourceCategory, biddingFlag } =
      RfxInfoDS?.current?.get(['sourceCategory', 'biddingFlag']) || {};
    // 竞价大厅标识
    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
    return newBiddingFlag;
  };

  const { remote } = otherDsProps;
  return {
    primaryKey: 'rfxLineItemId',
    autoQuery: false,
    dataToJSON: 'all',
    validationRules: commonValidationRules('minLength')(),
    cacheSelection: true,
    cacheModified: true,
    fields: [
      {
        name: 'split',
        label: intl.get('ssrc.common.view.button.split').d('拆分'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        /** ********* 华恒生物二开ouIdLov-勿动!!! *********** */
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
            const isSplitFlag = record.getState('isSplitFlag');
            return record.get('prHeaderId') || allowChangeItemsFlag || isSplitFlag;
          },
          lovPara({ dataSet, record }) {
            const companyId = RfxInfoDS?.current?.get('companyId');
            const param = { companyId };
            const lovPara = remote
              ? remote.process(
                  'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_ITEMLINE_TABLE_DS_FIELDS_OU_LOVPARA',
                  param,
                  { dataSet, record, RfxInfoDS }
                )
              : param;
            return lovPara;
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
        /** ********* 华恒生物二开invOrganizationIdLov-勿动!!! *********** */
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
            const isSplitFlag = record.getState('isSplitFlag');
            return record.get('prHeaderId') || allowChangeItemsFlag || isSplitFlag;
          },
          lovPara({ dataSet, record }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            const companyId = RfxInfoDS?.current?.get('companyId');
            const param = {
              ouId: record.get('ouId'),
              companyId,
              enabledFlag: 1,
              organizationId,
            };
            const lovPara = remote
              ? remote.process(
                  'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_ITEMLINE_TABLE_DS_FIELDS_INVORG_LOVPARA',
                  param,
                  { dataSet, record, RfxInfoDS }
                )
              : param;
            return lovPara;
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
            const isSplitFlag = record.get('itemCode') && record.getState('isSplitFlag');
            return record.get('prHeaderId') || allowChangeItemsFlag || isSplitFlag;
          },
          lovPara({ dataSet, record }) {
            const { companyId = null } = dataSet.queryParameter.company || {};
            const {
              templateNum,
              expandResultsFlag,
              resultsExpandingHierarchy,
              resultsExpandingDimensions,
            } =
              RfxInfoDS?.current?.get([
                'templateNum',
                'expandResultsFlag',
                'resultsExpandingHierarchy',
                'resultsExpandingDimensions',
              ]) || {};
            const expandCompany =
              resultsExpandingDimensions !== 'ITEM_LINE'
                ? RfxInfoDS?.current?.get('expandCompany')
                : record.get('expandCompany');
            const expandInvOrganization =
              resultsExpandingDimensions !== 'ITEM_LINE'
                ? RfxInfoDS?.current?.get('expandInvOrganization')
                : record.get('expandInvOrganization');

            const commonParams = {
              templateNum,
              from: 'ITEM_LIMIT',
              asyncCountFlag: 'Y',
              companyId,
              ouId: record.get('ouId'),
              invOrganizationId: record.get('invOrganizationId'),
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
              businessObjectCode:
                RfxInfoDS?.current?.get('secondarySourceCategory') === 'NEW_BID'
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
              idField: 'categoryId',
              events: {
                load({ dataSet: lovDataSet }) {
                  lovDataSet.setState('__totalCount__', lovDataSet.totalCount);
                  lovDataSet.setState('__currentPage__', lovDataSet.currentPage);
                  const { current } = lovDataSet.queryDataSet || {};
                  if (!isEmpty(omit(current.toData(), '__dirty'))) {
                    lovDataSet.forEach((record = {}) => {
                      Object.assign(record, { isExpanded: true });
                    });
                  }
                },
                append({ dataSet: lovDataSet }) {
                  const ds = lovDataSet;
                  ds.totalCount = ds.getState('__totalCount__');
                  ds.currentPage = ds.getState('__currentPage__');
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
        // min: '0.000001',
        max: '99999999999999999999',
        // step: 0.000001,
        step: 0,
        dynamicProps: {
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return doubleUnitFlag && !allowChangeItemsFlag;
          },
          disabled: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return allowChangeItemsFlag;
          },
          min: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag ? '0.000001' : null;
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
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return doubleUnitFlag && !allowChangeItemsFlag;
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
        min: '0.000001',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const flag = !doubleUnitFlag && !allowChangeItemsFlag;
            return flag;
          },
          disabled: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return doubleUnitFlag || allowChangeItemsFlag;
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
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const { setting000112 = null } = dataSet.queryParameter.settings || {};
            return (
              doubleUnitFlag ||
              (setting000112 === '1' && record.get('itemCode')) ||
              allowChangeItemsFlag
            );
          },
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const flag = !allowChangeItemsFlag && !doubleUnitFlag;
            return flag;
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
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
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          required: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId, uomId, secondaryUomId } = record.get([
              'itemId',
              'uomId',
              'secondaryUomId',
            ]);
            return !(doubleUnitFlag && itemId && secondaryUomId && uomId !== secondaryUomId);
          },
          disabled: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId, uomId, secondaryUomId } = record.get([
              'itemId',
              'uomId',
              'secondaryUomId',
            ]);
            return doubleUnitFlag && itemId && secondaryUomId && uomId !== secondaryUomId;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          defaultValue({ dataSet }) {
            const { templateTaxIncludedFlag = 0 } = dataSet.queryParameter.headers || {};
            return templateTaxIncludedFlag;
          },
        },
      },
      {
        name: 'applicationScopeFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        defaultValue: 0,
      },
      {
        name: 'estimatedPrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
        // defaultValue: 0,
        // label: intl.get(`ssrc.inquiryHall.model.offlineEntry.estimatedPrice`).d('预估单价(含税)'),
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return (
              <TooltipTitle
                tipValue={intl
                  .get(`ssrc.common.model.offlineEntry.secondaryEstimatedPrice`)
                  .d('辅助单位对应的预估单价(含税)')}
                title={intl
                  .get(`ssrc.inquiryHall.model.offlineEntry.estimatedPrice`)
                  .d('预估单价(含税)')}
                doubleUnitFlag={doubleUnitFlag}
              />
            );
          },
        },
      },
      {
        name: 'netEstimatedPrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        defaultValue: null,
        step: 0,
        // label: intl
        //   .get(`ssrc.inquiryHall.model.offlineEntry.netEstimatedPrice`)
        //   .d('预估单价(不含税)'),
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return (
              <TooltipTitle
                tipValue={intl
                  .get(`ssrc.common.model.offlineEntry.secondaryEetEstimatedPrice`)
                  .d('辅助单位对应的预估单价(不含税)')}
                title={intl
                  .get(`ssrc.inquiryHall.model.offlineEntry.netEstimatedPrice`)
                  .d('预估单价(不含税)')}
                doubleUnitFlag={doubleUnitFlag}
              />
            );
          },
        },
      },
      {
        name: 'estimatedAmount',
        type: 'number',
        label: intl
          .get(`ssrc.inquiryHall.model.offlineEntry.estimatedAmount`)
          .d('预估行金额(含税)'),
        max: '99999999999999999999',
      },
      {
        name: 'netEstimatedAmount',
        type: 'number',
        label: intl
          .get(`ssrc.inquiryHall.model.offlineEntry.netEstimatedAmount`)
          .d('预估行金额(不含税)'),
        max: '99999999999999999999',
      },
      {
        name: 'netPrice',
        type: 'number',
        label: intl.get(`ssrc.inquiryHall.model.offlineEntry.netPrice`).d('单价(不含税)'),
        min: '0',
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
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
        name: 'startingBiddingPrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          label() {
            // 竞价方式为拍卖 - 起拍价；竞价方式为竞价 - 起竞价
            if (RfxInfoDS?.current?.get('biddingQuotationMethod') === 'AUCTION') {
              return intl
                .get('ssrc.inquiryHall.model.biddingRules.startingAuctionPrice')
                .d('起拍价');
            }
            return intl.get('ssrc.inquiryHall.model.biddingRules.startingBiddingPrice').d('起竞价');
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startLadderLevel`).d('启用阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'boolean',
        align: 'center',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
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
          lookupCode() {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag();
            return newBiddingFlag ? 'SSRC.BIDDING_FLOAT_TYPE' : 'SSRC.FLOAT_TYPE';
          },
          // defaultValue() {
          //   // const newBiddingFlag = isNewBiddingFlag();
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
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          disabled({ record }) {
            return !record.get('floatType');
          },
          precision({ record }) {
            const floatType = record.get('floatType');
            if (floatType === 'ratio') {
              return 2;
            }
            return null;
          },
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
        name: 'biddingQuotationRange',
        type: 'string',
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
              businessObjectCode:
                RfxInfoDS?.current?.get('secondarySourceCategory') === 'NEW_BID'
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
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonRFxAttachment`, { documentTypeName })
          .d('{documentTypeName}附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
        dynamicProps: {
          readOnly: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter?.headers || {};
            return allowChangeItemsFlag;
          },
        },
        // readOnly:
        //   RfxInfoDS?.current?.get('allowChangeItemsFlag') === 0 &&
        //   RfxInfoDS?.current?.get('sourceFrom') === 'PROJECT',
        ...(ChunkUploadProps || {}),
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
        // 涉及到二开【拓展公司】改为单选，如果其他需要获取值需要做支持单选的处理
        name: 'expandCompany',
        type: 'object',
        multiple: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expandCompany`).d('拓展公司'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        lovPara: { enabledFlag: 1 },
        dynamicProps: {
          required() {
            const { expandResultsFlag, resultsExpandingDimensions, resultsExpandingHierarchy } =
              RfxInfoDS?.current?.get([
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
              RfxInfoDS?.current?.get([
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
            // 涉及到二开【拓展公司】改为单选，此处在标准处理，如果其他需要获取值也需要做相似处理
            const expandCompanyMultiple = record?.getField('expandCompany')?.get('multiple');
            const param = {
              companyIds: expandCompanyMultiple
                ? companyIds?.map((item) => item.companyId)?.join(',')
                : companyIds?.companyId,
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
        const { getBatchUpdateFlag = noop } = otherDsProps || {};
        const { batchEditRfxLineItemDTO, allEditFlag, batchMaintainItemDS } =
          getBatchUpdateFlag() || {};
        if (allEditFlag === 1) {
          // line update
          batchUpdateLines({
            batchEditRfxLineItemDTO,
            itemLineDS: dataSet,
            rfxInfoDS: RfxInfoDS,
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
        const { organizationId, rfxHeaderId } = commonProps;

        if (!rfxHeaderId || rfxHeaderId === 'null') {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/items`,
          method: 'GET',
          data: commonProps,
        };
      },
      submit: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, rfxHeaderId, customizeUnitCode } = commonProps;

        if (!rfxHeaderId || rfxHeaderId === 'null') {
          notification.warning({
            message: intl
              .get('ssrc.inquiryHall.view.title.formNotSave', {
                name: documentTypeName,
              })
              .d(`请先保存{name}`),
          });
          return;
        }

        const newData = data.map((item) => {
          return {
            ...item,
            sourceFrom: 'RFX',
            tenantId: organizationId,
            rfxHeaderId,
          };
        });
        const { getBatchUpdateFlag = noop } = otherDsProps;
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
            // data: newData,
            data: {
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
          transformResponse: (res) => {
            const result = JSON.parse(res) || null;
            if (!isEmpty(result) && !result.failed) {
              dataSet.query(undefined, undefined, true);
            }
            return result;
          },
        };
      },
    },
  };
};

export default ItemLineTableDS;
