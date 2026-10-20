/* eslint-disable eqeqeq */
import React from 'react';
import { Form, Modal, Popconfirm, Icon, Select, Input, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';
import { getParams, getFilter } from '@/utils';
import Lov from 'components/Lov';
import styles from './index.less';
import FormInputWrapper from '../../components/FormInputWrapper';

const FormItem = Form.Item;
const { Option } = Select;

@connect(({ configCustomizeCuz }) => {
  const { codes, cacheWidget = {} } = configCustomizeCuz;
  return {
    codes,
    cacheWidget,
  };
})
@Form.create({ fieldNameProp: null })
export default class ConditionModal extends React.Component {
  constructor(props) {
    super(props);
    const { fieldConditions: { lines = [], conExpression = '1' } = {}, fieldList = {} } = props;
    const fieldMapObj = {};
    Object.keys(fieldList).forEach(item => {
      const subList = fieldList[item];
      subList.forEach(field => {
        fieldMapObj[`${field.modelCode || ''}|${field.modelFieldCode || ''}`] = field;
      });
    });
    const newLines = lines.map(line => {
      const { sourceType: _sourceType = '', sourceModelCode, sourceFieldCode, sourceUnitId } = line;
      const fieldObj = (fieldList[sourceUnitId] || []).find(
        i => i.modelCode === sourceModelCode && i.modelFieldCode == sourceFieldCode
      );
      if (fieldObj) {
        // eslint-disable-next-line no-param-reassign
        line.sourceFieldWidget = line.sourceFieldWidget || fieldObj.widgetType;
      }
      const splitData = _sourceType.split('-');
      const [sourceType, ctxValue] = splitData;
      return { ...line, sourceType, ctxValue };
    });
    if (lines.length === 0) newLines.push({ conCode: 1 });
    const querySelectOptions = {
      __specList: 'HPFM.CUST.SPEC_VALUE.LIST',
    };
    let selectOptionsLoading = false;
    const conditionNo = [1, 1];
    lines.forEach(i => {
      conditionNo[i.conCode] = 1;
      querySelectOptions[i.conCode] = i.sourceFieldValueCode;
    });
    selectOptionsLoading = true;
    queryMapIdpValue(querySelectOptions)
      .then((res = {}) => {
        this.setState({
          selectOptions: (res && !res.failed && res) || {},
        });
      })
      .finally(() => {
        this.setState({
          selectOptionsLoading: false,
        });
      });
    this.state = {
      fieldMapObj, // 关联字段配置信息集合
      conditionList: newLines,
      conditionNo,
      selectOptions: {},
      selectOptionsLoading,
      conExpression,
    };
  }

  @Bind()
  onOk() {
    const { record, form, onClose, targetProp, updateConditionHeaders } = this.props;
    const { conditionList } = this.state;
    form.validateFields((err, values) => {
      if (err) return;
      const newConditionList = conditionList
        .map((_, index) => {
          if (!_) return false;
          let sourceType = values[`sourceType#${index}`];
          if (values[`ctxValue#${index}`]) {
            sourceType += `-${values[`ctxValue#${index}`]}`;
          }
          return {
            ..._,
            sourceType,
            sourceUnitId: values[`sourceUnitId#${index}`],
            sourceUnitCode: values[`sourceUnitCode#${index}`],
            sourceModelCode: values[`sourceModelCode#${index}`],
            sourceModelFieldCode: values[`sourceModelFieldCode#${index}`],
            // sourceFieldId: values[`sourceFieldId#${index}`],
            sourceFieldCode: values[`sourceFieldCode#${index}`],
            // sourceModelId: values[`sourceModelId#${index}`],
            sourceFieldValueCode: values[`sourceFieldValueCode#${index}`],
            conExpression: values[`conExpression#${index}`],
            targetType: values[`targetType#${index}`],
            targetValue: values[`targetValue#${index}`],
            targetValueMeaning: values[`targetValueMeaning#${index}`],
            targetModelCode: values[`targetModelCode#${index}`],
            targetModelFieldCode: values[`targetModelFieldCode#${index}`],
            // targetFieldId: values[`targetFieldId#${index}`],
            targetFieldCode: values[`targetFieldCode#${index}`],
            // targetModelId: values[`targetModelId#${index}`],
          };
        })
        .filter(Boolean);
      const { conExpression } = values;
      const { conditionHeaders = [] } = record;
      let oldFx;
      for (const i of conditionHeaders) {
        if (i.conType === targetProp) {
          oldFx = i;
        }
      }
      const newHeaderProp = {
        ...oldFx,
        lines: newConditionList,
        conType: targetProp,
        conExpression,
      };
      updateConditionHeaders(targetProp, newHeaderProp);
      onClose();
    });
  }

  onDelete(index) {
    const { conditionList } = this.state;
    const delNo = conditionList[index].conCode;
    this.delNo(delNo);
    this.setState({
      conditionList: conditionList.map((_, i) => (i === index ? undefined : _)),
    });
  }

  registerNo() {
    const { conditionNo } = this.state;
    for (let i = 1; i < conditionNo.length; i++) {
      if (conditionNo[i] === undefined) {
        conditionNo[i] = 1;
        return i;
      }
    }
    conditionNo[conditionNo.length] = 1;
    this.setState({
      conditionNo,
    });
    return conditionNo.length - 1;
  }

  delNo(no) {
    const { conditionNo } = this.state;
    conditionNo[no] = undefined;
    this.setState({
      conditionNo,
    });
  }

  @Bind()
  addMap() {
    const { conditionList } = this.state;
    const { form } = this.props;
    const conExpression = form.getFieldValue('conExpression') || '';
    const newNo = this.registerNo();
    conditionList.push({ conCode: newNo });
    form.setFieldsValue({
      conExpression: conExpression.concat(`${conExpression.length === 0 ? '' : ' AND '}${newNo}`),
    });
    this.setState({ conditionList });
  }

  getRightField(index, i) {
    const { form, ctxParams, id: currentUnitId, fieldList } = this.props;
    const relationIsNull = ["ISNULL", "NOTNULL", "ACTIVE", "UNACTIVE", "", undefined].includes(form.getFieldValue(`conExpression#${index}`));
    if (relationIsNull) return [];
    const targetType = form.getFieldValue(`targetType#${index}`) || 'fixed';
    const { selectOptions, selectOptionsLoading, fieldMapObj } = this.state;
    const sourceModelCode = form.getFieldValue(`sourceModelCode#${index}`);
    const modelFieldCode = form.getFieldValue(`sourceFieldCode#${index}`);
    const { sourceFieldValueCode, widgetType } =
      fieldMapObj[`${sourceModelCode || ''}#${modelFieldCode}`] || {};
    let type = form.getFieldValue(`sourceFieldWidget#${index}`) || widgetType;
    const sourceUnitId = form.getFieldValue(`sourceUnitId#${index}`);
    const sourceFieldCode = form.getFieldValue(`sourceFieldCode#${index}`);
    const currentLeftField =
      (fieldList[sourceUnitId] || []).find(
        field => field.modelCode === sourceModelCode && field.modelFieldCode === sourceFieldCode
      ) || {};
    const ctxValue = form.getFieldValue(`ctxValue#${index}`);
    let bindFieldConfig;
    const {
      bindField,
      bindFieldWidget,
      bindFieldSourceCode,
      bindParamList,
      lovInfo,
    } = currentLeftField;
    if (bindField && bindFieldWidget === 'LOV' && bindFieldSourceCode) {
      const valueField = bindField.split('.')[1];
      type = 'LOV';
      bindFieldConfig = {
        code: bindFieldSourceCode,
        paramList: bindParamList,
      };
      if (valueField) bindFieldConfig.valueField = valueField;
    }
    const rightFields = [
      <FormItem style={{ maxWidth: '105px' }}>
        {form.getFieldDecorator(`targetType#${index}`, {
          initialValue: i.targetType || 'fixed',
          rules: [
            {
              required: true,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl.get('hpfm.individual.model.config.targetValueFrom').d('取值来源'),
              }),
            },
          ],
        })(
          <Select
            style={{ width: '100%' }}
            placeholder={intl.get('hpfm.individual.model.config.targetValueFrom').d('取值来源')}
            dropdownClassName={styles['condition-dropdown']}
            onChange={() => this.clearFields(2, index)}
          >
            <Option value="formNow">
              {intl.get('hpfm.individual.model.config.formNow').d('本单元字段')}
            </Option>
            <Option value="fixed">
              {intl.get('hpfm.individual.model.config.fixed').d('手工录入')}
            </Option>
            {type === 'DATE_PICKER' && (
              <Option value="time">
                {intl.get('hpfm.individual.model.config.time').d('时间常量')}
              </Option>
            )}
          </Select>
        )}
      </FormItem>,
    ];

    const compProps = {
      key: index,
      placeholder: intl.get('hpfm.individual.model.config.fieldValue').d('字段值'),
    };
    let tooltipProps;
    if (targetType === 'fixed') {
      let Widget = Input;
      if (['currentRoleId', 'defaultCompany'].includes(ctxValue)) {
        Widget = Lov;
        compProps.textField = `targetValueMeaning#${index}`;
        compProps.textValue = i.targetValueMeaning;
        compProps.code =
          ctxValue === 'defaultCompany' ? 'HIAM.USER_MAINTAIN_COMPANY' : 'HIAM.TENANT.ROLE';
        compProps.queryParams = { tenantId: ctxParams.ctx.organizationId };
      } else if (type === 'LOV') {
        Widget = Lov;
        compProps.textField = `targetValueMeaning#${index}`;
        compProps.textValue = i.targetValueMeaning;
        if (bindFieldConfig) {
          compProps.code = bindFieldConfig.code;
          compProps.queryParams = getParams({ paramList: bindFieldConfig.paramList, ctxParams });
          compProps.lovOptions = { valueField: bindFieldConfig.valueField };
        } else {
          compProps.code =
            form.getFieldValue(`sourceFieldValueCode#${index}`) || sourceFieldValueCode;
          compProps.queryParams = getParams({
            paramList: form.getFieldValue(`paramList#${index}`),
            ctxParams,
          });
        }
        if (!compProps.code) {
          compProps.disabled = true;
          tooltipProps = {
            trigger: "focus",
            title: intl.get("hpfm.customize.common.noLovCode").d("该字段未配置值集编码"),
          };
        }
      } else if (type === 'SELECT' || type === 'RADIOGROUP') {
        Widget = Select;
        const valueField = (lovInfo && lovInfo.valueField) || 'value';
        const displayField = (lovInfo && lovInfo.displayField) || 'meaning';
        compProps.allowClear = true;
        compProps.style = { width: '100%' };
        compProps.onChange = v => {
          const obj = (selectOptions[i.conCode] || []).find(_i => _i.value === v) || {};
          form.setFieldsValue({ [`targetValueMeaning#${index}`]: obj.meaning });
        };
        compProps.children =
          form.getFieldValue(`selectOptionsLoading#${index}`) || selectOptionsLoading ? (
            <Option key="loading">
              <Icon type="loading" />
            </Option>
          ) : (
            (selectOptions[i.conCode] || []).map(n => (
              <Option value={n[valueField]}>{n[displayField]}</Option>
            ))
          );
      } else {
        compProps.style = { width: '100%' };
      }
      rightFields.push(
        <FormItem style={{ maxWidth: '151px' }}>
          {form.getFieldDecorator(`targetValue#${index}`, {
            initialValue: i.targetValue,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.individual.model.config.fieldValue').d('字段值'),
                }),
              },
            ],
          })(tooltipProps ? (
            <FormInputWrapper
              Wrapper={Tooltip}
              wrapperProps={tooltipProps}
              Child={Widget}
              childProps={compProps}
            />
          ) : <Widget {...compProps} />)}
          {form.getFieldDecorator(`targetValueMeaning#${index}`, {
            initialValue: i.targetValueMeaning,
          })}
          {form.getFieldDecorator(`selectOptionsLoading#${index}`, {
            initialValue: false,
          })}
        </FormItem>
      );
    } else if (targetType === 'time') {
      rightFields.push(
        <FormItem style={{ maxWidth: '151px' }}>
          {form.getFieldDecorator(`targetValue#${index}`, {
            initialValue: i.targetValue,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.individual.model.config.fieldValue').d('字段值'),
                }),
              },
            ],
          })(
            <Select allowClear style={{ width: '100%' }} key={index}>
              {(selectOptions.__specList || []).map(n => (
                <Option value={n.value}>{n.meaning}</Option>
              ))}
            </Select>
          )}
        </FormItem>
      );
    } else if (targetType === 'formNow') {
      rightFields.push(
        <FormItem
          style={{
            maxWidth: '151px',
          }}
        >
          {form.getFieldDecorator(`targetField${index}`, {
            initialValue:
              i.targetModelCode && i.targetFieldCode
                ? `${i.targetModelCode}#${i.targetFieldCode}`
                : undefined,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.individual.model.config.fieldSelect').d('字段选择'),
                }),
              },
            ],
          })(
            <Select
              style={{ width: '100%' }}
              placeholder={intl.get('hpfm.individual.model.config.fieldSelect').d('字段选择')}
              onChange={id => this.setFieldTwoInfo(id, index)}
              optionLabelProp="title"
              dropdownClassName={styles['condition-dropdown']}
            >
              {(fieldList[currentUnitId] || []).map(f2 => (
                <Option value={`${f2.modelCode}#${f2.modelFieldCode}`} title={f2.unitFieldName}>
                  <div className="option-title">{f2.unitFieldName}</div>
                  <div className="option-value">{f2.unitFieldCode}</div>
                </Option>
              ))}
            </Select>
          )}
          {form.getFieldDecorator(`targetModelId#${index}`, {
            initialValue: i.targetModelId,
          })}
          {form.getFieldDecorator(`targetModelCode#${index}`, {
            initialValue: i.targetModelCode,
          })}
          {form.getFieldDecorator(`targetFieldId#${index}`, {
            initialValue: i.targetFieldId,
          })}
          {form.getFieldDecorator(`targetFieldCode#${index}`, {
            initialValue: i.targetFieldCode,
          })}
          {form.getFieldDecorator(`targetModelFieldCode#${index}`, {
            initialValue: i.targetModelFieldCode,
          })}
          {form.getFieldDecorator(`targetUnitId#${index}`, {
            initialValue: currentUnitId,
          })}
        </FormItem>
      );
    }
    return rightFields;
  }

  setFieldOneInfo(id, index, config) {
    const { fieldList, form } = this.props;
    const { selectOptions } = this.state;
    const modelCode = id ? id.split('#')[0] : undefined;
    const modelFieldCode = id ? id.split('#')[1] : undefined;
    const fieldObj =
      modelCode && modelFieldCode
        ? (fieldList[form.getFieldValue(`sourceUnitId#${index}`)] || []).find(
          i => i.modelFieldCode == modelFieldCode && i.modelCode === modelCode
        )
        : undefined;
    if (fieldObj) {
      if (['SELECT', 'RADIOGROUP'].includes(fieldObj.widgetType)) {
          (
            fieldObj.sourceFieldValueCode
            ? queryUnifyIdpValue(fieldObj.sourceFieldValueCode)
            : Promise.reject()
          ).then((res = {}) => {
            selectOptions[config.conCode] = (res && !res.failed && res) || [];
            this.setState({
              selectOptions,
            });
          })
          .finally(() => {
            form.setFieldsValue({
              [`selectOptionsLoading#${index}`]: false,
            });
          });
      }
      form.setFieldsValue({
        [`paramList#${index}`]: fieldObj.paramList || [],
        [`selectOptionsLoading#${index}`]: true,
        [`sourceFieldWidget#${index}`]: fieldObj.widgetType,
        [`sourceFieldCode#${index}`]: fieldObj.unitFieldCode,
        [`sourceFieldValueCode#${index}`]: fieldObj.sourceFieldValueCode,
        [`sourceModelId#${index}`]: fieldObj.modelId,
        [`sourceModelCode#${index}`]: fieldObj.modelCode,
        [`sourceModelFieldCode#${index}`]: fieldObj.unitFieldCode,
        [`targetValue#${index}`]: undefined,
        [`targetValueMeaning#${index}`]: undefined,
      });
    }
  }

  setFieldTwoInfo(id, index) {
    const { form, id: unitId, fieldList } = this.props;
    const modelCode = id ? id.split('#')[0] : undefined;
    const modelFieldCode = id ? id.split('#')[1] : undefined;
    const fieldObj =
      modelCode && modelFieldCode
        ? (fieldList[unitId] || []).find(
          i => i.modelFieldCode == modelFieldCode && i.modelCode === modelCode
        )
        : undefined;
    if (fieldObj) {
      form.setFieldsValue({
        [`targetModelId#${index}`]: fieldObj.modelId,
        [`targetFieldCode#${index}`]: fieldObj.unitFieldCode,
        [`targetModelCode#${index}`]: fieldObj.modelCode,
        [`targetModelFieldCode#${index}`]: fieldObj.unitFieldCode,
      });
    }
  }

  @Bind()
  handleClearRightValue(index) {
    this.props.form.setFieldsValue({
      [`targetValue#${index}`]: undefined,
      [`targetValueMeaning#${index}`]: undefined,
    });
  }

  @Bind()
  clearFields(level, index) {
    const { form } = this.props;
    switch (level) {
      case 1:
        form.setFieldsValue({
          [`conExpression#${index}`]: undefined,
          [`sourceField#${index}`]: undefined,
          [`sourceFieldWidget#${index}`]: undefined,
          [`sourceFieldId#${index}`]: undefined,
          [`sourceFieldCode#${index}`]: undefined,
          [`sourceFieldValueCode#${index}`]: undefined,
          [`sourceModelId#${index}`]: undefined,
          [`targetModelId#${index}`]: undefined,
          [`targetFieldCode#${index}`]: undefined,
          [`targetValue#${index}`]: undefined,
          [`targetValueMeaning#${index}`]: undefined,
          [`targetFieldId#${index}`]: undefined,
          [`selectOptionsLoading#${index}`]: false,
          [`paramList#${index}`]: [],
          [`targetType#${index}`]: 'fixed',
          [`sourceModelCode#${index}`]: undefined,
          [`sourceModelFieldCode#${index}`]: undefined,
          [`targetModelFieldCode#${index}`]: undefined,
          [`targetModelCode#${index}`]: undefined,
        });
        break;
      case 2:
        form.setFieldsValue({
          [`targetField#${index}`]: undefined,
          [`targetValue#${index}`]: undefined,
          [`targetValueMeaning#${index}`]: undefined,
          [`targetFieldId#${index}`]: undefined,
          [`selectOptionsLoading#${index}`]: false,
        });
        break;
      default:
    }
  }

  @Bind()
  getLeftField(index, i) {
    const { form, targetProp, unitType, id: currentUnitId, fieldList, unitList } = this.props;
    const isFormType = unitType === 'FORM' || unitType === 'QUERYFORM';
    const leftFields = [];
    const sourceType = form.getFieldValue(`sourceType#${index}`);
    if (sourceType === 'CTX') {
      leftFields.push(
        <FormItem style={{ width: '308px' }}>
          {form.getFieldDecorator(`ctxValue#${index}`, {
            initialValue: i.ctxValue,
            rules: [
              {
                required: form.getFieldValue(`sourceType#${index}`) === 'CTX',
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.customize.common.ctxParamValue').d('上下文参数值'),
                }),
              },
            ],
          })(
            <Select
              style={{ width: '100%' }}
              onChange={() => this.handleClearRightValue(index)}
              placeholder={intl.get('hpfm.customize.common.ctxParamValue').d('上下文参数值')}
            >
              <Option value="ownTenantNum">
                {intl.get('hpfm.customize.common.accountTenant').d('所属租户')}
              </Option>
              <Option value="currentRoleId">
                {intl.get('hpfm.customize.common.role').d('角色')}
              </Option>
              <Option value="loginName">
                {intl.get('hpfm.customize.common.subAccount').d('子账户')}
              </Option>
              <Option value="defaultCompany">
                {intl.get('hpfm.customize.common.defaultCompany').d('当前子账户默认公司')}
              </Option>
            </Select>
          )}
        </FormItem>
      );
    } else if (sourceType === 'CUZ_UNIT') {
      leftFields.push(
        <FormItem style={{ maxWidth: '151px' }}>
          {form.getFieldDecorator(`sourceUnitId#${index}`, {
            initialValue: i.sourceUnitId,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.individual.model.config.unitWhich').d('所属单元'),
                }),
              },
            ],
          })(
            <Select
              style={{ width: '100%' }}
              placeholder={intl.get('hpfm.individual.model.config.unitWhich').d('所属单元')}
              optionLabelProp="title"
              dropdownClassName={styles['condition-dropdown']}
              onChange={v => {
                const obj = unitList.find(k => k.unitId == v) || {};
                form.setFieldsValue({ [`sourceUnitCode#${index}`]: obj.unitCode });
                form.setFieldsValue({ [`sourceUnitType#${index}`]: obj.unitType });
                this.clearFields(1, index);
              }}
            >
              {unitList.map(unit => (
                <Option
                  value={unit.unitId}
                  title={unit.unitName}
                  disabled={
                    unit.unitType === 'GRID' &&
                    (isFormType ||
                      (unitType === 'GRID' &&
                        (targetProp === 'visible' || currentUnitId !== unit.unitId)))
                  }
                >
                  <div className="option-title">{unit.unitName}</div>
                  <div className="option-value">{unit.unitCode}</div>
                </Option>
              ))}
            </Select>
          )}
          {form.getFieldDecorator(`sourceUnitCode#${index}`, {
            initialValue: i.sourceUnitCode,
          })}
          {form.getFieldDecorator(`sourceUnitType#${index}`, {
            initialValue: (unitList.find(u=>u.unitId === i.sourceUnitId) || {}).unitType,
          })}
        </FormItem>,
        <FormItem style={{ maxWidth: '151px' }}>
          {form.getFieldDecorator(`sourceField#${index}`, {
            // 仅靠fieldCode不能作为字段的唯一标识，需用modelCode和fieldCode拼接
            initialValue:
              i.sourceModelCode && i.sourceFieldCode
                ? `${i.sourceModelCode}#${i.sourceFieldCode}`
                : undefined,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.individual.model.config.fieldSelect').d('字段选择'),
                }),
              },
            ],
          })(
            <Select
              style={{ width: '100%' }}
              placeholder={intl.get('hpfm.individual.model.config.fieldSelect').d('字段选择')}
              onChange={id => this.setFieldOneInfo(id, index, i)}
              disabled={form.getFieldValue(`sourceUnitId#${index}`) === undefined}
              optionLabelProp="title"
              dropdownClassName={styles['condition-dropdown']}
            >
              {(fieldList[form.getFieldValue(`sourceUnitId#${index}`)] || []).map(f1 => (
                <Option value={`${f1.modelCode}#${f1.modelFieldCode}`} title={f1.unitFieldName}>
                  <div className="option-title">{f1.unitFieldName}</div>
                  <div className="option-value">{f1.unitFieldCode}</div>
                </Option>
              ))}
            </Select>
          )}
          {form.getFieldDecorator(`sourceModelId#${index}`, {
            initialValue: i.sourceModelId,
          })}
          {form.getFieldDecorator(`sourceModelCode#${index}`, {
            initialValue: i.sourceModelCode,
          })}
          {form.getFieldDecorator(`sourceFieldWidget#${index}`, {
            initialValue: i.sourceFieldWidget,
          })}
          {form.getFieldDecorator(`sourceFieldId#${index}`, {
            initialValue: i.sourceFieldId,
          })}
          {form.getFieldDecorator(`sourceFieldCode#${index}`, {
            initialValue: i.sourceFieldCode,
          })}
          {form.getFieldDecorator(`sourceModelFieldCode#${index}`, {
            initialValue: i.sourceModelFieldCode,
          })}
          {form.getFieldDecorator(`sourceFieldValueCode#${index}`, {
            initialValue: i.sourceFieldValueCode,
          })}
          {form.getFieldDecorator(`paramList#${index}`, {
            initialValue: i.paramList || [],
          })}
        </FormItem>
      );
    }
    return leftFields;
  }

  render() {
    const { conditionList, conditionNo, conExpression } = this.state;
    const {
      visible,
      onClose,
      form,
      codes: { relationShip = [] },
      unitType,
    } = this.props;
    return (
      <Modal
        destroyOnClose
        zIndex={999}
        width={900}
        visible={visible}
        onCancel={onClose}
        onOk={this.onOk}
        bodyStyle={{ padding: '12px' }}
        wrapClassName={styles[`cond-modal-wrapper`]}
        title={intl.get('hpfm.individual.view.message.title.conditionConfig').d('条件配置')}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginLeft: '12px',
            marginRight: '16px',
          }}
        >
          <div className={styles.title}>
            {intl.get('hpfm.individual.view.message.title.conditionList').d('判断条件')}
          </div>
          <div
            onClick={this.addMap}
            style={{
              display: 'flex',
              lineHeight: '18px',
              height: '28px',
              alignItems: 'center',
              marginLeft: '8px',
              cursor: 'pointer',
            }}
          >
            <Icon
              type="plus-circle-o"
              style={{ fontSize: '18px', color: '#34a6f8', marginRight: '8px' }}
            />
            {intl.get('hzero.common.button.addCondition').d('添加条件')}
          </div>
        </div>
        <div style={{ minHeight: '150px' }}>
          {conditionList.map((i, index) => {
            if (!i) return null;
            return (
              <div className={styles['condition-row']}>
                <span className="index">{i.conCode}</span>
                <FormItem style={{ width: '105px' }}>
                  {form.getFieldDecorator(`sourceType#${index}`, {
                    initialValue: i.sourceType || 'CUZ_UNIT',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.individual.common.sourceType').d('左值类型'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      style={{ width: '100%' }}
                      placeholder={intl.get('hpfm.individual.common.sourceType').d('左值类型')}
                      onChange={() => this.clearFields(1, index)}
                    >
                      <Option value="CUZ_UNIT">
                        {intl.get('hpfm.customize.common.unitField').d('单元字段')}
                      </Option>
                      <Option value="CTX">
                        {intl.get('hpfm.customize.common.context').d('上下文')}
                      </Option>
                    </Select>
                  )}
                </FormItem>
                {this.getLeftField(index, i)}
                <FormItem style={{ width: '105px' }}>
                  {form.getFieldDecorator(`conExpression#${index}`, {
                    initialValue: i.conExpression || '=',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.individual.model.config.relation').d('关系'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      style={{ width: '100%' }}
                      placeholder={intl.get('hpfm.individual.model.config.relation').d('关系')}
                      dropdownClassName={styles['condition-dropdown']}
                    >
                      {relationShip
                        .filter(k =>
                          getFilter(
                            form.getFieldValue(`sourceFieldWidget#${index}`),
                            form.getFieldValue(`sourceUnitType#${index}`)
                          ).includes(
                            k.value
                          )
                        )
                        .map(k => (
                          <Option value={k.value}>{k.meaning}</Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
                {this.getRightField(index, i)}
                <Popconfirm
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                  okText={intl.get('hzero.common.status.yes').d('是')}
                  cancelText={intl.get('hzero.common.status.no').d('否')}
                  onConfirm={() => this.onDelete(index)}
                >
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a
                    className="delete"
                    role="button"
                    style={{ color: '#999', position: 'absolute', right: '28px' }}
                  >
                    <Icon type="delete" />
                  </a>
                </Popconfirm>
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: 'block',
            marginLeft: '12px',
            marginRight: '12px',
          }}
        >
          <div className={styles.title}>
            {intl.get('hpfm.individual.view.message.title.calculatLogic').d('表达式')}
          </div>
          <div className={styles.tips}>
            {intl
              .get('hpfm.individual.view.message.title.tips3')
              .d('使用条件编号及AND、OR编写运算规则。示例(1 OR 2) AND 3')}
          </div>
        </div>
        <div style={{ minHeight: '100px', marginLeft: '12px' }}>
          <FormItem wrapperCol={{ span: 24 }} style={{ marginBottom: 0, marginRight: '16px' }}>
            {form.getFieldDecorator(`conExpression`, {
              initialValue: conExpression,
              rules: [
                {
                  validator: (_, value, cb) => {
                    const array = (value !== undefined && value.match(/[^0-9()\s]+/g)) || [];
                    const equalOrAnd =
                      array.length > 0
                        ? array.reduce((prev, next) => prev && /OR|AND/.test(next), true)
                        : false;
                    if (array.length > 0 && !equalOrAnd) {
                      cb(
                        intl
                          .get('hpfm.individual.model.config.conditionValidator.tips1')
                          .d('不允许输入字母及 ( ) OR AND 以外的字符')
                      );
                      return;
                    }
                    cb();
                  },
                },
                {
                  validator: (_, value, cb) => {
                    if (conditionList.filter(k => !!k).length === 0) {
                      cb();
                      return;
                    }
                    const array = (value !== undefined && value.match(/\s?\d+\s?/g)) || [];
                    for (let i = 0; i < array.length; i++) {
                      const no = array[i].match(/(\d+)/)[0];
                      if (conditionNo[no] !== 1) {
                        cb(
                          intl
                            .get('hpfm.individual.model.config.conditionValidator', {
                              no,
                            })
                            .d(`条件${no}不存在`)
                        );
                        return;
                      }
                    }
                    cb();
                  },
                },
              ],
            })(
              <Input
                inputChinese={false}
                placeHolder={intl
                  .get('hpfm.individual.view.message.title.calculatLogic')
                  .d('表达式')}
              />
            )}
          </FormItem>
        </div>
      </Modal>
    );
  }
}
