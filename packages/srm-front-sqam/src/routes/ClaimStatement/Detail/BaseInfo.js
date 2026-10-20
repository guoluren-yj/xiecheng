/**
 * BasicInfo - 基本信息表单
 * @date: 2019-11-4
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import classNames from 'classnames';
import Lov from 'components/Lov';

import rejectImg from '@/assets/problem_approve_reject.svg';

const tenantId = getCurrentOrganizationId();

/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */
// @withCustomize({
//   unitCode: ['SQAM.CLAIM_STATEMENT_DEATIL.BASIC_INFO'],
// })
export default class BasicInfoForm extends PureComponent {
  /**
   * render
   * @returns React.element
   */

  render() {
    const { dataSource = {}, customizeForm, form } = this.props;
    const { getFieldDecorator } = form;

    return customizeForm(
      {
        code: 'SQAM.CLAIM_STATEMENT_DEATIL.BASIC_INFO',
        form,
        dataSource,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`sqam.common.model.claimNum`).d('索赔单号')}
              value={dataSource.formNum}
            /> */}
            <Form.Item label={intl.get(`sqam.common.model.claimNum`).d('索赔单号')}>
              {getFieldDecorator('formNum', { initialValue: dataSource.formNum })(
                <span>{dataSource.formNum}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT} style={{ width: '66.6666%' }}>
            <Form.Item
              label={intl.get(`sqam.common.model.formTitle`).d('索赔单标题')}
              // value={headerData.formNum}
            >
              {getFieldDecorator('formTitle', { initialValue: dataSource.formTitle })(
                <span>{dataSource.formTitle}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`hzero.common.status`).d('状态')}
              value={dataSource.statusCodeMeaning}
            /> */}
            <Form.Item label={intl.get(`hzero.common.status`).d('状态')}>
              {getFieldDecorator('statusCodeMeaning', {
                initialValue: dataSource.statusCodeMeaning,
              })(
                <>
                  <span>{dataSource.statusCodeMeaning}</span>
                  <span>
                    {dataSource.statusCode === 'REJECTED' && (
                      <Tooltip
                        title={
                          <div>
                            {intl
                              .get(`sqam.common.view.message.approvalRefusedMessage`)
                              .d('审批拒绝: 详见审批记录列表')}
                          </div>
                        }
                      >
                        <img style={{ marginLeft: 5 }} src={rejectImg} alt="img" />
                      </Tooltip>
                    )}
                  </span>
                </>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`hzero.common.entity.creator`).d('创建人')}
              value={dataSource.createName}
            /> */}
            <Form.Item label={intl.get(`hzero.common.entity.creator`).d('创建人')}>
              {getFieldDecorator('createName', { initialValue: dataSource.createName })(
                <span>{dataSource.createName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`hzero.common.date.creation`).d('创建日期')}>
              {getFieldDecorator('creationDate')(
                <span>{dateTimeRender(dataSource.creationDate)}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`entity.company.tag`).d('公司')}
              value={dataSource.companyName}
            /> */}
            <Form.Item label={intl.get(`entity.company.tag`).d('公司')}>
              {getFieldDecorator('companyName', { initialValue: dataSource.companyName })(
                <span>{dataSource.companyName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`entity.business.tag`).d('业务实体')}
              value={dataSource.ouName}
            /> */}
            <Form.Item label={intl.get(`entity.business.tag`).d('业务实体')}>
              {getFieldDecorator('ouName', { initialValue: dataSource.ouName })(
                <span>{dataSource.ouName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
              value={dataSource.invOrganizationName}
            /> */}
            <Form.Item label={intl.get(`entity.organization.class.inventory`).d('库存组织')}>
              {getFieldDecorator('invOrganizationName', {
                initialValue: dataSource.invOrganizationName,
              })(<span>{dataSource.invOrganizationName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`entity.supplier.name`).d('供应商名称')}
              value={dataSource.supplierCompanyName}
            /> */}
            <Form.Item label={intl.get(`entity.supplier.name`).d('供应商名称')}>
              {getFieldDecorator('supplierCompanyName', {
                initialValue: dataSource.supplierCompanyName,
              })(<span>{dataSource.supplierCompanyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`sqam.common.model.claimType`).d('索赔类型')}
              value={dataSource.claimTypeName}
            /> */}
            <Form.Item label={intl.get(`sqam.common.model.claimType`).d('索赔类型')}>
              {getFieldDecorator('claimTypeName', { initialValue: dataSource.claimTypeName })(
                <span>{dataSource.claimTypeName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.common.purchaseAgent`).d('采购员')}>
              {getFieldDecorator('purchaseAgentName', {
                initialValue: dataSource.purchaseAgentName,
              })(<span>{dataSource.purchaseAgentName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item')}>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`sqam.common.model.claimState`).d('索赔说明')}
              value={dataSource.claimDesc}
            /> */}
            <Form.Item label={intl.get(`sqam.common.model.claimState`).d('索赔说明')}>
              {getFieldDecorator('claimDesc', { initialValue: dataSource.claimDesc })(
                <span>{dataSource.claimDesc}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`sqam.common.model.claimInvoiceBill.claimAmountMaintainMode`)
                .d('金额维护方式')}
            >
              {getFieldDecorator('claimAmountMaintainModeMeaning', {
                initialValue: dataSource.claimAmountMaintainModeMeaning,
              })(<span>{dataSource.claimAmountMaintainModeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.common.unitName`).d('部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('unitId', {
                initialValue: dataSource.unitId,
              })(
                <Lov
                  code="SQAM.USER_DEPARTMENT"
                  textValue={dataSource.unitIdMeaning}
                  queryParams={{ tenantId, userId: dataSource.createdBy }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`entity.organization.class.purchase`).d('采购组织')}>
              {getFieldDecorator('organizationName', { initialValue: dataSource.organizationName })(
                <span>{dataSource.organizationName}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
