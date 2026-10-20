import React, { Component } from 'react';
import { Modal, Table, Form, Popover } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { dateRender, dateTimeRender } from 'utils/renderer';

@withCustomize({
  unitCode: ['SPRM.PURCHASE_EXECUTION.LADDERPRICEMODAL'],
})
@formatterCollections({
  code: ['ssrc.priceLibrary'],
})
@connect(({ purchaseRequisitionAssignment, loading }) => ({
  purchaseRequisitionAssignment,
  loadingPriceList: loading.effects['purchaseRequisitionAssignment/priceList'],
}))
@Form.create({ fieldNameProp: null })
export default class PriceModle extends Component {
  constructor(props) {
    super(props);
    this.state = { dataSource: [], pagination: {}, loading: false };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, priceRecordId, referPriceRecord = {}, fetchPrice, record } = this.props;
    const { companyId, itemId, invOrganizationId, purchaseOrgId, uomId, ouId } = referPriceRecord;
    if (priceRecordId) {
      dispatch({
        type: 'purchaseRequisitionAssignment/priceList',
        payload: {
          priceRecordId,
          companyId,
          itemId,
          invOrganizationId,
          purchaseOrgId,
          uomId,
          ouId,
          page,
        },
      }).then((res) => {
        if (res && res.content) {
          this.setState({
            dataSource: res.content || res,
            pagination: createPagination(res),
          });
        }
      });
    } else if (isFunction(fetchPrice)) {
      this.setState({ loading: true });
      fetchPrice(record, page)
        .then((res) => {
          if (res && res.content) {
            this.setState({
              dataSource: res.content || res,
              pagination: createPagination(res),
            });
          }
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    }
  }

  /**
   * 渲染阶梯价格明细
   * @param {String} value
   * @param {Object} record
   * @param {Object} item
   */
  @Bind()
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
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
      },
      {
        title: intl.get('sodr.common.model.common.localSupplierCompanyNum').d('本地供应商编码'),
        dataIndex: 'supplierCode',
        width: 100,
      },
      {
        title: intl.get('sodr.common.model.common.localSupplierName').d('本地供应商名称'),
        dataIndex: 'supplierName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.taxPrice`).d('单价(含税)'),
        dataIndex: 'taxPrice',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.unitPrice`).d('单价(不含税)'),
        dataIndex: 'unitPrice',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
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
        title: intl.get(`ssrc.priceLibrary.view.message.button.ladderPrice`).d('阶梯价格'),
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
        title: intl.get(`sodr.common.model.common.sourceOrderNum`).d('来源单号'),
        dataIndex: 'orderNum',
        width: 100,
      },
      {
        title: intl.get(`sprm.common.model.common.validDateFrom`).d('有效期从'),
        dataIndex: 'validDateFrom',
        width: 100,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sprm.common.model.common.validDateTo`).d('有效期至'),
        dataIndex: 'validDateTo',
        width: 100,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 100,
        render: dateRender,
      },
    ];
    return defaultColumn;
  }

  render() {
    const { visible, hideModal, loadingPriceList, customizeTable } = this.props;
    const { dataSource, pagination, loading } = this.state;
    const modalProps = {
      visible,
      width: 1020,
      onCancel: hideModal,
      footer: null,
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      title: intl.get(`sodr.common.modal.referencePrice`).d('物料参考价格'),
    };
    const columns = this.getColumns();
    const tableProps = {
      columns,
      dataSource,
      pagination,
      loading: loadingPriceList || loading,
      scroll: { x: scrollX },
      bordered: true,
      onChange: this.handleSearch,
    };

    return (
      <Modal {...modalProps}>
        {customizeTable(
          { code: 'SPRM.PURCHASE_EXECUTION.LADDERPRICEMODAL' },
          <Table {...tableProps} />
        )}
      </Modal>
    );
  }
}
