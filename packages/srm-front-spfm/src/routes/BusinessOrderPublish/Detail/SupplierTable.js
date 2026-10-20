/**
 * SupplierTable - 供应商table
 * @date: 2019-2-24
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Button, Form, Row, Col, Select } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import queryString from 'querystring';
import { connect } from 'dva';
import CommonImport from 'hzero-front/lib/components/Import';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';

import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';

import { PRIVATE_BUCKET } from '_utils/config';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import { openTab } from 'utils/menuTab';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import UploadModal from 'components/Upload/index';

import MultiSelectModal from './MultiSelectModal';
import SupplierList from './SupplierList';

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

@Form.create({ fieldNameProp: null })
@connect(({ businessOrderPublish, loading }) => ({
  businessOrderPublish,
  queryClassifyLoading: loading.effects['businessOrderPublish/fetchSupplierClassify'],
  querySupplierLoading: loading.effects['businessOrderPublish/fetchSupplierLovData'],
}))
export default class SupplierTable extends Component {
  state = {
    rowSelected: [],
    rowSelectedKeys: [],
    addAllFlag: false,
    supplierVisible: false,
  };

  componentDidMount() {
    this.props.onRef(this);
    const { supplierDs, onInputChange } = this.props;
    const handleSelect = ({ dataSet, records }) => {
      const { selected } = dataSet;
      this.setState({
        rowSelected: selected.map((ele) => ele.toData()),
        rowSelectedKeys: selected.map((ele) => ele.get('supplierCompanyId')),
      });
    };
    const handleUpdate = ({ dataSet, record, value, name }) => {
      if (name === 'contactId' && value) {
        onInputChange(value, record.toData());
      }
    };
    supplierDs.addEventListener('batchSelect', handleSelect);
    supplierDs.addEventListener('batchUnSelect', handleSelect);
    supplierDs.addEventListener('update', handleUpdate);
  }

  componentWillUnmount() {
    const { supplierDs } = this.props;
    supplierDs.removeEventListener('batchSelect');
    supplierDs.removeEventListener('batchUnSelect');
    supplierDs.removeEventListener('update');
  }

  /**ƒ
   * 查询供应商lov
   */
  @Bind()
  handleFecthRef(ref = {}) {
    this.supplier = ref;
  }

  @Bind()
  showSuppilerLov() {
    const { supplierVisible } = this.state;
    this.setState({
      supplierVisible: !supplierVisible,
    });
  }

  @Bind()
  saveRecordRows(record = []) {
    const { onSaveRecordRows } = this.props;
    onSaveRecordRows(record);
    this.showSuppilerLov();
  }

  /**
   * 查询供应商选择lov数据
   */
  @Bind()
  fetchSupplierLovData(params = {}) {
    const { supplierVisible } = this.state;
    if (!supplierVisible) {
      this.showSuppilerLov();
    }
    const {
      dispatch,
      onHandleGetOrderFormData,
      businessOrderPublish: { supplierSelectPagination = {} },
    } = this.props;
    const orderFormData = onHandleGetOrderFormData();
    const { companyId } = orderFormData;
    const fieldValues = isUndefined(this.supplier)
      ? {}
      : filterNullValueObject(this.supplier.props && this.supplier.props.form.getFieldsValue());
    const { stageCodes = [] } = fieldValues;
    const state = isUndefined(this.supplier) ? undefined : this.supplier.state;
    dispatch({
      type: 'businessOrderPublish/fetchSupplierLovData',
      payload: {
        companyId,
        page: isEmpty(params) ? supplierSelectPagination : params,
        // ...query,
        ids: state ? state.checkedKeys : [],
        ...fieldValues,
        stageCodes: (stageCodes || [])?.join(','),
        customizeUnitCode:
          'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.TABLE,SPFM.PORTAL.BUSINESSORDER.PUBLISH.SUPPLIER.SEACH,SPFM.PORTAL.BUSINESSORDER.PUBLISH.SUPPLIER.TABLE',
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
      type: 'businessOrderPublish/fetchSupplierClassify',
      payload: { ...fieldValues, enabledFlag: 1 },
    });
  }

  /**
   * 勾选行数据
   */
  @Bind()
  onRowSelectChange(_, rows) {
    this.setState({
      rowSelected: rows,
      rowSelectedKeys: rows.map((n) => n.supplierCompanyId),
    });
  }

  /**
   * 删除供应商
   */
  @Bind()
  handleClearEdit() {
    const { supplierDs } = this.props;
    const { rowSelected = [] } = this.state;
    this.props.onClearEdit(rowSelected);
    this.setState({
      addAllFlag: false,
      rowSelected: [],
      rowSelectedKeys: [],
    });
    supplierDs.unSelectAll();
    supplierDs.clearCachedSelected();
  }

  /**
   * 加入全部\取消加入全部
   */
  @Bind()
  addAll() {
    const { supplierDs } = this.props;
    const { onHandleAddAll, dispatch } = this.props;
    if (this.state.addAllFlag) {
      this.setState({ addAllFlag: !this.state.addAllFlag });
      dispatch({
        type: 'businessOrderPublish/updateState',
        payload: {
          supplierTable: [],
          supplierPagination: {},
        },
      });
      supplierDs.loadData([]);
    } else {
      this.setState(
        {
          addAllFlag: !this.state.addAllFlag,
        },
        () => {
          onHandleAddAll();
        }
      );
    }
    supplierDs.unSelectAll();
    supplierDs.clearCachedSelected();
  }

  /**
   * 加入全部
   */
  @Bind()
  clearAll() {
    const { supplierDs } = this.props;
    this.setState({
      addAllFlag: false,
    });
    supplierDs.unSelectAll();
    supplierDs.clearCachedSelected();
  }

  /**
   *导入
   */
  @Bind()
  handleImport() {
    const { onHandleGetOrderFormData } = this.props;
    const orderFormData = onHandleGetOrderFormData();
    const { notificationNum, notificationId } = orderFormData;
    openTab({
      key: `/spfm/business-order-publish/import-component/SPFM.BSNES_NOTIFY_RECEIVES`,
      title: intl.get('spfm.businessOrder.model.businessOrder.supplierImport').d('供应商导入'),
      search: queryString.stringify({
        action: intl.get('spfm.businessOrder.model.businessOrder.supplierImport').d('供应商导入'),
        notificationId,
        notificationNum,
      }),
    });
  }

  render() {
    const {
      supplierDs,
      disabledFlg,
      readOnlyFlag,
      tableData = [],
      pagination = {},
      onHandleFetch,
      onInputChange,
      supplierClassifyTreeList,
      businessOrderPublish: {
        supplierSelectPagination = {},
        supplierList = {},
        supplierClassifyList = [],
        stageCodesList = [],
      },
      queryClassifyLoading,
      querySupplierLoading,
      form,
      fetchTableLoading,
      notificationId,
      customizeTable,
      customizeFilterForm,
      onHandleGetOrderFormData,
      supplierContactFlag,
      cuxEditFlag,
      CuxDom,
      editorCuxFlagFc,
      remote
    } = this.props;
    const orderFormData = onHandleGetOrderFormData();
    const { companyId, notificationStatus } = orderFormData || {};
    const { rowSelectedKeys, rowSelected, addAllFlag, supplierVisible } = this.state;
    const columns = [
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('spfm.businessOrder.model.businessOrder.contactId').d('联系人'),
        dataIndex: 'contactId',
        width: 150,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return !disabledFlg && !readOnlyFlag ? (
            <Form.Item>
              {getFieldDecorator('contactId', {
                initialValue: record.contactId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('spfm.businessOrder.model.businessOrder.contactId')
                        .d('联系人'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPFM.SUPPLIER_CONTANCTS"
                  textValue={record.contactName}
                  queryParams={{
                    supplierCompanyId: record.supplierCompanyId,
                    tenantId: getCurrentOrganizationId(),
                    supplierTenantId: record.supplierTenantId,
                    supplierContactFlag,
                    companyId,
                  }}
                  lovOptions={{ displayField: 'name', valueField: 'companyContactId' }}
                  onChange={(val, lovRecord) => onInputChange(lovRecord, record)}
                />
              )}
            </Form.Item>
          ) : (
            record.contactName
          );
        },
      },
      {
        title: intl.get('spfm.businessOrder.model.businessOrder.contactPhone').d('联系电话'),
        dataIndex: 'contactPhone',
        width: 150,
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        dataIndex: 'contactEmail',
        width: 200,
      },
      {
        title: intl.get('spfm.businessOrder.model.businessOrder.receiveFlag').d('是否签收'),
        dataIndex: 'receiveFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('spfm.businessOrder.model.businessOrder.receiveDate').d('签收时间'),
        dataIndex: 'receiveDate',
        render: (val) => dateTimeRender(val),
        width: 150,
      },
      {
        title: intl
          .get('spfm.businessOrder.model.businessOrder.requireAttachmentFlag')
          .d('供应商是否附件必输'),
        dataIndex: 'requireAttachmentFlag',
        width: 150,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return !disabledFlg && !readOnlyFlag ? (
            <Form.Item>
              {getFieldDecorator('requireAttachmentFlag', {
                initialValue: record.requireAttachmentFlag,
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            yesOrNoRender(record.requireAttachmentFlag)
          );
        },
      },
      {
        title: intl
          .get('spfm.businessOrder.model.businessOrder.businessOrderFile')
          .d('供应商签署附件'),
        dataIndex: 'receivesAttachmentUuid',
        width: 150,
        render: (_, record) =>
          record.receiveFlag && (
            <UploadModal
              viewOnly
              btnText={intl.get('hzero.common.upload.view').d('查看附件')}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spfm-business-order"
              attachmentUUID={record.receivesAttachmentUuid}
            />
          ),
      },
    ];
    const tableProps = {
      columns,
      rowKey: 'supplierCompanyId',
      dataSource: tableData,
      bordered: true,
      loading: fetchTableLoading,
      pagination: isEmpty(pagination) ? false : pagination,
      onChange: onHandleFetch,
      rowSelection: !disabledFlg && {
        selectedRowKeys: rowSelectedKeys,
        onChange: this.onRowSelectChange,
      },
    };
    const queryFields = [
      {
        field: 'supplierCompanyCode',
        label: intl.get(`entity.supplier.code`).d('供应商编码'),
      },
      {
        field: 'supplierCompanyName',
        label: intl.get(`entity.supplier.name`).d('供应商名称'),
      },
    ];
    const fieldsColumn = [
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
      {
        dataIndex: 'stageCode',
        render: (_, record) => record.stageDescription,
        title: intl.get(`entity.supplier.stageCode`).d('生命周期'),
      },
    ];
    const suppilerModel = {
      customizeTable,
      customizeFilterForm,
      supplierVisible,
      queryFields,
      fieldsColumn,
      supplierClassifyList,
      supplierPagination: supplierSelectPagination,
      supplierList,
      queryClassifyLoading,
      querySupplierLoading,
      supplierClassifyTreeList,
      stageCodesList,
      onRef: this.handleFecthRef,
      onChange: this.showSuppilerLov,
      onSaveRecord: this.saveRecordRows,
      fetchSupplierData: this.fetchSupplierLovData,
      fetchSupplierClassify: this.handleSupplierClassify,
      // fetTreeSupplierClassify: this.handleTreeSupplierClassify,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <Form layout="inline" className="more-fields-form">
            <Row gutter={12}>
              {(disabledFlg || readOnlyFlag) && (
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('spfm.businessOrder.model.businessOrder.receiveFlag')
                      .d('是否签收')}
                    {...formLayout}
                  >
                    {form.getFieldDecorator('receiveFlag')(
                      <Select allowClear>
                        {[
                          {
                            value: 0,
                            meaning: intl
                              .get('spfm.businessOrder.model.businessOrder.noReceive')
                              .d('未签收'),
                          },
                          {
                            value: 1,
                            meaning: intl
                              .get('spfm.businessOrder.model.businessOrder.received')
                              .d('已签收'),
                          },
                        ].map((n) => (
                          <Select.Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              )}
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get('spfm.businessOrder.model.businessOrder.supplierCompanyId')
                    .d('供应商')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SPFM.BSNES_NOTIFY_SUPPLIER"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                        companyId,
                      }}
                      disabled={notificationId === 'create'}
                      lovOptions={{
                        displayField: 'supplierCompanyName',
                        valueField: 'supplierCompanyId',
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    disabled={notificationId === 'create'}
                    onClick={() => {
                      onHandleFetch({});
                    }}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        {!disabledFlg && !readOnlyFlag && (
          <div className="table-list-search" style={{ textAlign: 'right' }}>
            <Fragment>
              {remote && remote.render('SPFM_BUSINESSORDER_SUPPLIER_BUTTON_RENDER', null, {remoteThis: this})}
              <span style={{ marginRight: 8 }}>
                {intl.get('spfm.businessOrder.view.button.addAll').d('加入全部')}
                <Switch
                  value={addAllFlag ? 1 : 0}
                  style={{ marginLeft: '8px' }}
                  onChange={() => this.addAll()}
                />
              </span>
              {/* <Button style={{ marginRight: 8 }} onClick={() => onHandleAddAll()}>
                {intl.get('spfm.businessOrder.view.button.addAll').d('加入全部')}
              </Button> */}
              <PermissionButton
                type="c7n-pro"
                icon="archive"
                style={{ marginRight: 8 }}
                onClick={this.handleImport}
                disabled={notificationId === 'create'}
                permissionList={[
                  {
                    code: `srm.bg.manager.portal.business-order-publish.ps.supplier.detail.import`,
                    type: 'button',
                    meaning: '导入供应商',
                  },
                ]}
              >
                {intl.get('spfm.businessOrder.model.businessOrder.supplierImport').d('导入供应商')}
              </PermissionButton>
              <CommonImport
                prefixPatch="/spfm"
                businessObjectTemplateCode="SPFM.BSNES_NOTIFY_RECEIVES"
                buttonText={intl
                  .get('spfm.businessOrder.model.businessOrder.supplierImport.new')
                  .d('导入供应商-新')}
                buttonProps={{
                  style: { marginRight: '8px' },
                  disabled: notificationId === 'create',
                  permissionList: [
                    {
                      code: `srm.bg.manager.portal.business-order-publish.ps.new.supplier.detail.import`,
                      type: 'button',
                      meaning: '导入供应商-新',
                    },
                  ],
                }}
                successCallBack={() => {
                  notification.success();
                  onHandleFetch();
                }}
              />
              <Button
                style={{ marginRight: 8 }}
                onClick={() => this.handleClearEdit()}
                disabled={rowSelectedKeys.length <= 0 || addAllFlag}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              <Button
                type="primary"
                onClick={() => this.fetchSupplierLovData()}
                disabled={addAllFlag}
              >
                {intl.get('spfm.businessOrder.model.businessOrder.supplierSelect').d('选择供应商')}
              </Button>
            </Fragment>
          </div>
        )}
        {cuxEditFlag && CuxDom && <CuxDom deleteDisabled={rowSelectedKeys.length <= 0} rowSelected={rowSelected} disabledChooseFlag={addAllFlag} chooseClick={this.fetchSupplierLovData} deleteClick={this.handleClearEdit} />}
        {/* {customizeTable(
          {
            code: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.TABLE',
          },
          <EditTable {...tableProps} />
        )} */}
        <SupplierList
          supplierDs={supplierDs}
          loading={fetchTableLoading}
          disabledFlg={disabledFlg}
          readOnlyFlag={readOnlyFlag}
          editorCuxFlagFc={editorCuxFlagFc}
          notificationStatus={notificationStatus}
        />
        {supplierVisible && <MultiSelectModal {...suppilerModel} Key="new" />}
      </React.Fragment>
    );
  }
}
