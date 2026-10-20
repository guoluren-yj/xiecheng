/*
 * Create - 调查表创建-详情
 * @date: 2020/10/26 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Spin, Modal } from 'choerodon-ui/pro';
import { routerRedux } from 'dva/router';
import { Card, Alert } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { isArray } from 'lodash';
import querystring from 'querystring';
import remote from 'utils/remote';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import TempatePreview from '@/routes/components/Investigation';
import {
  fetchLifeCycleDimConfigs,
  getUserDefaultMsg,
  investigateCreateAndRelease,
  investigateCreate,
} from '@/services/investigationCreateService';
import { querySupplierInfo } from '@/services/commonService';

import HeaderBtns from './HeaderBtns';
import { getCreateHeaderDS, getCreateTableDS } from './stores/indexDS';
import CreateHeader from '../components/CreateHeader';
import CreateTable from '../components/CreateTable';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();

/**
 * 调查表创建-详情
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
    'sslm.common',
    'sslm.investDefOrg',
    'sslm.investTempConfig',
    'spfm.investigationDefinition',
    'sslm.investMaintain',
  ],
})
@WithCustomize({
  unitCode: [
    'SSLM.INVESTIGATION_WORKBENCH_DETAIL.CREATE_HEADER',
    'SSLM.INVESTIGATION_WORKBENCH_DETAIL.CREATE_BUTTON',
    'SSLM.INVESTIGATION_WORKBENCH_DETAIL.CREATE_TABLE',
  ],
})
@remote(
  {
    code: 'SSLM_PURCHASER_INVESTIGATION_CREATE', // 对应二开模块暴露的Expose的编码
    name: 'investigationCreateRemote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    events: {
      cuxHandleRelease() {}, // 二开发布按钮逻辑
      cuxHandleSave() {}, // 二开保存
    },
  }
)
export default class Create extends Component {
  constructor(props) {
    super(props);
    const { investigationCreateRemote } = props;
    const routerParams = querystring.parse(props.location.search.substr(1));
    const {
      companyId,
      supplierCompanyId,
      sourceType,
      riskEventNum,
      riskProcessUuid,
    } = routerParams;
    this.state = {
      loading: false,
      investigateTemplateId: '',
      companyId,
      sourceType,
      riskEventNum,
      riskProcessUuid,
      supplierCompanyId,
      isAmktClient: sourceType === 'AMKT_CLIENT', // 单据来源为应用商店
    };
    // 标准头ds
    const dsProps = {
      ...getCreateHeaderDS(),
      events: {
        update: ({ record, name, value }) => {
          if (name === 'investigateLevel') {
            record.set({
              companyIdLov: null,
              investigateType: null,
              investigateTemplateIdLov: null,
            });
          }
          if (name === 'companyIdLov') {
            record.set({
              investigateType: null,
              investigateTemplateIdLov: null,
            });
          }
          if (name === 'investigateType') {
            record.set({
              investigateTemplateIdLov: null,
            });
          }
          this.handleUpdateTemplate(name, value);
        },
      },
    };
    // 埋点修改后的ds属性
    const headerDsProps = investigationCreateRemote
      ? investigationCreateRemote.process(
          'SSLM_PURCHASER_INVESTIGATION_CREATE_PROCESS',
          dsProps,
          {}
        )
      : dsProps;
    this.headerDs = new DataSet(headerDsProps);
    this.tableDs = new DataSet(getCreateTableDS());
  }

  componentDidMount() {
    const { companyId, supplierCompanyId, sourceType } = this.state;
    this.handleCommonConfig();
    if (companyId || supplierCompanyId) {
      this.handleSupplierInfo({ companyId, supplierCompanyId, sourceType });
    }
  }

  getSnapshotBeforeUpdate(prevProps) {
    const thisParams = querystring.parse(this.props.location.search.substr(1));
    const prevParams = querystring.parse(prevProps.location.search.substr(1));
    const { companyId, supplierCompanyId, sourceType } = thisParams;
    const { companyId: prevCompanyId, supplierCompanyId: prevSupplierCompanyId } = prevParams;
    if (companyId !== prevCompanyId || supplierCompanyId !== prevSupplierCompanyId) {
      return { companyId, supplierCompanyId, sourceType };
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot && (snapshot.companyId || snapshot.supplierCompanyId)) {
      this.handleSupplierInfo(snapshot);
    }
  }

  // 工作台行新建查询信息
  @Bind()
  handleSupplierInfo(payload) {
    querySupplierInfo(payload).then(response => {
      const res = getResponse(response);
      if (res) {
        const {
          dimensionCode,
          companyId,
          companyName,
          realName,
          supplierCompanyNum,
          supplierCompanyName,
        } = res;
        let investigateLevelData = dimensionCode === 'BOTH' ? undefined : dimensionCode;
        if (this.headerDs.current) {
          const investigateLevel = this.headerDs.current.get('investigateLevel');
          if (investigateLevel) {
            investigateLevelData = investigateLevel; // 有个性化默认值的情况则用个性化默认值
          }
        }
        const headerData = {
          ...res,
          companyId: null,
          companyName: null,
          createUserName: realName,
          investigateLevel: investigateLevelData,
          companyIdLov: dimensionCode === 'COMPANY' ? { companyId, companyName } : null,
        };
        const lineData = [
          {
            ...res,
            companyNum: supplierCompanyNum,
            companyName: supplierCompanyName,
            partnerContactor: {
              mobilephone: res.phone,
              name: res.partnerContactor,
              mail: res.partnerContactMail,
              internationalTelCode: res.internationalTelCode,
            },
          },
        ];
        this.headerDs.create(headerData);
        this.tableDs.loadData(lineData);
      }
    });
  }

  /**
   * 模板预览
   */
  @Bind()
  handlePreview() {
    const { investigateTemplateId } = this.state;
    Modal.open({
      title: intl.get(`spfm.investigationDefinition.view.message.title.preview`).d('预览调查表'),
      drawer: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <Fragment>
          <Alert
            banner
            showIcon
            closable
            type="info"
            iconType="help"
            message={intl
              .get('sslm.investDefOrg.view.message.previewSupplierWrite')
              .d('预览供应商将填写的调查表内容')}
            className={styles['investigate-create-preview-banner']}
          />
          <TempatePreview
            investigateTemplateId={investigateTemplateId}
            previewFlag
            showTabBar={false}
            isModalFlag
            tableStyle={{ maxHeight: 'calc(100vh - 400px)' }}
          />
        </Fragment>
      ),
      style: { width: 1090 },
      bodyStyle: {
        overflow: 'hidden',
        // paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 0,
      },
      className: styles['investigate-create-preview'],
    });
  }

  /**
   * 更新模板
   */
  @Bind()
  handleUpdateTemplate(name, value) {
    let investigateTemplateId = '';
    switch (name) {
      case 'investigateLevel':
      case 'companyIdLov':
      case 'investigateType':
        investigateTemplateId = '';
        break;
      case 'investigateTemplateIdLov': {
        const { investigateTemplateId: newInvestigateTemplateId } = value || {};
        investigateTemplateId = newInvestigateTemplateId;
        break;
      }
      default:
        break;
    }
    this.setState({
      investigateTemplateId,
    });
  }

  /**
   * 查询配置
   */
  @Bind()
  handleCommonConfig() {
    this.setState({
      loading: true,
    });
    Promise.all([
      // 管控维度
      fetchLifeCycleDimConfigs(),
      // 所属部门
      getUserDefaultMsg(),
    ])
      .then(async res => {
        const [dimensionInfo, userInfo] = res;
        await this.createHeaderDs();
        if (getResponse(dimensionInfo)) {
          const { dimensionCode } = dimensionInfo;
          if (this.headerDs.current) {
            const investigateLevel = this.headerDs.current.get('investigateLevel');
            if (!investigateLevel) {
              // 有个性化默认值的情况则用个性化默认值
              const defaultValueObj = {
                investigateLevel: dimensionCode === 'BOTH' ? undefined : dimensionCode,
              };
              this.headerDs.current.set(filterNullValueObject(defaultValueObj));
            }
          }
        }
        if (getResponse(userInfo)) {
          const { realName, unitName } = userInfo;
          this.headerDs.current.set({
            createUserName: realName,
            unitName,
          });
        }
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  @Bind()
  async createHeaderDs() {
    const { investigationCreateRemote } = this.props;
    // 埋点 修改后的初始化ds方法
    if (investigationCreateRemote.event) {
      const eventProps = {
        dataSet: this.headerDs,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await investigationCreateRemote.event.fireEvent('cuxCreateHeaderDs', eventProps);
      if (!res) {
        return;
      }
    }
    this.headerDs.create();
  }

  /**
   * 保存表格中lov选择的数据，新建
   * @param {object} record --点击lov后对应一行的值
   * @param {boolean} flag --是否编辑
   */
  @Bind()
  saveRecordRows(record = []) {
    const oldData = this.tableDs.toData();
    // 最终数据
    let result = oldData;
    // 判断是否是新增的数据且判断历史数据与新增数据是否一致
    const flagList = [];
    oldData.forEach(e => {
      record.forEach(ele => {
        if (e.companyNum === ele.companyNum) {
          flagList.push(ele);
        }
      });
    });
    if (flagList.length < 1) {
      record.forEach(item => {
        result.push(item);
      });
    } else {
      result = result.filter(item => item.companyNum);
      notification.warning({
        message: intl
          .get('sslm.investMaintain.view.message.investMaintain.repetition')
          .d('不可选择已存在供应商'),
      });
    }
    this.tableDs.loadData([]);
    result.forEach(i => {
      this.tableDs.create(i);
    });
  }

  /**
   * 确定保存并发布提示框
   */
  @Bind()
  handleClickRelease() {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.investMaintain.view.message.warningContent').d('确定保存并发布吗?'),
      onOk: () => {
        return new Promise(resolve => {
          this.handlerData('release');
          resolve();
        }).catch(() => {});
      },
    });
  }

  // 保存
  @Bind()
  handleClickSave() {
    this.handlerData('save');
  }

  // 处理数据
  @Bind()
  async handlerData(type = '') {
    const { sourceType, riskEventNum, riskProcessUuid } = this.state;
    const headerValidateFlag = await this.headerDs.current.validate();
    const lineValidateFlag = await this.tableDs.validate();
    if (headerValidateFlag && lineValidateFlag) {
      const lineData = this.tableDs.toData();
      if (Array.isArray(lineData) && lineData.length === 0) {
        notification.warning({
          message: intl
            .get('sslm.investMaintain.view.message.noData')
            .d('请至少选择一项需调查的供应商'),
        });
        return;
      }
      const headerData = this.headerDs.current.toJSONData();
      const otherValue = {
        finalFlag: '',
        investgNumber: '',
        partnerRemark: '',
        processDate: undefined,
        releaseDate: undefined,
        submitDate: undefined,
        tenantId: organizationId,
        triggerByCode: '',
        triggerById: '',
      };
      const finalLineData = lineData.map(item => {
        const copyList = {
          ...item,
          ...headerData,
          ...otherValue,
          sourceType,
          riskEventNum,
          riskProcessUuid,
        };
        // eslint-disable-next-line
        delete copyList[`buildDate`];
        // eslint-disable-next-line
        delete copyList[`createUserName`];
        return copyList;
      });
      const payload = {
        body: finalLineData,
        organizationId,
        customizeUnitCode: [
          'SSLM.INVESTIGATION_WORKBENCH_DETAIL.CREATE_HEADER',
          'SSLM.INVESTIGATION_WORKBENCH_DETAIL.CREATE_TABLE',
        ].join(),
      };
      if (type === 'save') {
        this.handleSave(payload);
      } else if (type === 'release') {
        this.handleRelease(payload);
      }
    }
  }

  @Bind()
  async handleRelease(params) {
    // 发布前执行二开代码
    const { modal, investigationCreateRemote } = this.props;
    const { isAmktClient } = this.state;
    const otherParam = {
      headerDs: this.headerDs,
    };
    const payload = investigationCreateRemote
      ? investigationCreateRemote.process(
          'SSLM_PURCHASER_INVESTIGATION_CREATE_SUBMIT_PROCESS',
          params,
          otherParam
        )
      : params;
    if (investigationCreateRemote?.event) {
      const eventProps = {
        ...payload,
        setLoading: flag => {
          this.setState({
            loading: flag,
          });
        },
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await investigationCreateRemote.event.fireEvent('cuxHandleRelease', eventProps);
      if (!res) {
        return;
      }
    }
    this.setState({
      loading: true,
    });
    investigateCreateAndRelease(payload)
      .then(res => {
        if (getResponse(res)) {
          if (isAmktClient) {
            if (modal) {
              modal.close();
            }
          } else {
            // 返回列表页
            this.handleBackList();
          }
        }
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  @Bind()
  async handleSave(params) {
    const { investigationCreateRemote } = this.props;
    const otherParam = {
      headerDs: this.headerDs,
    };
    const payload = investigationCreateRemote
      ? investigationCreateRemote.process(
          'SSLM_PURCHASER_INVESTIGATION_CREATE_SAVE_PROCESS',
          params,
          otherParam
        )
      : params;

    // 埋点
    if (investigationCreateRemote.event) {
      const eventProps = {
        saveParam: payload,
        setLoading: (flag = false) => {
          this.setState({
            loading: flag,
          });
        },
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await investigationCreateRemote.event.fireEvent('cuxHandleSave', eventProps);
      if (!res) {
        return;
      }
    }
    this.setState({
      loading: true,
    });
    investigateCreate(payload)
      .then(res => {
        if (getResponse(res)) {
          // 只有一行供应商，跳转待发布页
          const lineData = this.tableDs.toData();
          if (lineData.length === 1) {
            const reslut = isArray(res) ? res[0] : {};
            this.handleGoToDatail(reslut);
          } else {
            this.handleBackList();
          }
        }
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  // 返回列表页
  @Bind()
  handleBackList() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/purchaser-investigation/list`,
      })
    );
  }

  // 跳转待发布详情
  @Bind()
  handleGoToDatail(reslut = {}) {
    const { dispatch } = this.props;
    const { investgHeaderId, investigateTemplateId } = reslut || {};
    const search = querystring.stringify({
      type: 'edit',
    });
    // 跳转
    dispatch(
      routerRedux.push({
        pathname: `/sslm/purchaser-investigation/wait-release/detail/${investgHeaderId}/${investigateTemplateId}`,
        search,
      })
    );
  }

  render() {
    const {
      customizeForm,
      customizeBtnGroup,
      customizeTable,
      custLoading,
      investigationCreateRemote,
    } = this.props;
    const { loading, isAmktClient, investigateTemplateId } = this.state;
    const allLoading = loading;
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.investDefOrg.view.title.createInvestigate').d('调查表创建')}
          backPath={isAmktClient ? '' : '/sslm/purchaser-investigation/list'}
        >
          <HeaderBtns
            loading={loading}
            headerDs={this.headerDs}
            isAmktClient={isAmktClient}
            remote={investigationCreateRemote}
            customizeBtnGroup={customizeBtnGroup}
            investigateTemplateId={investigateTemplateId}
            onPreview={this.handlePreview}
            onRelease={this.handleClickRelease}
            onGenerateInvestigate={this.handleClickSave}
          />
        </Header>
        <React.Fragment>
          <Content
            className={styles['purchaser-investigate-all-content']}
            wrapperClassName={styles['page-content-wrap']}
          >
            <Spin spinning={allLoading}>
              <div className={styles['purchaser-investigate-create']}>
                <Card bordered={false}>
                  <div className={styles['purchaser-investigate-title']}>
                    {intl
                      .get('sslm.investDefOrg.view.investDefOrg.investigateInfo')
                      .d('调查表信息')}
                  </div>
                  <CreateHeader
                    dataSet={this.headerDs}
                    tableDs={this.tableDs}
                    isAmktClient={isAmktClient}
                    customizeForm={customizeForm}
                  />
                </Card>
                <Card bordered={false}>
                  <div className={styles['purchaser-investigate-title']}>
                    {intl.get('sslm.investMaintain.view.option.tabTileOne').d('选择调查的供应商')}
                  </div>
                  <CreateTable
                    tableDs={this.tableDs}
                    headerDs={this.headerDs}
                    custLoading={custLoading}
                    isAmktClient={isAmktClient}
                    customizeTable={customizeTable}
                    onSaveRecordRows={this.saveRecordRows}
                    investigationCreateRemote={investigationCreateRemote}
                  />
                </Card>
              </div>
            </Spin>
          </Content>
        </React.Fragment>
      </React.Fragment>
    );
  }
}
