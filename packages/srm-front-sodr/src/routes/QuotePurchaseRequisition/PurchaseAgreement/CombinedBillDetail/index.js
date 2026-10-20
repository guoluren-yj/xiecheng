/**
 * LineCreation - 按行引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Spin, Collapse, Icon, Modal, Form, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import DynamicButtons from '_components/DynamicButtons';
import { isEmpty, merge, filter, isNil, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

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

import { BUCKET_NAME, BUCKET_DIRECTORY, THROTTLE_TIME } from '@/routes/components/utils/constant';
import { queryCommonDoubleUomConfig, validateLineCalculate } from '@/routes/components/utils';
import PurchaseRequestHeader from '../Detail/PurchaseRequestHeader';
import PurchaseLineInfo from '../Detail/PurchaseLineInfo';
import styles from '../Detail/Header.less';

const { Panel } = Collapse;

const { TabPane } = Tabs;

@withCustomize({
  unitCode: [
    'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
    'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
    'SODR.ORDER_CREATE_LINE_LIST.AGREEMENT_BTNS',
  ],
})
@formatterCollections({
  code: [
    'sodr.quotePurchaseRequisition',
    'sodr.common',
    'sodr.order',
    'entity.attachment',
    'sodr.quotePurchase',
    'sodr.orderMaintain',
    'hpfm.employee',
    'srm.common',
    'ssrc.priceLibrary',
    'sprm.purchaseReqCreation',
    'sprm.common',
    'sodr.workspace',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, quotePurchaseRequisition }) => ({
  fetchDetailTableLoading: loading.effects['quotePurchaseRequisition/fetchDetailTable'],
  saveLoading: loading.effects['quotePurchaseRequisition/add'],
  submitDetailLoading: loading.effects['quotePurchaseRequisition/submitDetail'],
  deleteLineRemoteLoaing: loading.effects['quotePurchaseRequisition/deleteLineRemote'],
  deleteDeliveryLoading: loading.effects['quotePurchaseRequisition/deleteSheetDelivery'],
  queryDetailHeaderLoading: loading.effects['quotePurchaseRequisition/queryDetailHeader'],
  queryDetailListLoading: loading.effects['quotePurchaseRequisition/queryDetailList'],
  quotePurchaseRequisition,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { cacheKey, source, itemKey } = querystring.parse(search.substr(1));
    this.state = {
      cacheKey,
      source,
      dimensions: [], // tab数据
      poHeaderIdList: {}, // 初始化的id(对象内置id)
      nowId: null, // 当前tab页的id
      lovRecord: {},
      orderHeaderFormDataSource: {}, // 头form数据源
      listCommonDataSource: [], // 表格数据源
      listCommonPagination: {}, // 表格分页
      collapseKeys: ['orderHeaderInfo', 'orderLineInfo'], // 打开的折叠面板key
      tenantId: getCurrentOrganizationId(),
      selectedListRows: [],
      // priceModal: {},
      oldList: [], // 数据备份
      // fetchFlag: false, // 判断是否调用接口标识
      itemKey,
      // requisitionCount: 0, // 供应商引用采购申请变更次数
      // orderMainCount: 0, // 供应商订单维护变更次数
      // supplierFlag: false,
      // setting: '0',
      customizeCode: '', // 个性化编码
      returnOrderFlag: null,
      doubleUnitEnabled: 0,
      initialAttachmentUuid: '', // 初始化外部附件
      initialPurchaserInnerAttachmentUuid: '', // 初始化内部附件
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
    window.removeEventListener('message', this.handleEvent);
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
   * 查询双单位配置
   */
  @Bind()
  async queryDoubleUomConfig() {
    const result = await queryCommonDoubleUomConfig();
    this.setState({
      doubleUnitEnabled: result || 0,
    });
  }

  /**
   * 查询列表值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({ type: 'quotePurchaseRequisition/fetchEnum' });
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
  fetchDetailHeader(numId, flag) {
    const { dispatch } = this.props;
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
        const { attachmentUuid = '', purchaserInnerAttachmentUuid = '' } = res;
        this.setState(
          {
            orderHeaderFormDataSource: {
              ...res,
              prepayFlag: isNil(res.prepayFlag) ? 0 : res.prepayFlag,
            },
            lovRecord,
            customizeCode: 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
          },
          () => {
            // 避免绑定uuid更新行数据
            if (!flag) {
              // form.resetFields();
              this.fetchDetailList(numId);
            }
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
    // 获取价格库查询标识
    // const priceQueryFlag = window.sessionStorage.getItem(itemKey);
    this.setState({ listCommonDataSource: [] });
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
          () => {
            // 处理首次查询不含税单价不更新显示值
            // const { listCommonDataSource, lovRecord } = this.state; ==> PS:注释原有订单逻辑
            const { listCommonDataSource } = this.state;
            listCommonDataSource.forEach((item) => {
              if (item.$form) {
                // item.$form.resetFields();
                item.$form.setFieldsValue({ unitPrice: item.unitPrice });
              }
            });
          }
        );
      }
    });
  }

  @Bind()
  afterOpenUploadModal(attachmentUuid, record) {
    if (isEmpty(record.attachmentUuid) && record._status !== 'create') {
      this.getLineAttachmentUuid(attachmentUuid, record);
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
    const { poSourcePlatform } = orderHeaderFormDataSource;
    const listCommonDataSourceDisplayLineNums = listCommonDataSource?.filter(
      (n) => n.displayLineNum
    );
    const selectedListRowsDisplayLineNums = selectedListRows?.filter((n) => n.displayLineNum);
    const existingDisplayLineNums = listCommonDataSourceDisplayLineNums?.filter(
      (n) => !selectedListRowsDisplayLineNums.includes(n)
    );
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
        onOk: () => {
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
      });
    }
  }

  // 保存和提交前校验是否存在双单位计算错误
  @Bind()
  validateUomCalc({ doubleUnitEnabled, data }) {
    if (doubleUnitEnabled && !validateLineCalculate({ data, type: 'h0' })) return false;
    return true;
  }

  @Bind()
  saveDetail(payload, type, saveHeaderFirst) {
    const { nowId, itemKey } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type,
      payload,
    }).then((res) => {
      if (res) {
        notification.success();
        if (saveHeaderFirst) {
          this.fetchDetailHeader(nowId);
        } else {
          window.sessionStorage.setItem(itemKey, 0);
        }
        if (res.maintainErrorMsg) {
          Modal.info({ title: res.maintainErrorMsg });
        }
      }
    });
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  save() {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource,
      tenantId,
      listCommonDataSource,
      lovRecord = {},
      customizeCode = '',
      doubleUnitEnabled,
      nowId,
    } = this.state;
    // listCommonDataSource.forEach((n) => {
    //   if (!n.displayLineNum) {
    //     const nn = n;
    //     nn.poLineId = undefined;
    //   }
    // });
    const { unSaveEnable } = orderHeaderFormDataSource;
    const formAndListCustomizeCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    if (unSaveEnable) {
      // 先保存头
      orderHeaderFormDataSource.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const data = {
            poHeaderDetailDTO: {
              ...merge(orderHeaderFormDataSource, values),
              tenantId,
              supplierCompanyId: lovRecord.supplierCompanyId,
              supplierCompanyName: lovRecord.supplierCompanyName,
              supplierTenantId: lovRecord.supplierTenantId,
              supplierId: lovRecord.supplierId || null,
              supplierName: lovRecord.supplierName || null,
              supplierCode: lovRecord.supplierNum || lovRecord.supplierCode || null,
            },
          };
          const payload = {
            data,
            customizeUnitCode: formAndListCustomizeCode,
          };
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
                    this.saveDetail(payload, 'quotePurchaseRequisition/add', true);
                  },
                  THROTTLE_TIME,
                  { trailing: false }
                ),
              });
            } else {
              this.saveDetail(payload, 'quotePurchaseRequisition/add', true);
            }
          });
        }
      });
    } else {
      this[`${nowId}orderHeaderFormDataSourceForm`].props.form.validateFieldsAndScroll(
        (errs, values) => {
          if (!errs) {
            let lines = [];
            lines = getEditTableData(
              listCommonDataSource,
              ['_status'],
              { container: document.querySelector('.ant-table-body') },
              { force: true }
            );
            const transLines = lines.map((item) => {
              const { needByDate } = item;
              return {
                ...item,
                // unitPrice: listCommonDataSource[index].unitPrice,
                //  enteredTaxIncludedPrice: listCommonDataSource[index].enteredTaxIncludedPrice,
                // priceLibraryId: listCommonDataSource[index].priceLibraryId,
                benchmarkPriceType:
                  item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
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
                  supplierCompanyId: lovRecord.supplierCompanyId,
                  supplierCompanyName: lovRecord.supplierCompanyName,
                  supplierTenantId: lovRecord.supplierTenantId,
                  supplierId: lovRecord.supplierId || null,
                  supplierName: lovRecord.supplierName || null,
                  supplierCode: lovRecord.supplierNum || lovRecord.supplierCode || null,
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
        }
      );
    }
  }

  /**
   * submitDetail - 提交明细数据
   * 提交明细头数据和行明细相关字段
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  submitDetail() {
    const { dispatch } = this.props;
    const {
      nowId,
      orderHeaderFormDataSource,
      listCommonDataSource,
      tenantId,
      lovRecord,
      customizeCode = '',
      doubleUnitEnabled,
      dimensions,
      cacheKey,
    } = this.state;
    // listCommonDataSource.forEach(n => {
    //   if (!n.displayLineNum) {
    //     const nn = n;
    //     nn.poLineId = undefined;
    //     nn.prLineId = undefined;
    //   }
    // });
    const formAndListCustomizeCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    this[`${nowId}orderHeaderFormDataSourceForm`].props.form.validateFieldsAndScroll(
      (errs, values) => {
        if (!errs) {
          let lines = [];
          lines = getEditTableData(
            listCommonDataSource,
            ['_status'],
            { container: document.querySelector('.ant-table-body') },
            { force: true }
          );
          const transLines = lines.map((item) => {
            const { needByDate } = item;
            return {
              ...item,
              // unitPrice: listCommonDataSource[index].unitPrice,
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
          const poLineDetailDTOs = [...transLines].map((item) => {
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
                supplierCompanyId: lovRecord.supplierCompanyId,
                supplierCompanyName: lovRecord.supplierCompanyName,
                supplierTenantId: lovRecord.supplierTenantId,
                supplierId: lovRecord.supplierId || null,
                supplierName: lovRecord.supplierName || null,
                supplierCode: lovRecord.supplierNum || lovRecord.supplierCode || null,
                dimensions,
                cacheKey,
              },
              poLineBasicDetailDTOs: [],
              poLineOtherDetailDTOs: [],
            };
            dispatch({
              type: 'quotePurchaseRequisition/submitDetail',
              payload: { data, customizeUnitCode: formAndListCustomizeCode },
            }).then((res) => {
              if (res) {
                if (dimensions.length !== 1) {
                  this.fetchDetailTable();
                  notification.success();
                } else {
                  notification.success();
                  dispatch(
                    routerRedux.push({
                      pathname: `/sodr/purchase-order-maintain/list`,
                    })
                  );
                }
              }
            });
          }
        }
      }
    );
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
          }).then((res) => {
            if (res) {
              if (dimensions.length !== 1) {
                this.setState({ nowId: undefined });
                this.fetchDetailTable();
                notification.success();
              } else {
                notification.success();
                dispatch(
                  routerRedux.push({
                    pathname: '/sodr/purchase-order-maintain/purchase/list',
                  })
                );
              }
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
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

  /**
   * 修改行数据
   * @param {Array} listCommonDataSource
   */
  @Bind()
  handleChangeList(listCommonDataSource) {
    this.setState({ listCommonDataSource });
  }

  /**
   * 头添加批量维护字段
   * @param {Array} listCommonDataSource
   */
  @Bind()
  handleChangeHeader(orderHeaderFormDataSource) {
    this.setState({ orderHeaderFormDataSource });
  }

  /**
   * 修改Lov数据
   * @param {Array} lovRecord
   */
  // @Bind()
  // handleChangeLov(lovRecord) {
  //   const {
  //     form: { registerField, setFieldsValue },
  //   } = this.props;

  //   this.setState({ lovRecord });
  //   const { supplierId, supplierCompanyId } = lovRecord;
  //   registerField('supplierId');
  //   setFieldsValue({ supplierId });
  //   const { listCommonDataSource, oldList, priceModal } = this.state;
  //   const newDateSource = listCommonDataSource.map((ele) => {
  //     if (
  //       ele.supplierCompanyId !== supplierId &&
  //       ele.supplierCompanyId !== supplierCompanyId &&
  //       ele.priceLibraryId
  //     ) {
  //       return oldList.find((obj) => obj.prLineId === ele.prLineId) || ele;
  //     } else {
  //       return ele;
  //     }
  //   });
  //   this.setState({
  //     listCommonDataSource: newDateSource,
  //     priceModal: { ...priceModal, supplierCompanyId: supplierCompanyId || supplierId },
  //   });
  // }

  /**
   * 修改公司Lov数据
   * @param {Array} lovRecord
   */
  // @Bind()
  // onChangeCompany(lovRecord) {
  //   const {
  //     form: { setFieldsValue },
  //   } = this.props;
  //   const { companyId, currencyCode, currencyName } = lovRecord;
  //   const { orderHeaderFormDataSource } = this.state;
  //   const newOrderHeaderFormDataSource = {
  //     ...orderHeaderFormDataSource,
  //     supplierName: '',
  //     supplierCompanyName: '',
  //     companyId,
  //     currencyCode: currencyCode || 'CNY',
  //     currencyName: currencyName || '人民币',
  //   };
  //   this.setState({
  //     orderHeaderFormDataSource: newOrderHeaderFormDataSource,
  //   });
  //   setFieldsValue({ ouId: null });
  //   setFieldsValue({ tempKey: null });
  //   setFieldsValue({
  //     currencyCode: currencyCode || 'CNY',
  //     currencyName: currencyName || '人民币',
  //   });
  // }

  /**
   * 修改供应商Lov数据
   * @param {Array} lovRecord
   */
  // @Bind()
  // onChangeSupplierLov(lovRecord) {
  //   const { supplierCompanyId } = lovRecord;
  //   const { orderHeaderFormDataSource } = this.state;
  //   const newOrderHeaderFormDataSource = {
  //     ...orderHeaderFormDataSource,
  //     supplierCompanyId,
  //   };
  //   this.setState({
  //     orderHeaderFormDataSource: newOrderHeaderFormDataSource,
  //   });
  // }

  /**
   * 修改业务实体Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  onOuNameOnchange(lovRecord) {
    const { ouId } = lovRecord;
    const { orderHeaderFormDataSource } = this.state;
    const newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      ouId,
    };
    const { listCommonDataSource, oldList } = this.state;
    const newDateSource = listCommonDataSource.map((ele) => {
      if (ele.ouId !== ouId && ele.priceLibraryId) {
        return oldList.find((obj) => obj.prLineId === ele.prLineId) || ele;
      } else {
        return ele;
      }
    });
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
      listCommonDataSource: newDateSource,
      // priceModal: { ...priceModal, ouId },
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
   * 返回父级页面
   * maintain: 订单维护
   * requisition：采购申请
   * @returns {*}
   */
  @Bind()
  handleBackParent() {
    const { source } = this.state;
    if (source === 'maintain') {
      return '/sodr/purchase-order-maintain/list';
    } else {
      return '/sodr/purchase-order-maintain/purchase/list';
    }
  }

  /**
   * 改变供应商flag
   */
  // @Bind()
  // onChangeSupplierCount(count) {
  //   this.setState({
  //     requisitionCount: count,
  //     orderMainCount: count,
  //   });
  // }

  /**
   * 改变供应商flag
   */
  // @Bind()
  // onChangeSupplierFlag(flag) {
  //   this.setState({
  //     supplierFlag: flag,
  //   });
  // }

  // 采购申请行分页处理
  @Bind()
  handleChangePagination(page = {}) {
    const { nowId } = this.state;
    this.fetchDetailList(nowId, page);
  }

  @Bind()
  headerOnChangeForm(_record) {
    const { listCommonDataSource } = this.state;
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

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedListRows: selectedRows });
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
  renderDimensions() {
    const {
      customizeForm,
      customizeTable,
      saveLoading = false,
      deleteDeliveryLoading = false,
      fetchDetailTableLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      submitDetailLoading = false,
      deleteLineRemoteLoaing = false,
      quotePurchaseRequisition: { enumMap },
    } = this.props;
    const {
      nowId,
      collapseKeys,
      tenantId,
      listCommonDataSource,
      listCommonPagination,
      selectedListRows,
      orderHeaderFormDataSource = {},
      lovRecord: { supplierCompanyId },
      returnOrderFlag,
      dimensions,
      doubleUnitEnabled,
    } = this.state;
    const {
      poHeaderId,
      poSourcePlatform,
      tieredPricingFlag,
      ouId,
      companyId,
    } = orderHeaderFormDataSource;
    const orderHeaderFormDataSourceFormProps = {
      // form,
      customizeForm,
      listCommonDataSource,
      poHeaderId,
      loading:
        queryDetailHeaderLoading ||
        queryDetailListLoading ||
        saveLoading ||
        submitDetailLoading ||
        deleteDeliveryLoading ||
        fetchDetailTableLoading,
      onOuNameOnchange: this.onOuNameOnchange,
      headerOnChangeForm: this.headerOnChangeForm,
      dataSource: orderHeaderFormDataSource,
      onRef: (node) => {
        if (!nowId) return;
        this[`${nowId}orderHeaderFormDataSourceForm`] = node;
      },
      termsOnchange: this.termsOnchange,
    };
    const listProps = {
      tenantId,
      customizeTable,
      supplierCompanyId,
      tieredPricingFlag,
      ouId,
      companyId,
      returnOrderFlag,
      selectedListRows,
      poSourcePlatform,
      doubleUnitEnabled,
      handTaxDate: this.handTaxDate,
      loading:
        queryDetailHeaderLoading ||
        queryDetailListLoading ||
        saveLoading ||
        submitDetailLoading ||
        deleteDeliveryLoading ||
        fetchDetailTableLoading,
      dataSource: listCommonDataSource,
      pagination: listCommonPagination,
      onChangeListData: this.handleChangeList,
      form: this[`${nowId}orderHeaderFormDataSourceForm`]
        ? this[`${nowId}orderHeaderFormDataSourceForm`].props.form
        : undefined,
      deleteLineRemoteLoaing,
      handleCancelLines: this.handleCancelLines,
      handleChangePagination: this.handleChangePagination,
      handleRowSelectedChange: this.handleRowSelectedChange,
      afterOpenUploadModal: this.afterOpenUploadModal,
      headerInfo: orderHeaderFormDataSource,
      onRef: (node) => {
        this.orderListFormDataSourceForm = node;
      },
      onChangeHeader: this.handleChangeHeader,
      enumMap,
      handleTranslate: this.handleTranslate,
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
              <PurchaseRequestHeader {...orderHeaderFormDataSourceFormProps} />
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

  /**
   * 按钮组
   * @returns
   */
  @Bind()
  headerBtnsRender() {
    const {
      saveLoading = false,
      deleteDeliveryLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      submitDetailLoading = false,
      fetchDetailTableLoading = false,
    } = this.props;
    const {
      orderHeaderFormDataSource = {},
      initialAttachmentUuid,
      initialPurchaserInnerAttachmentUuid,
    } = this.state;
    const {
      statusCode,
      poHeaderId,
      attachmentUuid,
      purchaserInnerAttachmentUuid,
    } = orderHeaderFormDataSource;
    const btns = [
      {
        name: 'save',
        child: intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          icon: 'save',
          type: 'primary',
          onClick: this.save,
          loading:
            queryDetailHeaderLoading ||
            queryDetailListLoading ||
            saveLoading ||
            submitDetailLoading ||
            deleteDeliveryLoading ||
            fetchDetailTableLoading,
        },
      },
      {
        name: 'check',
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        btnProps: {
          disabled: !poHeaderId,
          icon: 'check',
          onClick: this.submitDetail,
          loading:
            queryDetailHeaderLoading ||
            queryDetailListLoading ||
            saveLoading ||
            submitDetailLoading ||
            deleteDeliveryLoading ||
            fetchDetailTableLoading,
        },
      },
      {
        name: 'outUuid',
        btnComp: UploadModal,
        btnProps: {
          btnProps: {
            icon: 'upload',
            disabled:
              !poHeaderId ||
              saveLoading ||
              submitDetailLoading ||
              deleteDeliveryLoading ||
              fetchDetailTableLoading,
          },
          btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
          showFilesNumber: true,
          attachmentUUID: attachmentUuid || initialAttachmentUuid,
          bucketName: BUCKET_NAME,
          bucketDirectory: BUCKET_DIRECTORY,
          afterOpenUploadModal: this.afterOpenHeaderUploadModal,
        },
      },
      {
        name: 'innerUuid',
        btnComp: UploadModal,
        btnProps: {
          btnProps: {
            icon: 'upload',
            disabled:
              !poHeaderId ||
              saveLoading ||
              submitDetailLoading ||
              deleteDeliveryLoading ||
              fetchDetailTableLoading,
          },
          btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
          showFilesNumber: true,
          attachmentUUID: purchaserInnerAttachmentUuid || initialPurchaserInnerAttachmentUuid,
          bucketName: BUCKET_NAME,
          bucketDirectory: BUCKET_DIRECTORY,
          afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
        },
      },
      statusCode !== 'REJECTED' && {
        name: 'delete',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          disabled: !poHeaderId,
          icon: 'delete',
          onClick: this.invalidDelivery,
          loading:
            queryDetailHeaderLoading ||
            queryDetailListLoading ||
            saveLoading ||
            submitDetailLoading ||
            deleteDeliveryLoading ||
            fetchDetailTableLoading,
        },
      },
    ];
    return btns;
  }

  render() {
    const {
      saveLoading = false,
      deleteDeliveryLoading = false,
      fetchDetailTableLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      submitDetailLoading = false,
      customizeBtnGroup,
    } = this.props;
    // const {
    //   orderHeaderFormDataSource = {},
    //   initialAttachmentUuid,
    //   initialPurchaserInnerAttachmentUuid,
    // } = this.state;
    // const { poHeaderId } = orderHeaderFormDataSource;
    // const { attachmentUuid, purchaserInnerAttachmentUuid } = orderHeaderFormDataSource;
    // const uploadModalProps = {
    //   btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
    //   btnProps: {
    //     icon: 'upload',
    //     disabled:
    //       !poHeaderId ||
    //       saveLoading ||
    //       submitDetailLoading ||
    //       deleteDeliveryLoading ||
    //       fetchDetailTableLoading,
    //   },
    //   showFilesNumber: true,
    //   attachmentUUID: attachmentUuid || initialAttachmentUuid,
    //   bucketName: BUCKET_NAME,
    //   bucketDirectory: 'sodr-order',
    //   afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    // };
    // const uploadModalPropsLoad = {
    //   btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
    //   btnProps: {
    //     icon: 'upload',
    //     disabled:
    //       !poHeaderId ||
    //       saveLoading ||
    //       submitDetailLoading ||
    //       deleteDeliveryLoading ||
    //       fetchDetailTableLoading,
    //   },
    //   showFilesNumber: true,
    //   attachmentUUID: purchaserInnerAttachmentUuid || initialPurchaserInnerAttachmentUuid,
    //   bucketName: BUCKET_NAME,
    //   bucketDirectory: 'sodr-order',
    //   afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
    // };
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.quotePurchase.view.message.purchaseOrderMaintain`).d('订单维护')}
          backPath={this.handleBackParent()}
        >
          {customizeBtnGroup(
            { code: 'SODR.ORDER_CREATE_LINE_LIST.AGREEMENT_BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtnsRender()} />
          )}
          {/* <Button
            loading={
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
              saveLoading ||
              submitDetailLoading ||
              deleteDeliveryLoading ||
              fetchDetailTableLoading
            }
            onClick={this.save}
            type="primary"
            icon="save"
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button
            disabled={!poHeaderId}
            loading={
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
              saveLoading ||
              submitDetailLoading ||
              deleteDeliveryLoading ||
              fetchDetailTableLoading
            }
            icon="check"
            onClick={this.submitDetail}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <UploadModal {...uploadModalProps} />
          <UploadModal {...uploadModalPropsLoad} />
          {statusCode !== 'REJECTED' && (
            <Button
              disabled={!poHeaderId}
              loading={
                queryDetailHeaderLoading ||
                queryDetailListLoading ||
                saveLoading ||
                submitDetailLoading ||
                deleteDeliveryLoading ||
                fetchDetailTableLoading
              }
              onClick={this.invalidDelivery}
              icon="delete"
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
          )} */}
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
            loading={
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
              saveLoading ||
              submitDetailLoading ||
              deleteDeliveryLoading ||
              fetchDetailTableLoading
            }
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
