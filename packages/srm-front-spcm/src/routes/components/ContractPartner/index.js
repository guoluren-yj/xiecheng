/*
 * ContractPartner - 采购协议伙伴信息
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Input, Select, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isFunction } from 'lodash';
import { EMAIL } from 'utils/regExp';
import querystring from 'querystring';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'components/EditTable';
import DisplayFormItem from '../DisplayFormItem/index2';

import styles from './index.less';

const rowKey = 'partnerId';
const FormItem = Form.Item;
const commonPrompt = 'spcm.common.model.common';
let companyId = -2;

/**
 * ContractPartner - 采购协议伙伴信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@withRouter
export default class ContractPartner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem() {
    const { onChangeState } = this.props;
    onChangeState({ partnerEdited: true });
  }

  /**
   * 公司Lov改变回调
   */
  @Bind()
  handleChangeCompany(value, lovRecord, record) {
    const { onFetchExtended } = this.props;
    const {
      $form: { setFieldsValue },
    } = record;
    // registerField('companyNum');
    setFieldsValue({
      companyName: lovRecord.supplierCompanyName,
      companyNum: lovRecord.supplierCompanyNum,
    });
    onFetchExtended(lovRecord.supplierCompanyId).then((res) => {
      if (res) {
        const {
          legalRepName,
          address,
          contacts,
          telNum,
          taxRegistrationPhone,
          mail,
          bankName,
          bankAccountName,
          bankAccountNum,
          // remark,
          unifiedSocialCode,
          bankFirm,
          businessRegistrationNumber,
          dunsCode,
          intlBankAccountNum,
          postCode,
        } = res;
        record.$form.setFieldsValue({
          legalRepName,
          address,
          contacts,
          telNum,
          taxRegistrationPhone,
          mail,
          bankName,
          bankAccountName,
          bankAccountNum,
          // remark,
          unifiedSocialCode,
          bankFirm,
          businessRegistrationNumber,
          dunsCode,
          intlBankAccountNum,
          postCode,
        });
      }
    });
    this.handleChangeFormItem();
  }

  /**
   * 选中行改变回调
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   */
  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows) {
    const { onSelectionChange } = this.props;
    onSelectionChange(selectedRowKeys, selectedRows, 'partner');
  }

  /**
   * 合作伙伴下拉框改变回调
   */
  handleChangePartner(value, record) {
    const { detailEnumMap = {} } = this.props;
    const { partnerTypes = [] } = detailEnumMap;

    const enumItem = partnerTypes.find((item) => item.partnerTypeCode === value);
    const { setFieldsValue } = record.$form;
    const partnerInfo = {
      partnerTypeId: (enumItem && enumItem.partnerTypeId) || '',
      partnerTypeCode: (enumItem && enumItem.partnerTypeCode) || '',
      partnerTypeName: (enumItem && enumItem.partnerTypeName) || '',
    };
    // 带出说明字段
    if (!record.remark && !isEmpty(enumItem)) {
      partnerInfo.remark = enumItem.remark;
    }

    // registerField('partnerTypeId');
    // registerField('partnerTypeName');
    setFieldsValue(partnerInfo);

    this.handleChangeFormItem();
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { tenantId } = this.state;
    const {
      editable,
      maintainEditable,
      detailEnumMap = {},
      headerInfo = null,
      remote,
    } = this.props;
    const { partnerTypes = [] } = detailEnumMap;
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.partnerTypeName`).d('伙伴类型名称'),
        dataIndex: 'partnerTypeName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`partnerTypeCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.partnerTypeName`).d('伙伴类型名称'),
                    }),
                  },
                ],
                initialValue: record.partnerTypeCode,
              })(
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  onChange={(value) => this.handleChangePartner(value, record)}
                >
                  {partnerTypes.map((n) => (
                    <Select.Option key={n.partnerTypeCode} value={n.partnerTypeCode}>
                      {n.partnerTypeName}
                    </Select.Option>
                  ))}
                </Select>
              )}
              {record.$form.getFieldDecorator(`partnerTypeId`, {
                initialValue: record.partnerTypeId,
              })}
              {record.$form.getFieldDecorator(`partnerTypeName`, {
                initialValue: record.partnerTypeName,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.partnerTypeCode`).d('伙伴类型编码'),
        dataIndex: 'partnerTypeCode',
        width: 140,
      },
      {
        title: intl.get(`entity.company.code`).d('公司编码'),
        dataIndex: 'companyNum',
        width: 135,
        render: (val, record) => {
          const isEditable =
            ['create', 'update'].includes(record._status) && (editable || maintainEditable);
          const notSysSupplier =
            headerInfo &&
            headerInfo.pcKindCode === 'NOT_SYS_SUPPLIER' &&
            headerInfo.companyNum !== record.companyNum;
          const comNum = (record.companyNum && record.companyNum.split('@')[0]) || -1;

          if (isEditable && notSysSupplier) {
            record.$form.getFieldDecorator('companyId', {
              initialValue: record.companyId || companyId,
            });
            companyId -= 1;
          }
          return isEditable && notSysSupplier ? (
            <FormItem>
              {record.$form.getFieldDecorator(`companyNum`, {
                initialValue: Number(comNum) !== -1 ? comNum : undefined,
                // rules: [
                //   {
                //     required: true,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl.get(`entity.company.code`).d('公司编码'),
                //     }),
                //   },
                // ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : isEditable && record.predefinedFlag !== 1 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`companyId`, {
                initialValue: record.companyId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.company.code`).d('公司编码'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPCM.USER_AUTH.SUPPLIER"
                  queryParams={{ enabledFlag: 1, tenantId }}
                  // textField='companyNum'
                  textValue={record.companyNum}
                  lovOptions={{ displayField: 'supplierCompanyNum' }}
                  onChange={(value, lovRecord) =>
                    this.handleChangeCompany(value, lovRecord, record)
                  }
                />
              )}
              {record.$form.getFieldDecorator(`companyNum`, {
                initialValue: record.companyNum,
              })}
            </FormItem>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`entity.company.name`).d('公司名称'),
        dataIndex: 'companyName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`companyName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.companyName`).d('公司名称'),
                    }),
                  },
                  {
                    max: 360,
                    message: intl.get('hzero.common.validation.max', { max: 360 }),
                  },
                ],
                initialValue: record.companyName,
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.legalRepName`).d('代表人'),
        dataIndex: 'legalRepName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`legalRepName`, {
                initialValue: record.legalRepName,
                rules: [
                  {
                    max: 150,
                    message: intl.get('hzero.common.validation.max', { max: 150 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.corporateDuty`).d('法人职务'),
        dataIndex: 'corporateDuty',
        width: 170,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`corporateDuty`, {
                initialValue: record.corporateDuty,
                rules: [
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', { max: 60 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.postCode`).d('邮编'),
        dataIndex: 'postCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`postCode`, {
                initialValue: record.postCode,
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.unifiedSocialCode`).d('统一社会信用代码'),
        dataIndex: 'unifiedSocialCode',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`unifiedSocialCode`, {
                initialValue: record.unifiedSocialCode,
              })(<DisplayFormItem />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.businessRegistrationNumber`).d('商业注册号/税号'),
        dataIndex: 'businessRegistrationNumber',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`businessRegistrationNumber`, {
                initialValue: record.businessRegistrationNumber,
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.dunsCode`).d('邓白氏码'),
        dataIndex: 'dunsCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`dunsCode`, {
                initialValue: record.dunsCode,
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.address`).d('地址'),
        dataIndex: 'address',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`address`, {
                initialValue: record.address,
                rules: [
                  {
                    max: 300,
                    message: intl.get('hzero.common.validation.max', { max: 300 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.contacts`).d('联系人'),
        dataIndex: 'contacts',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`contacts`, {
                initialValue: record.contacts,
                rules: [
                  {
                    max: 100,
                    message: intl.get('hzero.common.validation.max', { max: 100 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.telNum`).d('联系电话'),
        dataIndex: 'telNum',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`telNum`, {
                initialValue: record.telNum,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.taxRegistrationPhone`).d('税务登记电话'),
        dataIndex: 'taxRegistrationPhone',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxRegistrationPhone`, {
                initialValue: record.taxRegistrationPhone,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.faxes`).d('传真'),
        dataIndex: 'faxes',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`faxes`, {
                initialValue: record.faxes,
                rules: [
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', { max: 60 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.mail`).d('邮箱'),
        dataIndex: 'mail',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`mail`, {
                initialValue: record.mail,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.bankName`).d('开户行名称'),
        dataIndex: 'bankName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankName`, {
                initialValue: record.bankName,
                rules: [
                  {
                    max: 320,
                    message: intl.get('hzero.common.validation.max', { max: 320 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.bankAccountName`).d('账户名称'),
        dataIndex: 'bankAccountName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankAccountName`, {
                initialValue: record.bankAccountName,
                rules: [
                  {
                    max: 320,
                    message: intl.get('hzero.common.validation.max', { max: 320 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.bankAccountNum`).d('银行账号'),
        dataIndex: 'bankAccountNum',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankAccountNum`, {
                initialValue: record.bankAccountNum,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.bankAddress`).d('开户行地址'),
        dataIndex: 'bankAddress',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankAddress`, {
                initialValue: record.bankAddress,
                rules: [
                  {
                    max: 150,
                    message: intl.get('hzero.common.validation.max', { max: 150 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.bankNumber`).d('联行行号'),
        dataIndex: 'bankFirm',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankFirm`, {
                initialValue: record.bankFirm,
                rules: [
                  {
                    max: 150,
                    message: intl.get('hzero.common.validation.max', { max: 150 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.intlBankAccountNum`).d('国际银行账号'),
        dataIndex: 'intlBankAccountNum',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`intlBankAccountNum`, {
                initialValue: record.intlBankAccountNum,
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.explain`).d('说明'),
        dataIndex: 'remark',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: record.remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    const newCols = remote
      ? remote.process('SPCM_CONTRACT_MAINTAIN_DETAIL_PARTNER_COLUMN', columnArray, {
          current: this,
        })
      : columnArray;
    return newCols;
  }

  @Bind()
  handleGetCode() {
    const { unitCodeList } = this.props;
    const {
      match: { path },
      location: { search },
    } = this.props?.parentRoute || this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (path === '/spcm/contract-maintain/detail' || routerParams.hasChanged === 'true') {
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER';
    } else {
      // 解耦协议签署和我收到的协议个性化单元，以unitCodeList作为参数进行判断
      if (unitCodeList) {
        return unitCodeList.PARTNER;
      }
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY';
    }
  }

  /**
   * 表单域监听
   */
  @Bind()
  handleDataChange() {
    const { dispatch = () => {}, formChanged } = this.props;
    if (!formChanged) {
      dispatch({
        type: 'contractCommon/updateState',
        payload: {
          formChanged: true,
        },
      });
    }
  }

  render() {
    const {
      deleting,
      loading,
      onSearch,
      onAdd,
      onDelete,
      editable,
      maintainEditable,
      selectedRows = [],
      dataSource = [],
      check,
      checkArtificial,
      customizeTable,
      customizeBtnGroup = () => {},
    } = this.props;
    const columns = this.getColumns();
    const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelection,
      getCheckboxProps: (record) => ({
        disabled: record.predefinedFlag === 1, // Column configuration not to be checked
      }),
    };
    const scrollX = tableScrollWidth(columns);
    const editTableProps = {
      loading,
      columns,
      dataSource,
      rowSelection: check || (checkArtificial && rowSelection),
      rowKey,
      pagination: false,
      bordered: true,
      onChange: (page) => onSearch(page),
      scroll: { x: scrollX },
      onDataChange: this.handleDataChange,
    };
    return (
      <Fragment>
        {(editable || maintainEditable) && (
          <div className={styles['btn-wrapper']}>
            {customizeBtnGroup(
              {
                code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.BTN_GROUP',
              },
              [
                <Button data-name="create" type="primary" onClick={onAdd}>
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </Button>,
                <Button
                  data-name="delete"
                  loading={deleting}
                  onClick={onDelete}
                  style={{ marginRight: '8px' }}
                  disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
                >
                  {intl.get(`hzero.common.button.delete`).d('删除')}
                </Button>,
              ]
            )}
          </div>
        )}
        {customizeTable(
          {
            code: this.handleGetCode(),
          },
          <EditTable {...editTableProps} />
        )}
      </Fragment>
    );
  }
}
