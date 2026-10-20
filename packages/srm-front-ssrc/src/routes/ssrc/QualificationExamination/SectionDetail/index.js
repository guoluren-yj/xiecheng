/**
 * qualification - 寻源评分管理/资格审查
 * @date: 2019-3-27
 * @author: LC <chao.li03@hand-china>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Collapse, Icon, Spin, Tabs, Form, Button, Checkbox, Modal } from 'hzero-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { isEmpty, isArray, isFunction, compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import { PRIVATE_BUCKET } from '_utils/config';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getActiveTabKey } from 'utils/menuTab';

import PretrialPanelModal from '@/routes/components/PretrialPanelModal/index';
import PrequalPanel from '@/routes/ssrc/components/PrequalPanel';
import HeaderForm from './HeaderForm';
import QualificationReview from './QualificationReview';
import QualificationReviewSum from './QualificationReviewSum';
import styles from './index.less';

const { Panel } = Collapse;

class Detail extends Component {
  constructor(props) {
    super(props);
    this.initState(props, true);
  }

  /**
   * 初始化state
   * @param {Obejct} props - 组件props
   * @param {boolean} isInit - 是否初始化
   */
  initState(props, isInit) {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      [modelName]: {
        qualificationHeader: { leaderFlag },
      },
      location,
    } = props;
    const routerParams = querystring.parse(location.search.substr(1));
    const state = {
      collapseKeys: ['rfxTitle'], // 打开的折叠面板key
      attachmentUuid: undefined, // 上传附件的uuid
      pretrialPanelVisible: false, // 预审小组弹框
      activeKey: 'qualificationReview', // 当前激活 tab 面板的 key
      routerParams, // 路由上的缓存参数
      lastPrequalGroupHeaderId: undefined, // 头id
      showCheckBoxFlag: false,
      prequalCheckedKeyList: [], // 预审勾选框key集合
    };
    if (isInit) {
      this.state = state;
    } else {
      this.setState(state, () => {
        this.queryQualificationData();
        this.fetchQualificationLine();
        // 查询预审结果页签
        const { activeKey } = state;
        if (leaderFlag && activeKey) {
          // 如果是专家组长，提交资格审查后，需要查询资格审查汇总
          // eslint-disable-next-line no-unused-expressions
          this.qualificationReviewSum?.fetchQualificationSum();
        }
      });
    }
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.queryQualificationData();
  }

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate() {
    const {
      match: {
        params: { prequalGroupHeaderId },
      },
    } = this.props;
    const { lastPrequalGroupHeaderId } = this.state;
    if (lastPrequalGroupHeaderId && lastPrequalGroupHeaderId !== prequalGroupHeaderId) {
      this.setState({
        lastPrequalGroupHeaderId: prequalGroupHeaderId,
      });
      return true;
    } else if (lastPrequalGroupHeaderId === undefined) {
      this.setState({
        lastPrequalGroupHeaderId: prequalGroupHeaderId,
      });
      return false;
    }
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      // 此刻代表 `replace route`
      this.initState(this.props);
    }
  }

  /**
   * 离开页面后清空缓存
   */
  componentWillUnmount() {
    const { dispatch } = this.props;
    const { modelName = 'qualificationExamination' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        qualificationList: [], // 资格审查列表数据
        qualificationHeader: {}, // 资格审查头部信息
        qualificationLine: [], // 资格审查行列表
        qualificationLinePagination: {}, // 资格审查行分页
        qualificationRank: [], // 评分明细
        qualificationSum: [],
        lastPrequalGroupHeaderId: undefined,
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
   * queryQualificationData-初始化数据查询
   */
  @Bind()
  queryQualificationData() {
    const {
      dispatch,
      organizationId,
      modelName = 'qualificationExamination',
      match: {
        params: { prequalGroupHeaderId },
      },
    } = this.props;
    const lovCodes = {
      approvedStatus: 'SSRC.APPROVED_STATUS', // 审批通过状态
      detailApprovedStatus: 'SSRC.DETAIL_APPROVED_STATUS', //  通过状态
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
    });
    // 查看资格审查头信息
    dispatch({
      type: `${modelName}/fetchQualificationSectionHeader`,
      payload: {
        organizationId,
        prequalGroupHeaderId,
        customizeUnitCode: 'SSRC_PREQUAL.HEADER',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          attachmentUuid: res.attachmentUuid,
        });
      }
    });
  }

  /**
   * 预审小组弹框显隐
   */
  @Bind()
  showPretrialPanel(visible) {
    const {
      dispatch,
      organizationId,
      match: {
        params: { prequalGroupHeaderId },
      },
      modelName = 'qualificationExamination',
    } = this.props;
    this.setState({
      pretrialPanelVisible: visible,
    });
    if (visible) {
      dispatch({
        type: `${modelName}/fetchPretrialSectionPanel`,
        payload: {
          organizationId,
          prequalGroupHeaderId,
        },
      });
    } else {
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          pretrialPanelList: [],
        },
      });
    }
  }

  /**
   * 设置激活 tab 面板的 key
   * @param {String} activeKey
   */
  @Bind()
  changeTabs(activeKey) {
    // 切换到资格预审汇总页面，需要查询
    if (activeKey === 'qualificationReviewSum') {
      this.qualificationReviewSum.fetchQualificationSum();
    }
    this.setState({
      activeKey,
    });
  }

  /**
   *  头部标题
   */
  renderHeaderTitle(header) {
    return <h3>{header.groupName}</h3>;
  }

  /**
   * afterOpenUploadModal
   * 打开模态框的时候存储UUID
   */
  @Bind()
  afterOpenUploadModal(attachmentUuid) {
    this.setState({
      attachmentUuid,
    });
  }

  /**
   * 切换item前校验数据
   */
  @Bind()
  async validateDataBeforeChangeItem() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      [modelName]: { qualificationLine = [] },
    } = this.props;
    if (qualificationLine?.[0]?.enabledSubmitFlag > 0) {
      return this.saveQualificationLine(false);
    }
    return true;
  }

  /**
   * 切换item后钩子函数
   */
  @Bind()
  afterChangeItem(record) {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      dispatch,
      [modelName]: { qualificationLine = [] },
    } = this.props;
    // eslint-disable-next-line no-unused-expressions
    isArray(qualificationLine) && qualificationLine.forEach((r) => r?.$form.resetFields());

    // 清空数据
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        qualificationLine: [], // 资格审查行列表
        qualificationLinePagination: {}, // 资格审查行分页
      },
    });
    this.replaceRoute(record);
  }

  // 更换路由, replace route, 初始化数据, 放置在 `componentDidUpdate`
  @Bind()
  replaceRoute(record) {
    const { dispatch } = this.props;
    const { routerParams } = this.state;
    const search = querystring.stringify(routerParams);

    // 区分数据来源
    dispatch(
      routerRedux.replace({
        pathname: `${this.getParentRoutePath()}/section-detail/${record.prequalGroupHeaderId}`,
        search,
      })
    );
  }

  /**
   * 资格审查-保存资格审查
   */
  @Bind()
  async saveQualificationLine(needRefresh = true) {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      dispatch,
      organizationId,
      [modelName]: { qualificationLine = [], qualificationLinePagination = {} },
    } = this.props;
    if (isEmpty(qualificationLine)) return true;
    const validateDataSource = getEditTableData(qualificationLine);
    if (Array.isArray(validateDataSource) && validateDataSource.length !== 0) {
      return dispatch({
        type: `${modelName}/saveQualificationSectionExamination`,
        payload: {
          prequalGroupSupplierLines: validateDataSource,
          organizationId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          // eslint-disable-next-line no-unused-expressions
          needRefresh && this.fetchQualificationLine(qualificationLinePagination);
        }
        return true;
      });
    } else {
      return false;
    }
  }

  /**
   * `下次不再显示info-modal`, 点击确认
   */
  @Bind()
  handleTipsModalOk(cb, params) {
    if (this.modalInfo) {
      // 用户记忆
      this.modalInfo.destroy();
      // eslint-disable-next-line no-unused-expressions
      isFunction(cb) && cb(params);
    }
  }

  /**
   * 资格审查-提交资格审查
   */
  @Bind()
  submitQualificationLine() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      // prequalGroupHeaderId,
      [modelName]: { qualificationLine = [] },
      hideTipsFlag,
    } = this.props;
    const { prequalCheckedKeyList = [] } = this.state;
    const validateDataSource = getEditTableData(qualificationLine);
    if (Array.isArray(validateDataSource) && validateDataSource.length !== 0) {
      if (prequalCheckedKeyList?.length === 1 && !hideTipsFlag) {
        this.modalInfo = Modal.info({
          title: intl.get(`ssrc.supplierQuotation.view.title.tips`).d('提示'),
          content: (
            <div>
              <span>
                {intl
                  .get(`ssrc.supplierQuotation.view.message.submitCurrentGroupPrequalMsg`)
                  .d(
                    '是否确认仅提交当前分组的资格预审信息？若需要批量提交所有分组，请先点击选择分组按钮，勾选分组后一起提交'
                  )}
              </span>
              <Checkbox onChange={this.handleChangeHideTips}>
                <span>
                  {intl
                    .get(`ssrc.supplierQuotation.view.message.neverShowAgainTips`)
                    .d('下次不再提示')}
                </span>
              </Checkbox>
            </div>
          ),
          onOk: () => this.handleTipsModalOk(this.submitAfterValidation, validateDataSource),
        });
      } else {
        this.submitAfterValidation(validateDataSource);
      }
    }
  }

  // 校验成功后
  @Bind()
  submitAfterValidation(validateDataSource = []) {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      dispatch,
      organizationId,
      skipFlag = false,
      // prequalGroupHeaderId,
      [modelName]: {
        qualificationLinePagination = {},
        qualificationHeader: { leaderFlag },
      },
      match: {
        params: { prequalGroupHeaderId },
      },
    } = this.props;
    const { prequalCheckedKeyList = [] } = this.state;
    dispatch({
      type: `${modelName}/submitQualificationSectionExamination`,
      payload: {
        prequalGroupHeaderIds: isEmpty(prequalCheckedKeyList)
          ? [prequalGroupHeaderId]
          : prequalCheckedKeyList,
        prequalGroupSupplierLines: validateDataSource,
        organizationId,
        skipFlag: Number(skipFlag),
      },
    }).then((res) => {
      // 为0时进行操作
      // if (res === 0) {
      //   this.setState({ inquiryModelVisible: true });
      // }
      // 为1时进行操作
      // if (res === 1) {
      //   notification.success();
      //   this.props.dispatch(
      //     routerRedux.push({
      //       pathname: `/ssrc/qualification-examination/list`,
      //     })
      //   );
      // }
      if (res) {
        notification.success();
        this.fetchQualificationLine(qualificationLinePagination);
        if (leaderFlag) {
          // 如果是专家组长，提交资格审查后，需要查询资格审查汇总
          // eslint-disable-next-line no-unused-expressions
          this.qualificationReviewSum?.fetchQualificationSum();
        }

        // 刷新数据
        // eslint-disable-next-line no-unused-expressions
        this.prequalPanelRef &&
          isFunction(this.prequalPanelRef.refreshInternalState) &&
          this.prequalPanelRef.refreshInternalState();
        this.setState({
          showCheckBoxFlag: false,
        });
      }
    });
  }

  /**
   * 资格预审-行信息 - 分标段
   */
  @Bind()
  fetchQualificationLine(page = {}) {
    const {
      dispatch,
      organizationId,
      match: {
        params: { prequalGroupHeaderId },
      },
      modelName = 'qualificationExamination',
      remote,
    } = this.props;

    let data = {
      organizationId,
      prequalGroupHeaderId,
      page,
    };

    data = remote
      ? remote.process('SSRC_PREQUAL_DETAIL_SECTION_PROCESS_FETCHQUALIFICATIONLINE_DATA', data, {
          page,
          that: this,
        })
      : data;

    // 查看资格审查行信息
    dispatch({
      type: `${modelName}/fetchQualificationSectionLineList`,
      payload: data,
    });
  }

  // 获取路由前缀
  getParentRoutePath() {
    if (['/ssrc/new-inquiry-hall', '/ssrc/new-bid-hall'].includes(getActiveTabKey())) {
      return `${getActiveTabKey()}/new-qualification-examination`;
    } else {
      return '/ssrc/qualification-examination';
    }
  }

  /**
   * 获取backpath
   * */
  getBackpath() {
    const url = `${getActiveTabKey()}/list`;
    return url;
  }

  /**
   * 控制开关checkbox
   */
  @Bind()
  handleToggleCheckBox() {
    const { showCheckBoxFlag } = this.state;
    this.setState({
      showCheckBoxFlag: !showCheckBoxFlag,
      prequalCheckedKeyList: [],
    });
    // eslint-disable-next-line no-unused-expressions
    this.prequalPanelRef &&
      isFunction(this.prequalPanelRef.refreshInternalState) &&
      this.prequalPanelRef.refreshInternalState();
  }

  /**
   * 切换checkbox后需要更新state
   */
  @Bind()
  afterChangeCheckbox(checkedKeyList) {
    this.setState({
      prequalCheckedKeyList: checkedKeyList,
    });
  }

  renderContentWrapper() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      [modelName]: { qualificationHeader = {} },
      organizationId,
      match: { params },
      form,
      dispatch,
      saveLodaing,
      customizeForm = () => {},
      rankListLoading,
      saveRankLoading,
      qualificationExamination,
      fetchQualificationLoading,
      fetchQualificationSumLoading,
      remote,
    } = this.props;
    const {
      collapseKeys,
      activeKey,
      attachmentUuid = undefined,
      prequalCheckedKeyList = [],
    } = this.state;

    const headerProps = {
      form,
      customizeForm,
      organizationId,
      dataSource: qualificationHeader,
      showPretrialPanel: this.showPretrialPanel,
    };
    // 预审props
    const qualReviewProps = {
      dispatch,
      modelName,
      prequalCheckedKeyList,
      rankListLoading,
      saveRankLoading,
      organizationId,
      qualificationExamination,
      fetchQualificationLoading,
      remote,
    };

    const qualificationReviewSumProps = {
      dispatch,
      modelName,
      saveLodaing,
      organizationId,
      qualificationExamination,
      fetchQualificationSumLoading,
      remote,
    };

    return (
      <div>
        <Spin spinning={false} wrapperClassName={classnames('ued-detail-wrapper')}>
          <Collapse
            className="form-collapse"
            defaultActiveKey={['rfxTitle']}
            onChange={(arr) => this.onCollapseChange(arr, 'rfxTitle')}
          >
            <Panel
              showArrow={false}
              header={
                <Fragment>
                  {this.renderHeaderTitle(qualificationHeader)}
                  <a>
                    {collapseKeys.includes('rfxTitle')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('rfxTitle') ? 'up' : 'down'} />
                </Fragment>
              }
              key="rfxTitle"
            >
              <HeaderForm {...headerProps} />
            </Panel>
          </Collapse>
          <Tabs animated={false} activeKey={activeKey} onChange={this.changeTabs}>
            <Tabs.TabPane
              tab={intl.get(`ssrc.qualiExam.view.tab.qualificationReview`).d('资格预审')}
              key="qualificationReview"
              forceRender
            >
              <QualificationReview
                prequalGroupHeaderId={params.prequalGroupHeaderId}
                skipFlag={qualificationHeader.skipFlag}
                leaderFlag={qualificationHeader.leaderFlag}
                qualificationHeader={qualificationHeader}
                attachmentUuid={attachmentUuid}
                onRef={(node) => {
                  this.qualificationReview = node;
                }}
                {...qualReviewProps}
              />
            </Tabs.TabPane>
            {Number(qualificationHeader.skipFlag) !== 1 &&
            Number(qualificationHeader.leaderFlag) ? (
              <Tabs.TabPane
                tab={intl.get(`ssrc.qualiExam.view.tab.qualificationReviewSum`).d('资格预审结果')}
                key="qualificationReviewSum"
                forceRender
              >
                <QualificationReviewSum
                  prequalGroupHeaderId={params.prequalGroupHeaderId}
                  onRef={(node) => {
                    this.qualificationReviewSum = node;
                  }}
                  {...qualificationReviewSumProps}
                />
              </Tabs.TabPane>
            ) : (
              ''
            )}
          </Tabs>
        </Spin>
      </div>
    );
  }

  render() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      [modelName]: {
        qualificationLine,
        pretrialPanelList = [],
        qualificationHeader: { mergeType },
      },
      fetchPretrialPanelLoading,
      saveQualificationLoading = false,
      submitQualificationLoading,
      match: {
        params: { prequalGroupHeaderId },
      },
      fetchQualificationSectionLineListLoading = false,
    } = this.props;
    const {
      showCheckBoxFlag,
      pretrialPanelVisible,
      routerParams: { sourceProjectId },
    } = this.state;

    const pretrialPanelProps = {
      visible: pretrialPanelVisible,
      dataSource: pretrialPanelList,
      loading: fetchPretrialPanelLoading,
      onHideModal: this.showPretrialPanel,
    };

    const prequalPanelProps = {
      showCheckBoxFlag,
      queryParams: {
        sourceProjectId,
        prequalGroupHeaderId,
      },
      type: 'purchase',
      afterChangeCheckbox: this.afterChangeCheckbox,
      validateDataBeforeChangeItem: this.validateDataBeforeChangeItem,
      afterChangeItem: this.afterChangeItem,
    };

    const BackPath = this.getBackpath();

    return (
      <Fragment>
        <div className={styles.qualificationWrap}>
          <Spin spinning={saveQualificationLoading || fetchQualificationSectionLineListLoading}>
            <Header
              backPath={BackPath}
              title={intl.get(`ssrc.qualiExam.view.message.zigeyushen`).d('资格预审')}
            >
              {/* {qualificationHeader.prequalFlag === 1 ||
          (!isEmpty(qualificationLine) &&
            (qualificationLine[0].prequalGroupSupplierLineStatus === 'APPROVED' ||
              qualificationLine[0].prequalGroupSupplierLineStatus === 'REFUSED')) ? (
                <div className="upload">
                  <Upload
                    viewOnly
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    attachmentUUID={attachmentUuid === null ? undefined : attachmentUuid}
                    btnProps={{ icon: 'download' }}
                  />
                </div>
          ) : (
            <div className="upload">
              <Upload
                filePreview
                bucketName={PRIVATE_BUCKET}
                fileSize={FIlESIZE}
                attachmentUUID={attachmentUuid === null ? undefined : attachmentUuid}
                text={intl.get(`ssrc.qualiExam.model.button.upload`).d('上传附件')}
                btnProps={{ icon: 'upload' }}
                afterOpenUploadModal={this.afterOpenUploadModal}
              />
            </div>
          )} */}
              {qualificationLine?.[0]?.enabledSubmitFlag > 0 && (
                <>
                  <Button
                    type="primary"
                    onClick={this.submitQualificationLine}
                    loading={submitQualificationLoading || fetchQualificationSectionLineListLoading}
                  >
                    {intl.get('hzero.common.button.submit').d('提交')}
                  </Button>
                  <Button
                    onClick={this.saveQualificationLine}
                    loading={saveQualificationLoading || fetchQualificationSectionLineListLoading}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                  {mergeType !== 'ALL' && (
                    <Button onClick={this.handleToggleCheckBox}>
                      {showCheckBoxFlag
                        ? intl.get('ssrc.qualiExam.view.button.cancelSelect').d('取消选择')
                        : mergeType === 'GROUP'
                        ? intl.get('ssrc.qualiExam.view.button.selectGroup').d('选择分组')
                        : intl.get('ssrc.qualiExam.view.button.selectSection').d('选择标段')}
                    </Button>
                  )}
                </>
              )}
            </Header>
            <PrequalPanel
              ref={(vnode) => {
                this.prequalPanelRef = vnode;
              }}
              {...prequalPanelProps}
            >
              <Content>{this.renderContentWrapper()}</Content>
            </PrequalPanel>
            <PretrialPanelModal {...pretrialPanelProps} />
          </Spin>
        </div>
      </Fragment>
    );
  }
}

const hocComponent = (com) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC_PREQUAL.HEADER', // 预审申请
      ],
    }),
    connect(({ qualificationExamination, loading }) => ({
      qualificationExamination,
      modelName: 'qualificationExamination',
      loading: loading.effects['qualificationExamination/fetchQualificationLineList'],
      fetchHeaderLoading:
        loading.effects['qualificationExamination/fetchQualificationSectionHeader'],
      fetchPretrialPanelLoading:
        loading.effects['qualificationExamination/fetchPretrialSectionPanel'],
      saveQualificationLoading:
        loading.effects['qualificationExamination/saveQualificationSectionExamination'],
      submitQualificationLoading:
        loading.effects['qualificationExamination/submitQualificationSectionExamination'],
      organizationId: getCurrentOrganizationId(),
      fetchQualificationSectionLineListLoading:
        loading.effects['qualificationExamination/fetchQualificationSectionLineList'],
      fetchQualificationLoading:
        loading.effects['qualificationExamination/fetchQualificationSectionLineList'],
      rankListLoading:
        loading.effects['qualificationExamination/fetchQualificationSectionRankList'],
      saveRankLoading: loading.effects['qualificationExamination/saveQualificationSectionRankList'],
      fetchQualificationSumLoading:
        loading.effects['qualificationExamination/fetchQualificationSectionSum'],
      saveLodaing: loading.effects['qualificationExamination/saveSubmitQualificationSectionSum'],
    })),
    formatterCollections({
      code: ['ssrc.qualiExam', 'ssrc.common'],
    }),
    remoteHoc({
      code: 'SSRC_PREQUAL_DETAIL_SECTION',
      name: 'remote',
    }),
    Form.create({ fieldNameProp: null })
  )(com);

export default hocComponent(Detail);
export { Detail, hocComponent };
