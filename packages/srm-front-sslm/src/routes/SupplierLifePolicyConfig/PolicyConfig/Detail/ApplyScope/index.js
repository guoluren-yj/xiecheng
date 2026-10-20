/*
 * @Date: 2022-09-20 16:39:03
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, {
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
  useState,
} from 'react';
import { isEmpty, isArray } from 'lodash';
import { Table, Lov, Icon, useDataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import GeneralForm from '@/routes/components/GeneralForm';
import { assignCompany } from '@/services/supplierLifePolicyConfigService';
import RuleConfiguration from '@/routes/components/RuleConfiguration';
import { isJSON, getConditionType, getOperatorType } from '@/routes/components/utils';
import { getCompanyDS, getCompanyColumns } from '../../stores/getApplyScopeDS';
import styles from './index.less';

// 适用数据只读
const ViewApplyData = ({ dataSource }) => {
  const conditionType = getConditionType();
  const operatorType = getOperatorType();
  const condition = dataSource.conditionJson && JSON.parse(dataSource.conditionJson);

  // 获取条件值
  const getRuleValue = rightValueMeaning => {
    if (isJSON(rightValueMeaning)) {
      const rightValue = JSON.parse(rightValueMeaning);
      return isArray(rightValue) ? rightValue.toString() : rightValue;
    } else {
      return rightValueMeaning;
    }
  };

  return condition ? (
    <Fragment>
      <div className={styles['condition-wrap']}>
        <div className={styles['condition-title']}>
          {intl.get('sslm.common.model.rulesDefinition.conditionType').d('策略逻辑')}
        </div>
        <div className={styles['condition-content']}>{conditionType[condition.conditionType]}</div>
      </div>
      {condition.conditionLines && (
        <div className={styles['condition-wrap']}>
          <div className={styles['condition-title']}>
            {intl.get('sslm.common.title.rule').d('条件')}
          </div>
          <div className={styles['condition-content']}>
            {condition.conditionLines.map((conditionLine, index) => {
              return (
                <div className={styles['condition-content-item']}>
                  {`#${index + 1} ”${conditionLine.fieldDefinition.label}“ ${
                    operatorType[conditionLine.operator]
                  } ${getRuleValue(conditionLine.rightValueMeaning)}`}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {condition.customizeConditionCombination && (
        <div className={styles['condition-wrap']}>
          <div className={styles['condition-title']}>
            {intl.get('sslm.common.model.combination.rules').d('组合规则')}
          </div>
          <div className={styles['condition-content']}>
            {condition.customizeConditionCombination}
          </div>
        </div>
      )}
    </Fragment>
  ) : null;
};

const ControlDimension = ({ strategyId, dataSet, dataSource, isEdit = true }, ref) => {
  const ruleRef = useRef(null);
  const [conditionJson, setConditionJson] = useState('');
  const [companyFlag, setCompanyFlag] = useState(false);
  const [configCenterDimensionCode, setConfigCenterDimensionCode] = useState('');
  const companyDs = useDataSet(() => getCompanyDS({ strategyId, isEdit }), [strategyId, isEdit]);

  useEffect(() => {
    const {
      dimensionCode,
      conditionJson: newConditionJson,
      configCenterDimensionCode: newConfigCenterDimensionCode,
    } = dataSource;
    setCompanyFlag(dimensionCode === 'COMPANY' && newConfigCenterDimensionCode !== 'GROUP');
    setConditionJson(newConditionJson);
    setConfigCenterDimensionCode(newConfigCenterDimensionCode); // 配置中心管控维度
    const newData = dataSource;
    // 当配置中心生命周期管控维度为”集团级“时，前端强制展示集团级
    // 此时后端接口返回可能是公司级，调保存或发布接口时再更新为集团级
    // 处理配置中心由公司级=>两者都有=>集团级的bug
    if (newConfigCenterDimensionCode === 'GROUP') {
      newData.dimensionCode = 'GROUP';
    }
    dataSet.create(newData);
  }, [dataSource]);

  useImperativeHandle(ref, () => {
    return {
      getSaveParams,
    };
  });

  // 分配公司回调
  const handleAssignCompany = useCallback(() => {
    const lovDs = companyDs.getField('assignCompany')?.getOptions(companyDs.current);
    const selectedRows = (lovDs?.selected || []).map(record => record.toData());
    if (isEmpty(selectedRows)) {
      notification.warning({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    } else {
      return new Promise((resolve, reject) => {
        assignCompany({
          strategyId,
          selectedRows,
        }).then(response => {
          const res = getResponse(response);
          if (res) {
            resolve();
            notification.success();
            companyDs.query();
            Modal.destroyAll();
          } else {
            reject();
          }
        });
      });
    }
  }, [strategyId, companyDs]);

  // 获取内部管理维度-公司级Table按钮
  const getManageCompanyButtons = useCallback(() => {
    return isEdit
      ? [
        <Lov
          mode="button"
          viewMode="drawer"
          name="assignCompany"
          clearButton={false}
          dataSet={companyDs}
          onBeforeSelect={() => false}
          modalProps={{
              // 给确认按钮加loading
              onOk: () => handleAssignCompany(),
              beforeOpen: () => {
                const lovDs = companyDs.getField('assignCompany')?.getOptions(companyDs.current);
                if (lovDs) {
                  lovDs.unSelectAll();
                  lovDs.clearCachedSelected();
                }
              },
            }}
          tableProps={{
              style: {
                maxHeight: 'calc(100vh - 160px)',
              },
            }}
        >
          <Icon type="playlist_add" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
          {intl.get('sslm.supplierLifePolicyConfig.modal.tabTitle.asignCompany').d('分配公司')}
        </Lov>,
          'delete',
        ]
      : [];
  }, [isEdit, companyDs]);

  //  适用范围 改变的回调
  const handleScopeChange = useCallback(value => {
    setCompanyFlag(value === 'COMPANY');
  }, []);

  // 保存回调
  const getSaveParams = useCallback(async () => {
    const { conditionRuleDs, conditionJsonDs, customizeConditionCombinationDs } = ruleRef.current;
    const validateFlag =
      (await conditionRuleDs.validate()) &&
      (await conditionJsonDs.validate()) &&
      (await customizeConditionCombinationDs.validate());
    if (validateFlag) {
      const { conditionType } = conditionRuleDs?.current?.toData() || {};
      const { customizeConditionCombination } =
        customizeConditionCombinationDs?.current?.toData() || {};
      const conditionLines = conditionType === 'TRUE' ? [] : conditionJsonDs?.toData() || [];
      const params = {
        ...(conditionRuleDs?.current?.toData() || {}),
        conditionLines,
        customizeConditionCombination:
          conditionType === 'TRUE' ? '' : customizeConditionCombination,
      };
      if (conditionType !== 'TRUE' && isEmpty(conditionLines)) {
        notification.error({
          message: intl
            .get('sslm.supplierLifePolicyConfig.view.message.atLeastOneRules')
            .d('至少维护一行策略逻辑'),
        });
        return;
      }
      const payload = {
        strategyId,
        ...dataSet.current.toJSONData(),
        conditionJson: JSON.stringify(params),
      };
      return payload;
    } else {
      notification.error({
        message: intl
          .get('sslm.supplierLifePolicyConfig.view.message.checkApplyData')
          .d('请检查适用数据是否填写有误'),
      });
      return false;
    }
  }, [strategyId]);

  const fields = [
    {
      name: 'dimensionCode',
      componentType: 'SELECTBOX',
      onChange: handleScopeChange,
      optionsFilter: record => {
        if (configCenterDimensionCode === 'GROUP') {
          return record.get('value') !== 'COMPANY';
        } else {
          return true;
        }
      },
    },
  ];

  return (
    <Fragment>
      <GeneralForm isEdit={isEdit} fields={fields} dataSet={dataSet} style={{ marginBottom: 16 }} />
      <Table
        pristine
        dataSet={companyDs}
        columns={getCompanyColumns}
        buttons={getManageCompanyButtons()}
        customizedCode="SSLM.SUPPLIER_LIFE_POLICY_CONFIG.APPLY_SCOPE"
        style={{
          display: companyFlag ? 'block' : 'none',
          maxHeight: 430,
        }}
      />
      {isEdit ? (
        <div style={{ width: '75%', maxWidth: 1172 }}>
          <RuleConfiguration
            ref={ruleRef}
            conditionJson={conditionJson}
            type="sslm_life_cycle_startegy_condition_config"
          />
        </div>
      ) : (
        <ViewApplyData dataSource={dataSource} />
      )}
    </Fragment>
  );
};

export default forwardRef(ControlDimension);
