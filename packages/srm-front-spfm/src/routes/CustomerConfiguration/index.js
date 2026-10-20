/**
 * LedgerAccount  客户配置表
 * @date: 2020-07-17
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.1.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Debounce, Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEBOUNCE_TIME } from 'utils/constants';
import {
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  filterNullValueObject,
} from 'utils/utils';
import FilterHeader from './FilterHeader';
import TableHeader from './TableHeader';

/**
 * LedgerAccount  成本中心
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} periodOrg - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!boolean} saveLoading - 保存操作是否完成
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ customerConfiguration, loading }) => ({
  customerConfiguration,
  loading: {
    search: loading.effects['customerConfiguration/fetchList'],
    save: loading.effects['customerConfiguration/fetchSave'],
    sync: loading.effects['customerConfiguration/fetchSync'],
  },
}))
@formatterCollections({ code: ['spfm.customerConfiguration', 'smdm.common', 'hzero.common'] })
export default class PeriodOrg extends Component {
  headerForm;

  state = {
    selectedRowKeys: [],
  };

  /**
   * componentDidMount
   * render后加载页面数据
   */
  componentDidMount() {
    this.handleFecthList();
  }

  /**
   * 查询
   * @param {Object} fields - 查询参数
   * @param {?Object} fields.page - 分页查询参数
   * @param {String} [fields.periodSetName] - 会计期名称
   * @param {String} [fields.periodSetCode] - 会计期名称
   */
  @Bind()
  handleFecthList(fields = {}) {
    const { dispatch } = this.props;
    // const { content = [] } = customerConfiguration;
    const fieldValues = isUndefined(this.headerForm)
      ? {}
      : filterNullValueObject(this.headerForm.getFieldsValue());
    dispatch({
      type: 'customerConfiguration/fetchList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    }).then(() => {
      this.setState({
        selectedRowKeys: [],
      });
    });
  }

  /**
   * 获取FilterForm中form对象
   * @param {object} ref - FilterForm组件
   */
  @Bind()
  handleBindHeaderRef(ref = {}) {
    this.headerForm = (ref.props || {}).form;
  }

  /**
   * 添加hang
   */
  @Bind()
  @Debounce(DEBOUNCE_TIME)
  handleAdd() {
    const { dispatch, customerConfiguration } = this.props;
    const { content = [], pagination = {} } = customerConfiguration;
    dispatch({
      type: 'customerConfiguration/updateState',
      payload: {
        ...customerConfiguration,
        content: [
          {
            custServiceConfigId: uuidv4(),
            _status: 'create', // 新建标记
          },
          ...content,
        ],
        pagination: addItemToPagination(content.length, pagination),
      },
    });
  }

  /**
   * 保存：新增行保存、编辑行保存
   * 处于编辑状态的行才可进行保存
   */
  @Bind()
  handleSave(item) {
    const { dispatch, customerConfiguration } = this.props;
    const { content = [] } = customerConfiguration;
    let list = getEditTableData(content, ['custServiceConfigId']);
    if (Array.isArray(item) && item.length !== 0) {
      let oneList = getEditTableData(item);
      oneList = oneList.map((l) => {
        const newItem = l;
        const target = content.find((c) => c.custServiceConfigId === l.custServiceConfigId);
        if (target) {
          newItem.tenantId = target.tenantId;
        }
        return newItem;
      });
      dispatch({
        type: 'customerConfiguration/fetchSave',
        payload: oneList,
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleFecthList();
        }
      });
    } else if (Array.isArray(list) && list.length !== 0) {
      list = list.map((l) => {
        const newItem = l;
        const target = content.find((c) => c.custServiceConfigId === l.custServiceConfigId);
        if (target) {
          newItem.tenantId = target.tenantId;
        }
        return newItem;
      });
      dispatch({
        type: 'customerConfiguration/fetchSave',
        payload: list,
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleFecthList();
        }
      });
    }
  }

  /**
   * 手动同步
   */
  @Bind()
  handleSync() {
    const { selectedRowKeys } = this.state;
    this.props
      .dispatch({
        type: 'customerConfiguration/fetchSync',
        payload: selectedRowKeys,
      })
      .then((res) => {
        if (res) {
          notification.success();
          this.handleFecthList();
        }
      });
  }

  /**
   * 清除成本中心
   * @param {Object} record  操作对象
   */
  @Bind()
  handleCleanHeader(record) {
    const { dispatch, customerConfiguration } = this.props;
    const { content = [], pagination = {} } = customerConfiguration;
    const newList = content.filter(
      (item) => item.custServiceConfigId !== record.custServiceConfigId
    );
    dispatch({
      type: 'customerConfiguration/updateState',
      payload: {
        periodHeader: {
          content: newList,
          pagination: delItemToPagination(content.length, pagination),
        },
      },
    });
  }

  /**
   * 变更编辑状态
   * @param {Object} record 操作对象
   * @param {Boolean} flag 可编辑标记
   */
  @Bind()
  handleChangeEditable(record, flag) {
    const { dispatch, customerConfiguration } = this.props;
    const { content = [] } = customerConfiguration;
    const newList = content.map((item) =>
      item.custServiceConfigId === record.custServiceConfigId
        ? { ...item, _status: flag ? 'update' : '' }
        : item
    );
    dispatch({
      type: 'customerConfiguration/updateState',
      payload: {
        ...customerConfiguration,
        list: newList,
      },
    });
  }

  @Bind()
  handleEnalbed(record, flag) {
    const { customerConfiguration, dispatch } = this.props;
    const { content = [] } = customerConfiguration;
    if (flag === 'edit') {
      const newCon = content.map((item) => {
        if (item.custServiceConfigId === record.custServiceConfigId) {
          return { ...item, _status: 'update' };
        } else {
          return item;
        }
      });
      dispatch({
        type: 'customerConfiguration/updateState',
        payload: {
          ...customerConfiguration,
          content: newCon,
        },
      });
    } else if (flag === 'cancel') {
      const newCon = content.map((item) => {
        if (item.custServiceConfigId === record.custServiceConfigId) {
          const { _status: _, ...otherItem } = item;
          return otherItem;
        } else {
          return item;
        }
      });
      dispatch({
        type: 'customerConfiguration/updateState',
        payload: {
          ...customerConfiguration,
          content: newCon,
        },
      });
    } else if (flag === 'clear') {
      // record.$form?record.$form.resetFields():null;
      const newCon = content.filter(
        (item) => item.custServiceConfigId !== record.custServiceConfigId
      );
      dispatch({
        type: 'customerConfiguration/updateState',
        payload: {
          ...customerConfiguration,
          content: newCon,
        },
      });
    } else if (flag === 'save') {
      this.handleSave([record]);
    }
  }

  @Bind()
  handleUpdateState(record, val) {
    const { customerConfiguration, dispatch } = this.props;
    const { content = [] } = customerConfiguration;
    const newCon = content.map((item) => {
      if (item.custServiceConfigId === record.custServiceConfigId) {
        return { ...item, ...val };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'customerConfiguration/updateState',
      payload: {
        ...customerConfiguration,
        content: newCon,
      },
    });
  }

  @Bind()
  handleSelectRows(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, customerConfiguration = {}, loading } = this.props;
    const { selectedRowKeys } = this.state;
    const filterHeader = {
      onSearch: this.handleFecthList,
      onRef: this.handleBindHeaderRef,
    };
    const listHeader = {
      form,
      loading: loading.search,
      pagination: customerConfiguration.pagination,
      dataSource: customerConfiguration.content,
      onCleanLine: this.handleCleanHeader,
      onChangeFlag: this.handleChangeEditable,
      onSearch: this.handleFecthList,
      handleEnalbed: this.handleEnalbed,
      handleUpdateState: this.handleUpdateState,
      onSelectRows: this.handleSelectRows,
      selectedRowKeys,
    };
    return (
      <Fragment>
        <Header title={intl.get('spfm.customerConfiguration.view.message.title').d('客服配置表')}>
          <Button icon="plus" onClick={this.handleAdd} type="primary">
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" onClick={this.handleSave} loading={loading.save}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="sync"
            disabled={!selectedRowKeys.length}
            onClick={this.handleSync}
            loading={loading.sync}
          >
            {intl.get('spfm.customerConfiguration.view.button.manualSync').d('手动同步')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterHeader {...filterHeader} />
          </div>
          <TableHeader {...listHeader} />
        </Content>
      </Fragment>
    );
  }
}
