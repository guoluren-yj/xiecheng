import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import querystring from 'querystring';
import {
  getPriceName,
  getNetPriceName,
  getQtyName,
  getAvailableQtyName,
  getUomName,
  getAllottedQuantity,
} from '@/utils/utils';
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
   * 历史价格
   */
  @Bind()
  goHistoryPriceDetail(record) {
    const { onHistoryPriceDetail } = this.props;
    onHistoryPriceDetail(record);
  }

  /**
   * 点击PFx跳转
   */
  @Bind()
  onrfxNum(record) {
    const { dispatch } = this.props;
    const { rfxHeaderId, projectLineSectionId = null, secondarySourceCategory } = record || {};
    if (!rfxHeaderId || !routerRedux) {
      return;
    }

    const searchObj = {};

    if (projectLineSectionId) {
      searchObj.projectLineSectionId = projectLineSectionId;
    }

    const search = querystring.stringify(searchObj);

    const path =
      secondarySourceCategory === 'NEW_BID'
        ? `/ssrc/new-bid-hall/bid-detail/${rfxHeaderId}`
        : `/ssrc/new-inquiry-hall/rfx-detail/${rfxHeaderId}`;

    dispatch(
      routerRedux.push({
        pathname: path,
        search,
      })
    );
  }

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    const { viewLadderLevel, doubleUnitFlag, dataSource, dispatch, remote } = this.props;
    const sumQueryColumns = [
      {
        title: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.supplierCompanyNum`)
          .d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.erpSupplierNum`)
          .d('ERP供应商编码'),
        dataIndex: 'erpSupplierCompanyNum',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.supplierCompanyName`)
          .d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        fixed: 'left',
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemRemark`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.netPrice`).d('单价(不含税)'),
            dataIndex: 'validNetSecondaryPrice',
            width: 120,
            align: 'right',
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.taxPrice`).d('单价(含税)'),
            dataIndex: 'validQuotationSecPrice',
            width: 120,
            align: 'right',
            render: numberSeparatorRender,
          }
        : null,
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetPrice',
        width: 120,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'validQuotationPrice',
        width: 120,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.ladderInquiryFlag`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          val === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.supQuoSumQuery.view.message.button.ladderInquiryFlag`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.quotationDetailFlag`)
          .d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (_, record) => (
          <QuotationDetail
            rowData={record}
            sourceFrom="RFX"
            allowBuyerViewFlag
            pageFrom="supplierSummary"
            bidFlag={record.secondarySourceCategory === 'NEW_BID'}
          />
        ),
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.freightAmount`).d('运费'),
        dataIndex: 'freightAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.suggestedFlag`).d('选用'),
        dataIndex: 'suggestedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      doubleUnitFlag
        ? {
            title: intl
              .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.allottedQuantity`)
              .d('分配数量'),
            dataIndex: 'allottedSecondaryQuantity',
            width: 100,
          }
        : null,
      {
        title: getAllottedQuantity(doubleUnitFlag),
        dataIndex: 'allottedQuantity',
        width: 100,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl
              .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.currentQuotQuantity`)
              .d('可供数量'),
            dataIndex: 'currentQuotationSecQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'currentQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.uomName`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.taxCode`).d('税码'),
        dataIndex: 'taxCode',
        width: 100,
      },
      {
        title: (
          <span>{intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.taxRate`).d('税率')}%</span>
        ),
        dataIndex: 'taxRate',
        width: 120,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.exchangeRate`).d('汇率'),
        dataIndex: 'exchangeRate',
        width: 120,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemCategoryName`).d('物料类别'),
        dataIndex: 'itemCategoryName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        dataIndex: 'specs',
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
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.quotationType`).d('报价方式'),
        dataIndex: 'quotationTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.rfxLineItemNum`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.roundNumber`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.rfxNum`).d('RFX单号'),
        dataIndex: 'rfxNum',
        width: 120,
        render: (val, record) => <a onClick={() => this.onrfxNum(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.rfxTitle`).d('询价单标题'),
        dataIndex: 'rfxTitle',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.sourcingTemplate`).d('寻源模板'),
        dataIndex: 'templateName',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.sourceMethod`).d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.purOrganizationCode`)
          .d('采购组织编码'),
        dataIndex: 'purOrganizationCode',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.purOrganizationName`)
          .d('采购组织名称'),
        dataIndex: 'purOrganizationName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.invOrganizationName`)
          .d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
        dataIndex: 'createByName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.finishDate`).d('完成时间'),
        dataIndex: 'finishDate',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
    ].filter(Boolean);
    if (remote) {
      // 表格行二开埋点
      return remote.process('SSRC_SUPPLIER_QUOTATION_SUMMARY_QUERY_PROCESS_LIST', sumQueryColumns, {
        dataSource,
        dispatch,
        modelName: 'supQuoSumQuery', // 若后续对model有改造，直接修改此modelName，二开取此modelName
      });
    }
    return sumQueryColumns;
  }

  render() {
    const {
      loading,
      dataSource,
      pagination,
      onChange,
      rowSelection,
      customizeTable = () => {},
    } = this.props;
    const scrollX = sum(this.renderColumns().map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          { code: 'SSRC.SUPPLIER_QUOTATION_COLLECT.QUERY' },
          <Table
            bordered
            rowKey="quotationLineId"
            loading={loading}
            columns={this.renderColumns()}
            scroll={{ x: scrollX }}
            dataSource={dataSource}
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={(page) => onChange(page, true)}
          />
        )}
      </React.Fragment>
    );
  }
}
