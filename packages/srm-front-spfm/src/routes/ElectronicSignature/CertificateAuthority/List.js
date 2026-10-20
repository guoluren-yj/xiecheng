/*
 * @Description: List.js - CA认证
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-05 16:09:07
 * @LastEditTime: 2019-08-20 17:16:00
 * @copyright: Copyright (c) 2019, Hand
 */
import React from 'react';
import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum } from 'lodash';

import Switch from 'components/Switch';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
// import Checkbox from 'components/Checkbox';

const FormItem = Form.Item;

export default class List extends React.Component {
  @Bind()
  protocolType(val, record) {
    const { redirectDetail = (e) => e } = this.props;
    return <a onClick={() => redirectDetail(record)}>{val}</a>;
  }

  @Bind()
  onHandle(e, record) {
    if (!e) {
      record.$form.setFieldsValue({ mobileVerifyFlag: 0 });
    }
  }

  render() {
    const { loading, dataSource, onSearch, pagination, onHandleRecord } = this.props;
    const columns = [
      {
        title: intl.get('entity.company.code').d('公司编码'),
        dataIndex: 'companyNum',
        width: 150,
        render: this.protocolType,
      },
      {
        title: intl.get('entity.company.name').d('公司名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`spfm.certificateAuthority.model.certificateAuthority.status`).d('CA状态'),
        dataIndex: 'caAuthStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: (val, record) => (
          // ['update', 'create'].includes(record._status) ?
          <FormItem>
            {record.$form.getFieldDecorator('enabledFlag', {
              initialValue: record.enabledFlag === 1 ? 1 : 0,
            })(
              <Switch
                disabled={record.caAuthStatus !== 'CA_SUCCESS'}
                onChange={(e) => {
                  onHandleRecord(record);
                  this.onHandle(e, record);
                }}
              />
            )}
          </FormItem>
        ),
      },
      // {
      //   title: intl
      //     .get(`spfm.certificateAuthority.model.certificateAuthority.Verify`)
      //     .d('手机验证'),
      //   dataIndex: 'mobileVerifyFlag',
      //   width: 100,
      //   render: (val, record) => (
      //     <FormItem>
      //       {record.$form.getFieldDecorator('mobileVerifyFlag', {
      //         initialValue: record.mobileVerifyFlag === 1 ? 1 : 0,
      //       })(
      //         <Switch
      //           disabled={!record.$form.getFieldValue('enabledFlag')}
      //           onChange={() => onHandleRecord(record)}
      //         />
      //       )}
      //     </FormItem>
      //   ),
      // },
    ];
    const tableProps = {
      columns,
      loading,
      dataSource,
      bordered: true,
      rowKey: 'companyId',
      onChange: (page) => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };
    return (
      <React.Fragment>
        <EditTable {...tableProps} />
      </React.Fragment>
    );
  }
}
