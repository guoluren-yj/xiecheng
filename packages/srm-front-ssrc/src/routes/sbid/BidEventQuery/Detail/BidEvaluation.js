/**
 * bidEventQuery - -招标事件查询--评标查看
 * @date: 2020-09-17
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import { map, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { PureComponent } from 'react';
import { Form, Row, Col, Collapse, Icon, Tabs, Tooltip, Table, Spin } from 'hzero-ui';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';
import { FORM_COL_3_LAYOUT } from 'utils/constants';

import CPopover from '@/routes/sbid/components/CPopover';
import styles from './index.less';

const { Panel } = Collapse;

export default class Calibration extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: 'scoreDetails', // 供应商维度/物料维度的tab标识
    };
  }

  renderFormContent(dataSource = {}) {
    const { UEDDisplayFormItem } = this.props;
    return (
      <Form className="read-row-custom">
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.common.company').d('公司')}
              value={dataSource.companyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
              value={dataSource.sourceCategoryMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
              value={dataSource.sourceMethodMeaning}
            />
          </Col>
        </Row>
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.expertScore`).d('专家评分')}
              value={dataSource.expertScoreTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.qualiExam.model.qualiExam.openBidOrder').d('评标步制')}
              value={dataSource.openBidOrderMeaning}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  renderPrequalHeader() {
    const { header = {}, EvaluationCollapseKeys = [] } = this.props;
    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>
              {header.bidNum}
              {header.bidTitle ? `-${header.bidTitle}` : null}
            </h3>
            <a>
              {EvaluationCollapseKeys.includes('bidEvaluationHeader')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={EvaluationCollapseKeys.includes('bidEvaluationHeader') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="bidEvaluationHeader"
      >
        {this.renderFormContent(header)}
      </Panel>
    );
  }

  /**
   * 浮动文字tabs
   */
  @Bind()
  renderTooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Tooltip>
    );
  };

  /**
   * 点击头标签-停止折叠面板冒泡行为
   */
  @Bind()
  rfxLineTag(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  @Bind()
  changeNewTabs(newActiveKey) {
    const { LinePackList = [], fetchScoreDetails } = this.props;
    const newArray2 = [];
    for (let i = 0; i < LinePackList.length; i++) {
      if (newActiveKey === `${LinePackList[i].sectionId}`) {
        newArray2.push(LinePackList[i]);
      }
    }
    fetchScoreDetails(newArray2[0]);
  }

  /**
   * 渲染标段tabs-区分标段
   */
  @Bind()
  renderTabs() {
    const { LinePackList = [] } = this.props;
    return (
      <div>
        <Tabs animated={false} onChange={this.changeNewTabs}>
          {map(LinePackList, (item) => {
            return (
              <Tabs.TabPane tab={this.renderTooTipTabs(item)} key={`${item.sectionId}`}>
                {this.scoringDetail()}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }

  /**
   * 切换评分明细/确认候选人tab
   */
  @Bind()
  changeTabs(key) {
    this.setState({
      activeKey: key,
    });
  }

  /**
   * 金额千分隔
   *
   * @param {*} val
   * @returns
   * @memberof BidSectionTable
   */
  @Bind()
  thousandDivider(val) {
    if (!val || val === '－') {
      return '--';
    }
    const num = parseFloat(val).toLocaleString();
    return num;
  }

  // 确认中标候选人表格
  @Bind()
  confirmCandidate({ dataSource = [] }) {
    const {
      expertScoreDetails = {},
      bidSectionList = {},
      directorQuotationDetail = () => {},
      openScoreDetailModal = () => {},
    } = this.props;
    const { bidRuleType = null } = expertScoreDetails;
    const { businessWeight = null, technologyWeight = null } = bidSectionList;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRank`).d('排名'),
        dataIndex: 'scoreRank',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationParticulars`).d('报价详情'),
        dataIndex: 'quotationNum',
        width: 100,
        render: (_, record) => (
          <a onClick={() => directorQuotationDetail(record)}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationParticulars`).d('报价详情')}
          </a>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalAmount`).d('总价'),
        dataIndex: 'totalAmount',
        width: 100,
        align: 'right',
        render: (val) => this.thousandDivider(val),
      },
      bidRuleType === 'DIFF'
        ? {
            title: (
              <div>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.businessScore`).d('商务评分')}
                {businessWeight ? `(${businessWeight}%)` : '(0%)'}
              </div>
            ),
            dataIndex: 'businessScore',
            width: 140,
            render: (val) => val && Number(val).toFixed(2),
          }
        : null,
      bidRuleType === 'DIFF'
        ? {
            title: (
              <div>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyScore`).d('技术评分')}
                {technologyWeight ? `(${technologyWeight}%)` : '(0%)'}
              </div>
            ),
            dataIndex: 'technologyScore',
            width: 140,
            render: (val) => val && val.toFixed(2),
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalScore`).d('总分'),
        dataIndex: 'score',
        width: 80,
        render: (val, record) => <a onClick={() => openScoreDetailModal(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.recommend`).d('推荐'),
        dataIndex: 'candidateFlag',
        width: 80,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateSuggestion`).d('推荐意见'),
        dataIndex: 'candidateSuggestion',
        width: 280,
      },
    ].filter(Boolean);
    const scrollX = tableScrollWidth(columns);

    return (
      <Table
        bordered
        rowKey="evaluateSummaryId"
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    );
  }

  // 评分明细
  @Bind()
  scoringDetail() {
    const { scoreDetails = {}, fetchScoreDetailsLoading = false } = this.props;
    if (isEmpty(scoreDetails)) {
      return;
    }
    const { supplierList = [] } = this.tidyDataSource(scoreDetails);
    const Columns = this.scoringDetailColumns(scoreDetails);
    return (
      <div>
        {fetchScoreDetailsLoading ? (
          <Spin />
        ) : (
          <Table
            bordered
            rowKey="quotationHeaderId"
            scroll={{ x: scrollX }}
            dataSource={supplierList}
            columns={Columns}
            pagination={false}
            loading={fetchScoreDetailsLoading}
          />
        )}
      </div>
    );
  }

  // 整合动态列
  tidyDynamicColumns(evaluateExpertsColumnsData = []) {
    if (!Array.isArray(evaluateExpertsColumnsData) || isEmpty(evaluateExpertsColumnsData)) {
      return;
    }

    const RelativeColumns = evaluateExpertsColumnsData.map((item) => {
      const { evaluateExpertId = null, expertName = null, team = '' } = item || {};
      return {
        title: expertName,
        dataIndex: `${team}${evaluateExpertId}`,
        width: 80,
      };
    });

    return RelativeColumns;
  }

  // 表格固通用列
  scoringDetailCommonColumns() {
    return [
      {
        title: intl.get('ssrc.common.supplierName').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 280,
      },
      {
        title: intl.get('ssrc.common.summary').d('汇总'),
        dataIndex: 'summaryScoreMeaning',
        width: 80,
      },
    ];
  }

  // 评分明细表格
  scoringDetailColumns(scoreDetails = {}) {
    const { evaluateExperts = {}, firstTeam = null } = scoreDetails;
    if (isEmpty(evaluateExperts)) {
      return [];
    }

    const { BUSINESS_TECHNOLOGY = [], BUSINESS = [], TECHNOLOGY = [] } = evaluateExperts;

    let NoneColumns = this.tidyDynamicColumns(BUSINESS_TECHNOLOGY) || [];
    let BusinessColumns = this.tidyDynamicColumns(BUSINESS) || [];
    let TechnologyColumns = this.tidyDynamicColumns(TECHNOLOGY) || [];
    NoneColumns = !isEmpty(NoneColumns) ? NoneColumns : null;
    BusinessColumns = !isEmpty(BusinessColumns)
      ? {
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessTeam`).d('商务组'),
          children: BusinessColumns,
        }
      : null;
    TechnologyColumns = !isEmpty(TechnologyColumns)
      ? {
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyTeam`).d('技术组'),
          children: TechnologyColumns,
        }
      : null;
    const FixedColumns = this.scoringDetailCommonColumns();
    const DiffColumns =
      firstTeam === 'TECHNOLOGY'
        ? [].concat(TechnologyColumns, BusinessColumns)
        : [].concat(BusinessColumns, TechnologyColumns);

    return [].concat(FixedColumns, NoneColumns, DiffColumns).filter(Boolean);
  }

  tidyDataSource(data = {}) {
    const { supplierList = [] } = data;
    if (!data || !supplierList) {
      return;
    }

    const NewSupplierList = supplierList.map((item = {}) => {
      const { scoreDetails = [] } = item;
      if (!scoreDetails) {
        return item;
      }
      const scoreDetailCollect = {};
      const NewScoreDetails = scoreDetails.map((scoreItem = {}) => {
        const { team = null, evaluateExpertId = null, sumScoreMeaning = null } = scoreItem;
        scoreDetailCollect[`${team}${evaluateExpertId}`] = sumScoreMeaning;

        return {
          ...scoreItem,
        };
      });

      return {
        ...item,
        ...scoreDetailCollect,
        scoreDetails: NewScoreDetails,
      };
    });

    return {
      ...data,
      supplierList: NewSupplierList,
    };
  }

  renderPrequalSupplier() {
    const { EvaluationCollapseKeys = [], bidSectionList = {}, source } = this.props;
    const { activeKey } = this.state;
    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>{intl.get('ssrc.bidHall.model.bidHall.bidEvaluationDetails').d('评标详情')}</h3>
            <a>
              {EvaluationCollapseKeys.includes('bidEvaluationDetail')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={EvaluationCollapseKeys.includes('bidEvaluationDetail') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="bidEvaluationDetail"
      >
        <Tabs
          defaultActiveKey="scoreDetails"
          activeKey={activeKey}
          onChange={this.changeTabs}
          animated={false}
          className={styles.tabStyle}
        >
          <Tabs.TabPane
            tab={intl.get(`ssrc.bidHall.view.message.tab.scoreDetails`).d('评分明细')}
            key="scoreDetails"
          >
            {source === 'PACK' && <div style={{ marginTop: '24px' }}>{this.renderTabs()}</div>}
            {source === 'NONE' && this.scoringDetail()}
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get(`ssrc.bidEventQuery.view.message.tab.©`).d('确认候选人')}
            key="confirmCandidates"
          >
            {Object.keys(bidSectionList.evaluateSummaryMap || {}).length ? (
              <div>
                {bidSectionList.sectionFlag ? (
                  <Tabs animated={false}>
                    {Object.keys(bidSectionList.evaluateSummaryMap).length
                      ? Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                        <Tabs.TabPane forceRender key={item} tab={item}>
                          {this.confirmCandidate({
                              dataSource: bidSectionList.evaluateSummaryMap[item] || [],
                            })}
                        </Tabs.TabPane>
                        ))
                      : ''}
                  </Tabs>
                ) : (
                  <div>
                    {Object.keys(bidSectionList.evaluateSummaryMap).length
                      ? Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                        <div key={item}>
                          {this.confirmCandidate({
                              dataSource: bidSectionList.evaluateSummaryMap[item] || [],
                            })}
                        </div>
                        ))
                      : ''}
                  </div>
                )}
              </div>
            ) : (
              ''
            )}
          </Tabs.TabPane>
        </Tabs>
      </Panel>
    );
  }

  render() {
    const { EvaluationCollapseKeys = [], setCollapseByKey } = this.props;
    return (
      <Collapse
        onChange={(keys) => setCollapseByKey('EvaluationCollapseKeys', keys)}
        className="form-collapse"
        defaultActiveKey={EvaluationCollapseKeys}
      >
        {this.renderPrequalHeader()}
        {this.renderPrequalSupplier()}
      </Collapse>
    );
  }
}
