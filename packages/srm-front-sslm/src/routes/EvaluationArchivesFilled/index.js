/**
 * EvaluationArchivesFilled - 已填制考评档案
 * @date: 2019-01-02
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { isUndefined, isEmpty } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN } from 'utils/constants';
import Search from './Search.js';
import List from './List.js';

/**
 * 考评档案填制组件
 * @extends {Component} - React.Component
 * @reactProps {Object} supplierFilled - 页面数据源
 * @reactProps {Function} [dispatch= e => e] -redux dispatch方法
 * @returns React.element
 */
@connect(({ evaluationArchivesFilled, loading }) => ({
  evaluationArchivesFilled,
  loading: loading.effects['evaluationArchivesFilled/fetchList'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sslm.common', 'sslm.supplierDocManage'],
})
@withCustomize({
  unitCode: ['SSLM.ARCHIVE_FILLED_LIST.FILTER', 'SSLM.ARCHIVE_FILLED_LIST.LIST'],
})
export default class EvaluationArchivesFilled extends Component {
  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const {
      dispatch,
      location: { state: { _back } = {} },
      evaluationArchivesFilled: { pagination },
    } = this.props;
    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      this.handleSearch();
    }
    dispatch({ type: 'evaluationArchivesFilled/fetchLov' });
  }

  /**
   * @param {string} record.docId - 被点击查看详细条目的Id
   */
  @Bind()
  viewDetail(record = {}) {
    const { dispatch } = this.props;
    const { evalHeaderId } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/archive-filled/detail/${evalHeaderId}`,
      })
    );
  }

  /**
   * 传递表单值对象
   * @param {?Object} fields - 子组件传递的表单值
   */
  @Bind()
  handleSearch(fields = {}) {
    const { tenantId, dispatch } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MIN),
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'evaluationArchivesFilled/fetchList',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'CUSTOMER_OWNED',
        ...filterValues,
        customizeUnitCode: 'SSLM.ARCHIVE_FILLED_LIST.FILTER,SSLM.ARCHIVE_FILLED_LIST.LIST',
      },
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
   * render
   * @returns React.element
   * @memberof FullFilled
   */
  render() {
    const {
      loading,
      tenantId,
      evaluationArchivesFilled: {
        pagination,
        dataSource,
        evaluationCycle,
        evaluationDim,
        archiveStatus,
        methodValue,
      },
      customizeFilterForm,
      custLoading,
      customizeTable,
    } = this.props;
    const searchProps = {
      evaluationCycle,
      evaluationDim,
      archiveStatus,
      methodValue,
      tenantId,
      customizeFilterForm,
      custLoading,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };
    const listProps = {
      loading,
      pagination,
      dataSource,
      viewDetail: this.viewDetail,
      onChange: this.handleSearch,
      methodValue,
      customizeTable,
    };
    return (
      <Fragment>
        <Header title={intl.get('sslm.common.view.title.archiveFilled').d('已填制考评档案')} />
        <Content>
          <div className="table-list-search">
            <Search {...searchProps} />
          </div>
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
