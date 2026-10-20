/**
 * index.js -送样申请发布
 * @date: 2020-05-28
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { isEmpty, debounce, compose } from 'lodash';
import { Spin } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import { DataSet, Button, Modal, Icon } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useEffect, useState } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import { checkPermission } from 'services/api';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import MultipleTextField from '@/routes/components/MultipleTextField';
import DynamicButtons from '_components/DynamicButtons';
import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { handlePublish, handleCopyReq, checkLineSource } from '@/services/buyerApplyPublishService';
import { sourceResultDS } from './stores/getSourceResultDS';
import SourceResult from './SourceResult';
import { indexDS } from './stores/indexDS';

const customizeUnitCode = [
  'SSLM.SAMPLE_DELIVERY_PUBLISH.BASIC_INFO',
  'SSLM.SAMPLE_DELIVERY_PUBLISH.SEARCHED_BAR',
  'SSLM.SAMPLE_DELIVERY_PUBLISH.TABLE_LIST_INFO',
];
let searchBarRef; // 筛选器ref

const Index = ({
  remote,
  dispatch,
  tableDs,
  sourceResultDs,
  customizeTable,
  customizeBtnGroup,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [referenceSourceResultFlag, setReferenceSourceResultFlag] = useState(false);
  const [pageChacheFlag, setPageChacheFlag] = useState(true);

  // 跳转详情页
  const handleJumpDetail = useCallback(record => {
    const {
      data: { reqId, reqStatus },
    } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/buyer-apply-release/detail/${reqId}/${reqStatus}`,
      })
    );
  }, []);

  useEffect(() => {
    tableDs.unSelectAll(); // 详情页返回清空勾选
    tableDs.clearCachedSelected();
    handlePermissionButton();
  }, []);

  const cols = [
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
      width: 130,
      lock: true,
      renderer: ({ value, record }) => <a onClick={() => handleJumpDetail(record)}>{value}</a>,
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
      width: 150,
    },
    {
      name: 'companyName',
      width: 150,
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
      name: 'urgencyDegreeMeaning',
      width: 100,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'remark',
      width: 150,
    },
  ];
  const columns = remote.process('SSLM_SAMPLE_DELIVERY_RELEASE_LIST_TABLE_COLUMNS', cols, {
    tableDs,
  });

  // 查询权限集按钮权限
  const handlePermissionButton = useCallback(() => {
    checkPermission(['srm.partner.buyer-apply-publish.list.ps.button.supplier_source_new']).then(
      response => {
        const res = getResponse(response);
        if (res) {
          setReferenceSourceResultFlag(res[0].approve);
        }
      }
    );
  }, []);

  // 新建回调
  const handleCreate = useCallback(key => {
    switch (key) {
      case 'referenceSourceResult':
        Modal.open({
          key: Modal.key(),
          drawer: true,
          style: { width: 1100 },
          bodyStyle: { paddingBottom: 70 },
          title: intl.get('sslm.sample.view.title.sourceResult').d('引用寻源结果'),
          children: (
            <SourceResult
              customizeTable={customizeTable}
              dataSet={sourceResultDs}
              tableDs={tableDs}
              dispatch={dispatch}
            />
          ),
          footer: null,
        });
        break;
      default:
        dispatch(
          routerRedux.push({
            pathname: `/sslm/buyer-apply-release/create`,
          })
        );
        break;
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
        Modal.confirm({
          children: confirmMessage,
          onOk: debounce(() => {
            const params = {
              reqId,
              customizeUnitCode: customizeUnitCode.join(),
            };
            setSpinning(true);
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
              .finally(() => setSpinning(false));
          }, 500),
        });
      }
    });
  }, []);

  // 发布
  const batchPublish = useCallback(() => {
    setSpinning(true);
    const selectedData = tableDs.toJSONData();
    const params = {
      selectedData,
      customizeUnitCode: customizeUnitCode.join(),
    };
    handlePublish(params)
      .then(respose => {
        const res = getResponse(respose);
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

  // 删除
  const batchDelete = useCallback(() => {
    tableDs.delete(tableDs.selected, {
      title: intl.get('sslm.common.view.title.prompt').d('提示'),
      children: intl.get('sslm.common.view.message.sureDeleteSelectedRows').d('确认删除选中行？'),
    });
  }, []);

  // 操作按钮集合
  const OperationButtons = observer(props => {
    const isDisabled = isEmpty(props.dataSet.selected);
    const buttons = [
      {
        name: 'add',
        group: true,
        children: [
          ...(referenceSourceResultFlag
            ? [
                {
                  name: 'referenceSourceResult',
                  btnType: 'c7n-pro',
                  child: intl.get('sslm.sample.view.menus.referenceSourceResult').d('引用寻源结果'),
                  btnProps: {
                    onClick: () => handleCreate('referenceSourceResult'),
                  },
                },
              ]
            : []),
          {
            name: 'manualCreate',
            btnType: 'c7n-pro',
            child: intl.get('sslm.sample.view.menus.manualCreate').d('手工新建'),
            btnProps: {
              onClick: () => handleCreate('manualCreate'),
            },
          },
        ],
        child: (
          <Button icon="add" color="primary" loading={spinning}>
            {intl.get(`hzero.common.button.create`).d('新建')}
            <Icon type="expand_more" style={{ fontSize: '16px', marginLeft: 4, fontWeight: 400 }} />
          </Button>
        ),
      },
      {
        name: 'release',
        btnComp: Button,
        btnProps: {
          icon: 'publish2',
          disabled: isDisabled,
          funcType: 'flat',
          loading: spinning,
          onClick: batchPublish,
          wait: 500,
          waitType: 'throttle',
        },
        child: intl.get('hzero.common.button.release').d('发布'),
      },
      {
        name: 'delete',
        btnComp: Button,
        btnProps: {
          icon: 'delete',
          disabled: isDisabled,
          funcType: 'flat',
          loading: spinning,
          onClick: batchDelete,
          wait: 500,
          waitType: 'throttle',
        },
        child: intl.get('hzero.common.button.delete').d('删除'),
      },
    ];
    return customizeBtnGroup(
      { code: 'SSLM.SAMPLE_DELIVERY_PUBLISH.RELEASE_HEADER_BTNS', pro: true },
      <DynamicButtons buttons={buttons} />
    );
  });

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
      // 解决设置默认值查询不生效问题
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

  return (
    <Fragment>
      <Header title={intl.get('sslm.sample.view.title.publish').d('送样申请发布')}>
        <OperationButtons dataSet={tableDs} />
      </Header>
      <Content>
        <Spin spinning={spinning}>
          <div style={{ height: tableHeight.fixedHeight }}>
            {customizeTable(
              {
                code: 'SSLM.SAMPLE_DELIVERY_PUBLISH.TABLE_LIST_INFO',
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
                searchCode="SSLM.SAMPLE_DELIVERY_PUBLISH.SEARCHED_BAR"
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
  formatterCollections({
    code: ['sslm.sample', 'sslm.common'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SAMPLE_DELIVERY_PUBLISH.TABLE_LIST_INFO',
      'SSLM.SAMPLE_DELIVERY_PUBLISH.SOURCE_RESULT_LIST',
      'SSLM.SAMPLE_DELIVERY_PUBLISH.RELEASE_HEADER_BTNS',
    ],
  }),
  remotes({
    code: 'SSLM_SAMPLE_DELIVERY_RELEASE_LIST',
    name: 'remote',
  }),
  withProps(
    () => {
      const tableDs = new DataSet(indexDS());
      const sourceResultDs = new DataSet(sourceResultDS());
      return { tableDs, sourceResultDs };
    },
    { cacheState: true }
  )
)(Index);
