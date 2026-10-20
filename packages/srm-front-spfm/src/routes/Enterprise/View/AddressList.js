/**
 * AddressList - 企业信息-明细展示页面-地址信息列表组件
 * @date: 2018-7-17
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Checkbox } from 'hzero-ui';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({ code: 'spfm.address' })
export default class AddressList extends PureComponent {
  render() {
    const { dataSource, ...others } = this.props;
    const tableProps = {
      columns: [
        {
          title: intl.get('spfm.address.model.address.countryId').d('国家'),
          dataIndex: 'countryName',
        },
        {
          title: intl.get('spfm.address.model.address.regionCity').d('省/市/区'),
          dataIndex: 'regionPathName',
        },
        {
          title: intl.get('spfm.address.model.address.addressDetail').d('详细地址'),
          dataIndex: 'addressDetail',
        },
        {
          title: intl.get('spfm.address.model.address.postCode').d('邮政编码'),
          dataIndex: 'postCode',
        },
        {
          title: intl.get('spfm.address.model.address.description').d('地址备注'),
          dataIndex: 'description',
        },
        {
          title: intl.get('hzero.common.status.enable').d('启用'),
          dataIndex: 'enabledFlag',
          render: text => <Checkbox disabled checked={text === 1} />,
        },
      ],
      pagination: false,
      dataSource,
      rowKey: 'companyAddressId',
      ...others,
    };
    return <Table {...tableProps} />;
  }
}
