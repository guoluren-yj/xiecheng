/*
 * PurchaseRequestHeader - 采购申请头页面
 * @date: 2019-01-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Tooltip, DatePicker } from 'hzero-ui'; // Checkbox
import { Bind } from 'lodash-decorators';
import { Currency, NumberField, TextArea, TextField } from 'choerodon-ui/pro';
import classnames from 'classnames';
import moment from 'moment';
import intl from 'utils/intl';
import { thousandBitSeparator, precisionParams } from '@/routes/utils.js'; // precisionParams
import { dateRender, dateTimeRender } from 'utils/renderer';
import Lov from 'components/Lov';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';

import { isEmpty, isFunction } from 'lodash';
import { getUserOrganizationId, getDateFormat } from 'utils/utils'; // getCurrentOrganizationId
import {
  fetchAutoGetCompany,
  fetchAutoGetPurchasing,
  queryDetailHeader,
  fetchCnyExit,
} from '@/services/purchaseRequisitionCreationService';
import { getCurrentTenant } from 'hzero-front/lib/utils/utils';

// import TooltipInput from './../../components/TooltipInput';
// FormItem组件初始化
// const FormItem = Form.Item;
// TextArea组件初始化
// const { TextArea } = Input;
const FormItem = Form.Item;

const messagePrompt = 'sprm.purchaseRequisitionCreation.view.message';
const commonPrompt = 'sprm.common.model.common';

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
export default class PurchaseRequestHeader extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      organizationId: getUserOrganizationId(),
      ouIdVisible: false,
      purchaseIdVisible: false,
      headerInfo: {},
    };
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleToolTipVisible(field, value) {
    this.setState({
      [field]: !!value,
    });
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleTeamToolTipVisible(field, value) {
    this.setState({
      [field]: !!value,
    });
  }

  @Bind()
  handleHeaderSave() {
    const { form } = this.props;
    return form;
  }

  componentDidMount() {
    this.fetchDetailHeader(true);
  }

  @Bind()
  async fetchAuto() {
    // const { tenantId } = this.state;
    const { form } = this.props;
    await fetchCnyExit({
      // enabledFlag: 1,
      currencyCode: 'CNY',
      // tenantId,
    }).then((cnyResult) => {
      if (cnyResult && !cnyResult.failed) {
        form.registerField('originalCurrency');
        form.setFieldsValue({ originalCurrency: cnyResult.currencyCode });
        this.handleCurrencyChange(null, cnyResult);
      }
    });
    this.fetchAutoGetCompany({}, false);
  }

  @Bind()
  fetchDetailHeader(firstRender, newPrHeaderId) {
    const {
      form,
      process,
      prHeaderId,
      remote,
      // fetchItemLimit,
      headerChangeeLoading = (e) => e,
      fetchBasePrice = () => {},
    } = this.props;
    form.resetFields();
    if (prHeaderId || newPrHeaderId) {
      queryDetailHeader({
        prHeaderId: prHeaderId || newPrHeaderId,
        unitCode: 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_HEADER',
      }).then((res = {}) => {
        if (res) {
          // fetchItemLimit(res);
          const { companyId, prSourcePlatform } = res;
          fetchBasePrice(companyId, prSourcePlatform);
          if (firstRender) {
            this.setState({ headerInfo: res }, () => {
              process('finishHeader');
              headerChangeeLoading();
            });
          } else {
            this.setState({ headerInfo: res });
            headerChangeeLoading();
          }
        }
      });
    } else {
      const { handleCuxInitHeader = undefined } = remote?.props?.process || {};
      this.fetchAuto();
      const cuxInitData = isFunction(handleCuxInitHeader) ? handleCuxInitHeader({ form }) : {};
      this.setState({ headerInfo: cuxInitData || {} }, () => {
        headerChangeeLoading();
      });
    }
  }

  @Bind()
  getInfo() {
    return this.state.headerInfo;
  }

  // 改变申请人
  @Bind()
  requestedByChange(value, record = {}) {
    const { headerInfo } = this.state;
    const { form } = this.props;
    form.registerField('prRequestedString');
    form.setFieldsValue({
      prRequestedString: record?.loginName ? `${record?.loginName}-${record?.userName}` : '',
    });
    this.setState({
      headerInfo: {
        ...headerInfo,
        requestedBy: record?.userId || undefined,
        prRequestedName: record?.userName || undefined,
        prRequestedNum: record?.loginName,
        prRequestedString: record?.loginName
          ? `${record?.loginName}-${record?.userName}`
          : record?.userName,
      },
    });
  }

  @Bind()
  async fetchAutoGetCompany(query, flag) {
    const { form, setOrgChange, getlistData } = this.props;
    const data = getlistData() || [];
    if (isEmpty(query)) {
      data.forEach((ele) => {
        ele.$form.setFieldsValue({
          invOrganizationName: undefined,
          invOrganizationId: undefined,
          inventoryId: undefined,
          inventoryName: undefined,
        });
      });
    }
    form.registerField('ouChangeFlag');
    form.registerField('batchInvOrganizationId');
    form.setFieldsValue({ ouChangeFlag: 1, batchInvOrganizationId: null });
    await fetchAutoGetCompany(query).then((res) => {
      if (flag && res) {
        const { ouId, ouCode, ouName, purchaseOrgId, purchaseOrgName } = res;
        form.registerField('ouCode');
        if (query.ouId) {
          form.setFieldsValue({ purchaseOrgId, purchaseOrgName });
        } else {
          form.setFieldsValue({
            ouId,
            ouCode,
            ouName,
            purchaseOrgId,
            purchaseOrgName,
          });
        }
      } else if (res) {
        const {
          ouId,
          ouCode,
          ouName,
          purchaseOrgId,
          purchaseOrgName,
          companyName,
          companyId,
          organizationId,
          organizationName,
          inventoryId,
          inventoryName,
        } = res;
        if (purchaseOrgId) {
          this.fetchAutoGetPurchasing({ purchaseOrgId, functionCode: 'PR' }, flag);
        }
        form.setFieldsValue({
          companyName,
          companyId,
          ouId,
          ouCode,
          ouName,
          purchaseOrgId,
          purchaseOrgName,
        });
        setOrgChange(
          {
            organizationId,
            organizationName,
            invOrganizationName: organizationName,
            invOrganizationId: organizationId,
            inventoryId,
            inventoryName,
          },
          true
        );
      }
      const { organizationId, organizationName, inventoryId, inventoryName } = res || {};
      if (organizationId && organizationName) {
        setOrgChange(
          {
            organizationId,
            organizationName,
            invOrganizationName: organizationName,
            invOrganizationId: organizationId,
            inventoryId,
            inventoryName,
          },
          true
        );
      } else {
        setOrgChange(
          {
            organizationId: undefined,
            organizationName: undefined,
            invOrganizationName: undefined,
            invOrganizationId: undefined,
            inventoryId: undefined,
            inventoryName: undefined,
          },
          true
        );
      }
      return res;
    });
  }

  @Bind()
  async fetchAutoGetPurchasing(query, flag = true) {
    const { headerInfo = {} } = this.state;
    const { form } = this.props;
    await fetchAutoGetPurchasing(query).then((res) => {
      if (res) {
        const { purchaseAgentId, purchaseAgentCode, purchaseAgentName } = res;
        const newRes = purchaseAgentId
          ? {
              purchaseAgentId,
              purchaseAgentCode,
              purchaseAgentName,
            }
          : {
              purchaseAgentCode: undefined,
              purchaseAgentId: undefined,
              purchaseAgentName: undefined,
            };

        this.setState({ headerInfo: { ...headerInfo, ...newRes } });
        if (flag) {
          form.setFieldsValue({ purchaseAgentId, purchaseAgentCode, purchaseAgentName });
        }
        return res;
      }
    });
  }

  // 头信息-采购员字段-变更事件
  @Bind()
  handleChangePurchaseAgent(value, record) {
    const { headerInfo } = this.state;
    const { getlistData } = this.props;
    const listDataSource = getlistData() || [];
    if (value && headerInfo.prHeaderId) {
      listDataSource.forEach((ele) =>
        ele.$form.setFieldsValue({
          purchaseAgentId: record.purchaseAgentId || undefined,
          agentName: record.purchaseAgentName || undefined,
        })
      );
    }
    this.setState({
      headerInfo: {
        ...headerInfo,
        purchaseAgentId: record.purchaseAgentId || undefined,
        purchaseAgentName: record.purchaseAgentName || undefined,
      },
    });
  }

  @Bind()
  handleCurrencyChange(value, record = {}) {
    const { headerInfo } = this.state;
    const { getlistData, setListData } = this.props;
    const listDataSource = getlistData() || [];
    const lineData = [];
    if (value) {
      listDataSource.forEach((ele) => {
        ele.$form.registerField('currencyName');
        ele.$form.setFieldsValue({
          originalCurrency: record.currencyCode || undefined,
          financialPrecision: record.financialPrecision || undefined,
          defaultPrecision: record.defaultPrecision || undefined,
        });

        lineData.push({
          ...ele,
          currencyCode: record.currencyCode || undefined,
          currencyName: record.currencyName,
          financialPrecision: record.financialPrecision || undefined,
          defaultPrecision: record.defaultPrecision || undefined,
        });
      });
      setListData(lineData);
    }
    this.setState({
      headerInfo: {
        ...headerInfo,
        originalCurrency: record.currencyCode || undefined,
        financialPrecision: record.financialPrecision || undefined,
        defaultPrecision: record.defaultPrecision || undefined,
      },
    });
  }

  @Bind()
  handleLocalCurrencyChange(value, record = {}) {
    const { headerInfo } = this.state;
    const { getlistData, setListData } = this.props;
    const lineData = [];
    const listDataSource = getlistData() || [];
    listDataSource.forEach((ele) => {
      ele.$form.setFieldsValue({
        localFinancialPrecision: record.financialPrecision || undefined,
        localDefaultPrecision: record.defaultPrecision || undefined,
      });
      lineData.push({
        ...ele,
        localFinancialPrecision: record.financialPrecision || undefined,
        localDefaultPrecision: record.defaultPrecision || undefined,
      });
    });
    this.setState({
      headerInfo: {
        ...headerInfo,
        currencyCode: record.currencyCode || undefined,
        localFinancialPrecision: record.financialPrecision || undefined,
        localDefaultPrecision: record.defaultPrecision || undefined,
      },
      // listDataSource: listDataSource.map(ele => ({
      //   ...ele,
      //   localFinancialPrecision: record.financialPrecision,
      //   localDefaultPrecision: record.defaultPrecision,
      // })),
    });
    setListData(lineData);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { organizationId, ouIdVisible, purchaseIdVisible, headerInfo } = this.state;
    const {
      isMatch,
      // isCopy = 0,
      EComAndRejectDisabled,
      form = {},
      prHeaderId,
      customizeForm,
      getlistUpdate,
      fetchItemLimit,
      notificationForMaterial,
      remote,
      getlistData,
    } = this.props;
    const { getFieldDecorator, getFieldValue, getFieldProps } = form || {};
    const remarkProps = getFieldProps ? getFieldProps('remark') : {};
    // const titleProps = getFieldProps ? getFieldProps('title') : {};
    const remarkRules = remarkProps['data-__meta']?.rules?.find((e) => e.required === true) || {};
    // const titleRules = titleProps['data-__meta']?.rules?.find(e => e.required === true) || {};
    const { tenantNum } = getCurrentTenant();
    const {
      prNum,
      // freight,
      creationDate,
      lotNum,
      amount,
      // contactTelNum,
      ouId,
      ouName,
      remark,
      purchaseOrgId,
      purchaseOrgName,
      companyId,
      companyName,
      purchaseAgentId,
      purchaseAgentName,
      title,
      prSourcePlatform = 'SRM',
      prSourcePlatformMeaning,
      paymentMethodName,
      prStatusCode,
      unitId,
      unitName,
      createByName,
      // 新增字段
      requestDate, // 申请日期
      prTypeId,
      prTypeCode,
      prTypeName,
      requestedBy,
      prRequestedName,
      originalCurrency,
      paymentMethodCode,
      // splitFreightFlag,
      // newMallFlag, // 来自于新商城还是老商城
      financialPrecision,
      localFinancialPrecision,
      localCurrency,
      localCurrencyNoTaxSum,
      localCurrencyTaxSum,
      localCurrencyTaxSumMeaning,
      localCurrencyNoTaxSumMeaning,
      sourceCode,
      sourceCodeMeaning,
      headerPriceHiddenFlag: priceHiddenFlag,
      amountMeaning,
      prRequestedNum,
    } = headerInfo;
    const renderFlag = [
      'SUBMIT_SYN',
      'SUBMITTED',
      'APPROVED',
      'CANCELLED',
      'CLOSED',
      'ASSIGNED',
      'SUSPEND',
      'EXCUTED',
      'WORKFLOW_APPROVAL',
      'EXOSYS_APPROVAL',
    ].includes(prStatusCode);
    getlistUpdate();
    fetchItemLimit({
      ...(this.props.form?.getFieldsValue() || {}),
      prLineList: undefined,
      addLineList: undefined,
      batchEditFieldMap: undefined,
    });
    const { handleCuxFormItem = undefined } = remote?.props?.process || {};
    const CuxFormDom = isFunction(handleCuxFormItem) ? (
      handleCuxFormItem({ form, headerInfo, getlistData, getFieldProps, _this: this })
    ) : (
      <span />
    );
    return customizeForm(
      {
        code: 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_HEADER',
        dataSource: headerInfo,
        form: this.props.form,
        clearCache: () => {},
        // useNewValid: true,
        isCreate: true,
      },
      <Form>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          // className={EComAndRejectDisabled ? 'read-half-row' : 'half-row'}
        >
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.title`).d('标题')}>
              {getFieldDecorator('title', {
                initialValue: title,
                rules: [
                  {
                    max: 200,
                    message: intl.get('hzero.common.validation.max', { max: 200 }),
                  },
                ],
              })(EComAndRejectDisabled || renderFlag ? <span>title</span> : <TextField />)}
            </FormItem>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={EComAndRejectDisabled ? 'read-row' : 'inclusion-row'}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.sqType`).d('申请类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prTypeName', {
                initialValue: prTypeName,
              })}
              {getFieldDecorator('prTypeCode', {
                initialValue: prTypeCode,
              })}
              {getFieldDecorator('prTypeId', {
                initialValue: prTypeId,
              })(
                prSourcePlatform !== 'SHOP' && !renderFlag ? (
                  <Lov
                    code="SPUC.PR_DEMAND_TYPE"
                    textValue={prTypeName}
                    textField="prTypeName"
                    onChange={(value, lovRecord) => {
                      form.setFieldsValue({
                        prTypeName: lovRecord.prTypeName,
                        prTypeCode: lovRecord.prTypeCode,
                      });
                    }}
                    queryParams={{
                      tenantId: organizationId,
                    }}
                  />
                ) : (
                  <span>{prTypeName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prNum', { initialValue: prNum })(<span>{prNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.creationTime`).d('创建时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', { initialValue: creationDate })(
                <span>{dateTimeRender(creationDate)}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={EComAndRejectDisabled ? 'read-row' : 'inclusion-row'}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.amount`).d('申请总额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('amount', { initialValue: amount })(
                <span>
                  {priceHiddenFlag === 1
                    ? amountMeaning
                    : prSourcePlatform === 'SRM'
                    ? thousandBitSeparator(amount, financialPrecision)
                    : amount}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.roles.creator`).d('创建人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('createByName', { initialValue: createByName })(
                <span>{createByName}</span>
              )}
            </FormItem>
          </Col>
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.contactTelNum`).d('联系电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contactTelNum', {
                initialValue: contactTelNum,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(
                EComAndRejectDisabled ? (
                  <span>{contactTelNum}</span>
                ) : (
                  <Input inputChinese={false} disabled={EComAndRejectDisabled} />
                )
              )}
            </FormItem>
          </Col> */}
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          // className={EComAndRejectDisabled ? 'read-row' : 'inclusion-row'}
          className="inclusion-row"
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyId', {
                initialValue: companyId,
                rules: [
                  {
                    required: !(
                      ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) ||
                      EComAndRejectDisabled
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.company.tag`).d('公司'),
                    }),
                  },
                ],
              })(
                ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) ||
                  EComAndRejectDisabled ||
                  renderFlag ? (
                    <span>{companyName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.COMPANY"
                    textValue={companyName}
                    queryParams={{ tenantId: organizationId, enabledFlag: 1 }}
                    onChange={(value, record) => {
                      const { companyId: companyIdA } = record;
                      this.fetchAutoGetCompany({ companyId: companyIdA }, true);
                      notificationForMaterial(true);
                    }}
                    textField="companyName"
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.business.tag`).d('业务实体')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('ouId', {
                initialValue: ouId,
                rules: [
                  {
                    required: !(EComAndRejectDisabled || !getFieldValue('companyId')),
                    // message: intl.get('hzero.common.validation.notNull').d('{name}不能为空'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.business.tag`).d('业务实体'),
                    }),
                  },
                ],
              })(
                ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) ||
                  EComAndRejectDisabled ||
                  renderFlag ? (
                    <span>{ouName}</span>
                ) : !isMatch ? (
                  <Lov
                    code="SPFM.USER_AUTH.OU"
                    textValue={ouName}
                    textField="ouName"
                    queryParams={{
                      tenantId: organizationId,
                      companyId: getFieldValue('companyId'),
                      enabledFlag: 1,
                    }}
                    disabled={EComAndRejectDisabled || !getFieldValue('companyId')}
                    onMouseEnter={() => this.handleToolTipVisible('ouIdVisible', true)}
                    onMouseLeave={() => this.handleToolTipVisible('ouIdVisible', false)}
                    onChange={(value, record) => {
                      const { ouId: ouIdA } = record;
                      form.setFieldsValue({
                        purchaseOrgId: undefined,
                        purchaseOrgName: undefined,
                      });
                      if (value) {
                        this.fetchAutoGetCompany(
                          { companyId: getFieldValue('companyId'), ouId: ouIdA },
                          true
                        );
                      }
                      notificationForMaterial(true);
                    }}
                  />
                ) : (
                  <span>{ouId}</span>
                )
              )}
              <Tooltip
                visible={ouIdVisible && !getFieldValue('companyId')}
                title={intl.get(`${messagePrompt}.ChooseCompany`).d('请先选择公司')}
              />
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaseOrgId', {
                initialValue: purchaseOrgId,
                rules: [
                  {
                    required: !EComAndRejectDisabled,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.organization.class.purchase`).d('采购组织'),
                    }),
                  },
                ],
              })(
                EComAndRejectDisabled || renderFlag ? (
                  <span>{purchaseOrgName}</span>
                ) : (
                  <Lov
                    code="HPFM.PURCHASE_ORGANIZATION_M"
                    textValue={purchaseOrgName}
                    queryParams={{ tenantId: organizationId, ouId: getFieldValue('ouId') }}
                    disabled={
                      EComAndRejectDisabled || !getFieldValue('ouId') || !getFieldValue('companyId')
                    }
                    textField="purchaseOrgName"
                    onChange={(value, record) => {
                      const { purchaseOrgId: purchaseOrgIdA } = record;
                      form.setFieldsValue({ purchaseAgentId: null });
                      this.fetchAutoGetPurchasing({
                        purchaseOrgId: purchaseOrgIdA,
                        functionCode: 'PR',
                      });
                      notificationForMaterial(true);
                    }}
                    onMouseEnter={() => this.handleTeamToolTipVisible('purchaseIdVisible', true)}
                    onMouseLeave={() => this.handleTeamToolTipVisible('purchaseIdVisible', false)}
                  />
                )
              )}
              <Tooltip
                visible={purchaseIdVisible && !getFieldValue('ouId')}
                title={intl.get(`${messagePrompt}.chooseOuId`).d('请先选择业务实体')}
              />
            </FormItem>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={
            prSourcePlatform === 'E-COMMERCE'
              ? prStatusCode !== 'REJECTED'
                ? 'inclusion-row'
                : 'read-row'
              : 'read-row'
          }
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaseAgentId', {
                initialValue: purchaseAgentId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.organization.class.purchaseAgentName`).d('采购员'),
                    }),
                  },
                ],
              })(
                renderFlag ? (
                  <span>{purchaseAgentName}</span>
                ) : (
                  <Lov
                    code="SPUC.PURCHASE_AGENT"
                    textValue={purchaseAgentName}
                    queryParams={{
                      tenantId: organizationId,
                      purchaseOrgIds: getFieldValue('purchaseOrgId'),
                    }}
                    onChange={(value, record) => this.handleChangePurchaseAgent(value, record)}
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prSourcePlatform', { initialValue: prSourcePlatform })(
                <span>{prSourcePlatformMeaning}</span>
              )}
            </FormItem>
          </Col>
          {prSourcePlatform === 'ERP' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`${commonPrompt}.externalSystemName`).d('外部系统名称')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('sourceCode', {
                  initialValue: sourceCode,
                })(<span>{sourceCodeMeaning}</span>)}
              </FormItem>
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.prMan`).d('申请人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('requestedBy', {
                initialValue: requestedBy,
              })(
                renderFlag ? (
                  <span>{prRequestedName}</span>
                ) : (
                  <Lov
                    code="SPCM.ACCEPT_USER"
                    textValue={`${prRequestedNum}-${prRequestedName}`}
                    queryParams={{
                      tenantId: organizationId,
                    }}
                    textField="prRequestedString"
                    onChange={(value, record) => this.requestedByChange(value, record)}
                  />
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="inclusion-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.unitName`).d('所属部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('unitId', {
                initialValue: unitId,
              })(
                !isMatch && !renderFlag ? (
                  <Lov
                    code="SPRM.USER_UNIT"
                    disabled={!prHeaderId}
                    textValue={unitName}
                    textField="unitName"
                    queryParams={{
                      unitId,
                      tenantId: organizationId,
                      // companyId: valueCompanyId,
                      companyId: getFieldValue('companyId'),
                    }}
                    onChange={(_, record) => {
                      form.setFieldsValue({ unitName: record.unitName });
                    }}
                  />
                ) : (
                  <span>{unitName}</span>
                )
              )}
              {getFieldDecorator('unitName', { initialValue: unitName })}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="inclusion-row">
          {prSourcePlatform === 'E-COMMERCE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`${commonPrompt}.paymentMethodCode`).d('支付方式')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('paymentMethodCode', {
                  initialValue: paymentMethodCode,
                  rules: [
                    {
                      required: !EComAndRejectDisabled,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.paymentMethodCode`).d('支付方式'),
                      }),
                    },
                  ],
                })(<span>{paymentMethodName}</span>)}
              </FormItem>
            </Col>
          )}
          {['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`${commonPrompt}.lotNum`).d('批次号')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('lotNum')(<span>{lotNum}</span>)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="inclusion-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.requestDate`).d('申请日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('requestDate', {
                initialValue: requestDate ? moment(requestDate, getDateFormat()) : undefined,
              })(
                renderFlag ? (
                  <span>{dateRender(requestDate)}</span>
                ) : (
                  <DatePicker
                    placeholder={null}
                    format={getDateFormat()}
                    disabledDate={(current) =>
                      current && current < moment('1970-01-01').startOf('day')
                    }
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.originalCurrency`).d('原币币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('originalCurrency', {
                initialValue: originalCurrency,
              })(
                <Lov
                  code="SPRM.EXCHANGE_RATE.CURRENCY"
                  textValue={originalCurrency}
                  queryParams={{ tenantId: organizationId }}
                  onChange={(value, record) => this.handleCurrencyChange(value, record)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="inclusion-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.localCurrencyNoTaxSum`).d('本币金额(不含税)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('localCurrencyNoTaxSum', {
                initialValue: localCurrencyNoTaxSum,
              })(
                priceHiddenFlag === 1 ? (
                  <span>{localCurrencyNoTaxSumMeaning}</span>
                ) : prSourcePlatform !== 'SRM' ? (
                  <NumberField
                    min={0}
                    disabled
                    numberGrouping
                    {...precisionParams(localFinancialPrecision, prSourcePlatform !== 'SRM')}
                  />
                ) : (
                  <Currency
                    min={0}
                    disabled
                    numberGrouping
                    {...precisionParams(localFinancialPrecision, prSourcePlatform !== 'SRM')}
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.localCurrencyTaxSum`).d('本币金额(含税)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('localCurrencyTaxSum', {
                initialValue: localCurrencyTaxSum,
              })(
                priceHiddenFlag === 1 ? (
                  <span>{localCurrencyTaxSumMeaning}</span>
                ) : prSourcePlatform !== 'SRM' ? (
                  <NumberField
                    min={0}
                    disabled
                    numberGrouping
                    {...precisionParams(localFinancialPrecision, prSourcePlatform !== 'SRM')}
                  />
                ) : (
                  <Currency
                    min={0}
                    disabled
                    numberGrouping
                    {...precisionParams(localFinancialPrecision, prSourcePlatform !== 'SRM')}
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.localCurrency`).d('本币币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('localCurrency', {
                initialValue: localCurrency,
              })(
                <Lov
                  code="SPRM.EXCHANGE_RATE.CURRENCY"
                  textValue={localCurrency}
                  disabled
                  queryParams={{ tenantId: organizationId }}
                  onChange={(value, record) => this.handleLocalCurrencyChange(value, record)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        {CuxFormDom}
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.applyExplain`).d('申请说明')}>
              {getFieldDecorator('remark', {
                initialValue: remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(
                !isMatch && !renderFlag ? (
                  <TextArea
                    rows={2}
                    style={{ overflow: 'hidden', height: '56px', width: '100%' }}
                    required={remarkRules?.required}
                  />
                ) : (
                  <span>{remark}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        {tenantNum === 'SRM-3SBIO' && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item')}>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem label={intl.get(`${commonPrompt}.applyExplain`).d('申请说明')}>
                {getFieldDecorator('attributeLongtext1', {
                  initialValue: headerInfo?.attributeLongtext1,
                })(
                  !isMatch && !renderFlag ? (
                    <TextArea
                      rows={2}
                      style={{ overflow: 'hidden', height: '56px', width: '100%' }}
                    />
                  ) : (
                    <span>{headerInfo?.attributeLongtext1}</span>
                  )
                )}
              </FormItem>
            </Col>
          </Row>
        )}
      </Form>
    );
  }
}
