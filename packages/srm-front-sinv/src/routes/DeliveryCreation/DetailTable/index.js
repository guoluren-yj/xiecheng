/**
 * index - 送货单创建明细
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Modal, Icon, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, isFunction, findIndex, isNil } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { routerRedux } from 'dva/router';

import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { getCurrentOrganizationId, getEditTableData, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DETAIL_DEFAULT_CLASSNAME, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { SRM_SPUC } from '_utils/config';
import uuid from 'uuid/v4';
import { validTime } from '@/routes/components/utils';
import { fetchConfigSheet } from '@/services/commonService';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import UploadModal from './UploadModal';
import LineItemModal from './LineItemModal';
import HeaderInfoForm from './HeaderInfoForm';
import List from './List';
import styles from './index.less';
import HeaderShipInfoForm from './ShipmentForm';
import BomModal from '../Detail/BOMModal';

// 折叠面板组件初始化
const { Panel } = Collapse;

/**
 * 使用 Tabs.TabPane 组件
 */
const { TabPane } = Tabs;

const viewMessagePrompt = 'sinv.common.view.message';

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [deliveryCreation={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {boolean} [getHeaderAttachmentUuidLoading=false] - 获取附件uuid处理中
 * @reactProps {boolean} [deleteDetailLinesLoading=false] - 删除明细行处理中
 * @reactProps {boolean} [addDetailLinesLoading=false] - 添加明细行处理中
 * @reactProps {boolean} [submitDeliveryLoading=false] - 提交送货单处理中
 * @reactProps {boolean} [deleteDeliveryLoading=false] - 删除送货单处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建行处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护行处理中
 * @reactProps {boolean} [queryDetailHeaderLoading=false] - 查询明细头处理中
 * @reactProps {boolean} [queryDetailListLoading=false] - 查询明细行处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SINV.DELIVERY_CREATION_DETAIL.HEADER',
    'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC',
    'SINV.DELIVERY_CREATION_DETAIL.LOGISTICS',
    'SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
    'SINV.DELIVERY_CREATION_DETAIL.BBUTTONS.BASIC_BTN',
  ],
})
@connect(({ loading = {}, deliveryCreation = {} }) => ({
  saveDetailLoading: loading.effects['deliveryCreation/saveDetail'],
  getHeaderAttachmentUuidLoading: loading.effects['deliveryCreation/getHeaderAttachmentUuid'],
  deleteDetailLinesLoading: loading.effects['deliveryCreation/deleteDetailLines'],
  addDetailLinesLoading: loading.effects['deliveryCreation/addDetailLines'],
  submitDeliveryLoading: loading.effects['deliveryCreation/submitDelivery'],
  deleteDeliveryLoading: loading.effects['deliveryCreation/deleteDelivery'],
  queryCreateListLoading: loading.effects['deliveryCreation/queryCreateList'],
  queryMaintenanceListLoading: loading.effects['deliveryCreation/queryMaintenanceList'],
  queryDetailHeaderLoading: loading.effects['deliveryCreation/queryDetailHeader'],
  queryDetailListLoading: loading.effects['deliveryCreation/queryDetailList'],
  queryPoItemBOMLoading: loading.effects['deliveryCreation/fetchBOM'],

  deliveryCreation,
}))
@formatterCollections({
  code: [
    'sinv.deliveryCreation',
    'sinv.purchaserDelivery',
    'sinv.common',
    'entity.company',
    'entity.customer',
    'entity.supplier',
    'entity.item',
    'entity.roles',
    'sinv.receiptExecution',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      headerInfo: {}, // 头form数据源
      collapseKeys: ['orderHeaderShipInfo', 'orderHeaderInfo'], // 打开的折叠面板key
      dataSource: [], // 表格数据源
      supplierAttachmentUuid: '',
      visible: false,
      asnLineId: null,
      attachmentUuid: null,
      objectVersionNumber: null,
      otherAttachmentUuid: null,
      reviewAttachmentUuid: null,
      approveAttachmentUuid: null,
      lineVisible: false,
      wrapperBOMModalVisible: false,
      dimensions: [], // tab数据
      asnLineIdList: {}, // 初始化的id(对象内置id)
      nowId: null, // 当前tab页的id
      actionListRowData: {},
      configSheetFlag: false, // 查询是否在配置表
    };

    // 方法注册
    [
      'onCollapseChange',
      'save',
      'deleteDelivery',
      'invalidDelivery',
      'getActionBtnsByAsnStatus',
      'submitDelivery',
      'fetchDetailCreateList',
      'addDetailLines',
      'deleteDetailLines',
      'setItemInfoListDataSource',
      'saveErrorResponse',
      'submitErrorResponse',
      'getHeaderAttachmentUuid',
      'getLineAttachmentUuid',
      'afterOpenHeaderUploadModal',
      'afterOpenLineUploadModal',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  headerInfoForms = {};

  headerReceiveForms = {};

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    this.fetchConfig();
    this.fetchDetailTable();
  }

  componentWillUnmount() {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'deliveryCreation/over',
    //   payload: {},
    // });
  }

  // 查询配置表逻辑
  fetchConfig = async () => {
    const res = await fetchConfigSheet({
      configCode: 'sinv_asn_logistics_information_phone_no_need',
    });
    if (getResponse(res)) {
      if (!isEmpty(res)) {
        this.setState({
          configSheetFlag: true,
        });
      }
    }
  };

  @Bind()
  fetchDetailTable(numId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryCreation/fetchDetailTable',
    }).then((res) => {
      if (Array.isArray(res) && res.length) {
        this.setState({
          dimensions: res instanceof Array ? res : [],
          asnLineIdList: res[0] || {}, // 默认获取第一条数据,取id
          nowId: res[0].asnHeaderId,
        });
        this.fetchDetailHeader(numId);
        this.fetchDetailList(numId);
      }
    });
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  fetchDetailHeader(numId) {
    const { dispatch } = this.props;
    const { asnLineIdList } = this.state;
    dispatch({
      type: 'deliveryCreation/queryDetailHeader',
      payload: {
        asnHeaderId: numId || asnLineIdList.asnHeaderId,
        customizeUnitCode:
          'SINV.DELIVERY_CREATION_DETAIL.HEADER,SINV.DELIVERY_CREATION_DETAIL.LOGISTICS,SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res,
          supplierAttachmentUuid: res.supplierAttachmentUuid,
        });
      }
    });
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} params - 查询条件
   */
  fetchDetailList(numId, sorter) {
    const { dispatch } = this.props;
    const { asnLineIdList } = this.state;
    this.setState({ dataSource: [] });
    dispatch({
      type: 'deliveryCreation/queryDetailList',
      params: {
        sort: sorter,
        asnHeaderId: numId || asnLineIdList.asnHeaderId,
        customizeUnitCode: 'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.map((n) => ({ ...n, _status: 'update' })),
        });
      }
    });
  }

  /**
   * fetchDetailCreateList - 查询可创建行数据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  fetchDetailCreateList(params, success = (e) => e) {
    const { dispatch } = this.props;
    const { headerInfo = {}, asnLineIdList } = this.state;
    dispatch({
      type: 'deliveryCreation/queryDetailCreateList',
      asnHeaderId: headerInfo.asnHeaderId || asnLineIdList.asnHeaderId,
      params,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  save() {
    const { dispatch = (e) => e } = this.props;
    const { headerInfo = {}, dataSource = [], nowId, asnLineIdList } = this.state;
    if (!nowId) return false;
    const { validateFields = (e) => e } = this.headerInfoForms[nowId] || {};
    const { validateFields: validateReceiveFields = (e) => e } =
      this.headerReceiveForms[nowId] || {};
    const { defaultLogisticsInfoFormDataSource = {}, logisticsForm = {} } = this.list || {};
    const { validateFields: validateFieldsLogistics = (e) => e } = logisticsForm?.props?.form;
    validateFields((err, values) => {
      if (!err) {
        validateReceiveFields((erro, reValues) => {
          if (!erro) {
            validateFieldsLogistics((error) => {
              if (!error) {
                const listDataSource = getEditTableData(dataSource, [
                  'asnLineId',
                  'quantityInvalidFlag',
                ]).map((n) => ({
                  ...n,
                  productionDate: n.productionDate
                    ? n.productionDate.format(DATETIME_MIN)
                    : undefined,
                  lotExpirationDate: n.lotExpirationDate
                    ? n.lotExpirationDate.format(DATETIME_MIN)
                    : undefined,
                }));
                if (
                  dataSource.length === 0 ||
                  (Array.isArray(listDataSource) && listDataSource.length !== 0)
                ) {
                  const { shipDate, expectedArriveDate, remark } = values;
                  const data = {
                    ...headerInfo,
                    ...values,
                    ...reValues,
                    ...(isFunction(logisticsForm.props?.form.getFieldsValue)
                      ? logisticsForm.props?.form.getFieldsValue()
                      : defaultLogisticsInfoFormDataSource),
                    shipDate: moment(shipDate).format(DATETIME_MIN),
                    expectedArriveDate: moment(expectedArriveDate).format(DEFAULT_DATETIME_FORMAT),
                    asnLineList: listDataSource.map((n) => ({
                      ...n,
                      asnHeaderId: headerInfo.asnHeaderId,
                    })),
                    remark,
                  };
                  if (isNil(headerInfo._token)) return;
                  if (
                    !validTime(
                      data.shipDate,
                      intl.get(`sinv.common.model.common.shipDate`).d('发货日期')
                    )
                  ) {
                    return false;
                  }
                  if (
                    !validTime(
                      data.expectedArriveDate,
                      intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间')
                    )
                  ) {
                    return false;
                  }
                  dispatch({
                    type: 'deliveryCreation/saveDetail',
                    params: {
                      customizeUnitCode:
                        'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC,SINV.DELIVERY_CREATION_DETAIL.HEADER,SINV.DELIVERY_CREATION_DETAIL.LOGISTICS,SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
                      data,
                    },
                  }).then((res) => {
                    if (res.success) {
                      notification.success();
                      // this.fetchDetailTable(nowId || asnLineIdList.asnHeaderId);
                      this.fetchDetailHeader(nowId || asnLineIdList.asnHeaderId);
                      this.fetchDetailList(nowId || asnLineIdList.asnHeaderId);
                    } else {
                      this.saveErrorResponse(res);
                    }
                  });
                }
              }
            });
          }
        });
      }
    });
  }

  /**
   * deleteDelivery - 删除送货单
   */
  deleteDelivery() {
    const { dispatch } = this.props;
    const { headerInfo, dimensions = [] } = this.state;
    if (headerInfo.asnStatus === 'NEW') {
      Modal.confirm({
        title: intl.get(`sinv.common.model.common.confirmDelete`).d('是否确认删除送货单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          dispatch({
            type: 'deliveryCreation/deleteDelivery',
            data: [headerInfo],
          }).then(() => {
            // if (res) {
            //   this.fetchDetailTable();
            //   notification.success();
            // }
            if (dimensions.length !== 1) {
              this.fetchDetailTable();
              // 删除之后删除缓存的asnHeaderId，使得查询数据默认取asnLineIdList
              this.setState({ nowId: undefined });
              notification.success();
            } else {
              dispatch(
                routerRedux.push({
                  pathname: '/sinv/delivery-creation/list',
                  state: {
                    _back: -1,
                  },
                })
              );
            }
          });
        },
      });
    }
  }

  /**
   * deleteDelivery - 作废送货单
   */
  invalidDelivery() {
    const { dispatch } = this.props;
    // const { params } = match;
    const { headerInfo, nowId, dimensions } = this.state;
    const { asnStatus, _token, objectVersionNumber } = headerInfo;
    if (asnStatus === 'REJECTED') {
      Modal.confirm({
        title: intl.get(`sinv.common.model.common.confirmDestroy`).d('是否确认作废送货单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          dispatch({
            type: 'deliveryCreation/deleteDelivery',
            data: [
              {
                _token,
                objectVersionNumber,
                asnHeaderId: nowId,
              },
            ],
          }).then(() => {
            if (dimensions.length !== 1) {
              this.fetchDetailTable();
              notification.success();
            } else {
              dispatch(
                routerRedux.push({
                  pathname: '/sinv/delivery-creation/list',
                  state: {
                    _back: -1,
                  },
                })
              );
            }
          });
        },
      });
    }
  }

  /**
   * submitDelivery - 提交明细数据
   * 提交明细头数据和行明细相关字段
   */
  submitDelivery() {
    const { dispatch = (e) => e } = this.props;
    const { headerInfo = {}, dataSource, dimensions, nowId } = this.state;
    if (!nowId) return false;
    const { validateFields = (e) => e } = this.headerInfoForms[nowId] || {};
    const { validateFields: validateReceiveFields = (e) => e } =
      this.headerReceiveForms[nowId] || {};
    const { defaultLogisticsInfoFormDataSource = {}, logisticsForm = {} } = this.list || {};
    const { validateFields: validateFieldsLogistics = (e) => e } = logisticsForm?.props?.form;
    validateFields((err, values) => {
      if (!err) {
        validateReceiveFields((erro, reValues) => {
          if (!erro) {
            validateFieldsLogistics((error) => {
              if (!error) {
                const listDataSource = getEditTableData(dataSource, [
                  'asnLineId',
                  'quantityInvalidFlag',
                ]).map((n) => ({
                  ...n,
                  productionDate: n.productionDate
                    ? n.productionDate.format(DATETIME_MIN)
                    : undefined,
                  lotExpirationDate: n.lotExpirationDate
                    ? n.lotExpirationDate.format(DATETIME_MIN)
                    : undefined,
                }));
                if (
                  dataSource.length === 0 ||
                  (Array.isArray(listDataSource) && listDataSource.length !== 0)
                ) {
                  const { shipDate, expectedArriveDate, remark } = values;
                  const data = {
                    ...headerInfo,
                    ...values,
                    ...reValues,
                    ...(isFunction(logisticsForm.props?.form.getFieldsValue)
                      ? logisticsForm.props?.form.getFieldsValue()
                      : defaultLogisticsInfoFormDataSource),
                    shipDate: moment(shipDate).format(DATETIME_MIN),
                    expectedArriveDate: moment(expectedArriveDate).format(DEFAULT_DATETIME_FORMAT),
                    asnLineList: listDataSource.map((n) => ({
                      ...n,
                      remark: n.supplierRemark,
                      asnHeaderId: headerInfo.asnHeaderId,
                    })),
                    remark,
                  };
                  if (
                    !validTime(
                      data.shipDate,
                      intl.get(`sinv.common.model.common.shipDate`).d('发货日期')
                    )
                  ) {
                    return false;
                  }
                  if (
                    !validTime(
                      data.expectedArriveDate,
                      intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间')
                    )
                  ) {
                    return false;
                  }
                  Modal.confirm({
                    title: intl
                      .get(`sinv.common.model.common.confirmSubmit`)
                      .d('是否确认提交送货单'),
                    okText: intl.get('hzero.common.button.sure').d('确定'),
                    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                    onOk: () => {
                      dispatch({
                        type: 'deliveryCreation/submitDelivery',
                        payload: {
                          data: [data],
                          customizeUnitCode:
                            'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC,SINV.DELIVERY_CREATION_DETAIL.HEADER,SINV.DELIVERY_CREATION_DETAIL.LOGISTICS,SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
                        },
                      }).then((res) => {
                        if (dimensions.length !== 1 || !res.success) {
                          if (res.success) {
                            notification.success();
                            this.fetchDetailTable();
                          } else {
                            this.submitErrorResponse(res);
                          }
                        } else {
                          dispatch(
                            routerRedux.push({
                              pathname: '/sinv/delivery-creation/list',
                              state: {
                                _back: -1,
                              },
                            })
                          );
                        }
                      });
                    },
                  });
                }
              }
            });
          }
        });
      }
    });
  }

  /**
   * saveErrorResponse - 处理保存和提交时返回值错误信息
   * @param {object} [res={}] - 返回值
   */
  saveErrorResponse(res = {}) {
    const { response = {} } = res;
    const { message, asnLineList = [] } = response;
    const defaultDataSource = this.state.dataSource;
    const newDataSource = (defaultDataSource || []).map((n) => ({
      ...n,
      quantityInvalidFlag: !isEmpty(
        asnLineList.filter((o) => o.asnLineId === n.asnLineId && o.quantityInvalidFlag)
      )
        ? 1
        : 0,
    }));
    const description = (
      <ul style={{ margin: 0, padding: 0 }}>
        {asnLineList
          .filter((o) => o.quantityInvalidFlag === 1)
          .map((n) => {
            const num = findIndex(defaultDataSource, (o) => o.asnLineId === n.asnLineId) + 1;
            return (
              <li key={n.asnLineId}>
                {`${intl
                  .get(`sinv.common.model.common.displayAsnLineNum4`, { num })
                  .d(`第${num}行`)},${intl
                  .get(`sinv.purchaseReception.view.message.lineNum`)
                  .d('行号')}: ${n.displayAsnLineNum || ''}, ${intl
                  .get(`sinv.common.model.common.displayAsnLineNum2`)
                  .d('本次发货数量大于可发货数量')}\n`}
              </li>
            );
          })}
      </ul>
    );
    notification.error({
      description: message || description,
    });
    this.setItemInfoListDataSource(newDataSource);
  }

  /**
   * saveErrorResponse - 处理保存和提交时返回值错误信息
   * @param {object} [res={}] - 返回值
   */
  submitErrorResponse(res = {}) {
    const { response } = res;
    if (Object.prototype.toString.call(response) === '[object Array]') {
      const { message } = response[0] || {};
      const { asnLineList = [] } = response[0];
      const defaultDataSource = this.state.dataSource;
      const newDataSource = (defaultDataSource || []).map((n) => ({
        ...n,
        quantityInvalidFlag: !isEmpty(
          asnLineList.filter((o) => o.asnLineId === n.asnLineId && o.quantityInvalidFlag)
        )
          ? 1
          : 0,
      }));
      const description = (
        <ul style={{ margin: 0, padding: 0 }}>
          {asnLineList
            .filter((o) => o.quantityInvalidFlag === 1)
            .map((n) => {
              const num = findIndex(defaultDataSource, (o) => o.asnLineId === n.asnLineId) + 1;
              return (
                <li key={n.asnLineId}>
                  {`${intl
                    .get(`sinv.common.model.common.displayAsnLineNum4`, { num })
                    .d(`第${num}行`)},${intl
                    .get(`sinv.common.model.common.asnLineNum`)
                    .d('行号')}: ${n.displayAsnLineNum || ''}, ${intl
                    .get(`sinv.common.model.common.displayAsnLineNum2`)
                    .d('本次发货数量大于可发货数量')}\n`}
                </li>
              );
            })}
        </ul>
      );
      notification.error({
        description: message || description,
      });
      this.setItemInfoListDataSource(newDataSource);
    } else {
      notification.error({
        description: response.message,
      });
    }
  }

  /**
   * addDetailLines - 添加可创建行数据
   * @param {object} data - 提交数据
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  addDetailLines(data, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    const { headerInfo = {}, dataSource = [] } = this.state;
    dispatch({
      type: 'deliveryCreation/addDetailLines',
      asnHeaderId: headerInfo.asnHeaderId || match.params.id,
      data,
    }).then((res) => {
      if (res) {
        const addRowKeys = res.asnLineList.map((i) => i.asnLineId);
        success(res);
        dispatch({
          type: 'deliveryCreation/queryDetailList',
          params: {
            asnHeaderId: res.asnHeaderId || match.params.id,
            customizeUnitCode: 'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC',
          },
        }).then((listRes) => {
          const updatedAddLines = [];
          listRes.forEach((item) => {
            if (addRowKeys.includes(item.asnLineId)) {
              updatedAddLines.push({ ...item, _status: 'update' });
            }
          });
          this.setState({
            dataSource: [...dataSource, ...updatedAddLines],
          });
        });
      }
    });
  }

  /**
   * deleteDetailLines - 删除明细行数据
   * @param {object} data - 提交数据
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  deleteDetailLines(data, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    const { headerInfo = {} } = this.state;
    dispatch({
      type: 'deliveryCreation/deleteDetailLines',
      asnHeaderId: headerInfo.asnHeaderId || match.params.id,
      data,
    }).then((res) => {
      if (res) {
        success(res);
        this.fetchDetailList();
      }
    });
  }

  /**
   * getHeaderAttachmentUuid - 获取头附件uuid
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuid() {
    const { dispatch } = this.props;
    const { headerInfo = {} } = this.state;

    const {
      asnHeaderId,
      objectVersionNumber,
      _token,
      otherAttachmentUuid,
      approveAttachmentUuid,
      reviewAttachmentUuid,
    } = headerInfo;
    const supplierAttachmentUuid = uuid();
    dispatch({
      type: 'deliveryCreation/getHeaderAttachmentUuid',
      data: {
        asnHeaderId,
        objectVersionNumber,
        _token,
        otherAttachmentUuid,
        approveAttachmentUuid,
        supplierAttachmentUuid,
        reviewAttachmentUuid,
      },
    }).then((res) => {
      if (res) {
        this.fetchDetailHeader();
      }
    });
  }

  /**
   * getLineAttachmentUuid - 获取头附件uuid
   * @param {!string} attachmentUuid - 附件uuid返回值
   * @param {object} record - 行数据
   */
  getLineAttachmentUuid(attachmentUuid, record) {
    const { dataSource } = this.state;
    const { dispatch } = this.props;
    const { asnLineId, objectVersionNumber, _token } = record;
    dispatch({
      type: 'deliveryCreation/getLineAttachmentUuid',
      data: { asnLineId, objectVersionNumber, _token, attachmentUuid },
    }).then((res) => {
      if (res) {
        const newDataSource = dataSource.map((item) => {
          if (item.asnLineId === res.asnLineId) {
            const { attachmentUuid: newUuid, objectVersionNumber: newObjNum } = res;
            return {
              ...item,
              attachmentUuid: newUuid,
              objectVersionNumber: newObjNum,
              _status: 'update',
            };
          }
          return item;
        });
        this.setState({ dataSource: newDataSource });
      }
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * getActionBtnsByAsnStatus - 根据状态控制作废/删除按钮
   * 提交明细头数据和行明细相关字段
   */
  getActionBtnsByAsnStatus() {
    const {
      deleteDeliveryLoading,
      invalidLoading,
      queryDetailHeaderLoading,
      queryDetailListLoading,
      saveDetailLoading,
    } = this.props;
    const { headerInfo = {} } = this.state;
    const actionTypeMap = {
      NEW: (
        <Button
          loading={deleteDeliveryLoading}
          onClick={this.deleteDelivery}
          disabled={
            invalidLoading ||
            saveDetailLoading ||
            queryDetailHeaderLoading ||
            queryDetailListLoading
          }
          icon="delete"
        >
          {intl.get(`hzero.common.button.delete`).d('删除')}
        </Button>
      ),
      REJECTED: (
        <Button
          loading={invalidLoading || deleteDeliveryLoading}
          onClick={this.invalidDelivery}
          disabled={
            deleteDeliveryLoading ||
            saveDetailLoading ||
            queryDetailHeaderLoading ||
            queryDetailListLoading
          }
          icon="delete"
        >
          {intl.get(`hzero.common.button.invalid`).d('作废')}
        </Button>
      ),
    };
    return actionTypeMap[headerInfo.asnStatus || 'NEW'];
  }

  /**
   * setItemInfoListDataSource - 设置物料信息数据源
   * @param {!Array<object>} dataSource - 数据源
   */
  setItemInfoListDataSource(dataSource) {
    this.setState({
      dataSource,
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  afterOpenHeaderUploadModal(supplierAttachmentUuid) {
    const { headerInfo = {} } = this.state;
    if (!headerInfo.supplierAttachmentUuid) {
      this.getHeaderAttachmentUuid(supplierAttachmentUuid);
    }
  }

  /**
   * 删除附件
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @param {string} payload.urls 要删除附件的url
   * @returns Promise
   */
  @Bind()
  removeAttachment(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'deliveryCreation/removeFile',
      payload,
    });
  }

  /**
   * afterOpenLineUploadModal - 行附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   * @param {object} record - 行数据
   */
  afterOpenLineUploadModal(attachmentUuid, record) {
    if (isEmpty(record.attachmentUuid)) {
      this.getLineAttachmentUuid(attachmentUuid, record);
    }
  }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ visible: false });
  }

  /**
   * 查询采购方附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchPurchaserAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'deliveryCreation/queryFileListOrg',
      payload,
    });
  }

  /**
   * 查询供应商附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchSupplierAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'deliveryCreation/queryFileListOrg',
      payload,
    });
  }

  @Bind()
  openUploadModal() {
    this.setState({ visible: true }, () => {
      const {
        headerInfo: { supplierAttachmentUuid },
      } = this.state;
      if (!supplierAttachmentUuid) {
        this.getHeaderAttachmentUuid();
      }
    });
  }

  @Bind()
  attachmentUuidList(val, record) {
    this.setState({
      lineVisible: true,
      // _token: record._token,
      asnLineId: record.asnLineId,
      attachmentUuid: record.attachmentUuid,
      objectVersionNumber: record.objectVersionNumber,
      otherAttachmentUuid: record.otherAttachmentUuid, // 采购方uuid
      reviewAttachmentUuid: record.reviewAttachmentUuid, // 采购方uuid
      approveAttachmentUuid: record.approveAttachmentUuid, // 采购方uuid
    });
  }

  @Bind()
  lineHideAttachment() {
    this.setState({ lineVisible: false });
  }

  /**
   * openBOMModal - 打开BOM Modal
   * @param {object} [actionListRowData = {}] - 当前操作行数据
   */
  @Bind()
  openBOMModal(_, actionListRowData = {}) {
    this.setState({
      wrapperBOMModalVisible: true,
      actionListRowData,
    });
  }

  /**
   * closeBOMModal - 关闭BOM Modal 清空当前操作行数据
   */
  @Bind()
  closeBOMModal() {
    this.setState({
      wrapperBOMModalVisible: false,
      actionListRowData: {},
    });
  }

  /**
   * fetchBOM - 查询BOM数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  @Bind()
  fetchBOM(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    const { actionListRowData = {} } = this.state;
    const { asnLineId } = actionListRowData;
    dispatch({
      type: 'deliveryCreation/fetchBOM',
      payload: {
        functionCode: 'ASN_MAINTAIN',
        poHeaderId: match.params.id, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
        poLineId: asnLineId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
        ...params,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  @Bind()
  saveClick() {
    const { dispatch } = this.props;
    const listDataSource = getEditTableData(this.listModal.state.dataSource);
    dispatch({
      type: 'deliveryCreation/saveBOM',
      listDataSource,
    }).then((res) => {
      if (res) {
        // success(res);
        this.fetchBOM();
      }
    });
  }

  @Bind()
  sortChange(page, _, sorter) {
    const { nowId } = this.state;
    this.fetchDetailList(nowId, sorter);
  }

  @Bind()
  renderDimensions() {
    const {
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      queryDetailHeaderLoading,
      queryDetailListLoading,
      saveDetailLoading,
      submitDeliveryLoading,
      addDetailLinesLoading,
      deleteDetailLinesLoading,
    } = this.props;
    const {
      collapseKeys,
      headerInfo = {},
      dataSource = [],
      dimensions = [],
      configSheetFlag = false,
    } = this.state;
    const headerInfoFormProps = {
      customizeForm,
      onRef: (form, key) => {
        this.headerInfoForms[key] = form;
      },
      dataSource: headerInfo,
    };
    const headerReceiveFormProps = {
      customizeForm,
      onRef: (form, key) => {
        this.headerReceiveForms[key] = form;
      },
      dataSource: headerInfo,
    };
    const listProps = {
      customizeForm,
      customizeTable,
      configSheetFlag,
      customizeBtnGroup,
      dataSource,
      onRef: (node) => {
        this.list = node;
      },
      processing: {
        queryDetailListLoading,
        queryDetailHeaderLoading,
        addDetailLinesLoading,
        deleteDetailLinesLoading,
        saveDetailLoading,
        submitDeliveryLoading,
      },
      logisticsInfo: headerInfo,
      sortChange: this.sortChange,
      fetchList: this.fetchDetailList,
      openBOMModal: this.openBOMModal,
      addDetailLines: this.addDetailLines,
      deleteLines: this.deleteDetailLines,
      attachmentUuidList: this.attachmentUuidList,
      setDataSource: this.setItemInfoListDataSource,
      fetchDetailCreateList: this.fetchDetailCreateList,
      afterOpenLineUploadModal: this.afterOpenLineUploadModal,
    };
    // const FilterForm = flow(Form.create({ fieldNameProp: null }))(HeaderInfoForm);
    return dimensions.map((item) => {
      return (
        <TabPane tab={item.asnNum} key={item.asnHeaderId}>
          <Collapse
            className="form-collapse"
            defaultActiveKey={collapseKeys}
            onChange={this.onCollapseChange}
          >
            <Panel
              showArrow={false}
              header={
                <Fragment>
                  <h3>
                    {intl.get(`${viewMessagePrompt}.title.orderHeaderShipInfo`).d('发货信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('orderHeaderShipInfo')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderHeaderShipInfo') ? 'up' : 'down'} />
                </Fragment>
              }
              key="orderHeaderShipInfo"
            >
              <HeaderShipInfoForm {...{ ...headerInfoFormProps, formKey: item.asnHeaderId }} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <Fragment>
                  <h3>
                    {intl.get(`${viewMessagePrompt}.title.orderHeaderDispatchedInfo`).d('收货信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('orderHeaderInfo')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                </Fragment>
              }
              key="orderHeaderInfo"
            >
              <HeaderInfoForm {...{ ...headerReceiveFormProps, formKey: item.asnHeaderId }} />
            </Panel>
          </Collapse>
          <List {...listProps} />
        </TabPane>
      );
    });
  }

  @Bind()
  tabChange(n) {
    const numId = n;
    this.fetchDetailHeader(numId);
    this.fetchDetailList(numId);
    this.setState({
      nowId: numId, // 获取当前tab页的id
    });
  }

  render() {
    const {
      queryDetailHeaderLoading,
      saveDetailLoading,
      submitDeliveryLoading,
      queryDetailListLoading,
      queryPoItemBOMLoading,
    } = this.props;
    const {
      headerInfo = {},
      lineVisible,
      visible,
      otherAttachmentUuid,
      reviewAttachmentUuid,
      approveAttachmentUuid,
      wrapperBOMModalVisible,
      actionListRowData,
    } = this.state;
    const organizationId = getCurrentOrganizationId();
    const lineAttachmentProps = {
      lineVisible,
      hideAttachment: this.lineHideAttachment,
      otherAttachmentUuid, // 采购方uuid查询
      reviewAttachmentUuid, // 采购方uuid复审
      approveAttachmentUuid, // 采购方uuid审批
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList, // 查询采购方附件
      bucketName: 'private-bucket',
      bucketDirectory: 'sodr-order',
      onRemoveAttachment: this.removeAttachment,
    };
    const uploadModalProps = {
      visible,
      hideAttachment: this.hideAttachment,
      supplierAttachmentUuid: headerInfo.supplierAttachmentUuid, // 采购方uuid
      otherAttachmentUuid: headerInfo.otherAttachmentUuid, // 供应商uuid
      reviewAttachmentUuid: headerInfo.reviewAttachmentUuid, // 供应商uuid
      approveAttachmentUuid: headerInfo.approveAttachmentUuid, // 供应商uuid
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      // loading: queryFileListOrgLoading, // 加载状态
      bucketName: 'private-bucket',
      bucketDirectory: 'sinv-order',
      onRemoveAttachment: this.removeAttachment,
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    };
    const { itemCode, itemName, key, poHeaderId, poLineId } = actionListRowData;
    const BomModalPops = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal,
      fetchBOM: this.fetchBOM,
      saveClick: this.saveClick,
      actionkey: key,
      loading: queryPoItemBOMLoading,
      itemCode,
      itemName,
      poHeaderId,
      poLineId,
      onRef: (node) => {
        this.listModal = node;
      },
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`${viewMessagePrompt}.title.detail`).d('送货单明细')}
          backPath="/sinv/delivery-creation/list"
        >
          <Button
            loading={saveDetailLoading}
            onClick={this.save}
            icon="save"
            type="primary"
            disabled={queryDetailHeaderLoading || queryDetailListLoading || submitDeliveryLoading}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button
            loading={submitDeliveryLoading}
            icon="check"
            disabled={saveDetailLoading || queryDetailHeaderLoading || queryDetailListLoading}
            onClick={this.submitDelivery}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          {this.getActionBtnsByAsnStatus()}
          <ExcelExport
            buttonText={intl.get(`sinv.common.view.button.exportDetail`).d('导出明细行')}
            otherButtonProps={{ icon: 'export', disabled: isNil(headerInfo.asnHeaderId) }}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/asn-header/${headerInfo.asnHeaderId}/lines/export`}
            // queryParams={{ asnHeaderId: headerInfo.asnHeaderId }}
          />
          <Button onClick={this.openUploadModal} icon="paper-clip">
            {intl.get('sinv.common.attachment.upload').d('附件管理')}
          </Button>
          {visible && <UploadModal {...uploadModalProps} />}
        </Header>
        <Content>
          <Spin
            spinning={
              queryDetailHeaderLoading || saveDetailLoading || submitDeliveryLoading || false
            }
            wrapperClassName={classnames(
              styles['purchase-requisition-creation-detail'],
              DETAIL_DEFAULT_CLASSNAME
            )}
          >
            <Tabs
              defaultActiveKey="company"
              animated={false}
              onTabClick={this.tabChange}
              tabPosition="left"
              className={styles['sub-accout-tabs']}
            >
              {this.renderDimensions()}
            </Tabs>
          </Spin>
        </Content>
        {lineVisible && <LineItemModal {...lineAttachmentProps} />}
        {wrapperBOMModalVisible && <BomModal {...BomModalPops} />}
      </Fragment>
    );
  }
}
