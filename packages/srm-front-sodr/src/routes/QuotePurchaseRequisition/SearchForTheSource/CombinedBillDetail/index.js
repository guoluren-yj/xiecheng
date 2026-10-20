/**
 * LineCreation - 按行引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Modal, Form, Tabs } from 'hzero-ui';
import { connect } from 'dva';

import { isEmpty, merge, filter, isNil, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import { Header, Content } from 'components/Page';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import {
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  delItemsToPagination,
  addItemsToPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DATETIME_MIN, DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz';

import { BUCKET_NAME, THROTTLE_TIME } from '@/routes/components/utils/constant';
import { validateLineCalculate, queryCommonDoubleUomConfig } from '@/routes/components/utils';
import PurchaseRequestHeader from '../Detail/PurchaseRequestHeader';
import PurchaseLineInfo from '../Detail/PurchaseLineInfo';
import styles from './Header.less';

const { Panel } = Collapse;

const { TabPane } = Tabs;

@formatterCollections({
  code: [
    'sodr.quotePurchaseRequisition',
    'sodr.common',
    'entity.attachment',
    'sodr.orderMaintain',
    'sodr.quotePurchase',
    'hpfm.employee',
    'srm.common',
    'sodr.workspace',
  ],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
    'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
  ],
})
@connect(({ loading, quotePurchaseRequisition }) => ({
  fetchDetailTableLoading: loading.effects['quotePurchaseRequisition/fetchDetailTable'],
  saveLoading: loading.effects['quotePurchaseRequisition/add'],
  newAddLoading: loading.effects['quotePurchaseRequisition/newAdd'],
  submitDetailLoading: loading.effects['quotePurchaseRequisition/submitDetail'],
  deleteDeliveryLoading: loading.effects['quotePurchaseRequisition/deleteSheetDelivery'],
  deleteLineRemoteLoaing: loading.effects['quotePurchaseRequisition/deleteLineRemote'],
  queryCreateListLoading: loading.effects['quotePurchaseRequisition/queryDetailCreateList'],
  queryDetailHeaderLoading: loading.effects['quotePurchaseRequisition/queryDetailHeader'],
  queryDetailListLoading: loading.effects['quotePurchaseRequisition/queryDetailList'],
  checkInvOrganizationLoading: loading.effects['quotePurchaseRequisition/checkInvOrganization'],
  validating: loading.effects['quotePurchaseRequisition/appendValidate'],
  quotePurchaseRequisition,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { cacheKey, sourcePage, entrance } = querystring.parse(search.substr(1));
    this.state = {
      cacheKey,
      sourcePage,
      entrance,
      dimensions: [], // tab数据
      poHeaderIdList: {}, // 初始化的id(对象内置id)
      nowId: null, // 当前tab页的id
      lovRecord: {},
      orderHeaderFormDataSource: {}, // 头form数据源
      listCommonDataSource: [], // 表格数据源
      listCommonPagination: {}, // 表格分页
      collapseKeys: ['orderHeaderInfo', 'orderLineInfo'], // 打开的折叠面板key
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      isHeaderInfoFormDataSource: false, // 表格头数据是否加载完成
      tenantId: getCurrentOrganizationId(),
      selectedListRows: [],
      oldList: [], // 数据备份
      customizeCode: '', // 个性化编码
      returnOrderFlag: null,
      initialAttachmentUuid: '', // 初始化外部附件
      initialPurchaserInnerAttachmentUuid: '', // 初始化内部附件
      doubleUnitEnabled: 0,
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    this.fetchEnum();
    this.fetchDetailTable();
    this.queryDoubleUomConfig();
    window.addEventListener('message', this.handleEvent);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleEvent);
  }

  @Bind()
  handleEvent(e) {
    if (e.data === 'sodr/purchase-order-maintain/list') {
      this.fetchDetailHeader();
    }
  }

  /**
   * 查询列表值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({ type: 'quotePurchaseRequisition/fetchEnum' });
  }

  /**
   * 查询双单位配置
   */
  @Bind()
  async queryDoubleUomConfig() {
    const result = await queryCommonDoubleUomConfig();
    this.setState({
      doubleUnitEnabled: result || 0,
    });
  }

  @Bind()
  fetchDetailTable(numId) {
    const { dispatch } = this.props;
    const { cacheKey } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/fetchDetailTable',
      payload: { cacheKey },
    }).then((res) => {
      if (res) {
        this.setState({
          dimensions: res instanceof Array ? res : [],
          poHeaderIdList: res[0] || {}, // 默认获取第一条数据,取id
          nowId: res[0]?.poHeaderId || null,
        });
        this.fetchDetailHeader(numId);
      }
    });
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader(numId) {
    const { dispatch, form } = this.props;
    const { poHeaderIdList } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailHeader',
      payload: {
        poHeaderId: numId || poHeaderIdList.poHeaderId,
        customizeUnitCode: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
      },
    }).then((res) => {
      if (res) {
        const lovRecord = {};
        [
          'supplierCompanyId',
          'supplierCompanyName',
          'supplierTenantId',
          'supplierId',
          'supplierName',
          'supplierCode',
        ].forEach((n) => {
          lovRecord[n] = res[n];
        });
        const { attachmentUuid = '', purchaserInnerAttachmentUuid = '', poSourcePlatform } = res;
        const code = this.getCustomizeCode(poSourcePlatform);
        this.fetchDetailList(numId);
        this.setState(
          {
            orderHeaderFormDataSource: {
              ...res,
              prepayFlag: isNil(res.prepayFlag) ? 0 : res.prepayFlag,
            },
            lovRecord,
            customizeCode: code,
          },
          () => {
            form.resetFields();
          }
        );
        Promise.all(
          [attachmentUuid, purchaserInnerAttachmentUuid]
            .filter((n) => !n)
            .map(() => {
              return this.createUuid();
            })
        ).then((response) => {
          if (response && response.length > 0) {
            this.setState({
              initialAttachmentUuid: response[0].content,
              initialPurchaserInnerAttachmentUuid:
                response.length === 2 ? response[1].content : response[0].content,
            });
          }
        });
      }
    });
  }

  /**
   * 拆分
   */
  @Bind()
  handleTranslate(record) {
    const { listCommonDataSource = [], listCommonPagination = {} } = this.state;
    const newItem = {
      ...record,
      poLineId: uuid(),
      // prLineId: uuid(),
      displayLineNum: null,
      poLineLocationId: null,
      _status: 'create',
      // objectVersionNuber: null,
      // _token: null,
    };
    const indexList = listCommonDataSource.findIndex((e) => e.poLineId === record.poLineId);
    listCommonDataSource.splice(indexList + 1, 0, newItem);
    const newPagaination = addItemsToPagination(
      1,
      listCommonDataSource.length,
      listCommonPagination
    );
    this.setState({
      listCommonDataSource,
      listCommonPagination: newPagaination,
    });
  }

  @Bind()
  createUuid() {
    const { dispatch } = this.props;
    return new Promise((resolve) => {
      dispatch({
        type: 'quotePurchaseRequisition/createUuid',
      }).then((res) => {
        if (res) {
          return resolve(res);
        }
      });
    });
  }

  /**
   * getCustomizeCode - 获取个性化编码
   */
  @Bind()
  getCustomizeCode(poSourcePlatform) {
    let code;
    switch (poSourcePlatform) {
      case 'ERP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP';
        break;
      case 'E-COMMERCE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC';
        break;
      case 'SRM':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'SHOP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'CATALOGUE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE';
        break;
      default:
        code = null;
        break;
    }
    return code;
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} page - 查询条件
   */
  @Bind()
  fetchDetailList(numId, page = {}) {
    const {
      dispatch,
      quotePurchaseRequisition: { enumMap },
    } = this.props;
    const { poHeaderIdList, customizeCode = '' } = this.state;
    const { internationalTelCode = [] } = enumMap;
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailList',
      payload: {
        poHeaderId: numId || poHeaderIdList.poHeaderId,
        page,
        poEntryPoint: 'PO_MAINTAIN_DETAIL',
        customizeUnitCode: customizeCode,
      },
    }).then((res) => {
      if (res && res.content) {
        this.setState(
          {
            selectedListRows: [],
            listCommonDataSource: res.content.map((n) => ({
              ...n,
              _status: 'update',
              prLineId: n.prLineId || uuid(),
              uuidFlag: !n.prLineId,
              tmpOrganizationId: n.invOrganizationId,
              internationalTelCode: n.internationalTelCode || internationalTelCode[0].value,
            })),
            oldList: res.content.map((n) => ({
              ...n,
              _status: 'update',
              prLineId: n.prLineId || uuid(),
              uuidFlag: !n.prLineId,
              tmpOrganizationId: n.invOrganizationId,
            })),
            listCommonPagination: createPagination(res),
          },
          () =>
            this.state.listCommonDataSource.forEach((i) => {
              if (i.$form) {
                i.$form.resetFields();
              }
            })
        );
      }
    });
  }

  // /**
  //  * 修改公司Lov数据
  //  * @param {Array} lovRecord
  //  */
  @Bind()
  onChangeCompany(lovRecord) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const {
      ouId,
      ouName,
      ouCode,
      purchaseOrgId,
      purchaseOrgName,
      purchaseAgentId,
      purchaseAgentName,
      invOrganizationId,
      invOrganizationName,
    } = lovRecord;
    const { orderHeaderFormDataSource, listCommonDataSource } = this.state;
    const newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      ouId,
      ouName,
      ouCode,
      // purchaseOrgId,
      purchaseOrgName,
      agentId: purchaseAgentId,
      agentName: purchaseAgentName,
    };
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    });
    setFieldsValue({ ouId, purchaseOrgId, agentId: purchaseAgentId, agentName: purchaseAgentName });
    const newListCommonDataSource = listCommonDataSource.map((item) => {
      return { ...item, invOrganizationId, invOrganizationName };
    });
    this.setState({
      listCommonDataSource: newListCommonDataSource,
    });
    listCommonDataSource.forEach((e) => {
      if (e.$form) {
        e.$form.setFieldsValue({
          invOrganizationId,
        });
      }
    });
  }

  @Bind()
  afterOpenUploadModal(attachmentUuid, record) {
    if (isEmpty(record.attachmentUuid) && record._status !== 'create') {
      this.getLineAttachmentUuid(attachmentUuid, record);
    }
  }

  /**
   * handleDeleteLines - 删除行
   */
  @Bind()
  handleDeleteLines(filtered, selectedListRows) {
    const { listCommonPagination, listCommonDataSource, nowId } = this.state;
    const remoteDelete = selectedListRows.filter((item) => item.poLineLocationId);
    if (remoteDelete.length > 0) {
      const newRemoteDelete = remoteDelete.map((item) => {
        return {
          ...item,
          versionNum: item.locationVersionNumber,
          canCreateAsnFlag: 0,
          tenantId: this.state.tenantId,
        };
      });
      this.handleDeleteLineRemote(newRemoteDelete).then((res) => {
        const isSuccessDeleted = isEmpty(res) && res !== undefined;
        if (isSuccessDeleted) {
          this.setState(
            {
              listCommonDataSource: filtered,
              listCommonPagination: delItemsToPagination(
                selectedListRows.length,
                listCommonDataSource,
                listCommonPagination
              ),
            },
            () => {
              notification.success();
              this.fetchDetailHeader();
              this.fetchDetailList(nowId);
            }
          );
        }
      });
    } else {
      this.setState({
        listCommonDataSource: filtered,
        listCommonPagination: delItemsToPagination(
          selectedListRows.length - remoteDelete.length,
          listCommonDataSource,
          listCommonPagination
        ),
      });
    }
  }

  /**
   * handleDeleteLines - 远程删除订单行
   */
  @Bind()
  handleDeleteLineRemote(filtered) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'quotePurchaseRequisition/deleteLineRemote',
      data: filtered,
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleCancelLines() {
    const {
      selectedListRows = [],
      listCommonPagination,
      listCommonDataSource,
      orderHeaderFormDataSource,
    } = this.state;
    const listCommonDataSourceDisplayLineNums = listCommonDataSource?.filter(
      (n) => n.displayLineNum
    );
    const selectedListRowsDisplayLineNums = selectedListRows?.filter((n) => n.displayLineNum);
    const existingDisplayLineNums = listCommonDataSourceDisplayLineNums?.filter(
      (n) => !selectedListRowsDisplayLineNums.includes(n)
    );
    const { poSourcePlatform } = orderHeaderFormDataSource;
    if (
      (listCommonDataSource.length === 1 ||
        selectedListRows.length >= listCommonDataSource.length ||
        existingDisplayLineNums.length === 0) &&
      (poSourcePlatform === 'SRM' || poSourcePlatform === 'ERP' || poSourcePlatform === 'SHOP')
    ) {
      notification.warning({
        message: intl.get(`sodr.common.view.message.moreThanOne`).d('订单至少有一个订单行。'),
      });
    } else {
      Modal.confirm({
        title: intl.get(`sodr.common.model.common.deltetList`).d('是否删除数据'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          () => {
            const selectedRowKeys = selectedListRows.map((item) => item.poLineId);
            const filtered = listCommonDataSource.filter(
              (item) => !selectedRowKeys.includes(item.poLineId)
            );
            this.handleDeleteLines(filtered, selectedListRows);
            this.setState({
              listCommonDataSource: filtered,
              listCommonPagination: delItemsToPagination(
                selectedListRows.length - selectedRowKeys.length,
                listCommonDataSource,
                listCommonPagination
              ),
              selectedListRows: filter(selectedListRows, { _status: 'update' }),
            });
          },
          THROTTLE_TIME,
          { trailing: false }
        ),
      });
    }
  }

  @Bind()
  getLineAttachmentUuid(attachmentUuid, record) {
    const { listCommonDataSource } = this.state;
    const { dispatch } = this.props;
    const { poLineId } = record;
    dispatch({
      type: 'quotePurchaseRequisition/getLineAttachmentUuid',
      data: { poLineId, attachmentUuid },
    }).then((res) => {
      if (res) {
        const newDataSource = listCommonDataSource.map((item) => {
          if (item.poLineId === res.poLineId) {
            const { attachmentUuid: newUuid, objectVersionNumber } = res;
            return {
              ...item,
              attachmentUuid: newUuid,
              lineVersionNumber: objectVersionNumber,
            };
          }
          return item;
        });
        this.setState({ listCommonDataSource: newDataSource });
      }
    });
  }

  // 保存和提交前校验是否存在双单位计算错误
  @Bind()
  validateUomCalc({ doubleUnitEnabled, data }) {
    if (doubleUnitEnabled && !validateLineCalculate({ data, type: 'h0' })) return false;
    return true;
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  save() {
    const { dispatch, form } = this.props;
    const {
      nowId,
      orderHeaderFormDataSource,
      tenantId,
      listCommonDataSource,
      lovRecord = {},
      customizeCode = '',
      doubleUnitEnabled,
    } = this.state;
    // listCommonDataSource.forEach(n => {
    //   if (!n.displayLineNum) {
    //     const nn = n;
    //     nn.poLineId = undefined;
    //   }
    // });
    const formAndListCustomizeCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    const { unSaveEnable, sourceBillTypeCode } = orderHeaderFormDataSource;
    if (unSaveEnable) {
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const data = {
            ...merge(orderHeaderFormDataSource, values),
            tenantId,
            supplierCompanyId: lovRecord.supplierCompanyId,
            supplierCompanyName: lovRecord.supplierCompanyName,
            supplierTenantId: lovRecord.supplierTenantId,
            supplierId: lovRecord.supplierId || null,
            supplierName: lovRecord.supplierName || null,
            supplierCode: lovRecord.supplierNum || lovRecord.supplierCode || null,
          };
          dispatch({
            type: 'quotePurchaseRequisition/newAdd',
            payload: { data, customizeUnitCode: formAndListCustomizeCode },
          }).then((res) => {
            if (res) {
              // this.props.history.push({
              //   pathname: '/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation',
              //   search: `?poHeaderId=${res.poHeaderId}&source=maintain`,
              // });
              this.fetchDetailHeader(nowId);
              this.fetchDetailList(nowId);
              notification.success();
            }
          });
        }
      });
    } else {
      // const { selectedListRows } = this.state;
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          let lines = [];
          if (sourceBillTypeCode === 'PURCHASE_ORDER') {
            lines = getEditTableData(listCommonDataSource, ['poLineId', '_status'], {
              container: document.querySelector('.ant-table-body'),
            });
          } else {
            lines = getEditTableData(listCommonDataSource, ['_status'], {
              container: document.querySelector('.ant-table-body'),
            });
          }
          this.setState({ orderHeaderFormDataSource: { ...orderHeaderFormDataSource, values } });
          const transLines = lines.map((item, index) => {
            const { needByDate } = item;
            return {
              ...item,
              unitPrice: listCommonDataSource[index].unitPrice,
              //  enteredTaxIncludedPrice: listCommonDataSource[index].enteredTaxIncludedPrice,
              benchmarkPriceType:
                item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
              priceLibraryId: listCommonDataSource[index].priceLibraryId,
              tenantId,
              needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
              surfaceTreatFlag: item.surfaceTreatFlag ? 1 : 0,
              returnedFlag: item.returnedFlag ? 1 : 0,
              poLineId: item.displayLineNum ? item.poLineId : undefined,
            };
          });
          if (!this.validateUomCalc({ doubleUnitEnabled, data: transLines })) return false;
          const poLineDetailDTOs = [...transLines].map((item) => {
            if (item.uuidFlag) {
              const { prLineId, ...other } = item;
              return other;
            }
            return item;
          });
          if (listCommonDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
            const data = {
              poLineDetailDTOs,
              poHeaderDetailDTO: {
                ...merge(orderHeaderFormDataSource, values),
                tenantId,
              },
              poLineBasicDetailDTOs: [],
              poLineOtherDetailDTOs: [],
            };
            const payload = { data, customizeUnitCode: formAndListCustomizeCode };
            dispatch({
              type: 'quotePurchaseRequisition/saveWarn',
              payload,
            }).then((ras) => {
              if (!ras) return false;
              if (ras.value) {
                Modal.confirm({
                  title: ras.message,
                  okText: intl.get('hzero.common.button.sure').d('确定'),
                  cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                  onOk: throttle(
                    () => {
                      this.saveDetail(payload, 'quotePurchaseRequisition/add');
                    },
                    THROTTLE_TIME,
                    { trailing: false }
                  ),
                });
              } else {
                this.saveDetail(payload, 'quotePurchaseRequisition/add');
              }
            });
          }
        }
      });
    }
  }

  @Bind()
  saveDetail(payload, type) {
    const { nowId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type,
      payload,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchDetailHeader(nowId);
        this.fetchDetailList(nowId);
      }
    });
  }

  @Bind()
  handleBackParent() {
    const { sourcePage, entrance } = this.state;
    let router; // 默认返回订单维护
    if (entrance === 'maintain') {
      router = '/sodr/purchase-order-maintain/list';
    } else {
      switch (sourcePage) {
        case 'pageRequest': // 采购申请
          router = '/sodr/purchase-order-maintain/quote-purchase-requisition/list';
          break;
        case 'pageOrder': // 手工创建订单
          router = '/sodr/purchase-order-maintain/list';
          break;
        case 'pageSource': // 寻源
          router = '/sodr/purchase-order-maintain/source-from-requisition/list';
          break;
        case 'pageConract': // 协议
          router = '/sodr/purchase-order-maintain/purchase/list';
          break;
        default:
          router = '/sodr/purchase-order-maintain/list';
          break;
      }
    }
    return router;
  }

  /**
   * submitDetail - 提交明细数据
   * 提交明细头数据和行明细相关字段
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  submitDetail() {
    const { dispatch, form } = this.props;
    const {
      orderHeaderFormDataSource,
      listCommonDataSource,
      tenantId,
      // lovRecord,
      selectedListRows,
      customizeCode = '',
      // source,
      dimensions,
      cacheKey,
      doubleUnitEnabled,
    } = this.state;
    // listCommonDataSource.forEach((n) => {
    //   if (!n.displayLineNum) {
    //     const nn = n;
    //     nn.poLineId = undefined;
    //     nn.prLineId = undefined;
    //   }
    // });
    const formAndListCustomizeCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    const { sourceBillTypeCode } = orderHeaderFormDataSource;
    // const { selectedListRows } = this.list.state;
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        let lines = [];
        if (sourceBillTypeCode === 'PURCHASE_ORDER') {
          lines = getEditTableData(listCommonDataSource, ['poLineId', '_status'], {
            container: document.querySelector('.ant-table-body'),
          });
        } else {
          lines = getEditTableData(listCommonDataSource, ['_status'], {
            container: document.querySelector('.ant-table-body'),
          });
        }
        this.setState({ orderHeaderFormDataSource: { ...orderHeaderFormDataSource, values } });
        const transLines = lines.map((item, index) => {
          const { needByDate } = item;
          return {
            ...item,
            unitPrice: listCommonDataSource[index].unitPrice,
            // enteredTaxIncludedPrice: listCommonDataSource[index].enteredTaxIncludedPrice,
            benchmarkPriceType:
              item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
            needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
            surfaceTreatFlag: item.surfaceTreatFlag ? 1 : 0,
            poLineId: item.displayLineNum ? item.poLineId : undefined,
            prLineId: item.displayLineNum ? item.prLineId : undefined,
          };
        });
        if (!this.validateUomCalc({ doubleUnitEnabled, data: transLines })) return false;
        const poLineDetailDTOs = [...transLines, ...selectedListRows].map((item) => {
          if (item._status === 'update') {
            const { prLineId, ...other } = item;
            return other;
          }
          return item;
        });
        if (listCommonDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
          const data = {
            poLineDetailDTOs,
            poHeaderDetailDTO: {
              ...merge(orderHeaderFormDataSource, values),
              tenantId,
              cacheKey,
            },
            poLineBasicDetailDTOs: [],
            poLineOtherDetailDTOs: [],
          };
          dispatch({
            type: 'quotePurchaseRequisition/submitDetail',
            payload: { data, customizeUnitCode: formAndListCustomizeCode },
          }).then((res) => {
            if (res && dimensions.length !== 1) {
              this.fetchDetailTable();
              notification.success();
            } else if (res && dimensions.length === 1) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: this.handleBackParent(),
                })
              );
            }
          });
        }
      }
    });
  }

  /**
   * deleteDelivery - 作废送货单
   */
  @Bind()
  invalidDelivery() {
    const { dispatch } = this.props;
    const { cacheKey, orderHeaderFormDataSource, dimensions } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.quotePurchaseRequisition.view.message.confirmDestroy`)
        .d('是否确认删除订单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: throttle(
        () => {
          dispatch({
            type: 'quotePurchaseRequisition/deleteSheetDelivery',
            payload: { ...orderHeaderFormDataSource, cacheKey },
          }).then(() => {
            if (dimensions.length !== 1) {
              this.setState({ nowId: undefined });
              this.fetchDetailTable();
              notification.success();
            } else {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: this.handleBackParent(),
                })
              );
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  }

  /**
   * taxDate
   */
  @Bind()
  handTaxDate(text, values, record) {
    const { listCommonDataSource } = this.state;
    const oldList = listCommonDataSource.findIndex((e) => e.poLineId === record.poLineId);
    const newDataSource = {
      ...record,
      taxId: values.taxId,
      taxRate: values.taxRate,
    };
    if (oldList > -1) {
      listCommonDataSource[oldList] = newDataSource;
    }
    this.setState({
      listCommonDataSource,
    });
  }

  @Bind()
  handleAppendValidate(poLineDetailDTOList) {
    const { poHeaderIdList } = this.state;
    const { dispatch } = this.props;
    return dispatch({
      type: 'quotePurchaseRequisition/appendValidate',
      payload: {
        poHeaderId: poHeaderIdList.poHeaderId,
        poLineDetailDTOList,
      },
    });
  }

  /**
   * 修改行数据
   * @param {Array} listCommonDataSource
   */
  @Bind()
  handleChangeList(listCommonDataSource) {
    this.setState({ listCommonDataSource });
  }

  /**
   *头添加批量字段
   * @param {Array} orderHeaderFormDataSource
   */
  @Bind()
  handleChangeHeader(orderHeaderFormDataSource) {
    this.setState({ orderHeaderFormDataSource });
  }

  /**
   * 修改Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  handleChangeLov(lovRecord) {
    const {
      form: { registerField, setFieldsValue },
    } = this.props;
    this.setState({ lovRecord });
    const { supplierId, supplierCompanyId } = lovRecord;
    registerField('supplierId');
    setFieldsValue({ supplierId });
    const { listCommonDataSource, oldList } = this.state;
    const newDateSource = listCommonDataSource.map((ele) => {
      if (
        ele.supplierCompanyId !== supplierId &&
        ele.supplierCompanyId !== supplierCompanyId &&
        ele.priceLibraryId
      ) {
        return oldList.find((obj) => obj.prLineId === ele.prLineId);
      } else {
        return ele;
      }
    });
    this.setState({
      listCommonDataSource: newDateSource,
    });
  }

  /**
   * 修改业务实体Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  onOuNameOnchange(lovRecord) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { ouId } = lovRecord;
    // const { orderHeaderFormDataSource } = this.state;
    // const newOrderHeaderFormDataSource = {
    //   ...orderHeaderFormDataSource,
    //   ouId,
    // };
    const { listCommonDataSource, oldList } = this.state;
    const newDateSource = listCommonDataSource.map((ele) => {
      if (ele.ouId !== ouId && ele.priceLibraryId) {
        return oldList.find((obj) => obj.prLineId === ele.prLineId);
      } else {
        return ele;
      }
    });
    setFieldsValue({ supplierSiteId: null });
    this.setState({
      // orderHeaderFormDataSource: newOrderHeaderFormDataSource,
      listCommonDataSource: newDateSource,
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModal(attachmentUuid) {
    const { orderHeaderFormDataSource = {} } = this.state;
    if (isEmpty(orderHeaderFormDataSource.attachmentUuid)) {
      this.getHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * getHeaderAttachmentUuid - 获取头附件uuid
   * @param {!string} uuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch } = this.props;
    const {
      // nowId,
      orderHeaderFormDataSource: { poHeaderId },
    } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/saveAttachmentUUID',
      payload: { poHeaderId, uuid: attachmentUuid, uuidType: 1 },
    }).then((res) => {
      if (res) {
        this.setState({
          orderHeaderFormDataSource: {
            ...this.state.orderHeaderFormDataSource,
            objectVersionNumber: res,
            attachmentUuid,
          },
        });
      }
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModalLoad(getHeaderAttachmentUuidLoad) {
    const { orderHeaderFormDataSource = {} } = this.state;
    if (isEmpty(orderHeaderFormDataSource.purchaserInnerAttachmentUuid)) {
      this.getHeaderAttachmentUuidLoad(getHeaderAttachmentUuidLoad);
    }
  }

  /**
   * getHeaderAttachmentUuidLoad - 获取头附件uuid
   * @param {!string} uuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuidLoad(getHeaderAttachmentUuidLoad) {
    const { dispatch } = this.props;
    const {
      // nowId,
      orderHeaderFormDataSource: { poHeaderId },
    } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/saveAttachmentUUID',
      payload: { poHeaderId, uuid: getHeaderAttachmentUuidLoad, uuidType: 3 },
    }).then((res) => {
      if (res) {
        this.setState({
          orderHeaderFormDataSource: {
            ...this.state.orderHeaderFormDataSource,
            objectVersionNumber: res,
            purchaserInnerAttachmentUuid: getHeaderAttachmentUuidLoad,
          },
        });
      }
    });
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedListRows: selectedRows });
  }

  @Bind()
  headerOnChangeForm(_record) {
    const { listCommonDataSource } = this.state;
    // this.orderListFormDataSourceForm.props.form.setFieldsValue({
    //   returnedFlag: _record,
    // });
    const newDateSource = listCommonDataSource.map((item) => {
      return {
        ...item,
        returnedFlag: _record,
      };
    });
    this.setState({
      returnOrderFlag: _record,
      listCommonDataSource: newDateSource,
    });
  }

  // 采购申请行分页处理
  @Bind()
  handleChangePagination(page = {}) {
    const { orderHeaderFormDataSource, nowId } = this.state;
    const { sourceBillTypeCode } = orderHeaderFormDataSource;
    if (sourceBillTypeCode === 'PURCHASE_REQUEST') {
      this.setState({ listCommonPagination: page });
    } else {
      this.fetchDetailList(nowId, page);
    }
  }

  /**
   * 修改付款条款Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  termsOnchange(lovRecord) {
    //  const {
    //    form: { setFieldsValue },
    //  } = this.props;
    const { prepayFlag } = lovRecord;
    const { orderHeaderFormDataSource } = this.state;
    const newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      prepayFlag,
    };
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    });
    // setFieldsValue({ prepayFlag});
  }

  @Bind()
  renderDimensions() {
    const {
      form,
      deleteDeliveryLoading = false,
      queryCreateListLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      submitDetailLoading = false,
      deleteLineRemoteLoaing = false,
      checkInvOrganizationLoading = false,
      validating,
      customizeForm,
      customizeTable,
      quotePurchaseRequisition: { enumMap },
    } = this.props;
    const {
      collapseKeys,
      tenantId,
      selectedListRows,
      listCommonDataSource,
      listCommonPagination,
      isClearListCacheDataSource,
      isHeaderInfoFormDataSource,
      orderHeaderFormDataSource = {},
      lovRecord: { supplierCompanyId },
      // companyFlag,
      returnOrderFlag,
      doubleUnitEnabled,
      dimensions,
    } = this.state;
    const {
      prStatusCode,
      poHeaderId,
      poSourcePlatform,
      // priceShieldFlag,
      tieredPricingFlag,
      ouId,
      companyId,
    } = orderHeaderFormDataSource;

    const orderHeaderFormDataSourceFormProps = {
      form,
      customizeForm,
      newAddLoading: queryDetailHeaderLoading || deleteDeliveryLoading || submitDetailLoading,
      poSourcePlatform,
      poHeaderId,
      loading: queryDetailHeaderLoading || deleteDeliveryLoading || submitDetailLoading,
      onChangeListData: this.handleChangeLov,
      onChangeCompany: this.onChangeCompany,
      onOuNameOnchange: this.onOuNameOnchange,
      headerOnChangeForm: this.headerOnChangeForm,
      dataSource: orderHeaderFormDataSource,
      onRef: (node) => {
        this.orderHeaderFormDataSourceForm = node;
      },
      // companyFlag,
      termsOnchange: this.termsOnchange,
    };
    const listProps = {
      tenantId,
      prStatusCode,
      validating,
      customizeTable,
      supplierCompanyId,
      // priceShieldFlag,
      tieredPricingFlag,
      doubleUnitEnabled,
      ouId,
      companyId,
      returnOrderFlag,
      poSourcePlatform,
      isClearListCacheDataSource,
      isHeaderInfoFormDataSource,
      queryCreateListLoading:
        queryCreateListLoading || deleteDeliveryLoading || submitDetailLoading,
      deleteLineRemoteLoaing,
      selectedListRows,
      handTaxDate: this.handTaxDate,
      loading: queryDetailListLoading,
      dataSource: listCommonDataSource,
      pagination: listCommonPagination,
      headerInfo: orderHeaderFormDataSource,
      fetchDetailCreateList: this.fetchDetailCreateList,
      onChangeListData: this.handleChangeList,
      handleCancelLines: this.handleCancelLines,
      handleRowSelectedChange: this.handleRowSelectedChange,
      fetchList: this.fetchDetailList,
      afterOpenUploadModal: this.afterOpenUploadModal,
      onHandleAppendValidate: this.handleAppendValidate,
      handleChangePagination: this.handleChangePagination,
      onChangeHeader: this.handleChangeHeader,
      form,
      onRef: (node) => {
        this.orderListFormDataSourceForm = node;
      },
      enumMap,
      handleTranslate: this.handleTranslate,
      validateItemAndInv: this.validateItemAndInv,
      checkInvOrganizationLoading,
      customizeForm,
    };
    return dimensions.map((item) => {
      return (
        <TabPane tab={item.displayPoNum} key={item.poHeaderId}>
          <Collapse
            className="form-collapse"
            activeKey={collapseKeys}
            onChange={this.onCollapseChange}
          >
            <Panel
              showArrow={false}
              forceRender
              header={
                <Fragment>
                  <h3>
                    {intl.get(`sodr.quotePurchase.view.message.orderHeaderInfo`).d('订单头信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('orderHeaderInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                </Fragment>
              }
              key="orderHeaderInfo"
            >
              {item.poHeaderId === this.state.nowId && (
                <PurchaseRequestHeader {...orderHeaderFormDataSourceFormProps} />
              )}
            </Panel>

            {item.poHeaderId && (
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`sodr.quotePurchaseRequisition.view.message.orderLineInfo`)
                        .d('订单行信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('orderLineInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderLineInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderLineInfo"
              >
                <PurchaseLineInfo {...listProps} />
              </Panel>
            )}
          </Collapse>
        </TabPane>
      );
    });
  }

  @Bind()
  tabChange(n) {
    const numId = n;
    this.fetchDetailHeader(numId);
    this.setState({
      nowId: numId, // 获取当前tab页的id
      orderHeaderFormDataSource: {}, // 头form数据源
      listCommonDataSource: [], // 表格数据源
      listCommonPagination: {}, // 表格分页
    });
  }

  @Bind()
  async validateItemAndInv(invOrganizationId, selectedListRows) {
    const { listCommonDataSource = [], orderHeaderFormDataSource } = this.state;
    const { dispatch, form } = this.props;
    const listData = isEmpty(selectedListRows) ? listCommonDataSource : selectedListRows;
    const list = listData.map((i) => {
      const { prLineId, ...others } = i;
      return {
        ...(i.uuidFlag ? others : i),
        ...(i.$form ? i.$form.getFieldsValue() : {}),
        poLineId: i._status === 'create' ? null : i.poLineId,
      };
    });
    const poHeaderDetailDTO = { ...orderHeaderFormDataSource, ...form.getFieldsValue() };
    const response = await dispatch({
      type: 'quotePurchaseRequisition/checkInvOrganization',
      payload: { list: { poHeaderDetailDTO, poLineDetailDTOs: list }, invOrganizationId },
    });
    return response !== 'SUCCESS';
  }

  render() {
    const {
      saveLoading = false,
      newAddLoading = false,
      deleteDeliveryLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      submitDetailLoading = false,
      fetchDetailTableLoading = false,
    } = this.props;
    const {
      orderHeaderFormDataSource = {},
      poHeaderIdList,
      initialAttachmentUuid,
      initialPurchaserInnerAttachmentUuid,
    } = this.state;
    const { attachmentUuid, purchaserInnerAttachmentUuid } = orderHeaderFormDataSource;
    const uploadModalProps = {
      btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
      btnProps: {
        icon: 'upload',
        disabled: !poHeaderIdList.poHeaderId,
      },
      showFilesNumber: true,
      attachmentUUID: attachmentUuid || initialAttachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sprm-pr',
      afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };
    const uploadModalPropsLoad = {
      btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
      btnProps: {
        icon: 'upload',
        disabled: !poHeaderIdList.poHeaderId,
      },
      showFilesNumber: true,
      attachmentUUID: purchaserInnerAttachmentUuid || initialPurchaserInnerAttachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sprm-pr',
      afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.quotePurchase.view.message.purchaseOrderMaintain`).d('订单维护')}
          backPath={this.handleBackParent()}
        >
          <Button
            loading={
              saveLoading ||
              newAddLoading ||
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
              submitDetailLoading ||
              deleteDeliveryLoading
            }
            onClick={this.save}
            type="primary"
            icon="save"
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button
            disabled={!poHeaderIdList.poHeaderId}
            loading={
              saveLoading ||
              submitDetailLoading ||
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
              deleteDeliveryLoading
            }
            icon="check"
            onClick={this.submitDetail}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <UploadModal {...uploadModalProps} />
          <UploadModal {...uploadModalPropsLoad} />
          <Button
            disabled={!poHeaderIdList.poHeaderId}
            loading={
              saveLoading ||
              deleteDeliveryLoading ||
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
              submitDetailLoading
            }
            onClick={this.invalidDelivery}
            icon="delete"
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
        </Header>
        <Content>
          {/* {[1, 2].includes(unSaveEnable) && (
            <p className={styles['order-top-title']}>
              <span />
              {intl
                .get(`sodr.quotePurchase.view.message.saveBeforeOperation`)
                .d('请先保存订单头信息，再操作订单行信息')}
            </p>
          )} */}
          <Spin
            spinning={false}
            wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
            loading={fetchDetailTableLoading || queryDetailHeaderLoading || queryDetailListLoading}
          >
            <Tabs
              defaultActiveKey="company"
              animated={false}
              onTabClick={this.tabChange}
              tabPosition="left"
              className={styles['sub-accout-tabs']}
              forceRender
            >
              {this.renderDimensions()}
            </Tabs>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
