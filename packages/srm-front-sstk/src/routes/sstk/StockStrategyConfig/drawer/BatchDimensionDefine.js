import React, { useMemo, useEffect } from 'react';
import { Tag } from 'choerodon-ui';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import c7nModal, { confirm } from '@/utils/c7nModal';
import { EnableColorTag } from '@/routes/sstk/components/Tag';

import CustomDimension from './CustomDimension';
import batchDimensionDS from '../store/batchDimensionDs';
import { enabledDimension, fetchValidateDimension } from '../api';

export default function BatchDimensionDefine({ noCheck = true, relationDimensionIds = [], modal, callBack = e => e }) {
  const params = noCheck ? {} : { enabledFlag: 1 };
  const ds = useMemo(() => new DataSet(batchDimensionDS(noCheck, relationDimensionIds, params)), []);

  useEffect(() => {
    modal.handleOk(async () => {
      // if (readOnly) return true;
      if (!noCheck) {
        callBack(ds.selected);
      }
      return true;
    });
  }, []);

  const handleEnabled = async (record) => {
    const { dimensionId, enabledFlag } = record.get(['dimensionCode', 'dimensionName', 'dimensionId', 'enabledFlag']);
    if(!enabledFlag) {
      const res1 = getResponse(await enabledDimension({ ...record.toData(), enabledFlag: +!enabledFlag }));
      if (res1) {
        ds.query();
      }
      return;
    }
    const res = getResponse(await fetchValidateDimension(dimensionId));
    if ((res || []).length > 0) {
      const { strategyCode, strategyName } = res[0];
      confirm({
        content: intl.get('sstk.stockConfig.view.confirm.disableDimension', {
          code: strategyCode,
          name: strategyName,
        })
          .d(`该维度已被库存批次{${strategyCode}, ${strategyName}}引用，不可禁用`),
        okCancel: false,
      });
    }
    else {
      const res1 = getResponse(await enabledDimension({ ...record.toData(), enabledFlag: +!enabledFlag }));
      if (res1) {
        ds.query();
      }
    }
  };
  const openCustomDimension = (record) => {
    const dimensionId = record && record.get('dimensionId');
    const title = record ?
      intl.get('sstk.stockConfig.view.editCustomDimension').d('编辑批次维度')
      : intl.get('sstk.stockConfig.view.addCustomDimension').d('新建批次维度');
    c7nModal({
      title,
      style: { width: 742 },
      children: <CustomDimension dimensionId={dimensionId} dimensionDs={ds} />,
    });
  };
  const openCustomDimensionBefore = async (record) => {
    const { dimensionId } = record.get(['dimensionCode', 'dimensionName', 'dimensionId']);
    const res = getResponse(await fetchValidateDimension(dimensionId));
    if ((res || []).length > 0) {
      const { strategyCode, strategyName } = res[0];
      confirm({
        content: intl.get('sstk.stockConfig.view.confirm.changeDimension', {
          dimensionCode: strategyCode,
          dimensionName: strategyName,
        })
          .d(`该维度已被批次{${strategyCode}, ${strategyName}}引用，变更维度信息可能导致批次号取值逻辑变更，确认要变更该维度吗？`),
        onOk: () => openCustomDimension(record),
      });
    }
    else {
      openCustomDimension(record);
    }
  };
  const columns = useMemo(() => {
    return [
      {
        name: 'enabledFlag',
        width: 120,
        show: noCheck,
        renderer: ({ record }) => (
          <EnableColorTag
            enabledFlag={record.get('enabledFlag')}
            yesText={intl.get('sstk.stockConfig.button.enabled').d('已启用')}
            noText={intl.get('sstk.stockConfig.button.disabled').d('已禁用')}
          />
        ),
      },
      {
        name: 'dimensionCode',
        width: 150,
        renderer: ({ record, text }) => (
          <a
            onClick={() => openCustomDimensionBefore(record)}
          >
            {text}
          </a>
        ),
      },
      {
        name: 'dimensionName',
        width: 150,
      },
      // 维度来源：预定义 || 自定义
      {
        name: 'sourceType',
        renderer: ({ record, value }) => (
          <Tag
            color={value === 'PREDEFINED' ? 'green' : 'blue'}
            style={{ fontWeight: 400 }}
          >
            {record.get('sourceTypeMeaning')}
          </Tag>
        ),
      },
      {
        name: 'option',
        header: intl.get('hzero.common.action').d('操作'),
        show: noCheck,
        width: 100,
        renderer: ({ record }) => record.get('sourceType') === 'PREDEFINED' ? '' : (
          <Button
            funcType='link'
            color='primary'
            onClick={() => handleEnabled(record)}
          >
            {record.get('enabledFlag')
              ? intl.get('hzero.common.button.disable').d('禁用')
              : intl.get('hzero.common.button.enable').d('启用')}
          </Button>
        ),
      },
    ].filter(f => f.show !== false);
  }, [noCheck]);

  return (
    <>
      <Table
        style={{ maxHeight: 'calc(100% - 38px)' }}
        dataSet={ds}
        customizedCode='SSTK.STOCK_STRATEGY_CONFIG.DIMENSION_TABLE'
        buttons={[
          <Button icon="playlist_add" funcType="flat" onClick={() => openCustomDimension(null)}>
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>,
        ]}
        columns={columns}
      />
    </>
  );
}