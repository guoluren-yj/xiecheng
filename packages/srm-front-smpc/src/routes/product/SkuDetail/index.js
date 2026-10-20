import React, { Fragment, useState, useEffect, useMemo, useRef } from 'react';
import qs from 'qs';
import { flowRight } from 'lodash';
import { DataSet, Button, Menu } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import { openApproveModal } from '_components/ApproveModal';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { handleRevokeApprove } from '@/routes/product/SkuWorkbench/utils';
import operateRenderer from '@/routes/product/SkuWorkbench/records/operateRenderer';
import remote from 'hzero-front/lib/utils/remote';
import { openTextArea, openRecordTabs, historyRecord } from '../SkuWorkbench/drawers';
import { DropdownBtn, OverlayMenuItemBtn, ObserverBtn } from '../SkuWorkbench/components';
import {
  fetchInfo,
  fetchInfoNew,
  fetchInfoReject,
  fetchInfoHistory,
  fetchInfoLastVersion,
  fetchInfoWorkflowApprove,
  fetchTypeSpecs,
} from '../SkuCreate/api';
import { approveOrReject, fetchLastVersion } from '../SkuApprove/api';
import MultiButton from './MultiButton';
import MultiContent from './MultiButton/Content';
import ContentDetail from './ContentDetail';
import { baseInfoDs, skuInfoDs, saleInfoDs } from './ds.js';
import SkuContext from './skuContext';
import customStore from './customStore';
import styles from './index.less';

const orgnizationId = getCurrentOrganizationId();
const skuDetailCode = customStore.getAllCustomCode();

const ApproveBtn = observer(({ dataSet, children, text, contentProps = {}, ...btnProps }) => {
  if (dataSet && dataSet.length > 1) {
    // 个性化按钮组默认会给btnProps一个onClick属性
    const _props = btnProps;
    delete _props.onClick;
    return (
      <MultiButton dataSet={dataSet} contentProps={contentProps} {..._props}>
        {children || text}
      </MultiButton>
    );
  } else {
    return <PermissionButton {...btnProps}>{children || text}</PermissionButton>;
  }
});

const HisBtn = observer(({ dataSet, children, text, ...btnProps }) => {
  const historyFlag = dataSet?.current?.get('historyFlag');
  return historyFlag ? <Button {...btnProps}>{children || text}</Button> : '';
});

const initStores = ({ spuId, skuId }) => {
  return {
    spuDs: [new DataSet(baseInfoDs()), new DataSet(baseInfoDs())],
    skuDs: [new DataSet(skuInfoDs()), new DataSet(skuInfoDs())],
    priceDs: [new DataSet(saleInfoDs()), new DataSet(saleInfoDs())],
    multiDs: new DataSet({
      autoQuery: false,
      paging: false,
      transport: {
        read: {
          url: `/smpc/v1/${orgnizationId}/skus/spu-temporary-list/${spuId}`,
          method: 'GET',
        },
      },
      events: {
        load: ({ dataSet }) => {
          dataSet.records.forEach((f) => {
            if (f.get('skuId') === skuId) {
              dataSet.select(f);
            }
          });
        },
      },
    }),
  };
};

// 比较id是否相等
const isEqual = (id, _id) => String(id) === String(_id);

function SkuDetail(props) {
  const {
    history,
    location,
    match: { path = '' },
    location: { search, pathname, state },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    onFormLoaded,
    onLoad,
  } = props;
  // 是否为供应商
  const { tabState } = state || {};
  const isSup = pathname.includes('-sup');
  // 是否为工作流审批表单
  const isWorkflowApprove = pathname.includes('sku-workflow-approve-pur');
  // url前缀用来拼接默认backpath
  const prefixPath = pathname.split('/detail')[0];
  const permissionPath = `${path.split('/detail')[0]}/list`;
  const editSkuAuthProps = isSup
    ? {}
    : {
        permission: true,
        permissionList: [
          {
            code: `${permissionPath}.button.editSkuAuth`,
            type: 'button',
            meaning: '商品工作台（采）-可编辑商品权限',
          },
        ],
      };
  const {
    req,
    skuId,
    spuId,
    menuId,
    anchor,
    btnFlag,
    hiddenSku,
    compareFlag,
    tabStatus,
    backPath,
    skuHistoryId,
    skuTemporaryId,
    approveType, // 审批类型 已失效 || 新建
    supplierShelfFlag, // 上下架申请详情查已失效
    wflApproveFlag, // 工作流审批标识
    wflRevokeApproveFlag, // 工作流撤销审批标识
    taskId,
    processInstanceId,
    businessKey,
  } = qs.parse(location.search.substr(1)) || {}; // 获取路由参数
  const historyLoaded = useRef(false); // 历史版本加载标志
  const [showHistory, setShowHistory] = useState(false); // 历史版本切换状态
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [data, setData] = useState({
    skuId, // 当前skuId
    skuList: [], // 当前sku集合
    lastSkuList: [], // 历史版sku集合
    specsData: [], // 分类下规格属性
    currentSpu: [], // spu信息
  });
  const anchorPre = anchor || (isSup ? 'SUP' : 'PUR');
  const dataSetMap = useMemo(() => initStores({ spuId, skuId }), [spuId, skuId]); // 生成ds
  const { spuDs, skuDs, priceDs, multiDs } = dataSetMap;

  // 更新个性化配置
  (function initCustomStore() {
    customStore.setState('isReceive', req === 'receive');
    customStore.setCustFuncs({ customizeForm, customizeTable, customizeBtnGroup });
    customStore.setCustomCode(isSup);
  })();

  useEffect(() => {
    initData();
  }, [spuId, skuHistoryId, skuTemporaryId, supplierShelfFlag, dataSetMap]);

  useEffect(() => {
    if (btnFlag === 'y' && spuId) {
      multiDs.setQueryParameter('approveType', approveType);
      multiDs.query();
    }
  }, [multiDs, btnFlag]);

  // 当前商品
  const currentSku = useMemo(() => {
    return data.skuList.find((f) => isEqual(f.skuId, data.skuId)) || {};
  }, [data.skuId, data.skuList]);

  // 初始化查询
  async function initData() {
    const customizeUnitCode = skuDetailCode.join(',');
    // spuId正常商品查询
    // skuHistoryId查询历史版本商品
    // skuTemporaryId查询待审批商品或者查询工作流审批商品
    if (spuId || skuHistoryId || skuTemporaryId) {
      const api = skuHistoryId
        ? fetchInfoHistory
        : req === 'new'
        ? fetchInfoNew
        : req === 'reject'
        ? fetchInfoReject
        : req === 'workflowApprove'
        ? fetchInfoWorkflowApprove
        : req === 'lastVersion'
        ? fetchInfoLastVersion
        : fetchInfo;
      setLoading(true);
      const result = getResponse(
        await api(
          filterNullValueObject({
            spuId,
            menuId,
            skuHistoryId,
            skuId: data.skuId,
            skuTemporaryId,
            customizeUnitCode,
            supplierShelfFlag: supplierShelfFlag || (tabStatus === '7' ? 0 : undefined),
          })
        )
      );
      setLoading(false);
      if (result) {
        const { skuList = [], ...baseInfo } = result;
        const { categoryId, customFlag } = baseInfo;
        const newSkuList = skuList?.map((sku) => ({ ...sku, customFlag })) || [];
        const filterSku = skuId ? newSkuList.filter((f) => isEqual(f.skuId, skuId)) : newSkuList;
        spuDs[0].loadData([baseInfo]);
        skuDs[0].loadData(filterSku);
        initSaleInfo(filterSku[0]);
        const specsData = getResponse(await fetchTypeSpecs({ categoryId })) || [];

        setData({
          spuId: spuId || result.spuId,
          skuId: skuId || skuList?.[0]?.skuId,
          skuList: newSkuList,
          specsData,
          currentSpu: [result],
        });
        if (onFormLoaded) {
          onFormLoaded(true);
        }
        if (onLoad) {
          onLoad({
            submit: props.remote
              ? props.remote.process('SKU_DETAIL_WORKFLOW_SUBMIT_PROCESS', undefined, {
                  location,
                  result,
                })
              : undefined,
          });
        }
      }
    }
  }

  function initSaleInfo(sku) {
    const { skuSalesInfos = [] } = sku || {};
    priceDs[0].loadData(skuSalesInfos || []);
    priceDs[0].setQueryParameter('skuId', sku?.skuId);
  }

  // 编辑
  function handleEditSpu() {
    history.push({
      pathname: `${prefixPath}/create`,
      search: qs.stringify(
        filterNullValueObject({
          req,
          spuId,
          skuTemporaryId,
          backPath: `${pathname}${search}`,
        })
      ),
    });
  }

  // 预览
  function handlePreview() {
    if (!skuDs[0].current) return false;
    const { skuId: productId, sourceFrom } = skuDs[0].current.toData();
    openTab({
      key: '/smpc/sku-preview',
      title: 'srm.common.view.skuPreview',
      search: qs.stringify(
        filterNullValueObject({
          req,
          btnFlag,
          closePath: '/smpc/sku-workbench-pur/list',
          productId: productId || data.skuId,
          sourceFrom,
          approveType,
          skuTemporaryId,
        })
      ),
    });
  }

  // 历史版本切换
  async function handleToggleHistory() {
    const { skuId: _skuId, currentSpu } = data;
    const customizeUnitCode = skuDetailCode.join(',');
    if (!historyLoaded.current) {
      const res = getResponse(
        await fetchLastVersion({ ...(currentSpu?.[0] || {}), customizeUnitCode })
      );
      if (res) {
        historyLoaded.current = true;
        const { skuList: lastSkuList = [], ...baseInfo } = res;
        const filterSku = _skuId
          ? lastSkuList.filter((f) => isEqual(f.skuId, _skuId))
          : lastSkuList;
        skuDs[1].loadData(filterSku);
        spuDs[1].loadData([baseInfo]);
        const { skuSalesInfos = [] } = filterSku[0] || {};
        priceDs[1].loadData(skuSalesInfos || []);
        setShowHistory(true);
        setData((p) => ({ ...p, lastSkuList, currentSpu: [p.currentSpu?.[0], res] }));
      }
    } else {
      setShowHistory((p) => !p);
    }
  }

  // 查看历史版本详情
  function handleViewHis(record) {
    openTab({
      key: `/smpc/sku-detail-${isSup ? 'sup' : 'pur'}`,
      title: 'srm.common.view.skuDetail',
      search: qs.stringify({
        skuId: record.get('skuId'),
        skuHistoryId: record.get('skuHistoryId'),
        anchor: `HIS_${isSup ? 'SUP' : 'PUR'}`,
      }),
    });
  }

  // 审批
  function handleBatchApprove(type) {
    const { skuList } = data;
    const sku = skuList.find((f) => isEqual(f.skuId, skuId)) || {};
    const approveFn = async (params, suffix) => {
      setBtnLoading(true);
      const skuApproveDTOS =
        multiDs && multiDs.length > 1
          ? multiDs.selected.map((m) => m.toData())
          : [{ ...sku, skuTemporaryId }];

      const result = getResponse(await approveOrReject({ skuApproveDTOS, ...params }, suffix));
      setBtnLoading(false);
      if (result) {
        notification.success();
        history.push(backPath || `${prefixPath}/list`);
      }
    };

    if (type === 'pass') {
      return approveFn(
        {
          approvalFlag: 2,
        },
        'approve'
      );
    } else if (type === 'reject') {
      openTextArea({
        title: intl.get('smpc.workbench.view.approveReject').d('审批拒绝'),
        name: 'remark',
        label: intl.get('smpc.product.view.rejectReason').d('拒绝原因'),
        maxLength: 100,
        onOk: (param) => approveFn({ approvalFlag: 0, ...param }, 'reject'),
      });
    } else {
      return approveFn(
        {
          approvalFlag: 1,
        },
        'approve-and-shelf'
      );
    }
  }

  // 切换商品
  function handleSkuChange(_skuId) {
    const { skuList = [], lastSkuList = [] } = data;
    const sku = skuList.find((f) => isEqual(f.skuId, _skuId));
    skuDs[0].loadData([sku]);
    initSaleInfo(sku);

    const lastSku = lastSkuList.find((f) => isEqual(f.skuId, _skuId)) || {};
    skuDs[1].loadData([lastSku]);
    priceDs[1].loadData(lastSku.skuSalesInfos || []);
    setData((p) => ({ ...p, skuId: _skuId }));
  }

  const btnsFilter = (btns) => {
    return btns.filter((f) => !('show' in f) || f.show);
  };

  const operateRecord = (record) => {
    // 待审批 + 审批拒绝
    const needTemporaryId = ['5', '6'].includes(tabStatus);
    openRecordTabs(
      {
        rowRecord: record,
        skuTemporaryId: needTemporaryId ? skuTemporaryId : null,
        leftOperateArg: {
          url: `/smpc/v1/${getCurrentOrganizationId()}/sku-operation-records/list`,
          queryParams: {
            skuId: record.get('skuId'),
          },
          operateRenderer,
          partLoad: true,
        },
      },
      isSup
    );
  };

  const customBack = () => {
    if (backPath) {
      const [_pathname, _search] = backPath.split('?');
      history.push({
        pathname: _pathname,
        search: _search ? qs.stringify(filterNullValueObject(qs.parse(_search))) : '',
        state: tabState || {},
      });
    }
  };

  const getCustomButtons = () => {
    // 工作流表单是否显示版本对比
    const workflowIsCompare =
      isWorkflowApprove &&
      currentSku.approvalFrom !== 'SAGM' &&
      currentSku.approveType !== 'INVALID';
    const contentProps = {
      options: multiDs,
      textField: 'skuName',
      valueField: 'skuId',
    };
    if (!data.skuId) return [];
    const buttons = [
      {
        name: 'wflApprove',
        btnType: 'c7n-pro',
        show: +wflApproveFlag,
        child: intl.get('hzero.common.button.approval').d('审批'),
        btnProps: {
          icon: 'authorize',
          color: 'primary',
          onClick: () => {
            openApproveModal({
              modalProps: {
                closable: true,
              },
              taskId,
              processInstanceId,
              onSuccess: () => {
                history.push(backPath || `${prefixPath}/list`);
              },
            });
          },
        },
      },
      {
        name: 'wflRevokeApprove',
        btnType: 'c7n-pro',
        show: +wflRevokeApproveFlag,
        child: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
        btnProps: {
          funcType: 'flat',
          icon: 'reply',
          onClick: () => {
            handleRevokeApprove(businessKey, () => history.push(backPath || `${prefixPath}/list`));
          },
        },
      },
      {
        name: 'approve',
        group: true,
        show: btnFlag === 'y',
        child: (
          <DropdownBtn
            permission
            permissionList={[
              {
                code: `${path}.button.approve`,
                type: 'button',
                meaning: '商品详情-审批',
              },
            ]}
            icon="check_circle"
            color="primary"
            text={intl.get('smpc.product.model.approve.pass').d('审批通过')}
          />
        ),
        children: [
          {
            name: 'approvePass',
            btnType: 'c7n-pro',
            btnComp: OverlayMenuItemBtn,
            btnProps: {
              dataSet: multiDs,
              text: intl.get('smpc.product.model.approve.pass').d('审批通过'),
              onClick: () => handleBatchApprove('pass'),
              loading: btnLoading,
              getChildRef: (ds) => {
                if (ds && ds.length > 1) {
                  return (
                    <Menu>
                      <Menu.SubMenu
                        title={intl.get('smpc.product.model.approve.pass').d('审批通过')}
                      >
                        <MultiContent
                          {...contentProps}
                          okProps={{ loading: btnLoading }}
                          onOk={() => handleBatchApprove('pass')}
                        />
                      </Menu.SubMenu>
                    </Menu>
                  );
                }
              },
            },
          },
          {
            name: 'approvePassShelf',
            btnType: 'c7n-pro',
            show: approveType !== 'INVALID',
            btnComp: OverlayMenuItemBtn,
            btnProps: {
              dataSet: multiDs,
              getChildRef: (ds) => {
                if (ds && ds.length > 1) {
                  return (
                    <Menu style={{ minWidth: 135 }}>
                      <Menu.SubMenu
                        title={intl.get('smpc.product.model.approve.passShelf').d('审批通过并上架')}
                      >
                        <MultiContent
                          {...contentProps}
                          okProps={{ loading: btnLoading }}
                          onOk={() => handleBatchApprove('passShelf')}
                        />
                      </Menu.SubMenu>
                    </Menu>
                  );
                }
              },
              text: intl.get('smpc.product.model.approve.passShelf').d('审批通过并上架'),
              onClick: () => handleBatchApprove('passShelf'),
              loading: btnLoading,
            },
          },
        ],
      },
      {
        name: 'reject',
        // btnType: 'c7n-pro',
        show: btnFlag === 'y',
        btnComp: ApproveBtn,
        btnProps: {
          type: 'c7n-pro',
          text: intl.get('smpc.product.model.approve.reject').d('审批拒绝'),
          funcType: 'flat',
          icon: 'cancel',
          dataSet: multiDs,
          onClick: () => handleBatchApprove('reject'),
          contentProps: {
            ...contentProps,
            onOk: () => handleBatchApprove('reject'),
          },
          permissionList: [
            {
              code: `${path}.button.approve`,
              type: 'button',
              meaning: '商品详情-审批',
            },
          ],
        },
      },
      {
        name: 'compare',
        btnType: 'c7n-pro',
        show: (compareFlag === 'y' && approveType !== 'INVALID') || workflowIsCompare,
        btnProps: {
          funcType: 'flat',
          icon: !showHistory ? 'compare' : 'undo',
          onClick: handleToggleHistory,
        },
        child: !showHistory
          ? intl.get('smpc.product.view.button.versionCompare').d('版本对比')
          : intl.get('smpc.product.view.button.cacelCompare').d('取消对比'),
      },
      {
        name: 'edit',
        btnType: 'c7n-pro',
        btnComp: ObserverBtn,
        show: tabStatus && (!['5', '6', '7'].includes(tabStatus) || req === 'reject'),
        btnProps: {
          funcType: 'flat',
          icon: 'mode_edit',
          onClick: handleEditSpu,
          ...editSkuAuthProps,
          text: intl.get('hzero.common.edit').d('编辑'),
        },
      },
      {
        name: 'preview',
        btnType: 'c7n-pro',
        show: tabStatus || isWorkflowApprove,
        btnProps: { funcType: 'flat', icon: 'find_in_page', onClick: handlePreview },
        child: intl.get('hzero.common.button.preview').d('预览'),
      },
      // （待审批审批 || 审批拒绝) && 商品有历史版本 && 协议触发的商品审批
      {
        name: 'history',
        btnType: 'c7n-pro',
        show: tabStatus && compareFlag !== 'y',
        btnProps: {
          funcType: 'flat',
          icon: 'menu_book',
          dataSet: skuDs[0],
          onClick: () => historyRecord({ skuId: data.skuId, onView: handleViewHis }),
          text: intl.get('smpc.product.view.historyVersion').d('历史版本'),
        },
        btnComp: HisBtn,
      },
      {
        name: 'record',
        btnType: 'c7n-pro',
        show: tabStatus || isWorkflowApprove,
        child: intl.get('hzero.common.button.record').d('操作记录'),
        btnProps: {
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: () => {
            if (skuDs[0].current) {
              operateRecord(skuDs[0].current);
            }
          },
        },
      },
    ];
    const filterBtns = btnsFilter(buttons).map((m) => {
      const { children, ...other } = m;
      if (children) {
        const filterChildren = btnsFilter(children);
        return { ...other, children: filterChildren };
      }
      return m;
    });
    return filterBtns;
  };
  return (
    <Fragment>
      <Header
        backPath={skuHistoryId || isWorkflowApprove ? undefined : backPath || `${prefixPath}/list`}
        customBack={tabState ? customBack : null}
        title={intl.get('smpc.product.view.skuDetail').d('商品详情')}
      >
        {customizeBtnGroup(
          { code: customStore.getCustomCode('DETAIL_BTNS'), pro: true },
          <DynamicButtons buttons={getCustomButtons()} />
        )}
      </Header>
      <Content
        className={classNames({
          [styles['sku-content-detail']]: true,
          [anchorPre]: true,
          'smpc-sku-detail': !showHistory && !isWorkflowApprove,
        })}
      >
        <SkuContext.Provider
          value={{
            hiddenSku,
            showHistory,
            onSkuChange: handleSkuChange,
          }}
        >
          <ContentDetail
            isSup={isSup}
            spuId={spuId}
            spuDs={spuDs}
            skuId={data.skuId}
            skuDs={skuDs}
            priceDs={priceDs}
            loading={loading}
            anchorPre={anchorPre}
            skuList={data.skuList}
            showHistory={showHistory}
            specsData={data.specsData}
            currentSpu={data.currentSpu}
            isWorkflowApprove={isWorkflowApprove}
            remote={props.remote}
          />
        </SkuContext.Provider>
      </Content>
    </Fragment>
  );
}

export default flowRight(
  remote({
    code: 'SKU_WORKBENCH_SKU_DETAIL',
    name: 'remote',
  }),
  withCustomize({ unitCode: skuDetailCode }),
  formatterCollections({ code: ['smpc.product', 'small.common', 'sagm.common', 'srm.common'] })
)(SkuDetail);
