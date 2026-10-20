/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Form, Modal, Popconfirm, Icon, Select, Input } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import TLEditor from 'components/TLEditor';
import { getEditTableData } from 'utils/utils';
import { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';
import { getParams } from '@/utils';
import Lov from 'components/Lov';
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;

function getFilter(type) {
  switch (type) {
    case 'CURRENCY':
    case 'INPUT_NUMBER':
      return ['>', '<', '>=', '<=', '=', '!='];
    case 'DATE_PICKER':
      return ['BEFORE', 'AFTER', '~BEFORE', '~AFTER', 'SAME', 'NOTSAME'];
    default:
      return ['LIKE', 'UNLIKE', '~LIKE', '~UNLIKE', '=', '!=', 'ISNULL', 'NOTNULL'];
  }
}

export default class ConditionModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initState();
  }

  // componentDidUpdate(prev) {
  //   if (this.props.visible && !prev.visible) {
  //     // eslint-disable-next-line react/no-did-update-set-state
  //     this.setState(this.initState());
  //   }
  // }

  initState() {
    const { selfValidator, fieldList = {} } = this.props;
    const fieldMapObj = {};
    Object.keys(fieldList).forEach(item => {
      const subList = fieldList[item];
      subList.forEach(field => {
        fieldMapObj[`${field.modelCode || ''}|${field.modelFieldCode || ''}`] = field;
      });
    });
    let { conditionList, validatorList } = this.props;
    if (selfValidator) {
      conditionList = selfValidator.lines || [];
      validatorList = selfValidator.valids || [];
    }
    const newLines = conditionList.map(line => {
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
    if (conditionList.length === 0) newLines.push({ conCode: 1 });
    const querySelectOptions = {
      __specList: 'HPFM.CUST.SPEC_VALUE.LIST',
    };
    const conditionNo = [1, 1];
    conditionList.forEach(i => {
      conditionNo[i.conCode] = 1;
      querySelectOptions[i.conCode] = i.sourceFieldValueCode;
    });
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
    const validConCodeList = [];
    const validatorDelKey = [];
    validatorList.forEach(i => {
      validConCodeList[i.conCode] = 1;
    });
    validConCodeList.forEach((i, index) => {
      if (i !== 1) {
        validatorDelKey.push(index);
      }
    });
    return {
      fieldMapObj, // 关联字段配置信息集合
      conditionNo,
      conditionList: newLines,
      selectOptions: {},
      selectOptionsLoading: true,
      validatorDelKey,
      // 每一次初始化重新生成status
      validatorList:
        validatorList.length > 0
          ? validatorList.map(i => ({ ...i, _status: 'update' }))
          : [{ conCode: 0, _status: 'create' }],
    };
  }

  @Bind()
  onOk() {
    const { form, onClose, updateSelfValidator, headerProps } = this.props;
    const { conditionList, validatorList } = this.state;
    const validateData = getEditTableData(validatorList, ['_status']) || [];
    if (validatorList.length > 0 && validateData.length === 0) {
      return;
    }
    form.validateFields((err, values) => {
      if (err) return;
      const newConditionList = conditionList
        .map(lineData => {
          if (!lineData) return false;
          const { conCode } = lineData;
          let sourceType = values[`sourceType#${conCode}`];
          if (values[`ctxValue#${conCode}`]) {
            sourceType += `-${values[`ctxValue#${conCode}`]}`;
          }
          return {
            ...lineData,
            sourceType,
            sourceUnitId: values[`sourceUnitId#${conCode}`],
            sourceUnitCode: values[`sourceUnitCode#${conCode}`],
            sourceFieldId: values[`sourceFieldId#${conCode}`],
            sourceFieldCode: values[`sourceFieldCode#${conCode}`],
            sourceModelId: values[`sourceModelId#${conCode}`],
            sourceModelCode: values[`sourceModelCode#${conCode}`],
            sourceFieldValueCode: values[`sourceFieldValueCode#${conCode}`],
            conExpression: values[`conExpression#${conCode}`],
            targetType: values[`targetType#${conCode}`],
            targetValue: values[`targetValue#${conCode}`],
            targetValueMeaning: values[`targetValueMeaning#${conCode}`],
            targetFieldId: values[`targetFieldId#${conCode}`],
            targetFieldCode: values[`targetFieldCode#${conCode}`],
            targetModelId: values[`targetModelId#${conCode}`],
            targetModelCode: values[`targetModelCode#${conCode}`],
          };
        })
        .filter(Boolean);
      if (typeof updateSelfValidator === 'function') {
        updateSelfValidator({
          ...headerProps,
          conType: 'valid',
          lines: newConditionList,
          valids: validateData,
        });
      }
      onClose();
    });
  }

  onDelete(conCode) {
    const { conditionList } = this.state;
    const delNo = conCode;
    this.delNo(delNo);
    this.clearFields(1, conCode);
    this.setState({
      conditionList: conditionList.map(_ => (_ && conCode === _.conCode ? undefined : _)),
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
    return conditionNo.length - 1;
  }

  delNo(no) {
    const { conditionNo } = this.state;
    conditionNo[no] = undefined;
  }

  @Bind()
  addMap() {
    const { conditionList } = this.state;
    const newNo = this.registerNo();
    this.setState({ conditionList: [{ conCode: newNo }, ...conditionList] });
  }

  @Bind()
  getRightField(index, i) {
    const { form, ctxParams, unitId: currentUnitId, fieldList } = this.props;
    const relationIsNull =
      form.getFieldValue(`conExpression#${index}`) === 'ISNULL' ||
      form.getFieldValue(`conExpression#${index}`) === 'NOTNULL';
    if (relationIsNull) return [];
    const targetType = form.getFieldValue(`targetType#${index}`);
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
    const { bindField, bindFieldWidget, bindFieldSourceCode, bindParamList } = currentLeftField;
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
      <FormItem style={{ flex: 1, maxWidth: '105px' }}>
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
      } else if (type === 'SELECT' || type === 'RADIOGROUP') {
        Widget = Select;
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
            (selectOptions[i.conCode] || []).map(n => <Option value={n.value}>{n.meaning}</Option>)
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
          })(<Widget {...compProps} />)}
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
          {form.getFieldDecorator(`targetField#${index}`, {
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

  setFieldOneInfo(id, conCode, config) {
    const { fieldList, form } = this.props;
    const { selectOptions } = this.state;
    const modelCode = id ? id.split('#')[0] : undefined;
    const modelFieldCode = id ? id.split('#')[1] : undefined;
    const fieldObj =
      modelCode && modelFieldCode
        ? (fieldList[form.getFieldValue(`sourceUnitId#${conCode}`)] || []).find(
            i => i.modelFieldCode == modelFieldCode && i.modelCode === modelCode
          )
        : undefined;
    if (fieldObj) {
      if (['SELECT', 'RADIOGROUP'].includes(fieldObj.widgetType)) {
        queryUnifyIdpValue(fieldObj.sourceFieldValueCode)
          .then((res = {}) => {
            selectOptions[config.conCode] = (res && !res.failed && res) || [];
            this.setState({
              selectOptions,
            });
          })
          .finally(() => {
            form.setFieldsValue({
              [`selectOptionsLoading#${conCode}`]: false,
            });
          });
      }
      form.setFieldsValue({
        [`paramList#${conCode}`]: fieldObj.paramList || [],
        [`selectOptionsLoading#${conCode}`]: true,
        [`sourceFieldWidget#${conCode}`]: fieldObj.widgetType,
        [`sourceFieldCode#${conCode}`]: fieldObj.unitFieldCode,
        [`sourceFieldValueCode#${conCode}`]: fieldObj.sourceFieldValueCode,
        [`sourceModelId#${conCode}`]: fieldObj.modelId,
        [`sourceModelCode#${conCode}`]: fieldObj.modelCode,
        [`targetValue#${conCode}`]: undefined,
        [`targetValueMeaning#${conCode}`]: undefined,
      });
    }
  }

  setFieldTwoInfo(id, conCode) {
    const { form, unitId, fieldList } = this.props;
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
        [`targetModelId#${conCode}`]: fieldObj.modelId,
        [`targetFieldCode#${conCode}`]: fieldObj.unitFieldCode,
        [`targetModelCode#${conCode}`]: fieldObj.modelCode,
        [`targetModelFieldCode#${conCode}`]: fieldObj.unitFieldCode,
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
  clearFields(level, conCode) {
    const { form } = this.props;
    switch (level) {
      case 1:
        form.setFieldsValue({
          [`sourceField#${conCode}`]: undefined,
          [`sourceFieldWidget#${conCode}`]: undefined,
          [`sourceFieldId#${conCode}`]: undefined,
          [`sourceFieldCode#${conCode}`]: undefined,
          [`sourceFieldValueCode#${conCode}`]: undefined,
          [`sourceModelId#${conCode}`]: undefined,
          [`targetModelId#${conCode}`]: undefined,
          [`targetFieldCode#${conCode}`]: undefined,
          [`targetValue#${conCode}`]: undefined,
          [`targetValueMeaning#${conCode}`]: undefined,
          [`targetFieldId#${conCode}`]: undefined,
          [`selectOptionsLoading#${conCode}`]: false,
          [`paramList#${conCode}`]: [],
          [`targetType#${conCode}`]: 'fixed',
        });
        break;
      case 2:
        form.setFieldsValue({
          [`targetField#${conCode}`]: undefined,
          [`targetValue#${conCode}`]: undefined,
          [`targetValueMeaning#${conCode}`]: undefined,
          [`targetFieldId#${conCode}`]: undefined,
          [`selectOptionsLoading#${conCode}`]: false,
        });
        break;
      default:
    }
  }

  @Bind()
  delValidator(index) {
    const { validatorDelKey, validatorList } = this.state;
    const delData = validatorList.find(line => line.conCode === index);
    if (!isNil(delData)) {
      validatorDelKey.push(delData.conCode);
    }
    this.setState({ validatorList: validatorList.filter(line => line.conCode !== index) });
  }

  @Bind()
  addValidator() {
    const { validatorDelKey, validatorList } = this.state;
    let conCode = validatorList.length;
    if (validatorDelKey.length > 0) {
      [conCode] = validatorDelKey;
      this.setState({ validatorDelKey: validatorDelKey.slice(1) });
    }
    this.setState({ validatorList: [{ conCode, _status: 'create' }, ...validatorList] });
  }

  getValidatorColumns() {
    const { conditionNo } = this.state;
    return [
      {
        title: intl.get('hpfm.individual.view.message.title.calculatLogic').d('表达式'),
        dataIndex: 'conExpression',
        width: 350,
        render: (val, record) => (
          <FormItem wrapperCol={{ span: 24 }}>
            {record.$form.getFieldDecorator(`conExpression`, {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.individual.view.message.title.calculatLogic').d('表达式'),
                  }),
                },
                {
                  validator: (_, value, cb) => {
                    const array = (value !== undefined && value.match(/\s?\d+\s?/g)) || [];
                    for (let i = 0; i < array.length; i += 1) {
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
                          .d('不允许输入字母及 ( )  OR AND 以外的字符')
                      );
                      return;
                    }
                    cb();
                  },
                },
              ],
            })(<Input inputChinese={false} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get('hpfm.individual.model.config.errorMessage').d('错误信息'),
        dataIndex: 'errorMessage',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`errorMessage`, {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.individual.model.config.errorMessage').d('错误信息'),
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl.get('hpfm.individual.model.config.errorMessage').d('错误信息')}
                field="errorMessage"
                token={record._token}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get('hzero.common.action').d('操作'),
        dataIndex: '_op',
        width: 60,
        render: (_, record) => (
          <Popconfirm
            title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
            okText={intl.get('hzero.common.status.yes').d('是')}
            cancelText={intl.get('hzero.common.status.no').d('否')}
            onConfirm={() => this.delValidator(record.conCode)}
          >
            <a className="delete" role="button" style={{ color: '#333' }}>
              <Icon type="delete" />
            </a>
          </Popconfirm>
        ),
      },
    ];
  }

  @Bind()
  getLeftField(index, i) {
    const { form, targetProp, unitType, unitId: currentUnitId, fieldList, unitList } = this.props;
    const isFormType = ['FORM', 'QUERYFORM', 'WORKFLOW'].includes(unitType);
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
              <Option value="tenantId">
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
        <FormItem style={{ width: '151px' }}>
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
    const { validatorList, conditionList } = this.state;
    const {
      visible,
      onClose,
      form,
      codes: { relationShip = [] },
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
          {conditionList.map(i => {
            if (!i) return null;
            const { conCode } = i;
            return (
              <div className={styles['condition-row']}>
                <span className="index">{conCode}</span>
                <FormItem style={{ width: '105px' }}>
                  {form.getFieldDecorator(`sourceType#${conCode}`, {
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
                      onChange={() => this.clearFields(1, conCode)}
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
                {this.getLeftField(conCode, i)}
                <FormItem style={{ width: '105px' }}>
                  {form.getFieldDecorator(`conExpression#${conCode}`, {
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
                          getFilter(form.getFieldValue(`sourceFieldWidget#${conCode}`)).includes(
                            k.value
                          )
                        )
                        .map(k => (
                          <Option value={k.value}>{k.meaning}</Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
                {this.getRightField(conCode, i)}
                <Popconfirm
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                  okText={intl.get('hzero.common.status.yes').d('是')}
                  cancelText={intl.get('hzero.common.status.no').d('否')}
                  onConfirm={() => this.onDelete(conCode)}
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
            marginRight: '16px',
          }}
        >
          <div className={styles.title}>
            {intl.get('hpfm.individual.view.message.title.validatorList').d('表达式列表')}
          </div>
          <div className={styles.tips}>
            {intl
              .get('hpfm.individual.view.message.title.tips3')
              .d('使用条件编号及AND、OR编写运算规则。示例(1 OR 2) AND 3')}
          </div>
          <div
            onClick={this.addValidator}
            style={{
              display: 'flex',
              float: 'right',
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
            {intl.get('hzero.common.button.addValidator').d('添加校验')}
          </div>
        </div>

        <div style={{ minHeight: '150px', marginLeft: '12px', marginRight: '16px' }}>
          <EditTable
            bordered
            columns={this.getValidatorColumns()}
            dataSource={validatorList}
            pagination={false}
          />
        </div>
      </Modal>
    );
  }
}
