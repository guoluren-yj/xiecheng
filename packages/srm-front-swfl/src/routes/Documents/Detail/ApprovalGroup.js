import React, { Component } from 'react';
import { Table, Popconfirm, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import { tableScrollWidth, isTenantRoleLevel } from 'utils/utils';
import { operatorRender } from 'utils/renderer';
import styles from './index.less';

export default class ApprovalGroup extends Component {
  /**
   * 编辑
   * @param {object} record - 数据对象
   */
  @Bind()
  editOption(record) {
    if (record) {
      this.props.onEdit(record);
    } else {
      this.props.onAdd();
    }
  }

  /**
   * 删除
   * @param {object} record - 数据对象
   */
  @Bind()
  deleteOption(record) {
    this.props.onDelete(record);
  }

  @Bind()
  columnDef(record) {
    this.props.columnDef(record);
  }

  @Bind()
  dataMaintenance(record) {
    this.props.dataMaintenance(record);
  }

  @Bind()
  handleChange(pagination) {
    const { handleChangePagination = () => {} } = this.props;
    handleChangePagination({ page: pagination });
  }

  render() {
    const { loading, predefined, dataSource = [], pagination } = this.props;
    const isSiteFlag = !isTenantRoleLevel();
    const columns = [
      {
        title: intl.get('hwfp.common.model.common.defCode').d('编码'),
        dataIndex: 'defCode',
        width: 300,
      },
      {
        title: intl.get('hwfp.common.model.common.defName').d('名称'),
        width: 300,
        dataIndex: 'defName',
      },
      {
        title: intl.get('hwfp.common.model.common.illustrate').d('说明'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 250,
        render: (val, record) => {
          const actionField = isSiteFlag
            ? []
            : [
                {
                  key: 'edit',
                  ele: (
                    <a onClick={() => this.editOption(record)}>
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </a>
                  ),
                  len: 2,
                  title: intl.get('hzero.common.button.edit').d('编辑'),
                },
                {
                  key: 'delete',
                  ele: (
                    <Popconfirm
                      placement="topRight"
                      title={intl
                        .get('hzero.common.message.confirm.delete')
                        .d('是否删除此条记录？')}
                      onConfirm={() => this.deleteOption(record)}
                    >
                      <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                    </Popconfirm>
                  ),
                  len: 2,
                  title: intl.get('hzero.common.button.delete').d('删除'),
                },
              ];
          const operators = [
            {
              key: 'columnDef',
              ele: (
                <a onClick={() => this.columnDef(record)}>
                  {intl.get('hwfp.documents.view.message.title.columnDefinition').d('列定义')}
                </a>
              ),
              len: 3,
              title: intl.get('hwfp.documents.view.message.title.columnDefinition').d('列定义'),
            },
            {
              key: 'dataMaintenance',
              ele: (
                <a onClick={() => this.dataMaintenance(record)}>
                  {intl.get('hwfp.documents.view.message.title.dataMaintenance').d('数据维护')}
                </a>
              ),
              len: 4,
              title: intl.get('hwfp.documents.view.message.title.dataMaintenance').d('数据维护'),
            },
            ...actionField,
          ];
          if (!predefined && !record.copyFlag) {
            return operatorRender(operators, record);
          }
        },
      },
    ];
    return (
      <>
        {!isSiteFlag && (
          <div
            style={{ width: '100%', height: 28, position: 'relative' }}
            className={styles['button-margin-bottom']}
          >
            <Button style={{ position: 'absolute', right: 0 }} onClick={() => this.editOption()}>
              {intl.get('hwfp.documents.view.button.add').d('新增')}
            </Button>
          </div>
        )}
        <Table
          bordered
          scroll={{ x: tableScrollWidth(columns) }}
          rowKey={(val, index) => index + 1}
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          className={styles['approval-group-list']}
          onChange={this.handleChange}
        />
      </>
    );
  }
}
