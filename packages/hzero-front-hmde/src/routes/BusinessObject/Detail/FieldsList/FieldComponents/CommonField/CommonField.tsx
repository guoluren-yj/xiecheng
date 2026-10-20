import { groupBy } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';
import Lov from '@/components/LowcodeLov';
import { Observer } from 'mobx-react-lite';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { DataSet, Form, Icon, Row, Col, Output, Tooltip, Select } from 'choerodon-ui/pro';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import FormulaEditor from '@/businessComponents/FormulaEditor';
import { setFieldProperties, setDatasetProps } from '@/stores/FieldProperties';
import Field from 'choerodon-ui/pro/lib/data-set/Field';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import MultiIntlField from '@/businessComponents/MultiIntlField';
import { SourceType } from '@/businessGlobalData/common';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import ImgIcon from '@/utils/ImgIcon';

import styles from './index.less';

const GroupMapping = {
  head: [
    'businessObjectFieldName',
    'inheritFieldName',
    'templateFieldName',
    'templateFieldCode',
    'businessObjectFieldCode',
    'inheritFieldCode',
    'extendFieldCode',
    'businessObjectField',
    'helpText',
    'remark',
    'displayFormat',
    'maxLength',
    'maxValue',
    'minValue',
    'fixDateTime',
    'defaultValueType',
    'format',
  ],
  defaultValueField: ['defaultValue'],
  ret: [
    'readOnlyFlag',
    'requiredFlag',
    'exportableFlag',
    'multiLanguageFlag',
    'attributeJson',
    'meaningConfig',
  ],
  unRender: ['valueList', 'lovCode', 'falseMeaning', 'trueMeaning'],
};

const getFormDsConfig = ({
  type = '',
  businessObjectId,
  isEditMode,
  isExtensionField,
  isFromDomain,
  businessObjectCode,
  customPrimaryKeyCode,
  componentType,
}) => {
  const filedPropertied = setFieldProperties({
    type,
    isEditMode,
    isExtensionField,
    isFromDomain,
    businessObjectId,
  });
  const { datasetProps } = setDatasetProps({
    filedPropertied,
    businessObjectId,
    isEditMode,
    isExtensionField,
    isFromDomain,
    businessObjectCode,
    customPrimaryKeyCode,
    componentType,
  });
  return datasetProps;
};

const isTenant = isTenantRoleLevel();

function CommonField(props) {
  const {
    selectedExampleInfo,
    disabled,
    detailData,
    businessObjectId,
    isEditMode,
    isExtensionField,
    isFromDomain,
    businessObjectCode,
    customPrimaryKeyCode,
    businessObjectPublished,
    boSourceType,
  } = props;

  const { value } = selectedExampleInfo || {};
  const [CommonFieldDs, setCommonFieldDs] = useState(new DataSet());
  const [codeDisabled, setCodeDisabled] = useState(false);
  const [fields, setFields] = useState({} as any);
  const [lovData, setLovData] = useState<any>([]);
  const [refList, setRefList] = useState<any>({});
  const [refState, setRefState] = useState<boolean>(true);
  const [requireFlag, setRequireFlag] = useState<boolean>(false);

  const [currentFormula, setCurrentFormula] = useState('');
  const [currentHelpText, setCurrentHelpText] = useState({});
  // eslint-disable-next-line no-unused-expressions
  CommonFieldDs?.current?.set('codeDisabled', codeDisabled);
  // eslint-disable-next-line no-unused-expressions
  CommonFieldDs?.current?.setState('currentFormula', currentFormula);

  const init = data => {
    const {
      formula,
      attributeJson,
      defaultValueAnalyzeResult,
      formulaAnalyzeResult,
      platformFieldRequiredFlag,
    } = data || {};
    if (formulaAnalyzeResult) {
      setRefList(formulaAnalyzeResult);
      setRefState(formulaAnalyzeResult?.success);
    } else if (defaultValueAnalyzeResult) {
      setRefList(defaultValueAnalyzeResult);
      setRefState(defaultValueAnalyzeResult?.success);
    }

    if (formula) {
      const str = ((formula.match(/CASCADE\(.*?\)/g) || [])[0] || "").replace(/CASCADE\(|\)$/g, "");
      const arr = str.split(',');
      const newFormula = arr.length > 2 ? arr.splice(1, arr.length - 1)?.join(',') : arr[1];
      setCurrentFormula(`CASCADE(${newFormula})`);
      // eslint-disable-next-line no-unused-expressions
      CommonFieldDs?.current?.set('formula', `CASCADE(${newFormula})`);
      // eslint-disable-next-line no-unused-expressions
      CommonFieldDs?.current?.set('newFormula', formula);
    }
    if (attributeJson) {
      setCurrentHelpText(attributeJson?.helpText || {});
    }
    if (platformFieldRequiredFlag) {
      setRequireFlag(platformFieldRequiredFlag);
    }
  };

  useEffect(() => {
    if (value) {
      const datasetProps = getFormDsConfig({
        type: value,
        businessObjectId,
        isEditMode,
        isExtensionField,
        isFromDomain,
        businessObjectCode,
        customPrimaryKeyCode,
        componentType: value,
      });
      setFields(
        groupBy(datasetProps.fields, ({ name }) => {
          // TODO 特殊逻辑：2021-m9 先不做，做隐藏：租户下创建【扩展字段】- 默认值，默认值类型 这两个字段不显示，因为后端没有做
          if (
            isExtensionField &&
            (name === 'defaultValue' || name === 'fixDateTime' || name === 'defaultValueType')
          ) {
            return 'unRender';
          }

          // 如果是开关类型，【是否可导出】
          if (value === 'SWITCH' && name === 'exportableFlag') return 'head';
          if (value === 'NUMBER_FIELD' && ['valueList', 'lovCode'].includes(name)) return 'head';
          if (['DATE_SELECTION_BOX', 'DATETIME_SELECTION_BOX'].includes(value) && name === 'format') return 'head';
          if (value === 'DATETIME_SELECTION_BOX' && name === 'timeZoneConvertFlag') return 'head';
          if (GroupMapping.head.indexOf(name) > -1) {
            return 'head';
          } else if (GroupMapping.defaultValueField.indexOf(name) > -1) {
            return 'defaultValueField';
          } else if (GroupMapping.unRender.indexOf(name) > -1) {
            return 'unRender';
          } else {
            return 'ret';
          }
        })
      );
      setCommonFieldDs(new DataSet(datasetProps as any));
      setCodeDisabled(isEditMode);
    }
  }, [value]);

  useEffect(() => {
    if (CommonFieldDs?.getField('inheritFieldCode')) {
      const oldDisabled = CommonFieldDs?.getField('inheritFieldCode')?.get('disabled');
      (CommonFieldDs.getField('inheritFieldCode') as Field).set(
        'disabled',
        isExtensionField &&
          isTenant &&
          ![
            'LINK_RELATION', // 关联关系
            'MASTER_RELATION', // 从主关系
            'REFERENCE_FIELD', // 引用关系
          ].includes(value)
          ? true
          : oldDisabled
      );
    }
  }, [value, CommonFieldDs]);

  useImperativeHandle(props?.childrenComRef, () => ({
    CommonFieldDs, // 暴露出去的ds名称: 组件名称+Ds
    customInitChild: initData => init(initData),
  }));

  const queryLovData = async lovCode => {
    const res = await queryIdpValue(lovCode);
    if (getResponse(res)) {
      setLovData(res);
    }
  };

  /**
   * 这里的禁用控制逻辑，根据这个文档来：https://shimo.im/sheets/TDPwHgdTWWWhYjXc/dWDMa
   * @param item 渲染的表单项目
   * @returns boolean
   */
  const getDisabled = item => {
    const flag =
      isTenant &&
      isEditMode &&
      detailData?.componentType === value &&
      (['exportableFlag'].includes(item?.name) // 所有字段类型的是否可导出禁用
      || (['APPENDIX'].includes(value) && !isExtensionField && ['fileTypes', 'multipleFlag', 'maxFileSize', 'fileFormats'].includes(item?.name))
      || (['MASTER_RELATION'].includes(value) && ['masterBusinessObject', 'linkRelationType', 'refValueListBusinessObject', 'lovDisplayType'].includes(item?.name))
      || (['LINK_RELATION'].includes(value) && ['masterBusinessObject', 'refValueListBusinessObject', 'lovDisplayType'].includes(item?.name))
      || (['REFERENCE_FIELD'].includes(value) && !isExtensionField && ['refBusinessObject', 'formula'].includes(item?.name))
      || (['TEXT_FIELD', 'TEXT_AREA', 'NUMBER_FIELD', 'FLOAT', 'PERCENTAGE', 'MONEY', 'PHONE_NUMBER'].includes(value) && ['readOnlyFlag', 'defaultValue', 'defaultValueType'].includes(item?.name))
      || (['NUMBER_FIELD', 'FLOAT', 'PERCENTAGE', 'MONEY'].includes(value) &&!isExtensionField && ['maxValue', 'minValue'].includes(item?.name))
      || (['FLOAT', 'PERCENTAGE', 'MONEY'].includes(value) && !isExtensionField && ['digitalAccuracy'].includes(item?.name))
      || (['SWITCH', 'DATE_SELECTION_BOX', 'DATETIME_SELECTION_BOX', 'APPENDIX', 'EMAIL'].includes(value) && ['defaultValue'].includes(item?.name)));

    if (isTenant) {
      if (
        !isExtensionField &&
        (item.name === 'meaningConfig' ||
          item.name === 'defaultValue' ||
          item.name === 'fixDateTime' ||
          item.name === 'defaultValueType')
      ) {
        // 租户下不能编辑平台的【含义配置】【默认值】【默认值类型】【时间-默认值】【日期时间-默认值】字段
        return true;
      }

      // 租户下编辑自己创建的【扩展字段】
      if (isExtensionField) {
        if (item.name === 'defaultValue' || item.name === 'defaultValueType') {
          // 租户自己创建的扩展字段是可以编辑的
          return false;
        }
      }
    }

    return flag;
  };

  const checkRender = (item: any) => {
    if (
      item.name === 'defaultValue' &&
      (CommonFieldDs.current?.get('fixDateTime') === 'CURRENT_TIMESTAMP' ||
        CommonFieldDs.current?.get('fixDateTime') === 'none')
    ) {
      return false;
    }

    if (!CommonFieldDs.current?.get('multipleFlag') && item.name === 'maxFileCount') return false;
    if (!item.Render) return false;
    return true;
  };

  const renderFormItem = (items = []) => {
    if (!Array.isArray(items) || !items.length) return null;
    return items.map((item: any) => {
      if (value === 'NUMBER_FIELD' && item.name === 'valueList') {
        return (
          <Lov
            label={intl.get('hmde.bo.field.valueList').d('值集')}
            style={{ flex: 1 }}
            dataSet={CommonFieldDs}
            name="valueList"
            // clearButton={false}
            noCache
            disabled={disabled || (isTenant && !isExtensionField)}
          />
        );
      }
      if (['DATE_SELECTION_BOX', 'DATETIME_SELECTION_BOX'].includes(value) && item.name === 'format') {
        return (
          <Select
            dataSet={CommonFieldDs}
            label={(
              <>
                {value === 'DATE_SELECTION_BOX' ? intl.get('hmde.bo.model.dateFormat').d('日期格式') : intl.get('hmde.bo.model.dateTimeFormat').d('日期时间格式')}
                <Tooltip
                  title={
                    value === 'DATETIME_SELECTION_BOX' ?
                      intl.get('hmde.bo.model.dateTimeFormat.tooltip').d('日期时间格式仅影响导出数据日期时间的展示格式，不限制导入数据的日期时间格式维护，导入数据的日期时间格式必须为 2018-09-30 23:59:59 形式')
                      : intl.get('hmde.bo.model.dateFormat.tooltip').d('日期格式仅影响导出数据日期的展示格式，不限制导入数据的日期格式维护，导入数据的日期格式必须为 2018-09-30 形式')
                  }
                >
                  <Icon type='help' style={{ fontSize: '14px', verticalAlign: 'text-bottom' }} />
                </Tooltip>
              </>
            )}
            optionsFilter={obj => {
              if (value === 'DATE_SELECTION_BOX') {
                return !obj.get('value').includes('mm:ss');
              }
              return true;
            }}
            name="format"
          />
        );
      }
      if (!checkRender(item)) return null;
      return item.Render({
        isExtensionField,
        refState,
        refList,
        preDisabled: boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode,
        currentFormula,
        currentHelpText,
        disabled:
          item?.name === 'helpText' ||
          disabled ||
          // 额外增加的禁用规则放在这
          (businessObjectPublished &&
            detailData?.componentType === value &&
            [
              // 已发布对象且编辑态时没有切换其他字段类型 那么它的关联方式、关联对象字段不可编辑
              'linkRelationType',
              'masterBusinessObject',
            ].includes(item?.name)) ||
          getDisabled(item),
        // 租户层部分字段属性禁用
        requireFlag,
        record: CommonFieldDs.current,
      });
    });
  };

  // 默认值字段在样式上比较特殊，需要单独拿出来做渲染
  const renderSpecialDefaultValueField = () => {
    if (!fields?.defaultValueField?.length) return;
    if (CommonFieldDs.current?.get('defaultValueType') === 'none') return;

    const isSwitchFlag = detailData?.componentType === 'SWITCH' || value === 'SWITCH';
    const showEditorFlag =
      CommonFieldDs.current?.get('defaultValueType') === 'EXPRESSION' ||
      CommonFieldDs.current?.get('fixDateTime') === 'EXPRESSION';

    return (
      <div className={styles['default-value-wrap']}>
        {showEditorFlag ? (
          <div>
            {!refState && (
              <div className={styles['tip-contain-warn']}>
                <div>
                  <ImgIcon name="publish_fail_icon.svg" size={14} />
                  <span>{refList?.message}</span>
                </div>
                <ImgIcon name="publish_fail_red.png" style={{ width: '195px', height: '28px' }} />
              </div>
            )}
            <div style={{ padding: '12px 16px' }}>
              <FormulaEditor
                key="defaultValueEdit"
                name="defaultValue"
                formDs={CommonFieldDs}
                businessObjectCode={businessObjectCode}
                businessObjectFieldCode={detailData?.businessObjectFieldCode}
                disabled={disabled || getDisabled(fields.defaultValueField[0])}
                DrillComponentProps={
                  {
                    initDrillParams: {
                      drillPublishFlag: false, // 传false钻取非发布的数据
                    },
                  } as any
                }
              />
            </div>
          </div>
        ) : null}
        <Form
          columns={2}
          labelLayout={LabelLayout.float}
          dataSet={CommonFieldDs}
          disabled={boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode}
        >
          {showEditorFlag || isSwitchFlag ? null : renderFormItem(fields?.defaultValueField)}
        </Form>
      </div>
    );
  };

  // 开关类型字段渲染
  const renderSwitchFiled = () => {
    if (!(detailData?.componentType === 'SWITCH' || value === 'SWITCH')) return;
    const renderItem = fields?.ret?.find(o => o.name === 'meaningConfig') || {};
    if (!checkRender(renderItem)) return;
    const disableFlag = disabled || getDisabled(renderItem);
    return CommonFieldDs.current?.get('meaningConfig') === 'valueList' ? (
      <div className={styles['row-valueList']}>
        <div className={styles['row-valueList-lov']}>
          <span style={{ display: 'inline-block', width: 58 }}>
            {intl.get('hmde.bo.field.valueList').d('值集')}
          </span>
          <Lov
            style={{ flex: 1 }}
            dataSet={CommonFieldDs}
            name="valueList"
            clearButton={false}
            noCache
            disabled={disableFlag}
          />
        </div>
        <div className={styles['valueList-operate']}>
          {CommonFieldDs.current?.get('lovCode') ? (
            <Tooltip
              theme="light"
              trigger={'click' as any}
              placement="bottom"
              // overlayStyle={{ maxHeight: 300, overflow: 'auto' } as any}
              autoAdjustOverflow
              arrowPointAtCenter
              onHiddenChange={visible => {
                const lovCode = CommonFieldDs.current?.get('lovCode');
                if (!visible && lovCode) queryLovData(lovCode);
              }}
              title={
                <>
                  <div className={styles['meaning-value-container']}>
                    <span>{intl.get('hmde.common.meaning').d('含义')}</span>
                    <span />
                    <span>{intl.get('hmde.common.value').d('值')}</span>
                  </div>
                  {(lovData || []).map(item => (
                    <div className={styles['meaning-value-container']}>
                      <span>{item.meaning}</span>
                      <span />
                      <span>{item.value}</span>
                    </div>
                  ))}
                </>
              }
            >
              <a>
                <Icon type="visibility-o" />
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </Tooltip>
          ) : null}
        </div>
      </div>
    ) : (
        <div className={styles['row-custom']}>
          <div className={styles['lov-value-list-wrap']}>
            <Row className={styles['header-txt']}>
              <Col className={styles.meaning}>
                <span>{intl.get('hmde.common.switch.status').d('开关状态')}</span>
              </Col>
              <Col style={{ paddingLeft: '25px' }}>
                <span>{intl.get('hmde.common.value.meaning').d('含义')}</span>
              </Col>
            </Row>
            <Row key="open" className={styles['line-content']}>
              <Col className={styles.meaning}>
                {intl.get('hmde.common.button.open').d('开启')}
              </Col>
              <Col className={styles['divide-line']} />
              <Col className={styles['form-layout']}>
                <Form dataSet={CommonFieldDs}>
                  <Output
                    name="trueMeaning"
                    key="trueMeaning"
                    renderer={({ record }) => {
                      return (
                        <MultiIntlField
                          required
                          name="trueMeaning"
                          record={record}
                          init={record && record.get('trueMeaning')}
                          disabled={disableFlag}
                        />
                      );
                    }}
                  />
                </Form>
              </Col>
            </Row>
            <Row key="close" className={styles['line-content']}>
              <Col className={styles.meaning}>
                {intl.get('hzero.common.button.close').d('关闭')}
              </Col>
              <Col className={styles['divide-line']} />
              <Col className={styles['form-layout']}>
                <Form dataSet={CommonFieldDs}>
                  <Output
                    name="falseMeaning"
                    key="falseMeaning"
                    renderer={({ record }) => {
                      return (
                        <MultiIntlField
                          required
                          name="falseMeaning"
                          record={record}
                          init={record && record.get('falseMeaning')}
                          disabled={disableFlag}
                        />
                      );
                    }}
                  />
                </Form>
              </Col>
            </Row>
          </div>
        </div>
      );
  };

  return (
    <>
      <Observer>
        {() => {
          return (
            <div>
              <Form
                columns={2}
                dataSet={CommonFieldDs}
                labelLayout={LabelLayout.float}
                disabled={boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode}
              >
                {renderFormItem(fields?.head)}
              </Form>
              {renderSpecialDefaultValueField()}
              <Form
                columns={2}
                dataSet={CommonFieldDs}
                labelLayout={LabelLayout.float}
                disabled={boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode}
              >
                {renderFormItem(fields?.ret)}
              </Form>
              {renderSwitchFiled()}
            </div>
          );
        }}
      </Observer>
    </>
  );
}

export default formatterCollections({ code: ['hmde.common', 'hzero.common', 'hmde.bo'] })(CommonField);
