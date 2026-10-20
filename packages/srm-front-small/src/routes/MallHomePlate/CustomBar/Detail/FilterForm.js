/**
 * CustomBar\PlatformDetail\FilterForm.js - 平台自定义栏编辑页面商品查询-Form
 * @date: 2019年3月4日 09:03:41
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

// const prompt = 'small.customBar';
const formLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12 },
};
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询点击
   */
  @Bind()
  queryAction() {
    const { form, onSearch } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onSearch({
          ...values,
        });
      }
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  queryCancle() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item
                label={intl.get(`small.common.model.supplier`).d('供应商')}
                {...formLayout}
              >
                {getFieldDecorator(
                  !isTenantRoleLevel() ? 'sourceFromName' : 'supplierCompanyName',
                  {
                    rules: [
                      {
                        max: 120,
                        message: intl.get('hzero.common.validation.max', {
                          max: 120,
                        }),
                      },
                    ],
                  }
                )(<Input dbc2sbc={false} />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get(`small.mallHomePlate.model.productCodeName`).d('商品编码/名称')}
                {...formLayout}
              >
                {getFieldDecorator('productName', {
                  rules: [
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                })(<Input dbc2sbc={false} />)}
              </Form.Item>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.queryCancle}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.queryAction}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
