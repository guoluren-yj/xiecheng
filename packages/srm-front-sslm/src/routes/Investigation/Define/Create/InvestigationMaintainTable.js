/**
 * QuestionList -调查表维护页面--表部分(选择调查的供应商)
 * @date: 2018-7-25
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input } from 'hzero-ui';
import { DataSet, Button as C7nButton } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isNumber, sum, uniqBy } from 'lodash';

import { dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import SupplierLov from '_components/SupplierLov';

import GlobalPhone from '@/routes/components/GlobalPhone';
import MultiSelectModal from './MultiSelectModal';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sslm.investMaintain', 'sslm.common'],
})
@connect(({ investigationMaintain, loading }) => ({
  investigationMaintain,
  queryClassifyLoading: loading.effects['investigationMaintain/fetchSupplierClassify'],
  querySupplierLoading: loading.effects['investigationMaintain/fetchSupplierLovData'],
}))
export default class InvestigationMaintainTable extends PureComponent {
  form;

  supplierModalDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'selectedField',
        type: 'object',
        lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
        multiple: true,
      },
    ],
  });

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: props.selectedRowKeys,
      supplierVisible: false,
    };
  }

  /**
   * 判断子组件与父组件数据是否一样
   * @param {object} nextProps
   * @param {pbject} prevState
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    const { selectedRowKeys } = nextProps;
    if (selectedRowKeys !== prevState.selectedRowKeys) {
      return {
        ...prevState,
        selectedRowKeys,
      };
    } else {
      return null;
    }
  }

  /**
   * 编辑或者取消
   * @param {object} record --当前行数据
   * @param {boolean} flag --编辑或取消标识 true编辑，false取消
   */
  @Bind()
  handleEditInvestigation(record, flag) {
    const { onHandlerEditinvestigation } = this.props;
    onHandlerEditinvestigation(record, flag);
  }

  /**
   * 通过lov带出联系人邮箱与电话
   * @param {object} item --当前行数据
   * @param {object} record --当前lov选择记录
   */
  @Bind()
  fetchContactor(item, record) {
    record.$form.setFieldsValue({
      [`partnerContactPhone`]: item.mobilephone,
      [`internationalTelCode`]: item.internationalTelCode,
      [`partnerContactMail`]: item.mail,
    });
  }

  @Bind()
  showSuppilerLov() {
    const { supplierVisible } = this.state;
    this.setState({
      supplierVisible: !supplierVisible,
    });
  }

  /**
   * 查询供应商lov
   */
  @Bind()
  handleFecthRef(ref = {}) {
    this.supplier = ref;
  }

  /**
   * 查询供应商选择lov数据
   */
  @Bind()
  fetchSupplierLovData(params = {}) {
    const { supplierVisible } = this.state;
    const { form } = this.props;
    const { page = {} } = params;
    if (!supplierVisible) {
      this.showSuppilerLov();
    }
    const { dispatch } = this.props;
    const { investigateLevel, companyId } = form ? form.getFieldsValue() : {};
    const fieldValues = isUndefined(this.supplier)
      ? {}
      : filterNullValueObject(this.supplier.props && this.supplier.props.form.getFieldsValue());
    dispatch({
      type: 'investigationMaintain/fetchSupplierLovData',
      payload: {
        tenantId: getCurrentOrganizationId(),
        enabledFlag: 1,
        companyId: investigateLevel === 'COMPANY' ? companyId : null,
        page,
        ids: params.ids,
        ...fieldValues,
        customizeUnitCode: 'SSLM.INVESTIGATION_CREATE_DETAIL.INVESTIGATE_SUPPLIERS',
      },
    });
  }

  // 查询供应商分类
  @Bind()
  handleSupplierClassify() {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.supplier)
      ? {}
      : filterNullValueObject(
          this.supplier.supplierClassify &&
            this.supplier.supplierClassify.props &&
            this.supplier.supplierClassify.props.form.getFieldsValue()
        );
    dispatch({
      type: 'investigationMaintain/fetchSupplierClassify',
      payload: {
        ...fieldValues,
        enabledFlag: 1,
      },
    });
  }

  @Bind()
  saveRecordRows(record = []) {
    const { showOldModal = false, dispatch } = this.props;
    // 旧弹窗
    if (showOldModal) {
      dispatch({
        type: 'investigationMaintain/checkSupplier',
        payload: record.map(n => n.partnerCompanyId),
      }).then(res => {
        if (res) {
          if (this.supplier) {
            this.supplier.setState({ selectedChildRows: [] });
          }
          const { onSaveRecordRows } = this.props;
          onSaveRecordRows(record);
          this.showSuppilerLov();
        }
      });
    } else {
      // 新弹窗
      const currentData = this.supplierModalDs.current.toData();
      const { selectedField } = currentData;
      const selectedRecord = (selectedField || []).map(item => {
        const {
          supplierCompanyName,
          supplierCompanyNum,
          mail,
          mobilephone,
          name,
          ...others
        } = item;
        return {
          ...others,
          companyName: supplierCompanyName,
          companyNum: supplierCompanyNum,
          partnerContactMail: mail,
          partnerContactPhone: mobilephone,
          partnerContactor: name,
        };
      });
      const { onSaveRecordRows } = this.props;
      // 过滤重复的供应商
      const uniqData = uniqBy(selectedRecord, 'companyNum');
      onSaveRecordRows(uniqData);
      this.supplierModalDs.current.set('selectedField', undefined);
    }
  }

  @Bind()
  handlePageChange(page = {}) {
    const { dispatch, investigationList } = this.props;
    dispatch({
      type: 'investigationMaintain/updateState',
      payload: {
        investigationList: {
          content: investigationList.content,
          investigationPagination: page,
        },
      },
    });
  }

  render() {
    const {
      form,
      isAmktClient,
      queryClassifyLoading,
      querySupplierLoading,
      investigationList,
      supplierClassifyTreeList,
      onHandleRowSelectChange,
      onDeleteRows,
      investigationMaintain: {
        supplierPagination = {},
        supplierList = {},
        supplierClassifyList = [],
      },
      // companyId,
      custLoading,
      customizeTable,
      code = '',
      showOldModal = false,
      investigateCreateRemote,
    } = this.props;

    const remoteParams = investigateCreateRemote
      ? investigateCreateRemote.process(
          'SSLM_INVESTIGATE_CREATE_OLD_SUPPLIER_LOV_PARAMS',
          {},
          { form }
        )
      : {};

    const companyId = form.getFieldValue('companyId');

    const columns = [
      {
        title: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        width: 120,
        dataIndex: 'partnerCompanyId',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('partnerCompanyId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(<span>{record.companyNum}</span>)}
              </Form.Item>
            );
          } else {
            return record.companyNum;
          }
        },
      },
      {
        title: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('sslm.investMaintain.model.investMaintain.business').d('经营性质'),
        width: 170,
        dataIndex: 'business',
        render: (val, record) => {
          const businessList = [];
          if (record.manufacturerFlag) {
            businessList.push(
              intl.get('sslm.investMaintain.model.investMaintain.manufacturerFlag').d('制造商')
            );
          }
          if (record.servicerFlag) {
            businessList.push(
              intl.get('sslm.investMaintain.model.investMaintain.servicerFlag').d('服务商')
            );
          }
          if (record.traderFlag) {
            businessList.push(
              intl.get('sslm.investMaintain.model.investMaintain.traderFlag').d('贸易商')
            );
          }
          if (record.agentFlag) {
            businessList.push(intl.get('sslm.enterpriseInform.model.business.agent').d('代理商'));
          }
          if (record.integrationFlag) {
            businessList.push(
              intl.get('sslm.enterpriseInform.view.model.business.integration').d('集成商')
            );
          }
          if (record.contractorFlag) {
            businessList.push(
              intl.get('sslm.enterpriseInform.view.model.business.contractor').d('承包商')
            );
          }
          if (record.dealerFlag) {
            businessList.push(
              intl.get('sslm.enterpriseInform.view.model.business.dealer').d('经销商')
            );
          }
          return businessList.join('，');
        },
      },
      {
        title: intl.get('sslm.investMaintain.model.investMaintain.taxpayerType').d('纳税人类型'),
        width: 120,
        dataIndex: 'taxpayerType',
        render: (val, record) => {
          return record.taxpayerType === 'GT'
            ? intl.get('sslm.investMaintain.model.investMaintain.taxpayerTypeGT').d('一般纳税人')
            : record.taxpayerType === 'T'
            ? intl.get('sslm.investMaintain.model.investMaintain.taxpayerTypeT').d('小规模纳税人')
            : '';
        },
      },
      {
        title: intl.get('sslm.common.view.contact.name').d('联系人'),
        width: 150,
        dataIndex: 'partnerContactor',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('partnerContactor', {
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get('sslm.common.view.contact.name').d('联系人'),
                  //     }),
                  //   },
                  // ],
                  initialValue: record.partnerContactor,
                })(
                  <Lov
                    textValue={record.partnerContactor}
                    code="SSLM.SUPPLIER_MAIN_DATA_CONTACT"
                    queryParams={{
                      companyId,
                      partnerTenantId: record.partnerTenantId,
                      partnerCompanyId: record.partnerCompanyId,
                    }}
                    lovOptions={{
                      displayField: 'name',
                      valueField: 'name',
                    }}
                    onChange={(text, changeRecord) => {
                      this.fetchContactor(changeRecord, record);
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.investMaintain.model.investMaintain.ContactPhone').d('联系电话'),
        width: 300,
        dataIndex: 'partnerContactPhone',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('partnerContactPhone', {
                  rules: [
                    // {
                    //   required: true,
                    //   message: intl.get('hzero.common.validation.notNull', {
                    //     name: intl
                    //       .get('sslm.investMaintain.model.investMaintain.ContactPhone')
                    //       .d('联系电话'),
                    //   }),
                    // },
                  ],
                  initialValue: val,
                })(
                  <GlobalPhone
                    disabled
                    form={record.$form}
                    initialValue={record.internationalTelCode}
                    phoneField="partnerContactPhone"
                    telCodeField="internationalTelCode"
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        width: 200,
        dataIndex: 'partnerContactMail',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('partnerContactMail', {
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get('hzero.common.email').d('邮箱'),
                  //     }),
                  //   },
                  // ],
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.investMaintain.model.investMaintain.buildDate').d('注册日期'),
        width: 120,
        dataIndex: 'buildDate',
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'edit',
        width: 100,
        render: (val, record) => {
          if (record._status === 'update') {
            return (
              <a onClick={() => this.handleEditInvestigation(record, false)}>
                {intl.get('hzero.common.status.cancel').d('取消')}
              </a>
            );
          } else {
            return (
              <a onClick={() => this.handleEditInvestigation(record, true)}>
                {intl.get('hzero.common.status.edit').d('编辑')}
              </a>
            );
          }
        },
      },
    ];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: onHandleRowSelectChange,
    };
    const { supplierVisible } = this.state;
    const queryFields = [
      {
        field: 'companyNum',
        label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
      },
      {
        field: 'companyName',
        label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
      },
    ];
    const fieldsColumn = [
      {
        title: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        dataIndex: 'companyNum',
        width: 120,
      },
      {
        title: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
        dataIndex: 'companyName',
      },
    ];
    const suppilerModel = {
      supplierVisible,
      queryFields,
      fieldsColumn,
      supplierClassifyList,
      supplierPagination,
      supplierList,
      queryClassifyLoading,
      querySupplierLoading,
      supplierClassifyTreeList,
      onRef: this.handleFecthRef,
      onChange: this.showSuppilerLov,
      onSaveRecord: this.saveRecordRows,
      fetchSupplierData: this.fetchSupplierLovData,
      fetchSupplierClassify: this.handleSupplierClassify,
      custLoading,
      customizeTable,
      code,
      // fetTreeSupplierClassify: this.handleTreeSupplierClassify,
    };
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    const modalProps = {
      dataSet: this.supplierModalDs,
      name: 'selectedField',
      mode: 'button',
      clearButton: false,
      color: 'primary',
      modalProps: {
        onOk: this.saveRecordRows,
      },
      queryData: {
        srmFlag: 1,
        companyId,
        pageSource: 'Investg',
        ...remoteParams,
      },
    };

    return (
      <div>
        <React.Fragment>
          <Form>
            <FormItem style={{ textAlign: 'right', display: isAmktClient ? 'none' : 'block' }}>
              <C7nButton disabled={this.state.selectedRowKeys.length < 1} onClick={onDeleteRows}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </C7nButton>
              {showOldModal ? (
                <C7nButton
                  color="primary"
                  style={{ marginLeft: '12px' }}
                  onClick={this.fetchSupplierLovData}
                >
                  {intl.get('hzero.common.button.create').d('新建')}
                </C7nButton>
              ) : (
                <SupplierLov {...modalProps}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </SupplierLov>
              )}
            </FormItem>
            <FormItem>
              {customizeTable(
                {
                  code: 'SSLM.INVESTIGATION_CREATE_DETAIL.SELECT_SUPPLIERS',
                },
                <EditTable
                  bordered
                  columns={columns}
                  rowSelection={rowSelection}
                  rowKey="partnerCompanyId"
                  scroll={{ x: scrollX }}
                  dataSource={investigationList.content}
                  pagination={investigationList.investigationPagination}
                  onChange={this.handlePageChange}
                  custLoading={custLoading}
                />
              )}
            </FormItem>
          </Form>
        </React.Fragment>
        <MultiSelectModal {...suppilerModel} Key="new" />
      </div>
    );
  }
}
