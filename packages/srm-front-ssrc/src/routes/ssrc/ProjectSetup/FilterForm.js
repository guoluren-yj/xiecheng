import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { Input, Form, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/supplier-quotation/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  // 条件查询
  @Bind()
  handleSearch() {
    const { form, onConditional } = this.props;
    form.validateFields(err => {
      if (isEmpty(err)) {
        onConditional();
      }
    });
  }

  // 重置
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      customizeFilterForm,
    } = this.props;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return customizeFilterForm(
      {
        code: 'SSRC.PROJECT_SETUP_LIST.FILTER', // 单元编码，必传
        form: this.props.form,
        expand: true, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('ssrc.projectSetup.model.projectSetup.projectCode').d('项目编号')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceProjectNum')(
                    <Input typeCase="upper" trim inputChinese={false} maxLength={40} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('ssrc.projectSetup.model.projectSetup.projectName').d('项目名称')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceProjectName')(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get('ssrc.projectSetup.model.projectSetup.purchaseCont')
                    .d('采购联系人')}
                  {...formlayout}
                >
                  {getFieldDecorator('purAgent')(<Input trim />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
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
