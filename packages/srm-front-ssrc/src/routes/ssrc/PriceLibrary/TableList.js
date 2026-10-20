import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { numberSeparatorRender } from '@/utils/renderer';

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
   *跳转到寻源明细页面
   *
   */
  @Bind()
  inquiryDetail(record) {
    const { onInquiryDetail } = this.props;
    onInquiryDetail(record);
  }

  /**
   *跳转到合同明细页面
   *
   */
  @Bind()
  contractDetail(record) {
    const { onContractDetail } = this.props;
    onContractDetail(record);
  }

  /**
   *跳转到订单明细页面
   *
   */
  @Bind()
  orderDetail(record) {
    const { onOrderDetail } = this.props;
    onOrderDetail(record);
  }

  /**
   * 渲染阶梯价格明细
   * @param {String} value
   * @param {Object} record
   * @param {Object} item
   */
  renderLadderDetailTable(ladderPriceLibList = []) {
    const columns = [
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderLineNum`).d('行号'),
        dataIndex: 'ladderLineNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.numberRange`).d('数量范围'),
        dataIndex: 'numberRange',
        width: 120,
        render: (val, record) => `[${record.ladderFrom},${record.ladderTo})`,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.price`).d('价格'),
        dataIndex: 'ladderPrice',
        width: 100,
        render: (val) => numberSeparatorRender(val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.cumulativeFlag`).d('累计阶梯价格'),
        dataIndex: 'cumulativeFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderPriceRemark`).d('备注'),
        dataIndex: 'ladderPriceRemark',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
    ];
    return (
      <Table
        bordered
        columns={columns}
        rowKey="ladderPriceLibId"
        dataSource={ladderPriceLibList}
        pagination={false}
      />
    );
  }

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    const priceLibraryColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'priceLibraryStatusMeaning',
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl
          .get('ssrc.priceLibrary.model.library.purchasingOrganizationCode')
          .d('采购组织编码'),
        dataIndex: 'purOrganizationCode',
        width: 120,
      },
      {
        title: intl
          .get('ssrc.priceLibrary.model.library.purchasingOrganizationName')
          .d('采购组织名称'),
        dataIndex: 'purOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.buyer`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.itemCategoryName`).d('物料类别'),
        dataIndex: 'itemCategoryName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.supplierCompanyNum`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.supplierCompanyName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.taxPrice`).d('单价(含税)'),
        dataIndex: 'taxPrice',
        width: 150,
        align: 'right',
        render: (val) => numberSeparatorRender(val),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.noTaxPrice`).d('单价(不含税)'),
        dataIndex: 'unitPrice',
        width: 150,
        align: 'right',
        render: (val) => numberSeparatorRender(val),
      },
      // {
      //   title: intl.get(`ssrc.priceLibrary.model.library.eachPrice`).d('每一单价'),
      //   dataIndex: 'attributeDecimal2',
      //   width: 150,
      //   align: 'right',
      // },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.changepercent`).d('涨跌幅'),
        dataIndex: 'changePercent',
        width: 100,
        render: (val) => {
          if (val && Number(val.replace('%', '')) > 0) {
            return <span style={{ color: 'red' }}> {val} </span>;
          } else if (val && Number(val.replace('%', '')) < 0) {
            return <span style={{ color: 'green' }}> {val}</span>;
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderPrice`).d('阶梯价格'),
        dataIndex: 'ladderPrice',
        width: 100,
        render: (val, record) =>
          record.ladderInquiryFlag === 1 ? (
            <Popover
              placement="bottomLeft"
              content={this.renderLadderDetailTable(record.ladderPriceLibList)}
              // title={`${record.supplierCompanyName}${record.itemName}${intl
              //   .get(`ssrc.priceLibrary.view.message.title.ladderPrice`)
              //   .d('阶梯价格')}`}
              arrowPointAtCenter
            >
              <a>
                {`${intl.get(`ssrc.priceLibrary.view.message.button.ladderPrice`).d('阶梯价格')}`}
              </a>
            </Popover>
          ) : null,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.biUomId`).d('双单位'),
        dataIndex: 'biUomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.conversionRatio`).d('转换比例'),
        dataIndex: 'uomConversionRate',
        width: 100,
        render: (val) => <div> 1: {val}</div>,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.priceQuantity`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.exchangeRate`).d('汇率'),
        dataIndex: 'exchangeRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.minPackageQuantity`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.minPurchaseQuantity`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        dataIndex: 'specs',
        width: 100,
      },
      // {
      //   title: intl.get(`ssrc.priceLibrary.model.library.qualityStandard`).d('质量标准'),
      //   dataIndex: 'attributeVarchar1',
      //   width: 100,
      // },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.quotationExpiryDateFrom`).d('有效期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.quotationExpiryDateTo`).d('有效期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.centralPurchaseFlag`).d('集采价格'),
        dataIndex: 'centralPurchaseFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.remark`).d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (val) => (
          <Popover content={<div style={{ maxWidth: '300px' }}>{val}</div>}>
            <p>{val}</p>
          </Popover>
        ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.orderNum`).d('订单编号'),
        dataIndex: 'orderNum',
        width: 150,
        render: (val, record) => <a onClick={() => this.orderDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.contractNum`).d('合同编号'),
        dataIndex: 'contractNum',
        width: 155,
        render: (val, record) => <a onClick={() => this.contractDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.sourceNum`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 150,
        render: (val, record) => <a onClick={() => this.inquiryDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.externalSystemNumber`).d('外部系统编号'),
        dataIndex: 'externalSystemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.sourceSystem`).d('来源系统'),
        dataIndex: 'sourceSystem',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.priceSourceMeaning`).d('价格来源'),
        dataIndex: 'priceSourceMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.infoType`).d('信息类型'),
        dataIndex: 'infoTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.historyPrice`).d('历史价格'),
        dataIndex: 'historyPrice',
        width: 100,
        render: (val, record) =>
          record.historyFlag === 1 ? (
            <a onClick={() => this.goHistoryPriceDetail(record)}>
              {`${intl.get(`ssrc.priceLibrary.view.message.button.historyPrice`).d('历史价格')}`}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.creationDate`).d('创建日期'),
        dataIndex: 'lastUpdateDate',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.realName`).d('创建人'),
        dataIndex: 'realName',
        width: 120,
      },
    ];
    return priceLibraryColumns;
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
    return customizeTable(
      { code: 'SSRC.PRICE_LIBRARY.LIST' },
      <Table
        bordered
        rowKey="priceLibraryId"
        loading={loading}
        columns={this.renderColumns()}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={pagination}
        rowSelection={rowSelection}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
