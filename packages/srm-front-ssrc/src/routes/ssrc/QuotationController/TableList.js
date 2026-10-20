import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';

import intl from 'utils/intl';
import { yesOrNoRender, valueMapMeaning, dateTimeRender } from 'utils/renderer';
import { getQuotationName } from '@/utils/globalVariable';

const promptCode = 'ssrc.quoController';
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
   *跳转到明细页面
   *
   */
  @Debounce(800)
  @Bind()
  inquiryDetail(record) {
    const { onInquiryDetail } = this.props;
    onInquiryDetail(record);
  }

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    const {
      sourceMethod = [],
      bidFlag,
      rfxStatus = [],
      auctionDirection = [],
      documentTypeName,
    } = this.props;
    const quotationControllerColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'rfxStatus',
        width: 100,
        fixed: 'left',
        render: (val) => valueMapMeaning(rfxStatus, val),
      },
      {
        title: intl
          .get(`${promptCode}.model.quoController.commonRFxNo.`, {
            sourceCategoryType: bidFlag ? 'BID' : 'RFX',
          })
          .d('{sourceCategoryType}单号'),
        dataIndex: 'rfxNum',
        width: 150,
        fixed: 'left',
        render: (val, record) =>
          record.observerFlag ? val : <a onClick={() => this.inquiryDetail(record)}>{val}</a>,
      },
      {
        title: intl
          .get(`${promptCode}.model.quoController.commonInquiryTitle`, { documentTypeName })
          .d('{documentTypeName}标题'),
        dataIndex: 'rfxTitle',
        width: 100,
        fixed: 'left',
      },
      {
        title: intl
          .get(`${promptCode}.model.quoController.commonQuotationStartTime`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl
          .get(`${promptCode}.model.quoController.commonQuotationDeadline`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.purchOrgName`).d('采购组织名称'),
        dataIndex: 'purOrganizationName',
        width: 120,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.createdUnitName`).d('创建人部门'),
        dataIndex: 'createdUnitName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.sourcingTemplate`).d('寻源模板'),
        dataIndex: 'templateName',
        width: 100,
      },
      bidFlag
        ? {
            title: intl.get(`${promptCode}.model.quoController.sourcingCategory`).d('寻源类别'),
            dataIndex: 'secondarySourceCategoryMeaning',
            width: 100,
          }
        : null,
      {
        title: intl.get(`${promptCode}.model.quoController.sourcingApproach`).d('寻源方式'),
        dataIndex: 'sourceMethod',
        width: 110,
        render: (val) => valueMapMeaning(sourceMethod, val),
      },
      {
        title: intl.get(`${promptCode}.model.quoController.sealedQuotation`).d('密封报价'),
        dataIndex: 'sealedQuotationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.currency`).d('币种'),
        dataIndex: 'currencyCode',
        width: 60,
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
        title: intl.get(`${promptCode}.model.quoController.biddingDirection`).d('报价方向'),
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
    return quotationControllerColumns;
  }

  render() {
    const { loading, dataSource, pagination, onChange, customizeTable, custKey } = this.props;
    const scrollX = sum(this.renderColumns().map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      { code: `SSRC.${custKey}QUOTATION_CONTROLLER.LIST` },
      <Table
        bordered
        rowKey="rfxHeaderId"
        loading={loading}
        columns={this.renderColumns()}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onChange(page, true)}
      />
    );
  }
}
