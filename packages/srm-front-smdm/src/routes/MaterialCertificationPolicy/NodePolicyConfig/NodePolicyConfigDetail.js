/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState, useImperativeHandle } from 'react';
import { Form, Table, TextField, Select, useDataSet, Button, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
// import MappingModal from './mappingModal';
import { isEmpty } from 'choerodon-ui/dataset/utils';
import { headerInfoDs, policyListDS } from '../stores/nodePolicyConfigDs';

import styles from '../index.less';
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Index = React.forwardRef(({ formData = {}, isHistory }, ref) => {
  const [strategyHeaderId, setStrategyHeaderId] = useState(formData.strategyHeaderId);

  const listDs = useDataSet(
    () =>
      policyListDS({
        strategyHeaderId,
        isHistory,
      }),
    [strategyHeaderId, isHistory]
  );

  const formDs = useDataSet(
    () =>
      headerInfoDs({
        strategyHeaderId,
        isHistory,
      }),
    [strategyHeaderId, isHistory]
  );

  const getDetailInfo = async () => {
    const formFlag = await formDs.validate();
    const listFlag = await listDs.validate();

    const listKey = 'itemAuthStrLineList';

    if (formFlag && listFlag) {
      return {
        ...formDs.current?.toData(),
        [listKey]: listDs.toData(),
      };
    } else {
      return false;
    }
  };

  const updateDetailInfo = (data) => {
    if (strategyHeaderId) {
      formDs.query();
      listDs.query();
    } else {
      setStrategyHeaderId(data?.strategyHeaderId);
    }
  };

  const allowEdit = (record, field) => {
    if (isHistory) {
      return false;
    }
    if (field === 'nodeCode') {
      const nodeCodes = listDs.filter((ele) => ele !== record).map((ele) => ele.get('nodeCode'));
      return (
        <Select
          name={field}
          record={record}
          noCache
          optionsFilter={(data) => !nodeCodes.includes(data.get('value'))}
        />
      );
    } else {
      return true;
    }
  };

  const columns = useMemo(() => {
    const roleList = isHistory
      ? [
          {
            name: 'operateRoleHisList',
            width: 150,
          },
          {
            name: 'queryRoleHisList',
            width: 150,
          },
        ]
      : [
          {
            name: 'operateRoleList',
            editor: allowEdit,
            width: 150,
          },
          {
            name: 'queryRoleList',
            editor: allowEdit,
            width: 150,
          },
        ];

    return [
      {
        name: 'orderSeq',
        align: 'left',
        width: 150,
      },
      {
        name: 'nodeCode',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'releaseRule',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'skipFlag',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'earlyTerminationFlag',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'closedFlag',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'feedbackFlag',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'testingResultEnterFlag',
        editor: allowEdit,
        width: 200,
      },
      {
        name: 'preapprovalFlag',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'feedbackRule',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'closedRule',
        editor: allowEdit,
        width: 150,
      },
      ...roleList,
    ];
  }, [isHistory]);

  const DeleteBtn = observer(() => {
    const { selected } = listDs;
    return (
      <Button
        key="delete"
        funcType="flat"
        icon="delete_sweep"
        color="primary"
        type="c7n-pro"
        onClick={() => {
          if (selected.every((record) => !record.get('strategyLineId'))) {
            listDs.remove(selected);
          } else {
            listDs.delete(selected, {
              title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
              children: (
                <div>
                  {intl
                    .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
                    .d('确认删除选中行？')}
                </div>
              ),
            });
          }
        }}
        disabled={isEmpty(selected)}
      >
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>
    );
  });

  const buttons = useMemo(() => {
    return isHistory ? [] : ['add', <DeleteBtn />];
  }, [listDs, isHistory]);

  useEffect(() => {
    if (strategyHeaderId) {
      formDs.query();
      listDs.query();
    } else {
      formDs.loadData([]);
      formDs.create({});
    }
  }, [strategyHeaderId]);

  // 函数组件调用到子组件的函数
  useImperativeHandle(ref, () => ({
    getDetailInfo,
    updateDetailInfo,
    ref: ref.current,
  }));

  return (
    <div className={styles['detail-content']}>
      <div className={styles['chunk-content']}>
        <div className={styles['content-two-title']}>
          <div className={styles['content-two-title-ink']} />
          {intl.get(`${commonPrompt}.baseInfo`).d('基本信息')}
        </div>

        {isHistory ? (
          <Form
            dataSet={formDs}
            showLines={6}
            columns={3}
            useColon={false}
            labelLayout="vertical"
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
          >
            <Output name="strategyNum" />
            <Output name="strategyStatusCode" />
            <Output name="createdByName" />

            <Output name="strategyName" colSpan={2} />
            <Output name="strategyDimension" />
            <Output name="versionNumber" />
          </Form>
        ) : (
          <Form dataSet={formDs} showLines={6} columns={3} labelLayout="float" useColon={false}>
            <TextField name="strategyNum" />
            <Select name="strategyStatusCode" />
            <TextField name="createdByName" />

            <TextField name="strategyName" colSpan={2} />
            <Select name="strategyDimension" />
            <TextField name="versionNumber" />
          </Form>
        )}
      </div>

      <div className={styles['chunk-content']}>
        <div className={styles['content-two-title']}>
          <div className={styles['content-two-title-ink']} />
          {intl.get(`${commonPrompt}.stageDetail`).d('策略明细')}
        </div>

        <Table
          style={{ maxHeight: '450px' }}
          dataSet={listDs}
          columns={columns}
          buttons={buttons}
          // customizable
          // customizedCode="SMDM_CERTIFICATION_CONFIG.NODE_POLICY_LINE_LIST"
        />
      </div>
    </div>
  );
});

export default Index;
