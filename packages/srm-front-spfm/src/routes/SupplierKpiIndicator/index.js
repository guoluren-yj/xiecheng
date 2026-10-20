/**
 * index - 送货单创建
 * @date: 2018-12-05
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { isEmpty, uniqBy } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import Search from './Search';
import List from './List';
import Detail from './Detail';
import Formula from './Formula';

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [supplierKpiIndicator={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {boolean} [batchSubmitDeliveryLoading=false] - 批量提交送货单处理中
 * @reactProps {boolean} [queryOperationRecordLoading=false] - 查询操作记录处理中
 * @reactProps {boolean} [batchDeleteDeliveryLoading=false] - 批量删除处理中
 * @reactProps {boolean} [batchCreateDeliveryLoading=false] - 批量创建处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建数据处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护送货单处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading = {}, supplierKpiIndicator = {} }) => ({
  createIndicatorLoading: loading.effects['supplierKpiIndicator/createIndicator'],
  updateIndicatorLoading: loading.effects['supplierKpiIndicator/updateIndicator'],
  saveIndicatorFmlsLoading: loading.effects['supplierKpiIndicator/saveIndicatorFmls'],
  queryFormulaListLoading: loading.effects['supplierKpiIndicator/queryFormulaList'],
  queryListLoading: loading.effects['supplierKpiIndicator/queryList'],
  queryListTreeLoading: loading.effects['supplierKpiIndicator/queryListTree'],
  supplierKpiIndicator,
}))
@formatterCollections({
  code: ['spfm.supplierKpiIndicator', 'spfm.common', 'entity.company', 'sslm.common'],
})
export default class SupplierKpiIndicator extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      detailDrawerVisible: false,
      currentActionRowData: {},
      detailDrawerStatus: null,
      formulaDrawerVisible: false,
      dataSource: [],
      // pagination: {},
      currentEnabledOrDisabledRowkey: [],
    };

    // 方法注册
    [
      'fetchList',
      'onTableChange',
      'addParentIndicator',
      'closeDetail',
      'addChildIndicator',
      'openIndicatorDetail',
      'openFormula',
      'closeFormula',
      'fetchScoreTypeCode',
      'fetchFormulaList',
      'enableIndicator',
      'createIndicator',
      'updateIndicator',
      'saveIndicatorFmls',
      'onTableExpand',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.fetchScoreTypeCode();
    this.fetchList();
    this.selectType();
  }

  /**
   * fetchList - 查询行数据
   * @param {object} params - 查询条件
   */
  fetchList(params = {}) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicator/queryListTree',
      params,
    }).then((res) => {
      if (res) {
        const { dataSource } = res;
        const flatKeys = [];
        const getFlatKeys = (collections = []) => {
          collections.forEach((n) => {
            flatKeys.push(n.indicatorId);
            if (!isEmpty(n.children)) {
              getFlatKeys(n.children);
            }
          });
        };
        if (!isEmpty(params.indicatorCode) || !isEmpty(params.indicatorName)) {
          getFlatKeys(dataSource);
        }
        this.setState({
          dataSource,
          // pagination,
          flatKeys,
        });
      }
    });
  }

  /**
   * fetchFlagCode - 查询是否值集
   */
  fetchScoreTypeCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicator/queryCode',
      payload: { lovCode: 'SPFM.KPI_SCORE_TYPE' },
    });
  }

  /**
   * enableIndicator - 是否启用禁用指标
   * @param {object} record - 行数据
   */
  enableIndicator(record) {
    const { dispatch } = this.props;
    const { currentEnabledOrDisabledRowkey, pagination = {} } = this.state;
    const { getFieldsValue = () => {} } = (this.search || {}).props;
    this.setState({
      currentEnabledOrDisabledRowkey: currentEnabledOrDisabledRowkey.concat(record.indicatorId),
    });
    return dispatch({
      type: 'supplierKpiIndicator/indicatorsEnable',
      enabled: record.enabledFlag === 1,
      data: record,
    }).then((res) => {
      this.setState({
        currentEnabledOrDisabledRowkey: currentEnabledOrDisabledRowkey.filter(
          (o) => o.indicatorId !== record.indicatorId
        ),
      });
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else {
        this.fetchList({ ...getFieldsValue(), page: pagination });
        notification.success();
      }
    });
  }

  /**
   * fetchFormulaList - 查询公式配置数据
   * @param {object} params - 查询条件
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  fetchFormulaList(params, cb = (e) => e) {
    const { dispatch } = this.props;
    const { currentActionRowData = {} } = this.state;
    const { indicatorId } = currentActionRowData;
    return dispatch({
      type: 'supplierKpiIndicator/queryFormulaList',
      indicatorId,
      params,
    }).then((res) => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * createIndicator - 创建指标
   * @param {object} data - 指标数据
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  createIndicator(data, cb) {
    const { dispatch } = this.props;
    const { getFieldsValue = () => {} } = (this.search || {}).props;
    return dispatch({
      type: 'supplierKpiIndicator/createIndicator',
      data,
    }).then((res) => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        this.fetchList(getFieldsValue());
        notification.success();
      }
    });
  }

  /**
   * createIndicator - 更新指标
   * @param {object} data - 指标数据
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  updateIndicator(data, cb) {
    const { dispatch } = this.props;
    const { getFieldsValue = () => {} } = (this.search || {}).props;
    return dispatch({
      type: 'supplierKpiIndicator/updateIndicator',
      data,
    }).then((res) => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        this.fetchList(getFieldsValue());
        notification.success();
      }
    });
  }

  /**
   * 指标类型值集查询
   */
  @Bind()
  selectType() {
    const { dispatch } = this.props;
    const lovCodes = {
      indicatorTypeMeaning: 'SSLM.KPI_INDICATOR_TYPE',
      tenantId: getCurrentOrganizationId(),
    };
    dispatch({
      type: 'supplierKpiIndicator/batchCode',
      payload: lovCodes,
    });
  }

  /**
   * saveIndicatorFmls - 保存指标公式
   * @param {number} indicatorId - 指标编码
   * @param {object} data - 指标数据
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  saveIndicatorFmls(indicatorId, data, cb) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicator/saveIndicatorFmls',
      indicatorId,
      data,
    }).then((res) => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        notification.success();
      }
    });
  }

  /**
   * onTableChange - 列表分页变化
   * @param {object} page - 分页参数
   */
  onTableChange(page) {
    const { getFieldsValue = () => {} } = (this.search || {}).props;
    this.fetchList({ page, ...getFieldsValue() });
  }

  /**
   * addParentIndicator - 添加顶级指标
   */
  addParentIndicator() {
    this.setState({
      detailDrawerVisible: true,
      detailDrawerStatus: 'addParentIndicator',
    });
  }

  /**
   * closeDetail - 关闭详情
   */
  closeDetail() {
    this.setState({
      detailDrawerVisible: false,
      currentActionRowData: {},
      detailDrawerStatus: null,
    });
  }

  /**
   * addChildIndicator - 添加下级指标
   * @param {object} currentActionRowData - 当前操作行
   */
  addChildIndicator(currentActionRowData = {}) {
    const { indicatorId, indicatorName } = currentActionRowData;
    this.setState({
      detailDrawerVisible: true,
      currentActionRowData: { parentIndicatorId: indicatorId, parentIndicatorName: indicatorName },
      detailDrawerStatus: 'addChildIndicator',
    });
  }

  /**
   * openIndicatorDetail - 打开指标详情页
   * @param {object} currentActionRowData - 当前操作行
   */
  openIndicatorDetail(currentActionRowData) {
    this.setState({
      detailDrawerVisible: true,
      currentActionRowData,
      detailDrawerStatus: 'edit',
    });
  }

  /**
   * closeFormula - 关闭公式抽屉
   */
  closeFormula() {
    this.setState({
      formulaDrawerVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * openFormula - 打开公式抽屉
   * @param {object} currentActionRowData - 当前操作行
   */
  openFormula(currentActionRowData) {
    this.setState({
      formulaDrawerVisible: true,
      currentActionRowData,
    });
  }

  /**
   * onTableExpand - 表格行展开
   * @param {object} currentActionRowData - 当前操作行
   */
  onTableExpand(expanded, record) {
    const { flatKeys = [] } = this.state;
    this.setState({
      flatKeys: expanded
        ? uniqBy(flatKeys.concat(record.indicatorId))
        : flatKeys.filter((o) => o !== record.indicatorId),
    });
  }

  render() {
    const {
      queryFormulaListLoading,
      queryListTreeLoading,
      saveIndicatorFmlsLoading,
      createIndicatorLoading,
      updateIndicatorLoading,
      supplierKpiIndicator = {},
    } = this.props;
    const {
      dataSource = [],
      detailDrawerVisible,
      currentActionRowData,
      detailDrawerStatus,
      formulaDrawerVisible,
      currentEnabledOrDisabledRowkey,
      flatKeys = [],
    } = this.state;
    const { code = {}, indicatorTypeCode = [] } = supplierKpiIndicator;

    const searchProps = {
      wrappedComponentRef: (node) => {
        this.search = node;
      },
      fetchList: this.fetchList,
    };

    const listProps = {
      ref: (node) => {
        this.list = node;
      },
      loading: queryListTreeLoading,
      onChange: this.onTableChange,
      pagination: false,
      dataSource,
      addChildIndicator: this.addChildIndicator,
      openIndicatorDetail: this.openIndicatorDetail,
      formulaConfig: this.openFormula,
      actionRowKey: currentEnabledOrDisabledRowkey,
      enable: this.enableIndicator,
      expandedRowKeys: flatKeys,
      onExpand: this.onTableExpand,
    };

    const detailProps = {
      indicatorTypeCode,
      visible: detailDrawerVisible,
      close: this.closeDetail,
      dataSource: currentActionRowData,
      status: detailDrawerStatus,
      scoreTypeCode: code['SPFM.KPI_SCORE_TYPE'],
      createIndicator: this.createIndicator,
      updateIndicator: this.updateIndicator,
      processing: {
        update: updateIndicatorLoading,
        create: createIndicatorLoading,
      },
    };

    const formulaProps = {
      visible: formulaDrawerVisible,
      close: this.closeFormula,
      fetchFormulaList: this.fetchFormulaList,
      indicatorRowDataSource: currentActionRowData,
      processing: { queryFormulaListLoading, saveIndicatorFmlsLoading },
      saveIndicatorFmls: this.saveIndicatorFmls,
    };

    return (
      <Fragment>
        <Header
          title={intl
            .get(`spfm.supplierKpiIndicator.view.title.supplierKpiIndicator`)
            .d('标准指标定义')}
        >
          <Button icon="plus" type="primary" onClick={this.addParentIndicator}>
            {intl.get(`spfm.supplierKpiIndicator.view.button.addParentNode`).d('新增顶级指标')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        <Detail {...detailProps} />
        <Formula {...formulaProps} />
      </Fragment>
    );
  }
}
