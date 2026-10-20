import React, { Component } from 'react';
import { Form, Row, Col, Input, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { connect } from 'dva';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import { getDefaultFromCompany, getDefaultFromPurOrg } from '@/services/sqamCommonService';

// import classNames from 'classnames';

import rejectImg from '@/assets/problem_approve_reject.svg';

const tenantId = getCurrentOrganizationId();

@connect(({ createClaim }) => ({
  createClaim,
}))
export default class BasicInfoForm extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'createClaim/init',
    });
  } 

  render() {
    const {
      form,
      headerData = {},
      formHeaderId,
      onSetDefaultCurrency,
      customizeForm,
      defaultTypeDesc,
      defaultClaimTypeId,
      remoteProps,
    } = this.props;
    const { getFieldDecorator, getFieldValue, registerField, setFieldsValue } = form;
    const supplierLovOption = {
      valueField: 'rowNumId',
      displayField: 'supplierCompanyName',
    };
    return customizeForm(
      {
        code: 'SQAM.CREATE_CLAIM.DETAIL.BASIC_INFO',
        form,
        dataSource: headerData,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.claimNum`).d('索赔单号')}>
              {getFieldDecorator('formNum', { initialValue: headerData.formNum })(
                <span>{headerData.formNum}</span>
              )}
            </Form.Item>
          </Col>
          <Col span={16} style={{ width: '66.6666%' }}>
            <Form.Item label={intl.get(`sqam.common.model.formTitle`).d('索赔单标题')}>
              {getFieldDecorator('formTitle', {
                initialValue: headerData.formTitle,
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`hzero.common.status`).d('状态')}>
              {getFieldDecorator('statusCodeMeaning')(
                <>
                  <span>{headerData.statusCodeMeaning}</span>
                  <span>
                    {headerData.statusCode === 'REJECTED' && (
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
            <Form.Item label={intl.get(`hzero.common.entity.creator`).d('创建人')}>
              {getFieldDecorator('createName')(<span>{headerData.createName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`hzero.common.date.creation`).d('创建日期')}>
              {getFieldDecorator('creationDate')(
                <span>{dateTimeRender(headerData.creationDate)}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {!formHeaderId
                ? getFieldDecorator('companyId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.company.tag`).d('公司'),
                        }),
                      },
                    ],
                    initialValue: headerData.companyId,
                  })(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      textValue={headerData.companyName || getFieldValue('companyName')}
                      onChange={async (_, record) => {
                        let res = null;
                        if (record) {
                          res = getResponse(
                            await getDefaultFromCompany({ companyId: record.companyId })
                          );
                        }
                        registerField('ouCode');
                        registerField('ouName');
                        registerField('organizationName');
                        registerField('invOrganizationName');
                        const {
                          ouId,
                          ouName,
                          ouCode,
                          purchaseOrgId,
                          purchaseOrgName,
                          invOrganizationId,
                          invOrganizationName,
                        } = res || {};
                        if (purchaseOrgId) {
                          const result = getResponse(await getDefaultFromPurOrg({ purchaseOrgId }));
                          const { purchaseAgentId, purchaseAgentName } = result || {};
                          registerField('agentId');
                          registerField('purchaseAgentName');
                          setFieldsValue({ agentId: purchaseAgentId, purchaseAgentName });
                        }
                        setFieldsValue({
                          ouId,
                          ouName,
                          ouCode,
                          invOrganizationId,
                          supplierCompanyId: null,
                          purchaseOrgId,
                          organizationName: purchaseOrgName,
                          invOrganizationName,
                        });
                        onSetDefaultCurrency(record);
                      }}
                    />
                  )
                : getFieldDecorator('companyName', { initialValue: headerData.companyName })(
                  <span>{headerData.companyName}</span>
                  )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.business.tag`).d('业务实体')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {!formHeaderId
                ? getFieldDecorator('ouId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.business.tag`).d('业务实体'),
                        }),
                      },
                    ],
                    initialValue: headerData.ouId,
                  })(
                    <Lov
                      code="SODR.USER_AUTH.OU"
                      disabled={!getFieldValue('companyId')}
                      lovOptions={{ valueField: 'ouId' }}
                      textValue={headerData.ouName || getFieldValue('ouName')}
                      queryParams={{
                        tenantId,
                        companyId: getFieldValue('companyId'),
                      }}
                      onChange={async (_, { ouCode, ouId }) => {
                        let res = null;
                        if (ouId) {
                          res = getResponse(
                            await getDefaultFromCompany({
                              companyId: getFieldValue('companyId'),
                              ouId,
                            })
                          );
                        }
                        const {
                          purchaseOrgId,
                          purchaseOrgName,
                          invOrganizationId,
                          invOrganizationName,
                        } = res || {};
                        if (purchaseOrgId) {
                          const result = getResponse(await getDefaultFromPurOrg({ purchaseOrgId }));
                          const { purchaseAgentId, purchaseAgentName } = result || {};
                          registerField('agentId');
                          registerField('purchaseAgentName');
                          setFieldsValue({ agentId: purchaseAgentId, purchaseAgentName });
                        }
                        registerField('organizationName');
                        registerField('ouCode');
                        registerField('invOrganizationName');
                        setFieldsValue({
                          invOrganizationId,
                          ouCode,
                          purchaseOrgId,
                          organizationName: purchaseOrgName,
                          invOrganizationName,
                        });
                      }}
                    />
                  )
                : getFieldDecorator('ouName', { initialValue: headerData.ouName })(
                  <span>{headerData.ouName}</span>
                  )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {!formHeaderId
                ? getFieldDecorator('invOrganizationId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.organization.class.inventory`).d('库存组织'),
                        }),
                      },
                    ],
                    initialValue: headerData.invOrganizationId,
                  })(
                    <Lov
                      code="SQAM.INVORGNIZATION"
                      disabled={!getFieldValue('companyId') || !getFieldValue('ouId')}
                      textValue={
                        headerData.invOrganizationName || getFieldValue('invOrganizationName')
                      }
                      lovOptions={{
                        valueField: 'organizationId',
                        displayField: 'organizationName',
                      }}
                      queryParams={{
                        companyId: getFieldValue('companyId'),
                        ouId: getFieldValue('ouId'),
                      }}
                    />
                  )
                : getFieldDecorator('invOrganizationName',{
                  initialValue: headerData.invOrganizationName
                })(
                  <span>{headerData.invOrganizationName}</span>
                  )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.supplier.name`).d('供应商名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {!formHeaderId
                ? getFieldDecorator('supplierCompanyId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.supplier.name`).d('供应商名称'),
                        }),
                      },
                    ],
                    // initialValue: headerData.erpSupplierId
                    //   ? headerData.erpSupplierId
                    //   : headerData.supplierCompanyId,
                  })(
                    <Lov
                      code="SQAM.CLAIM_SUPPLIER_COMPANY"
                      disabled={!getFieldValue('companyId')}
                      onChange={(_, record = {}) => {
                        const {
                          supplierTenantId = null,
                          erpSupplierNum = null,
                          supplierCompanyId = null,
                          supplierCompanyName = '',
                          erpSupplierId = null,
                          erpSupplierName = '',
                          supplierId = null,
                        } = record;
                        registerField('supplierCode');
                        registerField('supplierTenantId');
                        registerField('supplierCompanyIdStash');
                        registerField('erpSupplierId');
                        registerField('supplierId');
                        setFieldsValue({
                          supplierTenantId,
                          erpSupplierId,
                          supplierCode: erpSupplierNum,
                          supplierCompanyId,
                          dataSourceNum:
                            getFieldValue('dataSourceCode') === '8D'
                              ? null
                              : getFieldValue('dataSourceNum'),
                          supplierCompanyName:
                            erpSupplierName !== '' ? erpSupplierName : supplierCompanyName,
                          supplierCompanyIdStash: supplierCompanyId,
                          supplierId: supplierId && supplierId,
                        });
                        if (remoteProps?.event) {
                          remoteProps.event.fireEvent('handleUpdateSupplierCux', {
                            record,
                            dataSource: headerData,
                            form,
                            getDefaultFromCompany,
                            getDefaultFromPurOrg,
                          });
                        }
                      }}
                      textField="supplierCompanyName"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                        companyId: getFieldValue('companyId'),
                      }}
                      lovOptions={
                        remoteProps
                          ? remoteProps.process(
                              'SQAM_CREATE_CLAIM_DETAIL_CUX.SUPPLIER_LOV_OPTIONS',
                              supplierLovOption,
                              { headerData }
                            )
                          : supplierLovOption
                      }
                    />
                  )
                : getFieldDecorator('supplierCompanyName', {
                    initialValue: headerData.supplierCompanyName,
                  })(<span>{headerData.supplierCompanyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* {formHeaderId ? (
              <Form.Item label={intl.get(`sqam.common.model.claimType`).d('索赔类型')}>
                {getFieldDecorator('claimTypeName')(<span>{headerData.claimTypeName}</span>)}
              </Form.Item>
            ) : (
              <Form.Item
                label={intl.get(`sqam.common.model.claimType`).d('索赔类型')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('claimTypeId', {
                  initialValue: defaultClaimTypeId || headerData.claimTypeId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sqam.common.model.claimType`).d('索赔类型'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    textValue={defaultTypeDesc}
                    code="SQAM.ENABLED_CLAIM_TYPE"
                    lovOptions={{ valueField: 'claimTypeId', displayField: 'typeDesc' }}
                    queryParams={{ tenantId: getCurrentOrganizationId() }}
                    onChange={(_, { autoConfirmFlag }) => {
                      registerField('autoConfirmFlag');
                      setFieldsValue({ autoConfirmFlag });
                    }}
                  />
                )}
              </Form.Item>
            )} */}
            <Form.Item
              label={intl.get(`sqam.common.model.claimType`).d('索赔类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('claimTypeId', {
                initialValue: headerData.claimTypeId || defaultClaimTypeId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sqam.common.model.claimType`).d('索赔类型'),
                    }),
                  },
                ],
              })(
                <Lov
                  textValue={headerData.claimTypeName || defaultTypeDesc}
                  code="SQAM.ENABLED_CLAIM_TYPE"
                  lovOptions={{ valueField: 'claimTypeId', displayField: 'typeDesc' }}
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  onChange={(_, { autoConfirmFlag, typeDesc, claimTypeId }) => {
                    registerField('autoConfirmFlag');
                    registerField('claimTypeName');
                    setFieldsValue({ autoConfirmFlag, claimTypeName: typeDesc, claimTypeId });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.erpFormNum`).d('外部系统单据')}>
              {getFieldDecorator('erpFormNum',{initialValue:headerData.erpFormNum })(<span>{headerData.erpFormNum}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.claimState`).d('索赔说明')}>
              {getFieldDecorator('claimDesc', {
                initialValue: headerData.claimDesc,
              })(<Input.TextArea rows={2} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaseOrgId', {
                initialValue: headerData.purchaseOrgId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURCHASE_ORG"
                  lovOptions={{ valueField: 'purchaseOrgId' }}
                  disabled={!getFieldValue('companyId') || !getFieldValue('ouId')}
                  textValue={headerData.organizationName || getFieldValue('organizationName')}
                  queryParams={{
                    companyId: getFieldValue('companyId'),
                    ouId: getFieldValue('ouId'),
                    tenantId,
                  }}
                  onChange={async (_, { organizationName, purchaseOrgId }) => {
                    let res = null;
                    if (purchaseOrgId) {
                      res = getResponse(await getDefaultFromPurOrg({ purchaseOrgId }));
                    }
                    const { purchaseAgentId, purchaseAgentName } = res || {};
                    registerField('purchaseAgentName');
                    registerField('organizationName');
                    setFieldsValue({
                      organizationName,
                      agentId: purchaseAgentId,
                      purchaseAgentName,
                    });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.common.purchaseAgent`).d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('agentId', {
                initialValue: headerData.agentId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PUR_ORG_AGENT"
                  lovOptions={{ valueField: 'purchaseAgentId' }}
                  textValue={headerData.purchaseAgentName || getFieldValue('purchaseAgentName')}
                  queryParams={{
                    tenantId,
                    purchaseOrgId: getFieldValue('purchaseOrgId'),
                  }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.sourceCodeMeaning`).d('创建方式')}>
              {getFieldDecorator('sourceCodeMeaning',{
                initialValue: headerData.sourceCodeMeaning
              })(<span>{headerData.sourceCodeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`sqam.common.model.claimInvoiceBill.claimAmountMaintainMode`)
                .d('金额维护方式')}
            >
              {getFieldDecorator('claimAmountMaintainModeMeaning',{
                initialValue: headerData.claimAmountMaintainModeMeaning
              })(
                <span>{headerData.claimAmountMaintainModeMeaning}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.common.unitName`).d('部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('unitId', {
                initialValue: headerData.unitId,
              })(
                <Lov
                  code="SQAM.USER_DEPARTMENT"
                  textValue={headerData.unitIdMeaning}
                  queryParams={{ tenantId, userId: headerData.createdBy }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
