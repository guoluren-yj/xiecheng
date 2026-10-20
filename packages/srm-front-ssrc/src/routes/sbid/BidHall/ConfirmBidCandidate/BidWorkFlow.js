/**
 * 工作流 - 确认中标候选人&推荐成交候选人
 * @date: 2019-12-13
 * @author: zxm <ximin.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import querystring from 'querystring';
import { Form, Tabs, Collapse, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';

import { Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import common from '@/routes/sbid/common.less';

import BidInfo from './BidInfo';
import BidMembersModal from './BidMembersModal';
import OthersInfo from './OthersInfo';
import ItemLine from './ItemLine';
import BidSectionTable from './BidSectionTable';
import ScoreDetailModal from './ScoreDetailModal';

const { Panel } = Collapse;
const SourceFrom = 'BID';
const promptCode = 'ssrc.supplierBidQuery';

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
@connect(({ bidHallPub, loading }) => ({
  bidHallPub,
  modelName: 'bidHallPub',
  fetchbidHallUpdateLoading: loading.effects['bidHallPub/fetchBidHeaderDetail'],
  fetchBidMembersLoading: loading.effects['bidHallPub/fetchBidMembers'],
  fetchItemLineLoading: loading.effects['bidHallPub/fetchItemLine'],
  fetchItemLineSupplierLoading: loading.effects['bidHallPub/supplierRecord'],
  fetchEvaluateSummaryLoading: loading.effects['bidHallPub/fetchEvaluateSummary'],
  fetchScoreDetailLoading: loading.effects['bidHallPub/fetchScoreDetail'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class BidWorkFlow extends Component {
  form;

  constructor(props) {
    super(props);

    this.state = {
      collapseKeys: [], // 折叠面板
      bidMembersModalVisible: false, // 招标小组Modal
      itemSupplierModalVisible: false, // 物品明细供应商Modal
      scoreDetailModalVisible: false, // 评分明细Modal
      modalSupplierCompanyName: '', // 查看评分明细供应商名称
      modalSectionName: '', // 查看评分明细标段名称
      activeScoreId: '', // 当前评分明细的id
    };
  }

  componentDidMount() {
    this.fetchBidEvaluation();
    this.fetchItemLine();
    this.fetchEvaluateSummary();
  }

  componentWillUnmount() {
    const { modelName = 'bidHall', dispatch } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        header: {},
        bidMembersList: [],
        itemLine: [],
        supplierData: [],
        bidSectionList: {},
        scoreDetailList: [],
        scoreDetailPagination: {},
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
      modelName = 'bidHall',
      match: { params, path },
    } = this.props;
    dispatch({
      type: `${modelName}/fetchBidHeaderDetail`,
      payload: {
        organizationId,
        bidHeaderId: params.sourceHeaderId,
        path,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.HEADER,SSRC.EXPERT_SCORE_MANAGE.OTHER_INFO',
      },
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
      modelName = 'bidHall',
    } = this.props;

    dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: {
        page,
        organizationId,
        bidHeaderId: params.sourceHeaderId,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.ITEM_LINE',
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
    const { dispatch, organizationId, modelName = 'bidHall' } = this.props;

    dispatch({
      type: `${modelName}/supplierRecord`,
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
      modelName = 'bidHall',
    } = this.props;

    dispatch({
      type: `${modelName}/fetchBidMembers`,
      payload: { organizationId, bidHeaderId: params.sourceHeaderId, path },
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
      match: { params = {} },
      modelName = 'bidHall',
    } = this.props;

    dispatch({
      type: `${modelName}/fetchEvaluateSummary`,
      payload: { organizationId, sourceHeaderId: params.sourceHeaderId, sourceFrom: SourceFrom },
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
    const { dispatch, organizationId, modelName = 'bidHall' } = this.props;

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

    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
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

    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
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
    parent.openTab({
      key: `/ssrc/bid-hall/confirm-bid-candidate/bid-query-detail/${record.quotationHeaderId}`,
      path: `/ssrc/bid-hall/confirm-bid-candidate/bid-query-detail/${record.quotationHeaderId}`,
      // title: intl.get(`${promptCode}.view.message.title.viewBidBook`).d('查看投标书'),
      title: 'srm.common.tab.title.ssrc.viewBidBook',
      closable: true,
      search: querystring.stringify({
        isPub: true,
      }),
    });
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
   * 渲染标段操作按钮组
   *
   * @param {*} [option={}]
   * @returns
   * @memberof ConfirmBidCandidate
   */
  renderBidOperateButtons(option = {}) {
    const { getFieldDecorator, organizationId, bidSectionList } = option;
    return (
      <div
        style={{
          display: 'flex',
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
                bucketName={PRIVATE_BUCKET}
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

  render() {
    const { modelName = 'bidHall' } = this.props;
    const {
      customizeForm,
      customizeTable,
      form: { getFieldDecorator },
      match,
      organizationId,
      fetchItemLineLoading,
      fetchBidMembersLoading,
      fetchItemLineSupplierLoading,
      fetchScoreDetailLoading,
      [modelName]: {
        header = {},
        bidMembersList = [],
        itemLine = [],
        supplierData = [],
        bidSectionList = {},
        scoreDetailList = [],
        scoreDetailPagination = {},
      },
    } = this.props;

    const {
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
      form: { getFieldDecorator },
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
      form: { getFieldDecorator },
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
      customizeTable,
      cancelViewItemSupplier: this.cancelViewItemSupplier,
      supplierRecordLoading: fetchItemLineSupplierLoading,
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
              <Tabs animated={false}>
                {Object.keys(bidSectionList.evaluateSummaryMap).length
                  ? Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                    <Tabs.TabPane forceRender key={item} tab={item}>
                      {this.renderBidOperateButtons({
                          getFieldDecorator,
                          organizationId,
                          bidSectionList,
                        })}
                      <BidSectionTable
                        header={header}
                        dataSource={bidSectionList.evaluateSummaryMap[item]}
                        openScoreDetailModal={this.openScoreDetailModal}
                        directorTender={this.directorTender}
                        businessWeight={bidSectionList.businessWeight}
                        technologyWeight={bidSectionList.technologyWeight}
                        match={match}
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
                })}
                {Object.keys(bidSectionList.evaluateSummaryMap).length
                  ? Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                    <div key={item}>
                      <BidSectionTable
                        header={header}
                        dataSource={bidSectionList.evaluateSummaryMap[item]}
                        openScoreDetailModal={this.openScoreDetailModal}
                        directorTender={this.directorTender}
                        businessWeight={bidSectionList.businessWeight}
                        technologyWeight={bidSectionList.technologyWeight}
                        match={match}
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
