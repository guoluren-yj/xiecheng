/**
 * GoodsManage -detail 商品上下架管理 详情
 * @date: 2019-2-7
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Table, Button, Popconfirm, Collapse, Spin, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import classnames from 'classnames';
import querystring from 'querystring';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import UploadModal from 'components/Upload/index';
import { PUBLIC_BUCKET } from '_utils/config';
import FilterForm from './FilterForm';
import Photoes from './Photoes';
// import GoodsDetail from './GoodsDetail';
import OperateRecord from '../../OperateRecord';
import CauseModal from '../causeModal';

const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })
@connect(({ goodsManage, loading }) => ({
  goodsManage,
  loading: loading.effects['goodsManage/fetchProductDetail'],
  putAwayLoading: loading.effects['goodsManage/batchPutaway'],
  unShelveLoading: loading.effects['goodsManage/batchUnShelve'],
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
      tabStatus: routerParam.tabStatus,
      collapseKeys: ['baseInfo'], // 打开的折叠面板key
      priceModalVisible: false,
      causeVisible: false,
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
      type: 'goodsManage/fetchProductDetail',
      payload: {
        productId,
      },
    });
  }

  @Bind()
  controlOperate() {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  }

  /**
   * 上架
   */
  @Bind()
  sheleveGoods() {
    const { dispatch } = this.props;
    const { productId } = this.state;
    dispatch({
      type: 'goodsManage/batchPutaway',
      payload: [productId],
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.history.push('/scec/goods-manage/list');
      }
    });
  }

  @Bind()
  handleSetting() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'goodsManage/getSettings',
    });
  }

  /**
   * 下架
   */
  @Bind()
  unSheleveGoods() {
    const { productId } = this.state;
    const { dispatch } = this.props;
    const param = [{ productId }];
    this.handleSetting().then((res) => {
      if (res) {
        this.setState({
          causeVisible: true,
        });
      } else {
        dispatch({
          type: 'goodsManage/batchUnShelve',
          payload: param,
        }).then((response) => {
          if (response) {
            notification.success();
            this.props.history.push('/scec/goods-manage/list');
          }
        });
      }
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 商品预览
   */
  @Bind()
  preview() {
    const {
      goodsManage: { detail = {} },
    } = this.props;
    const { detailUrl } = this.state;
    const router = {
      pathname: `/scec/goods-manage/goods-preview-only`,
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
      type: 'goodsManage/fetchLadderPriceTable',
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
      type: 'goodsManage/updateState',
      payload: {
        ladderPriceData: [],
      },
    });
  }

  @Bind()
  handleCancel() {
    this.setState({
      causeVisible: false,
    });
  }

  @Bind()
  handleOk() {
    const { productId } = this.state;
    const value = this.form.getFieldValue('operatedRemark');
    const param = [
      {
        productId,
        operatedRemark: value,
      },
    ];
    this.handBatchUnsheleve(param);
    this.setState({
      causeVisible: false,
    });
  }

  @Bind()
  handBatchUnsheleve(params = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'goodsManage/batchUnShelve',
      payload: params,
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.history.push('/scec/goods-manage/list');
      }
    });
  }

  render() {
    const {
      goodsManage: { detail = {}, ladderPriceData = [] },
      loading,
      putAwayLoading,
      unShelveLoading,
    } = this.props;
    const { attachmentUuidAs = '', attributeDetails = [] } = detail;
    const { tabStatus, productId, collapseKeys, priceModalVisible } = this.state;
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
      bucketDirectory: 'scec-goods-manage',
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
          title={
            tabStatus === 'a'
              ? intl.get('scec.goodsManage.view.goodsManage.sheleve').d('待上架')
              : intl.get('scec.goodsManage.view.goodsManage.unSheleve').d('已上架')
          }
          backPath={`/scec/goods-manage/list?tabStatus=${tabStatus}`}
        >
          <Button type="primary" icon="eye-o" onClick={this.preview}>
            {intl.get('scec.common.button.previewGoods').d('商品预览')}
          </Button>
          {tabStatus === 'a' ? (
            <Popconfirm
              title={intl.get('scec.common.warning.tilte.sheleve').d('你确认上架吗?')}
              onConfirm={() => this.sheleveGoods()}
              okText={intl.get('scec.common.action.sure').d('确定')}
              cancelText={intl.get('scec.common.action.cancel').d('取消')}
            >
              <Button icon="upload" loading={putAwayLoading}>
                {intl.get('scec.goodsManage.button.goodsManage.sheleve').d('上架')}
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title={intl.get('scec.common.warning.tilte.unSheleve').d('你确认下架吗?')}
              onConfirm={() => this.unSheleveGoods()}
              okText={intl.get('scec.common.action.sure').d('确定')}
              cancelText={intl.get('scec.common.action.cancel').d('取消')}
            >
              <Button
                icon="download"
                loading={unShelveLoading}
                disabled={detail.productStatus !== 'SHELF'}
              >
                {intl.get('scec.goodsManage.button.goodsManage.unSheleve').d('下架')}
              </Button>
            </Popconfirm>
          )}
          <UploadModal {...uploadModalProps} viewOnly />
          <Button icon="clock-circle-o" onClick={() => this.controlOperate()}>
            {intl.get('scec.common.button.operating').d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={loading} wrapperClassName={classnames('ued-detail-wrapper')}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
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
        {this.state.causeVisible && (
          <CauseModal
            onRef={this.handleRef}
            modalVisible={this.state.causeVisible}
            onHandleCancel={this.handleCancel}
            onHandleOk={this.handleOk}
          />
        )}
      </React.Fragment>
    );
  }
}
