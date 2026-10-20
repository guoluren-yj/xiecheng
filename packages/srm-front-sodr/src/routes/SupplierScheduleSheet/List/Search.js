import React, { PureComponent } from 'react';
import { Form, Button, Input, DatePicker, Col, Row, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

// import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { getDateFormat } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

const modelPrompt = 'sodr.orderApproval.model.common';
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SODR.PLAN_SHEET_CREATE.FEEDBACK.QUERY_FORM'],
})
// @cacheComponent({ cacheKey: '/sodr/order-approval/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      // organizationId: getUserOrganizationId(),
    };
  }

  /**
   * 条件查询
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
      form: { getFieldDecorator, getFieldValue },
      enumMap = {},
      customizeFilterForm,
    } = this.props;
    const { planStatus = [] } = enumMap;
    const { expandForm } = this.state;
    return customizeFilterForm(
      {
        code: 'SODR.PLAN_SHEET_CREATE.FEEDBACK.QUERY_FORM',
        form,
        expand: expandForm,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.tag`).d('物料')}>
                  {getFieldDecorator('itemName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.orderMaintain.sourceFrom.categoryName`).d('物料分类')}
                >
                  {getFieldDecorator('categoryName')(<Input />)}
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
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.displayPoLineNum`).d('订单行号')}
                >
                  {getFieldDecorator('lineNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
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
                  label={intl.get(`sodr.common.model.common.status`).d('状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('planStatusList', {
                    initialValue: 'CONFIRM,PENDING,FEEDBACK'.split(','),
                  })(
                    <Select showSearch style={{ width: '100%' }} allowClear mode="multiple">
                      {planStatus.map((n) => {
                        if (n.value !== 'MODIFY' && n.value !== 'RELEASE' && n.value !== 'NEW') {
                          return (
                            <Select.Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Select.Option>
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
                <Form.Item
                  label={intl.get(`sodr.common.model.common.creationDateStarts`).d('创建日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateEnd') &&
                        moment(getFieldValue('creationDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sodr.common.model.common.creationDateEnds').d('创建日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateEnd')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateStart') &&
                        moment(getFieldValue('creationDateStart')).isAfter(currentDate, 'day')
                      }
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
