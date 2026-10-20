/**
 * ApplyToInquiry - 申请转询价
 * @date: 2019-3-28
 * @author: ZT <tong.zhao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Table, Button, Modal, Popover, Form } from 'hzero-ui';
import { DataSet, Modal as C7nModal } from 'choerodon-ui/pro';
import { connect } from 'dva';
import querystring from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
import Upload from 'srm-front-boot/lib/components/Upload';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getActiveTabKey } from 'utils/menuTab';
import { compose, throttle, isEmpty } from 'lodash';
import remoteHoc from 'hzero-front/lib/utils/remote';

import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';

import { numberSeparatorRender } from '@/utils/renderer';
import { dateFormate, isText, applyToNotification, getUomName, getQtyName } from '@/utils/utils';
import { INQUIRY, getSourceCategoryName, BID } from '@/utils/globalVariable';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import { PRIVATE_BUCKET } from '_utils/config';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { fetchConfigSheet, offlineWholeService } from '@/services/inquiryHallNewService';
import { offlineWholeDS } from '@/routes/ssrc/InquiryHallNew/indexDS';
import OfflineWholeModal from '@/routes/ssrc/InquiryHallNew/OfflineWholeModal';
import FilterForm from './FilterForm';
import BidFilterForm from './BidFilterForm';
import CreateModal from './CreateModal';
import PriceModal from './PriceModal';

class ApplyToInquiryComponent extends Component {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
    visible: false,
    // temporaryCreate: false, // 临时跳转新寻源维护
    priceModalVisible: false, // 参考价格是否可见
    priceModal: {}, // 需要带入到参考价格里的参数
    doubleUnitFlag: false, // 判断是否开启双单位
    offlineWholeFlag: false, // 判断是否开启整单线下录入
    scuxStateParams: undefined, // 为二开埋入参数
    offlineWholeLoading: false, // 线下整单新建loading
  };

  filterForm;

  offlineWholeDs = new DataSet(offlineWholeDS());

  C7nModalKey = C7nModal.key();

  componentDidMount() {
    const {
      dispatch,
      applyToInquirySearchData,
      location: { state: { _back = 0 } = {}, pathname, search = '' },
    } = this.props;
    if (_back === -1) {
      this.props.history.replace(pathname + search, {}); // 此代码是为了替换掉state但不会刷新页面
      this.setDS([
        'ouLov',
        'categoryLov',
        'purchaseAgentLov',
        'itemLov',
        'invOrganizationLov',
        'executorBysLov',
        'prTypeLov',
      ]);
      this.filterForm.deleteAttr(applyToInquirySearchData, [
        'ouId',
        'categoryId',
        'purchaseAgentId',
        'itemId',
        'invOrganizationId',
        'executorBys',
        'prTypeId',
      ]);
      this.onSearchData(applyToInquirySearchData, 1);
      this.queryDoubleUnit();
      this.fetchOfflineWhole();
      return;
    }
    // 如果不是子页面返回则重置查询的数据
    dispatch({
      type: `${this.props.modelName}/updateApplyToInquirySearchData`,
      payload: {
        type: 'reset',
        params: {},
      },
    });
    this.onSearchData();
    this.queryValueCode(); // 查询是否是外协的值集
    this.queryDoubleUnit();
    this.fetchOfflineWhole();
  }

  componentWillUnmount() {
    this.clearPageCacheData();
  }

  // clear data
  clearPageCacheData = () => {
    const { dispatch, modelName } = this.props;

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        applyToInquiryLine: [],
        applyToInquiryPagination: {},
      },
    });
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  sourceCategoryName = getSourceCategoryName(this.props.sourceKey === BID);

  sourceKey = this.props.sourceKey || INQUIRY;

  setDS = (list) => {
    const { applyToInquirySearchData } = this.props;
    const arr = [
      'ouId',
      'categoryId',
      'purchaseAgentId',
      'itemId',
      'invOrganizationId',
      'executorBys',
      'prTypeId',
    ];
    list.forEach((ele, index) => {
      // eslint-disable-next-line no-unused-expressions
      this.filterForm.ds?.current?.set(ele, applyToInquirySearchData[arr[index]]);
    });
  };

  /**
   * 查询是否外协值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    const lovCodes = {
      projectCategoryCode: 'SPUC.PR_LINE_PROJECT_CATEHORY', // 是否是外协
    };
    dispatch({
      type: `${this.props.modelName}/batchCode`,
      payload: {
        lovCodes,
      },
    });
  }

  // 判断路由来自于申请转整单还是申请转询价
  @Bind()
  judgeRouteSourceRequest() {
    const { match: { params } = {} } = this.props;
    return params?.sourceRequest === 'OFFLINE_ENTER'; // 来源于整单线下
  }

  @Bind()
  onSearchData(params = {}, isFirstFromRfxDetail = 0) {
    const { dispatch, organizationId, applyToInquiryPagination, remote, inquiryHall } = this.props;
    const { pageSize } = applyToInquiryPagination;
    const { isStandardModelsFlag } = inquiryHall || {};
    const erpControlFlag = 1;
    if (params.neededDateStart && params.neededDateEnd) {
      const startDate = new Date(dateFormate(params.neededDateStart, 'YYYY/MM/DD')).getTime();
      const endDate = new Date(dateFormate(params.neededDateEnd, 'YYYY/MM/DD')).getTime();
      if (startDate > endDate) {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: intl
            .get(`ssrc.inquiryHall.view.message.demandDateComparison`)
            .d('需求日期至须比需求日期从的日期晚'),
        });
        return;
      }
      // 需求日期从，需求日期至都存在时，校验日期
    }

    const payloadProps = {
      organizationId,
      page: isFirstFromRfxDetail ? applyToInquiryPagination : { pageSize: pageSize || 100 },
      ...params,
      erpControlFlag,
      ...(isStandardModelsFlag ? { asyncCountFlag: 'DEFAULT' } : null),
      sourceDocumentType: this.sourceKey === 'BID' ? 'NEW_BID' : 'RFX',
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL.APPLY_TO_INQUIRY.LIST,SSRC.${this.sourceKey}_HALL.APPLY_TO_INQUIRY.FILTER`,
    };

    const remoteProps = {
      pageSize,
      isFirstFromRfxDetail,
      applyToInquiryPagination,
      bidFlag: this.sourceKey === BID,
    };

    const payload = remote
      ? remote.process('SSRC_APPLY_TO_INQUIRY_PROCESS_FILTER_PARAMS', payloadProps, remoteProps)
      : payloadProps;
    if (isStandardModelsFlag) {
      dispatch({
        type: `${this.props.modelName}/fetchApplyToInquiry`,
        payload,
      }).then((res) => {
        if (res && res.needCountFlag === 'Y') {
          dispatch({
            type: `${this.props.modelName}/fetchApplyToInquiryPage`,
            payload,
          });
        }
      });
    } else {
      dispatch({
        type: `${this.props.modelName}/fetchApplyToInquiry`,
        payload,
      });
    }
  }

  // 查询整单线下寻源是否开启
  async fetchOfflineWhole() {
    const { organizationId } = this.props;
    let data = null;
    try {
      if (this.sourceKey === INQUIRY) {
        data = getResponse(
          await fetchConfigSheet({
            configCode: 'ssrc_rfx_offline_whole_config',
            organizationId,
            data: {
              tenantNum: getCurrentTenant().tenantNum,
            },
          })
        );
        if (data && !data.failed) {
          // 现在判断配置表查出来的是开启的，以后要改成没有查出来的是开启的
          if (!isEmpty(data)) {
            this.setState({ offlineWholeFlag: true });
          } else {
            this.setState({ offlineWholeFlag: false });
          }
        }
      }
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  onHandlePagination(page = {}) {
    const {
      dispatch,
      organizationId,
      inquiryHall,
      // applyToInquiryPagination: { total },
    } = this.props;
    const { isStandardModelsFlag } = inquiryHall || {};
    const erpControlFlag = 1;
    const value = this.filterForm && this.filterForm.props.form.getFieldsValue();
    value.requestDateStart = value.requestDateStart
      ? value.requestDateStart.format('YYYY-MM-DD 00:00:00')
      : undefined; // 格式化申请日期从时间
    value.requestDateEnd = value.requestDateEnd
      ? value.requestDateEnd.format('YYYY-MM-DD 00:00:00')
      : undefined; // 格式化申请日期至时间
    if (value.neededDateStart && value.neededDateEnd) {
      const startDate = new Date(dateFormate(value.neededDateStart, 'YYYY/MM/DD')).getTime();
      const endDate = new Date(dateFormate(value.neededDateEnd, 'YYYY/MM/DD')).getTime();
      if (startDate > endDate) {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: intl
            .get(`ssrc.inquiryHall.view.message.demandDateComparison`)
            .d('需求日期至须比需求日期从的日期晚'),
        });
        return;
      }
      // 需求日期从，需求日期至都存在时，校验日期
    }
    value.neededDateStart = value.neededDateStart
      ? value.neededDateStart.format('YYYY-MM-DD 00:00:00')
      : undefined;
    value.neededDateEnd = value.neededDateEnd
      ? value.neededDateEnd.format('YYYY-MM-DD 00:00:00')
      : undefined;
    const values = {
      ...value,
      ouIdString: value.ouId?.map((ele) => ele.ouId).join(','),
      categoryIdString: value.categoryId?.map((ele) => ele.categoryId).join(','),
      purchaseAgentIdString: value.purchaseAgentId?.map((ele) => ele.purchaseAgentId).join(','),
      itemIdString: value.itemId?.map((ele) => ele.itemId).join(','),
      invOrganizationIdString: value.invOrganizationId?.map((ele) => ele.organizationId).join(','),
      executorBysString: value.executorBys?.map((ele) => ele.userId).join(','),
      prTypeIdString: value.prTypeId?.map((ele) => ele.prTypeId).join(','),
    };
    this.filterForm.deleteAttr(values, [
      'ouId',
      'categoryId',
      'purchaseAgentId',
      'itemId',
      'invOrganizationId',
      'executorBys',
      'prTypeId',
    ]);
    const payload = {
      organizationId,
      page,
      erpControlFlag,
      ...values,
      ...(isStandardModelsFlag ? { asyncCountFlag: 'DEFAULT' } : null),
      // oldTotalElements: total,
      sourceDocumentType: this.sourceKey === 'BID' ? 'NEW_BID' : 'RFX',
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL.APPLY_TO_INQUIRY.LIST,SSRC.${this.sourceKey}_HALL.APPLY_TO_INQUIRY.FILTER`,
    };
    if (isStandardModelsFlag) {
      dispatch({
        type: `${this.props.modelName}/fetchApplyToInquiry`,
        payload,
      }).then((res) => {
        if (res && res.needCountFlag === 'Y') {
          dispatch({
            type: `${this.props.modelName}/fetchApplyToInquiryPage`,
            payload,
          });
        }
      });
    } else {
      dispatch({
        type: `${this.props.modelName}/fetchApplyToInquiry`,
        payload,
      });
    }
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 选择数据点击创建
   */
  @Debounce(800)
  @Bind()
  checkBeforeCreateInquiry() {
    const { dispatch, organizationId, remote } = this.props;
    const { selectedRowKeys, offlineWholeFlag, selectedRows = [] } = this.state;
    if (selectedRowKeys.length === 0) {
      Modal.error({
        content: intl
          .get('ssrc.inquiryHall.view.message.notification.oneRowSelect')
          .d('请选择至少一行数据'),
      });
      return;
    }
    const fetch = dispatch({
      type: `${this.props.modelName}/newBatchValidatePurchase`,
      payload: {
        organizationId,
        prLineIdList: selectedRowKeys,
        sourceFrom: 'DEMAND_POOL',
        sourceDocumentType: this.sourceKey === 'BID' ? 'NEW_BID' : 'RFX',
        configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.APPLY_TO_INQUIRY.LIST,SSRC.${this.sourceKey}_HALL.APPLY_TO_INQUIRY.FILTER`,
      },
    });
    if (fetch && fetch.then) {
      fetch.then((res) => {
        if (res) {
          const validateCallBackRes = validatorConfirmModal({
            response: res,
            validatorType: 'highestValidatorType',
            validatorArrName: 'validateResults',
            onOk: throttle(async () => {
              // 校验不通过， 后端返回returnDetail对象
              if (res?.returnDetail?.secondaryUomInconsistentFlag === 1) {
                applyToNotification(res?.returnDetail?.secondaryUomInconsistentMes);
              }
              if (offlineWholeFlag) {
                if (this.judgeRouteSourceRequest()) {
                  // 整单线下
                  return this.createOfflineEntry('applyToInquiry');
                }
                this.openOfflineModal();
              } else if (remote?.event) {
                remote.event.fireEvent('setCreateModalVisible', {
                  that: this,
                  createInquiry: this.createInquiry,
                  bidFlag: this.sourceKey === BID,
                  selectedRows,
                });
              } else {
                this.setState({ visible: true });
              }
            }, 1200),
          });
          if (!validateCallBackRes?.returnDetail) {
            // 如果校验通过，后端直接返回returnDetail包裹的那个对象
            if (res.secondaryUomInconsistentFlag === 1) {
              applyToNotification(res.secondaryUomInconsistentMes);
            }
            if (offlineWholeFlag) {
              if (this.judgeRouteSourceRequest()) {
                // 整单线下
                return this.createOfflineEntry('applyToInquiry');
              }
              this.openOfflineModal();
            } else if (remote?.event) {
              remote.event.fireEvent('setCreateModalVisible', {
                that: this,
                createInquiry: this.createInquiry,
                bidFlag: this.sourceKey === BID,
                selectedRows,
              });
            } else {
              this.setState({ visible: true });
            }
          }
        }
      });
    }
  }

  @Bind()
  openOfflineModal() {
    const OfflineWholeProps = {
      sourceFrom: 'applyToInquiry',
      offlineWholeDs: this.offlineWholeDs,
    };
    C7nModal.open({
      key: this.C7nModalKey,
      drawer: true,
      destroyOnClose: true,
      title: intl.get('ssrc.inquiryHall.view.message.title.selectedSourceMethod').d('选择寻源方式'),
      children: <OfflineWholeModal {...OfflineWholeProps} />,
      style: { width: '25%' },
      onOk: async () => {
        if (!(await this.offlineWholeDs.validate())) {
          // 防止弹框关闭
          return false;
        }
        this.offlineModalOk('applyToInquiry');
      },
      onCancel: () => this.offlineWholeDs.reset(),
    });
  }

  @Debounce(800)
  @Bind()
  async offlineModalOk() {
    const offlineData = this.offlineWholeDs.current.toData();
    this.offlineWholeDs.reset();
    const { templateLov = {} } = offlineData;
    this.createInquiry({ templateId: templateLov?.templateId });
  }

  // 创建整单线下
  @Bind()
  async createOfflineEntry(sourcePageFrom) {
    const { organizationId, history } = this.props;
    let data = null;
    this.setState({ offlineWholeLoading: true });
    try {
      const params = {
        sourcePageFrom,
        organizationId,
        prLineIdList: this.state.selectedRowKeys,
        prLineList: this.state.selectedRows,
        sourceFrom: 'DEMAND_POOL',
        sourceDocumentType: 'RFX',
        configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
      };
      data = getResponse(await offlineWholeService(params));
      if (data && !data.failed) {
        notification.success();
        const { rfxHeaderId = null } = data?.rfxHeader;
        if (rfxHeaderId) {
          history.push({
            pathname: `/ssrc/new-inquiry-hall/whole-update/${rfxHeaderId}`,
          });
        }
      }
      this.setState({ offlineWholeLoading: false });
    } catch (e) {
      this.setState({ offlineWholeLoading: false });
      throw e;
    }
  }

  /**
   * 选择寻源模板,申请转询价
   * @param params
   */
  @Bind()
  createInquiry(params = {}) {
    if (!params || !params?.templateId) {
      return;
    }

    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `${this.props.modelName}/createApplyToInquiry`,
      payload: {
        organizationId,
        prLineIdList: this.state.selectedRowKeys,
        prLineList: this.state.selectedRows,
        ...params,
        sourceFrom: 'DEMAND_POOL',
        configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ visible: false, selectedRows: [], selectedRowKeys: [] });
        const activeTabKey = getActiveTabKey();
        const { rfxHeader } = res;
        const { rfxHeaderId, expertScoreType, sourceCategory, preQualificationFlag } = rfxHeader;
        const searchParam = {
          expertScoreType,
          sourceCategory,
          preQualificationFlag,
          fromPageType: activeTabKey !== '/ssrc/inquiry-hall' ? 'applyToInquiry' : null,
        };
        const searchProps = querystring.stringify(filterNullValueObject(searchParam));
        // 这里路径前缀做判断而不是直接使用activeTabKey，是为了适配角色工作台直接在申请转询价页面创建跳转维护页面功能
        const prefixUrl =
          activeTabKey === '/ssrc/inquiry-hall' || activeTabKey === '/ssrc/bid-hall'
            ? activeTabKey
            : `/ssrc/new-${this.sourceKey === BID ? 'bid' : 'inquiry'}-hall`;

        dispatch(
          routerRedux.push({
            pathname:
              this.sourceKey === BID
                ? `${prefixUrl}/bid-update/${rfxHeaderId}`
                : `${prefixUrl}/${
                    prefixUrl === '/ssrc/inquiry-hall' ? 'rfx-update' : 'rfx-update-new'
                  }/${rfxHeaderId}`,
            search: searchProps,
          })
        );
      }
    });
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  @Bind()
  getBackPath() {
    const activeTabKey = getActiveTabKey();
    return `${activeTabKey}/list`;
  }

  @Bind()
  handlePrice(record) {
    const priceModal = {
      supplierCompanyId: record.supplierCompanyId,
      itemId: record.itemId,
      purchaseOrgId: record.purchaseOrgId,
      companyId: record.companyId,
      ouId: record.ouId,
      invOrganizationId: record.invOrganizationId,
      uomId: record.uomId,
      prLineId: record.prLineId,
    };
    this.setState({ priceModalVisible: true, priceModal });
  }

  /**
   * 查询条件提示
   * @param {string} tip - 提示组件
   * @param {boolean} visible - 是否可见
   */
  @Bind()
  hideModal() {
    this.setState({
      priceModalVisible: false,
    });
  }

  /**
   * 方法重写
   * @protected 阳光能源禁止修改、删除此方法名
   */
  renderCreateModal = (props = {}) => {
    return <CreateModal {...props} />;
  };

  // 页面标题
  getPageTitle = () => {
    if (this.judgeRouteSourceRequest()) {
      return intl.get('ssrc.inquiryHall.view.button.applyToWholeEntry').d('申请转整单线下');
    }
    return intl
      .get(`ssrc.inquiryHall.view.message.title.commonApplyToInquiry`, {
        sourceCategoryName: this.sourceCategoryName,
      })
      .d(`申请转{sourceCategoryName}`);
  };

  render() {
    const {
      sourceKey,
      organizationId,
      loading,
      applyToInquiryLine = [],
      applyToInquiryPagination = {},
      createLoading = false,
      customizeTable = () => {},
      customizeFilterForm = () => {},
      [this.props?.modelName]: { code = {} },
      remote,
      history,
      validateLoading,
    } = this.props;
    const { projectCategoryCode = [] } = code || {};
    const {
      selectedRows,
      visible,
      selectedRowKeys,
      priceModalVisible,
      priceModal,
      doubleUnitFlag,
      offlineWholeLoading,
    } = this.state;
    const preColumns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationNum`).d('申请编号'),
        dataIndex: 'displayPrNum',
        fixed: 'left',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
        dataIndex: 'displayLineNum',
        fixed: 'left',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.referencePr').d('参考价格'),
        dataIndex: 'referencePrice',
        width: 90,
        render: (_, record) => {
          const { itemCode, referencePriceDisplayFlag } = record;
          if (itemCode && referencePriceDisplayFlag) {
            return (
              <a onClick={() => this.handlePrice(record)}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.referencePr').d('参考价格')}
              </a>
            );
          }
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.commonName`).d('通用名'),
        dataIndex: 'commonName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 100,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 130,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantities`).d('数量'),
            dataIndex: 'secondaryQuantity',
            width: 80,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.occupiedQuantity`).d('剩余可占用数量'),
        dataIndex: 'occupiedQuantity',
        width: 140,
        render: (val, record) =>
          doubleUnitFlag
            ? numberSeparatorRender(record.secondaryOccupiedQuantity)
            : numberSeparatorRender(val),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 80,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'quantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 120,
        render: (value) => value && dateRender(value),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedName`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 130,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.demandExecutor`).d('需求执行人'),
        dataIndex: 'executorName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
        dataIndex: 'unitName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.requestDate`).d('申请日期'),
        dataIndex: 'requestDate',
        width: 170,
        render: (value) => value && dateRender(value),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prSourcePlatform`).d('数据来源'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 130,
      },
      // {
      //   title: intl.get(`ssrc.inquiryHall.model.inquiryHall.executorName`).d('分配人'),
      //   dataIndex: 'executorName',
      //   width: 150,
      // },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.assignedDate`).d('最后分配时间'),
        dataIndex: 'assignedDate',
        width: 170,
        render: (value) => value && dateTimeRender(value),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.drawingNum`).d('图号'),
        dataIndex: 'drawingNum',
        width: 130,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.drawingVersion`).d('图纸版本'),
        dataIndex: 'drawingVersion',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.surfaceFlag`).d('表面处理'),
        dataIndex: 'surfaceTreatFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemCode',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNumDesc`)
          .d('供应商料号描述'),
        dataIndex: 'supplierItemNumDesc',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectCategory`).d('项目类别'),
        dataIndex: 'projectCategoryMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prTypeName`).d('申请类型'),
        dataIndex: 'prTypeName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.demandAccessories`).d('需求附件'),
        dataIndex: 'attachmentUuid',
        width: 140,
        render: (val) => (
          <Upload
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-applyToInquiry"
            attachmentUUID={val || undefined}
            tenantId={organizationId}
            viewOnly
            filePreview
          />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.requirementDesc`).d('需求描述'),
        dataIndex: 'headerRemark',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedSupplier`).d('建议供应商'),
        dataIndex: 'supplierCompanyName',
        width: 180,
      },
    ].filter(Boolean);

    const columns = remote
      ? remote.process('SSRC_APPLY_TO_INQUIRY_PROCESS_COLUMNS', preColumns, { history })
      : preColumns;
    const scrollWidth = this.scrollWidth(columns, 0);
    /**
     * 增加参数在二开项目使用
     * @protected (【山鹰】二开)禁止修改、删除selectedRows
     */
    const createModalProps = {
      visible,
      createLoading,
      bidFlag: sourceKey === BID,
      createInquiry: this.createInquiry,
      onCancel: () => this.setState({ visible: false }),
      selectedRows,
      selectedRowKeys,
      remote,
      state: this.state,
    };
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const filterFormProps = {
      loading,
      sourceKey: this.sourceKey,
      bidFlag: sourceKey === BID,
      organizationId,
      onSearch: this.onSearchData,
      projectCategoryCode,
      customizeFilterForm,
      onRef: (ref) => {
        this.filterForm = ref;
      },
    };
    const priceModalProps = {
      visible: priceModalVisible,
      priceModal,
      hideModal: this.hideModal,
    };

    // 新建按钮loading
    const createButtonLoading = this.judgeRouteSourceRequest()
      ? validateLoading || offlineWholeLoading
      : false;

    return (
      <React.Fragment>
        <Header backPath={this.getBackPath()} title={this.getPageTitle()}>
          <Button
            icon="plus"
            type="primary"
            loading={
              remote
                ? remote.process(
                    'SSRC_APPLY_TO_INQUIRY_PROCESS_BUTTON_LOADING',
                    createButtonLoading,
                    {
                      createLoading,
                      bidFlag: sourceKey === BID,
                      scuxStateParams: this.state.scuxStateParams,
                    }
                  )
                : createButtonLoading
            }
            onClick={() => this.checkBeforeCreateInquiry()}
          >
            {intl.get('hzero.common.create').d('创建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            {this.sourceKey === 'BID' ? (
              <BidFilterForm {...filterFormProps} />
            ) : (
              <FilterForm {...filterFormProps} />
            )}
          </div>
          {customizeTable(
            {
              code: `SSRC.${this.sourceKey}_HALL.APPLY_TO_INQUIRY.LIST`,
            },
            <Table
              scroll={{ x: scrollWidth }}
              dataSource={applyToInquiryLine}
              rowSelection={rowSelection}
              pagination={applyToInquiryPagination}
              onChange={this.onHandlePagination}
              loading={loading}
              columns={columns}
              bordered
              rowKey="prLineId"
            />
          )}
        </Content>
        {visible && this.renderCreateModal(createModalProps)}
        {priceModalVisible && <PriceModal {...priceModalProps} />}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL.APPLY_TO_INQUIRY.LIST', // 列表
        'SSRC.INQUIRY_HALL.APPLY_TO_INQUIRY.FILTER',
      ],
    }),
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      applyToInquirySearchData: inquiryHall.applyToInquirySearchData,
      applyToInquiryLine: inquiryHall.applyToInquiryLine,
      applyToInquiryPagination: inquiryHall.applyToInquiryPagination,
      loading: loading.effects['inquiryHall/fetchApplyToInquiry'],
      createLoading: loading.effects['inquiryHall/createApplyToInquiry'],
      validateLoading: loading.effects['inquiryHall/newBatchValidatePurchase'],
      organizationId: getCurrentOrganizationId(),
      modelName: 'inquiryHall',
    })),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.common', 'hzero.common'],
    }),
    Form.create({ fieldNameProp: null }),
    remoteHoc(
      {
        code: 'SSRC_APPLY_TO_INQUIRY',
        name: 'remote',
      },
      {
        events: {
          setCreateModalVisible(eventProps) {
            const { that } = eventProps || {};
            that.setState({
              visible: true,
            });
          },
        },
      }
    )
  )(Com);
};

export default HOCComponent(ApplyToInquiryComponent);
export { HOCComponent, ApplyToInquiryComponent };
