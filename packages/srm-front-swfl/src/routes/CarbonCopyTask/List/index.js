/**
 * List - 抄送流程
 * @date: 2018-8-14
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import moment from 'moment';

import { Header } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import styles from './index.less';

/**
 * 抄送流程组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} carbonCopyTask - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['hwfp.carbonCopyTask', 'hwfp.common', 'hpfm.organization', 'hwfp.monitor'],
})
@connect(({ carbonCopyTask, loading }) => ({
  carbonCopyTask,
  fetchList: loading.effects['carbonCopyTask/fetchTaskList'],
  tenantId: getCurrentOrganizationId(),
}))
export default class List extends Component {
  constructor(props) {
    super(props);
    this.form = null;
    this.tableRef = null;
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      carbonCopyTask: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch({ carbonCopy: true, page });
    this.props.dispatch({ type: 'carbonCopyTask/queryProcessStatus' });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleBindTableRef(ref = {}) {
    this.tableRef = ref;
  }

  @Bind()
  handleExpandForm() {
    if (this.tableRef) {
      this.tableRef.handler();
    }
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());

    const {
      finishedAfter,
      finishedBefore,
      startedAfter,
      startedBefore,
      processInstanceId,
      processDefinitionNameLike,
      startUserName,
      readFlag,
      ...others
    } = filterValues;
    dispatch({
      type: 'carbonCopyTask/fetchTaskList',
      payload: {
        tenantId,
        finishedAfter: finishedAfter ? moment(finishedAfter).format(DATETIME_MIN) : null,
        finishedBefore: finishedBefore ? moment(finishedBefore).format(DATETIME_MAX) : null,
        startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
        startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
        startUserName,
        processDefinitionNameLike,
        processInstanceId,
        carbonCopy: true,
        readFlag,
        page: isEmpty(fields) ? {} : fields,
        oldTotalElements: fields.total ? fields.total : '',
        ...others,
      },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      tenantId,
      fetchList,
      carbonCopyTask: { list, pagination, processStatus = [] },
    } = this.props;
    const filterProps = {
      tenantId,
      processStatus,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      onExpandForm: this.handleExpandForm,
    };
    const listProps = {
      pagination,
      processStatus,
      dataSource: list,
      loading: fetchList,
      onChange: this.handleSearch,
      onRef: this.handleBindTableRef,
    };
    return (
      <>
        <Header title={intl.get('hwfp.carbonCopyTask.view.message.title').d('我的抄送流程')}>
          {/* <Button
            icon="sync"
            onClick={() => {
              this.handleSearch();
            }}
          >
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button> */}
        </Header>
        <div className={styles.content}>
          <FilterForm {...filterProps} />
          <div className={styles.list}>
            <ListTable {...listProps} />
          </div>
        </div>
      </>
    );
  }
}
