import React from 'react';
import { Icon, message } from 'choerodon-ui';
import { Dropdown, Menu, Modal } from 'choerodon-ui/pro/lib';
import { Placements } from 'choerodon-ui/lib/dropdown/enum';
import classnames from 'classnames';
import request from 'utils/request';
import { getResponse } from 'utils/utils';
import HistoricRecords from '@/routes/ScriptUtility/FrontPage/Main/HistoricRecords';
import {
  enableScriptUtilityService,
  deleteScriptUtilityService,
} from '@/services/scriptUtilityService';
import styles from './index.less';

// 历史记录
export const handleHistory = (data) => {
  Modal.open({
    key: 'card',
    drawer: true,
    title: (
      <div>
        <p>历史记录</p>
        <p style={{ fontSize: 14, color: '#1E1E1E', marginBottom: 0 }}>
          {`${data.servicePointCode}-${data.tenantName}`}
        </p>
      </div>
    ),
    children: <HistoricRecords data={data} />,
    okText: '关闭',
    onOk: () => {},
    footer: (okBtn) => okBtn,
    // contentStyle: {
    //   width: 474,
    // },
    // bodyStyle: {
    //   width: 474,
    // },
  });
};

export default function Card({ data, handleEdit, handleRefresh, servicePointId }) {
  // 禁用
  const handleEnable = async () => {
    const res = await request(enableScriptUtilityService.url, {
      method: enableScriptUtilityService.method,
      body: {
        pointScriptId: data.pointScriptId,
        enabledFlag: data.enabledFlag === 1 ? 0 : 1,
        objectVersionNumber: data.objectVersionNumber,
        servicePointId,
        tenantId: data.tenantId,
        _token: data._token,
      },
    });

    if (getResponse(res)) {
      message.success('修改成功');
      handleRefresh();
    }
  };

  // 删除
  const handleDelete = async () => {
    const res = await request(deleteScriptUtilityService.url, {
      method: deleteScriptUtilityService.method,
      body: {
        servicePointId,
        tenantId: data.tenantId,
        pointScriptId: data.pointScriptId,
        _token: data._token,
      },
    });

    if (getResponse(res)) {
      message.success('删除成功');
      handleRefresh();
    }
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={handleEnable}>{data.enabledFlag !== 1 ? '启用' : '禁用'}</Menu.Item>
      <Menu.Item
        onClick={() => {
          Modal.confirm({
            title: '是否确认删除该条数据?',
          }).then((button) => {
            if (button === 'ok') handleDelete();
          });
        }}
      >
        删除
      </Menu.Item>
      <Menu.Item onClick={() => handleHistory(data)}>历史记录</Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.card}>
      <div className={`${styles['card-item']} ${styles['card-header']}`}>
        <i className={styles['card-header-i']} />
        <span className={styles['card-header-name']} onClick={() => handleEdit(data)}>
          {data.tenantName}
        </span>
        <span
          className={classnames({
            [styles['card-header-tag']]: true,
            [styles.success]: data.enabledFlag === 1,
            [styles.error]: data.enabledFlag !== 1,
          })}
        >
          {data.enabledFlag === 1 ? '启用' : '禁用'}
        </span>
        <Dropdown overlay={menu} placement={Placements.bottomLeft}>
          <Icon className={styles['card-header-icon']} type="more_horiz" />
        </Dropdown>
      </div>
      <div className={styles['card-item']}>
        <div
          className={classnames({
            [styles['card-header-tags']]: true,
            [styles.script]: data.scriptTypeCode === 'SCRIPT',
          })}
        >
          {data.scriptTypeMeaning}
        </div>
        {data.scriptCurrentVersion && (
          <div
            className={classnames({ [styles['card-header-tags']]: true, [styles.version]: true })}
          >
            {`版本 ${data.scriptCurrentVersion}`}
          </div>
        )}
      </div>
      <div className={styles['card-item']}>
        <span className={styles['card-item-label']}>脚本名称</span>
        <span className={styles['card-item-cont']}>{data.scriptName}</span>
      </div>
      <div className={styles['card-item']}>
        <span className={styles['card-item-label']}>脚本编码</span>
        <span className={styles['card-item-cont']}>{data.scriptCode}</span>
      </div>
    </div>
  );
}
