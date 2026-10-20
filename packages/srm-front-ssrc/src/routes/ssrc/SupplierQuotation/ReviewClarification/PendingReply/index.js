/**
 * Details - 澄清函详情页
 * @date: 2019-6-19
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { map, isEmpty } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import notification from 'utils/notification';
import {
  Form,
  Button,
  Input,
  Row,
  Col,
  Modal,
  Collapse,
  Icon,
  Spin,
  Pagination,
  Tooltip,
  Popover,
} from 'hzero-ui';
import queryString from 'querystring';
import classnames from 'classnames';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import DetailsForm from './DetailsForm';
import styles from './index.less';

const { Panel } = Collapse;
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
@connect(({ supplierQuotation, loading }) => ({
  supplierQuotation,
  code: supplierQuotation.code,
  questionNoticeHeader: supplierQuotation.questionNoticeHeader,
  noticeRowsList: supplierQuotation.noticeRowsList,
  noticeRowsPagination: supplierQuotation.noticeRowsPagination,
  fetchNoticeRowsLoading: loading.effects['supplierQuotation/fetchNoticeRows'],
  loadingSubmit: loading.effects['supplierQuotation/submitNoticeQuestion'],
  loadingSave: loading.effects['supplierQuotation/saveNoticeQuestion'],
}))
export default class Details extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: {}, // 问题
      bidNum: null, // 招标编号
      bidTitle: null, // 招标标题
      bidHeaderId: null, // 招标头id
      quotationHeaderId: null, // 投标头id
      supplierCompanyId: null, // 供应商公司id
      answerQuestionVisible: false, // 打开回答问题模态框标记
      collapseKeys: ['questionInformation', 'clarificationContent'], // 打开的折叠面板key
    };
  }

  componentDidMount() {
    const { noticeRowsPagination = {}, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    this.setState({
      bidNum: routerParam.bidNum,
      bidTitle: routerParam.bidTitle,
      bidHeaderId: routerParam.bidHeaderId,
      quotationHeaderId: routerParam.quotationHeaderId,
      supplierCompanyId: routerParam.supplierCompanyId,
    });
    this.handleBidIssueHeader();
    this.fetchMyQuestion(noticeRowsPagination);
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
   * 评审澄清通知头信息
   */
  @Bind()
  handleBidIssueHeader() {
    const { dispatch, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    dispatch({
      type: 'supplierQuotation/fetchNoticeHeader',
      payload: {
        clarifyNotifyId: routerParam.clarifyNotifyId,
      },
    });
  }

  /**
   * 查询我的问题
   */
  @Bind()
  fetchMyQuestion(page = {}) {
    const { dispatch, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    dispatch({
      type: 'supplierQuotation/fetchNoticeRows',
      payload: {
        page,
        clarifyNotifyId: routerParam.clarifyNotifyId || 0,
        sourceHeaderId: routerParam.bidHeaderId,
        quotationHeaderId: routerParam.quotationHeaderId,
        sourceFrom: routerParam.sourceFrom,
      },
    });
  }

  /**
   * 澄清函通知正文 - 改变分页
   */
  @Bind()
  changeNoticeLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchMyQuestion(changedPagination);
  }

  /**
   * 绑定form
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 保存Uuid
   */
  @Bind()
  afterOpenUploadModal(attachmentUUID, item) {
    const { dispatch, noticeRowsList = [] } = this.props;
    let questionInfo = null;
    noticeRowsList.forEach((questionOne, index) => {
      if (questionOne.clarifyIssueId === item.clarifyIssueId) {
        questionInfo = index;
      }
    });

    // const index = noticeRowsList.findIndex(
    //   itemList => itemList[clarifyIssueId] === item.clarifyIssueId
    // );
    const newDataSourceList = [
      ...noticeRowsList.slice(0, questionInfo),
      {
        ...noticeRowsList[questionInfo],
        currentAttachmentUuid: attachmentUUID,
      },
      ...noticeRowsList.slice(questionInfo + 1),
    ];
    dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        noticeRowsList: newDataSourceList,
      },
    });
  }

  /**
   * 供应商头部明细
   */
  @Bind()
  renderNoticeInfo(item) {
    const {
      organizationId,
      // form: { getFieldDecorator },
    } = this.props;
    const desc = item.leaderDescription || item.description;
    return (
      <div className={styles.itemList}>
        <div className={styles.itemListHeaderInfo}>
          <div style={{ clear: 'both' }} />
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <span className={styles.itemListNum}>
              <span>
                <img
                  style={{ width: 32, height: 32 }}
                  src={require('@/assets/questionIcon.svg')}
                  alt=""
                />
              </span>
              <span className={styles.itemListNumLeft}>
                <Tooltip title={`${desc}`} placement="topLeft">
                  {item.leaderLineNum ? `${item.leaderLineNum}-` : null}
                  {item.leaderDescription ? `${item.leaderDescription}` : `${item.description}`}
                </Tooltip>
              </span>
            </span>
            <span>
              <Tooltip
                title={intl
                  .get(`ssrc.supplierQuotation.view.message.button.questionFile`)
                  .d('问题附件')}
                placement="topLeft"
              >
                {''}
                {item.attachmentUuid && (
                  <Upload
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-quotationheader"
                    attachmentUUID={item.attachmentUuid}
                    tenantId={organizationId}
                    btnText={
                      <span>
                        <img src={require('@/assets/file.svg')} alt="" />
                      </span>
                    }
                    icon="none"
                    viewOnly
                  />
                )}
              </Tooltip>
            </span>
            <span>
              <Tooltip
                title={intl
                  .get(`ssrc.supplierQuotation.view.message.button.questionFile`)
                  .d('问题附件')}
                placement="topLeft"
              >
                {''}
                {item.leaderAttachmentUuid && (
                  <Upload
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-quotationheader"
                    attachmentUUID={item.leaderAttachmentUuid}
                    tenantId={organizationId}
                    btnText={
                      <span>
                        <img src={require('@/assets/file.svg')} alt="" />
                      </span>
                    }
                    icon="none"
                    viewOnly
                  />
                )}
              </Tooltip>
            </span>
            <span style={{ position: 'absolute', right: '10px' }}>
              {item.currentAnswer ? (
                <a style={{ marginRight: '32px' }} onClick={() => this.goAnswerQuestion(item)}>
                  {intl.get(`ssrc.supplierQuotation.view.title.editAnsower`).d('修改答复')}
                </a>
              ) : (
                <a style={{ marginRight: '32px' }} onClick={() => this.goAnswerQuestion(item)}>
                  {intl.get(`ssrc.supplierQuotation.view.title.ansowerQuestion`).d('回答问题')}
                </a>
              )}
              <span style={{ float: 'right' }}>
                <Upload
                  filePreview
                  fileSize={FIlESIZE}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationheader"
                  attachmentUUID={item.currentAttachmentUuid}
                  tenantId={organizationId}
                  afterOpenUploadModal={(currentAttachmentUuid) =>
                    this.afterOpenUploadModal(currentAttachmentUuid, item)
                  }
                  {...ChunkUploadProps}
                />
              </span>
            </span>
          </div>
          <div style={{ clear: 'both' }} />
          <div style={{ marginLeft: '40px', lineHeight: '20px' }}>
            {item.currentAnswer && (
              <Popover content={item.currentAnswer}>
                <span
                  style={{
                    display: 'inline-block',
                    maxWidth: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {intl.get(`ssrc.supplierQuotation.view.title.ansowerQuestion`).d('回答问题')}:
                  {item.currentAnswer}
                </span>
              </Popover>
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * 打开回答问题模态框
   */
  @Bind()
  goAnswerQuestion(item) {
    this.setState({ answerQuestionVisible: true, item });
  }

  /**
   * 隐藏回答问题模态框
   */
  @Bind()
  hideAnswerQuestionModal() {
    this.setState({ answerQuestionVisible: false, item: {} });
  }

  /**
   * 中标比例模态框
   */
  @Bind()
  showAllottedModel() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { answerQuestionVisible, item } = this.state;
    let mean = '';
    mean = (
      <Modal
        visible={answerQuestionVisible}
        width={425}
        okText={intl.get('hzero.common.button.save').d('保存')}
        onOk={() => this.saveAnswerQuestion(item)}
        onCancel={this.hideAnswerQuestionModal}
        title={intl.get(`ssrc.supplierQuotation.model.supQuo.answerQuestion`).d('回答问题')}
      >
        <Form>
          <Row gutter={48}>
            <Col span={24}>
              <Form.Item>
                {getFieldDecorator(`currentAnswer#${item.clarifyNotifyId}`, {
                  initialValue: item.currentAnswer,
                  rules: [
                    {
                      max: 480,
                      message: intl.get('hzero.common.validation.max', { max: 480 }),
                    },
                  ],
                })(<TextArea rows={4} />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
    return mean;
  }

  /**
   * 改变回答保存
   * void
   * @memberof Update
   */
  @Bind()
  saveAnswerQuestion(item) {
    const { form, dispatch, noticeRowsPagination, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    form.validateFields((err) => {
      if (isEmpty(err)) {
        const lineNoticeSaveDTOS = [
          {
            ...item,
            currentAnswer: this.props.form.getFieldValue(`currentAnswer#${item.clarifyNotifyId}`),
          },
        ];
        dispatch({
          type: 'supplierQuotation/saveAnswerQuestion',
          payload: {
            issueFrom: 'SUPPLIER',
            lineNoticeSaveDTOS,
            sourceHeaderId: routerParam.bidHeaderId,
            quotationHeaderId: routerParam.quotationHeaderId,
            sourceFrom: routerParam.sourceFrom,
          },
        }).then((res) => {
          if (res) {
            this.setState({ answerQuestionVisible: false, item: {} });
            dispatch({
              type: 'supplierQuotation/fetchNoticeRows',
              payload: {
                page: noticeRowsPagination,
                clarifyNotifyId: res[0].clarifyNotifyId || 0,
                sourceHeaderId: routerParam.bidHeaderId,
                quotationHeaderId: routerParam.quotationHeaderId,
                sourceFrom: routerParam.sourceFrom,
              },
            });
            notification.success();
          }
        });
      }
    });
  }

  /**
   * 保存
   */
  @Throttle(1200)
  @Bind()
  handleSaveQuestion() {
    const { noticeRowsList = [], questionNoticeHeader = {} } = this.props;
    this.form.validateFields((err, values) => {
      if (!err) {
        const params = {
          ...questionNoticeHeader,
          ...values,
          clarifyIssues: noticeRowsList,
        };
        this.handleSave(params);
      }
    });
  }

  @Bind()
  handleSave(params) {
    const { dispatch, noticeRowsPagination, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    dispatch({
      type: 'supplierQuotation/saveNoticeQuestion',
      payload: params,
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'supplierQuotation/fetchNoticeHeader',
          payload: {
            clarifyNotifyId: routerParam.clarifyNotifyId,
          },
        });
        dispatch({
          type: 'supplierQuotation/fetchNoticeRows',
          payload: {
            page: noticeRowsPagination,
            clarifyNotifyId: routerParam.clarifyNotifyId,
            sourceHeaderId: routerParam.bidHeaderId,
            quotationHeaderId: routerParam.quotationHeaderId,
            sourceFrom: routerParam.sourceFrom,
          },
        });
        notification.success();
      }
    });
  }

  @Bind()
  handleNoticeSubmit(params) {
    const { dispatch, history, submitLoading } = this.props;
    const { supplierCompanyId, quotationHeaderId, bidNum, bidTitle, bidHeaderId } = this.state; // eslint-disable-line
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    const { backPath } = routerParam;
    const onOk = () => {
      dispatch({
        type: 'supplierQuotation/submitNoticeQuestion',
        payload: params,
      }).then((res) => {
        if (res === 1) {
          notification.success();
          history.push(backPath);
        } else if (res === 0) {
          Modal.confirm({
            title: intl
              .get(`ssrc.supplierQuotation.view.message.sureSubmitData`)
              .d('有问题还没有回复，是否确认提交'),
            confirmLoading: submitLoading,
            onOk: () => {
              dispatch({
                type: 'supplierQuotation/submitNoticeQuestion',
                payload: { ...params, checkFlag: 0 },
              }).then((res1) => {
                if (res1) {
                  notification.success();
                  history.push(backPath);
                }
              });
            },
          });
        }
      });
    };

    // Modal.confirm({
    //   title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
    //   confirmLoading: submitLoading,
    //   // onOk,
    // });
    onOk();
  }

  /**
   * 提交
   */
  @Throttle(1200)
  @Bind()
  handleSubmitQuestion() {
    const { noticeRowsList = [], questionNoticeHeader = {} } = this.props;
    this.form.validateFields((err, values) => {
      if (!err) {
        const params = {
          ...questionNoticeHeader,
          ...values,
          clarifyIssues: noticeRowsList,
        };
        this.handleNoticeSubmit(params);
      }
    });
  }

  render() {
    const {
      fetchNoticeRowsLoading,
      questionNoticeHeader = {},
      noticeRowsList = [],
      noticeRowsPagination = {},
      loadingSave,
      loadingSubmit,
    } = this.props;
    const { collapseKeys, answerQuestionVisible } = this.state;
    const detailsFormProps = {
      onRef: this.handleBindRef,
      questionNoticeHeader,
    };
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    const { backPath, activeKey } = routerParam;
    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.supplierQuotation.view.message.tab.questionReply`).d('问题回复')}
          backPath={`${backPath}&activeKey=${activeKey}`}
        >
          <Button
            type="primary"
            icon="check"
            onClick={this.handleSubmitQuestion}
            loading={loadingSubmit}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button icon="save" loading={loadingSave} onClick={this.handleSaveQuestion}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content className={styles.contentInfo}>
          <Spin spinning={false} wrapperClassName={classnames('ued-detail-wrapper')}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={fetchNoticeRowsLoading}
                key="questionInformation"
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.supplierQuotation.view.message.panel.clarifyInfo`)
                        .d('澄清通知基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('questionInformation')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('questionInformation') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <DetailsForm {...detailsFormProps} />
              </Panel>
              <Panel
                showArrow={false}
                // className={styles.tabStyle}
                key="clarificationContent"
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.supplierQuotation.view.message.panel.clarifyMain`)
                        .d('澄清函正文')}
                    </h3>
                    <a>
                      {collapseKeys.includes('clarificationContent')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('clarificationContent') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <Spin spinning={false}>
                  {map(noticeRowsList, (item) => {
                    return <div>{this.renderNoticeInfo(item)}</div>;
                  })}
                </Spin>
                <Pagination
                  className={styles.pagination}
                  {...noticeRowsPagination}
                  onChange={(page, pageSize) => this.changeNoticeLinePagination(page, pageSize)}
                  onShowSizeChange={(current, size) =>
                    this.changeNoticeLinePagination(current, size)
                  }
                />
              </Panel>
            </Collapse>
          </Spin>
          {answerQuestionVisible && this.showAllottedModel()}
        </Content>
      </React.Fragment>
    );
  }
}
