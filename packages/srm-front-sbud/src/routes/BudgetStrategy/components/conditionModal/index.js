import React, { useMemo } from 'react';
import { Modal, DataSet, Button } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import intl from 'utils/intl';
import classnames from 'classnames';
import remote from 'hzero-front/lib/utils/remote';
import { observer } from 'mobx-react-lite';
import styles from './index.less';
import ConditionConfig from './condition';
import { getConditionDs, getCustomizeConditionCombinationDs } from './conditionDs';

const Index = props => {
  const { dataSet, name, disabled = false, remote, type } = props;

  const {
    getScuxCondOperatorDs,
    getScuxRenderRightValue,
    setCuxConditionStr,
  } = remote.props.process;

  const conditionDs = useMemo(() => new DataSet(getScuxCondOperatorDs()), [getScuxCondOperatorDs]);

  const validator = value => {
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

  const condition = dataSet.current?.get(name) || {};

  const isExist = condition.conditionLines?.length;

  const openModal = async () => {
    const formProps = {
      isExist,
      condition,
      conditionDs,
      customizeConditionCombinationDs,
      dataSet,
      disabled,
      getScuxRenderRightValue,
      setCuxConditionStr,
    };

    Modal.open({
      key: Modal.key(),
      style: { width: 742 },
      drawer: true,
      title: intl.get('hpfm.individual.model.config.condition').d('条件配置'),
      children: <ConditionConfig {...formProps} />,
      closable: true,
      movable: false,
      onOk: () => {
        if (!disabled) {
          return handleSaveCondition();
        }
      },
      okText: !disabled
        ? intl.get(`hzero.common.button.ok`).d('确定')
        : intl.get(`hzero.common.button.close`).d('关闭'),
      cancelButton: !disabled,
      destroyOnClose: true,
    });
  };

  const handleSaveCondition = async () => {
    if (conditionDs.data.length === 0) {
      // eslint-disable-next-line no-unused-expressions
      dataSet.current?.set({
        [name]: null,
      });
    } else {
      const conditionFlag = await conditionDs.validate();
      const combinationFlag = await customizeConditionCombinationDs.validate();
      if (conditionFlag && combinationFlag) {
        const conditionJson = JSON.stringify({
          conditionType: 'CUSTOMIZE',
          conditionLines: conditionDs.toData(),
          customizeConditionCombination: customizeConditionCombinationDs.current.get(
            'conditionCombination'
          ),
        });

        const conditionNewData = {
          ...condition,
          conditionLines: conditionDs.toData(),
          conditionJson,
          conditionCombination: customizeConditionCombinationDs.current.get('conditionCombination'),
        };
        // eslint-disable-next-line no-unused-expressions
        dataSet.current?.set({
          [name]: conditionNewData,
        });
      } else {
        return false;
      }
    }
  };

  return (
    <div
      className={classnames(
        styles['fx-condition-link'],
        type === 'suffix' ? styles['fx-condition-suffix-link'] : styles['fx-condition-text-link']
      )}
    >
      <Badge dot={!!isExist}>
        <Button
          className={styles['fx-condition-link-button']}
          onClick={() => openModal()}
          color="primary"
          funcType="link"
        >
          {'Fx'}
        </Button>
      </Badge>
    </div>
  );
};

export default remote(
  {
    code: 'SBUD_CUX_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      getScuxCondOperatorDs: getConditionDs,
      getScuxRenderRightValue: undefined,
      setCuxConditionStr: undefined,
    },
  }
)(observer(Index));
