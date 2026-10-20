/**
 * SheetCreation - 整单引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import classnames from 'classnames';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
// import { numberRender } from 'utils/renderer';
import {
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';

import { formatAumont } from '@/routes/components/utils';
import styles from '../../components/index.less';

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
    };
  }

  render() {
    const { tenantId } = this.state;
    const { form = {}, dataSource = {}, customizeForm, headerOnChangeForm = (e) => e } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const {
      companyName,
      creationDate,
      displayPoNum,
      ouName,
      amount,
      remark,
      agentName,
      poTypeDesc,
      supplierName,
      taxIncludeAmount,
      poSourcePlatform,
      poSourcePlatformMeaning,
      purchaseOrgName,
      quantityTotal,
      domesticTaxIncludeAmount,
      domesticCurrencyCode,
      domesticAmount,
      domesticFinancialPrecision,
      supplierOrderTypeCode,
    } = dataSource;
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
                  onChange={(_, { returnOrderFlag }) => {
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
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.supplierName`).d('供应商')}
            >
              {getFieldDecorator('supplierName')(<span>{supplierName}</span>)}
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
              {getFieldDecorator('agentName')(<span>{agentName}</span>)}
            </FormItem>
          </Col>
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
              {getFieldDecorator('taxIncludeAmount', {
                initialValue: taxIncludeAmount,
              })(<span>{formatAumont(taxIncludeAmount)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.amount`).d('不含税总金额')}
            >
              {getFieldDecorator('amount', {
                initialValue: amount,
              })(<span>{formatAumont(amount)}</span>)}
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
}
