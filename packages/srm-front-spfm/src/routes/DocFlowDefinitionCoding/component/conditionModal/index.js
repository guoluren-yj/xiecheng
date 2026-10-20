import React, { useMemo } from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';
// import { Badge } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import { observer } from 'mobx-react-lite';
import ConditionConfig from './condition';
import { getConditionDs, getCustomizeConditionCombinationDs } from './conditionDs';
import { putNodeLinkRules } from '@/services/docFlowDefinitionNodesService';
import './index.less';

const Index = (props) => {
  const { dataSet, record, nodeDefCode, disabled = false, editors } = props;
  const conditionDs = useMemo(() => new DataSet(getConditionDs({ nodeDefCode })), []);

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

  // const condition = record?.get(name) || {};

  // const isExist = condition.conditionLines?.length;
  console.log('editors', editors);
  const openModal = async () => {
    const generateCondList = record.get('nodeLinkRule')
      ? record.get('nodeLinkRule')?.generateCondJson
      : null;
    const generateCond = generateCondList ? JSON.parse(generateCondList) : {};
    const formProps = {
      condition: { ...generateCond },
      conditionDs,
      nodeDefCode,
      customizeConditionCombinationDs,
      record,
      disabled,
      editors,
    };
    Modal.open({
      key: Modal.key(),
      style: { width: 742 },
      drawer: true,
      title: intl.get('hpfm.individual.model.config.condition').d('条件配置'),
      className: !editors && 'view-conditions-modal',
      children: <ConditionConfig {...formProps} />,
      closable: true,
      movable: false,
      onOk: () => {
        if (!disabled && editors) {
          return handleSaveCondition();
        }
      },
      okText: !disabled && editors
        ? intl.get(`hzero.common.button.ok`).d('确定')
        : intl.get(`hzero.common.button.close`).d('关闭'),
      cancelButton: !disabled && editors,
      destroyOnClose: true,
    });
  };

  const handleSaveCondition = async () => {
    // if (conditionDs.data.length === 0) {
    //   // eslint-disable-next-line no-unused-expressions
    //   record?.set({
    //     [name]: null,
    //   });
    // } else {
    const generateCondList = record.get('nodeLinkRule')
      ? record.get('nodeLinkRule').generateCondJson
      : null;
    const generateCond = generateCondList ? JSON.parse(generateCondList) : {};
    const conditionFlag = await conditionDs.validate();
    const combinationFlag =
      conditionDs.data.length === 0 ? true : await customizeConditionCombinationDs.validate();
    if (conditionFlag && combinationFlag) {
      const generateCondJson = JSON.stringify({
        conditionType: 'CUSTOMIZE',
        conditionLines: conditionDs.toData(),
        customizeConditionCombination: customizeConditionCombinationDs.current.get(
          'conditionCombination'
        ),
      });

      const conditionNewData = {
        ...generateCond,
        fieldDefinitionJson:
          conditionDs.data.length === 0 ? null : generateCond?.fieldDefinitionJson,
        linkId: record.get('id'),
        conditionLines: conditionDs.toData(),
        generateCond: conditionDs.data.length === 0 ? true : generateCond?.generateCond,
        generateCondJson: conditionDs.data.length === 0 ? null : generateCondJson,
        customizeConditionCombination: customizeConditionCombinationDs.current.get(
          'conditionCombination'
        ),
      };
      const currentRow = record.get('nodeLinkRule') || {};
      const data = getResponse(await putNodeLinkRules({ ...currentRow, ...conditionNewData }));
      if (!data?.failed) {
        dataSet.query();
      }
    } else {
      return false;
    }
    // }
  };

  return (
    <a onClick={() => openModal()} disabled={disabled}>
      {intl.get('hzero.common.conditionRule').d('条件规则')}
    </a>
  );
};

export default observer(Index);
