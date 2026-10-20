/**
 * index - 发票验真
 * @date: 2019-07-24
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Spin, Tabs, Modal, Row, Col, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isArray, isEmpty, omit, isObject, debounce, isNil } from 'lodash';
import uuid from 'uuid/v4';
// import Icons from 'components/Icons';

import {
  addItemToPagination,
  delItemsToPagination,
  getEditTableData,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { stringify, parse } from 'querystring';
import notification from 'utils/notification';
// import { updateTab } from 'utils/menuTab';
import { routerRedux } from 'dva/router';
import { DATETIME_MIN, DATETIME_MAX, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { SRM_FINANCE } from '_utils/config';
import { getResponse } from '@/utils/utils';
import { getOcrConfig } from '@/services/invoiceService';
import Change from '../components/ChangeFormItem';

import AwaitVerifySearch from './AwaitVerify/Search';
import AwaitVerifyList from './AwaitVerify/List';
import VerifiedSearch from './Verified/VerSearch';
import VerifiedList from './Verified/VerList';
import PicturesWall from '../components/OcrUpload';
import Icons from '../components/Icons';
import styles from './index.less';
import { viewInvoiceDetail } from '../utils';

const { TabPane } = Tabs;
const validation = 'sfin.invoiceInspection.view.message.validation';

@connect(({ loading = {}, invoiceVerification = {} }) => ({
  loading:
    loading.effects['invoiceVerification/updateState'] ||
    loading.effects['invoiceVerification/ocrCheck'] ||
    loading.effects['invoiceVerification/ofdCheck'] ||
    loading.effects['invoiceVerification/update'] ||
    loading.effects['invoiceVerification/examine'] ||
    loading.effects['invoiceVerification/verExamine'] ||
    loading.effects['invoiceVerification/queryAwaitVerifyList'] ||
    loading.effects['invoiceVerification/queryVerfiedList'],
  invoiceVerification,
}))
@formatterCollections({
  code: [
    'sfin.invoiceVerification',
    'sfin.invoiceBill',
    'sfin.inputInvoice',
    `sfin.invoiceInspection`,
    'sfin.common',
  ],
})
export default class InvoiceVerification extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { taxInvoiceCheckId } = parse(search.substr(1));
    const organizationId = getCurrentOrganizationId();
    this.state = {
      organizationId,
      ocrLoading: false,
      taxInvoiceCheckId, // 主键
      selectedRows: [], // 待检验勾选数据
      verSelectedRows: [],
      selectedRowKeys: [], // 已检验勾选数据
      verSelectedRowKeys: [],
      tenantId: getCurrentOrganizationId(),
      sizeConfig: {},
      ofdModalVisible: false,
    };
    this.ChangeAwait = Change('taxInvoiceCheckId');
  }

  componentDidMount() {
    // const {
    //   location: { state: { _back } = {} },
    //   invoiceVerification: { pagination, verifiedPagination, lastActiveTabKey },
    // } = this.props;
    // if (_back !== -1) {
    //   this.verifiedSearch(verifiedPagination);
    // }
    // if (lastActiveTabKey === 'list') {
    //   this.awaitVerifySearch(pagination);
    // } else {
    //   this.verifiedSearch(verifiedPagination);
    // }
    this.fetchEnum(); // 查询值集
    this.getOcrSizeConfig();
  }

  @Bind()
  async getOcrSizeConfig() {
    const res = getResponse(await getOcrConfig());
    if (res) {
      const { fileTypeList, ocrFileSize, ocrTransSize } = res;
      this.setState({
        sizeConfig: {
          ocrFileSize,
          ocrTransSize,
          fileType:
            isNil(fileTypeList) || !isArray(fileTypeList)
              ? undefined
              : Array.from(new Set(fileTypeList)).join('/'),
        },
      });
    }
  }

  // 改变日期格式
  handleFormQuery(filterValues) {
    const dealTime = {};
    const DateArray = ['billingDateFrom', 'billingDateTo'];
    const timeArray = ['checkDateTo', 'checkDateFrom'];
    DateArray.forEach((item) => {
      if (item === 'billingDateFrom') {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
      } else {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
      }
    });
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item]
        ? filterValues[item].format(DEFAULT_DATETIME_FORMAT)
        : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  //   查询数据 - 待检验
  @Bind()
  awaitVerifySearch(page = {}, selectedRows = [], selectedRowKeys = []) {
    const { taxInvoiceCheckId, tenantId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows, selectedRowKeys });
    dispatch({
      type: 'invoiceVerification/queryAwaitVerifyList',
      payload: {
        page,
        tenantId,
        checkedFlag: 0,
        ...handleFormValues,
        taxInvoiceCheckId,
      },
    }).then(() => {
      this.resetDataForm();
      this.ChangeAwait.setUpdate('reset');
    });
  }

  //   查询数据 - 已检验
  @Bind()
  verifiedSearch(page = {}, verSelectedRows = [], verSelectedRowKeys = []) {
    const { taxInvoiceCheckId, tenantId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.verFilterForm)
      ? {}
      : filterNullValueObject(this.verFilterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ verSelectedRows, verSelectedRowKeys });
    dispatch({
      type: 'invoiceVerification/queryVerfiedList',
      payload: {
        page,
        tenantId,
        checkedFlag: 1,
        taxInvoiceCheckId,
        ...handleFormValues,
      },
    });
  }

  /**
   * onReset - 重置列表事件
   */
  @Bind()
  resetDataForm() {
    const { invoiceVerification } = this.props;
    const { dataSource = [] } = invoiceVerification;
    dataSource.forEach((item) => {
      if (item.$form) item.$form.resetFields();
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoiceVerification/init',
    });
  }

  // SRM发票号列跳转到"我的应付发票"
  @Bind()
  redirectInvoiceSummary(invoiceHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sfin/invoice-verification/summary/${invoiceHeaderId}`,
        search: invoiceHeaderId
          ? stringify({ invoiceHeaderId, isInvoiceVerify: true })
          : stringify({}),
      })
    );
  }

  /**
   * 跳转到明细页
   * @param {String} taxInvoiceCheckId
   */
  @Bind()
  redirectDetail(record) {
    const { dispatch } = this.props;
    const { taxInvoiceCheckId, checkInfoId, srmTaxInvoiceMap } = record;
    let invoiceNum;
    if (isObject(srmTaxInvoiceMap)) {
      invoiceNum = srmTaxInvoiceMap[0].invoiceNum || '';
    }
    dispatch(
      routerRedux.push({
        pathname: `/sfin/invoice-verification/detail`,
        search: taxInvoiceCheckId
          ? stringify({ taxInvoiceCheckId, checkInfoId, invoiceNum })
          : stringify({}),
      })
    );
  }

  handleViewInvoiceDetail(record) {
    const { taxInvoiceCheckId: invoiceHeaderId } = record;
    viewInvoiceDetail({
      invoiceHeaderId,
      docType: 'invoiceCheck',
    });
  }

  /**
   * 新建列表
   * @param {String} taxInvoiceCheckId
   */
  @Bind()
  newProject() {
    const {
      dispatch,
      invoiceVerification: { dataSource, pagination },
    } = this.props;
    const newDataSource = {
      _status: 'create',
      taxInvoiceCheckId: uuid(),
    };
    dispatch({
      type: 'invoiceVerification/updateState',
      payload: {
        dataSource: [newDataSource, ...dataSource],
        pagination: addItemToPagination(dataSource.length, pagination),
      },
    });
  }

  /**
   * delete - 删除列表
   */
  @Bind()
  delete() {
    const sourceField = `dataSource`;
    const paginationField = `pagination`;
    const selectedField = `selectedRows`;
    const rowKey = `taxInvoiceCheckId`;
    const { [selectedField]: selectedRows = [] } = this.state;
    const { invoiceVerification, dispatch } = this.props;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
    } = invoiceVerification;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`sfin.invoiceVerification.verify.isClean`).d('是否清除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((item) => item[rowKey]);
        dataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item[rowKey])) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: `invoiceVerification/deleteList`,
            payload: {
              body: deleteList,
            },
          }).then((res) => {
            if (res) {
              this.setState({ [selectedField]: [] });
              notification.success();
              this.awaitVerifySearch(pagination);
            }
          });
        } else {
          dispatch({
            type: 'invoiceVerification/updateState',
            payload: {
              [sourceField]: newDataSource,
              [paginationField]: delItemsToPagination(
                selectedRows.length,
                dataSource.length,
                pagination
              ),
            },
          });
          this.setState({ [selectedField]: [] });
          this.ChangeAwait.setUpdate('deleteLine', selectedRowKeys);
        }
      },
    });
  }

  /**
   *
   */
  @Bind()
  onMadalFalse() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoiceVerification/updateState',
      payload: {
        awaitVerifyCellChange: false,
      },
    });
  }

  /**
   * 保存数据
   * @param(File) file
   */
  @Bind()
  save() {
    const { invoiceVerification, dispatch } = this.props;
    const { dataSource = [], pagination } = invoiceVerification;
    let newDataSource = [];
    // 如果是新增的需要把前端生成的taxInvoiceCheckId去掉，不然后端解析的时候报错
    dataSource.forEach((item) => {
      newDataSource = [
        ...newDataSource,
        {
          ...item,
          taxInvoiceCheckId: item._status === 'create' ? undefined : item.taxInvoiceCheckId,
        },
      ];
    });
    const lines = getEditTableData(newDataSource, ['_status'], { force: true }).map((item) => {
      const { billingDate } = item;
      return {
        ...item,
        billingDate: billingDate ? billingDate.format(DATETIME_MIN) : undefined,
      };
    });
    if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      const headerData = {
        lines,
      };
      dispatch({
        type: 'invoiceVerification/update',
        payload: { headerData },
      }).then((res) => {
        if (res) {
          notification.success();
          this.onMadalFalse();
          this.awaitVerifySearch(pagination);
        }
      });
    }
  }

  /**
   * 发票查验 -- 待查验
   */
  @Bind()
  examine() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    const formatData = getEditTableData(selectedRows, ['taxInvoiceCheckId'], { force: true }).map(
      (item) => {
        const { billingDate } = item;
        return {
          ...item,
          billingDate: billingDate ? billingDate.format(DATETIME_MIN) : undefined,
        };
      }
    );
    if (selectedRows.length === 0 || (Array.isArray(formatData) && formatData.length !== 0)) {
      Modal.confirm({
        title: intl.get(`sfin.invoiceBill.validation.isInvoiceCheck`).d('是否进行发票查验'),
        onOk: debounce(() => {
          dispatch({
            type: 'invoiceVerification/examine',
            payload: { examineList: formatData },
          }).then((res) => {
            if (res) {
              notification.success();
              this.awaitVerifySearch();
            }
          });
        }, 500),
      });
    }
  }

  /**
   * 发票查验 -- 已查验
   */
  @Bind()
  verExamine() {
    const { dispatch } = this.props;
    const { verSelectedRows } = this.state;
    Modal.confirm({
      title: intl.get(`sfin.invoiceBill.validation.isInvoiceCheck`).d('是否进行发票查验'),
      onOk: debounce(() => {
        dispatch({
          type: 'invoiceVerification/verExamine',
          payload: {
            verExamineList: verSelectedRows,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.verifiedSearch();
          }
        });
      }, 500),
    });
  }

  /**
   * EXCEL导入
   */
  @Bind()
  handleRoleImport() {
    const { history } = this.props;
    const { tenantId } = this.state;
    // updateTab({
    //   key: '/sfin/invoice-verification',
    //   path: '/sfin/invoice-verification/data-import/SFIN.TAX_INVOICE_CHECK',
    //   title: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
    //   search: stringify({
    //     action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
    //     backPath: '/sfin/invoice-verification/list',
    //     args: JSON.stringify({
    //       tenantId,
    //       templateCode: 'SFIN.TAX_INVOICE_CHECK',
    //     }),
    //   }),
    // });
    history.push({
      pathname: '/sfin/invoice-verification/data-import/SFIN.TAX_INVOICE_CHECK',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: '/sfin/invoice-verification/list',
        args: JSON.stringify({
          tenantId,
          templateCode: 'SFIN.TAX_INVOICE_CHECK',
        }),
      }),
    });
  }

  /**
   * 设置选中行 -- 待检验
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 设置选中行 -- 已检验
   * @param {Array} verSelectedRowKeys
   * @param {Array} verSelectedRows
   */
  @Bind()
  verOnRowSelectChange(verSelectedRowKeys, verSelectedRows) {
    this.setState({
      verSelectedRows,
      verSelectedRowKeys,
    });
  }

  /**
   * 切tab页
   * @param {Object} fields
   */
  @Bind()
  handleTabsChange(key) {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoiceVerification/updateState',
      payload: {
        lastActiveTabKey: key === 'list' ? 'list' : 'detail',
      },
    });
  }

  /**
   * 关闭或打开OCR
   */
  @Bind()
  handleModalVisible(value, modalName) {
    const visibleName = modalName === 'ofd' ? 'ofdModalVisible' : 'visible';
    if (value) {
      this.setState({
        [visibleName]: value,
        ocrLoading: false,
      });
    } else {
      this.setState({
        [visibleName]: value,
      });
      if (this.picturesWallRef) {
        this.picturesWallRef.setState({
          fileList: [],
        });
      }
    }
  }

  @Bind()
  setOcrLoading(value) {
    this.setState({ ocrLoading: value });
  }

  /**
   * OCR上传
   */
  @Bind()
  OCRUpload() {
    if (this.picturesWallRef) {
      const { fileList } = this.picturesWallRef.state;
      const { sizeConfig } = this.state;
      const fileSize = sizeConfig.ocrFileSize || 10;
      if (isEmpty(fileList)) {
        notification.warning({
          message: intl.get(`sfin.invoiceBill.verify.uploadPictureIsNull`).d('上传照片为空'),
        });
      } else {
        const overSizeFileNames = fileList
          .reduce((total, current) => {
            const { size, name } = current;
            return total.concat(size > fileSize * 1024 * 1024 ? [name] : []);
          }, [])
          .join();
        if (overSizeFileNames.length) {
          notification.error({
            message: intl
              .get(`sfin.common.message.validate.OCRLimitTips`, {
                overSizeFileNames,
                size: fileSize,
              })
              .d(`OCR识别失败，失败原因是文件{overSizeFileNames}大于{size}M无法识别，请检查`),
          });
          return;
        }
        const { dispatch } = this.props;
        const list = fileList
          .filter((n) => n.status === 'done' && n.response)
          .map((n) => n.response);
        dispatch({
          type: 'invoiceVerification/ocrCheck',
          payload: {
            list,
          },
        }).then((res) => {
          if (res) {
            const lists = Object.keys(res);
            if (lists.length < list.length) {
              notification.success();
              this.awaitVerifySearch();
            }
            // this.awaitVerifySearch();
            if (!isEmpty(res)) {
              const newFileList = fileList.filter((_, i) =>
                lists.map((n) => parseInt(n, 10) - 1).includes(i)
              );
              this.picturesWallRef.setState({
                fileList: newFileList,
              });
              const errorMsg = Object.entries(res).map(([key, value]) => `${key}:${value.desc}`);
              getResponse({
                failed: true,
                type: 'error',
                message: errorMsg.join(','),
              });
            } else {
              this.picturesWallRef.setState({
                fileList: [],
              });
            }
          }
        });
      }
    }
  }

  @Bind()
  OFDUpload() {
    if (this.picturesWallRef) {
      const { fileList } = this.picturesWallRef.state;
      if (isEmpty(fileList)) {
        notification.warning({
          message: intl.get(`sfin.invoiceBill.verify.uploadPictureIsNull`).d('上传照片为空'),
        });
        return;
      }
      const { dispatch } = this.props;
      const list = fileList.filter((n) => n.status === 'done' && n.response).map((n) => n.response);
      dispatch({
        type: 'invoiceVerification/ofdCheck',
        payload: {
          list,
        },
      }).then((res) => {
        if (res) {
          const lists = Object.keys(res);
          if (lists.length < list.length) {
            notification.success();
            this.awaitVerifySearch();
          }
          if (!isEmpty(res)) {
            const newFileList = fileList.filter((_, i) =>
              lists.map((n) => parseInt(n, 10) - 1).includes(i)
            );
            this.picturesWallRef.setState({
              fileList: newFileList,
            });
            const errorMsg = Object.entries(res).map(([key, value]) => `${key}:${value.desc}`);
            getResponse({
              failed: true,
              type: 'error',
              message: errorMsg.join(','),
            });
          } else {
            this.picturesWallRef.setState({
              fileList: [],
            });
          }
        }
      });
    }
  }

  render() {
    const { dispatch, invoiceVerification, loading = false } = this.props;
    const { selectedRows = [], organizationId, verSelectedRows, sizeConfig } = this.state;
    const selectedRowKeys = selectedRows.map((n) => n.taxInvoiceCheckId);
    const verSelectedRowKeys = verSelectedRows.map((n) => n.taxInvoiceCheckId);
    const {
      listQuery,
      enumMap = {},
      dataSource,
      pagination,
      verDataSource,
      lastActiveTabKey,
      verifiedPagination,
      awaitVerifyCellChange,
    } = invoiceVerification;
    const searchProps = {
      enumMap,
      pagination,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.awaitVerifySearch,
      isSave: this.ChangeAwait.isSave,
    };

    const verSearchProps = {
      verifiedPagination,
      enumMap,
      onRef: (node) => {
        this.verFilterForm = node.props.form;
      },
      onFetchList: this.verifiedSearch,
    };

    const listProps = {
      dispatch,
      pagination,
      dataSource,
      selectedRows,
      awaitVerifyCellChange,
      onSearch: this.awaitVerifySearch,
      loading,
      onViewInvoiceDetail: this.handleViewInvoiceDetail,
      onRowSelectChange: this.onRowSelectChange,
      redirectInvoiceSummary: this.redirectInvoiceSummary,
      ChangeFormItem: this.ChangeAwait.ChangeFormItem,
      isSave: this.ChangeAwait.isSave,
    };

    const verListProps = {
      verDataSource,
      verSelectedRows,
      verifiedPagination,
      onSearch: this.verifiedSearch,
      loading,
      redirectDetail: this.redirectDetail,
      onViewInvoiceDetail: this.handleViewInvoiceDetail,
      verOnRowSelectChange: this.verOnRowSelectChange,
      redirectInvoiceSummary: this.redirectInvoiceSummary,
      isSave: this.ChangeAwait.isSave,
    };
    const baseExportBtnProps = {
      icon: 'export',
    };

    const { visible, ofdModalVisible } = this.state;
    const size = sizeConfig.ocrTransSize || 3;
    const fileType = sizeConfig.fileType || 'jpg/jpeg/png/bmp/pdf/ofd';

    const picturesWall = {
      onRef: (ref) => {
        this.picturesWallRef = ref;
      },
      accept: fileType
        ?.split('/')
        .map((n) => `.${n}`)
        .join(','),
      setOcrLoading: this.setOcrLoading,
    };
    const attachmentModalProps = {
      visible,
      bodyStyle: { height: '400px', overflow: 'auto' },
      onCancel: () => this.handleModalVisible(false),
      title: intl
        .get(`sfin.common.message.validate.acceptMultipleUpload`, { size, fileType })
        .d(`支持{fileType}格式，建议单个附件不超过{size}M,可批量上传`),
      footer: [
        <Button key="back" onClick={() => this.handleModalVisible(false)}>
          {intl.get(`${validation}.cancel`).d('取消')}
        </Button>,
        <Button key="submit" type="primary" onClick={this.OCRUpload} loading={loading}>
          {intl.get(`sfin.invoiceBill.view.button.invoiceBill.ocrDistinguish`).d('OCR识别')}
        </Button>,
      ],
    };
    const ofdModalProps = {
      visible: ofdModalVisible,
      bodyStyle: { height: '400px', overflow: 'auto' },
      title: intl.get(`sfin.invoiceBill.view.button.ofdAnalysis`).d('OFD解析'),
      onCancel: () => this.handleModalVisible(false, 'ofd'),
      footer: [
        <Button key="back" onClick={() => this.handleModalVisible(false, 'ofd')}>
          {intl.get(`${validation}.cancel`).d('取消')}
        </Button>,
        <Button key="submit" type="primary" onClick={this.OFDUpload} loading={loading}>
          {intl.get(`sfin.invoiceBill.view.button.ofdAnalysis`).d('OFD解析')}
        </Button>,
      ],
    };
    return (
      <Fragment>
        <Header
          title={intl
            .get(`sfin.invoiceVerification.verify.checkInvoiceNextDay`)
            .d('查验税务发票(当日开具发票最快可于次日进行查验)')}
        >
          {lastActiveTabKey === 'list' ? (
            <Row>
              <Col>
                <Button
                  className={styles['btn-header']}
                  icon="delete"
                  onClick={this.ChangeAwait.isSave(this.delete)}
                  disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
                >
                  {intl.get(`hzero.common.button.delete`).d('删除')}
                </Button>
                <Button
                  className={styles['btn-header']}
                  icon="save"
                  onClick={this.save}
                  loading={loading}
                  disabled={loading}
                >
                  {intl.get(`hzero.common.button.save`).d('保存')}
                </Button>
                <Button
                  className={styles['btn-header']}
                  icon="plus"
                  onClick={() => this.newProject()}
                >
                  {intl.get(`hzero.common.button.add`).d('新增')}
                </Button>
                <Button
                  className={styles['btn-header']}
                  onClick={this.ChangeAwait.isSave(() => this.handleModalVisible(true, 'ofd'))}
                >
                  <Icon size={16} type="bar-chart" style={{ marginRight: '4px' }} />
                  {intl.get(`sfin.invoiceBill.view.button.ofdAnalysis`).d('OFD解析')}
                </Button>
                <Button
                  className={styles['btn-header']}
                  onClick={this.ChangeAwait.isSave(() => this.handleModalVisible(true))}
                >
                  <Icons size={16} type="oc-Import" style={{ marginRight: '4px' }} />
                  {intl.get(`sfin.invoiceBill.view.button.invoiceBill.ocrDistinguish`).d('OCR识别')}
                </Button>
                <Button
                  className={styles['btn-header']}
                  onClick={this.handleRoleImport}
                  type="default"
                  // icon="import"
                >
                  <Icons type="main-import" style={{ marginRight: '8px' }} />
                  {intl.get(`sfin.invoiceBill.view.button.invoiceBill.excelImport`).d('EXCEL导入')}
                </Button>
                <Button
                  type="primary"
                  onClick={this.ChangeAwait.isSave(this.examine)}
                  loading={loading}
                  disabled={loading || (isArray(selectedRowKeys) && isEmpty(selectedRowKeys))}
                >
                  <Icons type="Invoice-Inspection" style={{ marginRight: '8px' }} />
                  {intl.get(`sfin.invoiceVerification.button.checkInvoice`).d('发票查验')}
                </Button>
              </Col>
            </Row>
          ) : (
            <Row>
              <span className={styles['btn-header']}>
                <ExcelExport
                  buttonText={intl.get(`sfin.invoiceVerification.button.checkExport`).d('导出')}
                  otherButtonProps={baseExportBtnProps}
                  requestUrl={`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-check/excel-export`}
                  queryParams={listQuery}
                />
              </span>

              <Button
                type="primary"
                loading={loading}
                onClick={this.verExamine}
                disabled={loading || (isArray(verSelectedRowKeys) && isEmpty(verSelectedRowKeys))}
              >
                <Icons type="Invoice-Inspection" style={{ marginRight: '8px' }} />
                {intl.get(`sfin.invoiceVerification.button.checkInvoice`).d('发票查验')}
              </Button>
            </Row>
          )}
        </Header>
        <Content>
          <Spin spinning={false}>
            <Tabs activeKey={lastActiveTabKey} onChange={this.handleTabsChange} animated={false}>
              <TabPane
                tab={intl.get(`sfin.invoiceVerification.view.awaitVerify`).d('待查验')}
                key="list"
              >
                <AwaitVerifySearch {...searchProps} />
                <AwaitVerifyList {...listProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`sfin.invoiceVerification.view.verified`).d('已查验')}
                key="detail"
              >
                <VerifiedSearch {...verSearchProps} />
                <VerifiedList {...verListProps} />
              </TabPane>
            </Tabs>
          </Spin>
        </Content>
        {visible && (
          <Modal {...attachmentModalProps}>
            <Spin spinning={loading}>
              <PicturesWall {...picturesWall} fileSize={(sizeConfig.ocrFileSize || 10) * 1048576} />
            </Spin>
          </Modal>
        )}
        {ofdModalVisible && (
          <Modal {...ofdModalProps}>
            <Spin spinning={loading}>
              <PicturesWall accept=".ofd" {...picturesWall} />
            </Spin>
          </Modal>
        )}
      </Fragment>
    );
  }
}
