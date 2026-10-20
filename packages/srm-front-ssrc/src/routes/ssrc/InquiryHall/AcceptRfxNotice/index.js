/**
 * 询价单 - 中标公告
 * @date: 20120-6-4
 * @author: zk <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
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
  Spin,
  Modal,
} from 'hzero-ui';
import { Button as C7NButton } from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isArray } from 'lodash';
import classnames from 'classnames';
import { connect } from 'dva';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_3_LAYOUT,
} from 'utils/constants';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getActiveTabKey } from 'utils/menuTab';
import Upload from '_components/Upload';
import {
  recallNotice,
  publishWInnerBidNotice,
  BidNoticeValidateBeforePublish,
} from '@/services/inquiryHallService';
import { phoneRender } from '@/utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import IMChatDraggable from '_components/IMChatDraggable';
import { BID, getDocumentTypeName, INQUIRY } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { openOrFreshTab } from '@/utils/utils';

import common from '@/routes/sbid/common.less';
import style from './index.less';

const { Panel } = Collapse;
const { Option } = Select;
const FormItem = Form.Item;

class AcceptRfxNotice extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapseKeys: ['baseInfos', 'bidNotice'], // 折叠面板
      publishWInnerBidNoticeLoading: false,
      validateParmas: {}, // 额外的校验参数
    };
  }

  sourceKey = this.props.sourceKey || INQUIRY;

  bidFlag = this.sourceKey === BID;

  documentTypeName = getDocumentTypeName(this.bidFlag);

  remoteRef = {}; // 二开新增页签的ref

  componentDidMount() {
    this.fetchWInnerBidNotice();
    this.batchCode();
  }

  componentWillUnmount() {
    const { modelName = 'inquiryHall' } = this.props;
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        winBidNoticeInfo: {},
      },
    });
  }

  /**
   * 查询预览询价公告 - 提供给移动端拖拽组件使用
   */
  /**
   * 招标公告
   * */
  queryPreviewWInnerBidNotice() {
    const {
      dispatch,
      modelName = 'inquiryHall',
      match: { params = {} },
      organizationId,
    } = this.props;

    dispatch({
      type: `${modelName}/previewWInnerBidNotice`,
      payload: {
        organizationId,
        noticeType: 'BR_ACCEPTED',
        sourceFrom: 'RFX',
        sourceHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 查询公告
   */
  @Bind()
  async fetchWInnerBidNotice(data = {}) {
    const {
      dispatch,
      modelName = 'inquiryHall',
      match: { params = {} },
      organizationId,
    } = this.props;

    const result = await dispatch({
      type: `${modelName}/fetchWInnerBidNotice`,
      payload: {
        ...data,
        organizationId,
        sourceFrom: 'RFX',
        sourceHeaderId: params.rfxId,
        noticeType: 'BR_ACCEPTED',
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM,SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM_READ,SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM_INFO`,
      },
    });
    if (result && result.sourceStatus && result.sourceStatus !== 'FINISHED') {
      this.props.history.push(`${getActiveTabKey()}/list`);
    }
    if (result && result.noticeRuleStatus === 'RELEASE' && result.winNoticeFlag) {
      this.queryPreviewWInnerBidNotice();
    }
  }

  /**
   * 查询多个值集
   */
  batchCode() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    const lovCodes = {
      noticeRangeType: 'SSRC.NOTICE_VISIBLE_RANGE_TYPE', // 中标公示范围
      noticeVisible: 'SSRC.VISIBLE_TYPE', // 寻源-可见控制类型
    };

    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
    });
  }

  /**
   * 保存
   */
  @Throttle(500)
  @Bind()
  async handleSave() {
    const { remote, modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      organizationId,
      form: { validateFields },
      match: { params = {} },
      [modelName]: { winBidNoticeInfo = {} },
    } = this.props;

    if (await this.otherValidate(winBidNoticeInfo)) {
      return;
    }
    validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: `${modelName}/saveWInnerBidNotice`,
          payload: {
            organizationId,
            data: {
              ...winBidNoticeInfo,
              ...values,
              noticeType: 'BR_ACCEPTED',
              sourceFrom: 'RFX',
              sourceHeaderId: params.rfxId,
            },
            customizeUnitCode: `SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM,SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM_INFO`,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchWInnerBidNotice();
          }
        });
      }
    });
    if (remote?.event) {
      remote.event.fireEvent('cuxSaveAfter', {
        _this: this,
      });
    }
  }

  // 跳过校验保存
  @Bind()
  skipValidateSave(value) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      organizationId,
      form: { validateFields },
      match: { params = {} },
      [modelName]: { winBidNoticeInfo = {} },
    } = this.props;

    validateFields((err, values) => {
      dispatch({
        type: `${modelName}/saveWInnerBidNotice`,
        payload: {
          organizationId,
          data: {
            ...winBidNoticeInfo,
            ...values,
            winNoticeFlag: value,
            noticeType: 'BR_ACCEPTED',
            sourceFrom: 'RFX',
            sourceHeaderId: params.rfxId,
          },
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM,SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM_INFO`,
        },
      }).then((res) => {
        if (res) {
          this.fetchWInnerBidNotice();
        }
      });
    });
  }

  /**
   * 此方法被百年人寿二开
   */
  @Bind()
  // eslint-disable-next-line no-unused-vars
  otherValidate(winBidNoticeInfo) {
    return false;
  }

  /**
   * 发布
   */
  @Throttle(500)
  @Bind()
  async handlePublish() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      form,
      organizationId,
      form: { validateFields },
      match: { params = {} },
      [modelName]: { winBidNoticeInfo = {} },
      history,
    } = this.props;
    if (await this.otherValidate(winBidNoticeInfo)) {
      return;
    }

    validateFields(async (err, values) => {
      if (!err) {
        this.setState({
          publishWInnerBidNoticeLoading: true,
        });
        const props = {
          organizationId,
          data: {
            ...winBidNoticeInfo,
            ...values,
            noticeType: 'BR_ACCEPTED',
            sourceFrom: 'RFX',
            sourceHeaderId: params.rfxId,
            ...this.state.validateParmas,
          },
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM`,
        };

        const publish = async (res = null) => {
          const result = getResponse(await publishWInnerBidNotice({ ...props }));
          if (result && !result.failed) {
            notification.success();
            // eslint-disable-next-line no-unused-expressions
            form?.resetFields();
            this.fetchWInnerBidNotice();
          }
          this.setState({
            publishWInnerBidNoticeLoading: false,
          });

          if (isEmpty(res) || !isArray(res)) {
            return;
          }

          const jumpObj = res.filter((item) => item.jumpUrl);
          if (jumpObj && jumpObj.length) {
            history.push(jumpObj[0].jumpUrl);
          }
        };

        /**
         * 循环校验弹框
         */
        const confirmSubmit = (res) => {
          if (isEmpty(validateResult)) {
            publish(res);
            return;
          }
          const currentObj = validateResult[0];
          if (currentObj.type === 'ERROR') {
            Modal.error({
              content: currentObj.message,
              onOk: () => {
                this.setState({
                  publishWInnerBidNoticeLoading: false,
                });
                if (currentObj.jumpUrl) {
                  history.push(currentObj.jumpUrl);
                }
              },
            });
          } else if (currentObj.type === 'WARNING') {
            // 统一处理只提交操作的
            Modal.confirm({
              content: currentObj.message,
              onOk: () => {
                validateResult.splice(0, 1);
                confirmSubmit(res);
              },
              onCancel: () => {
                this.setState({
                  publishWInnerBidNoticeLoading: false,
                });
              },
            });
          }
        };

        let validateResult = [];
        // 发布前校验
        const result = getResponse(await BidNoticeValidateBeforePublish({ ...props }));
        if (result && result.length) {
          validateResult = JSON.parse(JSON.stringify(result));
          confirmSubmit(result);
        } else {
          publish(result);
        }
      } else {
        this.setState({
          publishWInnerBidNoticeLoading: false,
        });
      }
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
   * backPath 返回页判断
   */
  @Bind()
  backJudge() {
    const back = `${getActiveTabKey()}/list`;
    return back;
  }

  // 中标公告预览
  @Bind()
  previewNotice() {
    const {
      match: { params },
    } = this.props;

    const tabKey = `/ssrc/${this.bidFlag ? 'new-bid' : 'inquiry'}-hall/accept-rfx-notice-detail/${
      params.rfxId
    }`;

    openOrFreshTab({
      key: tabKey,
      path: tabKey,
      action: 'ssrc.inquiryHall.view.title.acceptNotice',
      // title: intl.get(`ssrc.inquiryHall.view.title.acceptNotice`).d('中标公告'),
      title: 'srm.common.tab.title.ssrc.acceptNotice',
      closable: true,
    });
  }

  // 勾选中标通知
  @Bind()
  handleChange(e) {
    const { remote } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('onChange', {
        handleSave: this.skipValidateSave,
        value: e.target.checked,
      });
    }
  }

  renderBasicInfosForm() {
    const { modelName = 'inquiryHall', remote } = this.props;

    const {
      [modelName]: { winBidNoticeInfo = {} },
      form,
      form: { getFieldDecorator },
      match: { params },
      customizeForm,
    } = this.props;

    return customizeForm(
      {
        code: `SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM_INFO`,
        form,
        dataSource: winBidNoticeInfo,
      },
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonRfxNo`, {
                  documentTypeName: this.bidFlag ? 'BID' : 'RFX',
                })
                .d('{documentTypeName}单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceNum', {
                initialValue: winBidNoticeInfo.sourceNum,
                rules: [
                  {
                    required: false,
                  },
                ],
              })(<span>{winBidNoticeInfo.sourceNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonInquiryTitle`, {
                  documentTypeName: this.documentTypeName,
                })
                .d('{documentTypeName}标题')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceTitle', {
                initialValue: winBidNoticeInfo.sourceTitle,
              })(<span>{winBidNoticeInfo.sourceTitle}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.company').d('公司')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('companyName', {
                initialValue: winBidNoticeInfo.companyName,
              })(<span>{winBidNoticeInfo.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.purchaseContact').d('采购联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purName', {
                initialValue: winBidNoticeInfo.purName,
              })(<span>{winBidNoticeInfo.purName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.contactTel').d('联系人电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator(
                'purPhone',
                {}
              )(
                <span>
                  {phoneRender(
                    winBidNoticeInfo.internationalTelCodeMeaning,
                    winBidNoticeInfo.purPhone
                  )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {remote ? (
              remote.render(
                'SSRC_ACCEPT_RFX_NOTICE_RENDER_BASEFORM_PRUEMAIL',
                <FormItem
                  label={intl
                    .get('ssrc.inquiryHall.model.inquiryHall.contactEmail')
                    .d('联系人邮箱')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('purEmail', {
                    initialValue: winBidNoticeInfo.purEmail,
                  })(<span>{winBidNoticeInfo.purEmail}</span>)}
                </FormItem>,
                {
                  FormItem,
                  winBidNoticeInfo,
                  getFieldDecorator,
                }
              )
            ) : (
              <FormItem
                label={intl.get('ssrc.inquiryHall.model.inquiryHall.contactEmail').d('联系人邮箱')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('purEmail', {
                  initialValue: winBidNoticeInfo.purEmail,
                })(<span>{winBidNoticeInfo.purEmail}</span>)}
              </FormItem>
            )}
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              className={style['notice-style']}
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.bidNotice').d('中标通知')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('winMessageFlag', {
                initialValue: winBidNoticeInfo.noticeRuleId
                  ? winBidNoticeInfo.winMessageFlag
                    ? 1
                    : 0
                  : 1,
                rules: [
                  {
                    required: false,
                  },
                ],
              })(<Checkbox disabled />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              className={style['notice-style']}
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.unBidNotice').d('未中标通知')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('loseMessageFlag', {
                initialValue: winBidNoticeInfo.noticeRuleId
                  ? winBidNoticeInfo.loseMessageFlag
                    ? 1
                    : 0
                  : 1,
                rules: [
                  {
                    required: false,
                  },
                ],
              })(
                <Checkbox
                  disabled={['RECALL', 'RELEASE'].includes(winBidNoticeInfo.noticeRuleStatus)}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              className={style['notice-style']}
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.bidAnnouncement').d('中标公告')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('winNoticeFlag', {
                initialValue: remote
                  ? remote.process(
                      'SSRC_ACCEPT_RFX_NOTICE_PROCESS_WIN_NOTICE_VALUE',
                      winBidNoticeInfo.noticeRuleId ? (winBidNoticeInfo.winNoticeFlag ? 1 : 0) : 0,
                      {
                        bidFlag: this.bidFlag,
                        winBidNoticeInfo,
                      }
                    )
                  : winBidNoticeInfo.noticeRuleId
                  ? winBidNoticeInfo.winNoticeFlag
                    ? 1
                    : 0
                  : 0,
                rules: [
                  {
                    required: false,
                  },
                ],
              })(
                <Checkbox
                  disabled={['RECALL', 'RELEASE'].includes(winBidNoticeInfo.noticeRuleStatus)}
                  onChange={this.handleChange}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_2_LAYOUT}>
            {remote
              ? remote.render('SSRC_ACCEPT_RFX_NOTICE_RENDER_FORM_BUTTON', <></>, {
                  rfxHeaderId: params.rfxId,
                  noticeRuleStatus: winBidNoticeInfo.noticeRuleStatus,
                  form,
                  winBidNoticeInfo,
                })
              : null}
          </Col>
        </Row>
      </Form>
    );
  }

  // 中标公告编辑,展示表单
  renderBidNoticeForm() {
    const { modelName = 'inquiryHall' } = this.props;

    const {
      organizationId,
      form: { getFieldDecorator },
      [modelName]: {
        winBidNoticeInfo = {},
        code: { noticeVisible = [], noticeRangeType = [] },
      },
      customizeForm,
      remote,
      form,
      match: { params },
    } = this.props;
    const { expertScoreType, sourceTitle } = winBidNoticeInfo;
    const otherProps = {
      form,
      sourceTitle,
      rfxHeaderId: params.rfxId,
      handleSave: this.handleSave,
    };
    return (
      <React.Fragment>
        {customizeForm(
          {
            code: `SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM`,
            form: this.props.form,
            dataSource: winBidNoticeInfo,
          },
          <Form className="writable-row-custom">
            <Row {...EDIT_FORM_ROW_LAYOUT} type="flex" justify="start">
              <Col {...FORM_COL_2_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.bidHall.model.bidHall.noticeTitle').d('公告标题')}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                >
                  {getFieldDecorator('noticeTitle', {
                    initialValue:
                      winBidNoticeInfo.noticeTitle ||
                      `${winBidNoticeInfo.sourceTitle || ''}${intl
                        .get('ssrc.inquiryHall.view.message.panel.bidWinnerNotice')
                        .d('中标公告')}`,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('ssrc.bidHall.model.bidHall.noticeNum').d('公告编号'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.bidHall.model.bidHall.noticeDays').d('公告天数')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('noticeDays', {
                    initialValue: winBidNoticeInfo.noticeDays,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('ssrc.bidHall.model.bidHall.noticeDays').d('公告天数'),
                        }),
                      },
                    ],
                  })(<InputNumber min={1} max={100000} precision={0} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.couldViewRange`).d('可见范围')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('visibleRangeType', {
                    initialValue: winBidNoticeInfo.visibleRangeType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.couldViewRange`).d('可见范围'),
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
                  label={intl.get('ssrc.common.supplierName').d('供应商名称')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('nameVisibleType', {
                    initialValue: winBidNoticeInfo.nameVisibleType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('ssrc.common.supplierName').d('供应商名称'),
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
                  label={intl.get(`ssrc.bidHall.model.bidHall.bieWinnerPrice`).d('中标价格')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('priceVisibleType', {
                    initialValue: remote
                      ? remote.process(
                          'SSRC_ACCEPT_RFX_NOTICE_PROCESS_PRICEVISIBLETYPE_INITIAL',
                          winBidNoticeInfo.priceVisibleType
                        )
                      : winBidNoticeInfo.priceVisibleType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.bieWinnerPrice`).d('中标价格'),
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
                  label={intl.get(`ssrc.bidHall.model.bidHall.bieWinnerNumber`).d('中标数量')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('quantityVisibleType', {
                    initialValue: winBidNoticeInfo.quantityVisibleType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.bidHall.model.bidHall.bieWinnerNumber`)
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
                    label={intl.get(`ssrc.bidHall.model.bidHall.expertVisibleType`).d('评审专家')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('expertVisibleType', {
                      initialValue: winBidNoticeInfo.expertVisibleType,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`ssrc.bidHall.model.bidHall.expertVisibleType`)
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
                  label={intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('noticeAttachmentUuid', {
                    initialValue: winBidNoticeInfo.noticeAttachmentUuid,
                  })(
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-tendernotice-detail"
                      attachmentUUID={winBidNoticeInfo.noticeAttachmentUuid}
                      tenantId={organizationId}
                      fileSize={FIlESIZE}
                      {...ChunkUploadProps}
                    />
                  )}
                </FormItem>
              </Col>
              {winBidNoticeInfo.noticeRuleId && (
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get('ssrc.bidHall.model.bidHall.noticePreview').d('公告预览')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('inquiryGroup')(
                      <a onClick={this.previewNotice}>
                        {intl.get('hzero.common.button.preview').d('预览')}
                      </a>
                    )}
                  </FormItem>
                </Col>
              )}
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                {remote
                  ? remote.render(
                      'SSRC_ACCEPT_RFX_NOTICE_RENDER_BID_NOTICE_FORM',
                    <></>,
                      otherProps
                    )
                  : null}
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }

  renderReadBidNoticeForm() {
    const { modelName = 'inquiryHall' } = this.props;

    const {
      organizationId,
      form: { getFieldDecorator },
      [modelName]: { winBidNoticeInfo = {} },
      customizeForm,
      remote,
      form,
      match: { params },
    } = this.props;
    const { expertScoreType, sourceTitle } = winBidNoticeInfo;
    const otherProps = {
      form,
      sourceTitle,
      rfxHeaderId: params.rfxId,
    };
    return (
      <React.Fragment>
        {customizeForm(
          {
            code: `SSRC.${this.sourceKey}_HALL_NOTICE.NOTICE_FORM_READ`,
            form: this.props.form,
            dataSource: winBidNoticeInfo,
          },
          <Form className="writable-row-custom">
            <Row {...EDIT_FORM_ROW_LAYOUT} type="flex" justify="start">
              <Col {...FORM_COL_2_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.bidHall.model.bidHall.noticeTitle').d('公告标题')}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                >
                  {getFieldDecorator('noticeTitle')(<span>{winBidNoticeInfo.noticeTitle}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.bidHall.model.bidHall.noticeDays').d('公告天数')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('noticeDays')(<span>{winBidNoticeInfo.noticeDays}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.couldViewRange`).d('可见范围')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('visibleRangeType')(
                    <span>{winBidNoticeInfo.visibleRangeTypeMeaning}</span>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.common.supplierName').d('供应商名称')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('nameVisibleType')(
                    <span>{winBidNoticeInfo.nameVisibleTypeMeaning}</span>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.bieWinnerPrice`).d('中标价格')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('priceVisibleType')(
                    <span>{winBidNoticeInfo.priceVisibleTypeMeaning}</span>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.bieWinnerNumber`).d('中标数量')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('quantityVisibleType')(
                    <span>{winBidNoticeInfo.quantityVisibleTypeMeaning}</span>
                  )}
                </FormItem>
              </Col>
              {expertScoreType !== 'NONE' && (
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`ssrc.bidHall.model.bidHall.expertVisibleType`).d('评审专家')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('expertVisibleType')(
                      <span>{winBidNoticeInfo.expertVisibleTypeMeaning}</span>
                    )}
                  </FormItem>
                </Col>
              )}
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.bidHall.model.bidHall.noticeAttachment').d('公告附件')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('noticeAttachmentUuid')(
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-tendernotice-detail"
                      attachmentUUID={winBidNoticeInfo.noticeAttachmentUuid}
                      tenantId={organizationId}
                      icon="download"
                      viewOnly
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.bidHall.model.bidHall.noticePreview').d('公告预览')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('inquiryGroup')(
                    <a onClick={this.previewNotice}>
                      {intl.get('hzero.common.button.preview').d('预览')}
                    </a>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                {remote
                  ? remote.render(
                      'SSRC_ACCEPT_RFX_NOTICE_RENDER_READ_BID_NOTICE_FORM',
                    <></>,
                      otherProps
                    )
                  : null}
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }

  /**
   * 渲染title
   */
  titleRender() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { winBidNoticeInfo = {}, previewWinNoticeInfo = {} },
    } = this.props;
    const { sourceNum, noticeRuleStatus, winNoticeFlag = 0 } = winBidNoticeInfo;
    const {
      sourceHeaderId,
      sourceTitle,
      sourceCategoryMeaning,
      rfxLineItemList = [],
    } = previewWinNoticeInfo;
    const title = intl
      .get('ssrc.inquiryHall.view.message.title.bidNoticeAnnounce')
      .d('中标通知/公告');
    if (noticeRuleStatus !== 'RELEASE' || !winNoticeFlag) {
      return title;
    }
    const chatProps = {
      cardCode: 'SSRC_RFX_ANNOUNCEMENT_OF_WINNING_BID',
      cardType: 'ARTICLE',
      dragText: `${sourceCategoryMeaning}${sourceNum}`,
      requestBody: () => ({
        ...previewWinNoticeInfo,
        id: sourceHeaderId,
        title: sourceTitle,
        lineItemList: rfxLineItemList,
      }),
      showDetail: true,
    };
    return <IMChatDraggable {...chatProps}>{title}</IMChatDraggable>;
  }

  @Throttle(500)
  @Bind()
  async handleRecall() {
    const { modelName = 'inquiryHall' } = this.props;

    const {
      [modelName]: { winBidNoticeInfo = {} },
    } = this.props;
    const {
      sourceFrom,
      noticeType,
      noticeRuleId,
      sourceHeaderId,
      noticeRuleStatus,
      objectVersionNumber,
    } = winBidNoticeInfo;
    const params = {
      sourceFrom,
      noticeType,
      noticeRuleId,
      sourceHeaderId,
      noticeRuleStatus,
      objectVersionNumber,
    };
    const res = getResponse(await recallNotice(params));
    if (res) {
      notification.success();
      this.fetchWInnerBidNotice();
    }
  }

  renderHeaderButtons() {
    const {
      modelName = 'inquiryHall',
      match: { params = {} },
      form: { getFieldValue },
    } = this.props;
    const {
      saveWInnerBidNoticeLoading,
      [modelName]: { winBidNoticeInfo = {} },
      remote,
    } = this.props;
    const { publishWInnerBidNoticeLoading } = this.state;
    const buttons = [
      winBidNoticeInfo.noticeRuleStatus !== 'RELEASE' && (
        <Button
          type="primary"
          icon="rocket"
          name="release"
          onClick={this.handlePublish}
          loading={publishWInnerBidNoticeLoading}
        >
          {intl.get('hzero.common.button.release').d('发布')}
        </Button>
      ),
      winBidNoticeInfo.noticeRuleStatus !== 'RELEASE' && (
        <Button
          type="default"
          icon="save"
          onClick={this.handleSave}
          loading={saveWInnerBidNoticeLoading}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      ),
      winBidNoticeInfo.noticeRuleStatus === 'RELEASE' &&
      winBidNoticeInfo.noticeRuleId &&
      winBidNoticeInfo.winNoticeFlag ? (
        <C7NButton color="primary" icon="reply" onClick={this.handleRecall}>
          {intl.get('ssrc.acceptBidNotice.model.button.recallNotice').d('撤销公告')}
        </C7NButton>
      ) : null,
    ].filter(Boolean);
    if (!remote) {
      return buttons;
    }
    return remote.process('SSRC_ACCEPT_RFX_NOTICE_PROCESS_HEADER_BUTTONS', buttons, {
      winBidNoticeInfo,
      rfxHeaderId: params.rfxId,
      fetchWInnerBidNotice: this.fetchWInnerBidNotice,
      bidFlag: this.bidFlag,
      getFieldValue,
      that: this,
    });
  }

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      fetchWInnerBidNoticeLoading,
      form: { getFieldValue },
      [modelName]: { winBidNoticeInfo = {} },
      remote,
      match: { params = {} },
      history,
    } = this.props;
    const { collapseKeys } = this.state;

    return (
      <React.Fragment>
        <Header title={this.titleRender()} backPath={this.backJudge()}>
          {this.renderHeaderButtons()}
        </Header>
        <Content className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}>
          <Spin spinning={fetchWInnerBidNoticeLoading}>
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
                      {intl.get(`ssrc.inquiryHall.view.message.panel.baseInfos`).d('基本信息')}
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
                        {remote
                          ? remote.process(
                              'SSRC_ACCEPT_BID_NOTICE_PROCESS_NOTICE_TITLE',
                              intl.get(`ssrc.inquiryHall.view.panel.winnerBidNotice`).d('中标公告'),
                              { bidFlag: this.bidFlag }
                            )
                          : intl.get(`ssrc.inquiryHall.view.panel.winnerBidNotice`).d('中标公告')}
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
                  {remote
                    ? remote.render(
                        'SSRC_ACCEPT_BID_NOTICE_RENDER_BID_NOTICE',
                        winBidNoticeInfo.noticeRuleStatus === 'RELEASE'
                          ? this.renderReadBidNoticeForm()
                          : this.renderBidNoticeForm(),
                        {
                          winBidNoticeInfo,
                          bidFlag: this.bidFlag,
                          getFieldValue,
                          rfxHeaderId: params.rfxId,
                          history,
                          remoteRef: this.remoteRef,
                          fetchWInnerBidNotice: this.fetchWInnerBidNotice,
                        }
                      )
                    : winBidNoticeInfo.noticeRuleStatus === 'RELEASE'
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

const hocFunc = (com) => {
  return withCustomize({
    unitCode: [
      'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM_INFO', // 基础信息
      'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM', // 中标公告表单
      'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM_READ', // 中标公告表单(只读)
    ],
  })(
    Form.create({ fieldNameProp: null })(
      formatterCollections({
        code: [
          'ssrc.inquiryHall',
          'ssrc.bidHall',
          'ssrc.common',
          'ssrc.acceptBidNotice',
          'ssrc.scux',
        ],
      })(
        connect(({ inquiryHall, loading }) => ({
          modelName: 'inquiryHall',
          inquiryHall,
          fetchWInnerBidNoticeLoading: loading.effects['inquiryHall/fetchWInnerBidNotice'],
          saveWInnerBidNoticeLoading: loading.effects['inquiryHall/saveWInnerBidNotice'],
          organizationId: getCurrentOrganizationId(),
        }))(com)
      )
    )
  );
};

export { AcceptRfxNotice, hocFunc };
export default hocFunc(AcceptRfxNotice);
