/**
 * Header - 手工创建订单-新
 * @date: 2020-11-18
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Form, Input, Row, Col, Spin } from 'hzero-ui';

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
import {
  dateTimeRender, // 日期时间格式化
} from 'hzero-front/lib/utils/renderer';
import { formatAumont } from '@/routes/components/utils';
import styles from '../../components/index.less';
// import DisplayFormItem from '../../components/DisplayFormItem';

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
export default class PurchaseRequestHeader extends Component {
  constructor(props) {
    super(props);
    // const {
    //   location: { search },
    // } = this.props;
    // const {sourcePage } = querystring.parse(search.substr(1));
    this.state = {
      userId: getCurrentUserId(),
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      //  sourcePage,
    };
    props.onRef(this);
  }

  /**
   * 供应商lov改变回调
   * @param {Object} lovRecord
   */
  @Bind()
  supplierOnChange(lovRecord) {
    const { onChangeListData, onChangeSupplierLov } = this.props;
    onChangeSupplierLov(lovRecord);
    onChangeListData(lovRecord);
  }

  /**
   * 结算供应商lov改变回调
   * @param {*} lovRecord
   */
  @Bind()
  settleSupplierOnChange(lovRecord) {
    const { onChangeSettleSupplierLov } = this.props;
    onChangeSettleSupplierLov(lovRecord);
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
   * 公司物料改变回调
   * @param {Object} lovRecord
   */
  @Bind()
  companyOnchange(lovRecord) {
    const { onChangeCompany } = this.props;
    onChangeCompany(lovRecord);
  }

  /**
   * 业务实体改变回调
   * @param {Object} lovRecord
   */
  @Bind()
  ouNameOnchange(lovRecord = {}) {
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
   * 区分手工创建和引用采购申请
   */
  @Bind()
  renderHeaderForm() {
    const { userId, tenantId, organizationId } = this.state;
    const {
      remote,
      form = {},
      dataSource = {},
      poHeaderId,
      stageIdList,
      headerOnChangeForm = (e) => e,
      poFlag,
      onPurchaseOrgChange = (e) => e,
      enableSupplierSiteFlag,
    } = this.props;
    const {
      getFieldDecorator,
      setFieldsValue,
      // registerField,
      getFieldValue,
      getFieldsValue,
    } = form;
    const {
      ouId,
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
      financialPrecision,
      domesticTaxIncludeAmount,
      domesticAmount,
      domesticFinancialPrecision,
      domesticCurrencyCode,
      originalPoNum,
      supplierCompanyId,
      supplierId,
      settleSupplierName,
      settleErpSupplierName,
      settleSupplierId,
      settleSupplierCode,
      settleErpSupplierId,
      settleErpSupplierCode,
      settleSupplierTenantId,
      sourceOfTransferOrderMeaning,
      supplierOrderTypeCode,
      supplierSiteId,
      supplierSiteName,
      sourceBillTypeCodeMeaning,
    } = dataSource;
    const coulmnShowFlag = this.handleHeaderFlag();
    const values = getFieldsValue();
    const formatCreationDate = dateTimeRender(creationDate) || null;
    const remarkRemote = remote ? remote.process('remarkRemote', [], { values }) : null;
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
                <Lov
                  code="SPUC_ORDER_TYPE"
                  textValue={poTypeDesc}
                  textField="poTypeDesc"
                  disabled={poHeaderId}
                  queryParams={{ tenantId, enabledFlag: 1 }}
                  onChange={(_, lovRecord) => {
                    const { orderTypeName, orderTypeCode } = lovRecord;
                    setFieldsValue({
                      poTypeDesc: orderTypeName,
                      orderTypeCode,
                    });
                    headerOnChangeForm(lovRecord);
                  }}
                />
              )}
              {getFieldDecorator('orderTypeCode', { initialValue: dataSource.orderTypeCode })}
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
              {getFieldDecorator('creationDate', {
                initialValue: dataSource.creationDate,
              })(<span>{formatCreationDate}</span>)}
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
                companyName ? (
                  <span>{companyName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.COMPANY"
                    textValue={companyName}
                    lovOptions={{ displayField: 'companyName' }}
                    queryParams={{ tenantId }}
                    onChange={(_, lovRecord) => this.companyOnchange(lovRecord)}
                  />
                )
              )}
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
                poHeaderId && ouName ? (
                  <span>{ouName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.OU"
                    textValue={ouName}
                    lovOptions={{ displayField: 'ouName' }}
                    onChange={(value, lovRecord) => {
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
                <Lov
                  disabled={
                    unSaveEnable === 2 || ((supplierName || supplierCompanyName) && poHeaderId)
                  }
                  code="SODR.AUTH_SUPPLIER_LIFE_CYCLE"
                  textValue={supplierName || supplierCompanyName}
                  queryParams={{ userId, tenantId, organizationId, companyId, stageIdList }}
                  onChange={(value, lovRecord) => this.supplierOnChange(lovRecord)}
                />
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
                poHeaderId && purchaseOrgName ? (
                  <span>{purchaseOrgName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.PUR_OUID_ORG"
                    textValue={purchaseOrgName}
                    queryParams={{ organizationId, ouId: values.ouId || undefined }}
                    // onChange={(_, lovRecord) => this.purchaseOrgOnChange(lovRecord)}
                    onChange={(value, lovRecord) => {
                      onPurchaseOrgChange(lovRecord || {});
                      setFieldsValue({ originalPoHeaderId: null, originalPoNum: null });
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
                <Lov
                  code="SPFM.USER_AUTH.PUR_ORG_AGENT"
                  textValue={agentName}
                  // lovOptions={{ displayField: 'agentName' }}
                  disabled={poHeaderId && agentName}
                  queryParams={{
                    organizationId,
                    purchaseOrgId: values.purchaseOrgId || undefined,
                  }}
                />
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
                poHeaderId && currencyCode ? (
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
              {getFieldDecorator('taxIncludeAmount')(
                <span>
                  {
                    /* {isNumber(taxIncludeAmount)
                    ? ['SRM', 'CATALOGUE', 'SHOP'].includes(poSourcePlatform) &&
                      !!financialPrecision
                      ? taxIncludeAmount.toFixed(financialPrecision)
                      : taxIncludeAmount
                    : ''} */
                    formatAumont(taxIncludeAmount, financialPrecision, true)
                  }
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.amount`).d('不含税总金额')}
            >
              {getFieldDecorator('amount')(
                <span>
                  {
                    /* {isNumber(amount)
                    ? ['SRM', 'CATALOGUE', 'SHOP'].includes(poSourcePlatform) &&
                      !!financialPrecision
                      ? amount.toFixed(financialPrecision)
                      : amount
                    : ''} */
                    formatAumont(amount, financialPrecision, true)
                  }
                </span>
              )}
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
                <Lov
                  onChange={(_, lovRecord) => this.termsOnchange(lovRecord)}
                  code="SMDM.PAYMENT.TERM"
                  textValue={termsName}
                  queryParams={{ tenantId }}
                  disabled={termsName}
                />
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
              {getFieldDecorator('quantityTotal')(<span>{formatAumont(quantityTotal)}</span>)}
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
                initialValue: poSourcePlatform || 'SRM',
              })(<span>{poSourcePlatformMeaning || 'SRM'}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.common.model.commom.sourceBillTypeCodeMeaning`)
                .d('单据来源类别')}
            >
              {getFieldDecorator('sourceBillTypeCode', {
                initialValue: dataSource.sourceBillTypeCode,
              })(<span>{sourceBillTypeCodeMeaning}</span>)}
            </FormItem>
          </Col>
          {poFlag && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl
                  .get(`sodr.quotePurchase.model.quotePurchase.originalPoNum`)
                  .d('原订单号')}
              >
                {getFieldDecorator('originalPoHeaderId', {
                  initialValue: dataSource.originalPoHeaderId,
                })(
                  poHeaderId ? (
                    <span>{originalPoNum}</span>
                  ) : (
                    <Lov
                      code="SPUC.ORIGINAL_PO"
                      textValue={originalPoNum}
                      queryParams={{
                        organizationId,
                        companyId: getFieldValue('companyId'),
                        ouId: getFieldValue('ouId'),
                        tempKey: getFieldValue('tempKey'),
                        purchaseOrgId: getFieldValue('purchaseOrgId'),
                        supplierCompanyId: supplierCompanyId || null,
                        supplierId: supplierId || null,
                      }}
                      disabled={
                        !(
                          getFieldValue('companyId') &&
                          getFieldValue('ouId') &&
                          getFieldValue('tempKey') &&
                          getFieldValue('purchaseOrgId')
                        )
                      }
                    />
                  )
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        {poHeaderId && poSourcePlatform === 'CATALOGUE' && (
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
        )}
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.sourceOfTransferOrder`)
                .d('转单来源')}
            >
              {getFieldDecorator('sourceOfTransferOrder')(
                <span>{sourceOfTransferOrderMeaning}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.settleSupplier`)
                .d('结算供应商')}
            >
              {getFieldDecorator('settleTempKey', {
                initialValue: settleErpSupplierName || settleSupplierName,
              })(
                <Lov
                  // disabled={unSaveEnable === 2}
                  code="SODR.AUTH_SUPPLIER_LIFE_CYCLE"
                  textValue={settleErpSupplierName || settleSupplierName}
                  queryParams={{ userId, tenantId, organizationId, companyId }}
                  onChange={(value, lovRecord) => this.settleSupplierOnChange(lovRecord)}
                />
              )}
              {getFieldDecorator('settleSupplierId', {
                initialValue: settleSupplierId,
              })}
              {getFieldDecorator('settleSupplierCode', {
                initialValue: settleSupplierCode,
              })}
              {getFieldDecorator('settleSupplierName', {
                initialValue: settleSupplierName,
              })}
              {getFieldDecorator('settleErpSupplierId', {
                initialValue: settleErpSupplierId,
              })}
              {getFieldDecorator('settleErpSupplierCode', {
                initialValue: settleErpSupplierCode,
              })}
              {getFieldDecorator('settleErpSupplierName', {
                initialValue: settleErpSupplierName,
              })}
              {getFieldDecorator('settleSupplierTenantId', {
                initialValue: settleSupplierTenantId,
              })}
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
                poHeaderId && domesticCurrencyCode ? (
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
          {enableSupplierSiteFlag === 1 && getFieldValue('supplierId') ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`sodr.common.model.common.supplierSites`).d('供应商地点')}>
                {getFieldDecorator('supplierSiteId', {
                  initialValue: supplierSiteId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.common.model.common.supplierSites`).d('供应商地点'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SODR.SUPPLIER_SITE"
                    disabled={
                      (!getFieldValue('supplierId') && !supplierId) ||
                      (!ouId && !getFieldValue('ouId'))
                    }
                    textValue={supplierSiteName}
                    queryParams={{
                      tenantId,
                      supplierId: supplierId || getFieldValue('supplierId') || -1,
                      ouId: ouId || getFieldValue('ouId'),
                    }}
                  />
                )}
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              className={styles.sodrOrderRemark}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.orderRemark`).d('订单摘要')}
            >
              {getFieldDecorator('remark', {
                initialValue: remark,
                rules: [
                  ...remarkRemote,
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
      // sourcePage,
    } = this.props;
    // const { sourceBillTypeCode, poSourcePlatform } = dataSource;
    return (
      <Spin spinning={(poHeaderId ? loading : null) || newAddLoading}>
        {customizeForm(
          {
            form,
            dataSource,
            code: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
            clearCache: () => {},
          },
          this.renderHeaderForm()
        )}
      </Spin>
    );
  }
}
