/*
 * PurchaseRequestHeader - 采购申请头页面
 * @date: 2019-12-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Select, Tooltip } from 'hzero-ui';
import { dateRender } from 'utils/renderer';
import classNames from 'classnames';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
} from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';

import rejectImg from '@/assets/problem_approve_reject.svg';

// FormItem组件初始化
// const FormItem = Form.Item;
// TextArea组件初始化

const promptCode = 'sqam.incomingInspectionQuery';
const organizationId = getCurrentOrganizationId();
/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
// @withCustomize({
//   unitCode: ['SQAM.INCOMING_INSPECTION_CREATE_DETAIL.BASIC'],
// })
export default class PurchaseRequestHeader extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      detailHeader = {},
      form,
      enumMap = {},
      // setModelDetailHeader,
      createFlag = false,
      quoteFlag = false,
      customizeForm,
    } = this.props;
    const {
      inspectionNum,
      creationDate,
      createdName,
      inspectionType,
      dataSourceMeaning,
      poNum,
      asnNum,
      transactionNum,
      companyName,
      companyId,
      organizationName,
      invOrganizationId,
      inspectionRemark,
      inspectionStateMeaning,
      inspectionState,
      approvedRemark,
      approvedFlag,
      ouId,
      ouName,
      purOrganizationName,
      purchaseOrgId,
    } = detailHeader;
    const { status = [], inspectionStateMap = [], source = [] } = enumMap;
    const createMeaning = (inspectionStateMap.find((i) => i.value === 'UNTREATED') || {}).meaning;
    const sourceMeaning = (source.find((i) => i.value === 'MANUAL') || {}).meaning;
    const { getFieldDecorator, getFieldValue, registerField, setFieldsValue } = form;
    return customizeForm(
      {
        code: 'SQAM.INCOMING_INSPECTION_CREATE_DETAIL.BASIC',
        form,
        dataSource: detailHeader,
      },
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
              {getFieldDecorator('creationDate')(<span>{dateRender(creationDate)}</span>)}
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
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`hzero.common.status`).d('状态')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('inspectionStateMeaning')(
                <>
                  <span>{createFlag ? createMeaning : inspectionStateMeaning}</span>
                  <span>
                    {!createFlag && approvedFlag === 0 && inspectionState === 'UNTREATED' && (
                      <Tooltip
                        title={
                          <div>
                            {`${intl
                              .get(`${promptCode}.view.message.approvalRefused`)
                              .d('发布审批拒绝')} ${approvedRemark || ''}`}
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
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.documentSource`)
                .d('单据来源')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('dataSourceMeaning')(
                <span>{createFlag ? sourceMeaning : dataSourceMeaning}</span>
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
              {getFieldDecorator('inspectionType', {
                initialValue: inspectionType,
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl
                        .get(
                          `${promptCode}.view.message.model.incomingInspectionQuery.inspectionTypeMeaning`
                        )
                        .d('检验类型'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {status.map(({ meaning, value }) => (
                    <Select.Option key={value} value={value}>
                      {meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={quoteFlag ? 'read-row' : 'writable-row'}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyId', {
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl.get(`entity.company.tag`).d('公司'),
                    }),
                  },
                ],
                initialValue: companyId,
              })(
                !quoteFlag ? (
                  <Lov
                    code="SPFM.USER_AUTH.COMPANY"
                    textValue={companyName}
                    queryParams={{ organizationId }}
                    onChange={() => {
                      setFieldsValue({
                        ouId: null,
                        invOrganizationId: null,
                        supplierCompanyId: null,
                      });
                    }}
                  />
                ) : (
                  <span>{companyName}</span>
                )
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {!quoteFlag
                ? getFieldDecorator('invOrganizationId', {
                    initialValue: invOrganizationId,
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl.get(`entity.organization.class.inventory`).d('库存组织'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SPFM.USER_AUTH.INVORG"
                      queryParams={{ companyId: getFieldValue('companyId') }}
                      disabled={getFieldValue('companyId') === undefined}
                      textValue={organizationName}
                    />
                  )
                : getFieldDecorator('invOrganizationId', {
                    initialValue: invOrganizationId,
                  })(<span>{organizationName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {!quoteFlag
                ? getFieldDecorator('supplierCompanyId', {
                    initialValue: detailHeader.erpSupplierId
                      ? detailHeader.erpSupplierId
                      : detailHeader.supplierCompanyId,
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl.get(`entity.supplier.tag`).d('供应商'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SQAM.CLAIM_SUPPLIER_COMPANY"
                      disabled={!getFieldValue('companyId')}
                      onChange={(
                        _,
                        {
                          supplierTenantId = null,
                          erpSupplierNum = null,
                          supplierCompanyId = null,
                          supplierCompanyName = '',
                          erpSupplierId = null,
                          erpSupplierName = '',
                          supplierId = null,
                        }
                      ) => {
                        registerField('supplierCode');
                        registerField('supplierTenantId');
                        registerField('supplierCompanyIdStash');
                        registerField('erpSupplierId');
                        registerField('supplierCompanyName');
                        registerField('supplierId');
                        setFieldsValue({
                          supplierTenantId,
                          erpSupplierId,
                          supplierCode: erpSupplierNum,
                          supplierCompanyId,
                          supplierCompanyName:
                            erpSupplierName !== '' ? erpSupplierName : supplierCompanyName,
                          supplierCompanyIdStash: supplierCompanyId,
                          supplierId: supplierId && supplierId,
                        });
                      }}
                      textValue={detailHeader.supplierName}
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                        companyId: getFieldValue('companyId'),
                      }}
                      lovOptions={{
                        valueField: 'rowNumId',
                        displayField: 'supplierName',
                      }}
                    />
                  )
                : getFieldDecorator('supplierCompanyId')(<span>{detailHeader.supplierName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.poNum`)
                .d('采购订单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('poNum', {
                initialValue: poNum,
              })(
                createFlag ? (
                  <Input trim typeCase="upper" inputChinese={false} />
                ) : (
                  <Tooltip title={poNum}>
                    <div
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {poNum}
                    </div>
                  </Tooltip>
                )
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
              {getFieldDecorator('asnNum', {
                initialValue: asnNum,
              })(
                createFlag ? (
                  <Input trim typeCase="upper" inputChinese={false} />
                ) : (
                  <Tooltip title={asnNum}>
                    <div
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {asnNum}
                    </div>
                  </Tooltip>
                )
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
              {getFieldDecorator('transactionNum', {
                initialValue: transactionNum,
              })(
                createFlag ? (
                  <Input trim typeCase="upper" inputChinese={false} />
                ) : (
                  <Tooltip title={transactionNum}>
                    <div
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {transactionNum}
                    </div>
                  </Tooltip>
                )
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.business.tag`).d('业务实体')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {!quoteFlag
                ? getFieldDecorator('ouId', {
                    initialValue: ouId,
                  })(
                    <Lov
                      code="SODR.USER_AUTH.OU"
                      disabled={!getFieldValue('companyId')}
                      lovOptions={{ valueField: 'ouId' }}
                      textValue={ouName}
                      queryParams={{
                        tenantId: organizationId,
                        companyId: getFieldValue('companyId'),
                      }}
                    />
                  )
                : getFieldDecorator('ouId')(<span>{ouName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {!quoteFlag
                ? getFieldDecorator('purchaseOrgId', {
                    initialValue: purchaseOrgId,
                  })(
                    <Lov
                      code="SPFM.USER_AUTH.PURCHASE_ORG"
                      // lovOptions={{ displayField: 'organizationName' }}
                      textValue={purOrganizationName}
                      queryParams={{
                        tenantId: organizationId,
                        companyId: getFieldValue('companyId'),
                        ouId: getFieldValue('ouId'),
                      }}
                    />
                  )
                : getFieldDecorator('purchaseOrgId')(<span>{purOrganizationName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`hzero.common.remark`).d('备注')}>
              {getFieldDecorator('inspectionRemark', {
                initialValue: inspectionRemark,
              })(<Input.TextArea rows={2} style={{ height: '56px' }} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
