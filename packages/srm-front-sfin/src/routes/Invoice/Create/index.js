/* eslint-disable no-shadow */
/* eslint-disable react/jsx-closing-tag-location */
/**
 * index.js - SRM 发票创建查询
 * @date: 2018-11-27
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Input,
  DatePicker,
  Button,
  Row,
  Col,
  Select,
  InputNumber,
  Modal,
  Tooltip,
  Icon,
} from 'hzero-ui';
import Table from 'srm-front-boot/lib/components/EditTable';
import moment from 'moment';
import { isEmpty, sum, isNumber, isArray, concat } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { math } from 'choerodon-ui/dataset';

import remote from 'hzero-front/lib/utils/remote';
import ExcelExport from 'components/ExcelExport';
import ValueList from 'components/ValueList';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import { yesOrNoRender, numberRender, dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import {
  getCurrentOrganizationId,
  getDateFormat,
  getEditTableData,
  getUserOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_FINANCE } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { Button as PermissionButton } from 'components/Permission';
import {
  cutZero,
  precisionNum,
  precisionNums,
  decimalPointAccuracy,
  thousandBitSeparator,
  thousandBitSeparatorCut,
  thousandBitSeparatorIsNew,
  thousandBitSeparatorDJCutZore,
} from '@/routes/utils';
import ActionHistory from './actionHistory';

const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;
const promptCode = 'sfin.invoiceBill';

@remote({
  code: 'SFIN_INVOICE_CREATE_LIST_CUX',
  name: 'remote',
})
@withCustomize({
  unitCode: [
    'SFIN.INVOICE_CREATE_LIST.FILTER',
    'SFIN.INVOICE_CREATE_LIST.GRID',
    'SFIN.INVOICE_CREATE_LIST.HEAD_BUTTON',
  ],
})
@connect(({ invoice, loading }) => {
  return {
    invoice,
    loading:
      loading.effects['invoice/queryList'] ||
      loading.effects['invoice/fetchAcceptanceForm'] ||
      loading.effects['invoice/removeInvoice'] ||
      loading.effects['invoice/cancelRemoveInvoice'] ||
      loading.effects['invoice/createInvoice'] ||
      loading.effects['invoice/createAll'],
    organizationId: getCurrentOrganizationId(),
  };
})
@formatterCollections({
  code: ['sfin.invoiceBill', 'smdm.materiel', 'sodr.common'],
})
@Form.create({ fieldNameProp: null })
export default class Create extends PureComponent {
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    visible: false,
    data: {},
    businessTypeValueDefault: '',
    businessTypeMeaningDefault: '',
    initedLoading: true,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.chooseInterface();

    // 查询发票规则配置
    dispatch({
      type: 'invoice/queryInvoiceRule',
    });
    // 批量查询配置中心
    dispatch({
      type: 'invoice/batchQuerySetting',
      payload: {
        '010502': '010502', // 开票即对账
        '010505': '010505', // 对账及开票基准价
      },
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      custConfig,
      invoice: { pagination },
    } = this.props;
    const { businessTypeValueDefault, businessTypeMeaningDefault } = this.state;
    // 业务规则查询完成时触发
    const initChanged = this.state.initedLoading === false && prevState.initedLoading === true;
    // 个性化完成时触发
    const custChanged = prevProps.custLoading === true && this.props.custLoading === false;
    if (
      (initChanged && this.props.custLoading === false) ||
      (custChanged && this.state.initedLoading === false)
    ) {
      // 获取业务类别默认值
      const { fields = [] } = custConfig?.['SFIN.INVOICE_CREATE_LIST.FILTER'] || {};
      const businessTypeObj = fields.find((item) => item.fieldCode === 'businessType');
      const { defaultValue, defaultValueMeaning } = businessTypeObj || {};
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        {
          businessTypeValueDefault: defaultValue || businessTypeValueDefault,
          businessTypeMeaningDefault: defaultValueMeaning || businessTypeMeaningDefault,
        },
        () => {
          // 需要同时取到个性化和配置的值后再去查询，当点菜单右键刷新的时候不然可能会造成先去拿state里面的值去查询了
          this.handleSearch(pagination);
        }
      );
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateList',
      payload: {
        list: {},
        pagination: {},
        type: 'create',
      },
    });
  }

  // 根据对账数据来源确认查询接口
  @Bind()
  chooseInterface() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'invoice/defaultFetchBusinessType',
      payload: { organizationId },
    }).then((res = {}) => {
      if (res) {
        // form.setFieldsValue({
        //   businessType: res.businessType,
        //   businessTypeMeaning: res.businessTypeMeaning,
        // });
        this.setState({
          businessTypeValueDefault: res.businessType,
          businessTypeMeaningDefault: res.businessTypeMeaning,
          initedLoading: false,
        });
        // this.handleSearch(pagination);
      }
    });
  }

  @Bind()
  handleSearch(page = {}, sort = {}) {
    const {
      dispatch,
      form: { getFieldsValue, validateFieldsAndScroll },
      invoice: { list = {} },
    } = this.props;
    const filterValues = getFieldsValue();
    const { trxDateFrom, trxDateTo, businessType } = filterValues;
    validateFieldsAndScroll((err) => {
      if (!err) {
        dispatch({
          type: businessType === 'ACCEPT' ? 'invoice/fetchAcceptanceForm' : 'invoice/queryList',
          payload: {
            sort,
            page,
            customizeUnitCode: 'SFIN.INVOICE_CREATE_LIST.GRID,SFIN.INVOICE_CREATE_LIST.FILTER',
            businessType,
            type: 'create',
            ...filterValues,
            trxDateFrom: trxDateFrom ? moment(trxDateFrom).format(DATETIME_MIN) : '',
            trxDateTo: trxDateTo ? moment(trxDateTo).format(DATETIME_MAX) : '',
          },
        }).then((res = {}) => {
          if (res) {
            const newContent = (res.content || []).map((item) => {
              return {
                ...item,
                trxType:
                  businessType === 'ACCEPT'
                    ? `${intl.get('sfin.invoiceBill.model.invoiceBill.AcceptHeader').d('验收单')}`
                    : item.trxType,
                orderTypeName:
                  businessType === 'ACCEPT'
                    ? `${intl.get('sfin.invoiceBill.model.invoiceBill.agreement').d('协议')}`
                    : item.orderTypeName,
              };
            });
            dispatch({
              type: 'invoice/updateList',
              payload: {
                type: 'create',
                list: { ...list.create, content: newContent },
              },
            });
          }
        });
      }
    });
  }

  /**
   * 重置查询表单.
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 搜索条件展开收起
   */
  @Bind()
  toggle() {
    const {
      dispatch,
      invoice: { expand },
    } = this.props;
    dispatch({
      type: 'invoice/updateExpand',
      payload: {
        type: 'create',
        expand: !expand.create,
      },
    });
  }

  /**
   * 辅助函数，查询前调用，缓存当前页面的编辑数据
   */
  @Bind()
  searchMiddleware() {
    const {
      invoice: { list = {} },
      form: { getFieldsValue },
    } = this.props;
    const { businessType } = getFieldsValue();
    const { selectedRows } = this.state;
    const content = (list.create && list.create.content) || [];
    // 当前页的数据 keys
    const currentRowKeys = content.map((item) =>
      businessType === 'ACCEPT' ? item.acceptListLineId : item.rcvTrxLineId
    );
    // 不是当前页的数据
    const notCurrentRows = selectedRows.filter(
      (item) =>
        !currentRowKeys.includes(
          businessType === 'ACCEPT' ? item.acceptListLineId : item.rcvTrxLineId
        )
    );
    const currentSelectedRows = selectedRows.filter((item) =>
      currentRowKeys.includes(businessType === 'ACCEPT' ? item.acceptListLineId : item.rcvTrxLineId)
    );
    // 新的选中行
    const currentEditSelectedRows = getEditTableData(currentSelectedRows);
    const currentReadSelectedRows = currentSelectedRows.filter((item) => !item._status);
    this.setState({
      selectedRows: concat(currentEditSelectedRows, currentReadSelectedRows, notCurrentRows),
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(newSelectedRowKeys, newSelectedRows) {
    const { selectedRows } = this.state;
    const {
      dispatch,
      form: { getFieldsValue },
      invoice: { list = {}, pagination = {} },
    } = this.props;
    const { businessType } = getFieldsValue();
    const content = (list.create && list.create.content) || [];
    // 当前页的 key
    const currentRowKeys = content.map((item) =>
      businessType === 'ACCEPT' ? item.acceptListLineId : item.rcvTrxLineId
    );
    // // 不是当前页的数据
    const notCurrentRows = selectedRows.filter(
      (item) =>
        !currentRowKeys.includes(
          businessType === 'ACCEPT' ? item.acceptListLineId : item.rcvTrxLineId
        )
    );
    // // 避免数据覆盖
    let mergeRows = notCurrentRows
      .concat(
        newSelectedRows.filter((item) =>
          currentRowKeys.includes(
            businessType === 'ACCEPT' ? item.acceptListLineId : item.rcvTrxLineId
          )
        )
      )
      .map((item) =>
        Number(item.currentInvoiceNumber) !== 0 ? { ...item, _status: 'update' } : item
      );
    mergeRows = mergeRows.map((item) => {
      const arr = String(item.currentInvoiceNumber).split('.');
      let currentInvoiceNumber;

      if (arr[1]) {
        currentInvoiceNumber = item.uomPrecision
          ? `${arr[0]}.${arr[1].slice(0, item.uomPrecision)}`
          : item.currentInvoiceNumber;
      } else {
        currentInvoiceNumber = `${arr[0]}`;
      }
      return {
        ...item,
        currentInvoiceNumber,
      };
    });

    this.setState({
      selectedRowKeys: newSelectedRowKeys,
      selectedRows: mergeRows,
    });

    const newContent = content.map((item) => {
      const { _status, ...record } = item;
      return newSelectedRowKeys.includes(
        businessType === 'ACCEPT' ? item.acceptListLineId : item.rcvTrxLineId
      ) && Number(item.currentInvoiceNumber) !== 0
        ? { ...record, _status: 'update' }
        : record;
    });
    dispatch({
      type: 'invoice/updateList',
      payload: {
        type: 'create',
        list: { ...list.create, content: newContent },
        pagination: pagination.create,
      },
    });
  }

  @Bind()
  tableChange(page = {}, _, sort = {}) {
    this.searchMiddleware();
    this.handleSearch(page, sort);
  }

  /**
   * 创建开票
   */
  @Bind()
  @Throttle(1000)
  async createInvoice() {
    await this.searchMiddleware();
    const { selectedRows } = this.state;
    const {
      dispatch,
      history,
      form: { getFieldsValue },
    } = this.props;
    const { displayReverseFlag, businessType } = getFieldsValue();
    if (!isEmpty(selectedRows)) {
      confirm({
        title: intl
          .get(`${promptCode}.view.message.invoiceBill.isCreateInvoice`)
          .d('是否生成发票?'),
        onOk: () => {
          dispatch({
            type: 'invoice/createValidateInvoice',
            payload: selectedRows,
          }).then((response) => {
            if (response) {
              if (response?.validatedCode === 'INFO') {
                confirm({
                  title: response.msg,
                  // content: '',
                  onOk: () => {
                    dispatch({
                      type:
                        businessType === 'ACCEPT'
                          ? 'invoice/createAcceptanceForm'
                          : 'invoice/createInvoice',
                      payload: { selectedRows, displayReverseFlag, businessType },
                    }).then((res) => {
                      if (!isEmpty(res)) {
                        if (res.length === 1 || businessType === 'ACCEPT') {
                          const { invoiceHeaderId } = isArray(res) ? res?.[0] : res;
                          this.handleSearch();
                          this.setState(() => {
                            history.push(`/sfin/invoice-create/detail/${invoiceHeaderId}`);
                          });
                          notification.success();
                        } else {
                          dispatch({
                            type: 'invoice/updateState',
                            payload: {
                              selectedRows,
                              invoiceList: res,
                            },
                          });
                          history.push({
                            pathname: `/sfin/invoice-create/detail-list`,
                          });
                        }
                      }
                    });
                  },
                });
              }
              if (response?.validatedCode === 'SUCCESS') {
                dispatch({
                  type:
                    businessType === 'ACCEPT'
                      ? 'invoice/createAcceptanceForm'
                      : 'invoice/createInvoice',
                  payload: { selectedRows, displayReverseFlag, businessType },
                }).then((res) => {
                  if (res) {
                    if (!isEmpty(res)) {
                      if (res.length === 1 || businessType === 'ACCEPT') {
                        const { invoiceHeaderId } = isArray(res) ? res?.[0] : res;
                        // 清空勾选存下的 row
                        dispatch({
                          type: 'invoice/updateState',
                          payload: {
                            selectedRows,
                            invoiceList: [],
                          },
                        });
                        this.handleSearch();
                        this.setState(() => {
                          history.push(`/sfin/invoice-create/detail/${invoiceHeaderId}`);
                        });
                        notification.success();
                      } else {
                        dispatch({
                          type: 'invoice/updateState',
                          payload: {
                            selectedRows,
                            invoiceList: res,
                          },
                        });
                        history.push({
                          pathname: `/sfin/invoice-create/detail-list`,
                        });
                      }
                    }
                  }
                });
              }
              if (response?.validatedCode === 'WIATING_CONFIRM') {
                confirm({
                  title: response.msg,
                  onOk: () => {
                    dispatch({
                      type:
                        businessType === 'ACCEPT'
                          ? 'invoice/createAcceptanceForm'
                          : 'invoice/createInvoice',
                      payload: { selectedRows, displayReverseFlag, businessType },
                    }).then((res) => {
                      if (!isEmpty(res)) {
                        if (res.length === 1 || businessType === 'ACCEPT') {
                          const { invoiceHeaderId } = isArray(res) ? res?.[0] : res;
                          this.handleSearch();
                          this.setState(() => {
                            history.push(`/sfin/invoice-create/detail/${invoiceHeaderId}`);
                          });
                          notification.success();
                        } else {
                          dispatch({
                            type: 'invoice/updateState',
                            payload: {
                              selectedRows,
                              invoiceList: res,
                            },
                          });
                          history.push({
                            pathname: `/sfin/invoice-create/detail-list`,
                          });
                        }
                      }
                    });
                  },
                });
              }
            }
          });
        },
      });
    }
  }

  /**
   * 移除开票
   */
  @Bind()
  @Throttle(1000)
  removeInvoice() {
    const { selectedRows } = this.state;
    const {
      dispatch,
      form: { getFieldValue },
    } = this.props;
    const businessType = getFieldValue('businessType');
    const notNeedInvoiceFlag = selectedRows.filter((o) => o.needInvoiceFlag === '0');

    if (notNeedInvoiceFlag.length > 0) {
      notification.warning({
        message: intl
          .get(`${promptCode}.view.message.notification.needInvoice`)
          .d('勾选的数据中存在已移除数据'),
      });
    } else {
      confirm({
        title: intl.get(`${promptCode}.view.message.confirm.unInvoice`).d('是否确认移除?'),
        onOk: () => {
          dispatch({
            type:
              businessType === 'ACCEPT'
                ? 'invoice/removeAcceptance'
                : 'invoice/cancelRemoveInvoice',
            payload:
              businessType === 'ACCEPT'
                ? selectedRows.map((item) => item.acceptListLineId)
                : selectedRows.map((item) => item.rcvTrxLineId),
          }).then((res) => {
            if (res) {
              this.handleSearch();
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
              });
              notification.success();
            }
          });
        },
      });
    }
  }

  /**
   * 撤销移除开票
   */
  @Bind()
  cancelRemoveInvoice() {
    const { selectedRows } = this.state;
    const {
      dispatch,
      form: { getFieldValue },
    } = this.props;
    const businessType = getFieldValue('businessType');
    const needInvoiceFlag = selectedRows.filter((o) => o.needInvoiceFlag === '1');

    if (needInvoiceFlag.length > 0) {
      notification.warning({
        message: intl
          .get(`${promptCode}.view.message.notification.notNeedInvoice`)
          .d('勾选的数据中存在未移除数据'),
      });
    } else {
      confirm({
        title: intl.get(`${promptCode}.view.message.confirm.invoice`).d('是否确认撤销移除?'),
        onOk: () => {
          dispatch({
            type: businessType === 'ACCEPT' ? 'invoice/returnAcceptance' : 'invoice/removeInvoice',
            payload:
              businessType === 'ACCEPT'
                ? selectedRows.map((item) => item.acceptListLineId)
                : selectedRows.map((item) => item.rcvTrxLineId),
          }).then((res) => {
            if (res) {
              this.handleSearch();
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
              });
              notification.success();
            }
          });
        },
      });
    }
  }

  @Bind()
  @Throttle(1000)
  handleCheckAll() {
    const {
      dispatch,
      history,
      organizationId,
      form: { getFieldValue, getFieldsValue },
    } = this.props;
    const businessType = getFieldValue('businessType');
    const formValues = getFieldsValue();
    confirm({
      title: intl.get(`${promptCode}.view.message.confirm.checkAll`).d('是否全部勾选创建?'),
      onOk: () => {
        dispatch({
          type: 'invoice/createAll',
          payload: {
            organizationIds: organizationId,
            trxLineIds: [],
            ...formValues,
            trxDateFrom:
              formValues.trxDateFrom && moment(formValues.trxDateFrom).format(DATETIME_MIN),
            trxDateTo: formValues.trxDateTo && moment(formValues.trxDateTo).format(DATETIME_MAX),
            invoiceType: businessType === 'ACCEPT' ? 'by-accept' : 'supplier',
          },
        }).then((res) => {
          if (!isEmpty(res)) {
            if (businessType === 'ACCEPT' || (isArray(res) && res?.length === 1)) {
              const { invoiceHeaderId } = isArray(res) ? res[0] || {} : res || {};
              dispatch({
                type: 'invoice/updateState',
                payload: {
                  invoiceList: [],
                },
              });
              this.handleSearch();
              this.setState(() => {
                history.push(`/sfin/invoice-create/detail/${invoiceHeaderId}`);
              });
              notification.success();
            } else {
              dispatch({
                type: 'invoice/updateState',
                payload: {
                  invoiceList: res,
                },
              });
              history.push({
                pathname: `/sfin/invoice-create/detail-list`,
              });
            }
          }
        });
      },
    });
  }

  /**
   * 可清空选中行数据的查询
   */
  @Bind()
  handleResetSearch(clearSort = false) {
    // 清空箭头查询
    if (clearSort) {
      const notes = Array.from(document.getElementsByClassName('on'));
      for (const v of notes) {
        v.className = v.className.replace('on', 'off');
      }
    }
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
    this.handleSearch();
  }

  @Bind()
  calcRender(number, precision = 2) {
    return thousandBitSeparatorIsNew(number, precision);
  }

  @Bind()
  handleSupplier(_, record, lovRecord) {
    // const { form } = this.props;
    // const { setFieldsValue } = form;
    record.$form.registerField('taxId');
    record.$form.setFieldsValue({
      taxRate: lovRecord.taxRate,
      taxId: lovRecord.taxId,
    });
  }

  @Bind
  handleOperationRecord(record) {
    this.setState({
      visible: true,
      data: record,
    });
  }

  @Bind
  hideModal(flag) {
    this.setState({
      visible: flag,
    });
  }

  @Bind()
  amountValidator(value, callback, originValue) {
    if (value * originValue < 0 || value === 0) {
      callback(
        intl
          .get(`${promptCode}.view.message.sameSignOriAndNotZero.modifiedAmount`)
          .d('修改后的金额需为和原金额同号的非零数')
      );
    }
    if (Math.abs(value) > Math.abs(originValue)) {
      callback(
        intl
          .get(`${promptCode}.view.message.cannotExceedOri.modifiedAmount`)
          .d('修改后的金额不得超过原金额同号')
      );
    }
    callback();
  }

  @Bind()
  fetchExportParams() {
    const customizeUnitCode = 'SFIN.INVOICE_CREATE_LIST.GRID,SFIN.INVOICE_CREATE_LIST.FILTER';
    const { selectedRowKeys } = this.state;
    const { form } = this.props;
    const params = form.getFieldsValue() || {};
    const { businessType } = params;
    if (selectedRowKeys?.length) {
      // 后端说accept已经弃用了，不需要区分主键
      return filterNullValueObject({
        trxLineIds: selectedRowKeys,
        businessType,
        customizeUnitCode,
      });
    } else {
      return filterNullValueObject({
        ...params,
        trxDateFrom: params.trxDateFrom ? moment(params.trxDateFrom).format(DATETIME_MIN) : '',
        trxDateTo: params.trxDateTo ? moment(params.trxDateTo).format(DATETIME_MAX) : '',
        customizeUnitCode,
      });
    }
  }

  @Bind()
  renderHeader() {
    const { selectedRows } = this.state;
    const { loading, organizationId, customizeBtnGroup, remote: remoteProps, form } = this.props;
    const needInvoiceFlag = selectedRows.filter((o) => o.needInvoiceFlag === '1');
    const notNeedInvoiceFlag = selectedRows.filter((o) => o.needInvoiceFlag === '0');
    const buttons = [
      <Button
        icon="plus"
        type="primary"
        disabled={isEmpty(selectedRows)}
        onClick={this.createInvoice}
        loading={loading}
        name="create"
      >
        {intl.get(`${promptCode}.view.option.create`).d('创建')}
      </Button>,
      <ExcelExport
        method="POST"
        requestUrl={`${SRM_FINANCE}/v1/${organizationId}/invoice/create-export`}
        name="export"
        queryParams={this.fetchExportParams()}
      />,
      <PermissionButton
        icon="close-square-o"
        name="remove"
        loading={loading}
        onClick={this.removeInvoice}
        disabled={isEmpty(needInvoiceFlag)}
        permissionList={[
          {
            code: `srm.finance.ar-invoice.create.ps.remove`,
            type: 'button',
          },
        ]}
      >
        {intl.get(`${promptCode}.view.option.remove`).d('移除')}
      </PermissionButton>,
      <PermissionButton
        icon="close-square-o"
        name="notRemove"
        loading={loading}
        onClick={this.cancelRemoveInvoice}
        disabled={isEmpty(notNeedInvoiceFlag)}
        permissionList={[
          {
            code: `srm.finance.ar-invoice.create.ps.notremove`,
            type: 'button',
          },
        ]}
      >
        {intl.get(`${promptCode}.view.option.notRemove`).d('撤销移除')}
      </PermissionButton>,
      <PermissionButton
        loading={loading}
        onClick={this.handleCheckAll}
        name="checkAll"
        permissionList={[
          {
            code: `srm.finance.ar-invoice.create.ps.create.checkall`,
            type: 'button',
          },
        ]}
      >
        {intl.get(`${promptCode}.view.option.checkAll`).d('全选创建')}
      </PermissionButton>,
    ];
    const btns = remoteProps
      ? remoteProps.process('SFIN_INVOICE_CREATE_LIST_CUX_HEADER_BTNS', buttons, {
          loading,
          handleSearch: this.handleSearch,
          selectedRows,
          form,
        })
      : buttons;
    return (
      <Header title={intl.get(`${promptCode}.view.message.title.invoice.create`).d('创建应收发票')}>
        <React.Fragment>
          {customizeBtnGroup(
            {
              code: 'SFIN.INVOICE_CREATE_LIST.HEAD_BUTTON',
            },
            btns
          )}
        </React.Fragment>
      </Header>
    );
  }

  @Bind()
  renderForm() {
    const {
      form,
      organizationId,
      customizeFilterForm,
      invoice: {
        expand, // 查询条件是否展开
      },
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { create } = expand;
    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
      style: {
        width: '100%',
      },
    };
    const dateFormat = getDateFormat();
    const { businessTypeValueDefault, businessTypeMeaningDefault } = this.state;
    return customizeFilterForm(
      {
        code: 'SFIN.INVOICE_CREATE_LIST.FILTER',
        form,
        expand: create,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.accountSource`)
                    .d('对账数据来源')}
                >
                  {getFieldDecorator('sourceCode', {
                    initialValue: 'RCV',
                  })(
                    <Lov
                      code="SFIN.SOURCE_CONFIG"
                      queryParams={{ tenantId: organizationId }}
                      textValue="接收事务"
                      textField="sourceName"
                    />
                  )}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类别')}
                >
                  {getFieldDecorator('businessType', {
                    initialValue: businessTypeValueDefault || 'STANDARD',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.invoiceBill.businessType`)
                            .d('业务类别'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SFIN.EN_BUSINESS_TYPE_CONFIG"
                      queryParams={{ tenantId: organizationId }}
                      textValue={
                        businessTypeMeaningDefault ||
                        intl.get('sfin.invoiceBill.standard').d('标准')
                      }
                      textField="businessTypeMeaning"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.displayPoNum`).d('订单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('poNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.trxDateFrom`).d('事务日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('trxDateFrom', {
                    initialValue: moment().subtract(moment.duration(6, 'months')),
                  })(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('trxDateTo') &&
                        moment(getFieldValue('trxDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: create ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.trxDateTo`).d('事务日期到')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('trxDateTo', {
                    initialValue: moment(),
                  })(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('trxDateFrom') &&
                        moment(getFieldValue('trxDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={
                    <span>
                      <Tooltip
                        title={intl
                          .get(`${promptCode}.model.invoiceBill.commaInterval`)
                          .d("可输入多个单号,以英文逗号','间隔")}
                      >
                        {intl
                          .get(`${promptCode}.model.invoiceBill.invoiceApplicationForm`)
                          .d('开票申请单')}
                      </Tooltip>
                    </span>
                  }
                  {...formItemLayout}
                >
                  {getFieldDecorator('billNumber')(
                    <Input
                      placeholder={intl
                        .get(`${promptCode}.model.invoiceBill.commaInterval`)
                        .d("可输入多个单号,以英文逗号','间隔")}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.displayTrxNum`).d('事务编号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayTrxNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.itemName`).d('物料名称')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('itemName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.itemCode`).d('物料编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('itemCodeQuery')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.companyName`).d('客户公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.CUSTOMER"
                      queryParams={{ organizationId: getUserOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体')}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      disabled={!getFieldValue('companyId')}
                      style={{ width: '100%' }}
                      code="HPFM.OU"
                      textField="ouName"
                      queryParams={{
                        organizationId: getCurrentOrganizationId(),
                        companyId: getFieldValue('companyId'),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName')
                    .d('采购组织')}
                >
                  {getFieldDecorator('purOrganizationId')(
                    <Lov
                      style={{ width: '100%' }}
                      code="HPFM.PURCHASE_ORGANIZATION"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.purchaseAgentName`).d('采购员')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('agentName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.filter.needInvoiceFlag`)
                    .d('显示已移除数据')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('needInvoiceFlag', {
                    initialValue: 1,
                  })(
                    <Select allowClear>
                      <Option key={0} value={0}>
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Option>
                      <Option key={1} value={1}>
                        {intl.get('hzero.common.status.no').d('否')}
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.inventoryName`).d('收货库房')}
                >
                  {getFieldDecorator('inventoryId')(
                    <Lov
                      code="SODR.INVENTORY"
                      queryParams={{ tenantId: organizationId, enabledFlag: 1 }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.filter.displayReverseFlag`)
                    .d('显示冲销数据')}
                >
                  {getFieldDecorator('displayReverseFlag', {
                    initialValue: '1',
                  })(
                    <Select allowClear>
                      <Option key="1" value="1">
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Option>
                      <Option key="0" value="0">
                        {intl.get('hzero.common.status.no').d('否')}
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.filter.includedZeroFlag`)
                    .d('显示数量为0数据')}
                >
                  {getFieldDecorator('includedZeroFlag', {
                    initialValue: '1',
                  })(<ValueList lovCode="HPFM.FLAG" lazyLoad={false} allowClear />)}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类别')}
                >
                  {getFieldDecorator('businessType')(
                    <ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} />
                  )}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.filter.specifications`)
                    .d('规格')}
                >
                  {getFieldDecorator('specifications')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.filter.model`).d('型号')}
                >
                  {getFieldDecorator('model')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {expand.create
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleResetSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  renderTable() {
    const {
      loading,
      customizeTable,
      form: { getFieldsValue },
      invoice: { list = {}, pagination = {}, settings = {} },
    } = this.props;
    const { businessType } = getFieldsValue();

    const { selectedRowKeys, selectedRows } = this.state;
    // const currentInvoiceRule = invoiceRule.find(item => item.consignmentType === 'STANDARD') || {};
    // const setting010503 = +currentInvoiceRule.priceUpdFlag || 0; // 是否允许在对账时修改单价，此处取发票规则配置的值，变量名暂未修改
    const setting010505 = settings['010505'] && settings['010505'].settingValue;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxAndLineNum`).d('事务编号|行号'),
        width: 180,
        fixed: 'left',
        dataIndex: 'displayTrxNum',
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.itemCode`).d('物料编码'),
        width: 100,
        fixed: 'left',
        dataIndex: 'itemCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.itemName`).d('物料名称'),
        fixed: 'left',
        width: 150,
        dataIndex: 'itemName',
      },
      {
        title: intl.get('smdm.materiel.model.materiel.commonName').d('通用名'),
        dataIndex: 'commonName',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.specificationsAndModel`).d('规格型号'),
        width: 100,
        fixed: 'left',
        dataIndex: 'specifications',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.uomName`).d('单位'),
        width: 100,
        dataIndex: 'uom',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.quantity`).d('数量'),
        width: 100,
        dataIndex: 'quantity',
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.remainInvoiceNumber`).d('剩余可开票数量'),
        width: 120,
        dataIndex: 'remainInvoiceNumber',
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceQuantity`).d('本次开票数量'),
        width: 150,
        dataIndex: 'currentInvoiceNumber',
        render: (value, record) => {
          if (record._status) {
            const { getFieldDecorator } = record.$form;

            if (+record.quantityUpdFlag) {
              // const { returnToReceivingFlag } = record; // 为 1 时仅可输入负数，为 0 时仅可输入正数，不允许输入 0
              return (
                <FormItem>
                  {getFieldDecorator('currentInvoiceNumber', {
                    initialValue: value,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.invoiceBill.invoiceQuantity`)
                            .d('本次开票数量'),
                        }),
                      },
                    ],
                    getValueFromEvent: (event) => {
                      if (typeof event === 'string') {
                        return event;
                      }
                      return decimalPointAccuracy(event, record.uomPrecision);
                    },
                  })(
                    record.quantity < 0 ? (
                      <InputNumber min={-9999999999} allowThousandth max={-0.000001} />
                    ) : (
                      <InputNumber min={0.000001} allowThousandth />
                    )
                  )}
                </FormItem>
              );
            } else {
              return (
                <FormItem>
                  {getFieldDecorator('currentInvoiceNumber', {
                    initialValue: value,
                  })(<span>{thousandBitSeparator(value)}</span>)}
                </FormItem>
              );
            }
          } else {
            return thousandBitSeparator(value);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
        align: 'right',
        width: 130,
        dataIndex: 'freeTaxPrice',
        render: (value, record) => {
          const {
            priceUpdFlag, // 是否允许修改单价
            taxUpdFlag, // 是否允许修改税率
            priceShieldFlag, // 是否价格屏蔽
          } = record;
          const isCalc = +priceUpdFlag || +taxUpdFlag;

          if (record._status) {
            const { $form } = record;
            const { getFieldDecorator } = $form;

            // 仅当基准价为含税价时，且税率或单价可修改时，才渲染计算结果
            if (isCalc && setting010505 === 'TAX_INCLUDED_PRICE') {
              const {
                taxPrice = record.taxPrice,
                taxRate = record.taxRate,
              } = $form.getFieldsValue();
              return this.calcRender(
                math.div(taxPrice, math.plus(1, math.div(taxRate, 100))),
                record.pricePrecision
              );
            } else {
              return (
                <FormItem>
                  {getFieldDecorator('freeTaxPrice', {
                    initialValue: value,
                  })(<span>{thousandBitSeparatorDJCutZore(value, record.pricePrecision)}</span>)}
                </FormItem>
              );
            }
          }

          return priceShieldFlag === 1
            ? '***'
            : thousandBitSeparatorCut(value, record.pricePrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.unitPriceBatch`).d('每'),
        width: 100,
        dataIndex: 'unitPriceBatch',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'freeTaxPriceAmount',
        align: 'right',
        width: 120,
        render: (value, record) => {
          const {
            quantityUpdFlag, // 是否修改本次开票数量
            priceUpdFlag, // 是否允许修改单价
            taxUpdFlag, // 是否允许修改税率
            amountUpdFlag, // 是否允许修改金额
            priceShieldFlag, // 是否价格屏蔽
            unitPriceBatch, // 每
            amountPrecision, // 金额精度
            _status,
            $form,
            freeTaxPriceAmount,
          } = record;
          const isPriceCal = +quantityUpdFlag || +priceUpdFlag || +taxUpdFlag;
          const isAmountCal = Number(amountUpdFlag);

          // 金额隐藏
          if (Number(priceShieldFlag) === 1) {
            return '***';
          } else if (_status) {
            // 勾选的时候
            const { getFieldDecorator, getFieldsValue } = $form;
            const {
              taxRate = record.taxRate,
              taxPrice = record.taxPrice,
              freeTaxPrice = record.freeTaxPrice,
              taxPriceAmount = record.taxPriceAmount,
              currentInvoiceNumber = record.currentInvoiceNumber,
            } = getFieldsValue();
            // 单价数量税率可编辑
            if (_status && isPriceCal && !isAmountCal) {
              if (setting010505 === 'TAX_INCLUDED_PRICE') {
                // 含税单价可编辑
                const ratePlus = math.plus(1, math.div(taxRate, 100));
                return this.calcRender(
                  math.div(
                    math.multipliedBy(math.div(taxPrice, ratePlus), currentInvoiceNumber),
                    unitPriceBatch
                  ),
                  amountPrecision
                );
              }
              if (setting010505 === 'NET_PRICE') {
                // 不含税单价可编辑
                return this.calcRender(
                  math.div(math.multipliedBy(freeTaxPrice, currentInvoiceNumber), unitPriceBatch),
                  amountPrecision
                );
              }
            }
            // 金额可编辑
            if (_status && isAmountCal) {
              if (setting010505 === 'TAX_INCLUDED_PRICE') {
                // 含税金额可编辑
                return this.calcRender(
                  math.div(math.multipliedBy(taxPriceAmount, 100), math.plus(100, taxRate)),
                  amountPrecision
                );
              }
              if (setting010505 === 'NET_PRICE') {
                // 不含税金额可编辑
                return (
                  <Form.Item>
                    {getFieldDecorator('freeTaxPriceAmount', {
                      initialValue: value,
                      rules: [
                        {
                          validator: (_, value, callback) =>
                            this.amountValidator(value, callback, freeTaxPriceAmount),
                        },
                      ],
                    })(
                      <InputNumber
                        precision={precisionNum(value, record, 'freeTaxPriceAmount')}
                        allowThousandth
                      />
                    )}
                  </Form.Item>
                );
              }
            }
            return thousandBitSeparator(value, amountPrecision);
          } else {
            const {
              taxRate,
              taxPrice,
              freeTaxPrice,
              taxPriceAmount,
              currentInvoiceNumber,
            } = record;
            if (isPriceCal && !isAmountCal) {
              if (setting010505 === 'TAX_INCLUDED_PRICE') {
                // 含税单价可编辑
                const ratePlus = math.plus(1, math.div(taxRate, 100));
                return this.calcRender(
                  math.div(
                    math.multipliedBy(math.div(taxPrice, ratePlus), currentInvoiceNumber),
                    unitPriceBatch
                  ),
                  amountPrecision
                );
              }
              if (setting010505 === 'NET_PRICE') {
                // 不含税单价可编辑
                return this.calcRender(
                  math.div(math.multipliedBy(freeTaxPrice, currentInvoiceNumber), unitPriceBatch),
                  amountPrecision
                );
              }
            }
            if (isAmountCal && setting010505 === 'TAX_INCLUDED_PRICE') {
              // 含税金额可编辑
              return this.calcRender(
                math.div(math.multipliedBy(taxPriceAmount, 100), math.plus(100, taxRate)),
                amountPrecision
              );
            }
            return thousandBitSeparator(value, amountPrecision);
          }
        },
      },
      {
        title: `${intl.get(`${promptCode}.model.invoiceBill.taxRate`).d('税率')}（%）`,
        width: 120,
        dataIndex: 'taxRate',
        render: (value, record) => {
          if (record._status) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('taxRate', {
                  initialValue: record.taxRate,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: `${intl.get(`${promptCode}.model.invoiceBill.taxRate`).d('税率')}`,
                      }),
                    },
                  ],
                })(
                  +record.taxUpdFlag ? (
                    <Lov
                      code="SPRM.TAX"
                      textField="taxRate"
                      // lovOptions={{
                      //   valueField: 'taxRate',
                      //   displayField: 'taxRate',
                      // }}
                      // onChange={(_, { taxId = undefined }) => {
                      //   record.$form.registerField('taxId');
                      //   record.$form.setFieldsValue({ taxId });
                      // }}
                      onChange={(val, lovRecord) => this.handleSupplier(val, record, lovRecord)}
                      onOk={(record) => {
                        setFieldsValue({ taxRate: record.taxRate });
                      }}
                    />
                  ) : (
                    <span>{record.taxRate}</span>
                  )
                )}
              </FormItem>
            );
          } else {
            return record.taxRate;
          }
        },
      },

      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedPrice`).d('含税单价'),
        align: 'right',
        width: 120,
        dataIndex: 'taxPrice',
        render: (value, record) => {
          const {
            priceUpdFlag, // 是否允许修改单价
            taxUpdFlag, // 是否允许修改税率
            priceShieldFlag, // 是否价格屏蔽
          } = record;
          const isCalc = +priceUpdFlag || +taxUpdFlag;

          if (record._status && Number(priceShieldFlag) === 0 && Number(priceUpdFlag) === 1) {
            const { $form } = record;
            const { getFieldDecorator } = $form;

            // 仅当基准价为不含税价时，且税率或单价可修改时，才渲染计算结果
            if (isCalc && setting010505 === 'NET_PRICE') {
              const _record = $form.getFieldsValue();
              return this.calcRender(
                math.multipliedBy(
                  _record.freeTaxPrice,
                  math.plus(1, math.div(_record.taxRate, 100))
                ),
                record.amountPrecision
              );
            } else {
              return (
                <FormItem>
                  {getFieldDecorator('taxPrice', {
                    initialValue: value,
                  })(<span>{cutZero(numberRender(value, record.pricePrecision))}</span>)}
                </FormItem>
              );
            }
          }

          return priceShieldFlag
            ? '***'
            : record.pricePrecision
            ? cutZero(numberRender(value, record.pricePrecision))
            : value;
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxPriceAmount',
        align: 'right',
        width: 120,
        render: (value, record) => {
          const {
            quantityUpdFlag, // 是否修改本次开票数量
            priceUpdFlag, // 是否允许修改单价
            taxUpdFlag, // 是否允许修改税率
            amountUpdFlag, // 是否允许修改金额
            priceShieldFlag, // 是否价格屏蔽
            unitPriceBatch, // 每
            amountPrecision, // 金额精度
            _status,
            $form,
            taxPriceAmount,
          } = record;
          const isPriceCal = +quantityUpdFlag || +priceUpdFlag || +taxUpdFlag;
          const isAmountCal = Number(amountUpdFlag);

          // 金额隐藏
          if (Number(priceShieldFlag) === 1) {
            return '***';
            // 勾选的时候
          } else if (_status) {
            const { getFieldDecorator, getFieldsValue } = $form;
            const {
              taxRate = record.taxRate,
              taxPrice = record.taxPrice,
              freeTaxPrice = record.freeTaxPrice,
              freeTaxPriceAmount = record.freeTaxPriceAmount,
              currentInvoiceNumber = record.currentInvoiceNumber,
            } = getFieldsValue();
            const ratePlus = math.plus(1, math.div(taxRate, 100));
            // 单价数量税率可编辑
            if (_status && isPriceCal && !isAmountCal) {
              if (setting010505 === 'TAX_INCLUDED_PRICE') {
                return this.calcRender(
                  math.div(math.multipliedBy(taxPrice, currentInvoiceNumber), unitPriceBatch),
                  amountPrecision
                );
              }
              if (setting010505 === 'NET_PRICE') {
                return this.calcRender(
                  math.div(
                    math.multipliedBy(
                      math.multipliedBy(freeTaxPrice, ratePlus),
                      currentInvoiceNumber
                    ),
                    unitPriceBatch
                  ),
                  amountPrecision
                );
              }
            }
            // 金额可编辑
            if (_status && isAmountCal) {
              if (setting010505 === 'TAX_INCLUDED_PRICE') {
                // 含税金额可编辑
                return (
                  <FormItem>
                    {getFieldDecorator('taxPriceAmount', {
                      initialValue: value,
                      rules: [
                        {
                          validator: (_, value, callback) =>
                            this.amountValidator(value, callback, taxPriceAmount),
                        },
                      ],
                    })(
                      <InputNumber
                        precision={precisionNum(value, record, 'taxPriceAmount')}
                        allowThousandth
                      />
                    )}
                  </FormItem>
                );
              }
              if (setting010505 === 'NET_PRICE') {
                // 不含税金额可编辑
                return this.calcRender(
                  math.multipliedBy(freeTaxPriceAmount, ratePlus),
                  amountPrecision
                );
              }
            }
            return thousandBitSeparator(value, amountPrecision);
          } else {
            const {
              taxRate,
              taxPrice,
              freeTaxPrice,
              freeTaxPriceAmount,
              currentInvoiceNumber,
            } = record;
            const ratePlus = math.plus(1, math.div(taxRate, 100));
            // 单价数量税率可编辑
            if (isPriceCal && !isAmountCal) {
              if (setting010505 === 'TAX_INCLUDED_PRICE') {
                return this.calcRender(
                  (taxPrice * currentInvoiceNumber) / unitPriceBatch,
                  amountPrecision
                );
              }
              if (setting010505 === 'NET_PRICE') {
                return this.calcRender(
                  math.div(
                    math.multipliedBy(
                      math.multipliedBy(freeTaxPrice, ratePlus),
                      currentInvoiceNumber
                    ),
                    unitPriceBatch
                  ),
                  amountPrecision
                );
              }
            }
            if (isAmountCal && setting010505 === 'NET_PRICE') {
              // 不含税金额可编辑
              return this.calcRender(
                math.multipliedBy(freeTaxPriceAmount, ratePlus),
                amountPrecision
              );
            }
            return thousandBitSeparator(value, amountPrecision);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
        align: 'right',
        width: 120,
        dataIndex: 'taxAmount',
        render: (value, record) => {
          const {
            quantityUpdFlag, // 是否修改数量
            priceUpdFlag, // 是否允许修改单价
            taxUpdFlag, // 是否允许修改税率
            priceShieldFlag, // 是否价格屏蔽
            unitPriceBatch, // 每
          } = record;
          const isCalc = +quantityUpdFlag || +priceUpdFlag || +taxUpdFlag;
          if (record._status && Number(priceShieldFlag) === 0 && Number(priceUpdFlag) === 1) {
            const { $form } = record;
            const _record = $form.getFieldsValue();
            const { taxPrice, taxRate, currentInvoiceNumber, freeTaxPrice } = _record;
            const rateDiv = math.div(taxRate, 100);
            const ratePlus = math.plus(1, rateDiv);
            if (isCalc && setting010505 === 'TAX_INCLUDED_PRICE') {
              // 变更含税价
              return this.calcRender(
                math.div(
                  math.multipliedBy(
                    math.multipliedBy(math.div(taxPrice, ratePlus), rateDiv),
                    currentInvoiceNumber
                  ),
                  unitPriceBatch
                ),
                record.amountPrecision
              );
            }

            if (isCalc && setting010505 === 'NET_PRICE') {
              // 变更不含税价
              return this.calcRender(
                math.div(
                  math.multipliedBy(math.multipliedBy(freeTaxPrice, rateDiv), currentInvoiceNumber),
                  unitPriceBatch
                ),
                record.amountPrecision
              );
            }
            if (
              !isCalc &&
              (setting010505 === 'TAX_INCLUDED_PRICE' || setting010505 === 'NET_PRICE')
            ) {
              return priceShieldFlag ? '***' : thousandBitSeparator(value, record.amountPrecision);
            }
          } else {
            if (priceShieldFlag) {
              return '***';
            }
            const { taxPrice, taxRate, currentInvoiceNumber, freeTaxPrice } = record;
            const rateDiv = math.div(taxRate, 100);
            const ratePlus = math.plus(1, rateDiv);
            if (isCalc && setting010505 === 'TAX_INCLUDED_PRICE') {
              return this.calcRender(
                math.div(
                  math.multipliedBy(
                    math.multipliedBy(math.div(taxPrice, ratePlus), rateDiv),
                    currentInvoiceNumber
                  ),
                  unitPriceBatch
                ),
                record.amountPrecision
              );
            }

            if (isCalc && setting010505 === 'NET_PRICE') {
              return this.calcRender(
                math.div(
                  math.multipliedBy(math.multipliedBy(freeTaxPrice, rateDiv), currentInvoiceNumber),
                  unitPriceBatch
                ),
                record.amountPrecision
              );
            }
            return thousandBitSeparator(value, record.amountPrecision); // 非编辑下判断价格屏蔽
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种'),
        width: 100,
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxType`).d('事务类型'),
        width: 120,
        dataIndex: 'trxType',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxDate`).d('事务日期'),
        width: 120,
        dataIndex: 'trxDate',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.parentNumber`).d('父事务编号|行号'),
        width: 150,
        dataIndex: 'parentNumber',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.asnNum`).d('送货单号|行号'),
        width: 160,
        dataIndex: 'asnNum',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.poNumAndLineNum`).d('订单号|行号'),
        width: 160,
        dataIndex: 'poNum',
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayLineLocationNum`).d('发运号'),
        width: 100,
        dataIndex: 'lineLocationNum',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayReleaseNum`).d('发放号'),
        width: 100,
        dataIndex: 'releaseNum',
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.billNumber`).d('开票申请单号|行号'),
        width: 160,
        dataIndex: 'billNumber',
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.orderTypeName`).d('订单类型'),
        width: 120,
        dataIndex: 'orderTypeName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.companyName`).d('客户公司'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体'),
        width: 150,
        dataIndex: 'ouName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purchaseOrgName`).d('采购组织'),
        width: 150,
        dataIndex: 'purchaseOrganizationName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.organizationName`).d('库存组织'),
        width: 150,
        dataIndex: 'repertoryOrganizationName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purchaseAgentName`).d('采购员'),
        width: 100,
        dataIndex: 'agentName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierNum`).d('供应商编码'),
        width: 150,
        dataIndex: 'supplierCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商名称'),
        width: 130,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierSiteName`).d('供应商地点'),
        // width: 150,
        dataIndex: 'supplierSiteName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.partnerName`).d('出票方'),
        width: 150,
        dataIndex: 'partnerNum',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.sourceCode`).d('数据来源代码'),
        width: 150,
        dataIndex: 'sourceCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.externalSystemCode`).d('外部来源系统代码'),
        width: 150,
        dataIndex: 'externalSystemCode',
      },
      {
        title: intl
          .get(`${promptCode}.model.invoiceBill.sourceOrderTypeName`)
          .d('对账数据来源单据类型'),
        dataIndex: 'sourceOrderTypeNameMeaing',
        width: 140,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceCreationDate`).d('开票单日期'),
        width: 120,
        dataIndex: 'creationDate',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxYear`).d('事务年度'),
        width: 100,
        dataIndex: 'trxYear',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.needInvoiceFlag`).d('移除标识'),
        width: 100,
        dataIndex: 'needInvoiceFlag',
        render: (value, { undoRemoveFlag }) => {
          if (!undoRemoveFlag) {
            return +value === 1 ? yesOrNoRender(0) : yesOrNoRender(1);
          }
          return (
            <span>
              {+value === 1 ? yesOrNoRender(0) : yesOrNoRender(1)}
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Tooltip
                placement="topRight"
                title={intl
                  .get(`${promptCode}.model.invoiceBill.undoRemoveFlag`)
                  .d('该数据进行过移除，请注意！')}
              >
                <Icon type="exclamation-circle-o" style={{ color: 'red' }} />
              </Tooltip>
            </span>
          );
        },
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        fixed: 'right',
        name: 'taxInvoiceLineId',
        render: (record) => {
          if (!record.rcvTrxLineId) {
            return '-';
          }
          return (
            <a color="#29BECE" onClick={() => this.handleOperationRecord(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          );
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.onSelectChange,
    };

    const dataSource = ((list.create && list.create.content) || []).map((item) => {
      const index = selectedRows.findIndex((e) =>
        businessType === 'ACCEPT'
          ? e.acceptListLineId === item.acceptListLineId
          : e.rcvTrxLineId === item.rcvTrxLineId
      );
      return index !== -1 ? selectedRows[index] : item;
    });
    const setting010503 = (dataSource[0] || {}).priceUpdFlag;
    // TODO: 判断逻辑有问题
    if (setting010503 === 1) {
      // 若为含税价
      if (setting010505 === 'TAX_INCLUDED_PRICE') {
        const priceArray = [
          {
            title: intl.get(`${promptCode}.model.invoiceBill.rawTaxPrice`).d('原含税价'),
            width: 150,
            align: 'right',
            dataIndex: 'rawTaxPrice',
            render: (value, record) => {
              const { priceShieldFlag } = record;
              return priceShieldFlag
                ? '***'
                : thousandBitSeparatorCut(value, record.pricePrecision);
            },
          },
          {
            title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedPrice`).d('含税单价'),
            align: 'right',
            width: 120,
            dataIndex: 'taxPrice',
            render: (value, record) => {
              if (record._status) {
                const { getFieldDecorator } = record.$form;
                return (
                  <FormItem>
                    {getFieldDecorator('taxPrice', {
                      initialValue: value,
                    })(
                      <InputNumber
                        precision={precisionNum(value, record, 'taxPrice')}
                        allowThousandth
                        min={0}
                      />
                    )}
                  </FormItem>
                );
              } else {
                return thousandBitSeparator(value, record.pricePrecision);
              }
            },
          },
        ];
        const sIndex = columns.findIndex((item) => item.dataIndex === 'taxPrice');
        // 插入原含税价
        columns.splice(sIndex, 1, ...priceArray);
      }

      // 若为不含税价
      if (setting010505 === 'NET_PRICE') {
        const priceArray = [
          {
            title: intl.get(`${promptCode}.model.invoiceBill.rawNetPrice`).d('原不含税价'),
            align: 'right',
            width: 120,
            dataIndex: 'rawNetPrice',
            render: (value, record) => {
              const { priceShieldFlag } = record;
              return priceShieldFlag
                ? '***'
                : thousandBitSeparatorCut(value, record.pricePrecision);
            },
          },
          {
            title: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
            align: 'right',
            width: 150,
            dataIndex: 'freeTaxPrice',
            render: (value, record) => {
              const {
                priceUpdFlag, // 是否允许修改单价 1
                priceShieldFlag, // 是否价格屏蔽 0
              } = record;
              if (record._status && Number(priceShieldFlag) === 0 && Number(priceUpdFlag) === 1) {
                const { getFieldDecorator } = record.$form;
                return (
                  <FormItem>
                    {getFieldDecorator('freeTaxPrice', {
                      initialValue: value,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.invoiceBill.netPrice`)
                              .d('不含税单价'),
                          }),
                        },
                      ],
                    })(
                      <InputNumber
                        min={0}
                        precision={precisionNums(value, record, 'freeTaxPrice')}
                        allowThousandth
                      />
                    )}
                  </FormItem>
                );
              } else {
                return priceShieldFlag === 1
                  ? '***'
                  : thousandBitSeparator(value, record.pricePrecision);
              }
            },
          },
        ];

        const sIndex = columns.findIndex((item) => item.dataIndex === 'freeTaxPrice');
        // 插入原不含税价
        // 变更不含税单价
        columns.splice(sIndex, 1, ...priceArray);
      }
    }

    const tableProps = {
      rowKey: businessType === 'ACCEPT' ? 'acceptListLineId' : 'rcvTrxLineId',
      columns,
      loading,
      rowSelection,
      dataSource,
      bordered: true,
      pagination: pagination.create,
      onChange: this.tableChange,
      scroll: { x: sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 250 },
    };
    return customizeTable(
      {
        code: 'SFIN.INVOICE_CREATE_LIST.GRID',
      },
      <Table {...tableProps} />
    );
  }

  render() {
    const { visible, data } = this.state;
    const actionHistory = {
      visible,
      data,
      hideModal: this.hideModal,
    };
    return (
      <React.Fragment>
        {this.renderHeader()}
        <Content>
          {this.renderForm()}
          {this.renderTable()}
          {visible && <ActionHistory {...actionHistory} />}
        </Content>
      </React.Fragment>
    );
  }
}
