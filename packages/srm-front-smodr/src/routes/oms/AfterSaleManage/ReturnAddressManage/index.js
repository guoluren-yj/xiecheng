import React from 'react';
import { Icon } from 'choerodon-ui';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
// import qs from 'qs';

import intl from 'utils/intl';
import { getUserOrganizationId, getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  createAddress,
  fetchAddressDetail,
  setDefault,
} from '@/services/oms/afterSaleOrderService';
import notification from 'utils/notification';
import c7nModal from '@/utils/c7nModal.js';

import { tableDs } from './ds.js';
import NewAddressModal from '../AddressModal/index';
import styles from './index.less';

const supplierTenantId = getUserOrganizationId();
@formatterCollections({
  code: ['smodr.common', 'smodr.afterSaleManage'],
})
export default class ReturnAddressManage extends React.Component {
  constructor(props) {
    super(props);
    // const { supplierCompanyId } = qs.parse(props.history.location.search.substr(1));
    this.state = {};
    this.tableDs = new DataSet(tableDs());
  }

  form;

  @Bind()
  deleteAddress(record) {
    this.tableDs.delete(record, {
      title: intl.get('smodr.afterSaleManage.view.deleteAddress').d('删除地址'),
      children: (
        <div>
          {intl.get('smodr.afterSaleManage.view.deleteAddressTip').d('确定要删除该地址吗？')}
        </div>
      ),
    });
  }

  @Bind()
  async editAddress(record) {
    let value = {};
    // const { supplierCompanyId } = record.get('supplierCompanyId');
    const data = record.toData();
    const flag = await this.form?.formDs?.validate();
    value = this.form?.formDs?.toData()[0];
    if (flag) {
      const { regionIdList = [] } = value;
      const addressValue =
        escape(value?.regionIdList[0]).indexOf('%u') < 0
          ? {
              // supplierCompanyId,
              supplierTenantId,
              ...data,
              ...value,
              regionId: regionIdList[0],
              cityId: regionIdList[1],
              districtId: regionIdList[2],
              streetId: regionIdList[3],
            }
          : {
              // supplierCompanyId,
              supplierTenantId,
              ...data,
              regionId: regionIdList[0],
              cityId: regionIdList[1],
              districtId: regionIdList[2],
              streetId: regionIdList[3],
              ...value,
            };
      createAddress(addressValue).then((res) => {
        if (res && !res.failed) {
          notification.success();
          this.tableDs.query();
          return true;
        }
      });
    } else return false;
  }

  @Bind()
  handleViewDetail(record) {
    const supplierAddressId = record.get('supplierAddressId');
    fetchAddressDetail(supplierAddressId).then((res) => {
      if (res) {
        c7nModal({
          title: intl.get('smodr.afterSaleManage.view.editAddress').d('编辑地址'),
          style: { width: '380px' },
          onOk: () => this.editAddress(record),
          okText: intl.get('hzero.common.button.save').d('保存'),
          children: <NewAddressModal onRef={this.handleRef} data={res} />,
        });
      }
    });
  }

  @Bind()
  async setDefault(record) {
    const data = record.toData();
    const res = getResponse(await setDefault(data));
    if (res) {
      this.tableDs.query();
    }
  }

  @Bind()
  renderOptions({ record }) {
    return (
      <span className="action-link">
        <Button color="primary" funcType="link" onClick={() => this.handleViewDetail(record)}>
          {intl.get('smodr.afterSaleManage.view.edit').d('编辑')}
        </Button>
        <Button color="primary" funcType="link" onClick={() => this.deleteAddress(record)}>
          {intl.get('smodr.afterSaleManage.view.delete').d('删除')}
        </Button>
        {!record.get('addressFlag') && (
          <Button color="primary" funcType="link" onClick={() => this.setDefault(record)}>
            {intl.get('smodr.afterSaleManage.view.default').d('设为默认')}
          </Button>
        )}
      </span>
    );
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = ref || {};
  }

  @Bind()
  async addAddress() {
    let value = {};
    // const { supplierCompanyId } = this.state;
    const flag = await this.form?.formDs?.validate();
    value = this.form?.formDs?.toData()[0];
    if (flag) {
      const { regionIdList = [] } = value;
      const addressValue = {
        // supplierCompanyId,
        supplierTenantId,
        regionId: regionIdList[0],
        cityId: regionIdList[1],
        districtId: regionIdList[2],
        streetId: regionIdList[3],
        ...value,
      };
      createAddress(addressValue).then((res) => {
        if (res && !res.failed) {
          notification.success();
          this.tableDs.query();
        }
      });
    } else return false;
  }

  @Bind()
  handleCreate() {
    c7nModal({
      title: intl.get('smodr.afterSaleManage.view.addAddress').d('新建地址'),
      onOk: () => this.addAddress(),
      style: { width: 380 },
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <NewAddressModal onRef={this.handleRef} />,
    });
  }

  render() {
    const columns = [
      {
        name: 'supplierCompanyName',
        width: 150,
      },
      {
        name: 'contactName',
        width: 150,
        renderer: ({ value, record }) => (
          <>
            <sapn>{value}</sapn>
            {record.get('addressFlag') && (
              <span
                className="tacitly"
                style={{
                  // background: 'rgba(54,194,207,0.10)',
                  // color: '#36C2CF',
                  marginLeft: '5px',
                  height: '18px',
                  fontWeight: '600',
                  padding: '2px 4px',
                }}
              >
                {intl.get('smodr.afterSaleManage.model.tacitly').d('默认')}
              </span>
            )}
          </>
        ),
      },
      { name: 'phoneNumber', width: 150 },
      { name: 'phone', width: 150 },
      { name: 'fullAddress', width: 150 },
      { name: 'address', width: 150 },
      { name: 'postCode', width: 150 },
      { name: 'options', width: 200, renderer: this.renderOptions },
    ];
    return (
      <div className={styles.container}>
        <Header
          title={intl.get('smodr.afterSaleManage.view.returnTitle').d('退货地址管理')}
          backPath="/s2-mall/oms/after-sale-manage"
        >
          <Button primary color="primary" onClick={() => this.handleCreate()}>
            <Icon type="add" />
            <span>{intl.get('smodr.afterSaleManage.model.newAddress').d('新建地址')}</span>
          </Button>
        </Header>
        <Content>
          <Table
            dataSet={this.tableDs}
            columns={columns}
            customizedCode="SMODR.AFTER_SALE_MANAGE.ADDRESS_MANAGE.SELECT"
          />
        </Content>
      </div>
    );
  }
}
