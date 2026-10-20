import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { valueMapMeaning, dateTimeRender } from 'utils/renderer';

import { INQUIRY, BID, getSourceName, getSourceCategoryName } from '@/utils/globalVariable';

const promptCode = 'ssrc.offlineResultEntry';
/**
 * 数据列表
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
export default class TableList extends PureComponent {
  /**
   * 删除
   * @param {object} record - 数据对象
   */
  deleteOption(record) {
    this.props.onDelete(record);
  }

  /**
   *跳转到明细页面
   *
   */
  @Bind()
  handleToDetail(record) {
    const { handleToDetail } = this.props;
    handleToDetail(record);
  }

  /**
   * 报价响应
   */
  @Bind()
  quotationFeedBack(record) {
    const { onQuotationFeedBack } = this.props;
    onQuotationFeedBack(record);
  }

  render() {
    const {
      customizeTable,
      loading,
      dataSource,
      pagination,
      onChange,
      sourceKey = INQUIRY,
      sourceMethod = [],
      sourceCategory = [],
      auctionDirection = [],
      remote,
    } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'rfxStatus',
        width: 80,
        fixed: 'left',
        render: (val, record) => record.rfxStatusMeaning,
      },
      {
        title:
          sourceKey === INQUIRY
            ? intl.get(`${promptCode}.model.offlineEntry.RFXNo.`).d('RFx单号')
            : intl.get(`${promptCode}.model.offlineEntry.BIDNo.`).d('招标编号'),
        dataIndex: 'rfxNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => {
          const node = record.observerFlag ? (
            val
          ) : (
            <a onClick={() => this.handleToDetail(record)}>{val}</a>
          );
          return remote
            ? remote.process(
                'SSRC_SSRC_OFFLINE_RESULT_ENTRY_PROCESS_TABLE_LIST_RFX_NUM_COLUMN',
                node,
                {
                  record,
                  bidFlag: sourceKey === BID,
                }
              )
            : node;
        },
      },
      {
        title:
          sourceKey === INQUIRY
            ? intl.get(`${promptCode}.model.offlineEntry.inquiryTitle`).d('询价单标题')
            : intl.get(`${promptCode}.model.offlineEntry.newBidTitle`).d('招标事项'),
        dataIndex: 'rfxTitle',
        width: 200,
        fixed: 'left',
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.purchOrgName`).d('采购组织名称'),
        dataIndex: 'purOrganizationName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get('ssrc.common.companyName').d('公司名称'),
        dataIndex: 'companyName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.createdUnitName`).d('创建人部门'),
        dataIndex: 'createdUnitName',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.model.offlineEntry.commonSourcingTemplate`, {
            sourceName: getSourceName(sourceKey === BID),
          })
          .d('{sourceName}模板'),
        dataIndex: 'templateName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      sourceKey === INQUIRY
        ? {
            title: intl.get(`${promptCode}.model.offlineEntry.sourcingCategory`).d('寻源类别'),
            dataIndex: 'sourceCategory',
            width: 100,
            render: (val) => valueMapMeaning(sourceCategory, val),
          }
        : null,
      {
        title: intl.get(`${promptCode}.model.offlineEntry.quotationRoundNumber`).d('多轮报价轮次'),
        dataIndex: 'quotationRoundNumber',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.model.offlineEntry.commonRoundNumber`, {
            sourceCategoryName: getSourceCategoryName(sourceKey === BID),
          })
          .d('{sourceCategoryName}发起次数'),
        dataIndex: 'roundNumber',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.sourcingApproach`).d('寻源方式'),
        dataIndex: 'sourceMethod',
        render: (val) => valueMapMeaning(sourceMethod, val),
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.quotationType`).d('报价方式'),
        dataIndex: 'quotationTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.currency`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.model.common.documentCreationDate`).d('单据创建时间'),
        dataIndex: 'sourceCreationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.biddingDirection`).d('报价方向'),
        dataIndex: 'auctionDirection',
        width: 100,
        render: (val) => valueMapMeaning(auctionDirection, val),
      },
      {
        title: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
        dataIndex: 'createByName',
        width: 100,
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      { code: `SSRC.${sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.LIST` },
      <Table
        bordered
        rowKey="rfxHeaderId"
        loading={loading}
        columns={columns}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onChange(page, true)}
      />
    );
  }
}
