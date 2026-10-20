/*
 * @Date: 2023-10-25 15:57:50
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { divide, round } from 'lodash';
import { Alert } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import React, { Fragment, useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';

import styles from '../../index.less';

const TransferModal = observer(({ dataSet, averageFlag, weightSameFlag, currentRespWeight }) => {
  const showFlag = useMemo(() => !averageFlag && !weightSameFlag, [averageFlag, weightSameFlag]);

  const handleAdd = () => {
    // 非平均式计算且权重不一致，只能新增一行数据
    if (!averageFlag && !weightSameFlag && dataSet.length === 1) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.tag.inconsistentWeightMsg')
          .d('存在权重不一致的指标，无法转交给多个评分人'),
      });
      return false;
    }
    // 非平均式计算且权重一致，权重默认均分
    if (!averageFlag && weightSameFlag) {
      const respWeight = round(divide(currentRespWeight, dataSet.length + 1), 2);
      const newList = [{}, ...dataSet.toData()].map(n => ({
        ...n,
        respWeight,
      }));
      dataSet.loadData(newList);
    } else {
      dataSet.create({});
    }
  };

  const handleDelete = () => {
    dataSet.remove(dataSet.selected, true);
    const newList = dataSet.toData();
    const respWeight = round(divide(currentRespWeight, newList.length), 2);
    let newDataSource = [];
    // 非平均式计算且权重一致，删除后权重重新分配
    if (!averageFlag && weightSameFlag) {
      newDataSource = newList.map(n => ({ ...n, respWeight }));
    } else {
      newDataSource = newList;
    }
    dataSet.loadData(newDataSource);
  };

  const getButtons = () => {
    return [
      <Button icon="playlist_add" funcType="flat" onClick={handleAdd}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button icon="delete" funcType="flat" onClick={handleDelete}>
        {intl.get('sslm.common.button.batchDelete').d('批量删除')}
      </Button>,
    ];
  };

  const columns = [
    {
      name: 'loginName',
      editor: true,
      width: 120,
    },
    {
      name: 'userName',
      width: 120,
    },
    {
      name: 'userDepartment',
      width: 120,
    },
    {
      name: 'respWeight',
      editor: true,
      width: 120,
    },
    {
      name: 'transformReason',
      editor: true,
    },
  ];

  return (
    <Fragment>
      {showFlag && (
        <Alert
          closable
          showIcon
          type="info"
          iconType="help"
          className={styles['referrer-alert']}
          message={intl
            .get('sslm.supplierDocManage.view.tag.inconsistentWeightMsg')
            .d('存在权重不一致的指标，无法转交给多个评分人')}
        />
      )}
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={getButtons()}
        style={{ maxHeight: 'calc(100vh - 240px)' }}
        customizedCode="SSLM.APPRAISAL_SCORE.TRANSFER"
      />
    </Fragment>
  );
});

export default TransferModal;
