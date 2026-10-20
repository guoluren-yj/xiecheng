/**
 * ecCompanyOrderQuery -订单查询
 * @date: 2019-08-27
 * @author  <xia.li05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { connect } from 'dva';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { DATETIME_MIN } from 'utils/constants';
import { SRM_SCEC } from '_utils/config';
import FilterForm from './FilterForm';
import TableList from './TableList';

@connect(({ ecCompanyOrderQuery, loading }) => ({
  ecCompanyOrderQuery,
  loading: loading.effects['ecCompanyOrderQuery/findAllQuery'],
}))
@formatterCollections({ code: ['scec.ecCompanyOrderQuery', 'scec.common'] })
export default class EcCompanyOrderQuery extends Component {
  componentDidMount() {
    const {
      ecCompanyOrderQuery: { pagination },
    } = this.props;
    this.findAllQuery(pagination);
  }

  /**
   * 列表数据
   */
  @Bind()
  findAllQuery(page = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    fieldValues.startDate = fieldValues.startDate ? fieldValues.startDate.format(DATETIME_MIN) : '';
    fieldValues.endDate = fieldValues.endDate ? fieldValues.endDate.format(DATETIME_MIN) : '';
    dispatch({
      type: 'ecCompanyOrderQuery/findAllQuery',
      payload: {
        page,
        ...fieldValues,
      },
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      ecCompanyOrderQuery: { dataSource, pagination },
      loading,
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    fieldValues.startDate = fieldValues.startDate ? fieldValues.startDate.format(DATETIME_MIN) : '';
    fieldValues.endDate = fieldValues.endDate ? fieldValues.endDate.format(DATETIME_MIN) : '';
    return (
      <React.Fragment>
        <Header title={intl.get(`scec.ecCompanyOrderQuery.model.orderSearch`).d('订单查询')}>
          <ExcelExport
            requestUrl={`${SRM_SCEC}/v1/mall-order/export`}
            queryParams={fieldValues}
            otherButtonProps={{ icon: 'export', type: 'primary' }}
          />
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm onRef={this.handleBindRef} onSearch={this.findAllQuery} />
          </div>
          <TableList
            dataSource={dataSource}
            onChange={this.findAllQuery}
            pagination={pagination}
            loading={loading}
          />
        </Content>
      </React.Fragment>
    );
  }
}
