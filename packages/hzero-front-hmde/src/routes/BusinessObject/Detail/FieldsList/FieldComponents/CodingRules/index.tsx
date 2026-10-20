// 下拉单选/多选组件
import React, { useMemo, useImperativeHandle, useState, useRef } from 'react';
import {
  DataSet,
  Form,
  SelectBox,
  Select,
  TextField,
  Icon,
  IntlField,
  Output,
  Button,
  Lov,
  Modal,
  NumberField,
  CheckBox,
} from 'choerodon-ui/pro';
import notification from 'hzero-front/lib/utils/notification';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Observer } from 'mobx-react-lite';
import intl from 'srm-front-boot/lib/utils/intl';
import { isEmpty } from 'lodash';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import {
  isTenantRoleLevel,
  getResponse,
  getCurrentOrganizationId,
} from 'hzero-front/lib/utils/utils';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { ViewMode } from 'choerodon-ui/pro/lib/lov/enum.d';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import MultiIntlField from '@/businessComponents/MultiIntlField';
import {
  resetCodeRuleService,
  tenantExtendResetCodeRuleService,
} from '@/services/businessObjectService';

import { IChildren } from '@/businessComponents/icon-picker/enums';
import CodeRulesList from './CodeRulesList';
import CodingRulesDS from './CodingRulesDS';
import styles from './index.less';

const isTenant = isTenantRoleLevel();
const currentTenantId = getCurrentOrganizationId();
const { Option } = Select;

interface IProps {
  childrenComRef: any;
  disabled?: boolean;
  selectedExampleInfo?: IChildren;
  isEditMode?: boolean;
  isExtensionField?: boolean;
  businessObjectCode?: string;
  businessObjectId?: string;
  customPrimaryKeyCode?: string;
  inheritFieldId?: string;
  detailData?: any;
  parentInit: () => void;
}
const [
  SEQUENCE, // 流水号
  CONSTANT, // 固定字符
  VARIABLE, // 变量
  UUID, // 随机变量uuid
  DATE, // 日期
] = ['SEQUENCE', 'CONSTANT', 'VARIABLE', 'UUID', 'DATE'];
const getRuleMap = () => ({
  [SEQUENCE]: intl.get('hmde.bo.field.codingRule.serialNumber').d('流水号'),
  [CONSTANT]: intl.get('hmde.bo.field.codingRule.fieldString').d('固定字符'),
  [VARIABLE]: intl.get('hmde.bo.field.codingRule.variable').d('变量'),
  [UUID]: intl.get('hmde.bo.field.codingRule.uuid').d('随机唯一编码 UUID'),
  [DATE]: intl.get('hmde.bo.field.codingRule.date').d('添加日期'),
});
const getTitleMap = () => ({
  [SEQUENCE]: intl.get('hmde.bo.field.codingRule.digit').d('位数'),
  [CONSTANT]: intl.get('hmde.bo.field.codingRule.fixedValue').d('固定值'),
  [VARIABLE]: intl.get('hmde.bo.field.codingRule.variableValue').d('变量值'),
  [UUID]: intl.get('hmde.bo.field.codingRule.digit').d('位数'),
  [DATE]: intl.get('hmde.bo.field.codingRule.dateFormat').d('日期格式'),
});
let addRuleModal: any = {
  update: () => {},
  close: () => {},
};

const dealRuleData = item => {
  Object.assign(item, {
    fieldType: item.fieldType,
    ruleName: getRuleMap()[item.fieldType],
    firstInputTitle: getTitleMap()[item.fieldType],
  });
  switch (item.fieldType) {
    case SEQUENCE: // 流水号
      Object.assign(item, {
        secondInputTitle: intl.get('hmde.bo.field.codingRule.initialFlow').d('起始流水'),
        thirdInputTitle: intl.get('hmde.bo.field.codingRule.resetFrequency').d('重置频率'),
        firstInput: item?.seqLength,
        secondInput: item?.startValue,
        thirdInput: item?.resetFrequency,
      });
      return item;
    case CONSTANT: // 固定字符串
      Object.assign(item, {
        firstInput: item?.fieldValue,
      });
      return item;
    case VARIABLE: // 变量
      Object.assign(item, {
        secondInputTitle: intl.get('hmde.bo.field.codingRule.variableType').d('变量类型'),
        thirdInputTitle: intl.get('hmde.bo.field.codingRule.variableValue').d('变量值'),
        firstInput: item?.variableType,
        secondInput: item?.fieldValue,
      });
      return item;
    case UUID: // 随机变量
      Object.assign(item, {
        firstInput: item?.seqLength,
      });
      return item;
    case DATE: // 日期
      Object.assign(item, {
        firstInput: item?.dateMask,
      });
      return item;
    default:
      return item;
  }
};

function Index(props: IProps) {
  const {
    selectedExampleInfo,
    isExtensionField,
    isEditMode,
    businessObjectId,
    businessObjectCode,
    parentInit,
    customPrimaryKeyCode,
    inheritFieldId,
    disabled,
  } = props;

  const [curFieldCode, setCurFieldCode] = useState<string>('');
  const [cantEditOtherTenant, setCantEditOtherTenant] = useState<boolean>(false);
  const resetStatusRef: any = useRef<boolean>(false);
  const CodingRulesDs: DataSet = useMemo(
    () =>
      new DataSet(
        CodingRulesDS(
          isExtensionField,
          isEditMode,
          customPrimaryKeyCode,
          selectedExampleInfo?.value,
          businessObjectId
        )
      ),
    [
      isTenant,
      isEditMode,
      isExtensionField,
      selectedExampleInfo?.value,
      businessObjectId,
      customPrimaryKeyCode,
    ]
  );
  // 已有编码规则
  const ruleListDs = CodingRulesDs.children.ruleListDS;
  const ruleFormDs = CodingRulesDs.children.ruleFormDS;
  // 添加规则ds
  const addRuleDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'addRuleList',
            label: intl.get('hmde.bo.field.codingRule.addRuleOptions').d('添加规则选项'),
            type: 'string',
            lookupCode: 'HMDE.BUSINESS_OBJECT.CODE_RULE.LINE_TYPE',
          },
        ],
        events: {
          update: async ({ value }) => {
            if (!value) return;
            const ds = ruleListDs;
            if (await ds.validate()) {
              const item = {
                fieldType: value,
                ruleName: getRuleMap()[value],
                firstInputTitle: getTitleMap()[value],
              };
              // 流水号
              if (value === SEQUENCE) {
                Object.assign(item, {
                  secondInputTitle: intl.get('hmde.bo.field.codingRule.initialFlow').d('起始流水'),
                  thirdInputTitle: intl
                    .get('hmde.bo.field.codingRule.resetFrequency')
                    .d('重置频率'),
                });
              }
              // 变量
              if (value === VARIABLE) {
                Object.assign(item, {
                  secondInputTitle: intl.get('hmde.bo.field.codingRule.variableType').d('变量类型'),
                  thirdInputTitle: intl.get('hmde.bo.field.codingRule.variableValue').d('变量值'),
                });
              }
              ds.create(item);
            }
            addRuleModal.close();
          },
        },
      } as DataSetProps),
    [ruleListDs, CodingRulesDs]
  );
  // 选择编码规则ds
  const lovDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        autoQuery: false,
        transport: {
          // 根据lov选出的ruleCode查询详情
          read: {
            url: `${lowcodeOrganizationURL({
              route: HZERO_HMDE,
            })}/business-object-fields/code-rule/detail`,
            method: 'get',
          },
        },
        fields: [
          {
            name: 'ruleCodeInfo',
            type: 'object',
          },
          {
            name: 'selectCodeRule',
            type: 'object',
            required: false,
            textField: 'ruleName',
            valueField: 'ruleCode',
            lovCode: isTenant ? 'HMDE.CODE_RULE' : 'HMDE.CODE_RULE.SITE',
          },
          {
            name: 'ruleName',
            type: 'string',
            bind: 'selectCodeRule.ruleName',
          },
          {
            name: 'ruleCode',
            type: 'string',
            bind: 'selectCodeRule.ruleCode',
          },
        ],
        events: {
          update: async ({ name, value, dataSet }) => {
            if (name === 'selectCodeRule') {
              if (!value) {
                ruleFormDs.loadData([]);
                ruleListDs.loadData([]);
                setCantEditOtherTenant(false);
                return;
              }
              if (isTenant) {
                if (value?.tenantId !== currentTenantId) {
                  setCantEditOtherTenant(true);
                } else {
                  setCantEditOtherTenant(false);
                }
              }
              dataSet.setQueryParameter('ruleCode', value?.ruleCode);
              const res = await dataSet.query();
              const formData = {
                ruleId: res.ruleId,
                useFlag: !!res.useFlag,
                tenantId: res.tenantId,
                ruleCode: res.ruleCode,
                ruleName: res.ruleName,
              };
              const _res = res?.ruleDetailVOList.map(i => dealRuleData(i));
              const codeRuleData = CodingRulesDs.current?.toData();
              const data = {
                ...codeRuleData,
                ruleFormDS: [formData],
                ruleListDS: _res,
              };
              // eslint-disable-next-line no-unused-expressions
              CodingRulesDs?.loadData([data]);
            }
          },
        },
      } as DataSetProps),
    [ruleListDs, ruleFormDs]
  );

  // 保存取数据
  const getFieldsValue = (businessObjectFieldId, _detailData) => {
    const formValues = CodingRulesDs.current?.toData();
    const { ruleFormDS, ruleListDS } = formValues;
    let i = 1;
    // 重置变量的variableKey
    ruleListDS.forEach(item => {
      if (item?.fieldType === 'VARIABLE') {
        Object.assign(item, { variableKey: `variable${i}` });
        i++;
      }
    });
    const ruleFormValue = ruleFormDS[0];
    // 创建字段
    if (!businessObjectFieldId && !inheritFieldId) {
      if (isEmpty(ruleListDS)) {
        notification.error({
          message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
          description: '编码规则不能为空，请先添加编码规则后重试',
        });
        return;
      }
      Object.assign(formValues, {
        codeRuleVO: {
          ruleId: ruleFormValue?.ruleId,
          useFlag: ruleFormValue?.useFlag,
          tenantId: ruleFormValue?.tenantId,
          ruleName: ruleFormValue?.ruleName,
          ruleDetailVOList: ruleListDS,
          _status: 'create',
        },
        ruleCode: ruleFormValue?.ruleCode, // 规则编码
        sequenceIsolationLevel: ruleFormValue?.sequenceIsolationLevel, // 流水号规则
        isolationVariables: ruleFormValue?.isolationVariables, // 流水号规则变量
      });
    } else {
      // 编辑字段
      Object.assign(formValues, {
        ..._detailData,
        ...formValues,
        codeRuleVO: {
          ..._detailData?.codeRuleVO,
          ...ruleFormValue,
          ruleDetailVOList: ruleListDS,
          _status: 'update',
        },
        ruleCode: _detailData?.ruleCode || ruleFormValue.ruleCode, // 规则编码
        sequenceIsolationLevel: ruleFormValue?.sequenceIsolationLevel, // 流水号规则
        isolationVariables: ruleFormValue?.isolationVariables, // 流水号规则变量
      });
    }
    delete formValues.attributeJson?.optionSettings;
    return formValues;
  };

  // 维护需要暴露给父组件的api 一般是ds
  useImperativeHandle(
    props?.childrenComRef,
    () => ({
      CodingRulesDs, // 务必维护和组件名称一致后缀加Ds 方便父组件调用
      getAttributeJson,
      customInitChild,
      getFieldsValue,
    }),
    [CodingRulesDs]
  );

  // 初始化
  const customInitChild = initData => {
    const formData = {
      ruleName: initData?.codeRuleVO?.ruleName,
      ruleCode: initData?.codeRuleVO?.ruleCode,
      sequenceIsolationLevel: initData?.sequenceIsolationLevel,
      isolationVariables: initData?.isolationVariables,
    };
    const valueList = initData?.codeRuleVO?.ruleDetailVOList.map(i => dealRuleData(i));
    const data = {
      ...initData,
      useFlag: initData?.codeRuleVO?.useFlag,
      optionSettings: '_exitCodeRule',
      ruleFormDS: [formData],
      ruleListDS: valueList,
    };
    setCurFieldCode(initData?.businessObjectFieldCode);
    // eslint-disable-next-line no-unused-expressions
    CodingRulesDs?.loadData([data]);
  };

  // 获取后端数据库中不存在的字段属性
  const getAttributeJson = () => {
    return {
      // 传给后端数据库中不存在的字段信息
      helpText: CodingRulesDs.current?.get('helpText'),
      readOnlyFlag: CodingRulesDs.current?.get('readOnlyFlag'),
    };
  };

  const addRuleCom = (
    <Form dataSet={addRuleDs} labelLayout={LabelLayout.float}>
      <Select
        name="addRuleList"
        optionsFilter={optionRecord => {
          const flag = ruleListDs.some(ele => ele.get('fieldType') === 'SEQUENCE');
          if (optionRecord.toData().value === SEQUENCE && flag) {
            return false;
          }
          return true;
        }}
      />
    </Form>
  );

  const openAddRuleModel = () => {
    addRuleModal = Modal.open({
      title: (
        <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>
          {intl.get('hmde.bo.field.codingRule.addRule').d('添加规则')}
        </div>
      ),
      key: Modal.key(),
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      children: addRuleCom,
      afterClose: () => {
        // eslint-disable-next-line no-unused-expressions
        addRuleDs?.current?.reset();
      },
    });
  };

  // 重置规则
  const resetCodeRule = async () => {
    const msg =
      '该操作将取消当前字段与编码规则的关联，若此字段编码规则已使用，更改规则将影响序号的连续性，您确定解除绑定吗？';
    // const submitOk = (await confirm(msg, 'small')) === 'ok';
    // if (!submitOk) {
    //   return;
    // }
    Modal.open({
      title: (
        <div>
          <Icon
            type="warning"
            style={{ marginRight: 16, fontSize: '18px', color: 'rgb(248 157 19)' }}
          />
          {intl.get('hmde.bo.field.codingRule.deleteRule').d('解除绑定规则编码')}
        </div>
      ),
      destroyed: true,
      children: msg,
      closable: true,
      onOk: async () => {
        const flag = isTenant && isExtensionField;
        const serviceName = flag ? tenantExtendResetCodeRuleService : resetCodeRuleService;
        return serviceName(
          flag
            ? CodingRulesDs.current?.get('inheritFieldId')
            : CodingRulesDs.current?.get('businessObjectFieldId')
        ).then(res => {
          if (getResponse(res)) {
            notification.success({
              // message: intl.get('hmde.common.status.success').d('操作提示'),
              description: intl.get('hmde.bo.export.success').d('重置成功'),
              placement: 'bottomRight',
            });
            parentInit();
            resetStatusRef.current = true;
          }
        });
      },
    });
  };

  return (
    <Observer>
      {() => (
        <>
          <Form
            dataSet={CodingRulesDs}
            columns={2}
            useColon={false}
            // labelWidth="auto" // 甄云环境因ued样式文件不同而出现样式错误问题
            labelLayout={LabelLayout.float}
            disabled={disabled} // 标准字段均禁用
          >
            <IntlField
              name={isTenant && isExtensionField ? 'inheritFieldName' : 'businessObjectFieldName'}
              suffix={<Icon type="language" />}
            />
            {isExtensionField ? <Lov name="businessObjectField" hidden={isEditMode} /> : null}
            <TextField
              disabled={isEditMode || (isExtensionField && isEditMode)}
              name={isTenant && isExtensionField ? 'inheritFieldCode' : 'businessObjectFieldCode'}
            />
            <MultiIntlField
              name="helpText"
              record={CodingRulesDs.current}
              init={CodingRulesDs.current?.get('helpText')}
              disabled={disabled || (isEditMode && isTenant && !isExtensionField)}
              textFieldStyle={{ height: '85px' }}
            />
            {/* <Output
              name="helpText"
              key="helpText"
              colSpan={1}
              disabled
              newLine
              renderer={({ record }) => {
                return (
                  <MultiIntlField
                    name="helpText"
                    record={record}
                    init={record?.get('helpText')}
                    disabled={disabled || (isEditMode && isTenant && !isExtensionField)}
                    textFieldStyle={{ height: '85px' }}
                  />
                );
              }}
            /> */}
            <IntlField
              name="remark"
              colSpan={1}
              style={{ height: '85px' }}
              suffix={<Icon type="language" />}
              disabled={disabled || (isEditMode && isTenant && !isExtensionField)}
            />
            <NumberField name="maxLength" />
            {
              <>
                {isEditMode && ruleListDs.length > 0 && (
                  <Output
                    name="optionTitle"
                    renderer={() => (
                      <Button
                        onClick={resetCodeRule}
                        disabled={isTenant && isEditMode && !isExtensionField}
                        // disabled={CodingRulesDs.current?.get('useFlag')}
                      >
                        {intl
                          .get('hmde.bo.field.optionSettings.resetCodeRule')
                          .d('解除绑定编码规则')}
                      </Button>
                    )}
                  />
                )}
                {(!isEditMode ||
                  resetStatusRef.current ||
                  (isEditMode && ruleListDs.length === 0)) && (
                  <SelectBox
                    name="optionSettings"
                    disabled={disabled || (isTenant && isEditMode && !isExtensionField)}
                  >
                    <Option value="_exitCodeRule">
                      {intl.get('hmde.bo.field.optionSettings.valueList').d('已有编码规则')}
                    </Option>
                    <Option value="_createCodeRule">
                      {intl.get('hmde.bo.field.optionSettings.custom').d('创建编码规则')}
                    </Option>
                  </SelectBox>
                )}
              </>
            }
          </Form>
          <div className={styles['row-custom']}>
            {(resetStatusRef.current || !isEditMode || (isEditMode && ruleListDs.length === 0)) &&
            CodingRulesDs.current?.get('optionSettings') === '_exitCodeRule' ? (
              <Lov
                dataSet={lovDs}
                name="selectCodeRule"
                // mode={ViewMode.button}
                placeholder={intl
                  .get('hmde.bo.field.optionSettings.selectRuleCode')
                  .d('选择已有编码规则')}
                disabled={
                  disabled ||
                  CodingRulesDs.current?.get('useFlag') ||
                  (isTenant && isEditMode && !isExtensionField)
                }
                noCache
              />
            ) : // <Lov
            //   dataSet={lovDs}
            //   name="selectCodeRule"
            //   mode={ViewMode.button}
            //   clearButton={false}
            //   disabled={
            //     disabled ||
            //     CodingRulesDs.current?.get('useFlag') ||
            //     (isTenant && isEditMode && !isExtensionField)
            //   }
            //   noCache
            // >
            //   {intl.get('hmde.bo.field.optionSettings.selectRuleCode').d('选择已有编码规则')}
            // </Lov>
            null}
            {CodingRulesDs.current?.get('optionSettings') === '_createCodeRule' ||
            ruleListDs.length ? (
              <>
                <Form
                  dataSet={ruleFormDs}
                  labelLayout={LabelLayout.float}
                  columns={2}
                  disabled={disabled || (isTenant && isEditMode && !isExtensionField)}
                >
                  <TextField name="ruleName" colSpan={1} disabled={cantEditOtherTenant} />
                  <TextField
                    name="ruleCode"
                    disabled={
                      (!resetStatusRef.current && isEditMode) ||
                      CodingRulesDs.current?.get('useFlag') ||
                      cantEditOtherTenant
                    }
                    colSpan={1}
                  />
                  <Select
                    name="sequenceIsolationLevel"
                    colSpan={1}
                    disabled={CodingRulesDs.current?.get('useFlag')}
                  />
                  {ruleFormDs.current?.get('sequenceIsolationLevel') === 'TENANT_VARIABLE' && (
                    <Select
                      multiple
                      name="isolationVariables"
                      colSpan={1}
                      disabled={CodingRulesDs.current?.get('useFlag')}
                    >
                      {ruleListDs
                        .filter(i => i.get('fieldType') === VARIABLE)
                        .map(i => (
                          <Option value={i.get('variableKey')}>{i?.get('ruleName')}</Option>
                        ))}
                    </Select>
                  )}
                </Form>
                <div className={styles['row-custom-header']} style={{ marginTop: '16px' }}>
                  <span>{intl.get('hmde.bo.field.optionSettings.customRule').d('编码规则')}</span>
                  <a
                    style={{ display: 'flex', alignItems: 'center' }}
                    disabled={
                      disabled ||
                      CodingRulesDs.current?.get('useFlag') ||
                      (isTenant && isEditMode && !isExtensionField) ||
                      cantEditOtherTenant
                    }
                    onClick={openAddRuleModel}
                  >
                    <Icon type="add" />
                    {intl.get('hmde.bo.field.valueList.code.createRule').d('添加规则')}
                  </a>
                </div>
                <CodeRulesList
                  standardFlag
                  ruleListDs={ruleListDs}
                  disabled={
                    disabled ||
                    CodingRulesDs.current?.get('useFlag') ||
                    (isTenant && isEditMode && !isExtensionField) ||
                    cantEditOtherTenant
                  }
                  businessObjectCode={businessObjectCode}
                  curFieldCode={curFieldCode}
                />
              </>
            ) : null}
          </div>
          <Form
            dataSet={CodingRulesDs}
            columns={2}
            useColon={false}
            labelLayout={LabelLayout.float}
            disabled={disabled}
          >
            {/* <Switch name="readOnlyFlag" /> */}
            <CheckBox
              name="requiredFlag"
              disabled={
                isTenant &&
                isEditMode &&
                !isExtensionField &&
                CodingRulesDs.current?.get('platformFieldRequiredFlag')
              }
            />
            <CheckBox
              key="exportableFlag"
              name="exportableFlag"
              disabled={isTenant && isEditMode && !isExtensionField}
            />
          </Form>
        </>
      )}
    </Observer>
  );
}

export default formatterCollections({ code: ['hmde.common', 'hzero.common', 'hmde.bo'] })(Index);
