/**
 * Search - 采购申请汇总查询页面 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Select, Row, Col, DatePicker } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import {
  SEARCH_FORM_ROW_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  DEFAULT_DATE_FORMAT,
} from 'utils/constants';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;
// Option组件初始化
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const commonPrompt = 'sprm.common.model.common';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sprm/purchase-requisition-creation/list' })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const { onFetchList, pagination } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList({ pageSize: pagination.pageSize });
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
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields },
      onReset,
    } = this.props;
    resetFields();
    onReset();
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      enumMap = {},
      form,
      customizeFilterForm,
    } = this.props;
    const { expandForm, tenantId } = this.state;
    const { status = [], source = [] } = enumMap;
    //
    return customizeFilterForm(
      {
        code: 'SPRM.PURCHASE_REQUISITION_CREATION.LIST.FILTER', // 单元编码，必传
        form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}
                >
                  {getFieldDecorator('displayPrNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`${commonPrompt}.title`).d('标题')}>
                  {getFieldDecorator('title')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
                  {getFieldDecorator('prStatusCode')(
                    <Select allowClear>
                      {status
                        ?.filter(item => ['PENDING', 'REJECTED', 'SEND_BACK'].includes(item.value))
                        .map(n => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}
                >
                  {getFieldDecorator('prSourcePlatform')(
                    <Select allowClear>
                      {source
                        ?.filter(item =>
                          ['CATALOGUE', 'SRM', 'E-COMMERCE', 'SHOP'].includes(item.value)
                        )
                        .map(n => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
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
                  label={intl.get(`${commonPrompt}.companyName`).d('公司')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      queryParams={{ tenantId }}
                      textField="companyName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`entity.business.tag`).d('业务实体')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('ouId')(
                    <Lov code="SPFM.USER_AUTH.OU" queryParams={{ tenantId }} textField="ouName" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
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
                  label={intl.get(`sprm.common.model.common.prRequestedName`).d('申请人')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prRequestedName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`entity.organization.class.requestDateStart`).d('申请日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('requestDateStart')(
                    <DatePicker
                      placeholder={null}
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={currentDate =>
                        getFieldValue('requestDateEnd') &&
                        moment(getFieldValue('requestDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`entity.organization.class.requestDateEnd`).d('申请日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('requestDateEnd')(
                    <DatePicker
                      placeholder={null}
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={currentDate =>
                        getFieldValue('requestDateStart') &&
                        moment(getFieldValue('requestDateStart')).isAfter(currentDate, 'day')
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
              <Button onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
