/* eslint-disable eqeqeq */
/* eslint-disable no-unused-expressions */
/*
 * index.js - CA认证
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-05 16:09:07
 * @LastEditTime: 2023-04-14 19:05:53
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Modal, Spin, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUserId, getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { openTab } from 'utils/menuTab';
import SearchBarTable from '_components/SearchBarTable';
import { DataSet, Button } from 'choerodon-ui/pro';
// import { yesOrNoRender } from 'utils/renderer';
import { Tag, Tabs } from 'choerodon-ui';
import withProps from 'utils/withProps';
import { getDvaApp } from 'utils/iocUtils';

import { ReactComponent as NoContent } from '@/assets/sign/none.svg';
import { getNuclearStatus } from '@/services/sealMangeService';

import certificateDs from './ds';
import ElectronicSignatureLov from './ElectronicSignatureLov/index';
import PrivacyStatement from './PrivacyStatement';
import styles from './index.less';

const { TabPane } = Tabs;

@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, certificateAuthority = {} }) => ({
  queryListLoading: loading.effects['certificateAuthority/queryList'],
  submitting: loading.effects['certificateAuthority/save'],
  fetchAuthTypeLoading: loading.effects['certificateAuthority/fetchauthentication'],
  removeRelationshipLoading: loading.effects['certificateAuthority/removeRelationship'],
  continueLoading:
    loading.effects['certificateAuthority/companyVerify'] ||
    loading.effects['certificateAuthority/commonCompanyVerify'],
  certificateAuthority,
}))
class SupplierContractView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      edited: false,
      authTip: false,
      authenticationList: [], // 包含的认证类型
      count: 1,
      electronicSignatureFlag: true, // 是否有公司开通了电子签章服务
      statementVisible: false, // 隐私声明弹窗
      currentData: {}, // 当前行数据
      isNuclear: true, // 是否核企组合
      menuArr: [],
    };
    const { ds, dsFdd, qysDs } = props;
    // this.ds = ds;
    // this.dsFdd = dsFdd;
    // this.qysDs = qysDs,
    this.dsMap = {
      ESIGN: ds,
      FDD: dsFdd,
      QYS: qysDs,
    };
    this.currentDs = ds;
  }

  componentWillMount() {
    // const {
    // location: { state: { _back } = {} },
    // certificateAuthority: { pagination = {} },
    // } = this.props;
    // if (_back === -1) {
    //   // _back=-1 在详情页
    //   this.fetchList(pagination);
    // } else {
    //   this.fetchList(); // 查询数据
    // }

    const menuList = getDvaApp()?._store?.getState()?.global?.menuLeafNode ?? [];
    const pathArr =
      menuList && menuList.length ? menuList.filter((item) => item.path === '/spfm/sup-sign') : [];

    getNuclearStatus().then((res) => {
      if (getResponse(res)) {
        this.setState({
          isNuclear: true,
          menuArr: pathArr,
        });
      } else {
        this.setState({
          isNuclear: false,
          menuArr: pathArr,
        });
      }
    });

    this.handleAuthType();
    this.fetchEnum(); // 查询值集
    this.fetchElectronicSignatureFlag();
  }

  /**
   * 查询是否有公司开通了电子签章服务
   */
  @Bind()
  fetchElectronicSignatureFlag() {
    const { dispatch } = this.props;
    dispatch({
      type: 'certificateAuthority/fetchElectronicSignatureFlag',
      payload: {
        tenantId: this.state.tenantId,
      },
    }).then((res) => {
      if (res && res.companyImpoerFlag === 0) {
        this.setState({
          electronicSignatureFlag: false,
        });
      } else {
        this.setState({
          electronicSignatureFlag: true,
        });
      }
    });
  }

  @Bind()
  handleAuthType() {
    const { dispatch } = this.props;
    dispatch({
      type: 'certificateAuthority/fetchauthentication',
      payload: { userId: getCurrentUserId() },
    }).then((res) => {
      if (res && res.length > 0) {
        // authenticationList 返回认证的类型.
        const authenticationList = res
          .map((ele) => {
            switch (ele) {
              case 'ESIGN':
                return {
                  authType: ele,
                  authTypeName: intl.get(`spfm.certificateAuthority.view.message.eSign`).d('E签宝'),
                };
              case 'FDD':
                return {
                  authType: ele,
                  authTypeName: intl.get(`spfm.certificateAuthority.view.message.fdd`).d('法大大'),
                };
              case 'QYS':
                return {
                  authType: ele,
                  authTypeName: intl.get(`spfm.certificateAuthority.view.message.qys`).d('契约锁'),
                };
              // case 'QYS_SAAS':
              //   return {
              //     authType: ele,
              //     authTypeName: intl
              //       .get(`spfm.certificateAuthority.view.message.qusSaas`)
              //       .d('契约锁SAAS'),
              //   };
              // case 'ESIGN_SAAS':
              //   return {
              //     authType: ele,
              //     authTypeName: intl
              //       .get(`spfm.certificateAuthority.view.message.esignSaas`)
              //       .d('E签宝SAAS'),
              //   };
              default:
                return '';
              // 注掉的原因，是这个是没有作用了后端,多传一些类型，还会有BUG
              // return {
              //   authType: ele,
              //   authTypeName: intl
              //     .get(`spfm.certificateAuthority.view.message.eSign`)
              //     .d('E签宝'),
              // };
            }
          })
          .filter((i) => !!i);
        this.setState(
          {
            authenticationList,
            authType: authenticationList[0]?.authType || 'ESIGN',
            authTip: false,
          },
          () => {
            // this.currentDs = authType === 'ESIGN' ? this.ds : this.dsFdd;
            (res || []).forEach((type) => {
              // 下面三行代码是为了COUNT查询。
              if (this.dsMap[type]) {
                this.dsMap[type].setQueryParameter('authType', type);
                this.dsMap[type].setQueryParameter('onlyCountFlag', 'Y');
                this.dsMap[type].query();
                // 下面这行代码是为了保证查询完COUNT恢复到正常数据查询
                this.dsMap[type].setQueryParameter('onlyCountFlag', null);
              }
            });
            this.currentDs = this.dsMap[authenticationList[0]?.authType || 'ESIGN'];
          }
        );
      } else {
        this.setState({
          authTip: true,
        });
      }
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} page - 查询条件
   */
  @Bind()
  fetchList(page = {}) {
    const { authType } = this.state;
    this.currentDs.setQueryParameter('authType', authType);

    this.currentDs.query(page).finally(() => {
      this.setState({
        edited: false,
      });
    });

    // const filterValues = isUndefined(this.filterForm)
    //   ? {}
    //   : filterNullValueObject(this.filterForm.getFieldsValue());
    // dispatch({
    //   type: 'certificateAuthority/queryList',
    //   payload: {
    //     page,
    //     tenantId,
    //     ...filterValues,
    //     authType,
    //   },
    // }).then(res => {
    //   if (res) {
    //     dataSource.forEach(item => {
    //       item.$form.resetFields();
    //     });
    //     this.setState({
    //       edited: false,
    //     });
    //   }
    // });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'certificateAuthority/fetchFormEnum',
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcTypeId
   */
  @Bind()
  redirectDetail(record) {
    const { dispatch } = this.props;
    const { authType, tenantId } = this.state;
    const { companyId, authInfoId } = record;
    const searchParams = { companyId, authInfoId, authType };
    switch (authType) {
      case 'ESIGN':
        return dispatch(
          routerRedux.push({
            pathname: `/spfm/certificate-authority/detail`,
            search: stringify(searchParams),
          })
        );
      case 'FDD':
        return dispatch({
          type: 'certificateAuthority/companyVerify',
          payload: record,
        }).then((res) => {
          if (res) {
            try {
              const response = JSON.parse(res);
              if (response.failed) {
                notification.error({ message: response.message || response.code });
              }
            } catch (error) {
              window.open(res);
              this.setState({ statementVisible: false });
              this.fetchList();
            }
          }
        });
      default:
        dispatch({
          type: 'certificateAuthority/commonCompanyVerify',
          payload: {
            ...record,
            tenantId,
          },
        }).then((res) => {
          if (res) {
            try {
              const response = JSON.parse(res);
              if (response.failed) {
                notification.error({ message: response.message || response.code });
              }
            } catch (error) {
              window.open(res);
              this.setState({ statementVisible: false });
              this.fetchList();
            }
          }
        });
    }
  }

  /**
   * 保存
   */
  @Bind()
  save(record) {
    const { dispatch } = this.props;
    const newDataSource = [{ ...(record?.toData() ?? {}) }];
    // this.currentDs.forEach((record) => {
    //   if (record.dirty) {
    //     newDataSource.push(record.toData());
    //   }
    // });
    if (newDataSource.length > 0) {
      dispatch({
        type: 'certificateAuthority/save',
        payload: newDataSource,
      }).then((res) => {
        if (res) {
          this.fetchList(this.currentDs.currentPage);
          notification.success();
        }
      });
    }
  }

  @Bind()
  handleChangeActTab(activeKey) {
    const { edited } = this.state;
    if (edited) {
      Modal.confirm({
        title: intl
          .get('spfm.certificateAuthority.view.message.ifClean')
          .d('当前有数据未保存,切换tab数据可能会丢失.是否确认切换'),
        onOk: () => {
          this.setState({ authType: activeKey, edited: false }, () => {
            this.currentDs.query();
            this.currentDs = this.dsMap[activeKey];
            this.currentDs.setQueryParameter('authType', activeKey);
          });
        },
      });
    } else {
      this.setState({ authType: activeKey }, () => {
        // this.currentDs = activeKey === 'ESIGN' ? this.ds : this.dsFdd;
        this.currentDs = this.dsMap[activeKey];
        this.currentDs.setQueryParameter('authType', activeKey);
      });
    }
  }

  @Bind()
  handlegotoAppstore() {
    openTab({
      key: `/spfm/amkt-appstore`,
      title: intl.get('spfm.certificateAuthority.view.message.title.appstore').d('应用商店'),
    });
  }

  @Bind()
  protocolType({ value, record }) {
    return (
      <div>
        <a
          onClick={() => {
            if (record.get('authType') === 'ESIGN' || record.get('caAuthStatus') === 'CA_SUCCESS') {
              this.redirectDetail(record.toData());
            } else {
              this.setState({ statementVisible: true, currentData: record.toData() });
            }
          }}
        >
          {value}
        </a>
        {record.get('companyImpoerFlag') === 1 && record.get('authType') === 'FDD' && (
          <Icon type="check-circle" style={{ marginLeft: 5, color: '#29BECE' }} />
        )}
      </div>
    );
  }

  /**
   * 添加关系
   */
  @Bind()
  addRelationship(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'certificateAuthority/addRelationship',
      payload: {
        tenantId: this.state.tenantId,
        ...record.data,
      },
    }).then((res) => {
      if (res) {
        try {
          const response = JSON.parse(res);
          if (response.failed) {
            notification.warning({ message: response.message || response.code });
          }
        } catch (error) {
          window.open(res);
        }
      }
    });
  }

  /**
   * 移除关系
   */
  @Bind()
  removeRelationship(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'certificateAuthority/removeRelationship',
      payload: {
        tenantId: this.state.tenantId,
        ...record.data,
      },
    }).then((res) => {
      if (res) {
        try {
          const response = JSON.parse(res);
          if (response.failed) {
            notification.warning({ message: response.message || response.code });
          }
        } catch (error) {
          notification.success();
          this.fetchList();
        }
      }
    });
  }

  @Bind()
  changeRelationship(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'certificateAuthority/changeRelationship',
      payload: {
        ...record.data,
        tenantId: this.state.tenantId,
      },
    }).then((res) => {
      if (res) {
        try {
          const response = JSON.parse(res);
          if (response.failed) {
            notification.warning({ message: response.message || response.code });
          }
        } catch (error) {
          window.open(res);
        }
      }
    });
  }

  // 请求接口
  @Bind()
  onQuery({ params }, ds) {
    ds.queryDataSet.loadData([{ ...params }]);
    ds.query().then(() => {
      this.setState({
        count: this.state.count + 1,
      });
    });
  }

  /**
   * 获取认证个性化单元CODE
   * @param {string} authType 认证类型
   * @returns
   */
  @Bind()
  getSearchCode(authType) {
    switch (authType) {
      case 'QYS':
        return 'SPFM.ELECTRONIC_SIGNATURE_CA.SEARCHQYS';
      case 'FDD':
        return 'SPFM.ELECTRONIC_SIGNATURE_CA.SEARCHFDD';
      default:
        return 'SPFM.ELECTRONIC_SIGNATURE_CA.SEARCH';
    }
  }

  @Bind()
  handleRefreshList() {
    const { authType } = this.state;
    this.dsMap[authType]?.query();
    this.fetchElectronicSignatureFlag();
  }

  /**
   * 跳转销售方电子签章工作台
   */
  @Bind()
  pushToNewSealManage() {
    this.props.history.push(`/spfm/sup-sign/list`);
  }

  render() {
    const {
      authenticationList,
      authTip,
      authType,
      electronicSignatureFlag,
      isNuclear,
      menuArr,
    } = this.state;
    const {
      // queryListLoading,
      // submitting,
      fetchAuthTypeLoading,
      removeRelationshipLoading,
      continueLoading,
    } = this.props;
    const renderStatus = (code, meaning) => {
      const colorConfigList = [
        {
          // 黄色
          status: ['APPLYING'],
          color: '#fef4e2',
          style: { color: '#fca400' },
        },
        {
          // 绿色
          status: ['CA_SUCCESS'],
          color: '#ebf7f1',
          style: { color: '#47b883' },
        },
        {
          // 红色
          status: ['APPLY_FAILURE'],
          color: ' #ffeeeb',
          style: { color: '#f56649' },
        },
        {
          // 灰色
          status: ['NOT_APPLY'],
          color: '#F0F0F0',
          style: { color: 'rgba(0,0,0, .65)' },
        },
      ];
      const colorConfig = colorConfigList.find((i) => i.status.includes(code));
      return (
        <Tag color={colorConfig?.color} style={colorConfig?.style}>
          {meaning}
        </Tag>
      );
    };
    const renderTab =
      authenticationList.length > 0
        ? authenticationList.map((ele) => {
            // const { authType } = ele;
            const ds = this.dsMap[ele?.authType];
            return (
              <TabPane tab={ele.authTypeName} key={ele?.authType} count={ds?.totalCount ?? 0}>
                <div className={styles['scroll-table-panel']}>
                  <div style={{ height: 'calc(100vh - 142px)' }}>
                    <SearchBarTable
                      customizable
                      customizedCode="aggregation"
                      cacheState
                      cacheKey={`${this.getSearchCode(ele?.authType)}_CACHE_KEY`}
                      searchCode={this.getSearchCode(ele?.authType)}
                      dataSet={ds}
                      autoHeight={{ type: 'maxHeight', diff: 40 }}
                      columns={[
                        {
                          label: intl
                            .get(`spfm.certificateAuthority.model.certificateAuthority.status`)
                            .d('CA状态'),
                          name: 'caAuthStatusMeaning',
                          renderer: ({ record }) =>
                            renderStatus(
                              record.get('caAuthStatus'),
                              record.get('caAuthStatusMeaning')
                            ),
                        },
                        {
                          label: intl.get('entity.company.code').d('公司编码'),
                          name: 'companyNum',
                          renderer: this.protocolType,
                        },
                        {
                          label: intl.get('entity.company.name').d('公司名称'),
                          name: 'companyName',
                        },
                        {
                          label: intl.get(`hzero.common.status.enable`).d('启用'),
                          name: 'enabledFlag',
                          renderer: ({ value }) => {
                            return (
                              <Tag color={value == 1 ? 'green' : 'red'}>
                                {value == 1
                                  ? intl.get('hzero.common.status.alreadyEnabled').d('已启用')
                                  : intl.get('hzero.common.status.alreadyDisabled').d('已禁用')}
                              </Tag>
                            );
                          },
                        },
                        {
                          label: intl.get(`hzero.common.table.column.option`).d('操作'),
                          name: 'action',
                          renderer: ({ record }) => {
                            if (record.get('caAuthStatus') !== 'CA_SUCCESS') {
                              return '';
                            }
                            if (record.get('enabledFlag') === 1) {
                              return (
                                <span className="action-link">
                                  <a
                                    onClick={() => {
                                      // this.setState({
                                      //   edited: true,
                                      // });
                                      record.set('enabledFlag', 0);
                                      this.save(record);
                                    }}
                                  >
                                    {intl.get('hzero.common.status.disable').d('禁用')}
                                  </a>
                                  {/* 法大大 已出证 已启用 未开通电子签章服务 未添加关系 (有至少一家公司开通了电子签章服务才显示electronicSignatureFlag) */}
                                  {record.get('authType') === 'FDD' &&
                                    record.get('caAuthStatus') === 'CA_SUCCESS' &&
                                    record.get('companyImpoerFlag') === 0 &&
                                    !record.get('parentUnionId') &&
                                    electronicSignatureFlag && (
                                      <a onClick={() => this.addRelationship(record)}>
                                        {intl
                                          .get('hzero.common.status.addRelationship')
                                          .d('添加关系')}
                                      </a>
                                    )}
                                  {/* parentUnionId不为空代表已添加关系 */}
                                  {record.get('parentUnionId') && record.get('authType') !== 'QYS' && (
                                    // (record.get('authType') === 'QYS' ? (
                                    //   <a onClick={() => this.changeRelationship(record)}>
                                    //     {intl
                                    //       .get('hzero.common.status.changeRelationship')
                                    //       .d('信息变更')}
                                    //   </a>
                                    // ) :
                                    <a onClick={() => this.removeRelationship(record)}>
                                      {intl
                                        .get('hzero.common.status.removeRelationship')
                                        .d('移除关系')}
                                    </a>
                                  )}
                                </span>
                              );
                            } else {
                              return (
                                <span className="action-link">
                                  <a
                                    onClick={() => {
                                      // this.setState({
                                      //   edited: true,
                                      // });
                                      record.set('enabledFlag', 1);
                                      this.save(record);
                                    }}
                                  >
                                    {intl.get('hzero.common.status.enable').d('启用')}
                                  </a>
                                  {/* parentUnionId不为空代表已添加关系 */}
                                  {record.get('parentUnionId') && record.get('authType') !== 'QYS' && (
                                    // (record.get('authType') === 'QYS' ? (
                                    //     <a onClick={() => this.changeRelationship(record)}>
                                    //       {intl
                                    //         .get('hzero.common.status.changeRelationship')
                                    //         .d('信息变更')}
                                    //     </a>
                                    //   ) :
                                    <a onClick={() => this.removeRelationship(record)}>
                                      {intl
                                        .get('hzero.common.status.removeRelationship')
                                        .d('移除关系')}
                                    </a>
                                  )}
                                </span>
                              );
                            }
                          },
                        },
                      ]}
                      searchBarConfig={{
                        onQuery: (e) => this.onQuery(e, ds),
                      }}
                    />
                  </div>
                </div>
              </TabPane>
            );
          })
        : '';
    // let flag = false;
    // this.currentDs.forEach((record) => {
    //   if (record.dirty) {
    //     flag = true;
    //   }
    // });

    const statementModal = (
      <Modal
        key={authType}
        width={600}
        visible={this.state.statementVisible}
        className={styles['theme-config-protocol']}
        onCancel={() => {
          this.setState({ statementVisible: false });
        }}
        destroyOnClose
        footer={null}
      >
        <PrivacyStatement
          onCancel={() => {
            this.setState({ statementVisible: false });
          }}
          handleOk={() => this.redirectDetail(this.state.currentData)}
          authType={authType}
          loading={continueLoading}
        />
      </Modal>
    );

    return (
      <Fragment>
        <Header
          title={intl.get(`spfm.certificateAuthority.view.message.title.authority`).d('CA认证')}
        >
          {authType === 'FDD' && (isNuclear || !menuArr.length) && (
            <ElectronicSignatureLov
              disabled={this.state.electronicSignatureFlag}
              queryParams={{ tenantId: this.state.tenantId }}
              onRefreshList={this.handleRefreshList}
            />
          )}
        </Header>

        {isNuclear || !menuArr.length ? (
          <>
            <Content>
              <Spin spinning={fetchAuthTypeLoading || removeRelationshipLoading || false}>
                {authenticationList.length > 0 && (
                  <Tabs
                    animated={false}
                    activeKey={authType}
                    onChange={(activeKey) => {
                      this.handleChangeActTab(activeKey);
                    }}
                  >
                    {renderTab}
                  </Tabs>
                )}
                {authTip && (
                  <div>
                    {intl
                      .get(`spfm.certificateAuthority.view.message.noCertificateAuthority`)
                      .d(
                        '您当前租户及合作客户未开通电子签章服务，无法进行ca认证；如需电子签章服务，可通过应用商店功能开通电子签章服务'
                      )}
                    <a onClick={() => this.handlegotoAppstore()} style={{ marginLeft: '10px' }}>
                      {intl.get(`spfm.certificateAuthority.view.option.clickHere`).d('点此前往')}
                    </a>
                  </div>
                )}
              </Spin>
            </Content>
            {statementModal}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              margin: '8px',
              height: 'calc(100vh - 156px)',
            }}
          >
            <div className={styles['seal-manage-empty-basic-panel']}>
              <NoContent style={{ width: '136px', height: '96px' }} />
            </div>
            <div
              style={{
                textAlign: 'center',
                color: '#101319',
                fontSize: '14px',
                lineHeight: '22px',
                marginTop: '16px',
                width: '50%',
              }}
            >
              {intl
                .get('spfm.sealmanage.view.message.sealManageNewMenuAlert')
                .d(
                  '供应商电子签章所需使用的【CA认证】、【印章管理】已迁移至新菜单【销售方电子签章管理】，我们将对原操作入口保留3个月过渡期，过渡期后原功能菜单入口将关闭，请前往【销售方电子签章管理】继续操作'
                )}
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Button color="primary" onClick={this.pushToNewSealManage}>
                {intl
                  .get('spfm.sealmanage.view.button.toNewSignManage')
                  .d('前往销售方电子签章工作台')}
              </Button>
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default formatterCollections({
  code: ['spfm.certificateAuthority', 'spcm.common', 'entity.company', 'spfm.sealmanage'],
})(
  withProps(
    () => {
      const ds = new DataSet(certificateDs());
      const dsFdd = new DataSet(certificateDs());
      const qysDs = new DataSet(certificateDs());
      return { ds, dsFdd, qysDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(SupplierContractView)
);
