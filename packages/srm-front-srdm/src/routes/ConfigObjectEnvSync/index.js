import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Button,
  Table,
  DataSet,
  Form,
  TextField,
  Tabs,
  Modal,
  Select,
  CheckBox,
  // DatePicker,
} from 'choerodon-ui/pro';
import { routerRedux } from 'dva/router';
import { Alert, Tag, Spin, Radio } from 'choerodon-ui';
import { getCurrentUser, getSession } from 'utils/utils';
import { Header, Content } from 'components/Page';
import request from 'utils/request';
import notification from 'utils/notification';
import { HZERO_SRDM } from '@/common/config';
import getConfigDS from './configDs';
import { getConfigSyncDS } from '../ConfigObjectAsync/configDs';
import DetailModal from './DetailModal';

const { TabPane } = Tabs;

export const colorTypeEnum = {
  INSERT: '#87d068',
  UPDATE: '#2db7f5',
  DELETE: '#f50',
  SAME: 'grey',
};

const EnvAsync = (props, { dispatch }) => {
  const { groupId } = props.match.params;
  const [activeKey, setActiveKey] = useState('detail');
  const [scanSpinning, setScanSpinning] = useState(false);
  const [userMessage, setUserMessage] = useState({});
  const devDs = useMemo(() => new DataSet(getConfigDS(groupId, 'dev', true)), [groupId]);
  const testDs = useMemo(() => new DataSet(getConfigDS(groupId, 'test', false)), [groupId]);
  const prodDs = useMemo(() => new DataSet(getConfigDS(groupId, 'prod', false)), [groupId]);
  const syncDs = useMemo(
    () =>
      new DataSet(
        getConfigSyncDS(`${HZERO_SRDM}/v1/data-migrate-recs/public-data/submit?groupId=${groupId}`)
      ),
    []
  );

  useEffect(() => {
    request(`${HZERO_SRDM}/v1/data-migrate-recs/public-data/update-info?groupId=${groupId}`).then(
      (res) => {
        if (!res.failed) {
          setUserMessage(res);
        }
      }
    );

    if (!groupId || !getSession('config-object-sync-env-data')) {
      dispatch(
        routerRedux.push({
          pathname: `/srdm/config-object-async`,
        })
      );
    }
  }, [dispatch, groupId]);

  const checkLastUpdatedUser = () => {
    const { lastUpdateRealName, lastUpdateLoginName } = userMessage;
    if (lastUpdateLoginName === getCurrentUser().loginName) {
      handleSubmit();
    } else {
      Modal.confirm({
        title: '提示',
        children: `本次提交最后提交人是${lastUpdateRealName}(${lastUpdateLoginName})，你可能提交了别人修改的数据，确定提交吗?`,
        onOk: handleSubmit,
      });
    }
  };

  const handleSubmit = () => {
    Modal.open({
      title: '申请同步',
      children: (
        <Form dataSet={syncDs} labelLayout="float">
          <TextField name="issueNum" />
          <TextField name="approver" readOnly />
          <CheckBox name="blacklistFlag" />
        </Form>
      ),
      onOk: async () => {
        const res = await syncDs.submit();
        return res !== false;
      },
      afterClose: () => {
        syncDs.reset();
      },
    });
  };

  const onChange = useCallback(
    ({ target }) => {
      const { value } = target;
      if (value === 'move' && !testDs.getState('queryFlag')) {
        const body = getSession('config-object-sync-env-data');
        if (body) {
          setScanSpinning(true);
          request(`${HZERO_SRDM}/v1/data-migrate-recs/public-data/scan?groupId=${groupId}`, {
            method: 'POST',
            body,
          }).then((res = [{}]) => {
            setScanSpinning(false);
            if (res.failed) {
              notification.error({ message: res.message });
            } else {
              testDs.setState('queryFlag', true);
              testDs.query();
            }
          });
        }
      }
      setActiveKey(value);
    },
    [scanSpinning, groupId]
  );

  const onMoveChange = useCallback(
    (value) => {
      if (value === 'prod' && prodDs && !prodDs.getState('queryFlag')) {
        prodDs.setState('queryFlag', true);
        prodDs.query();
      }
    },
    [prodDs]
  );

  const openDetailModal = (record, env) => {
    Modal.open({
      style: {
        width: 800,
        height: 'auto',
      },
      title: '明细',
      children: <DetailModal data={record.toData().dataMigrateFieldList} env={env} />,
      okCancel: false,
    });
  };

  const updateStatus = (record, status) => {
    const text = status ? '启用' : '禁用';
    Modal.confirm({
      title: `确认${text}删除行为吗？`,
      children: (
        <div>
          {text}后目标环境的<span style={{ color: ' red' }}>[{record.get('tableName')}]</span>表
          <span style={{ color: ' red' }}>{record.get('uniqueValue')}</span>数据将
          {status ? '会' : '不会'}被删除
        </div>
      ),
      onOk: () => {
        request(`${HZERO_SRDM}/v1/data-migrate-recs/public-data/${status ? 'enable' : 'disable'}`, {
          method: 'POST',
          body: { recId: record.get('recId') },
        }).then((res) => {
          notification[res.failed ? 'error' : 'success']({ message: res.message });
        });
      },
    });
  };

  const columns = (env) => {
    return [
      {
        name: 'objectCode',
        width: 150,
      },
      {
        name: 'tableName',
        width: 200,
      },
      {
        name: 'displayFieldValue',
      },
      {
        name: 'uniqueValue',
      },
      {
        name: 'sourceTenantNum',
        width: 120,
      },
      {
        name: 'enabledFlag',
        width: 100,
        align: 'left',
      },
      env !== 'dev' && {
        name: env === 'test' ? 'testMigrateBehaviour' : 'prodMigrateBehaviour',
        width: 80,
        renderer: ({ value, text }) => {
          return <Tag color={colorTypeEnum[value]}>{text}</Tag>;
        },
      },
      {
        name: 'lastUpdatedUserRealName',
        width: 100,
      },
      {
        name: 'updateDateValue',
        width: 160,
      },
      {
        name: 'action',
        lock: 'right',
        header: '操作',
        width: 120,
        align: 'center',
        renderer: ({ record }) => {
          const migrateType = record.get(`${env}MigrateBehaviour`);
          const enabledFlag = record.get('enabledFlag');
          return [
            <a onClick={() => openDetailModal(record, env)} style={{ marginRight: 10 }}>
              明细
            </a>,
            migrateType === 'DELETE' && enabledFlag === 0 ? (
              <a onClick={() => updateStatus(record, true)} style={{ marginRight: 10 }}>
                启用
              </a>
            ) : null,
            migrateType === 'DELETE' && enabledFlag === 1 ? (
              <a onClick={() => updateStatus(record, false)} style={{ marginRight: 10 }}>
                禁用
              </a>
            ) : null,
          ];
        },
      },
    ];
  };

  const pubRuleMsg = useMemo(
    () => (
      <div>
        <span>发布规则：</span>
        <br />
        <span>1. 测试环境将在组长审批后立刻生效</span>
        <br />
        <span>
          2. 生产将在"需求/bug 紧急发版"后生效 , 除标注"迭代同步生产黑名单" 的申请外,
          其他申请将在迭代发版时将未发布的请求兜底发布
        </span>
        <br />
        <span>
          3. 迁移行为是"删除"的记录,默认是禁用状态,表示不做处理,如果要删除对应环境的数据, 请手动启用
        </span>
      </div>
    ),
    []
  );
  return (
    <>
      <Header title="申请同步测试/生产环境" backPath="/srdm/config-object-async">
        <Button color="primary" onClick={checkLastUpdatedUser} style={{ width: 80 }}>
          提交
        </Button>
      </Header>
      <Content>
        <Alert message={pubRuleMsg} showIcon type="info" />
        <p style={{ color: 'red', marginTop: 5 }}>{userMessage.message}</p>
        <Spin spinning={scanSpinning}>
          <Radio.Group onChange={onChange} value={activeKey} style={{ marginBottom: 8 }}>
            <Radio.Button value="detail">数据明细</Radio.Button>
            <Radio.Button value="move">迁移行为</Radio.Button>
          </Radio.Group>
          {activeKey === 'detail' ? (
            <Table virtual selectionMode="none" dataSet={devDs} columns={columns('dev')} />
          ) : (
            <Tabs onChange={onMoveChange}>
              <TabPane tab="测试环境迁移行为" key="test">
                <Table virtual selectionMode="none" dataSet={testDs} columns={columns('test')} />
              </TabPane>
              <TabPane tab="正式环境迁移行为" key="prod">
                <Table virtual selectionMode="none" dataSet={prodDs} columns={columns('prod')} />
              </TabPane>
            </Tabs>
          )}
        </Spin>
      </Content>
    </>
  );
};

export default EnvAsync;
