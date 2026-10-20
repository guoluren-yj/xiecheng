/*
 * @Descripttion: 值列表项——编辑、新建组件
 * @Date: 2021-08-10 22:49:20
 * @Author: ZHIJIAN.XU@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useMemo, useState } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { getCurrentTenant, getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import {
  Button,
  DataSet,
  Form,
  NumberField,
  Output,
  Select,
  TextField,
  Modal,
  DatePicker,
  DateTimePicker,
  IntlField,
  Icon,
  Lov,
} from 'choerodon-ui/pro';
import { FormLayout, LabelAlign, LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Tooltip } from 'choerodon-ui';
import DrillComponent, { EDrillMainKeyType } from '@/components/DrillComponent';

import { formDs, optionFieldDs } from '@/stores/BusinessObject/OptionListDS';
import ImgIcon from '@/utils/ImgIcon';
import SelectFieldsModal from './SelectFieldsModal';
import { IFieldProps } from './SelectFieldsModal/SelectFields';

import styles from '../index.less';

function getOptionFieldsStyle(length) {
  return length
    ? {}
    : {
        borderColor: '#d50000',
        borderStyle: 'solid',
        backgroundColor: '#fcebeb',
        color: '#d50000',
      };
}
const SelectFieldModalKey = Modal.key();
const tenant = getCurrentTenant();

interface IOptionDetailProps {
  modal: any;
  domainId: string; // 领域ID
  businessObjectId: string; // 业务对象ID
  businessObjectCode: string; // 业务对象编码
  title?: string; // 业务对象名称
  businessObjectTenantId?: string | number; // 业务对所属租户ID
  optionId?: string; // 业务对象选项集主键————页面状态 ： true(编辑) | false(新建)
  optionsListDs: DataSet;
  domainCode: any;
  copy?: boolean;
  editFlag?: boolean; // 老板的口头需求：如果是编辑状态，【显示字段】不能更改，所以在这里打了一个编辑的标记
}
const Option = ({
  modal,
  domainId,
  businessObjectId,
  businessObjectCode,
  title,
  optionId,
  optionsListDs,
  domainCode,
  businessObjectTenantId,
  copy = false,
  editFlag = false,
}: IOptionDetailProps) => {
  const optionItemDs = useMemo(
    () =>
      new DataSet({
        ...formDs({
          domainId,
          boId: businessObjectId,
          businessObjectCode,
          optionId,
          domainCode,
          businessObjectTenantId,
          copy,
        }),
        events: {
          update: ({ name, value, record }) => {
            if (name === 'pageSize' && !value) {
              record.set('pageSize', 10);
            }
            if (name === 'title' && !value) {
              record.set('title', title);
            }
          },
        },
      }),
    []
  );

  const [optionFieldsStyle, setOptionFieldStyle] = useState({});
  const optionFieldListDs = useMemo(
    () =>
      new DataSet({
        ...optionFieldDs(),
        events: {
          update: ({ name, value, record }) => {
            // if (name === 'displayName' && !value) {
            //   record.set(name, record.get('businessObjectFieldName'));
            // }
            if (name === 'tableFieldWidth' && !value) {
              record.set(name, 200);
            }
          },
        },
      }),
    []
  );

  useEffect(() => {
    if (!optionId) {
      optionItemDs.create({
        // 默认值
        tenant,
        title,
        pageSize: 10,
        enabledFlag: true,
        businessObjectOptionCondList: [],
      });
    } else if (copy && optionId) {
      optionItemDs.query().then(res => {
        if (getResponse(res)) {
          const reg = new RegExp(`^${domainCode}_`);
          optionItemDs.create({
            ...res,
            ...tenant,
            businessObjectOptionCode: res.businessObjectOptionCode.replace(reg, ''),
          });
        }
      });
    } else {
      optionItemDs.query();
    }
  }, [optionId]);

  const [fieldsData, setFieldsData] = useState([] as IFieldProps[]);
  const [queryFieldsData, setQueryFieldsData] = useState([] as IFieldProps[]);

  useEffect(() => {
    const businessObjectOptionFieldList =
      optionItemDs.current?.get('businessObjectOptionFieldList') || [];
    setFieldsData(businessObjectOptionFieldList.sort((a, b) => a?.orderSeq - b?.orderSeq));
    setQueryFieldsData(
      businessObjectOptionFieldList
        .filter(({ queryFieldFlag }) => queryFieldFlag)
        ?.sort((a, b) => a?.queryOrderSeq - b?.queryOrderSeq)
    );
  }, [optionItemDs.current?.get('businessObjectOptionFieldList')]);

  const validateOptionFieldList = data => {
    setOptionFieldStyle(getOptionFieldsStyle(data.length));
    return data.length !== 0;
  };

  modal.handleOk(async () => {
    const validateOptionFields = validateOptionFieldList(fieldsData);
    if ((await optionItemDs.validate()) && validateOptionFields) {
      await optionItemDs.submit();
      await optionsListDs.query();
    } else {
      return false;
    }
  });

  /**
   * 一个生成序号基数的算法
   * 解决的问题：
   * 比如原来的数据顺序：1，2，3
   * 但是后端不支持：1，2，3（顺序没变，但是这个顺序对应的记录变了）；2，3，4；3，4，5 这种类型的顺序
   * 必须生成一个全新的序号，跟原来的数字不能有一样的
   * 解决这个问题的关键在一个基数：只要能解决这个基数问题，就能解决所有问题
   * @param arr
   */
  const getBaseNumber = (arr: any) => {
    const len = arr.length;
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    if (min > len) {
      return 0;
    } else {
      return max + 1;
    }
  };

  const handleSelectFields = () => {
    optionFieldListDs.loadData(fieldsData);
    Modal.open({
      key: SelectFieldModalKey,
      title: intl.get('hmde.bo.option.field.config').d('配置字段'),
      style: { width: '66.5%' },
      bodyStyle: { padding: '0 0.24rem' },
      closable: true,
      border: false,
      autoCenter: true,
      children: (
        <SelectFieldsModal
          optionFieldDs={optionFieldListDs}
          businessObjectCode={businessObjectCode}
        />
      ),
      okFirst: false,
      onOk: () => {
        const businessObjectOptionFieldList =
          (optionFieldListDs.toData() as IFieldProps[]) || ([] as IFieldProps[]);
        const sortedList = businessObjectOptionFieldList.sort((a, b) => a.orderSeq - b.orderSeq);
        const baseNumber = getBaseNumber(sortedList.map(o => o.orderSeq));
        const data = sortedList.map((item, index) => {
          return {
            ...item,
            orderSeq: baseNumber + 1 + index,
          };
        });
        // eslint-disable-next-line no-unused-expressions
        optionItemDs?.current?.set('businessObjectOptionFieldList', data);
        if (optionItemDs.current) {
          if (!data.length) return false;
          validateOptionFieldList(data);
        }
      },
    });
  };

  const setLogicFormula = (deleteFlag = false) => {
    if (optionItemDs.current) {
      const optionConditionList = optionItemDs.children.businessObjectOptionCondList.toData();
      optionItemDs.current.set(
        'logicFormula',
        deleteFlag
          ? optionConditionList?.map((_, i) => i + 1).join(' AND ')
          : `${
              optionItemDs.current.get?.('logicFormula')
                ? `${optionItemDs.current.get?.('logicFormula')} AND `
                : ''
            }${optionConditionList.length}`
      );
    }
  };

  const valueTypeHidden = operatorType => {
    return ['IS_NULL', 'IS_NOT_NULL', 'IS_TRUE', 'IS_FALSE'].includes(operatorType);
  };

  return (
    <>
      <Form dataSet={optionItemDs} columns={1} useColon={false} labelAlign={LabelAlign.left} labelLayout={LabelLayout.float}>
        <IntlField name="businessObjectOptionName" suffix={<Icon type="language" />} />
        {!optionId || copy ? (
          <TextField name="businessObjectOptionCode" addonBefore={`${domainCode}_`} />
        ) : (
          <Output name="businessObjectOptionCode" />
        )}
        <Lov name="tenant" hidden={isTenantRoleLevel() || copy || !!optionId} />
        <Output name="tenant" hidden={isTenantRoleLevel() || !optionId} />
        <Select name="displayFieldCode" disabled={editFlag} noCache />
        <IntlField name="title" suffix={<Icon type="language" />} />
        <NumberField name="pageSize" />
        <Output
          label={intl.get('hmde.bo.option.optionFields').d('视图字段')}
          required
          newLine
          value={optionItemDs.current?.get('businessObjectOptionFieldList')}
          renderer={() => (
            <Button
              style={{
                borderStyle: 'dashed',
                display: 'flex',
                alignItems: 'center',
                ...optionFieldsStyle,
              }}
              onClick={() => handleSelectFields()}
            >
              <ImgIcon name="settings.svg" size={14} style={{ marginRight: 8 }} />
              <span>{intl.get('hmde.bo.option.field.config').d('配置字段')}</span>
            </Button>
          )}
        />
      </Form>
      {!!fieldsData.length && (
        <div className={styles['config-detail']}>
          {!!queryFieldsData.length && (
            <div className={styles['option-query-fields']}>
              {queryFieldsData.map(({ displayName, businessObjectFieldName }) => (
                <span className={styles['option-field']}>
                  {displayName ||
                    businessObjectFieldName?.slice(businessObjectFieldName?.lastIndexOf?.('.') + 1)}
                </span>
              ))}
            </div>
          )}
          <div className={styles['option-columns']}>
            <div className={styles['option-columns-fields']}>
              {fieldsData.map(({ displayName, businessObjectFieldName }) => (
                <span className={styles['option-field']}>
                  {displayName ||
                    businessObjectFieldName?.slice(businessObjectFieldName?.lastIndexOf?.('.') + 1)}
                </span>
              ))}
              {/* <Button icon='settings-o' /> */}
            </div>
          </div>
        </div>
      )}
      <Form dataSet={optionItemDs} columns={1} useColon={false} labelAlign={LabelAlign.left} labelLayout={LabelLayout.float}>
        <IntlField name="remark" colSpan={2} suffix={<Icon type="language" />} />
        <Output
          name="businessObjectOptionCondList"
          renderer={() => (
            <Button
              style={{ borderStyle: 'dashed', display: 'flex', alignItems: 'center' }}
              onClick={async () => {
                if (!(await optionItemDs.children.businessObjectOptionCondList.validate())) return;
                optionItemDs.children.businessObjectOptionCondList.create({});
                setLogicFormula(false);
              }}
            >
              <ImgIcon name="create-new.svg" size={14} style={{ marginRight: 8 }} />
              <span>{intl.get('hmde.bo.option.conditions.add').d('添加条件')}</span>
            </Button>
          )}
        />
      </Form>
      {!!optionItemDs.current?.getCascadeRecords('businessObjectOptionCondList')?.length && (
        <div className={styles['config-detail']}>
          <header className={styles['option-condition']}>
            <span />
            <span>{intl.get('hmde.bo.option.conditions.field').d('过滤字段')}</span>
            <span />
            <span>{intl.get('hmde.bo.option.conditions.operatorType').d('过滤类型')}</span>
            <span />
            <span>{intl.get('hmde.bo.option.conditions.valueType').d('标准类型')}</span>
            <span />
            <span>{intl.get('hmde.bo.option.conditions.value').d('标准值')}</span>
            <span />
          </header>
          {optionItemDs.current
            ?.getCascadeRecords('businessObjectOptionCondList')
            ?.sort((a, b) => a?.get('orderSeq') - b?.get('orderSeq'))
            ?.map((record, index) => {
              return (
                <Form
                  record={record}
                  key={record.key}
                  className={styles['option-condition']}
                  layout={FormLayout.none}
                >
                  <span>{index + 1}</span>
                  <DrillComponent
                    businessObjectCode={businessObjectCode}
                    initValue={record?.get('fieldPath') || ''}
                    name="fieldPath"
                    drillMainKeyType={EDrillMainKeyType.ALL}
                    onOk={res => {
                      if (
                        res?.result?.componentType &&
                        ['RADIO', 'SINGLE_SELECT', 'CHECKBOX', 'MULTIPLE_SELECT'].includes(
                          res?.result?.componentType
                        )
                      ) {
                        record.set('attributeJson', res?.result?.attributeJson);
                        record.set('lovCode', res?.result?.lovCode);
                      } else {
                        record.set('attributeJson', undefined);
                      }
                      record.set('fieldPath', res?.value);
                      if (res?.result?.componentType === 'FORMULA') {
                        const resultTypes = new Map([
                          ['Long', 'NUMBER_FIELD'],
                          ['BigDecimal', 'FLOAT'],
                          ['String', 'TEXT_FIELD'],
                          ['LocalDate', 'DATE_SELECTION_BOX'],
                          ['ZonedDateTime', 'DATETIME_SELECTION_BOX'],
                          ['Boolean', 'SWITCH'],
                        ]);
                        record.set(
                          'componentType',
                          resultTypes.get(res?.result?.attributeJson?.resultType)
                        );
                      } else {
                        record.set('componentType', res?.result?.componentType);
                      }
                    }}
                    onClear={() => record.set('fieldPath', undefined)}
                  />
                  <span className={styles['condition-line']} />
                  <Select
                    name="operatorType"
                    optionsFilter={obj => {
                      const item = obj?.get('value') || '';
                      const arr = [
                        {
                          componentType: ['DATE_SELECTION_BOX'],
                          operatorType: [
                            'EQUAL',
                            'NOT_EQUAL',
                            'BEFORE',
                            'AFTER',
                            'NOT_BEFORE',
                            'NOT_AFTER',
                            'IS_NULL',
                            'IS_NOT_NULL',
                            'BETWEEN',
                            'NOT_BETWEEN',
                            'GREATER_THAN',
                            'GREATER_THAN_OR_EQUAL_TO',
                            'LESS_THAN',
                            'LESS_THAN_OR_EQUAL_TO',
                            'RANGE',
                          ],
                        },
                        {
                          componentType: ['DATETIME_SELECTION_BOX'],
                          operatorType: [
                            'EQUAL',
                            'NOT_EQUAL',
                            'BEFORE',
                            'AFTER',
                            'NOT_BEFORE',
                            'NOT_AFTER',
                            'IS_NULL',
                            'IS_NOT_NULL',
                            'BETWEEN',
                            'NOT_BETWEEN',
                            'GREATER_THAN',
                            'GREATER_THAN_OR_EQUAL_TO',
                            'LESS_THAN',
                            'LESS_THAN_OR_EQUAL_TO',
                            'RANGE',
                          ],
                        },
                        {
                          componentType: ['NUMBER_FIELD', 'FLOAT', 'PERCENTAGE', 'MONEY'],
                          operatorType: [
                            'EQUAL',
                            'NOT_EQUAL',
                            'LESS_THAN',
                            'LESS_THAN_OR_EQUAL_TO',
                            'GREATER_THAN',
                            'GREATER_THAN_OR_EQUAL_TO',
                            'IS_NULL',
                            'IS_NOT_NULL',
                          ],
                        },
                        {
                          componentType: ['RADIO', 'SINGLE_SELECT'],
                          operatorType: [
                            'EQUAL',
                            'NOT_EQUAL',
                            'WHEREIN',
                            'NOT_WHEREIN',
                            'IS_NULL',
                            'IS_NOT_NULL',
                            'IN',
                            'NOT_IN',
                          ],
                        },
                        {
                          componentType: ['CHECKBOX', 'MULTIPLE_SELECT'],
                          operatorType: ['IS_NULL', 'IS_NOT_NULL'],
                        },
                        {
                          componentType: ['SWITCH'],
                          operatorType: [
                            'EQUAL',
                            'NOT_EQUAL',
                            'IS_NULL',
                            'IS_NOT_NULL',
                            'IS_TRUE',
                            'IS_FALSE',
                          ],
                        },
                        {
                          componentType: [
                            'TEXT_FIELD',
                            'TEXT_AREA',
                            // 'SWITCH',
                            'PHONE_NUMBER',
                            'EMAIL',
                            'APPENDIX',
                            'LINK',
                            // 'FORMULA',
                            'LINK_RELATION',
                            'MASTER_RELATION',
                            'REFERENCE_FIELD',
                          ],
                          operatorType: [
                            'EQUAL',
                            'NOT_EQUAL',
                            'IS_NULL',
                            'IS_NOT_NULL',
                            'IN',
                            'NOT_IN',
                            'BEFORE_FUZZY',
                            'AFTER_FUZZY',
                          ],
                        },
                      ];
                      for (const { componentType, operatorType } of arr) {
                        if (componentType.includes(record?.get('componentType'))) {
                          return operatorType.includes(item);
                        }
                      }
                      return false;
                    }}
                  />
                  <span
                    className={styles['condition-line']}
                    style={
                      valueTypeHidden(record?.get('operatorType')) ? { visibility: 'hidden' } : {}
                    }
                    // hidden={valueTypeHidden(record?.get('operatorType'))}
                  />
                  <Select
                    name="valueType"
                    style={
                      valueTypeHidden(record?.get('operatorType')) ? { visibility: 'hidden' } : {}
                    }
                    // hidden={valueTypeHidden(record?.get('operatorType'))}
                    optionsFilter={obj => {
                      const operatorType = record?.get('operatorType');
                      const componentType = record?.get('componentType');
                      const item = obj?.get('value') || '';
                      if (operatorType) {
                        if (componentType === 'SWITCH') {
                          return item === 'FIELD';
                        } else if (['BETWEEN', 'NOT_BETWEEN'].includes(operatorType)) {
                          return item === 'FIXED';
                        } else {
                          return true;
                        }
                      }
                      return false;
                    }}
                  />
                  <span
                    className={styles['condition-line']}
                    style={
                      valueTypeHidden(record?.get('operatorType')) ? { visibility: 'hidden' } : {}
                    }
                    // hidden={valueTypeHidden(record?.get('operatorType'))}
                  />
                  <Output
                    style={
                      valueTypeHidden(record?.get('operatorType')) ? { visibility: 'hidden' } : {}
                    }
                    // hidden={valueTypeHidden(record?.get('operatorType'))}
                    renderer={() => {
                      const componentType = record?.get('componentType');
                      const operatorType = record?.get('operatorType');
                      const valueType = record?.get('valueType');
                      if (valueType === 'FIELD') {
                        return (
                          <DrillComponent
                            name="value"
                            businessObjectCode={businessObjectCode}
                            drillMainKeyType={EDrillMainKeyType.ALL}
                            initValue={record?.get('value') || ''}
                            onOk={res => {
                              record.set('value', res?.value);
                            }}
                            onClear={() => record.set('value', undefined)}
                          />
                        );
                      } else if (valueType === 'FIXED') {
                        // 日期
                        if (['DATE_SELECTION_BOX'].includes(componentType)) {
                          if (
                            [
                              'EQUAL',
                              'NOT_EQUAL',
                              'BEFORE',
                              'AFTER',
                              'NOT_BEFORE',
                              'NOT_AFTER',
                            ].includes(operatorType)
                          ) {
                            return (
                              <DatePicker
                                name="value"
                                format="YYYY-MM-DD"
                                style={{ width: '100%' }}
                              />
                            );
                          } else if (['BETWEEN', 'NOT_BETWEEN'].includes(operatorType)) {
                            return <DatePicker name="value" format="YYYY-MM-DD" range />;
                          }
                        }
                        // 日期时间
                        if (['DATETIME_SELECTION_BOX'].includes(componentType)) {
                          if (
                            [
                              'EQUAL',
                              'NOT_EQUAL',
                              'BEFORE',
                              'AFTER',
                              'NOT_BEFORE',
                              'NOT_AFTER',
                            ].includes(operatorType)
                          ) {
                            return (
                              <DateTimePicker
                                // name="value"
                                value={record?.get('value')}
                                onChange={val => record.set('value', val)}
                                required
                                format="YYYY-MM-DD HH:mm:ss"
                                style={{ width: '100%' }}
                              />
                            );
                          } else if (['BETWEEN', 'NOT_BETWEEN'].includes(operatorType)) {
                            return (
                              <DateTimePicker
                                name="value"
                                range
                                format="YYYY-MM-DD HH:mm:ss"
                                style={{ width: '100%' }}
                              />
                            );
                          }
                        }
                        // 数字
                        if (
                          ['NUMBER_FIELD', 'FLOAT', 'PERCENTAGE', 'MONEY'].includes(componentType)
                        ) {
                          if (
                            [
                              'EQUAL',
                              'NOT_EQUAL',
                              'LESS_THAN',
                              'LESS_THAN_OR_EQUAL_TO',
                              'GREATER_THAN',
                              'GREATER_THAN_OR_EQUAL_TO',
                            ].includes(operatorType)
                          ) {
                            return <NumberField name="value" style={{ width: '100%' }} />;
                          }
                        }
                        // 单选
                        if (['RADIO', 'SINGLE_SELECT'].includes(componentType)) {
                          if (['EQUAL', 'NOT_EQUAL'].includes(operatorType)) {
                            return <Select name="value" style={{ width: '100%' }} />;
                          } else if (['WHEREIN', 'NOT_WHEREIN'].includes(operatorType)) {
                            return <Select name="value" multiple style={{ width: '100%' }} />;
                          }
                        }
                        // 多选
                        if (['CHECKBOX', 'MULTIPLE_SELECT'].includes(componentType)) {
                          if (['IN', 'NOT_IN'].includes(operatorType)) {
                            return <Select name="value" style={{ width: '100%' }} />;
                          }
                        }
                      }
                      return <TextField name="value" style={{ width: '100%' }} />;
                    }}
                  />
                  <ImgIcon
                    // name="delete-black.svg"
                    name="delete-B16@1x.svg"
                    size={16}
                    style={{ marginLeft: 16, cursor: 'pointer' }}
                    onClick={() => {
                      optionItemDs.children.businessObjectOptionCondList
                        .delete(record, false)
                        .then(() => {
                          setLogicFormula(true);
                        });
                    }}
                  />
                </Form>
              );
            })}
        </div>
      )}
      <Form dataSet={optionItemDs} columns={1} useColon={false} labelAlign={LabelAlign.left} labelLayout={LabelLayout.float}>
        <TextField
          name="logicFormula"
          label={
            <>
              <span>{intl.get('hmde.bo.option.logicFormula').d('条件关系')}</span>
              <Tooltip
                title={intl
                  .get('hmde.bo.option.logicFormula.help')
                  .d('使用 AND 和 OR 合并筛选器条件行，示例：(1 AND 2) OR 3')}
                placement="top"
              >
                <ImgIcon name="help@v4.0.svg" size={14} style={{ marginLeft: 4 }} />
              </Tooltip>
            </>
          }
        />
      </Form>
    </>
  );
};

export default formatterCollections({ code: ['hmde.bo', 'hmde.common', 'hzero.common'] })(
  observer(Option)
);
