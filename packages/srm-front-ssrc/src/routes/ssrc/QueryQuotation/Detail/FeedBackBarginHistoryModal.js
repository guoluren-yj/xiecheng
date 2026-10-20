import React from 'react';
import { connect } from 'dva';
import { Modal, Form, Col, Row, Table, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import moment from 'moment';
import classNames from 'classnames';
import intl from 'utils/intl';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { dateRender, dateTimeRender, } from 'utils/renderer';

import common from '@/routes/ssrc/common.less';
import { numberSeparatorRender } from '@/utils/renderer';
import { getQuotationPrice } from '@/utils/utils';

const promptCode = 'ssrc.queryRfq';
@formatterCollections({ code: ['ssrc.queryRfq'] })
@connect(({ supplierQuotation, loading }) => ({
  supplierQuotation,
  fetchFeedBackBarginHistoryLoading:
    loading.effects['supplierQuotation/fetchFeedBackBarginHistory'],
}))
export default class FeedBackBarginHistoryModal extends React.Component {
  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.fetchFeedBackBarginHistory();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        feedBackBarginHistoryLine: [],
        feedBackBarginHistoryPagination: {},
      },
    });
  }

  /**
   * 表格行信息切换分页
   * @param {Object} page - 分页参数
   */
  @Bind()
  handleChangePagination(page = {}) {
    const {
      search: { quotationLineId },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'supplierQuotation/fetchFeedBackBarginHistory',
      payload: { quotationLineId, organizationId, page },
    });
  }

  /**
   * 还比价历史头信息查询
   */
  @Bind()
  fetchFeedBackBarginHistory() {
    const {
      search: { quotationLineId },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'supplierQuotation/fetchFeedBackBarginHistory',
      payload: { quotationLineId, organizationId },
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  feedBackBarginHistoryForm() {
    const { supplierCompanyName, itemCode, itemName } = this.props.search;
    return (
      <Form className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Row gutter={32} className="margin-read-row">
          <Col span={8}>
            <Row className="read-row">
              <Col span={9} className="item-label">
                {intl.get(`${promptCode}.model.queryRfq.supplierName`).d('供应商名称')}
              </Col>
              <Col span={15}>{supplierCompanyName}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row className="read-row">
              <Col span={9} className="item-label">
                {intl.get(`${promptCode}.model.queryRfq.itemCode`).d('物料编码')}
              </Col>
              <Col span={15}>{itemCode}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row className="read-row">
              <Col span={9} className="item-label">
                {intl.get(`${promptCode}.model.queryRfq.itemName`).d('物品描述')}
              </Col>
              <Col span={15}>{itemName}</Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }

  // 当前供应商分类表格
  feedBackBarginHistoryTable() {
    const {
      fetchFeedBackBarginHistoryLoading,
      quotationName,
      doubleUnitFlag,
      supplierQuotation: {
        feedBackBarginHistoryLine = [],
        feedBackBarginHistoryPagination = {},
      } = {},
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.queryRfq.quotationTimes`).d('报价次数'),
        dataIndex: 'quotationCount',
        width: 90,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.round`).d('轮次'),
        dataIndex: 'quotationRoundNumber',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.quotationTime`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 170,
        render: dateTimeRender,
      },
      {
        title: intl
          .get(`${promptCode}.model.queryQuotation.commonquotationPerson`, {
            quotationName,
          })
          .d('{quotationName}人'),
        dataIndex: 'quotedByName',
        width: 100,
      },
      {
        title: getQuotationPrice(doubleUnitFlag),
        align: 'right',
        dataIndex: 'quotationPrice',
        width: 120,
        render: numberSeparatorRender,
      },
      doubleUnitFlag && {
        title: intl.get(`${promptCode}.model.queryRfq.unitPrice`).d('单价'),
        align: 'right',
        dataIndex: 'quotationSecondaryPrice',
        width: 80,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.priceBatch`).d('价格批量'),
        align: 'right',
        dataIndex: 'priceBatchQuantity',
        width: 130,
      },
      {
        title: intl
          .get(`${promptCode}.model.queryRfq.commonQuotationDescription`, { quotationName })
          .d('{quotationName}说明'),
        dataIndex: 'currentQuotationRemark',
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.counterOfferPrice`).d('还价-单价'),
        dataIndex: 'bargainPrice',
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.counterOfferReason`).d('还价理由'),
        dataIndex: 'bargainRemark',
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.counterBidTime`).d('还价时间'),
        dataIndex: 'bargainDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.bargainer`).d('还价人'),
        dataIndex: 'bargainByName',
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.promisedDeliveryDate`).d('承诺交货期'),
        dataIndex: 'promisedDate',
        width: 100,
        render: (value) => dateRender(value),
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.deliveryPeroid`).d('供货周期'),
        dataIndex: 'deliveryCycle',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.quotationValidityFrom`).d('报价有效期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
        render: (value) => dateRender(value),
      },
      {
        title: intl.get(`${promptCode}.model.queryRfq.quotationValidityTo`).d('报价有效期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
        render: (value) => dateRender(value),
      },
    ].filter(Boolean);
    const scrollWidth = this.scrollWidth(columns, 650);
    return (
      <React.Fragment>
        <Table
          bordered
          scroll={{ x: scrollWidth }}
          rowKey="quotationLineId"
          columns={columns}
          dataSource={feedBackBarginHistoryLine}
          pagination={feedBackBarginHistoryPagination}
          onChange={this.handleChangePagination}
          loading={fetchFeedBackBarginHistoryLoading}
        />
      </React.Fragment>
    );
  }

  render() {
    const { feedBackBarginHistoryStatus, onCancel } = this.props;
    const anchor = 'right';
    return (
      <Modal
        visible={feedBackBarginHistoryStatus}
        width={1000}
        maskClosable
        onCancel={onCancel}
        zIndex={1000}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        title={intl.get(`${promptCode}.view.title.history`).d('还比价历史')}
        footer={[
          <Button onClick={onCancel} style={{ float: 'left' }}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
      >
        {this.feedBackBarginHistoryForm()}
        {this.feedBackBarginHistoryTable()}
      </Modal>
    );
  }
}
