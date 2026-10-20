import React, { PureComponent, Fragment } from 'react';
import { isNumber, sum } from 'lodash';
import { Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import EditTable from '_components/EditTable';
import { queryRelTableConfig } from 'srm-front-sslm/lib/routes/components/DynamicTable/utils/service';
import ErpSupplierDetailDrawer from './ErpSupplierDetailDrawer';

const FormItem = Form.Item;

@formatterCollections({
  code: 'spfm.supplier',
})
export default class ErpListTable extends PureComponent {
  state = {
    modalData: {},
    tableList: [],
  };

  componentDidMount() {
    // 查询配置表
    queryRelTableConfig('sslm_external_supplier').then((res) => {
      this.setState({
        tableList: res,
      });
    });
  }

  @Bind()
  showErpDetailDrawer(data) {
    // showDialog(ErpSupplierDetailDrawer, {
    //   title: 'ERP供应商信息',
    //   width: 800,
    // }, e);
    this.setState({
      modalVisible: true,
      modalData: data,
    });
  }

  @Bind()
  closeModal() {
    this.setState({
      modalVisible: false,
    });
  }

  // /**
  //  * 计算table列宽度
  //  * @param {Array} columns 列
  //  * @param {Number} fixWidth 固定列宽度
  //  */
  // @Bind()
  // scrollWidth(columns, fixWidth) {
  //   const total = columns.reduce(
  //     (prev, current) => prev + (current.className ? 0 : current.width ? current.width : 0),
  //     0
  //   );
  //   return total + fixWidth + 1;
  // }
  render() {
    const {
      rowKey,
      rowSelection,
      handleTableChange,
      dataSource,
      loading,
      pagination,
      form: { getFieldDecorator },
      customizeTable = () => {},
      customizeForm,
      custLoading,
    } = this.props;
    const { tableList } = this.state;

    const columns = [
      {
        title: intl.get('spfm.supplier.model.supplier.erp.supplierNum').d('供应商编码'),
        width: 120,
        fixed: 'left',
        dataIndex: 'supplierNum',
        render: (v, record) => <a onClick={() => this.showErpDetailDrawer(record)}>{v}</a>,
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.supplierName').d('供应商名称'),
        width: 200,
        fixed: 'left',
        dataIndex: 'supplierName',
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.supplierTypeCode').d('供应商类型'),
        width: 120,
        dataIndex: 'supplierTypeCode',
        render: (v, record) => record.supplierTypeCodeMeaning,
      },
      {
        title: intl.get('hzero.common.date.creation').d('创建日期'),
        width: 120,
        dataIndex: 'erpCreationDate',
        render: dateRender,
      },
      {
        title: intl.get('spfm.common.model.common.externalSystemCode').d('外部系统代码'),
        width: 150,
        dataIndex: 'externalSystemCode',
      },
      {
        title: intl
          .get('spfm.supplier.model.supplier.erp.supplierUnifiedSocialCode')
          .d('统一社会信用代码'),
        width: 190,
        dataIndex: 'supplierUnifiedSocialCode',
        render: (value, record) =>
          !record.linkId ? (
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(`${record[rowKey]}#supplierUnifiedSocialCode`, {
                initialValue: record.supplierUnifiedSocialCode,
                rules: [
                  {
                    pattern: /^[A-Z0-9]{18}$/,
                    message: intl
                      .get('spfm.supplier.model.supplier.erp.unifiedSocialCodeRule')
                      .d('由18位大写字母和数字混合组成'),
                  },
                ],
              })(<Input typeCase="upper" inputChinese={false} trimAll />)}
            </FormItem>
          ) : (
            value
          ),
      },
      {
        title: intl
          .get('spfm.supplier.model.supplier.erp.organizingInstitutionCode')
          .d('组织机构代码'),
        width: 150,
        dataIndex: 'supplierOrganizingInstitutionCode',
        render: (value, record) =>
          !record.linkId ? (
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(`${record[rowKey]}#supplierOrganizingInstitutionCode`, {
                initialValue: record.supplierOrganizingInstitutionCode,
                rules: [
                  { max: 30, message: intl.get('hzero.common.validation.max', { max: 30 }) },
                  // {
                  //   pattern: /^[A-Z0-9]+$/,
                  //   message: intl
                  //     .get(`spfm.supplier.view.message.organizingInstitutionCode`)
                  //     .d('由大写字母及数字组成'),
                  // },
                ],
              })(<Input typeCase="upper" inputChinese={false} trimAll />)}
            </FormItem>
          ) : (
            value
          ),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.supplierDunsCode').d('邓白氏编码'),
        width: 120,
        dataIndex: 'supplierDunsCode',
        render: (value, record) =>
          !record.linkId ? (
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(`${record[rowKey]}#supplierDunsCode`, {
                initialValue: record.supplierDunsCode,
              })(<Input />)}
            </FormItem>
          ) : (
            value
          ),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.businessNum').d('商业注册登记号/税号'),
        width: 150,
        dataIndex: 'businessRegistrationNumber',
        render: (value, record) =>
          !record.linkId ? (
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(`${record[rowKey]}#businessRegistrationNumber`, {
                initialValue: record.businessRegistrationNumber,
              })(<Input inputChinese={false} trimAll />)}
            </FormItem>
          ) : (
            value
          ),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.idNum').d('身份证号'),
        width: 150,
        dataIndex: 'idNum',
        render: (value, record) =>
          !record.linkId ? (
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(`${record[rowKey]}#idNum`, {
                initialValue: record.idNum,
              })(<Input typeCase="upper" inputChinese={false} trimAll />)}
            </FormItem>
          ) : (
            value
          ),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.passport').d('护照'),
        width: 150,
        dataIndex: 'passport',
        render: (value, record) =>
          !record.linkId ? (
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(`${record[rowKey]}#passport`, {
                initialValue: record.passport,
              })(<Input typeCase="upper" inputChinese={false} trimAll />)}
            </FormItem>
          ) : (
            value
          ),
      },
      {
        title: intl
          .get('spfm.supplier.model.supplier.erp.externalSystemUpdateTime')
          .d('外部系统更新时间'),
        width: 120,
        dataIndex: 'erpLastUpdateDate',
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.companyNum').d('平台供应商编码'),
        width: 150,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.companyName').d('平台供应商名称'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.esSupplierCode').d('ES供应商编码'),
        width: 140,
        dataIndex: 'esSupplierCode',
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.enabledFlag').d('是否启用'),
        width: 140,
        dataIndex: 'enabledFlagMeaning',
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 180;
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_SUPPLIER',
          },
          <EditTable
            bordered
            rowSelection={rowSelection}
            loading={loading}
            rowKey={rowKey}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) =>handleTableChange(page, false)}
            scroll={{ x: scrollX, y: 'calc(100vh - 450px)' }}
          />
        )}
        {this.state.modalVisible && (
          <ErpSupplierDetailDrawer
            visible={this.state.modalVisible}
            data={this.state.modalData}
            onOk={this.closeModal}
            onCancel={this.closeModal}
            customizeTable={customizeTable}
            customizeForm={customizeForm}
            custLoading={custLoading}
            tableList={tableList}
          />
        )}
      </Fragment>
    );
  }
}
