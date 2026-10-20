/**
 * OrderHeaderForm - 计划维护 - 明细信息Form
 * @date: 2019. 12-12
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Select, DatePicker, Form, Input } from 'hzero-ui';
import classnames from 'classnames';
import moment from 'moment';
import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';
import { getDateFormat } from 'utils/utils';

import DisplayFormItem from '../../components/DisplayFormItem';

const { Option } = Select;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const { TextArea } = Input;

/**
 * 我收到的订单明细页面 - 明细信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class OrderHeaderForm extends Component {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dataSource = {},
      form: { getFieldDecorator },
      planCycle = [],
    } = this.props;
    const {
      planNum, // 计划单号
      planningCycle, // 计划周期
      planningCycleMeaning,
      creationDate, // 创建日期,
      companyName, // 公司
      creator, // 创建人
      supplierCompanyName, // 供应商名称
      agentName, // 采购员
      invOrganizationName, // 库存组织
      purchaserRemark, // 采购方备注
      supplierRemark, // 供应商备注
      planStartDate,
    } = dataSource;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.planNum`).d('计划单号')}
              value={planNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.creationDate`).d('创建日期')}
              value={dateRender(creationDate)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.creator`).d('创建人')}
              value={creator}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {!planningCycle ? (
              <Form.Item
                label={intl.get(`sodr.common.model.common.planningCycle`).d('计划周期')}
                {...formLayout}
              >
                {getFieldDecorator('planningCycle', {
                  initialValue: planningCycle,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.common.model.common.planningCycle`).d('计划周期'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear>
                    {planCycle &&
                      planCycle.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            ) : (
              <DisplayFormItem
                label={intl.get(`sodr.common.model.common.planningCycle`).d('计划周期')}
                value={planningCycleMeaning}
              />
            )}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {!planningCycle ? (
              <Form.Item
                label={intl.get(`sodr.common.model.common.planStartDate`).d('计划起始日')}
                {...formLayout}
              >
                {getFieldDecorator('planStartDate', {
                  initialValue: planStartDate && moment(planStartDate),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.common.model.common.planStartDate`).d('计划起始日'),
                      }),
                    },
                  ],
                })(<DatePicker format={getDateFormat()} placeholder={null} />)}
              </Form.Item>
            ) : (
              <DisplayFormItem
                label={intl.get(`sodr.common.model.common.planStartDate`).d('计划起始日')}
                value={dateRender(planStartDate)}
              />
            )}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.agentId`).d('采购员')}
              value={agentName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              value={supplierCompanyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem label={intl.get(`entity.company.tag`).d('公司')} value={companyName} />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
              value={invOrganizationName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'read-half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              label={intl.get(`sodr.common.model.common.purchaserHeaderRemark`).d('采购方备注')}
            >
              {getFieldDecorator('purchaserRemark', {
                initialValue: purchaserRemark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<TextArea rows={2} style={{ overflow: 'hidden', height: '56px' }} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.suppliersRemark`).d('供应商备注')}
              value={supplierRemark}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
