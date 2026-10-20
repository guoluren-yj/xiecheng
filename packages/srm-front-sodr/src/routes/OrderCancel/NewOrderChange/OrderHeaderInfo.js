import React from 'react';
import { Form, Output, TextArea, Lov } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import { formatAumont } from '../../components/utils';

const OrderHeaderInfo = (props) => {
  const {
    orderHeaderInfoDs,
    customizeForm = noop,
    headerInfo = {},
    // changeFields = [],
    amountFinancialPrecision = noop,
  } = props;

  const { financialPrecision, domesticFinancialPrecision } = headerInfo;

  // 头字段是否配置可修改
  // const isDisabledFields = (header, item) => {
  //   return header.cancelledFlag || header.closedFlag || !changeFields.includes(item);
  // };

  return (
    <React.Fragment>
      {customizeForm(
        {
          dataSet: orderHeaderInfoDs,
          code: 'SODR.ORDER_CANCEL_CHANGE.HEADER',
        },
        <Form
          dataSet={orderHeaderInfoDs}
          columns={3}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output name="poTypeDesc" />
          <Output name="displayPoNum" />
          <Output name="creationDate" />
          <Output name="companyName" />
          <Output name="ouName" />
          <Output name="supplierName" />
          <Output name="purchaseOrgName" />
          <Output name="agentName" />
          <Output name="currencyCode" />
          <Output
            name="taxIncludeAmount"
            renderer={() => (
              <span>
                {amountFinancialPrecision(
                  headerInfo.taxIncludeAmount,
                  financialPrecision,
                  headerInfo.poSourcePlatform
                )}
              </span>
            )}
          />
          <Output
            name="amount"
            renderer={() => (
              <span>
                {amountFinancialPrecision(
                  headerInfo.amount,
                  financialPrecision,
                  headerInfo.poSourcePlatform
                )}
              </span>
            )}
          />
          <Lov name="termsId" />
          <Output
            name="quantityTotal"
            renderer={() => <span>{formatAumont(headerInfo.quantityTotal)}</span>}
          />
          <Output
            name="poSourcePlatform"
            renderer={() => <span>{headerInfo.poSourcePlatformMeaning}</span>}
          />
          {headerInfo.originalPoNum && <Output name="originalPoNum" />}
          <Output name="domesticCurrencyCode" />
          <Output
            name="domesticTaxIncludeAmount"
            renderer={() => (
              <span>
                {amountFinancialPrecision(
                  headerInfo.domesticTaxIncludeAmount,
                  domesticFinancialPrecision,
                  headerInfo.poSourcePlatform
                )}
              </span>
            )}
          />
          <Output
            name="domesticAmount"
            renderer={() => (
              <span>
                {amountFinancialPrecision(
                  headerInfo.domesticAmount,
                  domesticFinancialPrecision,
                  headerInfo.poSourcePlatform
                )}
              </span>
            )}
          />
          <Output name="supplierOrderTypeCode" />
          <TextArea
            rows={2}
            name="remark"
            resize="vertical"
            // disabled={isDisabledFields(headerInfo, 'headerRemark')}
          />
        </Form>
      )}
    </React.Fragment>
  );
};

export default OrderHeaderInfo;
