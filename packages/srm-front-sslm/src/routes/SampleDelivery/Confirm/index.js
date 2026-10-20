/**
 * index.js - 送样申请单确认
 * @date: 2020-04-24
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import querystring from 'querystring';
import { isEmpty, compose } from 'lodash';
import { Spin } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import React, { Fragment, useCallback, useState, useEffect } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { confirmBuyerList, backBuyerList, batchClosed } from '@/services/buyerApplyConfirmService';
import { indexDS } from './stores/indexDS';

let searchBarRef; // 筛选器ref

const Index = ({ remote, dispatch, tableDs, customizeTable }) => {
  const [spinning, setSpinning] = useState(false);
  const [pageChacheFlag, setPageChacheFlag] = useState(true);

  useEffect(() => {
    tableDs.unSelectAll(); // 详情页返回清空勾选
    tableDs.clearCachedSelected();
  }, []);

  // 跳转详情
  const handleJumpDetail = useCallback(record => {
    const {
      data: { reqId, reqStatus, isPurchaseFlag },
    } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/buyer-apply-confirm/detail/${reqId}/${reqStatus}`,
        search: querystring.stringify({
          isSupplier: isPurchaseFlag,
        }),
      })
    );
  }, []);

  // 确认
  const handleConfirm = useCallback(() => {
    setSpinning(true);
    const data = tableDs.toJSONData();
    confirmBuyerList(data)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          tableDs.unSelectAll();
          tableDs.clearCachedSelected();
          tableDs.query();
          notification.success();
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  // 退回
  const handleBack = useCallback(() => {
    setSpinning(true);
    const data = tableDs.toJSONData();
    backBuyerList(data)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          tableDs.unSelectAll();
          tableDs.clearCachedSelected();
          tableDs.query();
          notification.success();
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  // 关闭
  const handleClose = useCallback(() => {
    setSpinning(true);
    const data = tableDs.toJSONData();
    const params = data.map(n => n.reqId);
    batchClosed(params)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          tableDs.unSelectAll();
          tableDs.clearCachedSelected();
          tableDs.query();
          notification.success();
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  const handleQuery = ({ params }) => {
    if (tableDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = tableDs.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['multiSelectReqNums'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 处理多单号
      const reqList = params.multiSelectReqNums;
      clearParams.multiSelectReqNums = isEmpty(reqList) ? null : reqList.join(',');
      tableDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        tableDs.query(tableDs.currentPage);
      } else {
        tableDs.query();
      }
    } else {
      searchBarRef.handleQuery(true);
    }
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback((_, queryDataSet) => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="multiSelectReqNums"
        placeholder={intl.get('sslm.common.modal.sample.multiSelectReqNums').d('请输入申请单号')}
      />
    );
  }, []);

  // 清空、重置回调
  const clearValues = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet?.current.reset();
  }, []);

  const cols = [
    {
      name: 'reqStatusMeaning',
      width: 120,
      lock: true,
      renderer: renderStatus,
    },
    {
      name: 'reqNum',
      width: 140,
      lock: true,
      renderer: ({ value, record }) => <a onClick={() => handleJumpDetail(record)}>{value}</a>,
    },
    {
      name: 'isPurchaseFlag',
      width: 100,
    },
    {
      name: 'organizationName',
      width: 150,
    },
    {
      name: 'supplierNum',
      width: 120,
    },
    {
      name: 'supplierName',
      width: 200,
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
      name: 'supplierTypeCodeMeaning',
      width: 100,
    },
    {
      name: 'originFactoryName',
      width: 150,
    },
    {
      name: 'typeCodeMeaning',
      width: 100,
    },
    {
      name: 'reqUserName',
      width: 100,
    },
    {
      name: 'reqUserPhone',
      width: 140,
    },
    {
      name: 'recUserName',
      width: 100,
    },
    {
      name: 'recUserPhone',
      width: 140,
    },
    {
      name: 'sampleSendAddress',
      width: 150,
    },
    {
      name: 'urgencyDegreeMeaning',
      width: 100,
    },
    {
      name: 'sendUserName',
      width: 100,
    },
    {
      name: 'sendUserPhone',
      width: 140,
    },
    {
      name: 'sendTypeCodeMeaning',
      width: 100,
    },
    {
      name: 'trackingNumber',
      width: 160,
    },
    {
      name: 'expectedDeliveryDate',
      width: 160,
    },
    {
      name: 'creationDate',
      width: 160,
    },
    {
      name: 'releaseDate',
      width: 160,
    },
    {
      name: 'feedbackDate',
      width: 160,
    },
    {
      name: 'remark',
      width: 150,
    },
  ];
  const columns = remote.process('SSLM_SAMPLE_DELIVERY_CONFIRM_LIST_TABLE_COLUMNS', cols, {
    tableDs,
  });

  // 操作按钮集合
  const OperationButtons = observer(props => {
    const isDisabled = isEmpty(props.dataSet.selected);
    return (
      <Fragment>
        <Button
          icon="check"
          color="primary"
          onClick={handleConfirm}
          disabled={isDisabled}
          loading={spinning}
          wait={500}
          waitType="throttle"
        >
          {intl.get('hzero.common.button.confirm').d('确认')}
        </Button>
        <Button
          icon="reply"
          funcType="flat"
          onClick={handleBack}
          disabled={isDisabled}
          loading={spinning}
          wait={500}
          waitType="throttle"
        >
          {intl.get('sslm.sample.view.button.rollback').d('退回')}
        </Button>
        <Button
          icon="close"
          funcType="flat"
          onClick={handleClose}
          disabled={isDisabled}
          loading={spinning}
          wait={500}
          waitType="throttle"
        >
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      </Fragment>
    );
  });

  return (
    <Spin spinning={spinning}>
      <Header title={intl.get('sslm.sample.view.title.sampleConfirm').d('送样申请确认')}>
        <OperationButtons dataSet={tableDs} />
      </Header>
      <Content>
        <div style={{ height: tableHeight.fixedHeight }}>
          {customizeTable(
            {
              code: 'SSLM.SAMPLE_DELIVERY_CONFIRM.TABLE_LIST',
              __force_record_to_update__: true,
            },
            <SearchBarTable
              cacheState
              dataSet={tableDs}
              columns={columns}
              searchBarRef={ref => {
                searchBarRef = ref;
              }}
              searchCode="SSLM.SAMPLE_DELIVERY_CONFIRM.SEARCH_BAR"
              style={{ maxHeight: tableMaxHeight.fixedHeight }}
              searchBarConfig={{
                editorProps: {
                  reqStatus: {
                    optionsFilter: record => record.get('value') !== 'CANCEL_SUBMIT',
                  },
                },
                left: {
                  render: renderLeftSearchBar,
                },
                onQuery: handleQuery,
                onReset: clearValues,
                onClear: clearValues,
                onFieldChange: () => {
                  setPageChacheFlag(false);
                },
              }}
            />
          )}
        </div>
      </Content>
    </Spin>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.sample', 'sslm.common'],
  }),
  withCustomize({
    unitCode: ['SSLM.SAMPLE_DELIVERY_CONFIRM.TABLE_LIST'],
  }),
  remotes({
    code: 'SSLM_SAMPLE_DELIVERY_CONFIRM_LIST',
    name: 'remote',
  }),
  withProps(
    () => {
      const tableDs = new DataSet(indexDS());
      return { tableDs };
    },
    { cacheState: true }
  )
)(Index);
