/* eslint-disable no-param-reassign */
/**
 * 租户部分 数据表页面
 */
import React, { useEffect, useState } from 'react';
import { Table, Button, useModal, Modal as ModalPro } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import QueryBarMore from '@/components/QueryBarMore';
import SortSelector from '@/components/SortSelector';

import { fetchBatchRemove } from '@/services/cardsDistributionService';

// import FilterBar from './FilterBar';
import DetailModal from './DetailModal';
import AddTableModal from './AddCardModal';

import styles from './index.less';

const OrgSubscribForm = (props) => {
  const {
    dataSet,
    lovDS,
    localRecord,
    formDS,
    historyDS,
    // topicLovDS,
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
      dataSet.addEventListener('load', loadDataEvent);
      dataSet.queryParameter = {
        tenantId: localRecord.tenantId,
      };
      dataSet.query();
    }

    return () => {
      dataSet.removeEventListener('select', refreshPage);
      dataSet.removeEventListener('unSelect', refreshPage);
      dataSet.removeEventListener('batchSelect', refreshPage);
      dataSet.removeEventListener('batchUnSelect', refreshPage);
      dataSet.removeEventListener('load', loadDataEvent);
      dataSet.data = [];
      lovDS.data = [];
      dataSet.reset();
      lovDS.reset();
    };
  }, [localRecord]);

  const loadDataEvent = (params) => {
    params.dataSet.forEach((item) => {
      if (item.get('level') === 'site') {
        item.selectable = false;
      }
    });
  };

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
        title: intl.get('sdat.cardsDistribution.view.title.cardDetail').d('卡片详情'),
        destroyOnClose: true,
        style: { width: '742px' },
        children: <DetailModal localRecord={record} cardFormDS={formDS} historyDS={historyDS} />,
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

  const columns = () => {
    return [
      {
        name: 'cardNum',
        renderer: ({ text, record }) => {
          return <a onClick={() => openDetailModal(record)}>{text}</a>;
        },
      },
      { name: 'cardName' },
      { name: 'cardType' },
      { name: 'level' },
      { name: 'cardGroupCode' },
      { name: 'orderSeq' },
      { name: 'operateTime' },
      { name: 'operateUserName' },
    ];
  };

  /**
   * 删除数据
   */
  const handleRemove = async () => {
    if (dataSet.selected.length) {
      ModalPro.confirm({
        title: intl.get('sdat.cardsDistribution.view.message.confirmDelete').d('是否确认移除？'),
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
      notification.error({
        message: intl
          .get('sdat.cardsDistribution.view.message.selectToDel')
          .d('请勾选您要删除的数据'),
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
      lovDS.data = [];
      lovDS.reset();
    }
  };

  const buttons = () => {
    return [
      <Button icon="playlist_add" onClick={handleOpenLov}>
        {intl.get('sdat.cardsDistribution.view.button.addCard').d('添加卡片')}
      </Button>,
      <Button icon="delete_sweep" onClick={handleRemove} disabled={!canClick}>
        {intl.get('hzero.common.button.remove').d('移除')}
      </Button>,
    ];
  };

  const handleOpenLov = async () => {
    setVisible(true);
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

  /**
   * 排序字段
   */
  const fields = [
    {
      name: 'orderSeq',
      label: intl.get(`sdat.cardsDistribution.model.cardSort`).d('卡片排序'),
    },
    {
      name: 'lastUpdateDate',
      label: intl.get(`sdat.cardsDistribution.model.operationTime`).d('操作时间'),
    },
  ];

  const handleQuerySort = (sortFieldCode, sortType) => {
    const sort = `${sortFieldCode},${sortType?.toLowerCase() ?? ''}`;
    dataSet.setQueryParameter('sort', sort);
    dataSet.query();
  };

  const rightRender = () => {
    return (
      <div className={styles['search-sort-area']}>
        <SortSelector
          sortFieldCode="lastUpdateDate"
          onSortQuery={handleQuerySort}
          fields={fields}
        />
      </div>
    );
  };

  const renderQueryBar = (prop) => {
    return <QueryBarMore renderRight={rightRender} {...prop} />;
  };

  return (
    <>
      <div className={styles['card-page-title']}>
        {intl.get('sdat.cardsDistribution.view.title.cardList').d('卡片列表')}
      </div>
      <div
        style={{
          marginTop: '8px',
        }}
      >
        <Table
          dataSet={dataSet}
          columns={columns()}
          buttons={buttons()}
          queryBar={renderQueryBar}
          customizable
          customizedCode="SDAT.CARD_DISTRIBUTION_CARD_LIST"
        />
      </div>
      {visible && <AddTableModal {...addTableprops} />}
    </>
  );
};

export default OrgSubscribForm;
