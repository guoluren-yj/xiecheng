/* eslint-disable eqeqeq */

import React, { Component } from 'react';
import classnames from 'classnames';
import { Modal, Drawer, Form, Button, InputNumber, Row, Col } from 'hzero-ui';
import { Icon } from "choerodon-ui/pro";
import { Bind } from 'lodash-decorators';
import { isEmpty, isNil, omit } from 'lodash';
import { connect } from 'dva';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { getResponse } from "hzero-front/lib/utils/utils";
import ParamsModal from '../../../components/CommonModal/ParamsConfigModal';
import {
  checkValueCodeAssignMenu,
} from '../../../services/customizeConfigService';
import { getAddFieldAlias, getEditFieldAlias } from '../../../utils/constConfig.js';
import Default from './ModalContent/Default';
import TableField from './ModalContent/TableField';
import BtnField from './ModalContent/BtnField';
import CommonField from './ModalContent/CommonField';
import styles from '../style/index.less';
import { SEARCHBAR_RANGE_COMPONENT, FIX_DATE_RANGES } from '@/utils/constConfig';

const FormItem = Form.Item;

const formLayout2 = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
@connect(({ loading = {} }) => ({
  saveLoading: loading.effects['individuationUnitCuz/saveUnitField'],
}))
export default class FieldModal extends Component {
  state = {
    paramVisible: false,
    backUpParamList: [],
  };

  componentDidUpdate(prevProps) {
    if (prevProps.visible === false && this.props.visible === true) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ backUpParamList: ((this.props.data || {}).paramList || []).map(i => i) });
    }
  }

  @Bind()
  create() {
    const { unitInfo, form, data, dispatch, fetchUnitDetail, handleClose } = this.props;
    const { unitType } = unitInfo;
    const { paramList } = data || {};
    const isSeachBarType = unitType === 'SEARCHBAR';
    form.validateFields((err, values = {}) => {
      if (!err) {
        const { fieldWidget, widget = {}, whereOption, mergeFlag, fieldId = -1, uiFeature } = values;
        const { id } = unitInfo;
        let params = {
          ...values,
          fieldId,
          unitId: id,
          uiFeature: uiFeature && typeof uiFeature != "string" ? uiFeature.join(",") : uiFeature,
        };
        if (paramList) {
          params.paramList = paramList;
        }
        if (widget.multipleFlag === 1 && widget.fieldWidget !== 'DATE_PICKER') {
          params.whereOption = 'IN';
        } else if (mergeFlag === 1) {
          params.whereOption = 'LIKE';
        } else if (whereOption) {
          params.whereOption = whereOption.join(',');
        }
        if (fieldWidget) {
          widget.fieldWidget = fieldWidget;
        } else {
          widget.fieldWidget = null;
        }
        // 筛选器单元创建虚拟字段时需要传fieldCode和fieldAlias等参数
        if (
          (!isSeachBarType && form.getFieldValue('isModelField')) ||
          (isSeachBarType && form.getFieldValue('isModelField') != 1)
        ) {
          params = {
            ...params,
            fieldAlias: params.fieldCode,
            fieldCodeAlias: params.fieldCode,
            mergeFlag: mergeFlag || 0, // 空值传0
            widget: {
              ...widget,
              fieldWidget,
            },
          };
        }
        if (params.fieldNameType === 'MODEL') {
          params.modelFieldCode = params.fieldCode;
        }
        params.sortedFlag = !isNil(params.sortedFlag) ? params.sortedFlag : 0; // 空值传0
        if (!['DEFAULT', 'CUSTOMIZE'].includes(params.fieldNameType) && params.cuszFieldName) {
          // 保存时 将cuszFieldName 填充到fieldName字段上
          params.fieldName = params.cuszFieldName;
        }
        // 虚拟字段 modelCode保存为-1
        if (params.isModelField != 1) {
          params.modelCode = -1;
        }

        const onOk = () => {
          return dispatch({
            type: 'individuationUnitCuz/saveUnitField',
            params,
          }).then(res => {
            if (res) {
              notification.success();
              fetchUnitDetail({ unitId: id });
              form.resetFields();
              handleClose();
            }

            this.setState({
              confirmSaveProps: null
            });
          });
        }
        checkValueCodeAssignMenu({ isSite: true }, params).then(res2 => {
          if (!res2 || typeof res2 !== "string" && getResponse(res2)) {
            return onOk();
          }
          this.setState({
            confirmSaveProps: {
              message: res2,
              onOk,
              onCancel: () => this.setState({ confirmSaveProps: null })
            }
          });
        });
      }
    });
  }

  @Bind()
  save() {
    const { form, dispatch, data = {}, handleClose, fetchUnitDetail } = this.props;
    const {
      unitId,
      modelId,
      modelCode,
      field: { model },
    } = data;
    form.validateFields((err, values) => {
      if (!err) {
        const fieldAlias =
          form.getFieldValue('isModelField') == 1
            ? form.getFieldValue('fieldAlias')
            : data.fieldAlias;
        let { widget } = data;
        if (!widget) widget = {};
        const {
          fieldWidget,
          whereOption,
          mergeFlag,
          renderOptions = 'TEXT',
          fieldId = -1,
        } = values;
        const uiFeature = values.uiFeature || data.uiFeature;
        const params = {
          ...data,
          ...values,
          modelId: (model || {}).modelId || modelId,
          modelCode,
          fieldId,
          // fieldCode,
          renderOptions,
          bindField: values.bindField === '' ? undefined : values.bindField,
          fieldAlias,
          widget,
          whereOption: whereOption ? whereOption.join(',') : undefined,
          uiFeature: uiFeature && typeof uiFeature != "string" ? uiFeature.join(",") : uiFeature,
        };
        if (!isEmpty(values.widget)) {
          widget = {
            ...widget,
            ...values.widget,
          };
        }
        if (fieldWidget) {
          widget.fieldWidget = fieldWidget;
        } else {
          widget.fieldWidget = null;
        }
        if (widget.multipleFlag === 1 && widget.fieldWidget !== 'DATE_PICKER') {
          params.whereOption = 'IN';
        }
        if (mergeFlag === 1) {
          params.whereOption = 'LIKE';
        }
        params.widget = widget;
        if (isEmpty(params.widget)) delete params.widget;
        params.mergeFlag = params.mergeFlag || 0; // 空值传0
        if (params.fieldNameType === 'MODEL') {
          params.modelFieldCode = params.fieldCode;
        }
        if (!['DEFAULT', 'CUSTOMIZE'].includes(params.fieldNameType) && params.cuszFieldName) {
          // 保存时 将cuszFieldName 填充到fieldName字段上
          params.fieldName = params.cuszFieldName;
        }
        // 虚拟字段 modelCode保存为-1
        if (params.isModelField != 1) {
          params.modelCode = -1;
        }

        const onOk = () => {
          return dispatch({
            type: 'individuationUnitCuz/saveUnitField',
            params,
          }).then(res => {
            if (res) {
              notification.success();
              fetchUnitDetail({ unitId });
              form.resetFields();
              handleClose();
            }

            this.setState({
              confirmSaveProps: null
            });
          });
        }
        checkValueCodeAssignMenu({ isSite: true }, params).then(res2 => {
          if (!res2 || typeof res2 !== "string" && getResponse(res2)) {
            return onOk();
          }
          this.setState({
            confirmSaveProps: {
              message: res2,
              onOk,
              onCancel: () => this.setState({ confirmSaveProps: null })
            }
          });
        });
      }
    });
  }

  @Bind()
  renderOtherOptions() {
    const { unitInfo = {}, form, data = {} } = this.props;
    const { getFieldDecorator = () => { } } = form;
    const { formRow, formCol, gridSeq, rowSpan, colSpan } = data;
    const { unitType } = unitInfo;
    const isFormType = unitType === 'FORM' || unitType === 'QUERYFORM';
    const pureVirtual = ['BTNGROUP', 'TABPANE', 'COLLAPSE', 'SECTION'].includes(unitType);
    if (isFormType) {
      return (
        <Row className={styles['unit-editor-form2']}>
          <Col span={11}>
            <FormItem
              label={`${intl.get('hpfm.individuationUnit.model.individuationUnit.row').d('行')}:`}
              {...formLayout2}
            >
              {getFieldDecorator('formRow', {
                initialValue: formRow,
              })(<InputNumber style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={11} offset={2}>
            <FormItem
              label={`${intl.get('hpfm.individuationUnit.model.individuationUnit.col').d('列')}:`}
              {...formLayout2}
            >
              {getFieldDecorator('formCol', {
                initialValue: formCol,
              })(<InputNumber style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={11}>
            <FormItem
              label={intl.get('hpfm.individual.model.config.rowSpan').d('跨行')}
              {...formLayout2}
            >
              {form.getFieldDecorator('rowSpan', {
                initialValue: rowSpan || 1,
              })(<InputNumber style={{ width: '100%' }} precision={0} min={1} />)}
            </FormItem>
          </Col>
          <Col span={11} offset={2}>
            <FormItem
              label={intl.get('hpfm.individual.model.config.colSpan').d('跨列')}
              {...formLayout2}
            >
              {form.getFieldDecorator('colSpan', {
                initialValue: colSpan || 1,
              })(<InputNumber style={{ width: '100%' }} precision={0} min={1} />)}
            </FormItem>
          </Col>
        </Row>
      );
    }
    if (pureVirtual || unitType === 'FILTER') {
      return (
        <Row className={styles['unit-editor-form2']}>
          <Col span={11}>
            <FormItem
              label={intl.get('hpfm.individuationUnit.model.individuationUnit.position').d('位置')}
              {...formLayout2}
            >
              {getFieldDecorator('gridSeq', {
                initialValue: gridSeq,
              })(<InputNumber />)}
            </FormItem>
          </Col>
        </Row>
      );
    }
  }

  @Bind()
  handleChangeField(e, record) {
    const { form } = this.props;
    const {
      fieldCode,
      fieldCategoryMeaning,
      fieldName,
      fieldCodeCamel,
      modelFieldWidget,
      fieldId,
      columnType,
    } = record;
    form.setFieldsValue({
      fieldCode,
      fieldName,
      fieldAlias: fieldCodeCamel,
      modelFieldName: fieldName,
      fieldCategoryMeaning,
      fieldWidget: (modelFieldWidget || {}).fieldWidget,
      fieldId,
      columnType,
    });
    if (modelFieldWidget) {
      form.setFieldsValue({
        fieldWidget: (modelFieldWidget || {}).fieldWidget,
      });
      // 此处加延时解决改变值之前字段还未绑定到form上，造成值未正确到页面问题
      setTimeout(() => {
        form.setFieldsValue({
          'widget.sourceCode': (modelFieldWidget || {}).sourceCode,
        });
      });
    }
  }

  @Bind()
  toggleParamsModal() {
    const { paramVisible } = this.state;
    this.setState({
      paramVisible: !paramVisible,
    });
  }

  @Bind()
  saveParamList(paramList) {
    const { data, form } = this.props;
    data.paramList = paramList.map(d => {
      return { ...d, sourceType: form.getFieldValue("fieldWidget") || "DEFAULT" };
    });
  }

  @Bind()
  handleClose() {
    const { data, handleClose = () => { }, form } = this.props;
    data.paramList = this.state.backUpParamList;
    handleClose();
    form.resetFields();
  }

  @Bind()
  getComponentWhereOption(widget, flag) {
    const {
      whereOptions,
      form: { getFieldValue = () => { } },
    } = this.props;
    const commonOptions = !whereOptions.length
      ? []
      : whereOptions.filter(item => ['NOTNULL', 'ISNULL'].includes(item.value));
    let defaultOption = ['='];
    let options = whereOptions;
    const multipleFlag = flag || getFieldValue('widget.multipleFlag');
    const fieldWidget = widget || getFieldValue('fieldWidget');
    //  日期字段没有范围的单独的配置项了，和筛选方式合在一起了，需单独处理
    if (fieldWidget === 'DATE_PICKER') {
      // 范围日期显示为范围
      if (multipleFlag == 1) {
        defaultOption = ['RANGE'];
      }
      options = options.filter(item => [...FIX_DATE_RANGES, '=', '<>', '>', '<', '>=', '<='].includes(item.value)); 
    } else if (multipleFlag === 1) {
      // INPUT', 'INPUT_NUMBER', 'SELECT', 'LOV'
      defaultOption = ['IN'];
      options = options.filter(item => item.value === 'IN');
    } else if (SEARCHBAR_RANGE_COMPONENT.includes(fieldWidget)) {
      options = options.filter(item => ['=', '>', '>=', '<', '<=', '<>'].includes(item.value));
    } else if (['LOV', 'SELECT'].includes(fieldWidget)) {
      defaultOption = multipleFlag === 1 ? ['IN', 'NOT IN'] : ['=', '<>', '~IN', '~NOT IN'];
      options = options.filter(item => defaultOption.includes(item.value));
    } else {
      options = options.filter(item =>
        ['=', '<>', 'L_LIKE', 'R_LIKE', 'LIKE', 'NOT LIKE'].includes(item.value)
      );
    }
    options = options.concat(commonOptions);
    return { options, defaultOption };
  }

  @Bind()
  onComponentChange() {
    const {
      unitInfo = {},
      form: { setFieldsValue },
    } = this.props;
    const { unitType } = unitInfo;
    const isSeachBarType = unitType === 'SEARCHBAR';
    if (isSeachBarType) {
      // const { defaultOption } = this.getComponentWhereOption(value);
      const { defaultOption } = this.getComponentWhereOption();
      setFieldsValue({
        whereOption: defaultOption,
        displayField: undefined,
        valueField: undefined,
        'widget.dateFormat': undefined,
        'widget.sourceCode': undefined,
        'widget.lovEnhanceFlag': 0,
        // 'widget.multipleFlag': undefined,
      });
    }
  }

  @Bind()
  changeMultipleFlag(e) {
    const {
      form: { setFieldsValue = () => { }, getFieldValue = () => { } },
    } = this.props;
    setFieldsValue({
      mergeFlag: 0,
      // 切换范围时间时，范围类型展示in类型
      whereOption: getFieldValue('fieldWidget') === "DATE_PICKER" && e.target.checked ? ['IN'] : ['='],
    });
  }

  @Bind()
  changeFieldMergeFlag() {
    const {
      form: { setFieldsValue = () => { } },
    } = this.props;
    setFieldsValue({
      'widget.multipleFlag': 0,
      whereOption: ['='],
    });
  }

  @Bind()
  handleChangeFieldNameType(e) {
    const type = e.target.value;
    const {
      form: { setFieldsValue = () => { }, getFieldValue = () => { } },
    } = this.props;
    if (type === 'MODEL') {
      setFieldsValue({
        fieldName: getFieldValue('modelFieldName'),
      });
    }
  }

  @Bind()
  transformArrToTree(
    arrData,
    childKeyName,
    childValueName,
    parentKeyName,
    childrenName = 'children'
  ) {
    if (isEmpty(arrData)) {
      return [];
    }
    const arr = [];
    arrData.forEach(item => {
      // eslint-disable-next-line no-param-reassign
      delete item[childrenName];
      arr.push({
        ...item,
        title: item[childValueName],
        value: item[childKeyName],
        key: item[childKeyName],
      });
    });
    const result = [];
    const map = {};
    arr.forEach(item => {
      map[item[childKeyName]] = item;
    });
    arr.forEach(item => {
      const parent = map[item[parentKeyName]];
      if (parent) {
        (parent[childrenName] || (parent[childrenName] = [])).push(item);
      } else {
        result.push(item);
      }
    });
    return result;
  }

  @Bind()
  handleChangeModel() {
    const { form } = this.props;
    form.setFieldsValue({
      fieldCode: '',
      fieldAlias: '',
      fieldType: '',
      fieldName: '',
    });
  }

  render() {
    const {
      unitInfo = {},
      data = {},
      visible,
      readOnly,
      relationModals = [],
      renderOptions = [],
      condOptions = [],
      gridFixedOptions = [],
      aggregationGroup,
      dateFormat = [],
      widgetType,
      saveLoading,
      createFieldLoading,
      unitList,
      fieldList,
      form,
      uniqueUiFeatureMap,
    } = this.props;
    const { modelId } = data;
    const { paramVisible, confirmSaveProps } = this.state;
    const { id, unitType, modelCode, labelCode } = unitInfo;
    const isSeachBarType = unitType === 'SEARCHBAR';
    const isCreate = isEmpty(data) || !data.id;
    const title = isCreate ? getAddFieldAlias(unitType) : getEditFieldAlias(unitType);
    const DefaultProps = {
      data,
      modelId,
      modelCode,
      unitInfo,
      readOnly,
      dateFormat,
      widgetType,
      condOptions,
      gridFixedOptions,
      relationModals,
      aggregationGroup,
      renderOptions,
      handleChangeField: this.handleChangeField,
      toggleParamsModal: this.toggleParamsModal,
      onComponentChange: this.onComponentChange,
      renderOtherOptions: this.renderOtherOptions,
      changeMultipleFlag: this.changeMultipleFlag,
      getComponentWhereOption: this.getComponentWhereOption,
      changeFieldMergeFlag: this.changeFieldMergeFlag,
      handleChangeFieldNameType: this.handleChangeFieldNameType,
      handleChangeModel: this.handleChangeModel,
      form,
      uniqueUiFeatureMap,
      labelCode,
    };
    let ConfigContent = Default;
    switch (unitType) {
      case 'GRID':
        ConfigContent = TableField;
        break;
      case 'BTNGROUP':
        ConfigContent = BtnField;
        break;
      case 'COMMON':
        ConfigContent = CommonField;
        break;
      default:
    }
    return (
      <Drawer
        width={450}
        title={title}
        visible={visible}
        closable
        destroyOnClose
        wrapClassName={classnames({ [styles['searchBar-unit-drawer']]: isSeachBarType })}
        onClose={this.handleClose}
      >
        {visible && <ConfigContent {...DefaultProps} />}
        <div className={styles['model-bottom-button']}>
          <Button
            type="primary"
            htmlType="submit"
            loading={createFieldLoading || saveLoading || false}
            style={{ marginRight: 8 }}
            onClick={isCreate ? this.create : this.save}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button disabled={createFieldLoading || saveLoading || false} onClick={this.handleClose}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
        {paramVisible && (
          <ParamsModal
            type="unit"
            id={id}
            unitList={unitList}
            fieldList={fieldList}
            paramList={data.paramList}
            onSave={this.saveParamList}
            visible={paramVisible}
            onClose={this.toggleParamsModal}
          />
        )}
        {
          confirmSaveProps && (
            <Modal
              visible
              title={
                <span>
                  <Icon type="warning" style={{ color: "orange", verticalAlign: "text-top" }} />
                  {intl.get("hpfm.customize.common.confirmSaveField").d("确认继续保存字段")}
                </span>
              }
              okButtonProps={{loading: createFieldLoading || saveLoading || false}}
              onOk={confirmSaveProps.onOk}
              onCancel={confirmSaveProps.onCancel}
            >
              <div style={{maxWidth: "470px", wordBreak: "break-word"}}>
                {confirmSaveProps.message}
              </div>
            </Modal>
          )
        }
      </Drawer>
    );
  }
}
