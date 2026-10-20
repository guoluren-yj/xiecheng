/*
 * @Date: 2021-12-14 11:08:38
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import SearchBarTable from '_components/SearchBarTable';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { quoteSourceResult, sourcePending } from '@/services/buyerApplyPublishService';
import styles from './index.less';

let searchBarRef; // 筛选器ref

const SourceResult = ({ dataSet, customizeTable, tableDs, modal, dispatch }) => {
  const [operateLoading, setOperateLoading] = useState(false);
  const [listQueryLoading, setListQueryLoading] = useState(false);

  useEffect(() => {
    dataSet.unSelectAll();
    dataSet.clearCachedSelected();
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset(); // 解决再次进来查询条件未清空
  }, []);

  const handleQuery = ({ params, currentPage }) => {
    if (dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['sourceNumOrItemNum'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 处理多单号
      const reqList = params.sourceNumOrItemNum;
      clearParams.sourceNumOrItemNum = isEmpty(reqList) ? null : reqList.join(',');
      dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      dataSet.query(currentPage);
    } else {
      // 解决设置默认值查询不生效问题
      searchBarRef.handleQuery(true);
    }
  };

  const renderLeftSearchBar = useCallback((_, queryDataSet) => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="sourceNumOrItemNum"
        placeholder={intl
          .get('sslm.sample.modal.sourceResult.sourceNumOrItemNum')
          .d('请输入寻源单号、或寻源单号-行号')}
      />
    );
  }, []);

  // 清空、重置回调
  const clearValues = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  }, []);

  const columns = [
    {
      name: 'sourceNum',
      width: 180,
      renderer: ({ record }) =>
        record.data.sourceNum &&
        record.data.itemNum &&
        `${record.data.sourceNum}-${record.data.itemNum}`,
    },
    {
      name: 'supplierCompanyNum',
      width: 120,
    },
    {
      name: 'supplierCompanyName',
      width: 180,
    },
    {
      name: 'supplierPendingFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'erpSupplierCompanyNum',
      width: 120,
    },
    {
      name: 'itemName',
      width: 120,
    },
    {
      name: 'itemCode',
      width: 120,
    },
    {
      name: 'categoryName',
      width: 120,
    },
    {
      name: 'currencyCode',
      width: 100,
    },
    {
      name: 'quantity',
      width: 100,
      align: 'right',
    },
    {
      name: 'taxRate',
      width: 100,
      align: 'right',
    },
    {
      name: 'taxPrice',
      width: 160,
      align: 'right',
    },
    {
      name: 'unitPrice',
      width: 160,
      align: 'right',
    },
    {
      name: 'validPromisedDate',
      width: 120,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'companyName',
      width: 200,
    },
    {
      name: 'ouName',
      width: 150,
    },
    {
      name: 'purOrganizationName',
      width: 150,
    },
    {
      name: 'invOrganizationName',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 140,
    },
  ];

  // 新建回调
  const handleCreateOk = useCallback(isPending => {
    if (isPending) {
      const selectRows = dataSet.toJSONData();
      setOperateLoading(true);
      quoteSourceResult(selectRows)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            if (res.length === 1) {
              const { reqId } = res[0];
              dispatch(
                routerRedux.push({
                  pathname: `/sslm/buyer-apply-release/detail/${reqId}/NEW`,
                })
              );
            } else {
              modal.close();
              tableDs.query();
            }
          }
        })
        .finally(() => {
          setOperateLoading(false);
        });
    } else {
      notification.warning({
        message: intl
          .get('sslm.sample.modal.sourceResult.lineContainPending')
          .d('勾选的行中存在已暂挂状态的数据，无法创建单据，请检查或取消暂挂'),
      });
    }
  }, []);

  // 暂挂/取消暂挂 回调
  const handlePending = useCallback(isPending => {
    const selectRows = dataSet.toJSONData();
    setOperateLoading(true);
    sourcePending({ selectRows, isPending })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          setListQueryLoading(true);
          dataSet.query().finally(() => setListQueryLoading(false));
        }
      })
      .finally(() => {
        setOperateLoading(false);
      });
  }, []);

  // 取消回调
  const handleCancle = useCallback(() => {
    modal.close();
  }, []);

  // 引用寻源结果modal底部按钮
  const OperateBtn = useCallback(() => {
    const isDisabled = useObserver(() => isEmpty(dataSet.selected));
    // 判断是否有暂挂数据
    const isPending = useObserver(() =>
      isEmpty(dataSet.toJSONData()?.filter(n => n.supplierPendingFlag))
    );
    const allLoading = operateLoading || listQueryLoading;
    return (
      <div className={styles['source-result-btn']}>
        <div style={{ padding: '12px 20px' }}>
          <Button
            color="primary"
            disabled={isDisabled}
            onClick={() => handleCreateOk(isPending)}
            loading={allLoading}
            wait={500}
            waitType="throttle"
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Button
            disabled={isDisabled}
            loading={allLoading}
            onClick={() => handlePending(isPending)}
            wait={500}
            waitType="throttle"
          >
            {isPending
              ? intl.get('sslm.common.button.pending').d('暂挂')
              : intl.get('sslm.common.button.cancelPending').d('取消暂挂')}
          </Button>
          <Button loading={allLoading} onClick={handleCancle}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </div>
      </div>
    );
  }, [operateLoading, listQueryLoading]);

  // 处理筛选器字段ds属性
  const getFieldProps = () => {
    const fieldProps = {
      creationDate: {
        defaultValue: () => [moment().subtract(6, 'months')],
      },
    };
    return fieldProps;
  };

  return (
    <Fragment>
      {customizeTable(
        {
          code: 'SSLM.SAMPLE_DELIVERY_PUBLISH.SOURCE_RESULT_LIST',
          readOnly: true,
        },
        <SearchBarTable
          columns={columns}
          dataSet={dataSet}
          searchCode="SSLM.SAMPLE_DELIVERY_PUBLISH.SOURCE_RESULT_SEARCH_BAR"
          searchBarRef={ref => {
            searchBarRef = ref;
          }}
          searchBarConfig={{
            left: {
              render: renderLeftSearchBar,
            },
            onQuery: handleQuery,
            onReset: clearValues,
            onClear: clearValues,
            fieldProps: getFieldProps(),
          }}
        />
      )}
      <OperateBtn />
    </Fragment>
  );
};

export default SourceResult;
