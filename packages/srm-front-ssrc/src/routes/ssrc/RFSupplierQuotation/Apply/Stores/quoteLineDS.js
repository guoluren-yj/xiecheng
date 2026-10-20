import React from 'react';
import { Tooltip } from 'choerodon-ui';

import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';

import { getQuantityAndUomCombine } from '@/utils/utils';

const quoteLineDS = (options = {}) => {
  const { quotationName } = options || {};

  return {
    autoQuery: false,
    selection: false,
    primaryKey: 'rfxLineItemId',
    pageSize: 20,
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo`).d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料描述'),
        name: 'itemName',
      },
      {
        label: intl.get('ssrc.common.quantityAndUomCombine').d('数量-单位'),
        name: 'secondaryQuantityAndUomCombine',
      },
      {
        name: 'quantityAndUomCombine',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQuantityAndUomCombine(doubleUnitFlag);
          },
        },
      },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.unit`).d('单位'),
      //   name: 'uomName',
      // },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.rfxQuantity`).d('需求数量'),
      //   name: 'rfxQuantity',
      // },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.priceQuantity`).d('价格批量'),
        help: intl
          .get('ssrc.supplierQuotation.model.supQuo.priceQuantityExplainHelp')
          .d(
            '一个单位包含多少个货品;例如以"袋"为单位的螺丝里,一袋有20个螺丝,价格批量即为20,用以价格库等地方计算"每一单价"，即"单价"除以"价格批量"'
          ),
        name: 'batchPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.demandDate`).d('需求日期'),
        name: 'demandDate',
        showType: 'date',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTimeRFX`, { quotationName })
          .d(`{quotationName}开始时间`),
        name: 'quotationStartDate',
        showType: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadlineRFX`, {
            quotationName,
          })
          .d(`{quotationName}截止时间`),
        name: 'quotationEndDate',
        showType: 'dateTime',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxRate',
      },
      {
        label: (
          <Tooltip
            title={intl
              .get('ssrc.common.title.batchPriceExplainText')
              .d(
                '一个单位包含多少个货品；例如以“袋”为单位的螺丝里，一袋有20个螺丝，价格批量即为20'
              )}
          >
            {intl.get(`ssrc.supplierQuotation.model.supQuo.priceQuantity`).d('价格批量')}
          </Tooltip>
        ),
        name: 'batchPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.ladderLevel`).d('阶梯报价'),
        name: 'ladderInquiry',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`).d('报价明细'),
        name: 'priceDetail',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
          .d('报价有效期从'),
        name: 'validExpiryDateFrom',
        showType: 'date',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
          .d('报价有效期至'),
        name: 'validExpiryDateTo',
        showType: 'date',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAttachment`).d('采购方附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
        name: 'attachmentUuid',
        type: 'attachment',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId } = commonProps;

        return {
          url: `${SRM_SSRC}/v2/${organizationId}/rfx/supplier/items/participate`,
          method: 'GET',
          data: commonProps,
        };
      },
    },
  };
};

export { quoteLineDS };
