/**
 * Search - 我发出的订单 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Select } from 'hzero-ui';
import { isNaN } from 'lodash';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
// Option组件初始化
const { Option } = Select;

// // 设置sinv国际化前缀 - view.title
// const viewTitlePrompt = 'spfm.supplierKpiIndicator.view.title';
// // 设置sinv国际化前缀 - view.button
// const viewButtonPrompt = 'spfm.supplierKpiIndicator.view.button';
// 设置sinv国际化前缀 - common - message

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  render() {
    const {
      form: { getFieldDecorator = (e) => e, getFieldValue, setFieldsValue },
      dataSource: {
        indicatorId,
        indicatorCode,
        indicatorName,
        scoreType,
        scoreFrom,
        scoreTo,
        indicatorType,
        defaultScore,
        indicatorScore,
        parentIndicatorId,
        parentIndicatorName,
        isNoEnableChildren = true,
        _token,
      },
      status,
      indicatorTypeCode = [],
      scoreTypeCode = [],
    } = this.props;
    const editable = indicatorId && !isNaN(indicatorId) && status === 'edit';
    return (
      <Form>
        <FormItem
          label={intl
            .get('spfm.supplierKpiIndicator.model.sendOrder.parentIndicator')
            .d('父级指标')}
          {...formLayout}
        >
          {getFieldDecorator('parentIndicatorId', {
            initialValue: parentIndicatorId && !isNaN(parentIndicatorId) ? parentIndicatorId : -1,
          })(
            <Lov
              code="SSLM.KPI_EDIT_INDICATOR"
              disabled={status !== 'edit'}
              textValue={
                parentIndicatorName ||
                intl.get('spfm.supplierKpiIndicator.model.suKpiIn.parentIndicatorRoot').d('根节点')
              }
              queryParams={{ editIndicatorId: indicatorId }}
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorCode').d('指标编码')}
          {...formLayout}
        >
          {getFieldDecorator('indicatorCode', {
            initialValue: indicatorCode,
            rules: [
              {
                required: true,
                message: intl.get(`hzero.common.validation.notNull`, {
                  name: intl
                    .get('spfm.supplierKpiIndicator.model.supplier.indicatorCode')
                    .d('指标编码'),
                }),
              },
              {
                max: 29,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input inputChinese={false} disabled={editable} />)}
        </FormItem>
        <FormItem
          label={intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorName').d('指标名称')}
          {...formLayout}
        >
          {getFieldDecorator('indicatorName', {
            initialValue: indicatorName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get('spfm.supplierKpiIndicator.model.supplier.indicatorName')
                    .d('指标名称'),
                }),
              },
              {
                max: 240,
                message: intl.get('hzero.common.validation.max', {
                  max: 240,
                }),
              },
            ],
          })(
            <TLEditor
              label={intl
                .get('spfm.supplierKpiIndicator.model.supplier.indicatorName')
                .d('指标名称')}
              field="indicatorName"
              token={_token}
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('spfm.supplierKpiIndicator.model.supplier.scoreType').d('评分方式')}
          {...formLayout}
        >
          {getFieldDecorator('scoreType', {
            initialValue: scoreType,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get('spfm.supplierKpiIndicator.model.supplier.scoreType')
                    .d('评分方式'),
                }),
              },
            ],
          })(
            <Select
              allowClear
              disabled={!isNoEnableChildren}
              onChange={() => {
                setFieldsValue({
                  indicatorType: null,
                  indicatorScore: null,
                });
              }}
            >
              {scoreTypeCode.map((n) => (
                <Option key={n.value} value={n.value}>
                  {n.meaning}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          label={intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorType').d('指标类型')}
          {...formLayout}
        >
          {getFieldDecorator('indicatorType', {
            initialValue: indicatorType,
            rules: [
              {
                required: getFieldValue('scoreType') !== 'SYSTEM',
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get('spfm.supplierKpiIndicator.model.supplier.indicatorType')
                    .d('指标类型'),
                }),
              },
            ],
          })(
            <Select
              disabled={!getFieldValue('scoreType')}
              allowClear
              onChange={(val) => {
                if (val === 'TICK' && isNoEnableChildren) {
                  setFieldsValue({
                    scoreFrom: '',
                    scoreTo: '',
                    defaultScore: '',
                  });
                } else if (val === 'VETO' && isNoEnableChildren) {
                  setFieldsValue({
                    scoreFrom: '',
                    scoreTo: '',
                    defaultScore: '',
                    indicatorScore: '',
                  });
                } else {
                  setFieldsValue({
                    indicatorScore: '',
                  });
                }
              }}
            >
              {(getFieldValue('scoreType') !== 'MANUAL'
                ? indicatorTypeCode.filter((e) => e.value === 'VETO')
                : indicatorTypeCode
              ).map((n) => (
                <Option key={n.value} value={n.value}>
                  {n.meaning}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          label={intl.get('spfm.supplierKpiIndicator.model.supplier.scoreFrom').d('分值从')}
          {...formLayout}
        >
          {getFieldDecorator('scoreFrom', {
            initialValue: scoreFrom,
            rules: [
              {
                required:
                  getFieldValue('scoreType') !== 'SYSTEM'
                    ? getFieldValue('indicatorType') !== 'TICK' &&
                      getFieldValue('indicatorType') !== 'VETO'
                    : true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreFrom').d('分值从'),
                }),
              },
            ],
          })(
            <InputNumber
              style={{ width: '100%' }}
              disabled={
                !isNoEnableChildren ||
                (getFieldValue('scoreType') !== 'SYSTEM'
                  ? getFieldValue('indicatorType') === 'TICK' ||
                    getFieldValue('indicatorType') === 'VETO'
                  : false)
              }
              precision={2}
              step={0.01}
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('spfm.supplierKpiIndicator.model.supplier.scoreTo').d('分值至')}
          {...formLayout}
        >
          {getFieldDecorator('scoreTo', {
            initialValue: scoreTo,
            rules: [
              {
                required:
                  getFieldValue('scoreType') !== 'SYSTEM'
                    ? getFieldValue('indicatorType') !== 'TICK' &&
                      getFieldValue('indicatorType') !== 'VETO'
                    : true,
                message: intl.get(`hzero.common.validation.notNull`, {
                  name: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreTo').d('分值至'),
                }),
              },
            ],
          })(
            <InputNumber
              style={{ width: '100%' }}
              disabled={
                !isNoEnableChildren || getFieldValue('scoreType') !== 'SYSTEM'
                  ? getFieldValue('indicatorType') === 'TICK' ||
                    getFieldValue('indicatorType') === 'VETO'
                  : false
              }
              precision={2}
              step={0.01}
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('spfm.supplierKpiIndicator.model.supplier.defaultScore').d('缺省分值')}
          {...formLayout}
        >
          {getFieldDecorator('defaultScore', {
            initialValue: defaultScore || null,
          })(
            <InputNumber
              style={{ width: '100%' }}
              disabled={
                getFieldValue('indicatorType') === 'TICK' ||
                getFieldValue('indicatorType') === 'VETO'
              }
              precision={2}
              step={0.01}
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('spfm.supplierKpiIndicator.model.supplier.indiScore').d('指标分值')}
          {...formLayout}
        >
          {getFieldDecorator('indicatorScore', {
            initialValue: indicatorScore || null,
            rules: [
              {
                required:
                  getFieldValue('scoreType') === 'MANUAL' &&
                  getFieldValue('indicatorType') !== 'SCORE' &&
                  getFieldValue('indicatorType') !== 'VETO',
                message: intl.get(`hzero.common.validation.notNull`, {
                  name: intl
                    .get('spfm.supplierKpiIndicator.model.supplier.indiScore')
                    .d('指标分值'),
                }),
              },
            ],
          })(
            <InputNumber
              style={{ width: '100%' }}
              disabled={
                getFieldValue('indicatorType') === 'SCORE' ||
                getFieldValue('indicatorType') === 'VETO' ||
                getFieldValue('scoreType') !== 'MANUAL'
              }
              precision={2}
              step={0.01}
            />
          )}
        </FormItem>
      </Form>
    );
  }
}
