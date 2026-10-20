import React, { Component } from 'react';
import { Table, Tag } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

export default class ListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // currentRecord: null,
    };
  }

  /**
   * 编辑
   * @param {object} record - 流程对象
   */
  editOption(record) {
    this.props.redirectDetail(record.templateId);
  }

  copyOption(record) {
    this.props.copyTemplate(record);
  }

  deleteOption(record) {
    this.props.deleteTemplate(record);
  }

  viewOption(record) {
    this.props.viewTemplate(record.templateId);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { dataSource, pagination, onChange, loading = false, tenantId } = this.props;
    const columns = [
      {
        title: intl.get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateType').d('模板类型'),
        dataIndex: 'templateTypeMeaning',
        width: 200,
      },
      {
        title: intl.get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateCode').d('模板编码'),
        dataIndex: 'templateCode',
        width: 200,
      },
      {
        title: intl.get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateName').d('模板名称'),
        dataIndex: 'templateName',
      },
      {
        title: intl.get('ssrc.scoreRptTemplate.model.scoreRptTemplate.status').d('状态'),
        dataIndex: 'enabledFlagMeaning',
        width: 100,
      },
      {
        title: intl.get('hzero.common.source').d('来源'),
        width: 120,
        align: 'center',
        render: (_, record) => {
          return tenantId === record.tenantId ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          );
        },
      },
      {
        title: intl
          .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.lastUpdateDate')
          .d('更新时间'),
        dataIndex: 'lastUpdateDate',
        width: 200,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        fixed: 'right',
        width: 200,
        render: (val, record) => (
          <span className="action-link">
            {
              <div>
                {tenantId !== record.tenantId && (
                  <a onClick={() => this.viewOption(record)}>
                    {intl.get(`hzero.common.button.view`).d('查看')}
                  </a>
                )}
                {tenantId === record.tenantId && (
                  <a onClick={() => this.editOption(record)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                )}
                {tenantId !== record.tenantId && (
                  <a onClick={() => this.copyOption(record)}>
                    {intl.get(`hzero.common.button.copy`).d('复制')}
                  </a>
                )}
                {tenantId === record.tenantId && (
                  <a onClick={() => this.deleteOption(record)}>
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </a>
                )}
              </div>
            }
          </span>
        ),
      },
    ].filter(Boolean);
    return (
      <Table
        bordered
        rowKey="templateId"
        loading={loading}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
