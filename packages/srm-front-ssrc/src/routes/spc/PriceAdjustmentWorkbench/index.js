import React, { useState, useEffect } from 'react';
import { Header, Content } from 'components/Page';
import { Tabs, DataSet, Modal } from 'choerodon-ui/pro';
import { compose, isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import PermissionButton from '_components/PermissionButton';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import withProps from 'utils/withProps';
import priceRemote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  createPriceAdjustment,
  realsePriceAdjustment,
  rollBackPriceAdjustment,
  queryCount,
  savePriceAdjustment,
  reSyncPriceLib,
} from '@/services/priceAdjustmentWorkbenchService';
import {
  getResponse,
  filterNullValueObject,
  getCurrentOrganizationId,
} from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import querystring from 'querystring';

import { getRuleDefinition } from '@/routes/ssrc/PriceLibraryNew/util';

import { getColumns, handleToDetail, tempDelete } from './utils';
import { rightBarRenderer } from '../utils/renderer';
import { getListDS, getLineDs } from './stores/getListDS';

const Index = observer(
  ({
    customizeTable,
    TabsTableList,
    location = {},
    history,
    customizeBtnGroup,
    activeTabKey,
    remote,
  }) => {
    const priceAdjustmentWorkBenchList = [
      {
        tab: intl.get('ssrc.priceAdjustmentWorkBench.view.title.toPublish').d('待新建'),
        key: 'TOPUBLISH',
        filterCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.TOPUBLISH_SEARCH',
        customizeUnitCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.TOPUBLISH_TABLE',
      },
      {
        tab: intl.get('ssrc.priceAdjustmentWorkBench.view.title.unpublish').d('未发布'),
        key: 'NEW',
        filterCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.NEW_SEARCH',
        customizeUnitCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.NEW_TABLE',
      },
      {
        tab: intl.get('ssrc.priceAdjustmentWorkBench.view.title.approval').d('审批中'),
        key: 'APPROVAL',
        filterCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVAL_SEARCH',
        customizeUnitCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVAL_TABLE',
      },
      {
        tab: intl.get('ssrc.priceAdjustmentWorkBench.view.title.approved').d('已完成'),
        key: 'APPROVED',
        filterCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVED_SEARCH',
        customizeUnitCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVED_TABLE',
      },
      {
        tab: intl.get('ssrc.priceAdjustmentWorkBench.view.title.all').d('全部'),
        key: 'ALL',
        filterCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.ALL_SEARCH',
        customizeUnitCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.ALL_TABLE',
        searchBarConfig: {
          right: {
            render: () =>
              rightBarRenderer({
                hdKey,
                useHdChange: cutChange,
              }),
          },
        },
        lineAll: {
          key: 'LINEALL',
          filterCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.LINEALL_SEARCH',
          customizeUnitCode: 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.LINEALL_TABLE_NEW',
        },
      },
    ];

    const { activeTabKey: urlActiveTabKey } = querystring.parse(location?.search?.substr(1)) || {};
    const [activeKey, setActiveKey] = useState(urlActiveTabKey || activeTabKey);
    const [loading, setLoading] = useState(false);
    const [editPriceAdjustmentFlag, setEditPriceAdjustmentFlag] = useState(false);
    const [ruleDefinition, setRuleDefinition] = useState([]);
    const [hdKey, setHdKey] = useState('ALL');

    const [tabCount, setTabCount] = useState({
      NEW: 0,
      TOPUBLISH: 0,
      APPROVAL: 0,
      APPROVED: 0,
      ALL: 0,
    });

    // useEffect(() => {
    //   setLoading(true);
    //   TabsTableList[activeKey].setState('tabType', activeKey);
    //   TabsTableList[hdKey].setState('hdKey', hdKey);
    //   TabsTableList[activeKey].query(TabsTableList[activeKey].currentPage).finally(() => {
    //     setLoading(false);
    //   });
    // }, [activeKey, hdKey]);

    useEffect(() => {
      TabsTableList[activeKey].setState('ruleDefinition', ruleDefinition);
    }, [ruleDefinition]);

    useEffect(() => {
      setCount();
    }, [activeKey]);

    useEffect(() => {
      if (activeKey && TabsTableList?.[activeKey]?.setState) {
        TabsTableList[activeKey].setState('tabType', activeKey);
      }
      queryRuleDefinition();
    }, []);

    const cutChange = (key) => {
      TabsTableList[key].setState('tabType', key);
      setHdKey(key);
    };

    // 查询基准价维护的对应规则
    const queryRuleDefinition = () => {
      getRuleDefinition().then((res) => {
        setRuleDefinition(res);
      });
    };

    const handleTabChange = (Key) => {
      TabsTableList[Key].setState('tabType', Key);
      setActiveKey(Key);
    };

    const setCount = () => {
      queryCount().then((res) => {
        if (getResponse(res)) {
          const { newCount, poolCount, approvalCount, approvedCount, allCount } = getResponse(res);
          setTabCount({
            NEW: newCount,
            TOPUBLISH: poolCount,
            APPROVAL: approvalCount,
            APPROVED: approvedCount,
            ALL: allCount,
          });
        }
      });
    };

    // 保存调价单
    const handleSave = async (dataSet) => {
      const validateFlag = await dataSet.validate();
      if (!validateFlag) return;
      const deleteLines = dataSet.getState('deleteLines');
      const params = dataSet.toJSONData() || [];
      if (deleteLines) {
        deleteLines.forEach((rec) => {
          params.push({ ...rec.toJSONData(), _status: 'delete' });
        });
      }
      if (isEmpty(params)) return;
      setLoading(true);
      await savePriceAdjustment(params, 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.TOPUBLISH_TABLE')
        .then((res) => {
          if (getResponse(res)) {
            notification.success();
            cancelEdit(dataSet);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };

    const cancelEdit = (dataSet) => {
      setEditPriceAdjustmentFlag(false);
      // 清空缓存的删除行,查询参数
      dataSet.setState('deleteLines', undefined);
      dataSet.setQueryParameter('excludePoolIds', undefined);
      refresh();
    };

    // 新建调价单
    const handleCreate = async (dataSet) => {
      const params = dataSet.selected.map((record) => record.toJSONData());
      setLoading(true);
      await createPriceAdjustment(params, 'SPC.PRICEADJUSTMENTWORKBENCH.LIST.TOPUBLISH_TABLE')
        .then((res) => {
          if (getResponse(res)) {
            notification.success();
            refresh();
            handleToDetail(history, res.priceAdjustmentHeaderId, 'edit');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };

    // 调价单发布
    const handleRealse = () => {
      const params = TabsTableList[activeKey].selected.map((n) => n.toData());
      setLoading(true);
      realsePriceAdjustment(params)
        .then(async (res) => {
          if (getResponse(res)) {
            notification.success();
            refresh();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };

    const handleNew = () => {
      history.push({
        pathname: '/spc/price-adjustment-workbench/details/create',
      });
    };

    const handleRollBack = (dataSet) => {
      const canRollBackFlag = !dataSet.selected.find(
        (record) => record.get('sourceFrom') !== 'QUICK_SEARCH_SOURCE'
      );
      if (!canRollBackFlag) {
        return notification.warning({
          message: intl
            .get(`ssrc.priceAdjustmentWorkBench.view.message.notRollBack`)
            .d('仅支持退回快速寻源来源的数据行，请检查！'),
        });
      }
      setLoading(true);
      const params = dataSet.selected.map((record) => record.toJSONData());
      rollBackPriceAdjustment(params)
        .then(async (res) => {
          if (getResponse(res)) {
            notification.success();
            refresh();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };

    /**
     * 重新同步价格库
     * @param {*} dataSet
     */
    const handleSyncPriceLib = (dataSet) => {
      setLoading(true);
      const params = dataSet.selected.map((record) => record.toJSONData());
      reSyncPriceLib(params)
        .then(async (res) => {
          if (getResponse(res)) {
            notification.success();
            refresh();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };

    // 刷新
    const refresh = async () => {
      TabsTableList[activeKey].unSelectAll();
      TabsTableList[activeKey].clearCachedRecords();
      await TabsTableList[activeKey].query();
      await setCount();
    };

    // const handleCancelWholeDoc = async (dataSet) => {
    //   const canCancelFlag = !dataSet.selected.find(record => !['REJECTED', 'NEW'].includes(record.get('priceAdjustmentStatus')) || record.get('sourceFrom') !== 'QUICK_SEARCH_SOURCE');
    //   if (!canCancelFlag) {
    //     return notification.warning(
    //       {
    //         message: intl.get(`ssrc.priceAdjustmentWorkBench.view.message.notCancelWholeDoc`).d('仅支持整单取消快速寻源来源的数据行，请检查！'),
    //       });
    //   }
    //   setLoading(true);
    //   const params = dataSet.selected.map((record) => record.toJSONData());
    //   cancelWholeDoc(params)
    //     .then(async (res) => {
    //       if (getResponse(res)) {
    //         notification.success();
    //         refresh();
    //       }
    //     })
    //     .finally(() => {
    //       setLoading(false);
    //     });
    // };

    const getExportParams = ({ dataSet }, idName = 'priceAdjustmentHeaderId') => {
      const { selected, queryDataSet } = dataSet;
      const queryParameter = dataSet.queryParameter || {};
      const dsParams = queryDataSet ? queryDataSet.toData()[0] : {};
      const ids = selected.map((i) => i.get(idName));

      return filterNullValueObject({
        ...queryParameter,
        ...(selected.length > 0
          ? { [`${idName}s`]: ids }
          : { ...dsParams, customizeOrderField: null }),
        multiPcNumOrTitle: dsParams?.multiPcNumOrTitle?.split(','),
        priceAdjustmentStatus: dsParams?.priceAdjustmentStatus?.split(','),
      });
    };

    const NewButtons = observer(({ dataSet }) => {
      const buttons = [
        {
          name: 'publish2',
          btnType: 'c7n-pro',
          btnComp: PermissionButton,
          btnProps: {
            loading,
            disabled: isEmpty(dataSet.selected),
            type: 'c7n-pro',
            icon: 'publish2',
            color: 'primary',
            onClick: () => handleRealse(dataSet),
          },
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.button.pushsap',
          //     type: 'c7n-pro',
          //     meaning: '协议工作台-推送外部系统',
          //   },
          // ],
          child: intl.get('ssrc.priceAdjustmentWorkBench.view.title.publish').d('发布'),
        },
        !editPriceAdjustmentFlag && {
          name: 'add',
          btnType: 'c7n-pro',
          btnComp: PermissionButton,
          btnProps: {
            loading,
            funcType: 'flat',
            type: 'c7n-pro',
            icon: 'add',
            onClick: handleNew,
          },
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.button.pushsap',
          //     type: 'c7n-pro',
          //     meaning: '协议工作台-推送外部系统',
          //   },
          // ],
          child: intl.get('hzero.common.button.create').d('新建'),
        },
        // {
        //   btnComp: PermissionButton,
        //   name: 'cancelWholeDoc',
        //   child: intl.get('ssrc.priceAdjustmentWorkBench.view.title.cancelWholeDoc').d('整单取消'),
        //   btnProps: {
        //     loading,
        //     type: 'c7n-pro',
        //     disabled: isEmpty(dataSet.selected),
        //     icon: 'cancel',
        //     onClick: () => handleCancelWholeDoc(dataSet),
        //     funcType: 'flat',
        //     waitType: 'throttle',
        //     wait: 200,
        //     // permissionList: [
        //     //   {
        //     //     code: 'srm.ssrc.price.model.price-adjustment-workbench.button.detail.cancelWholeDoc',
        //     //     type: 'button',
        //     //     meaning: '调价单工作台整单取消',
        //     //   },
        //     // ],
        //   },
        // },
      ];

      return <DynamicButtons key="dynamicButtons" buttons={buttons} />;
    });

    const ToPublishButtons = observer(({ dataSet }) => {
      const btns = [
        editPriceAdjustmentFlag && {
          name: 'save',
          btnType: 'c7n-pro',
          btnComp: PermissionButton,
          btnProps: {
            loading,
            type: 'c7n-pro',
            icon: 'save',
            color: 'primary',
            onClick: () => handleSave(dataSet),
          },
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.button.pushsap',
          //     type: 'c7n-pro',
          //     meaning: '协议工作台-推送外部系统',
          //   },
          // ],
          child: intl.get('hzero.common.button.save').d('保存'),
        },
        !editPriceAdjustmentFlag && {
          name: 'add',
          btnType: 'c7n-pro',
          btnComp: PermissionButton,
          btnProps: {
            // funcType: 'flat',
            loading,
            type: 'c7n-pro',
            disabled: isEmpty(dataSet.selected),
            icon: 'add',
            color: 'primary',
            onClick: () => handleCreate(dataSet),
          },
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.button.pushsap',
          //     type: 'c7n-pro',
          //     meaning: '协议工作台-推送外部系统',
          //   },
          // ],
          child: intl.get('ssrc.priceAdjustmentWorkBench.view.button.add').d('新建调价单'),
        },
        editPriceAdjustmentFlag && {
          name: 'delete',
          btnType: 'c7n-pro',
          btnComp: PermissionButton,
          btnProps: {
            loading,
            funcType: 'flat',
            type: 'c7n-pro',
            disabled: isEmpty(dataSet.selected),
            icon: 'delete_sweep',
            onClick: () => {
              const canDeleteFlag = !dataSet.selected.find(
                (record) => record.get('sourceFrom') !== 'MANUAL'
              );
              if (!canDeleteFlag) {
                return notification.warning({
                  message: intl
                    .get(`ssrc.priceAdjustmentWorkBench.view.message.notDelete`)
                    .d('仅支持删除手工来源的数据行，请检查！'),
                });
              }
              tempDelete(dataSet, 'priceAdjustmentPoolId', 'excludePoolIds');
            },
          },
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.button.pushsap',
          //     type: 'c7n-pro',
          //     meaning: '协议工作台-推送外部系统',
          //   },
          // ],
          child: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
        },
        {
          name: 'addNewLine',
          btnType: 'c7n-pro',
          btnComp: PermissionButton,
          btnProps: {
            funcType: 'flat',
            loading,
            type: 'c7n-pro',
            icon: 'playlist_add',
            onClick: () => {
              if (!editPriceAdjustmentFlag) {
                setEditPriceAdjustmentFlag(true);
              }
              dataSet.create({ sourceFrom: 'MANUAL' }, 0);
            },
          },
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.button.pushsap',
          //     type: 'c7n-pro',
          //     meaning: '协议工作台-推送外部系统',
          //   },
          // ],
          child: intl.get('ssrc.priceAdjustmentWorkBench.view.button.addNewLine').d('新增行'),
        },
        !editPriceAdjustmentFlag && {
          name: 'edit',
          btnType: 'c7n-pro',
          btnComp: PermissionButton,
          btnProps: {
            loading,
            funcType: 'flat',
            type: 'c7n-pro',
            icon: 'mode_edit',
            onClick: () => {
              setEditPriceAdjustmentFlag(true);
            },
          },
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.button.pushsap',
          //     type: 'c7n-pro',
          //     meaning: '协议工作台-推送外部系统',
          //   },
          // ],
          child: intl.get('ssrc.priceAdjustmentWorkBench.view.button.edit').d('编辑'),
        },
        editPriceAdjustmentFlag && {
          name: 'cancelEdit',
          btnType: 'c7n-pro',
          btnComp: PermissionButton,
          btnProps: {
            loading,
            funcType: 'flat',
            type: 'c7n-pro',
            icon: 'cancel',
            onClick: () => {
              Modal.confirm({
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: intl
                  .get('ssrc.priceAdjustmentWorkBench.view.message.cancelEditTips')
                  .d('数据将回退到编辑前，请确认是否取消？'),
                onOk: () => {
                  cancelEdit(dataSet);
                },
              });
            },
          },
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.button.pushsap',
          //     type: 'c7n-pro',
          //     meaning: '协议工作台-推送外部系统',
          //   },
          // ],
          child: intl.get('ssrc.priceAdjustmentWorkBench.view.button.cancelEdit').d('取消编辑'),
        },
        !editPriceAdjustmentFlag && {
          name: 'rollBack',
          btnType: 'c7n-pro',
          btnComp: PermissionButton,
          btnProps: {
            loading,
            funcType: 'flat',
            type: 'c7n-pro',
            icon: 'reply',
            disabled: isEmpty(dataSet.selected),
            onClick: () => handleRollBack(dataSet),
          },
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.button.pushsap',
          //     type: 'c7n-pro',
          //     meaning: '协议工作台-推送外部系统',
          //   },
          // ],
          child: intl.get('ssrc.priceAdjustmentWorkBench.view.button.rollBack').d('退回'),
        },
        {
          name: 'import',
          btnComp: CommonImport,
          btnProps: {
            businessObjectTemplateCode: 'SRM_C_SSRC_PRICE_ADJUSTMENT_POOL_IMPORT',
            prefixPatch: '/spc',
            buttonText: intl.get('hzero.common.button.Import').d('导入'),
            buttonProps: {
              funcType: 'flat',
            },
            successCallBack: () => dataSet.query(),
          },
        },
        {
          name: 'toPublishExport',
          btnComp: ExcelExportPro,
          btnProps: {
            templateCode: 'SRM_C_SSRC_PRICE_ADJUSTMENT_POOL_EXPORT',
            name: 'toPublishExport',
            requestUrl: `/spc/v1/${getCurrentOrganizationId()}/price-adjustment/pool/export`,
            buttonText: intl.get(`hzero.common.button.export`).d('导出'),
            allBody: true,
            method: 'POST',
            queryParams: getExportParams({ dataSet }, 'priceAdjustmentPoolId'),
            otherButtonProps: {
              type: 'c7n-pro',
              icon: 'unarchive',
              funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.ssrc.price.model.price-adjustment-workbench.button.toPublishExport',
                  type: 'button',
                  meaning: '待新建-导出',
                },
              ],
            },
          },
        },
      ].filter(Boolean);
      const buttons = remote
        ? remote.process('SSRC_PRICE_ADJUSTMENT_WORKBENCH_PAGE_PUBLISH_BUTTONS', btns, {
            dataSet,
          })
        : btns;
      return <DynamicButtons key="dynamicButtons" buttons={buttons} />;
    });

    const ApprovedButtons = observer(({ dataSet }) => {
      const btns = [
        {
          name: 'syncPriceLib',
          btnType: 'c7n-pro',
          btnProps: {
            loading,
            type: 'c7n-pro',
            icon: 'sync',
            wait: 500,
            funcType: 'flat',
            disabled: isEmpty(dataSet.selected),
            onClick: () => handleSyncPriceLib(dataSet),
          },
          child: intl
            .get('ssrc.priceAdjustmentWorkBench.view.button.syncPriceLib')
            .d('重新同步价格库'),
        },
      ];
      return <DynamicButtons key="dynamicButtons" buttons={btns} />;
    });

    const AllButtons = observer(({ dataSet }) => {
      const btns = [
        {
          name: 'priceExport',
          btnComp: ExcelExportPro,
          btnProps: {
            templateCode: 'SRM_C_SSRC_PRICE_ADJUSTMENT_EXPORT',
            name: 'priceExport',
            requestUrl: `/spc/v1/${getCurrentOrganizationId()}/price-adjustment/export`,
            buttonText: intl.get(`hzero.common.button.export`).d('导出'),
            allBody: true,
            method: 'POST',
            queryParams: getExportParams({ dataSet }),
            otherButtonProps: {
              type: 'c7n-pro',
              icon: 'unarchive',
              funcType: 'flat',
            },
          },
        },
        {
          name: 'syncPriceLib',
          btnType: 'c7n-pro',
          btnProps: {
            loading,
            funcType: 'flat',
            type: 'c7n-pro',
            icon: 'sync',
            wait: 500,
            disabled: isEmpty(dataSet.selected),
            onClick: () => handleSyncPriceLib(dataSet),
          },
          child: intl
            .get('ssrc.priceAdjustmentWorkBench.view.button.syncPriceLib')
            .d('重新同步价格库'),
        },
      ];
      const buttons = remote
        ? remote.process('SSRC_PRICE_ADJUSTMENT_WORKBENCH_PAGE_ALL_BUTTONS', btns, {
            dataSet,
          })
        : btns;
      return <DynamicButtons key="dynamicButtons" buttons={buttons} />;
    });

    const LineAllButtons = observer(({ dataSet }) => {
      const buttons = [
        {
          name: 'linePriceExport',
          btnComp: ExcelExportPro,
          btnProps: {
            templateCode: 'SRM_C_SSRC_PRICE_ADJUSTMENT_LINE_EXPORT',
            name: 'linePriceExport',
            requestUrl: `/spc/v1/${getCurrentOrganizationId()}/price-adjustment/export-details`,
            buttonText: intl.get(`hzero.common.button.export`).d('导出'),
            allBody: true,
            method: 'POST',
            queryParams: getExportParams({ dataSet }, 'priceAdjustmentLineId'),
            otherButtonProps: {
              type: 'c7n-pro',
              icon: 'unarchive',
              funcType: 'flat',
            },
          },
        },
      ];

      return <DynamicButtons key="dynamicButtons" buttons={buttons} />;
    });

    const cuxTableProps = (tabParam) => {
      return remote
        ? remote.process(
            'SSRC_PRICE_ADJUSTMENT_WORKBENCH_PAGE_CUXTABLE_PROPS',
            {},
            {
              activeKey,
              priceAdjustmentWorkBenchList,
              tabParam,
            }
          )
        : {};
    };

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentWorkBench')
            .d('调价单工作台')}
        >
          {activeKey === 'NEW' && <NewButtons dataSet={TabsTableList.NEW} />}
          {activeKey === 'TOPUBLISH' && <ToPublishButtons dataSet={TabsTableList.TOPUBLISH} />}
          {activeKey === 'APPROVED' && <ApprovedButtons dataSet={TabsTableList.APPROVED} />}
          {activeKey === 'ALL' && hdKey !== 'LINEALL' && <AllButtons dataSet={TabsTableList.ALL} />}
          {activeKey === 'ALL' && hdKey === 'LINEALL' && (
            <LineAllButtons dataSet={TabsTableList[hdKey]} />
          )}
        </Header>
        <Content>
          <Tabs activeKey={activeKey} onChange={handleTabChange}>
            {priceAdjustmentWorkBenchList.map(({ tab, lineAll = {}, ...otherProps }) => {
              const { key, filterCode, customizeUnitCode } =
                otherProps?.key === 'ALL' && hdKey === 'LINEALL' ? lineAll : otherProps;
              return (
                <Tabs.TabPane
                  tab={tab}
                  key={otherProps?.key}
                  count={tabCount[otherProps?.key]}
                  overFlowCount={999}
                >
                  {customizeTable(
                    {
                      code: customizeUnitCode,
                      readOnly: !editPriceAdjustmentFlag,
                    },
                    <SearchBarTable
                      {...otherProps}
                      key={key}
                      searchCode={filterCode}
                      cacheState
                      dataSet={TabsTableList[key]}
                      style={{
                        maxHeight: `calc(100vh - 280px)`,
                      }}
                      columns={getColumns({
                        key,
                        history,
                        customizeBtnGroup,
                        setCount,
                        editPriceAdjustmentFlag,
                        ruleDefinition,
                        refresh,
                        remote,
                      })}
                      {...cuxTableProps({ tab, lineAll, ...otherProps })}
                    />
                  )}
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
);

export default compose(
  formatterCollections({
    code: [
      'ssrc.priceAdjustmentWorkBench',
      'spcm.common',
      'ssrc.priceLibraryNew',
      'ssrc.inquiryHall',
      'ssrc.common',
      'hzero.common',
    ],
  }),
  withCustomize({
    unitCode: [
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.TOPUBLISH_SEARCH',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.NEW_SEARCH',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVAL_SEARCH',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVED_SEARCH',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.ALL_SEARCH',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.TOPUBLISH_TABLE',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.NEW_TABLE',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVAL_TABLE',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVED_TABLE',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.ALL_TABLE',
      'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.BUTTONS',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.LINEALL_SEARCH',
      'SPC.PRICEADJUSTMENTWORKBENCH.LIST.LINEALL_TABLE_NEW',
    ],
  }),
  withProps(
    () => {
      const activeTabKey = 'TOPUBLISH';
      // 待新建
      const tabPaneToPublishDs = new DataSet(
        getListDS(
          'multiple',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.TOPUBLISH_SEARCH',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.TOPUBLISH_TABLE',
          'priceAdjustmentPoolId'
        )
      );
      // 未发布
      const tabPaneNewDs = new DataSet(
        getListDS(
          'multiple',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.NEW_SEARCH',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.NEW_TABLE'
        )
      );
      // 审批中
      const tabPaneApprovalDs = new DataSet(
        getListDS(
          false,
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVAL_SEARCH',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVAL_TABLE'
        )
      );
      // 已完成
      const tabPaneApprovaledDs = new DataSet(
        getListDS(
          'multiple',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVED_SEARCH',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.APPROVED_TABLE'
        )
      );
      // 全部-按单
      const tabPaneAllDs = new DataSet(
        getListDS(
          'multiple',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.ALL_SEARCH',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.ALL_TABLE'
        )
      );
      // 全部-按行
      const tabPaneAllLineDs = new DataSet(
        getLineDs(
          'multiple',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.LINEALL_SEARCH',
          'SPC.PRICEADJUSTMENTWORKBENCH.LIST.LINEALL_TABLE_NEW',
          'priceAdjustmentLineId'
        )
      );
      return {
        TabsTableList: {
          TOPUBLISH: tabPaneToPublishDs,
          NEW: tabPaneNewDs,
          APPROVAL: tabPaneApprovalDs,
          APPROVED: tabPaneApprovaledDs,
          ALL: tabPaneAllDs,
          LINEALL: tabPaneAllLineDs,
        },
        activeTabKey,
      };
    },
    { cacheState: true }
  ),
  priceRemote({
    code: 'SSRC_PRICE_ADJUSTMENT_WORKBENCH_PAGE',
    name: 'remote',
  })
)(Index);
