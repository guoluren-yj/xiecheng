/*
 * VersionDetailModal - 历史版本详情弹窗
 * @date: 2022/06/06 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, isValidElement, cloneElement } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet } from 'choerodon-ui/pro';
import { Spin, Tabs } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import classnames from 'classnames';

import { queryHeaderInfo } from '@/services/registerPolicyConfig';
import { indexDS, templateDS } from '../stores/indexDS';
import { headerDS, tableDS } from '../stores/StandardConfigDS';
import { getPanel } from '../utils/utils';

import styles from '../index.less';

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

export default class VersionDetailModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queryLoading: false, // 头查询
      activeKey: 'basicPolicy',
      headerInfo: {},
    };
    // 单选按钮ds
    this.radioDs = new DataSet({
      ...indexDS(),
    });

    // 调查表模板ds
    this.templateDs = new DataSet({
      ...templateDS(),
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
      ...headerDS(),
    });
  }

  componentDidMount() {
    this.handleQueryHeader();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { assignId: oldAssignId, strategyCfBasicId: oldStrategyCfBasicId } = prevProps;
    const { assignId, strategyCfBasicId } = this.props;
    const changeFlag =
      (!!oldAssignId && oldAssignId !== assignId) ||
      (!!oldStrategyCfBasicId && oldStrategyCfBasicId !== strategyCfBasicId);
    return changeFlag;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleQueryHeader();
    }
  }

  // 查询头信息
  @Bind()
  handleQueryHeader() {
    const { assignId, strategyCfBasicId, isPlatform = false, tenantId } = this.props;
    // 重置ds集合
    this.dsList = [];
    this.setState({ queryLoading: true });
    // 处理查询
    queryHeaderInfo({
      assignId,
      strategyCfBasicId,
      isPlatform,
      tenantId,
    })
      .then(allInfo => {
        if (getResponse(allInfo)) {
          const { configNameList = [], hasTemplateFlag, ...others } = allInfo;
          const payload = {
            ...others,
          };
          if (this.radioDs.current) {
            this.radioDs.current.set(payload);
          } else {
            this.radioDs.create(payload);
          }
          // 查询关联调查表模板
          this.handleQueryTemplate({ strategyCfBasicId, assignId });
          // 有租户级配置
          if (strategyCfBasicId) {
            // 动态查询平台表格
            this.handleBatchTable({ configNameList, assignId, strategyCfBasicId });
          }
          this.setState({
            headerInfo: allInfo,
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
          queryLoading: false,
        });
      });
  }

  // 查询关联调查表模板
  @Bind()
  handleQueryTemplate({ strategyCfBasicId, assignId }) {
    const { isPlatform = false, tenantId } = this.props;
    this.templateDs.setState('isPlatform', isPlatform);
    this.templateDs.setQueryParameter('strategyCfBasicId', strategyCfBasicId);
    this.templateDs.setQueryParameter('assignId', assignId);
    this.templateDs.setQueryParameter('tenantId', tenantId);
    this.templateDs.query();
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
    newDsList.forEach(item => {
      const { dataSet, configName } = item;
      if (dataSet) {
        this.handleTableParam({ dataSet, strategyCfBasicId, assignId, configName });
      }
    });
    this.dsList = newDsList || [];
  }

  // 平台页签查询
  @Bind()
  handleTableParam(payload = {}) {
    const { dataSet, strategyCfBasicId, assignId, configName = '' } = payload;
    const { isPlatform, tenantId } = this.props;
    dataSet.setState('isPlatform', isPlatform);
    dataSet.setQueryParameter('tenantId', tenantId);
    dataSet.setQueryParameter('strategyCfBasicId', strategyCfBasicId);
    dataSet.setQueryParameter('assignId', assignId);
    dataSet.setQueryParameter('configName', configName);
    dataSet.query();
  }

  // 获取panel
  @Bind()
  getPanelList() {
    const componentProps = {
      basicPolicy: {
        tableDataSet: this.templateDs,
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

  render() {
    const { queryLoading, activeKey, headerInfo = {} } = this.state;
    const { versionNum } = headerInfo;
    const { headerComponentProps = {} } = this.props;
    const {
      showHeader = false,
      backPath = '',
      title = intl
        .get('sslm.registerPolicy.view.title.registerPolicy', { versionNum })
        .d(`注册策略配置-版本${versionNum}`),
      btnComp = null,
    } = headerComponentProps;

    return (
      <React.Fragment>
        {showHeader && (
          <Header title={title} backPath={backPath}>
            {isValidElement(btnComp) ? cloneElement(btnComp) : null}
          </Header>
        )}
        <Content
          className={classnames({
            [styles['policy-all-content']]: true,
            [styles['policy-all-content-header']]: showHeader,
          })}
        >
          <Spin spinning={queryLoading}>
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
                    <panel.component {...componentProps} isEdit={false} />
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
