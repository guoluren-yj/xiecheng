/*
 * NonErpPurchaseRequisition - 非ERP采购申请
 * @date: 2019-01-24
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Row, Col, Button, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import {
  SEARCH_FORM_ROW_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';

const commonPrompt = 'sprm.common.model.common';
const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sprm/purchase-requisition-approval' })
export default class FilterForm extends React.PureComponent {
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
    const { onFilterChange, pagination = {} } = this.props;
    if (isFunction(onFilterChange)) {
      onFilterChange({ pageSize: pagination.pageSize });
    }
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      customizeFilterForm,
      form,
      form: { getFieldDecorator, getFieldValue },
      prSourcePlatformList,
      approvalPendingStatusList = [],
    } = this.props;
    const { expandForm, tenantId } = this.state;
    return customizeFilterForm(
      {
        code: 'SRPM.PURCHAE_REQUISITION_APPROVE.LIST.FILTER', // 单元编码，必传
        form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}
                  {...formLayout}
                >
                  {getFieldDecorator('displayPrNum', {
                    rules: [
                      {
                        max: 180,
                        message: intl
                          .get('hzero.common.validation.max', {
                            max: 180,
                          })
                          .d(`长度不能超过${`180`}个字符`),
                      },
                    ],
                  })(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item {...formLayout} label={intl.get(`${commonPrompt}.title`).d('标题')}>
                  {getFieldDecorator('title')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}
                  {...formLayout}
                >
                  {getFieldDecorator('prSourcePlatform')(
                    <Select allowClear>
                      {prSourcePlatformList?.map(item => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
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
                  label={intl.get(`sprm.common.model.common.prMan`).d('申请人')}
                  {...formLayout}
                >
                  {getFieldDecorator('prRequestedName')(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formLayout}
                  label={intl.get(`${commonPrompt}.creationDateStart`).d('创建时间从')}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      showTime={{
                        defaultValue: moment('00:00:00', 'HH:mm:ss'),
                      }}
                      format={DEFAULT_DATETIME_FORMAT}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formLayout}
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
                      format={DEFAULT_DATETIME_FORMAT}
                      placeholder={null}
                    />
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
                  label={intl.get(`hzero.common.button.status`).d('状态')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('approvalPendingStatus')(
                    <Select allowClear>
                      {(approvalPendingStatusList || [])
                        ?.filter(ele => ele.value !== 'WORKFLOW_APPROVAL')
                        .map(item => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
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
