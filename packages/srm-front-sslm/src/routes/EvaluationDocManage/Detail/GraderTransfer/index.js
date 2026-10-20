/*
 * @Date: 2022-09-14 14:19:42
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import { useObserver } from 'mobx-react-lite';
import React, { useMemo, useCallback } from 'react';
import { Table, DataSet, Button, Modal, TextArea } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { weightSameJudge, batchTransfer } from '@/services/evaluationDocManageService';
import EditScorerInfo from './EditScorerInfo';
import { getGraderTransferDS } from './stores/getGraderTransferDS';

const GraderTransfer = ({ evalHeaderId, averageFlag, granularity, onSearch }) => {
  const dataSet = useMemo(
    () => new DataSet(getGraderTransferDS({ evalHeaderId, granularity })),
    []
  );

  // 转交回调
  const handleTransmit = useCallback(() => {
    const kpiEvalDtlResps = dataSet.toJSONData();
    // 获取勾选数据
    const checkData = dataSet.toJSONData();
    // 是否跨页全选
    const checkAll = dataSet.isAllPageSelection;
    // 未选中的值
    const unCheckData = dataSet.unSelected.map((record) => record.toData());
    // 获取查询条件
    const queryData = dataSet.queryDataSet?.current.toJSONData();
    const payload = {
      evalHeaderId,
      selectAllFlag: checkAll ? 1 : 0,
      kpiEvalDtlResps: checkAll ? [] : checkData,
      unChooseKpiEvalDtlResps: unCheckData,
      ...queryData,
    };
    return weightSameJudge(payload).then((response) => {
      const res = getResponse(response);
      if ([false, true].includes(res)) {
        let scorerInfoDs;
        Modal.open({
          drawer: true,
          key: Modal.key(),
          style: { width: 650 },
          bodyStyle: { padding: 0 },
          title: intl.get('sslm.supplierDocManage.view.title.editScorerInfo').d('编辑评分人信息'),
          children: (
            <EditScorerInfo
              weightSameFlag={res}
              averageFlag={averageFlag}
              onRef={(ds) => {
                scorerInfoDs = ds;
              }}
              currentRespWeight={kpiEvalDtlResps[0]?.respWeight}
            />
          ),
          onOk: async () => {
            let transformReason = '';
            const validateFlag = await scorerInfoDs?.validate();
            if (validateFlag) {
              Modal.open({
                key: Modal.key(),
                title: intl
                  .get(`sslm.supplierDocManage.model.docManage.transmitReason`)
                  .d('转交原因'),
                children: (
                  <TextArea
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      transformReason = value;
                    }}
                  />
                ),
                onOk: () => {
                  return new Promise((resolve) => {
                    return batchTransfer({
                      ...payload,
                      transformDtlRespList: scorerInfoDs
                        ?.toJSONData()
                        .map((n) => ({ ...n, transformReason })),
                    })
                      .then((transferResponse) => {
                        const transferRes = getResponse(transferResponse);
                        if (transferRes) {
                          onSearch({}, 'scoreDetail');
                          Modal.destroyAll();
                        }
                      })
                      .finally(() => {
                        resolve();
                      });
                  });
                },
              });
            }
            return false;
          },
        });
      }
    });
  }, []);

  // 操作按钮集合
  const getButtons = useCallback(() => {
    const isDisabled = useObserver(() => isEmpty(dataSet.selected));
    return [
      <div style={{ marginBottom: 16 }}>
        <Button onClick={handleTransmit} color="primary" disabled={isDisabled}>
          {intl.get('sslm.common.button.transmit').d('转交')}
        </Button>
      </div>,
    ];
  }, []);

  const columns = useMemo(
    () =>
      [
        {
          name: 'indicatorCode',
          width: 120,
        },
        {
          name: 'indicatorName',
          width: 150,
        },
        {
          name: 'supplierNum',
          width: 140,
        },
        {
          name: 'supplierName',
          width: 200,
        },
        granularity === 'SU+CA' && {
          name: 'categoryName',
          width: 150,
        },
        granularity === 'SU+IT' && {
          name: 'itemName',
          width: 150,
        },
        {
          name: 'completeFlagMeaning',
          width: 100,
        },
        {
          name: 'userName',
          width: 100,
        },
        {
          name: 'respWeight',
          width: 100,
        },
      ].filter(Boolean),
    [granularity]
  );

  return (
    <Table
      border
      dataSet={dataSet}
      columns={columns}
      queryFieldsLimit={2}
      buttons={getButtons()}
      showAllPageSelectionButton
    />
  );
};

export default GraderTransfer;
