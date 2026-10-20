import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Table, Button } from 'choerodon-ui/pro';
import { Modal, Icon } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { fetchAllocateTables } from '@/services/dataSheetService';

import './index.less';

const { Sidebar } = Modal;
let continueKey = 1;

const AddTableModal = (props) => {
  const {
    visible,
    onCancel = () => {},
    lovDS,
    onSelect = () => {},
    openPending = () => {},
    fetchSyncStatus = () => {},
    localRecord,
  } = props;

  const [selectList, setList] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    lovDS.addEventListener('select', selectEvent);
    lovDS.addEventListener('unSelect', selectEvent);
    lovDS.addEventListener('selectAll', selectEvent);
    lovDS.addEventListener('unSelectAll', selectEvent);
    lovDS.query();

    return () => {
      lovDS.removeEventListener('select', selectEvent);
      lovDS.removeEventListener('unSelect', selectEvent);
      lovDS.removeEventListener('selectAll', selectEvent);
      lovDS.removeEventListener('unSelectAll', selectEvent);
      lovDS.data = [];
      lovDS.reset();
      continueKey = 1;
    };
  }, []);

  const selectEvent = ({ dataSet }) => {
    const list = dataSet.selected.map((item) => item.toData());
    setList(list || []);
    setRefresh(true);
  };

  const handleCloseModal = () => {
    onCancel();
  };

  /**
   * 确定选择数据
   */
  const handleSelect = () => {
    if (selectList.length && continueKey) {
      continueKey = 0;
      const ids = selectList.map((item) => {
        return {
          ...item,
          tenantId: localRecord.tenantId,
        };
      });

      fetchAllocateTables(ids).then((res) => {
        continueKey = 1;
        if (
          res.failed &&
          res.code === 'sdps.data.collection.is.being.performed.in.the.background'
        ) {
          // 正在执行
          openPending();
          fetchSyncStatus();
          setList([]);
          lovDS.query();
          return;
        }
        if (getResponse(res)) {
          notification.success();
          onSelect(selectList);
        }
      });
    }
  };

  const columns = () => {
    return [
      { name: 'sourceTableNum' },
      { name: 'sourceTableName' },
      { name: 'topicNum' },
      { name: 'topicName' },
    ];
  };

  /**
   * 删除列表中的某条数据
   */
  const handeRemoveItem = (item) => {
    if (lovDS.selected.length) {
      const record = lovDS.filter((result) => result.get('sourceTableId') === item.sourceTableId);
      lovDS.unSelect(record && record.length ? record[0] : {});
    }
    lovDS.unSelectAll();
    setList([]);
    setRefresh(true);
  };

  /**
   * 绘制选择的数据列表
   */
  const drawSelectItem = () => {
    if (!selectList.length) {
      return (
        <div
          style={{
            lineHeight: '38px',
            color: 'rgba(0, 0, 0, 0.45)',
            textAlign: 'center',
          }}
        >
          {intl.get('sdps.dataSheet.view.message.selectLeftList').d('请选择左侧列表数据')}
        </div>
      );
    }
    if (selectList.length) {
      return selectList.map((item) => {
        return (
          <div key={item.sourceTableId} className="select-item-row">
            <span
              style={{
                display: 'inline-block',
                width: '230px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {`${item?.sourceTableNum ?? ''} ${item?.sourceTableName ?? ''}`}
            </span>
            <Icon
              type="cancel"
              style={{
                fontSize: '16px',
                color: 'rgb(140, 140, 140)',
                float: 'right',
                marginTop: '10px',
                marginRight: '16px',
              }}
              onClick={() => handeRemoveItem(item)}
            />
          </div>
        );
      });
    }
  };

  const tableProps = {
    dataSet: lovDS,
    queryFieldsLimit: 2,
    highLightRow: false,
    columns: columns(),
    autoHeight: { type: 'maxHeight', diff: 20 },
  };

  return (
    <Sidebar
      title={intl.get('sdps.dataSheet.view.title.seletTable').d('选择表')}
      visible={visible}
      closable
      destroyOnClose
      maskClosable={false}
      onCancel={handleCloseModal}
      className="topic-subscribe-modal"
      width={980}
      footer={
        <div>
          <Button color="primary" onClick={handleSelect}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      }
    >
      <div className="topic-subscribe-modal-content">
        <div className="topic-modal-left-table">
          <div className="add-subscribe-modal">
            <Table {...tableProps} />
          </div>
        </div>
        <div className="topic-modal-select-list">{drawSelectItem()}</div>
      </div>
    </Sidebar>
  );
};

export default AddTableModal;
