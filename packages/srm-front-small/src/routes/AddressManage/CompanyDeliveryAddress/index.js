/**
 * CompanyDeliveryAddress -收货地址
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import { isFunction, isArray } from 'lodash';
import { connect } from 'dva';
import { Tag, Tooltip} from 'choerodon-ui';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';

import SearchBarTable from '_components/SearchBarTable';
import { openTab } from 'utils/menuTab';
import { getCurrentUserId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import { formDs, optionDs } from './tableDs';
import Drawers from './Drawers';
import style from '../index.less';

@formatterCollections({
  code: [
    'small.ecAcquirerAddress',
    'small.companyDeliveryAddress',
    'entity.company',
    'entity.roles',
    'small.common',
  ],
})
@connect(({ loading, smallEcAcquirerAddress, smallCompanyDeliveryAddress }) => ({
  smallEcAcquirerAddress,
  smallCompanyDeliveryAddress,
  loading: loading.effects['smallCompanyDeliveryAddress/fetchCompanyDeliveryAddress'],
  saveLoading: loading.effects['smallCompanyDeliveryAddress/updateCompanyDeliveryAddress'],
  addLoading: loading.effects['smallCompanyDeliveryAddress/addCompanyDeliveryAddress'],
}))
export default class CompanyDeliveryAddress extends Component {
  form;

  searchBarRef;

  // tableDs = new DataSet(tableDs());

  optionDs = new DataSet(optionDs());

  formDs = new DataSet(formDs({ optionsDs: this.optionDs }));

  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      tableRecord: {},
    };
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 保存数据
   */
  @Bind()
  handleSaveData(data = {}) {
    const { dispatch } = this.props;
    const { objectVersionNumber } = data;
    const userId = getCurrentUserId();
    if (objectVersionNumber) {
      dispatch({
        type: 'smallCompanyDeliveryAddress/updateCompanyDeliveryAddress',
        payload: data,
      }).then((res) => {
        if (res) {
          notification.success();
          this.props.fetchEcData();
          this.handleCancel();
        }
      });
    } else {
      dispatch({
        type: 'smallCompanyDeliveryAddress/addCompanyDeliveryAddress',
        payload: { ...data, ownedBy: userId, defaultFlag: 0 },
      }).then((res) => {
        if (res) {
          notification.success();
          this.props.fetchEcData();
          this.props.fetchReceiptTotal();
          this.handleCancel();
        }
      });
    }
  }

  /**
   * 详细地址拼接
   */
  @Bind()
  handleFullAdress(address, region) {
    const { tableRecord = {} } = this.state;
    if (!isArray(region)) {
      const regionNameList = tableRecord.regionNameList || [];
      return `${regionNameList.join('')}${address}`;
    }
    return `${region.map((r) => (r.countryFlag ? '' : r.regionName)).join('')}${address}`; // 处理fulladdress 从region取
  }

  @Bind()
  async onOk() {
    const { tableRecord = {} } = this.state;
    const validateFlag = await this.formDs.validate();
    const data = this.formDs.toJSONData()?.[0];
    const { region, address } = data;
    if (!validateFlag) return false;
    this.handleSaveData({
      enabledFlag: 1,
      defaultFlag: 0,
      // ...tableRecord,
      ...data,
      belongType: 1, // 1为公司2为个人
      regionId: isArray(region) ? region[region.length - 1].regionId : tableRecord.regionId,
      objectVersionNumber: tableRecord.objectVersionNumber || null,
      fullAddress: this.handleFullAdress(address, region),
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreateData() {
    this.handleEditData({});
  }

  /**
   * 编辑
   */
  @Bind()
  handleEditData(record = {}) {
    this.setState({
      tableRecord: record,
    });
     // 地址失效 清空地址
     const { validFlag } = record;
     if (!validFlag) {
       const newRecord = {
         ...record,
         regionIdList: [],
         regionCodeList: [],
         regionNameList: [],
         validFlag: 1,
       };
       this.formDs.create(newRecord);
     }else{
       this.formDs.create(record);
     }
    Modal.open({
      title: intl.get(`small.companyDeliveryAddress.view.comAddress.title`).d('收货地址'),
      drawer: true,
      style: { width: 380 },
      key: 'companyDeliveryAddress',
      okText: intl.get('small.common.modal.button.save').d('保存'),
      onOk: () => this.onOk(),
      afterClose: () => this.formDs.removeAll(),
      children: (
        <Drawers
          customizeForm={this.props.customizeForm}
          formDs={this.formDs}
          optionDs={this.optionDs}
        />
      ),
    });
  }

  @Bind()
  handleEnableAction(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'smallCompanyDeliveryAddress/updateCompanyDeliveryAddress',
      payload: { ...record, enabledFlag: record.enabledFlag === 1 ? 0 : 1 },
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.fetchEcData();
      }
    });
  }

  @Bind()
  handleDefaultAction(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'smallCompanyDeliveryAddress/updateCompanyDeliveryAddress',
      payload: { ...record, defaultFlag: record.defaultFlag === 1 ? 0 : 1 },
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.fetchEcData();
      }
    });
  }

  /**
   * 取消
   */
  @Bind()
  handleCancel() {
    this.setState({
      // visible: false,
      tableRecord: {},
    });
  }

  @Bind()
  handleImport() {
    openTab({
      key: `/small/data-import/SMAL.RECEIVE_ADDRESS_IMPORT`,
      title: 'hzero.common.button.import',
      search: queryString.stringify({
        action: 'hzero.common.button.import',
        backPath: `/small/address-manage`,
      }),
    });
  }

  render() {
    const defaultReadOnly = (value)=>{
      const result = {};
      switch(+value){
        case 1:
          result.bgColor = '#179454';
          result.text = intl.get('small.common.model.yes').d('是');
          break;
        default:
          result.bgColor = '#E64322';
          result.text = intl.get('small.common.model.no').d('否');
      }
      return (
        <span>
          <span style={{
            backgroundColor: result.bgColor,
            width: 6,
            height: 6,
            display: 'inline-block',
            borderRadius: '50%',
            margin: '0 8px 1px 0' }}
          />
          <span>{result.text}</span>
        </span>
      );
    };

    const allColumns = [
       {
        width: 85,
        name: 'enabledFlag',
        align: 'left',
        renderer: ({ record }) => (
          <Tag
            color={record.get('enabledFlag') ? 'green' : 'red'}
            border={false}
          >
            {record.get('enabledFlag')
              ? intl.get('hzero.common.enable').d('启用')
              : intl.get('hzero.common.button.disabled').d('禁用')}
          </Tag>
        ),
      },
      {
        width: 85,
        name: 'belongTypeMeaning',
      },
      {
        width: 100,
        name: 'loginName',
      },
      {
        width: 100,
        name: 'contactName',
      },
      {
        name: 'mobile',
        width: 150,
        renderer: ({ value: val, record }) =>
          record.get('internationalTelCodeMeaning')
            ? `${record.get('internationalTelCodeMeaning')}|${val}`
            : val,
      },
      {
        name: 'phone',
        width: 150,
      },
      {
        width: 170,
        name: 'email',
      },
      {
        width: 200,
        name: 'regionName',
        renderer: ({ record }) => {
          const { regionNameList = [], validFlag } = record.get(['regionNameList', 'validFlag']);
          return validFlag ? (
            <>
              <span className="address" title={regionNameList.join('')}>
                {regionNameList.join('')}
              </span>
            </>
          ) : (
            <>
              {' '}
              <Tooltip
                placement="bottom"
                title={intl
                  .get('small.common.view.addressLibraryUpgradeAddressIsNoValid')
                  .d('地址库已升级，该地址已经不存在')}
              >
                <span className={[style['disabled-tips'], 'address']}>
                  {regionNameList.join('')}
                </span>
              </Tooltip>
            </>
          );
        },
      },
      {
        width: 170,
        name: 'address',
        renderer: ({ record }) => {
          return <span title={record.get('address')}>{record.get('address')}</span>;
        },
      },
      {
        width: 150,
        name: 'zip',
      },
      {
        width: 180,
        name: 'companyName',
      },
      {
        width: 140,
        name: 'invOrganizationName',
      },
      {
        width: 140,
        name: 'inventoryName',
      },
      {
        name: 'remark',
        width: 80,
      },
    ];
    const personColumns = [
       {
        width: 85,
        name: 'enabledFlag',
        align: 'left',
        renderer: ({ record }) => (
          <Tag
            color={record.get('enabledFlag') ? 'green' : 'red'}
            border={false}
          >
            {record.get('enabledFlag')
              ? intl.get('hzero.common.enable').d('启用')
              : intl.get('hzero.common.button.disabled').d('禁用')}
          </Tag>
        ),
      },
      {
        width: 100,
        name: 'loginName',
      },
      {
        width: 100,
        name: 'contactName',
      },
      {
        name: 'mobile',
        width: 150,
        renderer: ({ value: val, record }) =>
          record.get('internationalTelCodeMeaning')
            ? `${record.get('internationalTelCodeMeaning')}|${val}`
            : val,
      },
      {
        name: 'phone',
        width: 150,
      },
      {
        width: 170,
        name: 'email',
      },
      {
        width: 200,
        name: 'regionName',
        renderer: ({ record }) => {
          const { regionNameList = [], validFlag } = record.get(['regionNameList', 'validFlag']);
          return validFlag ? (
            <>
              <span className="address" title={regionNameList.join('')}>
                {regionNameList.join('')}
              </span>
            </>
          ) : (
            <>
              {' '}
              <Tooltip
                placement="bottom"
                title={intl
                  .get('small.common.view.addressLibraryUpgradeAddressIsNoValid')
                  .d('地址库已升级，该地址已经不存在')}
              >
                <span className={[style['disabled-tips'], 'address']}>
                  {regionNameList.join('')}
                </span>
              </Tooltip>
            </>
          );
        },
      },
      {
        width: 170,
        name: 'address',
        renderer: ({ record }) => {
          return <span title={record.get('address')}>{record.get('address')}</span>;
        },
      },
      {
        width: 150,
        name: 'zip',
      },
      {
        name: 'remark',
        width: 80,
      },
    ];
    const companyColumns = [
      {
        width: 85,
        name: 'enabledFlag',
        align: 'left',
        renderer: ({ record }) => (
          <Tag
            color={record.get('enabledFlag') ? 'green' : 'red'}
            border={false}
          >
            {record.get('enabledFlag')
              ? intl.get('hzero.common.enable').d('启用')
              : intl.get('hzero.common.button.disabled').d('禁用')}
          </Tag>
        ),
      },
      {
        width: 180,
        name: 'companyName',
      },
      {
        width: 140,
        name: 'invOrganizationName',
      },
      {
        width: 140,
        name: 'inventoryName',
      },
      {
        width: 100,
        name: 'loginName',
      },
      {
        width: 100,
        name: 'contactName',
      },
      {
        name: 'mobile',
        width: 150,
        renderer: ({ value: val, record }) =>
          record.get('internationalTelCodeMeaning')
            ? `${record.get('internationalTelCodeMeaning')}|${val}`
            : val,
      },
      {
        name: 'phone',
        width: 150,
      },
      {
        width: 170,
        name: 'email',
      },
      {
        width: 200,
        name: 'regionName',
        renderer: ({ record }) => {
          const { regionNameList = [], validFlag } = record.get(['regionNameList', 'validFlag']);
          return validFlag ? (
            <>
              <span className="address" title={regionNameList.join('')}>
                {regionNameList.join('')}
              </span>
            </>
          ) : (
            <>
              {' '}
              <Tooltip
                placement="bottom"
                title={intl
                  .get('small.common.view.addressLibraryUpgradeAddressIsNoValid')
                  .d('地址库已升级，该地址已经不存在')}
              >
                <span className={[style['disabled-tips'], 'address']}>
                  {regionNameList.join('')}
                </span>
              </Tooltip>
            </>
          );
        },
      },
      {
        width: 170,
        name: 'address',
        renderer: ({ record }) => {
          return <span title={record.get('address')}>{record.get('address')}</span>;
        },
      },
      {
        width: 150,
        name: 'zip',
      },
      {
        name: 'remark',
        width: 80,
      },
      {
        width: 90,
        align: 'left',
        name: 'defaultFlag',
        renderer: ({ value }) => defaultReadOnly(value),
      },
      {
        width: 180,
        name: 'edit',
        lock: 'right',
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          const defaultFlag = record.get('defaultFlag');
          return (
            <span className={style["action-link"]}>
              <Button funcType='link' onClick={() => this.handleEnableAction(record.data)} disabled={defaultFlag === 1}>
                {enabledFlag
                  ? intl.get('hzero.common.button.disabled').d('禁用')
                  : intl.get('hzero.common.enable').d('启用')}
              </Button>
              <Button funcType='link' onClick={() => this.handleDefaultAction(record.data)} disabled={enabledFlag === 0 || !record.get('validFlag')}>
                {defaultFlag
                  ? intl.get('small.common.model.default.cancel').d('取消默认')
                  : intl.get('small.common.model.default.set').d('设为默认')}
              </Button>
              <Button
                funcType='link'
                onClick={() => {
                  this.handleEditData(record.toData());
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
            </span>
          );
        },
      },
    ];
    const columnsObj = {
      all: allColumns,
      company: companyColumns,
      personal: personColumns,
      acAll: allColumns,
      acCompany: companyColumns,
      acPersonal: personColumns,
    };

    const { customizeTable } = this.props;
    return (
      <React.Fragment>
        <div style={{ height: 'calc(100vh - 260px)' }}>
          {customizeTable(
            {
              code: `SMALL.ADDRESS_MANAGE.${this.props.type?.toUpperCase()}_TABLE`,
            },
            <SearchBarTable
              searchCode={this.props.searchCode}
              searchBarRef={ref => {
                this.searchBarRef = ref;
              }}
              dataSet={this.props.ds}
              customizedCode={`SMALL_${this.props.type?.toUpperCase()}_ADDRESS_DELIVERY_LIST`}
              columns={columnsObj[this.props.type]}
              style={{ maxHeight: `calc(100% - 22px)` }}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}
