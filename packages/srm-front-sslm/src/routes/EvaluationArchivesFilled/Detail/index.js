/**
 * Detail - 已填制考评档案详情
 * @date: 2019-01-02
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import { Row, Col, Spin, Collapse, Icon, Form, Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { dateRender, dateTimeRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import AttachmentModal from '@/routes/EvaluationArchivesFilling/Detail/AttachmentModal';
import List from './List.js';
import Search from './Search.js';
import styles from './index.less';
import OperationLogModals from './OperationLogModals.js';

// 使用 Collapse.Panel 组件
const { Panel } = Collapse;

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/**
 * @export
 * @class Detail
 * @extends {Component} - React.Component
 * @reactProps {Object} EvaluationArchivesFilled - 数据源
 * @reactProps {!Boolean} detailLoading - 查询详情页面数据
 * @reactProps {!Boolean} detailListLoading - 查询Modal数据
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @reactProps {boolean} activityLogLoading - 加载操作记录 modal 中 table 数据
 * @returns React.element
 */
@formatterCollections({
  code: ['sslm.common', 'sslm.supplierDocManage', 'sslm.operatingRecord'],
})
@Form.create()
@withCustomize({
  unitCode: [
    'SSLM.ARCHIVE_FILLED_DETAIL.LIST_NEW',
    'SSLM.ARCHIVE_FILLED_DETAIL.DETAIL_HEADER',
    'SSLM.ARCHIVE_FILLED_DETAIL.FILLED_SEARCH',
  ],
})
@connect(({ evaluationArchivesFilled, loading, user }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  let themeConfig = {};
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    themeConfig = {
      primaryColor: colorCode,
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    evaluationArchivesFilled,
    user,
    detailLoading: loading.effects['evaluationArchivesFilled/fetchDetail'],
    detailListLoading: loading.effects['evaluationArchivesFilled/fetchDetailList'],
    activityLogLoading: loading.effects['evaluationArchivesFilled/fetchActivityLog'],
    scoreCancelLoading: loading.effects['evaluationArchivesFilled/handleScoreCancel'],
    tenantId: getCurrentOrganizationId(),
    ...themeConfig,
  };
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
      modalVisible: false,
      operationVisible: false,
      modalCode: null,
    };
  }

  /**
   * 请求页面数据
   * @param {Function} dispatch - redux dispatch 方法
   * @param {Object} match.params - 从跳转页面传递来的值
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 结果明细表格折叠和展开
   * @memberof Detail
   */
  @Bind()
  handleCollapse() {
    this.setState(state => ({
      collapsed: !state.collapsed,
    }));
  }

  /**
   * 请求复合查询条件的数据
   * @param {?string} fields - form查询字段
   */
  @Bind()
  handleSearch(fields = {}) {
    const {
      dispatch,
      tenantId,
      match: { params = {} },
    } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      filterValues = filterNullValueObject(formValue);
    }
    dispatch({
      type: 'evaluationArchivesFilled/fetchDetail',
      payload: {
        tenantId,
        ...filterValues,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'CUSTOMER_OWNED',
        evalHeaderId: params.id,
        code: 'COMPLETED', // 用于后端区分入口是已填制还是填制
        customizeUnitCode: [
          'SSLM.ARCHIVE_FILLED_DETAIL.DETAIL_HEADER',
          'SSLM.ARCHIVE_FILLED_DETAIL.FILLED_SEARCH',
          'SSLM.ARCHIVE_FILLED_DETAIL.LIST_NEW',
        ].join(),
      },
    });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 附件上传modal框
   */
  @Bind()
  handleAttachmentModal() {
    const { modalVisible } = this.state;
    this.setState({ modalVisible: !modalVisible });
  }

  /**
   * 操作记录
   */
  @Bind()
  handleViewLog() {
    this.setState({
      operationVisible: true,
      modalCode: 'viewLog',
    });
  }

  /**
   * 加载 modal 数据
   * @param {string} code - 加载的 modal 标识
   * @param {?object} page - modal 的分页信息
   * @returns {object} [promise] - dispatch 之后得到的 promise 对象
   */
  @Bind()
  handleLoadModal(code = '', page = {}) {
    const {
      dispatch,
      match: { params = {} },
    } = this.props;
    const typeObj = {
      viewLog: 'evaluationArchivesFilled/fetchActivityLog',
    };
    const dataObj = {
      viewLog: { headerId: params.id },
    };
    const paramsObj = {
      viewLog: { sourceCode: 'FILLING' },
    };
    return dispatch({
      type: typeObj[code],
      payload: {
        page,
        ...dataObj[code],
        ...paramsObj[code],
      },
    });
  }

  /**
   * 关闭 modal
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      operationVisible: false,
    });
  }

  @Bind()
  handleScoreCancel() {
    const {
      dispatch,
      form: { validateFieldsAndScroll = e => e },
      evaluationArchivesFilled: { detailData },
      history,
    } = this.props;

    validateFieldsAndScroll({ force: true }, (err, fieldsValue) => {
      if (!err) {
        const payload = {
          ...detailData,
          ...fieldsValue,
          customizeUnitCode: 'SSLM.ARCHIVE_FILLED_DETAIL.DETAIL_HEADER',
        };
        Modal.confirm({
          title: intl
            .get('sslm.supplierDocManage.view.message.ScoreCancelConfirm')
            .d('撤回评分会撤回所有指标评分，撤回后需至考评档案填制页面修改指标评分后重新提交!'),
          onOk: () => {
            dispatch({ type: 'evaluationArchivesFilled/handleScoreCancel', payload }).then(res => {
              if (res) {
                notification.success();
                history.push('/sslm/archive-filled/list');
                history.push(`/sslm/archive-filling/detail/${detailData.evalHeaderId}`);
              }
            });
          },
        });
      }
    });
  }

  render() {
    const {
      tenantId,
      detailLoading,
      detailListLoading,
      scoreCancelLoading,
      evaluationArchivesFilled: {
        detailData,
        detailData: { kpiEvalDetailLineDTOPage, evalHeaderId },
        detailLinePage,
        granularity,
        modalData,
        modalPagination,
      },
      match: { params = {} },
      customizeTable,
      customizeForm,
      custLoading,
      form,
      form: { getFieldDecorator },
      customizeFilterForm,
      user,
      activityLogLoading,
      linkColor,
    } = this.props;
    const { collapsed, modalVisible, operationVisible, modalCode } = this.state;
    const loading = { detailLoading, detailListLoading };
    const lineList = (kpiEvalDetailLineDTOPage && kpiEvalDetailLineDTOPage.content) || [];
    const tableProps = {
      customizeTable,
      custLoading,
      loading: loading.detailListLoading,
      evalGranularity: detailData.evalGranularity,
      pagination: detailLinePage,
      dataSource: lineList,
      onChange: this.handleSearch,
    };
    const searchProps = {
      tenantId,
      evalGranularity: detailData.evalGranularity,
      evalHeaderId: params.id,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      customizeFilterForm,
      custLoading,
      code: 'SSLM.ARCHIVE_FILLED_DETAIL.FILLED_SEARCH',
    };

    const attachmentModalProps = {
      evalHeaderId,
      uploadUserId: user.currentUser.id,
      viewOnly: true,
      isVisible: modalVisible,
      onCancel: this.handleAttachmentModal,
      handleRefresh: () => this.handleSearch(),
    };

    const modalProps = {
      granularity,
      visible: operationVisible,
      modalCode,
      modalData,
      evalHeaderId,
      modalPagination,
      onLoad: this.handleLoadModal,
      onClose: this.handleCloseModal,
      loading: activityLogLoading,
    };

    const isShowScoreCancel = [
      'MANUAL_EVALUATING',
      'MANUAL_COMPLETE',
      'FINAL_COLLECTED',
      'REJECTED',
    ].includes(detailData.evalStatus);

    return (
      <Fragment>
        <Header
          title={intl.get(`sslm.common.view.title.archiveFilled`).d('已填制考评档案')}
          backPath="/sslm/archive-filled/list"
        >
          <Button
            style={{ display: isShowScoreCancel ? 'inline-block' : 'none' }}
            icon="enter"
            onClick={() => this.handleScoreCancel()}
            loading={scoreCancelLoading}
          >
            {intl.get(`sslm.common.button.scoreCancel`).d('撤回评分')}
          </Button>
          <Button icon="clock-circle-o" onClick={() => this.handleViewLog()}>
            {intl.get(`sslm.common.button.operationRecords`).d('操作记录')}
          </Button>
        </Header>
        <Content className={styles['sreq-detail-form']}>
          <Spin spinning={false}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['queryDetailKey']}
              onChange={this.handleCollapse}
            >
              <Panel
                key="queryDetailKey"
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`sslm.common.view.archiveFilled.baseInfo`).d('基本信息')}</h3>
                    <a>
                      {collapsed
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                      {<Icon type={collapsed ? 'up' : 'down'} />}
                    </a>
                  </Fragment>
                }
              >
                {customizeForm(
                  {
                    code: 'SSLM.ARCHIVE_FILLED_DETAIL.DETAIL_HEADER',
                    form,
                    dataSource: detailData,
                  },
                  <Form className="ued-edit-form form-wrap">
                    <Row>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get('sslm.supplierDocManage.model.evaluationDocManage.docCode')
                            .d('档案编码')}
                        >
                          {getFieldDecorator('evalNum', {
                            initialValue: detailData.evalNum,
                          })(<span>{detailData.evalNum}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.common.model.archive.fileDescribe`).d('档案描述')}
                        >
                          {getFieldDecorator('evalName', {
                            initialValue: detailData.evalName,
                          })(<span>{detailData.evalName}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.common.model.archive.status`).d('档案状态')}
                        >
                          {getFieldDecorator('evalStatusMeaning', {
                            initialValue: detailData.evalStatusMeaning,
                          })(<span>{detailData.evalStatusMeaning}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.common.model.evaluation.template`).d('考评模板')}
                        >
                          {getFieldDecorator('evalTplName', {
                            initialValue: detailData.evalTplName,
                          })(<span>{detailData.evalTplName}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.common.view.archiveFilled.evaluationDimension`)
                            .d('考评维度')}
                        >
                          {getFieldDecorator('evalDimensionMeaning', {
                            initialValue: detailData.evalDimensionMeaning,
                          })(<span>{detailData.evalDimensionMeaning}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.common.model.dimension.value`).d('维度值')}
                        >
                          {getFieldDecorator('evalDimensionValueMeaning', {
                            initialValue: detailData.evalDimensionValueMeaning,
                          })(<span>{detailData.evalDimensionValueMeaning}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.common.model.evaluation.cycle`).d('考评周期')}
                        >
                          {getFieldDecorator('evalCycleMeaning', {
                            initialValue: detailData.evalCycleMeaning,
                          })(<span>{detailData.evalCycleMeaning}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.common.view.archiveFilled.evaluationCharger`)
                            .d('考评负责人')}
                        >
                          {getFieldDecorator('processUserName', {
                            initialValue: detailData.processUserName,
                          })(<span>{detailData.processUserName}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.common.model.archive.create.time`).d('建档时间')}
                        >
                          {getFieldDecorator('creationDate', {
                            initialValue: detailData.creationDate,
                          })(<span>{dateTimeRender(detailData.creationDate)}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.common.model.archive.evaluation.createdUserName`)
                            .d('创建人')}
                        >
                          {getFieldDecorator('createdUserName', {
                            initialValue: detailData.createdUserName,
                          })(<span>{detailData.createdUserName}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.common.model.evaluation.date.after`)
                            .d('考评日期从')}
                        >
                          {getFieldDecorator('evalDateFrom', {
                            initialValue: detailData.evalDateFrom,
                          })(<span>{dateRender(detailData.evalDateFrom)}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.common.model.evaluation.date.before`)
                            .d('考评日期至')}
                        >
                          {getFieldDecorator('evalDateTo', {
                            initialValue: detailData.evalDateTo,
                          })(<span>{dateRender(detailData.evalDateTo)}</span>)}
                        </FormItem>
                      </Col>
                      {detailData.evalTplType === 'BDKPI_EVAL' && (
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.docType`)
                              .d('单据类型')}
                          >
                            {getFieldDecorator('docTypeMeaning', {
                              initialValue: detailData.docTypeMeaning,
                            })(<span>{detailData.docTypeMeaning}</span>)}
                          </FormItem>
                        </Col>
                      )}
                    </Row>
                    {detailData.evalTplType === 'BDKPI_EVAL' && (
                      <Row>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.docNum`)
                              .d('单据')}
                          >
                            {getFieldDecorator('docNum', {
                              initialValue: detailData.docNum,
                            })(
                              <LovMulti
                                code={
                                  detailData.docType === 'YS'
                                    ? 'SSLM.KPI_EVAL.RCV_TRX_HEADER'
                                    : 'SSLM.KPI_EVAL.CONTRACT_HEAD_SUBJECT'
                                }
                                value={detailData.docNum}
                                viewOnly
                              />
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    )}
                    <Row>
                      <Col span={24}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.common.model.evaluation.rule`).d('考评规则说明')}
                        >
                          {getFieldDecorator('evalRuleRemark', {
                            initialValue: detailData.evalRuleRemark,
                          })(<span>{detailData.evalRuleRemark}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.common.model.evaluation.remark`).d('考评说明')}
                        >
                          {getFieldDecorator('remark', {
                            initialValue: detailData.remark,
                          })(<span>{detailData.remark}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.common.model.evaluation.appraisalAttachment`)
                            .d('考评附件')}
                        >
                          {getFieldDecorator('totalAttachment', {
                            initialValue: detailData.totalAttachment,
                          })(
                            <span>
                              <a onClick={() => this.handleAttachmentModal()}>
                                <Icon type="paper-clip" />
                                {intl.get('hzero.common.upload.view').d('查看附件')}
                              </a>
                              {detailData.totalAttachment ? (
                                <span
                                  style={{
                                    backgroundColor: linkColor || '#108ee9',
                                    height: 'auto',
                                    lineHeight: '15px',
                                    marginLeft: '4px',
                                    padding: '0 7px',
                                    fontSize: '12px',
                                    color: '#fff',
                                  }}
                                >
                                  {detailData.totalAttachment}
                                </span>
                              ) : null}
                            </span>
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Panel>
            </Collapse>
            <Search {...searchProps} />
            <List {...tableProps} />
            <OperationLogModals {...modalProps} />
          </Spin>
        </Content>
        {modalVisible && <AttachmentModal {...attachmentModalProps} />}
      </Fragment>
    );
  }
}
