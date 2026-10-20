import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';

const FormItem = Form.Item;

/**
 * 供应商分类定义
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.state = {
      expand: false,
    };
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
          // 如果验证成功,则执行onSearch
          onSearch(true);
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 表单展开收起
   */
  @Bind()
  toggleForm() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      customizeFilterForm,
      custLoading,
      code = '',
      form,
      form: { getFieldDecorator },
    } = this.props;

    const { expand } = this.state;

    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
      style: {
        width: '100%',
      },
    };
    return customizeFilterForm(
      {
        code, // 单元编码，必传
        form,
        expand, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('sslm.supplierCategory.model.supplierCategory.catCode')
                    .d('供应商分类代码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('categoryCode')(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('sslm.supplierCategory.model.supplierCategory.catDes')
                    .d('供应商分类描述')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('categoryDescription')(<Input />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('sslm.supplierCategory.model.supplierCategory.supplierCompany')
                    .d('供应商所属公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov textField="companyName" code="SPFM.USER_AUTHORITY_COMPANY" />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expand
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>

              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 12 }}
                onClick={this.handleSearch}
                type="primary"
                htmlType="submit"
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
