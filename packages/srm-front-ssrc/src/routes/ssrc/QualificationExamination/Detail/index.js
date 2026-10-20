/**
 * qualification - 寻源评分管理/资格审查
 * @date: 2019-3-27
 * @author: LC <chao.li03@hand-china>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Tag, Collapse, Icon, Spin, Tabs, Form, Tooltip } from 'hzero-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
// import querystring from 'querystring';
import { isEmpty, compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getActiveTabKey } from 'utils/menuTab';

import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentTenant, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import remoteHoc from 'hzero-front/lib/utils/remote';

import PretrialPanelModal from '@/routes/components/PretrialPanelModal/index';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { fetchConfigSheet } from '@/services/inquiryHallService';

import HeaderForm from './HeaderForm';
import QualificationReview from './QualificationReview';
import QualificationReviewSum from './QualificationReviewSum';
import styles from './index.less';

const { Panel } = Collapse;

class DetailComponnet extends Component {
  constructor(props) {
    super(props);
    // const routerParams = querystring.parse(props.location.search.substr(1));
    this.state = {
      collapseKeys: ['rfxTitle'], // 打开的折叠面板key
      attachmentUuid: undefined, // 上传附件的uuid
      pretrialPanelVisible: false, // 预审小组弹框
      activeKey: 'qualificationReview', // 当前激活 tab 面板的 key
      // routerParams, // 路由上的缓存参数
      lastPrequalHeaderId: undefined, // 头id
      supplierConfigOldUserFlag: true, // 采购方租户是否在配置表中
    };
  }

  activeTabKey = getActiveTabKey();

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const { remote } = this.props;
    // 初始化数据查询
    this.queryQualificationData();
    this.fetchSupplierOldUserConfig();
    if (remote) {
      remote.event.fireEvent('remoteDidMount', {
        that: this,
        qualificationReviewRef: this.qualificationReview,
      });
    }
  }

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate() {
    const {
      match: {
        params: { rfxId },
      },
    } = this.props;
    const { lastPrequalHeaderId } = this.state;
    if (lastPrequalHeaderId && lastPrequalHeaderId !== rfxId) {
      this.setState({
        lastPrequalHeaderId: rfxId,
      });
      return true;
    } else if (lastPrequalHeaderId === undefined) {
      this.setState({
        lastPrequalHeaderId: rfxId,
      });
      return false;
    }
  }

  componentDidUpdate(preProps, preState, snap) {
    if (snap) {
      this.queryQualificationData();
      this.qualificationReview.fetchQualificationLine();
    }
  }

  /**
   * 离开页面后清空缓存
   */
  componentWillUnmount() {
    const { dispatch, modelName = 'qualificationExamination' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        qualificationList: [], // 资格审查列表数据
        qualificationHeader: {}, // 资格审查头部信息
        qualificationLine: [], // 资格审查行列表
        qualificationLinePagination: {}, // 资格审查行分页
        qualificationRank: [], // 评分明细
        qualificationSum: [],
        lastPrequalHeaderId: undefined,
      },
    });
  }

  // 查询供应商是否是老租户-配置表
  @Bind()
  fetchSupplierOldUserConfig = async () => {
    const { organizationId } = this.props;
    try {
      let result = await fetchConfigSheet({
        organizationId,
        configCode: 'sslm_life_cycle_new_360_bk',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      result = getResponse(result);
      if (!result) {
        return;
      }
      if (isEmpty(result)) {
        this.setState({
          supplierConfigOldUserFlag: false,
        });
      }
    } catch (e) {
      throw e;
    }
  };

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
    const { organizationId, match, dispatch, modelName = 'qualificationExamination' } = this.props;
    const { rfxId } = match.params;
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
      type: `${modelName}/fetchQualificationHeader`,
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
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
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      dispatch,
      organizationId,
      [modelName]: { qualificationHeader = {} },
    } = this.props;
    this.setState({
      pretrialPanelVisible: visible,
    });
    const rfxHeaderId =
      qualificationHeader?.secondarySourceCategory === 'BID'
        ? qualificationHeader?.bidHeaderId
        : qualificationHeader?.rfxHeaderId;
    if (visible && rfxHeaderId && qualificationHeader?.prequalCategory) {
      dispatch({
        type: `${modelName}/fetchPretrialPanel`,
        payload: {
          sourceHeaderId: rfxHeaderId,
          sourceFrom: qualificationHeader.prequalCategory,
          organizationId,
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

  renderQualificationReview(params, qualificationHeader, attachmentUuid, customizeTable) {
    const {
      form,
      dispatch,
      saveRankLoading,
      rankListLoading,
      qualificationExamination,
      saveQualificationLoading,
      fetchQualificationLoading,
      submitQualificationLoading,
      organizationId,
      modelName,
      remote,
    } = this.props;
    const { supplierConfigOldUserFlag } = this.state;
    const QualificationReviewProps = {
      form,
      dispatch,
      customizeTable,
      attachmentUuid,
      rankListLoading,
      saveRankLoading,
      qualificationHeader,
      saveQualificationLoading,
      qualificationExamination,
      fetchQualificationLoading,
      submitQualificationLoading,
      prequalHeaderId: params.rfxId,
      skipFlag: qualificationHeader.skipFlag,
      leaderFlag: qualificationHeader.leaderFlag,
      onRef: (node) => {
        this.qualificationReview = node;
      },
      organizationId,
      modelName,
      supplierConfigOldUserFlag,
      remote,
    };
    return <QualificationReview {...QualificationReviewProps} />;
  }

  renderQualificationReviewSum({ prequalHeaderId, onRef, customizeTable }) {
    const {
      dispatch,
      qualificationExamination,
      fetchQualificationSumLoading,
      organizationId,
      modelName,
    } = this.props;
    const QualificationReviewSumProps = {
      onRef,
      dispatch,
      customizeTable,
      prequalHeaderId,
      qualificationExamination,
      fetchQualificationSumLoading,
      organizationId,
      modelName,
    };
    return <QualificationReviewSum {...QualificationReviewSumProps} />;
  }

  /**
   *  头部标题
   */
  renderHeaderTitle(header, collapseKeys) {
    const rfxNum = header.secondarySourceCategory === 'BID' ? header.bidNum : header.rfxNum;
    const rfxTitle = header.secondarySourceCategory === 'BID' ? header.bidTitle : header.rfxTitle;
    return (
      <h3 style={{ maxWidth: '90%' }}>
        <span
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '90%',
            float: 'left',
          }}
        >
          {rfxNum}-
          <Tooltip title={`${rfxNum}-${rfxTitle}`} overlayStyle={{ minWidth: '300px' }}>
            {rfxTitle}
          </Tooltip>
        </span>
        <Tag style={{ marginLeft: '15px', paddingLeft: 'inherit' }}>
          {intl.get(`ssrc.qualiExam.view.message.roundNumber`).d('轮次')}：{header.roundNumber}
        </Tag>
        <a>
          {collapseKeys.includes('rfxTitle')
            ? intl.get(`hzero.common.button.up`).d('收起')
            : intl.get(`hzero.common.button.expand`).d('展开')}
        </a>
        <Icon type={collapseKeys.includes('rfxTitle') ? 'up' : 'down'} />
      </h3>
    );
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

  @Bind()
  getHeaderButtons() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      [modelName]: { qualificationHeader = {}, qualificationLine = [] },
      match: { params },
      remote,
    } = this.props;
    const { attachmentUuid = undefined } = this.state;

    const buttons = [
      qualificationHeader.prequalFlag === 1 ||
      (!isEmpty(qualificationLine) &&
        (qualificationLine[0].prequalLineStatus === 'APPROVED' ||
          qualificationLine[0].prequalLineStatus === 'REFUSED')) ? (
            <Upload
              viewOnly
              filePreview
              bucketDirectory="ssrc-rfx-prequal"
              bucketName={PRIVATE_BUCKET}
              attachmentUUID={attachmentUuid === null ? undefined : attachmentUuid}
              btnProps={{ icon: 'download' }}
            />
      ) : !isEmpty(qualificationLine) ? (
        <Upload
          filePreview
          bucketDirectory="ssrc-rfx-prequal"
          bucketName={PRIVATE_BUCKET}
          fileSize={FIlESIZE}
          attachmentUUID={attachmentUuid === null ? undefined : attachmentUuid}
          text={intl.get(`ssrc.qualiExam.model.button.upload`).d('上传附件')}
          btnProps={{ icon: 'upload' }}
          afterOpenUploadModal={this.afterOpenUploadModal}
        />
      ) : null,
    ];

    if (!remote) return buttons;

    const otherProps = {
      qualificationLine,
      qualificationHeader,
      prequalHeaderId: params.rfxId,
      queryQualificationData: this.queryQualificationData,
    };

    return remote.process('SSRC_PREQUAL_DETAIL_PROCESS_HEADER_BUTTONS', buttons, otherProps);
  }

  /**
   * 获取backpath
   * */
  getBackpath() {
    const url = `${this.activeTabKey}/list`;
    return url;
  }

  render() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      [modelName]: { qualificationHeader = {}, pretrialPanelList = [] },
      fetchHeaderLoading,
      organizationId,
      fetchPretrialPanelLoading,
      match: { params },
      form,
      customizeForm = () => {},
      customizeTable = () => {},
      remote,
    } = this.props;
    const {
      collapseKeys,
      pretrialPanelVisible,
      activeKey,
      attachmentUuid = undefined,
    } = this.state;

    const headerProps = {
      form,
      customizeForm,
      organizationId,
      dataSource: qualificationHeader,
      showPretrialPanel: this.showPretrialPanel,
    };

    const pretrialPanelProps = {
      visible: pretrialPanelVisible,
      dataSource: pretrialPanelList,
      loading: fetchPretrialPanelLoading,
      onHideModal: this.showPretrialPanel,
    };
    const BackPath = this.getBackpath();

    const headerTitle = intl.get(`ssrc.qualiExam.view.message.zigeyushen`).d('资格预审');

    return (
      <div className={styles.qualificationWrap}>
        <Header
          backPath={BackPath}
          title={
            remote
              ? remote.render('SSRC_PREQUAL_DETAIL_RENDER_HEADER_INFOS', headerTitle, {
                  qualificationHeader,
                })
              : headerTitle
          }
        >
          {this.getHeaderButtons()}
        </Header>
        <Content style={{ margin: '8px' }}>
          <Spin spinning={fetchHeaderLoading} wrapperClassName={classnames('ued-detail-wrapper')}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['rfxTitle']}
              onChange={(arr) => this.onCollapseChange(arr, 'rfxTitle')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>{this.renderHeaderTitle(qualificationHeader, collapseKeys)}</Fragment>
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
                {this.renderQualificationReview(
                  params,
                  qualificationHeader,
                  attachmentUuid,
                  customizeTable
                )}
              </Tabs.TabPane>
              {Number(qualificationHeader.skipFlag) !== 1 &&
              Number(qualificationHeader.leaderFlag) ? (
                <Tabs.TabPane
                  tab={intl.get(`ssrc.qualiExam.view.tab.qualificationReviewSum`).d('资格预审结果')}
                  key="qualificationReviewSum"
                  forceRender
                >
                  {this.renderQualificationReviewSum({
                    prequalHeaderId: params.rfxId,
                    onRef: (node) => {
                      this.qualificationReviewSum = node;
                    },
                    customizeTable,
                  })}
                </Tabs.TabPane>
              ) : (
                ''
              )}
            </Tabs>
          </Spin>
        </Content>
        <PretrialPanelModal {...pretrialPanelProps} />
      </div>
    );
  }
}

const hocComponent = (Com) => {
  const component = compose(
    withCustomize({
      unitCode: [
        'SSRC_PREQUAL.HEADER', // 预审申请
        'SSRC_PREQUAL.QUALIFICATION_REVIEW', // 资格预审表格
        'SSRC_PREQUAL.QUALIFICATION_REVIEWSUM', // 资格预审结果表格
      ],
    }),
    Form.create({ fieldNameProp: null }),
    connect(({ qualificationExamination, loading }) => ({
      qualificationExamination,
      modelName: 'qualificationExamination',
      loading: loading.effects['qualificationExamination/fetchQualificationLineList'],
      saveLoading: loading.effects['qualificationExamination/saveQualificationExamination'],
      submitLoading: loading.effects['qualificationExamination/submitQualificationExamination'],
      fetchHeaderLoading: loading.effects['qualificationExamination/fetchQualificationHeader'],
      fetchPretrialPanelLoading: loading.effects['qualificationExamination/fetchPretrialPanel'],
      fetchQualificationSumLoading:
        loading.effects['qualificationExamination/fetchQualificationSum'],
      saveQualificationLoading:
        loading.effects['qualificationExamination/saveQualificationExamination'],
      submitQualificationLoading:
        loading.effects['qualificationExamination/submitQualificationExamination'],
      organizationId: getCurrentOrganizationId(),
    })),
    formatterCollections({ code: ['ssrc.qualiExam', 'ssrc.common', 'scux.ssrc'] })
  )(
    remoteHoc({
      code: 'SSRC_PREQUAL_DETAIL',
      name: 'remote',
    })(Com)
  );

  return component;
};

const Detail = hocComponent(DetailComponnet);
export default Detail;
export { hocComponent, DetailComponnet };
