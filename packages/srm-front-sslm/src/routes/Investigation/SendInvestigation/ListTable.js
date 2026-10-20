/*
 * ListTable - 我发出的调查表数据列表信息
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';
import { Tooltip } from 'hzero-ui';
import { Record } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import Table from 'srm-front-boot/lib/components/Table';
import formatterCollections from 'utils/intl/formatterCollections';
import { dateTimeRender } from 'utils/renderer';

import ListTooltip from '@/routes/components/AiApprove/ListTooltip';

/**
 * 我发出的调查表数据列表信息
 * @extends {Component} - React.Component
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */

@formatterCollections({ code: ['sslm.common'] })
export default class ListTable extends Component {
  @Bind()
  handleToDetail(record) {
    if (this.props.handleToDetail) {
      this.props.handleToDetail(record);
    }
  }

  render() {
    const {
      loading,
      dataSource,
      searchPaging,
      pagination,
      selectedRows,
      custLoading,
      customizeTable,
      handleSelectChang,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.common.model.investigate.code`).d('调查表编号'),
        dataIndex: 'investgNumber',
        width: 150,
        fixed: 'left',
        render: (value, record) => {
          // 副调查表编码置灰,显示提示(非完成状态下:除了已审批和已取消状态)
          if (
            record &&
            !['CANCEL', 'APPROVE'].includes(record.processStatus) &&
            record.mergerInvestigateFlag === 1 &&
            record.mainInvestigateFlag === 0
          ) {
            return (
              <Tooltip
                title={
                  intl
                    .get(`sslm.common.view.sendInvestigation.investgNumberTip`)
                    .d('当前调查表为合并调查表中的副调查表，暂无法操作和查看信息，可查看主调查表') +
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
        width: 150,
      },
      {
        title: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierZhOrEnCompanyNum',
      },
      {
        title: intl.get(`sslm.common.view.company.code`).d('公司编码'),
        dataIndex: 'companyNum',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.view.company.companyName`).d('公司名称'),
        dataIndex: 'companyName',
        width: 150,
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
        title: intl.get(`sslm.common.model.investigate.template.versionNumber`).d('版本号'),
        dataIndex: 'versionNumber',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.view.creator.name`).d('创建人'),
        dataIndex: 'createUserName',
        width: 150,
      },
      {
        title: intl.get('sslm.common.view.creator.unitName').d('创建人部门'),
        dataIndex: 'unitName',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.investigate.processDate`).d('审批日期'),
        dataIndex: 'processDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.date.release`).d('发布日期'),
        dataIndex: 'releaseDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl
          .get(`sslm.investigationCorrelation.date.supplierReleaseDate`)
          .d('供应商提交时间'),
        dataIndex: 'submitDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sslm.common.view.creation.time`).d('创建时间'),
        dataIndex: 'createDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('sslm.investigCorrelat.view.message.investigate.source').d('调查表来源'),
        dataIndex: 'triggerByCodeMeaning',
        width: 140,
      },
    ];
    const rowSelection = {
      selectedRows,
      selectedRowKeys: selectedRows.map(n => n.investgHeaderId),
      onChange: handleSelectChang,
    };
    const scrollX = sum(columns.map(item => (isNumber(item.width) ? item.width : 150)));
    return customizeTable(
      {
        code: 'SSLM.SEND_INVESTIGATION.LIST_TABLE',
        readOnly: true,
      },
      <Table
        bordered
        custLoading={custLoading}
        scroll={{ x: scrollX }}
        loading={loading}
        rowKey="investgHeaderId"
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={searchPaging}
        rowSelection={rowSelection}
      />
    );
  }
}
