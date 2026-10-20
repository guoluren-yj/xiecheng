import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';

import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const { onFetchList } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList();
    }
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { tenantId, expandForm } = this.state;

    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.sendOrder.model.common.orderNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.code`).d('物料编码')}>
                  {getFieldDecorator('itemCode')(
                    <Lov code="SODR.PO_ITEM" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('erpCreationDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('erpCreationDateEnd') &&
                        moment(getFieldValue('erpCreationDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                >
                  {getFieldDecorator('erpCreationDateEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('erpCreationDateStart') &&
                        moment(getFieldValue('erpCreationDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
