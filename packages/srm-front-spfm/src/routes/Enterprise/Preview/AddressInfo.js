/**
 * AddressInfo - 企业认证预览-地址信息
 * @date: 2018-12-19
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import ItemWrapper from './ItemWrapper';
import addressDS from '../store/addressDS';

export default class AddressInfo extends React.PureComponent {
  addressDS = new DataSet({
    ...addressDS(),
    selection: false,
    autoQuery: false,
  });

  componentDidMount() {
    const { addressList = [] } = this.props;
    this.addressDS.loadData(addressList);
  }

  render() {
    const columns = [
      {
        name: 'countryObj',
        width: 200,
      },
      {
        name: 'regionId',
        width: 200,
        renderer: ({ record }) => {
          return record.get('regionPathName');
        },
      },
      {
        name: 'addressDetail',
        width: 300,
      },
      {
        name: 'postCode',
        width: 200,
      },
      {
        name: 'description',
        width: 200,
      },
      {
        name: 'enabledFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];
    return (
      <ItemWrapper
        title={intl.get('spfm.address.model.address.title').d('地址信息')}
        message={intl
          .get(`spfm.address.view.message.description`)
          .d('提示: 您的企业可能在多地有工厂/分公司，建议维护完整信息，展示贵司规模。')}
      >
        <Table
          bordered
          rowKey="companyContactId"
          dataSet={this.addressDS}
          columns={columns}
          pagination={false}
        />
      </ItemWrapper>
    );
  }
}
