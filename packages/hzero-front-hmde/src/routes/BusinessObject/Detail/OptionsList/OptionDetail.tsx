/*
 * @Descripttion: 值列表项——详情
 * @Date: 2021-08-10 22:49:20
 * @Author: ZHIJIAN.XU@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useMemo, useState } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { Button, DataSet, Form, Output, Switch } from 'choerodon-ui/pro';
import { FormLayout, LabelAlign } from 'choerodon-ui/pro/lib/form/enum';
import { Tooltip } from 'choerodon-ui';
import moment from 'moment';
import DrillComponent from '@/components/DrillComponent';

import { SourceType } from '@/businessGlobalData/common';
import TrueOrFalseRender from '@/businessComponents/TrueOrFalseRender';
import { formDs } from '@/stores/BusinessObject/OptionListDS';
import ImgIcon from '@/utils/ImgIcon';
import { IFieldProps } from './SelectFieldsModal/SelectFields';

import styles from '../index.less';

interface IOptionDetailProps {
  domainId: string; // 领域ID
  sourceType: string;
  businessObjectId: string; // 业务对象ID
  businessObjectCode: string; // 业务对象编码
  businessObjectTenantId?: string | number; // 业务对所属租户ID
  optionId: string; // 业务对象选项集主键————页面状态 ： true(编辑) | false(新建)
}
const Option = ({
  domainId,
  businessObjectId,
  businessObjectCode,
  optionId,
  sourceType,
  businessObjectTenantId,
}: IOptionDetailProps) => {
  const optionItemDs = useMemo(
    () =>
      new DataSet(
        formDs({
          domainId,
          boId: businessObjectId,
          businessObjectCode,
          optionId,
          businessObjectTenantId,
        })
      ),
    []
  );

  useEffect(() => {
    optionItemDs.query();
  }, [optionId]);

  const [fieldsData, queryFieldsData] = useMemo(
    () => [
      (
        optionItemDs.current?.toData?.()?.businessObjectOptionFieldList || ([] as IFieldProps[])
      )?.sort((a, b) => a?.orderSeq - b?.orderSeq),
      (optionItemDs.current?.toData?.().businessObjectOptionFieldList || ([] as IFieldProps[]))
        ?.filter(({ queryFieldFlag }) => queryFieldFlag)
        ?.sort((a, b) => a?.queryOrderSeq - b?.queryOrderSeq),
    ],
    [optionItemDs.current?.toData()]
  );

  const valueTypeHidden = operatorType => {
    return ['IS_NULL', 'IS_NOT_NULL', 'IS_TRUE', 'IS_FALSE'].includes(operatorType);
  };

  return (
    <>
      <Form dataSet={optionItemDs} columns={2} useColon={false} labelAlign={LabelAlign.left}>
        <Output name="businessObjectOptionName" />
        <Output name="businessObjectOptionCode" />
        <Output name="tenant" hidden={isTenantRoleLevel()} />
        <Output name="displayFieldCode" />
        <Output name="title" />
        <Output name="pageSize" />
        {sourceType === SourceType.PREDEFINE ? (
          <Output
            name="enabledFlag"
            renderer={({ record }) => (
              <TrueOrFalseRender trueOrFalse={record?.get('enabledFlag')} />
            )}
          />
        ) : (
          <Switch name="enabledFlag" readOnly />
        )}
        <Output
          label={intl.get('hmde.bo.option.optionFields').d('视图字段')}
          required
          newLine
          renderer={() => (
            <Button
              style={{
                borderStyle: 'dashed',
                display: 'flex',
                alignItems: 'center',
                cursor: 'auto',
              }}
              disabled
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
      <Form dataSet={optionItemDs} columns={2} useColon={false} labelAlign={LabelAlign.left}>
        <Output name="remark" colSpan={2} />
        <Output
          name="businessObjectOptionCondList"
          renderer={() => (
            <Button
              style={{
                borderStyle: 'dashed',
                display: 'flex',
                alignItems: 'center',
                cursor: 'auto',
              }}
              disabled
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
                  className={styles['option-condition']}
                  layout={FormLayout.none}
                >
                  <span>{index + 1}</span>
                  <FieldPath>
                    <DrillComponent
                      businessObjectCode={businessObjectCode}
                      initValue={record?.get('fieldPath') || ''}
                      name="fieldPath"
                      readOnly
                    />
                  </FieldPath>
                  <span className={styles['condition-line']} />
                  <Output name="operatorType" />
                  <span
                    className={styles['condition-line']}
                    hidden={valueTypeHidden(record?.get('operatorType'))}
                  />
                  <Output name="valueType" hidden={valueTypeHidden(record?.get('operatorType'))} />
                  <span
                    className={styles['condition-line']}
                    hidden={valueTypeHidden(record?.get('operatorType'))}
                  />
                  {record?.get('valueType') === 'FIELD' ? (
                    <FieldPath>
                      <DrillComponent
                        businessObjectCode={businessObjectCode}
                        initValue={record?.get('value') || ''}
                        name="value"
                        readOnly
                      />
                    </FieldPath>
                  ) : (
                    <Output
                      name="value"
                      multiple={
                        Array.isArray(toJS(record?.get('value'))) &&
                        !toJS(record?.get('value'))?.every(item => moment.isMoment(item))
                      }
                      range={
                        Array.isArray(toJS(record?.get('value'))) &&
                        toJS(record?.get('value'))?.every(item => moment.isMoment(item))
                      }
                      hidden={valueTypeHidden(record?.get('operatorType'))}
                    />
                  )}
                </Form>
              );
            })}
        </div>
      )}
      <Form dataSet={optionItemDs} columns={2} useColon={false} labelAlign={LabelAlign.left}>
        <Output name="logicFormula" />
      </Form>
    </>
  );
};

const FieldPath = ({ children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <Tooltip visible={visible} title={children} arrowPointAtCenter>
      <span
        style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
        onMouseEnter={e => {
          if ((e.target as any).scrollWidth > (e.target as any).offsetWidth) {
            setVisible(true);
          }
        }}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>
    </Tooltip>
  );
};

export default formatterCollections({ code: ['hmde.bo', 'hmde.common', 'hzero.common'] })(
  observer(Option)
);
