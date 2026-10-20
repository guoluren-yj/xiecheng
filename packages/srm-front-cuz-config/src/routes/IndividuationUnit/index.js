/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { queryMapIdpValue } from 'services/api';

import customizeUnit from '@/assets/customize_unit.svg';
import { getResponse } from 'hzero-front/lib/utils/utils';
import SearchBarConfig from './SearchBarConfig';
import MenuTree from './MenuTree';
import Search from './Search';
import List from './List';
import Detail from './Detail';
import UnitModal from './UnitModal';
import CopyUnitModal from './CopyUnitModal';
import GroupModal from './GroupModal';
import GroupTree from './GroupTree';
import styles from './style/index.less';
import '../common.less';

@formatterCollections({ code: ['hpfm.individuationUnit', 'hpfm.customize', 'hpfm.individual'] })
@connect(({ loading = {} }) => ({
  queryListLoading: loading.effects['individuationUnitCuz/queryList'],
  queryGroupLoading: loading.effects['individuationUnitCuz/queryGroup'],
  queryGroupUnitsLoading: loading.effects['individuationUnitCuz/queryGroupUnits'],
  createListLoading: loading.effects['individuationUnitCuz/createUnit'],
  createGroupLoading: loading.effects['individuationUnitCuz/createGroup'],
  modifyGroupLoading: loading.effects['individuationUnitCuz/modifyGroup'],
  copyUnitLoading: loading.effects['individuationUnitCuz/copyUnit'],
}))
export default class IndividuationUnit extends Component {
  state = {
    dataSource: [], // 个性化单元
    pagination: [], // 个性化单元分页
    unitModalVisible: false,
    copyUnitModalVisible: false,
    groupModalVisible: false,
    showDetail: false,
    showFilterDetail: false,
    detailUnitId: null,
    selectedMenuCode: null,
    selectedMenuName: null,
    selectedGroupId: null,
    selectedGroupCode: null,
    selectedGroupName: null,
    groupModalInfo: {},
    filterFromValues: {}, // 保存查询表单
    unitTypeOptions: [], // 个性化单元类型值集
    unitGroups: [], // 个性化单元分组
  };

  isTenant = true;

  componentDidMount() {
    // this.fetchList();
    this.fetchLovData();
  }

  @Bind
  fetchLovData() {
    queryMapIdpValue({
      unitType: 'HPFM.CUST.UNIT_TYPE',
    }).then((res) => {
      if (res) {
        this.setState({
          unitTypeOptions: res.unitType || [],
        });
      }
    });
  }

  @Bind()
  fetchList(params = {}, _isTenant) {
    let isTenant = _isTenant;
    if(isTenant === undefined){
      // eslint-disable-next-line prefer-destructuring
      isTenant = this.isTenant;
    }else {
      // eslint-disable-next-line no-multi-assign
      this.isTenant = isTenant = _isTenant;
    }
    this.props
      .dispatch({
        type: 'individuationUnitCuz/queryList',
        params: {...params, menuLevel: isTenant ? "organization" : "site"},
      })
      .then((res) => {
        if (res) {
          const { dataSource = [], pagination = {} } = res || {};
          this.setState({ dataSource, pagination });
        }
      });
  }

  @Bind()
  fetchGroup(params = {}) {
    this.props
      .dispatch({
        type: 'individuationUnitCuz/queryGroup',
        params,
      })
      .then((res) => {
        if (res) {
          const unitGroups = res || [];
          if (unitGroups.length > 0) {
            const group = unitGroups[0] || {};
            const { unitGroupId, groupCode, groupName } = group;
            this.setState({
              selectedGroupId: unitGroupId,
              selectedGroupCode: groupCode,
              selectedGroupName: groupName,
            });
            this.fetchGroupUnits({ unitGroupId });
          }
          this.setState({ unitGroups });
        }
      });
  }

  @Bind()
  fetchGroupUnits(params = {}) {
    this.props
      .dispatch({
        type: 'individuationUnitCuz/queryGroupUnits',
        params,
      })
      .then((res) => {
        if (res) {
          this.setState({ dataSource: res.length > 0 ? res : [] });
        }
      });
  }

  @Bind()
  handleShowIndex() {
    const { selectedMenuCode, filterFromValues, selectedGroupId } = this.state;
    const params = filterFromValues;
    this.setState({ showDetail: false, showFilterDetail: false });
    if (selectedMenuCode !== 'root') {
      this.fetchGroupUnits({ unitGroupId: selectedGroupId });
    } else {
      this.fetchList(params);
    }
  }

  @Bind()
  handleEditUnit(unitId = '', unitGroupId, unitType) {
    this.setState({
      detailUnitId: unitId,
      detailGroupId: unitGroupId,
      unitType,
      showDetail: true,
    });
  }

  @Bind()
  handleEditFilter(filterUnit) {
    this.setState({
      detailUnitId: filterUnit.id,
      detailGroupId: filterUnit.unitGroupId,
      showFilterDetail: true,
    });
  }

  @Bind()
  copyUnit(params) {
    const { dispatch } = this.props;
    const { selectedGroupId } = this.state;
    dispatch({
      type: 'individuationUnitCuz/copyUnit',
      params: {
        ...params,
        unitGroupId: selectedGroupId,
      },
    }).then((res) => {
      if (!isUndefined(res)) {
        notification.success();
        this.toggleCopyUnitModal();
        this.fetchGroupUnits({ unitGroupId: selectedGroupId });
      }
    });
  }

  @Bind()
  toggleUnitModal() {
    const { unitModalVisible } = this.state;
    this.setState({ unitModalVisible: !unitModalVisible });
  }

  @Bind()
  toggleGroupModal() {
    const { groupModalVisible } = this.state;
    this.setState({ groupModalVisible: !groupModalVisible, groupModalInfo: {} });
  }

  @Bind
  editGroupModal() {
    const { groupModalVisible, selectedGroupCode, selectedGroupName } = this.state;
    this.setState({
      groupModalVisible: !groupModalVisible,
      groupModalInfo: {
        selectedGroupCode,
        selectedGroupName,
      },
    });
  }

  @Bind()
  createUnit(params = {}) {
    const { selectedGroupId, selectedMenuCode } = this.state;
    this.props
      .dispatch({
        type: 'individuationUnitCuz/createUnit',
        params: {
          ...params,
          menuCode: selectedMenuCode,
          unitGroupId: selectedGroupId,
        },
      })
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          this.setState({
            detailUnitId: (res || {}).id,
            detailGroupId: (res || {}).unitGroupId,
            showDetail: true,
            unitModalVisible: false,
          });
        }
      });
  }

  @Bind()
  createUnitGroup(params = {}) {
    const { selectedMenuCode } = this.state;
    this.props
      .dispatch({
        type: 'individuationUnitCuz/createGroup',
        params: {
          ...params,
          menuCode: selectedMenuCode,
        },
      })
      .then((res) => {
        if (res) {
          notification.success();
          this.setState({
            groupModalVisible: false,
          });
          this.fetchGroup({
            menuCode: selectedMenuCode,
          });
        }
      });
  }

  @Bind()
  handleSelectMenu(menuCode, menuName, isTenant) {
    this.setState({
      // 清空数据，防止渲染残留数据
      showDetail: false,
      showFilterDetail: false,
      dataSource: [],
      selectedMenuCode: menuCode,
      selectedMenuName: menuName,
      selectedGroupId: null,
      selectedGroupCode: null,
      selectedGroupName: null,
    });
    // 点击页面时先查分组
    if (menuCode !== 'root') {
      this.fetchGroup({ menuCode });
    } else {
      // 点击根目录时只查所有单元
      this.fetchList(undefined, isTenant);
    }
  }

  @Bind()
  handleSearch(params) {
    this.setState({ filterFromValues: params });
    this.fetchList(params);
  }

  @Bind()
  toggleCopyUnitModal() {
    const { copyUnitModalVisible } = this.state;
    this.setState({ copyUnitModalVisible: !copyUnitModalVisible });
  }

  @Bind()
  resetFilterFromValues() {
    this.setState({ filterFromValues: {} });
  }

  @Bind()
  handleSelectGroup(group = {}) {
    const { unitGroupId, groupCode, groupName } = group;
    this.setState({
      selectedGroupId: unitGroupId,
      selectedGroupCode: groupCode,
      selectedGroupName: groupName,
    });
    this.fetchGroupUnits({ unitGroupId });
  }

  @Bind()
  handleEditGroup(groupInfo) {
    this.setState({
      groupModalVisible: true,
      groupModalInfo: groupInfo,
    });
  }

  @Bind()
  handleSaveGroup(params) {
    this.props
      .dispatch({
        type: 'individuationUnitCuz/modifyGroup',
        params,
      })
      .then((res) => {
        if (res) {
          notification.success();
          const { selectedMenuCode } = this.state;
          this.setState({ groupModalVisible: false });
          this.fetchGroup({ menuCode: selectedMenuCode });
        }
      });
  }

  @Bind()
  renderIndex() {
    const {
      selectedMenuCode,
      dataSource = [],
      pagination,
      filterFromValues = {},
      unitTypeOptions = [],
    } = this.state;
    const { queryListLoading } = this.props;
    if (!selectedMenuCode) {
      return (
        <div className={styles['unit-blank-area']}>
          <div className="blank-pic">
            <img src={customizeUnit} alt="img" />
          </div>
          <div className={styles['unit-blank-desc']}>
            {intl
              .get('hpfm.individuationUnit.view.message.tip.selectMenu')
              .d('请从左侧个性化目录中选择分类!')}
          </div>
          <div className={styles['unit-blank-desc-supply']}>
            {intl
              .get('hpfm.individuationUnit.view.message.tip.notice')
              .d('个性化目录与系统菜单相对应，可根据需要配置对应菜单下的个性化单元')}
          </div>
        </div>
      );
    }
    if (selectedMenuCode === 'root') {
      return (
        <Content className={styles['unit-content-index']}>
          <Search
            handleSearch={this.handleSearch}
            filterFromValues={filterFromValues}
            resetFilterFromValues={this.resetFilterFromValues}
          />
          <List
            dataSource={dataSource}
            pagination={pagination}
            loading={queryListLoading}
            filterFromValues={filterFromValues}
            unitTypeOptions={unitTypeOptions}
            handleFetchList={this.fetchList}
            handleEdit={this.handleEditUnit}
            handleEditFilter={this.handleEditFilter}
          />
        </Content>
      );
    }
    return this.renderMenuIndex();
  }

  @Bind()
  renderMenuIndex() {
    const { unitGroups = [] } = this.state;
    // 没数据
    if (unitGroups.length === 0) {
      return (
        <div className={styles['unit-blank-area']}>
          <div className={styles['unit-blank-pic']}>
            <img src={customizeUnit} alt="img" />
          </div>
          <div className={styles['unit-blank-desc']}>
            {intl
              .get('hpfm.individuationUnit.view.message.tip.createUnitGroup')
              .d('请点击下方按钮新建个性化单元组')}
          </div>
          <div className={styles['unit-blank-desc-supply']}>
            <Button type="primary" onClick={this.toggleGroupModal}>
              {intl
                .get('hpfm.individuationUnit.view.message.button.createUnitGroup')
                .d('新建个性化单元组')}
            </Button>
          </div>
        </div>
      );
    }
    return this.renderGroup();
  }

  @Bind()
  renderGroup() {
    const { dataSource = [], selectedGroupCode, unitTypeOptions = [] } = this.state;
    const { queryGroupUnitsLoading } = this.props;
    if (!selectedGroupCode) {
      return (
        <div className={styles['unit-blank-area']}>
          <div className="blank-pic">
            <img src={customizeUnit} alt="img" />
          </div>
          <div className={styles['unit-blank-desc']}>
            {intl
              .get('hpfm.individuationUnit.view.message.tip.selectMenu')
              .d('请从左侧单元分组中选择分组!')}
          </div>
          <div className={styles['unit-blank-desc-supply']}>
            {intl
              .get('hpfm.individuationUnit.view.message.tip.groupNotice')
              .d('单元分组下有多个个性化单元，可根据需要配置对应分组下的个性化单元')}
          </div>
        </div>
      );
    } else if (dataSource.length === 0) {
      return (
        <div className={styles['unit-blank-area']}>
          <div className={styles['unit-blank-pic']}>
            <img src={customizeUnit} alt="img" />
          </div>
          <div className={styles['unit-blank-desc']}>
            {intl
              .get('hpfm.individuationUnit.view.message.tip.addNewUnit')
              .d('请点击下方按钮新建或者复制个性化单元')}
          </div>
          <div className={styles['unit-blank-desc-supply']}>
            <Button type="primary" onClick={this.toggleUnitModal}>
              {intl
                .get('hpfm.individuationUnit.view.message.button.createUnit')
                .d('新建个性化单元')}
            </Button>
            <Button onClick={this.toggleCopyUnitModal} style={{ marginLeft: 10 }}>
              {intl.get('hpfm.individuationUnit.view.message.button.copyUnit').d('复制个性化单元')}
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <Content className={styles['unit-content-index']}>
          <Button type="primary" onClick={this.toggleUnitModal} style={{ marginBottom: 10 }}>
            {intl.get('hpfm.individuationUnit.view.message.button.createUnit').d('新建个性化单元')}
          </Button>
          <Button onClick={this.toggleCopyUnitModal} style={{ marginLeft: 10 }}>
            {intl.get('hpfm.individuationUnit.view.message.button.copyUnit').d('复制个性化单元')}
          </Button>
          <List
            dataSource={dataSource}
            pagination={false}
            unitTypeOptions={unitTypeOptions}
            loading={queryGroupUnitsLoading}
            isGroupModel
            handleFetchList={this.fetchGroupUnits}
            handleEdit={this.handleEditUnit}
          />
        </Content>
      );
    }
  }

  @Bind()
  renderDetail() {
    const { detailUnitId, detailGroupId, unitType } = this.state;
    return (
      <Detail
        unitId={detailUnitId}
        unitType={unitType}
        detailGroupId={detailGroupId}
        backToIndex={this.handleShowIndex}
      />
    );
  }

  @Bind()
  renderFilterDetail() {
    const { detailUnitId, detailGroupId } = this.state;
    return (
      <SearchBarConfig
        unitId={detailUnitId}
        detailGroupId={detailGroupId}
        backToIndex={this.handleShowIndex}
      />
    );
  }

  render() {
    const {
      unitModalVisible,
      copyUnitModalVisible,
      groupModalVisible,
      selectedMenuCode,
      selectedMenuName,
      selectedGroupCode,
      selectedGroupId,
      selectedGroupName,
      showDetail,
      showFilterDetail,
      unitTypeOptions = [],
      unitGroups = [],
      groupModalInfo = {},
    } = this.state;
    const {
      createListLoading,
      createGroupLoading,
      modifyGroupLoading,
      copyUnitLoading,
    } = this.props;
    return (
      <>
        <Header
          title={intl
            .get('hpfm.individuationUnit.view.message.title.individuationUnit')
            .d('个性化单元')}
        />
        <div className='unit-main-container unit-common-style'>
          <div className='unit-wrap-container'>
            <div className={`unit-left-container ${styles.bordered}`}>
              <MenuTree handleSelectMenu={this.handleSelectMenu} />
            </div>
            {selectedMenuCode &&
              selectedMenuCode !== 'root' &&
              !showDetail && !showFilterDetail &&
              unitGroups.length > 0 && (
                <div className={`unit-left-container ${styles.bordered}`}>
                  <GroupTree
                    selectedGroupCode={selectedGroupCode}
                    unitGroups={unitGroups}
                    handleEdit={this.handleEditGroup}
                    handleSelectGroup={this.handleSelectGroup}
                    handleOpenGroupModal={this.toggleGroupModal}
                  />
                </div>
              )}
            {(!showDetail && !showFilterDetail) ? (
              <div className={`unit-right-container ${styles.bordered}`}>
                {this.renderIndex()}
              </div>
            ) : (
              <div className='unit-right-container'>
                {showDetail ? (
                  <Content className='unit-content-detail'>
                    {this.renderDetail()}
                  </Content>
                  ) : this.renderFilterDetail()
                }
              </div>
            )}
          </div>
        </div>
        <GroupModal
          menuName={selectedMenuName}
          menuCode={selectedMenuCode}
          groupInfo={groupModalInfo}
          visible={groupModalVisible}
          createGroupLoading={createGroupLoading}
          modifyGroupLoading={modifyGroupLoading}
          handleSave={this.handleSaveGroup}
          handleClose={this.toggleGroupModal}
          handleCreate={this.createUnitGroup}
        />
        <UnitModal
          groupCode={selectedGroupCode}
          groupName={selectedGroupName}
          visible={unitModalVisible}
          unitTypeOptions={unitTypeOptions}
          createListLoading={createListLoading}
          handleClose={this.toggleUnitModal}
          handleCreate={this.createUnit}
        />
        <CopyUnitModal
          unitGroupId={selectedGroupId}
          groupCode={selectedGroupCode}
          loading={copyUnitLoading}
          visible={copyUnitModalVisible}
          handleClose={this.toggleCopyUnitModal}
          handleCopyUnit={this.copyUnit}
        />
      </>
    );
  }
}
