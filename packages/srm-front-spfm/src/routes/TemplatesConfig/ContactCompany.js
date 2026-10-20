/**
 * ContactCompany - 联系企业
 * @date: 2019-6-21
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

@Form.create({ fieldNameProp: null })
export default class ContactCompany extends PureComponent {
  state = {
    selectedRows: [],
    cancelFlag: false,
  };

  componentDidMount() {
    const { onClearRows } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
  }

  /**
   * 保存选择行的数据
   * @param {Array} selectedRowKeys - 选中行主键
   * @param {Array} selectedRows - 选中行信息
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
      cancelFlag: selectedRows.length > 0,
    });
  }

  @Bind()
  deleteSelectRows(selectedRows) {
    const { onDeleteSelectRows } = this.props;
    this.setState({
      cancelFlag: false,
    });
    onDeleteSelectRows(selectedRows);
  }

  render() {
    const {
      onCreateRow,
      onEditRow,
      onCancelRow,
      onDeleteRow,
      contactCompanyList = [],
    } = this.props;
    const { selectedRows, cancelFlag } = this.state;
    const columns = [
      {
        title: intl.get('spfm.portalAssign.model.portalAssign.logisticsContactInfo').d('联系方式'),
        dataIndex: 'description',
        render: (text, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('description', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('spfm.portalAssign.model.portalAssign.logisticsContactInfo')
                          .d('联系方式'),
                      }),
                    },
                  ],
                  initialValue: record.description,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return text;
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
        render: (_, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return (
              <Badge
                status={record.enabledFlag ? 'success' : 'error'}
                text={
                  record.enabledFlag
                    ? intl.get('hzero.common.status.enable').d('启用')
                    : intl.get('hzero.common.status.disable').d('禁用')
                }
              />
            );
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        dataIndex: 'edit',
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  onDeleteRow(record, 'contactCompany');
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  onCancelRow(record, 'contactCompany');
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  onEditRow(record, 'contactCompany');
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedRows.map(o => o.configItemId),
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: ['update', 'create'].includes(record._status),
      }),
    };
    return (
      <React.Fragment>
        <div style={{ margin: '8px 0 16px', textAlign: 'right' }}>
          <Button
            onClick={() => this.deleteSelectRows(selectedRows)}
            disabled={!cancelFlag}
            style={{ marginLeft: '8px' }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          {contactCompanyList.length < 4 && (
            <Button
              type="primary"
              onClick={() => onCreateRow('contactCompany')}
              style={{ marginLeft: '8px' }}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          )}
        </div>
        <EditTable
          bordered
          rowKey="configItemId"
          columns={columns}
          pagination={false}
          dataSource={contactCompanyList}
          rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}
