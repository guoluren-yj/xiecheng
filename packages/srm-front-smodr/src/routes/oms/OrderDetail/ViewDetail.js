import React from 'react';
// import UploadModal from '_components/Upload';
import { Table, Output, Form, Attachment } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';

function ViewDetail(props) {
  const {
    customizeForm,
    customizeTable,
    Ds,
    productDs,
    freightDs,
    freColumns,
    attDs,
    outAttDs,
    proColumns,
    handleCheckHeader,
    extensionHeaderData,
    colorStyle,
    PRIVATE_BUCKET,
  } = props;
  return (
    <>
      <Content style={{ padding: '20px', marginBottom: 0 }}>
        <div className="order-detail-title" id="BASE_INFO">
          {intl.get('smodr.orderDetail.view.baseInfo').d('基本信息')}
        </div>
        {customizeForm(
          { code: 'SMODR.ORDER.DETAIL.ORDER' },
          <Form
            dataSet={Ds}
            useWidthPercent
            className="c7n-pro-vertical-form-display"
            labelLayout="vertical"
            columns={3}
            style={{ marginBottom: '32px' }}
          >
            <Output name="orderCode" />
            <Output
              name="showOrderStatusMeaning"
              renderer={({ text }) => (
                <Tag color={colorStyle()} style={{ border: 'none' }}>
                  {text}
                </Tag>
              )}
            />
            <Output name="orderTypeMeaning" />
            <Output name="orderSourceFromMeaning" />
            <Output name="agreementBusinessTypeMeaning" />
            <Output name="paymentTypeMeaning" />
            <Output name="terminalTypeMeaning" />
            <Output name="currencyName" />
            <Output name="productAmountMeaning" />
            <Output name="extraCostAmountMeaning" />
            <Output name="orderAmountMeaning" />
            <Output name="buyerName" />
            <Output name="creationDate" />
            <Output name="remark" />
            <Output
              name="otherInfo"
              renderer={({ record }) => {
                if (record?.get('dimValueDTO')) {
                  return (
                    <span
                      className="check"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCheckHeader(record)}
                    >
                      {intl.get('smodr.orderDetail.model.check').d('查看')}
                    </span>
                  );
                }
              }}
            />
          </Form>
        )}
        <div className="order-detail-base">
          {intl.get('smodr.orderDetail.view.receiveAndReceipt').d('收货&收单信息')}
        </div>
        {customizeForm(
          { code: 'SMODR.ORDER.DETAIL.RECEIVE' },
          <Form
            dataSet={Ds}
            useWidthPercent
            className="c7n-pro-vertical-form-display"
            labelLayout="vertical"
            columns={3}
            style={{ marginBottom: '32px' }}
          >
            <Output name="contactName" />
            <Output name="fullPhone" />
            <Output name="receiveFullAddress" />
            <Output name="invoiceContactName" />
            <Output name="invoiceTelNum" />
            <Output name="fullAddress" />
          </Form>
        )}
        {extensionHeaderData.orderTypeCode !== 'CATA' && (
          <>
            <div className="order-org-info">
              {intl.get('smodr.orderDetail.model.invoiceInfo').d('发票信息')}
            </div>
            {customizeForm(
              { code: 'SMODR.ORDER.DETAIL.INVOICE' },
              <Form
                dataSet={Ds}
                useWidthPercent
                className="c7n-pro-vertical-form-display"
                labelLayout="vertical"
                columns={3}
              >
                <Output name="invoiceTypeName" />
                <Output name="invoiceStateName" />
                <Output name="invoiceTitle" />
                <Output name="invoiceContentName" />
                <Output name="taxRegisterNum" />
                <Output name="depositBank" />
                <Output name="bankAccount" />
                <Output name="registeredAddress" />
                <Output name="registeredPhone" />
              </Form>
            )}
          </>
        )}
      </Content>
      <Content style={{ marginBottom: 0, padding: '20px' }}>
        <div className="order-detail-title" id="ORG_INFO">
          {intl.get('smodr.orderDetail.model.purOrgInfo').d('交易方&业务组织信息')}
        </div>
        {customizeForm(
          { code: 'SMODR.ORDER.DETAIL.UNIT' },
          <Form
            dataSet={Ds}
            useWidthPercent
            className="c7n-pro-vertical-form-display"
            labelLayout="vertical"
            columns={3}
          >
            <Output name="purchaseCompanyName" />
            <Output name="supplierCompanyName" />
            <Output name="ouName" />
            <Output name="purOrganizationName" />
            <Output name="unitName" />
          </Form>
        )}
      </Content>
      <Content style={{ marginBottom: 0, padding: '20px' }}>
        <div className="order-product-info" id="PRO_INFO">
          {intl.get('smodr.orderDetail.model.productInfo').d('商品信息')}
        </div>
        {customizeTable(
          { code: 'SMODR.ORDER.DETAIL.SKU' },
          <Table
            dataSet={productDs}
            // searchCode="SMODR.ORDER.DETAIL.SKU.SEARCHBAR2"
            columns={proColumns}
            customizedCode="SMODR.OMS.ORDER_DETAIl.PRODUCT"
            style={{ maxHeight: 450 }}
            // searchBarConfig={{
            //   expandable: false,
            //   closeFilterSelector: true,
            // }}
          />
        )}
      </Content>
      <Content
        style={{
          marginBottom: 0,
          padding: '20px 20px',
        }}
      >
        <div className="order-product-info" id="FRE_INFO">
          {intl.get('smodr.orderDetail.model.additionInfo').d('附加费信息')}
        </div>
        {customizeTable(
          { code: 'SMODR.ORDER.DETAIL.FREIGHT' },
          <Table
            style={{ maxHeight: 450 }}
            dataSet={freightDs}
            columns={freColumns}
            customizedCode="SMODR.OMS.ORDER_DETAIl.FREIGHT"
          />
        )}
      </Content>
      <Content style={{ marginBottom: 8, padding: '20px 20px' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, paddingRight: 20 }}>
            <div className="order-product-info" id="ACC_INFO">
              {intl.get('smodr.orderDetail.model.accessoryInner').d('内部附件')}
            </div>
            <Attachment
              dataSet={attDs}
              showHistory
              readOnly
              labelLayout="float"
              name="attachment"
              bucketName={PRIVATE_BUCKET}
            />
          </div>
          <div style={{ paddingLeft: 16, borderLeft: '1px dashed rgba(0,0,0,0.16)', flex: 1 }}>
            <div className="order-product-info" id="ACC_INF_OUT">
              {intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件')}
            </div>
            <Attachment
              readOnly
              showHistory
              dataSet={outAttDs}
              labelLayout="float"
              name="attachment"
              bucketName={PRIVATE_BUCKET}
            />
          </div>
        </div>
      </Content>
    </>
  );
}

export default ViewDetail;
