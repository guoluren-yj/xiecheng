/**
 * BaseInfo -商品维护基本信息
 * @date: 2019-1-28
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Input, Form, Row, Col, Cascader, DatePicker, InputNumber, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isUndefined } from 'lodash';
import classnames from 'classnames';
import moment from 'moment';
import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import PriceModal from './priceModal';

const { TextArea } = Input;
const { Option } = Select;
const dateFormat = getDateFormat();
@Form.create({ fieldNameProp: null })
export default class BaseInfo extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    // const { realName } = getCurrentUser();
    this.state = {
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      taxRate: '', // 税率
      changeList: [], // 改变后的目录结构
    };
  }

  // @Bind()
  // onChange(value, selectedOptions){
  //   const { onFetchCatelog } = this.props;
  //   this.setState({
  //     catalogValue: value
  //   })
  // }

  // @Bind()
  // loadData(selectedOptions){
  //   const targetOption = selectedOptions[selectedOptions.length - 1];
  //   targetOption.loading = true;
  //     if (selectedOptions.length === 1) {
  //       let list = [];
  //       this.props.onFetchChildCatelog({catalogId: selectedOptions[0].value}).then(()=>{
  //         const { catalogueSecondList = [] } = this.props;
  //         list = catalogueSecondList;
  //       })
  //       setTimeout(() => {
  //         targetOption.loading = false;
  //         targetOption.children = list.map(item => {
  //           return {
  //             value: item.catalogId,
  //             label: item.catalogName,
  //             isLeaf: false,
  //           }
  //         })
  //         this.setState({
  //           options: [...this.state.options]
  //         })
  //       }, 500);
  //     } else if (selectedOptions.length === 2) {
  //       let list = [];
  //       this.props.onFetchChildCatelog({catalogId: selectedOptions[1].value}).then(()=>{
  //         const { catalogueSecondList = [] } = this.props;
  //         list = catalogueSecondList;
  //       })
  //       setTimeout(() => {
  //         targetOption.loading = false;
  //         targetOption.children = list.map(item => {
  //           return {
  //             value: item.catalogId,
  //             label: item.catalogName,
  //             isLeaf: true,
  //           }
  //         })
  //         this.setState({
  //           options: [...this.state.options]
  //         })
  //       }, 500);
  //     }

  // }

  /**
   * 选择公司Lov
   * @param {String} val 当前值
   * @param {Object} record 选择值
   */
  @Bind()
  selectCompany(val, record = {}) {
    const {
      onFetchCatelog,
      onCleanSupplier,
      fetchCompanyCurrency,
      form: { setFieldsValue },
    } = this.props;
    this.setState(
      {
        companyId: record.companyId,
      },
      () => {
        onFetchCatelog({ companyId: this.state.companyId });
        if (record.spfmCompanyId) {
          fetchCompanyCurrency({ spfmCompanyId: record.spfmCompanyId }).then((res) => {
            if (res) {
              const { currencyCode, currencyName } = res;
              setFieldsValue({
                currencyCode,
                currencyName,
              });
              this.changeCurrency(currencyCode, res);
            }
          });
        }
      }
    );
    onCleanSupplier();
    this.props.form.resetFields(['supplierId', 'supplierName', 'catalogId']);
  }

  /**
   * 请求二/三级菜单
   * @param {object} params catalogId 目录名称
   */
  // @Bind()
  // fetchChildCatelog(params = {}){
  //   const { onFetchChildCatelog } = this.props;
  //   onFetchChildCatelog(params).then(()=>{
  //     const { cateList = [] } = this.props;
  //     // this.setState({
  //     //   options: cateList,
  //     // });
  //   });
  // }

  /**
   * 计量单位LOV, 绑定值与表字段不一致，重新给字段赋值
   */
  @Bind()
  changeUom(_, record = {}) {
    const { onChangeUom } = this.props;
    onChangeUom(record.uomId, record.uomName);
  }

  /**
   * 币种,绑定值与表字段不一致，重新给字段赋值
   */
  @Bind()
  changeCurrency(_, record = {}) {
    const { onChangeCurrency, form } = this.props;
    form.setFieldsValue({
      currencyName: record.currencyName,
    });
    onChangeCurrency(record.currencyCode, record.currencyName);
  }

  /**
   * 选择税种后带出税率
   * @param val 当前值
   * @param record 当前行数据
   */
  @Bind()
  changeTaxCate(_, record) {
    const { onGetTaxCate } = this.props;
    this.setState({
      taxRate: record.taxRate,
    });
    onGetTaxCate(record.taxCode);
    this.props.form.setFieldsValue({ taxRate: record.taxRate });
    if (isUndefined(record.taxRate)) {
      this.props.form.resetFields(['taxRate']);
    }
  }

  /**
   * 快码转换，将英文翻译成中文
   * @param {String} params 英文
   */
  @Bind()
  changeCreateParty(params = '') {
    if (params === 'SUPPLIER') {
      return intl.get('scec.common.model.provider').d('供应方');
    } else if (params === 'PURCHASE') {
      return intl.get('scec.common.model.purchaser').d('采购方');
    }
  }

  // 含税/不含税单价，显示保留小数点后五位小数
  @Bind()
  toFixedTax(data = '') {
    if (data === null || data === '' || isNaN(data)) {
      return '';
    } else {
      const taxData = Math.round(data * 100000) / 100000;
      return taxData;
    }
  }

  /**
   * 根据是否含税按钮计算出含税与不含税单价
   */
  @Bind()
  computerTax() {
    const { onShowTax } = this.props;
    if (isFunction(onShowTax)) {
      onShowTax();
    }
  }

  @Bind()
  ShowPrice() {
    const { onShowPrice } = this.props;
    if (isFunction(onShowPrice)) {
      onShowPrice();
    }
  }

  /**
   * 有效时间从的判断
   * @param {*} current
   */
  @Bind()
  selectDisabledDate(current) {
    const {
      form: { getFieldValue },
    } = this.props;
    if (getFieldValue('effectiveDateTo')) {
      return (
        current < moment().subtract(1, 'days').endOf('day') - 1 ||
        moment(getFieldValue('effectiveDateTo')).isBefore(current, 'day')
      );
    } else {
      return current && current < moment().subtract(1, 'days').endOf('day') - 1;
    }
  }

  /**
   * 有效时间至的判断
   * @param {*} current
   */
  @Bind()
  selectToDisabledDate(current) {
    const {
      form: { getFieldValue },
    } = this.props;
    if (
      getFieldValue('effectiveDateFrom') &&
      current &&
      current <
        Math.max.apply(this, [
          moment(getFieldValue('effectiveDateFrom')).startOf('day'),
          moment(current).startOf('day'),
        ])
    ) {
      return true;
    } else {
      return current && current < moment().subtract(1, 'days').endOf('day');
    }
  }

  @Bind()
  handleAreaClick(e, label) {
    const { onGetAreaClick } = this.props;
    onGetAreaClick(label);
  }

  render() {
    const formlayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    const { taxRate, tenantId, organizationId } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const {
      code: { status = [], sourceType = [] },
      cateList = [],
      detail = {},
      isShowTax,
      isShowPrice,
      visible,
      hideModal,
      productId,
      ladderPriceData = [],
      viewLadderPrice,
      onDeleteLadderLines,
      onCreateLadderLine,
      ladderPriceRowSelection,
      ladderPriceSelectedRowKeys = [],
      onSaveLadderLine,
      onChangeLadderTableData,
      fetchLadderPriceLoading,
      saveLadderPriceLoading,
    } = this.props;

    const ladderPriceModalProps = {
      productId,
      visible,
      hideModal,
      ladderPriceData,
      onCreateLadderLine, // 新增阶梯价格行数据
      onDeleteLadderLines, // 删除阶梯价格行数据
      ladderPriceRowSelection,
      ladderPriceSelectedRowKeys,
      onSaveLadderLine,
      onChangeLadderTableData,
      saveLadderPriceLoading,
      fetchLadderPriceLoading,
      sourceFromType: detail.sourceFromType,
    };

    const { catalogList = [] } = detail;
    const changeCatelogList = catalogList.map((item) => item.catalogId);
    getFieldDecorator('currencyName', { initialValue: detail.currencyName });
    return (
      <>
        <Form>
          <Row gutter={48} className="inclusion-row">
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.productNum').d('商品编码')}
                {...formlayout}
              >
                {getFieldDecorator('productNum', {
                  initialValue: detail.productNum,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.productName').d('商品名称')}
                {...formlayout}
              >
                {getFieldDecorator('productName', {
                  initialValue: detail.productName,
                  rules: [
                    {
                      max: 250,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hzero.common.validation.max`, {
                          max: 250,
                        }),
                      }),
                    },
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('scec.common.model.productName').d('商品名称'),
                      }),
                    },
                  ],
                })(
                  <Input
                    disabled={
                      detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.productStatus').d('状态')}
                {...formlayout}
              >
                {getFieldDecorator('productStatus', {
                  initialValue: detail.productStatus
                    ? detail.productStatus
                    : intl.get('hzero.common.button.create').d('新建'),
                })(
                  <Select allowClear disabled>
                    {status.map((item) => {
                      return (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={48} className="inclusion-row">
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.goodsMaintain.model.goodsMaintain.companyName').d('采购方')}
                {...formlayout}
              >
                {getFieldDecorator('companyId', {
                  initialValue: detail.companyName,
                  rules: [
                    {
                      required:
                        detail.sourceFromType !== 'SOURCING' || detail.sourceFromType !== 'SHARE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('scec.goodsMaintain.model.goodsMaintain.companyName')
                          .d('采购方'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.COMPANY"
                    queryParams={{ tenantId, enabledFlag: 1 }}
                    onChange={(val, record) => this.selectCompany(val, record)}
                    textValue={detail.companyName}
                    disabled={
                      detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={intl.get('scec.common.model.supplier').d('供应商')} {...formlayout}>
                {getFieldDecorator('supplierId', {
                  initialValue: detail.supplierName,
                  rules: [
                    {
                      required:
                        (getFieldValue('companyId') && detail.sourceFromType !== 'SOURCING') ||
                        detail.sourceFromType !== 'SHARE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('scec.common.model.supplier').d('供应商'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SCEC.COMPANY_SUPPLIER"
                    disabled={
                      !getFieldValue('companyId') ||
                      detail.sourceFromType === 'SOURCING' ||
                      detail.sourceFromType === 'SHARE'
                    }
                    queryParams={{
                      companyId:
                        detail.companyName === getFieldValue('companyId')
                          ? detail.companyId
                          : getFieldValue('companyId'),
                      supplierTenantId: organizationId,
                    }}
                    textValue={detail.supplierName}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.catalogName').d('目录名称')}
                {...formlayout}
              >
                {getFieldDecorator('catalogId', {
                  initialValue: changeCatelogList || this.state.changeList,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('scec.common.model.catalogName').d('目录名称'),
                      }),
                    },
                  ],
                })(
                  <Cascader
                    showSearch
                    disabled={!getFieldValue('companyId')}
                    onChange={this.handleAreaClick}
                    //  options={cateList || this.state.options}
                    options={cateList}
                    fieldNames={{ label: 'catalogName', value: 'catalogId' }}
                    placeholder={null}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={48} className="inclusion-row">
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.sourceFromType').d('数据来源')}
                {...formlayout}
              >
                {getFieldDecorator('sourceFromType', {
                  initialValue: detail.sourceFromType
                    ? detail.sourceFromType
                    : intl.get('scec.common.model.manualCreate').d('手工创建'),
                })(
                  <Select allowClear disabled>
                    {sourceType.map((item) => {
                      return (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.sourceFromNum').d('来源单号')}
                {...formlayout}
              >
                {getFieldDecorator('sourceFromNum', {
                  initialValue: detail.sourceFromNum,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.createdParty').d('创建方')}
                {...formlayout}
              >
                {getFieldDecorator('createdParty', {
                  initialValue: detail.createdParty
                    ? this.changeCreateParty(detail.createdParty)
                    : intl.get('scec.common.model.supplierParty').d('供应方'),
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={48} className="inclusion-row">
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.creationDate').d('创建日期')}
                {...formlayout}
              >
                {getFieldDecorator('creationDate', {
                  initialValue: detail.creationDate ? moment(detail.creationDate) : '',
                })(
                  <DatePicker
                    disabled
                    style={{ width: '100%' }}
                    format={dateFormat}
                    placeholder=""
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.effectiveDateFrom').d('有效期从')}
                {...formlayout}
              >
                {getFieldDecorator('effectiveDateFrom', {
                  initialValue: detail.effectiveDateFrom ? moment(detail.effectiveDateFrom) : '',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('scec.common.model.effectiveDateFrom').d('有效期从'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={dateFormat}
                    placeholder=""
                    disabledDate={this.selectDisabledDate}
                    disabled={
                      detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.effectiveDateTo').d('有效期至')}
                {...formlayout}
              >
                {getFieldDecorator('effectiveDateTo', {
                  initialValue: detail.effectiveDateTo ? moment(detail.effectiveDateTo) : '',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('scec.common.model.effectiveDateTo').d('有效期至'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={dateFormat}
                    placeholder=""
                    disabledDate={this.selectToDisabledDate}
                    disabled={
                      detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                    }
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={48} className="inclusion-row">
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.currencyName').d('币种')}
                {...formlayout}
              >
                {getFieldDecorator('currencyCode', {
                  initialValue: detail.currencyCode,
                  rules: [
                    {
                      required:
                        detail.sourceFromType !== 'SOURCING' || detail.sourceFromType !== 'SHARE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('scec.common.model.currencyName').d('币种'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.CURRENCY"
                    textValue={getFieldValue('currencyName')}
                    lovOptions={{ valueField: 'currencyCode', displayField: 'currencyName' }}
                    onChange={(val, record) => this.changeCurrency(val, record)}
                    disabled={
                      detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.primaryUomName').d('计量单位')}
                {...formlayout}
              >
                {getFieldDecorator('primaryUomId', {
                  initialValue: detail.primaryUomName,
                  rules: [
                    {
                      required:
                        detail.sourceFromType !== 'SOURCING' || detail.sourceFromType !== 'SHARE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('scec.common.model.primaryUomName').d('计量单位'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.UOM"
                    onChange={(val, record) => this.changeUom(val, record)}
                    textValue={detail.primaryUomName}
                    disabled={
                      detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.taxIncloudedFlag').d('是否含税')}
                {...formlayout}
              >
                {getFieldDecorator('taxIncloudedFlag', {
                  initialValue: detail.taxIncloudedFlag,
                })(
                  <Checkbox
                    disabled={
                      detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                    }
                    onChange={() => this.computerTax()}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          {isShowTax ? (
            <Row gutter={48} className="inclusion-row">
              <Col span={8}>
                <Form.Item
                  label={intl.get('scec.common.model.taxPrice').d('含税单价')}
                  {...formlayout}
                >
                  {getFieldDecorator('taxPrice', {
                    initialValue: this.toFixedTax(detail.taxPrice),
                    rules: [
                      {
                        required:
                          detail.sourceFromType !== 'SOURCING' || detail.sourceFromType !== 'SHARE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('scec.common.model.taxPrice').d('含税单价'),
                        }),
                      },
                      {
                        validator: (rule, value, callback) => {
                          if ((value && Number(value) < 0) || Number(value) === 0) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxPrice.toSmall')
                                  .d('含税单价必须大于0')
                              )
                            );
                          } else if (value && isNaN(value)) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxPrice.fallShort')
                                  .d('单价不符规范')
                              )
                            );
                          } else if (
                            value &&
                            !new RegExp(/^(\d{0,8}|0)([.]?|(\.\d{1,5})?)$/).test(value)
                          ) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxPrice.overSize')
                                  .d('单价超过限制或保留五位小数')
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <InputNumber
                      style={{ width: '100%' }}
                      disabled={
                        detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('scec.common.model.taxCostPrice').d('含税成本价')}
                  {...formlayout}
                >
                  {getFieldDecorator('taxCostPrice', {
                    initialValue: this.toFixedTax(detail.taxCostPrice) || '',
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (
                            ((value && Number(value) < 0) || Number(value) === 0) &&
                            value !== ''
                          ) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxCostPrice.toSmall')
                                  .d('含税成本价必须大于0')
                              )
                            );
                          } else if (value && isNaN(value)) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxCostPrice.fallShort')
                                  .d('成本价不符规范')
                              )
                            );
                          } else if (
                            value &&
                            !new RegExp(/^(\d{0,8}|0)([.]?|(\.\d{1,5})?)$/).test(value)
                          ) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxCostPrice.overSize')
                                  .d('成本价超过限制或保留五位小数')
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <InputNumber
                      style={{ width: '100%' }}
                      disabled={
                        detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('scec.common.model.taxMarketPrice').d('含税市场价')}
                  {...formlayout}
                >
                  {getFieldDecorator('taxMarketPrice', {
                    initialValue: this.toFixedTax(detail.taxMarketPrice) || '',
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (
                            ((value && Number(value) < 0) || Number(value) === 0) &&
                            value !== ''
                          ) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxMarketPrice.toSmall')
                                  .d('含税市场价必须大于0')
                              )
                            );
                          } else if (value && isNaN(value)) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxMarketPrice.fallShort')
                                  .d('市场价不符规范')
                              )
                            );
                          } else if (
                            value &&
                            !new RegExp(/^(\d{0,8}|0)([.]?|(\.\d{1,5})?)$/).test(value)
                          ) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxMarketPrice.overSize')
                                  .d('市场价超过限制或保留五位小数')
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <InputNumber
                      style={{ width: '100%' }}
                      disabled={
                        detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <Row gutter={48} className="inclusion-row">
              <Col span={8}>
                <Form.Item
                  label={intl.get('scec.common.model.netPrice').d('不含税单价')}
                  {...formlayout}
                >
                  {getFieldDecorator('netPrice', {
                    initialValue: this.toFixedTax(detail.netPrice),
                    rules: [
                      {
                        required:
                          detail.sourceFromType !== 'SOURCING' || detail.sourceFromType === 'SHARE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('scec.common.model.netPrice').d('不含税单价'),
                        }),
                      },
                      {
                        validator: (rule, value, callback) => {
                          if ((value && Number(value) < 0) || Number(value) === 0) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.netPrice.toSmall')
                                  .d('不含税单价必须大于0')
                              )
                            );
                          } else if (value && isNaN(value)) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxPrice.fallShort')
                                  .d('单价不符规范')
                              )
                            );
                          } else if (
                            value &&
                            !new RegExp(/^(\d{0,8}|0)([.]?|(\.\d{1,5})?)$/).test(value)
                          ) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.taxPrice.overSize')
                                  .d('单价超过限制或保留五位小数')
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <InputNumber
                      style={{ width: '100%' }}
                      disabled={
                        detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('scec.common.model.costPrice').d('不含税成本价')}
                  {...formlayout}
                >
                  {getFieldDecorator('costPrice', {
                    initialValue: this.toFixedTax(detail.costPrice) || '',
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (
                            ((value && Number(value) < 0) || Number(value) === 0) &&
                            value !== ''
                          ) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.costPrice.toSmall')
                                  .d('不含税成本价必须大于0')
                              )
                            );
                          } else if (value && isNaN(value)) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.costPrice.fallShort')
                                  .d('成本价不符规范')
                              )
                            );
                          } else if (
                            value &&
                            !new RegExp(/^(\d{0,8}|0)([.]?|(\.\d{1,5})?)$/).test(value)
                          ) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.costPrice.overSize')
                                  .d('成本价超过限制或保留五位小数')
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <InputNumber
                      style={{ width: '100%' }}
                      disabled={
                        detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('scec.common.model.marketPrice').d('不含税市场价')}
                  {...formlayout}
                >
                  {getFieldDecorator('marketPrice', {
                    initialValue: this.toFixedTax(detail.marketPrice) || '',
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (
                            ((value && Number(value) < 0) || Number(value) === 0) &&
                            value !== ''
                          ) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.marketPrice.toSmall')
                                  .d('不含税市场价必须大于0')
                              )
                            );
                          } else if (value && isNaN(value)) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.marketPrice.fallShort')
                                  .d('市场价不符规范')
                              )
                            );
                          } else if (
                            value &&
                            !new RegExp(/^(\d{0,8}|0)([.]?|(\.\d{1,5})?)$/).test(value)
                          ) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.marketPrice.overSize')
                                  .d('市场价超过限制或保留五位小数')
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <InputNumber
                      style={{ width: '100%' }}
                      disabled={
                        detail.sourceFromType === 'SOURCING' || detail.sourceFromType === 'SHARE'
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row gutter={48} className="inclusion-row">
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.enableLadderPrice').d('是否启用阶梯价格')}
                {...formlayout}
              >
                {getFieldDecorator('ladderFlag', {
                  initialValue: detail.ladderFlag,
                })(
                  <Checkbox
                    disabled={!productId || detail.sourceFromType === 'SHARE'}
                    onChange={() => this.ShowPrice()}
                  />
                )}
                {isShowPrice && (
                  <a style={{ float: 'right' }} onClick={() => viewLadderPrice(productId)}>
                    {intl.get('scec.common.model.ladderPrice').d('阶梯价格')}
                  </a>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={intl.get('scec.common.model.taxCode').d('税种')} {...formlayout}>
                {getFieldDecorator('taxId', {
                  initialValue: detail.taxCode,
                  rules: [
                    {
                      required:
                        !detail.taxCode ||
                        detail.sourceFromType !== 'SOURCING' ||
                        detail.sourceFromType !== 'SHARE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('scec.common.model.taxCode').d('税种'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.SCEC_TAX"
                    textValue={detail.taxCode}
                    onChange={(_, record) => this.changeTaxCate(_, record)}
                    disabled={
                      (detail.taxCode && detail.sourceFromType === 'SOURCING') ||
                      detail.sourceFromType === 'SHARE'
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={intl.get('scec.common.model.taxRate').d('税率')} {...formlayout}>
                {getFieldDecorator('taxRate', {
                  initialValue: isUndefined(taxRate) ? taxRate : detail.taxRate,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('scec.common.model.taxRate').d('税率'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={48} className="inclusion-row">
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.createdUserName').d('创建人')}
                {...formlayout}
              >
                {getFieldDecorator('createdUserName', {
                  initialValue: detail.createdUserName,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.specifications').d('规格')}
                {...formlayout}
              >
                {getFieldDecorator('specifications', {
                  initialValue: detail.specifications,
                  rules: [
                    {
                      max: 480,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hzero.common.validation.max`, {
                          max: 480,
                        }),
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.shelfLife').d('质保期')}
                {...formlayout}
              >
                {getFieldDecorator('shelfLife', {
                  initialValue: detail.shelfLife,
                  rules: [
                    {
                      max: 100,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hzero.common.validation.max`, {
                          max: 100,
                        }),
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={48} className="inclusion-row">
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.minPurchaseQuantity').d('最小购买量')}
                {...formlayout}
              >
                {getFieldDecorator('minPurchaseQuantity', {
                  initialValue: detail.minPurchaseQuantity,
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if ((value && Number(value) < 0) || parseInt(value, 10) === 0) {
                          callback(
                            new Error(
                              intl
                                .get('scec.common.warning.standard.minPurchaseQuantity.toSmall')
                                .d('最小购买量必须大于0')
                            )
                          );
                        } else if (value && isNaN(value)) {
                          callback(
                            new Error(
                              intl
                                .get('scec.common.warning.standard.minPurchaseQuantity.fallShort')
                                .d('最小购买量不符规范')
                            )
                          );
                        } else if (
                          value &&
                          !new RegExp(/^(\d{0,15}|0)([.]?|(\.\d{0,1})?)$/).test(value)
                        ) {
                          callback(
                            new Error(
                              intl
                                .get('scec.common.warning.standard.minPurchaseQuantity.overSize')
                                .d('最小购买量超过限制')
                            )
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                })(
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    disabled={
                      detail.sourceFromType === 'SOURCING' ||
                      (detail.sourceFromType === 'SHARE' && detail.minPurchaseQuantity)
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={intl.get('scec.common.model.brand').d('品牌')} {...formlayout}>
                {getFieldDecorator('brand', {
                  initialValue: detail.brand,
                  rules: [
                    {
                      max: 150,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hzero.common.validation.max`, {
                          max: 150,
                        }),
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.frameAgreementNum').d('框架协议编号')}
                {...formlayout}
              >
                {getFieldDecorator('frameAgreementNum', {
                  initialValue: detail.frameAgreementNum,
                })(<Input inputChinese={false} maxLength={50} />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.givenGoodsTime').d('供货周期')}
                {...formlayout}
              >
                {getFieldDecorator('validDeliveryCycle', {
                  initialValue: detail.validDeliveryCycle,
                })(<Input maxLength={50} disabled={detail.sourceFromType === 'SOURCING'} />)}
              </Form.Item>
            </Col>
          </Row>
          {/* <Row gutter={48} className="inclusion-row">
            <Col span={8}>
              <Form.Item
                label={intl.get('scec.common.model.frameAgreementNum').d('框架协议编号')}
                {...formlayout}
              >
                {getFieldDecorator('frameAgreementNum', {
                  initialValue: detail.frameAgreementNum,
                })(<Input inputChinese={false} maxLength={50} />)}
              </Form.Item>
            </Col>
          </Row> */}
          <Row gutter={48} className={classnames('last-form-item', 'half-row')}>
            <Col span={12}>
              <Form.Item label={intl.get('scec.common.model.remark').d('商品说明')}>
                {getFieldDecorator('remark', {
                  initialValue: detail.remark,
                  rules: [
                    {
                      max: 480,
                      message: intl.get('hzero.common.validation.max', { max: 480 }),
                    },
                  ],
                })(<TextArea rows={4} />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {visible && <PriceModal {...ladderPriceModalProps} />}
      </>
    );
  }
}
