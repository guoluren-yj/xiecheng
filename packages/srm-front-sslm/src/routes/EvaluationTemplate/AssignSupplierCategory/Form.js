/**
 * Search - 我发出的订单 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Radio, Select, Row, Col, InputNumber, Tooltip } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Checkbox from 'components/Checkbox';
// import { Content } from 'components/Page';
// import { isNumber, isNaN } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import LovMultiple from '@/routes/components/LovMultiple';
import ValueList from 'components/ValueList';

import styles from '@/routes/index.less';

// Option组件初始化
const { Option } = Select;
// RadioGroup组件初始化
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tenantId = getCurrentOrganizationId();

// const FormItem = Form.Item;
@formatterCollections({ code: ['sslm.supplierKpiIndicator'] })
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // actionSourceCode: 'CUSTOM',
      cooperationFlag: false,
      showCategoryIdsFlag: false,
      showSupplierCategoryFlag: false,
      showBuyerSupplierFlag: false,
      showStageIdsFlag: false,
      categoryIdsSelectRows: [],
      itemCategorySelectRows: [],
      optionsDisabledFlag: {},
      showReceivingStorageNum: false,
      evalSortDefaultValue: 'DENSE',
      cuxFlag: false, // 二开控制【选择考评颗粒度】是否禁用
      cuxShowSupplierCategoryFlag: false, // 二开控制【供货品类】是否展示
    };

    // 方法注册
    // ['onSourceCodeChange'].forEach(method => {
    //   this[method] = this[method].bind(this);
    // });
  }

  componentDidMount() {
    const {
      onRef = e => e,
      dataSource: {
        trxLineFlag,
        trxLineFlags,
        evalDimension,
        evalDimensionValue,
        evalDimensionValueMeaning,
        categoryDescriptions,
        itemCategoryNames,
        purchaseAgentNames,
      } = {},
      kpiSupplierScope = [],
      evaluationTemplateRemote,
    } = this.props;
    onRef(this);
    const optionsDisabledFlag = {};
    const newTrxLineFlags = (trxLineFlags || trxLineFlag)?.toString();
    kpiSupplierScope.forEach(i => {
      if (i.value === '2') {
        optionsDisabledFlag[i.value] = newTrxLineFlags?.split(',').includes('4');
      } else if (i.value === '3') {
        optionsDisabledFlag[i.value] = newTrxLineFlags?.split(',').includes('4');
      } else if (i.value === '4') {
        optionsDisabledFlag[i.value] =
          newTrxLineFlags?.split(',').includes('3') ||
          newTrxLineFlags?.split(',').includes('2') ||
          newTrxLineFlags?.split(',').includes('5');
      } else if (i.value === '5') {
        optionsDisabledFlag[i.value] = newTrxLineFlags?.split(',').includes('4');
      } else {
        optionsDisabledFlag[i.value] = false;
      }
    });

    let fieldProps = {};
    if (evaluationTemplateRemote) {
      // 控制不同参评供应商范围，展示不同的字段，返回一个对象
      fieldProps = evaluationTemplateRemote.process(
        'SSLM_EVALUATIONTEMPLATE_DEFINITION.ASSIGN_SUPPLIER_CATEGORY.FIELD_PROPS',
        {},
        { newTrxLineFlags }
      );
    }

    const { cuxShowSupplierCategoryFlag = false } = fieldProps || {};
    this.setState({
      cooperationFlag: newTrxLineFlags?.split(',').includes('2'),
      showCategoryIdsFlag: newTrxLineFlags?.split(',').includes('3'),
      showSupplierCategoryFlag: newTrxLineFlags?.split(',').includes('4'),
      showBuyerSupplierFlag: newTrxLineFlags?.split(',').includes('7'),
      showStageIdsFlag: newTrxLineFlags?.split(',').includes('5'),
      showReceivingStorageNum: newTrxLineFlags?.split(',').includes('1'),
      selectEvalDimensionValue: evalDimension,
      evalDimensionValue,
      evalDimensionValueMeaning,
      categoryIdsSelectRows: categoryDescriptions || [],
      itemCategorySelectRows: itemCategoryNames || [],
      purchaseAgentIdsSelectRows: purchaseAgentNames || [],
      optionsDisabledFlag,
      cuxFlag: evaluationTemplateRemote?.process(
        'SSLM_EVALUATIONTEMPLATE_DEFINITION.ASSIGN_SUPPLIER_CATEGORY_FLAG',
        false,
        { newTrxLineFlags }
      ),
      cuxShowSupplierCategoryFlag,
    });
  }

  /**
   * 选择参评供应商范围值更换
   */
  @Bind()
  async handleChangeScope(value) {
    const {
      handleCheckSupplier = () => {},
      form: { setFieldsValue = e => e },
      onEvalGranularityChange = e => e,
      evaluationTemplateRemote,
    } = this.props;
    const { optionsDisabledFlag } = this.state;
    if (evaluationTemplateRemote?.event) {
      const eventProps = {
        value,
        that: this,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await evaluationTemplateRemote.event.fireEvent(
        'cuxHandleChangeScope',
        eventProps
      );
      if (!res) {
        return;
      }
    }

    if (value.includes('2') || value.includes('3') || value.includes('5') || value.includes('7')) {
      setFieldsValue({ evalGranularity: 'SU' });
      onEvalGranularityChange('SU');
    }
    if (value.includes('4')) {
      setFieldsValue({ evalGranularity: 'SU+CA' });
      onEvalGranularityChange('SU+CA');
    }

    // 处理参评供应商范围下拉选项的disable
    const newOptionsDisabledFlag = {};
    Object.keys(optionsDisabledFlag).forEach(i => {
      if (i === '2') {
        newOptionsDisabledFlag[i] = value.includes('4');
      } else if (i === '3') {
        newOptionsDisabledFlag[i] = value.includes('4');
      } else if (i === '4') {
        newOptionsDisabledFlag[i] =
          value.includes('3') || value.includes('2') || value.includes('5');
      } else if (i === '5') {
        newOptionsDisabledFlag[i] = value.includes('4');
      } else {
        newOptionsDisabledFlag[i] = false;
      }
    });

    if (evaluationTemplateRemote?.event) {
      const eventProps = {
        value,
        that: this,
      };
      evaluationTemplateRemote.event.fireEvent('cuxChangeScope', eventProps);
    }

    this.setState({
      cooperationFlag: value.includes('2'),
      showCategoryIdsFlag: value.includes('3'),
      showSupplierCategoryFlag: value.includes('4'),
      showBuyerSupplierFlag: value.includes('7'),
      showStageIdsFlag: value.includes('5'),
      optionsDisabledFlag: newOptionsDisabledFlag,
      showReceivingStorageNum: value.includes('1'),
    });

    handleCheckSupplier(!isEmpty(value));
  }

  /**
   * handleSelectChange - 考评维度下拉框改变时触发
   * @param {string} value - 当前选择的值
   */
  @Bind()
  handleSelectChange(value) {
    const {
      form: { setFieldsValue = e => e },
    } = this.props;
    this.setState({
      selectEvalDimensionValue: value,
      evalDimensionValue: undefined,
      evalDimensionValueMeaning: undefined,
    });
    setFieldsValue({ evalDimensionValue: undefined });
  }

  render() {
    const {
      form,
      dataSource,
      form: { getFieldDecorator = e => e, getFieldValue = e => e },
      dataSource: {
        // indicatorId,
        // indicatorCode,
        // indicatorName,
        // scoreType,
        // scoreFrom,
        // scoreTo,
        // parentIndicatorId,
        // parentIndicatorName,
        evalTplCode,
        // childrenCount,
        // defaultScore,
        evalTplName,
        evalDimension,
        evalStatusCode,
        // evalDimensionMeaning,
        evalGranularity,
        // evalGranularityMeaning,
        evalTplType,
        trxLineFlag,
        trxLineFlags,
        checkDetailFlag,
        checkCollectFlag,
        checkLevelFlag,
        cooperationDays,
        inventoryTimes,
        evalTplId,
        categoryIds,
        purchaseAgentIds,
        itemCategoryIds,
        stageIds,
        deliveryTimes,
        evalSortMethod,
      },
      evalDimensionCode = [],
      evalGranularityCode = [],
      evalSortMethodCode = [],
      kpiSupplierScope = [],
      onEvalGranularityChange = e => e,
      onEvalSortMethodChange = e => e,
      openAutoCategory = e => e,
      evaluationTemplateRemote,
    } = this.props;
    const {
      cooperationFlag,
      selectEvalDimensionValue,
      evalDimensionValue,
      evalDimensionValueMeaning,
      showCategoryIdsFlag,
      showSupplierCategoryFlag,
      showBuyerSupplierFlag,
      showStageIdsFlag,
      categoryIdsSelectRows,
      purchaseAgentIdsSelectRows,
      itemCategorySelectRows,
      showReceivingStorageNum,
      evalSortDefaultValue,
      cuxFlag,
      cuxShowSupplierCategoryFlag,
    } = this.state;
    const newTrxLineFlags = (trxLineFlags || trxLineFlag)?.toString();
    const formTrxLineFlags = getFieldValue('trxLineFlags') || []; // 获取表单的trxLineFlags值
    const renderProps = {
      form,
      dataSource,
    };
    return (
      <Form>
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col span={5}>
            {intl.get(`sslm.supplierKpiIndicator.model.issuedOrder.evalTmplCode`).d('评分模板代码')}
          </Col>
          <Col span={17}>{evalTplCode}</Col>
        </Row>
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col span={5}>
            {intl.get(`sslm.supplierKpiIndicator.model.issuedOrder.evalTmplDesc`).d('评分模板描述')}
          </Col>
          <Col span={17}>{evalTplName}</Col>
        </Row>
        <Row gutter={24} style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Col span={5}>
            {intl.get(`sslm.supplierKpiIndicator.model.issuedOrder.choseEvalDim`).d('选择考评维度')}
            :
          </Col>
          <Col span={10}>
            {getFieldDecorator('evalDimension', {
              initialValue: evalDimension || 'SU+CA',
              rules: [
                {
                  required: true,
                  message: intl.get(`hzero.common.validation.notNull`, {
                    name: intl
                      .get(`sslm.supplierKpiIndicator.model.issuedOrder.choseEvalDim`)
                      .d('选择考评维度'),
                  }),
                },
              ],
            })(
              <Select
                disabled={evalStatusCode === 'PUBLISHED'}
                allowClear
                onChange={this.handleSelectChange}
              >
                {evalDimensionCode.map(n => (
                  <Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Option>
                ))}
              </Select>
            )}
          </Col>
          {!isEmpty(getFieldValue('evalDimension')) &&
            getFieldValue('evalDimension') !== 'GROUP' &&
            evalTplType === 'GYSKP_AUTO' && (
              <Col span={8}>
                <a onClick={() => openAutoCategory(getFieldValue('evalDimension'))}>
                  {evalStatusCode === 'PUBLISHED'
                    ? intl
                        .get(`sslm.supplierKpiIndicator.model.issuedOrder.viewDimValue`)
                        .d('查看维度值')
                    : intl
                        .get(`sslm.supplierKpiIndicator.model.issuedOrder.chooseDimValue`)
                        .d('选择维度值')}
                </a>
              </Col>
            )}
        </Row>
        {!isEmpty(getFieldValue('evalDimension')) &&
          getFieldValue('evalDimension') !== 'GROUP' &&
          (evalTplType === 'GYSKP' || evalTplType === 'BDKPI_EVAL') && (
            <Row gutter={24} style={{ marginBottom: 16 }}>
              <Col span={15}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplierKpiIndicator.model.issuedOrder.defaultDimValue`)
                    .d('默认维度值')}
                  className={styles['kpi-form-label']}
                >
                  {getFieldDecorator('evalDimensionValue', {
                    initialValue: evalDimensionValue,
                  })(
                    <Lov
                      code={
                        selectEvalDimensionValue === 'COMPANY'
                          ? 'SSLM.KPI_EVAL_DIM_COMPANY'
                          : selectEvalDimensionValue === 'PU'
                          ? 'SSLM.KPI_EVAL_DIM_PURORG'
                          : 'SSLM.KPI_EVAL_DIM_INVORG'
                      }
                      queryParams={{
                        evalTplId:
                          selectEvalDimensionValue === 'COMPANY' ||
                          selectEvalDimensionValue === 'IU'
                            ? evalTplId
                            : undefined,
                        tenantId,
                      }}
                      disabled={evalStatusCode === 'PUBLISHED'}
                      textValue={evalDimensionValueMeaning}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col span={6}>
            {intl
              .get('sslm.supplierKpiIndicator.model.issuedOrder.checkDetailFlag')
              .d('允许校准考评档案结果')}
          </Col>
          <Col span={6}>
            {getFieldDecorator('checkDetailFlag', {
              initialValue: checkDetailFlag,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                disabled={evalStatusCode === 'PUBLISHED'}
              />
            )}
            <span style={{ paddingLeft: '1em' }}>
              {intl
                .get('sslm.supplierKpiIndicator.view.checkbox.checkCollectFlag')
                .d('校准明细得分')}
            </span>
          </Col>
          <Col span={6}>
            {getFieldDecorator('checkCollectFlag', {
              initialValue: checkCollectFlag,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                disabled={evalStatusCode === 'PUBLISHED'}
              />
            )}
            <span style={{ paddingLeft: '1em' }}>
              {intl.get('sslm.supplierKpiIndicator.view.checkbox.summaryScore').d('校准汇总得分')}
            </span>
          </Col>
          <Col span={6}>
            {getFieldDecorator('checkLevelFlag', {
              initialValue: checkLevelFlag,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                disabled={evalStatusCode === 'PUBLISHED'}
              />
            )}
            <span style={{ paddingLeft: '1em' }}>
              {intl.get('sslm.supplierKpiIndicator.view.checkbox.checkLevelFlag').d('校准评分等级')}
            </span>
          </Col>
        </Row>
        <Row gutter={24} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Col span={5}>
            {intl
              .get(`sslm.supplierKpiIndicator.model.issuedOrder.evaluateScope`)
              .d('选择参评供应商范围')}
          </Col>
          <Col span={10}>
            {getFieldDecorator('trxLineFlags', {
              initialValue: newTrxLineFlags?.split(',') || [],
            })(
              <Select
                mode="multiple"
                onChange={value => this.handleChangeScope(value)}
                disabled={evalTplType === 'BDKPI_EVAL' || evalStatusCode === 'PUBLISHED'}
                allowClear
              >
                {kpiSupplierScope.map(n => (
                  <Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Option>
                ))}
              </Select>
            )}
          </Col>
        </Row>
        {formTrxLineFlags.includes('6') && (
          <Row gutter={24}>
            <Col span={15}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.issuedOrder.deliveryTimes`)
                  .d('送货单次数（≥）')}
                className={styles['kpi-form-label']}
              >
                {getFieldDecorator('deliveryTimes', {
                  initialValue: deliveryTimes || deliveryTimes === 0 ? deliveryTimes : 1,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.issuedOrder.deliveryTimes`)
                          .d('送货单次数（≥）'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    precision={0}
                    style={{ width: '100%' }}
                    disabled={evalStatusCode === 'PUBLISHED'}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {showBuyerSupplierFlag && (
          <Row gutter={24}>
            <Col span={15}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`sslm.common.model.buyer`).d('采购员')}
                className={styles['kpi-form-label']}
              >
                {getFieldDecorator('purchaseAgentIds', {
                  initialValue: purchaseAgentIds,
                  rules: [
                    {
                      required: showBuyerSupplierFlag,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`sslm.common.model.buyer`).d('采购员'),
                      }),
                    },
                  ],
                })(
                  <LovMultiple
                    code="SPFM.TENANT_PURCHASE_AGENT"
                    textValue={purchaseAgentIdsSelectRows.map(i => i.purchaseAgentName).join()}
                    textField="purchaseAgentName"
                    lovOptions={{
                      valueField: 'purchaseAgentId',
                      displayField: 'purchaseAgentName',
                    }}
                    queryParams={{ organizationId: tenantId }}
                    changeSelectRows={newSelectedRows =>
                      this.setState({ purchaseAgentIdsSelectRows: newSelectedRows })
                    }
                    selectedRows={purchaseAgentIdsSelectRows}
                    // getCheckboxProps={record => ({ disabled: +record.hasChild })}
                    disabled={evalStatusCode === 'PUBLISHED'}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {showCategoryIdsFlag && (
          <Row gutter={24}>
            <Col span={15}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.issuedOrder.categoryIds`)
                  .d('供应商分类')}
                className={styles['kpi-form-label']}
              >
                {getFieldDecorator('categoryIds', {
                  initialValue: categoryIds,
                  rules: [
                    {
                      required: showCategoryIdsFlag,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.issuedOrder.categoryIds`)
                          .d('供应商分类'),
                      }),
                    },
                  ],
                })(
                  <LovMultiple
                    code="SSLM.SUPPLIER_CATEGORY_TREE"
                    textValue={categoryIdsSelectRows.map(i => i.categoryDescription).join()}
                    textField="categoryDescription"
                    lovOptions={{ valueField: 'categoryId', displayField: 'categoryDescription' }}
                    queryParams={{ organizationId: tenantId }}
                    changeSelectRows={newSelectedRows =>
                      this.setState({ categoryIdsSelectRows: newSelectedRows })
                    }
                    selectedRows={categoryIdsSelectRows}
                    getCheckboxProps={record => ({ disabled: +record.hasChild })}
                    disabled={evalStatusCode === 'PUBLISHED'}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {(showSupplierCategoryFlag || cuxShowSupplierCategoryFlag) && (
          <Row gutter={24}>
            <Col span={15}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.issuedOrder.supplierProduct`)
                  .d('供货品类')}
                className={styles['kpi-form-label']}
              >
                {getFieldDecorator('itemCategoryIds', {
                  initialValue: itemCategoryIds,
                  rules: [
                    {
                      required: showSupplierCategoryFlag || cuxShowSupplierCategoryFlag,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.issuedOrder.supplierProduct`)
                          .d('供货品类'),
                      }),
                    },
                  ],
                })(
                  <LovMultiple
                    code="SMDM.TREE_ITEM_CATEGORY_NEW"
                    textValue={itemCategorySelectRows.map(i => i.categoryName).join()}
                    textField="categoryName"
                    lovOptions={{ valueField: 'categoryId', displayField: 'categoryName' }}
                    queryParams={{ organizationId: tenantId, enabledFlag: 1 }}
                    changeSelectRows={newSelectedRows => {
                      this.setState({ itemCategorySelectRows: newSelectedRows });
                    }}
                    parentRowKey="parentCategoryId"
                    isCascade
                    selectedRows={itemCategorySelectRows}
                    disabled={evalStatusCode === 'PUBLISHED'}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {showStageIdsFlag && (
          <Row gutter={24}>
            <Col span={15}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.issuedOrder.lifeCycle`)
                  .d('生命周期')}
                className={styles['kpi-form-label']}
              >
                {getFieldDecorator('stageIds', {
                  initialValue: (stageIds && stageIds?.split(',').map(i => Number(i))) || [],
                  rules: [
                    {
                      required: showStageIdsFlag,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.issuedOrder.lifeCycle`)
                          .d('生命周期'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    lovCode="SSLM.LIFE_CYCLE_STAGE_FOR_EVAL"
                    organizationId={tenantId}
                    textField="stageDescription"
                    valueField="stageId"
                    mode="multiple"
                    lazyLoad={false}
                    allowClear
                    disabled={evalStatusCode === 'PUBLISHED'}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {cooperationFlag && (
          <Row gutter={24}>
            <Col span={15}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.issuedOrder.cooperationDay`)
                  .d('合作天数')}
                className={styles['kpi-form-label']}
              >
                {getFieldDecorator('cooperationDays', {
                  initialValue: cooperationDays,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.issuedOrder.cooperationDay`)
                          .d('合作天数'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    precision={0}
                    style={{ width: '100%' }}
                    disabled={evalStatusCode === 'PUBLISHED'}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {showReceivingStorageNum && (
          <Row gutter={24}>
            <Col span={15}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.issuedOrder.inventoryTimes`)
                  .d('接收入库次数（≥）')}
                className={styles['kpi-form-label']}
              >
                {getFieldDecorator('inventoryTimes', {
                  initialValue: inventoryTimes || 1,
                  rules: [
                    {
                      required: newTrxLineFlags?.split(',').includes('1'),
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.issuedOrder.inventoryTimes`)
                          .d('接收入库次数（≥）'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    precision={0}
                    style={{ width: '100%' }}
                    disabled={evalStatusCode === 'PUBLISHED'}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {evaluationTemplateRemote &&
          evaluationTemplateRemote.render(
            'SSLM_EVALUATIONTEMPLATE_DEFINITION_ASSIGN_SUPPLIER_CATEGORY_FORM',
            <></>,
            renderProps
          )}
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col span={5}>
            {intl
              .get(`sslm.supplierKpiIndicator.model.issuedOrder.chooseGranul`)
              .d('选择考评颗粒度')}
          </Col>
          <Col span={17}>
            {getFieldDecorator('evalGranularity', {
              initialValue: evalGranularity,
            })(
              <RadioGroup
                disabled={
                  evalStatusCode === 'PUBLISHED' ||
                  cooperationFlag ||
                  showCategoryIdsFlag ||
                  showSupplierCategoryFlag ||
                  showBuyerSupplierFlag ||
                  showStageIdsFlag ||
                  cuxFlag
                }
                onChange={e => onEvalGranularityChange(e.target.value)}
              >
                {evalGranularityCode.map(n => (
                  <Radio key={n.value} value={n.value}>
                    {n.meaning}
                  </Radio>
                ))}
              </RadioGroup>
            )}
          </Col>
        </Row>
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col span={5}>
            {intl
              .get(`sslm.supplierKpiIndicator.model.issuedOrder.evalSortMethod`)
              .d('考评档案排名方式')}
          </Col>
          <Col span={17}>
            {getFieldDecorator('evalSortMethod', {
              initialValue: evalSortMethod || evalSortDefaultValue,
            })(
              <RadioGroup
                disabled={evalStatusCode === 'PUBLISHED'}
                onChange={e => onEvalSortMethodChange(e.target.value)}
              >
                {evalSortMethodCode.map(n => {
                  const tooltipTitle =
                    n.value === 'DENSE'
                      ? intl
                          .get(`sslm.supplierKpiIndicator.message.tooltip.dense`)
                          .d('平局/并列具有相同的排名，但不会跳过下一个值，比如1,2,2,3,4')
                      : n.value === 'STANDARD'
                      ? intl
                          .get(`sslm.supplierKpiIndicator.message.tooltip.standard`)
                          .d('平局/并列具有相同的排名，并且跳过下一个排名值，比如1,2,2,4,5')
                      : '';
                  return (
                    <Radio key={n.value} value={n.value}>
                      <Tooltip title={tooltipTitle}>{n.meaning}</Tooltip>
                    </Radio>
                  );
                })}
              </RadioGroup>
            )}
          </Col>
        </Row>
      </Form>
    );
  }
}
