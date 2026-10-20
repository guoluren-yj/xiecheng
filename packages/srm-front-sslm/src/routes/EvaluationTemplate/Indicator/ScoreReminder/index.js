/**
 * scoreReminder - 分数提醒配置组件
 * @date: 2023-4-19
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useMemo, useEffect } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Drawer } from 'hzero-ui';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getScoreReminderDS } from './stores/indexDS';

const ScoreReminder = observer(
  ({ visible, close, refresh, isEdit = true, scoreReminderRowDataSource = {} }) => {
    const { evalTplId, evalTplIndId } = scoreReminderRowDataSource;
    const scoreReminderDS = useMemo(
      () => new DataSet(getScoreReminderDS({ evalTplId, evalTplIndId, isEdit })),
      [evalTplId, evalTplIndId]
    );

    const columns = [
      {
        name: 'remindScoreFrom',
        width: 200,
        editor: isEdit,
      },
      {
        name: 'remindScoreTo',
        width: 200,
        editor: isEdit,
      },
      {
        name: 'remindDesc',
        width: 200,
        editor: isEdit,
      },
    ];

    const title = intl
      .get('spfm.supplierKpiIndicator.view.button.scoreAlertConfig')
      .d('分数提醒配置');

    // 关闭抽屉
    const cancel = () => {
      close();
      refresh();
    };

    const onSave = async () => {
      const res = await scoreReminderDS.validate();
      if (res) {
        scoreReminderDS.submit().then(() => {
          scoreReminderDS.query();
        });
        return true;
      } else {
        return false;
      }
    };

    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: cancel,
      width: 700,
      zIndex: 500,
    };

    // 操作按钮
    const buttons = useMemo(() => {
      return isEdit ? ['add', 'delete'] : '';
    }, []);

    useEffect(() => {
      if (evalTplId && evalTplIndId) {
        scoreReminderDS.query();
      }
    }, [evalTplId, evalTplIndId]);

    return (
      <Drawer {...drawerProps}>
        <div>
          <Table dataSet={scoreReminderDS} columns={columns} buttons={buttons} border={false} />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'left',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button onClick={cancel} style={{ marginLeft: 10 }}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            color="primary"
            type="primary"
            onClick={onSave}
            style={{ marginLeft: 10 }}
            hidden={!isEdit}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
      </Drawer>
    );
  }
);
export default ScoreReminder;
