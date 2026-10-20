import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { yesOrNoRender, valueMapMeaning, dateTimeRender } from 'utils/renderer';

const promptCode = 'ssrc.queryRfq';
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
  inquiryDetail(record) {
    const { onInquiryDetail } = this.props;
    onInquiryDetail(record);
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
      loading,
      dataSource,
      pagination,
      rowSelection,
      onChange,
      sourceMethod = [],
      auctionDirection = [],
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'rfxStatusMeaning',
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号'),
        dataIndex: 'rfxNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => <a onClick={() => this.inquiryDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.inquiryTitle`).d('询价单标题'),
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
        title: intl.get(`${promptCode}.model.queryRfq.quotationStartTime`).d('报价开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.quotationDeadline`).d('报价截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.purchOrgName`).d('采购组织名称'),
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
        title: intl.get('ssrc.common.company').d('公司'),
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
        title: intl.get(`${promptCode}.model.queryRfq.createdUnitName`).d('创建人部门'),
        dataIndex: 'createdUnitName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.quoteResponse`).d('报价响应'),
        dataIndex: 'quotationFeedBack',
        width: 100,
        render: (val, record) => <a onClick={() => this.quotationFeedBack(record)}>{val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.preQualification`).d('资格预审'),
        dataIndex: 'preQualificationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.applicationDeadline`).d('资格预审截止时间'),
        dataIndex: 'preQualificationEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.postQualification`).d('资格后审'),
        dataIndex: 'postQualificationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl
          .get(`${promptCode}.model.queryRfq.postQualificationDeadline`)
          .d('资格后审截止时间'),
        dataIndex: 'postQualificationEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.expertEvaluation`).d('专家评分'),
        dataIndex: 'expertScoreFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.sourcingTemplate`).d('寻源模板'),
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
      {
        title: intl.get(`${promptCode}.model.queryRfq.sourcingApproach`).d('寻源方式'),
        dataIndex: 'sourceMethod',
        width: 100,
        render: (val) => valueMapMeaning(sourceMethod, val),
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.quotationType`).d('报价方式'),
        dataIndex: 'quotationTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.sealedQuotation`).d('密封报价'),
        dataIndex: 'sealedQuotationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.currency`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
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
        title: intl.get(`${promptCode}.model.queryRfq.biddingDirection`).d('报价方向'),
        dataIndex: 'auctionDirection',
        width: 100,
        render: (val) => valueMapMeaning(auctionDirection, val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注'),
        dataIndex: 'rfxRemark',
        width: 100,
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
        title: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
        dataIndex: 'createByName',
        width: 100,
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      { code: 'SSRC.RFX_EVENT.LIST' },
      <Table
        bordered
        rowKey="rfxHeaderId"
        loading={loading}
        columns={columns}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={pagination}
        rowSelection={rowSelection}
        onChange={(page) => onChange(page, true)}
      />
    );
  }
}
