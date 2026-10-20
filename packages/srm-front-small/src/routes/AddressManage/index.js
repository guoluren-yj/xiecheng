/**
 * EcAcquirerAddress -收单地址
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import queryString from 'querystring';
import { Tag, Icon, Tooltip, Tabs, Divider } from 'choerodon-ui';
import { DataSet, Button, Modal, Switch } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import { isArray } from 'lodash';
import { Form } from 'hzero-ui';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { openTab } from 'utils/menuTab';
import ImportButton from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentUserId, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import { FormItem, Fields } from 'components/Permission';
// import { queryIdpValue } from 'services/api';
import { batchEnableOrDsiable } from '@/services/companyAddressService.js';
import DynamicButtons from '_components/DynamicButtons';
import { observer } from 'mobx-react-lite';
import CompanyDeliveryAddress from './CompanyDeliveryAddress';

import { receiptTableDs, tableDs, formDs, optionDs } from './tableDs';
import Drawer from './Drawer';
// import CheckMoreCompanyDrawer from './checkMoreCompanyDrawer';
import style from './index.less';

const getSkuTypes = () => [
  { skuType: 'RECEIPT', skuTypeMeaning: intl.get('small.common.shipping.address').d('收货地址') },
  {
    skuType: 'ACQUIRING',
    skuTypeMeaning: intl.get('small.common.acquiring.address').d('收单地址'),
  },
];
const MenuItemLinkBtn = ({ btnComp, style: myStyle, ...btnProps }) => {
  const BtnComp = btnComp;
  return (
    <div className={style["drop-down-import-btn-wrapper"]} style={myStyle}>
      <BtnComp {...btnProps} isHeadButton={false} />
    </div>
  );
};

const { TabGroup, TabPane } = Tabs;

@withCustomize({
  unitCode: [
    'SMALL.ADDRESS_TABS.LIST',
    'SMALL.ADDRESS_MANAGE.EDITFORM',
    'SMALL.ADDRESS_MANAGE.ALL_TABLE',
    'SMALL.ADDRESS_MANAGE.COMPANY_TABLE',
    'SMALL.ADDRESS_MANAGE.PERSONAL_TABLE',
    'SMALL_ADDRESS_ACQUIRING.EDITFORM',
    'SMALL_ADDRESS_ACQUIRING.ACALL_TABLE',
    'SMALL_ADDRESS_ACQUIRING.ACCOMPANY_TABLE',
    'SMALL_ADDRESS_ACQUIRING.ACPERSONAL_TABLE',
  ],
})
@connect(({ loading, smallEcAcquirerAddress, smallCompanyDeliveryAddress }) => ({
  smallEcAcquirerAddress,
  smallCompanyDeliveryAddress,
  loading: loading.effects['smallEcAcquirerAddress/fetchEcAcquirerAddress'],
  saveLoading: loading.effects['smallEcAcquirerAddress/updateEcAcquirerAddress'],
  addLoading: loading.effects['smallEcAcquirerAddress/addEcAcquirerAddress'],
}))
@Form.create({ shelid: null })
@formatterCollections({
  code: ['small.ecAcquirerAddress', 'small.companyDeliveryAddress', 'small.common', 'entity.roles'],
})
export default class EcAcquirerAddress extends Component {
  /* 表格ds */

  acquirerAllTableDs = new DataSet(tableDs());

  acquirerComTableDs = new DataSet(tableDs());

  acquirPersTableDs = new DataSet(tableDs());

  receiptAllTableDs = new DataSet(receiptTableDs());

  receiptComTableDs = new DataSet(receiptTableDs());

  receiptPersTableDs = new DataSet(receiptTableDs());

  subTables = [];

  form;

  allForm;

  companyForm;

  skuTypes = getSkuTypes();

  searchBarRef;

  deliveryRef;

  constructor(props) {
    super(props);

    this.state = {
      tableRecord: {},
      activeKey: 'all',
      checked: false,
      shieldLoading: false,
      ids: '',
      skuType: 'RECEIPT',
      totalCount: 0,
    };
  }

  optionDs = new DataSet(optionDs());

  formDs = new DataSet(formDs({ optionsDs: this.optionDs }));

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'smallCompanyDeliveryAddress/fetchShieldStatus',
    }).then((res) => {
      if(res) {
        const { id } = res[0] || {};
        const newState = id ? {
          checked: true,
          ids: id,
        } : {
          checked: false,
        };
        this.setState(newState);
      }
    });
    this.fetchReceiptTotal();
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 收单查询
   */
  @Bind()
  async fetchEcData(params = {}) {
    const { activeKey } = this.state;
    let ds;
    let belongType;
    let customizeUnitCode;
    switch (activeKey) {
      case 'acAll':
        ds = this.acquirerAllTableDs;
        belongType = '0';
        customizeUnitCode = 'SMALL_ADDRESS_ACQUIRING.SEARCH_ALL';
        break;
      case 'acCompany':
        ds = this.acquirerComTableDs;
        belongType = '1';
        customizeUnitCode = 'SMALL_ADDRESS_ACQUIRING.SEARCH_ACQUIRING';
        break;
      case 'acPersonal':
        ds = this.acquirPersTableDs;
        belongType = '2';
        customizeUnitCode = 'SMALL_ADDRESS_ACQUIRING.SEARCH_PERSONAL';
        break;
      default:
        ds = this.acquirerAllTableDs;
        belongType = '0';
        customizeUnitCode = 'SMALL_ADDRESS_ACQUIRING.SEARCH_ALL';
        break;
    }
    if(ds) {
      ds.setQueryParameter('params', {
        belongType,
        first: params.first,
        customizeUnitCode,
        validityFlag: 0, // 有效性标示
      });
      if (ds.getState('queryStatus') === 'ready') {
        ds.query(ds.currentPage);
      }
    }
  }

  /**
   * 收货查询
   */
  @Bind()
  fetchReceiptData() {
    let ds;
    let customizeUnitCode;
    let belongType;
    switch (this.state.activeKey) {
      case 'all':
        ds = this.receiptAllTableDs;
        customizeUnitCode = 'SMALL.ADDRESS_MANAGE.SEARCH_BAR';
        belongType = null;
        break;
      case 'company':
        ds = this.receiptComTableDs;
        customizeUnitCode = 'SMALL.ADDRESS_MANAGE.COMPANY_SEARCH_BAR';
        belongType = '1';
        break;
      case 'personal':
        ds = this.receiptPersTableDs;
        customizeUnitCode = 'SMALL.ADDRESS_MANAGE.PERSONAL_SEARCH';
        belongType = '2';
        break;
      default:
        ds = this.receiptAllTableDs;
        customizeUnitCode = 'SMALL.ADDRESS_MANAGE.SEARCH_BAR';
        belongType = null;
        break;
    }
    if(ds) {
      ds.setQueryParameter('params', {
        belongType,
        customizeUnitCode,
        validityFlag: 0, // 有效性标示
      });
      if (ds.getState('queryStatus') === 'ready') {
        ds.query(ds.currentPage);
      }
    }
  }

  // 查询收货总数
  @Bind
  async fetchReceiptTotal() {
    this.receiptAllTableDs.setQueryParameter('params', {
      customizeUnitCode: 'SMALL.ADDRESS_MANAGE.SEARCH_BAR',
    });
    const res = await this.receiptAllTableDs.query();
    this.setState({ totalCount: res });
  }

  // 查询收单总数
  @Bind
  async fetchAcquirertTotal() {
    this.acquirerAllTableDs.setQueryParameter('params', {
      belongType: '0',
      customizeUnitCode: 'SMALL_ADDRESS_ACQUIRING.SEARCH_ACQUIRING',
    });
    const res = await this.acquirerAllTableDs.query();
    this.props.dispatch({
      type: 'smallEcAcquirerAddress/updateState',
      payload: {
        countList: res?.countList,
      },
    });
  }

  // 清空筛选器条件
  @Bind()
  clearParams() {
    [this.receiptAllTableDs, this.receiptComTableDs, this.receiptPersTableDs].forEach(ds => {
      if (ds.queryDataSet) {
        ds.queryDataSet.current.reset();
        ds.queryDataSet.create();
      }
    });
  }

  // 修改是否按库存组织屏蔽状态
  @Bind()
  onChange(checked) {
    const { dispatch } = this.props;
    this.setState({ shieldLoading: true });
    if(this.deliveryRef){
      this.deliveryRef.searchBarRef.handleCleanFilter();
    }
    const type = checked ? 'openShieldGroup' : 'closeShieldGroup';
    dispatch({
      type: `smallCompanyDeliveryAddress/${type}`,
      payload: checked
        ? {}
        : {
            id: this.state.ids,
          },
    }).then(res => {
      if (!res?.failed) {
        this.setState({ checked, shieldLoading: false, ids: res.id });
        this.clearParams();
        this.fetchReceiptData();
        this.fetchReceiptTotal();
      }
    });
  }

  /**
   * 收单保存数据
   */
  @Bind()
  handleSaveData(data = {}) {
    const { dispatch } = this.props;
    const { activeKey } = this.state;
    const { objectVersionNumber } = data;
    const params = {
      ...data,
      ownedBy: activeKey === 'comAcquireAddress' ? -1 : getCurrentUserId(),
    };
    if (objectVersionNumber) {
      dispatch({
        type: 'smallEcAcquirerAddress/updateEcAcquirerAddress',
        payload: data,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchEcData();
          this.handleCancel();
        }
      });
    } else {
      dispatch({
        type: 'smallEcAcquirerAddress/addEcAcquirerAddress',
        payload: params,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchEcData();
          this.fetchAcquirertTotal();
          this.handleCancel();
        }
      });
    }
  }

  /**
   * 详细地址拼接
   */
  @Bind()
  handleFullAdress(region, address) {
    const { tableRecord = {} } = this.state;
    if (!isArray(region)) {
      const regionNameList = tableRecord.regionNameList || [];
      return `${regionNameList.join('')}${address}`;
    }
    return `${region.map(r => (r.countryFlag ? '' : r.regionName)).join('')}${address}`; // countryList中的数据不拼接
  }

  @Bind()
  async onOk() {
    const { tableRecord = {} } = this.state;
    const validateFlag = await this.formDs.validate();
    const data = this.formDs.current.toData();
    const { region, address } = data;
    if (!validateFlag) return false;
    this.handleSaveData({
      // ...tableRecord,
      ...data,
      regionId: isArray(region) ? region[region.length - 1].regionId : tableRecord.regionId,
      objectVersionNumber: tableRecord.objectVersionNumber || null,
      fullAddress: this.handleFullAdress(region, address),
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
      title: intl.get(`small.common.view.acquireAddress`).d('收单地址'),
      className: style['address-drawer'],
      drawer: true,
      style: { width: 380 },
      key: 'acquireAddress',
      okText: intl.get('small.common.modal.button.save').d('保存'),
      onOk: () => this.onOk(),
      afterClose: () => this.formDs.removeAll(),
      children: <Drawer customizeForm={this.props.customizeForm} formDs={this.formDs} optionDs={this.optionDs} />,
    });
  }

  /**
   * 取消
   */
  @Bind()
  handleCancel() {
    this.setState({
      tableRecord: {},
    });
  }

  // tab切换
  @Bind
  checkoutTab = key => {
    if (!key.includes('ac') && this.searchBarRef) {
      this.searchBarRef.handleCleanFilter();
    }
    if (key.includes('ac') && !this.acquirerAllTableDs.queryDataSet) {
      this.fetchAcquirertTotal();
    }
    this.setState(
      {
        activeKey: key,
        skuType: key.includes('ac') ? 'ACQUIRING' : 'RECEIPT',
      },
      () => {
        if (key.includes('ac')) {
          this.fetchEcData();
        } else {
          this.fetchReceiptData();
        }
      }
    );
  };

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

  // 获取当前使用ds
  getCurrentDS() {
    let ds;
    switch (this.state.activeKey) {
      case 'all':
        ds = this.receiptAllTableDs;
        break;
      case 'company':
        ds = this.receiptComTableDs;
        break;
      case 'personal':
        ds = this.receiptPersTableDs;
        break;
      case 'acAll':
        ds = this.acquirerAllTableDs;
        break;
      case 'acCompany':
        ds = this.acquirerComTableDs;
        break;
      case 'acPersonal':
        ds = this.acquirPersTableDs;
        break;
      default:
        ds = this.receiptAllTableDs;
        break;
    }
    return ds;
  }

  // 批量启用禁用
  handleBatchEnableOrDisable(type) {
    const ds = this.getCurrentDS();
    const list = ds.selected.map(i => i.toData());

    const newList = list.map(item => {
      return { ...item, enabledFlag: type === 'disable' ? 0 : 1 };
    });
    batchEnableOrDsiable(newList).then(res => {
      if (res && res.failed) {
        notification.error({ message: res.message });
      } else {
        notification.success();
        ds.clearCachedSelected(); // 清除缓存的选中记录
        ds.unSelectAll(); // 取消全选当前页
      }
      ds.query();
    });
  }

  custTabRender = (_, { firstRenderHiddenKeys: hiddenKeys = [] } = {}, typeListMapping) => {
    const newState = {};
    if (hiddenKeys.includes('all')) {
      const { name } = typeListMapping.RECEIPT.find(p => !hiddenKeys.includes(p.name)) || {};
      if(name){
        newState.skuType='all';
        newState.activeKey= name;
      }else if(hiddenKeys.includes('acAll')){
        const { name: _name } = typeListMapping.ACQUIRING.find(p => !hiddenKeys.includes(p.name)) || {};
        if(name){
          newState.skuType='acAll';
          newState.activeKey= _name;
        }
      }
    }
    this.setState(newState);
  };

  render() {
    const {
      smallEcAcquirerAddress: { countList = {} },
      match: { path = '' },
      form,
      customizeTabPane,
      customizeTable,
    } = this.props;

    const { invoiceAllNum, invoiceCompanyNum, invoicePersonalNum } = countList;

    const addressHeaderList = [
      {
        name: 'all',
        value: intl.get('small.common.all.address').d('全部'),
        num: invoiceAllNum,
        ds: this.acquirerAllTableDs,
      },
      {
        name: 'company',
        value: intl.get('small.common.company.address').d('公司'),
        num: invoiceCompanyNum,
        ds: this.acquirerComTableDs,
      },
      {
        name: 'personal',
        value: intl.get('small.common.person.address').d('个人'),
        num: invoicePersonalNum,
        ds: this.acquirPersTableDs,
      },
    ];
    const acAddressHeaderList = [
      {
        name: 'acAll',
        value: intl.get('small.common.all.address').d('全部'),
        num: invoiceAllNum,
        ds: this.acquirerAllTableDs,
      },
      {
        name: 'acCompany',
        value: intl.get('small.common.company.address').d('公司'),
        num: invoiceCompanyNum,
        ds: this.acquirerComTableDs,
      },
      {
        name: 'acPersonal',
        value: intl.get('small.common.person.address').d('个人'),
        num: invoicePersonalNum,
        ds: this.acquirPersTableDs,
      },
    ];
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

    const { checked, shieldLoading, skuType, totalCount } = this.state;
    const acColumns = [
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
        width: 170,
        name: 'companyName',
      },
      {
        width: 100,
        name: 'contactName',
      },
      {
        width: 150,
        name: 'mobile',
        renderer: ({ value: val, record }) =>
          record.get('internationalTelCodeMeaning')
            ? `${record.get('internationalTelCodeMeaning')}|${val}`
            : val,
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
      },
      {
        width: 70,
        name: 'defaultFlag',
        align: 'left',
        renderer: ({ value }) => (
          defaultReadOnly(value)
        ),
      },
      {
        name: 'remark',
      },
      {
        width: 180,
        lock: 'right',
        name: 'edit',
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          const defaultFlag = record.get('defaultFlag');
          return (
            <span className={style["action-link"]}>
              <Button
                funcType='link'
                onClick={() =>
                  this.handleSaveData({ ...record.data, enabledFlag: enabledFlag ? 0 : 1 })
                }
                disabled={defaultFlag === 1}
              >
                {enabledFlag
                  ? intl.get('hzero.common.button.disabled').d('禁用')
                  : intl.get('hzero.common.enable').d('启用')}
              </Button>
              <Button
                funcType='link'
                onClick={() =>
                  this.handleSaveData({ ...record.data, defaultFlag: defaultFlag ? 0 : 1 })
                }
                disabled={enabledFlag === 0 || !record.get('validFlag')}
              >
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
    const acAllColumns = [
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
        width: 170,
        name: 'belongTypeMeaning',
      },
      {
        width: 170,
        name: 'companyName',
      },
      {
        width: 100,
        name: 'contactName',
      },
      {
        width: 150,
        name: 'mobile',
        renderer: ({ value: val, record }) =>
          record.get('internationalTelCodeMeaning')
            ? `${record.get('internationalTelCodeMeaning')}|${val}`
            : val,
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
      },
      {
        width: 70,
        name: 'defaultFlag',
        align: 'left',
        renderer: ({ value }) => (
          defaultReadOnly(value)
        ),
      },
      {
        name: 'remark',
      },
      {
        width: 180,
        lock: 'right',
        name: 'edit',
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          const defaultFlag = record.get('defaultFlag');
          return (
            <span className={style["action-link"]}>
              <Button
                funcType='link'
                onClick={() =>
                  this.handleSaveData({ ...record.data, enabledFlag: enabledFlag ? 0 : 1 })
                }
                disabled={defaultFlag === 1}
              >
                {enabledFlag
                  ? intl.get('hzero.common.button.disabled').d('禁用')
                  : intl.get('hzero.common.enable').d('启用')}
              </Button>
              <Button
                funcType='link'
                onClick={() =>
                  this.handleSaveData({ ...record.data, defaultFlag: defaultFlag ? 0 : 1 })
                }
                disabled={enabledFlag === 0 || !record.get('validFlag')}
              >
                {defaultFlag
                  ? intl.get('small.common.model.default.cancel').d('取消默认')
                  : intl.get('small.common.model.default.set').d('设为默认')}
              </Button>
              <Button
                funcType='link'
                onClick={() => {
                  this.handleEditData(record.data);
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
      acAll: acAllColumns,
      acCompany: acColumns,
      acPersonal: acColumns,
    };
    const getExportParams = ()=>{
      const params = (this.getCurrentDS().current && this.getCurrentDS().queryDataSet.current.toJSONData()) || {};
      delete params.__dirty;
      delete params.__id;
      delete params._status;
      const addressIdList = this.getCurrentDS()?.selected?.map(s=>s?.get('addressId')) || [];
      return {
        activeKey: this.state.activeKey,
        addressIdList,
        ...filterNullValueObject(this.getCurrentDS()?.queryParameter?.params),
        ...filterNullValueObject(params),
        validityFlag: 0,
      };
    };
    const disabledBatch = (ds)=> ds.selected.some(d=>d.get('defaultFlag') === 1) || ds.selected.length < 1;
    const BatchBtn = observer(({ ds })=>{
      return (
        <Tooltip
          placement="bottom"
          title={ds.selected.length < 1 ?
            intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据') :
            intl.get('small.common.view.batchDefaultTip').d('默认地址不可进行批量操作')}
        >
          <Button icon='settings' funcType='flat' disabled>
            {intl.get('small.common.view.batchOperate').d('批量操作')}
          </Button>
        </Tooltip>
        );
    });
    const batchButtons = [
      {
        name: 'batch',
        group: true,
        child: ()=>(
          <Button icon='settings' funcType='flat'>
            {intl.get('small.common.view.batchOperate').d('批量操作')}
            <Icon
              type="expand_more"
              style={{
            marginLeft: 4,
            marginTop: -2,
            fontSize: '16px',
          }}
            />
          </Button>
        ),
        observerBtnProps: ()=>({
          disabled: disabledBatch(this.getCurrentDS()),
          hidden: !((this.state.activeKey.includes('ac') || this.state.activeKey === 'company') && !disabledBatch(this.getCurrentDS())),
        }),
        children: [
          {
            name: 'batchEnabled',
            btnType: 'c7n-pro',
            child: intl.get('small.common.button.enableBatch').d('批量启用'),
            observerBtnProps: ()=>({
              funcType: 'flat',
              disabled: disabledBatch(this.getCurrentDS()),
              waitType: 'debounce',
              onClick: () => this.handleBatchEnableOrDisable('enable'),
            }),
          },
          {
            name: 'batchDisabled',
            btnType: 'c7n-pro',
            child: intl.get('small.common.button.disableBatch').d('批量禁用'),
            observerBtnProps: ()=>({
              funcType: 'flat',
              waitType: 'debounce',
              disabled: disabledBatch(this.getCurrentDS()),
              onClick: () => this.handleBatchEnableOrDisable('disable'),
            }),
          },
        ],
      },
      {
        name: 'batchTip',
        btnComp: ()=>(<BatchBtn ds={this.getCurrentDS()} />),
        observerBtnProps: ()=>({
          funcType: 'flat',
          hidden: !((this.state.activeKey.includes('ac') || this.state.activeKey === 'company') && disabledBatch(this.getCurrentDS())),
        }),
      },
    ];

    const buttons = {
      'ACQUIRING': [
        {
          name: 'add',
          group: true,
          child: (
            <Button icon="add" color="primary">
              {intl.get('small.common.acquiring.address.create').d('新建收单地址')}
              <Icon
                type="expand_more"
                style={{
                        marginLeft: 4,
                        marginTop: -2,
                        fontSize: '16px',
                      }}
              />
            </Button>),
          children: [
            {
              name: 'manualAcCreate',
              child: intl.get('small.common.model.manualCreation').d('手工新建'),
              btnProps: {
                onClick: this.handleCreateData,
              },
            },
            {
              name: 'acImport',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                btnComp: ImportButton,
                prefixPatch: "/smal",
                refreshButton: true,
                businessObjectTemplateCode: "SRM_SMAL_INVOICE_ADDRESS_IMPORT",
                buttonText: intl.get('small.common.button.importNew').d('(新)导入'),
                successCallBack: () => this.fetchEcData(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
              },
            },
          ],
        },
        ...batchButtons,
        {
          name: 'acExport',
          btnComp: ()=> (
            <ExcelExportPro
              templateCode="SMAL.ACQUIRING_ADDRESS_EXPORT"
              exportAsync
              method="POST"
              allBody
              buttonText={!this.getCurrentDS().selected.length ?
                intl.get('small.common.button.exportNew').d('(新)导出') : intl.get('small.common.button.selectExportNew').d('勾选导出')}
              requestUrl={`/smal/v1/${getCurrentOrganizationId()}/addresss/invoice/export`}
              otherButtonProps={{
                type: 'c7n-pro',
                funcType: 'flat',
                icon: 'unarchive',
              }}
              queryParams={getExportParams}
            />
          ),
        },
      ],
      'RECEIPT': [
        {
          name: 'add',
          group: true,
          hidden: this.state.activeKey === 'personal',
          child: (
            <Button icon="add" color="primary">
              {intl.get('hzero.common.button.create').d('新建')}
              {intl.get(`small.common.view.deliveryAddress`).d('收货地址')}
              <Icon
                type="expand_more"
                style={{
                        marginLeft: 4,
                        marginTop: -2,
                        fontSize: '16px',
                      }}
              />
            </Button>),
          children: [
            {
              name: 'manualCreate',
              child: intl.get('small.common.model.manualCreation').d('手工新建'),
              btnProps: {
                onClick: ()=>{
                  if(this.deliveryRef) {
                    this.deliveryRef.handleCreateData();
                  }
                },
              },
            },
            {
              name: 'reImport',
              child: intl.get('small.common.button.import').d('导入'),
              btnProps: {
                funcType: "flat",
                onClick: this.handleImport,
              },
            },
            {
              name: 'reNewImport',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                btnComp: ImportButton,
                prefixPatch: "/smal",
                refreshButton: true,
                businessObjectTemplateCode: "SMAL.RECEIVE_ADDRESS_IMPORT",
                buttonText: intl.get('small.common.button.importNew').d('(新)导入'),
                successCallBack: () => this.fetchReceiptData(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
              },
            },
          ],
        },
        ...batchButtons,
        {
          name: 'reExport',
          btnComp: ()=> (
            <ExcelExportPro
              templateCode="SMAL.RECEIVE_ADDRESS_EXPORT"
              exportAsync
              method="POST"
              allBody
              buttonText={!this.getCurrentDS().selected.length ?
                intl.get('small.common.button.exportNew').d('(新)导出') : intl.get('small.common.button.selectExportNew').d('勾选导出')}
              requestUrl={`/smal/v1/${getCurrentOrganizationId()}/addresss/receiver/export`}
              queryParams={getExportParams}
              otherButtonProps={{
                type: 'c7n-pro',
                funcType: 'flat',
                icon: 'unarchive',
                permissionList: [
                  {
                    code: `${path}.button.receiver.export-new`,
                    type: 'button',
                    meaning: '收货地址-(新)导出',
                  },
                ],
              }}
            />
          ),
        },
      ],
    };

    return (
      <React.Fragment>
        <Header title={intl.get('small.common.address.manage').d('地址管理')}>
          <DynamicButtons
            buttons={buttons[skuType]}
            defaultBtnType="c7n-pro"
            permissions={[
              { name: 'manualAcCreate', code: `${path}.button.create` },
              { name: 'reImport', code: 'small.address-manage.address.button.import' },
            ]}
          />
          {skuType === 'RECEIPT' && (
            <Fields>
              <FormItem
                label=""
                permissionList={[
                  {
                    code: `${path}.fields.shield`,
                    type: 'fields',
                    meaning: '按inv屏蔽',
                  },
                ]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                {form.getFieldDecorator('shield', {
                  initialValue: false,
                })(
                  <div
                    className="inv"
                    style={{
                      color: '#4e5769',
                      height: '32px',
                      lineHeight: '32px',
                    }}
                  >
                    <Divider type="vertical" style={{ margin: '0 16px 0 0', position: 'relative', top: '-1px'}} />
                    {intl.get('small.common.button.openShield').d('按inv屏蔽')}
                    <Tooltip
                      placement="bottom"
                      title={intl
                        .get('small.common.description')
                        .d('开启后,按照子账户库存组织权限屏蔽对应的地址信息')}
                    >
                      <Icon type="help" style={{ color: '#868d9c', fontSize: '14px', margin: '0 4px', position: 'relative', top: '-2px' }} />:
                    </Tooltip>
                    <Switch
                      checked={checked}
                      defaultChecked={checked}
                      onChange={this.onChange}
                      loading={shieldLoading}
                      style={{ marginLeft: '8px' }}
                      className={style["header-switch"]}
                    />
                  </div>
                )}
              </FormItem>
            </Fields>
          )}
        </Header>
        <Content>
          {customizeTabPane(
            {
              code: 'SMALL.ADDRESS_TABS.LIST',
              cascade: true,
              custDefaultActive: (key, params) =>
                this.custTabRender(key, params, {
                  RECEIPT: addressHeaderList,
                  ACQUIRING: acAddressHeaderList,
                }),
            },
            <Tabs animated={false} activeKey={this.state.activeKey} onChange={this.checkoutTab}>
              {this.skuTypes.map(m => (
                <TabGroup tab={m.skuTypeMeaning} key={m.skuType}>
                  {/* 收单地址 */}
                  {m.skuType !== 'RECEIPT'
                    ? acAddressHeaderList.map(val => {
                        return (
                          // eslint-disable-next-line react/no-array-index-key
                          <TabPane tab={val.value} key={val.name} count={val.num}>
                            <div style={{ height: 'calc(100vh - 260px)' }}>
                              {customizeTable(
                                {
                                  code: `SMALL_ADDRESS_ACQUIRING.${val?.name?.toUpperCase()}_TABLE`,
                                },
                                <SearchBarTable
                                  searchCode={
                                    val.name === 'acAll'
                                      ? 'SMALL_ADDRESS_ACQUIRING.SEARCH_ALL'
                                      : val.name === 'acPersonal'
                                      ? 'SMALL_ADDRESS_ACQUIRING.SEARCH_PERSONAL'
                                      : 'SMALL_ADDRESS_ACQUIRING.SEARCH_ACQUIRING'
                                  }
                                  customizedCode="SMALL_ADDRESS_ACQUIRING_LIST"
                                  searchBarRef={ref => {
                                    this.searchBarRef = ref;
                                  }}
                                  dataSet={val.ds}
                                  columns={columnsObj[(val?.name)]}
                                  style={{ maxHeight: `calc(100% - 22px)` }}
                                />
                              )}
                            </div>
                          </TabPane>
                        );
                      })
                    : addressHeaderList.map((val, idx) => {
                        let key;
                        let ds;
                        let searchCode;
                        switch (idx) {
                          case 0:
                            key = 'allAddressSize';
                            ds = this.receiptAllTableDs;
                            searchCode = 'SMALL.ADDRESS_MANAGE.SEARCH_BAR';
                            break;
                          case 1:
                            key = 'companyAddressSize';
                            ds = this.receiptComTableDs;
                            searchCode = 'SMALL.ADDRESS_MANAGE.COMPANY_SEARCH_BAR';
                            break;
                          case 2:
                            key = 'personalAddressSize';
                            ds = this.receiptPersTableDs;
                            searchCode = 'SMALL.ADDRESS_MANAGE.PERSONAL_SEARCH';
                            break;
                          default:
                            break;
                        }
                        // 收货地址
                        return (
                          <TabPane key={val.name} tab={val.value} count={totalCount[key]}>
                            <CompanyDeliveryAddress
                              onRef={ref => {
                                this.deliveryRef = ref;
                              }}
                              customizeForm={this.props.customizeForm}
                              type={val.name}
                              ds={ds}
                              searchCode={searchCode}
                              path={this.props.match.path}
                              fetchEcData={this.fetchReceiptData}
                              fetchReceiptTotal={this.fetchReceiptTotal}
                              customizeTable={customizeTable}
                            />
                          </TabPane>
                        );
                      })}
                </TabGroup>
              ))}
            </Tabs>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
