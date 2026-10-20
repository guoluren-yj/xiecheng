/* eslint-disable no-nested-ternary */
import React, { createElement, createRef, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Button, Icon, Tooltip, Attachment, Spin, Output } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { isEmpty, isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { Badge, Alert } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { RenderProps } from 'choerodon-ui/pro/lib/field/FormField';
import {
  queryConditions,
  queryFieldMapping,
} from '../../../../../services/customizeConfigService';
import {
  SEARCHBAR_RANGE_COMPONENT,
  SEARCHBAR_MUTLIPLE_COMPONENT,
  getParamsBtnName,
  limitWidgetTypeByColumnType,
} from "../../../../../utils/constConfig";
import { openConditionModal } from '../modals';
import openComputeRule from './computeRuleModal';
import openParamsConfig from './paramsConfigModal';
import openRelatedConfig from './relatedConfigModal';
import { ModalContext } from './fieldDetailModal';
import { getDefaultValueNode } from './defaultValueProModal';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';

import styles from "../styles.less";

const AnyButton: any = Button;
const AnyBadge: any = Badge;

export default observer<{
  modalContext: ModalContext
}>(function FieldDetailReadOnly(props) {
  const [modalContext] = useMemo(() => [props.modalContext], []);
  const {
    modalVar, createMode,
    options,
    impl: { ParamsConfigImpl, ComputeRuleImpl },
     modalDs, originData,
  } = modalContext;
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

  const {
    isC7N, isGrid, unitType, changedFxFlag, isCForm, isExt, isGroupGrid,
    isInputUnit, isC7NTableBtn, isSeachBarType, showHiddenNumMark,
    tabPaneShowAggregation, sortedEditorFlag, sortedEnabled,
    showLabelWrapperCol, showWhereOptions, hasFx, forceVisibleWidget,
    hasHelpMessage, hasWidget, hasWidgetConfig, specialConfig,
    defaultActiveVisible, noModelUnit, commonUnitTypeConfig,
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
    !fieldWidget || SEARCHBAR_MUTLIPLE_COMPONENT.includes(fieldWidget);
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
  }, [_setConditionData]);
  const commonParams = useMemo(() => ({
    ...options,
    conditionData,
    updateData: setConditionData,
    record: modalDs.current,
    readOnly: true,
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
  const moreFields = [
    isInputUnit && <Output name="encryptFlag" colSpan={4} />,
    isC7N && <Output name="bindField" colSpan={4} />,
    isCForm && <Output name="showFieldFlag" colSpan={4} />,
    showAggregationFlag && <Output name="aggregationFlag" colSpan={4} />,
    visibleAggregation && <Output name="aggregationCode" colSpan={4} />,
    showHiddenNumMark && <Output name="hiddenNumFlag" colSpan={4} />,
    showWhereOptions && <Output name="whereOption" colSpan={4} />,
    showLabelWrapperCol && (
      <>
        <Output name="labelCol" colSpan={2} />
        -
        <Output name="wrapperCol" colSpan={2} />
      </>
    ),
    showComputeRule && (
      <Output
        label={intl.get('hpfm.individual.common.setComputeRule').d('计算规则配置')}
        name="setRenderRule"
        colSpan={4}
        renderer={() => (
          <a onClick={computeRuleModal}>
            <Icon type='calculate'/>
            <Badge dot={modalDs.current!.get("renderRule")}>
              {intl.get("hzero.common.button.view").d("查看")}
            </Badge>
          </a>
        )}
      />
    ),
    specialConfig && (
      <Output
        colSpan={4}
        defaultValue={specialConfig.default}
        name="uiFeature"
        renderer={({ value }) => ((specialConfig.list || []).find(l => l.value === value) || {}).meaning || value}
      />
    )
  ].filter(Boolean);
  const limitWidget = limitWidgetTypeByColumnType((columnType || "").toLowerCase());
  const uiFields = [
    (hasWidget || forceVisibleWidget || unitType === "COMMON") && (
      <Output
        colSpan={4}
        newLine
        name='widget.fieldWidget'
        renderer={(({ text }) => (
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            {text || '-'}
            {fieldWidget && !!limitWidget.length && !limitWidget.includes(fieldWidget) && (
              <Tooltip title={intl.get("hpfm.customize.common.fieldWidgetMayNotMatch").d("当前组件类型可能与字段类型不匹配")}>
                <Icon type="help" />
              </Tooltip>
            )}
          </span>
        ))}
        help={fieldWidget === 'TEL_FIELD' && intl.get('hpfm.customize.view.message.telField.help').d('仅支持C7N页面使用，H0页面无效')}
        showHelp={ShowHelp.newLine}
      />
    ),
    fieldWidget === 'TEL_FIELD' && showLandlineNumFlag && (
      <Output name='widget.landlineNumFlag' showHelp={ShowHelp.tooltip} colSpan={4} />
    ),
    defaultActiveVisible && !aggregationFlag && (
      <Output name="defaultActive" colSpan={4} />
    ),
    hasWidgetConfig && getWidgetConfigList(modalContext, {
      asText, hasDefaultValueFx, hasAttachmentTplFx,
      defaultValueFx, paramsConfigModal, relatedConfigModal, clearDefaultValueFx,
      attachmentTplFx,
    }),
    unitType === "SECTION" && !isExt && <Output name="relatedUnitName" colSpan={4} newLine />,
    isSeachBarType && (
      <>
        {['LOV', 'SELECT'].includes(fieldWidget) && (
          <Output
            name='widget.sourceCode'
            colSpan={4}
            newLine
          />
        )}
        {fieldWidget === 'LOV' && <Output name='displayField' colSpan={4} newLine />}
        {fieldWidget === 'LOV' && <Output name='valueField' colSpan={4} newLine />}
        {fieldWidget === 'DATE_PICKER' && <Output name='widget.dateFormat' colSpan={4} newLine />}
        {searchBarPlaceholderFlag && <Output name="backgroundText" colSpan={4} newLine />}
        {unitLovEnhanceFlag === 1 && fieldWidget === 'LOV' && isSeachBarType && originData.custType && isModelField && <Output 
          name='widget.lovEnhanceFlag'
          colSpan={4}
          newLine
        />}
        {searchBarSortFlag && (
          <Output
            name='sortedFlag'
            colSpan={4}
            newLine
          />
        )}
        {searchBatMulitFlag && lovEnhanceFlag !== 1 && (
          <Output
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
            newLine
          />
        )}
        {searchBarWhereOptionsFlag && lovEnhanceFlag !== 1 && (
          <Output
            name='whereOptions'
            colSpan={4}
            newLine
            style={{ marginTop: '-8px' }}
          />
        )}
        <Output
          name='fieldEditable'
          label={intl.get('hpfm.individual.model.config.editableFlag').d('可编辑')}
          colSpan={4}
          newLine
          style={{ marginTop: '-8px' }}
        />
        <Output
          name='visible'
          colSpan={4}
          style={{ marginTop: '-16px' }}
        />
        {searchBarMergeFlag && (
          <Output
            name='mergeFlag'
            colSpan={4}
            style={{ marginTop: '-16px' }}
          />
        )}
      </>
    ),
  ].filter(Boolean);
  return (
    <Spin spinning={loading}>
      {warnMessage && Object.keys(warnMessage).length && (
        <div className={styles['alert-error']}>
          <Icon type="cancel" style={{ float: 'left' }} />
          {Object.keys(warnMessage).map((k) => (
            <p>{warnMessage[k]}</p>
          ))}
        </div>
      )}
      <div className='with-prefix-title lower-blue'>{intl.get('hpfm.doc.common.basicInfo').d('基础信息')}</div>
      <Form dataSet={modalDs} labelLayout={LabelLayout.vertical} columns={3} className="c7n-pro-vertical-form-display">
        {!noModelUnit ? <Output name="field.modelName" />  : null}
        <Output name="fieldCode" />
        {hasCodeAlias && <Output name="fieldCodeAlias" />}
        <Output
          name="fieldNameType"
          renderer={({ value }) => {
            switch(value) {
              case "EXTEND": return intl.get('hpfm.individual.view.option.platformPreDefine').d('平台预定义');
              case "MODEL": return intl.get('hpfm.individual.view.option.model').d('模型');
              case "CUSTOMIZE": return intl.get('hpfm.individual.view.option.customize').d('自定义');
            }
          }}
        />
        {fieldNameType !== "CUSTOMIZE"
          ? <Output name="fieldName" renderer={fieldNameRender} />
          : (
            <Output
              name="fieldName"
              renderer={({ record }) => (
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  {fieldNameRender({record}) || '-'}
                  {hasFx && !isSeachBarType && unitType !== 'BTNGROUP' && (
                    <Badge dot={hasFieldNameFx}>
                      <Button funcType={FuncType.link} color={ButtonColor.primary} className="fx" onClick={fieldNameFx}>fx</Button>
                    </Badge>
                  )}
                </span>
              )}
            />
          )
        }
        {hasHelpMessage && !disabledHelpMessage && (
          <Output
            name="helpMessage"
            renderer={({ text }) => (
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                {text || '-'}
                {hasFx && !isSeachBarType && (
                  <Badge dot={hasHelpMessageFx}>
                    <Button funcType={FuncType.link} color={ButtonColor.primary} className="fx" onClick={helpMessageFx}>fx</Button>
                  </Badge>
                )}
              </span>
            )}
          />
        )}
        {!createMode && <Output name="custType" />}
      </Form>
      <div className='with-prefix-title lower-blue has-margin-top'>{intl.get('hpfm.doc.common.layout').d('布局')}</div>
      <Form dataSet={modalDs} labelLayout={LabelLayout.vertical} columns={12} className="c7n-pro-vertical-form-display">
        {["FORM", "QUERYFORM", "WORKFLOW"].includes(unitType) ? (
          <>
            <Output name="formRow" colSpan={2} />
            <Output name="formCol" colSpan={2} />
            <Output name="rowSpan" colSpan={2} />
            <Output name="colSpan" colSpan={2} />
          </>
        ) : (
          <>
            <Output name="gridSeq" colSpan={4} />
            {isGroupGrid && <Output name="formCol" colSpan={4} />}
            {isGrid && <Output name="gridWidth" colSpan={4} />}
            {isGrid && <Output name="gridFixed" colSpan={4} />}
            {commonUnitTypeConfig.colSpan && <Output name="colSpan" colSpan={4} />}
          </>
        )}
        {unitType === "GRID" && (
          <Output name="sorter" colSpan={4} labelLayout={LabelLayout.none}>
            {intl.get('hpfm.individual.model.config.sorter').d('可排序')}
            <Tooltip title={intl.get('hpfm.customize.common.disabled.sorter').d("该配置项不可用，未来将会逐步删除此配置项")}>
              <Icon type="help" style={{ fontWeight: 400, fontSize: "14px", verticalAlign: "text-bottom", color: "#cacaca", marginLeft: "4px" }} />
            </Tooltip>
          </Output>
        )}
        {hasWidget && isInputUnit && <Output colSpan={4} newLine name="renderOptions" />}
        {showSetSelfValid && (
          <Output
            label={intl.get('hpfm.individual.model.config.selfRule').d('自定义校验')}
            name="setSelfValids"
            colSpan={4}
            renderer={() => (
              <AnyButton
                funcType={FuncType.link}
                onClick={conValidFx}
                color="primary"
                icon="predefine"
                block
                style={{ justifyContent: "flex-start" }}
              >
                <Badge dot={hasSelfValidFx}>
                  {intl.get("hzero.common.button.view").d("查看")}
                </Badge>
              </AnyButton>
            )}
          />
        )}
        {!isSeachBarType && (
          <Output
            colSpan={4}
            newLine
            name="visible"
            renderer={(({ text }) => (
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                {hasFx && hasVisibleFx ? "" : text}
                {hasFx && (
                    <Badge dot={hasVisibleFx}>
                      <Button
                        funcType={FuncType.link}
                        color={ButtonColor.primary}
                        className="fx"
                        onClick={visibleFx}
                      >
                        fx
                      </Button>
                    </Badge>
                )}
              </span>
            ))}
          />
        )}
        {!asText && isInputUnit && (
          <>
            <Output
              colSpan={4}
              name="fieldEditable"
              renderer={(({ text }) => (
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  {hasFx && hasEditableFx ? "fx" : text}
                  {hasFx && (
                    <Badge dot={hasEditableFx}>
                      <Button
                        funcType={FuncType.link}
                        color={ButtonColor.primary}
                        className="fx"
                        onClick={editableFx}
                      >
                        fx
                      </Button>
                    </Badge>
                  )}
                </span>
              ))}
            />
            <Output
              colSpan={4}
              name="fieldRequired"
              renderer={(({ text }) => (
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  {hasFx && hasRequiredFx ? "fx" : text}
                  {hasFx && (
                  <Badge dot={hasRequiredFx}>
                    <Button
                      funcType={FuncType.link}
                      color={ButtonColor.primary}
                      className="fx"
                      onClick={requiredFx}
                    >
                      fx
                    </Button>
                  </Badge>
                  )}
                </span>
              ))}
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
            <Form dataSet={modalDs} labelLayout={LabelLayout.vertical} columns={12} className="c7n-pro-vertical-form-display">
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
        <Form dataSet={modalDs} labelLayout={LabelLayout.vertical} columns={12} className="c7n-pro-vertical-form-display">
          {moreFields}
        </Form>
      )}
    </Spin>
  );
});


function getWidgetConfigList(modalContext: ModalContext, runtimeContext) {
  const {
    asText, paramsConfigModal, relatedConfigModal, clearDefaultValueFx,
    hasDefaultValueFx, defaultValueFx,
    attachmentTplFx, hasAttachmentTplFx,
  } = runtimeContext;
  const { modalDs, modalVar, options } = modalContext;
  const record = modalDs.current!;
  const {
    id: unitId, hasFx,
    unitType, isExt, isC7N, isH0
  } = modalVar;
  const defaultExpTemplateParams = { ...options.subModalCommonParams, isTemplate: options.isTemplate, readOnly: true };
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
    !asText && <Output name="placeholder" colSpan={4} />,
    <Output name="widget.trimFlag" colSpan={4} />,
    <Output name="sourceCodeObject" colSpan={4} newLine />,
    <Output name="widget.textMaxLength" colSpan={4} newLine />,
    <Output name="widget.textMinLength" colSpan={4} />,
    <Output name="widget.autoCast" colSpan={4} />,
    <Output name="widget.numberMax" colSpan={4} newLine />,
    <Output name="widget.numberMin" colSpan={4} />,
    <Output name="widget.numberDecimal" colSpan={4} newLine />,
    <Output name="widget.dateFormat" colSpan={4} />,
    <Output name="widget.textAreaMaxLine" colSpan={4} />,
    <Output name="linkTitle" colSpan={4} newLine />,
    <Output name="widget.linkType" colSpan={4} />,
    showLinkNewWindow && <Output name="widget.linkNewWindow" colSpan={4} />,
    <Output name="widget.linkHref" colSpan={8} newLine />,
    showBucketName && (
      <Output
        name="widget.bucketName"
        colSpan={4}
        newLine
        showHelp={ShowHelp.label}
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
    <Output name="widget.allowThousandth" colSpan={4} />,
    <Output
      name="widget.multipleFlag"
      colSpan={4}
      renderer={(({ text }) => (
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          {text || '-'}
          {widgetType === "LOV" && (
            <Tooltip title={intl.get("hpfm.customize.common.multipleFlagMayNotMatch").d("保留原有逻辑下，如果字段本身可能是多选，请勿配置关联字段设置")}>
              <Icon type="help" />
            </Tooltip>
          )}
        </span>
      ))}
    />,
    <Output
      label={getParamsBtnName(widgetType)}
      name="setLovParam"
      colSpan={4}
      newLine
      renderer={() => (
        <AnyButton
          name="setLovParam"
          colSpan={4}
          newLine
          icon="predefine"
          color={ButtonColor.primary}
          funcType={FuncType.link}
          style={{ justifyContent: "flex-start" }}
          onClick={paramsConfigModal}
        >
          <Badge dot={(record.get("paramList") || []).length} className='lov-param-set'>
            {intl.get("hzero.common.button.view").d("查看")}
          </Badge>
        </AnyButton>
      )}
    />,
    <Output
      label={intl.get('hpfm.individual.model.config.fieldMapping').d('关联字段设置')}
      name="setLovParam"
      colSpan={4}
      renderer={() => (
        <AnyButton
          name="setRelateFields"
          colSpan={4}
          icon="swap_horiz"
          color={ButtonColor.primary}
          funcType={FuncType.link}
          onClick={relatedConfigModal}
          style={{ justifyContent: "flex-start" }}
          disabled={record.getField("setRelateFields")!.get("disabled")}
        >
          <Badge dot={(record.get("fieldLovMaps") || []).length}>
            {intl.get("hzero.common.button.view").d("查看")}
          </Badge>
        </AnyButton>
      )}
    />,
    ...getDefaultValueNode(widgetType, record, { unitId, defaultExpTemplateParams, defaultValueFxNode, clearDefaultValueFx, readOnly: true, isC7N, isH0 }),
    <Output name="widget.modalWidth" colSpan={4} />,
    record && !!record.get('widget.fileFormat') && record.get('widget.fileFormat').length && <Output name='widget.fileFormat' colSpan={4} />,
    <Output name="widget.includeNowDayFlag" colSpan={4} />,
    unitType !== 'GRID' && <Output name="widget.uploadShowFlag" colSpan={4} />,
    <Output
      name="widget.attachmentType"
      colSpan={4}
    />,
    !isH0 && (
      <Output
        name="widget.attachmentLimitNum"
        colSpan={4}
      />
    ),
    <Output
      name="widget.breakpointResumeFlag"
      colSpan={4}
    />,
    <Output
      name="widget.uploadRecordFlag"
      colSpan={4}
    />,
    <Output
      name="widget.autoDisabledDate"
      colSpan={4}
    />,
    <Output
      name="widget.supplementZero"
      colSpan={4}
    />,
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
    case 'INPUT_NUMBER': filterArr = ["placeholder", "numberMax", "numberMin", "numberDecimal", "allowThousandth", "defaultValue", isH0 ? undefined : "supplementZero"]; break;
    case 'DATE_PICKER': filterArr = ["placeholder", "dateFormat", "includeNowDayFlag", "defaultValue", "autoDisabledDate", "setLovParam"]; break;
    case 'LINK': filterArr = ["linkType", "linkTitle", "linkHref", "bucketName", "modalWidth", "linkNewWindow"]; break;
    case 'UPLOAD': filterArr = ["bucketName", "attachmentTemplate", "__attachment_tpl_fx__", "uploadShowFlag", 'uploadRecordFlag', isExt && isC7N && unitType === "FORM" && "attachmentType", "attachmentLimitNum", "breakpointResumeFlag"]; break;
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
  if (filterArr.includes("defaultValue")) {
    filterArr.push("__defaultValue__");
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
