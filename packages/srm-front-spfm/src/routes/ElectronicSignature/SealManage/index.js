/**
 * index.js - 印章管理
 * @date: 2019-08-7
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { parse } from 'querystring';
import { isUndefined, isEmpty } from 'lodash';
import { connect } from 'dva';
import { Tabs, Modal } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import remote from 'hzero-front/lib/utils/remote';

import { Header, Content } from 'components/Page';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getCurrentUserId,
  getResponse,
} from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import CommonImport from 'components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import { getDvaApp } from 'utils/iocUtils';

import { ReactComponent as NoContent } from '@/assets/sign/none.svg';
import { getNuclearStatus } from '@/services/sealMangeService';

import Search from './Search';
import List from './List';
import SearchDrawer from './SearchDrawer';
import AuthorizationModal from './AuthorizationModal';
import SealGeneration from './SealGeneration/index';
import styles from './index.less';

const viewPromp = 'spfm.sealmanage.view.message.title';
const { TabPane } = Tabs;

@connect(({ loading = {}, sealMange = {} }) => ({
  queryListLoading: loading.effects['sealMange/queryList'],
  queryModalListLoading: loading.effects['sealMange/queryModalList'],
  fetchEnumLoading: loading.effects['sealMange/fetchEnum'],
  submitting: loading.effects['sealMange/update'],
  sealMange,
}))
@remote({
  code: 'SPFM_ELECTRONIC_SIGNATURE_SEALMANAGE_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
  name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
})
@formatterCollections({
  code: [
    'spfm.sealmanage',
    'spfm.common',
    'entity.company',
    'entity.attachment',
    'spfm.certificateAuthority',
    'small.MinimumOrderAmountModal',
    'hzero.common',
    'spfm.configServer',
  ],
})
export default class SealMange extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { companyId } = parse(search.substr(1));
    this.state = {
      companyId,
      certificateResId: undefined,
      operationRecordVisible: false,
      authorizationVisible: false,
      sealGenerationVisible: false,
      authenticationList: [],
      authType: 'ESIGN',
      tenantId: getCurrentOrganizationId(),
      isNuclear: true, // 是否核企组合
      menuArr: [],
    };
  }

  componentDidMount() {
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
    this.fetchEnum();
  }

  @Bind()
  handleAuthType() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sealMange/fetchauthentication',
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
              //     authTypeName: intl.get(`spfm.certificateAuthority.view.message.esignSaas`).d('E签宝SAAS'),
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
            authType: authenticationList[0]?.authType,
          },
          () => {
            this.fetchList();
          }
        );
      }
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}) {
    const { tenantId, authType } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'sealMange/queryList',
      payload: {
        page,
        tenantId,
        authType,
        ...filterValues,
      },
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sealMange/init',
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}, errorFlag) {
    if (errorFlag) {
      notification.error({
        message: intl
          .get('spfm.certificateAuthority.view.message.CAError')
          .d(
            '操作失败，失败原因为当前公司未进行公司关系添加，请先在【CA认证】功能下完成该公司的关系添加'
          ),
      });
      return;
    }
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * 隐藏模态框
   * 同时清除模态框状态树里的数据
   */
  @Bind()
  hideModal(_this) {
    this.setState({ operationRecordVisible: false });
    _this.setState({
      modalDataSource: [],
    });
    // dispatch({
    //   type: 'sealMange/updateState',
    //   payload: {
    //     modalDataSource: [],
    //   },
    // });
  }

  /**
   * 回调获取url地址
   */
  @Bind()
  afterOpenLineUploadModal(attachmentUuid, record) {
    const { dispatch, sealMange } = this.props;
    const { modalDataSource } = sealMange;
    if (!isEmpty(record.sealFileUrl)) {
      const newDataSource = modalDataSource.map((item) => {
        if (item.sealId === record.sealId) {
          return {
            ...item,
            sealFileUrl: record.sealFileUrl,
          };
        }
        return item;
      });
      dispatch({
        type: 'sealMange/updateState',
        payload: {
          modalDataSource: newDataSource,
        },
      });
    }
  }

  @Bind()
  handleRecordChange(record) {
    const { dispatch, sealMange } = this.props;
    const { modalDataSource } = sealMange;
    const newDataSource = modalDataSource.map((item) => {
      if (item.sealId === record.sealId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    dispatch({
      type: 'sealMange/updateState',
      payload: {
        modalDataSource: newDataSource,
      },
    });
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
          this.setState({ authType: activeKey }, () => {
            this.fetchList();
          });
        },
      });
    } else {
      this.setState({ authType: activeKey }, () => {
        this.fetchList();
      });
    }
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
      operationRecordVisible,
      companyId,
      selectedRows,
      authType,
      authorizationVisible,
      sealGenerationVisible,
      authenticationList,
      certificateResId, // 法大大认证信息Id
      isNuclear,
      menuArr,
    } = this.state;
    // eslint-disable-next-line no-shadow
    const { sealMange, queryListLoading, remote } = this.props;
    const { enumMap, dataSource, pagination } = sealMange;
    const searchProps = {
      enumMap,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      dataSource,
      pagination,
      onSearch: this.fetchList,
      loading: queryListLoading,
      handleModalVisibleList: this.handleModalVisible,
    };
    const searchDrawerProps = {
      enumMap,
      companyId,
      certificateResId,
      authType,
      selectedRows,
      remote,
      visible: operationRecordVisible,
      onHideDrawer: this.hideModal,
      onHandleRecord: this.handleRecordChange,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };
    const authorizationPorps = {
      authType,
      companyId,
      remote,
      certificateResId,
      visible: authorizationVisible,
      onCancel: () => this.handleModalVisible('authorizationVisible', false),
    };
    // 印章生成
    const sealGenerationProps = {
      remote,
      companyId,
      visible: sealGenerationVisible,
      onHandleCancel: () => this.handleModalVisible('sealGenerationVisible', false),
    };
    const renderTab =
      authenticationList.length > 0
        ? authenticationList.map((ele) => {
            return (
              <TabPane tab={ele.authTypeName} key={ele.authType}>
                <Search {...searchProps} />
                <List {...listProps} />
              </TabPane>
            );
          })
        : '';
    return (
      <>
        <Header title={intl.get(`${viewPromp}.controlOfStamping`).d('印章管理')}>
          {authType === 'ESIGN' && (isNuclear || !menuArr.length) && (
            <CommonImport
              businessObjectTemplateCode="SPFM_COMPANY_USER_BATCH_IMP"
              prefixPatch={SRM_PLATFORM}
              buttonText={intl.get('hzero.common.button.batchLicensingImport').d('批量授权导入')}
              buttonProps={{
                icon: 'archive',
                funcType: 'flat',
                style: { marginRight: '8px' },
                permissionList: [
                  {
                    code: 'srm.bg.manager.seal.manage.api.user.batch.imp',
                    type: 'button',
                    meaning: '批量授权导入',
                  },
                ],
              }}
              args={{
                authType,
              }}
            />
          )}
        </Header>
        {isNuclear || !menuArr.length ? ( // 非核企
          <>
            <Content>
              <Tabs
                animated={false}
                onChange={(activeKey) => {
                  this.handleChangeActTab(activeKey);
                }}
              >
                {renderTab}
              </Tabs>
              <SearchDrawer {...searchDrawerProps} />
            </Content>
            <AuthorizationModal {...authorizationPorps} />
            {sealGenerationVisible && <SealGeneration {...sealGenerationProps} />}
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
      </>
    );
  }
}
