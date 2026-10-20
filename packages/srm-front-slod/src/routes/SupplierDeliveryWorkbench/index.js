/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/*
 * @Description: 发货工作台
 * @Date: 2021-12-09 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useState, useCallback, useMemo } from 'react';
import { Menu, Layout, Tabs, Spin } from 'choerodon-ui';
import { DataSet, Icon, Button, Modal, Tooltip } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { compose, isEmpty, isNil } from 'lodash';
import { connect } from 'dva';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import withProps from 'utils/withProps';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
// import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import {
  menuChange,
  queryTabCount,
  queryNodeTitle,
  queryCountList,
} from '@/services/DeliveryWorkbenchServices';
import { SRM_SLOD } from '_utils/config';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { useDoubleUomConfig } from '@/routes/components/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import labelIcon from '@/assets/icon/labelIcon.svg';
import asnIcon from '@/assets/icon/asnIcon.svg';
import planIcon from '@/assets/icon/planIcon.svg';
import uniqueLabelIcon from '@/assets/icon/uniqueLabelIcon.svg';
import CommonImport from 'hzero-front/lib/components/Import';
import { resetSearchBarCache } from 'srm-front-boot/lib/components/SearchBarTable/util/cache';
import { getActiveTabKey, closeTab } from 'utils/menuTab';
import remoteFun from 'hzero-front/lib/utils/remote';
import {
  idMapList,
  // btnNumber,
  textRender,
  getColumns,
  renderColor,
  deleteCache,
  getCustomize,
  tableViewList,
  searchBarCode,
  rightBarTable,
  handleOffList,
  creationButton,
  handlePrintList,
  handleCloseList,
  unitCodeMapList,
  handleDeleteList,
  handleSubmitList,
  handleAffirmList,
  handleRecallList,
  handleExportList,
  handleCancelChangeList,
  handleExecutionRecord,
} from './globalFunction';
import QueryField from '@/routes/components/QueryField';
import { dateRangeTransform } from '@/utils/utils';
import SearchBarGlobal from './components/SearchBarGlobal/index';
import { createDS } from './ColumnsAndDs/creatIndexDS';
import { submitDS } from './ColumnsAndDs/submitIndexDS';
import { affirmDS } from './ColumnsAndDs/affirmIndexDS';
import { allDS } from './ColumnsAndDs/allIndexDS';
import CountMenu from '@/routes/components/Count';
import ItemButton from './components/ItemCreateModal';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();

const { Sider } = Layout;

const { TabPane } = Tabs;

const IndexMenu = (props) => {
  const { history, doubleUnitEnabled, user = {}, remote } = props;
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig = 0, // 是否开启了新主题
  } = themeConfigVO;
  const tableRef = React.useRef({});
  const [menuLoading, useMenuLoading] = useState(true); // 菜单加载loading
  const [heightMenu, useHeight] = useState(0); // 设置初始菜单高度
  const [waitCustomize, setWaitCustomize] = useState(false);
  const [composite, useComposite] = useState({
    // 综合参数
    history,
    focus: false, // 搜索框选中状态
    collapsed: false, // 设置菜单初始折叠参数
    dataPool: null, // 数据池状态下Tabs栏切换状态
    nodeTitle: null,
    hdKey: props?.tableConfigRef?.hdKey || 'left', // 单/行栏切换状态
    tabKey: props?.tableConfigRef?.tabKey || 'create', // Tabs栏切换状态
    menuMarkId: props?.tableConfigRef?.nodeConfigId || null, // 菜单默认进入
    summarization: props?.tableConfigRef?.nodeTemplateCode || 'ASN', // 数据池获取类型
    customizeCode: props?.tableConfigRef?.customizeCode || null, // 个性化单元组
    permissionTabList: props?.tableConfigRef?.permissionTabList || [],
    doubleUnitEnabled,
    currentUnitCode: props?.tableConfigRef?.currentUnitCode || '',
  });
  const [menuTab, useMenuTab] = useState({
    // 菜单tab综合数据
    dateColumn: [], // 菜单数据
    dateColumns: [], // 渲染数据
    textParams: {
      planStartDate: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
      planDatePeriod: 7,
      planDateTimeDimension: 'PLAN',
      quantityDimension: '1',
    },
    menuList: props?.tableConfigRef?.menuTabList || [], // 菜单数据
  });

  // 非看板状态下tab数量
  const [countList, useCount] = useState({
    creatCount: 0,
    submitCount: 0,
    afformCount: 0,
    allCount: 0,
  });

  // 菜单节点计数用 不可用于渲染节点，只可用于计数
  const [countMenu, setCountMenu] = useState([]);

  // 根据dataPool、menuMarkId、tabKey生成dataSet和columns
  useMemo(() => {
    const { hdKey, summarization } = composite;
    const code = ((props.tableConfigRef.nodeTemplateCode || summarization) === 'UNIQUE_LABEL'
      ? 'LABEL'
      : props.tableConfigRef.nodeTemplateCode || summarization
    )?.toLowerCase();
    // init标记用来限制dataSet的查询时机
    props.tableConfigRef.init = true;
    if (props.tableConfigRef.page === 'detail') {
      props.tableConfigRef.page = 'list';
      return;
    }
    if (!props.tableConfigRef.cache) {
      // 每次tab和menu切换，dataSet重新生成
      props.tableConfigRef.dataSet = {
        ...props.tableConfigRef.dataSet,
        create: new DataSet(createDS(`${code}LineId`, code?.toUpperCase(), doubleUnitEnabled)),
      };
      props.tableConfigRef.dataSet = {
        ...props.tableConfigRef.dataSet,
        submit_left: new DataSet(submitDS(`${code}HeaderId`, code?.toUpperCase(), 'left')),
        submit_right: new DataSet(
          submitDS(`${code}LineId`, code?.toUpperCase(), 'right', doubleUnitEnabled)
        ),
      };
      props.tableConfigRef.dataSet = {
        ...props.tableConfigRef.dataSet,
        affirm_left: new DataSet(
          affirmDS(
            `${code}HeaderId`,
            code?.toUpperCase(),
            'left',
            doubleUnitEnabled,
            composite.menuMarkId
          )
        ),
        affirm_right: new DataSet(
          affirmDS(
            `${code}LineId`,
            code?.toUpperCase(),
            'right',
            doubleUnitEnabled,
            composite.menuMarkId
          )
        ),
      };
      props.tableConfigRef.dataSet = {
        ...props.tableConfigRef.dataSet,
        all_left: new DataSet(
          allDS(
            `${code}HeaderId`,
            code?.toUpperCase(),
            'left',
            doubleUnitEnabled,
            composite.menuMarkId
          )
        ),
        all_right: new DataSet(
          allDS(
            `${code}LineId`,
            code?.toUpperCase(),
            'right',
            doubleUnitEnabled,
            composite.menuMarkId
          )
        ),
        all_date: new DataSet(
          allDS(
            `${code}HeaderId`,
            code?.toUpperCase(),
            'date',
            doubleUnitEnabled,
            composite.menuMarkId
          )
        ),
      };
      props.tableConfigRef.dataSet = {
        ...props?.tableConfigRef?.dataSet,
        ...(remote
          ? remote?.process('SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_PROCESS_LIST_DATASET', null, {
              composite,
              props,
            })
          : {}),
      };
      // getColumns内需要去除所有的title，否则影响个性化，同字段不同名的场景在上面的createDS等函数内处理好.
      // props.tableConfigRef用来在跳转到详情页时打开缓存标记，从而在返回时保留跳转前的tableConfigRef.
      if (hdKey !== 'date') {
        props.tableConfigRef.columns = getColumns(composite, props);
      }
      if (hdKey === 'date') {
        const columns = getColumns(composite, props);
        useMenuTab({ ...menuTab, dateColumns: columns });
      }
    } else props.tableConfigRef.cache = false;
  }, [composite.menuMarkId]);

  useEffect(() => {
    try {
      const divMenu = document?.getElementById('supplierMenuId');
      const h = divMenu?.clientHeight;
      useHeight(h);
    } catch (e) {
      // console.log(e);
    }
    menuChangeQuery();
  }, []);

  const executeQuery = useCallback(() => {
    const { init, allowQuery, dataSet } = props.tableConfigRef;
    // 筛选器调整：增加queryStatus
    if (init && allowQuery && dataSet[composite.tabKey]?.getState('queryStatus') === 'ready') {
      clearTimeout(executeQuery.timer);
      // dataSet[composite.tabKey].query();
    } else {
      executeQuery.timer = setTimeout(() => {
        executeQuery();
      }, 200);
    }
  }, [props.tableConfigRef.dataSet]);

  useEffect(() => {
    // dataSet变更触发一次查询，如果存在轮询的query调用，先清除
    clearTimeout(executeQuery.timer);
    executeQuery();
    return () => clearTimeout(executeQuery.timer);
  }, []);

  useEffect(() => {
    if (composite.hdKey === 'date') {
      textQueryChange({
        ...menuTab.textParams,
        itemGroupViewFlag: props?.tableConfigRef?.itemGroupViewFlag, // 按物料和日期汇总
      });
    }
  }, [composite.hdKey]);

  const textQueryChange = (ele) => {
    if (!isNil(composite.menuMarkId)) {
      queryNodeTitle({
        ...ele,
        campKey: 's',
        nodeConfigId: composite.menuMarkId,
        itemGroupViewFlag: ele?.itemGroupViewFlag ? 1 : 0,
      }).then((res) => {
        if (getResponse(res)) {
          const columnsNames = res || [];
          const { tabKey, hdKey, summarization, customizeCode } = composite;
          const params = {
            ...props.tableConfigRef.dataSet.all_date?.queryDataSet?.current?.toData(),
            ...ele,
            itemGroupViewFlag: ele?.itemGroupViewFlag ? 1 : 0,
          };
          const code = props.tableConfigRef.nodeTemplateCode || summarization;
          const custCuzCode = props.tableConfigRef.customizeCode || customizeCode;
          const unitCuzCode = unitCodeMapList(code, tabKey, hdKey, custCuzCode);
          columnsNames.forEach((item) => {
            const { fieldCode, fieldName, week } = item;
            props.tableConfigRef.dataSet.all_date.addField(fieldCode, {
              name: fieldCode,
              type: 'number',
              min: 0,
              label: `${fieldName}${week}`,
            });
          });
          props.tableConfigRef.dataSet.all_date.setQueryParameter('text', params);
          props.tableConfigRef.dataSet.all_date.setQueryParameter(
            'params',
            props.tableConfigRef.query
          );
          props.tableConfigRef.dataSet.all_date.setQueryParameter('customizeUnitCode', unitCuzCode);
          props.tableConfigRef.dataSet.all_date.setQueryParameter(
            'tplInfo',
            props.tableConfigRef.tplInfo
          );
          const nodeNolumns = getColumns(composite, props);
          const sliceColumns = ele?.itemGroupViewFlag
            ? [...nodeNolumns?.slice(0, -3), nodeNolumns?.at(-1), { name: 'itemQuantity' }]
            : nodeNolumns;
          const newColumn = [];
          columnsNames.forEach((item) => {
            const { fieldCode } = item;
            const _object = {
              name: fieldCode,
              width: 130,
              // TODO: renderer 遍历导致页面重复渲染！！！！
              onCell: ({ record, column }) => renderColor(record, column, fieldCode),
              // TODO: renderer 遍历导致页面重复渲染！！！！
              renderer: ({ value, record }) => textRender(value, record, fieldCode, ele),
            };
            newColumn.push(_object);
          });
          const column = sliceColumns.concat(newColumn);
          useMenuTab({ ...menuTab, dateColumn: res, dateColumns: column });
          props.tableConfigRef.dataSet.all_date.query();
        }
      });
    }
  };

  /**
  /**
   * 菜单数据查询
   * */
  const menuChangeQuery = async () => {
    loadingFlag(true);
    deleteCache(composite.tabKey, props);
    try {
      const res = await menuChange({ campKey: 's' });
      if (getResponse(res)) {
        if (Array.isArray(res) && res[0]?.noPermissionTabFlag === 1) {
          return Modal.confirm({
            okCancel: false,
            contentStyle: { width: '550px' },
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <span style={{ fontSize: 14 }}>
                {intl
                  .get('slod.deliveryWorkbench.view.title.nodeTips')
                  .d('当前角色未分配任何节点权限，请联系管理员进行节点权限维护；')}
              </span>
            ),
            okText: intl.get('hzero.common.button.sure').d('确定'),
            onOk: () => {
              const a = getActiveTabKey('/slod/delivery-workbench');
              closeTab(a);
            },
          });
        } else if (Array.isArray(res) && res.length === 0) {
          return Modal.confirm({
            okCancel: false,
            contentStyle: { width: '550px' },
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <span style={{ fontSize: 14 }}>
                {intl
                  .get('slod.deliveryWorkbench.view.title.SupplierTips')
                  .d('未配置发货节点，暂无可查询节点及数据，请联系采购方进行节点维护')}
              </span>
            ),
            okText: intl.get('hzero.common.button.sure').d('确定'),
            onOk: () => {
              const a = getActiveTabKey('/slod/delivery-workbench');
              closeTab(a);
            },
          });
        } else {
          // 后端无法优化 menuChange 接口查询速率 拆分两个接口 分别加载节点和数量
          const key = res.map((item) => item.nodeTemplateCode)[0] || null;
          const customizeCode = res.map((item) => item.customerUnitCode)[0] || null;
          const id = res.map((item) => item.nodeConfigId)[0] || null;
          const title = res.map((item) => item.nodeConfigName)[0] || null;
          const nodeTemplateCode = props.tableConfigRef.nodeTemplateCode || key;
          const hdKey = ['PLAN'].includes(nodeTemplateCode)
            ? props.tableConfigRef.hdKey || 'right'
            : props.tableConfigRef.hdKey || 'left';
          const tabKey = props.tableConfigRef.tabKey || res[0].permissionTabList[0];
          props.tableConfigRef.query = {
            hdKey,
            campKey: 's',
            nodeTemplateCode: props.tableConfigRef.nodeTemplateCode || key,
            nodeConfigId: props.tableConfigRef.nodeConfigId || id,
          };
          props.tableConfigRef.hdKey = hdKey;
          props.tableConfigRef.menuTabList = res;
          props.tableConfigRef.customizeCode = props.tableConfigRef.customizeCode || customizeCode;
          props.tableConfigRef.allowQuery = true;
          useMenuTab({
            ...menuTab,
            // menuList: res
            menuList: remote
              ? remote.process('SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_PROCESS_MENU_LIST', res, {})
              : res,
          });
          useComposite({
            ...composite,
            hdKey,
            nodeTitle: title,
            permissionTabList: res[0].permissionTabList,
            menuMarkId: props.tableConfigRef.nodeConfigId || id,
            summarization: props.tableConfigRef.nodeTemplateCode || key,
            tabKey: remote
              ? remote.process('SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_PROCESS_TAB_KEY', tabKey, {
                  menuTab,
                  composite,
                  props,
                })
              : tabKey,
            customizeCode: props.tableConfigRef.customizeCode || customizeCode,
          });
          loadingFlag(false);
          queryTabCountList({
            nodeConfigId: props.tableConfigRef.nodeConfigId || id,
            nodeTemplateCode: props.tableConfigRef.nodeTemplateCode || key,
          });
          queryCountList({ campKey: 's' }).then((e) => {
            if (getResponse(e)) {
              setCountMenu(e);
            }
          });
        }
      }
    } catch (e) {
      throw e;
    } finally {
      loadingFlag(false);
    }
  };

  // tab 切换时 切换对应的 columns
  useEffect(() => {
    const { tabKey, hdKey, customizeCode, summarization } = composite;
    const code = props.tableConfigRef.nodeTemplateCode || summarization;
    const custCuzCode = props.tableConfigRef.customizeCode || customizeCode;
    const unitCuzCode = unitCodeMapList(code, tabKey, hdKey, custCuzCode);
    props.tableConfigRef.currentUnitCode = unitCuzCode;
    useComposite({ ...composite, currentUnitCode: unitCuzCode });
    if (composite.hdKey !== 'date') {
      props.tableConfigRef.columns = getColumns(composite, props);
    }
    if (composite.hdKey === 'date') {
      const columns = getColumns(composite, props);
      useMenuTab({ ...menuTab, dateColumns: columns });
    }
    // eslint-disable-next-line guard-for-in
    for (const key in props.tableConfigRef.dataSet) {
      props.tableConfigRef.dataSet[key].setQueryParameter('text', menuTab.textParams);
      props.tableConfigRef.dataSet[key].setQueryParameter('params', props.tableConfigRef.query);
      props.tableConfigRef.dataSet[key].setQueryParameter('customizeUnitCode', unitCuzCode);
      props.tableConfigRef.dataSet[key].setQueryParameter('tplInfo', props.tableConfigRef.tplInfo);
    }
  }, [composite.menuMarkId, composite.tabKey, composite.hdKey]);

  /**
   * 查询tab列表
   * @key tab栏状态 str
   * @_object 查询参数对象 {}
   * @cut 按行/按单查询 默认 null
   * */
  const queryList = useCallback(
    (_object, key, cut) => {
      props.tableConfigRef.query = {
        campKey: 's',
        nodeTemplateCode: props.tableConfigRef.nodeTemplateCode || _object.summarization,
        nodeConfigId: props.tableConfigRef.nodeConfigId || _object.menuMarkId,
        hdKey: ['submit', 'affirm', 'all'].includes(key) ? cut || composite.hdKey : 'left',
      };
    },
    [
      composite.tabKey,
      composite.menuMarkId,
      composite.hdKey,
      props.custLoading,
      composite.summarization,
    ]
  );

  // 页面loading
  const loadingFlag = (type) => {
    useMenuLoading(type); // loading
  };

  const collapsedChange = (type) => {
    useComposite({ ...composite, collapsed: type });
  };

  /**
   * 行单切换
   * @obj _object
   * */
  const cutChange = (key) => {
    setWaitCustomize(true);
    props.tableConfigRef.hdKey = key;
    useComposite({ ...composite, hdKey: key });
    queryList(composite, composite.tabKey, key);
    setTimeout(() => setWaitCustomize(false));
  };

  /**
   * TAB切换
   * @key key
   * */
  const tabsOnchange = (key) => {
    setWaitCustomize(true);
    const hdKey =
      ['PLAN'].includes(composite.summarization) && ['all'].includes(key) ? 'right' : 'left';
    const newComposite = { ...composite, tabKey: key, hdKey };
    props.tableConfigRef.tabKey = key;
    props.tableConfigRef.hdKey = hdKey;
    useComposite(newComposite);
    queryList({ ...composite, tabKey: key }, key, hdKey);
    setTimeout(() => setWaitCustomize(false));
  };

  /**
   * 菜单切换
   * @obj _object
   * */
  const menuClick = (_object) => {
    setWaitCustomize(true);
    // const { inputRef, queryRef } = tableRef?.current;
    const {
      nodeConfigId,
      nodeConfigName,
      nodeTemplateCode,
      cuszDocTmplCode,
      customerUnitCode,
      permissionTabList,
    } = _object;
    const obj = {
      cuszDocTmplCode,
      permissionTabList,
      menuMarkId: nodeConfigId,
      nodeTitle: nodeConfigName,
      summarization: nodeTemplateCode,
      customizeCode: customerUnitCode,
    };
    const custPacket = composite?.customizeCode?.split('__');
    const custPacketAfter = custPacket.pop();
    const newCustPacket = `SLOD.SUPPLIER.DELIVERY__${custPacketAfter}`;
    setTimeout(
      () =>
        [
          `${newCustPacket}.SEARCH.CREATE`,
          `${newCustPacket}.SEARCH.SUBMIT`,
          `${newCustPacket}.SEARCH.AFFIRM_D`,
          `${newCustPacket}.SEARCH.AFFIRM_H`,
          `${newCustPacket}.SEARCH.ALL_D`,
          `${newCustPacket}.SEARCH.ALL_H`,
          `${newCustPacket}.SEARCH.ALL_R`,
        ].forEach((item) => {
          resetSearchBarCache(item);
        }),
      100
    );
    const tabCut = remote
      ? remote.process(
          'SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_PROCESS_TAB_CUT',
          permissionTabList[0],
          {
            menuTab,
            composite,
            props,
            _object,
          }
        )
      : permissionTabList[0];
    const hdKey =
      ['PLAN'].includes(nodeTemplateCode) && ['all'].includes(tabCut) ? 'right' : 'left';
    // 更改缓存标记cache，当节点切换时重新new ds
    props.tableConfigRef.cache = false;
    props.tableConfigRef.tabKey = tabCut;
    props.tableConfigRef.hdKey = hdKey;
    props.tableConfigRef.nodeConfigId = nodeConfigId;
    props.tableConfigRef.customizeCode = customerUnitCode;
    props.tableConfigRef.nodeTemplateCode = nodeTemplateCode;
    props.tableConfigRef.permissionTabList = permissionTabList;
    useComposite({ ...composite, ...obj, tabKey: tabCut, hdKey }, false);
    queryList(obj, tabCut, hdKey);
    queryTabCountList(_object);
    // if (inputRef.current && queryRef.current) {
    //   queryRef.current.handleCleanFilter();
    //   inputRef.current.handleClear();
    // }
    setTimeout(() => setWaitCustomize(false));
  };

  /**
   * 查询tab栏数据展示
   * @queryTabCount tab栏查询 fun
   * */
  const queryTabCountList = async (_object) => {
    // 清空上个节点count数
    useCount({
      creatCount: '',
      submitCount: '',
      afformCount: '',
      allCount: '',
    });
    const { nodeConfigId, nodeTemplateCode } = _object;
    const code = props.tableConfigRef.query.nodeTemplateCode || nodeTemplateCode;
    const id = props.tableConfigRef.query.nodeConfigId || nodeConfigId;
    // 优化请求，使用Promise.all可以缩短时间
    const res = await Promise.all([
      queryTabCount({
        nodeTemplateCode: code,
        nodeConfigId: id,
        tabKey: 'create',
        campKey: 's',
      }),
      queryTabCount({
        nodeTemplateCode: code,
        nodeConfigId: id,
        tabKey: 'submit',
        campKey: 's',
      }),
      queryTabCount({
        nodeTemplateCode: code,
        nodeConfigId: id,
        tabKey: 'affirm',
        campKey: 's',
      }),
      queryTabCount({
        nodeTemplateCode: code,
        nodeConfigId: id,
        tabKey: 'all',
        campKey: 's',
      }),
    ]);
    // 如果接口返回的节点和当前页面选择的节点一致就修改 tab 数量
    if (res && res.length && res[0]?.nodeConfigId === id) {
      useCount({
        creatCount: res[0]?.currentTotal !== 0 ? res[0]?.currentTotal : '0',
        submitCount: res[1]?.currentTotal !== 0 ? res[1]?.currentTotal : '0',
        afformCount: res[2]?.currentTotal !== 0 ? res[2]?.currentTotal : '0',
        allCount: res[3]?.currentTotal !== 0 ? res[3]?.currentTotal : '0',
      });
    }
  };

  const iconType = (code) => {
    if (code === 'LABEL') {
      return (
        <img
          className={styles[!composite.collapsed ? 'icon-open' : 'icon-off']}
          src={labelIcon}
          alt="img"
        />
      );
    } else if (code === 'PLAN') {
      return (
        <img
          className={styles[!composite.collapsed ? 'icon-open' : 'icon-off']}
          src={planIcon}
          alt="img"
        />
      );
    } else if (code === 'ASN') {
      return (
        <img
          className={styles[!composite.collapsed ? 'icon-open' : 'icon-off']}
          src={asnIcon}
          alt="img"
        />
      );
    } else {
      return (
        <img
          className={styles[!composite.collapsed ? 'icon-open' : 'icon-off']}
          src={uniqueLabelIcon}
          alt="img"
        />
      );
    }
  };

  /**
   * 按钮合集
   * @obj _object
   * */
  const HeaderBtns = observer(({ dataSet }) => {
    const { summarization, tabKey, hdKey, customizeCode, menuMarkId } = composite;
    const { customizeBtnGroup } = props;
    const id = idMapList(summarization, tabKey, hdKey);
    const code = props.tableConfigRef.nodeTemplateCode || summarization;
    const unitCuzCode = unitCodeMapList(code, tabKey, hdKey, customizeCode);
    const queryParamsDate = filterNullValueObject({
      ...dataSet?.queryParameter.params,
      ...dataSet?.queryParameter?.text,
      ...dataSet?.queryDataSet?.toData()[0],
      exportSearchbarUnitCode: searchBarCode(composite),
    });
    const parameter = {
      dataSet,
      history,
      composite,
      unitCuzCode,
      campKey: 's',
      queryParamsDate,
      loadingFlag,
      queryTabCountList,
    };
    const headerOrLine = hdKey === 'left' ? 'header' : 'line';
    const templateCode = `SLOD.${code}.BATCH_IMPORT`;
    const templateNode = code === 'UNIQUE_LABEL' ? 'label' : code?.toLowerCase();
    const selectedRecords = dataSet?.selected?.map((item) => item.toData());
    const ids = selectedRecords?.map((item) => item[id]);
    const queryParams = {
      campKey: 's',
      ...queryParamsDate,
      deliveryHeaderIdSet: hdKey === 'left' && tabKey !== 'create' ? ids : [],
      deliveryLineIdSet: hdKey === 'right' || tabKey === 'create' ? ids : [],
    };
    const hdStr = hdKey.toUpperCase();
    const getPrintProData = () => {
      if (isEmpty(dataSet?.selected)) {
        return [];
      }
      const list = dataSet?.selected.map((item) => {
        if (composite.summarization === 'ASN') {
          return item?.get('asnHeaderId');
        } else if (composite.summarization === 'PLAN' && composite.hdKey === 'left') {
          return item?.get('planHeaderId');
        } else if (composite.hdKey === 'left') {
          return {
            labelHeaderId: item?.get('labelHeaderId'),
          };
        } else {
          return {
            labelHeaderId: item?.get('labelHeaderId'),
            labelLineId: item?.get('labelLineId'),
          };
        }
      });
      return list;
    };
    const btnArr = [
      {
        name: 'instantly',
        child: intl.get('slod.deliveryWorkbench.view.title.selectCreate').d('勾选新建'),
        btnProps: {
          disabled: isEmpty(dataSet?.selected),
          onClick: () => creationButton({ type: 'select', ...parameter }, props),
        },
      },
      {
        name: 'all',
        child: intl.get('hzero.common.model.allCreate').d('全选新建'),
        btnProps: {
          disabled: !dataSet?.length,
          onClick: () => creationButton({ type: 'all', ...parameter }, props),
        },
      },
      {
        name: 'itemAll',
        child: (name) =>
          name || intl.get('slod.deliveryWorkbench.view.title.itemAll').d('按物料汇总新建'),
        btnComp: ItemButton,
        hidden: code !== 'PLAN',
        btnProps: {
          dataSet,
          history,
          campKey: 's',
          btnParams: props,
          disabled: isEmpty(dataSet?.selected),
          buttonProps: { funcType: 'link' },
          btnText: intl.get('slod.deliveryWorkbench.view.title.itemAll').d('按物料汇总新建'),
        },
      },
    ];
    const button = {
      create: [
        {
          name: 'create',
          group: true,
          children: btnArr,
          child: (name) => {
            return (
              (
                <Button
                  style={{ border: 'none', color: '#FFF' }}
                  loading={menuLoading}
                  color="primary"
                  icon="add"
                  type="c7n-pro"
                >
                  {name || intl.get('hzero.common.button.creat').d('新建')}
                  <Icon type="expand_more" style={{ marginLeft: 4 }} />
                </Button>
              ) || <span style={{ display: 'none' }} />
            );
          },
        },
        {
          name: 'common-import',
          hidden: !['PLAN', 'ASN'].includes(code),
          child: (name) =>
            name || intl.get(`slod.deliveryWorkbench.model.common.newImport`).d('新版导入'),
          childFor: 'buttonText',
          btnComp: CommonImport,
          btnProps: {
            buttonProps: {
              icon: 'archive',
              type: 'c7n-pro',
              funcType: 'flat',
            },
            refreshButton: true,
            prefixPatch: SRM_SLOD,
            args: {
              tenantId,
              campKey: 's',
              templateCode,
              nodeConfigId: menuMarkId,
              customizeUnitCode: unitCuzCode,
            },
            buttonText: intl.get(`slod.deliveryWorkbench.model.common.newImport`).d('新版导入'),
            businessObjectTemplateCode: templateCode,
            successCallBack: () => dataSet.query(),
          },
        },
        {
          name: 'new-import',
          child: (name) =>
            isEmpty(dataSet?.selected)
              ? name || intl.get(`slod.deliveryWorkbench.model.common.newExport`).d('导出')
              : name ||
                intl.get(`slod.deliveryWorkbench.model.common.newCheckExport`).d('勾选导出'),
          btnComp: ExcelExportPro,
          childFor: 'buttonText',
          btnProps: {
            allBody: true,
            method: 'POST',
            templateCode: `SLOD_${code}_WAIT_CREATE_SUPPLIER_EXPORT`,
            queryParams,
            requestUrl: `${SRM_SLOD}/v1/${tenantId}/delivery/${templateNode}/${menuMarkId}/wait-create/line/export?campKey=s`,
            buttonText: isEmpty(dataSet?.selected)
              ? intl.get(`slod.deliveryWorkbench.model.common.newExport`).d('导出')
              : intl.get(`slod.deliveryWorkbench.model.common.newCheckExport`).d('勾选导出'),
            otherButtonProps: {
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
            },
          },
        },
        {
          name: 'batch-import',
          hidden: !['PLAN', 'ASN'].includes(code),
          child: (name) => {
            return (
              <Tooltip
                placement="bottom"
                title={
                  code === 'PLAN'
                    ? intl
                        .get('hzero.common.viewTitle.importTip')
                        .d('支持按物料维度导入计划数据（仅限新增）')
                    : intl
                        .get(`slod.deliveryWorkbench.model.common.asnImportTip`)
                        .d('支持按物料维度导入送货数据（仅限新增）')
                }
              >
                {name ||
                  intl.get(`slod.deliveryWorkbench.model.common.batchImport`).d('物料批量导入')}
              </Tooltip>
            );
          },
          childFor: 'buttonText',
          btnComp: CommonImport,
          btnProps: {
            buttonProps: {
              icon: 'archive',
              type: 'c7n-pro',
              funcType: 'flat',
            },
            refreshButton: true,
            prefixPatch: SRM_SLOD,
            args: {
              tenantId,
              campKey: 's',
              templateCode: `SLOD.${code}.BY_ITEM_BATCH_IMPORT`,
              nodeConfigId: menuMarkId,
              customizeUnitCode: unitCuzCode,
            },
            buttonText: () => {
              return (
                <Tooltip
                  placement="bottom"
                  title={intl
                    .get('hzero.common.viewTitle.importTip')
                    .d('支持按物料维度导入计划数据（仅限新增）')}
                >
                  {intl.get(`slod.deliveryWorkbench.model.common.batchImport`).d('物料批量导入')}
                </Tooltip>
              );
            },
            businessObjectTemplateCode: `SLOD.${code}.BY_ITEM_BATCH_IMPORT`,
            successCallBack: () => dataSet.query(),
          },
        },
        {
          name: 'common-import',
          hidden: !['LABEL'].includes(code),
          child: (name) => {
            return (
              <Tooltip
                placement="bottom"
                title={intl
                  .get('slod.deliveryWorkbench.model.common.importNewTip')
                  .d('按物料维度导入计划数据（全量成功或失败）')}
              >
                {name || intl.get(`slod.deliveryWorkbench.model.common.newImport`).d('新版导入')}
              </Tooltip>
            );
          },
          childFor: 'buttonText',
          btnComp: CommonImport,
          btnProps: {
            buttonProps: {
              icon: 'archive',
              type: 'c7n-pro',
              funcType: 'flat',
            },
            refreshButton: true,
            prefixPatch: SRM_SLOD,
            args: {
              campKey: 's',
              tenantId,
              templateCode: 'SLOD.LABEL.BATCH_IMPORT',
              nodeConfigId: menuMarkId,
              customizeUnitCode: unitCuzCode,
            },
            buttonText: () => {
              return (
                <Tooltip
                  placement="bottom"
                  title={intl
                    .get('slod.deliveryWorkbench.model.common.importNewTip')
                    .d('按物料维度导入计划数据（全量成功或失败）')}
                >
                  {intl.get(`slod.deliveryWorkbench.model.common.newImport`).d('新版导入')}
                </Tooltip>
              );
            },
            businessObjectTemplateCode: 'SLOD.LABEL.BATCH_IMPORT',
            successCallBack: () => dataSet.query(),
          },
        },
        {
          name: 'executionRecord',
          child: (name) =>
            name ||
            intl.get('slod.deliveryWorkbench.model.common.executionRecord').d('异步执行记录'),
          btnProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'operation_service_request',
            onClick: () => handleExecutionRecord(parameter),
          },
        },
      ],
      submit: [
        {
          name: 'submit',
          hidden: composite.hdKey !== 'left',
          child: (name) => name || intl.get('hzero.common.button.submit').d('提交'),
          btnProps: {
            color: 'primary',
            icon: 'check',
            type: 'c7n-pro',
            loading: menuLoading,
            disabled: isEmpty(dataSet?.selected),
            onClick: () => handleSubmitList({ remote: props?.remote, ...parameter }),
          },
        },
        {
          name: 'delete',
          hidden: composite.hdKey !== 'left',
          child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
          btnProps: {
            icon: 'delete_sweep',
            type: 'c7n-pro',
            funcType: 'flat',
            loading: menuLoading,
            onClick: () => handleDeleteList(parameter),
            disabled: isEmpty(dataSet?.selected),
          },
        },
        {
          name: 'new-import',
          hidden: !(['PLAN'].includes(code) && composite.hdKey === 'right'),
          btnComp: ExcelExportPro,
          child: (name) =>
            isEmpty(dataSet?.selected)
              ? name || intl.get(`slod.deliveryWorkbench.model.common.newExport`).d('导出')
              : name ||
                intl.get(`slod.deliveryWorkbench.model.common.newCheckExport`).d('勾选导出'),
          childFor: 'buttonText',
          btnProps: {
            allBody: true,
            method: 'POST',
            templateCode: 'SLOD_PLAN_WAIT_SUBMIT_LINE_SUPPLIER_EXPORT',
            queryParams,
            requestUrl: `${SRM_SLOD}/v1/${tenantId}/delivery/${templateNode}/${menuMarkId}/wait-submit/${headerOrLine}/export?campKey=s`,
            buttonText: isEmpty(dataSet?.selected)
              ? intl.get(`slod.deliveryWorkbench.model.common.newExport`).d('导出')
              : intl.get(`slod.deliveryWorkbench.model.common.newCheckExport`).d('勾选导出'),
            otherButtonProps: {
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
            },
          },
        },
      ],
      affirm: [
        {
          name: 'affirm',
          child: (name) => name || intl.get('slod.deliveryWorkbench.model.view.affirm').d('确认'),
          btnProps: {
            color: 'primary',
            icon: 'check',
            type: 'c7n-pro',
            loading: menuLoading,
            disabled: isEmpty(dataSet?.selected),
            onClick: () => handleAffirmList(parameter),
          },
        },
        {
          name: 'close',
          child: (name) => name || intl.get('slod.deliveryWorkbench.model.view.close').d('拒绝'),
          btnProps: {
            icon: 'close',
            type: 'c7n-pro',
            funcType: 'flat',
            loading: menuLoading,
            disabled: isEmpty(dataSet?.selected),
            onClick: () => handleCloseList(parameter),
          },
        },
        {
          name: 'common-import',
          hidden: !['PLAN'].includes(code),
          child: (name) =>
            name || intl.get(`slod.deliveryWorkbench.model.common.newImport`).d('新版导入'),
          childFor: 'buttonText',
          btnComp: CommonImport,
          btnProps: {
            buttonProps: {
              icon: 'archive',
              type: 'c7n-pro',
              funcType: 'flat',
            },
            refreshButton: true,
            prefixPatch: SRM_SLOD,
            args: {
              campKey: 's',
              tenantId,
              templateCode: 'SLOD.PLAN.BATCH_IMPORT_FEEDBACK',
              nodeConfigId: menuMarkId,
              customizeUnitCode: unitCuzCode,
            },
            buttonText: intl.get(`slod.deliveryWorkbench.model.common.newImport`).d('新版导入'),
            businessObjectTemplateCode: 'SLOD.PLAN.BATCH_IMPORT_FEEDBACK',
            successCallBack: () => dataSet.query(),
          },
        },
        {
          name: 'new-import',
          hidden: !['PLAN'].includes(code),
          btnComp: ExcelExportPro,
          child: (name) =>
            isEmpty(dataSet?.selected)
              ? name || intl.get(`slod.deliveryWorkbench.model.common.newExport`).d('导出')
              : name ||
                intl.get(`slod.deliveryWorkbench.model.common.newCheckExport`).d('勾选导出'),
          childFor: 'buttonText',
          btnProps: {
            allBody: true,
            method: 'POST',
            templateCode:
              hdKey === 'left'
                ? 'SLOD_PLAN_WAIT_CONFIRM_HEADER_SUPPLIER_EXPORT'
                : 'SLOD_PLAN_WAIT_CONFIRM_LINE_SUPPLIER_EXPORT',
            queryParams,
            requestUrl: `${SRM_SLOD}/v1/${tenantId}/delivery/${templateNode}/${menuMarkId}/wait-confirm/${headerOrLine}/export?campKey=s`,
            buttonText: isEmpty(dataSet?.selected)
              ? intl.get(`slod.deliveryWorkbench.model.common.newExport`).d('导出')
              : intl.get(`slod.deliveryWorkbench.model.common.newCheckExport`).d('勾选导出'),
            otherButtonProps: {
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
            },
          },
        },
        {
          name: 'cancelChange',
          child: (name) =>
            name || intl.get('slod.deliveryWorkbench.model.view.cancelChanges').d('撤销变更'),
          hidden:
            ['LABEL', 'UNIQUE_LABEL'].includes(composite.summarization) ||
            composite.hdKey === 'right',
          btnProps: {
            icon: 'reply',
            type: 'c7n-pro',
            funcType: 'flat',
            loading: menuLoading,
            disabled: isEmpty(dataSet?.selected),
            onClick: () => handleCancelChangeList(parameter),
          },
        },
      ],
      all: [
        (composite.summarization === 'LABEL' ||
          composite.summarization === 'UNIQUE_LABEL' ||
          (composite.summarization === 'ASN' && composite.hdKey === 'left')) && {
          name: 'print',
          child: (name) => name || intl.get('slod.deliveryWorkbench.model.view.print').d('打印'),
          btnComp: PermissionButton,
          btnProps: {
            color: 'primary',
            icon: 'print',
            type: 'c7n-pro',
            // funcType: 'flat',
            loading: menuLoading,
            disabled: isEmpty(dataSet?.selected),
            onClick: () => handlePrintList(parameter),
          },
        },
        (composite.summarization === 'LABEL' ||
          composite.summarization === 'UNIQUE_LABEL' ||
          (composite.summarization === 'ASN' && composite.hdKey === 'left')) && {
          name: 'printNew',
          child: (name) =>
            name || intl.get('slod.deliveryWorkbench.model.view.printNews').d('打印（新）'),
          btnComp: PrintProButton,
          childFor: 'buttonText',
          btnProps: {
            buttonProps: {
              color: 'primary',
              icon: 'print',
              type: 'c7n-pro',
              // funcType: 'flat',
              disabled: isEmpty(dataSet?.selected),
            },
            requestUrl: `${SRM_SLOD}/v1/${getCurrentOrganizationId()}/delivery/${
              composite.summarization === 'ASN' ? 'asn' : 'label'
            }/batch-print-token?campKey=s`,
            method: 'POST',
            data: getPrintProData,
            buttonText: intl.get('slod.deliveryWorkbench.model.view.printNews').d('打印（新）'),
          },
        },
        {
          name: 'off',
          hidden: composite.hdKey === 'date',
          child: (name) => name || intl.get('slod.deliveryWorkbench.model.view.off').d('关闭'),
          btnProps: {
            icon: 'not_interested',
            type: 'c7n-pro',
            funcType: 'flat',
            loading: menuLoading,
            disabled: isEmpty(dataSet?.selected),
            onClick: () => handleOffList(parameter),
          },
        },
        {
          name: 'recall',
          hidden: composite.hdKey !== 'left',
          child: (name) => name || intl.get('slod.deliveryWorkbench.model.view.recall').d('撤回'),
          btnProps: {
            icon: 'reply',
            type: 'c7n-pro',
            funcType: 'flat',
            loading: menuLoading,
            disabled: isEmpty(dataSet?.selected),
            onClick: () => handleRecallList(parameter),
          },
        },
        {
          name: 'new-import',
          btnComp: ExcelExportPro,
          hidden: composite.hdKey === 'date',
          child: (name) =>
            isEmpty(dataSet?.selected)
              ? name || intl.get(`slod.deliveryWorkbench.model.common.newExport`).d('导出')
              : name ||
                intl.get(`slod.deliveryWorkbench.model.common.newCheckExport`).d('勾选导出'),
          childFor: 'buttonText',
          btnProps: {
            allBody: true,
            method: 'POST',
            templateCode:
              headerOrLine === 'header'
                ? `SLOD_${code}_ALL_HEADER_SUPPLIER_EXPORT`
                : `SLOD_${code}_ALL_LINE_SUPPLIER_EXPORT`,
            queryParams,
            requestUrl: `${SRM_SLOD}/v1/${tenantId}/delivery/${templateNode}/${menuMarkId}/all/${headerOrLine}/export?campKey=s`,
            buttonText: isEmpty(dataSet?.selected)
              ? intl.get(`slod.deliveryWorkbench.model.common.newExport`).d('导出')
              : intl.get(`slod.deliveryWorkbench.model.common.newCheckExport`).d('勾选导出'),
            otherButtonProps: {
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
            },
          },
        },
        {
          name: 'replenishPrint',
          hidden: !(composite?.summarization === 'UNIQUE_LABEL' && composite?.hdKey === 'right'),
          child: (name) =>
            name || intl.get('slod.deliveryWorkbench.model.view.replenish').d('补打'),
          btnComp: PermissionButton,
          btnProps: {
            icon: 'print',
            type: 'c7n-pro',
            funcType: 'flat',
            loading: menuLoading,
            disabled: isEmpty(dataSet?.selected),
            onClick: () => handlePrintList(parameter, true),
          },
        },
        {
          name: 'export',
          hidden: composite.hdKey !== 'date',
          child: (name) =>
            isEmpty(dataSet?.selected)
              ? name || intl.get(`slod.deliveryWorkbench.model.common.export`).d('导出')
              : name || intl.get(`slod.deliveryWorkbench.model.common.checkExport`).d('勾选导出'),
          btnProps: {
            icon: 'export',
            type: 'c7n-pro',
            funcType: 'flat',
            loading: menuLoading,
            onClick: () => handleExportList({ ...parameter, textParams: menuTab.textParams }),
          },
        },
        composite.hdKey === 'left' &&
          composite.summarization === 'PLAN' && {
            name: 'printNew',
            child: (name) => name || intl.get('slod.deliveryWorkbench.model.view.print').d('打印'),
            btnComp: PrintProButton,
            childFor: 'buttonText',
            btnProps: {
              buttonProps: {
                disabled: isEmpty(dataSet?.selected),
                funcType: 'flat',
                loading: menuLoading,
              },
              requestUrl: `${SRM_SLOD}/v1/${getCurrentOrganizationId()}/delivery/plan/batch-print-token?campKey=s`,
              method: 'POST',
              data: getPrintProData,
              buttonText: intl.get('slod.deliveryWorkbench.model.view.print').d('打印'),
            },
          },
      ],
    };
    const buttons = remote
      ? remote.process('SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_HEADER_BTNS', button, {
          composite,
          dataSet,
        })
      : button;
    if (composite.tabKey === 'create') {
      return customizeBtnGroup(
        {
          code: `${customizeCode}.BTNS`,
          pro: true,
        },
        <DynamicButtons
          buttons={buttons?.create?.filter((i) => !i.hidden)}
          maxNum={5}
          defaultBtnType="c7n-pro"
        />
      );
    }
    if (composite.tabKey === 'submit') {
      return customizeBtnGroup(
        {
          code: composite.hdKey === 'left' && `${customizeCode}.BTN_SUBMIT`,
          pro: true,
        },
        <DynamicButtons buttons={buttons.submit} maxNum={5} defaultBtnType="c7n-pro" />
      );
    }
    if (composite.tabKey === 'affirm') {
      return customizeBtnGroup(
        {
          code: `${customizeCode}.BTN_AFFIRM.${hdStr}`,
          pro: true,
        },
        <DynamicButtons
          buttons={buttons.affirm}
          maxNum={5}
          defaultBtnType="c7n-pro"
          permissions={[
            {
              code:
                ['ASN'].includes(composite?.summarization) && ['left'].includes(composite.hdKey)
                  ? 'srm.logistics.delivery.supplier.work.bench.button.asn.cancelchange'
                  : ['PLAN'].includes(composite?.summarization) &&
                    ['left'].includes(composite.hdKey)
                  ? 'srm.logistics.delivery.supplier.work.bench.button.plan.cancelchange'
                  : '',
              name: 'cancelChange',
            },
          ]}
        />
      );
    }
    if (composite.tabKey === 'all') {
      return customizeBtnGroup(
        {
          code: `${customizeCode}.BTN_ALL.${hdStr}`,
          pro: true,
        },
        <DynamicButtons
          key={composite.summarization || composite.tabKey || composite.hdKey}
          buttons={buttons.all}
          maxNum={5}
          defaultBtnType="c7n-pro"
          permissions={[
            {
              code:
                ['ASN'].includes(composite?.summarization) && ['left'].includes(composite.hdKey)
                  ? 'srm.logistics.delivery.supplier.work.bench.ps.printnew'
                  : ['LABEL'].includes(composite?.summarization)
                  ? 'srm.logistics.delivery.supplier.work.bench.button.label.printnew'
                  : ['PLAN'].includes(composite?.summarization)
                  ? `srm.logistics.delivery.supplier.work.bench.button.list.printnew`
                  : 'srm.logistics.delivery.supplier.work.bench.button.unique.label.printnew',
              name: 'printNew',
            },
            {
              code: ['ASN'].includes(composite?.summarization)
                ? 'srm.logistics.delivery.supplier.work.bench.button.print'
                : ['LABEL'].includes(composite?.summarization)
                ? 'srm.logistics.delivery.supplier.work.bench.button.label.print'
                : 'srm.logistics.delivery.supplier.work.bench.button.unique.label.print',
              name: 'print',
            },
            {
              code: 'srm.logistics.delivery.supplier.work.bench.button.replenishprint',
              name: 'replenishPrint',
            },
          ]}
        />
      );
    }
    return remote
      ? remote.render('SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_RENDER_OTHER_TAB_BTN', null, {
          menuTab,
          composite,
          props,
          loadingFlag,
        })
      : null;
  });

  /**
   * tab展示数字
   * @obj _object
   * */
  const count = (key) => {
    let num;
    switch (key) {
      case 'create':
        num = countList.creatCount;
        break;
      case 'submit':
        num = countList.submitCount;
        break;
      case 'affirm':
        num = countList.afformCount;
        break;
      case 'all':
        num = countList.allCount;
        break;
      default:
        num = countList.creatCount;
        break;
    }
    return remote
      ? remote.process('SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_PROCESS_TABLE_NUM', num, { key })
      : num;
  };

  /**
   * 时间范围处理
   * @obj _object
   * */
  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'deliveryDataRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  };

  /**
   * 计划按日期开关
   * @flag flag
   * */
  const planTimer = (flag) => {
    props.tableConfigRef.itemGroupViewFlag = flag;
  };

  const searchCodeList = searchBarCode(composite);
  const tabList = remote
    ? remote.process(
        'SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_PROCESS_TABLIST',
        tableViewList(props.tableConfigRef.permissionTabList || composite.permissionTabList, props),
        {
          menuTab,
          composite,
          props,
        }
      )
    : tableViewList(props.tableConfigRef.permissionTabList || composite.permissionTabList, props);
  const dataSetArr = ['create'].includes(composite.tabKey)
    ? props.tableConfigRef.dataSet[composite.tabKey]
    : props.tableConfigRef.dataSet[`${composite.tabKey}_${composite.hdKey}`];
  const dataSetList = remote
    ? remote.process('SLOD_DELIVERY_WORKBENCH_LIST_PROCESS_DS_SOCIETY_TAB', dataSetArr, {
        composite,
        dataSet: props.tableConfigRef.dataSet,
      })
    : dataSetArr;
  const listProps = {
    remote,
    tabKey: composite.tabKey,
    hdKey: composite.hdKey,
    searchCode: searchCodeList,
    queryFieldsLimit: 3,
    customizeCode: composite.currentUnitCode,
    customizeTable: props.customizeTable,
    columns: composite.hdKey !== 'date' ? props.tableConfigRef.columns : menuTab.dateColumns,
    dataSet: dataSetList,
    nodeTemplateCode: composite.summarization,
    searchBarConfig: {
      // 关闭筛选器自动查询
      // autoQuery: false,
      onFieldChange: handleFieldChange,
      fieldProps: {
        itemCode: { lovPara: { tenantId: getCurrentOrganizationId() } },
        companyId: { lovPara: { tenantId: getCurrentOrganizationId() } },
        tempKey: { lovPara: { tenantId: getCurrentOrganizationId() } },
        sourceNodeConfigId: { lovPara: { tenantId: getCurrentOrganizationId() } },
        agentId: { lovPara: { tenantId: getCurrentOrganizationId() } },
        purchaseOrgId: { lovPara: { tenantId: getCurrentOrganizationId() } },
        invOrganizationId: { lovPara: { tenantId: getCurrentOrganizationId() } },
        // inventoryId: { lovPara: { tenantId: getCurrentOrganizationId() } },
        locationId: { lovPara: { tenantId: getCurrentOrganizationId() } },
        categoryId: { lovPara: { tenantId: getCurrentOrganizationId() } },
        strategyHeaderId: { lovPara: { tenantId: getCurrentOrganizationId() } },
        poTypeId: { lovPara: { tenantId: getCurrentOrganizationId() } },
        creationDate: {
          defaultValue: ({ record }) =>
            ['all'].includes(composite.tabKey)
              ? dateRangeTransform(
                  isNil(record.get('deliveryDataRange'))
                    ? 'IN_THREE_MONTH'
                    : record.get('deliveryDataRange')
                )
              : record.get('creationDate'),
          dynamicProps: {
            disabled: ({ record }) => record.get('deliveryDataRange'),
          },
        },
        // planDateTimeDimension: {defaultValue: 'PLAN'},
        // quantityDimension: {defaultValue: '1'},
      },
    },
    nodeConfigId: composite.menuMarkId,
    textQueryChange: () => textQueryChange,
    rightBarTable: () =>
      rightBarTable({
        hdKey: composite.hdKey,
        tabKey: composite.tabKey,
        dataSet: dataSetList,
        nodeTemplateCode: composite.summarization,
        useHdChange: cutChange,
      }),
  };

  const queryProps = {
    planTimer,
    queryCallBack: textQueryChange,
    itemGroupViewFlag: props?.tableConfigRef?.itemGroupViewFlag,
    queryTitle: {
      planStartDate: intl
        .get('slod.deliveryWorkbench.model.common.planStartDateTime')
        .d('计划起始日'),
      planDatePeriod: intl.get('slod.deliveryWorkbench.model.common.timeDatePeriod').d('时间周期'),
      planDateTimeDimension: intl
        .get('slod.deliveryWorkbench.model.common.planDateTimeDimension')
        .d('时间维度'),
      quantityDimension: intl
        .get('slod.deliveryWorkbench.model.common.quantityDimension')
        .d('数量维度'),
      itemGroupViewFlag: intl
        .get('slod.deliveryWorkbench.model.common.itemGroupViewFlag')
        .d('按物料和日期汇总订单数量'),
    },
    // dataSet: props.tableConfigRef.dataSet,
  };

  const getTabPane = () => {
    const tabs = remote
      ? remote.process('SLOD_DELIVERY_WORKBENCH_LIST_RENDER_TAB_PANE', null, {
          composite,
          menuTab,
          props,
        })
      : null;
    return tabs;
  };

  return (
    <Fragment>
      <Header
        title={
          menuTab.menuList.length > 1
            ? intl.get('slod.deliveryWorkbench.view.title.deliveryWorkbench').d('发货工作台')
            : `${intl.get('slod.deliveryWorkbench.view.title.deliveryWorkbench').d('发货工作台')}
              ${menuTab.menuList[0]?.nodeConfigName ? '-' : ''}
              ${menuTab.menuList[0]?.nodeConfigName || ''}`
        }
      >
        <HeaderBtns dataSet={dataSetList} />
      </Header>
      <div
        className={classNames('page-content')}
        id="supplierMenuId"
        style={{
          padding: menuTab.menuList.length > 1 ? 0 : '16px 16px 0 16px',
          margin: enableThemeConfig === 1 ? 8 : '8px 8px 16px',
        }}
      >
        <Spin spinning={menuLoading}>
          {menuTab.menuList.length > 1 ? (
            <Layout>
              <div
                className={styles['workbench-menu-supplier']}
                style={{ height: heightMenu || 600 }}
              >
                <div className={styles[!composite.collapsed ? 'menu-sub-open' : 'menu-sub-off']}>
                  <div className={styles['menu-text']}>
                    <Sider trigger={null} collapsible collapsed={composite.collapsed}>
                      <Menu
                        mode="inline"
                        id="menuLineId"
                        inlineCollapsed={composite.collapsed}
                        defaultSelectedKeys={[composite.menuMarkId]}
                        selectedKeys={[composite.menuMarkId]}
                      >
                        {menuTab.menuList.map((item) => {
                          return (
                            <Menu.Item
                              key={item.nodeConfigId}
                              onClick={() =>
                                menuClick({
                                  nodeConfigId: item.nodeConfigId,
                                  customizeCode: item.customizeCode,
                                  nodeConfigName: item.nodeConfigName,
                                  cuszDocTmplCode: item.cuszDocTmplCode,
                                  customerUnitCode: item.customerUnitCode,
                                  nodeTemplateCode: item.nodeTemplateCode,
                                  permissionTabList: item.permissionTabList,
                                })
                              }
                            >
                              <div>
                                <div className={styles['text-style']}>
                                  <div className={styles['text-icon']}>
                                    {iconType(item.nodeTemplateCode)}
                                  </div>
                                  <div
                                    className={
                                      styles[
                                        composite.menuMarkId === item.nodeConfigId &&
                                          'text-style-selected'
                                      ]
                                    }
                                  >
                                    {item.nodeConfigName}
                                  </div>
                                  <div
                                    className={
                                      styles[
                                        composite.menuMarkId === item.nodeConfigId
                                          ? 'text-style-span-click'
                                          : 'text-style-span'
                                      ]
                                    }
                                  >
                                    {/* <div>{item.nodeConfigName}</div> */}
                                    <div className={styles['text-style-text']}>
                                      <React.Suspense
                                        fallback={
                                          <div className={styles['text-style-tab-left']}>
                                            {intl
                                              .get('hzero.common.view.load.loadingMsg')
                                              .d('正在加载...')}
                                          </div>
                                        }
                                      >
                                        {remote ? (
                                          remote.render(
                                            'SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST_RENDER_COUNT',
                                            <CountMenu
                                              _obj={item}
                                              campKeys="s"
                                              countMenu={countMenu}
                                            />,
                                            { composite, item }
                                          )
                                        ) : (
                                          <CountMenu
                                            _obj={item}
                                            campKeys="s"
                                            countMenu={countMenu}
                                          />
                                        )}
                                      </React.Suspense>
                                    </div>
                                  </div>
                                </div>
                                {!composite.collapsed && (
                                  <div className={styles['menu-instructions']}>
                                    {item.nodeRemark}
                                  </div>
                                )}
                              </div>
                            </Menu.Item>
                          );
                        })}
                      </Menu>
                    </Sider>
                  </div>
                </div>
              </div>
              <div
                className={
                  styles[
                    !composite.collapsed
                      ? 'workbench-page-open-supplier'
                      : 'workbench-page-off-supplier'
                  ]
                }
                style={{ height: heightMenu || 600 }}
              >
                <a
                  onClick={() => collapsedChange(!composite.collapsed)}
                  className={styles[composite.collapsed ? 'menu-icon' : 'menu-icon-a']}
                >
                  <Icon className={styles['page-icon']} type="baseline-arrow_right" />
                </a>
                <Tabs
                  animated={false}
                  forceRender={false}
                  onChange={(key) => tabsOnchange(key)}
                  activeKey={composite.tabKey}
                  className={styles[composite.hdKey === 'date' && 'tab-date']}
                >
                  {getTabPane()}
                  {tabList.map((item) => {
                    return (
                      <TabPane tab={item.name} key={item.key} count={count(item.key)}>
                        {waitCustomize ? (
                          <Spin spinning />
                        ) : (
                          <>
                            {composite.hdKey === 'date' && <QueryField {...queryProps} />}
                            <SearchBarGlobal ref={tableRef} {...listProps} />
                          </>
                        )}
                      </TabPane>
                    );
                  })}
                </Tabs>
              </div>
            </Layout>
          ) : (
            <Tabs
              animated={false}
              forceRender={false}
              onChange={(key) => tabsOnchange(key)}
              activeKey={composite.tabKey}
              className={styles[composite.hdKey === 'date' && 'tab-date']}
            >
              {getTabPane()}
              {tabList.map((item) => {
                return (
                  <TabPane tab={item.name} key={item.key} count={count(item.key)}>
                    {waitCustomize ? (
                      <Spin spinning />
                    ) : (
                      <>
                        {composite.hdKey === 'date' && <QueryField {...queryProps} />}
                        <SearchBarGlobal ref={tableRef} {...listProps} />
                      </>
                    )}
                  </TabPane>
                );
              })}
            </Tabs>
          )}
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  useDoubleUomConfig(),
  WithCustomize({
    unitCode: getCustomize(),
    queryMethod: 'POST',
  }),
  formatterCollections({
    code: ['hzero.common', 'slod.deliveryWorkbench', 'slod.common', 'sinv.receiptWorkbench'],
  }),
  withProps(
    () => {
      return {
        tableConfigRef: {
          dataSet: {},
          columns: [],
          query: {},
          menuTabList: [],
          page: 'list',
          itemGroupViewFlag: false,
        },
      };
    },
    { cacheState: true },
    { cacheKey: '/slod/supplier-delivery-workbench/list' }
  ),
  connect(({ deliveryWorkbench = {}, user = {} }) => ({
    deliveryWorkbench,
    user,
  })),
  remoteFun(
    {
      code: 'SLOD_DELIVERY_WORKBENCH_SUPPLIER_LIST',
      name: 'remote',
    },
    {
      events: {
        // 提交前置埋点
        remoteBeforeSubmit: () => true,
      },
    }
  )
)(IndexMenu);
