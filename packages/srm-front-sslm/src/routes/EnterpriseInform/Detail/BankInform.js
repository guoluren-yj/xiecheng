/**
 * BankInform - 银行信息
 * @date: 2019-10-31
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { Input, Form, Button, Spin, Select } from 'hzero-ui';
import { isNumber, sum, unionWith, unionBy, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';

const FormItem = Form.Item;
const { Option } = Select;
const organizationId = getCurrentOrganizationId();

@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryLoading: loading.effects[`enterpriseInform/queryPlatformBank`],
  saveLoading: loading.effects['enterpriseInform/savePlatformBank'],
}))
@Form.create({ fieldNameProp: null })
export default class BankInform extends Component {
  constructor(props) {
    super(props);
    const { supplierFlag = 1 } = props;
    this.defaultRowKey = supplierFlag === 0 ? 'comBankAccReqId' : 'bankAccReqId';
  }

  state = {
    platformBankList: [],
    // selectedRowKeys: [], // 选中的rowKeys
  };

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handlePlatformBank();
  }

  /**
   * 查询平台级银行信息
   */
  @Bind()
  handlePlatformBank() {
    const {
      isPub,
      pubEdit,
      dispatch,
      changFlag,
      changeReqId,
      companyId,
      supplierCompanyId,
      supplierFlag = 1,
      source = '',
      infoChangeRemote,
      customizeUnitCode,
      savePermissionFlag,
      customizeTenantId = null,
    } = this.props;
    dispatch({
      type: 'enterpriseInform/queryPlatformBank',
      payload: {
        changeReqId,
        companyId,
        supplierCompanyId,
        supplierFlag,
        dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
        customizeUnitCode,
        customizeTenantId,
        desensitize: false,
      },
    }).then(res => {
      if (res) {
        const result = infoChangeRemote
          ? infoChangeRemote.process(
              'SSLM_SUPPLIER_INFORM_CHANGE_DETAIL_BANK_INFO_DATASORUCE',
              res,
              { pubEdit, changFlag, isPub, source, savePermissionFlag }
            )
          : res;
        this.setState({ platformBankList: result });
      }
    });
  }

  /**
   * 是否为主账号checkBox change
   * @param {*} e
   * @param {*} record
   */
  @Bind()
  handleChangeCheckbox(e, record) {
    const { dispatch } = this.props;
    const { platformBankList } = this.state;
    const checkboxValue = e.target.value === 1 ? 0 : 1;
    const newBankList = platformBankList.map(item =>
      item[this.defaultRowKey] === record[this.defaultRowKey]
        ? { ...item, masterFlag: checkboxValue }
        : item
    );
    dispatch({
      type: 'enterpriseInform/updateState',
      payload: {
        platformBankList: newBankList,
      },
    });
  }

  @Bind()
  handleFirmOnChange(value, lovRecord, record) {
    const { $form } = record;
    $form.setFieldsValue({
      [`bankBranchCode`]: lovRecord.bankBranchCode,
      [`bankBranchId`]: lovRecord.bankBranchId,
      [`bankBranchName`]: lovRecord.bankBranchName,
      [`bankFirm`]: lovRecord.bankFirm,
      [`bankName`]: lovRecord.bankName,
      [`bankId`]: lovRecord.bankId,
      [`bankCode`]: lovRecord.bankCode,
    });
  }

  @Bind()
  handlePaymentTypeOnChange(value, lovRecord, record) {
    const { $form } = record;
    $form.setFieldsValue({
      [`paymentTypeId`]: lovRecord.typeId,
    });
  }

  @Bind()
  handleCurrencyOnChange(value, lovRecord, record) {
    const { $form } = record;
    $form.setFieldsValue({
      [`currencyCode`]: lovRecord.currencyCode,
      [`currencyName`]: lovRecord.currencyName,
      [`currencyIdMeaning`]: lovRecord.currencyName,
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const { platformBankList } = this.state;
    const {
      partnerTenantId = '-1',
      enterpriseInform: { enterpriseInfoDefault, supplierInfoDefault },
      source = '',
    } = this.props;
    const defaultInfo = source === 'enterprise' ? enterpriseInfoDefault : supplierInfoDefault;
    const {
      countryId,
      countryName,
      countryCode,
      domesticForeignRelation,
      companyName,
    } = defaultInfo;
    let masterFlag = 0;
    if (platformBankList.length === 0) {
      masterFlag = 1;
    }

    const newLine =
      partnerTenantId !== '-1'
        ? {
            _status: 'create',
            [this.defaultRowKey]: uuidv4(),
            enabledFlag: 1,
            masterFlag,
            tenantId: partnerTenantId,
            ...(domesticForeignRelation === 1
              ? {
                  bankCountryId: countryId,
                  bankCountryName: countryName,
                  bankCountryCode: countryCode,
                  bankAccountName: companyName,
                }
              : {}),
          }
        : {
            _status: 'create',
            [this.defaultRowKey]: uuidv4(),
            enabledFlag: 1,
            masterFlag,
            ...(domesticForeignRelation === 1
              ? {
                  bankCountryId: countryId,
                  bankCountryName: countryName,
                  bankCountryCode: countryCode,
                  bankAccountName: companyName,
                }
              : {}),
          };
    this.setState({
      platformBankList: [newLine, ...platformBankList],
    });
  }

  /**
   * 清除
   */
  @Bind()
  deleteRow(record) {
    const { platformBankList } = this.state;
    const newPlatformBankList = platformBankList.filter(
      n => n[this.defaultRowKey] !== record[this.defaultRowKey]
    );
    this.setState({
      platformBankList: newPlatformBankList,
    });
  }

  /**
   * 编辑/取消
   */
  @Bind()
  editRow(record, flag) {
    const { platformBankList } = this.state;
    const newPlatformBankList = platformBankList.map(item => {
      if (item[this.defaultRowKey] === record[this.defaultRowKey]) {
        // eslint-disable-next-line no-unused-expressions
        record.$form?.resetFields();
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    this.setState({
      platformBankList: newPlatformBankList,
    });
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const { domesticForeignRelation = 1 } = this.props;
    const { platformBankList } = this.state;
    let arrListData = getEditTableData(platformBankList);
    const isEditing = !!platformBankList.find(
      d => d._status === 'create' || d._status === 'update'
    );
    if (isEditing && Array.isArray(arrListData) && arrListData.length === 0) {
      notification.warning({
        message: intl.get('sslm.common.view.message.bankRequiredMsg').d('银行信息填写有误'),
      });
      return;
    }
    const companyBankList = unionWith(arrListData, platformBankList, (value1, value2) => {
      return value1.bankAccountNum === value2.bankAccountNum;
    });
    if (companyBankList.length >= 2) {
      for (let i = 0; i < companyBankList.length; i++) {
        for (let j = i + 1; j < companyBankList.length; j++) {
          if (companyBankList[i][this.defaultRowKey] === companyBankList[j][this.defaultRowKey]) {
            companyBankList.splice(j, 1);
            j--;
          }
        }
      }
    }

    const latestData = unionBy(arrListData, platformBankList, this.defaultRowKey);
    // 启用的银行信息
    const enableData = latestData.filter(b => b.enabledFlag);
    // 启用行主账号
    const enabledDataMasterFlag = enableData.filter(b => b.masterFlag).length !== 1;
    // 所有行主账号
    const allDataMasterFlag = latestData.filter(b => b.masterFlag).length !== 1;
    if (companyBankList.length > 0) {
      // 有启用校验必须只有一行主账号，全部行禁用则不校验
      if (!isEmpty(enableData)) {
        if (enabledDataMasterFlag || allDataMasterFlag) {
          notification.warning({
            message: intl
              .get(`sslm.enterpriseInform.view.message.warn.onlyMasterFlag`)
              .d('银行主账号必须有且只能维护一个，请检查并输入正确的数据'),
          });
          return false;
        }
      }
      // 校验通过
      if (
        !(
          arrListData.length === 0 &&
          companyBankList.find(item => item._status === 'create' || item._status === 'update')
        )
      ) {
        arrListData = arrListData.map(item => {
          const { ...newItem } = item;
          if (newItem._status === 'create') {
            delete newItem[this.defaultRowKey];
          }
          return newItem;
        });
        return arrListData;
      }
    } else if (domesticForeignRelation === 1) {
      return [];
    } else {
      // 境外银行信息可不填
      return [];
    }
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const {
      dispatch,
      changeReqId,
      companyId,
      source = '',
      infoChangeRemote,
      customizeUnitCode,
      customizeTenantId = null,
      supplierFlag,
    } = this.props;
    const comBankAccReqs = this.checkData();

    if (comBankAccReqs) {
      const payload = {
        supplierFlag,
        [supplierFlag === 0 ? 'comBankAccReqs' : 'supBankAccReqs']: comBankAccReqs,
        changeReqId,
        companyId,
        dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
        customizeUnitCode,
        customizeTenantId,
        desensitize: false,
      };
      if (infoChangeRemote && infoChangeRemote.event) {
        const cuxRes = await infoChangeRemote.event.fireEvent('cuxHandleBankSave', {
          payload,
          _this: this,
        });
        if (!cuxRes) {
          return;
        }
      }
      dispatch({
        type: 'enterpriseInform/savePlatformBank',
        payload,
      }).then(res => {
        if (res) {
          notification.success();
          this.handlePlatformBank();
        }
      });
    }
  }

  render() {
    // const { selectedRowKeys } = this.state;
    const {
      isPub,
      source,
      pubEdit,
      queryLoading,
      saveLoading,
      changFlag,
      customizeTable,
      customizeUnitCode,
      isSupplierInfoFlag = null,
      savePermissionFlag = true,
      code,
      changeLevel,
      partnerTenantId,
      infoChangeRemote,
    } = this.props;
    const { platformBankList } = this.state;
    // 平台级企业信息变更标识
    const enterprisePlatformFlag = !isSupplierInfoFlag && changeLevel === 'PLATFORM';

    const cols = [
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.bankCountry`).d('国家'),
        dataIndex: 'bankCountryId',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankCountryId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sslm.enterpriseInform.view.model.bank.bankCountry`).d('国家'),
                    }),
                  },
                ],
                initialValue: record.bankCountryId,
              })(
                <Lov
                  code="HPFM.COUNTRY"
                  disabled={changFlag}
                  queryParams={{ enabledFlag: 1 }}
                  textValue={record.bankCountryName}
                />
              )}
            </FormItem>
          ) : (
            record.bankCountryName
          ),
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.bankCode`).d('银行代码'),
        dataIndex: 'bankCode',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            record.$form.getFieldDecorator(`bankId`, { initialValue: record.bankId });
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`bankCode`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.enterpriseInform.view.model.bank.bankCode`)
                          .d('银行代码'),
                      }),
                    },
                  ],
                  initialValue: record.bankCode,
                })(<Input disabled />)}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.bankName`).d('银行名称'),
        dataIndex: 'bankName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankName`, {
                initialValue: record.bankName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.bankFirm`).d('联行行号'),
        dataIndex: 'bankFirm',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankFirm`, {
                initialValue: record.bankFirm,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sslm.enterpriseInform.view.model.bank.bankFirm`)
                        .d('联行行号'),
                    }),
                  },
                ],
              })(
                <Lov
                  disabled={changFlag}
                  code="SMDM.BANK_BRANCK_FIRM_TENANT"
                  onChange={(value, lovRecord) => this.handleFirmOnChange(value, lovRecord, record)}
                  textValue={record.bankFirm}
                  queryParams={{
                    tenantId: isSupplierInfoFlag
                      ? organizationId
                      : enterprisePlatformFlag
                      ? 0
                      : partnerTenantId,
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.bankBranchName`).d('开户行名称'),
        dataIndex: 'bankBranchName',
        width: 300,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankBranchName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sslm.enterpriseInform.view.model.bank.bankBranchName`)
                        .d('开户行名称'),
                    }),
                  },
                ],
                initialValue: record.bankBranchName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.bankAccountName`).d('账户名称'),
        dataIndex: 'bankAccountName',
        width: 300,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankAccountName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sslm.enterpriseInform.view.model.bank.bankAccountName`)
                        .d('账户名称'),
                    }),
                  },
                ],
                initialValue: record.bankAccountName,
              })(<Input disabled={changFlag} dbc2sbc={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.bankAccountNum`).d('银行账号'),
        dataIndex: 'bankAccountNum',
        width: 250,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankAccountNum`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sslm.enterpriseInform.view.model.bank.bankAccountNum`)
                        .d('银行账号'),
                    }),
                  },
                  {
                    pattern: /^[0-9A-Za-z-@._,/]*$/,
                    message: intl
                      .get('sslm.enterpriseInform.view.validatioin.bankAccountNum')
                      .d('银行账号应为数字，字母或"-@._,/"'),
                  },
                ],
                initialValue: record.bankAccountNum,
              })(<Input disabled={changFlag} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
        dataIndex: 'intlBankAccountNum',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('intlBankAccountNum', {
                initialValue: record.intlBankAccountNum,
              })(<Input disabled={changFlag} dbc2sbc={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.accountNature').d('账户性质'),
        dataIndex: 'accountNature',
        width: 160,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('accountNature', {
                initialValue: record.accountNature,
              })(
                <Select disabled={changFlag} style={{ width: '100%' }}>
                  {code.accountNatureType &&
                    code.accountNatureType.map(n => <Option value={n.value}>{n.meaning}</Option>)}
                </Select>
              )}
            </FormItem>
          ) : (
            record.accountNatureMeaning
          ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.accountPurpose').d('账户用途'),
        dataIndex: 'accountPurpose',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('accountPurpose', {
                initialValue: record.accountPurpose,
              })(
                <Select disabled={changFlag} style={{ width: '100%' }}>
                  {code.accountPurposeType &&
                    code.accountPurposeType.map(n => <Option value={n.value}>{n.meaning}</Option>)}
                </Select>
              )}
            </FormItem>
          ) : (
            record.accountPurposeMeaning
          ),
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.currencyName`).d('币种'),
        dataIndex: 'currencyId',
        width: 140,
        render: (val, record) => {
          // eslint-disable-next-line no-unused-expressions
          record?.$form?.getFieldDecorator('currencyCode');
          // eslint-disable-next-line no-unused-expressions
          record?.$form?.getFieldDecorator('currencyName');
          // eslint-disable-next-line no-unused-expressions
          record?.$form?.getFieldDecorator('currencyIdMeaning');
          return ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`currencyId`, {
                initialValue: record.currencyId,
              })(
                <Lov
                  code="SMDM.CURRENCY_SQL"
                  onChange={(value, lovRecord) =>
                    this.handleCurrencyOnChange(value, lovRecord, record)
                  }
                  disabled={changFlag}
                  queryParams={{
                    tenantId: isSupplierInfoFlag
                      ? organizationId
                      : enterprisePlatformFlag
                      ? '0'
                      : partnerTenantId,
                  }}
                  textValue={record.currencyIdMeaning}
                />
              )}
            </FormItem>
          ) : (
            record.currencyIdMeaning
          );
        },
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        align: 'left',
        width: 80,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: record.enabledFlag === 0 ? record.enabledFlag : 1,
              })(<Checkbox disabled={changFlag} />)}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.masterFlag`).d('主账号'),
        dataIndex: 'masterFlag',
        align: 'left',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`masterFlag`, {
                initialValue: record.masterFlag === 0 ? record.masterFlag : 1,
              })(
                <Checkbox
                  disabled={changFlag}
                  onChange={e => this.handleChangeCheckbox(e, record)}
                />
              )}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: record.remark,
              })(<Input disabled={changFlag} dbc2sbc={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        align: 'left',
        dataIndex: 'option',
        width: 80,
        render: (val, record) => (
          <span className="action-link">
            {record._status === 'update' && (
              <a onClick={() => this.editRow(record, false)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {!(record._status === 'create') && !(record._status === 'update') && (
              <a
                disabled={
                  (pubEdit ? !pubEdit : changFlag || !savePermissionFlag) ||
                  (source === 'supplier' && Boolean(record.extSourceAccountFlag))
                }
                onClick={() => this.editRow(record, true)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
            {record._status === 'create' && (
              <a disabled={changFlag} onClick={() => this.deleteRow(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
          </span>
        ),
      },
    ];
    if (!enterprisePlatformFlag) {
      cols.splice(10, 0, {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.paymentType`).d('付款方式'),
        dataIndex: 'paymentType',
        width: 150,
        render: (val, record) => {
          // eslint-disable-next-line no-unused-expressions
          record?.$form?.getFieldDecorator('paymentTypeId');
          return ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`paymentType`, {
                initialValue: record.paymentType,
              })(
                <Lov
                  disabled={changFlag}
                  code="SMDM.PAYMENT_TYPE"
                  queryParams={{
                    tenantId: isSupplierInfoFlag ? organizationId : partnerTenantId,
                  }}
                  onChange={(value, lovRecord) =>
                    this.handlePaymentTypeOnChange(value, lovRecord, record)
                  }
                  lovOptions={{ displayField: 'typeName', valueField: 'typeCode' }}
                  textValue={record.paymentTypeIdMeaning}
                />
              )}
            </FormItem>
          ) : (
            record.paymentTypeIdMeaning
          );
        },
      });
    }
    const columns = infoChangeRemote
      ? infoChangeRemote.process('SSLM_SUPPLIER_INFORM_CHANGE_DETAIL_BANK_INFO_COLS', cols, {
          pubEdit,
          changFlag,
          isPub,
          source,
          savePermissionFlag,
        })
      : cols;
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <Spin spinning={queryLoading || saveLoading || false}>
        {infoChangeRemote &&
          infoChangeRemote.render('SSLM.INFO_CHANGE_BANK_INFO_RENDER', <></>, {})}
        <div
          style={{
            textAlign: 'right',
            paddingBottom: 16,
            display: changFlag || !savePermissionFlag ? 'none' : 'block',
          }}
        >
          <Button onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleAdd}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </div>
        {customizeTable(
          {
            code: customizeUnitCode,
            clearCache: (a, b, cb) => {
              if (a !== b) cb(a);
            },
            useNewValid: true,
          },
          <EditTable
            bordered
            scroll={{ x: scrollX }}
            rowKey={this.defaultRowKey}
            columns={columns}
            // rowSelection={rowSelection}
            dataSource={platformBankList}
            pagination={false}
          />
        )}
      </Spin>
    );
  }
}
