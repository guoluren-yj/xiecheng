import React, { Component } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, TreeSelect } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import {
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';

const dateFormat = getDateFormat();

/**
 * 参与流程查询表单
 * @extends {Component} - React.Component
 * @reactProps {Function} search - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hwfp/involved-task/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
    };
    props.onRef(this);
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
    const { onExpandForm } = this.props;
    if (onExpandForm) {
      onExpandForm();
    }
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
    form.setFieldsValue({
      startedAfter: undefined,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      tenantId,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      processStatus = [],
    } = this.props;
    const { expandForm } = this.state;
    const processStatusList = processStatus.map((item) => ({
      title: item.meaning,
      value: item.value,
      key: item.value,
    }));
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT} type="flex" gutter={24} align="bottom">
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hwfp.common.model.process.description').d('流程描述')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('processDescriptionLike')(<Input dbc2sbc={false} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('startedAfter', {
                initialValue: moment().subtract(1, 'years').format('YYYY-MM-DD'),
              })(
                <DatePicker
                  format={dateFormat}
                  placeholder=""
                  disabledDate={(currentDate) =>
                    getFieldValue('startedBefore') &&
                    moment(getFieldValue('startedBefore')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('startedBefore')(
                <DatePicker
                  format={dateFormat}
                  placeholder=""
                  disabledDate={(currentDate) =>
                    getFieldValue('startedAfter') &&
                    moment(getFieldValue('startedAfter')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <Form.Item>
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
            </Form.Item>
          </Col>
        </Row>
        <Row
          style={{ display: !expandForm ? 'none' : '' }}
          {...SEARCH_FORM_ROW_LAYOUT}
          type="flex"
          gutter={24}
          align="bottom"
        >
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hwfp.common.model.process.ID').d('流程标识')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('processInstanceId')(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hwfp.common.model.process.name').d('流程名称')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('processDefinitionNameLike')(<Input dbc2sbc={false} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hwfp.common.model.apply.owner').d('申请人')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('startUserName')(
                <Lov code="HWFP.EMPLOYEE" queryParams={{ tenantId, empStatus: 'ALL' }} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row
          style={{ display: !expandForm ? 'none' : '' }}
          {...SEARCH_FORM_ROW_LAYOUT}
          type="flex"
          gutter={24}
          align="bottom"
        >
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hwfp.common.model.documents.class').d('流程单据')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('documentId')(
                <Lov
                  code="HWFP.PROCESS_DOCUMENT"
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  onChange={(_, record) =>
                    setFieldsValue({ documentCode: record ? record.documentCode : '' })
                  }
                />
              )}
              {getFieldDecorator('documentCode')}
            </Form.Item>
          </Col>
          <Col span={12} style={{ paddingLeft: 6 }}>
            <Form.Item
              label={intl.get('hwfp.common.model.process.approvalStatus').d('审批状态')}
              labelCol={{
                span: 5,
              }}
              wrapperCol={{
                span: 19,
              }}
            >
              {getFieldDecorator('processStatusList')(
                <TreeSelect treeCheckable allowClear treeData={processStatusList} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row
          style={{ display: !expandForm ? 'none' : '' }}
          {...SEARCH_FORM_ROW_LAYOUT}
          type="flex"
          gutter={24}
          align="bottom"
        >
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hzero.common.date.approve.empLastApprovalTimeAfter').d('审批时间从')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('empLastApprovalTimeAfter')(
                <DatePicker
                  format={dateFormat}
                  placeholder=""
                  disabledDate={(currentDate) =>
                    getFieldValue('empLastApprovalTimeBefore') &&
                    moment(getFieldValue('empLastApprovalTimeBefore')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl
                .get('hzero.common.date.approve.empLastApprovalTimeBefore')
                .d('审批时间至')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('empLastApprovalTimeBefore')(
                <DatePicker
                  format={dateFormat}
                  placeholder=""
                  disabledDate={(currentDate) =>
                    getFieldValue('empLastApprovalTimeAfter') &&
                    moment(getFieldValue('empLastApprovalTimeAfter')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hwfp.common.view.message.handler').d('当前处理人')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('assignee')(
                <Lov code="HWFP.EMPLOYEE" queryPara={{ tenantId: getCurrentOrganizationId() }} />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
