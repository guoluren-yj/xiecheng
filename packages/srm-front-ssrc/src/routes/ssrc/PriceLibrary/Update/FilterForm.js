/**
 * FilterForm - 价格库-手工创建&更新价格查询界面
 * @date: 2019-10-26
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Input, Form, Button, Row, Col, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';

import styles from './index.less';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  // 条件查询
  @Bind()
  fetchInterfaceDef() {
    const { form, onConditional } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onConditional();
      }
    });
  }

  // 重置
  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  // 是否展开
  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  // 新建
  @Bind()
  handleCreatePriceLine() {
    const { onCreatePriceLine } = this.props;
    onCreatePriceLine();
  }

  // 删除
  @Bind()
  handleDeletePriceLine() {
    const { onDeletePriceLine } = this.props;
    onDeletePriceLine();
  }

  render() {
    const {
      deleteLoading,
      selectedRowKeys = [],
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item label={intl.get('ssrc.common.company').d('公司')} {...formlayout}>
                  {getFieldDecorator('companyId')(
                    <Lov code="SPFM.USER_AUTHORITY_COMPANY" textField="companyName" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.priceLibrary.model.library.ouName`).d('业务实体')}
                  {...formlayout}
                >
                  {getFieldDecorator('ouId')(<Lov code="SPFM.USER_AUTH.OU" textField="ouName" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.priceLibrary.model.library.supplier`).d('供应商')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierCompanyName')(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.priceLibrary.model.library.item`).d('物品')}
                  {...formlayout}
                >
                  {getFieldDecorator('itemName')(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get(`ssrc.priceLibrary.model.library.quotationExpiryDateFrom`)
                    .d('有效期从')}
                >
                  {getFieldDecorator('quotationExpiryDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('quotationExpiryDateTo') &&
                        moment(getFieldValue('quotationExpiryDateTo')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get(`ssrc.priceLibrary.model.library.quotationExpiryDateTo`)
                    .d('有效期至')}
                >
                  {getFieldDecorator('quotationExpiryDateTo')(
                    <DatePicker
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('quotationExpiryDateFrom') &&
                        moment(getFieldValue('quotationExpiryDateFrom')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ marginLeft: 8, display: expand ? 'inline-block' : 'none' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ marginLeft: 8, display: expand ? 'none' : 'inline-block' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.queryReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.fetchInterfaceDef}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} className={styles['opreation-btn']}>
            <Form.Item>
              <Button
                key="delete"
                style={{ margin: '0px 8px 0px 8px' }}
                onClick={() => this.handleDeletePriceLine()}
                disabled={selectedRowKeys.length === 0}
                loading={deleteLoading}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              <Button
                key="create"
                type="primary"
                style={{ marginLeft: '8px' }}
                onClick={() => this.handleCreatePriceLine()}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
