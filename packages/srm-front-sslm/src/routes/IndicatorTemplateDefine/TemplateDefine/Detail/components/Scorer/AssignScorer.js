/*
 * @Date: 2023-11-16 11:47:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { Fragment, useCallback } from 'react';
import { Lov, Icon, DataSet, Form, Select, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { getAssignScorerTableDs } from '../../stores/getScorerDS';

const AssignScorer = ({ type, isEdit, scorerFormDs, scorerTableDs, respCalMethod }) => {
  const columns = [
    {
      name: 'respLoginName',
      editor: isEdit,
    },
    {
      name: 'respUserName',
    },
    {
      name: 'respWeight',
      editor: isEdit,
      hidden: respCalMethod === 'AVERAGE',
    },
  ];

  // 新增用户确认回调
  const handleBeforeSelect = useCallback(
    (records = []) => {
      const addList = records.map(record => {
        const { userId, userName, loginName } = record.toData() || {};
        return {
          respUserId: userId,
          respUserName: userName,
          respLoginName: loginName,
        };
      });
      // 获取已存在的用户
      const respUserIds = (scorerTableDs.toData() || []).map(record => record.respUserId);
      // 判断勾选的行是否已存在
      const existList = addList.filter(item => respUserIds.includes(item.respUserId));
      if (!isEmpty(existList)) {
        notification.warning({
          message: intl.get('sslm.common.view.message.duplicateScorer').d('不可选择已存在评分人'),
        });
        return false;
      }
      addList.forEach(record => {
        scorerTableDs.create(record, 0);
      });
    },
    [scorerTableDs]
  );

  const getButtons = useCallback(() => {
    // 重新new ds 直接用props中的ds，新建会触发默认创建行行为
    const accountDs = new DataSet(getAssignScorerTableDs());
    return isEdit
      ? [
        <Lov
          multiple
          mode="button"
          name="accountLov"
          clearButton={false}
          dataSet={accountDs}
          onBeforeSelect={handleBeforeSelect}
          modalProps={{
              beforeOpen: () => {
                const lovDs = accountDs.getField('accountLov').getOptions(accountDs.current);
                if (lovDs) {
                  lovDs.unSelectAll();
                  lovDs.clearCachedSelected();
                }
              },
            }}
        >
          <Icon type="playlist_add" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
          {intl.get('hzero.common.button.add').d('新增')}
        </Lov>,
          'delete',
        ]
      : [];
  }, [isEdit]);

  return (
    <Fragment>
      {type === 'batchEdit' && (
        <Form columns={2} labelLayout="float" dataSet={scorerFormDs} style={{ marginBottom: 16 }}>
          <Select name="assignRule" />
        </Form>
      )}
      <Table
        dataSet={scorerTableDs}
        columns={columns}
        buttons={getButtons()}
        style={{ maxHeight: 'calc(100vh - 260px)' }}
        customizedCode="SSLM.TEMPLATE_DEFINE.ASSIGN_SCORER_TABLE"
      />
    </Fragment>
  );
};

export default AssignScorer;
