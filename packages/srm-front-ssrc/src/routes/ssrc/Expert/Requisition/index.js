/**
 * Requisition - 专家注册申请
 * @date: 2019-01-21
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { SRM_SSRC } from '_utils/config';
import { Header, Content } from 'components/Page';
import { isUndefined, isEmpty, noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import CommonImportNew from 'hzero-front/lib/components/Import';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import WithCustomizeH0 from 'srm-front-cuz/lib/h0Customize';
import remote from 'hzero-front/lib/utils/remote';

import QueryForm from './QueryForm';
import ApplyTable from '../Components/ApplyTable';
import { getCustomizeUnitCode } from '../utils/utils';

const { confirm } = Modal;
const promptCode = 'ssrc.expert';

@WithCustomizeH0({
  unitCode: [
    'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.HEADER_BUTTON',
    getCustomizeUnitCode('expertRequisitionList'), // 专家注册申请列表
  ],
})
@connect(({ expert, loading }) => ({
  expert,
  loading: loading.effects['expert/queryRequisition'],
}))
@remote({
  code: 'SSRC_EXPERT_REQUISITION_LIST',
})
export default class Requisition extends PureComponent {
  constructor(props = {}) {
    super(props);
    this.organizationId = getCurrentOrganizationId();
  }

  componentDidMount() {
    const {
      expert: { requisitionPagination = {} },
    } = this.props;
    const page = requisitionPagination;
    this.queryValueCode();
    this.queryRequisition(page);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'expert/updateState',
      payload: { auditRows: [] },
    });
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'expert/queryValueCode',
      payload: {
        expertTypeList: 'SSRC.EXPERT_TYPE', // 专家类型
        expertCategoryList: 'SSRC.EXPERT_CATEGORY', // 专家类别
        expertReqList: 'SSRC.EXPERT_REQ_STATUS', // 单据状态
      },
    });
  }

  @Bind()
  handleBatchExport() {
    const Props = {
      code: 'SSRC.EXPERT_REQ_IMPORT',
      organizationId: getCurrentOrganizationId(),
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        templateCode: 'SSRC.EXPERT_REQ_IMPORT',
      }),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId: getCurrentOrganizationId(),
      action: 'hzero.common.title.batchImport',
      key: '/ssrc/expert-requisition/comment-import/SSRC.EXPERT_REQ_IMPORT',
      auto: true,
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      bodyStyle: {
        maxHeight: 'calc(100vh - 2.5rem)',
      },
      title: intl.get('hzero.common.button.expert').d('专家'),
      children: <CommonImport {...Props} />,
      style: { width: '80%' },
      onOk: this.batchImportOk,
    });
  }

  @Bind
  batchImportOk() {
    this.queryRequisition();
    this.forceUpdate();
  }

  @Bind()
  handleExpertSubmit() {
    const {
      dispatch,
      expert: { auditRows = [] },
    } = this.props;
    confirm({
      title: intl
        .get(`${promptCode}.view.message.title.confirmSubmit`)
        .d('是否确认提交专家注册申请?'),
      onOk: () => {
        dispatch({
          type: 'expert/submitRequisition',
          payload: { expertReqIds: auditRows.map((item) => item.expertReqId) },
        }).then((res) => {
          if (res) {
            dispatch({
              type: 'expert/updateState',
              payload: { auditRows: [] },
            });
            this.queryRequisition();
            notification.success();
          }
        });
      },
    });
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRows 选中行
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'expert/updateState',
      payload: { auditRows: selectedRows },
    });
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  queryRequisition(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const searchData = {
      ...filterValues,
    };
    dispatch({
      type: 'expert/queryRequisition',
      payload: {
        page: pageData,
        customizeUnitCode: getCustomizeUnitCode('expertRequisitionList'),
        ...searchData,
      },
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryExpert(queryData = {}) {
    this.queryRequisition(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.queryRequisition(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 点击新建按钮事件
   */
  @Bind()
  handleExpertCreate() {
    const { history } = this.props;
    history.push('/ssrc/expert-requisition/create');
  }

  getHeaderButtons() {
    const {
      history,
      remote: remoteFunc,
      expert: { auditRows = [] },
    } = this.props;
    const importProps = {
      name: 'newExpertImport',
      businessObjectTemplateCode: 'SSRC.EXPERT_REQ_IMPORT',
      prefixPatch: SRM_SSRC,
      refreshButton: true,
      autoRefreshInterval: 5000,
      tenantId: getCurrentOrganizationId(),
      buttonText: intl.get('hzero.common.button.expertImportNew').d('(新)专家导入'),
      buttonProps: {
        permissionList: [
          {
            code: `${this.props.match.path}.button.expert-import-new`,
            type: 'button',
            meaning:
              intl.get(`${promptCode}.view.message.title.expertRegiteAsk`).d('专家注册申请') -
              intl.get('hzero.common.button.expertImport').d('专家导入'),
          },
        ],
      },
      icon: 'archive',
      successCallBack: this.batchImportOk,
    };
    const buttons = [
      <Button type="primary" icon="plus" onClick={this.handleExpertCreate} name="create">
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>,
      <Button icon="to-top" onClick={this.handleBatchExport} name="expertImport">
        {intl.get('hzero.common.button.expertImport').d('专家导入')}
      </Button>,
      <CommonImportNew {...importProps} />,
      <Button
        type="default"
        icon="check"
        onClick={this.handleExpertSubmit}
        disabled={isEmpty(auditRows)}
        name="submit"
      >
        {intl.get('hzero.common.button.submit').d('提交')}
      </Button>,
    ];
    return remoteFunc
      ? remoteFunc.process('SSRC_EXPERT_REQUISITION_LIST_PROCESS_HEADER_BUTTON', buttons, {
          handleExpertCreate: this.handleExpertCreate,
          history,
        })
      : buttons;
  }

  render() {
    const {
      loading,
      expert: {
        auditRows = [],
        requisitionList = {},
        requisitionPagination = {},
        code: { expertTypeList = [], expertCategoryList = [], expertReqList = [] },
      },
      customizeBtnGroup = noop,
      customizeTable,
    } = this.props;
    const formProps = {
      expertTypeList,
      expertCategoryList,
      expertReqList,
      onQueryExpert: this.onQueryExpert,
      onRef: this.handleBindRef,
    };
    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: auditRows.map((n) => n.expertReqId),
      getCheckboxProps: (record) => ({
        disabled: record.expertReqStatus !== 'REJECTED' && record.expertReqStatus !== 'NEW',
      }),
    };
    const applyTable = {
      type: 'requisition',
      loading,
      rowSelection,
      expertList: requisitionList,
      expertPagination: requisitionPagination,
      customizeTable,
      customizeUnitCode: getCustomizeUnitCode('expertRequisitionList'),
      onTableChange: this.handleStandardTableChange,
    };

    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.expertRegiteAsk`).d('专家注册申请')}
        >
          {customizeBtnGroup(
            { code: 'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.HEADER_BUTTON' },
            this.getHeaderButtons()
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <QueryForm {...formProps} />
          </div>
          <ApplyTable {...applyTable} />
        </Content>
      </React.Fragment>
    );
  }
}
