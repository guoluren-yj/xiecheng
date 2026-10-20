import React from 'react';
import { connect } from 'dva';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FreightMethodModal from '@/routes/components/FreightMethodModal';
// import { Value, Title } from '@/routes/components/Label';
import { renderTag } from '@/utils/utils';

import FormPro from '@/components/FormPro';
import styles from './index.less';
import { productDs, freightDs, baseDS } from './ds';

@formatterCollections({ code: ['smodr.recon', 'smodr.common'] })
@connect(({ reconciliationOrder, loading }) => ({
  reconciliationOrder,
  fetchReconLoading: loading.effects['reconciliationOrder/fetchReconData'],
  fetchMethodLoading: loading.effects['reconciliationOrder/fetchMethod'],
}))
export default class ReconciliationOrder extends React.Component {
  constructor(props) {
    super(props);
    const { statementsCode = '' } = props;
    this.state = { statementsCode, methodVisible: false };
  }

  baseDs = new DataSet(baseDS());

  productDs = new DataSet(productDs());

  freightDs = new DataSet(freightDs());

  componentDidMount() {
    const { dispatch } = this.props;
    const { statementsCode } = this.state;
    this.productDs.setQueryParameter('statementsCode', statementsCode);
    this.productDs.query();
    this.freightDs.setQueryParameter('statementsCode', statementsCode);
    this.freightDs.query();
    dispatch({
      type: 'reconciliationOrder/fetchReconData',
      payload: { statementsCode },
    }).then(res => {
      this.baseDs.loadData(res || []);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
    const { statementsCode } = nextProps;
    const { statementsCode: oldstatementsCode } = this.state;
    if (statementsCode && statementsCode !== oldstatementsCode) {
      dispatch({
        type: 'reconciliationOrder/fetchReconData',
        payload: {
          statementsCode,
        },
      });
      this.setState(
        {
          statementsCode,
        },
        () => {
          this.productDs.setQueryParameter('statementsCode', statementsCode);
          this.productDs.query();
          this.freightDs.setQueryParameter('statementsCode', statementsCode);
          this.freightDs.query();
        }
      );
    }
  }

  @Bind()
  fetchReconData(page = {}) {
    const { dispatch, reconciliationOrder } = this.props;
    const { statementsEntryPage = {}, statementFreightPage = {} } = reconciliationOrder;
    const { statementsCode } = this.state;
    dispatch({
      type: 'reconciliationOrder/fetchReconData',
      payload: {
        statementsCode,
        productPage: isEmpty(page) ? statementsEntryPage.current - 1 : page.current - 1,
        productSize: isEmpty(page) ? statementsEntryPage.pageSize : page.pageSize,
        freightPage: statementFreightPage.current - 1,
        freightSize: statementFreightPage.pageSize,
      },
    });
  }

  @Bind()
  handleCheckMethod(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'recon/fetchMethod',
      payload: { orderId: record.orderId },
    });
    this.setState({
      methodVisible: true,
    });
  }

  @Bind()
  fetchReconFreightData(page = {}) {
    const { dispatch, reconciliationOrder } = this.props;
    const { statementsEntryPage = {}, statementFreightPage = {} } = reconciliationOrder;
    const { statementsCode } = this.state;
    dispatch({
      type: 'reconciliationOrder/fetchReconData',
      payload: {
        statementsCode,
        freightPage: isEmpty(page) ? statementFreightPage.current - 1 : page.current - 1,
        freightSize: isEmpty(page) ? statementFreightPage.pageSize : page.pageSize,
        productPage: statementsEntryPage.current - 1,
        productSize: statementsEntryPage.pageSize,
      },
    });
  }

  render() {
    const { reconciliationOrder, fetchMethodLoading } = this.props;
    const { reconData = [], methodList = [] } = reconciliationOrder;
    const { methodVisible } = this.state;
    const productColumns = [
      {
        width: 200,
        name: 'consignmentCode',
      },
      {
        width: 200,
        name: 'receiptCode',
      },
      {
        width: 200,
        name: 'afterSaleCode',
      },
      {
        width: 150,
        name: 'skuCode',
      },
      {
        name: 'skuName',
      },
      {
        name: 'quantityMeaning',
        align: 'right',
        width: 100,
      },
      {
        name: 'taxRateMeaning',
        width: 100,
        align: 'right',
      },
      {
        name: 'unitPriceMeaning',
        align: 'right',
        width: 100,
      },
      {
        name: 'unitNakedPriceMeaning',
        align: 'right',
        width: 100,
      },
    ];
    const feightColumns = [
      {
        width: 200,
        name: 'statementsLineNum',
      },
      {
        width: 200,
        name: 'consignmentCode',
      },
      {
        width: 200,
        name: 'receiptCode',
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
      {
        name: 'taxRateMeaning',
        align: 'right',
      },
      {
        name: 'unitPriceMeaning',
        align: 'right',
      },
      {
        name: 'unitNakedPriceMeaning',
        align: 'right',
      },
    ];

    const methodColumns = [
      {
        title: intl.get('smodr.recon.model.freightRuleTypeMethod').d('运费计价方式'),
        width: 100,
        dataIndex: 'freightPricingMethodMeaning',
      },
    ];
    const colorList = [
      { colorType: 'success', matchList: ['STATEMENTED'] },
      { colorType: 'failed', matchList: ['CLOSE_STATEMENTS'] },
      { colorType: 'invalid', matchList: ['NOT_STATEMENTS'] },
      { colorType: 'warning', matchList: [] },
    ];
    const { color, initStyle } = renderTag(colorList, reconData?.[0]?.statementsStatus);

    const baseFields = [
      { name: 'statementsCode' },
      { name: 'ecStatementsCode' },
      { name: 'srmStatementsCode' },
      { name: 'statementsTotalAmount' },
      {
        name: 'statementsStatusMeaning',
        renderer: ({ text }) => (
          <Tag color={color} style={{ ...initStyle }}>
            {text}
          </Tag>
        ),
      },
      { name: 'statementsTime' },
      { name: 'lastUpdateDate' },
    ];

    return (
      <div className={styles['page-content-layout']}>
        <div className="header-line" style={{ marginTop: 0 }}>
          {intl.get('smodr.recon.view.baseInfo').d('基本信息')}
        </div>
        <FormPro
          columns={3}
          readOnly
          dataSet={this.baseDs}
          fields={baseFields}
        />
        <div className="header-line other">
          {intl.get('smodr.recon.view.reconProDetail').d('对账行商品信息')}
        </div>
        <Table
          dataSet={this.productDs}
          columns={productColumns}
          customizedCode='execute.duizhang.list'
          style={{ maxHeight: 430 }}
        />
        <div className="header-line other">
          {intl.get('smodr.recon.view.additionFreDetail').d('对账行附加费信息')}
        </div>
        <Table
          dataSet={this.freightDs}
          columns={feightColumns}
          customizedCode='execute.duizhang.list'
          style={{ maxHeight: 430 }}
        />
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
