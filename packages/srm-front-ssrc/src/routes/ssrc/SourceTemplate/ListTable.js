/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: yiping.liu
 * @LastEditTime: 2023-09-26 09:30:07
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { noop } from 'lodash';
import { fetchHistoryVersion } from '@/services/sourceTemplateService';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import querystring from 'querystring';
/**
 * 寻源模板- 列表展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
const promptCode = 'ssrc.sourceTemplate';

export default class ListTable extends PureComponent {
  // 历史版本跳转
  @Bind()
  directDetail(record = {}) {
    const { templateNum, versionNumber, sourceCategory } = record;
    // const headerTitle =
    //   intl
    //     .get(`${promptCode}.view.message.title.sourcingTemplateNum`, { templateNum })
    //     .d(`寻源模板（${templateNum}）`) +
    //   intl
    //     .get(`${promptCode}.model.template.versionNumberAndVar`, { versionNumber })
    //     .d(`版本${versionNumber}`);
      const headerTitle =
        intl
          .get(`srm.common.tab.title.ssrc.sourcingTemplateNum`, { templateNum })
          .d(`寻源模板（${templateNum}）`) +
        intl
          .get(`srm.common.tab.title.ssrc.versionNumberAndVar`, { versionNumber })
          .d(`版本${versionNumber}`);
    parent.openTab({
      key: `/ssrc/source-template/${
        sourceCategory === 'RFI' || sourceCategory === 'RFP' ? 'rf-update' : 'update'
      }/${record.templateId}`,
      path: `/ssrc/source-template/${
        sourceCategory === 'RFI' || sourceCategory === 'RFP' ? 'rf-update' : 'update'
      }/${record.templateId}`,
      title: headerTitle,
      closable: true,
      search: querystring.stringify({
        isHistory: true,
        versionNumber: record.versionNumber,
        templateNum: record.templateNum,
      }),
    });
  }

  @Bind()
  historyVersionColumns() {
    const columns = [
      {
        title: intl.get(`${promptCode}.model.template.versionNumber`).d('版本'),
        dataIndex: 'versionNumber',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.template.templateName`).d('模板名称'),
        dataIndex: 'templateName',
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.publishDate').d('发布时间'),
        dataIndex: 'releaseDate',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        render: (_, record) => (
          <React.Fragment>
            <a onClick={() => this.directDetail(record)}>
              {intl.get('hzero.common.button.viewDetails').d('查看详情')}
            </a>
          </React.Fragment>
        ),
      },
    ];
    return columns;
  }

  @Bind()
  async openModal(record = {}) {
    const { organizationId } = this.props;
    const { templateNum, templateId, sourceCategory } = record;
    const params = { organizationId, templateNum, templateId, sourceCategory };
    const menus = await fetchHistoryVersion(params);
    if (getResponse(menus)) {
      if (menus.length) {
        Modal.open({
          closable: true,
          title: intl.get('hzero.common.button.historyVersion').d('历史版本'),
          key: 'source-template-history-version',
          drawer: true,
          style: {
            width: 600,
          },
          children: (
            <Table columns={this.historyVersionColumns()} dataSource={menus} pagination={false} />
          ),
          afterClose: () => {},
        });
      } else {
        const msg = {
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: intl
            .get(`${promptCode}.model.template.historyVersionNull`)
            .d('该模板没有历史版本'),
        };
        notification.warning(msg);
      }
    }
  }

  @Bind()
  renderColumns() {
    const {
      onDetail,
      onSaveCopySourceTemp,
      isBid,
      isReadOnly = false,
      onDetailNum = noop,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.template.templateNum`).d('模板编码'),
        dataIndex: 'templateNum',
        width: 150,
        render: (value, record) =>
          isReadOnly ? <a onClick={() => onDetailNum(record)}>{value}</a> : value,
      },
      {
        title: intl.get(`${promptCode}.model.template.templateName`).d('模板名称'),
        dataIndex: 'templateName',
      },
      {
        title: intl.get(`${promptCode}.model.template.sourcingCategory`).d('寻源类别'),
        dataIndex: 'secondarySourceCategoryMeaning',
        width: 140,
        render: (_, record) =>
          isBid ? record.secondarySourceCategoryMeaning : record.sourceCategoryMeaning,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'templateStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.template.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.template.updateTime`).d('更新时间'),
        dataIndex: 'lastUpdateDate',
        width: 160,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 220,
        render: (_, record) => (
          <React.Fragment>
            {isReadOnly ? null : (
              <>
                <a onClick={() => onDetail(record)} style={{ marginRight: 16 }}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                <a onClick={() => onSaveCopySourceTemp(record)} style={{ marginRight: 16 }}>
                  {intl.get('hzero.common.button.copy').d('复制')}
                </a>
              </>
            )}
            <a onClick={() => this.openModal(record)}>
              {intl.get('hzero.common.button.historyVersion').d('历史版本')}
            </a>
          </React.Fragment>
        ),
      },
    ].filter(Boolean);
    return columns;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onChange, rowSelection } = this.props;

    return (
      <Table
        bordered
        rowKey="primaryUuid"
        loading={loading}
        columns={this.renderColumns()}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
        rowSelection={rowSelection}
      />
    );
  }
}
