/**
 * SupplierAnnualDetail - 考评结果查询详情
 * @date: 2018-12-29
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import qs from 'querystring';
import { connect } from 'dva';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Col, Row, Table, Spin, Collapse, Icon, Form } from 'hzero-ui';

import intl from 'utils/intl';
import { Header, Content } from '@/utils/Page';
import { valueMapMeaning, dateTimeRender, dateRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';
import Search from './Search.js';
import ScoreDetailModal from './ScoreDetailModal';

// 使用 Collapse.Panel 组件
const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
/**
 * @export
 * @class Detail 考评结果查询 详情组件
 * @extends {Component} - React.Component
 * @reactProps {Object} supplierDetail - 数据源
 * @reactProps {Function} [dispatch= e => e] -redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.evaluationQuery', 'sslm.supplierDocManage', 'sslm.common'],
})
@connect(({ supplierDetail, loading }) => ({
  supplierDetail,
  loading: {
    detail: loading.effects['supplierDetail/fetchDetailData'],
  },
  tenantId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  form;

  constructor(props) {
    super(props);
    const {
      match: { params },
    } = this.props;
    const routerParam = qs.parse(this.props.location.search.substr(1));
    const {
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
    } = routerParam;
    const { evalGranularity } = params;
    this.state = {
      collapsed: true,
      scoreDetailVisible: false,
      evalGranularity,
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
    };
  }

  componentDidMount() {
    this.handleSearch();
    this.fetchEnum();
  }

  // 查询值集
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierDetail/fetchLov',
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
   * 年度考评结果明细表格折叠和展开
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
   * @param {?string} fields - 表单数据
   */
  @Bind()
  handleSearch(page = {}) {
    const {
      match: { params },
    } = this.props;
    const { dispatch } = this.props;
    const { evalGranularity, supplierCompanyId } = this.state;
    const paramItem = {
      SU: 'SUPPLIER',
      'SU+CA': 'SCORE',
      'SU+IT': 'SCORE',
    };
    const formValue = !isUndefined(this.form)
      ? filterNullValueObject(this.form.getFieldsValue())
      : {};

    dispatch({
      type: 'supplierDetail/fetchDetailData',
      payload: {
        ...formValue,
        organizationId,
        evalHeaderId: params.id,
        selectOptional: paramItem[evalGranularity],
        page,
        supplierId: supplierCompanyId,
      },
    });
  }

  /**
   * 控制评分明细弹框
   * @param {boolean} [visible=true] - 是否显示
   * @memberof Detail
   */
  @Bind()
  handleScoreDetailModal(visible = true) {
    this.setState({ scoreDetailVisible: visible });
  }

  /**
   * 查看评分明细
   *@param {Object} record - 被点击查看评分详情条目的数据
   */
  @Bind()
  onScoreDetail(record = {}) {
    const {
      dispatch,
      tenantId,
      supplierDetail: {
        detailData: { evalTplId },
      },
    } = this.props;
    const type = 'supplierDetail/fetchScoreDetail';
    dispatch({
      type,
      payload: {
        tenantId,
        evalTplId,
        evalLineId: record.evalLineId,
      },
    });
    this.setState({ scoreDetailVisible: true, granularityList: record });
  }

  render() {
    const {
      loading,
      match,
      supplierDetail: { detailData = {}, methodValue, detailLinePage, scoreDetailList },
    } = this.props;
    const { kpiEvalDetailLineDTOPage = {} } = detailData;
    const lineList = (kpiEvalDetailLineDTOPage && kpiEvalDetailLineDTOPage.content) || [];
    const {
      collapsed,
      scoreDetailVisible,
      granularityList,
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
    } = this.state;
    const isSu = detailData.evalGranularity === 'SU';
    const {
      params: { id, evalGranularity },
    } = this.props.match;
    const dynamicColName = {
      'SU+CA': intl.get(`sslm.evaluationQuery.model.purchase.category`).d('采购品类'),
      'SU+IT': intl.get(`sslm.evaluationQuery.model.item.materiel`).d('物料'),
    };
    const completeColumns = [
      {
        title: intl.get(`sslm.common.view.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 120,
      },
      {
        title: dynamicColName[evalGranularity],
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.score.detail`).d('评分明细'),
        dataIndex: 'scoreDetail',
        width: 120,
        render: (_, record) => (
          <a onClick={() => this.onScoreDetail(record)}>
            {intl.get(`sslm.evaluationQuery.model.score.detail`).d('评分明细')}
          </a>
        ),
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.get.score`).d('得分'),
        dataIndex: 'lineScore',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.item.level`).d('等级'),
        dataIndex: 'levelCode',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.ranking`).d('考评排名'),
        dataIndex: 'rankNum',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.feedback.remark`).d('反馈说明'),
        dataIndex: 'lineRemark',
        width: 200,
        onCell: () => ({
          style: {
            overflow: 'hidden',
            maxWidth: 200,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
          onClick: e => {
            const { target } = e;
            if (target.style.whiteSpace === 'normal') {
              target.style.whiteSpace = 'nowrap';
            } else {
              target.style.whiteSpace = 'normal';
            }
          },
        }),
      },
    ];
    const searchProps = {
      tenantId,
      organizationId,
      evalHeaderId: id,
      evalGranularity,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const scoreDetailModalProps = {
      evalGranularity,
      granularityList,
      scoreDetailList,
      loading: loading.scoreDetailLoading,
      visible: scoreDetailVisible,
      closeModal: this.handleScoreDetailModal,
    };
    const columns = isSu
      ? completeColumns.filter(({ dataIndex }) => dataIndex !== 'categoryName')
      : completeColumns;
    const basePath = match.path.substring(0, match.path.indexOf('/supplier-evaluation'));
    return (
      <Fragment>
        <Header
          title={intl.get(`sslm.evaluationQuery.model.result.query`).d('考评结果查询')}
          backPath={`${basePath}/supplier-detail?${qs.stringify({
            tenantId,
            companyId,
            partnerCompanyId,
            partnerTenantId,
            supplierCompanyId,
            spfmCompanyId,
            spfmPartnerCompanyId,
          })}`}
        />
        <Content className={styles['detail-form']}>
          <Spin spinning={loading.detail || false}>
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
                    <h3>{intl.get(`sslm.evaluationQuery.view.information`).d('基本信息')}</h3>
                    <a>
                      {collapsed
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                      {<Icon type={collapsed ? 'up' : 'down'} />}
                    </a>
                  </Fragment>
                }
              >
                <Form>
                  <Row className="items-row">
                    <Col span={8}>
                      <Row>
                        <Col span={6} className="item-label">
                          {intl.get(`sslm.evaluationQuery.model.archive.num`).d('档案编码')}:
                        </Col>
                        <Col span={16}>{detailData.evalNum}</Col>
                      </Row>
                    </Col>
                    <Col span={8}>
                      <Row>
                        <Col span={6} className="item-label">
                          {intl.get(`sslm.evaluationQuery.model.archive.describe`).d('档案描述')}:
                        </Col>
                        <Col
                          span={16}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {detailData.evalName}
                        </Col>
                      </Row>
                    </Col>
                    <Col span={8}>
                      <Row>
                        <Col span={6} className="item-label">
                          {intl.get(`sslm.evaluationQuery.model.archive.status`).d('档案状态')}:
                        </Col>
                        <Col span={16}>{detailData.evalStatusMeaning}</Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row className="items-row">
                    <Col span={8}>
                      <Col span={6} className="item-label">
                        {intl.get(`sslm.evaluationQuery.model.evaluation.template`).d('考评模板')}:
                      </Col>
                      <Col span={16}>{detailData.evalTplName}</Col>
                    </Col>
                    <Col span={8}>
                      <Col span={6} className="item-label">
                        {intl.get(`sslm.evaluationQuery.model.evaluation.dimension`).d('考评维度')}:
                      </Col>
                      <Col span={16}>{detailData.evalDimensionMeaning}</Col>
                    </Col>
                    <Col span={8}>
                      <Col span={6} className="item-label">
                        {intl.get(`sslm.evaluationQuery.model.dimension.value`).d('维度值')}:
                      </Col>
                      <Col span={16}>{detailData.evalDimensionValueMeaning}</Col>
                    </Col>
                  </Row>
                  <Row className="items-row">
                    <Col span={8}>
                      <Col span={6} className="item-label">
                        {intl.get(`sslm.evaluationQuery.model.evaluation.cycle`).d('考评周期')}:
                      </Col>
                      <Col span={16}>{detailData.evalCycleMeaning}</Col>
                    </Col>
                    <Col span={8}>
                      <Col span={6} className="item-label">
                        {intl.get(`sslm.evaluationQuery.model.evaluation.charger`).d('考评负责人')}
                      </Col>
                      <Col span={16}>{detailData.processUserName}</Col>
                    </Col>
                    <Col span={8}>
                      <Col span={6} className="item-label">
                        {intl.get(`sslm.evaluationQuery.model.archive.create.time`).d('建档时间')}:
                      </Col>
                      <Col span={16}>{dateTimeRender(detailData.creationDate)}</Col>
                    </Col>
                  </Row>
                  <Row className="items-row">
                    <Col span={8}>
                      <Col span={6} className="item-label">
                        {intl
                          .get(`sslm.evaluationQuery.model.evaluation.startDate`)
                          .d('考评日期从')}
                        :
                      </Col>
                      <Col span={16}>{dateRender(detailData.evalDateFrom)}</Col>
                    </Col>
                    <Col span={8}>
                      <Col span={6} className="item-label">
                        {intl.get(`sslm.evaluationQuery.model.evaluation.endDate`).d('考评日期至')}:
                      </Col>
                      <Col span={16}>{dateRender(detailData.evalDateTo)}</Col>
                    </Col>
                    <Col span={8}>
                      <Row>
                        <Col span={6} className="item-label">
                          {intl.get(`sslm.evaluationQuery.model.exam.method`).d('考评方式')}:
                        </Col>
                        <Col span={16}>
                          {isEmpty(detailData)
                            ? ''
                            : valueMapMeaning(methodValue, detailData.kpiMethod)}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row className="items-row">
                    <Col span={24}>
                      <Col span={2} className="item-label">
                        {intl.get(`sslm.evaluationQuery.model.evaluation.rule`).d('考评规则说明')}:
                      </Col>
                      <Col span={22}>
                        <pre className="remark-context">{detailData.evalRuleRemark}</pre>
                      </Col>
                    </Col>
                  </Row>
                  <Row className="items-row">
                    <Col span={24}>
                      <Col span={2} className="item-label">
                        {intl.get(`sslm.evaluationQuery.model.evaluation.remark`).d('考评说明')}:
                      </Col>
                      <Col span={22}>
                        <pre className="remark-context">{detailData.remark}</pre>
                      </Col>
                    </Col>
                  </Row>
                </Form>
              </Panel>
            </Collapse>
            <Search {...searchProps} />
            <Table
              bordered
              dataSource={lineList}
              columns={columns}
              rowKey="evalLineId"
              pagination={detailLinePage}
              onChange={this.handleSearch}
            />
          </Spin>
        </Content>
        <ScoreDetailModal {...scoreDetailModalProps} />
      </Fragment>
    );
  }
}
