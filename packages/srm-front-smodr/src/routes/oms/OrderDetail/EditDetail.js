import React from 'react';
import { Table, Lov, TextArea, TextField, Form, Attachment, Button, Tooltip, Modal, DataSet, DateTimePicker } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { Alert } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';

import { fetchPurOrganizationService } from '@/services/oms/orderDetailService';

import styles from './index.less';

const BatchEdit = observer(({dataSet, onClick = e => e}) => {
  return (
    <Tooltip
      title={
        dataSet.selected.length > 0
          ? intl.get('smodr.orderDetail.view.bacthEditSelect').d('批量编辑勾选数据')
          : intl.get('smodr.orderDetail.view.bacthEditAll').d('批量编辑全部数据')
      }
    >
      <Button funcType='flat' icon='mode_edit' onClick={onClick}>
        {dataSet.selected.length > 0
          ? intl.get('smodr.orderDetail.button.selectBacthEdit').d('勾选批量编辑')
          : intl.get('smodr.orderDetail.button.bacthEdit').d('批量编辑')}
      </Button>
    </Tooltip>
  );
});

function EditDetail(props) {
  const {
    customizeForm,
    customizeTable,
    Ds,
    productDs,
    freightDs,
    freColumns,
    attDs,
    outAttDs,
    extensionHeaderData,
    PRIVATE_BUCKET,
  } = props;
  const proColumns = [
    {
      name: 'skuCode',
    },
    {
      name: 'skuName',
    },
    {
      name: 'entryCode',
    },
    {
      name: 'itemLov',
      editor: true,
    },
    {
      name: 'itemName',
      editor: true,
    },
    {
      name: 'invorgNameLov',
      editor: true,
    },
    {
      name: 'originalQuantityMeaning',
      align: 'right',
      header: intl.get('smodr.orderDetail.model.quantity').d('数量'),
    },
    {
      name: 'uom',
      header: intl.get('smodr.orderDetail.model.uomName').d('单位'),
    },
    {
      name: 'taxRateMeaning',
      align: 'right',
    },
    {
      name: 'currencyName',
    },
    {
      name: 'unitPriceMeaning',
      align: 'right',
      header: intl.get('smodr.orderDetail.model.unitPriceTaxNew').d('单价(含税)'),
    },
    {
      name: 'unitNakedPriceMeaning',
      align: 'right',
      header: intl.get('smodr.orderDetail.model.unitPriceNoTaxNew').d('单价(不含税)'),
    },
    {
      name: 'entryAmountMeaning',
      align: 'right',
    },
    {
      name: 'nakedPriceMeaning',
      align: 'right',
    },
    {
      name: 'remark',
      editor: true,
    },
  ];

  // 选择业务组织
  async function handleOuChange(value) {
    const { invOrganizationId, invOrganizationCode, invOrganizationName, ouId } = value || {};
    productDs.map(r => {
      r.set({
        invorgNameLov: isEmpty(value) ? null : {
          organizationId: invOrganizationId,
          organizationCode: invOrganizationCode,
          organizationName: invOrganizationName,
        },
      });
    });
    if(ouId) {
      const params = {
        ouId,
        companyId: Ds.current?.get('purchaseCompanyId'),
      };
      const res = getResponse(await fetchPurOrganizationService(params));
      if(res) {
        const { purchaseOrgId, purchaseOrgName: organizationName } = res || {};
        Ds.current.set({
          purOrganizationLov: purchaseOrgId ? {
            purchaseOrgId,
            organizationName,
          } : null,
        });
      }
    } else {
      Ds.current.set({
        purOrganizationLov: null,
      });
    }
  }

  // 批量编辑
  function handleBatchEditPdt() {
    const batchFormDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'itemLov',
          type: 'object',
          label: intl.get('smodr.orderDetail.model.itemCode').d('物料编码'),
          lovCode: 'SMAL.CUSTOMER_ITEM',
        },
        {
          name: 'itemId',
          bind: 'itemLov.itemId',
        },
        {
          name: 'itemCode',
          type: 'string',
          bind: 'itemLov.itemCode',
        },
        {
          name: 'itemName',
          type: 'string',
          bind: 'itemLov.itemName',
          label: intl.get('smodr.orderDetail.model.itemName').d('物料名称'),
        },
        {
          name: 'invorgNameLov',
          type: 'object',
          label: intl.get('smodr.orderDetail.model.invorg').d('库存组织'),
          lovCode: 'SPFM.USER_AUTH.INVORG',
          ignore: 'always',
          computedProps: {
            lovPara: () => {
              return {
                ouId: Ds.current?.get('ouId'),
              };
            },
          },
        },
        {
          name: 'invOrganizationId',
          bind: 'invorgNameLov.organizationId',
        },
        {
          name: 'invOrganizationCode',
          bind: 'invorgNameLov.organizationCode',
        },
        {
          name: 'invOrganizationName',
          bind: 'invorgNameLov.organizationName',
        },
      ],
    });
    const isSelected = productDs.selected.length > 0;
    const message =
    isSelected > 0
        ? intl
            .get('smodr.orderDetail.view.batchEditSelectAlert', {
              value: productDs.selected.length,
            })
            .d(`已勾选${productDs.selected.length}条数据进行批量编辑`)
        : intl.get('smodr.orderDetail.view.batchEditAlert').d('针对全部数据进行批量编辑');
    Modal.open({
      title: intl.get('smodr.orderDetail.button.bacthEdit').d('批量编辑'),
      drawer: true,
      style: { width: 380 },
      children: (
        <>
          <Alert
            showIcon
            className={styles['batch-edit-alert']}
            type="info"
            iconType="help"
            message={message}
            closable
          />
          {customizeForm(
            {
              code: 'SMODR.ORDER.DETAIL.EDIT.SKU.BATCH.FORM',
            },
            <Form columns={1} labelLayout="float" dataSet={batchFormDs}>
              <Lov name="itemLov" />
              <TextField name="itemName" />
              <Lov name="invorgNameLov" />
            </Form>
          )}
        </>
      ),
      onOk: () => {
        const batchData = batchFormDs.current.toData();
        (isSelected ? productDs.selected : productDs).forEach(record => {
          record.set(batchData);
        });
      },
    });
  }

  return (
    <>
      <Content style={{ padding: '20px', marginBottom: 0 }}>
        <div className="order-detail-title" id="BASE_INFO">
          {intl.get('smodr.orderDetail.view.baseInfo').d('基本信息')}
        </div>
        {customizeForm(
          { code: 'SMODR.ORDER.DETAIL.EDIT.ORDER' },
          <Form
            dataSet={Ds}
            useWidthPercent
            labelLayout="float"
            columns={3}
            style={{ marginBottom: '32px' }}
          >
            <TextField disabled name="orderCode" />
            <TextField disabled name="cecOrderCode" />
            <TextField disabled name="orderTypeMeaning" />
            <TextField disabled name="orderSourceFromMeaning" />
            <TextField disabled name="agreementBusinessTypeMeaning" />
            <TextField disabled name="paymentTypeMeaning" />
            <TextField disabled name="currencyName" />
            <TextField disabled name="orderAmountMeaning" />
            <TextField disabled name="buyerName" />
            <DateTimePicker disabled name="creationDate" />
            <TextArea name="remark" newLine colSpan={2} rows={3} resize="vertical" />
          </Form>
        )}
        <div className="order-detail-base">
          {intl.get('smodr.orderDetail.view.receiveAndReceipt').d('收货&收单信息')}
        </div>
        {customizeForm(
          { code: 'SMODR.ORDER.DETAIL.EDIT.RECEIVE' },
          <Form
            dataSet={Ds}
            useWidthPercent
            labelLayout="float"
            columns={3}
            style={{ marginBottom: '32px' }}
          >
            <TextField disabled name="contactName" />
            <TextField disabled name="fullPhone" />
            <TextField disabled name="receiveFullAddress" />
            <TextField disabled name="invoiceContactName" />
            <TextField disabled name="invoiceTelNum" />
            <TextField disabled name="fullAddress" />
          </Form>
        )}
        <div className="order-org-info">
          {intl.get('smodr.orderDetail.model.invoiceInfo').d('发票信息')}
        </div>
        {customizeForm(
          { code: 'SMODR.ORDER.DETAIL.EDIT.INVOICE' },
          <Form dataSet={Ds} useWidthPercent columns={3} labelLayout="float">
            <TextField disabled name="invoiceTypeName" />
            <TextField disabled name="invoiceStateName" />
            <TextField disabled name="invoiceTitle" />
            <TextField disabled name="invoiceContentName" />
            <TextField disabled name="taxRegisterNum" />
            <TextField disabled name="depositBank" />
            <TextField disabled name="bankAccount" />
            <TextField disabled name="registeredAddress" />
            <TextField disabled name="registeredPhone" />
          </Form>
        )}
      </Content>
      <Content style={{ padding: '20px', marginBottom: 0 }}>
        <div className="order-detail-title" id="ORG_INFO">
          {intl.get('smodr.orderDetail.model.purOrgInfo').d('交易方&业务组织信息')}
        </div>
        {customizeForm(
          { code: 'SMODR.ORDER.DETAIL.EDIT.UNIT' },
          <Form dataSet={Ds} useWidthPercent columns={3} labelLayout="float">
            <TextField disabled name="purchaseCompanyName" />
            <TextField disabled name="supplierCompanyName" />
            <Lov name="ouLov" onChange={handleOuChange} />
            <Lov name="purOrganizationLov" />
            <Lov name="unitLov" />
          </Form>
        )}
      </Content>
      <Content style={{ marginBottom: 0, padding: '20px' }}>
        <div className="order-product-info" id="PRO_INFO">
          {intl.get('smodr.orderDetail.model.productInfo').d('商品信息')}
        </div>
        {customizeTable(
          { code: 'SMODR.ORDER.DETAIL.EDIT.SKU' },
          <Table
            dataSet={productDs}
            columns={proColumns}
            customizedCode="SMODR.OMS.ORDER_DETAIl.PRODUCT_EDIT"
            style={{ maxHeight: 450 }}
            buttons={[
              <BatchEdit dataSet={productDs} onClick={() => handleBatchEditPdt()} />,
            ]}
          />
        )}
      </Content>
      <Content
        style={{
          marginBottom: 0,
          padding: '20px',
        }}
      >
        <div className="order-product-info" id="FRE_INFO">
          {intl.get('smodr.orderDetail.model.additionInfo').d('附加费信息')}
        </div>
        {customizeTable(
          { code: 'SMODR.ORDER.DETAIL.EDIT.FREIGHT' },
          <Table
            style={{ maxHeight: 450 }}
            dataSet={freightDs}
            columns={freColumns}
            customizedCode="SMODR.OMS.ORDER_DETAIl.FREIGHT_EDIT"
          />
        )}
      </Content>
      <Content style={{ marginBottom: 8, padding: '20px' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, paddingRight: 20 }}>
            <div className="order-product-info" id="ACC_INFO">
              {intl.get('smodr.orderDetail.model.accessoryInner').d('内部附件')}
            </div>
            <Attachment
              dataSet={attDs}
              showHistory
              labelLayout="float"
              name="attachment"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory='smodr'
            />
          </div>
          <div style={{ paddingLeft: 16, borderLeft: '1px dashed rgba(0,0,0,0.16)', flex: 1 }}>
            <div className="order-product-info" id="ACC_INF_OUT">
              {intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件')}
            </div>
            <Attachment
              showHistory
              dataSet={outAttDs}
              labelLayout="float"
              name="attachment"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory='smodr'
            />
          </div>
        </div>
      </Content>
    </>
  );
}

export default EditDetail;
