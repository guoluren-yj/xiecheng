import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Observer } from 'mobx-react-lite';
import { Tag } from 'choerodon-ui';
import { Button, DataSet, Table, Spin, Tooltip } from 'choerodon-ui/pro';
import { isEmpty, isNumber } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import c7nModal from '@/utils/c7nModal';
import {
  fetchExecutingInfo,
  fetchReExecute,
  fetchRefreshProgress,
  saveTask,
  fetchClearTaskInfo,
} from '../../api';
import Condition from './Condition';
import { conditionDS, executeListDS } from './ds';
import Progress from './Progress';

const _isNull = (val) => {
  if (typeof val === 'number') {
    if (val === 0) return false;
    else return !val;
  } else return !val;
};

const transformStr = (strMap = []) => {
  if (isEmpty(strMap)) return '';
  return strMap
    .filter((f) => f)
    .reduce((all, str, idx) => {
      return all + (idx === 0 ? str : `,${str}`);
    }, '');
};

export default function SkuCondition({ modal }) {
  const [loading, setLoading] = useState('true');
  const [taskInfo, setTaskInfo] = useState({ status: '' });
  // progressStatus：EXECUTING: 执行中 SUCCESS：执行成功 FAILED：执行失败  PART_FAILED：部分失败
  const { process, operationId, status: progressStatus } = taskInfo;
  const symbol = useRef(0); // 保证轮询任务依次执行
  // '': 展示操作表单
  const conditionDs = useMemo(() => new DataSet(conditionDS()), []); // 商品条件范围表单
  const historyDs = useMemo(() => new DataSet(executeListDS()), []);
  useEffect(() => {
    // 是否有正在执行或失败的任务
    fetchExecutingInfo().then((res) => {
      if (getResponse(res)) {
        setTaskInfo({
          ...res,
          process: ['SUCCESS', 'FAILED'].includes(res.status) ? '100%' : res.process,
        });
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    modal.update({
      footer: (ok, cancel) => [
        <Observer>
          {() => {
            const {
              supplierCompanyId,
              priceFrom,
              priceTo,
              allSkuFlag,
              labelList,
            } = conditionDs.current.get([
              'supplierCompanyId',
              'priceFrom',
              'priceTo',
              'allSkuFlag',
              'labelList',
            ]);
            const partOkDisabled =
              !progressStatus &&
              !allSkuFlag &&
              !supplierCompanyId &&
              _isNull(priceFrom) &&
              _isNull(priceTo) &&
              isEmpty(labelList);
            return (
              <Tooltip
                title={
                  partOkDisabled
                    ? intl
                        .get('smpc.workbench.view.btn.executeHelp')
                        .d('请维护商品条件和操作类型后进行操作。')
                    : ''
                }
              >
                <Button
                  onClick={handleExecute}
                  loading={progressStatus === 'EXECUTING'}
                  color="primary"
                  disabled={partOkDisabled}
                >
                  {!progressStatus
                    ? intl.get('hzero.common.button.trigger').d('执行')
                    : progressStatus === 'EXECUTING'
                    ? intl.get('smpc.product.view.btn.executing').d('执行中')
                    : intl.get('smpc.product.view.btn.newExecute').d('新建执行')}
                </Button>
              </Tooltip>
            );
          }}
        </Observer>,
        <Button onClick={viewExecuteHistory}>
          {intl.get('smpc.product.view.btn.executeHistory').d('执行历史')}
        </Button>,
        cancel,
      ],
    });
    if (progressStatus) {
      modal.update({ cancelText: intl.get('hzero.common.button.close').d('关闭') });
    }
  }, [progressStatus, conditionDs.current]);

  useEffect(() => {
    let timer = null;
    // 执行
    if (progressStatus === 'EXECUTING' && operationId) {
      // 轮询任务进度
      timer = setInterval(() => {
        if (symbol.current === 0) {
          fetchRefreshProgress(operationId).then((res) => {
            if (getResponse(res)) {
              symbol.current = 0;
              setTaskInfo({
                ...res,
                process: ['SUCCESS', 'FAILED'].includes(res.status) ? '100%' : res.process,
              });
            }
          });
        }
        symbol.current = ++symbol.current;
      }, 1000);
    }
    // 新建执行
    else if (progressStatus && process !== 'EXECUTING' && operationId) {
      symbol.current = 0;
      clearInterval(timer);
    }
    return () => {
      symbol.current = 0;
      clearInterval(timer);
    };
  }, [progressStatus, operationId]);

  const handleExecute = useCallback(async () => {
    // 执行
    if (!progressStatus) {
      const flag = await conditionDs.validate();
      if (flag) {
        const conditionData = conditionDs.current.toJSONData();
        delete conditionData.__dirty;
        delete conditionData.__id;
        delete conditionData._status;
        // 新建任务
        const res1 = getResponse(await saveTask(conditionData));
        if (res1) {
          // 更新， 轮询进度
          setTaskInfo({
            ...res1,
            process: ['SUCCESS', 'FAILED'].includes(res1.status) ? '100%' : res1.process,
          });
        }
      }
    }
    // 新建执行
    if (progressStatus && progressStatus !== 'EXECUTING') {
      handleClear();
    }
    return false;
  }, [progressStatus]);

  // 重置
  const handleClear = useCallback(async () => {
    if (operationId) {
      const res = await fetchClearTaskInfo(operationId);
      if (res) {
        setTaskInfo({});
        conditionDs.reset();
      }
    }
  }, [operationId]);

  const getStatusColor = useCallback((value) => {
    switch (value) {
      case 'EXECUTING':
        return 'orange';
      case 'SUCCESS':
        return 'green';
      case 'FAILED':
        return 'red';
      case 'PART_FAILED':
        return 'red';
      default:
        break;
    }
  }, []);

  const reExecute = useCallback(async (id) => {
    const res = await fetchReExecute(id);
    if (getResponse(res)) {
      setTaskInfo({
        ...res,
        process: ['SUCCESS', 'FAILED'].includes(res.status) ? '100%' : res.process,
      });
    }
  }, []);

  const historyColumns = useMemo(
    () => [
      {
        name: 'statusMeaning',
        width: 100,
        renderer: ({ record, text }) => (
          <Tag style={{ border: 'none' }} color={getStatusColor(record.get('status'))}>
            {text}
          </Tag>
        ),
      },
      {
        name: 'directOperationTypeMeaning',
        width: 100,
      },
      {
        name: 'skuCondition',
        minWidth: 150,
        renderer: ({ record }) => {
          const {
            allSkuFlag,
            supplierCompanyName,
            priceFrom = '-',
            priceTo = '-',
            labelCode,
          } = record.get([
            'allSkuFlag',
            'supplierCompanyName',
            'priceFrom',
            'priceTo',
            'labelCode',
          ]);
          if (allSkuFlag) return intl.get('smpc.workbench.view.allSkuInfo').d('全部电商商品');
          const label = labelCode
            ? intl
                .get('smpc.workbench.view.labelList', { labelCode })
                .d(`商品标签为【${labelCode}】`)
            : '';
          const supplier = supplierCompanyName
            ? intl
                .get('smpc.workbench.view.supplier', { supplier: supplierCompanyName })
                .d(`供应商为【${supplierCompanyName}】`)
            : '';
          const price =
            isNumber(priceFrom) || isNumber(priceTo)
              ? intl
                  .get('smpc.workbench.view.price', { from: priceFrom, to: priceTo })
                  .d(`价格区间为${priceFrom}~${priceTo}`)
              : '';
          const suffix = intl.get('smpc.workbench.view.ecSuffix').d('的电商商品');
          return transformStr([supplier, price, label]) + suffix;
        },
      },
      {
        name: 'operationTime',
        width: 150,
      },
      {
        name: 'process',
        width: 100,
        align: 'right',
      },
      {
        name: 'operationUserName',
        width: 100,
      },
      {
        name: 'operationReason',
        width: 150,
      },
    ],
    []
  );

  const viewExecuteHistory = () => {
    historyDs.query();
    c7nModal({
      style: { width: 1090 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('smpc.product.view.btn.executeHistoryList').d('执行历史列表'),
      children: (
        <Table
          dataSet={historyDs}
          columns={historyColumns}
          customizedCode="ec-execute-history"
          style={{ maxHeight: 'calc(100vh - 196px)' }}
        />
      ),
    });
  };
  return (
    <Spin spinning={loading}>
      {!loading &&
        (progressStatus ? (
          <Progress taskInfo={taskInfo} handleBack={handleClear} reExecute={reExecute} />
        ) : (
          <Condition conditionDs={conditionDs} />
        ))}
      {/* loading 居中对齐 */}
      {loading && <div style={{ width: 100, height: 300 }} />}
    </Spin>
  );
}
