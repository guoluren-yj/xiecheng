import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, DatePicker } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';

/**
 * 库存录入查找表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const FormItem = Form.Item;
const modelPrompt = 'sinv.common.model.common';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {};
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
    }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const { form, expandForm, toggleForm, customizeFilterForm } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return customizeFilterForm(
      {
        form,
        expand: expandForm,
        code: 'SINV.SUPPLIER_INVENTORY_INQUIRY.SEARCH',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.lastDateFrom`).d('最后更新时间从')}
                >
                  {getFieldDecorator('lastDateFrom')(
                    <DatePicker
                      format={getDateTimeFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('lastDateTo') &&
                        moment(getFieldValue('lastDateTo')).isBefore(currentDate, 'day')
                      }
                      showTime
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.lastDateTo`).d('最后更新时间至')}
                >
                  {getFieldDecorator('lastDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('lastDateFrom') &&
                        moment(getFieldValue('lastDateFrom')).isAfter(currentDate, 'day')
                      }
                      format={getDateTimeFormat()}
                      placeholder={null}
                      showTime
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.supplierCompanyName`).d('供应商')}
                >
                  {getFieldDecorator('supplierCompanyName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.code`).d('物料编码')}>
                  {getFieldDecorator('itemCode')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.name`).d('物料名称')}>
                  {getFieldDecorator('itemName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
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
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
