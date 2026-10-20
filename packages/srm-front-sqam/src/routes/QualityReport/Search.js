/*
 * index.js - 我发起的协议-搜索
 * @Author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @Date: 2019-05-23
 * @LastEditTime: 2019-08-22 15:27:02
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { DEFAULT_DATE_FORMAT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { isFunction } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import moment from 'moment';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const modelPrompt = 'sqam.qualityReport.model';
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/purchase-contract-view/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const { onFetchList } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList();
    }
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * cascadingEvent - 级联事件
   */
  @Bind()
  cascadingEventCompany() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTypeId', 'pcTemplateId']);
  }

  @Bind()
  cascadingEventName() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTemplateId']);
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { tenantId, expandForm } = this.state;
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${modelPrompt}.beginDate`).d('事物日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('beginDate', {
                    initialValue: moment().subtract(3, 'month'),
                  })(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('finishDate') &&
                        moment(getFieldValue('finishDate')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${modelPrompt}.finishDate`).d('事物日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('finishDate', {
                    initialValue: moment(),
                  })(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('beginDate') &&
                        moment(getFieldValue('beginDate')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`entity.supplier.name`).d('供应商名称')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov code="SODR.USER_AUTH.SUPPLIER" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(<Lov code="SPFM.USER_AUTH.COMPANY" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.ouName`).d('业务实体')}
                >
                  {getFieldDecorator('ouId')(<Lov code="HPFM.OU" queryParams={{ tenantId }} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.invOrganizationName`).d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov code="SPFM.USER_AUTH.INVORG" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.categoryName`).d('物料类别')}
                >
                  {getFieldDecorator('categoryId')(
                    <Lov
                      code="SPRM.ITEM_CATEGOR"
                      lovOptions={{ valueField: 'categoryId', displayField: 'categoryName' }}
                      queryParams={{
                        tenantId,
                        enabledFlag: 1,
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
