/**
 * BatchUpdateModal - 协议行批量维护
 * @date: 2020年07月08日
 * @author: hl <li.huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import {
  Row,
  Col,
  Form,
  Modal,
  Input,
  Select,
  TreeSelect,
  DatePicker,
  InputNumber,
  Checkbox,
} from 'hzero-ui';

import { math } from 'choerodon-ui/dataset';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { filterNullValueObject } from 'utils/utils';

import { isCustomNumber } from '@/utils/precision';
import { boundValidator } from '@/utils/validator';

import style from './index.less';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class BatchUpdateModal extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      lovDisabled: false,
    };
  }

  /**
   *
   */
  @Bind()
  handleLineTaxChange(item) {
    const { taxRate } = item;
    const {
      isDisabled = false,
      onBatchUpdate = e => e,
      form: { setFieldsValue, getFieldsValue },
    } = this.props;
    const { unitPrice, agreementLadders = [] } = getFieldsValue();
    const tax = math.plus(math.multipliedBy(taxRate || 0, 0.01), 1);

    // 未税单价存在，级联改变
    if (!isDisabled && isCustomNumber(unitPrice)) {
      const taxPrice = math.multipliedBy(unitPrice, tax);
      setFieldsValue({
        taxPrice: math.toFixed(taxPrice, 10),
      });
    }

    // 阶梯价格存在，级联改变
    if (!isDisabled && agreementLadders && agreementLadders.length > 0) {
      const newAgreementLadders = (agreementLadders || []).map(m => {
        const ladderTaxPrice = math.multipliedBy(m.unitPrice, tax);
        return { ...m, taxPrice: math.toFixed(ladderTaxPrice, 10) };
      });
      onBatchUpdate({ ladderFlag: 1, agreementLadders: newAgreementLadders });
    }

    setFieldsValue({
      tax: taxRate,
    });
  }

  @Bind()
  handleChange(value) {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const _tax = getFieldValue('tax') || 0;
    if (isCustomNumber(value) && typeof isCustomNumber(_tax)) {
      const tax = math.plus(math.multipliedBy(_tax, 0.01), 1);
      const taxPrice = math.multipliedBy(value, tax);
      setFieldsValue({ taxPrice: math.toFixed(taxPrice, 10) });
    }
  }

  @Bind()
  handleReverseChange(value) {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const _tax = getFieldValue('tax') || 0;
    if (isCustomNumber(value) && typeof isCustomNumber(_tax)) {
      // 未税单价*(1+税率) = 含税单价
      const tax = math.plus(math.multipliedBy(tax, 0.01), 1);
      const unitPrice = math.div(value, tax);
      setFieldsValue({ unitPrice: math.toFixed(unitPrice, 10) });
    }
  }

  /**
   * 确定
   */
  @Bind()
  handleOk() {
    const { form, onToggle } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        onToggle(true, filterNullValueObject({ ...values, taxRate: values.tax }));
      }
    });
  }

  @Bind()
  handleCheck(e) {
    if (e.target.checked) {
      this.props.form.setFieldsValue({ postageId: -1, postageName: '' });
      this.setState({ lovDisabled: true });
    } else {
      this.setState({ lovDisabled: false });
    }
  }

  @Bind()
  getArray(arr = []) {
    const a = list =>
      list.forEach(item => {
        const n = item;
        n.title = item.unitCode ? `${item.unitCode}-${item.unitName}` : item.unitName;
        // n.key = {unitId: item.unitId, levelPath: item.levelPath};
        n.key = item.unitId;
        // n.value = { unitId: item.unitId, levelPath: item.levelPath };
        n.value = item.unitId;
        if (item.children && item.children.length > 0) {
          a(item.children);
        }
      });
    a(arr);
    return arr;
  }

  render() {
    const {
      visible,
      // initData,
      onToggle,
      isDisabled,
      // customizeForm,
      allCity = [],
      companyList = [],
      supplierTenantId,
      openCatalogModal,
      onShowLadderPrice = e => e,
      agreementPriceType = [],
      priceSecretType = [],
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    const city = allCity.map(item => {
      const { children = [] } = item;
      if (children) {
        const newChildren = children.map(i => {
          return {
            ...i,
            key: i.regionId,
            value: i.regionId,
            title: i.regionName,
          };
        });
        return {
          ...item,
          key: item.regionId,
          value: item.regionId,
          title: item.regionName,
          children: newChildren,
        };
      } else {
        return item;
      }
    });

    const unit = this.getArray(companyList);

    return (
      <Modal
        destroyOnClose
        title={intl.get('small.common.button.batchUpdate').d('批量维护')}
        visible={visible}
        onOk={() => this.handleOk()}
        onCancel={() => onToggle()}
        width={900}
      >
        <React.Fragment>
          <Form className={style.form}>
            <Row gutter={48}>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.groupCatalog').d('集团目录')}
                  {...formLayout}
                >
                  {getFieldDecorator('catalogId')}
                  {getFieldDecorator('catalogName')(
                    <Input.Search readOnly onSearch={() => openCatalogModal()} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.dateFrom').d('有效期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('validDateFrom')(
                    <DatePicker
                      disabledDate={currentDate =>
                        (getFieldValue('validDateTo') &&
                          currentDate > moment(getFieldValue('validDateTo')).endOf('day')) ||
                        currentDate < moment().startOf('day')
                      }
                      // disabled={isDisabled}
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.dateTo').d('有效期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('validDateTo')(
                    <DatePicker
                      disabledDate={currentDate => {
                        if (
                          getFieldValue('validDateFrom') &&
                          moment(getFieldValue('validDateFrom')).startOf('day') >=
                            moment().endOf('day')
                        ) {
                          return (
                            currentDate < moment(getFieldValue('validDateFrom')).startOf('day')
                          );
                        } else {
                          return currentDate < moment().startOf('day');
                        }
                      }}
                      // disabled={isDisabled}
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item label={intl.get('small.common.model.uom').d('单位')} {...formLayout}>
                  {getFieldDecorator('uomName')}
                  {getFieldDecorator('uomCode')}
                  {getFieldDecorator('uomId')(
                    <Lov
                      lovOptions={{
                        displayField: 'uomName',
                        valueField: 'uomId',
                      }}
                      code="SMDM.UOM"
                      textValue={getFieldValue('uomName')}
                      disabled={isDisabled}
                      onChange={(_, item) => setFieldsValue({ uomName: item.uomName })}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8} className={getFieldValue('priceType') ? '' : style.requiredMsg}>
                <Form.Item label={intl.get('small.common.model.tax').d('税率')} {...formLayout}>
                  {getFieldDecorator('tax')}
                  {getFieldDecorator('taxId', {
                    rules: [
                      {
                        required: getFieldValue('priceType'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.tax').d('税率'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      lovOptions={{
                        displayField: 'taxRate',
                        valueField: 'taxId',
                      }}
                      code="SMDM.TAX"
                      disabled={isDisabled}
                      onChange={(_, lovRecord) => this.handleLineTaxChange(lovRecord)}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.currency').d('币种')}
                  {...formLayout}
                >
                  {getFieldDecorator('currencyName')}
                  {getFieldDecorator('currencyCode')(
                    <Lov
                      lovOptions={{
                        displayField: 'currencyName',
                        valueField: 'currencyCode',
                      }}
                      code="SMDM.CURRENCY"
                      onChange={(_, item) => {
                        setFieldsValue({
                          currencyName: item.currencyName,
                          currencyCode: item.currencyCode,
                        });
                      }}
                      disabled={isDisabled}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.priceType').d('价格类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('priceType')(
                    <Select
                      allowClear
                      style={{ width: '100%' }}
                      disabled={isDisabled}
                      onChange={() =>
                        setFieldsValue({
                          taxPrice: getFieldValue('taxPrice'),
                          unitPrice: getFieldValue('unitPrice'),
                          ladderFlag: getFieldValue('ladderFlag'),
                        })
                      }
                    >
                      {agreementPriceType &&
                        agreementPriceType.map(item => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col
                span={8}
                className={getFieldValue('priceType') === 'REGULAR_PRICE' ? '' : style.requiredMsg}
              >
                <Form.Item
                  label={intl.get('small.common.model.unTaxPrice').d('未税单价')}
                  {...formLayout}
                >
                  {getFieldDecorator('unitPrice', {
                    rules: [
                      {
                        required: getFieldValue('priceType') === 'REGULAR_PRICE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.unTaxPrice').d('未税单价'),
                        }),
                      },
                      {
                        validator: boundValidator,
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      disabled={isDisabled}
                      onChange={value => this.handleChange(value)}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col
                span={8}
                className={getFieldValue('priceType') === 'REGULAR_PRICE' ? '' : style.requiredMsg}
              >
                <Form.Item
                  label={intl.get('small.common.model.taxPrice').d('含税单价')}
                  {...formLayout}
                >
                  {getFieldDecorator('taxPrice', {
                    rules: [
                      {
                        required: getFieldValue('priceType') === 'REGULAR_PRICE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.taxPrice').d('含税单价'),
                        }),
                      },
                      {
                        validator: boundValidator,
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      disabled={isDisabled}
                      onChange={value => this.handleReverseChange(value)}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row
              gutter={48}
              className={getFieldValue('priceType') === 'LADDER_PRICE' ? '' : style.requiredMsg}
            >
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.ladderPrice').d('阶梯价格')}
                  {...formLayout}
                >
                  {getFieldDecorator('agreementLadders', { initialValue: [] })}
                  {getFieldDecorator('ladderFlag', {
                    rules: [
                      {
                        required: getFieldValue('priceType') === 'LADDER_PRICE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('small.common.model.ladderPrice').d('阶梯价格'),
                        }),
                      },
                      {
                        validator: (rule, value, callback) => {
                          if (
                            getFieldValue('ladderFlag') === 1 &&
                            getFieldValue('agreementLadders') &&
                            getFieldValue('agreementLadders').length <= 0
                          ) {
                            callback(
                              new Error(
                                intl.get('hzero.common.validation.notNull', {
                                  name: intl.get('small.common.model.ladderPrice').d('阶梯价格'),
                                })
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <a
                      onClick={() => {
                        onShowLadderPrice();
                      }}
                      disabled={isDisabled || getFieldValue('priceType') !== 'LADDER_PRICE'}
                    >
                      {intl
                        .get('small.mallProtocolManagement.model.setLadderPrice')
                        .d('设置阶梯价格')}
                    </a>
                  )}
                </Form.Item>
              </Col>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.agreementQuantity').d('协议数量')}
                  {...formLayout}
                >
                  {getFieldDecorator('agreementQuantity', {
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (math.gte(value, '100000000000000000000')) {
                            callback(
                              new Error(
                                intl
                                  .get('small.common.view.maxMessage')
                                  .d('值必须小于100000000000000000000')
                              )
                            );
                          }
                        },
                      },
                    ],
                  })(<InputNumber min={1} style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.orderQuantity').d('起订量')}
                  {...formLayout}
                >
                  {getFieldDecorator('orderQuantity', {
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (math.gte(value, '100000000000000000000')) {
                            callback(
                              new Error(
                                intl
                                  .get('small.common.view.maxMessage')
                                  .d('值必须小于100000000000000000000')
                              )
                            );
                          }
                        },
                      },
                    ],
                  })(<InputNumber min={1} style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.minPackageQuantity').d('最小包装量')}
                  {...formLayout}
                >
                  {getFieldDecorator('minPackageQuantity', {
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (math.gte(value, '100000000000000000000')) {
                            callback(
                              new Error(
                                intl
                                  .get('small.common.view.maxMessage')
                                  .d('值必须小于100000000000000000000')
                              )
                            );
                          }
                        },
                      },
                    ],
                  })(<InputNumber min={1} style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.purchaseQuantityLimit').d('最大购买量')}
                  {...formLayout}
                >
                  {getFieldDecorator('purchaseQuantityLimit', {
                    rules: [
                      {
                        validator: boundValidator,
                      },
                    ],
                  })(<InputNumber min={1} />)}
                </Form.Item>
              </Col>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.purchaseAmountLimit').d('采购额上限')}
                  {...formLayout}
                >
                  {getFieldDecorator('purchaseAmountLimit', {
                    rules: [
                      {
                        validator: boundValidator,
                      },
                    ],
                  })(<InputNumber min={1} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.agreementRegion').d('送货区域')}
                  {...formLayout}
                >
                  {getFieldDecorator('agreementRegion')(
                    <TreeSelect
                      dropdownStyle={{ maxHeight: '30vh' }}
                      treeData={city}
                      treeCheckable="true"
                      style={{ width: '100%' }}
                      showCheckedStrategy={TreeSelect.SHOW_PARENT}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.agreementOrg').d('可采买组织')}
                  {...formLayout}
                >
                  {getFieldDecorator('agreementUnits')(
                    <TreeSelect
                      dropdownStyle={{ maxHeight: '30vh' }}
                      treeData={unit}
                      treeCheckable="true"
                      style={{ width: '100%' }}
                      showCheckedStrategy={TreeSelect.SHOW_PARENT}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.deliveryDay').d('供货周期（天）')}
                  {...formLayout}
                >
                  {getFieldDecorator('deliveryDay')(
                    <InputNumber min={0} style={{ width: '100%' }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.guaranteeDay').d('质保期（天）')}
                  {...formLayout}
                >
                  {getFieldDecorator('guaranteeDay')(
                    <InputNumber min={0} style={{ width: '100%' }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('small.common.model.remark').d('备注')} {...formLayout}>
                  {getFieldDecorator('remark')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.model.isFree').d('是否包邮')}
                  {...formLayout}
                >
                  {getFieldDecorator('isFree')(
                    <Checkbox disabled={isDisabled} onChange={e => this.handleCheck(e)} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.common.view.freightRule').d('运费规则')}
                  {...formLayout}
                >
                  {getFieldDecorator('postageName')}
                  {getFieldDecorator('postageId')(
                    <Lov
                      code="SMAL.POSTAGE_SUPPLIER"
                      textValue={getFieldValue('postageName')}
                      queryParams={{ supplierTenantId }}
                      disabled={this.state.lovDisabled || isDisabled}
                      onChange={(_, item) => {
                        setFieldsValue({ postageName: item.postageName });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8} className={style.requiredMsg}>
                <Form.Item
                  label={intl.get('small.common.model.isHiddenPrice').d('是否隐藏价格')}
                  {...formLayout}
                >
                  {getFieldDecorator('priceHiddenFlag')(
                    <Select allowClear style={{ width: '100%' }}>
                      {priceSecretType &&
                        priceSecretType.map(item => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </React.Fragment>
      </Modal>
    );
  }
}
