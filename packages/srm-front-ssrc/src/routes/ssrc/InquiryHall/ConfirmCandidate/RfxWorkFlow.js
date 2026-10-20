/**
 * 工作流-推荐成交候选人
 * @date: 2019-12-13
 * @author: zxm <ximin.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Tabs, Collapse, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import classnames from 'classnames';
import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUserId, getResponse } from 'utils/utils';
import common from '@/routes/ssrc/common.less';
import { PRIVATE_BUCKET } from '_utils/config';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import { isText } from '@/utils/utils';
// import { getQuotationName } from '@/utils/globalVariable';

import BidInfo from './BidInfo';
import OthersInfo from './OthersInfo';
import ItemLine from './ItemLine';
import BidSectionTable from './BidSectionTable';
import ScoreDetailModal from './ScoreDetailModal';
import LadderLevelModal from '../../InquiryHall/Detail/LadderLevelModal';

const { Panel } = Collapse;
const SourceFrom = 'RFX';

@remote({
  code: 'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_APPROVAL',
  name: 'remote',
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSRC.EXPERT_SCORE_MANAGE.LINE_DETAIL',
    'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT',
    'SSRC.EXPERT_SCORE_MANAGE.HEADER_BASE',
    'SSRC.EXPERT_SCORE_MANAGE.LINE_VIEW',
    'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_OTHERINFO_FORM',
    'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_DETAIL_ITEMLINE_TABLE',
    'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_HEADER_COLLAPSE',
    'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_BASIC_TABS',
  ],
})
@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
@connect(({ inquiryHallNewPub, loading }) => ({
  inquiryHallNewPub,
  inquiryHall: inquiryHallNewPub,
  modelName: 'inquiryHallNewPub',
  fetchEvaluateSummaryLoading: loading.effects['inquiryHallNewPub/fetchEvaluateSummary'],
  fetchScoreDetailLoading: loading.effects['inquiryHallNewPub/fetchScoreDetail'],
  fetchInquiryHallUpdateLoading: loading.effects['inquiryHallNewPub/fetchInquiryHeaderDetail'],
  fetchItemLineLoading: loading.effects['inquiryHallNewPub/fetchItemLine'],
  fetchQuotationDetailLoading: loading.effects['inquiryHallNewPub/fetchQuotationDetail'],
  fetchLadderLevelLoading: loading.effects['inquiryHallNewPub/fetchLadderLevelyTable'],

  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class ConfirmCandidate extends Component {
  form;

  constructor(props) {
    super(props);

    this.state = {
      collapseKeys: [], // 折叠面板
      scoreDetailModalVisible: false, // 评分明细Modal
      modalSupplierCompanyName: '', // 查看评分明细供应商名称
      modalSectionName: '', // 查看评分明细标段名称
      activeScoreId: '', // 当前评分明细的id
      doubleUnitFlag: false,
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      newQuotationFlag: 0, // 启用新报价标识
    };
  }

  componentDidMount() {
    this.queryDoubleUnit();
    this.fetchBidEvaluation();
    this.fetchItemLine();
    this.fetchEvaluateSummary();
    this.queryDoubleUnit();
    this.newQuotationConfigSheet();
  }

  componentWillUnmount() {
    const { modelName = 'inquiryHall' } = this.props;
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        header: {},
        itemLine: [],
        bidSectionList: {},
        scoreDetailList: [],
        scoreDetailPagination: {},
        itemQuotationDetail: [],
        QuotationDetailDataSource: {},
        itemQuotationPagination: {},
      },
    });
  }

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfigSheet() {
    const {
      organizationId,
      match: { params },
    } = this.props;
    const rfxHeaderId = params.sourceHeaderId;

    const param = {
      organizationId,
      rfxHeaderId,
    };

    let result = null;
    try {
      result = await fetchNewQuotationConfigSheet(param);
      result = getResponse(result);

      if (result === 1) {
        this.setState({
          newQuotationFlag: result,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 获取招标头信息
   *
   * @memberof ConfirmCandidate
   */
  fetchBidEvaluation() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchInquiryHeaderDetail`,
      payload: {
        organizationId,
        rfxHeaderId: params.sourceHeaderId,
        path,
        customizeUnitCode:
          'SSRC.EXPERT_SCORE_MANAGE.HEADER_BASE,SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_OTHERINFO_FORM',
      },
    });
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
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
      modelName = 'inquiryHall',
    } = this.props;

    dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.sourceHeaderId,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_DETAIL_ITEMLINE_TABLE',
      },
    });
  }

  /**
   * 查询标段数据
   *
   * @memberof ConfirmCandidate
   */
  fetchEvaluateSummary() {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
      modelName = 'inquiryHall',
    } = this.props;

    dispatch({
      type: `${modelName}/fetchEvaluateSummary`,
      payload: {
        organizationId,
        sourceHeaderId: params.sourceHeaderId,
        sourceFrom: SourceFrom,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.LINE_DETAIL',
      },
    });
  }

  /**
   * 查询标段行评分明细
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  fetchScoreDetil(record = {}) {
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    const { evaluateSummaryId = '', ...others } = record;
    const { activeScoreId } = this.state;

    dispatch({
      type: `${modelName}/fetchScoreDetail`,
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
   * 查询供应商列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearchSupplier(itemIds) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/supplierRecord`,
      payload: {
        organizationId,
        itemIds,
        rfxHeaderId: params.sourceHeaderId,
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
   * 查看评分明细 - open modal
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
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
   * 标段描述行跳转到报价详情
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  directorQuotationDetail(record) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const { newQuotationFlag = 0 } = this.state;
    const { secondarySourceCategory } = header || {};
    const { quotationHeaderId = null } = record || {};
    const rfxId = header.rfxHeaderId;
    const bidFlag = secondarySourceCategory === 'NEW_BID';

    const currentTitle =
      secondarySourceCategory === 'NEW_BID'
        ? 'srm.common.tab.title.bidDetail'
        : 'srm.common.tab.title.quotationDetail';
    const currentAction =
      secondarySourceCategory === 'NEW_BID'
        ? intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')
        : intl.get('ssrc.inquiryHall.model.inquiryHall.quotationParticularss').d('报价详情');

    if (newQuotationFlag) {
      const searchObj = {
        rfxHeaderId: rfxId,
        noBackFlag: 1, // openTab 不需要返回
        pageType: 'SUPPLIER_DETAIL_QUERY',
        switchUrl: 2, // 采购方跳转标识
      };
      let newQuotationPath = `/ssrc/supplier-reply/query/${quotationHeaderId}`;
      if (secondarySourceCategory === 'NEW_BID') {
        newQuotationPath = `/ssrc/bid-supplier-reply/query/${quotationHeaderId}`;
      }

      parent.openTab({
        key: newQuotationPath,
        path: newQuotationPath,
        title: currentTitle,
        action: currentAction,
        search: querystring.stringify(searchObj),
        closable: true,
      });
      return;
    }

    parent.openTab({
      key: `/ssrc/expert-scoring/${bidFlag ? 'bid-quotation-detail' : 'detail'}/${rfxId}/${
        header.companyId
      }`,
      path: `/ssrc/expert-scoring/${bidFlag ? 'bid-quotation-detail' : 'detail'}/${rfxId}/${
        header.companyId
      }`,
      title: currentTitle,
      action: currentAction,
      closable: true,
      search: querystring.stringify({
        quotationHeaderId,
        switchUrl: 2, // 采购方跳转标识
        noBackFlag: true,
      }),
    });
  }

  /**
   * 取消查看评分明细 close modal
   *
   * @memberof ConfirmCandidate
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
   * 渲染标段操作按钮组
   *
   * @param {*} [option={}]
   * @returns
   * @memberof ConfirmCandidate
   */
  renderBidOperateButtons(option = {}) {
    const { getFieldDecorator, organizationId, bidSectionList } = option;
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '16px',
        }}
      >
        <div className={classnames(common['m-r-m'], 'ant-btn')}>
          <Form.Item>
            {getFieldDecorator('preAttachmentUuid', {
              initialValue: bidSectionList.preAttachmentUuid || '',
            })(
              <Upload
                bucketName={PRIVATE_BUCKET} // 预定表
                bucketDirectory="ssrc-prequal-scaling"
                attachmentUUID={bidSectionList.preAttachmentUuid}
                tenantId={organizationId}
                viewOnly
                filePreview
                icon="download"
              />
            )}
          </Form.Item>
        </div>
      </div>
    );
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const { itemCode, itemName, supplierCompanyName, rfxLineItemId } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        supplierCompanyName,
      },
    });
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchLadderLevelyTable`,
      payload: { rfxLineItemId, organizationId },
    });
  }

  /**
   * hideOperationRecord - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    this.setState({ viewLadderLevelVisible: false });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        ladderLevelData: [],
      },
    });
  }

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      form: { getFieldDecorator },
      match,
      organizationId,
      fetchItemLineLoading,
      fetchScoreDetailLoading,
      fetchLadderLevelLoading,
      [modelName]: {
        header = {},
        itemLine = [],
        bidSectionList = {},
        scoreDetailList = [],
        scoreDetailPagination = {},
        supplierData = [],
        ladderLevelData = [],
      },
      customizeTable,
      customizeForm,
      customizeCollapse,
      customizeTabPane,
      // eslint-disable-next-line no-shadow
      remote,
    } = this.props;

    const {
      modalSupplierCompanyName,
      modalSectionName,
      collapseKeys,
      scoreDetailModalVisible,
      doubleUnitFlag,
      viewLadderLevelVisible, // 阶梯报价模态框
      LadderLevelHeaderData = {}, // 阶梯报价头部数据
    } = this.state;

    // 基本信息props
    const bidInfoProps = {
      header,
      organizationId,
      viewBidMembers: this.viewBidMembers,
      customizeForm,
    };

    // 其它信息tab props
    const othersInfoProps = {
      header,
      organizationId,
      customizeForm,
    };

    // 物品信息tab props
    const itemLineProps = {
      match,
      doubleUnitFlag,
      loading: fetchItemLineLoading,
      dataSource: itemLine,
      searchSupplier: this.handleSearchSupplier,
      onSearch: this.fetchItemLine,
      supplierDataSource: supplierData,
      showQuotationDetail: this.showQuotationDetail,
      bidFlag: header.secondarySourceCategory === 'NEW_BID',
      viewLadderLevel: this.viewLadderLevelModal,
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

    const renderProps = {
      ...scoreDetailProps,
    };

    // 阶梯报价
    const ladderLevelModalProps = {
      // viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      visible: viewLadderLevelVisible,
      ladderLevelData,
      LadderLevelHeaderData,
      fetchLadderLevelLoading,
      doubleUnitFlag,
    };

    return (
      <Form
        className={common['detail-standard']}
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <div>
          {' '}
          {/* 禁止删除 flex布局改变层级 */}
          <Content className="ued-detail-wrapper" style={{ margin: '8px 8px 0 8px' }}>
            {customizeCollapse(
              {
                code: 'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_HEADER_COLLAPSE',
              },
              <Collapse className="form-collapse" onChange={this.onCollapseChange}>
                <Panel
                  showArrow={false}
                  header={
                    <React.Fragment>
                      <span
                        className={common['collapse-title']}
                        style={{
                          display: 'inline-block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '90%',
                          float: 'left',
                        }}
                      >
                        {header.rfxNum} —{' '}
                        <Tooltip
                          title={`${header.rfxNum} — ${header.rfxTitle}`}
                          overlayStyle={{ minWidth: '300px' }}
                          placement="bottom"
                        >
                          {header.rfxTitle || ''}
                        </Tooltip>
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
                  {customizeTabPane(
                    {
                      code: 'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_BASIC_TABS',
                    },
                    <Tabs defaultActiveKey="baseInfos" animated={false} onChange={this.changeTabs}>
                      <Tabs.TabPane
                        tab={intl.get(`ssrc.inquiryHall.view.message.tab.baseInfos`).d('基本信息')}
                        key="baseInfos"
                      >
                        <BidInfo {...bidInfoProps} />
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        tab={intl.get(`ssrc.inquiryHall.view.message.tab.otherInfos`).d('其他信息')}
                        key="otherInfos"
                        forceRender
                      >
                        <OthersInfo {...othersInfoProps} />
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemsInfo`).d('物品信息')}
                        key="itemsInfos"
                        forceRender
                      >
                        <ItemLine {...itemLineProps} />
                      </Tabs.TabPane>
                    </Tabs>
                  )}
                </Panel>
              </Collapse>
            )}
          </Content>
        </div>

        {Object.keys(bidSectionList.evaluateSummaryMap || {}).length ? (
          <div
            className={common['exclude-content-card']}
            style={{ flex: 1, width: 'calc(100% - 16px)', margin: '8px' }}
          >
            {bidSectionList.sectionFlag ? (
              <Tabs animated={false}>
                {Object.keys(bidSectionList.evaluateSummaryMap).length
                  ? Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                    <Tabs.TabPane forceRender key={item} tab={item}>
                      <div style={{ marginTop: '24px' }}>
                        {this.renderBidOperateButtons({
                            getFieldDecorator,
                            organizationId,
                            bidSectionList,
                          })}
                      </div>
                      <BidSectionTable
                        match={match}
                        header={header}
                        dataSource={bidSectionList.evaluateSummaryMap[item]}
                        openScoreDetailModal={this.openScoreDetailModal}
                        directorQuotationDetail={this.directorQuotationDetail}
                        businessWeight={bidSectionList.businessWeight}
                        technologyWeight={bidSectionList.technologyWeight}
                        customizeTable={customizeTable}
                        sourceFrom={SourceFrom}
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
                })}
                {Object.keys(bidSectionList.evaluateSummaryMap).length
                  ? Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                    <div key={item}>
                      <BidSectionTable
                        match={match}
                        header={header}
                        dataSource={bidSectionList.evaluateSummaryMap[item]}
                        openScoreDetailModal={this.openScoreDetailModal}
                        directorQuotationDetail={this.directorQuotationDetail}
                        businessWeight={bidSectionList.businessWeight}
                        technologyWeight={bidSectionList.technologyWeight}
                        customizeTable={customizeTable}
                        sourceFrom={SourceFrom}
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
        {remote ? (
          remote.render(
            'RENDER_SCORE_VIEW_APPROVAL',
            <ScoreDetailModal {...scoreDetailProps} />,
            renderProps
          )
        ) : (
          <ScoreDetailModal {...scoreDetailProps} />
        )}
        {viewLadderLevelVisible && <LadderLevelModal {...ladderLevelModalProps} />}
      </Form>
    );
  }
}
