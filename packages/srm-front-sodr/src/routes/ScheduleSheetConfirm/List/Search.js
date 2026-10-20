import React, { Component } from 'react';
import { Form, Button, Input, DatePicker, Col, Row, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import LovModal from '@/routes/components/MultipleLov';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/plan-sheet-confirm/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
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

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderForm() {
    const {
      form,
      enumMap = {},
      form: { getFieldDecorator, getFieldValue },
      customizeFilterForm,
    } = this.props;
    const { expandForm, tenantId } = this.state;
    const { planStatus = [] } = enumMap;
    return customizeFilterForm(
      {
        code: 'SODR.PLAN_SHEET_CONFIRM_SUP.QUERY_FORM',
        form,
        expand: expandForm,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.tag`).d('物料')}>
                  {getFieldDecorator('itemCodes')(
                    <LovModal code="SODR.PO_ITEM" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.itemTypeDesc`).d('物料类别')}
                >
                  {getFieldDecorator('categoryName')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.displayPoLineNum`).d('订单行号')}
                >
                  {getFieldDecorator('lineNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.poNum`).d('订单号')}
                >
                  {getFieldDecorator('poNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sodr.common.model.common.status`).d('状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('planStatus', {
                    //  initialValue: 'RELEASE',
                  })(
                    <Select allowClear>
                      {planStatus.map((n) => {
                        if (n.value !== 'MODIFY' && n.value !== 'NEW' && n.value !== 'CANCEL') {
                          return (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          );
                        }
                        return false;
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sodr.common.model.common.status`).d('状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('queryPlanStatusList', {
                    initialValue: 'RELEASE',
                  })(
                    <Select allowClear mode="multiple">
                      {planStatus.map((n) => {
                        if (n.value !== 'MODIFY' && n.value !== 'NEW' && n.value !== 'CANCEL') {
                          return (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          );
                        }
                        return false;
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.agentId`).d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.inventoryName`).d('库房')}
                >
                  {getFieldDecorator('inventoryName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.needByDateStart`).d('需求日期从')}
                >
                  {getFieldDecorator('needByDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('needByDateEnd') &&
                        moment(getFieldValue('needByDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.needByDateEnd`).d('需求日期至')}
                >
                  {getFieldDecorator('needByDateEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('needByDateStart') &&
                        moment(getFieldValue('needByDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.lastUpdateDateStart`).d('更新日期从')}
                >
                  {getFieldDecorator('lastUpdateDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('lastUpdateDateEnd') &&
                        moment(getFieldValue('lastUpdateDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.lastUpdateDateEnd`).d('更新日期至')}
                >
                  {getFieldDecorator('lastUpdateDateEnd')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('lastUpdateDateStart') &&
                        moment(getFieldValue('lastUpdateDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
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

  render() {
    return this.renderForm();
  }
}
