/**
 * OtherInfo - 其他信息
 * @date: 2021-04-01
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import moment from 'moment';
import React from 'react';
import { Row, Col, Form } from 'hzero-ui';
import { yesOrNoRender, dateRender } from 'utils/renderer';

import intl from 'utils/intl';

import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class OtherInfo extends React.Component {
  render() {
    const {
      form,
      custLoading,
      data = {},
      customizeForm = () => {},
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.OTHER_INFO_FORM',
        form,
        dataSource: data,
        readOnly: true,
      },
      <Form custLoading={custLoading}>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.foreverBlacklistFlag')
                .d('永久黑名单')}
            >
              {getFieldDecorator('foreverBlacklistFlag', {
                initialValue: data.foreverBlacklistFlag,
              })(yesOrNoRender(Number(data.foreverBlacklistFlag)))}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.blacklistFlag').d('加入黑名单')}
            >
              {getFieldDecorator('blacklistFlag', {
                initialValue: data.blacklistFlag,
              })(yesOrNoRender(Number(data.blacklistFlag)))}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.blacklistExpiryDate')
                .d('黑名单失效时间')}
            >
              {getFieldDecorator('blacklistExpiryDate', {
                initialValue: data.blacklistExpiryDate
                  ? moment(data.blacklistExpiryDate, DEFAULT_DATE_FORMAT)
                  : null,
              })(
                <span
                  style={{
                    color:
                      ['update', 'insert', 'delete'].includes(data.blacklistExpiryDateStateFlag) &&
                      'red',
                  }}
                >
                  {dateRender(data.blacklistExpiryDate)}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
