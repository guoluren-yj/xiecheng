import React, { Component } from 'react';
import { Form, Input, Row, Col, Button, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import {
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const { Option } = Select;

@Form.create({ fieldNameProp: null })
export default class Search extends Component {
  constructor(props) {
    super(props);
    props.handleRef(this);
  }

  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  @Bind()
  handleSearch() {
    this.props.onSearch();
  }

  render() {
    const {
      tabKey,
      form: { getFieldDecorator },
    } = this.props;
    const tenantId = getCurrentOrganizationId();
    const isApproverTabForm = tabKey === 'approver';
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT} type="flex" gutter={24}>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={
                isApproverTabForm
                  ? intl.get('hwfp.common.view.message.handler').d('当前处理人')
                  : intl.get('hwfp.common.view.message.applicant').d('流程申请人')
              }
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator(isApproverTabForm ? 'assignee' : 'initiator')(
                <Lov
                  code="HWFP.EMPLOYEE"
                  queryParams={{ tenantId, empStatus: 'ALL' }}
                  lovOptions={{
                    displayField: 'name',
                  }}
                  onChange={this.handleSelect}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hwfp.common.model.process.name').d('流程名称')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('processName')(<Input dbc2sbc={false} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hwfp.common.model.process.description').d('流程描述')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('processDescription')(<Input dbc2sbc={false} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item>
              <Button data-code="reset" style={{ marginRight: 8 }} onClick={this.handleFormReset}>
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
        <Row {...SEARCH_FORM_ROW_LAYOUT} type="flex" gutter={24}>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={
                isApproverTabForm
                  ? intl.get('hwfp.common.view.message.handlerResign').d('当前处理人是否离职')
                  : intl.get('hwfp.common.view.message.applicantDepart').d('流程申请人是否离职')
              }
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('employeeResign')(
                <Select allowClear>
                  <Option value="true">{intl.get('hzero.common.button.yes').d('是')}</Option>
                  <Option value="false">{intl.get('hzero.common.button.no').d('否')}</Option>
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <Form.Item
              label={intl.get('hwfp.common.model.process.ID').d('流程标识')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('processInstanceId')(<Input dbc2sbc={false} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
