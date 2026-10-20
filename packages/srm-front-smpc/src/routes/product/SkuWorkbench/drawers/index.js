import React from 'react';
import { DataSet, Modal, Table, DateTimePicker } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

// import EnableTag from '@/components/EnableTag';
import AuthDetail from '@/routes/sagm/AuthDetail';
import { START_TIME_MOMENT, END_TIME_MOMENT } from '@/utils/const';

import { evaluateDs, authDs, versionDs, recordDs } from './ds';
import openTree from './tree';
import openLabels from './label';
// eslint-disable-next-line import/no-cycle
import openBatchSku from './batchSku';
import openTextArea from './textArea';
import openPriceInfo from './priceInfo';
import openStockInfo from './stockInfo';
import openLadderPrice from './ladderPrice';
import openUploadImg from './uploadImg';
import openSkuFeedback from './skuFeedback';
import openNewPackageSku from './newPackageSku';
import SkuCondition from './SkuCondition';
import { operateRecord, historyRecord, priceRecord, openRecordTabs } from './record';
import { updateEvaluate } from '../../SkuEvaluate/api';
import { fetchUnits, fetchRegions } from '../api';
import ImageList from '../../SkuEvaluate/ImageList';
import { rendererScores } from '../../SkuEvaluate';
import styles from './style.less';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: false,
  destroyOnClose: true,
  drawer: true,
  okText: intl.get('hzero.common.button.save').d('保存'),
};

// 评价
export function openEvaluate(skuId) {
  const ds = new DataSet(evaluateDs());
  ds.setQueryParameter('skuId', skuId);
  ds.query();

  const evaluateUpdate = async (data, flag) => {
    ds.status = 'loading';
    const result = await getResponse(updateEvaluate({ flag, data: data.map((e) => e.toData()) }));
    ds.status = 'ready';
    if (result) {
      notification.success();
      ds.query(ds.currentPage);
    }
  };

  const columns = [
    {
      name: 'option',
      width: 155,
      lock: 'left',
      renderer: ({ record }) => {
        const hiddenFlag = record.get('hiddenFlag');
        return (
          <span className="action-link">
            <a disabled={hiddenFlag === 0} onClick={() => evaluateUpdate([record], 0)}>
              {intl.get('smpc.product.model.show').d('显示')}
            </a>
            <a disabled={hiddenFlag === 1} onClick={() => evaluateUpdate([record], 1)}>
              {intl.get('smpc.product.model.hidden').d('隐藏')}
            </a>
            <a onClick={() => evaluateUpdate([record], 2)}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </a>
          </span>
        );
      },
    },
    {
      name: 'evaluate',
      width: 280,
      renderer: rendererScores,
    },
    {
      name: 'assessmentDate',
      width: 155,
    },
    {
      name: 'imageView',
      width: 180,
      renderer: ({ record }) => {
        const { assessmentFileList } = record.toData();
        return <ImageList imageDTO={assessmentFileList || []} />;
      },
    },
  ];
  Modal.open({
    title: intl.get('smpc.product.view.lookComment').d('查看评价'),
    ...modalProps,
    style: { width: 750 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <Table
        className={styles['evaluate-container']}
        dataSet={ds}
        rowHeight="auto"
        columns={columns}
        queryFieldsLimit={2}
        queryFields={{ assessDateTo: <DateTimePicker defaultTime={END_TIME_MOMENT} /> }}
      />
    ),
  });
}

function openAuthDetail({ authorityListId, agreementType, agreementHeaderId, viewSkuBackPath }) {
  Modal.open({
    ...modalProps,
    okCancel: false,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('sagm.common.view.authorityDetail').d('权限详情'),
    children: (
      <AuthDetail
        viewSkuBackPath={viewSkuBackPath}
        queryParams={{
          agreementType,
          authorityListId,
          agreementHeaderId,
        }}
      />
    ),
  });
}

// 查看权限信息
export function openAuths(r, viewSkuBackPath = '/smpc/sku-workbench-pur/list') {
  const ds = new DataSet(authDs());
  const { skuId, authorityListId, agreementType, agreementHeaderId } = r.get([
    'skuId',
    'agreementType',
    'authorityListId',
    'agreementHeaderId',
  ]);
  ds.setQueryParameter('skuId', skuId);
  ds.query();
  const columns = [
    {
      name: 'statusCodeMeaning',
      width: 110,
      align: 'center',
      tooltip: 'none',
      renderer: ({ record, value }) => {
        const { statusCode, enableFlag } = record.get(['statusCode', 'enableFlag']);
        let code = statusCode;
        if (!['PUBLISHED', 'EXECUTING'].includes(statusCode)) {
          code = 'UNPUBLISH';
        }
        if (!enableFlag) {
          code = 'DISABLED';
        }
        const _map = {
          PUBLISHED: {
            color: 'green',
            meaning: value,
          },
          UNPUBLISH: {
            color: 'yellow',
            meaning: intl.get('sagm.common.view.status.unPublish').d('未发布'),
          },
          DISABLED: {
            color: 'red',
            meaning: intl.get('sagm.common.view.status.disabled').d('已禁用'),
          },
          EXECUTING: {
            color: 'yellow',
            meaning: value,
          },
        };
        return (
          <Tag color={_map[code]?.color} border={false}>
            {_map[code]?.meaning}
          </Tag>
        );
      },
    },
    {
      name: 'authorityListCode',
      width: 120,
      renderer: ({ record, text }) => (
        <a
          onClick={() =>
            openAuthDetail({
              ...record.get(['authorityListId', 'agreementType', 'agreementHeaderId']),
              viewSkuBackPath,
            })
          }
        >
          {text}
        </a>
      ),
    },
    {
      name: 'authorityListName',
      width: 140,
    },
    {
      name: 'agreementTypeMeaning',
      width: 90,
    },
    {
      name: 'agreementHeaderNum',
      width: 160,
    },
    {
      name: 'controlWayCodeMeaning',
      width: 90,
    },
    { name: 'controlRangeMeaning', width: 90 },
    {
      name: 'remarkMeaning',
      width: 180,
    },
    {
      name: 'realName',
      width: 90,
    },
    {
      name: 'creationDate',
      width: 160,
    },
  ];
  Modal.open({
    title: intl.get('smpc.product.view.skuAuthInfo').d('商品权限信息'),
    ...modalProps,
    style: { width: 1090 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <Table
        dataSet={ds}
        columns={columns}
        customizedCode="VIEW.SKU_AUTHORITY.LIST"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      />
    ),
  });
  if (authorityListId) {
    openAuthDetail({ authorityListId, agreementType, agreementHeaderId, viewSkuBackPath });
  }
}

// 历史版本
export function openVersions({ skuId, onView = (e) => e }) {
  const ds = new DataSet(versionDs());
  ds.setQueryParameter('skuId', skuId);
  ds.query();
  const columns = [
    {
      name: 'version',
      width: 100,
    },
    {
      name: 'skuName',
      minWidth: 180,
    },
    {
      name: 'creationDate',
      width: 160,
    },
    {
      name: 'option',
      width: 100,
      renderer: ({ record }) => (
        <a onClick={() => onView(record)}>
          {intl.get('smpc.product.view.lookDetail').d('查看详情')}
        </a>
      ),
    },
  ];
  Modal.open({
    title: intl.get('smpc.product.view.skuHistoryRecord').d('商品历史记录'),
    ...modalProps,
    style: { width: 750 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: <Table dataSet={ds} columns={columns} queryFieldsLimit={2} />,
  });
}

// 操作记录|库存记录
export function openRecords(skuId, url, type, totalStock, isStockPur) {
  const ds = new DataSet(recordDs(url, isStockPur));
  ds.setQueryParameter('skuId', skuId);
  ds.query();
  const columns = [
    {
      name: 'realName',
      width: 120,
      renderer: ({ record, text }) => {
        const { operationUser, operationUserType } = record.toData();
        const isSystem = [0, 1].includes(operationUser) && ![1, 2].includes(operationUserType); // operationUserType 0、历史数据 1、系统 2、电商
        // 针对匿名用户
        if (isSystem) {
          return intl.get('smpc.product.view.realName').d('系统');
        }
        return text;
      },
    },
    {
      name: 'operationCodeMeaning',
      width: 120,
    },
    {
      name: 'operationContentMeaning',
      minWidth: 180,
      renderer: ({ record, value }) => {
        const { quantity } = record.toData();
        return value || quantity;
      },
    },
    {
      name: 'availableStock',
      width: 120,
      show: type === 'stock',
      renderer: ({ value }) =>
        totalStock === -1 ? intl.get('smpc.product.model.noLimitStock').d('无限库存') : value,
    },
    {
      name: 'operationTime',
      width: 160,
    },
    {
      name: 'remark',
      width: 150,
      show: type === 'stock',
    },
  ].filter((f) => f.show !== false);
  const title =
    type === 'stock'
      ? intl.get('smpc.product.view.title.stockRecord').d('库存记录')
      : intl.get('smpc.product.view.operateRecord').d('操作记录');
  Modal.open({
    title,
    ...modalProps,
    style: { width: 750 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <Table
        dataSet={ds}
        columns={columns}
        queryFieldsLimit={2}
        queryFields={{
          creatimeDateFrom: <DateTimePicker defaultTime={START_TIME_MOMENT} />,
          creatimeDateTo: <DateTimePicker defaultTime={END_TIME_MOMENT} />,
        }}
      />
    ),
  });
}

export function openUnitTree(params) {
  openTree({
    idField: 'unitId',
    allField: 'allUnitFlag',
    textField: 'unitName',
    name: 'skuSalesUnits',
    parentField: 'parentUnitId',
    compose: { composeKey: 'unitCodeName', composeFields: ['unitCode', 'unitName'] },
    title: intl.get('smpc.product.view.assignOrg').d('分配组织'),
    allText: intl.get('smpc.product.model.allOrg').d('所有组织'),
    api: fetchUnits,
    ...params,
  });
}

export function openRegionTree(params) {
  openTree({
    idField: 'regionCode',
    allField: 'allRegionFlag',
    textField: 'regionName',
    name: 'skuSalesRegions',
    parentField: 'parentRegionCode',
    title: intl.get('smpc.product.view.assignRegion').d('分配区域'),
    allText: intl.get('smpc.product.model.allRegion').d('所有区域'),
    api: fetchRegions,
    ...params,
  });
}

// 商品标签
export {
  openLabels,
  openBatchSku,
  openPriceInfo,
  openStockInfo,
  openTextArea,
  priceRecord,
  operateRecord,
  openRecordTabs,
  historyRecord,
  openLadderPrice,
  openUploadImg,
  openSkuFeedback,
  SkuCondition,
  openNewPackageSku,
};
