/**
 * 招标大厅 - 确认中标候选人
 * @date: 2019-05-28
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Form, Tabs, Collapse, Icon, Modal, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData, getCurrentUserId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { PRIVATE_BUCKET } from '_utils/config';

import common from '@/routes/sbid/common.less';
import bidView from '@/assets/bid-view.svg';

import BidEvaluationProcess from '@/routes/sbid/components/BidEvaluationProcess';
import { FILE_SIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import BidInfo from './BidInfo';
import BidMembersModal from './BidMembersModal';
import OthersInfo from './OthersInfo';
import ItemLine from './ItemLine';
import BidSectionTable from './BidSectionTable';
import ScoreDetailModal from './ScoreDetailModal';

const { Panel } = Collapse;
const SourceFrom = 'BID';

@withCustomize({
  unitCode: [
    'SSRC.EXPERT_SCORE_MANAGE.LINE_DETAIL_BID',
    'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT_BID',
    'SSRC.EXPERT_SCORE_MANAGE.HEADER',
    'SSRC.EXPERT_SCORE_MANAGE.OTHER_INFO',
    'SSRC.EXPERT_SCORE_MANAGE.ITEM_LINE',
    'SSRC.EXPERT_SCORE_MANAGE.ITEM_LINE_NONE',
  ],
})
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall'] })
@connect(({ bidHall, loading }) => ({
  bidHall,
  fetchbidHallUpdateLoading: loading.effects['bidHall/fetchBidHeaderDetail'],
  fetchBidMembersLoading: loading.effects['bidHall/fetchBidMembers'],
  fetchItemLineLoading: loading.effects['bidHall/fetchItemLine'],
  fetchItemLineSupplierLoading: loading.effects['bidHall/supplierRecord'],
  fetchEvaluateSummaryLoading: loading.effects['bidHall/fetchEvaluateSummary'],
  fetchScoreDetailLoading: loading.effects['bidHall/fetchScoreDetail'],
  saveBidCandidateLoading: loading.effects['bidHall/saveBidCandidate'],
  submitBidCandidateLoading: loading.effects['bidHall/submitBidCandidate'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class ConfirmBidCandidate extends Component {
  form;

  constructor(props) {
    super(props);

    const routerParams = querystring.parse(this.props.location.search.substr(1));
    const {
      backRecommend = '',
      cachTabKey = '',
      historyTag = '',
      sourceStatus,
      sourceFrom,
      sourceHeaderId,
      sourcePage = null,
    } = routerParams;

    this.state = {
      cachTabKey, // 页面返回backpath标记
      historyTag, // 标记由查看历史评分页面跳入，控制按钮输入框不可填
      backRecommend, // 专家评分跳转标记
      bidItemSelectedTabKey: '', // 物品行切换面板key
      collapseKeys: [], // 折叠面板
      bidMembersModalVisible: false, // 招标小组Modal
      itemSupplierModalVisible: false, // 物品明细供应商Modal
      scoreDetailModalVisible: false, // 评分明细Modal
      modalSupplierCompanyName: '', // 查看评分明细供应商名称
      modalSectionName: '', // 查看评分明细标段名称
      activeScoreId: '', // 当前评分明细的id
      sourceStatus,
      sourceFrom,
      sourceHeaderId,
      sourcePage, // 跳转前的路由标识
    };
  }

  componentDidMount() {
    this.fetchBidEvalProgress();
    this.fetchBidEvaluation();
    this.fetchItemLine();
    this.fetchEvaluateSummary();
    this.handleQueryLov();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'bidHall/updateState',
      payload: {
        header: {},
        bidMembersList: [],
        itemLine: [],
        supplierData: [],
        bidSectionList: {},
        scoreDetailList: [],
        scoreDetailPagination: {},
        bidEvalProgress: [],
        itemQuotationDetail: [],
        QuotationDetailDataSource: {},
        itemQuotationPagination: {},
      },
    });
  }

  /**
   * 查询固定值集
   */
  @Bind()
  handleQueryLov() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/batchCode',
      payload: {
        lovCodes: {
          expensesStatus: 'SSRC.EXPENSES_STATUS',
        },
      },
    });
  }

  /**
   * 获取招标头信息
   *
   * @memberof ConfirmBidCandidate
   */
  fetchBidEvaluation() {
    const {
      dispatch,
      organizationId,
      match: { params, path },
    } = this.props;
    dispatch({
      type: 'bidHall/fetchBidHeaderDetail',
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.HEADER,SSRC.EXPERT_SCORE_MANAGE.OTHER_INFO',
      },
    });
  }

  /**
   * 获取评标步骤
   *
   * @memberof ConfirmBidCandidate
   */
  fetchBidEvalProgress() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;

    dispatch({
      type: 'bidHall/fetchBidEvalProgress',
      payload: { organizationId, sourceHeaderId: params.bidId, sourceFrom: SourceFrom },
    });
  }

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;

    dispatch({
      type: 'bidHall/fetchItemLine',
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
        customizeUnitCode:
          'SSRC.EXPERT_SCORE_MANAGE.ITEM_LINE,SSRC.EXPERT_SCORE_MANAGE.ITEM_LINE_NONE',
      },
    });
  }

  /**
   * 物品行分配的供应商
   *
   * @param {*} [record={}]
   * @memberof ConfirmBidCandidate
   */
  fetchItemSupplier(record = {}) {
    const { dispatch, organizationId } = this.props;

    dispatch({
      type: `bidHall/supplierRecord`,
      payload: {
        organizationId,
        bidHeaderId: record.bidHeaderId,
        bidLineItemId: record.bidLineItemId,
      },
    });
  }

  /**
   * 获取招标小组
   *
   * @memberof Update
   */
  fetchMembers() {
    const {
      dispatch,
      organizationId,
      match: { params = {}, path },
    } = this.props;

    dispatch({
      type: 'bidHall/fetchBidMembers',
      payload: { organizationId, bidHeaderId: params.bidId, path },
    });
  }

  /**
   * 查询标段数据
   *
   * @memberof ConfirmBidCandidate
   */
  fetchEvaluateSummary() {
    const {
      dispatch,
      organizationId,
      match: { params = {}, path },
    } = this.props;

    const pathFromPub = path === '/pub/ssrc/expert-scoring/workflow/bid/:sourceHeaderId';

    dispatch({
      type: 'bidHall/fetchEvaluateSummary',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: SourceFrom,
        customizeUnitCode: pathFromPub
          ? 'SSRC.EXPERT_SCORE_MANAGE.LINE_DETAIL_BID'
          : 'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT_BID',
      },
    }).then((res) => {
      if (!res || !res.evaluateSummaryMap) {
        return;
      }

      const resKey = Object.keys(res.evaluateSummaryMap);
      if (resKey.length) {
        this.setState({
          bidItemSelectedTabKey: resKey[0],
        });
      }
    });
  }

  /**
   * 查询标段行评分明细
   *
   * @param {*} [record={}]
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  fetchScoreDetil(record = {}) {
    const { dispatch, organizationId } = this.props;

    const { evaluateSummaryId = '', ...others } = record;
    const { activeScoreId } = this.state;

    dispatch({
      type: 'bidHall/fetchScoreDetail',
      payload: {
        organizationId,
        evaluateSummaryId: activeScoreId || evaluateSummaryId,
        page: {
          pageSize: 20,
          ...others,
        },
      },
    });
  }

  /**
   * 招标小组Modal
   *
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  viewBidMembers() {
    this.fetchMembers();

    this.setState({
      bidMembersModalVisible: true,
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
   * 关闭招标小组Modal
   *
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  handleMembersCancel() {
    this.setState({
      bidMembersModalVisible: false,
    });

    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        bidMembersList: [],
      },
    });
  }

  /**
   * 打开物品行分配供应商Modal
   *
   * @param {*} [record={}]
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  viewItemLineSupplier(record = {}) {
    this.setState({
      itemSupplierModalVisible: true,
    });

    this.fetchItemSupplier(record);
  }

  /**
   * close物品行分配供应商Modal
   *
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  cancelViewItemSupplier() {
    this.setState({
      itemSupplierModalVisible: false,
    });

    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        supplierData: [],
      },
    });
  }

  /**
   * 查看评分明细 - open modal
   *
   * @param {*} [record={}]
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  openScoreDetailModal(record = {}) {
    this.setState({
      scoreDetailModalVisible: true,
    });

    const { supplierCompanyName, sectionName } = record;
    this.setState({
      modalSupplierCompanyName: supplierCompanyName,
      modalSectionName: sectionName,
      activeScoreId: record.evaluateSummaryId,
    });

    this.fetchScoreDetil(record);
  }

  /**
   * 标段描述行跳转到投标详情
   *
   * @param {*} [record={}]
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  directorTender(record = {}) {
    const { supplierTenantId = '' } = record;
    const { backRecommend = '', historyTag, cachTabKey } = this.state;
    const {
      dispatch,
      match: { params },
    } = this.props;
    const search = querystring.stringify({
      bidId: params.bidId,
      historyTag,
      cachTabKey,
      backRecommend,
      source: 'bid-hall',
      supplierTenantId,
    });
    // const pathname = historyTag === 'history' ? 'expert-scoring' : 'bid-hall';
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/bid-query-detail/${record.quotationHeaderId}`,
        search,
      })
    );
  }

  /**
   * 取消查看评分明细 close modal
   *
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  cancelScoreDetailModal() {
    this.setState({
      modalSupplierCompanyName: '',
      modalSectionName: '',
      activeScoreId: '',
      scoreDetailModalVisible: false,
    });
  }

  /**
   * 切换标段tabs
   *
   * @param {*} key
   * @returns
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  changeBidItemTabs(key) {
    if (!key) {
      return;
    }

    this.setState({
      bidItemSelectedTabKey: key,
    });
  }

  /**
   * 跳转到招标详情时带参
   */
  getDirectSearch() {
    const {
      bidHall: { header = {} },
    } = this.props;
    const { backRecommend } = this.state;
    const search = querystring.stringify({
      backRecommend,
      source: header.subjectMatterRule,
    });
    return search;
  }

  /**
   * 跳转投标书详情
   *
   * @param {*} e
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  directTender(e) {
    e.stopPropagation();

    const {
      dispatch,
      match: { params = {} },
    } = this.props;

    const search = this.getDirectSearch();
    const {
      backRecommend = '',
      cachTabKey = '',
      sourceStatus,
      sourceFrom,
      sourceHeaderId,
    } = this.state;

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/bid-detail/${params.bidId}`,
        search,
      })
    );

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        historys: `/ssrc/expert-scoring/confirm-bid-candidate/${params.bidId}`,
      },
    });
    const source = {
      label: backRecommend,
      url: `/ssrc/expert-scoring/confirm-bid-candidate/${params.bidId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}`,
    };
    const key =
      backRecommend === 'recommend'
        ? 'sourceRouter+/ssrc/expert-scoring'
        : `${backRecommend}+/ssrc/expert-scoring`;
    sessionStorage.setItem('sourceRouter', JSON.stringify(source));
    sessionStorage.setItem(key, JSON.stringify(source));
  }

  /**
   * 保存标段下供应商等信息
   *
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  saveBidSection() {
    const {
      dispatch,
      form,
      organizationId,
      match: { params = {} },
      bidHall: { bidSectionList = {} },
    } = this.props;

    const { bidItemSelectedTabKey } = this.state;
    const data = getEditTableData(bidSectionList.evaluateSummaryMap[bidItemSelectedTabKey]);
    if (!data.length) {
      return;
    }

    dispatch({
      type: 'bidHall/saveBidCandidate',
      payload: {
        organizationId,
        ...bidSectionList,
        evaluateSummaryMap: {
          [bidItemSelectedTabKey]: data,
        },
        preAttachmentUuid: form.getFieldValue('preAttachmentUuid'),
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch({
          type: 'bidHall/fetchEvaluateSummary',
          payload: { organizationId, sourceHeaderId: params.bidId, sourceFrom: SourceFrom },
        });
      }
    });
  }

  /**
   * 整单保存前获取页面数据
   *
   * @param {*} callBack
   * @returns
   * @memberof ConfirmBidCandidate
   */
  getAllData() {
    const {
      form,
      bidHall: { bidSectionList = {} },
    } = this.props;

    let max = 0;
    let candidateLength = 0;
    let errNum = false;
    const newDataMap = {};

    Object.keys(bidSectionList.evaluateSummaryMap).forEach((item) => {
      const EvaluateSummaryList = bidSectionList.evaluateSummaryMap[item];
      const formData = getEditTableData(EvaluateSummaryList);
      if (!formData.length) {
        errNum = true;
      }

      candidateLength = formData.filter((i) => i.candidateFlag).length;
      max = max > candidateLength ? max : candidateLength;
      newDataMap[item] = formData;
    });

    return {
      ...bidSectionList,
      errNum,
      max,
      evaluateSummaryMap: newDataMap,
      preAttachmentUuid: form.getFieldValue('preAttachmentUuid') || null,
    };
  }

  /**
   * 保存 整个页面数据
   *
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  saveBidCanadidate() {
    const { dispatch, organizationId } = this.props;
    const { errNum = 0, ...others } = this.getAllData();

    if (errNum) {
      return;
    }

    dispatch({
      type: 'bidHall/saveBidCandidate',
      payload: {
        organizationId,
        ...others,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchEvaluateSummary();
      }
    });
  }

  /**
   * 整单提交
   *
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  handleSubmit() {
    const {
      dispatch,
      organizationId,
      bidHall: { bidSectionList = {} },
    } = this.props;

    const { errNum = 0, max = 0, ...others } = this.getAllData();

    if (errNum) {
      return;
    }

    const submit = () => {
      dispatch({
        type: 'bidHall/submitBidCandidate',
        payload: {
          organizationId,
          ...others,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchEvaluateSummary();
          dispatch(
            routerRedux.push({
              pathname: `/ssrc/expert-scoring/list`,
            })
          );
        }
      });
    };

    if (max > 3) {
      Modal.confirm({
        content: intl
          .get(`ssrc.bidHall.view.validation.selectCandidateMoreThanThree`)
          .d(`选择候选人数超过三个`),
        onOk: () => submit(),
        onCancel: () => {
          dispatch({
            type: 'bidHall/updateState',
            payload: {
              bidSectionList,
            },
          });
        },
      });
    } else {
      submit();
    }
  }

  /**
   * 澄清管理
   *
   * @memberof ConfirmBidCandidate
   */
  @Bind()
  clarifyManager() {}

  /**
   * 渲染标段操作按钮组
   *
   * @param {*} [option={}]
   * @returns
   * @memberof ConfirmBidCandidate
   */
  renderBidOperateButtons(option = {}) {
    const { historyTag } = this.state;
    const { getFieldDecorator, organizationId, bidSectionList, saveBidCandidateLoading } = option;
    return (
      <div
        style={{
          display: historyTag === 'history' ? 'none' : 'flex',
          justifyContent: 'flex-end',
          marginBottom: '10px',
        }}
      >
        <div className="ant-btn" style={{ marginRight: '8px' }}>
          <Form.Item>
            {getFieldDecorator('preAttachmentUuid', {
              initialValue: bidSectionList.preAttachmentUuid || '',
            })(
              <Upload
                // bucketName="ssrc-prequal-scaling" // 预定表
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-prequal-scaling"
                attachmentUUID={bidSectionList.preAttachmentUuid}
                tenantId={organizationId}
                filePreview
                {...ChunkUploadProps}
                fileSize={FILE_SIZE}
              />
            )}
          </Form.Item>
        </div>
        <Button type="primary" onClick={this.saveBidSection} loading={saveBidCandidateLoading}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </div>
    );
  }

  // 获取返回路径
  getBackPath() {
    const { cachTabKey, backRecommend = null, sourceFrom = null, sourcePage = null } = this.state;
    let backPath = null;
    backPath =
      backRecommend === 'recommend'
        ? `/ssrc/expert-scoring/list?${cachTabKey}`
        : '/ssrc/bid-hall/list';
    if (sourceFrom === 'RFX' && sourcePage === 'RFXList') {
      backPath = '/ssrc/inquiry-hall/list';
    }
    return backPath;
  }

  render() {
    const {
      form,
      form: { getFieldDecorator },
      match,
      organizationId,
      customizeTable,
      fetchItemLineLoading,
      fetchBidMembersLoading,
      fetchItemLineSupplierLoading,
      fetchScoreDetailLoading,
      saveBidCandidateLoading,
      submitBidCandidateLoading,
      bidHall: {
        header = {},
        code: { expensesStatus = [] },
        bidMembersList = [],
        itemLine = [],
        supplierData = [],
        bidSectionList = {},
        scoreDetailList = [],
        scoreDetailPagination = {},
        bidEvalProgress = [],
      },
      customizeForm,
    } = this.props;

    const {
      historyTag,
      modalSupplierCompanyName,
      modalSectionName,
      collapseKeys,
      bidMembersModalVisible,
      itemSupplierModalVisible,
      scoreDetailModalVisible,
    } = this.state;

    // 基本信息props
    const bidInfoProps = {
      header,
      organizationId,
      viewBidMembers: this.viewBidMembers,
      bidMembersModalVisible,
      customizeForm,
      form,
    };

    // 招标小组props
    const bidMemberProps = {
      match,
      loading: fetchBidMembersLoading,
      bidMembersList,
      bidMembersModalVisible,
      handleMembersCancel: this.handleMembersCancel,
    };

    // 其它信息tab props
    const othersInfoProps = {
      header,
      organizationId,
      customizeForm,
      form,
    };

    // 物品信息tab props
    const itemLineProps = {
      match,
      loading: fetchItemLineLoading,
      dataSource: itemLine,
      subjectMatterRule: header.subjectMatterRule || '',
      viewItemLineSupplier: this.viewItemLineSupplier,
      itemSupplierModalVisible,
      supplierData,
      cancelViewItemSupplier: this.cancelViewItemSupplier,
      supplierRecordLoading: fetchItemLineSupplierLoading,
      showQuotationDetail: this.showQuotationDetail,
      customizeTable,
    };

    // 评分明细Modal props
    const scoreDetailProps = {
      scoreDetailList,
      scoreDetailPagination,
      scoreDetailModalVisible,
      modalSupplierCompanyName,
      modalSectionName,
      cancelScoreDetailModal: this.cancelScoreDetailModal,
      loading: fetchScoreDetailLoading,
      fetchScoreDetil: this.fetchScoreDetil,
    };

    return (
      <Form className={common['detail-standard']}>
        <Header
          title={
            historyTag !== 'history'
              ? intl.get(`ssrc.bidHall.view.message.title.ConfirmBidCandidates`).d('确认中标候选人')
              : intl.get(`ssrc.inquiryHall.view.message.title.viewTheScore`).d('查看评分结果')
          }
          backPath={this.getBackPath()}
        >
          {historyTag !== 'history' ? (
            <Button
              icon="rocket"
              type="primary"
              loading={submitBidCandidateLoading}
              onClick={this.handleSubmit}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
          ) : (
            ''
          )}
          {historyTag !== 'history' ? (
            <Button icon="save" onClick={this.saveBidCanadidate} loading={saveBidCandidateLoading}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          ) : (
            ''
          )}
          {/* <Button
            onClick={this.clarifyManager}
          >
            {intl.get(`ssrc.bidHall.view.message.tab.clarifyManager`).d('澄清管理')}
          </Button> */}
        </Header>

        {historyTag !== 'history' ? (
          <div style={{ marginTop: '16px' }}>
            <BidEvaluationProcess dataSource={bidEvalProgress} />
          </div>
        ) : (
          ''
        )}

        <Content
          className={classnames(
            common['page-content-custom'],
            common['form-collapse-include'],
            'ued-detail-wrapper'
          )}
        >
          <Collapse
            className="form-collapse"
            onChange={this.onCollapseChange}
            defaultActiveKey={[]}
          >
            <Panel
              showArrow={false}
              header={
                <React.Fragment>
                  <span className={common['collapse-title']}>
                    {header.bidNum} — {header.bidTitle || ''}
                  </span>
                  <span
                    style={{ marginLeft: '20px', marginRight: '10px' }}
                    onClick={this.directTender}
                  >
                    <Popover
                      content={intl.get(`ssrc.bidHall.view.title.bidDetails`).d('招标书明细')}
                    >
                      <img src={bidView} alt="" />
                    </Popover>
                  </span>
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
              <Tabs defaultActiveKey="baseInfos" animated={false} onChange={this.changeTabs}>
                <Tabs.TabPane
                  tab={intl.get(`ssrc.bidHall.view.tab.baseInfos`).d('基本信息')}
                  key="baseInfos"
                >
                  <BidInfo {...bidInfoProps} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`ssrc.bidHall.view.tab.otherInfos`).d('其他信息')}
                  key="otherInfos"
                >
                  <OthersInfo {...othersInfoProps} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`ssrc.bidHall.view.message.itemsInfo`).d('物品信息')}
                  key="itemsInfos"
                >
                  <ItemLine {...itemLineProps} />
                </Tabs.TabPane>
              </Tabs>
            </Panel>
          </Collapse>
        </Content>

        {Object.keys(bidSectionList.evaluateSummaryMap || {}).length ? (
          <div className={classnames(common['exclude-content-card'], common['p-t-n'])}>
            {bidSectionList.sectionFlag ? (
              <Tabs onChange={this.changeBidItemTabs} animated={false}>
                {Object.keys(bidSectionList.evaluateSummaryMap).length
                  ? Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                    <Tabs.TabPane forceRender key={item} tab={item}>
                      {this.renderBidOperateButtons({
                          getFieldDecorator,
                          organizationId,
                          bidSectionList,
                          saveBidCandidateLoading,
                        })}
                      <BidSectionTable
                        header={header}
                        dataSource={bidSectionList.evaluateSummaryMap[item]}
                        openScoreDetailModal={this.openScoreDetailModal}
                        directorTender={this.directorTender}
                        businessWeight={bidSectionList.businessWeight}
                        technologyWeight={bidSectionList.technologyWeight}
                        match={match}
                        historyTag={historyTag}
                        customizeTable={customizeTable}
                      />
                    </Tabs.TabPane>
                    ))
                  : ''}
              </Tabs>
            ) : (
              <div>
                {this.renderBidOperateButtons({
                  getFieldDecorator,
                  organizationId,
                  bidSectionList,
                  saveBidCandidateLoading,
                })}
                {bidSectionList?.evaluateSummaryMap && !isEmpty(bidSectionList?.evaluateSummaryMap)
                  ? Object.keys(bidSectionList?.evaluateSummaryMap).map((item) => (
                    <div key={item}>
                      <BidSectionTable
                        header={header}
                        dataSource={bidSectionList?.evaluateSummaryMap[item]}
                        openScoreDetailModal={this.openScoreDetailModal}
                        directorTender={this.directorTender}
                        businessWeight={bidSectionList?.businessWeight}
                        technologyWeight={bidSectionList?.technologyWeight}
                        match={match}
                        historyTag={historyTag}
                        expensesStatus={expensesStatus}
                        customizeTable={customizeTable}
                      />
                    </div>
                    ))
                  : ''}
              </div>
            )}
          </div>
        ) : (
          ''
        )}

        <BidMembersModal {...bidMemberProps} />
        <ScoreDetailModal {...scoreDetailProps} />
      </Form>
    );
  }
}
