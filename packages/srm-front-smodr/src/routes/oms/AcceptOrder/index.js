import React from 'react';
import { connect } from 'dva';
import { DataSet, Table, Spin } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { Tag, Collapse } from 'choerodon-ui';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FreightMethodModal from '@/routes/components/FreightMethodModal';
import { renderTag } from '@/utils/utils';
import FormPro from '@/components/FormPro';

import styles from './index.less';
import { productDs, freightDs, baseDS } from './ds';

const UNIT_CODE_READONLY = {
  collapse: "SMODR.ORDER.RECEIPT.PANEL",
  base: "SMODR.ORDER.RECEIPT.BASIC_INFO",
  product: "SMODR.ORDER.RECEIPT.PRODUCT_INFO",
  freight: "SMODR.ORDER.RECEIPT.FEIGHT_INFO",
};
const UNIT_CODE_EDIT = {
  collapse: "SMODR.ORDER.RECEIPT.PANEL.EDIT",
  base: "SMODR.ORDER.RECEIPT.BASIC_INFO.EDIT",
  product: "SMODR.ORDER.RECEIPT.PRODUCT_INFO.EDIT",
  freight: "SMODR.ORDER.RECEIPT.FEIGHT_INFO.EDIT",
};
const { Panel } = Collapse;

@withCustomize({
  unitCode: [ ...Object.values(UNIT_CODE_READONLY), ...Object.values(UNIT_CODE_EDIT)],
})
@formatterCollections({
  code: ['smodr.acceptOrder', 'smodr.common', 'smodr.deliveryOrder', 'smodr.orderDetail'],
})
@connect(({ acceptOrder, loading }) => ({
  acceptOrder,
  fetchAcceptLoading: loading.effects['acceptOrder/fetchAcceptData'],
  fetchMethodLoading: loading.effects['acceptOrder/fetchMethod'],
}))
export default class AcceptOrder extends React.Component {
  constructor(props) {
    super(props);
    const { receiptCode } = props;
    this.state = { receiptCode, methodVisible: false };
  }

  productDs = new DataSet(productDs(this.props.readOnly));

  freightDs = new DataSet(freightDs());

  baseDs = new DataSet(baseDS())

  componentDidMount() {
    const { dispatch } = this.props;
    const { receiptCode } = this.state;
    dispatch({
      type: 'acceptOrder/fetchAcceptData',
      payload: { receiptCode },
    }).then(res => {
      this.baseDs.loadData(res || []);
    });
    this.productDs.setQueryParameter('receiptCode', receiptCode);
    this.productDs.query();
    this.freightDs.setQueryParameter('receiptCode', receiptCode);
    this.freightDs.query();
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
    const { receiptCode } = nextProps;
    const { receiptCode: oldreceiptCode } = this.state;
    if (receiptCode && receiptCode !== oldreceiptCode) {
      dispatch({
        type: 'acceptOrder/fetchAcceptData',
        payload: {
          receiptCode,
        },
      });
      this.setState(
        {
          receiptCode,
        },
        () => {
          this.productDs.setQueryParameter('receiptCode', receiptCode);
          this.productDs.query();
          this.freightDs.setQueryParameter('receiptCode', receiptCode);
          this.freightDs.query();
        }
      );
    }
  }

  @Bind()
  fetchAcceptData(page = {}) {
    const { dispatch, acceptOrder } = this.props;
    const { receiptEntryPage = {}, receiptFreightPage = {} } = acceptOrder;
    const { receiptCode } = this.state;
    dispatch({
      type: 'acceptOrder/fetchAcceptData',
      payload: {
        receiptCode,
        productPage: isEmpty(page) ? receiptEntryPage.current - 1 : page.current - 1,
        productSize: isEmpty(page) ? receiptEntryPage.pageSize : page.pageSize,
        freightPage: receiptFreightPage.current - 1,
        freightSize: receiptFreightPage.pageSize,
      },
    });
  }

  @Bind()
  fetchAcceptFreightData(page = {}) {
    const { dispatch, acceptOrder } = this.props;
    const { receiptEntryPage = {}, receiptFreightPage = {} } = acceptOrder;
    const { receiptCode } = this.state;
    dispatch({
      type: 'acceptOrder/fetchAcceptData',
      payload: {
        receiptCode,
        freightPage: isEmpty(page) ? receiptFreightPage.current - 1 : page.current - 1,
        freightSize: isEmpty(page) ? receiptFreightPage.pageSize : page.pageSize,
        productPage: receiptEntryPage.current - 1,
        productSize: receiptEntryPage.pageSize,
      },
    });
  }


  @Bind()
  handleCheckMethod(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptOrder/fetchMethod',
      payload: { orderId: record.orderId },
    });
    this.setState({
      methodVisible: true,
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.Draw = ref;
  }

  render() {
    const { acceptOrder, fetchMethodLoading, fetchAcceptLoading, customizeCollapse, customizeTable, readOnly, customizeForm } = this.props;
    const { methodVisible } = this.state;
    const { acceptData = [], methodList = [] } = acceptOrder;
    const productColumns = [
      {
        name: 'receiptLineNum',
        width: 100,
      },
      {
        width: 200,
        name: 'consignmentCode',
        renderer: ({ value, record }) =>
          value + (record.get('consignmentLineNum') ? `-${record.get('consignmentLineNum')}` : ''),
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
        width: 120,
      },
      {
        name: 'quantityMeaning',
        align: 'right',
        width: 120,
        editor: !readOnly,
      },
      {
        name: 'attachmentUuid',
        width: 160,
        editor: !readOnly,
      },
    ];
    const feightColumns = [
      {
        width: 120,
        name: 'receiptLineNum',
      },
      {
        width: 180,
        name: 'consignmentCode',
        renderer: ({ value, record }) =>
          value + (record.get('consignmentLineNum') ? `-${record.get('consignmentLineNum')}` : ''),
      },
      {
        name: 'skuName',
      },
      {
        width: 160,
        name: 'itemCode',
      },
      {
        width: 160,
        name: 'itemName',
      },
      {
        width: 120,
        name: 'extraCostTypeMeaning',
      },
      {
        width: 120,
        name: 'quantityMeaning',
        align: 'right',
      },
    ];

    const methodColumns = [
      {
        title: intl.get('smodr.acceptOrder.model.freightRuleTypeMethod').d('运费计价方式'),
        width: 100,
        dataIndex: 'freightPricingMethodMeaning',
      },
    ];
    const colorList = [
      { colorType: 'success', matchList: ['APPROVED', 'RECEIVED'] },
      { colorType: 'failed', matchList: ['REJECTED'] },
      { colorType: 'warning', matchList: ['APPROVING'] },
      { colorType: 'invalid', matchList: [] },
    ];
    const { color, initStyle } = renderTag(colorList, acceptData?.[0]?.receiptStatus);

    const baseFields = [
      { name: 'receiptCode' },
      { name: 'cecReceiptCode' },
      { name: 'consignmentCode' },
      {
        name: 'receiptStatusMeaning',
        renderer: ({ text }) => (
          <Tag color={color} style={{ ...initStyle }}>
            {text}
          </Tag>
        ),
        show: readOnly,
      },
      { name: 'receiptedTime' },
      { name: 'createdByName' },
    ];
    const UNIT_CODE = readOnly ? UNIT_CODE_READONLY : UNIT_CODE_EDIT;

    return (
      <div className={styles['page-content-layout']}>
        {
          customizeCollapse({
            code: UNIT_CODE.collapse,
          },
            (
              <Collapse bordered={false} expandIconPosition="text-right" defaultActiveKey={['baseInfo', 'prodInfo', 'freInfo']}>
                <Panel header={<span className="header-line">{intl.get('smodr.acceptOrder.view.baseInfo').d('基本信息')}</span>} id="BASE_INFO" key="baseInfo">
                  <Spin spinning={fetchAcceptLoading}>
                    <FormPro
                      columns={3}
                      readOnly={!!readOnly}
                      disabled={!readOnly}
                      dataSet={this.baseDs}
                      fields={baseFields}
                      customizeCode={UNIT_CODE.base}
                      customizeForm={customizeForm}
                    />
                  </Spin>
                </Panel>
                <Panel header={<span className="header-line">{intl.get('smodr.acceptOrder.view.productInfo').d('接收行商品信息')}</span>} id="PROD_INFO" key="prodInfo">
                  {customizeTable({ code: UNIT_CODE.product },
                    <Table dataSet={this.productDs} columns={productColumns} customizedCode={UNIT_CODE.product} style={{ maxHeight: 230 }} />
                  )}
                </Panel>
                <Panel header={<span className="header-line">{intl.get('smodr.acceptOrder.view.additionInfo').d('接收行附加费信息')}</span>} id="FRE_INFO" key="freInfo">
                  {customizeTable({ code: UNIT_CODE.freight },
                    <Table dataSet={this.freightDs} columns={feightColumns} customizedCode={UNIT_CODE.freight} style={{ maxHeight: 230 }} />
                  )}
                </Panel>
              </Collapse>
            )
          )
        }
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
      </div>
    );
  }
}
