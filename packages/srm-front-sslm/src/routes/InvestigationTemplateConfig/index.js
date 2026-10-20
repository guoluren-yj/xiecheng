/*
 * InvestigationTemplateConfig - 调查表模板配置
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import { DataSet, Modal, Button, Icon, TextField, Spin } from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';

import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import {
  queryUpdateTemplateId,
  handleEffect,
  handleUnlock,
  investigateTemptCopy,
  changeInvestigate,
  importTempDetail,
  saveApplicableFunction,
} from '@/services/orgInvestigateTemplateService';

import AssignCompany from '@/routes/components/AssignCompany';
import MoreButton from '@/routes/components/MoreButton';

import HistoryVersion from './components/HistoryVersion';
import { listDS } from './stores/indexDS';

// import styles from './index.less';

/**
 * 调查表模板配置
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
    'spfm.rulesDefinition',
    'spfm.investigationDefinition',
    'sslm.supplierModelDefine',
  ],
})
@WithCustomize({
  unitCode: ['SSLM.INVESTIGATION_TEMP_CONFIG.LIST_TABLE'],
})
@withProps(
  () => {
    const listDs = new DataSet({
      ...listDS(),
    });
    return {
      listDs,
    };
  },
  { cacheState: true }
)
export default class InvestigationTemplateConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageChacheFlag: true,
    };
  }

  // 分配公司
  @Bind()
  handleAllocateCompany({ record }) {
    const { listDs } = this.props;
    Modal.open({
      drawer: true,
      closable: false,
      destroyOnClose: true,
      style: { width: 742 },
      // okText: intl.get('hzero.common.button.save').d('保存'),
      title: intl.get(`sslm.investTempConfig.view.button.allocateCompany`).d('分配公司'),
      children: (
        <AssignCompany
          record={record}
          onRef={node => {
            this.allocateCompanyRef = node;
          }}
        />
      ),
      onOk: () => {
        const investigateTemplateId = record.get('investigateTemplateId');
        const assignMenuScope =
          this.allocateCompanyRef &&
          this.allocateCompanyRef.current &&
          this.allocateCompanyRef.current.get('assignMenuScope');
        const payload = {
          investigateTemplateId,
          assignMenuScope: assignMenuScope && assignMenuScope.join(),
        };
        return new Promise((resolve, reject) => {
          saveApplicableFunction(payload).then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              listDs.query(listDs.currentPage);
              resolve();
            } else {
              reject();
            }
          });
        });
      },
    });
  }

  /**
   * 跳转详情
   */
  @Bind()
  handleGoToDetail(record, type = '') {
    const { dispatch } = this.props;
    const { investigateTemplateId } = record.get(['investigateTemplateId']);
    queryUpdateTemplateId(investigateTemplateId).then(res => {
      if (getResponse(res)) {
        const oldInvestigateTemplateId = res;
        // 查看页增加参数
        const search =
          type === 'view'
            ? querystring.stringify({
                sourceNewTemplateId: investigateTemplateId,
                sourceOldTemplateId: oldInvestigateTemplateId,
              })
            : '';
        // 跳转
        dispatch(
          routerRedux.push({
            pathname: `/sslm/investigation-template-config/detail/${investigateTemplateId}/${oldInvestigateTemplateId}/${type}`,
            search,
          })
        );
      }
    });
  }

  /**
   * 获取列按钮
   */
  @Bind()
  getColumnBtn(record) {
    const { dispatch } = this.props;
    const { releaseFlag, enabledFlag, versionNumber, latestFlag } = record.get([
      'releaseFlag',
      'enabledFlag',
      'versionNumber',
      'latestFlag',
    ]);
    // 已发布
    const published = releaseFlag === 1;
    // 已启用
    const enabled = enabledFlag === 1;
    const btns = enabled
      ? [
          {
            hidden: published,
            child: intl.get('hzero.common.view.button.edit').d('编辑'),
            onClick: () => this.handleGoToDetail(record, 'edit'),
          },
          {
            hidden: published,
            child: intl.get('hzero.common.button.release').d('发布'),
            onClick: () => this.handleLineRelease(record),
          },
          {
            child: intl.get('hzero.common.button.copy').d('复制'),
            onClick: () => this.handleTemplateCopy(record),
          },
          {
            // 未发布，已发布已经解锁过的隐藏
            hidden: !published || (published && latestFlag !== 'Y'),
            child: intl.get('hzero.common.view.button.edit').d('编辑'),
            onClick: () => this.handleLineUnlock(record),
          },
          {
            // 未发布隐藏
            hidden: !published,
            child: intl.get('hzero.common.status.disable').d('禁用'),
            onClick: () => this.handleSave(0, record),
          },
          {
            child: intl.get('sslm.investTempConfig.view.button.allocateCompany').d('分配公司'),
            onClick: () => this.handleAllocateCompany({ record }),
          },
          {
            hidden: versionNumber === 1,
            isMenu: true,
            child: <HistoryVersion record={record} dispatch={dispatch} />,
          },
        ]
      : [
          {
            child: intl.get('hzero.common.button.enable').d('启用'),
            onClick: () => this.handleSave(1, record),
          },
        ];
    return btns.filter(btn => !btn.hidden);
  }

  // 发布
  @Debounce(200)
  @Bind()
  handleLineRelease(record) {
    const { listDs } = this.props;
    const { reserveFlag, investigateTemplateId } =
      record.get(['reserveFlag', 'investigateTemplateId']) || {};
    const payload = {
      reserveFlag,
      investigateTemplateId,
      customizeUnitCode: '',
      noInsertFlag: 1,
    };
    this.setState({
      loading: true,
    });
    handleEffect(payload)
      .then(res => {
        if (getResponse(res)) {
          notification.success();
          listDs.query();
        }
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  // 解锁
  @Debounce(200)
  @Bind()
  handleLineUnlock(record) {
    const { dispatch } = this.props;
    const investigateTemplateId = record.get('investigateTemplateId');
    const payload = {
      investigateTemplateId,
    };
    let templateInfo = {};
    this.setState({
      loading: true,
    });
    handleUnlock(payload)
      .then(res => {
        if (getResponse(res)) {
          templateInfo = res;
        }
      })
      .finally(() => {
        const { investigateTemplateId: newTemplateId } = templateInfo;
        this.setState({
          loading: false,
        });
        if (newTemplateId) {
          // 跳转
          dispatch(
            routerRedux.push({
              pathname: `/sslm/investigation-template-config/detail/${newTemplateId}/${newTemplateId}/edit`,
            })
          );
        }
      });
  }

  // 复制
  @Debounce(200)
  @Bind()
  handleTemplateCopy(record = {}) {
    const { listDs } = this.props;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.investTempConfig.view.message.copyTemplateTips')
        .d('是否复制此调查表模板生成一张新调查表模板？'),
      onOk: () => {
        const investigateTemplateId = record.get('investigateTemplateId');
        const payload = {
          investigateTemplateId,
        };
        this.setState({
          loading: true,
        });
        return investigateTemptCopy(payload)
          .then(res => {
            if (getResponse(res)) {
              notification.success();
              listDs.query();
            }
          })
          .finally(() => {
            this.setState({
              loading: false,
            });
          });
      },
    });
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'customStatus',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'action',
        width: 180,
        renderer: ({ record }) => {
          const buttons = this.getColumnBtn(record);
          return <MoreButton buttons={buttons} />;
        },
      },
      {
        name: 'templateCode',
        width: 120,
        renderer: ({ record }) => {
          const { templateCode } = record.get(['templateCode']);
          return (
            <a
              onClick={() => {
                this.handleGoToDetail(record, 'view');
              }}
            >
              {templateCode}
            </a>
          );
        },
      },
      {
        name: 'templateName',
      },
      {
        name: 'versionNumber',
        align: 'right',
        width: 80,
      },
      {
        name: 'investigateType',
      },
      {
        name: 'creationDate',
        width: 140,
      },
      {
        name: 'creator',
      },
      // {
      //   name: 'enabledFlag',
      //   width: 80,
      //   renderer: ({ value }) => {
      //     return enableRender(value);
      //   },
      // },
    ];
    return columns;
  }

  // 查询
  @Bind()
  handleQuery(queryProps = {}) {
    const { listDs } = this.props;
    const { pageChacheFlag } = this.state;
    const { params = {} } = queryProps;
    if (listDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = listDs.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['likeInvestigateTemplate'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      listDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        listDs.query(listDs.currentPage);
      } else {
        listDs.query();
      }
    } else {
      listDs.query();
    }
  }

  // 筛选器左侧渲染
  @Bind()
  renderLeftSearchBar() {
    const { listDs } = this.props;
    return (
      <TextField
        clearButton
        style={{ width: 250 }}
        valueChangeAction="blur"
        onChange={value => {
          // eslint-disable-next-line no-unused-expressions
          listDs.queryDataSet?.current?.set('likeInvestigateTemplate', value);
          listDs.query();
        }}
        value={listDs.queryDataSet?.current?.get('likeInvestigateTemplate')}
        placeholder={intl
          .get('sslm.investDefOrg.model.investDefOrg.investigateLikeQuery')
          .d('请输入调查表模板名称，编码查询')}
        prefix={<Icon type="search" style={{ fontSize: 14, paddingLeft: 12 }} />}
      />
    );
  }

  // 清空、重置回调
  @Bind()
  clearValues() {
    const { listDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    listDs.queryDataSet?.current.reset();
  }

  /**
   * 保存修改的数据
   */
  @Bind()
  @Debounce(200)
  async handleSave(value, record) {
    const { listDs } = this.props;
    // 校验
    const validateFlag = await record.validate();
    if (validateFlag) {
      const currentData = record.toJSONData();
      const saveData = [
        {
          ...currentData,
          enabledFlag: value,
        },
      ];
      const payload = {
        addList: saveData,
        customizeUnitCode: 'SSLM.INVESTIGATION_TEMP_CONFIG.LIST_TABLE',
      };
      this.setState({
        loading: true,
      });
      changeInvestigate(payload)
        .then(res => {
          if (getResponse(res)) {
            notification.success();
            listDs.query();
          }
        })
        .finally(() => {
          this.setState({
            loading: false,
          });
        });
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/investigation-template-config/create`,
      })
    );
  }

  // 导入前的校验
  @Bind()
  handleBeforeUpload(file) {
    this.setState({ loading: true });
    const formData = new FormData();
    formData.append('file', file, file.name);
    importTempDetail(formData)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });
    return false;
  }

  render() {
    const { listDs, customizeTable } = this.props;
    const { loading } = this.state;
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.investTempConfig.view.title.investTempConfig').d('调查表模板配置')}
        >
          <Button
            icon="add"
            type="c7n-pro"
            color="primary"
            loading={loading}
            onClick={() => this.handleCreate()}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Upload
            accept=".xls,.xlsx"
            beforeUpload={this.handleBeforeUpload}
            showUploadList={false}
            onSuccess={this.handleQuery}
          >
            <Button
              icon="archive"
              type="c7n-pro"
              funcType="flat"
              loading={loading}
              permissionList={[
                {
                  code: `srm.partner.investigation-template-config-workbench.button.list-import`,
                  type: 'button',
                  meaning: '调查表模板配置-导入',
                },
              ]}
            >
              {intl.get('hzero.common.button.import').d('导入')}
            </Button>
          </Upload>
        </Header>
        <Content>
          <Spin spinning={loading}>
            <div style={{ height: tableHeight.fixedHeight }}>
              {customizeTable(
                {
                  code: 'SSLM.INVESTIGATION_TEMP_CONFIG.LIST_TABLE',
                },
                <SearchBarTable
                  cacheState
                  dataSet={listDs}
                  columns={this.getColumns()}
                  searchCode="SSLM.INVESTIGATION_TEMP_CONFIG.SEARCH_BAR"
                  style={{ maxHeight: tableMaxHeight.fixedHeight }}
                  searchBarConfig={{
                    editorProps: {},
                    left: {
                      render: () => this.renderLeftSearchBar(),
                    },
                    onQuery: queryProps => this.handleQuery(queryProps),
                    onReset: () => this.clearValues(),
                    onClear: () => this.clearValues(),
                    onFieldChange: () => {
                      this.setState({
                        pageChacheFlag: false,
                      });
                    },
                  }}
                />
              )}
            </div>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
