/**
 * ContactPersonInfo - 企业认证预览-联系人信息
 * @date: 2018-12-18
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { Table, DataSet } from 'choerodon-ui/pro';
import ItemWrapper from './ItemWrapper';
import contactPersonDS from '../store/contactPersonDS';

export default class ContactPersonInfo extends React.PureComponent {
  contactPersonDS = new DataSet({
    ...contactPersonDS(),
    selection: false,
    autoQuery: false,
  });

  componentDidMount() {
    const { contactList = [] } = this.props;
    this.contactPersonDS.loadData(contactList);
  }

  render() {
    const columns = [
      {
        name: 'name',
        width: 150,
      },
      // {
      //   name: 'gender',
      //   width: 80,
      //   renderer: ({ value }) => {
      //     return +value === 1
      //       ? intl.get('hzero.common.gender.male').d('男')
      //       : +value === 0
      //       ? intl.get('hzero.common.gender.female').d('女')
      //       : null;
      //   },
      // },
      {
        name: 'mail',
        width: 150,
      },
      {
        name: 'mobilephone',
        width: 200,
        renderer: ({ record }) =>
          `${record.toData().internationalTelMeaning} | ${record.get('mobilephone')}`,
      },
      {
        name: 'department',
        width: 150,
      },
      {
        name: 'position',
        width: 150,
      },
      {
        name: 'telephone',
        width: 150,
      },
      {
        name: 'description',
        width: 150,
      },
      {
        name: 'defaultFlag',
        renderer: ({ value }) => yesOrNoRender(value),
        width: 80,
      },
      {
        width: 80,
        name: 'enabledFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];
    return (
      <ItemWrapper
        title={intl.get('spfm.certificationApproval.view.title.tab.contactTable').d('联系人信息')}
        message={intl
          .get('spfm.contactPerson.view.message.description')
          .d('提示: 真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。')}
      >
        <Table
          bordered
          rowKey="companyContactId"
          dataSet={this.contactPersonDS}
          columns={columns}
          pagination={false}
        />
      </ItemWrapper>
    );
  }
}
