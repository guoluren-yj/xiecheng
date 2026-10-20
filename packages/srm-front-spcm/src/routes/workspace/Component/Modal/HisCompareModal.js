/*
 * @Description: 非补充协议的历史版本对比弹窗
 * @Date: 2024-07-03 10:56:12
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Modal, Form, DataSet } from 'choerodon-ui/pro';
import { TreeSelect } from 'choerodon-ui';
import intl from 'utils/intl';
import classnames from 'classnames';
import { getResponse } from 'utils/utils';
import { queryCompareContract } from '@/services/workspaceService';
import { transfromTreeSelectKey } from '@/utils/util';

import ChangeCompare from '../../Detail/components/changeCompare';

import styles from './index.less';

const historyDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'pcHeaderId',
      type: 'string',
      label: intl.get('spcm.workspace.model.common.version').d('版本'),
    },
    {
      name: 'mainContractId',
      type: 'string',
      label: intl.get('spcm.workspace.model.common.version').d('版本'),
    },
  ],
});

export default async function showHisCompareModal(props, headerInfo) {
  const { pcHeaderId, pcNum, rebateFlag } = headerInfo;
  let newPcHeaderId = pcHeaderId;
  let newMainContractId = null;
  // 初始化ds;
  const historyDs = new DataSet(historyDS());
  historyDs.create({});

  const contractList = getResponse(await queryCompareContract({ mainContractId: pcHeaderId }));
  if (!contractList) {
    return false;
  }
  const treeData = transfromTreeSelectKey({
    dataList: contractList,
    childrenField: 'compareHeaderDtos',
  });

  Modal.open({
    closable: true,
    drawer: true,
    key: Modal.key(),
    title: (
      <span>
        {intl.get('spcm.workspace.title.comparison.areaSelection').d('对比区域选定')}-
        {pcNum}
      </span>
    ),
    style: {
      width: '380px',
    },
    children: (
      <Form
        // dataSet={historyDs}
        columns={1}
        labelAlign="left"
        labelLayout="float"
        className={classnames(styles['close-from-wrapper'])}
      >
        <h3 className={classnames(styles['close-sub-title'])}>
          {intl.get('spcm.common.view.title.currentMode').d('当前打开版本')}
        </h3>
        <TreeSelect
          name="pcHeaderId"
          defaultValue={pcHeaderId}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          treeData={treeData}
          treeDefaultExpandAll
          // Form组件的dataSet无法控制TreeSelect,所以手写变更
          onChange={val => {
            newPcHeaderId = val;
          }}
        />
        <h3 className={classnames(styles['close-sub-title'], styles['close-top-16'])}>
          {intl.get('spcm.common.view.title.referenceVersion').d('参照版本')}
        </h3>
        <TreeSelect
          name="mainContractId"
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          treeData={treeData}
          treeDefaultExpandAll
          onChange={val => {
            newMainContractId = val;
          }}
        />
      </Form>
    ),
    afterClose: () => {
      historyDs.reset();
    },
    onOk: async () => {
      showHisCompareContentModal(props, {
        rebateFlag,
        pcHeaderId: newPcHeaderId,
        mainContractId: newMainContractId,
      });
    },
  });
}

export async function showHisCompareContentModal(props, headerInfo) {
  const { pcHeaderId, mainContractId, rebateFlag } = headerInfo;
  if (!pcHeaderId || !mainContractId) {
    return false;
  }

  Modal.open({
    destroyOnClose: true,
    closable: true,
    key: Modal.key(),
    drawer: true,
    title: intl.get(`hzero.common.button.contractHistoryCompare`).d('历史版本对比'),
    children: (
      <ChangeCompare
        {...props}
        mainContractId={mainContractId}
        pcHeaderId={pcHeaderId}
        rebateFlag={rebateFlag}
        fieldComparison
      />
    ),
    cancelProps: {
      color: 'primary',
    },
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    footer: (okBtn, cancelBtn) => cancelBtn,
    bodyStyle: { padding: 10, backgroundColor: '#f4f4f4' },
    style: { width: '1200px' },
  });
}
