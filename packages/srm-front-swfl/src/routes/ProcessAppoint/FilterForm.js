/**
 * FilterForm - 流程指定查询
 * @date: 2019-07-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Button, Input } from 'hzero-ui';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.state = {
      expandForm: false,
    };
  }

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
   * 重置
   */
  @Bind
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    form.validateFields((err) => {
      if (!err) {
        onSearch();
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { expandForm } = this.state;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('hwfp.common.model.process.class').d('流程分类')}
                >
                  {getFieldDecorator('categoryId')(
                    <Lov
                      code="HWFP.PROCESS_CATEGORY"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('hwfp.common.model.process.class.code').d('流程分类编码')}
                >
                  {getFieldDecorator('categoryCode')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('hwfp.common.model.process.class.name').d('流程分类名称')}
                >
                  {getFieldDecorator('categoryDescription')(<Input />)}
                </FormItem>
              </Col>
              {expandForm && (
                <>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get('hwfp.common.model.documents.class').d('流程单据')}
                    >
                      {getFieldDecorator('documentId')(
                        <Lov
                          code="HWFP.PROCESS_DOCUMENT"
                          queryParams={{ tenantId: getCurrentOrganizationId() }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get('hwfp.common.model.documents.class.code').d('流程单据编码')}
                    >
                      {getFieldDecorator('documentCode')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get('hwfp.common.model.documents.class.name').d('流程单据名称')}
                    >
                      {getFieldDecorator('documentDescription')(<Input />)}
                    </FormItem>
                  </Col>
                </>
              )}
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
