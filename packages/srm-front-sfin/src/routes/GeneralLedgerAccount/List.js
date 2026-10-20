/**
 * index.js - 总账科目定义列表
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React from 'react';
import { Form, Input } from 'hzero-ui';
import EditTable from 'components/EditTable';

import { sum } from 'lodash';
import intl from 'utils/intl';
import Switch from 'components/Switch';

const FormItem = Form.Item;

export default class List extends React.Component {
  render() {
    const { loading, dataSource, onSearch, pagination, onHandleRecord } = this.props;
    const tableProps = {
      columns: [
        {
          title: intl.get(`smdm.common.model.project.code`).d('科目编码'),
          dataIndex: 'pcTypeCode',
          width: 240,
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator(`pcTypeCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.common.model.project.code`).d('科目编码'),
                    }),
                  },
                  {
                    pattern: /^[a-zA-Z\d]+$/,
                    message: intl
                      .get(`spcm.common.model.common.verifyProject`)
                      .d('科目编码只能由字母或数字组成'),
                  },
                  // {
                  //   max: 12,
                  //   message: intl.get('hzero.common.validation.max', { max: 12 }),
                  // },
                ],
                initialValue: record.pcTypeCode,
              })(<Input typeCase="upper" />)}
            </FormItem>
          ),
        },
        {
          title: intl.get(`smdm.common.model.project.desc`).d('科目描述'),
          dataIndex: 'pcTypeName',
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator(`pcTypeName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.common.model.project.desc`).d('科目描述'),
                    }),
                  },
                ],
                initialValue: record.pcTypeName,
              })(<Input typeCase="upper" />)}
            </FormItem>
          ),
        },
        {
          title: intl.get(`hzero.common.status`).d('状态'),
          dataIndex: 'companyName',
          width: 100,
        },
        {
          title: intl.get(`hzero.common.view.sstaHandle`).d('操作'),
          dataIndex: 'enabledFlag',
          width: 100,
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: record.enabledFlag === 0 ? 0 : 1,
              })(<Switch onChange={() => onHandleRecord(record)} />)}
            </FormItem>
          ),
        },
      ],
      loading,
      dataSource,
      bordered: true,
      rowKey: 'pcTemplateId',
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
