import React, { Component } from 'react';
import { Form, Input, Row, Col, Button, DatePicker, Select } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
} from 'utils/constants';
import moment from 'moment';
import { getDateFormat } from 'utils/utils';
import { Bind } from 'lodash-decorators';

@formatterCollections({
  code: ['sqam.common', 'entity.item', 'hzero.common'],
})
export default class FilterForm extends Component {
  state = {
    showMore: false,
  };

  /**
   * 重置表单点击事件
   */
  @Bind()
  reset() {
    this.props.form.resetFields();
  }

  /**
   * 更多查询条件显隐切换
   */
  @Bind()
  showMore() {
    const { showMore } = this.state;
    this.setState({
      showMore: !showMore,
    });
  }

  render() {
    const { form, fetchClaim, actionList, isExport } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              {isExport && (
                <Col {...FORM_COL_4_LAYOUT}>
                  <Form.Item
                    label={intl.get('sqam.common.operate.processStatus').d('操作节点')}
                    {...SEARCH_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('processTypeCode')(
                      <Select allowClear>
                        {actionList.map((item) => (
                          <Select.Option key={item.processTypeCode} value={item.processTypeCode}>
                            {item.processTypeMeaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              )}
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.roles.operator`).d('操作人')}
                >
                  {getFieldDecorator('processUserName')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get('hzero.common.date.operationCreation.from').d('操作日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('createdDateStart')(
                    <DatePicker
                      placeholder=""
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('createdDateEnd') &&
                        moment(getFieldValue('createdDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get('hzero.common.date.operationCreation.to').d('操作日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('createdDateEnd')(
                    <DatePicker
                      placeholder=""
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('createdDateStart') &&
                        moment(getFieldValue('createdDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6}>
            <Form.Item>
              <Button onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={fetchClaim}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
