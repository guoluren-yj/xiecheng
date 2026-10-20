/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import moment from 'moment';
import { Form, Modal, DataSet, TextField, Select, Lov, NumberField, MonthPicker, DateTimePicker, DatePicker, Button, CheckBox, Output } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, isArray, omit, isNil} from 'lodash';
import { observer } from "mobx-react";
import { toJS } from 'mobx';

import { getContext } from 'srm-front-cuz/lib/customizeTool';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import { queryMapIdpValue } from 'services/api';

import DefaultExpConfig from '@/components/DefaultExpConfig';
import { getLovPara } from '@/utils/util';
import { openConditionModal } from '../../common/modals';
import styles from './index.less';
import { FIX_DATE_RANGES } from '../../../../../utils/constConfig';

@connect(({ loading }) => ({
  saveLoading: loading.effects['searchBarConfig/saveFilterField'],
}))
@observer
export default class FieldSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultValueFx: (props.record && toJS(props.record.get('defaultValueCon'))) || undefined,
    };
    this.ctxParams = {
      ctx: getContext(),
      url: {},
      self: {}, // 自定义参数，留口备用
    };
  }

  @Bind()
  handleClose() {
    const { modal } = this.props;
    if (modal) {
      modal.close();
    }
  }

  @Bind()
  async handleOk() {
    const { defaultValueFx } = this.state;
    const {
      isEdit,
      readOnly,
      record,
      dispatch,
      filterInfo = {},
      unitInfo = {},
      onRefresh = () => {},
      mode,
      tplParams,
    } = this.props;
    if (readOnly) {
      this.handleClose();
      return;
    }
    const flag = await record.validate();
    if (!flag) {
      return;
    }
    const values = record.toData();
    const { unitCode } = unitInfo;
    const {
      fieldAlias,
      fixedFlag,
      defaultValue,
      proDefaultFlag = 0,
      widget: { fieldWidget, multipleFlag, dateFormat, lovInfo },
      fieldId,
      filterFieldId,
      num,
      defaultValueCon: oldDefaultValueCon,
      comparison,
    } = values;
    const { valueField } = lovInfo || {};
    let defaultValueCon = oldDefaultValueCon
      ? { ...omit(oldDefaultValueCon, ['lines', 'valids']), ...defaultValueFx }
      : defaultValueFx;
    if (defaultValueCon && (!defaultValueCon.valids || defaultValueCon.valids.length < 1)) {
      defaultValueCon = undefined;
    }
    let newField = {
      fieldAlias,
      filterId: filterInfo.filterId,
      fixedFlag,
      // mergeFlag,
      unitCode,
      proDefaultFlag,
      defaultValueCon,
      defaultValue,
    };
    if (isEdit) {
      newField = {
        ...newField,
        num,
        fieldId,
        filterFieldId,
      };
    } else {
       // 新建时rank取当前
      newField.num = isEmpty(filterInfo.filterFields)
        ? 1
        : filterInfo.filterFields.length * 10;
    }
    const multiple = fieldWidget === 'DATE_PICKER' ? comparison === 'RANGE' : Number(multipleFlag) === 1;
    if (proDefaultFlag !== 1) {
      if (fieldWidget === 'LOV' && defaultValue) {
        if (multiple) {
          newField.defaultValue = defaultValue.map(i => (i && valueField && i[valueField]) || '').join(',');
        } else {
          newField.defaultValue = (valueField && defaultValue[valueField]) || '';
        }
      } else if (fieldWidget === 'DATE_PICKER' && defaultValue) {
        if (multiple) {
          newField.defaultValue = defaultValue
            .map((item) =>
              item ? moment(item).format(dateFormat || DEFAULT_DATETIME_FORMAT) : ''
            )
            .join(',');
        } else {
          newField.defaultValue = moment(defaultValue).format(
            dateFormat || DEFAULT_DATETIME_FORMAT
          );
        }
      } else if ((!fieldWidget || ['SELECT', 'INPUT_NUMBER', 'INPUT'].includes(fieldWidget)) && multiple) {
        newField.defaultValue = isArray(defaultValue) ? defaultValue.join(',') : '';
      }
    }
    const res = await dispatch({
      type: 'searchBarConfig/saveFilterField',
      params: [newField],
      mode,
      tplParams,
    });
    if (res) {
      notification.success();
      this.handleClose();
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    }
  }

  @Bind()
  openProDefaultModal() {
    const {
      record,
      unitInfo: { id },
      filterInfo = {},
      readOnly,
    } = this.props;
    const { tenantId } = filterInfo;
    const preDefinedFlag = tenantId === 0; // 预定义类型不能编辑
    Modal.open({
      title: intl.get('hpfm.individual.model.config.proDefault').d('公式配置'),
      closable: true,
      movable: false,
      drawer: false,
      key: Modal.key(),
      style: { width: 920 },
      bodyStyle: { padding: 0, display: "flex", flexDirection: "column", height: "calc(100vh - 2.06rem)" },
      footer: null,
      children: (
        <DefaultExpConfig
          readOnly={preDefinedFlag || readOnly}
          record={record}
          mode="c7n"
          ctxParams={this.ctxParams}
          unitId={id}
          propName="defaultValue"
        />
      ),
    });
  }

  @Bind()
  handleChangeField(newFieldAlias) {
    const { record, originFields = [] } = this.props;
    if (!isEmpty(originFields)) {
      const targetField = originFields.find((item) => item.get('fieldAlias') === newFieldAlias);
      if (targetField) {
        const { fieldAlias, widget = {}, displayField, whereOptions, modelFieldFlag, paramList } = targetField.get(['fieldAlias', 'widget', 'displayField', 'whereOptions', 'modelFieldFlag', 'paramList']);
        record.reset();
        record.set('fieldName', newFieldAlias);
        record.set('fieldAlias', fieldAlias);
        record.set('widget', widget);
        record.set('displayField', displayField);
        record.set('modelFieldFlag', modelFieldFlag);
        let defaultComparison = whereOptions && whereOptions[0];
        record.set('comparison', (widget || {}).fieldWidget === 'DATE_PICKER' && modelFieldFlag && defaultComparison === 'IN' ? 'RANGE' : defaultComparison);
        record.set('lovPara', getLovPara(paramList));
      }
    }
  }

  @Bind()
  handleChangeDefaultFlag() {
    const { record } = this.props;
    record.set('defaultValue', undefined);
    this.setState({ defaultValueFx: undefined });
  }

  @Bind()
  generateDefaultValueText(records, displayField, valueField, multipleFlag) {
    if (!isArray(records) || isEmpty(records)) {
      return null;
    }
    // 多选
    if (Number(multipleFlag) === 1) {
      const text = {};
      records.forEach((item) => {
        text[item[valueField] || ''] = item[displayField];
      });
      return text;
    } else {
      return records[0][displayField];
    }
  }

  @Bind()
  toggleDefaultValueModal() {
    const { defaultValueFx } = this.state;
    const { unitInfo = {}, record, readOnly, tplFxParams } = this.props;
    const { id: unitId } = unitInfo;
    const formData = record.toData();
    const { fieldWidget, multipleFlag, sourceCode, dateFormat, lovInfo } = formData.widget || {};
    const fieldProps = {
      name: 'widget.defaultValue',
      multiple: Number(multipleFlag) === 1,
    };
    if (fieldWidget === 'LOV') {
      const textField = formData.displayField || (lovInfo ? lovInfo.displayField : undefined);
      formData.lovCode = sourceCode;
      fieldProps.lovCode = sourceCode;
      formData.textField = textField;
      fieldProps.textField = textField;
    } else if (fieldWidget === 'SELECT') {
      formData.lookupCode = sourceCode;
      fieldProps.lookupCode = sourceCode;
    } else if (fieldWidget === 'DATE_PICKER') {
      const format = dateFormat || DEFAULT_DATETIME_FORMAT;
      formData.format = format;
      if (!formData.widget) {
        formData.widget = {};
      }
      formData.widget.dateFormat = formData.widget.dateFormat || DEFAULT_DATETIME_FORMAT;
      fieldProps.format = format;
    }
    this.formDs = new DataSet({
      fields: [fieldProps],
    });
    this.formDs.create(formData);
    const conditionData = {
      defaultValue: defaultValueFx,
    };
    let subModalCommonParams = { unitId };
    const isTemplate = this.props.mode === "tpl";
    if (isTemplate && tplFxParams) {
      subModalCommonParams = {
        ...subModalCommonParams,
        ...tplFxParams,
      };
    }
    openConditionModal(
      {
        subModalCommonParams,
        conditionData,
        updateData: this.updateDefaultValueFx,
        record: this.formDs.current,
        readOnly,
        unitInfoFun: () => unitInfo || {},
        type: 'defaultValue',
        isTemplate,
      }
    );
  }

  @Bind()
  updateDefaultValueFx(newSelfValidator) {
    this.setState({
      defaultValueFx: newSelfValidator.defaultValue,
    });
  }

  @Bind()
  renderDefaultValueItem(outputMode) {
    const { readOnly, isEdit, record } = this.props;
    const { defaultValueFx } = this.state;
    const { defaultValue, proDefaultFlag, widget } = record.get(['defaultValue', 'proDefaultFlag', 'widget']);
    const valids = defaultValueFx ? defaultValueFx.valids : undefined;
    const hasFxConfigFlag = (valids || []).length > 0;
    if (proDefaultFlag === 1) {
      const normalDefaultValue = toJS(defaultValue);
      const hasProDefaultValueFlag = !isNil(normalDefaultValue) && (!isArray(normalDefaultValue) || normalDefaultValue.length > 0);
      return (
        <>
          <div name='defaultValue'>
            <Badge dot={hasProDefaultValueFlag}>
              <a onClick={this.openProDefaultModal}>
                {intl.get('hpfm.individual.model.config.proDefault').d('公式配置')}
              </a>
            </Badge>
            <Badge dot={hasFxConfigFlag}>
              <a style={{ marginLeft: '8px' }} onClick={this.toggleDefaultValueModal}>
              |&nbsp;Fx
              </a>
            </Badge>
          </div>  
        </>
      );
    }
    if (outputMode) {
      return (
        <div name='defaultValue'>
          <Output name='defaultValue' style={{ verticalAlign: 'bottom' }} />
          <Badge dot={hasFxConfigFlag} >
            <a style={{ marginLeft: '8px' }} onClick={this.toggleDefaultValueModal}>
              Fx
            </a>
          </Badge>
        </div>
      );
    }
    const { fieldWidget, multipleFlag } = widget || {};
    const dateFormat = widget.dateFormat || DEFAULT_DATETIME_FORMAT;
    const commonProps= {
      addonAfter: (
        <Badge dot={hasFxConfigFlag}>
          <a style={{ height: '30px' }} onClick={this.toggleDefaultValueModal}>
            Fx
          </a>
        </Badge>
      ),
      name: 'defaultValue',
    };
    switch (fieldWidget) {
      case 'LOV': 
        return <Lov {...commonProps} />;
      case 'SELECT':
        return <Select {...commonProps} />;
      case 'INPUT_NUMBER':
        return <NumberField {...commonProps} />;
      case 'DATE_PICKER':
        if (/^(YYYY)?[-/]?MM$/.test(dateFormat)) {
          return <MonthPicker {...commonProps} />;
        }
        if (dateFormat.includes('mm:ss')) {
          return <DateTimePicker {...commonProps} />;
        }
        return <DatePicker {...commonProps} />;
      default:
        return <TextField {...commonProps} />;
    }
  }

  renderForm = () => {
    const {
      record,
      isEdit,
      readOnly,
      filterInfo,
    } = this.props;
      const { tenantId } = filterInfo;
    const preDefinedFlag = tenantId === 0; // 预定义类型不能编辑
    const outputMode = readOnly || preDefinedFlag;
    const showDefaultValue = record.get('widget.fieldWidget') !== 'DATE_PICKER' || !record.get('modelFieldFlag') || ![...FIX_DATE_RANGES.filter(i => i !== 'RANGE'), 'NOTNULL', 'ISNULL'].includes(record.get('comparison'));
    if (outputMode) {
      return (
        <Form labelLayout='vertical' record={record} className={classnames('c7n-pro-vertical-form-display', styles['field-editor-modal-content'])}>
          <Output name='fieldAlias' />
          <Output name='fieldName' />
          <Output name='widget.fieldWidget' />
          {['LOV', 'SELECT'].includes(record.get('widget.fieldWidget')) && (
            <Output name='widget.sourceCode' />
          )}
          {record.get('widget.fieldWidget') === 'DATE_PICKER' && record.get('modelFieldFlag') && (
            <Output name='comparison' />
          )}
          {record.get('fieldName') && showDefaultValue && record.get('widget.lovEnhanceFlag') !== 1 && (
            <>
              <Output name='proDefaultFlag' />
              {this.renderDefaultValueItem(outputMode)}
            </>
          )}
          <Output name='fixedFlag' />
        </Form>
      )
    }
    return (
      <Form className={styles['field-editor-modal-content']} labelLayout="float" record={record} columns={1}>
        <TextField name='fieldAlias' disabled />
        {isEdit ? <TextField name='fieldName' disabled /> : <Select searchable name='fieldName' onChange={this.handleChangeField} />}
        <TextField name='widget.fieldWidget' disabled />
        {['LOV', 'SELECT'].includes(record.get('widget.fieldWidget')) && (
          <TextField name='widget.sourceCode' disabled />
        )}
        {record.get('widget.fieldWidget') === 'DATE_PICKER' && record.get('modelFieldFlag') && (
          <Select name='comparison' disabled />
        )}
        {record.get('fieldName') && showDefaultValue && record.get('widget.lovEnhanceFlag') !== 1 && (
          <>
            <Select name='proDefaultFlag' onChange={this.handleChangeDefaultFlag} />
            {this.renderDefaultValueItem()}
          </>
        )}
        <CheckBox name='fixedFlag' />
      </Form>
    );
  }

  render() {
    const {
      record,
      isEdit,
      readOnly,
      filterInfo,
    } = this.props;
      const { tenantId } = filterInfo;
    const preDefinedFlag = tenantId === 0; // 预定义类型不能编辑
    const outputMode = readOnly || preDefinedFlag;
    return (
      <div className={styles['field-editor-modal']}>
        {this.renderForm()}
        <div className={styles['field-editor-modal-footer']}>
          {readOnly ? (
            <Button onClick={this.handleClose}>
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          ) : (
            <>
              <Button color="primary" onClick={this.handleOk}>
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
              <Button onClick={this.handleClose}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }
}
