import React, { PureComponent } from 'react';
import { Form, Input, Button, InputNumber } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import Lov from 'components/Lov';
import { phoneRender } from '@/utils/renderer';
import CommonImport from '@/routes/himp/CommonImportNew';
import styles from './index.less';

export default class SupplierLineTable extends PureComponent {
  /**
   * 改变供应商编码-获取供应商名称
   */
  @Bind()
  changeSupplierCompanyNum(value, dataList, record) {
    const {
      supplierCompanyName,
      supplierCompanyCode,
      supplierTenantId,
      companyId,
      contactName,
      mobilephone,
      mail,
    } = dataList;
    record.$form.setFieldsValue({
      supplierCompanyName,
      supplierCompanyNum: supplierCompanyCode,
      supplierTenantId,
      companyId,
      contactName,
      contactMobilephone: mobilephone,
      contactMail: mail,
    });
  }

  /**
   * 改变联系人-获取联系电话、电子邮件
   */
  @Bind()
  changeContactName(value, dataList, record) {
    record.$form.setFieldsValue({
      contactMobilephone: dataList.mobilephone,
      contactMail: dataList.mail,
    });
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
    }
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchExport() {
    const {
      match: {
        params: { rfxId },
      },
      organizationId,
      fetchSupplierLine,
      form,
    } = this.props;
    const companyId = form.getFieldValue('companyId');
    if (!rfxId || rfxId === 'null') {
      return;
    }
    if (!companyId || companyId === 'null') {
      notification.warning({
        message: intl.get('ssrc.common.message.validation.pleaseCompanyId').d('请先维护公司信息'),
      });
    } else {
      const props = {
        code: 'SSRC.RFX_SUPPLIER.IMPORT',
        prefixPatch: SRM_SSRC,
        args: JSON.stringify({
          tenantId: organizationId,
          organizationId,
          rfxHeaderId: rfxId,
          templateCode: 'SSRC.RFX_SUPPLIER.IMPORT',
        }),
        backPath: undefined,
        action: 'hzero.common.title.batchImport',
      };

      Modal.open({
        destroyOnClose: true,
        closable: true,
        key: Modal.key(),
        title: intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表'),
        children: <CommonImport {...props} />,
        style: { width: '80%' },
        onOk: () => fetchSupplierLine(),
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      saveLoading,
      supplierRowSelection,
      supplierLineSelectedRowKeys,
      header,
      dataSource = [],
      pagination,
      onSearch,
      // onCreateLine,
      onSaveLine,
      onDeleteLines,
      supplierRelationMap,
      organizationId,
      userId,
      companyId,
      onLinkRiskScan,
      sourceMethodValue,
      onBulkAddSupplier,
      customizeTable,
      rankRule = null,
    } = this.props;
    const allowChangeSupplyFlag =
      header.allowChangeSupplyFlag === 0 && header.sourceFrom === 'PROJECT';
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('supplierCompanyId', {
                  rules: [
                    {
                      required: sourceMethodValue === 'INVITE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`)
                          .d('供应商编码'),
                      }),
                    },
                  ],
                  initialValue: record.supplierCompanyId,
                })(
                  <Lov
                    code="SSRC.SUPPLIER"
                    onChange={(value, dataList) =>
                      this.changeSupplierCompanyNum(value, dataList, record)
                    }
                    queryParams={{ organizationId, userId, companyId }}
                    textValue={record.supplierCompanyNum}
                    disabled={
                      record._status !== 'create' ||
                      sourceMethodValue !== 'INVITE' ||
                      allowChangeSupplyFlag
                    }
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('supplierCompanyNum', {
                  initialValue: record.supplierCompanyNum,
                })(<div />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('companyId', {
                  initialValue: record.companyId,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('supplierCompanyName', {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('supplierTenantId', {
                  initialValue: record.supplierTenantId,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        dataIndex: 'priceCoefficient',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('priceCoefficient', {
                initialValue: val,
                rules: [
                  {
                    required: rankRule === 'WEIGHT_PRICE',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`)
                        .d('价格系数'),
                    }),
                  },
                ],
              })(<InputNumber min={0} max={999999999} precision={4} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 130,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.riskScan`).d('风险扫描'),
        width: 100,
        dataIndex: 'riskScan',
        render: (val, record) =>
          record.isMonitor === 1 || record.isShowScan === 1 ? (
            <a onClick={() => onLinkRiskScan(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.riskScan`).d('风险扫描')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        dataIndex: 'contactName',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('contactName', {
                initialValue: val,
                rules: [
                  {
                    required: record.$form.getFieldValue('supplierCompanyId') && true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSRC.SUPPLIER_CONTANCTS"
                  textValue={record.contactName || record.$form.getFieldValue('contactName')}
                  queryParams={{
                    companyId,
                    supplierCompanyId: record.$form.getFieldValue('supplierCompanyId'),
                  }}
                  onChange={(value, dataList) => this.changeContactName(value, dataList, record)}
                  disabled={
                    !record.$form.getFieldValue('supplierCompanyId') ||
                    sourceMethodValue !== 'INVITE'
                  }
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        dataIndex: 'contactMobilephone',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('contactMobilephone', {
                  initialValue: record.contactMobilephone,
                })(
                  <div>
                    {phoneRender(
                      record.$form.getFieldValue('internationalTelCodeMeaning'),
                      record.$form.getFieldValue('contactMobilephone')
                    )}
                  </div>
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('internationalTelCode', {
                  initialValue: record.internationalTelCode,
                })(<div />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('internationalTelCodeMeaning', {
                  initialValue: record.internationalTelCodeMeaning,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        dataIndex: 'contactMail',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('contactMail', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    return (
      <React.Fragment>
        <div className={styles['item-list-search']}>
          <Form layout="inline">
            {/* <Button type="primary" onClick={onCreateLine} disabled={sourceMethodValue !== 'INVITE'}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button> */}
            <Button
              icon="arrow-down"
              disabled={sourceMethodValue !== 'INVITE' || allowChangeSupplyFlag}
              onClick={() => this.handleBatchExport()}
            >
              {intl.get('ssrc.inquiryHall.view.button.allCreate').d('批量创建')}
            </Button>
            <Button
              onClick={onSaveLine}
              disabled={dataSource.length === 0 || sourceMethodValue !== 'INVITE'}
              loading={saveLoading}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              onClick={onDeleteLines}
              disabled={
                supplierLineSelectedRowKeys.length === 0 ||
                sourceMethodValue !== 'INVITE' ||
                allowChangeSupplyFlag
              }
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button
              onClick={onBulkAddSupplier}
              disabled={sourceMethodValue !== 'INVITE' || allowChangeSupplyFlag}
            >
              {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier`)
                .d('批量添加供应商')}
            </Button>
            <Button
              onClick={supplierRelationMap}
              disabled={
                !dataSource.some((item) => item._status === 'update') ||
                sourceMethodValue !== 'INVITE' ||
                allowChangeSupplyFlag
              }
            >
              {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.button.RelationMap`)
                .d('供应商关系图谱')}
            </Button>
          </Form>
        </div>
        {customizeTable(
          {
            code: 'SSRC.INQUIRY_HALL.EDIT_LINE_SUPPLIER', // 单元编码，必传
          },
          <EditTable
            bordered
            rowKey="rfxLineSupplierId"
            loading={loading}
            // scroll={{ x: scrollX }}
            columns={columns}
            rowSelection={supplierRowSelection}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => onSearch(page)}
            onDataChange={this.hasChangeData}
          />
        )}
      </React.Fragment>
    );
  }
}
