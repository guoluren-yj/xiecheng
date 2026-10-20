/*
 * ListTable - 我收到的调查表数据列表信息
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

/**
 * 我收到的调查表数据列表信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @return React.element
 */

export default class ListTable extends PureComponent {
  @Bind()
  handleToDetail({ investgHeaderId, investigateTemplateId, tenantId, tenantNum }) {
    if (this.props.handleToDetail) {
      this.props.handleToDetail(investgHeaderId, investigateTemplateId, tenantId, tenantNum);
    }
  }

  render() {
    const { loading, dataSource, searchPaging, pagination } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.common.model.investigate.code`).d('调查表编号'),
        dataIndex: 'investgNumber',
        width: 150,
        fixed: 'left',
        render: (value, record) => {
          // 副调查表编码置灰,显示提示(发布和拒绝状态下)
          if (
            record &&
            ['RELEASE', 'REJECT'].includes(record.processStatus) &&
            record.mergerInvestigateFlag === 1 &&
            record.mainInvestigateFlag === 0
          ) {
            return (
              <Tooltip
                title={
                  intl
                    .get(`sslm.common.view.investigateWrite.investgNumberTip`)
                    .d('当前调查表为合并调查表中的副调查表，无需填写，只需填写其主调查表') +
                  record.mainInvestigateNum
                }
                placement="top"
              >
                {value}
              </Tooltip>
            );
          } else {
            return <a onClick={() => this.handleToDetail(record)}>{value}</a>;
          }
        },
      },
      {
        title: intl.get(`sslm.common.model.investigate.status`).d('调查表状态'),
        dataIndex: 'processStatusMeaning',
        fixed: 'left',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.customer.code`).d('客户编码'),
        dataIndex: 'companyNum',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.view.customer.name`).d('客户名称'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.view.company.word`).d('公司代码'),
        dataIndex: 'partnerCompanyNum',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.view.company.companyName`).d('公司名称'),
        dataIndex: 'partnerCompanyName',
      },
      {
        title: intl.get(`sslm.common.model.investigate.type`).d('调查表类型'),
        dataIndex: 'investigateTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.investigate.level`).d('调查表管控维度'),
        dataIndex: 'investigateLevelMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.investigate.template.name`).d('调查表模板名称'),
        dataIndex: 'templateName',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.view.creator.name`).d('创建人'),
        dataIndex: 'realName',
        width: 150,
      },
      {
        title: intl.get(`hzero.common.date.release`).d('发布日期'),
        dataIndex: 'releaseDate',
        width: 160,
        render: dateTimeRender,
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map(item => (isNumber(item.width) ? item.width : 0))) + 180;
    return (
      <Table
        bordered
        scroll={{ x: scrollX }}
        loading={loading}
        rowKey="investgHeaderId"
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={searchPaging}
      />
    );
  }
}
