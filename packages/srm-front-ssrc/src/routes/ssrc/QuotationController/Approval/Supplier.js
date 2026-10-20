// 对供应商要求form

import React, { Component } from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import { SupplierFilterItemDS } from './BulkAddSupplierDS';
import SupplierListTable from './SupplierListTable';

import SupplierFilterItemForm from './SupplierFilterItemForm';
import SupplierListTableDS from './SupplierListTableDS';

export default class Supplier extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    const { currentMode, header = {} } = props;
    this.supplierListTableDS = new DataSet(
      SupplierListTableDS({
        currentMode,
        rfxHeaderId: header?.rfxHeaderBaseInfoAdjustDTO?.rfxHeaderId,
      })
    );
  }

  componentDidMount() {
    this.initSupplierDS();
  }

  initSupplierDS() {
    const { rfxId, organizationId, currentMode, custKey } = this.props;
    this.supplierListTableDS.setQueryParameter('commonProps', {
      adjustRecordId: rfxId,
      organizationId,
      customizeUnitCode:
        currentMode === 'history'
          ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_HIS`
          : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ONLYRED`,
    });
  }

  initSupplierFilterItemDS(record, data) {
    const { rfxId, organizationId, currentMode, custKey } = this.props;
    this.SupplierFilterItemDS = new DataSet(
      SupplierFilterItemDS({ currentMode, recordData: data })
    );
    this.SupplierFilterItemDS.setQueryParameter('commonProps', {
      adjustRecordId: rfxId,
      organizationId,
      rfxLineSupplierAdjustId:
        currentMode === 'history' ? null : record.get('rfxLineSupplierAdjustId'),
      rfxLineSupplierAdjustHisId:
        currentMode === 'history' ? record.get('rfxLineSupplierAdjustHisId') : null,
      customizeUnitCode:
        currentMode === 'history'
          ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM_HIS`
          : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM_READ`,
    });
  }

  // 供应商查看分配物料modal
  @Bind()
  supplierLineAllotItem(record = {}) {
    const { customizeTable, custKey, currentMode } = this.props;
    const data = record.toData() || {};
    this.initSupplierFilterItemDS(record, data);
    const { rfxLineSupplierId } = data;
    this.SupplierFilterItemDS.query();

    const Props = {
      SupplierFilterItemDS: this.SupplierFilterItemDS,
      saved: () => this.saveSingleAllotItem(rfxLineSupplierId),
      customizeTable,
      custKey,
      currentMode,
    };
    const modalKey = Modal.key();
    Modal.open({
      closable: true,
      destroyOnClose: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.title.viewAllotItemLine`).d('查看分配物料'),
      children: <SupplierFilterItemForm {...Props} />,
      style: { width: '800px' },
      footer: null,
    });
  }

  render() {
    const {
      header,
      custLoading = null,
      customizeTable,
      rfxId,
      organizationId,
      currentMode,
      disWrap,
      custKey,
    } = this.props;

    // const { sourceMethod } = header;

    const supplierListTableProps = {
      rfxId,
      currentMode,
      organizationId,
      header,
      disWrap,
      // sourceMethod,
      customizeTable,
      custLoading,
      supplierLineAllotItem: this.supplierLineAllotItem,
      supplierListTableDS: this.supplierListTableDS,
      custKey,
    };

    return (
      <div>
        {header?.rfxHeaderBaseInfoAdjustDTO?.sourceMethod === 'INVITE' ? (
          <SupplierListTable {...supplierListTableProps} />
        ) : null}
      </div>
    );
  }
}
