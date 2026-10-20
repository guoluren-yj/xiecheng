import React, { useMemo, useEffect } from 'react';
import { connect } from 'dva';
import { compose } from 'lodash';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { sortZhuanqu } from '@/services/mallHomeConfigService';
import Zhuanqu from './Zhuanqu';
import { tableds } from './tableds';
import styles from './index.less';
import { DeleteButton } from '../../common/buttons';

function EditZhuanqu(props) {
  const {
    dispatch,
    mallHome,
    mallHome: { currentRole, mallType },
  } = props;

  const zhuanquList = mallHome[`${mallType}zhuanquList`];

  // 编辑专区
  function openZhuanqu(record) {
    Modal.open({
      destroyOnClose: true,
      title: record
        ? intl.get(`small.mallHomePlate.view.zhuanqu.edit`).d('编辑专区')
        : intl.get('small.mallHomePlate.view.zhuanqu.create').d('新增专区'),
      mask: true,
      okText: intl.get('small.common.button.save').d('保存'),
      closable: true,
      style: { width: 380 },
      drawer: true,
      children: <Zhuanqu DS={tableDs} record={record} />,
    });
  }

  useEffect(() => {
    tableDs.loadData(zhuanquList);
  }, [zhuanquList]);

  const tableDs = useMemo(() => {
    return new DataSet(tableds());
  }, []);

  async function handleDelete() {
    const res = await tableDs.delete(tableDs.selected);
    if(res) {
      dispatch({
        type: 'mallHome/fetchZhuanqu',
        payload: {
          belongType: 0,
          channel: mallType === 'sigl' ? 1 : 0,
          isPreview: 1,
        },
      });
    }
  }

  const columns = [
    {
      width: 80,
      name: 'orderSeq',
      renderer: ({ record }) => {
        return (record.index || 0) + 1;
      },
    },
    {
      name: 'blockTitle',
      renderer: ({ value, record }) => {
        return (
          <span className="action-link">
            <Button
              funcType="link"
              color="primary"
              disabled={currentRole === 'purchase' && +record.get('belongType') === 0}
              onClick={() => openZhuanqu(record)}
            >
              {value}
            </Button>
          </span>
        );
      },
    },
    {
      name: 'aboutContent',
      renderer: ({ record }) => {
        return +record.get('blockType') === 2
          ? record.get('quickUrl')
          : record.get('productGroupName');
      },
    },
  ];

  async function handleDragEnd() {
    tableDs.status = 'loading';
    await getResponse(
      sortZhuanqu({
        page: tableDs.currentPage,
        size: tableDs.pageSize,
        pageSize: tableDs.totalPage,
        specialBlockSortList: tableDs.toData(),
      })
    );
    dispatch({
      type: 'mallHome/fetchZhuanqu',
      payload: {
        belongType: 0,
        channel: mallType === 'sigl' ? 1 : 0,
        isPreview: 1,
      },
    }).then(() => {
      tableDs.status = 'ready';
    });
  }

  function onDragEndBefore(dataSet, _, resultDrag) {
    if (!resultDrag.destination) return false;
    // const data = dataSet.toData();
    // const {
    //   source: { index },
    //   destination: { index: dindex },
    // } = resultDrag;
    // if (+data[index].belongType === 0 && currentRole === 'purchase') {
    //   return false;
    // } else if (+data[dindex].bannerLevel === 0 && currentRole === 'purchase') {
    //   return false;
    // } else {
    //   return true;
    // }
  }

  return (
    <div className={styles.content}>
      <p className='des'>
        {intl
          .get('small.mallHomeConfig.view.zhuanqu.maxdesc')
          .d('该模板可用于租户对专区的配置，商城首页默认显示前7个专区信息。可拖拽对专区进行排序。')}
      </p>
      <Table
        customizedCode='BLOCK_LIST_TABLE'
        dragColumnAlign="left"
        dataSet={tableDs}
        columns={columns}
        rowDraggable
        onDragEnd={handleDragEnd}
        onDragEndBefore={onDragEndBefore}
        style={{maxHeight: `calc(100vh - 220px)`}}
        buttons={[
          <Button
            color="primary"
            funcType="flat"
            onClick={() => openZhuanqu()}
            icon="playlist_add"
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>,
          <DeleteButton dataSet={tableDs} onClick={() => handleDelete()} />,
        ]}
      />
    </div>
  );
}

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  }))
)(EditZhuanqu);
