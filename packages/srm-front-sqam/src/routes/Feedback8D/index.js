/**
 * 8D 反馈
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getUserOrganizationId,
} from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 8D 反馈入口
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} feedback8D - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@withCustomize({
  unitCode: ['SQAM.FEEDBACK_8D_LIST.FILTER_FORM'],
})
@formatterCollections({
  code: [
    'sqam.common',
    'entity.supplier',
    'entity.item',
    'entity.roles',
    'entity.company',
    'entity.organization',
    'entity.customer',
  ],
})
@connect(({ feedback8D, loading }) => ({
  feedback8D,
  loading: loading.effects['feedback8D/fetch8D'],
  tenantId: getCurrentOrganizationId(),
}))
export default class Feedback8D extends PureComponent {
  form;

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    const {
      dispatch,
      feedback8D: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    this.handleSearch(isUndefined(_back) ? {} : pagination);
    dispatch({ type: 'feedback8D/fetchLov' });
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
   * 页面查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}, sort = {}) {
    const { dispatch, tenantId } = this.props;
    // 此处应该对查询参数中的数据做转换(eg: 表示时间的字段)
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const { itemCodeParam, itemCode, ...others } = formValue;
      const values = {
        ...others,
        itemCode: itemCodeParam || itemCode, // 已存在itemCode值集查询，使用itemCodeParam
        icaDemandDateAfter:
          formValue.icaDemandDateAfter &&
          formValue.icaDemandDateAfter.format(DEFAULT_DATETIME_FORMAT),
        icaDemandDateBefore:
          formValue.icaDemandDateBefore &&
          formValue.icaDemandDateBefore.format(DEFAULT_DATETIME_FORMAT),
        pcaDemandDateAfter:
          formValue.pcaDemandDateAfter && formValue.pcaDemandDateAfter.format(DATETIME_MIN),
        pcaDemandDateBefore:
          formValue.pcaDemandDateBefore && formValue.pcaDemandDateBefore.format(DATETIME_MAX),
        problemStatusCodeParamList: formValue?.problemStatus,
      };
      filterValues = filterNullValueObject(values);
    }
    if (filterValues?.problemStatus) {
      delete filterValues?.problemStatus;
    }
    // columns用的是meaning字段，需要，重新修改field
    // eslint-disable-next-line no-param-reassign
    if (sort?.field === 'problemUrgencyCodeMeaning') sort.field = 'problemUrgencyCode';
    const order = sort?.order?.indexOf('descend') > -1 ? 'desc' : 'asc';
    dispatch({
      type: 'feedback8D/fetch8D',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'SUPPLIER_FEEDBACK',
        supplierTenantId: getUserOrganizationId(),
        // 直接传sort后端报参数有误，需重新拼接字段
        urgencyOrderSeq: sort?.field && sort?.order ? `${sort?.field},${order}` : undefined,
        ...filterValues,
      },
    });
  }

  /**
   * 明细维护
   * @param {!object} record - 8D对象
   */
  @Bind()
  handleEdit8D(record = {}) {
    const { dispatch } = this.props;
    // 区分 8D status => ICA or PCA
    // ICA: 已发布[PUBLISHED]/ICA审批拒绝[ICA_REJECTED]
    dispatch(
      routerRedux.push({
        pathname: `/sqam/feedback8D/detail/${record.problemHeaderId}`,
      })
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      tenantId,
      customizeFilterForm,
      feedback8D: {
        list = [],
        pagination = {},
        status = [],
        significance = [],
        urgency = [],
        rectifyTypeCode = [],
        issueType = [],
      },
    } = this.props;
    const filterProps = {
      status,
      significance,
      urgency,
      rectifyTypeCode,
      issueType,
      tenantId,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      customizeFilterForm,
    };
    const listProps = {
      loading,
      pagination,
      status,
      dataSource: list,
      onChange: this.handleSearch,
      onDetail: this.handleEdit8D,
    };

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sqam.common.view.message.title.qualityRectification.feedBack')
            .d('质量整改报告反馈')}
        />
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
