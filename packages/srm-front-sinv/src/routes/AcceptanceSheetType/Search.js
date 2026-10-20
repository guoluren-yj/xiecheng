import React, { Component } from 'react';
import { Form, Button, Row, Col, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

// import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
// import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
// import { getUserOrganizationId } from 'utils/utils';

// const commonModelPrompt = 'sinv.common.model.common';
// const modelPrompt = 'sinv.deliveryCanceled.model.deliveryCanceled';
// const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class Search extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          onSearch(values);
        }
      });
    }
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`sinv.acceptanceSheetType.common.acceptListTypeCode`)
                    .d('验收单类型编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('acceptListTypeCode')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`sinv.acceptanceSheetType.common.acceptListTypeName`)
                    .d('验收单类型名称')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('acceptListTypeName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sinv.acceptanceSheetType.common.enabledFlag`).d('是否启用')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('enabledFlag')(<ValueList lovCode="HPFM.FLAG" allowClear />)}
                </FormItem>
              </Col>
            </Row>
          </Col>

          <Col span={6} className="search-btn-more">
            <FormItem>
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
}
