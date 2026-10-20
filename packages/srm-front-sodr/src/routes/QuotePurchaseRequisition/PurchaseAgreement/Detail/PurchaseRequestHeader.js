/**
 * LineCreation - 按行引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
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
import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
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
export default class PurchaseRequestHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      userId: getCurrentUserId(),
      // flag: true,
    };
    props.onRef(this);
  }

  /**
   * 供应商lov改变回调
   * @param {Object} lovRecord
   */
  // @Bind()
  // supplierOnChange(lovRecord) {
  //   const {
  //     onChangeListData,
  //     listCommonDataSource,
  //     dataSource,
  //     dispatch,
  //     onFetchFlag,
  //     handleChangeList,
  //     requisitionCount,
  //     orderMainCount,
  //     source,
  //     onChangeSupplierLov,
  //     onChangeSupplierCount,
  //     onChangeSupplierFlag,
  //     supplierFlag,
  //   } = this.props;
  //   const { companyId, ouId } = dataSource;
  //   onChangeSupplierLov(lovRecord);
  //   onChangeListData(lovRecord);
  //   if (listCommonDataSource !== undefined) {
  //     const itemIdList = listCommonDataSource.map((item) => item.itemId);
  //     // 查询价格库
  //     dispatch({
  //       type: 'quotePurchaseRequisition/fetchSettings',
  //     }).then((item) => {
  //       if (item) {
  //         if (item['010203'] === '1') {
  //           // 供应商Lov改变时调用接口查询价格库,如果查出有数据则将里面的单位，币种，税种，不含税单价和原币含税单价覆盖
  //           dispatch({
  //             type: 'quotePurchaseRequisition/priceList',
  //             payload: {
  //               supplierCompanyId: lovRecord.supplierCompanyId,
  //               companyId,
  //               ouId,
  //               itemIdList,
  //               libraryFlag: item['010203'],
  //             },
  //           }).then((res) => {
  //             if (res) {
  //               let newDataSource = listCommonDataSource;
  //               // 订单维护
  //               if (source === 'maintain') {
  //                 if (
  //                   dataSource.supplierCompanyId &&
  //                   dataSource.supplierCompanyId === lovRecord.supplierCompanyId
  //                 ) {
  //                   newDataSource = listCommonDataSource;
  //                   if (supplierFlag) {
  //                     onChangeSupplierFlag(false);
  //                     onChangeSupplierCount(orderMainCount + 1);
  //                   }
  //                 } else if (orderMainCount !== 1) {
  //                   onChangeSupplierCount(orderMainCount + 1);
  //                   newDataSource = listCommonDataSource;
  //                 } else {
  //                   listCommonDataSource.forEach((e) => {
  //                     if (e.$form) {
  //                       e.$form.setFieldsValue({
  //                         uomId: null,
  //                         uomName: null,
  //                         taxId: null,
  //                         taxRate: null,
  //                         currencyCode: null,
  //                         unitPrice: null,
  //                         enteredTaxIncludedPrice: null,
  //                         priceLibraryId: null,
  //                       });
  //                     }
  //                   });
  //                   newDataSource = newDataSource.map((val) => {
  //                     return {
  //                       ...val,
  //                       uomId: null,
  //                       uomName: null,
  //                       taxId: null,
  //                       taxRate: null,
  //                       currencyCode: null,
  //                       unitPrice: null,
  //                       enteredTaxIncludedPrice: null,
  //                       priceLibraryId: null,
  //                     };
  //                   });
  //                 }
  //               }
  //               // 引用采购申请
  //               if (source === 'requisition') {
  //                 if (
  //                   dataSource.supplierCompanyId &&
  //                   dataSource.supplierCompanyId === lovRecord.supplierCompanyId
  //                 ) {
  //                   newDataSource = listCommonDataSource;
  //                   if (supplierFlag) {
  //                     onChangeSupplierFlag(false);
  //                     onChangeSupplierCount(requisitionCount + 1);
  //                   }
  //                 } else if (requisitionCount !== 2) {
  //                   onChangeSupplierCount(requisitionCount + 1);
  //                   newDataSource = listCommonDataSource;
  //                 } else {
  //                   listCommonDataSource.forEach((e) => {
  //                     if (e.$form) {
  //                       e.$form.setFieldsValue({
  //                         uomId: null,
  //                         uomName: null,
  //                         taxId: null,
  //                         taxRate: null,
  //                         currencyCode: null,
  //                         unitPrice: null,
  //                         enteredTaxIncludedPrice: null,
  //                         priceLibraryId: null,
  //                       });
  //                     }
  //                   });
  //                   newDataSource = newDataSource.map((val) => {
  //                     return {
  //                       ...val,
  //                       uomId: null,
  //                       uomName: null,
  //                       taxId: null,
  //                       taxRate: null,
  //                       currencyCode: null,
  //                       unitPrice: null,
  //                       enteredTaxIncludedPrice: null,
  //                       priceLibraryId: null,
  //                     };
  //                   });
  //                 }
  //               }
  //               const { content = [] } = res;
  //               if (isArray(content) && !isEmpty(content)) {
  //                 content.forEach((n) => {
  //                   const price = n.unitPrice * (1 + n.taxRate / 100);
  //                   newDataSource = newDataSource.map((val) => {
  //                     if (n.itemId === val.itemId) {
  //                       if (val.$form) {
  //                         val.$form.setFieldsValue({
  //                           uomId: n.uomId,
  //                           uomName: n.uomName,
  //                           taxId: n.taxId,
  //                           taxRate: n.taxRate,
  //                           currencyCode: n.currencyCode,
  //                           unitPrice: n.unitPrice,
  //                           enteredTaxIncludedPrice: price,
  //                           priceLibraryId: n.priceLibraryId,
  //                         });
  //                       }
  //                       return {
  //                         ...val,
  //                         uomId: n.uomId,
  //                         uomName: n.uomName,
  //                         taxId: n.taxId,
  //                         taxRate: n.taxRate,
  //                         currencyCode: n.currencyCode,
  //                         unitPrice: n.unitPrice,
  //                         enteredTaxIncludedPrice: price,
  //                         priceLibraryId: n.priceLibraryId,
  //                       };
  //                     }
  //                     return val;
  //                   });
  //                 });
  //                 // 用于判断是否调用接口且有返回数据。行信息要用来判断disabled
  //                 onFetchFlag(this.state.flag);
  //               } else {
  //                 if (source === 'requisition') {
  //                   if (requisitionCount !== 2) {
  //                     newDataSource = listCommonDataSource;
  //                   }
  //                 }
  //                 if (source === 'maintain') {
  //                   if (orderMainCount !== 1) {
  //                     newDataSource = listCommonDataSource;
  //                   }
  //                 }
  //                 onFetchFlag(!this.state.flag);
  //               }
  //               handleChangeList(newDataSource);
  //             }
  //           });
  //         }
  //       }
  //     });
  //   }
  // }

  /**
   * 公司物料改变回调
   * @param {Object} lovRecord
   */
  // @Bind()
  // companyOnchange(lovRecord) {
  //   const { onChangeCompany } = this.props;
  //   onChangeCompany(lovRecord);
  // }

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
   * 结算供应商lov改变回调
   * @param {*} lovRecord
   */
  @Bind()
  settleSupplierOnChange(lovRecord) {
    const { onChangeSettleSupplierLov } = this.props;
    onChangeSettleSupplierLov(lovRecord);
  }

  /**
   * 币种改变回调
   * @param {String} value
   */
  // @Bind()
  // handleChangeCurrencyCode(value) {
  //   const {
  //     handleChangeList,
  //     listCommonDataSource = [],
  //   } = this.props;
  //   const newListDataSource = listCommonDataSource.map((item) => {
  //     if (
  //       item.priceLibraryId ||
  //       item.$form.getFieldValue('priceLibraryId') ||
  //       item.currencyCode
  //     ) {
  //       // 若币种是disabled状态则原样返回，否则用头上币种覆盖行上币种
  //       return item;
  //     } else {
  //       item.$form.setFieldsValue({ currencyCode: value });
  //       return { ...item, currencyCode: value };
  //     }
  //   });
  //   handleChangeList(newListDataSource);
  // }

  /**
   * 付款条款改变回调
   * @param {Object} lovRecord
   */
  @Bind()
  termsOnchange(lovRecord) {
    const { termsOnchange } = this.props;
    termsOnchange(lovRecord);
  }

  @Bind()
  renderHeaderForm() {
    const { tenantId, organizationId, userId } = this.state;
    const {
      form = {},
      dataSource = {},
      headerOnChangeForm = (e) => e,
      enableSupplierSiteFlag,
    } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const {
      ouId,
      ouName,
      displayPoNum,
      poSourcePlatformMeaning,
      amount,
      termsName,
      creationDate,
      purchaseOrgName,
      remark,
      agentName,
      poTypeDesc,
      supplierId,
      supplierName,
      supplierCompanyName,
      termsId,
      companyId,
      companyName,
      currencyCode,
      taxIncludeAmount,
      quantityTotal,
      financialPrecision,
      domesticFinancialPrecision,
      domesticTaxIncludeAmount,
      domesticCurrencyCode,
      domesticAmount,
      supplierOrderTypeCode,
      supplierSiteId,
      supplierSiteName,
      settleSupplierName,
      settleErpSupplierName,
      settleSupplierId,
      settleSupplierCode,
      settleErpSupplierId,
      settleErpSupplierCode,
      settleSupplierTenantId,
      sourceBillTypeCodeMeaning,
      sourceBillTypeCode,
      supplierCompanyId,
    } = dataSource;
    const formatCreationDate = dateTimeRender(creationDate) || null;
    // const isContractSource =
    //   sourceBillTypeCode === 'CONTRACT_ORDER' || sourceBillTypeCode === 'SOURCE';
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
                  queryParams={{ tenantId, enabledFlag: 1 }}
                  onChange={(_, { orderTypeName, orderTypeCode, returnOrderFlag }) => {
                    setFieldsValue({
                      poTypeDesc: orderTypeName,
                      orderTypeCode,
                    });
                    headerOnChangeForm(returnOrderFlag);
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
              {getFieldDecorator('displayPoNum')(<span>{displayPoNum}</span>)}
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
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
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
                // isContractSource ||
                // companyFlag === 1 ? (
                <span>{companyName}</span>
                // ) : (
                //   <Lov
                //     code="SPFM.USER_AUTH.COMPANY"
                //     textValue={companyName}
                //     lovOptions={{ displayField: 'companyName' }}
                //     queryParams={{ tenantId }}
                //     onChange={(_, lovRecord) => this.companyOnchange(lovRecord)}
                //   />
                // )
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
                ouName ? (
                  <span>{ouName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.OU"
                    textValue={ouName}
                    lovOptions={{ displayField: 'ouName' }}
                    onChange={(_, lovRecord) => this.ouNameOnchange(lovRecord)}
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
                // isContractSource ? (
                <span>{supplierName || supplierCompanyName}</span>
                // ) : (
                //   <Lov
                //     code="SODR.AUTH_SUPPLIER_LIFE_CYCLE"
                //     textValue={supplierName || supplierCompanyName}
                //     queryParams={{ userId, tenantId, organizationId, companyId }}
                //     onChange={(value, lovRecord) => this.supplierOnChange(lovRecord)}
                //   />
                // )
              )}
              {getFieldDecorator('supplierId', { initialValue: supplierId })}
              {getFieldDecorator('supplierCompanyId', { initialValue: supplierCompanyId })}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
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
                dataSource.purchaseOrgId ? (
                  <span>{purchaseOrgName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.PURORG"
                    textValue={purchaseOrgName}
                    queryParams={{ organizationId, ouId: getFieldValue('ouId') || undefined }}
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
                  disabled={dataSource.agentId}
                  queryParams={{
                    organizationId,
                    purchaseOrgId: getFieldValue('purchaseOrgId') || undefined,
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
                // isContractSource ? (
                <span>{currencyCode}</span>
                // ) : (
                //   <Lov
                //     code="SPRM.EXCHANGE_RATE.CURRENCY"
                //     lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                //     textValue={currencyCode}
                //     onChange={(value) => this.handleChangeCurrencyCode(value)}
                //   />
                // )
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
              {getFieldDecorator('poSourcePlatform')(
                <span>{poSourcePlatformMeaning || 'SRM'}</span>
              )}
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
                initialValue: sourceBillTypeCode,
              })(<span>{sourceBillTypeCodeMeaning}</span>)}
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
              })(<span>{domesticCurrencyCode}</span>)}
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
          {enableSupplierSiteFlag === 1 && getFieldValue('supplierId') && getFieldValue('ouId') ? (
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
                    textValue={supplierSiteName}
                    queryParams={{
                      tenantId,
                      ouId: ouId || getFieldValue('ouId'),
                      supplierId: supplierId || getFieldValue('supplierId') || -1,
                    }}
                  />
                )}
              </FormItem>
            </Col>
          ) : null}
        </Row>
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
    const { form = {}, dataSource = {}, loading, poHeaderId, customizeForm } = this.props;
    return (
      <Spin spinning={poHeaderId ? loading : null}>
        {customizeForm(
          {
            form,
            dataSource,
            code: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
            __force_record_to_update__: true,
            clearCache: () => {},
          },
          this.renderHeaderForm()
        )}
      </Spin>
    );
  }
}
