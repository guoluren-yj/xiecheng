/**
 * PlanUpdate - 寻源计划维护
 * @date: 2019-04-16
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Button, Popover } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { isUndefined, compose, noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentUserId, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import QueryForm from './QueryForm';

const promptCode = 'ssrc.tenderPlan.model.tenderPlan';

class PlanUpdate extends PureComponent {
  componentDidMount() {
    const {
      tenderPlan: { planUpdatePagination = {} },
    } = this.props;
    const page = planUpdatePagination;
    this.queryPlanUpdate(page);
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  queryPlanUpdate(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const searchData = {
      ...filterValues,
    };
    dispatch({
      type: 'tenderPlan/queryPlanUpdate',
      payload: {
        customizeUnitCode: 'SSRC.PLAN_UPDATE_LIST.LIST.LIST,SSRC.PLAN_UPDATE_LIST.LIST.FILTER',
        page: pageData,
        ...searchData,
      },
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryPlan(queryData = {}) {
    this.queryPlanUpdate(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.queryPlanUpdate(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  linkDetail(bidPlanId) {
    const { history } = this.props;
    history.push(`/ssrc/plan-update/detail/${bidPlanId}`);
  }

  /**
   * 点击新建按钮事件
   */
  @Bind()
  handlePlanCreate() {
    const { history } = this.props;
    history.push('/ssrc/plan-update/create');
  }

  render() {
    const {
      customizeTable,
      loading,
      tenderPlan: { planUpdateList = {}, planUpdatePagination = {} },
      remote: remoteFunc,
      customizeFilterForm = noop,
    } = this.props;
    const formProps = {
      onQueryPlan: this.onQueryPlan,
      onRef: this.handleBindRef,
      remoteFunc,
      customizeFilterForm,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.bidPlanName`).d('整体寻源计划名称'),
        dataIndex: 'bidPlanName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.projectNum`).d('项目编码'),
        dataIndex: 'projectNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.projectName`).d('项目名称'),
        dataIndex: 'projectName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 160,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.year`).d('年度'),
        dataIndex: 'year',
        width: 100,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        dataIndex: 'action',
        render: (_, record) => {
          const { bidPlanId } = record;
          return (
            <a onClick={() => this.linkDetail(bidPlanId)}>
              {intl.get('ssrc.tenderPlan.view.message.button.maintain').d('维护')}
            </a>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('ssrc.tenderPlan.view.message.title.tenderPlanUpdate').d('寻源计划维护')}
        >
          <React.Fragment>
            <Button type="primary" icon="plus" onClick={this.handlePlanCreate}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </React.Fragment>
        </Header>
        <Content>
          <QueryForm {...formProps} />
          {customizeTable(
            {
              code: 'SSRC.PLAN_UPDATE_LIST.LIST.LIST',
            },
            <Table
              bordered
              loading={loading}
              rowKey="bidPlanId"
              columns={columns}
              dataSource={planUpdateList}
              pagination={planUpdatePagination}
              onChange={this.handleStandardTableChange}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return compose(
    formatterCollections({
      code: ['ssrc.tenderPlan', 'ssrc.common'],
    }),
    withCustomize({
      unitCode: ['SSRC.PLAN_UPDATE_LIST.LIST.LIST', 'SSRC.PLAN_UPDATE_LIST.LIST.FILTER'],
    }),
    connect(({ tenderPlan, loading }) => ({
      tenderPlan,
      organizationId: getCurrentOrganizationId(),
      getCurrentUserId: getCurrentUserId(),
      loading: loading.effects['tenderPlan/queryPlanUpdate'],
    })),
    remote({
      code: 'SSRC_TENDER_PLAN_UPDATE_LIST',
      name: 'remote',
    })
  )(Comp);
};

export default HOCComponent(PlanUpdate);
