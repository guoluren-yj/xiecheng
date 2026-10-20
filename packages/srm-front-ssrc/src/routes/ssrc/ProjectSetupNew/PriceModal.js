/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-10-12 11:44:07
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-10-21 10:47:37
 */
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';
import styles from './index.less';

export default class PriceModal extends Component {
  componentDidMount() {
    const { PriceModalDS, priceModal } = this.props;
    Object.keys(priceModal).forEach((key) => {
      PriceModalDS.setQueryParameter(key, priceModal[key]);
    });
    PriceModalDS.query();
  }

  getColumns() {
    const columns = [
      {
        name: 'supplierCompanyNum',
        width: 110,
      },
      {
        name: 'supplierCompanyName',
        width: 160,
      },
      {
        name: 'taxPrice',
        width: 120,
        align: 'right',
      },
      {
        name: 'unitPrice',
        width: 120,
        align: 'right',
      },
      {
        name: 'uomName',
      },
      {
        name: 'currencyCode',
      },
      {
        name: 'taxCode',
      },
      {
        name: 'taxRate',
        align: 'right',
      },
      {
        name: 'priceSourceMeaning',
      },
    ];
    return columns;
  }

  render() {
    const { PriceModalDS } = this.props;
    return (
      <React.Fragment>
        <Table
          customizable
          className={styles['price-modal']}
          dataSet={PriceModalDS}
          columns={this.getColumns()}
          style={getTableFixSelfAdaptStyle()?.tableMaxHeight}
        />
      </React.Fragment>
    );
  }
}
