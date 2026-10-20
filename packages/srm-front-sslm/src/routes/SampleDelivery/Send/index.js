/**
 * index.js - 我发出的送样申请
 * @date: 2020-04-24
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import { compose, debounce, isEmpty, isObject } from 'lodash';
import queryString from 'querystring';
import { routerRedux } from 'dva/router';
import { DataSet, Tabs, Modal as C7NModal } from 'choerodon-ui/pro';
import { Modal } from 'hzero-ui';
import React, { Fragment, useCallback, useState } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
import { PRIVATE_BUCKET } from '_utils/config';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import notification from 'utils/notification';
import MultipleTextField from '@/routes/components/MultipleTextField';
import {
  renderStatus,
  tableMaxHeight,
  numberSeparatorRender,
  tableHeight,
} from '@/routes/components/utils';
import { handleCopyReq, checkLineSource } from '@/services/buyerApplyPublishService';
import { sampleCheckLastOperationTime } from '@/services/buyerApplyQueryService';
import { batchClosed } from '@/services/buyerApplyConfirmService';
import { listLineDS, detailLineDS } from './stores/indexDS';
import HeaderBtn from './HeaderBtn';

const organizationId = getCurrentOrganizationId();
let lineSearchBarRef = null; // 送样申请单查询searchBarRef
let detailSearchBarRef = null; // 按明细查询searchBarRef

const customizeUnitCode = [
  'SSLM.SAMPLE_DELIVERY_SEND.DETAIL_QUERY_TABLE',
  'SSLM.SAMPLE_DELIVERY_SEND.APPLICATION_TABLE',
  'SSLM.SAMPLE_DELIVERY_SEND.APPLY_QUERY',
  'SSLM.SAMPLE_DELIVERY_SEND.LIST.BTN_GROUP',
  'SSLM.SAMPLE_DELIVERY_SEND.LIST.BTN_GROUP_BY_DETAIL',
];

const Index = ({ remote, dispatch, lineDs, detailDS, customizeTable, customizeBtnGroup }) => {
  const [activeKey, setActiveKey] = useState('sampleApplyQuery');
  const [closeLoading, setCloseLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [pageChacheFlag, setPageChacheFlag] = useState(true);

  // tab切换的回调
  const handleTabChange = useCallback(
    key => {
      setActiveKey(key);
      // 重置缓存状态
      setPageChacheFlag(true);
    },
    [activeKey]
  );

  // 跳转详情
  const handleJumpDetail = useCallback(record => {
    const {
      data: { reqId, reqStatus, isPurchaseFlag },
    } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/buyer-apply-query/detail/${reqId}/${reqStatus}`,
        search: queryString.stringify({
          isSupplier: isPurchaseFlag,
        }),
      })
    );
  }, []);

  // 查询供应商附件
  const handleJumpAttachment = useCallback(record => {
    const {
      data: { sampleId, reqId },
    } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/buyer-apply-query/attach-upload/${sampleId}/${reqId}`,
        search: queryString.stringify({
          isView: true,
        }),
        state: {
          backPath: `/sslm/buyer-apply-query/list`,
          title: intl.get('sslm.sample.view.title.checkSupplierAttachments').d('查看供应商附件'),
        },
      })
    );
  }, []);

  // 导出参数
  const handleParams = useCallback(key => {
    const queryData =
      key !== 'sampleApplyQuery'
        ? detailDS.queryDataSet?.current?.toData()
        : lineDs.queryDataSet?.current?.toData();
    const queryParams = filterNullValueObject(queryData);
    const { __dirty, ...others } = queryParams;

    return {
      ...others,
      // 勾选导出参数
      ...(key !== 'sampleApplyQuery'
        ? {}
        : { reqIds: lineDs.selected.map(record => record.data.reqId).join() }),
    };
  }, []);

  const handleQuery = ({ params }, type) => {
    const finallyDs = type === 'apply' ? lineDs : detailDS;
    const finallyRef = type === 'apply' ? lineSearchBarRef : detailSearchBarRef;
    if (finallyDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = finallyDs.queryDataSet.current.toData();
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
      finallyDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        finallyDs.query(finallyDs.currentPage);
      } else {
        finallyDs.query();
      }
    } else {
      // 解决设置默认值查询不生效问题
      finallyRef.handleQuery(true);
    }
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback(queryDataSet => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="multiSelectReqNums"
        placeholder={intl.get('sslm.common.modal.sample.multiSelectReqNums').d('请输入申请单号')}
      />
    );
  }, []);

  // 清空、重置回调
  const clearValues = useCallback(type => {
    const finallyDs = type === 'apply' ? lineDs : detailDS;
    if (finallyDs.queryDataSet?.current) {
      finallyDs.queryDataSet.current.reset();
    }
  }, []);

  // 复制
  const handleCopy = useCallback(record => {
    const reqId = record.get('reqId');
    checkLineSource({ reqId }).then(checkResponse => {
      const checkRes = getResponse(checkResponse);
      if ([true, false].includes(checkRes)) {
        const confirmMessage = checkRes
          ? intl
              .get(`sslm.sample.view.message.copySourceConfirm`)
              .d('引用寻源结果创建的行数据无法复制，请确认是否继续复制其他内容。')
          : intl.get(`sslm.sample.view.message.copyConfirm`).d('是否复制此单据生成一张新单据？');
        C7NModal.confirm({
          children: confirmMessage,
          onOk: debounce(() => {
            const params = {
              reqId,
              customizeUnitCode: customizeUnitCode.join(),
            };
            setCloseLoading(true);
            handleCopyReq(params)
              .then(respose => {
                const res = getResponse(respose);
                if (res && !isEmpty(res)) {
                  const { reqId: newReqId, reqStatus } = res;
                  dispatch(
                    routerRedux.push({
                      pathname: `/sslm/buyer-apply-release/detail/${newReqId}/${reqStatus}`,
                    })
                  );
                  notification.success();
                }
              })
              .finally(() => setCloseLoading(false));
          }, 500),
        });
      }
    });
  }, []);

  const lineCols = [
    {
      name: 'reqStatusMeaning',
      width: 120,
      lock: true,
      renderer: renderStatus,
    },
    {
      name: 'action',
      width: 60,
      lock: true,
      renderer: ({ record }) => (
        <a onClick={() => handleCopy(record)}>{intl.get('hzero.common.button.copy').d('复制')}</a>
      ),
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
      width: 120,
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
      name: 'urgencyDegreeMeaning',
      width: 100,
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
  const lineColumns = remote.process(
    'SSLM_SAMPLE_DELIVERY_SEND_LIST_LINE_TABLE_COLUMNS',
    lineCols,
    { lineDs }
  );
  const detailCols = [
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
      name: 'remark',
      width: 150,
    },
    {
      name: 'lineNum',
      width: 70,
    },
    {
      name: 'itemCode',
      width: 150,
    },
    {
      name: 'itemName',
      width: 180,
    },
    {
      name: 'itemDesc',
      width: 180,
    },
    {
      name: 'uomCodeAndName',
      width: 100,
    },
    {
      name: 'itemCategoryCode',
      width: 150,
    },
    {
      name: 'itemCategoryName',
      width: 180,
    },
    {
      name: 'reqQuantity',
      width: 100,
      renderer: ({ record, value }) => {
        const precision = record.get('uomPrecision') === 0 ? 0 : record.get('uomPrecision') || 10;
        return numberSeparatorRender(value, precision);
      },
    },
    {
      name: 'reqTime',
      width: 160,
    },
    {
      name: 'expectedDeliveryDate',
      width: 160,
    },
    {
      name: 'tryUseDepartment',
      width: 120,
    },
    {
      name: 'tryUseWorkshop',
      width: 120,
    },
    {
      name: 'sampleResultMeaning',
      width: 100,
    },
    {
      name: 'sampleRemark',
      width: 150,
    },
    {
      name: 'trialResultsUuid',
      width: 130,
      renderer: ({ record }) => (
        <Upload
          viewOnly
          tenantId={organizationId}
          bucketName={PRIVATE_BUCKET}
          attachmentUUID={record.get('trialResultsUuid')}
          filePreview
        />
      ),
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
      name: 'buyerAttachmentUuid',
      width: 130,
      renderer: ({ value }) => (
        <Upload
          viewOnly
          tenantId={organizationId}
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="sslm-deliver"
          attachmentUUID={value}
          filePreview
        />
      ),
    },
    {
      name: 'attachmentUuid',
      width: 100,
      renderer: ({ record }) => (
        <a onClick={() => handleJumpAttachment(record)}>
          {intl.get(`sslm.sample.model.upload.text`).d('查看')}
        </a>
      ),
    },
    {
      name: 'trackingNumber',
      width: 100,
    },
    {
      name: 'sendTypeCodeMeaning',
      width: 100,
    },
  ];
  const detailColumns = remote.process(
    'SSLM_SAMPLE_DELIVERY_SEND_LIST_DETAIL_TABLE_COLUMNS',
    detailCols,
    { detailDS }
  );

  // 关闭单据
  const handleClose = async () => {
    setCloseLoading(true);
    const ids = lineDs.selected.map(record => record.data.reqId);
    const res = await getResponse(sampleCheckLastOperationTime(ids));
    if (res === true) {
      Modal.confirm({
        title: intl
          .get('sslm.sample.view.message.sevenWarn')
          .d('该样品待反馈时间未超过7天，是否确认关闭'),
        onOk: () => {
          batchClosed(ids)
            .then(() => {
              notification.success();
              setQueryLoading(true);
              lineDs.query().finally(() => setQueryLoading(false));
            })
            .finally(() => setCloseLoading(false));
        },
        onCancel: () => {
          setCloseLoading(false);
        },
      });
    }
    if (res === false) {
      batchClosed(ids)
        .then(() => {
          notification.success();
          setQueryLoading(true);
          lineDs.query().finally(() => setQueryLoading(false));
        })
        .finally(() => setCloseLoading(false));
    }
  };

  const getFieldProps = () => {
    const fieldProps = {
      supplierId: {
        computedProps: {
          valueField: () => 'uniqueKey',
        },
        transformRequest: value => {
          if (isObject(value)) {
            const { supplierId } = value;
            const newValue = {
              ...value,
              uniqueKey: supplierId,
            };
            return newValue;
          }
          return value;
        },
      },
    };
    return fieldProps;
  };

  return (
    <Fragment>
      <Header title={intl.get('sslm.sample.view.title.sendSample').d('送样申请查询（采）')}>
        <HeaderBtn
          activeKey={activeKey}
          lineDs={lineDs}
          handleParams={handleParams}
          handleClose={handleClose}
          customizeBtnGroup={customizeBtnGroup}
          closeLoading={closeLoading}
          queryLoading={queryLoading}
        />
      </Header>
      <Content>
        <Tabs activeKey={activeKey} animated={false} onChange={handleTabChange}>
          <Tabs.TabPane
            tab={intl.get('sslm.sample.view.message.sampleApplyQuery').d('送样申请单查询')}
            key="sampleApplyQuery"
          >
            <div style={{ height: tableHeight.hasTab }}>
              {customizeTable(
                {
                  code: 'SSLM.SAMPLE_DELIVERY_SEND.APPLICATION_TABLE',
                  __force_record_to_update__: true,
                },
                <SearchBarTable
                  cacheState
                  dataSet={lineDs}
                  columns={lineColumns}
                  searchBarRef={ref => {
                    lineSearchBarRef = ref;
                  }}
                  searchCode="SSLM.SAMPLE_DELIVERY_SEND.APPLY_SEARCH_BAR"
                  style={{ maxHeight: tableMaxHeight.hasTab }}
                  searchBarConfig={{
                    editorProps: {
                      reqStatus: {
                        optionsFilter: record => record.get('value') !== 'CANCEL_SUBMIT',
                      },
                    },
                    fieldProps: getFieldProps(),
                    left: {
                      render: (_, queryDataSet) => renderLeftSearchBar(queryDataSet),
                    },
                    onQuery: queryProps => handleQuery(queryProps, 'apply'),
                    onReset: () => clearValues('apply'),
                    onClear: () => clearValues('apply'),
                    onFieldChange: () => {
                      setPageChacheFlag(false);
                    },
                  }}
                />
              )}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('sslm.sample.view.message.tab.detailQuery').d('按明细查询')}
            key="detailQuery"
          >
            <div style={{ height: tableHeight.hasTab }}>
              {customizeTable(
                {
                  code: 'SSLM.SAMPLE_DELIVERY_SEND.DETAIL_QUERY_TABLE',
                },
                <SearchBarTable
                  cacheState
                  dataSet={detailDS}
                  columns={detailColumns}
                  searchBarRef={ref => {
                    detailSearchBarRef = ref;
                  }}
                  searchCode="SSLM.SAMPLE_DELIVERY_SEND.DETAIL_SEARCH_BAR"
                  style={{ maxHeight: tableMaxHeight.hasTab }}
                  searchBarConfig={{
                    editorProps: {
                      reqStatus: {
                        optionsFilter: record => record.get('value') !== 'CANCEL_SUBMIT',
                      },
                    },
                    fieldProps: getFieldProps(),
                    left: {
                      render: (_, queryDataSet) => renderLeftSearchBar(queryDataSet),
                    },
                    onQuery: queryProps => handleQuery(queryProps, 'detail'),
                    onReset: () => clearValues('detail'),
                    onClear: () => clearValues('detail'),
                    onFieldChange: () => {
                      setPageChacheFlag(false);
                    },
                  }}
                />
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.sample', 'sslm.common'],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.SAMPLE_DELIVERY_SEND.DETAIL_QUERY_TABLE',
      'SSLM.SAMPLE_DELIVERY_SEND.APPLICATION_TABLE',
      'SSLM.SAMPLE_DELIVERY_SEND.APPLY_QUERY',
      'SSLM.SAMPLE_DELIVERY_SEND.LIST.BTN_GROUP',
      'SSLM.SAMPLE_DELIVERY_SEND.LIST.BTN_GROUP_BY_DETAIL',
    ],
  }),
  remotes({
    code: 'SSLM_SAMPLE_DELIVERY_SEND_LIST',
    name: 'remote',
  }),
  withProps(
    () => {
      const lineDs = new DataSet(listLineDS());
      const detailDS = new DataSet(detailLineDS());
      return { lineDs, detailDS };
    },
    { cacheState: true }
  )
)(Index);
