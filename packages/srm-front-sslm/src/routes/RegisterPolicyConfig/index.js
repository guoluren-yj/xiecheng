/*
 * RegisterPolicyConfig - 注册策略配置
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Lov, notification, Modal } from 'choerodon-ui/pro';
import { Spin, Tabs, Alert } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isNil, isEmpty } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { getResponse } from 'utils/utils';

import { handleDefaultLovData, getTabValidationErrors } from '@/routes/components/utils';
import {
  queryHeaderInfo,
  saveData,
  publishData,
  unlockData,
} from '@/services/registerPolicyConfig';

import VersionDetailModal from './components/VersionDetailModal';
import HeaderBtns from './components/HeaderBtns';
import { indexDS, templateDS } from './stores/indexDS';
import { headerDS, tableDS } from './stores/StandardConfigDS';
import { getPanel } from './utils/utils';

import styles from './index.less';

const { TabPane } = Tabs;

const REGISTER_IN = 'spfm_company_basic_in'; // 境内
const REGISTER_OUT = 'spfm_company_basic_out'; // 境外
const BUSSINESS = 'spfm_company_business';
const BANK_ACCOUNT = 'spfm_company_bank_account';
const CONTANT = 'spfm_company_contact';
const ADDRESS = 'spfm_company_address';
const INVOICE = 'spfm_company_invoice';
const FIN = 'spfm_company_fin';
const ATTACHMENT = 'spfm_company_attachment';
const OTHER = 'sslm_sup_change_other';

/**
 * 注册策略配置
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'sslm.registerPolicy',
    'sslm.common',
    'spfm.enterpriseCertification',
    'sslm.investDefOrg',
    'spfm.investigationDefinition',
    'spfm.rulesDefinition',
  ],
})
export default class RegisterPolicyConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headerId: null, // 配置头id
      assignId: null, // 二级域名id
      queryUrlLoading: false, // 二级域名查询
      queryHeaderLoading: false, // 头查询
      saveLoading: false, // 保存
      queryTemplateLoading: false, // 调查表模版查询
      queryTabLoading: false, // 页签查询
      isEdit: true,
      versionNum: 0,
      activeKey: 'basicPolicy',
      historyVersionHidden: false, // 历史记录menu隐藏，兼容Dropdown组件的overlay返回自定义组件menu不隐藏问题
    };

    // 调查表模板ds
    this.templateDs = new DataSet({
      ...templateDS(),
    });

    // 单选按钮ds
    this.radioDs = new DataSet({
      ...indexDS({
        templateDs: this.templateDs,
      }),
    });

    this.registerInTableDs = new DataSet({
      ...tableDS(),
    });
    this.registerInHeaderDs = new DataSet({
      ...headerDS(),
      children: {
        strategyCfLineList: this.registerInTableDs,
      },
    });

    this.registerOutTableDs = new DataSet({
      ...tableDS(),
    });
    this.registerOutHeaderDs = new DataSet({
      ...headerDS(),
      children: {
        strategyCfLineList: this.registerOutTableDs,
      },
    });

    this.bussinessTableDs = new DataSet({
      ...tableDS(),
    });
    this.bussinessHeaderDs = new DataSet({
      ...headerDS(),
      children: {
        strategyCfLineList: this.bussinessTableDs,
      },
    });

    this.bankTableDs = new DataSet({
      ...tableDS(),
    });
    this.bankHeaderDs = new DataSet({
      ...headerDS(),
      children: {
        strategyCfLineList: this.bankTableDs,
      },
    });

    this.contactTableDs = new DataSet({
      ...tableDS(),
    });

    this.contactHeaderDs = new DataSet({
      ...headerDS(),
      children: {
        strategyCfLineList: this.contactTableDs,
      },
    });

    this.addressTableDs = new DataSet({
      ...tableDS(),
    });

    this.addressHeaderDs = new DataSet({
      ...headerDS(),
      children: {
        strategyCfLineList: this.addressTableDs,
      },
    });

    this.invoiceTableDs = new DataSet({
      ...tableDS(),
    });

    this.invoiceHeaderDs = new DataSet({
      ...headerDS(),
      children: {
        strategyCfLineList: this.invoiceTableDs,
      },
    });

    this.financeTableDs = new DataSet({
      ...tableDS(),
    });

    this.financeHeaderDs = new DataSet({
      ...headerDS(),
      children: {
        strategyCfLineList: this.financeTableDs,
      },
    });

    this.attachmentTableDs = new DataSet({
      ...tableDS(),
    });

    this.attachmentHeaderDs = new DataSet({
      ...headerDS(),
      children: {
        strategyCfLineList: this.attachmentTableDs,
      },
    });

    this.otherInfoHeaderDs = new DataSet({
      ...headerDS({ tableTabFlag: false, configName: 'otherInfo' }),
    });
  }

  // 标准表格页签ds
  dsList = [];

  historyModal;

  componentDidMount() {
    this.handleDefaultWebUrl();
  }

  /**
   * 查询默认二级域名
   */
  @Bind()
  handleDefaultWebUrl() {
    this.setState({
      queryUrlLoading: true,
    });
    // 默认查询一条二级域名
    handleDefaultLovData({
      lovCode: 'SPFM.PORTAL_ASSIGN',
    })
      .then(res => {
        if (getResponse(res)) {
          if (res && isArray(res.content)) {
            const firstWebUrl = res.content[0];
            const { assignId, webUrl } = firstWebUrl;
            this.handleQueryHeader({ assignId, webUrl });
          }
        }
      })
      .catch(() => {
        if (!this.radioDs.current) {
          this.radioDs.create({});
        }
      })
      .finally(() => {
        this.setState({
          queryUrlLoading: false,
        });
      });
  }

  // 查询头信息
  @Bind()
  handleQueryHeader({ assignId, webUrl }) {
    // 重置ds集合
    this.dsList = [];
    this.setState({ queryHeaderLoading: true });
    // 处理查询
    return queryHeaderInfo({
      assignId,
    })
      .then(allInfo => {
        if (getResponse(allInfo)) {
          const { strategyCfBasicId, configNameList = [], strategyStatus, versionNum } = allInfo;
          const payload = {
            assignIdLov: {
              assignId,
              webUrl,
            },
            ...allInfo,
          };
          this.radioDs.loadData([payload]);
          // 查询关联调查表模板
          this.handleQueryTemplate({ strategyCfBasicId, assignId });
          // 查询平台tab数据
          this.handleBatchTable({ configNameList, assignId, strategyCfBasicId });
          this.setState({
            assignId,
            headerId: strategyCfBasicId,
            isEdit: strategyStatus !== 'PUBLISHED',
            versionNum,
          });
        }
      })
      .catch(() => {
        if (!this.radioDs.current) {
          this.radioDs.create({});
        }
      })
      .finally(() => {
        this.setState({
          queryHeaderLoading: false,
        });
      });
  }

  // 查询关联调查表模板
  @Bind()
  handleQueryTemplate({ strategyCfBasicId, assignId }) {
    this.templateDs.setQueryParameter('strategyCfBasicId', strategyCfBasicId);
    this.templateDs.setQueryParameter('assignId', assignId);
    this.setState({ queryTemplateLoading: true });
    this.templateDs
      .query()
      .then(res => {
        if (isNil(res)) {
          this.templateDs.loadData([]);
        } else if (getResponse(res)) {
          if (isEmpty(res)) {
            this.templateDs.loadData([]);
          }
        }
      })
      .finally(() => {
        this.setState({ queryTemplateLoading: false });
      });
  }

  // 处理批量表格
  @Bind()
  handleBatchTable(payload = {}) {
    const { configNameList = [], strategyCfBasicId, assignId } = payload;
    // 绑定ds
    const newDsList = (configNameList || []).map(item => {
      if (item === REGISTER_IN) {
        return {
          dataSet: this.registerInHeaderDs,
          configName: REGISTER_IN,
        };
      } else if (item === REGISTER_OUT) {
        return {
          dataSet: this.registerOutHeaderDs,
          configName: REGISTER_OUT,
        };
      } else if (item === BUSSINESS) {
        // 业务信息
        return {
          dataSet: this.bussinessHeaderDs,
          configName: BUSSINESS,
        };
      } else if (item === BANK_ACCOUNT) {
        // 银行
        return {
          dataSet: this.bankHeaderDs,
          configName: BANK_ACCOUNT,
        };
      } else if (item === CONTANT) {
        // 联系人
        return {
          dataSet: this.contactHeaderDs,
          configName: CONTANT,
        };
      } else if (item === ADDRESS) {
        // 地址
        return {
          dataSet: this.addressHeaderDs,
          configName: ADDRESS,
        };
      } else if (item === INVOICE) {
        // 开票
        return {
          dataSet: this.invoiceHeaderDs,
          configName: INVOICE,
        };
      } else if (item === FIN) {
        // 财务
        return {
          dataSet: this.financeHeaderDs,
          configName: FIN,
        };
      } else if (item === ATTACHMENT) {
        // 附件
        return {
          dataSet: this.attachmentHeaderDs,
          configName: ATTACHMENT,
        };
      } else if (item === OTHER) {
        // 其他信息
        return {
          dataSet: this.otherInfoHeaderDs,
          configName: OTHER,
        };
      } else {
        // 空
        return {
          dataSet: null,
          configName: '',
        };
      }
    });
    const queryPromiseList = [];
    newDsList.forEach(item => {
      const { dataSet, configName } = item;
      if (dataSet) {
        const queryInterface = this.handleTableParam({
          dataSet,
          strategyCfBasicId,
          assignId,
          configName,
        });
        queryPromiseList.push(queryInterface);
      }
    });
    if (!isEmpty(queryPromiseList)) {
      this.setState({ queryTabLoading: true });
      Promise.all(queryPromiseList).finally(() => {
        this.setState({ queryTabLoading: false });
      });
    }
    this.dsList = newDsList || [];
  }

  // 平台页签查询
  @Bind()
  handleTableParam(payload = {}) {
    const { dataSet, strategyCfBasicId, assignId, configName = '' } = payload;
    dataSet.setQueryParameter('strategyCfBasicId', strategyCfBasicId);
    dataSet.setQueryParameter('assignId', assignId);
    dataSet.setQueryParameter('configName', configName);
    return dataSet.query();
  }

  @Bind()
  async handleSaveAndPublish(flag = false) {
    const { headerId, assignId } = this.state;

    // 校验头
    const headerValidateFlag = await this.radioDs.validate();
    // 校验调查表模板
    const templateValidateFlag = await this.templateDs.validate();
    // 校验标准表格页签
    const standardValidateList = await this.handleStandardValidate();
    let standardValidateFlag = true;
    (standardValidateList || []).forEach(item => {
      standardValidateFlag = standardValidateFlag && item;
    });

    const headerData = (this.radioDs.current && this.radioDs.current.toJSONData()) || {};
    const templateData = this.templateDs.toData() || [];
    const strategyCfHeaderList = [];
    let payload = {};

    if (headerValidateFlag && templateValidateFlag && standardValidateFlag) {
      // 平台页签数据
      this.dsList.forEach(item => {
        const { dataSet } = item;
        if (dataSet && dataSet.current) {
          const dsData = dataSet.current.toJSONData();
          strategyCfHeaderList.push(dsData);
        }
      });
      if (headerId) {
        // 更新保存
        // 更新调查表模板时，id不传后端批量插入
        const strategyInvestgAssignList = templateData.map(item => {
          const { strategyInvestgAssignId, ...others } = item;
          return others;
        });
        payload = {
          assignId,
          data: {
            ...headerData,
            strategyCfHeaderList,
            strategyInvestgAssignList,
          },
        };
      } else {
        // 新建保存全量数据
        payload = {
          assignId,
          data: {
            ...headerData,
            strategyCfHeaderList,
            strategyInvestgAssignList: templateData,
          },
        };
      }
      // 保存
      return flag ? this.handlePublishData(payload) : this.handleSave(payload);
    } else {
      this.handleValidationErrors();
    }
  }

  // 处理报错提示
  @Bind()
  handleValidationErrors() {
    const standardErrors = [
      {
        subTabName: intl
          .get('sslm.registerPolicy.view.registerPolicy.registerIn')
          .d('登记信息（中国内地）'),
        subDataSet: [this.registerInHeaderDs, this.registerInTableDs],
      },
      {
        subTabName: intl
          .get('sslm.registerPolicy.view.registerPolicy.registerOut')
          .d('登记信息（境外及港澳台）'),
        subDataSet: [this.registerOutHeaderDs, this.registerOutTableDs],
      },
      {
        subTabName: intl
          .get('sslm.registerPolicy.view.registerPolicy.bussinessInfo')
          .d('基础业务信息'),
        subDataSet: [this.bussinessHeaderDs, this.bussinessTableDs],
      },
      {
        subTabName: intl.get('sslm.registerPolicy.view.registerPolicy.bankInfo').d('银行信息'),
        subDataSet: [this.bankHeaderDs, this.bankTableDs],
      },
      {
        subTabName: intl
          .get('sslm.registerPolicy.view.registerPolicy.contactsInfo')
          .d('联系人信息'),
        subDataSet: [this.contactHeaderDs, this.contactTableDs],
      },
      {
        subTabName: intl.get('sslm.registerPolicy.view.registerPolicy.addressInfo').d('地址信息'),
        subDataSet: [this.addressHeaderDs, this.addressTableDs],
      },
      {
        subTabName: intl.get('sslm.registerPolicy.view.registerPolicy.invoiceInfo').d('开票信息'),
        subDataSet: [this.invoiceTableDs, this.invoiceTableDs],
      },
      {
        subTabName: intl.get('sslm.registerPolicy.view.registerPolicy.financeInfo').d('财务信息'),
        subDataSet: [this.financeHeaderDs, this.financeTableDs],
      },
      {
        subTabName: intl
          .get('sslm.registerPolicy.view.registerPolicy.attachmentInfo')
          .d('附件信息'),
        subDataSet: [this.attachmentHeaderDs, this.attachmentTableDs],
      },
      {
        subTabName: intl.get('sslm.registerPolicy.view.registerPolicy.otherInfo').d('其他信息'),
        subDataSet: [this.otherInfoHeaderDs],
      },
    ];
    const errorList = [
      {
        dataSet: this.templateDs,
        tabName: intl
          .get('sslm.registerPolicy.view.registerPolicy.relationInvestiga')
          .d('关联调查表'),
      },
      {
        tabName: intl
          .get('sslm.registerPolicy.view.registerPolicy.enterpriseInfo')
          .d('企业信息页签'),
        dataSet: standardErrors,
      },
      {
        dataSet: this.radioDs,
        tabName: intl
          .get('sslm.registerPolicy.view.registerPolicy.inviteCooperaPolicy')
          .d('邀约合作策略'),
      },
    ];
    getTabValidationErrors(errorList);
  }

  // 保存
  @Bind()
  handleSave(payload) {
    return new Promise(() => {
      this.setState({ saveLoading: true });
      saveData(payload)
        .then(res => {
          if (getResponse(res)) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            const { assignId: id, webUrl } = res;
            this.handleQueryHeader({ assignId: id, webUrl });
          }
        })
        .finally(() => {
          this.setState({
            saveLoading: false,
          });
        });
    });
  }

  // 发布
  @Bind()
  handlePublishData(payload) {
    return new Promise(() => {
      this.setState({ saveLoading: true });
      publishData(payload)
        .then(async res => {
          if (getResponse(res)) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            const { assignId: id, webUrl } = res;
            this.handleQueryHeader({ assignId: id, webUrl });
          }
        })
        .finally(() => {
          this.setState({
            saveLoading: false,
          });
        });
    });
  }

  // 处理标准页签校验
  @Bind()
  handleStandardValidate() {
    const promiseList = (this.dsList || []).map(item => {
      const { dataSet } = item;
      if (dataSet && dataSet.current) {
        return Promise.resolve(dataSet.current.validate());
      } else {
        return Promise.resolve(true);
      }
    });
    return Promise.all(promiseList);
  }

  // url切换
  @Bind()
  handleUrlChange(record = {}) {
    if (isEmpty(record)) {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('sslm.common.view.message.subDomainsNotNull').d('请选择二级域名'),
      });
      return;
    }
    const { assignId, webUrl } = record;
    // 重置数据
    this.radioDs.reset();
    this.setState(
      {
        assignId,
        headerId: null,
      },
      () => {
        this.handleQueryHeader({ assignId, webUrl });
      }
    );
  }

  /**
   * 历史版本详情弹窗
   */
  @Bind()
  handleVersionDetailModal(record = {}) {
    if (isEmpty(record)) {
      return;
    }
    const { assignId, versionNum, strategyCfBasicId } = record;
    Modal.open({
      title: intl
        .get('sslm.registerPolicy.modal.registerPolicy.versionNum', {
          versionNum,
        })
        .d(`版本${versionNum}`),
      drawer: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      closable: false,
      okCancel: false,
      destroyOnClose: true,
      style: { width: 1090 },
      className: styles['policy-version-history-model'],
      children: <VersionDetailModal assignId={assignId} strategyCfBasicId={strategyCfBasicId} />,
      afterClose: () => {
        this.hanldeHistoryVersionHidden(false);
      },
    });
  }

  /**
   * 历史版本详情弹窗
   */
  @Bind()
  handlePublish() {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <div>
          {intl
            .get('sslm.registerPolicy.view.message.publishTips')
            .d(
              '版本发布后在当前域名下注册的销售员，进行企业认证时看到的页面配置将更新为此版本；如果有关联调查表模板，调查表模板也将锁定为发布时的版本。是否确认发布？'
            )}
        </div>
      ),
      onOk: () => {
        this.handleSaveAndPublish(true);
      },
      style: { width: 520 },
    });
  }

  /**
   * 解锁
   */
  @Bind()
  handleUnlock() {
    const { headerId, assignId } = this.state;
    return new Promise(async resolve => {
      this.setState({ queryHeaderLoading: true });
      const payload = {
        assignId,
        strategyCfBasicId: headerId,
      };
      unlockData(payload)
        .then(async res => {
          if (getResponse(res)) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            const { assignId: id, webUrl } = res;
            await this.handleQueryHeader({ assignId: id, webUrl });
            resolve();
          } else {
            resolve();
          }
        })
        .finally(() => {
          this.setState({
            queryHeaderLoading: false,
          });
        });
    });
  }

  /**
   * 导入成功回调
   */
  @Bind()
  hanldeImportSuccessCallBack() {
    this.radioDs.reset();
    this.handleDefaultWebUrl();
  }

  // 获取panel
  @Bind()
  getPanelList() {
    const { assignId, headerId } = this.state;
    const componentProps = {
      basicPolicy: {
        tableDataSet: this.templateDs,
        assignId,
        strategyCfBasicId: headerId,
        policyConfigDs: this.radioDs,
      },
      standardPolicy: {
        registerInHeaderDs: this.registerInHeaderDs,
        registerInTableDs: this.registerInTableDs,
        registerOutHeaderDs: this.registerOutHeaderDs,
        registerOutTableDs: this.registerOutTableDs,
        bussinessHeaderDs: this.bussinessHeaderDs,
        bussinessTableDs: this.bussinessTableDs,
        bankHeaderDs: this.bankHeaderDs,
        bankTableDs: this.bankTableDs,
        contactHeaderDs: this.contactHeaderDs,
        contactTableDs: this.contactTableDs,
        addressHeaderDs: this.addressHeaderDs,
        addressTableDs: this.addressTableDs,
        invoiceHeaderDs: this.invoiceHeaderDs,
        invoiceTableDs: this.invoiceTableDs,
        financeHeaderDs: this.financeHeaderDs,
        financeTableDs: this.financeTableDs,
        attachmentHeaderDs: this.attachmentHeaderDs,
        attachmentTableDs: this.attachmentTableDs,
        otherInfoHeaderDs: this.otherInfoHeaderDs,
      },
      invitePolicy: {
        dataSet: this.radioDs,
        tabKey: 'invitePolicy',
      },
      otherInfo: {
        dataSet: this.radioDs,
        tabKey: 'otherInfo',
      },
    };
    const panelList = getPanel().map(item => {
      const { key } = item;
      return {
        ...item,
        componentProps: componentProps[key],
      };
    });
    return panelList;
  }

  @Bind()
  handleTabsChange(key) {
    this.setState({ activeKey: key });
  }

  /**
   * 历史记录menu显示/隐藏
   */
  @Bind()
  hanldeHistoryVersionHidden(hiddenFlag = true) {
    this.setState({ historyVersionHidden: hiddenFlag });
  }

  render() {
    const {
      queryUrlLoading,
      queryHeaderLoading,
      saveLoading,
      queryTemplateLoading,
      queryTabLoading,
      isEdit,
      versionNum,
      assignId,
      headerId,
      activeKey,
      historyVersionHidden,
    } = this.state;
    const loading =
      queryUrlLoading ||
      queryHeaderLoading ||
      saveLoading ||
      queryTemplateLoading ||
      queryTabLoading;

    return (
      <React.Fragment>
        <Header
          useDefaultTitle={false}
          title={intl
            .get('sslm.registerPolicy.view.title.registerPolicy', {
              versionNum,
            })
            .d(`注册策略配置-版本${versionNum}`)}
        >
          <div className={styles['policy-header-content']}>
            <div className={styles['policy-header-lov']}>
              <Spin spinning={loading}>
                <Lov
                  record={this.radioDs?.current}
                  name="assignIdLov"
                  clearButton={false}
                  searchable={false}
                  onChange={value => this.handleUrlChange(value)}
                />
              </Spin>
            </div>
            <div className={styles['policy-header-btns']}>
              <HeaderBtns
                isEdit={isEdit}
                loading={loading}
                assignId={assignId}
                headerId={headerId}
                versionNum={versionNum}
                historyVersionHidden={historyVersionHidden}
                handleSaveAndPublish={this.handleSaveAndPublish}
                handlePublish={this.handlePublish}
                importSuccessCallBack={this.hanldeImportSuccessCallBack}
                handleUnlock={this.handleUnlock}
                handleVersionDetailModal={this.handleVersionDetailModal}
                hanldeHistoryVersionHidden={this.hanldeHistoryVersionHidden}
              />
            </div>
          </div>
        </Header>
        {!versionNum && (
          <Alert
            closable
            showIcon
            type="info"
            className={styles['header-alert']}
            message={intl
              .get('sslm.registerPolicy.modal.registerPolicy.headerConfimMsg')
              .d('当前域名未创建对应的租户级策略，将执行平台默认规则')}
          />
        )}
        <Content className={styles['policy-all-content']}>
          <Spin spinning={loading}>
            <Tabs
              tabPosition="left"
              customizable={false}
              activeKey={activeKey}
              onChange={this.handleTabsChange}
            >
              {this.getPanelList().map(panel => {
                const { tab, key, componentProps } = panel;
                return (
                  <TabPane forceRender tab={tab} key={key}>
                    <panel.component {...componentProps} isEdit={isEdit} />
                  </TabPane>
                );
              })}
            </Tabs>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
