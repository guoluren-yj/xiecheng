// 组织及人员ds

import React, { Component } from 'react';
import { Output, Table, DataSet } from 'choerodon-ui/pro';
import classnames from 'classnames';

import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import { supplierFormDS, supplierLineDS } from './SupplierComanyDS';

export default class SupplierCompanyForm extends Component {
  constructor(props) {
    super(props);
    this.formDS = new DataSet(supplierFormDS());
    this.tableDS = new DataSet(supplierLineDS());
  }

  componentDidMount() {
    const { organizationId, rfxLineSupplierSnapId } = this.props;

    this.formDS.setQueryParameter('queryParamets', {
      organizationId,
      rfxLineSupplierSnapId,
    });
    this.tableDS.setQueryParameter('queryParamets', {
      organizationId,
      rfxLineSupplierSnapId,
    });

    this.formDS.query();
    this.tableDS.query();
  }

  getColumns() {
    const columns = [
      {
        name: 'rfxLineItemNum',
        with: 100,
      },
      {
        name: 'itemCode',
        with: 100,
      },
      {
        name: 'itemName',
        with: 150,
      },
      {
        name: 'minLimitPrice',
        with: 100,
      },
      {
        name: 'maxLimitPrice',
        with: 100,
      },
      {
        name: 'inviteFlag',
        with: 100,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
    ];
    return columns;
  }

  getFields() {
    return [
      <Output name="supplierCompanyNum" />,
      <Output name="supplierCompanyName" />,
      <Output name="contactName" />,
      <Output name="contactMobilephone" />,
      <Output name="contactMail" />,
      <Output name="priceCoefficient" />,
      <Output name="appendRemark" />,
    ];
  }

  render() {
    return (
      <div>
        <h4 className={styles['rfx-card-item-title-level-two']}>
          <div className={styles['rfx-card-item-title-line']} />
          {intl.get('ssrc.inquiryHall.view.inquiryHall.supplierInfo').d('供应商信息')}
        </h4>
        <div className={styles['rfx-card-item-form']}>
          <CollapseForm
            columns={3}
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
            dataSet={this.formDS}
            showLines={3}
            useWidthPercent
          >
            {this.getFields()}
          </CollapseForm>
        </div>

        <h4 className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-m'])}>
          <div className={styles['rfx-card-item-title-line']} />
          {intl.get('ssrc.inquiryHall.view.inquiryHall.viewableItem').d('可见物料')}
        </h4>
        <Table dataSet={this.tableDS} columns={this.getColumns()} />
      </div>
    );
  }
}
