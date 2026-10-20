import React, { Component } from 'react';
import { Modal, Table, Form, Popover, Alert } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { createPagination } from 'hzero-front/lib/utils/utils';

import { formatAumont } from '@/routes/components/utils';

import styles from './Header.less';
@connect(({ quotePurchaseRequisition, loading }) => ({
  quotePurchaseRequisition,
  loadingPriceList: loading.effects['quotePurchaseRequisition/priceList'],
}))
@Form.create({ fieldNameProp: null })
export default class WrapperBOMModalPriceModle extends Component {
  constructor(props) {
    super(props);
    this.state = { dataSource: [], pagination: {}, selectedRowKeys: [], selectedRow: {} };
  }

  componentDidMount() {
    this.onTableChange();
  }

  @Bind()
  onTableChange(page = {}) {
    const {
      dispatch,
      priceLibraryId,
      orderHeaderFormDataSource,
      priceModalPoLineDetailDTOs,
    } = this.props;
    const newPriceModalPoLineDetailDTOs = priceModalPoLineDetailDTOs.map((n) => {
      const { uuidFlag = '' } = n;
      return uuidFlag ? { ...n, prLineId: null } : n;
    });
    dispatch({
      type: 'quotePurchaseRequisition/priceList',
      payload: {
        poHeaderDetailDTO: orderHeaderFormDataSource,
        poLineDetailDTOs: newPriceModalPoLineDetailDTOs,
        page,
      },
    }).then((res) => {
      if (res) {
        const index =
          res.content && res.content.findIndex((ele) => ele.priceLibraryId === priceLibraryId);
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
          selectedRowKeys: index > -1 ? [priceLibraryId] : [],
          selectedRow: index > -1 ? res.content[index] : {},
        });
      }
    });
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
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.ladderLineNum`).d('行号'),
        dataIndex: 'ladderLineNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.numberRange`).d('数量范围'),
        dataIndex: 'numberRange',
        width: 120,
        render: (val, record) => `[${record.ladderFrom},${record.ladderTo})`,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.price`).d('价格'),
        dataIndex: 'ladderPrice',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.ladderPriceRemark`).d('备注'),
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

  @Bind()
  getColumns() {
    const defaultColumn = [
      {
        title: intl.get(`sodr.common.model.common.excludingTaxPrice`).d('单价（不含税）'),
        dataIndex: 'unitPrice',
        width: 100,
        render: (val, record) => formatAumont(val, record.defaultPrecision),
      },
      {
        title: intl.get(`sodr.common.model.common.taxIncludedUnitPrice`).d('单价（含税）'),
        dataIndex: 'taxPrice',
        width: 80,
        render: (val, record) => formatAumont(val, record.defaultPrecision),
      },
      {
        title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
        render: (_, { uomCodeAndName }) => uomCodeAndName,
      },
      {
        title: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.taxType`).d('税种'),
        dataIndex: 'taxCode',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.11111`).d('阶梯价格'),
        dataIndex: 'quantity',
        width: 80,
        render: (val, record) =>
          record.ladderInquiryFlag === 1 ? (
            <Popover
              placement="bottomLeft"
              content={this.renderLadderDetailTable(record.ladderPriceLibList)}
              arrowPointAtCenter
            >
              <a>
                {`${intl.get(`ssrc.priceLibrary.view.message.button.ladderPrice`).d('阶梯价格')}`}
              </a>
            </Popover>
          ) : null,
      },
      {
        title: intl.get(`sodr.common.model.common.priceSource`).d('价格来源'),
        dataIndex: 'priceSourceMeaning',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.sourceFromNum`).d('价格来源单据号'),
        dataIndex: 'orderNum',
        width: 150,
      },
    ];
    return defaultColumn;
  }

  @Bind()
  handleListRowSelectChange(selectedRowKeys, record) {
    this.setState({ selectedRowKeys, selectedRow: record[0] });
  }

  // @Bind()
  // handleRowClick(val, record) {
  //   const { selectedRowKeys } = this.state;
  //   if (record === selectedRowKeys[0]) {
  //     this.setState({ selectedRowKeys: [], selectedRow: {} });
  //   } else {
  //     this.setState({ selectedRowKeys: [record], selectedRow: val });
  //   }
  // }

  // @Bind()
  // handleRowDoubleClick(val) {
  //   const { hideModal, onSetPrice } = this.props;
  //   onSetPrice(val);
  //   hideModal('priceModalVisible', false);
  // }

  @Bind()
  setPrice() {
    const {
      hideModal,
      onSetPrice,
      // newPriceLibFlag,
      // orderHeaderFormDataSource={},
    } = this.props;
    const { selectedRow } = this.state;
    onSetPrice(selectedRow);
    hideModal('priceModalVisible', false);
  }

  @Bind()
  getAlertContent() {
    const { orderHeaderFormDataSource } = this.props;
    const { summaryFlag, modifyablePriceFlag } = orderHeaderFormDataSource;
    return (
      summaryFlag === 1 &&
      [1, -1].includes(modifyablePriceFlag) && (
        <Alert
          showIcon
          type="info"
          className={styles['price-modal-alert']}
          message={intl
            .get(`sodr.workspace.modal.common.reference.price.alert`)
            .d('当前订单需汇总取价，不支持单行选择参考价格变更单价')}
        />
      )
    );
  }

  render() {
    const {
      visible,
      hideModal,
      loadingPriceList,
      orderHeaderFormDataSource = {},
      newPriceLibFlag,
      customizeTable,
    } = this.props;
    const { dataSource, pagination, selectedRowKeys } = this.state;
    const modalProps = {
      visible,
      width: 920,
      onCancel: () => hideModal('priceModalVisible', false),
      onOk: this.setPrice,
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      title: intl.get(`sodr.common.modal.referencePrice`).d('物料参考价格'),
    };
    const columns = this.getColumns();
    const { summaryFlag, returnOrderFlag, modifyablePriceFlag } = orderHeaderFormDataSource;
    const tableProps = {
      columns,
      dataSource,
      pagination,
      loading: loadingPriceList,
      scroll: { x: scrollX },
      bordered: true,
      onChange: this.onTableChange,
      rowSelection:
        !summaryFlag && newPriceLibFlag && !returnOrderFlag && [1, -1].includes(modifyablePriceFlag)
          ? {
              type: 'radio',
              selectedRowKeys,
              onChange: this.handleListRowSelectChange,
            }
          : false,
      rowKey: 'priceLibraryId',
      // onRow: (record, index) => {
      //   return {
      //     onDoubleClick: () => this.handleRowDoubleClick(record, index),
      //     onClick: () => this.handleRowClick(record, index),
      //   };
      // },
    };

    return (
      <Modal {...modalProps}>
        {!isEmpty(dataSource) && this.getAlertContent()}
        {customizeTable(
          { code: 'SODR.ORDER_CREATE_LINE_LIST.PROPOSED.PRICE' },
          <Table {...tableProps} />
        )}
      </Modal>
    );
  }
}
