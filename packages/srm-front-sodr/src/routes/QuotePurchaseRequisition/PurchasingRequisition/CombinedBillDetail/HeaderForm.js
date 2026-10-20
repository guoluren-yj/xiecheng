/**
 * HeaderForm - 目录化明细头
 * @date: 2020-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray } from 'lodash';
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

import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
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
  loadingPriceList: loading.effects['quotePurchaseRequisition/linePriceList'],
}))
@Form.create({ fieldNameProp: null })
export default class PurchaseRequestHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userId: getCurrentUserId(),
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      flag: true,
    };
    props.onRef(this);
  }

  /**
   * 供应商lov改变回调
   * @param {Object} lovRecord
   */
  @Bind()
  supplierOnChange(lovRecord) {
    const {
      onChangeListData,
      listCommonDataSource,
      dataSource,
      dispatch,
      onFetchFlag,
      handleChangeList,
      requisitionCount,
      orderMainCount,
      source,
      onChangeSupplierLov,
      onChangeSupplierCount,
      onChangeSupplierFlag,
      supplierFlag,
    } = this.props;
    const { companyId, ouId, supplierId } = dataSource;
    onChangeSupplierLov(lovRecord);
    onChangeListData(lovRecord);
    if (listCommonDataSource !== undefined) {
      const itemIdList = listCommonDataSource.map((item) => item.itemId);
      // 查询价格库
      dispatch({
        type: 'quotePurchaseRequisition/fetchSettings',
      }).then((item) => {
        if (item) {
          if (item['010203'] === '1') {
            // 供应商Lov改变时调用接口查询价格库,如果查出有数据则将里面的单位，币种，税种，不含税单价和原币含税单价覆盖
            dispatch({
              type: 'quotePurchaseRequisition/linePriceList',
              payload: {
                supplierCompanyId: lovRecord.supplierCompanyId,
                companyId,
                ouId,
                itemIdList,
                libraryFlag: item['010203'],
                localSupplierCompanyId: supplierId,
              },
            }).then((res) => {
              if (res) {
                let newDataSource = listCommonDataSource;
                // 订单维护
                if (source === 'maintain') {
                  if (
                    dataSource.supplierCompanyId &&
                    dataSource.supplierCompanyId === lovRecord.supplierCompanyId
                  ) {
                    newDataSource = listCommonDataSource;
                    if (supplierFlag) {
                      onChangeSupplierFlag(false);
                      onChangeSupplierCount(orderMainCount + 1);
                    }
                  } else if (orderMainCount !== 1) {
                    onChangeSupplierCount(orderMainCount + 1);
                    newDataSource = listCommonDataSource;
                  } else {
                    listCommonDataSource.forEach((e) => {
                      if (e.$form) {
                        e.$form.setFieldsValue({
                          uomId: null,
                          uomName: null,
                          taxId: null,
                          taxRate: null,
                          currencyCode: null,
                          unitPrice: null,
                          enteredTaxIncludedPrice: null,
                          priceLibraryId: null,
                        });
                      }
                    });
                    newDataSource = newDataSource.map((val) => {
                      return {
                        ...val,
                        uomId: null,
                        uomName: null,
                        taxId: null,
                        taxRate: null,
                        currencyCode: null,
                        unitPrice: null,
                        enteredTaxIncludedPrice: null,
                        priceLibraryId: null,
                      };
                    });
                  }
                }
                // 引用采购申请
                if (source === 'requisition') {
                  if (
                    dataSource.supplierCompanyId &&
                    dataSource.supplierCompanyId === lovRecord.supplierCompanyId
                  ) {
                    newDataSource = listCommonDataSource;
                    if (supplierFlag) {
                      onChangeSupplierFlag(false);
                      onChangeSupplierCount(requisitionCount + 1);
                    }
                  } else if (requisitionCount !== 2) {
                    onChangeSupplierCount(requisitionCount + 1);
                    newDataSource = listCommonDataSource;
                  } else {
                    listCommonDataSource.forEach((e) => {
                      if (e.$form) {
                        e.$form.setFieldsValue({
                          uomId: null,
                          uomName: null,
                          uomCodeAndName: null,
                          taxId: null,
                          taxRate: null,
                          currencyCode: null,
                          unitPrice: null,
                          enteredTaxIncludedPrice: null,
                          priceLibraryId: null,
                        });
                      }
                    });
                    newDataSource = newDataSource.map((val) => {
                      return {
                        ...val,
                        uomId: null,
                        uomName: null,
                        taxId: null,
                        taxRate: null,
                        currencyCode: null,
                        unitPrice: null,
                        enteredTaxIncludedPrice: null,
                        priceLibraryId: null,
                      };
                    });
                  }
                }
                const { content = [] } = res;

                if (isArray(content) && !isEmpty(content)) {
                  content.forEach((n) => {
                    const price = math.multipliedBy(
                      new BigNumber(n.unitPrice),
                      math.plus(
                        new BigNumber(1),
                        math.div(new BigNumber(n.taxRate), new BigNumber(100))
                      )
                    );
                    newDataSource = newDataSource.map((val) => {
                      if (n.itemId === val.itemId) {
                        if (val.$form) {
                          val.$form.setFieldsValue({
                            uomId: n.uomId,
                            uomName: n.uomName,
                            uomCodeAndName: n.uomCodeAndName,
                            taxId: n.taxId,
                            taxRate: n.taxRate,
                            currencyCode: n.currencyCode,
                            unitPrice: n.unitPrice,
                            enteredTaxIncludedPrice: price,
                            priceLibraryId: n.priceLibraryId,
                          });
                        }
                        return {
                          ...val,
                          uomId: n.uomId,
                          uomName: n.uomName,
                          taxId: n.taxId,
                          taxRate: n.taxRate,
                          currencyCode: n.currencyCode,
                          unitPrice: n.unitPrice,
                          enteredTaxIncludedPrice: price,
                          priceLibraryId: n.priceLibraryId,
                        };
                      }
                      return val;
                    });
                  });
                  // 用于判断是否调用接口且有返回数据。行信息要用来判断disabled
                  onFetchFlag(this.state.flag);
                } else {
                  if (source === 'requisition') {
                    if (requisitionCount !== 2) {
                      newDataSource = listCommonDataSource;
                    }
                  }
                  if (source === 'maintain') {
                    if (orderMainCount !== 1) {
                      newDataSource = listCommonDataSource;
                    }
                  }
                  onFetchFlag(!this.state.flag);
                }
                handleChangeList(newDataSource);
              }
            });
          }
        }
      });
    }
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
  ouNameOnchange(lovRecord) {
    const { onOuNameOnchange } = this.props;
    onOuNameOnchange(lovRecord);
  }

  /**
   * 币种改变回调
   * @param {String} value
   */
  @Bind()
  handleChangeCurrencyCode(value) {
    const {
      fetchFlag,
      handleChangeList,
      dataSource: { poSourcePlatform, sourceBillTypeCode },
      listCommonDataSource = [],
    } = this.props;
    const isCatalogue = poSourcePlatform === 'CATALOGUE'; // 目录化商城
    const isOtherPlatform =
      poSourcePlatform !== 'CATALOGUE' &&
      poSourcePlatform !== 'ERP' &&
      poSourcePlatform !== 'SRM' &&
      poSourcePlatform !== 'SHOP' &&
      poSourcePlatform !== 'E-COMMERCE';
    const isRequest = sourceBillTypeCode === 'PURCHASE_REQUEST';
    const newListDataSource = listCommonDataSource.map((item) => {
      if (
        isCatalogue ||
        isOtherPlatform ||
        item.priceLibraryId ||
        item.$form.getFieldValue('priceLibraryId') ||
        (isRequest && fetchFlag) ||
        item.currencyCode
      ) {
        // 若币种是disabled状态则原样返回，否则用头上币种覆盖行上币种
        return item;
      } else {
        // item.$form.registerField('currencyCode');
        item.$form.setFieldsValue({ currencyCode: value });
        return { ...item, currencyCode: value };
      }
    });
    handleChangeList(newListDataSource);
  }

  @Bind()
  renderHeaderForm() {
    const { userId, tenantId, organizationId } = this.state;
    const {
      form = {},
      dataSource = {},
      // poHeaderId,
      companyFlag = 0,
      headerOnChangeForm = (e) => e,
    } = this.props;
    const { getFieldDecorator, setFieldsValue, registerField } = form;
    const {
      ouName,
      displayPoNum,
      poSourcePlatformMeaning,
      poSourcePlatform,
      priceShieldFlag,
      amount,
      termsName,
      creationDate,
      purchaseOrgName,
      remark,
      agentName,
      poTypeDesc,
      supplierName,
      supplierCompanyName,
      supplierCompanyId,
      termsId,
      companyId,
      companyName,
      currencyCode,
      taxIncludeAmount,
      quantityTotal,
      originalPoNum,
      domesticTaxIncludeAmount,
      domesticCurrencyCode,
      domesticAmount,
      domesticFinancialPrecision,
      supplierOrderTypeCode,
    } = dataSource;
    const isCatalogue = poSourcePlatform === 'CATALOGUE'; // 目录化商城
    const isOtherPlatform =
      poSourcePlatform !== 'CATALOGUE' &&
      poSourcePlatform !== 'ERP' &&
      poSourcePlatform !== 'SRM' &&
      poSourcePlatform !== 'SHOP';
    const otherHeadDisabled = isOtherPlatform && priceShieldFlag && supplierCompanyId;
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
                    registerField('poTypeCode');
                    setFieldsValue({
                      poTypeDesc: orderTypeName,
                      poTypeCode: orderTypeCode,
                    });
                    headerOnChangeForm(returnOrderFlag);
                  }}
                />
              )}
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
              {getFieldDecorator('creationDate')(<span>{creationDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={isCatalogue ? 'read-row' : 'writable-row'}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.companyName`).d('公司')}
            >
              {getFieldDecorator('companyId', {
                initialValue: dataSource.companyId,
                rules: [
                  {
                    required: !isCatalogue,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.companyName`)
                        .d('公司'),
                    }),
                  },
                ],
              })(
                isCatalogue || otherHeadDisabled || companyFlag === 1 ? (
                  <span>{companyName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.COMPANY"
                    textValue={companyName}
                    lovOptions={{ displayField: 'companyName' }}
                    queryParams={{ tenantId }}
                    disabled={isCatalogue}
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
                    required: !isCatalogue,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.quotePurchase.model.quotePurchase.ouName`).d('业务实体'),
                    }),
                  },
                ],
              })(
                isCatalogue || otherHeadDisabled ? (
                  <span>{ouName}</span>
                ) : (
                  <Lov
                    code="HPFM.OU"
                    textValue={ouName}
                    lovOptions={{ displayField: 'ouName' }}
                    disabled={isCatalogue}
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
                    required: !isCatalogue,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.quotePurchase.model.quotePurchase.supplier`).d('供应商'),
                    }),
                  },
                ],
              })(
                isCatalogue || otherHeadDisabled ? (
                  <span>{supplierName || supplierCompanyName}</span>
                ) : (
                  <Lov
                    code="SODR.AUTH_SUPPLIER_LIFE_CYCLE"
                    textValue={supplierName || supplierCompanyName}
                    queryParams={{ userId, tenantId, organizationId, companyId }}
                    disabled={isCatalogue}
                    onChange={(value, lovRecord) => this.supplierOnChange(lovRecord)}
                  />
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={isCatalogue ? 'read-row' : 'writable-row'}>
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
                    required: !isCatalogue,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.purchaseOrgName`)
                        .d('采购组织'),
                    }),
                  },
                ],
              })(
                isCatalogue || otherHeadDisabled ? (
                  <span>{purchaseOrgName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.PURORG"
                    textValue={purchaseOrgName}
                    queryParams={{ organizationId }}
                    disabled={isCatalogue}
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
                    required: !isCatalogue,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.agentName`)
                        .d('采购员'),
                    }),
                  },
                ],
              })(
                isCatalogue || otherHeadDisabled ? (
                  <span>{agentName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.PURCHASE_AGENT"
                    textValue={agentName}
                    // lovOptions={{ displayField: 'agentName' }}
                    queryParams={{ organizationId }}
                    disabled={isCatalogue}
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
                isCatalogue || otherHeadDisabled ? (
                  <span>{currencyCode}</span>
                ) : (
                  <Lov
                    code="SPRM.EXCHANGE_RATE.CURRENCY"
                    lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                    textValue={currencyCode}
                    onChange={(value) => this.handleChangeCurrencyCode(value)}
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
                isCatalogue ? (
                  <span>{termsName}</span>
                ) : (
                  <Lov
                    code="SMDM.PAYMENT.TERM"
                    textValue={termsName}
                    queryParams={{ tenantId }}
                    disabled={isCatalogue}
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
              {getFieldDecorator('poSourcePlatform')(
                <span>{poSourcePlatformMeaning || 'SRM'}</span>
              )}
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
        {/* {poHeaderId && poSourcePlatform === 'CATALOGUE' && (
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
        )} */}
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
                isCatalogue || otherHeadDisabled ? (
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
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'half-row')}>
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
    } = this.props;
    const { sourceBillTypeCode, poSourcePlatform } = dataSource;
    return (
      <Spin spinning={(poHeaderId ? loading : null) || newAddLoading}>
        {poSourcePlatform === 'CATALOGUE' && sourceBillTypeCode === 'PURCHASE_REQUEST'
          ? customizeForm(
              {
                form,
                dataSource,
                code: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
                clearCache: () => {},
              },
              this.renderHeaderForm()
            )
          : this.renderHeaderForm()}
      </Spin>
    );
  }
}
