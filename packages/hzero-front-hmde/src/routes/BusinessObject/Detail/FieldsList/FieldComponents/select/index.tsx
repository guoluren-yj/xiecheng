// 下拉单选/多选组件
import React, { useMemo, useImperativeHandle, useState } from 'react';
import {
  DataSet,
  Form,
  SelectBox,
  Select,
  TextField,
  Icon,
  Modal,
  IntlField,
  Output,
  NumberField,
  Tooltip,
  CheckBox,
} from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Observer } from 'mobx-react-lite';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { queryIdpValue } from 'hzero-front/lib/services/api';

import Lov from '@/components/LowcodeLov';

import MultiIntlField from '@/businessComponents/MultiIntlField';
import { SourceType } from '@/businessGlobalData/common';

import { IChildren } from '@/businessComponents/icon-picker/enums';
import LovDefineModal from './LovDefineModal';
import LovValuesList from './LovValuesList';
import SelectDS from './SelectDS';
import styles from './index.less';

const { Option } = Select;
const createValueListKey = Modal.key();

const isTenant = isTenantRoleLevel();
interface IProps {
  childrenComRef: any;
  disabled?: boolean;
  selectedExampleInfo?: IChildren;
  isEditMode?: boolean;
  isExtensionField?: boolean;
  isFromDomain?: boolean;
  businessObjectCode?: string;
  businessObjectId?: string;
  customPrimaryKeyCode?: string;
  boSourceType?: string;
  language: string;
}
function Index(props: IProps) {
  const {
    selectedExampleInfo,
    isExtensionField,
    isEditMode,
    isFromDomain,
    businessObjectCode,
    businessObjectId,
    customPrimaryKeyCode,
    disabled,
    boSourceType,
  } = props;

  const disabledCustomOptionSetting = useMemo(() => {
    return ["SINGLE_SELECT", "MULTIPLE_SELECT", "RADIO", "CHECKBOX"].includes(selectedExampleInfo?.value);
  }, [selectedExampleInfo?.value]);

  const selectDs: DataSet = useMemo(
    () =>
      new DataSet(
        SelectDS(
          isExtensionField,
          selectedExampleInfo?.value,
          isEditMode,
          businessObjectId,
          isFromDomain,
          customPrimaryKeyCode,
          disabledCustomOptionSetting
        )
      ),
    [
      isExtensionField,
      selectedExampleInfo?.value,
      isEditMode,
      businessObjectId,
      isFromDomain,
      customPrimaryKeyCode,
      isExtensionField,
      disabledCustomOptionSetting,
    ]
  );
  const [lovData, setLovData] = useState<any>([]);
  const [defaultFileValueList, setDefaultFileValueList] = useState<any>([]);
  const [defaultValueMultipleFlag, setDefaultValueMultipleFlag] = useState(false);

  const valueListDs = useMemo(() => selectDs.children.customOptionList, [
    isExtensionField,
    selectedExampleInfo?.value,
    isEditMode,
  ]);

  const handleInit = res => {
    const { lovCode, lovName } = res;
    if (lovCode) {
      // eslint-disable-next-line no-unused-expressions
      selectDs?.current?.set('valueList', { lovCode, lovName });
    } else {
      // eslint-disable-next-line no-unused-expressions
      selectDs?.current?.set('valueList', undefined);
    }

    // 初始化【默认值】字段
    initDefaultField(res);
  };

  // 维护需要暴露给父组件的api 一般是ds
  useImperativeHandle(props?.childrenComRef, () => ({
    selectDs, // 务必维护和组件名称一致后缀加Ds 方便父组件调用
    getAttributeJson,
    customInitChild: res => handleInit(res),
  }));

  // 获取后端数据库中不存在的字段属性
  const getAttributeJson = () => {
    return {
      // 传给后端数据库中不存在的字段信息
      helpText: selectDs.current?.get('helpText'),
      optionDirection: selectDs.current?.get('optionDirection'),
      optionSettings: selectDs.current?.get('optionSettings'),
      readOnlyFlag: selectDs.current?.get('readOnlyFlag'),
    };
  };

  // 租户查看平台标准字段禁用
  // const tenantStandardDisabled = isTenant && isEditMode && !isExtensionField;

  const queryLovData = async lovCode => {
    const res = await queryIdpValue(lovCode);
    if (getResponse(res)) {
      setLovData(res);
    }
  };

  // 监听【选项设置】字段值的变化
  const handleSelectDsUpdate = ({ name }) => {
    if (name === 'optionSettings') {
      if (selectDs?.current?.set) {
        selectDs.current.set('defaultValue', '');
      }
    }
  };
  selectDs.addEventListener('update', handleSelectDsUpdate);

  // 初始化默认值
  const initDefaultField = initData => {
    const { componentType, defaultValue, lovCode, attributeJson = {} } = initData;
    const { optionSettings, customOptionList } = attributeJson;
    const multipleFlag = componentType === 'MULTIPLE_SELECT' || componentType === 'CHECKBOX';
    setDefaultValueMultipleFlag(multipleFlag);

    if (!defaultValue || !optionSettings) return;
    if (
      componentType === 'SINGLE_SELECT' ||
      componentType === 'MULTIPLE_SELECT' ||
      componentType === 'RADIO' ||
      componentType === 'CHECKBOX'
    ) {
      handleDefaultValueFocus(lovCode, optionSettings, customOptionList);
    }
  };

  // 手动获取值集
  const handleDefaultValueFocus = async (
    _lovCode?: string,
    _optionSettings?: string,
    _customOptionList?: any
  ) => {
    const tempOptionSettings = _optionSettings || selectDs.current?.get('optionSettings');
    const isValueList = tempOptionSettings === '_valueList';
    if (isValueList) {
      // 值集
      const lovCode = _lovCode || selectDs.current?.get('lovCode');
      if (!lovCode) return;
      const res = await queryIdpValue(lovCode);
      if (getResponse(res)) {
        setDefaultFileValueList(res);
      }
    } else {
      // 自定义
      setDefaultFileValueList(_customOptionList || valueListDs.toData());
    }
  };

  const openCreateValueList = (ds?: DataSet) => {
    Modal.open({
      key: createValueListKey,
      title: intl.get('hmde.bo.field.valueList.create').d('值集定义'),
      border: false,
      autoCenter: true,
      children: (
        <LovDefineModal
          valueList={ds?.toData()}
          businessObjectCode={businessObjectCode}
          selectDs={selectDs}
        />
      ),
    });
  };

  // 因为多语言关系，需要手动转一下值集的meaning
  const getValueListMeaning = (val: any) => {
    if (typeof val === 'string') {
      return val;
    } else if (typeof val === 'object') {
      const { language } = props || {};
      return val[language];
    } else {
      return val;
    }
  };

  return (
    <Observer>
      {() => (
        <>
          <Form
            dataSet={selectDs}
            columns={2}
            useColon={false}
            disabled={
              disabled || (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode)
            }
            // labelWidth="auto" // 甄云环境因ued样式文件不同而出现样式错误问题
            labelLayout={LabelLayout.float}
          >
            {!isFromDomain && !isExtensionField && (
              <>
                <IntlField name="businessObjectFieldName" suffix={<Icon type="language" />} />
                <TextField name="businessObjectFieldCode" disabled={isEditMode} />
              </>
            )}
            {!isFromDomain && isExtensionField && (
              <>
                <IntlField name="inheritFieldName" suffix={<Icon type="language" />} />
                <Lov name="businessObjectField" hidden={isEditMode} />
                <TextField
                  name="inheritFieldCode"
                  disabled={isEditMode || (isExtensionField && isEditMode)}
                />
              </>
            )}
            {isFromDomain && (
              <>
                <IntlField name="templateFieldName" suffix={<Icon type="language" />} />
                <TextField name="templateFieldCode" disabled={isEditMode} />
              </>
            )}
            <MultiIntlField
              name="helpText"
              record={selectDs.current}
              init={selectDs.current?.get('helpText')}
              textFieldStyle={{ height: '85px' }}
              disabled
            // disabled={
            //   (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
            //   (isTenant && isEditMode && !isExtensionField)
            // }
            />
            {/* <Output
              name="helpText"
              key="helpText"
              colSpan={1}
              newLine
              renderer={({ record }) => {
                return (
                  <MultiIntlField
                    name="helpText"
                    record={record}
                    init={record?.get('helpText')}
                    textFieldStyle={{ height: '85px' }}
                    disabled
                  // disabled={
                  //   (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
                  //   (isTenant && isEditMode && !isExtensionField)
                  // }
                  />
                );
              }}
            /> */}
            <IntlField
              name="remark"
              colSpan={1}
              style={{ height: '85px' }}
              suffix={<Icon type="language" />}
              disabled={isTenant && isEditMode && !isExtensionField}
            />
            <NumberField name="maxLength" />
            <SelectBox name="optionSettings" disabled={disabledCustomOptionSetting || (isTenant && isEditMode && !isExtensionField)}>
              <Option value="_custom">
                {intl.get('hmde.bo.field.optionSettings.custom').d('自定义')}
              </Option>
              <Option value="_valueList">
                {intl.get('hmde.bo.field.optionSettings.valueList').d('值集')}
              </Option>
            </SelectBox>
            {selectedExampleInfo?.value !== 'SINGLE_SELECT' &&
              selectedExampleInfo?.value !== 'MULTIPLE_SELECT' ? (
                <SelectBox
                  name="optionDirection"
                  disabled={isTenant && isEditMode && !isExtensionField}
                >
                  <Option value="horizontal">
                    {intl.get('hmde.bo.field.optionDirection.horizontal').d('横向排列')}
                  </Option>
                  <Option value="vertical">
                    {intl.get('hmde.bo.field.optionDirection.vertical').d('纵向排列')}
                  </Option>
                </SelectBox>
              ) : null}
          </Form>
          {selectDs.current?.get('optionSettings') === '_valueList' ? (
            <div className={styles['row-valueList']}>
              <div className={styles['row-valueList-lov']}>
                <span style={{ display: 'inline-block', width: 58 }}>
                  {intl.get('hmde.bo.field.valueList').d('值集')}
                </span>
                <Lov
                  style={{ flex: 1 }}
                  dataSet={selectDs}
                  name="valueList"
                  clearButton={false}
                  noCache
                  disabled={
                    disabled ||
                    (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
                    (isTenant && isEditMode && !isExtensionField)
                  }
                />
              </div>
              <div className={styles['valueList-operate']}>
                {selectDs?.current?.get('lovCode') ? (
                  <Tooltip
                    theme="light"
                    trigger={'click' as any}
                    placement="bottom"
                    // overlayStyle={{ maxHeight: 300, overflow: 'auto' }}
                    autoAdjustOverflow
                    arrowPointAtCenter
                    onHiddenChange={visible => {
                      const lovCode = selectDs.current?.get('lovCode');
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
                    <a disabled={selectDs?.current?.get('lovType') !== 'IDP'}>
                      <Icon type="visibility-o" />
                      {intl.get('hzero.common.button.view').d('查看')}
                    </a>
                  </Tooltip>
                ) : null}
                <a
                  onClick={() => openCreateValueList()}
                  disabled={
                    disabled ||
                    (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
                    (isTenant && isEditMode && !isExtensionField)
                  }
                >
                  <Icon type="add" />
                  {intl.get('hmde.bo.field.valueList.add').d('新建值集')}
                </a>
              </div>
            </div>
          ) : (
              <div className={styles['row-custom']}>
                <div className={styles['row-custom-header']}>
                  <span>{intl.get('hmde.bo.field.optionSettings.custom').d('自定义')}</span>
                  <a
                    disabled={
                      disabled ||
                      (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
                      (isTenant && isEditMode && !isExtensionField)
                    }
                    onClick={async () => {
                      if (await valueListDs.validate()) valueListDs.create({});
                    }}
                  >
                    <Icon type="add" />
                    {intl.get('hmde.bo.field.valueList.code.create').d('新建编码字段')}
                  </a>
                </div>
                <LovValuesList
                  operateHeaderFlag={false}
                  valueListDs={valueListDs}
                  disabled={
                    disabled ||
                    (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
                    (isTenant && isEditMode && !isExtensionField)
                  }
                />
                <div className={styles['row-custom-footer']}>
                  <p>
                    {intl
                      .get('hmde.bo.field.valueList.custom.create.help')
                      .d(
                        '生成独立值集操作会将自定义的选项内容转化为独立值集，执行后选项会跳转到值集选项，字段选择创建的值集。'
                      )}
                  </p>
                  <a
                    disabled={
                      disabled ||
                      (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode) ||
                      (isTenant && isEditMode && !isExtensionField)
                    }
                    onClick={async () => {
                      if (await valueListDs.validate()) {
                        openCreateValueList(valueListDs);
                      }
                    }}
                  >
                    {intl.get('hmde.bo.field.valueList.custom.create').d('生成独立值集')}
                  </a>
                </div>
              </div>
            )}

          <Form
            dataSet={selectDs}
            columns={2}
            useColon={false}
            labelLayout={LabelLayout.float}
            disabled={
              disabled || (boSourceType === SourceType.PREDEFINE && !isTenant && isEditMode)
            }
          >
            <Select
              key="defaultValue"
              name="defaultValue"
              searchable
              searchFieldInPopup
              hidden={isTenant && isExtensionField}
              disabled={isTenant && isEditMode}
              multiple={defaultValueMultipleFlag}
              onFocus={() => handleDefaultValueFocus()}
              searchMatcher={({ text, record }: any) => {
                const meaning = getValueListMeaning(record.toData().meaning || '');
                return meaning.toLowerCase().indexOf(text.toLowerCase()) !== -1;
              }}
            >
              {defaultFileValueList.map(i => {
                return (
                  <Option key={i?.value} value={i?.value}>
                    {getValueListMeaning(i?.meaning)}
                  </Option>
                );
              })}
            </Select>
            <CheckBox
              key="requiredFlag"
              name="requiredFlag"
              disabled={
                isTenant &&
                isEditMode &&
                !isExtensionField &&
                selectDs.current?.get('platformFieldRequiredFlag')
              }
            />
            <CheckBox
              key="exportableFlag"
              name="exportableFlag"
              disabled={isTenant && isEditMode && !isExtensionField}
            />
            {/* <Switch key="readOnlyFlag" name="readOnlyFlag" disabled={isTenant && isEditMode} /> */}
          </Form>
        </>
      )}
    </Observer>
  );
}

export default formatterCollections({ code: ['hmde.common', 'hzero.common', 'hmde.bo'] })(Index);
