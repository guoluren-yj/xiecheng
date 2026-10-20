/**
 * OrderHeaderForm - 计划维护 - 明细信息Form
 * @date: 2019. 12-12
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import classnames from 'classnames';
import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';

import DisplayFormItem from '../../components/DisplayFormItem';

/**
 * 我收到的订单明细页面 - 明细信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class OrderHeaderForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { dataSource = {} } = this.props;
    const {
      planNum, // 计划单号
      planningCycleMeaning, // 计划周期
      creationDate, // 创建日期,
      companyName, // 公司
      creator,
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
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.planningCycle`).d('计划周期')}
              value={planningCycleMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.planStartDate`).d('计划起始日')}
              value={dateRender(planStartDate)}
            />
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
            <DisplayFormItem
              label={intl.get(`sodr.common.model.common.purchaserHeaderRemark`).d('采购方备注')}
              value={purchaserRemark}
            />
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
