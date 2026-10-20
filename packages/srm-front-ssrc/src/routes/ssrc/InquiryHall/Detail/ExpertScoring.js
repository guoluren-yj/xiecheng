/**
 * inquiryHall - 寻源服务/寻源大厅-明细查看-专家评分进度条
 * @date: 2020-04-26
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Col, Collapse, Form, Icon, Row, Table, Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { tableScrollWidth, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import CPopover from '@/routes/components/CPopover/';

import { fetchExpertScoreDetails } from '@/services/expertScoringService';
import { fetchEvaluateSummary } from '@/services/inquiryHallService';

const { Panel } = Collapse;
const FormItem = Form.Item;

export default class ExpertScoring extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      header: {},
      bidSectionList: {},
      ExpertHeaderCollapseKeys: ['expertHeader'],
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevProps) {
      return;
    }

    const { sourceHeaderId: prevRfxHeaderId = null } = prevProps || {};
    const { sourceHeaderId = null } = this.props;
    const RefreshFlag = sourceHeaderId && prevRfxHeaderId && prevRfxHeaderId !== sourceHeaderId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchPageMain();
    }
  }

  componentDidMount() {
    this.fetchPageMain();
  }

  // 查询头/行
  fetchPageMain = () => {
    this.fetchExpertScoreDetails();
    this.fetchEvaluateSummary();
  };

  async fetchExpertScoreDetails() {
    const { sourceHeaderId, organizationId, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

    try {
      let data = await fetchExpertScoreDetails({
        organizationId,
        sourceHeaderId,
        sourceFrom: 'RFX',
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.EXPERT_SCORE_BASEINFO`,
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        header: data,
      });
    } catch (e) {
      throw e;
    }
  }

  async fetchEvaluateSummary(page = {}) {
    const { sourceHeaderId, organizationId } = this.props;

    try {
      let data = await fetchEvaluateSummary({
        organizationId,
        sourceHeaderId,
        sourceFrom: 'RFX',
        page,
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      data = this.addDataStateForBidSectionList(data);
      this.setState({
        bidSectionList: data,
      });
    } catch (e) {
      throw e;
    }
  }

  addDataStateForBidSectionList(data = {}) {
    const mapData = data.evaluateSummaryMap || {};

    Object.keys(mapData).forEach((item) => {
      if (!Array.isArray(mapData[item]) || !mapData[item].length) {
        return;
      }

      const subConfig = mapData[item].map((child) => {
        return {
          ...child,
          _status: 'update',
        };
      });

      mapData[item] = subConfig;
    });

    return {
      ...data,
      evaluateSummaryMap: mapData,
    };
  }

  @Bind()
  changeHeaderCollapse(key = []) {
    this.setState({
      ExpertHeaderCollapseKeys: key,
    });
  }

  /**
   * 金额千分隔
   *
   * @param {*} val
   * @returns
   * @memberof BidSectionTable
   */
  thousandDivider(val) {
    if (!val || val === '－') {
      return '--';
    }

    const num = parseFloat(val).toLocaleString();
    return num;
  }

  renderFormContent(dataSource = {}) {
    const {
      form,
      form: { getFieldDecorator },
      customizeForm,
      rfx = {},
    } = this.props;
    const { unitCodeSymbol } = rfx;

    return customizeForm(
      {
        code: `SSRC.${unitCodeSymbol}_DETAIL.EXPERT_SCORE_BASEINFO`,
        form,
        dataSource,
        readOnly: true,
      },
      <Form className="read-row-custom">
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: dataSource.companyName,
              })(<span>{dataSource.companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCategoryMeaning', {
                initialValue: dataSource.sourceCategoryMeaning,
              })(
                <span>
                  {dataSource.secondarySourceCategoryMeaning || dataSource.sourceCategoryMeaning}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethodMeaning', {
                initialValue: dataSource.sourceMethodMeaning,
              })(<span>{dataSource.sourceMethodMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.expertScoring.view.message.title.expertScore`).d('专家评分')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('expertScoreTypeMeaning', {
                initialValue: dataSource.expertScoreTypeMeaning,
              })(<span>{dataSource.expertScoreTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.sourceTemplate.model.template.openBidOrder').d('评标步制')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('openBidOrderMeaning', {
                initialValue: dataSource.openBidOrderMeaning,
              })(<span>{dataSource.openBidOrderMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  renderHeaderForm() {
    const { ExpertHeaderCollapseKeys = [], header = {} } = this.state;
    const children = (
      <h3>
        {header.rfxNum}
        {header.rfxTitle ? `-${header.rfxTitle}` : null}
      </h3>
    );
    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            {children}
            <a>
              {ExpertHeaderCollapseKeys.includes('expertHeader')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={ExpertHeaderCollapseKeys.includes('expertHeader') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="expertHeader"
      >
        {this.renderFormContent(header)}
      </Panel>
    );
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

  // 评分明细表格
  scoringDetailColumns(header = {}) {
    const { evaluateExperts = {}, firstTeam = null } = header;
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

  scoringDetail() {
    const { header = {} } = this.state;
    if (isEmpty(header)) {
      return;
    }

    const { supplierList = [] } = this.tidyDataSource(header);
    const Columns = this.scoringDetailColumns(header);
    const scrollX = tableScrollWidth(Columns);

    return (
      <Table
        bordered
        rowKey="quotationHeaderId"
        scroll={{ x: scrollX }}
        dataSource={supplierList}
        columns={Columns}
        pagination={false}
      />
    );
  }

  // 确认中标候选人表格
  confirmCandidate({ dataSource = [] }) {
    const {
      directorQuotationDetail = () => {},
      openScoreDetailModal = () => {},
      rfx: { quotationName },
    } = this.props;
    const { header = {}, bidSectionList = {} } = this.state;
    const { bidRuleType = null } = header || {};
    const { businessWeight = null, technologyWeight = null } = bidSectionList || {};

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
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonInvalidQuotation`, { quotationName })
          .d('无效{quotationName}'),
        dataIndex: 'invalidFlag',
        width: 100,
        render: (val) =>
          val ? intl.get(`ssrc.inquiryHall.model.inquiryHall.invalid`).d('无效') : '',
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

  render() {
    const { ExpertHeaderCollapseKeys = [], header = {}, bidSectionList = {} } = this.state;

    return (
      <div>
        <Collapse
          onChange={this.changeHeaderCollapse}
          className="form-collapse"
          defaultActiveKey={ExpertHeaderCollapseKeys}
        >
          {this.renderHeaderForm()}
        </Collapse>
        <Tabs animated={false}>
          {header.evaluateExperts && (
            <Tabs.TabPane
              tab={intl.get(`ssrc.bidHall.model.bidHall.scoringDetail`).d('评分明细')}
              key="scoringDetail"
            >
              {this.scoringDetail()}
            </Tabs.TabPane>
          )}
          {header.preEvaluationFlag ? (
            <Tabs.TabPane
              tab={intl.get(`ssrc.inquiryHall.view.tabPane.confirmCandidate`).d('确认候选人')}
              key="confirmCandidate"
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
          ) : null}
        </Tabs>
      </div>
    );
  }
}
