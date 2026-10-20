/**
 * index - 送货单创建明细
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Modal, Icon } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty, isFunction, isNil } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, getEditTableData, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import cuxRemote from 'hzero-front/lib/utils/remote';
import {
  DATETIME_MIN,
  DETAIL_DEFAULT_CLASSNAME,
  DEFAULT_DATETIME_FORMAT,
  DATETIME_MAX,
} from 'utils/constants';
import { SRM_SPUC } from '_utils/config';
import uuid from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import UploadModal from './UploadModal';
import LineItemModal from './LineItemModal';
import HeaderInfoForm from './HeaderInfoForm';
import HeaderShipInfoForm from './ShipmentForm';
import List from './List';
import styles from './index.less';
import BomModal from './BOMModal';
import { validTime } from '@/routes/components/utils';
import { fetchConfigSheet } from '@/services/commonService';
// 折叠面板组件初始化
const { Panel } = Collapse;

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
    'SINV.DELIVERY_CREATION_DETAIL.BBUTTONS.BASIC_BTN',
    'SINV.DELIVERY_CREATION_DETAIL.LOGISTICS',
    'SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
    'SINV.DELIVERY_CREATION.DETAIL.BUTTONS.BTN',
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
@cuxRemote(
  {
    code: 'SINV_DELIVERY_CREATION_DETAIL', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      custHeaderOthersButtonFn: undefined, // 自定义处理表头其他按钮
    },
  }
)
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
    'sinv.cuxDeliveryCreation',
    'entity.attachment',
    'sinv.receiptExecution',
    'hiam.subAccount',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      headerInfo: {}, // 头form数据源
      collapseKeys: ['orderHeaderInfo', 'orderHeaderInfos'], // 打开的折叠面板key
      dataSource: [], // 表格数据源
      // supplierAttachmentUuid: '',
      visible: false,
      asnLineId: null,
      attachmentUuid: null,
      objectVersionNumber: null,
      otherAttachmentUuid: null,
      reviewAttachmentUuid: null,
      approveAttachmentUuid: null,
      lineVisible: false,
      dataSourceLoading: true, // 解决个性化在查询完成之前缓存dataSource的问题
      wrapperBOMModalVisible: false,
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

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { match = {} } = this.props;
    const { params } = match;
    if (isNumber(Number(params.id))) {
      this.fetchConfig();
      this.fetchDetailHeader();
      this.fetchDetailList();
      this.fetchLogisticsCompany();
    }
  }

  componentDidUpdate(prevProps) {
    const { match = {} } = this.props;
    const { params } = match;
    if (prevProps.match.params.id !== params.id) {
      if (isNumber(Number(params.id))) {
        this.fetchDetailHeader();
        this.fetchDetailList();
      }
    }
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
  fetchLogisticsCompany() {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryCreation/fetchLov',
    });
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  fetchDetailHeader() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    if (isNil(params.id)) {
      return;
    }
    dispatch({
      type: 'deliveryCreation/queryDetailHeader',
      payload: {
        asnHeaderId: params.id,
        customizeUnitCode:
          'SINV.DELIVERY_CREATION_DETAIL.HEADER,SINV.DELIVERY_CREATION_DETAIL.LOGISTICS,SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            headerInfo: res,
            dataSourceLoading: false,
            // supplierAttachmentUuid: res.supplierAttachmentUuid,
          },
          () => {
            this.headerInfoForm.resetFields();
            setTimeout(() => {
              this.forceUpdate();
            }, 500);
          }
        );
      }
    });
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} params - 查询条件
   */
  fetchDetailList(sorter) {
    const { dispatch, match = {} } = this.props;
    const { params } = match;

    dispatch({
      type: 'deliveryCreation/queryDetailList',
      params: {
        sort: sorter,
        asnHeaderId: params.id,
        customizeUnitCode: 'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC',
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            dataSource: res.map((n) => ({ ...n, _status: 'update' })),
          },
          () => {
            this.state.dataSource.forEach((i) => {
              Promise.all(this.handleGetPicNums(i)).then((r) => {
                if (r.reduce((prev, cur) => prev + cur) === 0) {
                  return;
                }
                this.setState({
                  dataSource: this.state.dataSource.map((item) => {
                    if (item.asnLineId === i.asnLineId) {
                      return {
                        ...item,
                        picNums: r.reduce((prev, cur) => prev + cur),
                      };
                    }
                    return { ...item };
                  }),
                });
              });
            });
          }
        );
      }
    });
  }

  /**
   * fetchDetailCreateList - 查询可创建行数据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  fetchDetailCreateList(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    const { headerInfo = {} } = this.state;
    if (isNil(headerInfo.asnHeaderId || match.params.id)) {
      return;
    }
    dispatch({
      type: 'deliveryCreation/queryDetailCreateList',
      asnHeaderId: headerInfo.asnHeaderId || match.params.id,
      params,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  // 重置表单
  resetForm = () => {
    const { resetFields: ShipInfoFormResetFields = (e) => e } = this.headerShipInfoForm || {};
    const { resetFields: InfoFormResetFields = (e) => e } = this.headerInfoForm || {};
    ShipInfoFormResetFields();
    InfoFormResetFields();
  };

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  save() {
    const { dispatch = (e) => e } = this.props;
    const { headerInfo = {}, dataSource = [] } = this.state;
    const { validateFields = (e) => e } = this.headerShipInfoForm || {};
    const { validateFields: validateReceiveFields } = this.headerInfoForm || {};
    const { defaultLogisticsInfoFormDataSource = {}, logisticsForm = {} } = this.list || {};
    const { validateFields: validateFieldsLogistics } = logisticsForm?.props?.form;
    validateFields((err, values) => {
      if (!err) {
        validateReceiveFields((erro, shValues) => {
          if (!erro) {
            validateFieldsLogistics({ force: true }, (error) => {
              if (error && this.list.state.tabsActiveKey !== 'logisticsInfo') {
                Modal.warning({
                  title: intl
                    .get(`sinv.common.model.common.logistics.message`)
                    .d('物流信息页面存在必填字段未填写'),
                });
                return;
              }
              if (!error) {
                const listDataSource = getEditTableData(dataSource, [
                  'asnLineId',
                  'quantityInvalidFlag',
                ]).map((n) => ({
                  ...n,
                  productionDate: n.productionDate
                    ? moment(n.productionDate).format(DATETIME_MIN)
                    : undefined,
                  lotExpirationDate: n.lotExpirationDate
                    ? moment(n.lotExpirationDate)?.format(DATETIME_MIN)
                    : undefined,
                }));
                if (
                  dataSource.length === 0 ||
                  (Array.isArray(listDataSource) && listDataSource.length !== 0)
                ) {
                  const { shipDate, expectedArriveDate, remark, transportType } = values;
                  const data = {
                    ...headerInfo,
                    ...values,
                    ...shValues,
                    ...(isFunction(logisticsForm.props.form.getFieldsValue)
                      ? logisticsForm.props.form.getFieldsValue()
                      : defaultLogisticsInfoFormDataSource),
                    shipDate: shipDate
                      ? moment(shipDate).format(DATETIME_MIN)
                      : moment().format(DATETIME_MIN),
                    expectedArriveDate: expectedArriveDate
                      ? moment(expectedArriveDate).format(DEFAULT_DATETIME_FORMAT)
                      : moment().endOf('day').format(DATETIME_MAX),
                    asnLineList: listDataSource.map((n) => ({
                      ...n,
                      asnHeaderId: headerInfo.asnHeaderId,
                    })),
                    remark,
                    transportType,
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
                  dataSource.map((i) => i.$form.resetFields()); // 手动对数据$form清空
                  dispatch({
                    type: 'deliveryCreation/saveDetail',
                    params: {
                      customizeUnitCode:
                        'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC,SINV.DELIVERY_CREATION_DETAIL.HEADER,SINV.DELIVERY_CREATION_DETAIL.LOGISTICS,SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
                      data,
                    },
                  }).then((res) => {
                    if (res.success) {
                      this.resetForm();
                      notification.success();
                      this.fetchDetailHeader();
                      this.fetchDetailList();
                    } else {
                      this.saveErrorResponse(res);
                      this.setState({
                        dataSource: listDataSource,
                      });
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
    const { headerInfo } = this.state;
    if (headerInfo.asnStatus === 'NEW') {
      Modal.confirm({
        title: intl.get(`sinv.common.model.common.confirmDelete`).d('是否确认删除送货单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          return new Promise((resolve, reject) => {
            dispatch({
              type: 'deliveryCreation/deleteDelivery',
              data: [headerInfo],
            }).then((res) => {
              if (res) {
                notification.success();
                resolve();
                dispatch(
                  routerRedux.push({
                    pathname: '/sinv/delivery-creation/list',
                    state: {
                      _back: -1,
                    },
                  })
                );
              } else {
                reject();
              }
            });
          });
        },
      });
    }
  }

  /**
   * deleteDelivery - 作废送货单
   */
  invalidDelivery() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    const { headerInfo } = this.state;
    const { asnStatus, _token, objectVersionNumber } = headerInfo;
    if (asnStatus === 'REJECTED') {
      Modal.confirm({
        title: intl.get(`sinv.common.model.common.confirmDestroy`).d('是否确认作废送货单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          return new Promise((resolve, reject) => {
            dispatch({
              type: 'deliveryCreation/deleteDelivery',
              data: [
                {
                  _token,
                  objectVersionNumber,
                  asnHeaderId: params.id,
                },
              ],
            }).then((res) => {
              if (res) {
                notification.success();
                resolve();
                dispatch(
                  routerRedux.push({
                    pathname: '/sinv/delivery-creation/list',
                  })
                );
              } else {
                reject();
              }
            });
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
    const { headerInfo = {}, dataSource } = this.state;
    const { validateFields = (e) => e } = this.headerShipInfoForm || {};
    const { validateFields: validateReceiveFields } = this.headerInfoForm || {};
    const { defaultLogisticsInfoFormDataSource = {}, logisticsForm = {} } = this.list || {};
    const { validateFields: validateFieldsLogistics } = logisticsForm.props.form;
    validateFields((err, values) => {
      if (!err) {
        validateReceiveFields((erro, shValues) => {
          if (!erro) {
            validateFieldsLogistics({ force: true }, (error) => {
              if (error && this.list.state.tabsActiveKey !== 'logisticsInfo') {
                Modal.warning({
                  title: intl
                    .get(`sinv.common.model.common.logistics.message`)
                    .d('物流信息页面存在必填字段未填写'),
                });
                return;
              }
              if (!error) {
                // 校验rc-table 校验附件异步上传
                const newListDataSource = dataSource.map(
                  (r) =>
                    new Promise((res) =>
                      r?.$form?.validateFields(
                        (errors, v) => {
                          if (!errors) res({ ...r, ...v });
                          res();
                        },
                        { force: true }
                      )
                    )
                );
                Promise.all(newListDataSource).then((listDataSources) => {
                  const newFilterData = listDataSources
                    .filter((i) => !!i)
                    .map((n) => ({
                      ...n,
                      productionDate: n.productionDate
                        ? moment(n.productionDate).format(DATETIME_MIN)
                        : undefined,
                      lotExpirationDate: n.lotExpirationDate
                        ? moment(n.lotExpirationDate)?.format(DATETIME_MIN)
                        : undefined,
                    }));
                  if (newFilterData.length === dataSource.length && newFilterData.length !== 0) {
                    const { shipDate, expectedArriveDate, remark, transportType } = values;
                    const data = {
                      ...headerInfo,
                      ...values,
                      ...shValues,
                      ...(isFunction(logisticsForm.props.form.getFieldsValue)
                        ? logisticsForm.props.form.getFieldsValue()
                        : defaultLogisticsInfoFormDataSource),
                      shipDate: shipDate
                        ? moment(shipDate).format(DATETIME_MIN)
                        : moment().format(DATETIME_MIN),
                      expectedArriveDate: expectedArriveDate
                        ? moment(expectedArriveDate).format(DEFAULT_DATETIME_FORMAT)
                        : moment().endOf('day').format(DATETIME_MAX),
                      asnLineList: getEditTableData(newFilterData, [
                        'quantityInvalidFlag',
                        'asnLineId',
                      ]).map((n) => ({
                        ...n,
                        remark: n.supplierRemark,
                        asnHeaderId: headerInfo.asnHeaderId,
                        productionDate: n.productionDate
                          ? moment(n.productionDate).format(DATETIME_MIN)
                          : undefined,
                        lotExpirationDate: n.lotExpirationDate
                          ? moment(n.lotExpirationDate)?.format(DATETIME_MIN)
                          : undefined,
                      })),
                      remark,
                      transportType,
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

                    Modal.confirm({
                      title: intl
                        .get(`sinv.common.model.common.confirmSubmit`)
                        .d('是否确认提交送货单'),
                      okText: intl.get('hzero.common.button.sure').d('确定'),
                      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                      confirmLoading: false,
                      onOk: () => {
                        return new Promise((resolve, reject) => {
                          dispatch({
                            type: 'deliveryCreation/submitDelivery',
                            payload: {
                              data: [data],
                              customizeUnitCode:
                                'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC,SINV.DELIVERY_CREATION_DETAIL.HEADER,SINV.DELIVERY_CREATION_DETAIL.LOGISTICS,SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
                            },
                          }).then((res) => {
                            if (res.success) {
                              notification.success();
                              resolve();
                              dispatch(
                                routerRedux.push({
                                  pathname: '/sinv/delivery-creation/list',
                                  state: {
                                    _back: -1,
                                  },
                                })
                              );
                            } else {
                              reject();
                              this.submitErrorResponse(res);
                            }
                          });
                        });
                      },
                    });
                  }
                });
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
            // const num = findIndex(defaultDataSource, o => o.asnLineId === n.asnLineId) + 1;   // findIndex lodash 引用
            return (
              // <li key={n.asnLineId}>
              //   {`
              //   ${intl.get(`sinv.common.model.common.displayAsnLineNum4`, { num }).d(`第${num}行`)},
              //     ${intl.get(`sinv.purchaseReception.view.message.lineNum`).d('行号')}: ${n.displayAsnLineNum || ''}, ${intl
              //     .get(`sinv.common.model.common.displayAsnLineNum2`)
              //     .d('本次发货数量大于可发货数量')}\n`}
              // </li>
              <li key={n.asnLineId}>
                {`
                    ${intl.get(`sinv.purchaseReception.view.message.lineNum`).d('行号')}: ${
                  n.displayAsnLineNum || ''
                }, ${intl
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
              // const num = findIndex(defaultDataSource, o => o.asnLineId === n.asnLineId) + 1;
              return (
                // <li key={n.asnLineId}>
                //   {`${intl
                //     .get(`sinv.common.model.common.displayAsnLineNum4`, { num })
                //     .d(`第${num}行`)},${intl
                //     .get(`sinv.common.model.common.asnLineNum`)
                //     .d('行号')}: ${n.displayAsnLineNum || ''}, ${intl
                //     .get(`sinv.common.model.common.displayAsnLineNum2`)
                //     .d('本次发货数量大于可发货数量')}\n`}
                // </li>
                <li key={n.asnLineId}>
                  {`
                    ${intl.get(`sinv.common.model.common.asnLineNum`).d('行号')}: ${
                    n.displayAsnLineNum || ''
                  }, ${intl
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
    const { headerInfo = {} } = this.state;
    if (isNil(headerInfo.asnHeaderId || match.params.id)) {
      return;
    }
    dispatch({
      type: 'deliveryCreation/addDetailLines',
      asnHeaderId: headerInfo.asnHeaderId || match.params.id,
      data,
    }).then((res) => {
      if (res) {
        // const addRowKeys = res.asnLineList.map((i) => i.asnLineId);
        success(res);
        dispatch({
          type: 'deliveryCreation/queryDetailList',
          params: {
            asnHeaderId: match.params.id,
            customizeUnitCode: 'SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC',
          },
        }).then((listRes) => {
          // const updatedAddLines = [];
          // listRes.forEach((item) => {
          //   if (addRowKeys.includes(item.asnLineId)) {
          //     updatedAddLines.push({ ...item, _status: 'update' });
          //   }
          // });
          // this.setState({
          //   dataSource: [...dataSource, ...updatedAddLines],
          // });
          if (listRes) {
            this.resetForm();
            this.fetchDetailHeader();
            this.fetchDetailList();
          }
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
    if (isNil(headerInfo.asnHeaderId || match.params.id)) {
      return;
    }
    dispatch({
      type: 'deliveryCreation/deleteDetailLines',
      asnHeaderId: headerInfo.asnHeaderId || match.params.id,
      data,
    }).then((res) => {
      if (res) {
        success(res);
        this.resetForm();
        this.fetchDetailHeader();
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
      submitDeliveryLoading,
    } = this.props;
    const { headerInfo = {} } = this.state;
    const actionTypeMap = {
      NEW: (
        <Button
          loading={saveDetailLoading || submitDeliveryLoading || deleteDeliveryLoading}
          onClick={this.deleteDelivery}
          disabled={
            invalidLoading ||
            saveDetailLoading ||
            queryDetailHeaderLoading ||
            queryDetailListLoading ||
            submitDeliveryLoading
          }
          icon="delete"
          data-name="delete"
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
          data-name="reject"
        >
          {intl.get(`hzero.common.button.invalid`).d('作废')}
        </Button>
      ),
    };
    return actionTypeMap[headerInfo.asnStatus || 'NEW'];
  }

  @Bind()
  handleRules(val) {
    const { headerInfo } = this.state;
    this.setState({
      headerInfo: { ...headerInfo, transportType: val },
    });
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

  /**
   * 获取采购方附件
   */
  queryPurchaserAttachmentList = (val) => {
    return this.fetchPurchaserAttachmentList({
      attachmentUUID: val,
      bucketName: 'private-bucket',
    }).then((num) => num.length);
  };

  // 获取附件数量
  handleGetPicNums = (record = {}) => {
    let num1 = 0;
    let num2 = 0;
    let num3 = 0;
    if (record.approveAttachmentUuid) {
      num1 = this.queryPurchaserAttachmentList(record.approveAttachmentUuid);
    }
    if (record.reviewAttachmentUuid) {
      num2 = this.queryPurchaserAttachmentList(record.reviewAttachmentUuid);
    }
    if (record.otherAttachmentUuid) {
      num3 = this.queryPurchaserAttachmentList(record.otherAttachmentUuid);
    }
    return [num1, num2, num3];
  };

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
    this.fetchDetailList(sorter);
  }

  render() {
    const {
      remote,
      customizeForm,
      customizeTable,
      queryDetailHeaderLoading,
      queryDetailListLoading,
      saveDetailLoading,
      submitDeliveryLoading,
      addDetailLinesLoading,
      deleteDetailLinesLoading,
      deleteDeliveryLoading,
      queryPoItemBOMLoading,
      deliveryCreation: { phone = [] },
      customizeBtnGroup,
    } = this.props;
    const organizationId = getCurrentOrganizationId();
    const {
      collapseKeys,
      headerInfo = {},
      dataSource = [],
      // supplierAttachmentUuid,
      visible,
      lineVisible,
      otherAttachmentUuid,
      reviewAttachmentUuid,
      approveAttachmentUuid,
      dataSourceLoading,
      wrapperBOMModalVisible,
      actionListRowData,
      configSheetFlag = false,
    } = this.state;
    const { custHeaderOthersButtonFn } = remote?.props?.process || {};
    const othersBtn =
      (typeof custHeaderOthersButtonFn === 'function' && custHeaderOthersButtonFn(headerInfo)) ||
      null;
    const { itemCode, itemName, key, poHeaderId, poLineId } = actionListRowData;
    const headerInfoShipFormProps = {
      customizeForm,
      dataSourceLoading,
      ref: (node) => {
        this.headerShipInfoForm = node;
      },
      dataSource: headerInfo,
      handleRules: this.handleRules,
    };
    const headerInfoFormProps = {
      customizeForm,
      dataSourceLoading,
      ref: (node) => {
        this.headerInfoForm = node;
      },
      dataSource: headerInfo,
      handleRules: this.handleRules,
    };
    const listProps = {
      customizeForm,
      customizeTable,
      configSheetFlag,
      customizeBtnGroup,
      dataSource,
      phone,
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
      openBOMModal: this.openBOMModal,
      fetchList: this.fetchDetailList,
      addDetailLines: this.addDetailLines,
      deleteLines: this.deleteDetailLines,
      attachmentUuidList: this.attachmentUuidList,
      setDataSource: this.setItemInfoListDataSource,
      fetchDetailCreateList: this.fetchDetailCreateList,
      afterOpenLineUploadModal: this.afterOpenLineUploadModal,
      // assignDataSource: this.assignListDataSource.bind(this),
      // openBOMModal: this.openBOMModal.bind(this),
      // onChange: this.onListChange.bind(this),
    };

    const uploadModalProps = {
      visible,
      fileSize: 100 * 1024 * 1024, // 更改附件上传大小
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
          {customizeBtnGroup({ code: `SINV.DELIVERY_CREATION.DETAIL.BUTTONS.BTN` }, [
            <Button
              data-name="submit"
              loading={submitDeliveryLoading || saveDetailLoading || deleteDeliveryLoading}
              icon="check"
              type="primary"
              disabled={
                saveDetailLoading ||
                queryDetailHeaderLoading ||
                queryDetailListLoading ||
                deleteDeliveryLoading
              }
              onClick={this.submitDelivery}
            >
              {intl.get(`hzero.common.button.submit`).d('提交')}
            </Button>,
            <Button
              data-name="save"
              loading={saveDetailLoading || submitDeliveryLoading || deleteDeliveryLoading}
              onClick={this.save}
              icon="save"
              disabled={
                queryDetailHeaderLoading ||
                queryDetailListLoading ||
                submitDeliveryLoading ||
                deleteDeliveryLoading
              }
            >
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>,
            this.getActionBtnsByAsnStatus(),
            <Button
              data-name="attachment"
              loading={saveDetailLoading || submitDeliveryLoading || deleteDeliveryLoading}
              onClick={this.openUploadModal}
              icon="paper-clip"
            >
              {intl.get('sinv.common.attachment.upload').d('附件管理')}
            </Button>,
            <ExcelExportPro
              data-name="newExport"
              buttonText={intl.get(`sinv.common.view.button.newExportDetail`).d('新版导出明细行')}
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                // funcType: 'flat',
                permissionList: [
                  {
                    code: 'srm.logistics.delivery.delivery-creation.ps.button.detail.newexport',
                    type: 'c7n-pro',
                  },
                ],
              }}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/asn-header/${headerInfo.asnHeaderId}/lines/export-new`}
              // queryParams={{ asnHeaderId: headerInfo.asnHeaderId }}
              templateCode="SPUC_SINV_ASN_HEADER_MAINTAIN_DETAIL"
            />,
            <ExcelExport
              data-name="export"
              buttonText={intl.get(`sinv.common.view.button.exportDetail`).d('导出明细行')}
              otherButtonProps={{ icon: 'export', disabled: isNil(headerInfo.asnHeaderId) }}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/asn-header/${headerInfo.asnHeaderId}/lines/export`}
              // queryParams={{ asnHeaderId: headerInfo.asnHeaderId }}
            />,
            othersBtn,
          ])}

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
                      {collapseKeys.includes('orderHeaderInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderHeaderInfo"
              >
                <HeaderShipInfoForm {...headerInfoShipFormProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`${viewMessagePrompt}.title.orderHeaderDispatchedInfo`)
                        .d('收货信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfos') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderHeaderInfos"
              >
                <HeaderInfoForm {...headerInfoFormProps} />
              </Panel>
            </Collapse>
            <List {...listProps} />
          </Spin>
        </Content>
        {lineVisible && <LineItemModal {...lineAttachmentProps} />}
        {wrapperBOMModalVisible && <BomModal {...BomModalPops} />}
        {/* <BomModal {...BomModalPops}/> */}
      </Fragment>
    );
  }
}
