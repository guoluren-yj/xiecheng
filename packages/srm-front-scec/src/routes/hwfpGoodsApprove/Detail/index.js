/**
 * 商品审批-工作流
 */
import React, { Component, Fragment } from 'react';
import { Form, Collapse, Spin, Icon, Modal, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import classnames from 'classnames';
import { connect } from 'dva';

import { Header, Content } from 'components/Page';
import UploadModal from 'components/Upload/index';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { PUBLIC_BUCKET } from '_utils/config';
import FilterForm from './FilterForm';
import Photoes from './Photoes';
// import GoodsDetail from './GoodsDetail';
import OperateRecord from '../../OperateRecord';

import './index.less';

const { Panel } = Collapse;

const { TextArea } = Input;
const promptKey = 'scec.goodsApprove.model.goodsApprove';

@Form.create({ fieldNameProp: null })
@connect(({ goodsApprove, loading }) => ({
  goodsApprove,
  loading: loading.effects['goodsApprove/fetchGoodsDetail'],
  approveLoading: loading.effects['goodsApprove/batchGoodsApproved'],
  rejectLoading: loading.effects['goodsApprove/batchGoodsReject'],
}))
export default class Details extends Component {
  constructor(props) {
    super(props);
    const { productId, productIds } = querystring.parse(props.history.location.search.substr(1));
    const {
      location: { pathname = '', search = '' },
    } = this.props;
    const detailUrl = pathname + search;
    this.state = {
      productId,
      productIds,
      detailUrl,
      modalVisible: false, // 是否打开操作记录弹框
      rejectModelVisible: false, // 是否打开拒绝理由提示框
      collapseKeys: ['baseInfo'], // 打开的折叠面板key
      priceModalVisible: false,
      isHasEnclosure: false, // 是否有附件
    };
  }

  componentWillReceiveProps(nextProps) {
    const { productId } = querystring.parse(nextProps.history.location.search.substr(1));
    const {
      location: { pathname = '', search = '' },
    } = nextProps;
    const detailUrl = pathname + search;
    if (this.state.productId !== productId) {
      this.fetchProductDetail(productId, detailUrl);
    }
  }

  componentDidMount() {
    this.fetchProductDetail();
  }

  /**
   * 获取附件列表，判断是有附件
   */
  @Bind()
  getEnclosureList() {
    const {
      dispatch,
      goodsApprove: { detail = {} },
    } = this.props;
    const { attachmentUuidAs } = detail;
    if (attachmentUuidAs) {
      dispatch({
        type: 'goodsApprove/getEnclosureList',
        payload: {
          attachmentUUID: attachmentUuidAs,
          bucketName: PUBLIC_BUCKET,
        },
      }).then((res) => {
        if (res && res.length > 0) this.setState({ isHasEnclosure: true });
      });
    }
  }

  /**
   * 查询商品上下架详情
   */
  @Bind()
  fetchProductDetail(pId, dUrl) {
    const { dispatch } = this.props;
    const { productId } = this.state;
    if (pId) {
      this.setState({ productId: pId, detailUrl: dUrl });
    }
    dispatch({
      type: 'goodsApprove/fetchGoodsDetail',
      payload: {
        productId: pId || productId,
      },
    }).then((res) => {
      if (res) this.getEnclosureList();
    });
  }

  /**
   * 商品审批通过
   * @param {object} params 选择需审批的参数
   */
  @Bind()
  goodsApprove() {
    const { dispatch } = this.props;
    const productIds = this.state.productId;
    dispatch({
      type: 'goodsApprove/batchGoodsApproved',
      payload: [productIds],
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.history.push('/scec/goods-approve/list');
      }
    });
  }

  /**
   * 商品审批拒绝
   * @param {object} params 选择需拒绝的参数
   */
  @Bind()
  goodsReject() {
    const { dispatch } = this.props;
    const productIds = [this.state.productId];
    const approveRemark = this.props.form.getFieldValue('approveRemark');
    dispatch({
      type: 'goodsApprove/batchGoodsReject',
      payload: {
        productIds,
        approveRemark,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.history.push('/scec/goods-approve/list');
      }
    });
  }

  /**
   * 填写拒绝理由后，确认拒绝
   */
  @Bind()
  onRejectConfirm() {
    const { rejectModelVisible } = this.state;
    this.setState({
      rejectModelVisible: !rejectModelVisible,
    });
  }

  @Bind()
  showConfirm() {
    const { rejectLoading } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title={intl.get(`${promptKey}.explain`).d('审批说明')}
        visible={this.state.rejectModelVisible}
        onOk={this.goodsReject}
        onCancel={this.onRejectConfirm}
        confirmLoading={rejectLoading}
        okText={intl.get('scec.common.action.sure').d('确定')}
        cancelText={intl.get('scec.common.action.cancel').d('取消')}
      >
        <Row gutter={24}>
          <Col span={4} className="ant-col-label-reject">
            {intl.get(`${promptKey}.objection`).d('拒绝理由')}
          </Col>
          <Col span={20}>
            <Form.Item>{getFieldDecorator('approveRemark')(<TextArea rows={4} />)}</Form.Item>
          </Col>
        </Row>
      </Modal>
    );
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
      goodsApprove: { detail = {} },
    } = this.props;
    const { detailUrl } = this.state;
    const router = {
      pathname: `/scec/goods-approve/goods-preview-only`,
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
      type: 'goodsApprove/fetchLadderPriceTable',
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
      type: 'goodsApprove/updateState',
      payload: {
        ladderPriceData: [],
      },
    });
  }

  render() {
    const {
      goodsApprove: { detail = {}, ladderPriceData = [] },
      loading,
    } = this.props;
    const { attachmentUuidAs } = detail;
    const { productId, collapseKeys, priceModalVisible, productIds, isHasEnclosure } = this.state;
    const filterList = {
      loading,
      detail,
      productId,
      ladderPriceData,
      visible: priceModalVisible,
      viewLadderPrice: this.viewLadderPriceModal,
      hideModal: this.hideLadderPriceModal,
    };
    const uploadModalProps = {
      btnText: intl.get('hzero.common.upload.view').d('查看附件'),
      showFilesNumber: false,
      attachmentUUID: attachmentUuidAs,
      bucketName: PUBLIC_BUCKET,
      bucketDirectory: 'hwfp-goods-approve',
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('scec.goodsApprove.view.goodsApprove.title').d('商品审批')}
          backPath={`/pub/scec/goods-approve-hwfp/list/${productIds}`}
        >
          {isHasEnclosure ? (
            <UploadModal {...uploadModalProps} viewOnly />
          ) : (
            <span style={{ color: 'rgba(0,0,0,.25)', cursor: 'pointer' }}>
              <Icon type="paper-clip" />
              {intl.get('hzero.common.upload.view').d('查看附件')}
            </span>
          )}
        </Header>
        <Content>
          <Spin spinning={loading} wrapperClassName={classnames('ued-detail-wrapper')}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['baseInfo']}
              onChange={this.onCollapseChange}
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
                <FilterForm {...filterList} />
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
                {detail && detail.productDetail && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: detail.productDetail.specificationsParam,
                    }}
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
        {this.showConfirm()}
      </React.Fragment>
    );
  }
}
