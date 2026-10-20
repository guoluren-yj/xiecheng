/* eslint-disable no-unused-expressions */
/**
 * index.js - 送样申请反馈
 * @date: 2020-04-24
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import { isEmpty, compose } from 'lodash';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import { Spin } from 'choerodon-ui';
import { DataSet, Modal, TextArea, Form } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useEffect, useState, useMemo } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';

import MultipleTextField from '@/routes/components/MultipleTextField';
import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import {
  handleSubmitCallback,
  handleBackCallback,
} from '@/services/sampleSupplierApplyCallbackService';
import { indexDS } from './stores/indexDS';
import { getBtnsPermissions } from './utils';

const currentOrganizationId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();
const customizeUnitCode = [
  'SSLM.SAMPLE_DELIVERY_CALLBACK.TABLE_LIST',
  'SSLM.SAMPLE_DELIVERY_CALLBACK.SEARCH_BAR',
];
let searchBarRef; // 筛选器ref

const Index = ({ remote, dispatch, tableDs, customizeTable, location, customizeBtnGroup }) => {
  const [spinning, setSpinning] = useState(false);
  const isPub = useMemo(() => location.pathname.match('/pub/'), [location]);
  const [pageChacheFlag, setPageChacheFlag] = useState(true);

  useEffect(() => {
    tableDs.unSelectAll(); // 详情页返回清空勾选
    tableDs.clearCachedSelected();
  }, []);

  // 提交反馈
  const handleSubmit = useCallback(() => {
    setSpinning(true);
    const dataList = (tableDs.toJSONData() || []).map(r => ({ ...r, ignoreNullField: true }));
    const payload = { dataList, customizeUnitCode: customizeUnitCode.join() };
    handleSubmitCallback(payload)
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

  // 跳转详情页
  const handleJumpDetail = useCallback(
    record => {
      const {
        data: { reqId, reqStatus, isPurchaseFlag },
      } = record;
      const pathname = isPurchaseFlag
        ? `${isPub ? '/pub' : ''}/sslm/supplier-apply-callback/supplier/${reqId}/${reqStatus}`
        : `${isPub ? '/pub' : ''}/sslm/supplier-apply-callback/detail/${reqId}/${reqStatus}`;
      dispatch(
        routerRedux.push({
          pathname,
        })
      );
    },
    [isPub]
  );

  // 新建
  const handleCreate = useCallback(() => {
    dispatch(
      routerRedux.push({
        pathname: `${isPub ? '/pub' : ''}/sslm/supplier-apply-callback/create`,
      })
    );
  }, [isPub]);

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

  const handleBackOk = useCallback((modal, ds) => {
    Modal.confirm({
      title: intl.get('sslm.sample.view.title.supplierBackTip').d('是否将送样申请退回给采购方?'),
      onOk: () => {
        const reqIds = tableDs.toJSONData().map(({ reqId }) => reqId);
        const payload = {
          reqIds,
          remark: ds?.current?.get('remark'),
          customizeUnitCode: customizeUnitCode.join(),
        };
        setSpinning(true);
        return new Promise((resolve, reject) => {
          handleBackCallback(payload)
            .then(response => {
              const res = getResponse(response);
              if (res) {
                tableDs.unSelectAll();
                tableDs.clearCachedSelected();
                tableDs.query();
                notification.success();
                ds?.current?.reset();
                modal.close();
                resolve();
              } else {
                reject(new Error(res));
              }
            })
            .finally(() => {
              setSpinning(false);
            });
        });
      },
    });
  }, []);

  // 供应商退回
  const handleBack = useCallback(() => {
    const ds = new DataSet({
      fields: [
        {
          name: 'remark',
          label: intl.get('sslm.sample.view.modal.supplierBackRemark').d('退回备注'),
          type: 'string',
        },
      ],
    });
    const modal = Modal.open({
      title: intl.get('sslm.sample.view.title.supplierBackRemark').d('退回备注'),
      style: { width: 560 },
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        handleBackOk(modal, ds);
        return false;
      },
      children: (
        <Form dataSet={ds} labelLayout="float">
          <TextArea name="remark" style={{ width: '100%' }} />
        </Form>
      ),
      afterClose: () => {
        tableDs.reset();
      },
    });
    return modal;
  }, []);

  const OperationButtons = observer(props => {
    const isDisabled = isEmpty(props.dataSet.selected);
    // 判断选中数据是否有 单据状态为「已退回」且送样发起方为「供应商」的单据
    const filterData = props.dataSet.selected.filter(record => {
      const recordData = record.toData();
      return Number(recordData.isPurchaseFlag) === 1 && ['RETURNED'].includes(recordData.reqStatus);
    });
    const isDisabledStatus = filterData.length > 0;
    const isSupplierFlag = currentOrganizationId !== organizationId;
    const buttons = [
      {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        hidden: !isSupplierFlag,
        btnProps: {
          icon: 'add',
          color: 'primary',
          onClick: handleCreate,
          loading: spinning,
        },
      },
      {
        name: 'submitCallBack',
        child: intl.get('sslm.sample.view.button.submitCallBack').d('提交反馈'),
        btnProps: {
          icon: 'check',
          onClick: handleSubmit,
          disabled: isDisabled,
          loading: spinning,
        },
      },
      {
        name: 'supplierBack',
        child: intl.get('sslm.sample.view.button.supplierBack').d('供应商退回'),
        btnProps: {
          icon: 'reply',
          disabled: isDisabled || isDisabledStatus,
          loading: spinning,
          onClick: handleBack,
        },
      },
    ].map(b => {
      const { btnProps = {}, ...other } = b;
      return {
        ...other,
        btnProps: {
          wait: 500,
          waitType: 'throttle',
          ...btnProps,
        },
      };
    });
    return customizeBtnGroup(
      {
        code: 'SSLM.SAMPLE_DELIVERY_CALLBACK.LIST_BTNS',
        pro: true,
      },
      <DynamicButtons
        buttons={buttons}
        defaultBtnType="c7n-pro"
        permissions={getBtnsPermissions()}
      />
    );
  });

  const cols = [
    {
      name: 'reqStatusMeaning',
      width: 100,
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
      name: 'companyName',
      width: 200,
    },
    {
      name: 'ouName',
      width: 150,
    },
    {
      name: 'organizationName',
      width: 150,
    },
    {
      name: 'supplierName',
      width: 200,
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
      width: 200,
    },
    {
      name: 'urgencyDegreeMeaning',
      width: 100,
    },
    {
      name: 'releaseDate',
      width: 150,
    },
    {
      name: 'remark',
      width: 150,
    },
  ];
  const columns = remote.process('SSLM_SAMPLE_DELIVERY_FEEDBACK_LIST_TABLE_COLUMNS', cols, {
    tableDs,
  });

  return (
    <Fragment>
      <Header title={intl.get('sslm.sample.view.title.sampleCallback').d('送样申请反馈')}>
        <OperationButtons dataSet={tableDs} />
      </Header>
      <Content>
        <Spin spinning={spinning}>
          <div style={{ height: tableHeight.fixedHeight }}>
            {customizeTable(
              {
                code: 'SSLM.SAMPLE_DELIVERY_CALLBACK.TABLE_LIST',
                __force_record_to_update__: true,
              },
              <SearchBarTable
                cacheState
                dataSet={tableDs}
                columns={columns}
                searchBarRef={ref => {
                  searchBarRef = ref;
                }}
                style={{ maxHeight: tableMaxHeight.fixedHeight }}
                searchCode="SSLM.SAMPLE_DELIVERY_CALLBACK.SEARCH_BAR"
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
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SSLM.SAMPLE_DELIVERY_CALLBACK.TABLE_LIST',
      'SSLM.SAMPLE_DELIVERY_CALLBACK.LIST_BTNS',
    ],
  }),
  formatterCollections({
    code: ['sslm.sample', 'sslm.common'],
  }),
  remotes({
    code: 'SSLM_SAMPLE_DELIVERY_FEEDBACK_LIST',
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
