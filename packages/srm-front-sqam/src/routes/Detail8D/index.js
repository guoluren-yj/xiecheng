/**
 * 我收到的8D - 明细
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, PureComponent } from 'react';
import { Button, Spin, Collapse, Icon } from 'hzero-ui';
import classNames from 'classnames';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import BasicInfoPanel from '../components/BasicInfoPanel';
import QuestionPanel from '../components/QuestionPanel';
import GroupMemberPanelSupplier from '../components/GroupMemberPanelSupplier';
import CongratulationPanel from '../components/CongratulationPanel';
import OperatorRecordModal from '../components/OperatorRecordModal';
import HistoryVersionModal from '../components/HistoryVersionModal';
import AssociationModal from '../components/AssociationModal';
import AttachmentModal from './AttachmentModal';

import PromiseMaintainProvide from '../components/PorvisionalMeasure/PromiseMaintainProvide';
import FollowUpProduce from '../components/PorvisionalMeasure/FollowUpProduce';
import RootReasonAnalyze from '../components/rootReasonAnalyze';
import ForeverDealSolution from '../components/ForeverDealSolution';
import RelateStandard from '../components/RelateStandard';
import IsSuitUnderItem from '../components/IsSuitUnderItem';

import styles from './index.less';

const prefix = `sqam.common.view.message.title`;

@connect(
  ({
    detail8D,
    loading,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
  }) => ({
    detail8D,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
    loading: {
      detail: loading.effects['detail8D/fetch8DBasicInfo'],
      operator: loading.effects['detail8D/fetchOperatorRecord'],
      attachment: loading.effects['detail8D/fetchAttachment'],
    },
    promiseMaintainProvideLoading: loading.effects['promiseMaintainProvide/fetchData'],
    followUpProduceLoading: loading.effects['followUpProduce/fetchData'],
    rootAnalyzeLoading: loading.effects['rootReasonAnalyze/fetchData'],
    foreverSolutionLoading: loading.effects['foreverDealSolution/fetchData'],
    isSuitUnderItemLoading: loading.effects['isSuitUnderItem/fetchData'],
    standardizingLoading: loading.effects['standardizing/fetchData'],
    loadingAssociation: loading.effects['detail8D/fetchAssociation'],
    tenantId: getCurrentOrganizationId(),
  })
)
@formatterCollections({
  code: [
    'sqam.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
  ],
})
@withCustomize()
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      location: { state: { _back } = {} },
    } = props;
    this.state = {
      associationvisible: false,
      operatorVisible: false,
      attachmentVisible: false,
      versionVisible: !isUndefined(_back),
      selectedRowKeys: [],
      purchaserAttachments: [],
      supplierAttachments: [],
      collapseKeys: ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
      basicInfo: {}, // 8D详情页：基本信息
      historyVersion: [], // 历史版本
      operatorRecords: [], // 操作记录
      associationList: [], // 关联8d表格
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取8d基本信息
   */
  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({ type: 'detail8D/fetchLov' });
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'detail8D/fetch8DBasicInfo',
      payload: {
        tenantId,
        problemHeaderId: id,
      },
    }).then((res) => {
      if (res) {
        this.setState({ basicInfo: res });
      }
    });
  }

  /**
   * 操作记录查询
   */
  @Bind()
  handleOperatorRecord() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'detail8D/fetchOperatorRecord',
      payload: {
        problemHeaderId: id,
      },
    }).then((res) => {
      if (res) {
        this.setState({ operatorRecords: res });
      }
    });
    this.setState({
      operatorVisible: true,
    });
  }

  /**
   * 历史版本查询
   */
  @Bind()
  handleHistoryVersion() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'detail8D/fetchHistoryVersion',
      payload: {
        tenantId,
        problemHeaderId: id,
      },
    }).then((res) => {
      if (res) {
        this.setState({ historyVersion: res.content });
      }
    });
    this.setState({
      versionVisible: true,
    });
  }

  /**
   * 附件查看
   */
  @Bind()
  handleAttachmentOption() {
    const {
      dispatch,
      // detail8D: { basicInfo },
    } = this.props;
    const { basicInfo } = this.state;
    if (basicInfo.attachmentUuid) {
      dispatch({
        type: 'detail8D/fetchAttachment',
        payload: {
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          directory: 'sqam-ed-att',
          attachmentUUID: basicInfo.attachmentUuid,
        },
      }).then((res) => {
        if (!getResponse(res)) return;
        this.setState({
          purchaserAttachments: res.map((item, index) => ({
            uid: index,
            name: item.fileName,
            type: item.fileType,
            status: 'done',
            size: item.fileSize,
            response: item.fileUrl,
          })),
        });
      });
    }
    if (basicInfo.supplierAttachmentUuid) {
      dispatch({
        type: 'detail8D/fetchAttachment',
        payload: {
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          directory: 'sqam-ed-supplieratt',
          attachmentUUID: basicInfo.supplierAttachmentUuid,
        },
      }).then((res) => {
        if (!getResponse(res)) return;
        this.setState({
          supplierAttachments: res.map((item, index) => ({
            uid: index,
            name: item.fileName,
            type: item.fileType,
            status: 'done',
            size: item.fileSize,
            response: item.fileUrl,
          })),
        });
      });
    }
    this.setState({ attachmentVisible: true });
  }

  /**
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  handleAttachmentRemove(file) {
    const {
      dispatch,
      // feedback8D: { basicInfo },
    } = this.props;
    const { basicInfo } = this.state;
    const { attachmentUUID, supplierAttachments } = this.state;
    const uuid = basicInfo.supplierAttachmentUuid
      ? basicInfo.supplierAttachmentUuid
      : attachmentUUID;
    dispatch({
      type: 'detail8D/removeAttachment',
      payload: {
        attachmentUUID: uuid,
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        directory: 'sqam-ed-supplieratt',
        urls: [file.response],
      },
    }).then((res) => {
      if (res) {
        this.setState({
          supplierAttachments: supplierAttachments.filter((o) => o.uid !== file.uid),
        });
      }
    });
  }

  /**
   * 隐藏操作记录Modal
   */
  @Bind()
  handleOperatorModalHidden() {
    this.setState({
      operatorVisible: false,
    });
  }

  /**
   * 隐藏附件Modal
   */
  @Bind()
  handleAttachmentModalHidden() {
    this.setState({
      attachmentVisible: false,
      purchaserAttachments: [],
      supplierAttachments: [],
    });
  }

  /**
   * 历史版本详细信息跳转
   * @param {!object} record - 8D对象
   */
  @Bind()
  handleVersionDetail(record = {}) {
    const {
      dispatch,
      // detail8D: {
      //   basicInfo: { problemHeaderId },
      // },
    } = this.props;
    const {
      basicInfo: { problemHeaderId },
    } = this.state;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/detail8D/history/${record.problemHeaderHisId}/${problemHeaderId}`,
      })
    );
  }

  /**
   * 隐藏历史版本Modal
   */
  @Bind()
  handleVersionModalHidden() {
    this.setState({
      versionVisible: false,
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
   * 查询详情页的Table
   */
  @Bind()
  fetchReadOnlyTable(type, page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    dispatch({
      type,
      payload: { edProblemHeaderId: id, tenantId, ...page },
    });
  }

  @Bind()
  historyBack() {
    const {
      match: { path },
      location: { search },
    } = this.props;
    const { isStartPage, problemHeaderId, from, hide } = querystring.parse(search.substr(1));
    const moduleOf8D = path.split('/')[2];
    let backPath = '';

    if (from) {
      backPath = `/sqam/${moduleOf8D}/pub-detail/${problemHeaderId}?from=${from}&hide=${hide}`;
      return backPath;
    }
    if (isStartPage) {
      backPath = `/sqam/${moduleOf8D}/list`;
    } else {
      backPath = `/sqam/${moduleOf8D}/detail/${problemHeaderId}`;
    }
    return backPath;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { match } = this.props;
    const { id } = match.params;

    const {
      operatorVisible = false,
      attachmentVisible = false,
      versionVisible = false,
      selectedRowKeys = [],
      purchaserAttachments = [],
      supplierAttachments = [],
      collapseKeys,
      associationvisible,
    } = this.state;
    const {
      dispatch,
      tenantId,
      loading,
      loadingAssociation,
      promiseMaintainProvide = {},
      promiseMaintainProvideLoading,
      followUpProduce = {},
      followUpProduceLoading,
      rootReasonAnalyze = {},
      rootAnalyzeLoading,
      foreverDealSolution = {},
      foreverSolutionLoading,
      relateStandard = {},
      standardizingLoading,
      isSuitUnderItem = {},
      isSuitUnderItemLoading,
      customizeForm,
      customizeTable,
    } = this.props;
    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = promiseMaintainProvide;
    const { followUpProduceList = [], followUpProducePagination = {} } = followUpProduce;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = rootReasonAnalyze;
    const {
      foreverDealSolutionList = [],
      foreverDealSolutionPagination = {},
    } = foreverDealSolution;
    const { relateStandardList = [], relateStandardPagination = {} } = relateStandard;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = isSuitUnderItem;
    const { basicInfo, historyVersion, operatorRecords, associationList } = this.state;
    const { edProblemAction = {}, edProblemTeamList = [], ...basic } = basicInfo;
    const edProblemInfo = edProblemAction || {};
    const basicInfoProps = { basicInfo: basic, customizeForm };
    const questionProps = { problemDesc: basic, customizeForm };
    const groupMemberProps = {
      selectedRowKeys,
      groupMember: edProblemTeamList,
      onChangeFlag: (e) => e,
      onAdd: (e) => e,
      customizeTable,
    };
    const continueSupplyProps = {
      readOnly: true,
      required: false,
      loading: promiseMaintainProvideLoading,
      edProblemHeaderId: id,
      pagination: promiseMaintainProvidePagination,
      dataSource: promiseMaintainProvideList,
      customizeTable,
    };

    const followUpProduceProps = {
      loading: followUpProduceLoading,
      readOnly: true,
      required: false,
      pagination: followUpProducePagination,
      edProblemHeaderId: id,
      dataSource: followUpProduceList,
      customizeTable,
    };
    const rootAnalyzeProps = {
      loading: rootAnalyzeLoading,
      edProblemHeaderId: id,
      readOnly: true,
      required: false,
      pagination: rootReasonAnalyzePagination,
      dataSource: rootReasonAnalyzeList,
      customizeTable,
    };
    const remedialActionProps = {
      loading: foreverSolutionLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id,
      pagination: foreverDealSolutionPagination,
      dataSource: foreverDealSolutionList,
      customizeTable,
    };
    const standardizingProps = {
      loading: standardizingLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id,
      pagination: relateStandardPagination,
      dataSource: relateStandardList,
      customizeTable,
    };
    const isSuitUnderItemProps = {
      loading: isSuitUnderItemLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id,
      pagination: isSuitUnderItemPagination,
      dataSource: isSuitUnderItemList,
      customizeTable,
    };
    const congratulationProps = {
      congratulations: edProblemInfo,
      onRef: (e) => e,
      customizeForm,
    };
    const operatorProps = {
      visible: operatorVisible,
      dataSource: operatorRecords,
      loading: loading.operator,
      onCancel: this.handleOperatorModalHidden,
    };
    const versionProps = {
      onDetail: this.handleVersionDetail,
      visible: versionVisible,
      dataSource: historyVersion,
      loading: loading.version,
      onCancel: this.handleVersionModalHidden,
    };
    const attachmentProps = {
      tenantId,
      purchaserAttachments,
      supplierAttachments,
      // supplierBucket: 'sqam-ed-supplieratt',
      // purchaserBucket: 'sqam-ed-att',
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      loading: loading.attachment,
      visible: attachmentVisible,
      onCancel: this.handleAttachmentModalHidden,
      onRemove: this.handleAttachmentRemove,
    };
    const modalProps = {
      dispatch,
      visible: associationvisible,
      location,
      onCancel: this.hideModal,
      problemHeaderId: basicInfo.problemHeaderId,
      associationList,
      loadingAssociation,
      fetchAssociation: this.fetchAssociation,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${prefix}.associate8dDetail`).d('关联8D详情')}
          backPath={this.historyBack()}
        >
          <Button icon="clock-circle-o" onClick={this.handleOperatorRecord}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
          <Button icon="switcher" onClick={this.handleHistoryVersion}>
            {intl.get(`${prefix}.historyVersion`).d('历史版本')}
          </Button>
          <Button icon="paper-clip" onClick={this.handleAttachmentOption}>
            {intl.get('entity.attachment.view').d('附件查看')}
          </Button>
        </Header>
        <Content className={classNames(styles['page-content'])}>
          <Spin spinning={loading.detail} wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}>
            <Collapse
              forceRender
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.panel.basic`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('B')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('B') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="B"
              >
                <BasicInfoPanel {...basicInfoProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.panel.question`).d('问题描述')}</h3>
                    <a>
                      {collapseKeys.includes('C')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('C') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="C"
              >
                <QuestionPanel {...questionProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.panel.groupMember`).d('小组成员')}</h3>
                    <a>
                      {collapseKeys.includes('D')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('D') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="D"
              >
                <GroupMemberPanelSupplier {...groupMemberProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`${prefix}.panel.promiseMaintainProvide`)
                        .d('临时围堵措施—保证持续供货')}
                    </h3>
                    <a>
                      {collapseKeys.includes('E')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('E') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="E"
              >
                <PromiseMaintainProvide {...continueSupplyProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.panel.shortMeature`).d('短期措施')}</h3>
                    <a>
                      {collapseKeys.includes('F')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('F') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="F"
              >
                <FollowUpProduce {...followUpProduceProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.panel.analyzeReason`).d('根本原因分析')}</h3>
                    <a>
                      {collapseKeys.includes('G')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('G') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="G"
              >
                <RootReasonAnalyze {...rootAnalyzeProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.panel.foreverDealSolution`).d('永久纠正措施')}</h3>
                    <a>
                      {collapseKeys.includes('H')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('H') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="H"
              >
                <ForeverDealSolution {...remedialActionProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.panel.applyItem`).d('是否适用以下项目')}</h3>
                    <a>
                      {collapseKeys.includes('K')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('K') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="K"
              >
                <IsSuitUnderItem {...isSuitUnderItemProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.panel.standard`).d('相关标准化')}</h3>
                    <a>
                      {collapseKeys.includes('I')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('I') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="I"
              >
                <RelateStandard {...standardizingProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.panel.congratulation`).d('小组祝贺')}</h3>
                    <a>
                      {collapseKeys.includes('J')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('J') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="J"
              >
                <CongratulationPanel {...congratulationProps} />
              </Collapse.Panel>
            </Collapse>
          </Spin>
        </Content>
        {operatorVisible && <OperatorRecordModal {...operatorProps} />}
        {versionVisible && <HistoryVersionModal {...versionProps} />}
        {attachmentVisible && <AttachmentModal {...attachmentProps} />}
        {associationvisible && <AssociationModal {...modalProps} />}
      </React.Fragment>
    );
  }
}
