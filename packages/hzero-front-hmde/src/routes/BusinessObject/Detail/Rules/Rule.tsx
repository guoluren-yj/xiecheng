import React, { useEffect, useMemo, useState } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'hzero-front/lib/components/Page';
import qs from 'querystring';
import {
  DataSet,
  Button,
  Spin,
  Form,
  IntlField,
  TextField,
  Switch,
  Select,
  Lov,
  Output,
} from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { ViewMode } from 'choerodon-ui/pro/lib/radio/enum.d';
import SectionTitle from '@/businessComponents/SectionTitle';
import { formDs, RuleType } from '@/stores/BusinessObject/RulesDS';

import DragOrderContent from './DragOrderContent';
import styles from './index.less';

const Rule = props => {
  const { history } = props;
  let _search = props.location.search.split('?')?.[1];
  _search = qs.parse(_search);
  const {
    businessObjectId,
    ruleId,
    businessObjectCode,
    cacheTotalCount,
    businessObjectName,
    domainId,
  } = _search || {};

  const tenantReadOnly = isTenantRoleLevel() && ruleId;

  const formDS = useMemo(
    () =>
      new DataSet(
        formDs({ businessObjectId, ruleId, businessObjectCode, cacheTotalCount }) as DataSetProps
      ),
    [businessObjectId, ruleId]
  );

  const [selectFields, setSelectFields] = useState<any>(null);

  const load = ({ dataSet }) => {
    const validRuleFields = dataSet.current?.get('validRuleFields');
    // eslint-disable-next-line no-unused-expressions
    dataSet.current?.set('updateStatus', true); // 更新 record status (sync => update) 使得能够不做任何修改保存
    if (dataSet.current?.get('ruleType') === RuleType.RECHECK_RULE && validRuleFields) {
      setSelectFields(validRuleFields?.toJS());
    }
  };

  useEffect(() => {
    const update = ({ record, value, name }) => {
      if (name === 'validRuleFields' && record.get('ruleType') === RuleType.RECHECK_RULE) {
        setSelectFields(value?.length ? value : null);
      }
      if (name === 'ruleType' && record.get('validRuleFields')) {
        record.set('validRuleFields', null);
        setSelectFields(null);
      }
    };

    formDS.addEventListener('update', update);
    formDS.addEventListener('load', load);

    return () => {
      formDS.removeEventListener('update', update);
      formDS.removeEventListener('load', load);
    };
  }, [formDS]);

  // console.log('init record', formDS.dirty, formDS.current?.dirty, formDS.current?.status);

  const handleSave = async () => {
    const flag = await formDS.validate();
    if (!flag) return;

    try {
      const res = await formDS.submit();
      if (!res?.failed) {
        props.history.push({
          pathname: `/hmde/business-object/detail/${businessObjectId}`,
          state: {
            originKey: 'rules',
          },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 获取标题
  const getTitle = () => {
    return (
      <>
        <span
          className={styles['head-bo']}
          onClick={() => {
            history.push('/hmde/business-object/list');
            if (domainId) {
              location.hash = domainId;
            }
          }}
        >
          {intl.get('hmde.bo.model.businessObject').d('业务对象')}/
        </span>
        <span
          className={styles['head-title']}
          onClick={() =>
            history.push({
              pathname: `/hmde/business-object/detail/${businessObjectId}`,
              state: { originKey: 'rules' },
            })
          }
        >
          {businessObjectName}-{intl.get('hmde.bo.view.message.tab.businessRule').d('业务规则')}
        </span>
        <>
          /
          <span className={styles['head-title-last']}>
            {!ruleId
              ? intl.get('hmde.bo.rules.buttom.addFieldValidateRule').d('新增字段校验规则')
              : intl.get('hmde.bo.rules.buttom.editFieldValidateRule').d('编辑字段校验规则')}
          </span>
        </>
      </>
    );
  };

  return (
    <>
      <Header
        title={getTitle()}
        // backPath={`/hmde/business-object/detail/${businessObjectId}`}
        // onBack={() => {
        //   props.history.push({
        //     state: {
        //       originKey: 'rules',
        //     },
        //   });
        // }}
        // title={`${intl.get('hmde.bo.tab.title').d('业务对象')}/${intl
        //   .get('hmde.bo.rule.button.create')
        //   .d('新增字段校验规则')}`}
      />
      <Content>
        <Spin dataSet={formDS}>
          <SectionTitle title={intl.get('hmde.bo.rule.title.ruleDefine').d('规则定义')}>
            <Button hidden={tenantReadOnly} onClick={handleSave}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </SectionTitle>
          <Form dataSet={formDS} columns={3}>
            <Output
              name="ruleName"
              colSpan={1}
              renderer={({ name, text }) =>
                tenantReadOnly ? text : <IntlField name={name} style={{ width: '100%' }} />
              }
            />
            <TextField
              name="ruleCode"
              colSpan={1}
              hidden={!!ruleId}
              addonBefore={`${businessObjectCode}_`}
            />
            <Output name="ruleCode" colSpan={1} hidden={!ruleId} />
            <Output
              name="ruleType"
              colSpan={1}
              renderer={({ name, text }) =>
                tenantReadOnly ? (
                  text
                ) : (
                  <Select name={name} style={{ width: '100%' }} clearButton={false} />
                )
              }
            />
            <Output
              name="remark"
              colSpan={1}
              renderer={({ name, text }) =>
                tenantReadOnly ? (
                  text
                ) : (
                  <IntlField name={name} colSpan={2} style={{ width: '100%' }} />
                )
              }
            />
            <Switch name="enabledFlag" colSpan={1} readOnly={tenantReadOnly} />
          </Form>
          <SectionTitle title={intl.get('hmde.bo.rule.title.ruleEditing').d('规则编辑')} />
          <Form dataSet={formDS} columns={5}>
            {formDS.current?.get('ruleType') === RuleType.RECHECK_RULE && (
              <Lov
                name="validRuleFields"
                colSpan={1}
                multiple
                label={intl.get('hmde.bo.rule.recheckField').d('查重字段')}
                icon="add"
                mode={ViewMode.button as any}
                clearButton={false}
                readOnly={tenantReadOnly}
              >
                {intl.get('hmde.bo.rule.view.title.addField').d('添加字段')}
              </Lov>
            )}
            {formDS.current?.get('ruleType') === RuleType.REGEXP_VALIDATE && (
              <>
                <Output
                  name="validRuleFields"
                  colSpan={2}
                  label={intl.get('hmde.bo.rule.selectField').d('选择字段')}
                  renderer={({ name, text }) =>
                    tenantReadOnly ? text : <Lov name={name} style={{ width: '100%' }} />
                  }
                />
                <Output
                  name="regularRules"
                  colSpan={2}
                  renderer={({ name, text }) =>
                    tenantReadOnly ? text : <Select name={name} style={{ width: '100%' }} />
                  }
                />
                <Output
                  newLine
                  name="formula"
                  colSpan={2}
                  renderer={({ name, text }) =>
                    tenantReadOnly ? text : <TextField name={name} style={{ width: '100%' }} />
                  }
                />
              </>
            )}
          </Form>
          {selectFields && (
            <DragOrderContent
              selectFields={selectFields}
              formDS={formDS}
              tenantReadOnly={tenantReadOnly}
            />
          )}
          <SectionTitle title={intl.get('hmde.bo.rule.title.errorRule').d('报错规则')} />
          <Form dataSet={formDS} columns={5}>
            <Output
              name="errorInfo"
              colSpan={4}
              renderer={({ name, text }) =>
                tenantReadOnly ? text : <IntlField name={name} style={{ width: '100%' }} />
              }
            />
          </Form>
        </Spin>
      </Content>
    </>
  );
};

export default formatterCollections({ code: ['hmde.bo', 'hmde.common', 'hzero.common'] })(
  observer(Rule)
);
