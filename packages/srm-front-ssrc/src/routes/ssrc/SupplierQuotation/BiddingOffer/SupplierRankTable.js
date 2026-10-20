/**
 * 供应商总价排名表
 * @date: 2021-03-12
 * @author: Goku<xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */

import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { isNull, isUndefined } from 'lodash';
import { numberSeparatorRender } from '@/utils/renderer';

// 根据权限控制渲染
function permissionRender({ value }) {
  return isNull(value) || isUndefined(value) ? (
    '***'
  ) : (
    <Popover placement="topLeft" content={value}>
      {value}
    </Popover>
  );
}

// 根据权限控制渲染
function numberPermissionRender({ value }) {
  return isNull(value) || isUndefined(value) ? (
    '***'
  ) : (
    <Popover placement="topLeft" content={value}>
      {numberSeparatorRender(value)}
    </Popover>
  );
}
export default class SupplierRankTable extends PureComponent {
  componentDidMount() {
    const { rfxHeaderId, quotationHeaderId, supplierRankTableDS } = this.props;
    supplierRankTableDS.setQueryParameter('rfxHeaderId', rfxHeaderId);
    supplierRankTableDS.setQueryParameter('quotationHeaderId', quotationHeaderId);
    supplierRankTableDS.query();
  }

  get columns() {
    const columns = [
      {
        name: 'rank',
        width: 100,
        align: 'center',
      },
      {
        name: 'supplierCompanyName',
        width: 200,
        renderer: permissionRender,
      },
      {
        name: 'totalAmount',
        width: 150,
        align: 'center',
        renderer: numberPermissionRender,
      },
      {
        name: 'netAmount',
        width: 150,
        align: 'center',
        renderer: numberPermissionRender,
      },
    ];
    return columns;
  }

  render() {
    const { supplierRankTableDS } = this.props;
    return <Table dataSet={supplierRankTableDS} columns={this.columns} />;
  }
}
