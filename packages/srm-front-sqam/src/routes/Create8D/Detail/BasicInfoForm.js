/* eslint-disable react/jsx-indent */
/**
 * BasicInfoForm - 基本信息表单
 * @date: 2018-11-23
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, DatePicker, Row, Col, Tooltip } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  FORM_COL_2_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import Lov from 'components/Lov';
import { dateTimeRender } from 'utils/renderer';
import { getDateTimeFormat, getDateFormat, getResponse } from 'utils/utils';
import classNames from 'classnames';
import rejectImg from '@/assets/problem_approve_reject.svg';
import { getDefaultFromCompany, getDefaultFromPurOrg } from '@/services/sqamCommonService';
import styles from './index.less';

// 编辑表单 span=16时，label:wrapper = 1:5
const LABEL_WRAPPER_1_5 = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};
const prefix = `sqam.common.model.qualityRectification`;
const rejProblemStatus = ['NEW', 'ICA_SUBMITTED', 'PCA_SUBMITTED'];
const rejApprovalProblemStatus = ['PUBULISH APPROVAE REJECT', 'CANCEL FINISH APPROVAL REJECT'];

/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */ 
export default class BasicInfoForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dateFormat: getDateFormat(),
      timeFormat: getDateTimeFormat(),
    };
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { dateFormat, timeFormat } = this.state;
    const {
      form = {},
      tenantId,
      dataSource,
      newFlag,
      user,
      serverTime,
      problemStatus,
      problemSource,
      customizeForm,
      onSetItemName,
      handleSetRecord,
      remoteProps,
      sourceLovPara,
      disabledFieldList = [],
    } = this.props;
    const { supplier: supplierLovPara = {} } = sourceLovPara || {};
    const {
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
      registerField,
      getFieldsValue,
    } = form;
    const { sourceCode } = dataSource;
    const notFromInComing = sourceCode !== 'INCOMING_INSPECTION';
    const statusMeaning = (problemStatus.find((i) => i.value === 'NEW') || {}).meaning;
    const sourceMeaning = sourceCode
      ? (problemSource.find((i) => i.value === sourceCode) || {}).meaning
      : (problemSource.find((i) => i.value === 'MANUAL') || {}).meaning;
    const icaDate = moment(serverTime).add(1, 'd');
    // eslint-disable-next-line
    const pcaDate = moment(serverTime).add(14, 'd');

    const sourceEditFlag =
      ['SITE_EVAL', 'KPI_EVAL'].includes(sourceCode) && dataSource.problemStatus === 'NEW';
    const { companyId } = getFieldsValue();
    const supplierEdit = (newFlag && notFromInComing) || dataSource.sourceCode === 'EXTERNAL_IMPORT';
    const supplierEditFlag = remoteProps
    ?remoteProps.process("SQAM_CREATE8D_DETAIL_CUX_SUPPLIER_EDIT_FLAG",supplierEdit,{_this:this})
    :supplierEdit;
    return customizeForm(
      {
        code: 'SQAM.CREATE_8D_DETAIL.BASIC',
        dataSource,
        form,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('writable-row', styles['row-1-2'])}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.code`).d('整改报告编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemNum', {
                initialValue: dataSource.problemNum,
              })(<span>{dataSource.problemNum}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.title`).d('整改报告标题')} {...LABEL_WRAPPER_1_5}>
              {getFieldDecorator('problemTitle', {
                initialValue: dataSource.problemTitle,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.title`).d('整改报告标题'),
                    }),
                  },
                  {
                    max: 80,
                    message: intl.get('hzero.common.validation.max', {
                      max: 80,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.status`).d('状态')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('problemStatusMeaning')(
                <div>
                  {newFlag ? statusMeaning : dataSource.problemStatusMeaning}
                  {rejProblemStatus.includes(dataSource.problemStatus) &&
                  rejApprovalProblemStatus.includes(dataSource.approvalProblemStatus) ? (
                    <Tooltip title={dataSource.approvalProblemStatusMeaning}>
                      <img style={{ marginLeft: 5 }} src={rejectImg} alt="img" />
                    </Tooltip>
                  ) : null}
                </div>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.roles.creator`).d('创建人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('createdName')(
                <span>{newFlag ? user : dataSource.createdName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`hzero.common.date.creation`).d('创建日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate')(
                <span>{dateTimeRender(dataSource.creationDate)}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyId', {
                initialValue: dataSource.companyId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.company.tag').d('公司'),
                    }),
                  },
                ],
              })(
                (newFlag && notFromInComing) || sourceEditFlag ? (
                  <Lov
                    code="SPFM.USER_AUTH.COMPANY"
                    queryParams={{ tenantId, enabledFlag: 1 }}
                    textValue={dataSource.companyName || getFieldValue('companyName')}
                    onChange={async (val, record = {}) => {
                      let res = null;
                      if (record) {
                        res = getResponse(
                          await getDefaultFromCompany({ companyId: record.companyId })
                        );
                      }
                      const {
                        ouId,
                        ouName,
                        ouCode,
                        purchaseOrgId,
                        purchaseOrgName,
                        invOrganizationId,
                        invOrganizationName,
                      } = res || {};
                      registerField('ouCode');
                      registerField('ouName');
                      registerField('companyName');
                      registerField('invOrganizationName');
                      registerField('purOrganizationName');
                      setFieldsValue({
                        ouId,
                        ouName,
                        ouCode,
                        invOrganizationId,
                        supplierNum: null,
                        companyName: record?.companyName,
                        purOrganizationId: purchaseOrgId,
                        invOrganizationName,
                        purOrganizationName: purchaseOrgName,
                      });
                      if (purchaseOrgId) {
                        const result = getResponse(await getDefaultFromPurOrg({ purchaseOrgId }));
                        const { purchaseAgentId, purchaseAgentName } = result || {};
                        registerField('purAgentName');
                        registerField('purAgentId');
                        setFieldsValue({
                          purAgentId: purchaseAgentId,
                          purAgentName: purchaseAgentName,
                        });
                      }
                      if (remoteProps?.event) {
                        remoteProps.event.fireEvent('handleUpdateCompanyCux', {
                          record,
                          dataSource,
                          form,
                          newFlag,
                        });
                      }
                    }}
                  />
                ) : (
                  <span>{dataSource.companyName}</span>
                )
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.business.tag`).d('业务实体')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('ouId', {
                initialValue: dataSource.ouId,
              })(
                newFlag || sourceEditFlag ? (
                  <Lov
                    code="SODR.USER_AUTH.OU"
                    textValue={dataSource.ouName || getFieldValue('ouName')}
                    disabled={!companyId}
                    queryParams={{
                      tenantId,
                      companyId,
                    }}
                    onChange={async (_, { ouCode, ouId }) => {
                      let res = null;
                      if (ouId) {
                        res = getResponse(
                          await getDefaultFromCompany({
                            companyId,
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
                      registerField('purOrganizationName');
                      registerField('ouCode');
                      registerField('invOrganizationName');
                      setFieldsValue({
                        invOrganizationId,
                        ouCode,
                        invOrganizationName,
                        purOrganizationId: purchaseOrgId,
                        purOrganizationName: purchaseOrgName,
                      });
                      if (purchaseOrgId) {
                        const result = getResponse(await getDefaultFromPurOrg({ purchaseOrgId }));
                        const { purchaseAgentId, purchaseAgentName } = result || {};
                        registerField('purAgentName');
                        registerField('purAgentId');
                        setFieldsValue({
                          purAgentId: purchaseAgentId,
                          purAgentName: purchaseAgentName,
                        });
                      }
                    }}
                  />
                ) : (
                  <span>{dataSource.ouName}</span>
                )
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invOrganizationId', {
                initialValue: dataSource.invOrganizationId,
              })(
                (newFlag && notFromInComing) || sourceEditFlag ? (
                  <Lov
                    code="SPFM.USER_AUTH.INVORG"
                    textValue={
                      dataSource.invOrganizationName || getFieldValue('invOrganizationName')
                    }
                    queryParams={{
                      companyId,
                      ouId: getFieldValue('ouId'),
                    }}
                    disabled={companyId === undefined}
                  />
                ) : (
                  <span>{dataSource.invOrganizationName}</span>
                )
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {supplierEditFlag
                ? getFieldDecorator('supplierNum', {
                    initialValue: dataSource.supplierNum,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('entity.supplier.tag').d('供应商'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SQAM.SUPPLIER_COMPANY"
                      onChange={(_, record = {}) => {
                        registerField('supplierId');
                        registerField('supplierName');
                        registerField('supplierNum');
                        registerField('supplierTenantId');
                        registerField('supplierStashNum');
                        registerField('extSupplierId');
                        registerField('supplierCompanyId');
                        setFieldsValue({
                          supplierName: record?.erpSupplierName || record?.supplierName || null,
                          supplierId: record?.supplierId || null,
                          supplierNum: record?.supplierNum || null,
                          supplierTenantId: record?.supplierTenantId || null,
                          supplierStashNum: record?.supplierNum || null,
                          extSupplierId: record?.extSupplierId || null,
                          supplierCompanyId: record?.supplierCompanyId || null,
                        });
                        if (handleSetRecord) handleSetRecord(record);
                        if (remoteProps?.event) {
                          remoteProps.event.fireEvent('handleUpdateSupplierCux', {
                            record,
                            dataSource,
                            form,
                            getDefaultFromCompany,
                          });
                        }
                      }}
                      textValue={dataSource.supplierName || getFieldValue('supplierName')}
                      // lovOptions={{
                      //   displayField: 'displayName',
                      //   valueField: 'companyId',
                      // }}
                      queryParams={{
                        tenantId,
                        companyId,
                        ...supplierLovPara,
                      }}
                      disabled={companyId === undefined || disabledFieldList?.includes('supplier')}
                    />
                  )
                : getFieldDecorator('supplierNum', {
                    initialValue: dataSource.supplierNum,
                  })(<span>{dataSource.supplierName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.dataSource`).d('创建方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCode', {
                initialValue: newFlag ? 'MANUAL' : dataSource.sourceCode,
              })(<span>{newFlag ? sourceMeaning : dataSource.sourceCodeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.item.code`).d('物料编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('itemCode', {
                initialValue: dataSource.itemCode,
              })(
                <Lov
                  code="SQAM.ITEM"
                  onChange={(val, record = {}) => onSetItemName(record)}
                  textValue={dataSource.itemCode}
                  queryParams={{ tenantId }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.item.name`).d('物料名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('itemName', {
                initialValue: dataSource.itemName,
              })(<Input value={dataSource.itemName} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.icaDemandDate`).d('ICA要求时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('icaDemandDate', {
                initialValue: newFlag ? icaDate : moment(dataSource.icaDemandDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.icaDemandDate`).d('ICA要求时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  placeholder=""
                  format={timeFormat}
                  // disabledDate={(date) =>
                  //   getFieldValue('creationDate') &&
                  //   moment(getFieldValue('creationDate')).isAfter(date, 'second')
                  // }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.pcaDemandDate`).d('PCA要求日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcaDemandDate', {
                initialValue: newFlag
                  ? pcaDate
                  : dataSource.pcaDemandDate
                  ? moment(dataSource.pcaDemandDate)
                  : null,

                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.pcaDemandDate`).d('PCA要求日期'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  format={dateFormat}
                  placeholder={intl.get(`hzero.hzeroUI.Calendar.lang.placeholder`).d('请选择日期')}
                  disabledDate={(date) =>
                    getFieldValue('icaDemandDate') &&
                    moment(getFieldValue('icaDemandDate')).isAfter(date, 'second')
                  }
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.publishedName`).d('发布人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('publishedBy')(<span>{dataSource.publishedName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purOrganizationId', {
                initialValue: dataSource.purOrganizationId,
              })(
                (newFlag && notFromInComing) || sourceEditFlag ? (
                  <Lov
                    code="SPFM.USER_AUTH.PURCHASE_ORG"
                    disabled={!companyId}
                    textValue={
                      dataSource.purOrganizationName || getFieldValue('purOrganizationName')
                    }
                    queryParams={{
                      companyId,
                      ouId: getFieldValue('ouId'),
                      tenantId,
                    }}
                    onChange={async (_, { purchaseOrgId }) => {
                      let res = null;
                      if (purchaseOrgId) {
                        res = getResponse(await getDefaultFromPurOrg({ purchaseOrgId }));
                      }
                      const { purchaseAgentId, purchaseAgentName } = res || {};
                      registerField('purAgentName');
                      registerField('purAgentId');
                      setFieldsValue({
                        purAgentId: purchaseAgentId,
                        purAgentName: purchaseAgentName,
                      });
                    }}
                  />
                ) : (
                  <span>{dataSource.purOrganizationName}</span>
                )
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.common.purchaseAgent`).d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purAgentId', {
                initialValue: dataSource.purAgentId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PUR_ORG_AGENT"
                  lovOptions={{ valueField: 'purchaseAgentId' }}
                  textValue={dataSource.purAgentName || getFieldValue('purAgentName')}
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
            <Form.Item
              label={intl.get(`${prefix}.unitName`).d('所属部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('unitId', {
                initialValue: dataSource.unitId,
              })(
                <Lov
                  code="SPRM.USER_DEPARTMENT"
                  queryParams={{ tenantId }}
                  textValue={dataSource.unitName}
                  disabled={getFieldValue('problemNum') === undefined}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.qualityRectification.specifications`).d('规格')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('specifications', {
                initialValue: dataSource.specifications,
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.qualityRectification.model`).d('型号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('model', {
                initialValue: dataSource.model,
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.remark`).d('备注')}>
              {getFieldDecorator('remark', {
                initialValue: dataSource.remark,
              })(<Input.TextArea rows={2} style={{ height: '56px' }} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {remoteProps &&
              remoteProps.process('SQAM_CREATE8D_DETAIL_CUX_BASIC', '', {
                basicInfo: dataSource,
                form,
              })}
          </Col>
        </Row>
        {remoteProps &&
          remoteProps.process(`SQAM_CREATE8D_DETAIL_CUX_BASIC_RENDER`, '', {
            basicInfo: dataSource,
            form,
            newFlag,
          })}
      </Form>
    );
  }
}
