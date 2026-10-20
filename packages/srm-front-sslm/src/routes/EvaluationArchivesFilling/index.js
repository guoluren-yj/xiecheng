/**
 * EvaluationArchivesFilling - 考评档案填制
 * @date: 2019-01-02
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import remote from 'utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { isUndefined, isEmpty } from 'lodash';
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
@withCustomize({
  unitCode: ['SSLM.ARCHIVE_FILLING_HEADER.LIST', 'SSLM.ARCHIVE_FILLING_HEADER.FILTER'],
})
@formatterCollections({
  code: ['sslm.archiveFilling', 'sslm.common'],
})
@connect(({ evaluationArchivesFilling, loading }) => ({
  evaluationArchivesFilling,
  loading: loading.effects['evaluationArchivesFilling/fetchList'],
  tenantId: getCurrentOrganizationId(),
}))
@remote(
  {
    name: 'evaluationFillingRemote',
    code: 'SSLM_EVALUATION_FILLING_LIST',
  },
  {
    events: {
      cuxJumpDetail() {}, // 二开跳转明细
    },
  }
)
export default class EvaluationArchivesFilling extends Component {
  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const {
      dispatch,
      location: { state: { _back } = {} },
      evaluationArchivesFilling: { pagination },
    } = this.props;
    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      this.handleSearch();
    }
    dispatch({ type: 'evaluationArchivesFilling/fetchLov' });
  }

  /**
   * @param {string} record.evalHeaderId - 被点击查看详细条目的Id
   */
  @Bind()
  async viewDetail(record = {}) {
    const { dispatch, evaluationFillingRemote } = this.props;
    const { evalHeaderId } = record;
    const eventProps = {
      dispatch,
      evalHeaderId,
    };
    // 默认返回true,当返回false时走二开逻辑不走标准逻辑
    const res = await evaluationFillingRemote.event.fireEvent('cuxJumpDetail', eventProps);
    if (!res) {
      return;
    }
    dispatch(
      routerRedux.push({
        pathname: `/sslm/archive-filling/detail/${evalHeaderId}`,
      })
    );
  }

  /**
   * 数据查询
   * @param {?Object} fields - 查询参数
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
      type: 'evaluationArchivesFilling/fetchList',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'CUSTOMER_OWNED',
        ...filterValues,
        customizeUnitCode: 'SSLM.ARCHIVE_FILLING_HEADER.FILTER,SSLM.ARCHIVE_FILLING_HEADER.LIST',
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
      evaluationArchivesFilling: {
        pagination,
        dataSource,
        evaluationCycle,
        evaluationDim,
        archiveStatus,
        methodValue,
      },
      customizeTable,
      customizeFilterForm,
      custLoading,
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
      customizeTable,
      loading,
      pagination,
      dataSource,
      methodValue,
      onChange: this.handleSearch,
      viewDetail: this.viewDetail,
    };
    return (
      <Fragment>
        <Header title={intl.get('sslm.common.view.title.archiveFilling').d('考评档案填制')} />
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
