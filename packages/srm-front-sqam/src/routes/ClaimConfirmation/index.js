/**
 * 索赔单确认
 * @date: 2019-11-4
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import moment from 'moment';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import { Form, Input, Button, Row, Col, Spin, Select } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
  DATETIME_MIN,
  DETAIL_DEFAULT_CLASSNAME,
} from 'utils/constants';
import { filterNullValueObject, getCurrentUser, getCurrentOrganizationId } from 'utils/utils';

import ListTable from './ListTable';

const customizeUnitCodes = [
  'SQAM.CLAIM_CONFIRMATION_LIST.FILTER',
  'SQAM.CLAIM_CONFIRMATION_LIST.GRID',
].join();

@Form.create({ fieldNameProp: null })
@connect(({ claimOrder, loading }) => ({
  claimOrder,
  indexLoading: loading.effects['claimOrder/ConfirmFetchDataList'],
  tenantId: getCurrentOrganizationId(),
  supplierTenantId: getCurrentUser().organizationId,
})) 
@formatterCollections({
  code: ['sqam.common', 'hzero.common', 'entity.company', 'hzero.common', 'entity.roles'],
})
@withCustomize({
  unitCode: ['SQAM.CLAIM_CONFIRMATION_LIST.FILTER'],
})
@cacheComponent({ cacheKey: '/sqam/claimConfirmation/list' })
export default class ClaimConfirmation extends PureComponent {
  form;

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */

  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({
      type: 'claimOrder/queryValueCode',
      payload: {
        statusValue: 'SQAM.CLAIM_STATUS_CODE',
      },
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'claimOrder/updateState',
      payload: {
        IndexListDatas: [],
        pagination:{},
      },
    });
  }

  /**
   * 页面查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, supplierTenantId, form = {}, tenantId } = this.props;
    let filterValues = {};
    const dealTime = {};
    const formValue = form.getFieldsValue();
    filterValues = filterNullValueObject(formValue);
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    timeArray.forEach(item => {
      dealTime[item] = filterValues[item]
        ? moment(filterValues[item]).format(DATETIME_MIN)
        : undefined;
    });
    dispatch({
      type: 'claimOrder/ConfirmFetchDataList',
      payload: {
        supplierTenantId,
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        ...dealTime,
        customizeUnitCode: customizeUnitCodes,
      },
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }
  /**
   * 明细维护
   * @param {!object}
   */

  @Bind()
  handleDirectorToDetail(record = {}) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/claimConfirmation/detail/${record.formHeaderId}`,
      })
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form = {}, claimOrder, indexLoading, customizeFilterForm } = this.props;
    const { IndexListDatas, pagination, code = {} } = claimOrder;
    const { statusValue = [] } = code;
    const { getFieldDecorator } = form;
    const listPorps = {
      onDetail: this.handleDirectorToDetail,
      dataSource: IndexListDatas,
      pagination,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sqam.common.view.message.title.8d.claimConfirm').d('索赔单确认')}
        />
        <Content>
          <Spin spinning={indexLoading} wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}>
            {customizeFilterForm(
              {
                code: 'SQAM.CLAIM_CONFIRMATION_LIST.FILTER',
                form,
              },
              <Form layout="inline" className="more-fields-search-form">
                <Row gutter={12}>
                  <Col span={18}>
                    <Row {...SEARCH_FORM_ROW_LAYOUT}>
                      <Col {...FORM_COL_4_LAYOUT}>
                        <Form.Item
                          {...SEARCH_FORM_ITEM_LAYOUT}
                          label={intl.get(`hzero.common.status`).d('状态')}
                        >
                          {getFieldDecorator(
                            'statusCode',
                            {}
                          )(
                            <Select allowClear>
                              {statusValue
                                .filter(item =>
                                  ['APPROVED', 'COMMUTED', 'REBUTTED'].includes(item.value)
                                )
                                .map(item => (
                                  <Select.Option key={item.value} value={item.value}>
                                    {item.meaning}
                                  </Select.Option>
                                ))}
                            </Select>
                          )}
                        </Form.Item>
                      </Col>
                      <Col {...FORM_COL_4_LAYOUT}>
                        <Form.Item
                          label={intl.get(`sqam.common.model.claimNum`).d('索赔单号')}
                          {...SEARCH_FORM_ITEM_LAYOUT}
                        >
                          {getFieldDecorator(
                            'formNum',
                            {}
                          )(<Input trim typeCase="upper" inputChinese={false} />)}
                        </Form.Item>
                      </Col>
                      <Col {...FORM_COL_4_LAYOUT}>
                        <Form.Item
                          label={intl.get('sqam.common.model.customCompany').d('客户公司')}
                          {...SEARCH_FORM_ITEM_LAYOUT}
                        >
                          {getFieldDecorator(
                            'companyId',
                            {}
                          )(<Lov code="SQAM.TENANT.CUSTOMER_COMPANIES" textField="companyName" />)}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={6} className="search-btn-more">
                    <Form.Item>
                      <Button data-code="reset" onClick={this.handleFormReset}>
                        {intl.get('hzero.common.button.reset').d('重置')}
                      </Button>
                      <Button
                        data-code="search"
                        type="primary"
                        htmlType="submit"
                        onClick={this.handleSearch}
                      >
                        {intl.get('hzero.common.button.search').d('查询')}
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
            <ListTable {...listPorps} />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
