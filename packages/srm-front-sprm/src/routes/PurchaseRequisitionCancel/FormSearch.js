/**
 * index- 需求取消
 * @date: 2019-01-21
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, DatePicker, Button } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import {
  SEARCH_FORM_ROW_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';

// 设置sprm国际化前缀 - message
const commonPrompt = 'sprm.common.model.common';

const { Option } = Select;

// 初始化通用布局
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * 需求取消表单组件
 * @export
 * @class Search - 表单组件
 * @extends {Component} - React.Component
 * @reactProps {function} onSearch - 请求方法
 * @reactProps {object} form - 表单对象
 * @reactProps {string[]} statusList - 状态下拉框值集
 * @reactProps {string[]} sourceList - 单据来源下拉框值集
 * @returns React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sprm/purchase-single-cancel' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      tenantId: getCurrentOrganizationId(),
    };
    const { onRef } = this.props;
    if (onRef) onRef(this);
  }

  /**
   * 表单查询请求
   * @memberof Search
   */
  @Bind()
  singleCancelSearch() {
    const { onSearch, pagination } = this.props;
    onSearch({ pageSize: pagination.pageSize });
  }

  /**
   * 重置表单
   * @memberof Search
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 展开或收起表单
   * @memberof Search
   */
  @Bind()
  toggleCollapse() {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  render() {
    const { collapsed, tenantId } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue },
      form,
      sourceList = [],
      customizeFilterForm,
    } = this.props;
    return customizeFilterForm(
      {
        code: 'SPRM.PURCHASE_REQUISITION_CANCEL.LIST.WHOLE_FILTER', // 单元编码，必传
        form,
        expand: collapsed, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayPrNum')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`${commonPrompt}.title`).d('标题')}>
                  {getFieldDecorator('title')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sprm.common.model.common.prMan`).d('申请人')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('prRequestedName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: collapsed ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('prSourcePlatform')(
                    <Select allowClear>
                      {sourceList?.map(item => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.creationDateStart`).d('创建时间从')}
                  {...formItemLayout}
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
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.creationDateTo`).d('创建时间至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      showTime={{
                        defaultValue: moment('23:59:59', 'HH:mm:ss'),
                      }}
                      format={DEFAULT_DATETIME_FORMAT}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.unitName`).d('所属部门')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('unitId')(
                    <Lov code="SPRM.USER_DEPARTMENT" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ display: collapsed ? 'none' : 'inline-block' }}
                onClick={this.toggleCollapse}
              >
                {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button
                style={{ display: collapsed ? 'inline-block' : 'none' }}
                onClick={this.toggleCollapse}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginRight: 8 }}
                onClick={this.singleCancelSearch}
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
