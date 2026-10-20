import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Table, Button } from 'choerodon-ui/pro';
import { Modal, Icon } from 'choerodon-ui';

import styles from './index.less';

const { Sidebar } = Modal;

const TenantLovModal = (props) => {
  const { visible, onCancel = () => {}, lovDS, onSelect = () => {}, localRecord } = props;

  const [selectList, setList] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    lovDS.queryParameter = {
      cardId: localRecord.cardId,
      tableName: localRecord.tableName,
    };
    lovDS.query();
  }, [localRecord]);

  useEffect(() => {
    lovDS.addEventListener('select', selectEvent);
    lovDS.addEventListener('unSelect', selectEvent);
    lovDS.addEventListener('selectAll', selectEvent);
    lovDS.addEventListener('unSelectAll', selectEvent);

    return () => {
      lovDS.removeEventListener('select', selectEvent);
      lovDS.removeEventListener('unSelect', selectEvent);
      lovDS.removeEventListener('selectAll', selectEvent);
      lovDS.removeEventListener('unSelectAll', selectEvent);
      lovDS.data = [];
      lovDS.reset();
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
    if (selectList.length) {
      onSelect(selectList);
    }
  };

  const columns = () => {
    return [{ name: 'tenantName' }, { name: 'tenantNum' }];
  };

  /**
   * 删除列表中的某条数据
   */
  const handeRemoveItem = () => {
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
          {intl.get('sdat.cardsDistribution.view.message.selectLeftList').d('请选择左侧列表数据')}
        </div>
      );
    }
    if (selectList.length) {
      return selectList.map((item) => {
        return (
          <>
            <div className={styles['select-item-row']}>
              <span
                style={{
                  display: 'inline-block',
                  width: '230px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {`${item.tenantNum} ${item.tenantName}`}
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
          </>
        );
      });
    }
  };

  const tableProps = {
    dataSet: lovDS,
    queryFieldsLimit: 2,
    highLightRow: false,
    columns: columns(),
  };

  return (
    <Sidebar
      title={intl.get('sdat.cardsDistribution.view.btn.distribution').d('分发')}
      visible={visible}
      closable
      destroyOnClose
      maskClosable={false}
      onCancel={handleCloseModal}
      className={styles['tenant-lov-modal']}
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
      <div className={styles['tenant-subscribe-modal-content']}>
        <div className={styles['tenant-modal-left-table']}>
          <div className={styles['add-subscribe-modal']}>
            <Table {...tableProps} />
          </div>
        </div>
        <div className={styles['tenant-modal-select-list']}>{drawSelectItem()}</div>
      </div>
    </Sidebar>
  );
};

export default TenantLovModal;
