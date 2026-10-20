/**
 * InterfaceSearch - 接口查询
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Tabs, Button } from 'hzero-ui';
import { isEqual, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import CacheComponent from 'components/CacheComponent';
import InterfaceList from './InterfaceList';
import BatchList from './BatchList';

/**
 * tab标签页
 */
const { TabPane } = Tabs;

/**
 * 接口查询
 * @extends {Component} - React.Component
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'sitf.interfaceSearch',
    'entity.application',
    'entity.interface',
    'sitf.common',
    'scec.goodsApprove',
  ],
})
@Form.create({ fieldNameProp: null })
@withRouter
@CacheComponent({ cacheKey: '/sitf/interface-search' })
export default class InterfaceSearch extends PureComponent {
  batchListForm;

  constructor(props) {
    super(props);
    const routerParams = qs.parse(props.history.location.search.substr(1));

    this.state = {
      routerParams,
      tabKey: '0',
    };
  }

  /**
   * 组件挂载后执行
   */
  componentDidMount() {
    const { dispatch, modelName = 'interfaceSearch' } = this.props;
    const { routerParams } = this.state;
    const level = isTenantRoleLevel();
    const statisticModel = modelName === 'interfaceSearch' ? 'batchStatistic' : 'batchStatisticOrg';
    const {
      [statisticModel]: { queryData = {} },
    } = this.props;
    console.log(routerParams, level, queryData);
    if (routerParams.status !== 'batchStatus') {
      dispatch({
        type: `${statisticModel}/updateState`,
        payload: {
          queryData: {},
        },
      });
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          interfaceData: { list: [] },
          batchData: { list: [] },
        },
      });
    }
    if (level || queryData.tenant) {
      this.queryBatchList({
        ...queryData,
      });
    }
    dispatch({
      type: `${modelName}/getDataExecuteResult`,
      payload: {},
    });
  }

  /**
   * 状态改变后触发事件
   */
  componentDidUpdate(preProps) {
    const { modelName = 'interfaceSearch' } = this.props;
    const batchQueryForm = this.batchListForm.Form || {};
    const preData =
      modelName === 'interfaceSearch'
        ? preProps.batchStatistic && preProps.batchStatistic.queryData
        : preProps.batchStatisticOrg && preProps.batchStatisticOrg.queryData;
    const currentData =
      modelName === 'interfaceSearch'
        ? this.props.batchStatistic && this.props.batchStatistic.queryData
        : this.props.batchStatisticOrg && this.props.batchStatisticOrg.queryData;
    if (!isEqual(preData, currentData)) {
      batchQueryForm.resetFields();
      this.queryBatchList(currentData);
    }
    // if (!isEmpty(currentData) && isEqual(preData, currentData)) {
    //   batchQueryForm.resetFields();
    // }
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'interfaceSearch' } = this.props;
    dispatch({
      type: `${
        modelName === 'interfaceSearch' ? 'batchStatistic' : 'batchStatisticOrg'
      }/updateState`,
      payload: {
        queryData: {},
      },
    });
  }

  /**
   * 点击tab页查询接口列表和批次列表数据
   */
  @Bind()
  queryData(key) {
    const { modelName = 'interfaceSearch' } = this.props;
    const { [modelName]: interfaceSearch } = this.props;
    const { interfaceData = {}, batchData = {} } = interfaceSearch;
    const level = isTenantRoleLevel();
    this.setState({
      tabKey: key,
    });
    if (+level) {
      if (interfaceData.list && interfaceData.list.length <= 0) {
        this.queryInterfaceList();
      }
      if (batchData.list && batchData.list.length <= 0) {
        this.queryBatchList();
      }
    }
  }

  /**
   * 查询接口列表数据
   * @param {Object} queryData  查询参数
   */
  @Bind()
  queryInterfaceList(queryData = {}) {
    const { dispatch, modelName = 'interfaceSearch' } = this.props;
    const { [modelName]: interfaceSearch } = this.props;
    const { interfaceData = {} } = interfaceSearch;
    const interfaceForm = this.props.form || {};
    const interfaceValues = interfaceForm.getFieldsValue();
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        interfaceData: { list: [] },
      },
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        interfaceData: { list: [] },
      },
    });
    dispatch({
      type: `${modelName}/queryInterfaceList`,
      payload: {
        ...interfaceValues,
        page: interfaceData.pagination,
        ...queryData,
      },
    });
  }

  /**
   * 查询批次列表数据
   * @param {Object} queryData 查询参数
   */
  @Bind()
  queryBatchList(queryData) {
    const {
      dispatch,
      modelName = 'interfaceSearch',
      location: { state: { _back } = {} },
    } = this.props;
    const { [modelName]: interfaceSearch } = this.props;
    const { batchData = {} } = interfaceSearch;
    const pageParams = {};
    if (!isUndefined(_back)) {
      pageParams.page = batchData.pagination;
    }
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        batchData: { list: [] },
      },
    });
    const batchQueryForm = this.batchListForm.Form || {};
    let batchValues = batchQueryForm.getFieldsValue();
    batchValues = {
      ...batchValues,
      creationDateFrom:
        batchValues.creationDateFrom &&
        batchValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
      creationDateTo:
        batchValues.creationDateTo && batchValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT),
    };
    dispatch({
      type: `${modelName}/queryBatchList`,
      payload: {
        ...batchValues,
        ...queryData,
        page: (queryData && queryData.page) || pageParams.page,
      },
    });
  }

  /**
   * 重跑数据
   */
  @Bind()
  reRunData() {
    const { dispatch, modelName = 'interfaceSearch' } = this.props;
    const { [modelName]: interfaceSearch } = this.props;
    const { batchData = {} } = interfaceSearch;
    const batchState = this.batchListForm.state;
    const { selectedRows = [] } = batchState;
    const batchQueryForm = this.batchListForm.Form || {};
    const batchValues = batchQueryForm.getFieldsValue();
    const organizationId = getCurrentOrganizationId();
    if (batchValues.tenant || +organizationId) {
      dispatch({
        type: `${modelName}/reRunBatchList`,
        payload: {
          selectedRows,
          tenant: batchValues.tenant || organizationId,
        },
      }).then((res) => {
        if (res) {
          if (
            this.batchListForm &&
            this.batchListForm.state &&
            this.batchListForm.state.selectedRows
          ) {
            this.batchListForm.setState({
              selectedRows: [],
            });
          }
          notification.success();
          this.queryBatchList({
            page: batchData.pagination,
          });
        }
      });
    } else {
      notification.warning({
        message: intl.get('sitf.common.view.message.tenantInfo').d('请选择租户'),
      });
    }
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  getRef(ref = {}) {
    this.batchListForm = ref;
  }

  /**
   * 清空model
   */
  @Bind()
  resetModelData() {
    const { dispatch, modelName = 'interfaceSearch' } = this.props;
    const statisticModel = modelName === 'interfaceSearch' ? 'batchStatistic' : 'batchStatisticOrg';
    dispatch({
      type: `${statisticModel}/updateState`,
      payload: {
        queryData: {},
      },
    });
  }

  render() {
    const {
      modelName = 'interfaceSearch',
      queryInterfaceList,
      queryBatchList,
      reRunBatchList,
      history,
    } = this.props;
    const { routerParams } = this.state;
    const { tabKey } = this.state;
    const {
      [`${modelName === 'interfaceSearch' ? 'batchStatistic' : 'batchStatisticOrg'}`]: {
        queryData = {},
      },
    } = this.props;
    const { [modelName]: interfaceSearch } = this.props;
    const {
      interfaceData = {},
      batchData = {},
      code: { DataExecuteResult = [] },
    } = interfaceSearch;
    const interfaceListProps = {
      interfaceData,
      history,
      modelName,
      queryData,
      loading: queryInterfaceList,
      batchStatus: routerParams ? routerParams.status : '',
      queryInterfaceList: this.queryInterfaceList,
    };
    const batchListProps = {
      batchData,
      history,
      modelName,
      queryData,
      DataExecuteResult,
      batchStatus: routerParams ? routerParams.status : '',
      getRef: this.getRef,
      onResetModelData: this.resetModelData,
      loading: queryBatchList || reRunBatchList,
      queryBatchList: this.queryBatchList,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('entity.interface.search').d('接口查询')}>
          {tabKey === '0' && (
            <Button type="primary" icon="retweet" onClick={this.reRunData}>
              {intl.get('sitf.interfaceSearch.view.button.reRun').d('重新执行')}
            </Button>
          )}
        </Header>
        <Content>
          <Tabs
            tabBarStyle={{
              marginBottom: '0px',
              marginTop: '-13px',
              backgroundColor: 'rgb(255,255,255)!important',
            }}
            defaultActiveKey="0"
            activeKey={tabKey}
            onChange={this.queryData}
            animated={false}
          >
            <TabPane
              tab={intl.get('sitf.interfaceSearch.view.title.tab.batchList').d('批次列表')}
              key="0"
            >
              <BatchList {...batchListProps} />
            </TabPane>
            <TabPane
              tab={intl.get('sitf.interfaceSearch.view.title.tab.interfaceList').d('接口列表')}
              key="1"
            >
              <InterfaceList {...interfaceListProps} />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
