/**
 * ContactList - 企业信息-明细展示页面-联系人信息列表组件
 * @date: 2018-7-17
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Checkbox } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({ code: 'spfm.contactPerson' })
export default class ContactList extends PureComponent {
  render() {
    const { dataSource, ...others } = this.props;
    const tableProps = {
      columns: [
        {
          title: intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名'),
          dataIndex: 'name',
        },
        {
          title: intl.get('spfm.contactPerson.model.contactPerson.gender').d('性别'),
          dataIndex: 'gender',
          render: text =>
            text === 1
              ? intl.get('spfm.contactPerson.model.contactPerson.gender.male').d('男')
              : intl.get('spfm.contactPerson.model.contactPerson.gender.female').d('女'),
        },
        {
          title: intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱'),
          dataIndex: 'mail',
        },
        {
          title: intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码'),
          dataIndex: 'mobilephone',
        },
        {
          title: intl.get('spfm.contactPerson.model.contactPerson.telephone').d('固定电话'),
          dataIndex: 'telephone',
        },
        {
          title: intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型'),
          dataIndex: 'idType',
        },
        {
          title: intl.get('spfm.contactPerson.model.contactPerson.idNum').d('证件号码'),
          dataIndex: 'idNum',
        },
        {
          title: intl.get('spfm.contactPerson.model.contactPerson.department').d('部门'),
          dataIndex: 'department',
        },
        {
          title: intl.get('spfm.contactPerson.model.contactPerson.position').d('职位'),
          dataIndex: 'position',
        },
        {
          title: intl.get('hzero.common.remark').d('备注'),
          dataIndex: 'description',
        },
        {
          title: intl.get('spfm.contactPerson.model.contactPerson.defaultPerson').d('默认联系人'),
          dataIndex: 'defaultFlag',
          render: text => <Checkbox disabled checked={text === 1} />,
        },
        {
          title: intl.get('hzero.common.status.enable').d('启用'),
          dataIndex: 'enabledFlag',
          render: text => <Checkbox disabled checked={text === 1} />,
        },
      ],
      pagination: false,
      dataSource,
      rowKey: 'companyContactId',
      ...others,
    };
    return <Table {...tableProps} />;
  }
}
