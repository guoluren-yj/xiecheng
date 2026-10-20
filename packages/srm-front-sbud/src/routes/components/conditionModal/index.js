import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Tooltip, DataSet } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import intl from 'utils/intl';

import styles from './index.less';
import ConditionConfig from './condition';
import { getConditionDs, getCustomizeConditionCombinationDs } from './conditionDs';

export default ({ dataSet, name }) => {
  const [isExist, setExist] = useState(false);
  const [condition, setCondition] = useState({});
  const conditionDs = useMemo(
    () => new DataSet(getConditionDs(dataSet.current.get('budgetItemId'))),
    []
  );

  const validator = (value) => {
    const recordNum = conditionDs.length;
    const conditionNum = [];
    let num = null;
    if (value) {
      for (let i = 0; i < value.length; i++) {
        if (!isNaN(value[i]) && value[i] !== ' ') {
          if (!num) {
            num = value[i];
          } else {
            num = `${num}${value[i]}`;
          }
        } else {
          if (num) {
            conditionNum.push(num);
          }
          num = null;
        }

        if (i === value.length - 1 && num) {
          conditionNum.push(num);
        }
      }

      for (let j = 0; j < conditionNum.length; j++) {
        if (conditionNum[j] > recordNum) {
          return intl
            .get('hpfm.individual.model.config.conditionValidator', {
              no: conditionNum[j],
            })
            .d(`条件${conditionNum[j]}不存在`);
        }
      }
    }
  };

  const customizeConditionCombinationDs = useMemo(
    () => new DataSet(getCustomizeConditionCombinationDs(validator)),
    []
  );

  useEffect(() => {
    if (dataSet && dataSet.current) {
      const conditionData = dataSet.current.get(name);
      if (conditionData && conditionData.conditionLines && conditionData.conditionLines.length) {
        setExist(true);
      }
      setCondition(conditionData || {});
    }
  }, [dataSet]);

  const openModal = async () => {
    const formProps = {
      condition,
      conditionDs,
      customizeConditionCombinationDs,
      dataSet,
    };

    Modal.open({
      key: Modal.key(),
      style: { width: 750 },
      title: intl.get('hpfm.individual.model.config.condition').d('条件配置'),
      children: <ConditionConfig {...formProps} />,
      closable: true,
      movable: false,
      onOk: handleSaveCondition,
      destroyOnClose: true,
    });
  };

  const handleSaveCondition = async () => {
    if (conditionDs.data.length === 0) {
      setCondition({
        ...condition,
        conditionLines: null,
        conditionCombination: null,
      });
      dataSet.current.set({
        [name]: {
          ...condition,
          conditionLines: null,
          conditionCombination: null,
        },
      });
      setExist(false);
    } else {
      const conditionFlag = await conditionDs.validate();
      const combinationFlag = await customizeConditionCombinationDs.validate();
      if (conditionFlag && combinationFlag) {
        setCondition({
          ...condition,
          conditionLines: conditionDs.toData(),
          conditionCombination: customizeConditionCombinationDs.current.get('conditionCombination'),
        });
        setExist(true);
        dataSet.current.set({
          [name]: {
            ...condition,
            conditionLines: conditionDs.toData(),
            conditionCombination: customizeConditionCombinationDs.current.get(
              'conditionCombination'
            ),
          },
        });
      } else {
        return false;
      }
    }
  };

  return (
    <div className={styles['fx-condition-link']}>
      <Badge dot={!!isExist}>
        <Tooltip
          title={intl.get('hpfm.individual.model.config.condition').d('条件配置')}
          placement="right"
        >
          <a onClick={openModal} className={isExist ? null : styles['black-color']}>
            fx
          </a>
        </Tooltip>
      </Badge>
    </div>
  );
};
