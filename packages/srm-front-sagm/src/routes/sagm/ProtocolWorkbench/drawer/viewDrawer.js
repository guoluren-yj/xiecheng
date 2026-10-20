import React from 'react';
import { DataSet, Modal, Table, Form, Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { precisionRender } from '@/utils/precision';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: false,
  destroyOnClose: true,
  drawer: true,
  okText: intl.get('hzero.common.button.close').d('关闭'),
  okCancel: false,
};

const openSaleArea = ({ data = [], readOnly = false }) => {
  const ds = new DataSet(saleAreaDs(readOnly));
  ds.loadData(data);
  const columns = [{ name: 'regionCode', width: 150 }, { name: 'regionName' }];

  Modal.open({
    title: intl.get('sagm.protocolManagement.view.saleRegion').d('可售区域'),
    ...modalProps,
    style: { width: 380 },
    children: (
      <Table
        dataSet={ds}
        columns={columns}
        customizedCode="SAGM.PROTOCOL_MANAGEMENT.SALE_REGION"
        style={{ maxHeight: 'calc(100vh - 160px)' }}
      />
    ),
  });
};

const openOrganizations = ({ data = [], readOnly = false }) => {
  const ds = new DataSet(orgDs(readOnly));
  ds.loadData(data);
  const columns = [{ name: 'unitCode', width: 150 }, { name: 'unitName' }];

  Modal.open({
    title: intl.get('sagm.protocolManagement.view.buyOrg').d('采买组织'),
    ...modalProps,
    style: { width: 380 },
    children: (
      <Table
        dataSet={ds}
        columns={columns}
        customizedCode="SAGM.PROTOCOL_MANAGEMENT.ORG"
        style={{ maxHeight: 'calc(100vh - 160px)' }}
      />
    ),
  });
};

const openOtherInfo = ({ data = [], readOnly = false }) => {
  const ds = new DataSet(otherDs(readOnly));
  ds.loadData([data]);
  Modal.open({
    title: intl.get('sagm.protocolManagement.view.otherInfo').d('其他信息'),
    ...modalProps,
    style: { width: 380 },
    children: (
      <Form dataSet={ds} labelLayout="vertical" className="c7n-pro-vertical-form-display">
        {/* <Output name="agreementQuantity" renderer={precisionRender} /> */}
        <Output name="orderQuantity" renderer={precisionRender} />
        {/* <Output name="purchaseQuantityLimit" renderer={precisionRender} /> */}
        {/* <Output name="purchaseAmountLimit" renderer={precisionRender} /> */}
        <Output name="deliveryDay" />
        <Output name="guaranteeDay" />
      </Form>
    ),
  });
};

// 阶梯价格
const saleAreaDs = (readOnly) => ({
  paging: false,
  selection: readOnly ? false : 'multiple',
  fields: [
    {
      name: 'regionCode',
      label: intl.get('sagm.protocolManagement.model.regionCode').d('区域编码'),
    },
    {
      name: 'regionName',
      label: intl.get('sagm.protocolManagement.model.regionName').d('区域名称'),
    },
  ],
});

// 组织信息
const orgDs = (readOnly) => ({
  paging: false,
  selection: readOnly ? false : 'multiple',
  fields: [
    {
      name: 'unitCode',
      label: intl.get('sagm.common.view.organization.code').d('组织编码'),
    },
    {
      name: 'unitName',
      label: intl.get('sagm.common.view.organization.name').d('组织名称'),
    },
  ],
});

// 其他信息
const otherDs = (readOnly) => ({
  paging: false,
  selection: readOnly ? false : 'multiple',
  fields: [
    {
      name: 'agreementQuantity',
      label: intl.get('sagm.protocolManagement.model.agreementQuantity').d('协议数量'),
    },
    {
      name: 'orderQuantity',
      label: intl.get('sagm.protocolManagement.model.orderQuantity').d('起订量'),
    },
    {
      name: 'purchaseQuantityLimit',
      label: intl.get('sagm.protocolManagement.model.purchaseQuantityLimit').d('最大购买量'),
    },
    {
      name: 'purchaseAmountLimit',
      label: intl.get('sagm.protocolManagement.model.purchaseAmountLimit').d('采购额上限'),
    },
    {
      name: 'deliveryDay',
      label: intl.get('sagm.protocolManagement.model.deliveryDay').d('供货周期（天）'),
    },
    {
      name: 'guaranteeDay',
      label: intl.get('sagm.protocolManagement.model.guaranteeDay').d('质保期（天）'),
    },
  ],
});

export { openSaleArea, openOrganizations, openOtherInfo };
