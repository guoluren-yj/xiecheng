import React, { useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';
// import notification from 'utils/notification';
import style from './index.less';

import { handleOpenBatchDefine, openCustomDimension } from '../drawer';

const BatchTable = observer(({ batchLineDs, readOnly = false }) => {

  const handleDelete = () => {
    const selectData = batchLineDs.selected;
    if (selectData.length > 0) {
      batchLineDs.delete(selectData, {
        title: (
          <span>
            {intl.get('hzero.common.message.confirm.title').d('提示')}
          </span>
        ),
        children: (
          <span>
            {intl.get('sagm.common.modal.confirm.content').d('是否确定删除?')}
          </span>
        ),
      });
    }
  };

  const addCallBack = (selects = []) => {
    selects.forEach(r => {
      batchLineDs.create(r?.toData());
    });
  };
  const columns = useMemo(() => {
    return [
      {
        name: 'dimensionCode',
        // width: 300,
        renderer: ({ record, value }) => (
          <a
            funcType='link'
            color='primary'
            onClick={() => openCustomDimension({
              dimensionId: record.get('dimensionId'),
              readOnly,
              dimensionDs: batchLineDs,
            })}
          >
            {value}
          </a>
        ),
      },
      {
        name: 'dimensionName',
        // width: 300,
      },
      {
        name: 'orderSeq',
        width: 100,
        // show: !readOnly,
        renderer: ({ record }) => {
          return record.index + 1;
        },
      },
      // {
      //   name: 'option',
      //   header: intl.get('hzero.common.action').d('操作'),
      //   width: 100,
      //   hidden: readOnly,
      //   renderer: ({ record }) => (
      //     <Button
      //       funcType='link'
      //       color='primary'
      //       onClick={() => handleDelete(record)}
      //     >
      //       {intl.get('hzero.common.button.delete').d('删除')}
      //     </Button>
      //   ),
      // },
    ].filter(f => f.show !== false);
  }, [readOnly]);
  const buttons = useMemo(() => ([
    <Button
      icon="playlist_add"
      funcType="flat"
      onClick={() => handleOpenBatchDefine(false, batchLineDs.map(m => m.get('dimensionId')), addCallBack)}
    >
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    <Button
      icon="delete_sweep"
      funcType="flat"
      disabled={batchLineDs.selected.length === 0}
      onClick={handleDelete}
    >
      {intl.get('sstk.common.button.batchDelete').d('批量删除')}
    </Button>,
    // <Button
    //   icon="add"
    //   funcType="flat"
    //   onClick={openCustomDimension}
    // >
    //   {intl.get('sstk.common.button.newCustomDimension').d('新建自定义维度')}
    // </Button>,
  ]), [batchLineDs.length, batchLineDs.selected.length]);
  return (
    <Table
      style={{ width: '75%', marginTop: 20 }}
      customizedCode='SSTK.STOCK_STRATEGY_CONFIG.DETAIL.DIMENSION_TABLE'
      dataSet={batchLineDs}
      buttons={readOnly ? [] : buttons}
      columns={columns}
      rowDraggable={!readOnly}
    />
  );
});

export default observer(function BatchConfig(props) {
  const { readOnly, batchLineDs, baseInfoDs } = props;
  const batchLineProps = {
    readOnly, batchLineDs, baseInfoDs,
  };
  return (
    <>
      <p className={style['batch-dimension-tip']}>{
        readOnly
          ? intl.get('sstk.stockConfig.view.dragHelp').d('系统将按维度顺序拼接维度值编码作为批次号。')
          : intl.get('sstk.stockConfig.view.editDragHelp').d('批次维度可进行拖拽排序，排序将用于生成批次号')
      }
      </p>
      <BatchTable {...batchLineProps} />
    </>
  );
});