/**
 * SheetCreation - 整单引用创建
 * @date: 2020-11-17
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getUserOrganizationId, getCurrentUserId } from 'utils/utils';
import { isNumber } from 'lodash';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
// import { numberRender } from 'utils/renderer';
import {
  dateTimeRender, // 日期时间格式化
} from 'hzero-front/lib/utils/renderer';
import {
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
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
export default class PurchaseRequestHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      userId: getCurrentUserId(),
    };
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

  render() {
    const { tenantId, organizationId, userId } = this.state;
    const { form = {}, dataSource = {}, customizeForm, headerOnChangeForm = (e) => e } = this.props;
    const { getFieldsValue, getFieldDecorator = (e) => e, getFieldValue = (e) => e } = form;
    const {
      companyId,
      companyName,
      creationDate,
      displayPoNum,
      ouId,
      ouName,
      amount,
      remark,
      agentName,
      poTypeDesc,
      supplierId,
      supplierName,
      taxIncludeAmount,
      poSourcePlatform,
      poSourcePlatformMeaning,
      purchaseOrgName,
      quantityTotal,
      financialPrecision,
      domesticFinancialPrecision,
      domesticTaxIncludeAmount,
      domesticCurrencyCode,
      domesticAmount,
      settleSupplierName,
      settleErpSupplierName,
      settleSupplierId,
      settleSupplierCode,
      settleErpSupplierId,
      settleErpSupplierCode,
      settleSupplierTenantId,
      sourceOfTransferOrder,
      sourceOfTransferOrderMeaning,
      supplierOrderTypeCode,
      // domesticFinancialPrecision,
      supplierSiteId,
      supplierSiteName,
      currencyCode,
      enableSupplierSiteFlag,
    } = dataSource;
    const values = getFieldsValue();
    const formatCreationDate = dateTimeRender(creationDate);
    return customizeForm(
      {
        form,
        dataSource,
        code: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
        clearCache: () => {},
      },
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
                  queryParams={{ tenantId, enabledFlag: 1 }}
                  onChange={(_, lovRecord) => {
                    headerOnChangeForm(lovRecord);
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
              {getFieldDecorator('creationDate', {
                initialValue: dataSource.creationDate,
              })(<span>{formatCreationDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.supplierName`).d('供应商')}
            >
              {getFieldDecorator('supplierName')(<span>{supplierName}</span>)}
              {getFieldDecorator('supplierId', { initialValue: supplierId })}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.companyName`).d('公司')}
            >
              {getFieldDecorator('companyName')(<span>{companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.ouName`).d('业务实体')}
            >
              {getFieldDecorator('ouName')(<span>{ouName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.purchaseOrgName`)
                .d('采购组织')}
            >
              {getFieldDecorator('purchaseOrgName')(<span>{purchaseOrgName}</span>)}
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
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  disabled={dataSource.agentId}
                  textValue={agentName}
                  queryParams={{
                    organizationId,
                    purchaseOrgId: values.purchaseOrgId,
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
              {getFieldDecorator('currencyCode', { initialValue: currencyCode })(
                <span>{currencyCode}</span>
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
                .get(`sodr.quotePurchase.model.quotePurchase.taxIncludeAmount`)
                .d('含税总金额')}
            >
              {getFieldDecorator('taxIncludeAmount')(
                <span>
                  {isNumber(taxIncludeAmount) || math.isBigNumber(taxIncludeAmount)
                    ? ['SRM', 'SHOP'].includes(poSourcePlatform) && !!financialPrecision
                      ? new BigNumber(
                          math.toFixed(new BigNumber(taxIncludeAmount), Number(financialPrecision))
                        )
                      : taxIncludeAmount
                    : ''}
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
                  {isNumber(amount) || math.isBigNumber(amount)
                    ? ['SRM', 'SHOP'].includes(poSourcePlatform) && !!financialPrecision
                      ? new BigNumber(
                          math.toFixed(new BigNumber(amount), Number(financialPrecision))
                        )
                      : amount
                    : ''}
                </span>
              )}
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
              {getFieldDecorator('domesticCurrencyCode')(<span>{domesticCurrencyCode}</span>)}
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
          {enableSupplierSiteFlag === 1 && getFieldValue('supplierId') && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`sodr.common.model.common.supplierSites`).d('供应商地点')}>
                {getFieldDecorator('supplierSiteId', {
                  initialValue: supplierSiteId,
                })(
                  <Lov
                    code="SODR.SUPPLIER_SITE"
                    disabled={
                      (!getFieldValue('supplierId') && !supplierId) ||
                      (!getFieldValue('ouId') && !ouId)
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
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.PlatformMeaning`)
                .d('来源平台')}
            >
              {getFieldDecorator('poSourcePlatform', { initialValue: poSourcePlatform })(
                <span>{poSourcePlatformMeaning}</span>
              )}
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
}
