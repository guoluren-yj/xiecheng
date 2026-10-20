import React, { PureComponent } from 'react';
import { Form, Input, Select, Row, Col, Button, DatePicker } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import { SEARCH_FORM_ROW_LAYOUT, SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';

const { Option } = Select;
const commonPrompt = 'sprm.common.model.common';
const modelPrompt = 'sprm.purchaseRequisitionInquiry.model.common';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sprm/purchase-requisition-inquiry-single' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form, pagination } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch({ pageSize: pagination.pageSize });
        }
      });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  render() {
    const {
      form,
      problemSource,
      closeStatus,
      cancelStatus,
      prStatus,
      flag = [],
      customizeFilterForm,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { expandForm, tenantId } = this.state;
    return customizeFilterForm(
      {
        code: 'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE_QUERY.FILTER', // 单元编码，必传
        form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}
                >
                  {getFieldDecorator('displayPrNum')(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`${commonPrompt}.title`).d('标题')}>
                  {getFieldDecorator('title')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get('entity.roles.creator').d('创建人')}>
                  {getFieldDecorator('creatorName')(<Input trim />)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
                  {getFieldDecorator('prStatusCode')(
                    <Select allowClear>
                      {prStatus
                        ?.filter(
                          n =>
                            ![
                              'CANCELLED',
                              'CLOSED',
                              'SUSPEND',
                              'ASSIGNED',
                              'EXCUTED',
                              'CLOSEDING',
                            ].includes(n.value)
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
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}
                >
                  {getFieldDecorator('prSourcePlatform')(
                    <Select allowClear>
                      {problemSource?.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.creationDateStart`).d('创建时间从')}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      showTime={{
                        defaultValue: moment('00:00:00', 'HH:mm:ss'),
                      }}
                      format={getDateTimeFormat()}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.creationDateTo`).d('创建时间至')}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      showTime={{
                        defaultValue: moment('23:59:59', 'HH:mm:ss'),
                      }}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                      format={getDateTimeFormat()}
                      placeholder={null}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.closedStatus`).d('关闭状态')}
                >
                  {getFieldDecorator('closeStatusCode')(
                    <Select allowClear>
                      {closeStatus?.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.cancelledStatus`).d('取消状态')}
                >
                  {getFieldDecorator('cancelStatusCode')(
                    <Select allowClear>
                      {cancelStatus?.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.unitName`).d('所属部门')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('unitId')(
                    <Lov
                      code="SPRM.USER_DEPARTMENT"
                      queryParams={{ tenantId }}
                      textField="unitName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`)
                    .d('是否加急')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('urgentFlag')(
                    <Select allowClear>
                      {flag?.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.company.tag`).d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov code="SPFM.USER_AUTHORITY_COMPANY" textField="companyName" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('entity.organization.class.purchase').d('采购组织')}
                >
                  {getFieldDecorator('purchaseOrgId')(
                    <Lov
                      code="HPFM.PURCHASE_ORGANIZATION"
                      queryParams={{ tenantId }}
                      textField="organizationName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentId')(
                    <Lov
                      code="SPRM.PURCHASE_AGENT"
                      queryParams={{ tenantId }}
                      textField="purchaseAgentName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${commonPrompt}.sqType`).d('申请类型')}
                >
                  {getFieldDecorator('prTypeId')(
                    <Lov
                      code="SPUC.PR_DEMAND_TYPE"
                      queryParams={{ tenantId }}
                      textField="prTypeName"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
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
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
