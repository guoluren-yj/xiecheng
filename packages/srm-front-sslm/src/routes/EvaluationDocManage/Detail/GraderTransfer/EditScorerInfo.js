/*
 * @Date: 2022-09-14 15:30:54
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import { useObserver } from 'mobx-react-lite';
import React, { Fragment, useMemo, useCallback, useEffect } from 'react';
import { Table, DataSet, Button, NumberField } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { getScorerInfoDS } from './stores/getScorerInfoDS';

const EditScorerInfo = ({ weightSameFlag, averageFlag, onRef, currentRespWeight }) => {
  const dataSet = useMemo(() => new DataSet(getScorerInfoDS({ weightSameFlag, averageFlag })), [
    weightSameFlag,
    averageFlag,
  ]);
  const showFlag = useMemo(() => !averageFlag && !weightSameFlag, [weightSameFlag, averageFlag]);

  useEffect(() => {
    onRef(dataSet);
  }, []);

  const handleAdd = useCallback(() => {
    // 非平均式计算且权重不一致，只能新增一行数据
    const dataSource = dataSet.toJSONData();
    if (!averageFlag && !weightSameFlag && dataSource.length === 1) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.tag.inconsistentWeightMsg')
          .d('存在权重不一致的指标，无法转交给多个评分人'),
      });
      return;
    }
    // 非平均式计算且权重一致
    if (!averageFlag && weightSameFlag) {
      if (isEmpty(dataSource)) {
        dataSet.create({ respWeight: currentRespWeight }, 0);
      } else {
        dataSet.create({}, 0);
      }
    } else {
      dataSet.create({}, 0);
    }
  }, []);

  const handleDelete = useCallback(() => {
    dataSet.remove(dataSet.selected);
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'userLov',
        width: 150,
        editor: true,
      },
      {
        name: 'userName',
        width: 150,
      },
      {
        name: 'userDepartment',
        width: 150,
      },
      {
        name: 'respWeight',
        width: 100,
        editor: !averageFlag && weightSameFlag && <NumberField />,
      },
    ],
    []
  );

  // 操作按钮集合
  const getButtons = useCallback(() => {
    const isDisabled = useObserver(() => isEmpty(dataSet.selected));
    return [
      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <Button onClick={handleDelete} disabled={isDisabled}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
        <Button color="primary" onClick={handleAdd}>
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
      </div>,
    ];
  }, []);

  return (
    <Fragment>
      {showFlag && (
        <Alert
          message={intl
            .get('sslm.supplierDocManage.view.tag.inconsistentWeightMsg')
            .d('存在权重不一致的指标，无法转交给多个评分人')}
          type="info"
          showIcon
          banner
        />
      )}
      <div style={{ padding: '16px 24px' }}>
        <Table dataSet={dataSet} columns={columns} buttons={getButtons()} />
      </div>
    </Fragment>
  );
};

export default EditScorerInfo;
