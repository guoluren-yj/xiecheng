/**
 * GoodsManage -detail 商品上下架管理 详情
 * @date: 2019-2-7
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, Table, Collapse, Spin, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import querystring from 'querystring';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
import UploadModal from 'components/Upload/index';
import { PUBLIC_BUCKET } from '_utils/config';
import FilterForm from './FilterForm';
import Photoes from './Photoes';
// import GoodsDetail from './GoodsDetail';
import OperateRecord from '../../OperateRecord';

const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })
@connect(({ goodsDemandPur, loading }) => ({
  goodsDemandPur,
  loading: loading.effects['goodsDemandPur/fetchProductDetail'],
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(this.props.history.location.search.substr(1));
    const {
      location: { pathname = '', search = '' },
    } = this.props;
    const detailUrl = pathname + search;
    this.state = {
      detailUrl,
      modalVisible: false,
      productId: routerParam.productId,
      collapseKeys: ['baseInfo'], // 打开的折叠面板key
      priceModalVisible: false,
    };
  }

  componentDidMount() {
    this.fetchProductDetail();
  }

  /**
   * 查询商品上下架详情
   */
  @Bind()
  fetchProductDetail() {
    const { dispatch } = this.props;
    const { productId } = this.state;
    dispatch({
      type: 'goodsDemandPur/fetchProductDetail',
      payload: {
        productId,
      },
    });
  }

  /**
   * 打开操作记录弹框
   */
  @Bind()
  controlOperate() {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  }

  /**
   * 商品预览
   */
  @Bind()
  preview() {
    const {
      goodsDemandPur: { detail = {} },
    } = this.props;
    const { detailUrl } = this.state;
    const router = {
      pathname: `/scec/goods-demand-pur/goods-preview-only`,
      state: {
        detail,
      },
      search: `?${detailUrl}`,
    };
    this.props.history.push(router);
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
   * 打开阶梯价格模态框
   */
  @Bind()
  viewLadderPriceModal(productId = undefined) {
    const { dispatch } = this.props;
    dispatch({
      type: 'goodsDemandPur/fetchLadderPriceTable',
      payload: { productId },
    });
    this.setState({
      priceModalVisible: true,
    });
  }

  /**
   * hideOperationRecord - 关闭阶梯价格弹窗
   */
  @Bind()
  hideLadderPriceModal() {
    this.setState({ priceModalVisible: false });
    this.props.dispatch({
      type: 'goodsDemandPur/updateState',
      payload: {
        ladderPriceData: [],
      },
    });
  }

  render() {
    const {
      goodsDemandPur: { detail = {}, ladderPriceData = [] },
      loading,
    } = this.props;
    const { productId, collapseKeys, priceModalVisible } = this.state;
    const { attachmentUuidAs = '', attributeDetails = [] } = detail;
    const filterProps = {
      loading,
      detail,
      ladderPriceData,
      productId,
      visible: priceModalVisible,
      viewLadderPrice: this.viewLadderPriceModal,
      hideModal: this.hideLadderPriceModal,
    };
    const uploadModalProps = {
      btnText: intl.get('hzero.common.upload.view').d('查看附件'),
      btnProps: {
        icon: 'paper-clip',
      },
      showFilesNumber: false,
      attachmentUUID: attachmentUuidAs,
      bucketName: PUBLIC_BUCKET,
      bucketDirectory: 'scec-goods-demandpur',
    };
    const attrColumns = [
      {
        title: intl.get('scec.common.model.orderSeq').d('行号'),
        dataIndex: 'orderSeq',
        width: 60,
      },
      {
        dataIndex: 'attrName',
        title: intl.get('scec.common.model.attrName').d('规格参数名称'),
        width: 120,
      },
      {
        dataIndex: 'attrValue',
        title: intl.get('scec.common.model.attrValue').d('规格参数值'),
        width: 120,
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('scec.goodsDemandPur.view.goodsDemandPur.title').d('商品查询')}
          backPath="/scec/goods-demand-pur/list"
        >
          <Button type="primary" icon="eye-o" onClick={this.preview}>
            {intl.get('scec.common.button.previewGoods').d('商品预览')}
          </Button>
          <UploadModal {...uploadModalProps} viewOnly />
          <Button icon="clock-circle-o" onClick={() => this.controlOperate()}>
            {intl.get('scec.common.button.operating').d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={loading} wrapperClassName={classnames('ued-detail-wrapper')}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['baseInfo']}
              onChange={(arr) => this.onCollapseChange(arr, 'baseInfo')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get('scec.common.view.baseInfo').d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('baseInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="baseInfo"
              >
                <FilterForm {...filterProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get('scec.common.view.goodsPhoto').d('商品图片')}</h3>
                    <a>
                      {collapseKeys.includes('goodsPhoto')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('goodsPhoto') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="goodsPhoto"
              >
                <Photoes detail={detail} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get('scec.common.view.goodsIntroduction').d('商品介绍')}</h3>
                    <a>
                      {collapseKeys.includes('goodsIntroduction')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('goodsIntroduction') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="goodsIntroduction"
              >
                {detail && detail.productDetail && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: detail.productDetail.introduction,
                    }}
                  />
                )}
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get('scec.common.view.specifications').d('规格参数')}</h3>
                    <a>
                      {collapseKeys.includes('specifications')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('specifications') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="specifications"
              >
                {isEmpty(attributeDetails) ? (
                  detail &&
                  detail.productDetail && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: detail.productDetail.specificationsParam,
                      }}
                    />
                  )
                ) : (
                  <Table
                    bordered
                    columns={attrColumns}
                    dataSource={attributeDetails}
                    rowKey="productId"
                    pagination={false}
                  />
                )}
              </Panel>
            </Collapse>
          </Spin>
        </Content>
        {this.state.modalVisible && (
          <OperateRecord
            productId={productId}
            modalVisible={this.state.modalVisible}
            onHandleOk={this.controlOperate}
          />
        )}
      </React.Fragment>
    );
  }
}
