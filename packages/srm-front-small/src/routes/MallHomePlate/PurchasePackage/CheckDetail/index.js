import React, { Component, Fragment } from 'react';
import qs from 'querystring';
import { isUndefined } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { Col, Form, Row, Collapse, Icon, Spin } from 'hzero-ui';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT_COL_2, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';

import { productDs } from './productDs';

const { Panel } = Collapse;
const FormItem = Form.Item;

@formatterCollections({ code: ['small.mallHomePlate', 'small.common'] })
@connect(({ loading, mallHomePlate }) => ({
  mallHomePlate,
  headerLoading: loading.effects['mallHomePlate/fetchPackageHeader'],
}))
export default class CreateShoppingBasket extends Component {
  constructor(props) {
    super(props);
    const { companyId, marketBasketId } = props.match.params;
    this.state = {
      companyId,
      marketBasketId,
      collapseKeys: ['top', 'bottom'],
    };
  }

  productDs = new DataSet(productDs);

  componentDidMount() {
    const {
      dispatch,
      location: { state = { _back: 1 } },
    } = this.props;
    const { marketBasketId } = this.state;
    this.productDs.setQueryParameter('marketBasketId', marketBasketId);
    if (!isUndefined(marketBasketId) && state && state._back !== -1) {
      this.fetchBarData();
      this.productDs.query();
    }
    dispatch({
      type: 'mallHomePlate/init',
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 查询购物篮的基本信息
   */
  @Bind()
  fetchBarData(page = {}) {
    const { dispatch } = this.props;
    const { companyId, marketBasketId } = this.state;
    dispatch({
      type: 'mallHomePlate/fetchPackageHeader',
      payload: {
        page,
        companyId,
        marketBasketId,
      },
    });
  }

  /**
   * 打开商品预览框
   */
  @Bind()
  handleProductView(record) {
    const { companyId } = this.state;
    const { productId, sourceFrom } = record;
    openTab({
      key: '/small/commom-goods-preview',
      title: intl.get('small.common.button.previewGoods').d('商品预览'),
      search: qs.stringify({
        productId,
        sourceFrom,
        companyId,
      }),
    });
  }

  /**
   * 渲染购物篮明细
   */
  renderShoppingBasketForm() {
    const {
      mallHomePlate: { packageHeaderInfo = {} },
    } = this.props;
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.packageName`).d('采购套餐名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <span>{packageHeaderInfo.basketName}</span>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`small.common.model.startTime`).d('开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <span>{packageHeaderInfo.startDate}</span>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`small.common.model.endTime`).d('截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <span>{packageHeaderInfo.endDate}</span>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames('last-form-item', 'half-row')}>
          <Col span={12}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.packageRemark`).d('采购套餐介绍')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {packageHeaderInfo.remark || ''}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { headerLoading } = this.props;
    const { collapseKeys, marketBasketId } = this.state;
    const columns = [
      {
        name: 'sourceType',
        width: 100,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'productNum',
        width: 200,
      },
      {
        name: 'productName',
        minWidth: 250,
      },
      {
        name: 'purchaseQuantity',
        width: 200,
      },
      // {
      //   name: 'option',
      //   width: 100,
      //   renderer: ({ record }) => (
      //     <a onClick={() => this.handleProductView(record.toData())}>
      //       {intl.get(`small.mallHomePlate.model.preview`).d('预览')}
      //     </a>
      //   ),
      // },
    ];
    return (
      <Fragment>
        <Header
          title={intl.get('small.mallHomePlate.view.package.detail').d('采购套餐明细')}
          backPath="/small/mall-home-plate/list?key=package"
        />
        <Content>
          <Spin spinning={!!headerLoading} wrapperClassName="ued-detail-wrapper">
            <Collapse
              defaultActiveKey={['top', 'bottom']}
              onChange={(arr) => this.onCollapseChange(arr, 'top')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get('small.mallHomePlate.view.package.baseInfo').d('采购套餐基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('top')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('top') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="top"
              >
                {this.renderShoppingBasketForm()}
              </Panel>
              {marketBasketId && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl.get('small.mallHomePlate.view.package.product').d('采购套餐商品')}
                      </h3>
                      <a>
                        {collapseKeys.includes('bottom')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('bottom') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="bottom"
                >
                  <Table dataSet={this.productDs} columns={columns} />
                </Panel>
              )}
            </Collapse>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
