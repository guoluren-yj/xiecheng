/*
 * PurchaseRequestHeader - 采购申请头页面
 * @date: 2019-12-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Tooltip } from 'hzero-ui';

import intl from 'utils/intl';
import classNames from 'classnames';
import { dateRender } from 'utils/renderer';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
} from 'utils/constants';

const promptCode = 'sqam.incomingInspectionQuery';

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class PurchaseRequestHeader extends PureComponent {
  formatContent = () => {
    const { form, detailHeader = {} } = this.props;
    const {
      inspectionNum,
      creationDate,
      createdName,
      dataSourceMeaning,
      poNum,
      asnNum,
      problemNum,
      transactionNum,
      companyName,
      organizationName,
      inspectionTypeMeaning,
      inspectionRemark,
      inspectionStateMeaning,
      supplierName,
      ouName,
      purOrganizationName,
    } = detailHeader;
    const { getFieldDecorator } = form;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.purchaseRequest.inspectionNum`)
                .d('检验批号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('inspectionNum', { initialValue: inspectionNum })(
                <span>{inspectionNum}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`hzero.common.date.creation`).d('创建日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', { initialValue: creationDate })(
                <span>{dateRender(creationDate)}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.roles.creator`).d('创建人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('createdName', { initialValue: createdName })(
                <span>{createdName}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`hzero.common.status`).d('状态')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('inspectionStateMeaning', {
                initialValue: inspectionStateMeaning,
              })(<span>{inspectionStateMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.documentSource`)
                .d('单据来源')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('dataSourceMeaning', { initialValue: dataSourceMeaning })(
                <span>{dataSourceMeaning}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(
                  `${promptCode}.view.message.model.incomingInspectionQuery.inspectionTypeMeaning`
                )
                .d('检验类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('inspectionType', { initialValue: inspectionTypeMeaning })(
                <span>{inspectionTypeMeaning}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyId', { initialValue: companyName })(
                <span>{companyName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invOrganizationId', { initialValue: organizationName })(
                <span>{organizationName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierCompanyId', { initialValue: supplierName })(
                <span>{supplierName}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.poNum`)
                .d('采购订单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('poNum', { initialValue: poNum })(
                <Tooltip title={poNum}>{poNum}</Tooltip>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.asnNum`)
                .d('送货单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('asnNum', { initialValue: asnNum })(
                <Tooltip title={asnNum}>{asnNum}</Tooltip>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.transactionNum`)
                .d('事务编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('transactionNum', { initialValue: transactionNum })(
                <Tooltip title={transactionNum}>{transactionNum}</Tooltip>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.incomingInspectionQuery.problemNum`)
                .d('关联整改报告')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemNum', { initialValue: problemNum })(
                <span>{problemNum}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`entity.business.tag`).d('业务实体')}>
              {getFieldDecorator('ouName', { initialValue: ouName })(<span>{ouName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`entity.organization.class.purchase`).d('采购组织')}>
              {getFieldDecorator('purOrganizationName', { initialValue: purOrganizationName })(
                <span>{purOrganizationName}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`hzero.common.remark`).d('备注')}>
              {getFieldDecorator('inspectionRemark', { initialValue: inspectionRemark })(
                <span>{inspectionRemark}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, detailHeader = {}, customizeForm } = this.props;
    return customizeForm
      ? customizeForm(
          {
            code: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.BASIC',
            form,
            dataSource: detailHeader,
          },
          this.formatContent()
        )
      : this.formatContent();
  }
}
