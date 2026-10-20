/* eslint-disable no-unused-expressions */
import React, { Component, Fragment } from 'react';
import { DataSet, Row, Col, Spin, Select, TextField } from 'choerodon-ui/pro';
import { getComparsionFieldName } from 'srm-front-boot/lib/components/SearchBarTable/util';
import { Icon, Badge, notification, Menu, Popover } from 'choerodon-ui';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { filterNullValueObject } from 'utils/utils';
import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import querystring from 'querystring';
import { withRouter } from 'react-router-dom';

import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
import CommonTable from '@/routes/components/CommonTable/index';
import intl from 'hzero-front/lib/utils/intl';
import noData from '@/assets/roleWorkbench/none.svg';

import { DocMenu } from './components/DocMenu';

import styles from '../card.less';
import { tableDs } from './store';

const { SubMenu } = Menu;
const MenuItemGroup = Menu.ItemGroup;

@withRouter
@withCustomize({
  unitCode: [
    'SWBH.ROLE_WORK_BENCH.TODO_SEARCH',
    'SWBH.ROLE_WORK_BENCH.INITIATE_SEARCH',
    'SWBH.ROLE_WORK_BENCH.HANDLE_SEARCH',
    'SWBH.ROLE_WORK_BENCH.ACTION_SEARCH',
    'SWBH.ROLE_WORK_BENCH.DRAFT_SEARCH',
  ],
})
@formatterCollections({
  code: ['swbh.common', 'srm.common'],
})
@connect(({ swbhCards, loading }) => ({
  swbhCards,
  attentionIgnoreLoading: loading.effects['swbhCards/attentionIgnore'],
}))
export default class SwbnDocumentList extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    this.SearchBarRef = {};

    this.state = {
      // mountFlag: true,
      selectedKey: 'TODO',
      currentDocType: null,
      searchValue: null,
      currentBusinessType: null,
      cacheData: [],
      page: 0,
      pageSize: 10,
      isOpenNotification: false,
      searchCode: 'SWBH.ROLE_WORK_BENCH.TODO_SEARCH',
      activeRow: null,
      businessCode: null,
      selectText: null,
      isNoData: false,
      tableLoading: true,
      docTypeList: {},
      customizeFilterFields: null,
    };

    this.delDocumentKey = null;
    this.delDocAnimationType = null;
    this.intervalTimer = null;
    this.timeOutTimer = null;
    this.documentTableDs = new DataSet(tableDs(true));
    this.businessTypeTodoDs = new DataSet({
      fields: [
        {
          name: 'businessType',
          type: 'string',
          valueField: 'value',
          textField: 'meaning',
          // label: '业务类型',
          lookupCode: 'SWBH.TODO_BUSINESS_TYPE',
        },
      ],
      events: {
        update: ({ name, value }) => {
          if (name === 'businessType') {
            this.handleChangeBusinessType(value ?? null);
          }
        },
      },
    });
    this.businessTypeHandleDs = new DataSet({
      data: [{ businessType: 'PROCESSED' }],
      fields: [
        {
          name: 'businessType',
          type: 'string',
          valueField: 'value',
          textField: 'meaning',
          // label: '业务类型',
          lookupCode: 'SWBH.HANDLE_BUSINESS_TYPE',
        },
      ],
      events: {
        update: ({ name, value }) => {
          if (name === 'businessType') {
            this.handleChangeBusinessType(value ?? null);
          }
        },
      },
    });
  }

  componentDidMount() {
    const { swbhCards: { cardList = [], currentCarousel } = {} } = this.props;
    // this.setTimer();
    // this.setQueryParams();
  }

  componentDidUpdate(prevProps) {
    const { currentCarousel: preCarousel, wsInfo: preWsInfo = {} } = prevProps.swbhCards;
    const { currentCarousel, wsInfo = {} } = this.props.swbhCards;
    if (currentCarousel !== preCarousel) {
      this.changeCarousel();
    }

    if (wsInfo && wsInfo !== preWsInfo) {
      this.parseWebSocketInfo();
    }
  }

  /**
   *parseWebSocketInfo
   * 解析websocket传来的信息
   */
  parseWebSocketInfo() {
    const { currentCarousel, wsInfo = {} } = this.props.swbhCards;
    const { userId, key, message: { userId: docManagerUserId, docType, documentKey, type } = {} } = wsInfo;
    const { swbhCards: { docTypeSource = [] } = {} } = this.props;

    const includeDocumentKey = docTypeSource?.filter((item) => item.value === docType);

    // console.log('[wsInfo]', wsInfo, docType);

    if (!includeDocumentKey.length === 0) {
      // 非当前卡片
      return;
    }
    if (userId !== docManagerUserId || type === 'ADD') {
      this.openNotification(type);
      return;
    }

    if (type === 'DEL') {
      // console.log('[DEL]');

      this.delDocAnimation(documentKey, 'WebSocket');
    }
  }

  delDocAnimation = (documentKey, type) => {
    if (!documentKey) {
      return;
    }

    if (
      this.delDocumentKey &&
      this.delDocAnimationType &&
      this.delDocumentKey === documentKey &&
      this.delDocAnimationType === 'todoTimer' &&
      type === 'todoTimer'
    ) {
      return;
    }

    if (type !== 'WebSocket') {
      const { getDocTotal = () => {} } = this.props;
      getDocTotal('TODO');
      this.delDocumentKey = documentKey;
      this.delDocAnimationType = type;
    }

    const { cacheData: originCacheData, page, pageSize } = this.state;
    let currentCacheData = originCacheData;

    const { totalPage = 0, length = 0 } = this.documentTableDs;

    const isLastPage = totalPage === 1 || page === totalPage;

    if (!isLastPage && currentCacheData?.length === 0) {
      currentCacheData = this.setCurrentCacheData(page, pageSize);
    }
    let hasRemoveData = false;

    this.documentTableDs?.forEach((record, index) => {
      if (record.get('documentKey') === documentKey) {
        record.setState('isCurrentDocument', true);
        hasRemoveData = true;
      }
    });

    if (hasRemoveData) {
      setTimeout(() => {
        if (!isLastPage && currentCacheData?.length > 0) {
          this.documentTableDs.create(currentCacheData?.[0], length);
          currentCacheData?.shift();
        }
      }, 300);
    } else {
      currentCacheData = currentCacheData?.filter((item) => item.documentKey !== documentKey);
    }
    this.setState({ cacheData: currentCacheData });
  };

  getCurrentDocTypeList = () => {
    const { swbhCards: { cardList = [], currentCarousel } = {} } = this.props;
    const { swbhCards: { docTypeSource = [] } = {} } = this.props;

    const docTypeList =
      currentCarousel === 'ALL' ? cardList : cardList?.filter((item) => item?.cardCode === currentCarousel);
    return docTypeList;
  };

  setCurrentQueryParams = (params) => {
    const {
      tab = 'TODO',
      docType = null,
      businessCode = null,
      searchValue = null,
      businessType = null,
      customizeFilterFields = null,
    } = params;

    const { swbhCards: { docTypeSource = [] } = {} } = this.props;

    let currentSearchCode = this.getCommonSearchCode();
    let currentSelectText = null;
    // let currentDocType = null;

    if (docType) {
      const currentDocTypeInfo = docTypeSource?.filter((item) => item.value === docType);

      const { meaning = '', searchCode, children = null } = currentDocTypeInfo?.[0] || {};

      currentSearchCode = searchCode;
      currentSelectText = meaning;

      if (children && businessCode) {
        const currentDoc = children?.filter((item) => item.value === businessCode);
        const { meaning, searchCode } = currentDoc?.[0] || {};

        currentSearchCode = searchCode;
        currentSelectText = meaning;
      }
    }

    this.setState(
      {
        currentDocType: docType || null,
        businessCode, // 寻源
        searchCode: currentSearchCode || this.getCommonSearchCode(),
        selectText: currentSelectText,
        selectedKey: tab,
        searchValue,
        currentBusinessType: businessType || (tab === 'HANDLE' ? 'PROCESSED' : null),
        customizeFilterFields,
      },
      () => {
        if (businessType) {
          const businessTypeDs = tab === 'TODO' ? this.businessTypeTodoDs : this.businessTypeHandleDs;
          businessTypeDs.loadData([{ businessType }]);
        }
      }
    );
  };

  changeCarousel = () => {
    const { swbhCards: { currentCarousel, docTypeSource = [] } = {} } = this.props;

    const { searchCode: preSearchCode } = this.state;
    let currentSearchCode = this.getCommonSearchCode();
    let currentSelectText = null;
    let currentDocType = null;

    if (docTypeSource?.length === 1 && !docTypeSource?.[0]?.children) {
      const { meaning = '', searchCode = '', value = '' } = docTypeSource?.[0] ?? {};
      currentSearchCode = searchCode;
      currentSelectText = meaning;
      currentDocType = value;
    }

    this.setState(
      {
        // selectedKey: currentCarousel === 'ALL' ? 'TODO' : this.state.selectedKey,
        selectedKey:
          currentCarousel === 'ALL'
            ? this.state.selectedKey === 'TRANSFER' || this.state.selectedKey === 'PENDING'
              ? 'TODO'
              : this.state.selectedKey
            : this.state.selectedKey,
        currentDocType,
        businessCode: null,
        searchCode: currentSearchCode,
        selectText: currentSelectText,
        searchValue: null,
        currentBusinessType: this.state.selectedKey === 'HANDLE' ? 'PROCESSED' : null,
      },
      () => {
        this.businessTypeTodoDs.reset();
        this.businessTypeHandleDs.reset();
        this.documentTableDs.reset();
        if (this.state.searchCode !== preSearchCode && this.state.selectedKey !== 'TRANSFER') {
          return;
        }

        this.handleLoad();
      }
    );
  };

  getCommonSearchCode = () => {
    const { selectedKey } = this.state;

    let searchCode = 'SWBH.ROLE_WORK_BENCH.TODO_SEARCH';

    switch (selectedKey) {
      case 'TODO': // '待办'
        searchCode = 'SWBH.ROLE_WORK_BENCH.TODO_SEARCH';
        break;
      case 'FOCUS': // '待阅读'
        searchCode = 'SWBH.ROLE_WORK_BENCH.ACTION_SEARCH';
        break;
      case 'INITIATE': // 我发起
        searchCode = 'SWBH.ROLE_WORK_BENCH.INITIATE_SEARCH';
        break;
      case 'HANDLE': // 我经办
        searchCode = 'SWBH.ROLE_WORK_BENCH.HANDLE_SEARCH';
        break;
      case 'PENDING': // 草稿箱
        searchCode = 'SWBH.ROLE_WORK_BENCH.DRAFT_SEARCH';
        break;
      default:
        searchCode = 'SWBH.ROLE_WORK_BENCH.TODO_SEARCH';
    }

    return searchCode;
  };

  loadData = () => {
    this.setState({ isOpenNotification: false, tableLoading: true });

    const { selectedKey, currentBusinessType, businessCode, searchValue, currentDocType, searchCode } = this.state;

    // if (selectedKey === 'TRANSFER') {
    // }

    const { swbhCards: { currentCarousel, initFlag = true } = {}, dispatch } = this.props;
    const params = filterNullValueObject({
      cardCode: currentCarousel,
      entryCode: selectedKey,
      businessType: currentBusinessType,
      businessCode,
      docNum: searchValue,
      docType: selectedKey === 'TRANSFER' ? null : currentDocType,
      customizeUnitCode: selectedKey === 'TRANSFER' ? null : searchCode,
    });
    if (selectedKey === 'TRANSFER') {
      dispatch({
        type: 'swbhCards/queryList',
        payload: params,
      }).then((res) => {
        if (res && !res.failed) {
          this.setState({
            docTypeList: res?.content?.[0] ?? {},
            isNoData: res?.content?.length === 0 && res?.totalElements === 0,
          });
        } else {
          this.setState({ docTypeList: {}, isNoData: true });
          notification.error({ message: res?.message });
          // return [];
        }
        this.setState({ tableLoading: false });
      });
    } else {
      this.documentTableDs.setQueryParameter('advancedData', params);
      this.setCurrentCacheData();
      this.documentTableDs.query().then((res) => {
        if (res && !res.failed) {
          this.setState({
            isNoData:
              (res?.totalElements === 1 && res?.content?.length === 0) ||
              (res?.content?.length === 0 && res?.totalElements === 0),
          });
        } else {
          this.setState({ isNoData: true });
          notification.error({ message: res?.message });
        }
        this.setState({ tableLoading: false });
      });
    }
    if (initFlag) {
      dispatch({
        type: 'swbhCards/updateState',
        payload: { initFlag: false },
      });
    }
  };

  setCurrentCacheData = (page, pageSize = 10) => {
    const {
      totalPage = 0,
      currentPage: tablePage = 0,
      length = 0,
      // pageSize: tablePageSize = 10,
    } = this.documentTableDs;
    const { cacheData } = this.state;

    if (page && page === totalPage) {
      this.setState({ cacheData: [] });
      return [];
    }

    const currentPage = page || 1;
    const { dispatch } = this.props;
    const customizeParams = this.documentTableDs?.getQueryParameter('customizeParams');
    const advancedData = this.documentTableDs?.getQueryParameter('advancedData');

    const params = filterNullValueObject({
      page: currentPage,
      size: pageSize,
      ...customizeParams,
      ...advancedData,
    });

    dispatch({
      type: 'swbhCards/queryList',
      payload: params,
    }).then((res) => {
      if (res && !res.failed) {
        this.setState({ cacheData: res?.content });
        return res?.content;
      } else {
        this.setState({ cacheData: [] });
        notification.error({ message: res?.message });
        return [];
      }
    });
  };

  changePagination = (page, pageSize) => {
    this.setState({ page, pageSize });
    this.setCurrentCacheData(page, pageSize);
  };

  setMonitor = (selectedKey) => {
    if (!selectedKey) {
      return;
    }
    let selectedKeyName = '待转单';
    switch (selectedKey) {
      case 'TRANSFER': // '待转单'
        selectedKeyName = '待转单';
        break;
      case 'PENDING': // '，草稿箱'
        selectedKeyName = '，草稿箱';
        break;
      case 'TODO': // '待处理'
        selectedKeyName = '待处理';
        break;
      case 'FOCUS': // '待阅读'
        selectedKeyName = '待阅读';
        break;
      case 'INITIATE': // 我发起
        selectedKeyName = '我发起';
        break;
      case 'HANDLE': // 我经办
        selectedKeyName = '我经办';
        break;
      default:
        selectedKeyName = '待转单';
    }
    if (window.collectEvent) {
      window.collectEvent('ClickButton', { text: `采购员工作台-页签-${selectedKeyName}` });
    }
  };

  changeTab = (value) => {
    const { keyPath } = value;
    const { selectedKey } = this.state;
    if ((keyPath?.[0] && keyPath?.[0] === selectedKey) || !keyPath) {
      return;
    }

    this.businessTypeTodoDs.reset();
    this.businessTypeHandleDs.reset();
    // this.businessTypeHandleDs.reset();
    const { searchCode, currentDocType } = this.state;
    // if (
    //   searchCode === 'SWBH.ROLE_WORK_BENCH.TODO_SEARCH' ||
    //   searchCode === 'SWBH.ROLE_WORK_BENCH.INITIATE_SEARCH' ||
    //   searchCode === 'SWBH.ROLE_WORK_BENCH.HANDLE_SEARCH' ||
    //   searchCode === 'SWBH.ROLE_WORK_BENCH.ACTION_SEARCH' ||
    //   searchCode === 'SWBH.ROLE_WORK_BENCH.DRAFT_SEARCH'
    // ) {
    if (!currentDocType) {
      this.setState(
        {
          selectedKey: keyPath?.[0],
          currentBusinessType: keyPath?.[0] === 'HANDLE' ? 'PROCESSED' : null,
        },
        () => {
          this.setState({ searchCode: this.getCommonSearchCode() }, () => {
            this.setMonitor(keyPath?.[0]);
            if (keyPath?.[0] === 'TRANSFER') {
              this.loadData();
              // this.onQuery();
            }
          });
        }
      );
    } else {
      this.setState(
        { selectedKey: keyPath?.[0], currentBusinessType: keyPath?.[0] === 'HANDLE' ? 'PROCESSED' : null },
        () => {
          this.setMonitor(keyPath?.[0]);
          this.handleLoad();
        }
      );
    }
  };

  onQuery = (props = {}) => {
    // this.SearchBarRef?.setFields({
    // cancelStatusCode: ['UNCANCELLED'],
    // cancelStatusCode: ['UNCANCELLED', 'CANCELLED_PARTIAL'],
    // purchaseOrgId: [
    //   {
    //     organizationName: '总公司采购组织001',
    //     purchaseOrgId: '__-fAesKzL3L4J1Gm8y_ud-YQ-__',
    //   },
    //   {
    //     organizationName: 'Einkaufsorg. 0001',
    //     purchaseOrgId: '__-Q40N81J_D32C6vKCEduA9A-__',
    //   },
    // ],
    // lastUpdateDate: '2022-10-11 00:00:00,2022-10-29 23:59:59',
    // createdBy: { id: '__-vfIKU5Cabvkrp5JOp_lwwQ-__', realName: '李佼' },
    // companyId: { companyId: '__-DW8urcW2wpb0VJFR63cEEg-__', companyName: '验证企业' },
    // poSourcePlatform: 'ERP',
    // sourceCode: 'MANUAL',
    // [getComparsionFieldName('sourceCode')]: '<>',
    // });
    const { params = {}, filter, fields, dataSet } = props;
    const { selectedKey, searchCode } = this.state;
    // if (customizeFilterFields) {
    //   this.SearchBarRef?.setFields({ ...customizeFilterFields });
    // }
    if (selectedKey === 'TODO' && searchCode !== 'SWBH.ROLE_WORK_BENCH.TODO_SEARCH') {
      params.customizeOrderField = null;
    }

    // const {} = customizeFilterFields

    // let newParams = { ...customizeFilterFields, ...params };
    let newParams = { ...params };
    const { supplierCompanyId = null, supplierNum = null } = params;
    if (searchCode === 'SPCM.WORKSPACE_ALL.SERARCH2') {
      // 协议供应商特殊处理
      const otherParams = supplierCompanyId ? dataSet.getState('params') : null;
      newParams = { ...params, ...otherParams };
    }

    if (searchCode === 'SQAM.INITIATED_8D_LIST.SEARCH_BAR') {
      // 质量整改供应商特殊处理
      const otherParams = supplierCompanyId ? dataSet.getState('params') : null;
      newParams = { ...params, ...otherParams };
    }

    this.documentTableDs.setQueryParameter('customizeParams', filterNullValueObject(newParams));
    this.loadData();
  };

  resetQueryDs = () => {
    const { searchCode: preSearchCode } = this.state;
    this.setState(
      {
        currentDocType: null,
        businessCode: null,
        searchCode: this.getCommonSearchCode(),
        selectText: null,
        searchValue: null,
        currentBusinessType: this.state.selectedKey === 'HANDLE' ? 'PROCESSED' : null,
      },
      () => {
        this.businessTypeTodoDs.reset();
        this.businessTypeHandleDs.reset();
        this.documentTableDs.reset();
        if (this.state.searchCode !== preSearchCode) {
          return;
        }
        this.handleLoad();
      }
    );
  };

  handleLoad = () => {
    if (this.documentTableDs?.getState('queryStatus') === 'ready') {
      this.SearchBarRef.firstFlag = false;
      // this.SearchBarRef?.setFields({ createdBy: { id: '__-vfIKU5Cabvkrp5JOp_lwwQ-__', realName: '李佼' } });
      this.SearchBarRef?.handleQuery(true);
    } else {
      const timer = setInterval(() => {
        if (this.documentTableDs?.getState('queryStatus') === 'ready') {
          // this.SearchBarRef?.setFields({ createdBy: { id: '__-vfIKU5Cabvkrp5JOp_lwwQ-__', realName: '李佼' } });
          this.SearchBarRef?.handleQuery(true);
          clearInterval(timer);
        }
      }, 300);
    }
  };

  // 对供应商特别的处理
  onFieldChange = ({ name, value, dataSet }) => {
    const { searchCode } = this.state;
    if (name === 'supplierCompanyId' && searchCode === 'SPCM.WORKSPACE_ALL.SERARCH2') {
      const { supplierCompanyId, supplierId } = value || {};
      dataSet.setState({ params: { supplierId, supplierCompanyId } });
    }

    if (name === 'supplierCompanyId' && searchCode === 'SQAM.INITIATED_8D_LIST.SEARCH_BAR') {
      const { supplierNum, supplierId, supplierCompanyId, erpSupplierName, supplierCompanyName } = value || {};
      dataSet.setState({
        params: {
          supplierNum,
          supplierId,
          supplierCompanyId,
          extSupplierId: supplierId,
          erpSupplierName: erpSupplierName || supplierCompanyName,
        },
      });
    }
  };

  handleChangeDocNum = (value) => {
    this.setState({ searchValue: value }, () => this.handleLoad());
  };

  handleChangeBusinessType = (value) => {
    this.setState({ currentBusinessType: value }, () => this.handleLoad());
  };

  handleDropdownMenuClick = (e, setPopup) => {
    const { item: { props } = {}, key = '', keyPath = [] } = e;
    const currentKey = JSON.parse(key);
    const { searchCode: preSearchCode } = this.state;

    const { swbhCards: { docTypeSource = [] } = {} } = this.props;

    if (keyPath.length === 2) {
      this.setState(
        {
          currentDocType: JSON.parse(keyPath?.[1])?.value,
          businessCode: currentKey?.value,
          searchCode: currentKey?.searchCode || this.getCommonSearchCode(),
          selectText: props?.children ?? currentKey?.value,
        },
        () => {
          if (this.state.searchCode !== preSearchCode) {
            return;
          }
          this.handleLoad();
        }
      );
    } else if (keyPath.length === 1) {
      this.setState(
        {
          currentDocType: currentKey?.value,
          businessCode: null,
          searchCode: currentKey?.searchCode || this.getCommonSearchCode(),
          selectText: props?.children ?? currentKey?.value,
        },
        () => {
          if (this.state.searchCode !== preSearchCode) {
            return;
          }
          this.handleLoad();
        }
      );
    }
    setPopup(false);
  };

  changDocTypeSelect = (e) => {
    const { searchCode: preSearchCode } = this.state;
    if (!e) {
      this.setState(
        {
          currentDocType: null,
          businessCode: null,
          searchCode: this.getCommonSearchCode(),
          selectText: null,
        },
        () => {
          if (this.state.searchCode !== preSearchCode) {
            return;
          }
          this.handleLoad();
        }
      );
    }
  };

  attentionIgnore = (record) => {
    const { dispatch, getDocTotal = () => {} } = this.props;

    const params = filterNullValueObject({
      combineCode: record?.get('combineCode'),
      documentId: record?.get('documentId'),
    });

    dispatch({
      type: 'swbhCards/attentionIgnore',
      payload: params,
    }).then((res) => {
      if (res && res?.failed) {
        notification.error({ message: res?.message });
      } else {
        getDocTotal('FOCUS');
        this.delDocAnimation(record?.get('documentKey'), 'attention');
      }
    });
  };

  setTimer = (record) => {
    const { selectedKey } = this.state;

    if (
      !(selectedKey === 'TODO' || selectedKey === 'PENDING') ||
      !record ||
      (record && record?.get('todoType') === 'LINE')
    ) {
      return;
    }

    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    let num = 1;
    this.getTodoDocStatus(record);
    this.intervalTimer = setInterval(() => {
      num++;
      this.getTodoDocStatus(record);
      if (num > 5) {
        clearInterval(this.intervalTimer);
      }
    }, 500);
  };

  getTodoDocStatus = async (record) => {
    const { dispatch, getDocTotal = () => {} } = this.props;

    const { selectedKey } = this.state;

    const params = filterNullValueObject({
      entryCode: selectedKey,
      workFlowFlag: record?.get('workFlowFlag'),
      combineCode: record?.get('combineCode'),
      documentId: record?.get('documentId'),
      todoCode: record?.get('todoCode'),
      executionId: record?.get('executionId'),
      procInstId: record?.get('procInstId'),
      taskId: record?.get('taskId'),
    });

    dispatch({
      type: 'swbhCards/todoDocStatus',
      payload: params,
    }).then((res) => {
      if (res === 0) {
        clearInterval(this.intervalTimer);
        this.intervalTimer = null;
        if (selectedKey === 'TODO') {
          // getDocTotal('TODO');
          this.delDocAnimation(record?.get('documentKey'), 'todoTimer');
        } else {
          this.getDraftNum();
          this.delDocAnimation(record?.get('documentKey'), 'draftTimer');
        }
      }
    });
  };

  getDraftNum = () => {
    const { dispatch, swbhCards } = this.props;
    const { selectedKey } = this.state;
    const { swbhCards: { currentCarousel } = {} } = this.props;
    const params = filterNullValueObject({
      cardCode: currentCarousel,
      entryCode: selectedKey,
      // businessType: currentBusinessType,
      // businessCode,
      // docNum: searchValue,
      // docType: selectedKey === 'TRANSFER' ? null : currentDocType,
      customizeUnitCode: 'SWBH.ROLE_WORK_BENCH.DRAFT_SEARCH',
    });

    dispatch({
      type: 'swbhCards/queryList',
      payload: params,
    }).then((res) => {
      if (res && !res.failed) {
        const { currentMenuData: newMenuData = {}, docTotal: newDocTotal = {} } = swbhCards;
        const { cardDataDocTypeDTOList } = newDocTotal;

        const { cardDataEntryTypeDTOList: newCardDataEntryTypeDTOList = [] } = newMenuData;
        newCardDataEntryTypeDTOList.forEach((item) => {
          if (item?.typeCode === 'NEW') {
            item?.cardDataEntryDTOList?.forEach((data) => {
              if (data?.entryCode === 'PENDING') {
                data.totalElements = res?.totalElements ?? 0;
              }
            });
          }
        });
        cardDataDocTypeDTOList.forEach((item) => {
          if (item.cardCode === newMenuData?.cacheData) {
            item = newMenuData;
          }
        });

        dispatch({
          type: 'swbhCards/updateState',
          payload: { currentMenuData: newMenuData, docTotal: newDocTotal },
        });
      } else {
        // this.setState({ cacheData: [] });
        // notification.error({ message: res?.message });
        // return [];
      }
    });
  };

  dropdownRender = () => {
    const { swbhCards: { cardList = [], currentCarousel } = {} } = this.props;
    // const { swbhCards: { currentCarousel } = {} } = this.props;
    const { selectText } = this.state;
    const docList = this.getCurrentDocTypeList();

    const menuItemRender = (docTypeSource) =>
      docTypeSource?.map((data) => {
        return data?.children ? (
          <SubMenu key={JSON.stringify(data)} title={<span>{data?.meaning}</span>}>
            {data?.children?.map((child) => (
              <Menu.Item key={JSON.stringify(child)}>{child.meaning}</Menu.Item>
            ))}
          </SubMenu>
        ) : (
          <Menu.Item key={JSON.stringify(data)}>{data?.meaning}</Menu.Item>
        );
      });

    const popupContentRender = ({ setPopup }) => (
      <Menu mode="vertical" onClick={(e) => this.handleDropdownMenuClick(e, setPopup)}>
        {docList.map((item) => {
          return currentCarousel === 'ALL' ? (
            <MenuItemGroup key={item?.cardCode} title={item?.cardName}>
              {menuItemRender(item?.docTypeSource)}
            </MenuItemGroup>
          ) : (
            menuItemRender(item?.docTypeSource)
          );
        })}
      </Menu>
    );

    return (
      <Select
        name="docType"
        defaultActiveFirstOption={false}
        placeholder={intl.get('swbh.common.model.common.docType').d('单据类型')}
        style={{ width: '120px' }}
        value={selectText}
        popupContent={popupContentRender}
        // trigger={['click']}
        onChange={this.changDocTypeSelect}
        popupCls={styles.popupContent}
      />
    );
  };

  leftRender = () => {
    // const { swbhCards: { cardList = [], currentCarousel } = {} } = this.props;
    const { currentDocType } = this.state;

    return (
      <>
        {this.dropdownRender()}

        <div className="c7n-divider c7n-divider-vertical" style={{ background: 'rgb(204, 204, 204)' }} />
        <TextField
          valueChangeAction="blur"
          onChange={(value, _oldValue) => this.handleChangeDocNum(value)}
          style={{ height: '32px', width: '280px' }}
          // multiple
          prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,0.50)', fontSize: '14px' }} />}
          placeholder={intl.get('swbh.common.model.common.keywordSearch').d('请输入关键字搜索')}
          clearButton
          value={this.state.searchValue}
        />
      </>
    );
  };

  rightRender = (isShowBusinessType) => {
    const { selectedKey, currentBusinessType } = this.state;
    const text =
      selectedKey === 'TODO'
        ? intl.get('swbh.common.model.common.todoType').d('待处理类型')
        : intl.get('swbh.common.model.common.handleType').d('经办类型');

    return (
      <>
        {isShowBusinessType ? (
          <Select
            dataSet={selectedKey === 'TODO' ? this.businessTypeTodoDs : this.businessTypeHandleDs}
            name="businessType"
            className={styles.businessTypeSelect}
            style={{ width: currentBusinessType ? '136px' : '98px' }}
            // placeholder={text}
            prefix={<span className={styles.businessTypeLabel}>{text}</span>}
          />
        ) : null}
      </>
    );
  };

  onRow = ({ dataSet, record, index, expandedRow }) => {
    if (record && record?.getState('isCurrentDocument')) {
      setTimeout(() => {
        this.documentTableDs?.remove(record, true);
      }, 300);
      return {
        className: styles.currentRemoveRow,
      };
    }
    if (record && record?.getState('isActiveRow')) {
      return { className: styles.activeRow };
    }
  };

  setActiveRow = (record) => {
    const { activeRow } = this.state;
    if (activeRow) {
      activeRow.setState('isActiveRow', false);
    }
    this.setState({ activeRow: record }, () => {
      record.setState('isActiveRow', true);
    });
  };

  openNotification = (type) => {
    const { isOpenNotification, selectedKey } = this.state;
    if (isOpenNotification) {
      return;
    }
    if (selectedKey !== 'TODO') {
      return;
    }
    // const currentContainer = () => document.getElementById('notificationBox') || document.body;
    // notification.config({
    //   getContainer: currentContainer,
    // });
    // notification.open({
    //   getContainer: currentContainer,
    //   className: styles.notification,
    //   key: `openSwbh${Date.now()}`,
    //   message: (
    //     <div className={styles.message}>
    //       <div>
    //         <Icon type="near_me" className={styles.blue} />
    //         <span>待办有更新，请刷新后查看</span>
    //       </div>
    //       <div>
    //         <Icon type="replay" />
    //         <a
    //           onClick={() => {
    //             this.onQuery({ params: this.documentTableDs?.getQueryParameter('customizeParams') });
    //             // this.documentTableDs.query(this.documentTableDs.currentPage);
    //             notification.destroy();
    //           }}
    //         >
    //           刷新
    //         </a>
    //       </div>
    //     </div>
    //   ),
    //   duration: null,
    //   placement: 'topRight',
    //   style: {
    //     width: 276,
    //     height: 40,
    //   },
    //   onClose: () => this.setState({ isOpenNotification: false }),
    // });

    this.setState({ isOpenNotification: true });
  };

  docTypeListRender = (docTypeList = {}) => {
    if (
      Object.prototype.toString.call(docTypeList) !== '[object Object]' ||
      (Object.prototype.toString.call(docTypeList) === '[object Object]' && Object.keys(docTypeList).length === 0)
    ) {
      return;
    }

    const { swbhCards: { docTypeSource = [] } = {} } = this.props;

    const allDocTypeSource = [];
    docTypeSource?.forEach((item) => {
      allDocTypeSource.push(item);
      if (item?.children) {
        allDocTypeSource.push(...item?.children);
      }
    });

    return Object.keys(docTypeList).map((key) => {
      const currentdocType = allDocTypeSource.filter((item) => item?.value === key);
      const title = currentdocType?.[0]?.meaning || '';
      const ds = new DataSet(tableDs(false));
      ds.loadData(docTypeList[key]);
      return (
        <div className={styles.transferItem}>
          <div className={styles.docTitle}>{title}</div>
          <CommonTable
            queryBar="none"
            dataSet={ds}
            showOperation
            changePagination={this.changePagination}
            onRow={this.onRow}
            setActiveRow={this.setActiveRow}
            selectedKey={this.state.selectedKey}
            attentionIgnore={this.attentionIgnore}
            // spin={{ spinning: tableLoading || totalLoading || false }}
          />
        </div>
      );
    });
  };

  render() {
    const {
      selectedKey,
      isOpenNotification,
      searchCode,
      currentBusinessType,
      isNoData,
      tableLoading,
      docTypeList,
      customizeFilterFields,
    } = this.state;
    const {
      swbhCards: {
        currentCarousel = 'ALL',
        currentDocName = intl.get('swbh.common.model.common.docName.all').d('全部'),
        totalLoading = false,
        docTypeSource = [],
        currentMenuData: { cardDataEntryTypeDTOList = [] } = {},
        cardDocFastDTOList = [],
        initFlag = true,
      } = {},
      changeSwbnCardVisible = () => {},
      swbhMode,
      attentionIgnoreLoading,
      changeCurrentCarousel,
      swbnCardVisible,
      showGuide,
    } = this.props;

    // if (selectedKey === 'TODO' && searchCode !== 'SWBH.ROLE_WORK_BENCH.TODO_SEARCH') {
    //   params.customizeOrderField = null;
    // }
    const isNotShowShowOrder = selectedKey === 'TODO' && searchCode !== 'SWBH.ROLE_WORK_BENCH.TODO_SEARCH';

    const isShowBusinessType = selectedKey === 'TODO' || selectedKey === 'HANDLE';
    const NoData = () => (
      <Spin spinning={tableLoading || totalLoading || false}>
        <div className={styles.noDataImgBox}>
          <img src={noData} alt="" />
          <div>{intl.get('swbh.common.model.common.noData').d('未查询到相关数据')}</div>
        </div>
      </Spin>
    );

    const Notification = () => {
      return (
        <>
          <li className={styles.message}>
            <div>
              <Icon type="near_me" className={styles.blue} />
              <span>{intl.get('swbh.common.model.common.pleaseReplay').d('待办有更新，请刷新后查看')}</span>
            </div>
            <div
              onClick={() => {
                this.handleLoad();
                this.setState({ isOpenNotification: false });
                const { getDocTotal = () => {} } = this.props;
                getDocTotal('TODO');
              }}
            >
              <Icon type="replay" className={styles.replayIcon} />
              <a>{intl.get('swbh.common.model.common.replay').d('刷新')}</a>
            </div>
          </li>
        </>
      );
    };

    const docMenuProps = {
      // totalLoading,
      changeTab: this.changeTab,
      changeSwbnCardVisible,
      selectedKey,
      swbhCards: this?.props?.swbhCards || {},
      swbhMode,
      changeCurrentCarousel,
      swbnCardVisible,
      showGuide,
    };

    return (
      <Fragment>
        <Row type="flex" className={`${styles.documentBox} swbnDocumentListContainer`}>
          <Col className={styles.docMenu}>
            <DocMenu docMenuProps={docMenuProps} />
          </Col>
          <Col
            id="notificationBox"
            className={`${styles.documentTable} ${isShowBusinessType ? '' : styles.noBusinessTypeTable} ${
              currentBusinessType ? styles.selectedBusinessTypeTable : ''
            } ${isNotShowShowOrder ? styles.notShowShowOrder : ''}`}
          >
            {isOpenNotification ? <Notification /> : null}

            {selectedKey !== 'TRANSFER' ? (
              <>
                <SearchBar
                  key={searchCode}
                  onRef={(ref) => {
                    this.SearchBarRef = ref;
                    // onRef(ref);
                  }}
                  autoQuery={false}
                  searchCode={searchCode || 'SWBH.ROLE_WORK_BENCH.TODO_SEARCH'}
                  defaultExpand={false}
                  dataSet={[this.documentTableDs]}
                  left={{ render: () => this.leftRender(docTypeSource) }}
                  right={{ render: () => this.rightRender(isShowBusinessType) }}
                  closeMergeSearchInput
                  onlyModelField
                  onlySiteField
                  onQuery={this.onQuery}
                  // closeFilterSelector
                  onClear={this.resetQueryDs}
                  onReset={this.resetQueryDs}
                  onLoad={this.handleLoad}
                  onFieldChange={this.onFieldChange}
                  parseUrlParamsType="decode"
                  parseUrlParamsKey={customizeFilterFields && initFlag ? 'customizeFilterFields' : null}
                  fieldProps={{
                    supplierCompanyId: {
                      dynamicProps: {
                        lovPara: () => ({
                          tenantId: getCurrentOrganizationId(),
                        }),
                      },
                    },
                    // version: {
                    //   precision: 0,
                    // },
                  }}
                />
                {isNoData ? (
                  <NoData />
                ) : (
                  <CommonTable
                    queryBar="none"
                    dataSet={this.documentTableDs}
                    showOperation={!(selectedKey === 'INITIATE' || selectedKey === 'HANDLE')}
                    changePagination={this.changePagination}
                    onRow={this.onRow}
                    setActiveRow={this.setActiveRow}
                    selectedKey={selectedKey}
                    attentionIgnore={this.attentionIgnore}
                    attentionIgnoreLoading={attentionIgnoreLoading}
                    // spin={{ spinning: tableLoading || totalLoading || false }}
                    todoDocSetTimer={this.setTimer}
                  />
                )}
              </>
            ) : isNoData ? (
              <NoData />
            ) : (
              <Spin spinning={tableLoading || totalLoading || false}>
                <div className={styles.transferList}>{this.docTypeListRender(docTypeList)}</div>
              </Spin>
            )}
          </Col>
        </Row>
      </Fragment>
    );
  }
}
