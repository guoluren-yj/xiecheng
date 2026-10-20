/**
 * AcceptBidNotice - 中标公告
 * @date: 2020-05-07
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import {
  Button,
  Collapse,
  Icon,
  Form,
  Row,
  Col,
  Input,
  InputNumber,
  Select,
  Modal,
  Spin,
} from 'hzero-ui';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { connect } from 'dva';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from '_components/Upload';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
} from 'utils/constants';
import IMChatDraggable from '_components/IMChatDraggable';
import { PRIVATE_BUCKET } from '_utils/config';
import { FILE_SIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

import common from '@/routes/sbid/common.less';
import style from './index.less';

const { Panel } = Collapse;
const { Option } = Select;
const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.acceptBidNotice'] })
@connect(({ bidNotice, loading }) => ({
  bidNotice,
  queryAcceptLoading: loading.effects['bidNotice/fetchNoticeData'],
  publishAcceptLoading: loading.effects['bidNotice/publishAcceptNotice'],
  saveLoading: loading.effects['bidNotice/saveAcceptNotice'],
  organizationId: getCurrentOrganizationId(),
}))
export default class AcceptBidNotice extends PureComponent {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    this.state = {
      collapseKeys: ['baseInfos', 'bidNotice'], // 折叠面板
      sourceHeaderId: routerParams.sourceHeaderId || undefined,
    };
  }

  componentDidMount() {
    this.fetchNoticeData();
    this.batchCode();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'bidNotice/updateState',
      payload: {
        noticeData: {},
      },
    });
  }

  /**
   * 查询公告
   */
  @Bind()
  async fetchNoticeData() {
    const { dispatch } = this.props;
    const { sourceHeaderId } = this.state;
    const result = await dispatch({
      type: 'bidNotice/fetchNoticeData',
      payload: {
        sourceFrom: 'BID',
        noticeType: 'BR_ACCEPTED',
        sourceHeaderId,
      },
    });
    if (result && result.noticeRuleStatus === 'RELEASE' && result.winNoticeFlag) {
      this.fetchQueryAcceptNotice();
    }
  }

  // 查询预览公告数据, 为了给拖拽组件传递数据源
  fetchQueryAcceptNotice() {
    const { dispatch } = this.props;
    const { sourceHeaderId } = this.state;
    dispatch({
      type: 'bidNotice/queryAcceptNotice',
      payload: {
        sourceFrom: 'BID',
        sourceType: 'BR_ACCEPTED',
        sourceHeaderId,
      },
    });
  }

  /**
   * 查询多个值集
   */
  batchCode() {
    const { dispatch } = this.props;
    const lovCodes = {
      noticeRangeType: 'SSRC.NOTICE_VISIBLE_RANGE_TYPE', // 中标公示范围
      noticeVisible: 'SSRC.VISIBLE_TYPE', // 寻源-可见控制类型
    };

    dispatch({
      type: 'bidNotice/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      form: { validateFields },
      bidNotice: { noticeData = {} },
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'bidNotice/saveAcceptNotice',
          payload: { ...noticeData, ...values, noticeType: 'BR_ACCEPTED', sourceFrom: 'BID' },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchNoticeData();
          }
        });
      }
    });
  }

  /**
   * 发布
   */
  @Bind()
  handlePublish() {
    const {
      dispatch,
      publishAcceptLoading,
      form: { validateFields },
      bidNotice: { noticeData = {} },
    } = this.props;
    Modal.confirm({
      title: intl.get('ssrc.acceptBidNotice.view.title.confirmPublish').d('确定发布?'),
      confirmLoading: publishAcceptLoading,
      onOk: () => {
        validateFields((err, values) => {
          if (!err) {
            dispatch({
              type: 'bidNotice/publishAcceptNotice',
              payload: { ...noticeData, ...values, noticeType: 'BR_ACCEPTED', sourceFrom: 'BID' },
            }).then((res) => {
              if (res) {
                notification.success();
                this.fetchNoticeData();
              }
            });
          }
        });
      },
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
   * 跳转预览页面
   */
  @Bind()
  jumpBidNoticeDetail() {
    // const { dispatch } = this.props;
    const { sourceHeaderId = undefined } = this.state;
    const search = querystring.stringify({
      sourceHeaderId,
    });

    parent.openTab({
      key: `/ssrc/bid-hall/accept-bid-notice-detail`,
      path: `/ssrc/bid-hall/accept-bid-notice-detail`,
      action: intl.get(`ssrc.acceptBidNotice.view.message.title.acceptNotice`).d('中标公告'),
      // title: intl.get(`ssrc.acceptBidNotice.view.message.title.acceptNotice`).d('中标公告'),
      title: 'srm.common.tab.title.ssrc.acceptNotice',
      closable: true,
      search,
    });

    // dispatch(
    //   routerRedux.push({
    //     pathname: `/ssrc/bid-hall/accept-bid-notice-detail`,
    //     search,
    //   })
    // );
  }

  /**
   * backPath 返回页判断
   */
  @Bind()
  backJudge() {
    const routerParams = querystring.parse(this.props.location.search.substr(1));
    const { backRecommend } = routerParams;
    return backRecommend ? '/ssrc/supplier-bid-query/list' : '/ssrc/bid-hall/list';
  }

  renderBasicInfosForm() {
    const {
      bidNotice: { noticeData = {} },
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidNum`).d('招标编号')}
              value={noticeData.bidNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.bidMatter').d('招标事项')}
              value={noticeData.bidTitle}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.company').d('公司')}
              value={noticeData.companyName}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.purchaseContact')
                .d('采购联系人')}
              value={noticeData.purName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.contactTel')
                .d('联系人电话')}
              value={noticeData.purPhone}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.contactEmail')
                .d('联系人邮箱')}
              value={noticeData.purEmail}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              className={style['notice-style']}
              label={intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.notices').d('通知/公告')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('winMessageFlag', {
                initialValue: noticeData.noticeRuleId ? (noticeData.winMessageFlag ? 1 : 0) : 1,
              })(
                <Checkbox disabled>
                  {intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.bidNotice').d('中标通知')}
                </Checkbox>
              )}
              {getFieldDecorator('loseMessageFlag', {
                initialValue: noticeData.noticeRuleId ? (noticeData.loseMessageFlag ? 1 : 0) : 1,
              })(
                <Checkbox disabled={noticeData.noticeRuleStatus === 'RELEASE'}>
                  {intl
                    .get('ssrc.acceptBidNotice.model.acceptBidNotice.unBidNotice')
                    .d('未中标通知')}
                </Checkbox>
              )}
              {getFieldDecorator('winNoticeFlag', {
                initialValue: noticeData.noticeRuleId ? (noticeData.winNoticeFlag ? 1 : 0) : 0,
              })(
                <Checkbox disabled={noticeData.noticeRuleStatus === 'RELEASE'}>
                  {intl
                    .get('ssrc.acceptBidNotice.model.acceptBidNotice.bidAnnouncement')
                    .d('中标公告')}
                </Checkbox>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  renderBidNoticeForm() {
    const {
      organizationId,
      form: { getFieldDecorator },
      bidNotice: {
        code: { noticeRangeType = [], noticeVisible = [] },
        noticeData = {},
      },
    } = this.props;
    const { expertScoreType } = noticeData;
    const formsLayouts = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };
    return (
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col span={16}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.noticeTitle`)
                .d('公告标题')}
              {...formsLayouts}
            >
              {getFieldDecorator('noticeTitle', {
                initialValue:
                  noticeData.noticeTitle === null
                    ? noticeData.bidTitle +
                      intl.get('ssrc.acceptBidNotice.view.message.title.acceptNotice').d('中标公告')
                    : noticeData.noticeTitle,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.acceptBidNotice.model.acceptBidNotice.noticeTitle`)
                        .d('公告标题'),
                    }),
                  },
                ],
              })(<Input style={{ marginLeft: '6%', width: '99%' }} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.noticeDays`)
                .d('公告天数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('noticeDays', {
                initialValue: noticeData.noticeDays,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.acceptBidNotice.model.acceptBidNotice.noticeDays`)
                        .d('公告天数'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  className={style['ant-input-number-width']}
                  min={1}
                  precision={0}
                  max={100000}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.visibleRangeType`)
                .d('公示范围')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('visibleRangeType', {
                initialValue: noticeData.visibleRangeType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.acceptBidNotice.model.acceptBidNotice.visibleRangeType`)
                        .d('公示范围'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {noticeRangeType &&
                    noticeRangeType.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.nameVisibleType`)
                .d('供应商名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('nameVisibleType', {
                initialValue: noticeData.nameVisibleType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.acceptBidNotice.model.acceptBidNotice.nameVisibleType`)
                        .d('供应商名称'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {noticeVisible &&
                    noticeVisible.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.priceVisibleType`)
                .d('中标价格')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('priceVisibleType', {
                initialValue: noticeData.priceVisibleType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.acceptBidNotice.model.acceptBidNotice.priceVisibleType`)
                        .d('中标价格'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {noticeVisible &&
                    noticeVisible.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.quantityVisibleType`)
                .d('中标数量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quantityVisibleType', {
                initialValue: noticeData.quantityVisibleType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.acceptBidNotice.model.acceptBidNotice.quantityVisibleType`)
                        .d('中标数量'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {noticeVisible &&
                    noticeVisible.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {expertScoreType !== 'NONE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`ssrc.acceptBidNotice.model.acceptBidNotice.expertVisibleType`)
                  .d('评审专家')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('expertVisibleType', {
                  initialValue: noticeData.expertVisibleType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.acceptBidNotice.model.acceptBidNotice.expertVisibleType`)
                          .d('评审专家'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear>
                    {noticeVisible &&
                      noticeVisible.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.noticeAttachment`)
                .d('公告附件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('noticeAttachmentUuid', {
                initialValue: noticeData.noticeAttachmentUuid,
              })(
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-tendernotice-detail"
                  attachmentUUID={noticeData.noticeAttachmentUuid}
                  tenantId={organizationId}
                  {...ChunkUploadProps}
                  fileSize={FILE_SIZE}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.previewAnnouncement`)
                .d('公告预览')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {noticeData.noticeRuleId ? (
                <a onClick={() => this.jumpBidNoticeDetail()}>
                  {intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.preview`).d('预览')}
                </a>
              ) : null}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  renderReadBidNoticeForm() {
    const {
      organizationId,
      bidNotice: { noticeData = {} },
    } = this.props;
    const { expertScoreType } = noticeData;
    const formsLayouts = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };
    return (
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col span={16}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.noticeTitle`)
                .d('公告标题')}
              {...formsLayouts}
            >
              <span style={{ marginLeft: '6%' }}>{noticeData.noticeTitle}</span>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.noticeDays`)
                .d('公告天数')}
              value={noticeData.noticeDays}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.visibleRangeType`)
                .d('公示范围')}
              value={noticeData.visibleRangeTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.nameVisibleType`)
                .d('供应商名称')}
              value={noticeData.nameVisibleTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.priceVisibleType`)
                .d('中标价格')}
              value={noticeData.priceVisibleTypeMeaning}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.quantityVisibleType`)
                .d('中标数量')}
              value={noticeData.quantityVisibleTypeMeaning}
            />
          </Col>
          {expertScoreType !== 'NONE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <UEDDisplayFormItem
                label={intl
                  .get(`ssrc.acceptBidNotice.model.acceptBidNotice.expertVisibleType`)
                  .d('评审专家')}
                value={noticeData.expertVisibleTypeMeaning}
              />
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.acceptBidNotice.model.acceptBidNotice.noticeAttachment')
                .d('公告附件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Upload
                filePreview
                chunkUpload
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-tendernotice-detail"
                attachmentUUID={noticeData.noticeAttachmentUuid}
                tenantId={organizationId}
                icon="download"
                viewOnly
              />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.acceptBidNotice.model.acceptBidNotice.previewAnnouncement`)
                .d('公告预览')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a onClick={() => this.jumpBidNoticeDetail()}>
                {intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.preview`).d('预览')}
              </a>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 渲染title
   */
  titleRender() {
    const {
      bidNotice: { noticeData = {}, acceptNoticeObj = {} },
    } = this.props;
    const { bidNum, noticeRuleStatus, winNoticeFlag = 0 } = noticeData;
    const {
      bidHeaderId,
      bidTitle,
      subjectMatterRule,
      bidLineItemListNONE = [],
      bidLineItemListPACK = [],
    } = acceptNoticeObj;
    const title = intl
      .get('ssrc.acceptBidNotice.view.message.title.bidNoticeAnnounce')
      .d('中标通知/公告');
    if (noticeRuleStatus !== 'RELEASE' || !winNoticeFlag) {
      return title;
    }
    const chatProps = {
      cardCode: 'SSRC_BID_ANNOUNCEMENT_OF_WINNING_BID',
      cardType: 'ARTICLE',
      dragText: bidNum,
      requestBody: {
        ...acceptNoticeObj,
        id: bidHeaderId,
        title: bidTitle,
        lineItemList: subjectMatterRule === 'NONE' ? bidLineItemListNONE : bidLineItemListPACK,
      },
    };
    return <IMChatDraggable {...chatProps}>{title}</IMChatDraggable>;
  }

  render() {
    const {
      publishAcceptLoading,
      queryAcceptLoading,
      saveLoading,
      form: { getFieldValue },
      bidNotice: { noticeData = {} },
    } = this.props;
    const { collapseKeys } = this.state;

    return (
      <React.Fragment>
        <Header title={this.titleRender()} backPath={this.backJudge()}>
          {noticeData.noticeRuleStatus !== 'RELEASE' && (
            <Button
              type="primary"
              icon="rocket"
              onClick={this.handlePublish}
              loading={publishAcceptLoading}
            >
              {intl.get('hzero.common.button.release').d('发布')}
            </Button>
          )}
          {noticeData.noticeRuleStatus !== 'RELEASE' && (
            <Button type="default" icon="save" onClick={this.handleSave} loading={saveLoading}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
        </Header>
        <Content className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}>
          <Spin spinning={queryAcceptLoading}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['baseInfos', 'bidNotice']}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>
                      {intl.get(`ssrc.acceptBidNotice.view.message.panel.baseInfos`).d('基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('baseInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="baseInfos"
              >
                {this.renderBasicInfosForm()}
              </Panel>
              {getFieldValue('winNoticeFlag') && (
                <Panel
                  showArrow={false}
                  header={
                    <React.Fragment>
                      <h3>
                        {intl
                          .get(`ssrc.acceptBidNotice.view.message.panel.bidNotice`)
                          .d('中标公告')}
                      </h3>
                      <a>
                        {collapseKeys.includes('bidNotice')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('bidNotice') ? 'up' : 'down'} />
                    </React.Fragment>
                  }
                  key="bidNotice"
                >
                  {noticeData.noticeRuleStatus === 'RELEASE'
                    ? this.renderReadBidNoticeForm()
                    : this.renderBidNoticeForm()}
                </Panel>
              )}
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
