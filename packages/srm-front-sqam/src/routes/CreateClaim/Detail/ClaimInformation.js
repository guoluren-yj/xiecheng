import React, { Component } from 'react';
import { Form, Row, Col, DatePicker, Select, Input, Tooltip, Icon } from 'hzero-ui';
// import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import MultipleLov from '@/routes/components/MultipleLov';
import { getCurrentOrganizationId } from 'utils/utils';
import { thousandBitSeparator } from '@/routes/utils.js';

import moment from 'moment';
// import { numberRender } from 'utils/renderer';

import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

const tenantId = getCurrentOrganizationId();

@connect(({ createClaim }) => ({
  createClaim,
}))
export default class ClaimInformation extends Component {
  // 获取Lov的code
  getLovCode = value => {
    let code = '';
    switch (value) {
      case 'CONTRACT':
        code = 'SQAM.QUERY_SPCM_PC_HEADER';
        break;
      case 'PURCHASE_ORDER':
        code = 'SQAM.QUERY_SODR_PO_HEADER';
        break;
      default:
        code = 'SQAM.PROBLEM_COMPLETED';
        break;
    }
    return code;
  };

  // 获取Lov的参数
  getQueryParams = value => {
    const {
      form: { getFieldValue },
      headerData,
    } = this.props;
    const {
      supplierTenantId,
      supplierCompanyId,
      formNum,
      companyId,
      ouId,
      currencyCode,
      supplierId,
    } = headerData;
    const params = {
      tenantId,
      supplierTenantId: getFieldValue('supplierTenantId') || supplierTenantId,
      supplierCompanyId: getFieldValue('supplierCompanyIdStash') || supplierCompanyId,
      companyId: getFieldValue('companyId') || companyId,
      supplierId: getFieldValue('supplierId') || supplierId,
    };
    return ['8D'].includes(value)
      ? {
          ...params,
          formNum: getFieldValue('formNum') || formNum,
        }
      : {
          ...params,
          ouId: getFieldValue('ouId') || ouId,
          currencyCode: getFieldValue('currencyCode') || currencyCode,
        };
  };

  getTextField = value => {
    let textField = '';
    switch (value) {
      case 'CONTRACT':
        textField = 'pcNum';
        break;
      case 'PURCHASE_ORDER':
        textField = 'displayPoNum';
        break;
      default:
        textField = 'problemNum';
        break;
    }
    return textField;
  };

  changeCurrencyCode = (val, lovRecord) => {
    const {
      form: { getFieldValue, setFieldsValue },
      updateCurrencyPrecision,
    } = this.props;
    if (updateCurrencyPrecision) {
      updateCurrencyPrecision(lovRecord.financialPrecision);
    }
    const dataSourceCode = getFieldValue('dataSourceCode');
    // 切换币种，若索赔来源=协议||采购订单，则清空「来源单号」字段
    if (['PURCHASE_ORDER', 'CONTRACT'].includes(dataSourceCode)) {
      setFieldsValue({ dataSourceNum: undefined });
    }
  };

  getLovOptions = value => {
    let optionObj = {};
    switch (value) {
      case 'CONTRACT':
        optionObj = { displayField: 'pcNum', valueField: 'pcNum' };
        break;
      case 'PURCHASE_ORDER':
        optionObj = { displayField: 'displayPoNum', valueField: 'displayPoNum' };
        break;
      default:
        optionObj = { displayField: 'problemNum', valueField: 'problemNum' };
        break;
    }
    return optionObj;
  };

  render() {
    const {
      form,
      headerData,
      createClaim,
      customizeForm,
      defaultAutoFlag,
      onClearOriginNum,
      onSetExpenseProcess,
      remoteProps,
      history,
    } = this.props;
    const { enumMap = {} } = createClaim;
    const { claimSource = [], payMentType = [] } = enumMap;
    const { getFieldDecorator, getFieldValue } = form;

    let dataSourceNumRender =
      getFieldValue('dataSourceCode') === 'INSPECTION' ? (
        <Tooltip title={headerData.dataSourceNum}>
          <span
            style={{
              display: 'inline-block',
              width: '80%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {headerData.dataSourceNum}
          </span>
        </Tooltip>
      ) : ['8D', 'CONTRACT', 'PURCHASE_ORDER'].includes(getFieldValue('dataSourceCode')) ||
        ['8D', 'CONTRACT', 'PURCHASE_ORDER'].includes(headerData.dataSourceCode) ? (
        <MultipleLov
          require={false}
          queryParams={this.getQueryParams(getFieldValue('dataSourceCode'))}
          code={this.getLovCode(getFieldValue('dataSourceCode'))}
          disabled={!getFieldValue('dataSourceCode')}
          textField={this.getTextField(getFieldValue('dataSourceCode'))}
          lovOptions={this.getLovOptions(getFieldValue('dataSourceCode'))}
        />
      ) : (
        <Input disabled={!getFieldValue('dataSourceCode')} />
      );

    return customizeForm(
      {
        code: 'SQAM.CREATE_CLAIM.DETAIL.CLAIM_INFO',
        form,
        dataSource: {
          ...headerData,
          feedbackDate: headerData.feedbackDate || undefined,
        },
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('feedbackDate', {
                initialValue: headerData.feedbackDate ? moment(headerData.feedbackDate) : null,
                rules: [
                  {
                    required:
                      // (headerData.autoConfirmFlag || getFieldValue('autoConfirmFlag')) === 1,
                      headerData.autoConfirmFlag ||
                      getFieldValue('autoConfirmFlag') ||
                      defaultAutoFlag, // 处理dev环境索赔类型带出问题
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  placeholder=""
                  showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                  format="YYYY-MM-DD HH:mm:ss"
                  disabledDate={currentDate => moment().isAfter(currentDate, 'day')}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.claimOrigin`).d('索赔来源')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('dataSourceCode', {
                initialValue: headerData.dataSourceCode,
              })(
                headerData.dataSourceCode !== 'INSPECTION' ? (
                  <Select allowClear onChange={onClearOriginNum}>
                    {claimSource.map(item => (
                      <Select.Option key={item.value}>{item.meaning}</Select.Option>
                    ))}
                  </Select>
                ) : (
                  <span>{headerData.dataSourceCodeMeaning}</span>
                )
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.originNum`).d('来源单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('dataSourceNum', {
                initialValue: headerData.dataSourceNum,
              })(remoteProps
                ? remoteProps.render('SQAM_CREATE_CLAIM_DETAIL_CUX_DATASOURCENUM', dataSourceNumRender, {
                    getFieldValue,
                    headerData,
                    history,
                  })
                : dataSourceNumRender)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.claimSum`).d('索赔总额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalAmount', {
                initialValue: headerData.totalAmount,
              })(
                <span>
                  {headerData.totalAmount
                    ? thousandBitSeparator(headerData.totalAmount, headerData.amountPrecision)
                    : null}
                </span>
              )}
            </Form.Item>
            {/* <DisplayFormItem
              label={intl.get(`sqam.common.model.claimSum`).d('索赔总额')}
              value={headerData.totalAmount ? numberRender(headerData.totalAmount, 2) : null}
            /> */}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.MoneyType`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sqam.common.model.MoneyType`).d('币种'),
                    }),
                  },
                ],
                initialValue: headerData.currencyCode,
              })(
                <Lov
                  code="SPRM.EXCHANGE_RATE.CURRENCY"
                  lovOptions={{ displayField: 'currencyName' }}
                  textValue={headerData.currencyName}
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  onChange={(value, lovRecord) => this.changeCurrencyCode(value, lovRecord)}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={
                <span>
                  {intl.get(`sqam.common.model.expenseProcessType`).d('费用处理方式')}
                  <Tooltip
                    title={intl
                      .get('sqam.common.model.expenseProcessTypeNotice')
                      .d('供应商对索赔单进行确认时，可修改费用处理方式')}
                  >
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('expenseProcessType', {
                initialValue: headerData.expenseProcessType,
              })(
                <Select
                  allowClear
                  value={headerData.expenseProcessType}
                  onChange={onSetExpenseProcess}
                >
                  {payMentType.map(item => (
                    <Select.Option key={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
