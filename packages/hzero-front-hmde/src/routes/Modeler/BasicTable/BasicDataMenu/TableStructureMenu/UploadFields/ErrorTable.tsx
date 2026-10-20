/*
 * @filename:
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2021
 */
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import Modal from '@/components/LowcodeModal';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import styles from './index.less';

const modalKey = Modal.key();
export default function useErrorTable() {
  /**
   * 错误信息DS
   */
  const errDS = useMemo(
    () =>
      new DataSet({
        primaryKey: '',
        selection: false,
        paging: false,
        fields: [
          {
            name: 'fileName',
            label: '脚本文件名',
            readOnly: true,
          },
          {
            name: 'errorMsg',
            label: '失败原因',
            readOnly: true,
          },
        ],
      }),
    []
  );

  const thisColumns: ColumnProps[] = [
    {
      name: 'fileName',
      align: ColumnAlign.left,
      width: 200,
      renderer: ({ record }) => {
        return <Tooltip title={record?.get('fileName')}>{record?.get('fileName')}</Tooltip>;
      },
    },
    {
      name: 'errorMsg',
      align: ColumnAlign.left,
      renderer: ({ record }) => {
        return <Tooltip title={record?.get('errorMsg')}>{record?.get('errorMsg')}</Tooltip>;
      },
    },
  ];

  const childrenCom = (
    <React.Fragment>
      <div className={styles['top-warning']}>
        <span className={styles['top-warning-icon']} />
        <span className={styles['top-warning-content']}>导入脚本失败</span>
      </div>
      <Table
        className={globalStyles['table-style']}
        rowHeight={30}
        columns={thisColumns}
        dataSet={errDS}
      />
      <div className={styles['bottom-warning']}>以上脚本文件导入失败，请检查后重新导入！</div>
    </React.Fragment>
  );

  /**
   * 初始化打开弹窗
   */
  type IHandelOpenErrList = (errInfo: model.ErrorTableVO[]) => void;
  const handelOpenErrList: IHandelOpenErrList = async (errInfo = []) => {
    await Modal.open({
      lowcodeSize: 'big',
      title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>导入提示</div>,
      key: modalKey,
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      okCancel: false,
      children: childrenCom,
      okText: '知道了',
      afterClose: () => {
        errDS.loadData([]);
      },
    });
    errDS.loadData(errInfo);
  };

  return {
    handelOpenErrList,
  };
}
