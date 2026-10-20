/*
 * ListTable - 调查表审批列表
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';
import { Record } from 'choerodon-ui/dataset';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';

import ListTooltip from '@/routes/components/AiApprove/ListTooltip';

/**
 * 调查表审批列表
 * @extends {Component} - React.Component
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */

@formatterCollections({
  code: ['sslm.investigCorrelat', 'sslm.common'],
})
export default class ListTable extends Component {
  /**
   * 显示编辑模态框
   * @param {obj} record 当前行数据
   */
  @Bind()
  showEditModal(record) {
    this.props.editLine(record);
  }

  @Bind()
  handleToDetail({ investgHeaderId, investigateTemplateId }) {
    if (this.props.handleToDetail) {
      this.props.handleToDetail(investgHeaderId, investigateTemplateId);
    }
  }

  render() {
    const {
      loading,
      dataSource,
      searchPaging,
      pagination,
      code,
      custLoading,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.common.model.investigate.code`).d('调查表编号'),
        dataIndex: 'investgNumber',
        width: 150,
        fixed: 'left',
        render: (value, record) => {
          // 副调查表编码置灰,显示提示（提交状态下）
          if (
            record &&
            ['SUBMIT'].includes(record.processStatus) &&
            record.mergerInvestigateFlag === 1 &&
            record.mainInvestigateFlag === 0
          ) {
            return (
              <Tooltip
                title={
                  intl
                    .get(`sslm.common.view.investigateApproval.investgNumberTip`)
                    .d('当前调查表为合并调查表中的副调查表，无需操作，只需审批其主调查表') +
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
        width: 100,
      },
      {
        dataIndex: 'aiApproveStatus',
        title: intl.get('sslm.common.button.intelligentReview').d('智能预审'),
        width: 140,
        render: (value, record) => {
          return value ? (
            <ListTooltip value={value} name="aiApproveStatus" record={new Record(record)} />
          ) : (
            '-'
          );
        },
      },
      {
        title: intl.get(`sslm.common.view.supplier.code`).d('供应商编码'),
        dataIndex: 'partnerCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierZhOrEnCompanyNum',
      },
      {
        title: intl.get(`sslm.common.view.companyInfo.registeredCapital`).d('注册资本(万元)'),
        dataIndex: 'partnerRegisteredCapital',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.companyInfo.registerDate`).d('成立日期'),
        dataIndex: 'partnerBuildDate',
        width: 110,
        render: dateRender,
      },
      {
        title: intl.get(`sslm.common.view.company.code`).d('公司编码'),
        dataIndex: 'companyNum',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.view.company.companyName`).d('公司名称'),
        dataIndex: 'companyName',
        width: 200,
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
        title: intl.get(`sslm.common.model.investigate.template.code`).d('调查表模板代码'),
        dataIndex: 'templateCode',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.investigate.template.name`).d('调查表模板名称'),
        dataIndex: 'templateName',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.view.creator.name`).d('创建人'),
        dataIndex: 'createUserName',
        width: 100,
      },
      {
        title: intl.get(`sslm.investigCorrelat.view.message.submitDate`).d('提交日期'),
        dataIndex: 'submitDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('sslm.investigCorrelat.view.message.investigate.source').d('调查表来源'),
        dataIndex: 'triggerByCodeMeaning',
        width: 140,
      },
    ];
    const scrollX = sum(columns.map(item => (isNumber(item.width) ? item.width : 150)));
    return customizeTable(
      {
        code,
      },
      <Table
        bordered
        scroll={{ x: scrollX }}
        rowKey="investgHeaderId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={searchPaging}
        custLoading={custLoading}
      />
    );
  }
}
