/**
 * InterfaceSegment -接口表结构定义 查询部分
 * @date: 2018-11-23
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Button, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';

import Lov from 'components/Lov';

const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class FitlerForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectRelationValue: '',
    };
  }

  @Bind()
  fetchInterfaceSegment() {
    const { form, onFetchInterface } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchInterface({
          ...values,
          externalSystemCode: this.state.selectRelationValue,
        });
      }
    });
  }
  /**
   * 表单重置
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    this.setState({
      selectRelationValue: '',
    });
    form.resetFields();
  }

  /**
   * 外部系统lov选择框
   * @param {String} text    当前选择数据
   * @param {object} record  当前行数据
   */
  @Bind()
  changeSystemCode(text, record) {
    this.setState({
      selectRelationValue: record.externalSystemCode,
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      synchronous,
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              label={intl
                .get(`sitf.interfaceSegment.model.interfaceSegment.relationValue`)
                .d('IDOC基本类型')}
              {...formlayout}
            >
              {getFieldDecorator('idocType')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl
                .get(`sitf.interfaceSegment.model.interfaceSegment.systemType`)
                .d('外部系统类型')}
              {...formlayout}
            >
              {getFieldDecorator('externalSystemCode')(
                <Lov
                  code="SIFC.EXTERNAL_SYSTEM"
                  onChange={(text, record) => this.changeSystemCode(text, record)}
                  textField="externalSystemName"
                />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl
                .get(`sitf.interfaceSegment.model.interfaceSegment.extendType`)
                .d('IDOC扩展类型')}
              {...formlayout}
            >
              {getFieldDecorator('extendType')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button htmlType="submit" onClick={synchronous} style={{ marginLeft: 8 }}>
                {intl.get('hzero.common.status.sync').d('同步')}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchInterfaceSegment}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
