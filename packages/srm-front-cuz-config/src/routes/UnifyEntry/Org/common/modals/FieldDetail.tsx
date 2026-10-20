/* eslint-disable no-nested-ternary */
import React, { createElement, createRef, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { toJS } from 'mobx';
import { Form, Button, TextField, IntlField, Lov, TreeSelect, Select, CheckBox, NumberField, Icon, Tooltip, Attachment, Spin, Output, Dropdown, Menu } from 'choerodon-ui/pro';
import { Text } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import { isEmpty, isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { Badge } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { TriggerViewMode } from 'choerodon-ui/pro/lib/trigger-field/enum';
import { ViewMode } from 'choerodon-ui/pro/lib/lov/enum';
import { RenderProps } from 'choerodon-ui/pro/lib/field/FormField';
import {
  queryConditions,
  queryFieldMapping,
} from '../../../../../services/customizeConfigService';
import {
  SEARCHBAR_RANGE_COMPONENT,
  SEARCHBAR_MUTLIPLE_COMPONENT,
  getParamsBtnName,
  limitDateFormatByColumnType,
  limitWidgetTypeByColumnType,
  READONLY_SEARCHBAR_UNIT_CODES,
  FIX_DATE_RANGES,
} from "../../../../../utils/constConfig";
import { openConditionModal } from '../modals';
import openComputeRule from './computeRuleModal';
import openParamsConfig from './paramsConfigModal';
import openRelatedConfig from './relatedConfigModal';
import createBOFieldModal from './createBOFieldModal';
import { ModalContext } from './fieldDetailModal';
import { getDefaultValueNode } from './defaultValueProModal';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';

import styles from "../styles.less";

const { Option } = Select;

const AnyButton: any = Button;
const AnyBadge: any = Badge;

const lovHelpIcon = <Icon type="help" style={{ fontWeight: 400, fontSize: "14px", verticalAlign: "text-bottom", color: "#cacaca", marginLeft: "4px" }} />;
export default observer<{
  modalContext: ModalContext
}>(function FieldDetail(props) {
  const [modalContext] = useMemo(() => [props.modalContext], []);
  const {
    modalVar, updateMode, createMode,
    options,
    impl: { ParamsConfigImpl, ComputeRuleImpl },
    utilsFunction, modalDs, originData,
  } = modalContext;
  const { unitInfoFun } = options || {};
  const unitCode = (unitInfoFun() ||{}).unitCode;
  const readOnlySearchBar = READONLY_SEARCHBAR_UNIT_CODES.includes(unitCode) && originData.custType === 'STD';
  const editable = updateMode || createMode;
  const [moreConfigVisible, setMoreConfigVisible] = useState(false);
  const [conditionData, _setConditionData] = useState({} as any);
  const [loading, setLoading] = useState(true);
  const {
    modelCode, mergeFlag, virtualFieldFlag,
    modelFieldFlag, aggregationFlag, renderOptions,
    fieldNameType,
    "widget.fieldWidget": fieldWidget,
    "widget.multipleFlag": multipleFlag,
    "widget.unitLovEnhanceFlag": unitLovEnhanceFlag,
    'widget.lovEnhanceFlag': lovEnhanceFlag,
    warnMessage, columnType,
    visibleModifyFlag = "1", requiredModifyFlag = "1", editableModifyFlag = "1"
  } = modalDs.current!.get([
    "aggregationFlag", "modelCode", "virtualFieldFlag",
    "renderOptions", "mergeFlag", "modelFieldFlag",
    "widget.fieldWidget", "widget.multipleFlag", "fieldNameType",
    'widget.unitLovEnhanceFlag', "columnType",
    'widget.lovEnhanceFlag',
    'warnMessage',
    "unitFieldEditable", "unitFieldVisible", "unitFieldRequired",
    "visibleModifyFlag", "requiredModifyFlag", "editableModifyFlag"
  ]);

  const visibleField = modalDs.current!.getField("visible");
  const requiredField = modalDs.current!.getField("fieldRequired");
  const editableField = modalDs.current!.getField("fieldEditable");
  const fieldCodeAlias = modalDs.current!.getField("fieldCodeAlias");
  const {
    isC7N, isH0, isGrid, unitType, changedFxFlag, isCForm, isExt, isGroupGrid,
    isInputUnit, isC7NTableBtn, isSeachBarType, showHiddenNumMark,
    tabPaneShowAggregation, sortedEditorFlag, sortedEnabled,
    showLabelWrapperCol, showWhereOptions, hasFx, forceVisibleWidget,
    hasHelpMessage, hasWidget, hasWidgetConfig, specialConfig,
    utilDataSet, defaultActiveVisible, noModelUnit, commonUnitTypeConfig,
    specialDisabledConfig,
  } = modalVar;
  const { fxFlag = {} } = originData;
  const isModelField = !virtualFieldFlag && !isNil(modelCode) && modelCode !== -1;
  const asText = renderOptions === "TEXT";
  const showAggregationFlag = (isC7N && isGrid && !isModelField) || unitType === 'BTNGROUP' || tabPaneShowAggregation || commonUnitTypeConfig.aggregationFlag;
  const showLandlineNumFlag = unitType !== 'COMMON';
  const showSetSelfValid = renderOptions !== "TEXT" && isInputUnit;
  const showComputeRule = renderOptions === "TEXT" && isInputUnit;
  const disabledHelpMessage = (isC7NTableBtn && fieldWidget) || (isSeachBarType && Number(mergeFlag) === 1);
  const visibleAggregation = ((isC7N && isGrid) || unitType === 'BTNGROUP' || tabPaneShowAggregation || commonUnitTypeConfig.aggregationCode) && !aggregationFlag;
  const hasCodeAlias = isModelField && modalDs.current!.get('modelSelect');
  const searchBarPlaceholderFlag = mergeFlag !== 1 &&
    (!fieldWidget ||
      fieldWidget === 'INPUT' ||
      (SEARCHBAR_RANGE_COMPONENT.includes(fieldWidget) &&
        Number(multipleFlag) !== 1));
  const searchBatMulitFlag =
    !fieldWidget || SEARCHBAR_MUTLIPLE_COMPONENT.includes(fieldWidget) || (fieldWidget === 'DATE_PICKER' && !(createMode ? isModelField : modelFieldFlag));
  // 范围日期显示筛选方式
  const searchBarWhereOptionsFlag =
    (createMode ? isModelField : modelFieldFlag) && (Number(multipleFlag) !== 1 || fieldWidget === 'DATE_PICKER') && !mergeFlag;
  const searchBarSortFlag = sortedEditorFlag === 1 && sortedEnabled !== 0;
  const searchBarMergeFlag =
    (createMode ? isModelField : modelFieldFlag) && (!fieldWidget || fieldWidget === 'INPUT');

  const setConditionData = useCallback((newData, type?) => {
    modalVar.innerDataRef.conditionData = newData;
    if (type) modalVar.changedFxFlag[type] = true;
    _setConditionData(newData);
  }, [_setConditionData]);

  const clearDefaultValueFx = useCallback(() => {
    const newData = {
      ...conditionData,
      defaultValue: undefined,
    };
    modalVar.innerDataRef.conditionData = newData;
    _setConditionData(newData);
  }, [_setConditionData, conditionData]);
  const commonParams = useMemo(() => ({
    ...options,
    conditionData,
    updateData: setConditionData,
    record: modalDs.current,
    readOnly: !updateMode,
  }), [conditionData]);

  const fieldNameFx = useCallback(() => openConditionModal({ ...commonParams, type: 'fieldName' }), [conditionData]);
  const helpMessageFx = useCallback(() => openConditionModal({ ...commonParams, type: 'helpMessage' }), [conditionData]);
  const visibleFx = useCallback(() => openConditionModal({ ...commonParams, type: 'visible' }), [conditionData]);
  const editableFx = useCallback(() => openConditionModal({ ...commonParams, type: 'editable' }), [conditionData]);
  const requiredFx = useCallback(() => openConditionModal({ ...commonParams, type: 'required' }), [conditionData]);
  const conValidFx = useCallback(() => openConditionModal({ ...commonParams, type: 'valid' }), [conditionData]);
  const defaultValueFx = useCallback(() => openConditionModal({ ...commonParams, type: 'defaultValue' }), [conditionData]);
  const attachmentTplFx = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    openConditionModal({ ...commonParams, type: 'attachment' });
  }, [conditionData]);
  const paramsConfigModal = useCallback(() => openParamsConfig(commonParams, ParamsConfigImpl), []);
  const relatedConfigModal = useCallback(() => openRelatedConfig(commonParams), []);
  const computeRuleModal = useCallback(() => openComputeRule(commonParams, ComputeRuleImpl), []);
  useEffect(() => {
    if (originData.configFieldId !== undefined) {
      const _commonParams = {
        configFieldId: originData.configFieldId,
        unitId: originData.unitId,
      };
      Promise.all([
        queryConditions(_commonParams).then((res) => {
          const conditionHeaders = getResponse(res);
          if (!conditionHeaders) return;
          const conditions = {
          };
          if (conditionHeaders instanceof Array) {
            conditionHeaders.forEach(d => {
              conditions[d.conType] = d;
            });
          }
          setConditionData(conditions);
        }),
        queryFieldMapping({ configFieldId: originData.configFieldId }).then(res => {
          if (!isEmpty(res)) {
            modalDs.current!.set("fieldLovMaps", res);
          }
        }),
      ]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);
  const {
    hasVisibleFx, hasEditableFx, hasRequiredFx,
    hasFieldNameFx, hasSelfValidFx, hasDefaultValueFx, hasHelpMessageFx, hasAttachmentTplFx,
  } = useMemo(() => {
    const {
      visible = {}, editable = {}, required = {},
      fieldName = {}, defaultValue = {}, valid = {}, helpMessage = {},
      attachment = {},
    } = conditionData;
    return {
      hasVisibleFx: changedFxFlag.visible ? (visible.lines || []).length : fxFlag.visible,
      hasEditableFx: changedFxFlag.editable ? (editable.lines || []).length : fxFlag.editable,
      hasRequiredFx: changedFxFlag.required ? (required.lines || []).length : fxFlag.required,
      hasFieldNameFx: (fieldName.lines || []).length || (fieldName.valids || []).length,
      hasHelpMessageFx: (helpMessage.lines || []).length || (helpMessage.valids || []).length,
      hasSelfValidFx: (valid.lines || []).length || (valid.valids || []).length,
      hasDefaultValueFx: (defaultValue.lines || []).length || (defaultValue.valids || []).length,
      hasAttachmentTplFx: (attachment.lines || []).length || (attachment.valids || []).length,
    };
  }, [
    conditionData,
    conditionData.visible, conditionData.editable, conditionData.required,
    conditionData.defaultValue, conditionData.valid, conditionData.fieldName, conditionData.helpMessage,
  ]);
  // 字段设为必输或fx必输时，若字段显示配置为否或fx，则提示
  const checkRequiredFieldVsisible =
    modalDs.current && ['-1', '0'].includes(modalDs.current.get('visible')) && (
      modalDs.current.get('fieldRequired') === '1' || hasRequiredFx
    );
  const moreFields = [
    isInputUnit && <Select name="encryptFlag" colSpan={4} />,
    isC7N && <TextField name="bindField" colSpan={4} />,
    isCForm && <CheckBox name="showFieldFlag" colSpan={4} />,
    showAggregationFlag && <CheckBox name="aggregationFlag" colSpan={4} />,
    visibleAggregation && <Select name="aggregationCode" colSpan={4} />,
    showHiddenNumMark && <CheckBox name="hiddenNumFlag" colSpan={4} />,
    showWhereOptions && <Select name="whereOption" optionsFilter={(recrod) => recrod && !FIX_DATE_RANGES.includes(recrod.get('value')) } colSpan={4} />,
    showLabelWrapperCol && (
      <>
        <NumberField name="labelCol" colSpan={2} />
        -
        <NumberField name="wrapperCol" colSpan={2} />
      </>
    ),
    showComputeRule && (
      <AnyButton
        name="setRenderRule"
        funcType={FuncType.link}
        color={ButtonColor.primary}
        icon="calculate"
        onClick={computeRuleModal}
        style={{ textAlign: "left" }}
        colSpan={4}
      >
        <Badge dot={modalDs.current!.get("renderRule")}>
          {intl.get('hpfm.individual.common.setComputeRule').d('计算规则配置')}
        </Badge>
      </AnyButton>
    ),
    specialConfig && (
      <Select multiple={!specialConfig.exclusion} colSpan={4} defaultValue={specialConfig.default} name="uiFeature">
        {specialConfig.list.map(l => <Select.Option value={l.value} disabled={specialDisabledConfig[l.value] && specialDisabledConfig[l.value] !== fieldCodeAlias}>{l.meaning}</Select.Option>)}
      </Select>
    )
  ].filter(Boolean);
  const addBasicFieldLovRef = useMemo(() => createRef<Lov>(), []);
  const addBOFieldLovRef = useMemo(() => createRef<Lov>(), []);
  const clickBasicAddField = useCallback(() => {
    utilDataSet.loadData([]);
    utilDataSet.create();

    if (addBasicFieldLovRef && addBasicFieldLovRef.current && addBasicFieldLovRef.current.modal) {
      addBasicFieldLovRef.current.modal.close();
    }
    if (addBOFieldLovRef && addBOFieldLovRef.current && !addBOFieldLovRef.current.modal) {
      addBOFieldLovRef.current.handleOpenModal();
    }

  }, []);
  const openCreateBOFieldModal = useCallback(() => {
    createBOFieldModal({ record: modalDs.current }, selectBoField);
  }, []);
  const selectBoField = useCallback((boLovRecord, data) => {
    const currentData = boLovRecord ? boLovRecord.toJSONData() : data;
    modalDs.current!.set("businessObjectField", currentData);
    modalDs.current!.set("fieldSelect", {
      fieldCode: currentData && currentData.inheritFieldCode,
      fieldCodeCamel: currentData && currentData.inheritFieldCode,
      fieldName: currentData && (currentData.inheritFieldName || currentData.remark || currentData.inheritFieldCode),
    });
    if (addBOFieldLovRef && addBOFieldLovRef.current && addBOFieldLovRef.current.modal) {
      addBOFieldLovRef.current.modal.close();
    }
    return true;
  }, []);
  const clearBoField = useCallback(() => {
    modalDs.current!.set("businessObjectField", undefined);
  }, []);
  const limitWidget = limitWidgetTypeByColumnType((columnType || "").toLowerCase());
  const whereOptionRender: any = ({ text, value }) => {
    const whereOptions = toJS(modalDs.current!.get('whereOptions')) || [];
    const isSelected = whereOptions.includes(value);
    const isDefault = whereOptions[0] === value;
    const isDatePicker = fieldWidget === 'DATE_PICKER';
    const isDevider = value === 'RANGE' || value === '<=';
    return (
      <>
        <div className={styles['where-option-item']}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Text>{text}</Text>
            {isDefault && (
              <span className={styles['where-option-item-default']}>{intl.get('hzero.common.status.default').d('默认')}</span>
            )}
          </div>
          {isSelected && !isDefault && (
            <div onClick={event => event.stopPropagation()}>
              <Dropdown
                overlay={(
                  <Menu
                    onClick={({ key }) => {
                      if (key === 'default') {
                        modalDs.current!.set('whereOptions', [value].concat(whereOptions.filter(i => i !== value)));
                      }
                    }}
                  >
                    <Menu.Item key="default">
                      {intl.get('hpfm.individuationUnit.button.setDefault').d('设为默认')}
                    </Menu.Item>
                  </Menu>
                )}
              >
                <Icon type="more_horiz" className={styles['where-option-item-menu']} />
              </Dropdown>
            </div>
          )}
        </div>
        {isDatePicker && isDevider && (
          <div style={{ position: 'absolute', height: '1px', width: '100%', backgroundColor: '#eee', marginLeft: '-16px', bottom: 0 }} />
        )}
      </>
    );
  };
  const uiFields = [
    (hasWidget || forceVisibleWidget || unitType === "COMMON") && (
      <Select
        colSpan={4}
        newLine={!isSeachBarType}
        name='widget.fieldWidget'
        onOption={(option) => utilsFunction.onWidgetOptions(option, { isH0 })}
        optionsFilter={utilsFunction.widgetOptionsFilter}
        addonAfter={
          fieldWidget && limitWidget.length && !limitWidget.includes(fieldWidget) && (
            <Tooltip title={intl.get("hpfm.customize.common.fieldWidgetMayNotMatch").d("当前组件类型可能与字段类型不匹配")}>
              <Icon type="help" />
            </Tooltip>
          )
        }
        help={fieldWidget === 'TEL_FIELD' && intl.get('hpfm.customize.view.message.telField.help').d('仅支持C7N页面使用，H0页面无效')}
        showHelp={ShowHelp.newLine}
      />
    ),
    fieldWidget === 'TEL_FIELD' && showLandlineNumFlag && (
      <Select name='widget.landlineNumFlag' showHelp={ShowHelp.tooltip} colSpan={4} />
    ),
    defaultActiveVisible && !aggregationFlag && (
      <Select name="defaultActive" colSpan={4} optionsFilter={(r2) => fx3OptionsFilter(r2, isExt)} />
    ),
    hasWidgetConfig && getWidgetConfigList(modalContext, {
      asText, hasDefaultValueFx, hasAttachmentTplFx,
      defaultValueFx, paramsConfigModal, relatedConfigModal, clearDefaultValueFx,
      attachmentTplFx,
    }),
    unitType === "SECTION" && !isExt && <TextField name="relatedUnitName" colSpan={4} newLine />,
    isSeachBarType && (
      <>
        {['LOV', 'SELECT'].includes(fieldWidget) && (
          <Lov
            disabled={!editable || readOnlySearchBar}
            name='widget.sourceCode'
            colSpan={4}
          />
        )}
        {['LOV', 'SELECT'].includes(fieldWidget) && (
          <AnyButton
            name="setLovParam"
            colSpan={2}
            newLine
            icon="predefine"
            color={ButtonColor.primary}
            funcType={FuncType.link}
            style={{ textAlign: "left" }}
            onClick={paramsConfigModal}
          >
            <Badge dot={(modalDs.current!.get("paramList") || []).length} className='lov-param-set'>
              {getParamsBtnName(fieldWidget)}
            </Badge>
          </AnyButton>
        )}
        {fieldWidget === 'LOV' && <TextField name='displayField' colSpan={4} newLine  disabled={!editable || readOnlySearchBar} />}
        {fieldWidget === 'LOV' && <TextField name='valueField' colSpan={4}  disabled={!editable || readOnlySearchBar} />}
        {fieldWidget === 'DATE_PICKER' && <Select name='widget.dateFormat' colSpan={4}  disabled={!editable || readOnlySearchBar} />}
        {searchBarPlaceholderFlag && <IntlField name="backgroundText" colSpan={4}  disabled={!editable || readOnlySearchBar} />}
        {unitLovEnhanceFlag === 1 && fieldWidget === 'LOV' && isSeachBarType && originData.custType && isModelField && <Select 
          name='widget.lovEnhanceFlag'
          colSpan={4}
          clearButton={false}
          disabled={!editable || readOnlySearchBar}
        />}
        {searchBarSortFlag && (
          <Select
            newLine={fieldWidget === 'SELECT'}
            name='sortedFlag'
            showHelp={ShowHelp.tooltip}
            colSpan={4}
            optionsFilter={utilsFunction.sortedFlagFilter}
            disabled={!editable || readOnlySearchBar}
          />
        )}
        {searchBatMulitFlag && lovEnhanceFlag !== 1 && (
          <Select
            label={
              // eslint-disable-next-line no-nested-ternary
              modalDs.current!.get('widget.fieldWidget') === 'INPUT_NUMBER' ?
                intl.get('hpfm.individuationUnit.model.individuationUnit.rangeNumber').d('范围数值')
                : modalDs.current!.get('widget.fieldWidget') === 'DATE_PICKER' ?
                  intl.get('hpfm.individuationUnit.model.individuationUnit.range').d('范围时间')
                  : intl.get('hpfm.individuationUnit.model.individuationUnit.mutilFlag').d('多选')
            }
            name='widget.multipleFlag'
            colSpan={4}
            clearButton={false}
            disabled={!editable || readOnlySearchBar}
          />
        )}
        {searchBarWhereOptionsFlag && lovEnhanceFlag !== 1 && (
          <Select
            name='whereOptions'
            colSpan={8}
            newLine
            showHelp={ShowHelp.tooltip}
            optionsFilter={utilsFunction.whereOptionsFilter}
            disabled={!editable || readOnlySearchBar}
            optionRenderer={whereOptionRender}
            popupCls={styles['where-option-select']}
          />
        )}
        <CheckBox
          name='fieldEditable'
          label={intl.get('hpfm.individual.model.config.editableFlag').d('可编辑')}
          colSpan={2}
          newLine
          disabled={!editable}
          style={{ marginTop: '-8px' }}
        />
        <CheckBox
          name='visible'
          colSpan={2}
          disabled={!editable}
          style={{ marginTop: '-8px' }}
        />
        {searchBarMergeFlag && (
          <CheckBox
            name='mergeFlag'
            colSpan={2}
            disabled={!editable}
            style={{ marginTop: '-8px' }}
          />
        )}
      </>
    ),
  ].filter(Boolean);
  return (
    <Spin spinning={loading}>
      <div style={{ display: "none" }}>
        <Lov
          icon="playlist_add"
          mode={ViewMode.button}
          viewMode={TriggerViewMode.drawer}
          name="selectBOField"
          dataSet={utilDataSet}
          clearButton={false}
          ref={addBOFieldLovRef}
          onBeforeSelect={selectBoField as any}
          modalProps={{ drawerOffset: 150, style: { width: "7.5rem" } }}
          tableProps={{
            buttons: [
              <Button
                onClick={openCreateBOFieldModal}
                icon="playlist_add"
              >
                {intl.get("hpfm.customize.common.addExtField").d("新建扩展字段")}
                <Tooltip title={intl.get("hpfm.customize.common.addBusinessObjFieldHelp").d("点击添加业务对象下未定义的字段")}>
                  {lovHelpIcon}
                </Tooltip>
              </Button>,
            ],
          }}
        />
      </div>
      {warnMessage && Object.keys(warnMessage).length && (
        <div className={styles['alert-error']}>
          <Icon type="cancel" style={{ float: 'left' }} />
          {Object.keys(warnMessage).map((k) => (
            <p>{warnMessage[k]}</p>
          ))}
        </div>
      )}
      <div className='with-prefix-title lower-blue'>{intl.get('hpfm.doc.common.basicInfo').d('基础信息')}</div>
      <Form dataSet={modalDs} labelLayout={LabelLayout.float} columns={3}>
        {!noModelUnit ? createMode ? (
          <TreeSelect
            name="modelSelect"
            treeDefaultExpandAll
            onOption={({ record }) => { return { disabled: record && record.get("disabled") };}}
            onChange={clearBoField}
            renderer={({ text, value }) => {
              if (value == text) return '';
              return text;
            }}
          />
        ) : <TextField name="field.modelName" />  : null}
        {!noModelUnit && createMode && modalDs.current!.get('modelSelect') && (
          <Lov
            name="fieldSelect"
            noCache
            viewMode={TriggerViewMode.drawer}
            modalProps={{ drawerOffset: 150, style: { width: "7.5rem" } }}
            tableProps={{
              buttons: [
                <Button
                  onClick={clickBasicAddField}
                  icon="playlist_add"
                >
                  {intl.get("hpfm.customize.common.addField").d("添加字段")}
                  <Tooltip title={intl.get("hpfm.customize.common.combineBusinessObjFieldHelp").d("点击添加组合业务对象下未定义的字段")}>
                    {lovHelpIcon}
                  </Tooltip>
                </Button>,
              ],
            }}
            onChange={clearBoField}
            ref={addBasicFieldLovRef}
          />
        )}
        <TextField name="fieldCode" />
        {hasCodeAlias && <TextField name="fieldCodeAlias" />}
        <Select name="fieldNameType" clearButton={false}>
          {originData.custType === 'STD' && <Option value="EXTEND">{intl.get('hpfm.individual.view.option.platformPreDefine').d('平台预定义')}</Option>}
          {isModelField && <Option value="MODEL">{intl.get('hpfm.individual.view.option.model').d('模型')}</Option>}
          <Option value="CUSTOMIZE">{intl.get('hpfm.individual.view.option.customize').d('自定义')}</Option>
        </Select>
        {fieldNameType !== "CUSTOMIZE"
          ? <TextField name="fieldName" renderer={fieldNameRender} />
          : (
            <IntlField
              name="fieldName"
              addonAfter={
                hasFx && !isSeachBarType && unitType !== 'BTNGROUP' && (
                  <Badge dot={hasFieldNameFx}>
                    <Button funcType={FuncType.link} color={ButtonColor.primary} className="fx" onClick={fieldNameFx}>fx</Button>
                  </Badge>
                )
              }
              renderer={fieldNameRender}
            />
          )
        }
        {hasHelpMessage && !disabledHelpMessage && (
          <IntlField
            name="helpMessage"
            addonAfter={
              hasFx && !isSeachBarType && (
                <Badge dot={hasHelpMessageFx}>
                  <Button funcType={FuncType.link} color={ButtonColor.primary} className="fx" onClick={helpMessageFx}>fx</Button>
                </Badge>
              )
            }
          />
        )}
        {!createMode && <Select name="custType" />}
      </Form>
      <div className='with-prefix-title lower-blue has-margin-top'>{intl.get('hpfm.doc.common.layout').d('布局')}</div>
      <Form dataSet={modalDs} labelLayout={LabelLayout.float} columns={12} className={styles['layout-form']}>
        {["FORM", "QUERYFORM", "WORKFLOW"].includes(unitType) ? (
          <>
            <NumberField name="formRow" colSpan={2} />
            <NumberField name="formCol" colSpan={2} />
            <NumberField name="rowSpan" colSpan={2} />
            <NumberField name="colSpan" colSpan={2} />
          </>
        ) : (
          <>
            <NumberField name="gridSeq" colSpan={4} />
            {isGroupGrid && <NumberField name="formCol" colSpan={4} />}
            {isGrid && <NumberField name="gridWidth" colSpan={4} />}
            {isGrid && <Select name="gridFixed" colSpan={4} />}
            {commonUnitTypeConfig.colSpan && <NumberField name="colSpan" colSpan={4} />}
          </>
        )}
        {unitType === "GRID" && (
          <CheckBox name="sorter" colSpan={4} labelLayout={LabelLayout.none}>
            {intl.get('hpfm.individual.model.config.sorter').d('可排序')}
            <Tooltip title={intl.get('hpfm.customize.common.disabled.sorter').d("该配置项不可用，未来将会逐步删除此配置项")}>
              <Icon type="help" style={{ fontWeight: 400, fontSize: "14px", verticalAlign: "text-bottom", color: "#cacaca", marginLeft: "4px" }} />
            </Tooltip>
          </CheckBox>
        )}
        {hasWidget && isInputUnit && <Select colSpan={4} newLine name="renderOptions" />}
        {showSetSelfValid && (
          <AnyButton
            name="setSelfValids"
            funcType={FuncType.link}
            onClick={conValidFx}
            color="primary"
            icon="predefine"
            colSpan={4}
            block
            style={{ textAlign: "left" }}
          >
            <Badge dot={hasSelfValidFx}>
              {intl.get('hpfm.individual.model.config.selfRule').d('自定义校验')}
            </Badge>
          </AnyButton>
        )}
        {!isSeachBarType && (
          <Select
            colSpan={4}
            newLine
            name="visible"
            clearButton={false}
            help={checkRequiredFieldVsisible && intl.get("hpfm.customize.help.required.confirmChange").d('当前字段已配置必输，建议”显示“配置设置为”是“')}
            showHelp={ShowHelp.newLine}
            disabled={hasFx && hasVisibleFx}
            renderer={(({ text }) => hasFx && hasVisibleFx ? "fx" : text)}
            addonAfter={
              hasFx && (
                <Badge dot={hasVisibleFx}>
                  <Button
                    funcType={FuncType.link}
                    color={ButtonColor.primary}
                    className="fx"
                    onClick={visibleFx}
                    disabled={visibleField!.get("disabled")}
                  >
                    fx
                  </Button>
                </Badge>
              )
            }
          />
        )}
        {!asText && isInputUnit && (
          <>
            <Select
              colSpan={4}
              name="fieldEditable"
              clearButton={false}
              disabled={hasFx && hasEditableFx}
              optionsFilter={(r2) => fx3OptionsFilter(r2, isExt)}
              renderer={(({ text }) => hasFx && hasEditableFx ? "fx" : text)}
              addonAfter={
                hasFx && (
                  <Badge dot={hasEditableFx}>
                    <Button
                      funcType={FuncType.link}
                      color={ButtonColor.primary}
                      className="fx"
                      onClick={editableFx}
                      disabled={editableField!.get("disabled")}
                    >
                      fx
                    </Button>
                  </Badge>
                )
              }
            />
            <Select
              colSpan={4}
              name="fieldRequired"
              clearButton={false}
              optionsFilter={(r2) => fx3OptionsFilter(r2, isExt)}
              disabled={hasFx && hasRequiredFx}
              renderer={(({ text }) => hasFx && hasRequiredFx ? "fx" : text)}
              addonAfter={
                hasFx && (
                  <Badge dot={hasRequiredFx}>
                    <Button
                      funcType={FuncType.link}
                      color={ButtonColor.primary}
                      className="fx"
                      onClick={requiredFx}
                      disabled={requiredField!.get("disabled")}
                    >
                      fx
                    </Button>
                  </Badge>
                )
              }
            />
          </>
        )}
        {originData.custType === 'STD' && createElement(
          'div',
          { newLine: true, colSpan: 4, name: 'forVisible', className: 'field-below-box' },
          [
            !visibleModifyFlag && (
              <span>{intl.get('hpfm.customize.common.notModify').d('已设置租户级不可修改')};</span>
            ),
          ]
        )}
        {originData.custType === 'STD' && !asText && isInputUnit && createElement(
          'div',
          { colSpan: 4, name: 'forEditable', className: 'field-below-box' },
          [
            !editableModifyFlag && (
              <span>{intl.get('hpfm.customize.common.notModify').d('已设置租户级不可修改')};</span>
            ),
          ]
        )}
        {originData.custType === 'STD' && !asText && isInputUnit && createElement(
          'div',
          { colSpan: 4, name: 'forRequired', className: 'field-below-box' },
          [
            !requiredModifyFlag && (
              <span>{intl.get('hpfm.customize.common.notModify').d('已设置租户级不可修改')};</span>
            ),
          ]
        )}
      </Form>
      {
        !!uiFields.length && (
          <>
            <div className='with-prefix-title lower-blue has-margin-top'>{intl.get('hpfm.doc.common.widgetProps').d('组件属性')}</div>
            <Form
              dataSet={modalDs}
              labelLayout={LabelLayout.float}
              columns={isSeachBarType ? 8 : 12} 
              style={{ width: isSeachBarType ? '66.66%' : '100%'}}
            >
              {uiFields}
            </Form>
          </>
        )
      }
      {
        moreFields.length > 0 && (
          <div className='with-prefix-title lower-blue has-margin-top more-field-config-list' onClick={() => setMoreConfigVisible(!moreConfigVisible)}>
            {intl.get("hpfm.doc.common.moreProperties").d("更多属性")}
            <Icon type={moreConfigVisible ? "expand_less" : "expand_more"} style={{ fontWeight: 400, marginLeft: "8px" }} />
          </div>
        )
      }
      {moreConfigVisible && (
        <Form dataSet={modalDs} labelLayout={LabelLayout.float} columns={12}>
          {moreFields}
        </Form>
      )}
    </Spin>
  );
});


function getWidgetConfigList(modalContext: ModalContext, runtimeContext) {
  const {
    asText, paramsConfigModal, relatedConfigModal, clearDefaultValueFx,
    hasDefaultValueFx, defaultValueFx, attachmentTplFx, hasAttachmentTplFx,
  } = runtimeContext;
  const { modalDs, modalVar, options } = modalContext;
  const record = modalDs.current!;
  const {
    id: unitId, hasFx,
    unitType, isExt, isC7N, isH0, isGrid
  } = modalVar;
  const defaultExpTemplateParams = { ...options.subModalCommonParams, isTemplate: options.isTemplate };
  const columnType = (record.get("columnType") || "").toLowerCase();
  const limitDateFormat = limitDateFormatByColumnType(columnType);
  const defaultValueFxNode = hasFx && React.createElement(AnyBadge, {
    dot: hasDefaultValueFx,
    name: "__default_value_fx__",
  }, <Button funcType={FuncType.link} color={ButtonColor.primary} className="fx" onClick={defaultValueFx}>fx</Button>);
  const attachmentTplFxNode = hasFx && React.createElement(AnyBadge, {
    dot: hasAttachmentTplFx,
    name: "__attachment_tpl_fx__",
    className: "attachment-tpl-fx",
  }, <Button funcType={FuncType.link} color={ButtonColor.primary} className="fx link-fx" onClick={attachmentTplFx}>fx</Button>);
  const { "widget.fieldWidget": widgetType, "widget.linkType": linkType } = record.get(["widget.fieldWidget", "widget.linkType"]);
  const showBucketName = widgetType === "UPLOAD" || widgetType === "LINK" && linkType === "attachment";
  const showLinkNewWindow = widgetType === "LINK" && linkType === "none";
  const configList: ReactElement[] = [
    !asText && <IntlField name="placeholder" colSpan={4} />,
    <Select name="widget.trimFlag" colSpan={4} clearButton={false} />,
    <Lov name="sourceCodeObject" colSpan={4} newLine />,
    <NumberField name="widget.textMaxLength" colSpan={4} newLine />,
    <NumberField name="widget.textMinLength" colSpan={4} />,
    <Select name="widget.autoCast" colSpan={4} />,
    <NumberField name="widget.numberMax" colSpan={4} newLine />,
    <NumberField name="widget.numberMin" colSpan={4} />,
    <NumberField name="widget.numberDecimal" colSpan={4} newLine disabled={columnType && ["bigint", "int", "mediumint", "tinyint", "smallint", "integer"].includes(columnType)} />,
    <Select
      name="widget.dateFormat"
      colSpan={4}
      onOption={({record: r}) => {
        let disabled = false;
        if (!limitDateFormat || !limitDateFormat.length || limitDateFormat.includes(r.get("value"))) disabled = false;
        else disabled = true
        return { disabled, style: disabled ? { backgroundColor: "#f7f8fa" } : undefined }
      }}
    />,
    <NumberField name="widget.textAreaMaxLine" colSpan={4} />,
    <IntlField name="linkTitle" colSpan={4} newLine />,
    <Select name="widget.linkType" colSpan={4} />,
    showLinkNewWindow && <CheckBox name="widget.linkNewWindow" colSpan={4} />,
    <TextField name="widget.linkHref" colSpan={8} newLine />,
    record && !!record.get('widget.fileFormat') && record.get('widget.fileFormat').length && <TextField name='widget.fileFormat' maxTagCount={100} colSpan={4} />,
    showBucketName && (
      <Select
        name="widget.bucketName"
        colSpan={4}
        clearButton={record.get('custType') === 'STD'}
        newLine
        showHelp={ShowHelp.tooltip}
        onOption={({record: r}) => ({ disabled: r.get("value") !== "private-bucket" })}
        help={(
          <div style={{width: "200px"}}>
            <div>1&#41;&nbsp;{intl.get("hpfm.customize.help.bucketName.public").d("公开桶：存储在公开桶中的文件，无需进行安全校验，只要获取到文件链接即可访问，存在一定的安全隐患")}</div>
            <div>2&#41;&nbsp;{intl.get("hpfm.customize.help.bucketName.private").d("私有桶：存储在私有桶中的文件，即使获取到了文件链接依旧需要通过鉴权后才允许访问，安全性较高。")}</div>
            <div>{intl.get("hpfm.customize.help.bucketName.ifChange").d("若要调整配置，建议咨询功能模块辅助判断是否可行")}</div>
          </div>
        ) as any}
      />
    ),
    createElement('div', {
      name: "widget.attachmentTemplate",
      colSpan: 4,
    }, (
      <div style={{ display: 'flex', alignItems: "center" }}>
        <Attachment name="widget.attachmentTemplate" colSpan={4} labelLayout={LabelLayout.none} viewMode="popup" funcType={FuncType.link}>
          <span className='attachment-tpl-text'>{intl.get('hpfm.customize.common.attachmentTemplate').d('上传附件模版')}</span>
        </Attachment>
        {attachmentTplFxNode}
      </div>
    )),
    <CheckBox name="widget.allowThousandth" colSpan={4} />,
    <Select
      name="widget.multipleFlag"
      colSpan={4}
      clearButton={false}
      addonAfter={widgetType === "LOV" && (
        <Tooltip title={intl.get("hpfm.customize.common.multipleFlagMayNotMatch").d("保留原有逻辑下，如果字段本身可能是多选，请勿配置关联字段设置")}>
          <Icon type="help" />
        </Tooltip>
      )}
    />,
    <AnyButton
      name="setLovParam"
      colSpan={4}
      newLine
      icon="predefine"
      color={ButtonColor.primary}
      funcType={FuncType.link}
      style={{ textAlign: "left" }}
      onClick={paramsConfigModal}
    >
      <Badge dot={(record.get("paramList") || []).length} className='lov-param-set'>
        {getParamsBtnName(widgetType)}
      </Badge>
    </AnyButton>,
    <AnyButton
      name="setRelateFields"
      colSpan={4}
      icon="swap_horiz"
      color={ButtonColor.primary}
      funcType={FuncType.link}
      onClick={relatedConfigModal}
      style={{ textAlign: "left" }}
      disabled={record.getField("setRelateFields")!.get("disabled")}
    >
      <Badge dot={(record.get("fieldLovMaps") || []).length}>
        {intl.get('hpfm.individual.model.config.fieldMapping').d('关联字段设置')}
      </Badge>
    </AnyButton>,
    ...getDefaultValueNode(widgetType, record, { unitId, defaultExpTemplateParams, defaultValueFxNode, clearDefaultValueFx, isC7N, isH0 }),
    <NumberField name="widget.modalWidth" colSpan={4} />,
    <CheckBox name="widget.includeNowDayFlag" colSpan={4} />,
    unitType !== 'GRID' && <CheckBox name="widget.uploadShowFlag" colSpan={4} />,
    <Select
      name="widget.attachmentType"
      colSpan={4}
      clearButton={false}
    />,
    !isH0 && (
      <NumberField
        name="widget.attachmentLimitNum"
        colSpan={4}
      />
    ),
    <Select
      name="widget.breakpointResumeFlag"
      colSpan={4}
      clearButton={false}
    />,
    <Select
      name="widget.uploadRecordFlag"
      colSpan={4}
      clearButton={false}
    />,
    <Select
      name="widget.autoDisabledDate"
      colSpan={4}
      clearButton={false}
    />,
    <CheckBox
      name='widget.supplementZero'
      colSpan={4}
    />
  ].filter(Boolean) as ReactElement[];
  if (["TABPANE", "COLLAPSE", "SECTION"].includes(unitType)) {
    if (record.get("custType") !== "STD" && !record.get("aggregationFlag")) {
      return configList.filter(node => { const matchName = node.props.name.replace("widget.", ""); return ["linkHref"].includes(matchName); });
    }
    return [];
  }
  let filterArr: any[] = [];
  switch (widgetType) {
    case 'INPUT': filterArr = ["placeholder", "textMaxLength", "textMinLength", "defaultValue", isC7N && "autoCast", "trimFlag"]; break;
    case 'TEXT_AREA': filterArr = ["placeholder", "textMaxLength", "textMinLength", "textAreaMaxLine", "defaultValue"]; break;
    case 'CURRENCY':
    case 'INPUT_NUMBER': filterArr = ["placeholder", "numberMax", "numberMin", "numberDecimal", "allowThousandth", "defaultValue", !isH0 && "supplementZero"]; break;
    case 'DATE_PICKER': filterArr = ["placeholder", "dateFormat", "includeNowDayFlag", "defaultValue", "autoDisabledDate", "setLovParam"]; break;
    case 'LINK': filterArr = ["linkType", "linkTitle", "linkHref", "bucketName", "modalWidth", "linkNewWindow"]; break;
    case 'UPLOAD': filterArr = ["fileFormat", "bucketName", "attachmentTemplate", "__attachment_tpl_fx__", "uploadShowFlag", 'uploadRecordFlag', isExt && isC7N && unitType === "FORM" && "attachmentType", "attachmentLimitNum", "breakpointResumeFlag"]; break;
    case 'SWITCH':
    case 'CHECKBOX': filterArr = ["defaultValue"]; break;
    case 'LOV': filterArr = ["multipleFlag", "sourceCodeObject", "placeholder", "setLovParam", "setRelateFields", "defaultValue"]; break;
    case 'SELECT': filterArr = ["multipleFlag", "sourceCodeObject", "placeholder", "setLovParam", "defaultValue"]; break;
    case 'RADIOGROUP': filterArr = ["multipleFlag", "sourceCodeObject", "placeholder", "setLovParam", "defaultValue"]; break;
    case 'TEL_FIELD': filterArr = ["defaultValue"]; break;
    case 'EMAIL_FIELD': filterArr = ["placeholder", "defaultValue"]; break;
    default: ;
  }
  let whiteList = [
    "__default_value_fx__", "proDefaultFlag", isH0 ? "" : "defaultValueReplaceFlag",
  ];
  // 审批表单类型的单元，限制组件配置能力，仅保留值集编码、多选
  if (unitType === "COMMON") {
    whiteList = [];
    filterArr = filterArr.filter(i => ["multipleFlag", "sourceCodeObject"].includes(i));
  }
  return configList.filter(node => {
    const matchName = node.props.name.replace("widget.", "");
    return filterArr.includes("defaultValue") && whiteList.includes(matchName) || filterArr.includes(matchName);
  });
}

function fieldNameRender({ record: r }: RenderProps) {
  const {
    fieldName,
    fieldNameType,
    extendFieldName = fieldName, /** 添加和编辑场景不同，添加时这两个字段无值，需要使用fieldName */
    modelFieldName = fieldName,
  } = r!.get(["fieldNameType", "extendFieldName", "modelFieldName", "fieldName"]);
  switch (fieldNameType) {
    case "EXTEND": return extendFieldName;
    case "MODEL": return modelFieldName;
    case "CUSTOMIZE":
    default: return fieldName;
  }
}

// 过滤保留原有逻辑
const fx3OptionsFilter = (record, filter) => {
  if (!filter) return true;
  // eslint-disable-next-line eqeqeq
  return record.get("value") != -1;
};
