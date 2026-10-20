/**
 * DocManage - 考评档案管理
 * @date: 2019-1-10
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Modal } from 'choerodon-ui/pro';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import DynamicButtons from '_components/DynamicButtons';

import { Button } from 'components/Permission';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import remote from 'utils/remote';
import { filterNullValueObject, getUserOrganizationId, getResponse } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { dealCopy } from '@/services/evaluationDocManageService';
import Search from './Search.js';
import List from './List.js';
import PeopleNotScore from './PeopleNotScore';

/**
 * @class DocManage - 考评档案管理组件
 * @extends {Comopnent} - React.Component
 * @reactProps {object} evaluationDocManage - 数据源
 * @reactProps {boolean} searchLoading - 查询请求
 * @reactProps {boolean} deleteListLoading - 查询请求
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @returns React.element
 */
@connect(({ evaluationDocManage, loading }) => ({
  evaluationDocManage,
  searchLoading: loading.effects['evaluationDocManage/search'],
  deleteListLoading: loading.effects['evaluationDocManage/deleteRecords'],
  scoreCuiBanLoading: loading.effects['evaluationDocManage/scoreCuiBan'],
}))
@formatterCollections({
  code: ['sslm.supplierDocManage'],
})
@withCustomize({
  unitCode: [
    'SSLM.EVALUATION_DOC_MANAGE_LIST.FILTER',
    'SSLM.EVALUATION_DOC_MANAGE_LIST.LIST',
    'SSLM.EVALUATION_DOC_MANAGE_LIST.HEADER_BTNS',
  ],
})
@remote(
  {
    code: 'SSLM.EVALUATION_MANAGE_LIST',
    name: 'evaluationManageRemote',
  },
  {
    events: {
      cuxHandleDestroy() {}, // 二开废弃按钮逻辑
    },
  }
)
export default class DocManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      cuxBtnLoading: false,
    };
  }

  getSnapshotBeforeUpdate() {
    const {
      evaluationDocManage: { pagination },
      custLoading,
    } = this.props;
    if (!this.custFlag && !custLoading) {
      this.handleSearch(pagination);
      this.custFlag = true;
    }
  }

  /**
   * 渲染后执行
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationDocManage/fetchValue',
    });
  }

  @Bind()
  setLoading(flag) {
    this.setState({
      cuxBtnLoading: flag,
    });
  }

  /**
   * handleCreate - 创建新档案
   */
  @Bind()
  handleCreate() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/evaluation-doc-manage/create`,
      })
    );
  }

  /**
   * handleViewDetail - 跳转到详细页面
   * @param {object} record - 点击行数据
   */
  @Bind()
  handleViewDetail({ evalHeaderId, evalTplId }) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/evaluation-doc-manage/detail/${evalTplId}/${evalHeaderId}`,
      })
    );
  }

  @Bind()
  dealDestroy(selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationDocManage/deleteRecords',
      payload: selectedRows,
    }).then(res => {
      if (res) {
        this.setState({
          selectedRows: [],
        });
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   * handleDestroy - 作废档案
   */
  @Bind()
  async handleDestroy() {
    const { selectedRows } = this.state;
    const { evaluationManageRemote } = this.props;
    const eventProps = {
      selectedRows,
      dealDestroy: this.dealDestroy,
    };
    // 默认返回true,当返回false时走二开逻辑不走标准逻辑
    const res = await evaluationManageRemote.event.fireEvent('cuxHandleDestroy', eventProps);
    if (!res) {
      return;
    }
    if (selectedRows.length) {
      if (selectedRows.find(n => n.evalStatus === 'PUBLISHED')) {
        notification.warning({
          message: intl
            .get(`sslm.supplierDocManage.model.evaluationDocManage.destroyWarn`)
            .d('不能作废已发布的档案'),
        });
      } else {
        this.dealDestroy(selectedRows);
      }
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一条数据'),
      });
    }
  }

  /**
   * handleSelectChange - 选择列表行
   * @param {object[]} selectedRows - 已选择的行
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * handleSearch - 查询表单请求
   * @param {object} page - 查询组件传递来的查询字段对象
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const formValues = isUndefined(this.searchForm)
      ? {}
      : filterNullValueObject(this.searchForm.getFieldsValue());

    const { creationDateFrom, creationDateTo, supplierNameLov, ...rest } = formValues;
    dispatch({
      type: 'evaluationDocManage/search',
      payload: {
        tenantId: getUserOrganizationId(),
        page,
        ...filterNullValueObject({
          ...rest,
          creationDateFrom: creationDateFrom ? creationDateFrom.format(DATETIME_MIN) : null,
          creationDateTo: creationDateTo ? creationDateTo.format(DATETIME_MAX) : null,
        }),
        customizeUnitCode:
          'SSLM.EVALUATION_DOC_MANAGE_LIST.FILTER,SSLM.EVALUATION_DOC_MANAGE_LIST.LIST',
      },
    });
  }

  /**
   * bindSearchForm - 绑定表单组件
   * @param {*} node - 表单组件
   */
  @Bind()
  bindSearchForm(node = {}) {
    this.searchForm = (node.props || {}).form;
  }

  // 复制
  @Bind()
  handleCopy(record) {
    Modal.confirm({
      children: intl
        .get(`sslm.supplierDocManage.view.message.copyConfirm`)
        .d('是否复制此单据生成一张新单据？'),
      onOk: () =>
        new Promise(() => {
          const { evalHeaderId } = record;
          dealCopy({ evalHeaderId }).then(respose => {
            const res = getResponse(respose);
            if (res) {
              const { evalHeaderId: newEvalHeaderId, evalTplId } = res;
              notification.success();
              this.handleViewDetail({ evalHeaderId: newEvalHeaderId, evalTplId });
            }
          });
        }),
    });
  }

  // 查看未评分人
  @Bind()
  handleView(record) {
    const { evalHeaderId } = record;
    Modal.open({
      key: Modal.key(),
      style: { width: 600 },
      closable: true,
      movable: false,
      title: intl.get(`sslm.supplierDocManage.model.evalDocManage.peopleNotScore`).d('未评分人'),
      children: <PeopleNotScore evalHeaderId={evalHeaderId} />,
    });
  }

  /**
   * handleDestroy - 评分催办
   */
  @Bind()
  handleScoreCuiBan() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    if (selectedRows.length) {
      if (selectedRows.find(n => n.evalStatus !== 'MANUAL_EVALUATING')) {
        notification.warning({
          message: intl
            .get(`sslm.supplierDocManage.model.evaluationDocManage.scoreCuiBanWarn`)
            .d('不能催办非评分中的档案'),
        });
      } else {
        dispatch({
          type: 'evaluationDocManage/scoreCuiBan',
          payload: selectedRows,
        }).then(res => {
          if (res) {
            this.setState({
              selectedRows: [],
            });
            notification.success();
            this.handleSearch();
          }
        });
      }
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一条数据'),
      });
    }
  }

  /**
   * render 方法
   * @return React.element
   */
  render() {
    const { selectedRows, cuxBtnLoading } = this.state;
    const {
      evaluationDocManage: {
        statusValue = [],
        cycleValue = [],
        levelValue = [],
        methodValue = [],
        dataSource,
        pagination,
      },
      searchLoading,
      deleteListLoading,
      customizeFilterForm,
      custLoading,
      customizeTable,
      customizeBtnGroup,
      scoreCuiBanLoading,
      evaluationManageRemote,
    } = this.props;
    const allLoading = searchLoading || deleteListLoading || scoreCuiBanLoading || cuxBtnLoading;
    const newRowSelection = {
      selectedRows,
      selectedRowKeys: selectedRows.map(n => n.evalHeaderId),
      onChange: this.handleSelectChange,
      getCheckboxProps: record => {
        return {
          disabled: [
            'COMPLETED',
            'PUBLISHED',
            'APPROVING',
            'DISCARDED',
            'supplierConfirmed',
            'SUPPLIER_CONFIRMED',
          ].includes(record.evalStatus),
        };
      },
    };
    const rowSelection = evaluationManageRemote.process(
      'SSLM.EVALUATION_MANAGE_LIST.ROW_SELECTION',
      newRowSelection
    );
    const searchProps = {
      onSearch: this.handleSearch,
      statusValue,
      cycleValue,
      levelValue,
      methodValue,
      onRef: this.bindSearchForm,
      customizeFilterForm,
      custLoading,
    };
    const listProps = {
      dataSource,
      pagination,
      rowSelection,
      methodValue,
      loading: allLoading,
      viewDetail: this.handleViewDetail,
      handleChange: this.handleSearch,
      onCopy: this.handleCopy,
      onView: this.handleView,
      customizeTable,
      custLoading,
    };
    const remoteBtnProps = {
      allLoading,
      selectedRows,
      setLoading: this.setLoading,
      onRefresh: this.handleSearch,
      clearSelectedRows: this.handleSelectChange,
    };
    const headerButton = [
      {
        name: 'create',
        btnComp: Button,
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          icon: 'add',
          type: 'c7n-pro',
          color: 'primary',
          onClick: this.handleCreate,
          loading: allLoading,
        },
      },
      {
        name: 'invalid',
        btnComp: Button,
        child: intl.get('sslm.supplierDocManage.view.button.invalid').d('作废'),
        btnProps: {
          icon: 'close',
          type: 'c7n-pro',
          disabled: isEmpty(selectedRows),
          onClick: this.handleDestroy,
          loading: allLoading,
          permissionList: [
            {
              code: 'srm.partner.evaluation-manage.eval-doc.button.discard',
              type: 'button',
              meaning: '考评档案管理-作废',
            },
          ],
        },
      },
      {
        name: 'scoreCuiBan',
        btnComp: Button,
        child: intl.get('sslm.supplierDocManage.view.button.scoreCuiBan').d('评分催办'),
        btnProps: {
          icon: 'rocket',
          type: 'c7n-pro',
          disabled:
            selectedRows.length === 0 ||
            selectedRows.findIndex(o => o.evalStatus !== 'MANUAL_EVALUATING') !== -1,
          onClick: this.handleScoreCuiBan,
          loading: allLoading,
        },
      },
    ];

    return (
      <Fragment>
        <Header
          title={intl
            .get(`sslm.supplierDocManage.model.evalDocManage.reviewFileManage`)
            .d('考评档案管理')}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.EVALUATION_DOC_MANAGE_LIST.HEADER_BTNS',
              pro: true,
            },
            <DynamicButtons maxNum={5} buttons={headerButton} />
          )}
          {evaluationManageRemote.render &&
            evaluationManageRemote.render(
              'SSLM.EVALUATION_MANAGE_LIST.HEADER_BTN',
              null,
              remoteBtnProps
            )}
        </Header>
        <Content>
          <div className="table-list-search">
            <Search {...searchProps} />
          </div>
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
