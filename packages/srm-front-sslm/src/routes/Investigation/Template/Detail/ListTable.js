import React, { PureComponent, Fragment } from 'react';
import { Table, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

import { dateTimeRender } from 'utils/renderer';

@Form.create({ fieldNameProp: null })
export default class ListTable extends PureComponent {
  /**
   * 显示编辑模态框
   * @param {obj} record 当前行数据
   * @memberof ListTable
   */
  @Bind()
  showEditModal(record) {
    this.props.onEditLine(record);
  }

  @Bind()
  handleChangeColumn(dataIndex, value, record) {
    if (this.props.handleChangeColumn) {
      this.props.handleChangeColumn(dataIndex, value, record);
    }
  }

  /**
   * 跳转详情页
   * @param {Number} investigateTemplateId
   */
  @Bind()
  toTemplateDetail(e, { investigateTemplateId }) {
    e.preventDefault();
    const { onHandleToTemplateDetail } = this.props;
    if (onHandleToTemplateDetail) {
      onHandleToTemplateDetail(investigateTemplateId);
    }
  }

  render() {
    const { loading, dataSource, onSearchPaging, pagination, rowSelection, activeKey } = this.props;
    const columns = [
      {
        title:
          activeKey === 'site'
            ? intl.get(`sslm.referTemp.model.referTemp.preTemplateCode`).d('预置模板代码')
            : intl.get(`sslm.referTemp.model.referTemp.templateCode`).d('模板代码'),
        dataIndex: 'templateCode',
        width: 100,
      },
      {
        title: intl.get(`sslm.referTemp.model.referTemp.templateName`).d('模板名称'),
        dataIndex: 'templateName',
        width: 150,
        render: val => (
          <span
            style={{
              wordBreak: 'break-all',
              display: 'inline-block',
            }}
          >
            {val}
          </span>
        ),
      },
      {
        title: intl.get(`sslm.referTemp.model.referTemp.investigateTypeMeaning`).d('调查表类型'),
        dataIndex: 'investigateTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.referTemp.model.referTemp.industryMeaning`).d('行业'),
        dataIndex: 'industryMeaning',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get(`sslm.referTemp.model.referTemp.templateDetail`).d('模板明细'),
        dataIndex: 'templateDetail',
        width: 100,
        render: (text, record) => (
          <a onClick={e => this.toTemplateDetail(e, record)}>
            {intl.get(`sslm.referTemp.model.referTemp.templateDetails`).d('预览')}
          </a>
        ),
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    return (
      <Fragment>
        <Table
          loading={loading}
          rowKey="investigateTemplateId"
          bordered
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onSearchPaging}
          rowSelection={rowSelection}
          scroll={{ y: 300 }}
        />
      </Fragment>
    );
  }
}
