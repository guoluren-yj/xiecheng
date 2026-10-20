/**
 * 采购方视角 缴费记录
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2021-01-06
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Table } from 'choerodon-ui/pro';
import StaticSearchBar from '@/components/StaticSearchBar';

import { getQueryConfig } from './queryConfig';

class BuyerRecord extends Component {
  @Bind()
  columns() {
    return [
      { name: 'paymentNo', width: 180 },
      { name: 'supplierTenantCode', width: 100 },
      { name: 'supplierTenantName', width: 160 },
      { name: 'paymentFee', width: 120 },
      { name: 'payUser', width: 120 },
      { name: 'paymentDate', width: 100 },
      { name: 'startDate', width: 100 },
      { name: 'endDate', width: 100 },
    ].filter(Boolean);
  }

  @Bind()
  getFilters() {
    return { ...getQueryConfig('buyer') };
  }

  @Bind()
  onQuery({ params }) {
    const sortArr = params.customizeOrderField ? params.customizeOrderField.split(':') : [];
    this.props.listDS.queryDataSet.data = [
      {
        ...params,
        paymentDate: params.paymentDate ? `${params.paymentDate.substring(0, 10)} 00:00:00` : '',
        startDate: params.startDate ? `${params.startDate.substring(0, 10)} 00:00:00` : '',
        endDate: params.endDate ? `${params.endDate.substring(0, 10)} 00:00:00` : '',
        sortField: sortArr.length ? sortArr[0] : '',
        sortType: sortArr.length ? sortArr[1] : '',
        customizeOrderField: null,
        needGroup: null,
        supplierTenantId: null,
      },
    ];
    this.props.listDS.query();
  }

  render() {
    return (
      <>
        <StaticSearchBar
          cacheState
          clearButton
          onRef={(ref) => {
            this.SearchBarRef = ref;
          }}
          searchCode="AMKT.SUPPLIER_INVOIC_FILTER"
          filters={this.getFilters()}
          dataSet={[this.props.listDS]}
          onQuery={this.onQuery}
          showLoading={false}
        />
        <div style={{ height: `calc(100vh - 300px)` }}>
          <Table
            dataSet={this.props.listDS}
            columns={this.columns()}
            queryBar="none"
            customizable
            customizedCode="SPFM_AMKT_SUPPLIER_INVOIC_PLACE"
            autoHeight={{ type: 'maxHeight', diff: 20 }}
          />
        </div>
      </>
    );
  }
}

export default BuyerRecord;
