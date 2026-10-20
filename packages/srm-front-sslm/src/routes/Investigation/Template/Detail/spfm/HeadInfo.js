/**
 * 模板明细定义头信息
 * @date: 2018-8-16
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Row, Col, Form, Tooltip, Icon } from 'hzero-ui';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import { dateTimeRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import styles from '../index.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends React.PureComponent {
  @Bind()
  handleReserveFlagChange(e) {
    const { form, dispatch, headerInfo, onRefresh } = this.props;
    const reserveFlagValue = e.target.value;
    const formValues = form.getFieldsValue() || {};
    dispatch({
      type: 'investigationDefinitionOrg/saveTemptDetail',
      payload: {
        investigateConfigAttTempls: [],
        investigateConfigHeaderList: [],
        investigateTemplate: {
          ...headerInfo,
          ...formValues,
          reserveFlag: reserveFlagValue === 0 ? 1 : 0,
        },
      },
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        notification.success();
        if (onRefresh) {
          onRefresh();
        }
      }
    });
  }

  render() {
    const {
      headerInfo,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form className="ued-edit-form">
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`spfm.investigationDefinition.view.message.templateCode`)
                .d('预置模板代码')}
            >
              {getFieldDecorator('templateCode', {
                initialValue: headerInfo.templateCode,
              })(<span>{headerInfo.templateCode}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`spfm.investigationDefinition.view.message.templateName`)
                .d('预置模板描述')}
            >
              {getFieldDecorator('templateName', {
                initialValue: headerInfo.templateName,
              })(<span>{headerInfo.templateName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`spfm.investigationDefinition.view.message.investigateType`)
                .d('调查表类型')}
            >
              {getFieldDecorator('investigateTypeMeaning', {
                initialValue: headerInfo.investigateTypeMeaning,
              })(<span>{headerInfo.investigateTypeMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`spfm.investigationDefinition.view.message.industryMeaning`)
                .d('行业类型')}
            >
              {getFieldDecorator('industryMeaning', {
                initialValue: headerInfo.industryMeaning,
              })(<span>{headerInfo.industryMeaning}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`hzero.common.date.creation`).d('创建日期')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: headerInfo.creationDate,
              })(<span>{dateTimeRender(headerInfo.creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get(`hzero.common.remark`).d('备注')}>
              {getFieldDecorator('remark', {
                initialValue: headerInfo.remark,
              })(<span>{headerInfo.remark}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              className={styles['form-item-wrap']}
              label={
                <span className={styles['label-wrap']}>
                  <span>
                    {intl
                      .get('sslm.investTempConfig.model.investTempConfig.reserveFlag')
                      .d('跨模板或跨版本时预留字段自动带值')}
                  </span>
                  <Tooltip
                    title={intl
                      .get('sslm.investTempConfig.model.investTempConfig.reserveFlagMsg')
                      .d(
                        '开启此配置时建议检查跨模板或跨版本调查表模板内，同一预留字段是否有代表不同的业务意义或配置了不同的属性'
                      )}
                  >
                    <Icon type="question-circle-o" style={{ marginRight: 10 }} />
                  </Tooltip>
                </span>
              }
            >
              {getFieldDecorator('reserveFlag', {
                initialValue: headerInfo.reserveFlag,
              })(<Checkbox onChange={this.handleReserveFlagChange} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
