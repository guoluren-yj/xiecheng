import React from 'react';
import { connect } from 'dva';
import { DataSet, Table, Spin } from 'choerodon-ui/pro';
import { Tabs, Tag } from 'choerodon-ui';

import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FreightMethodModal from '@/routes/components/FreightMethodModal';
import { renderTag } from '@/utils/utils';
import FormPro from '@/components/FormPro';

import styles from './index.less';
import { productDs, freightDs, baseDS } from './ds';
import LogisticsModal from '../LogisticsModal';


const { TabPane } = Tabs;

@withRouter
@formatterCollections({
  code: ['smodr.deliveryOrder', 'smodr.common', 'smodr.orderLine', 'smodr.orderDetail'],
})
@connect(({ deliveryOrder, relevanceDrawer, loading }) => ({
  deliveryOrder,
  relevanceDrawer,
  fetchDeliveryLoading: loading.effects['deliveryOrder/fetchDeliveryData'],
  fetchMethodLoading: loading.effects['deliveryOrder/fetchMethod'],
}))
export default class DeliveryOrder extends React.Component {
  constructor(props) {
    super(props);
    const { consignmentCode } = props;
    this.state = { consignmentCode, methodVisible: false, showLogisticFlag: 0 };
  }

  Draw;

  productDs = new DataSet(productDs());

  freightDs = new DataSet(freightDs());

  baseDs = new DataSet(baseDS())

  componentDidMount() {
    const { dispatch } = this.props;
    const { consignmentCode } = this.state;
    dispatch({
      type: 'deliveryOrder/fetchDeliveryData',
      payload: {
        consignmentCode,
      },
    }).then(res => {
      this.baseDs.loadData(res || []);
      this.setState({ showLogisticFlag: res?.[0]?.showLogisticFlag });
    });
    this.productDs.setQueryParameter('consignmentCode', consignmentCode);
    this.productDs.query();
    this.freightDs.setQueryParameter('consignmentCode', consignmentCode);
    this.freightDs.query();
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
    const { consignmentCode } = nextProps;
    const { consignmentCode: oldconsignmentCode } = this.state;
    if (
      consignmentCode &&
      consignmentCode !== oldconsignmentCode
    ) {
      dispatch({
        type: 'deliveryOrder/fetchDeliveryData',
        payload: {
          consignmentCode,
        },
      });
      this.setState(
        {
          consignmentCode,
        },
        () => {
          this.productDs.setQueryParameter('consignmentCode', consignmentCode);
          this.productDs.query();
          this.freightDs.setQueryParameter('consignmentCode', consignmentCode);
          this.freightDs.query();
        }
      );
    }
  }

  @Bind()
  fetchDeliveryData(page = {}) {
    const { dispatch, deliveryOrder } = this.props;
    const { consignmentEntryPage = {}, consignmentFreightPage = {} } = deliveryOrder;
    const { consignmentCode } = this.state;
    dispatch({
      type: 'deliveryOrder/fetchDeliveryData',
      payload: {
        consignmentCode,
        productPage: isEmpty(page) ? consignmentEntryPage.current - 1 : page.current - 1,
        productSize: isEmpty(page) ? consignmentEntryPage.pageSize : page.pageSize,
        freightPage: consignmentFreightPage.current - 1,
        freightSize: consignmentFreightPage.pageSize,
      },
    });
  }

  @Bind()
  fetchDeliveryFreightData(page = {}) {
    const { dispatch, deliveryOrder } = this.props;
    const { consignmentEntryPage = {}, consignmentFreightPage = {} } = deliveryOrder;
    const { consignmentCode } = this.state;
    dispatch({
      type: 'deliveryOrder/fetchDeliveryData',
      payload: {
        consignmentCode,
        freightPage: isEmpty(page) ? consignmentFreightPage.current - 1 : page.current - 1,
        freightSize: isEmpty(page) ? consignmentFreightPage.pageSize : page.pageSize,
        productPage: consignmentEntryPage.current - 1,
        productSize: consignmentEntryPage.pageSize,
      },
    });
  }

  @Bind()
  handleCheckMethod(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryOrder/fetchMethod',
      payload: { orderId: record.get('orderId') },
    });
    this.setState({
      methodVisible: true,
    });
  }

  @Bind()
  toggleLogistModal() {
    const { logVisible } = this.state;
    this.setState({
      logVisible: !logVisible,
    });
  }

  render() {
    const { deliveryOrder, fetchMethodLoading, fetchDeliveryLoading } = this.props;
    const { deliveryData = [], methodList = [] } = deliveryOrder;
    const { methodVisible, logVisible, consignmentCode } = this.state;
    const productColumns = [
      {
        name: 'entryCode',
        width: 100,
      },
      {
        width: 200,
        name: 'orderCode',
      },
      {
        width: 200,
        name: 'skuCode',
      },
      {
        name: 'skuName',
      },
      {
        name: 'skuTypeMeaning',
        width: 100,
      },
      {
        name: 'originalQuantityMeaning',
        align: 'right',
        width: 100,
        renderer: ({ record }) => {
          return record.get('quantityMeaning');
        },
      },
      {
        name: 'cancelQuantityMeaning',
        align: 'right',
        width: 100,
      },
    ];
    const feightColumns = [
      {
        width: 100,
        name: 'consignmentLineNum',
      },
      {
        width: 200,
        name: 'orderCode',
      },
      {
        name: 'skuName',
      },
      {
        width: 200,
        name: 'itemCode',
      },
      {
        width: 200,
        name: 'itemName',
      },
      {
        width: 100,
        name: 'extraCostTypeMeaning',
      },
      {
        width: 100,
        name: 'quantityMeaning',
        align: 'right',
      },
    ];

    const methodColumns = [
      {
        title: intl.get('smodr.deliveryOrder.model.freightRuleTypeMethod').d('运费计价方式'),
        width: 100,
        name: 'freightPricingMethodMeaning',
      },
    ];

    const colorList = [
      { colorType: 'success', matchList: ['DELIVERY_SUCCESS', 'NOT_DELIVERY'] },
      { colorType: 'failed', matchList: [] },
      { colorType: 'invalid', matchList: ['NOT_DISTRIBUTE'] },
      // { colorType: 'warning', matchList: ['NOT_DELIVERY'] },
    ];
    const { color, initStyle } = renderTag(colorList, deliveryData?.[0]?.consignmentStatus);
    const product = { consignmentCode, cecFromCode: deliveryData?.[0]?.cecFromCode };
    const baseFields = [
      { name: 'consignmentCode' },
      { name: 'ecConsignmentCode' },
      { name: 'srmConsignmentCode' },
      {
        name: 'consignmentStatusMeaning',
        renderer: ({ text }) => (
          <Tag color={color} style={{ ...initStyle }}>
            {text}
          </Tag>
        ),
      },
      { name: 'shippedTime' },
      { name: 'completedTime' },
    ];

    const renderDelivery = () => {
      return (
        <>
          <div className="header-line" style={{ marginTop: 0 }}>
            {intl.get('smodr.deliveryOrder.view.baseInfo').d('基本信息')}
          </div>
          <Spin spinning={fetchDeliveryLoading}>
            <FormPro
              columns={3}
              readOnly
              dataSet={this.baseDs}
              fields={baseFields}
            />
          </Spin>
          <div className="header-line other">
            {intl.get('smodr.deliveryOrder.view.productInfo').d('配送行商品信息')}
          </div>
          <Table dataSet={this.productDs} columns={productColumns} style={{ maxHeight: 230 }} customizedCode='PEISONG_SKU_LIST' />
          <div className="header-line other">
            {intl.get('smodr.deliveryOrder.view.additionInfo').d('配送行附加费信息')}
          </div>
          <Table dataSet={this.freightDs} columns={feightColumns} style={{ maxHeight: 230 }} customizedCode='PEISONG_FREIGHT_LIST' />
          {methodVisible && (
          <FreightMethodModal
            key="orderEntryId"
            visible={methodVisible}
            loading={fetchMethodLoading}
            columns={methodColumns}
            dataSource={methodList}
            onCancel={() => this.setState({ methodVisible: false })}
            onOk={() => this.setState({ methodVisible: false })}
          />
            )}
        </>
      );
    };
    return (
      <div className={styles['page-content-layout']}>
        {this.state.showLogisticFlag !== 1 ? renderDelivery() : ( // 不展示物流信息
          <Tabs
            onChange={() => {
            this.toggleLogistModal();
          }}
          >
            <TabPane tab={intl.get('smodr.deliveryOrder.view.conTitle').d('配送单信息')} key="1">
              {renderDelivery()}
            </TabPane>
            <TabPane tab={intl.get('smodr.deliveryOrder.view.wuliuInfo').d('物流信息')} key="2">
              <LogisticsModal product={product} baseData={this.baseDs?.toData() || {}} visible={logVisible} />
            </TabPane>
          </Tabs>
)}
      </div>
    );
  }
}
