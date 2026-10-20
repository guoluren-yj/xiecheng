/**
 * 租户部分 数据表页面
 */
import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  useModal,
  Modal as ModalPro,
  Dropdown,
  Menu,
  Select,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { fetchBatchRemove, getCollecStatus, changeSyncMode } from '@/services/dataSheetService';

import FilterBar from './FilterBar';
import DetailModal from './DetailModal';
import AddTableModal from './AddTableModal';

import './index.less';

const OrgSubscribForm = (props) => {
  const {
    dataSet,
    lovDS,
    localRecord,
    formDS,
    columnPropDS,
    standarDS,
    topicLovDS,
    openPending = () => {},
    fetchSyncStatus = () => {},
  } = props;

  const Modal = useModal();

  const [canClick, setCanClick] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ((localRecord && localRecord.tenantId) || localRecord.tenantId === 0) {
      lovDS.queryParameter = {
        tenantId: localRecord.tenantId,
      };
      dataSet.addEventListener('select', refreshPage);
      dataSet.addEventListener('unSelect', refreshPage);
      dataSet.addEventListener('batchSelect', refreshPage);
      dataSet.addEventListener('batchUnSelect', refreshPage);
      dataSet.queryParameter = {
        tenantId: localRecord.tenantId,
        // sort: 'lastUpdateDate,desc',
      };
      dataSet.query();
    }

    return () => {
      dataSet.removeEventListener('select', refreshPage);
      dataSet.removeEventListener('unSelect', refreshPage);
      dataSet.removeEventListener('batchSelect', refreshPage);
      dataSet.removeEventListener('batchUnSelect', refreshPage);
      dataSet.data = [];
      lovDS.data = [];
      dataSet.reset();
      lovDS.reset();
    };
  }, [localRecord]);

  const refreshPage = (params) => {
    if (params.dataSet.selected.length) {
      setCanClick(true);
    } else {
      setCanClick(false);
    }
  };

  /**
   * 打开详情弹窗
   */
  const openDetailModal = React.useCallback(
    (record) => {
      const modal = Modal.open({
        closable: true,
        drawer: true,
        title: intl.get('sdps.dataSheet.view.title.dataDetail').d('数据详情'),
        destroyOnClose: true,
        style: { width: '742px' },
        children: (
          <DetailModal
            localRecord={record}
            formDS={formDS}
            columnPropDS={columnPropDS}
            standarDS={standarDS}
          />
        ),
        footer: (
          <Button color="primary" onClick={() => closeModal()}>
            {intl.get('hzero.common.btn.close').d('关闭')}
          </Button>
        ),
      });

      const closeModal = () => {
        modal.close();
      };
    },
    [Modal]
  );

  /**
   * 切换模式
   */
  const changeModeOption = (mode, record) => {
    record.set('syncMode', mode);
    const param = record?.toData() ?? {};
    changeSyncMode([
      {
        ...param,
        syncMode: mode,
      },
    ]).then((res) => {
      if (getResponse(res)) {
        notification.success();
        dataSet.query();
      }
    });
  };

  const columns = () => {
    return [
      {
        name: 'sourceTableNum',
        renderer: ({ text, record }) => {
          return <a onClick={() => openDetailModal(record)}>{text}</a>;
        },
      },
      { name: 'sourceTableName' },
      { name: 'topicNum' },
      { name: 'topicName' },
      {
        name: 'type',
        width: 100,
        header: intl.get(`sdps.dataSheet.model.distributeorOrSubscribe`).d('分发/订阅'),
        renderer: ({ text, record }) => {
          const classes = record.get('type') === 'ALLOCATE' ? 'tag-allocate' : 'tag-subscribe';
          return text ? <span className={classes}>{text}</span> : '-';
        },
      },
      { name: 'lastUpdateDate', width: 150 },
      { name: 'submitterName' },
      {
        name: 'syncMode',
        renderer: ({ record }) => {
          const value = record.get('syncMode');
          return (
            <div className="column-select-flat">
              <Select
                size="small"
                funcType="flat"
                style={{ width: '80px' }}
                value={value}
                clearButton={false}
                onChange={(e) => changeModeOption(e, record)}
              >
                <Select.Option key="INCR" value="INCR">
                  {intl.get('sdps.dataSheet.view.option.increment').d('增量')}
                </Select.Option>
                <Select.Option key="ALL" value="ALL">
                  {intl.get('sdps.dataSheet.view.option.all').d('全量')}
                </Select.Option>
              </Select>
            </div>
          );
        },
      },
    ];
  };

  /**
   * 删除数据
   */
  const handleRemove = async () => {
    const result = await getCollecStatus();

    if (getResponse(result)) {
      const collectStatus = result?.status ?? 1;
      if (collectStatus === 0 || collectStatus === '0') {
        // 正在执行
        openPendingMotion();
        return;
      }
    }

    if (dataSet.selected.length) {
      ModalPro.confirm({
        title: intl.get('sdps.dataSheet.view.message.confirmDelete').d('是否确认移除？'),
        children: <></>,
      }).then((button) => {
        if (button === 'ok') {
          const list = dataSet.selected.map((item) => item.toData());
          fetchBatchRemove(list).then((res) => {
            if (
              res.failed &&
              res.code === 'sdps.data.collection.is.being.performed.in.the.background'
            ) {
              // 正在执行
              openPendingMotion();
              return;
            }
            if (getResponse(res)) {
              dataSet.query();
            }
          });
        }
      });
    } else {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl.get('sdps.dataSheet.view.message.selectToDel').d('请勾选您要删除的数据'),
      });
    }
  };

  /**
   * 正在执行中弹窗
   */
  const openPendingMotion = () => {
    openPending();
  };

  const handleChangeLov = (params = []) => {
    if (params.length) {
      setVisible(false);
      dataSet.query();
      lovDS.data = [
        {
          tenantId: localRecord.tenantId,
        },
      ];
      lovDS.reset();
    }
  };

  /**
   * 切换模式
   */
  const handleClickMode = (mode = '') => {
    const list = dataSet.selected.map((record) => {
      const obj = record?.toData() ?? {};
      return {
        ...obj,
        syncMode: mode,
      };
    });
    changeSyncMode(list).then((res) => {
      if (getResponse(res)) {
        setCanClick(false);
        notification.success();
        dataSet.query();
      }
    });
  };

  const menu = () => {
    return (
      <Menu>
        <Menu.Item>
          <span onClick={() => handleClickMode('INCR')}>
            {intl.get('sdps.dataSheet.button.increment').d('切换至增量同步')}
          </span>
        </Menu.Item>
        <Menu.Item>
          <span onClick={() => handleClickMode('ALL')}>
            {intl.get('sdps.dataSheet.button.allMode').d('切换至全量同步')}
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  const buttons = () => {
    return [
      <Button icon="playlist_add" onClick={handleOpenLov}>
        {intl.get('sdps.dataSheet.view.btn.addTable').d('添加表')}
      </Button>,
      <Button icon="delete_sweep" onClick={handleRemove} disabled={!canClick}>
        {intl.get('hzero.common.button.remove').d('移除')}
      </Button>,
      <Dropdown disabled={!canClick} overlay={menu}>
        <Button style={{ color: '#29BECE' }} funcType="flat" disabled={!canClick} icon="sync">
          {intl.get('sdps.dataSheet.button.batchChangeMode').d('批量切换同步模式')}
        </Button>
      </Dropdown>,
    ];
  };

  const handleOpenLov = async () => {
    const result = await getCollecStatus();

    if (getResponse(result)) {
      const collectStatus = result?.status ?? 1;
      if (collectStatus === 0 || collectStatus === '0') {
        // 正在执行
        openPendingMotion();
        return;
      }
    }

    setVisible(true);
  };

  const handleQuery = (params) => {
    dataSet.queryDataSet.data = [{ ...params }];
    dataSet.query();
  };

  const addTableprops = {
    visible,
    lovDS,
    localRecord,
    onSelect: handleChangeLov,
    openPending,
    fetchSyncStatus,
    onCancel: () => {
      setVisible(false);
    },
  };

  return (
    <>
      <div className="card-page-title">
        {intl.get('sdps.dataSheet.view.title.subscriptionForm').d('订阅表')}
      </div>
      <div style={{ marginTop: '8px' }}>
        <FilterBar onQuery={handleQuery} lovDS={topicLovDS} />
      </div>
      <div
        style={{
          marginTop: '8px',
        }}
      >
        <Table
          dataSet={dataSet}
          columns={columns()}
          queryBar="none"
          buttons={buttons()}
          customizable
          customizedCode="SDPS.DATASHEET_ORG_TABLE_LIST"
        />
      </div>
      {visible && <AddTableModal {...addTableprops} />}
    </>
  );
};

export default OrgSubscribForm;
