/**
 * index - 按行引用创建
 * @date: 2020-11-17
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright 2020, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Form, Input, Row, Col, Spin } from 'hzero-ui';
import classnames from 'classnames';

import { getCurrentOrganizationId, getUserOrganizationId, getCurrentUserId } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
} from 'utils/constants';
// import { numberRender } from 'utils/renderer';

import { formatAumont } from '@/routes/components/utils';
import styles from '../../../components/index.less';

const { TextArea } = Input;
const FormItem = Form.Item;

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */

@connect(({ quotePurchaseRequisition, loading }) => ({
  quotePurchaseRequisition,
  loadingPriceList: loading.effects['quotePurchaseRequisition/priceList'],
}))
@Form.create({ fieldNameProp: null })
export default class PurchaseRequestHeader extends Component {
  constructor(props) {
    super(props);
    const { onRef, form } = this.props;
    this.state = {
      userId: getCurrentUserId(),
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      //  sourcePage,
    };
    onRef(form);
  }

  /**
   * 供应商lov改变回调
  //  * @param {Object} lovRecord
   */
  @Bind()
  supplierOnChange(lovRecord) {
    const { onChangeListData, onChangeSupplierLov } = this.props;
    onChangeSupplierLov(lovRecord);
    onChangeListData(lovRecord);
  }

  /**
   * 公司物料改变回调
   * @param {Object} lovRecord
   */
  @Bind()
  companyOnchange(lovRecord, form) {
    const { onChangeCompany } = this.props;
    onChangeCompany(lovRecord, form);
  }

  /**
   * 业务实体改变回调
   * @param {Object} lovRecord
   */
  @Bind()
  ouNameOnchange(lovRecord) {
    const { onOuNameOnchange } = this.props;
    onOuNameOnchange(lovRecord);
  }

  /**
   * 渲染头信息高亮标识
   * boolean
   */
  @Bind()
  handleHeaderFlag() {
    const { dataSource = {}, poHeaderId, sourcePage } = this.props;
    const { unSaveEnable } = dataSource; // 采购申请头信息唯一高亮标识
    let flag;
    switch (sourcePage) {
      case 'pageRequest': // 采购申请取反逻辑
        if (unSaveEnable) {
          flag = false;
        } else {
          flag = true;
        }
        break;
      case 'pageOrder':
        if (poHeaderId) {
          flag = true;
        } else {
          flag = false;
        }
        break;
      default:
        flag = true;
        break;
    }
    return flag;
  }

  /**
   * 采购申请和引用采购申请唯一需要区分的点:订单类型
   */
  @Bind()
  handlePotype() {
    const { sourcePage } = this.props;
    const flag = this.handleHeaderFlag();
    let poTypeFlag = flag && sourcePage !== 'pageOrder';
    if (poTypeFlag && sourcePage === 'pageRequest') {
      poTypeFlag = false;
    }
    return poTypeFlag;
  }

  /**
   * 付款条款改变回调
   * @param {Object} lovRecord
   */
  @Bind()
  termsOnchange(lovRecord) {
    const { termsOnchange } = this.props;
    termsOnchange(lovRecord);
  }

  /**
   * 区分手工创建和引用采购申请
   */
  @Bind()
  renderHeaderForm() {
    const { userId, tenantId, organizationId } = this.state;
    const {
      form = {},
      dataSource = {},
      poHeaderId,
      headerOnChangeForm = (e) => e,
      sourcePage,
      validataOrg = (e) => e,
    } = this.props;
    const {
      getFieldDecorator,
      setFieldsValue,
      registerField,
      getFieldsValue,
      getFieldValue,
    } = form;
    const {
      ouName,
      displayPoNum,
      poSourcePlatformMeaning,
      poSourcePlatform,
      amount,
      unSaveEnable,
      termsName,
      creationDate,
      purchaseOrgName,
      remark,
      agentName,
      poTypeDesc,
      supplierName,
      supplierCompanyName,
      termsId,
      companyId,
      companyName,
      currencyCode,
      taxIncludeAmount,
      shipToLocationAddress,
      billToLocationAddress,
      quantityTotal,
      originalPoNum,
      domesticTaxIncludeAmount,
      domesticCurrencyCode,
      domesticAmount,
      domesticFinancialPrecision,
      sourceOfTransferOrder,
      sourceOfTransferOrderMeaning,
      supplierOrderTypeCode,
      supplierId,
      supplierCompanyId,
    } = dataSource;
    const coulmnShowFlag = this.handleHeaderFlag();
    const values = getFieldsValue();
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="inclusion-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.poTypeDesc`).d('订单类型')}
            >
              {getFieldDecorator('poTypeId', {
                initialValue: dataSource.poTypeId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.poTypeDesc`)
                        .d('订单类型'),
                    }),
                  },
                ],
              })(
                this.handlePotype() ? (
                  <span>{poTypeDesc}</span>
                ) : (
                  <Lov
                    code="SPUC_ORDER_TYPE"
                    textValue={poTypeDesc}
                    textField="poTypeDesc"
                    disabled={poHeaderId && sourcePage === 'pageOrder'}
                    queryParams={{ tenantId, enabledFlag: 1 }}
                    onChange={(_, { orderTypeName, orderTypeCode, returnOrderFlag }) => {
                      registerField('poTypeCode');
                      setFieldsValue({
                        poTypeDesc: orderTypeName,
                        poTypeCode: orderTypeCode,
                      });
                      headerOnChangeForm(returnOrderFlag);
                    }}
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.displayPoNum`).d('订单号')}
            >
              {getFieldDecorator('displayPoNum', { initialValue: displayPoNum })(
                <span>{displayPoNum}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.creationDate`).d('创建时间')}
            >
              {getFieldDecorator('creationDate')(<span>{creationDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={coulmnShowFlag ? 'read-row' : 'writable-row'}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.companyName`).d('公司')}
            >
              {getFieldDecorator('companyId', {
                initialValue: dataSource.companyId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.companyName`)
                        .d('公司'),
                    }),
                  },
                ],
              })(
                coulmnShowFlag && companyName ? (
                  <span>{companyName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.COMPANY"
                    textValue={companyName}
                    lovOptions={{ displayField: 'companyName' }}
                    queryParams={{ tenantId }}
                    onChange={(_, lovRecord) => this.companyOnchange(lovRecord, form)}
                  />
                )
              )}
              {getFieldDecorator('companyCode', { initialValue: dataSource.companyCode })}
              {getFieldDecorator('companyName', { initialValue: dataSource.companyName })}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.ouName`).d('业务实体')}
            >
              {getFieldDecorator('ouId', {
                initialValue: dataSource.ouId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.quotePurchase.model.quotePurchase.ouName`).d('业务实体'),
                    }),
                  },
                ],
              })(
                coulmnShowFlag && ouName ? (
                  <span>{ouName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.OU"
                    textValue={ouName}
                    lovOptions={{ displayField: 'ouName' }}
                    onChange={(value, lovRecord) => {
                      if (value && values.purchaseOrgId) {
                        validataOrg('ouId', { ouId: value, purchaseOrgId: values.purchaseOrgId });
                      }
                      this.ouNameOnchange(lovRecord);
                    }}
                    queryParams={{
                      tenantId,
                      organizationId,
                      companyId: form.getFieldValue('companyId'),
                    }}
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.supplier`).d('供应商')}
            >
              {getFieldDecorator('tempKey', {
                initialValue: supplierName || supplierCompanyName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.quotePurchase.model.quotePurchase.supplier`).d('供应商'),
                    }),
                  },
                ],
              })(
                coulmnShowFlag && (supplierName || supplierCompanyName) ? (
                  <span>{supplierName || supplierCompanyName}</span>
                ) : (
                  <Lov
                    disabled={unSaveEnable === 2 && companyId === getFieldValue('companyId')}
                    code="SODR.AUTH_SUPPLIER_LIFE_CYCLE"
                    textValue={supplierName || supplierCompanyName}
                    queryParams={{ userId, tenantId, organizationId, companyId }}
                    onChange={(value, lovRecord) => this.supplierOnChange(lovRecord)}
                  />
                )
              )}
              {getFieldDecorator('supplierId', { initialValue: supplierId })}
              {getFieldDecorator('supplierCompanyId', { initialValue: supplierCompanyId })}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={coulmnShowFlag ? 'read-row' : 'writable-row'}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.purchaseOrgName`)
                .d('采购组织')}
            >
              {getFieldDecorator('purchaseOrgId', {
                initialValue: dataSource.purchaseOrgId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.purchaseOrgName`)
                        .d('采购组织'),
                    }),
                  },
                ],
              })(
                coulmnShowFlag && purchaseOrgName ? (
                  <span>{purchaseOrgName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.PUR_OUID_ORG"
                    textValue={purchaseOrgName}
                    queryParams={{ organizationId, ouId: values.ouId || undefined }}
                    onChange={(value) => {
                      if (value && values.agentId) {
                        validataOrg('purchaseOrgId', {
                          purchaseOrgId: value,
                          agentId: values.agentId,
                        });
                      }
                    }}
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.agentName`).d('采购员')}
            >
              {getFieldDecorator('agentId', {
                initialValue: dataSource.agentId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.agentName`)
                        .d('采购员'),
                    }),
                  },
                ],
              })(
                coulmnShowFlag && agentName ? (
                  <span>{agentName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.PUR_ORG_AGENT"
                    textValue={agentName}
                    // lovOptions={{ displayField: 'agentName' }}
                    queryParams={{
                      organizationId,
                      purchaseOrgId: values.purchaseOrgId || undefined,
                    }}
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.currencyCode`).d('币种')}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: dataSource.currencyCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.currencyCode`)
                        .d('币种'),
                    }),
                  },
                ],
              })(
                coulmnShowFlag && currencyCode ? (
                  <span>{currencyCode}</span>
                ) : (
                  <Lov
                    code="SPRM.EXCHANGE_RATE.CURRENCY"
                    lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                    textValue={currencyCode}
                  />
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.taxIncludeAmount`)
                .d('含税总金额')}
            >
              {getFieldDecorator('taxIncludeAmount')(<span>{formatAumont(taxIncludeAmount)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.amount`).d('不含税总金额')}
            >
              {getFieldDecorator('amount')(<span>{formatAumont(amount)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.terms`).d('付款条款')}
            >
              {getFieldDecorator('termsId', {
                initialValue: termsId,
              })(
                coulmnShowFlag && termsName ? (
                  <span>{termsName}</span>
                ) : (
                  <Lov
                    onChange={(_, lovRecord) => this.termsOnchange(lovRecord)}
                    code="SMDM.PAYMENT.TERM"
                    textValue={termsName}
                    queryParams={{ tenantId }}
                  />
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('sodr.common.model.common.totalQuantity').d('总数量')}
            >
              {getFieldDecorator('quantityTotal')(<span>{quantityTotal}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.PlatformMeaning`)
                .d('来源平台')}
            >
              {getFieldDecorator('poSourcePlatform', {
                initialValue: poSourcePlatform,
              })(<span>{poSourcePlatformMeaning || 'SRM'}</span>)}
            </FormItem>
          </Col>
          {originalPoNum && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl
                  .get(`sodr.quotePurchase.model.quotePurchase.originalPoNum`)
                  .d('原订单号')}
              >
                {getFieldDecorator('originalPoHeaderId')(<span>{originalPoNum}</span>)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.shipToLocationAddress`)
                .d('收货方地址')}
            >
              {getFieldDecorator('shipToLocationAddress')(<span>{shipToLocationAddress}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.billToLocationAddress`)
                .d('收单方地址')}
            >
              {getFieldDecorator('billToLocationAddress')(<span>{billToLocationAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.domesticCurrencyCode`)
                .d('本币币种')}
            >
              {getFieldDecorator('domesticCurrencyCode', {
                initialValue: domesticCurrencyCode,
              })(
                coulmnShowFlag && domesticCurrencyCode ? (
                  <span>{domesticCurrencyCode}</span>
                ) : (
                  <Lov
                    code="SPRM.EXCHANGE_RATE.CURRENCY"
                    lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                    textValue={domesticCurrencyCode}
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.domesticTaxIncludeAmount`)
                .d('本币含税金额')}
            >
              {getFieldDecorator('domesticTaxIncludeAmount')(
                <span>
                  {formatAumont(domesticTaxIncludeAmount, domesticFinancialPrecision, true)}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.domesticAmount`)
                .d('本币不含税金额')}
            >
              {getFieldDecorator('domesticAmount')(
                <span>{formatAumont(domesticAmount, domesticFinancialPrecision, true)}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.supplierOrderTypeCode`)
                .d('京东e卡-code')}
            >
              {getFieldDecorator('supplierOrderTypeCode', {
                initialValue: supplierOrderTypeCode,
              })(<span>{supplierOrderTypeCode}</span>)}
            </FormItem>
          </Col>
        </Row>
        {!!sourceOfTransferOrder && (
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`sodr.quotePurchase.model.quotePurchase.sourceOfTransferOrder`)
                  .d('转单来源')}
              >
                {getFieldDecorator('sourceOfTransferOrder', {
                  initialValue: sourceOfTransferOrder,
                })(<span>{sourceOfTransferOrderMeaning}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              className={styles.sodrOrderRemark}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.orderRemark`).d('订单摘要')}
            >
              {getFieldDecorator('remark', {
                initialValue: remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<TextArea rows={2} style={{ height: '56px' }} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      form = {},
      dataSource = {},
      loading,
      poHeaderId,
      newAddLoading,
      customizeForm,
      sourcePage,
    } = this.props;
    const { poSourcePlatform } = dataSource;
    return (
      <Spin spinning={(poHeaderId ? loading : null) || newAddLoading}>
        {['SRM', 'SHOP', 'ERP'].includes(poSourcePlatform) || sourcePage === 'pageOrder'
          ? customizeForm(
              {
                form,
                dataSource,
                code: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
              },
              this.renderHeaderForm()
            )
          : this.renderHeaderForm()}
      </Spin>
    );
  }
}
