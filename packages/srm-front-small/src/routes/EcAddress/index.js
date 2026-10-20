import React, { Component } from 'react';
import { Breadcrumb, Icon, Tag } from 'choerodon-ui';
import { Table, DataSet, Button, Tooltip} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import { toJS } from 'mobx';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { fetchCountryList, fetchVersion, setPermissionSetEnable} from '@/services/ecAddressManageService';
import SelectFilter from '@/components/SelectFilter/index.js';
import { openTipsModal } from '@/modals';

import { tableDs, treeDs } from './ds.js';
import TreeList from './TreeList';
import styles from './index.less';

@formatterCollections({
  code: ['small.ecAddressManage', 'small.common'],
})
@withRouter
export default class EcAddress extends Component {
  constructor(props) {
    super(props);
    const versionId = this.props?.location?.state?.versionId;
    const versionCode = this.props?.location?.state?.versionCode;
    this.state = {
      allList: [],
      selectList: [],
      list: [],
      versionVal: versionId,
      versionId,
      versionCode,
      isLoad: true,
    };
  }

  tableDS = new DataSet(tableDs());

  treeDS = new DataSet(treeDs());

  ds = new DataSet({
    autoCreate: true,
    fields: [{ name: 'versionCode' }],
  });

  componentDidMount() {
    this.fetchVersionList();
    this.fetchCountry();
  }

  @Bind()
  async fetchVersionList() {
    const { versionId } = this.state;
    const res = getResponse(await fetchVersion({ enabledFlag: 1 }));
    const newRes = res?.content?.map((i) => ({
      ...i,
      title: i.versionCode,
      value: i.versionId,
      key: i.versionId,
    }));
    if (res) {
      this.setState({ list: newRes, versionVal: versionId || res.content?.[0]?.versionId }, () => {
        this.fetchAddList();
      });
    }
  }

  @Bind()
  async fetchCountry() {
    const res = getResponse(await fetchCountryList());
    const newRes = res.content.map((i) => ({
      ...i,
      isLeaf: false,
      regionLevel: 0,
      regionCode: i.countryId,
      regionName: i.countryName,
      countryFlag: true,
      parentRegionList: [
        { countryName: i.countryName, regionLevel: 0, regionCode: i.countryId },
      ],
    }));
    this.setState({
      allList: newRes,
      selectList: [
        {
          regionName: newRes?.[0]?.regionName,
          regionLevel: 0,
          regionCode: newRes?.[0]?.regionCode,
        },
      ],
    });
  }

  @Bind()
  handleVersion() {
    this.props.history.push('/small/ec-address/version');
  }

  @Bind()
  fetchAddList(param, record) {
    const { versionVal } = this.state;
    let list = [];
    this.tableDS.setQueryParameter('filterParam', { ...param, versionId: versionVal });
    this.tableDS.query();
    if (record) {
      const parentRegionList = toJS(record.get('parentRegionList'));
      const { countryName } = parentRegionList[0];
      const countryId = record.get('countryId');
      list.push({ regionName: countryName, countryId, regionLevel: 0 });
      list = list.concat(parentRegionList || []);
      this.setState({ selectList: list });
    }
  }

  @Bind()
  handleSearch(i) {
    const { versionVal, selectList } = this.state;
    const list = [...selectList];
    list.splice(i.regionLevel + 1);
    this.setState({ selectList: list });
    if (i.regionLevel === 0) {
      this.tableDS.setQueryParameter('filterParam', {
        countryId: i.countryId,
        versionId: versionVal,
      });
    } else {
      this.tableDS.setQueryParameter('filterParam', {
        regionCode: i.regionCode,
        versionId: versionVal,
      });
    }
    this.tableDS.query();
  }

  @Bind()
  selectParam(val) {
    const { isLoad, selectList } = this.state;
    const list = [...selectList];
    list.splice(1);
    this.setState(
      {
        versionVal: val,
        isLoad: !isLoad,
        selectList: list,
      },
      () => this.fetchAddList()
    );
  }

  @Bind()
  handleLink(record) {
    const { versionVal, selectList } = this.state;
    let list = [...selectList];
    const parentRegionList = record.get('parentRegionList')?.slice();
    list.splice(1);
    list = list.concat(parentRegionList || []);
    this.setState({ selectList: list });
    this.tableDS.setQueryParameter('filterParam', {
      regionCode: record.get('regionCode'),
      versionId: versionVal,
    });
    this.tableDS.query();
  }

  // 启用禁用
  handleEnableDisable = record => {
    const {enabledFlag, regionId} = record.get(['enabledFlag', 'regionId']);
    openTipsModal({
      title: intl.get('small.common.model.tips').d('提示'),
      children: (
        <span>
          {enabledFlag
            ? intl
            .get('small.ecAddressManage.disable.tips')
            .d('禁用该地址会将所有下级地址一起禁用，确认禁用该地址吗？')
            : intl
            .get('small.ecAddressManage.enable.tips')
            .d('启用后该地址将能够被租户搜索到并使用，确认启用该地址吗？')}
        </span>
      ),
      onOk: async () => {
        const res = getResponse(await setPermissionSetEnable({
          regionId,
          status: !enabledFlag,
        }));
        if(res){
          notification.success();
          this.tableDS.query();
        }
      },
    });
  };

  // 0 红色已禁用 1绿色已启用
  tagRender = value => {
    const contentMap = {
      0: { color: 'red', text: intl.get('small.common.tag.disable').d('已禁用') },
      1: { color: 'green', text: intl.get('small.common.tag.enable').d('已启用') },
    };
    return (
      <Tag color={contentMap[value].color} style={{ border: 'none', fontWeight: 500 }}>
        {contentMap[value].text}
      </Tag>
    );
  };

  render() {
    const { allList, selectList, list, versionVal, versionCode, versionId, isLoad } = this.state;
    const columns = [
      {
        name: 'regionCode',
        renderer: ({ text, record }) => {
          if (record.get('regionLevel') === '4') {
            return <span>{text}</span>;
          } else {
            return (
              <Button color="primary" funcType="link" onClick={() => this.handleLink(record)}>
                {text}
              </Button>
            );
          }
        },
      },
      {
        name: 'regionName',
        renderer: ({ text, record }) => {
          if (record.get('regionLevel') === '4') {
            return <span>{text}</span>;
          } else {
            return (
              <Button color="primary" funcType="link" onClick={() => this.handleLink(record)}>
                {text}
              </Button>
            );
          }
        },
      },
      { name: 'regionLevel', align: 'right' },
      {
        name: 'enabledFlag',
        width: 120,
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          return this.tagRender(enabledFlag);
        },
      },
      {
        name: 'operation',
        width: 120,
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          const parentRegionList = record.get('parentRegionList');
          // 去除最后一条（自身），剩余为父级地址 父级地址有一级被禁用 则子级地址无法启用
          const disabled = parentRegionList
            .slice(0, parentRegionList.length - 1)
            .find(item => !item.enabledFlag);

          return (
            <Tooltip
              title={
                disabled
                  ? intl
                      .get('small.ecAddressManage.tooltip.parentDisabled')
                      .d('上级地址已禁用，请先启用上级地址')
                  : ''
              }
              placement="top"
            >
              <Button
                color="primary"
                funcType="link"
                onClick={() => this.handleEnableDisable(record)}
                disabled={disabled}
              >
                {enabledFlag
                  ? intl.get('hzero.common.button.disabled').d('禁用')
                  : intl.get('hzero.common.enable').d('启用')}
              </Button>
            </Tooltip>
          );
        },
      },
    ];
    return (
      <div className={styles['header-content']}>
        <Header title={intl.get(`small.ecAddressManage.EC.version.manage`).d('电商地址管理')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ height: '32px', lineHeight: '32px' }}>
              <SelectFilter
                isFirst={!versionId}
                defaultValue={versionId ? { versionCode, versionId } : undefined}
                dataSet={this.ds}
                filterName="versionCode"
                valueName="versionId"
                selectList={list}
                title={intl.get(`small.ecAddressManage.model.EC.versionCode`).d('地址版本')}
                onSearch={(val) => this.selectParam(val)}
              />
              {/* <span>{intl.get(`small.ecAddressManage.model.EC.versionCode`).d('地址版本')}</span>
              <Select value={versionVal} onChange={(val) => this.handleChange(val)}>
                {list.map((i) => (
                  <Select.Option value={i.versionId}>{i.versionCode}</Select.Option>
                ))}
              </Select> */}
            </div>
            <Button funcType="flat" icon="sutask" onClick={this.handleVersion}>
              {intl.get('small.ecAddressManage.EC.address.version').d('版本管理')}
            </Button>
          </div>
        </Header>
        {/* <Content> */}
        <div className="all-container">
          <div
            style={{
              width: '228px',
              marginRight: '8px',
              flex: 'none',
              background: '#fff',
              height: `calc(100vh - 156px)`,
              overflow: 'scroll',
              padding: '16px',
            }}
          >
            <TreeList
              version={versionVal}
              allList={allList}
              treeDS={this.treeDS}
              fetchList={this.fetchAddList}
              isLoad={isLoad}
            />
          </div>
          <div style={{ background: '#fff', padding: '16px', height: `calc(100vh - 156px)` }}>
            <Breadcrumb
              separator={<Icon style={{ fontSize: '18px' }} type="keyboard_arrow_right" />}
              style={{ fontSize: '16px', marginBottom: '16px' }}
            >
              {selectList?.map((i) => (
                <Breadcrumb.Item>
                  {i.regionLevel === selectList.length - 1 ? (
                    <span style={{ verticalAlign: 'middle', fontWeight: 600 }}>{i.regionName}</span>
                  ) : (
                    <a
                      style={{
                        color:
                          i.regionLevel === selectList.length - 1 ? '#000' : 'rgba(0,0,0,0.65)',
                        verticalAlign: 'middle',
                      }}
                      onClick={() => this.handleSearch(i)}
                    >
                      {i.regionName}
                    </a>
                  )}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
            <Table
              style={{ maxHeight: `calc(100vh - 280px)` }}
              columns={columns}
              dataSet={this.tableDS}
              customizedCode="SMALL.EC_ADDRESS.LIST.TREE"
            />
          </div>
        </div>
        {/* </Content> */}
      </div>
    );
  }
}
