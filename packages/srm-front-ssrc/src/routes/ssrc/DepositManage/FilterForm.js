/**
 * FilterForm - 表单查询组件
 * @date: 2020-04-01
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Row, Col, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const FormItem = Form.Item;
const promptCode = 'ssrc.depositManage';

/**
 * FilterForm - 展示组件 - 表单查询组件
 * @extends {Component} - React.Component
 * @reactProps {Function} [onRef= e => e] - 绑定ref
 * @reactProps {Function} [onSearch= e => e] - 查询数据
 * @return React.element
 */
@formatterCollections({
  code: 'ssrc.depositManage',
})
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/deposit-manage/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询列表 (由调用组件者,自己实现业务逻辑)
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  render() {
    const {
      form: { getFieldDecorator },
      remoteFunc,
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.depositManage.sourceNum`).d('寻源单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('sourceNum')(<Input maxLength={40} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.depositManage.sourceTitle`).d('寻源标题')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('sourceTitle')(<Input maxLength={40} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.depositManage.purchaserName`).d('采购员')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('purchaserName')(<Input maxLength={40} />)}
                </FormItem>
              </Col>
            </Row>
            {remoteFunc
              ? remoteFunc.render('SSRC_DEPOSIT_MANAGE_RENDER_FORM', <></>, {
                  getFieldDecorator,
                  formItemLayout,
                })
              : null}
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
