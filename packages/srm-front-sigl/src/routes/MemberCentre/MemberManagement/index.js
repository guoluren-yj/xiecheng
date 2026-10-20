/**
 * 会员管理 - 列表
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component, useMemo } from 'react';
import queryString from 'query-string';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import classNames from 'classnames';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { openTab } from 'utils/menuTab';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import { Table, DataSet, Modal, Button, Lov, Tree } from 'choerodon-ui/pro';
import { Icon, Tag } from 'choerodon-ui';
import { observer } from 'mobx-react';
import ImportButton from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import {
  MemberListDS,
  MemberDetailDS,
  PointsListDS,
  PointsEditDS,
  PointsReduceDS,
} from '@/stores/MemberManagementDS';
import {
  modifyPointsItem,
  fetchTagList,
  modifyMemberLabel,
  fetchSaveMember,
} from '@/services/memberCentreService';
import SearchBarTable from '_components/SearchBarTable';

import c7nModal from '@/utils/c7nModal';
import EditModal from './EditModal';
import PointsModal from './PointsLogModal';
import PointsEditModal, { PointsReduceModal } from './PointsEditModal';
import LabelEditModal from './LabelEditModal';
import styles from './index.less';

const currentOrganizationId = getCurrentOrganizationId();
const unitCode = [
  'SIGL.MEMBER_MEMBERMANAGMENT.LIST',
  'SIGL.MEMBER_MEMBERMANAGMENT.POINT_DETAIL',
  'SIGL.MEMBER_MEMBERMANAGMENT.BTNS',
  'SIGL.MEMBER_MEMBERMANAGMENT.LIST.SEARCH',
];

const modalKey = Modal.key();
const modalKey1 = Modal.key();
const modalKey2 = Modal.key();

const MenuItemLinkBtn = ({ btnComp, style: myStyle, ...btnProps }) => {
  const BtnComp = btnComp;
  return (
    <div className={styles['drop-down-import-btn-wrapper']} style={myStyle}>
      <BtnComp {...btnProps} isHeadButton={false} />
    </div>
  );
};

const ObserverLabelButton = observer(({ ds, otherButtonProps, saveLabel }) => {
  function nodeRenderer({ record }) {
    return record.get('labelName');
  }
  const lovDataSet = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        paging: false,
        strictPageSize: false,
        pageSize: 10000,
        fields: [
          {
            name: 'drawer',
            valueField: 'labelId',
            textField: 'labelName',
            type: 'object',
            lovCode: 'SIGL.MEMBER_LABEL',
            multiple: true,
            pageSize: 2000,
            lovQueryAxiosConfig: () => {
              return {
                url: `/sigl/v1/${currentOrganizationId}/member-labels`,
                method: 'GET',
                params: {
                  enabledFlag: 1,
                  page: -1,
                },
              };
            },
          },
        ],
      }),
    []
  );
  let newDataSet;
  const viewRenderer = ({ dataSet: oldDataSet }) => {
    newDataSet = oldDataSet;
    newDataSet.pageSize = 10000; // 有啥办法控制吗
    const treeProps = {
      selectable: false,
      checkable: true,
      dataSet: newDataSet,
      renderer: nodeRenderer,
      multiple: true,
      showLine: false,
      className: styles['label-lov-tree'],
    };
    return <Tree {...treeProps} />;
  };
  return (
    <Lov
      dataSet={lovDataSet}
      clearButton={false}
      disabled={ds.selected.length === 0}
      {...otherButtonProps}
      icon="mode_edit"
      funcType="flat"
      name="drawer"
      mode="button"
      viewMode="drawer"
      viewRenderer={viewRenderer}
      modalProps={{
        title: intl.get('sigl.memberCenter.view.button.batchLabel').d('批量编辑标签'),
        style: { width: 442 },
        onOk: () => {
          saveLabel(newDataSet?.selected?.map((r) => r.toData()) || []);
          lovDataSet.reset();
          newDataSet.removeAll(true);
        },
      }}
    >
      {intl.get('sigl.memberCenter.view.button.batchLabel').d('批量编辑标签')}
    </Lov>
  );
});

@formatterCollections({
  code: ['sigl.memberCenter', 'halt.alertAdvanced', 'hzero.common'],
})
@withRouter
@observer
@withCustomize({
  unitCode,
})
export default class MemberManagement extends Component {
  tableDS = new DataSet({ ...MemberListDS(), autoQuery: true });

  editFormDS = new DataSet({ ...MemberDetailDS(), autoQuery: false });

  pointsListDS = new DataSet({ ...PointsListDS(), autoQuery: false });

  pointsEditDS = new DataSet({ ...PointsEditDS(), autoQuery: false });

  path = 'srm.mall.tenant.member.sigl.member.ps';

  constructor(props) {
    super(props);
    this.state = {
      memberTagList: [],
    };
    this.tableDS.setQueryParameter('customizeUnitCode', unitCode[3]);
  }

  async componentDidMount() {
    this.handleQueryTagList();
  }

  get columns() {
    // const {
    //   match: { path },
    // } = this.props;

    // const { path } = this;

    return [
      {
        name: 'enabledFlag',
        width: 140,
        renderer: ({ value, record }) => {
          return (
            <Tag color={value ? 'green' : 'red'} border={false}>
              {record.get('enabledFlagMeaning')}
            </Tag>
          );
        },
      },
      {
        name: 'memberCode',
        width: 220,
        renderer: ({ record }) => {
          return (
            <span>
              <a onClick={() => this.handleOpenEditModal(record)}>{record.get('memberCode')}</a>
            </span>
          );
        },
      },
      {
        name: 'memberName',
        width: 220,
      },
      {
        name: 'memberLabelRelationList',
        width: 320,
        renderer: ({ record }) => {
          const labelList = record.get('memberLabelRelationList') || [];
          const labelStr = labelList?.map((item) => item?.labelName).join('、');
          return labelStr || '-';
        },
      },
      {
        name: 'pointsDetail',
        header: intl.get(`sigl.memberCenter.view.button.viewPoints`).d('会员积分'),
        width: 130,
        renderer: ({ record }) => (
          <a onClick={() => this.handleViewPonits(record)}>
            {intl.get(`sigl.memberCenter.view.button.managePoints`).d('管理')}
          </a>
        ),
      },
      {
        name: 'operation',
        header: intl.get(`sigl.memberCenter.view.modal.operation`).d('操作'),
        width: 100,
        lock: 'right',
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <Button type="text" funcType="link" onClick={() => this.handleEnabled(record)}>
                {!record.get('enabledFlag')
                  ? intl.get('hzero.common.button.enable').d('启用')
                  : intl.get('hzero.common.button.disable').d('禁用')}
              </Button>
            </span>
          );
        },
      },
    ];
  }

  @Bind()
  async handleEnabled(record) {
    const params = {
      ...record.toData(),
      enabledFlag: !record.get('enabledFlag') ? 1 : 0,
    };
    const res = await fetchSaveMember(params);

    if (!res || res.failed) {
      notification.error({ message: res.resultMessage });
      return false;
    }

    this.tableDS.query(this.tableDS.currentPage);
  }

  // 查看积分
  handleViewPonits = (record) => {
    const data = record.get('memberPointsList') || [];
    const ds = new DataSet({ paging: false, data, selection: false });
    const columns = [
      {
        name: 'pointsTypeName',
        header: intl.get('sigl.memberCenter.view.potinsType').d('积分类型'),
      },
      {
        name: 'integralGrantTotal',
        header: intl.get(`sigl.memberCenter.view.modal.integralGrantTotal`).d('累计发放'),
        align: 'right',
        help: intl
          .get('sigl.memberCenter.view.modal.integralGrantTotalHelp')
          .d('累计发放=发放总数-扣减总数'),
      },
      {
        name: 'integralUseTotal',
        header: intl.get(`sigl.memberCenter.view.modal.integralUseTotal`).d('累计消费'),
        align: 'right',
        help: intl.get('sigl.memberCenter.view.modal.integralUseTotalHelp').d('累计商城消费积分'),
      },
      {
        name: 'integralBalance',
        header: intl.get(`sigl.memberCenter.view.modal.integralBalance`).d('积分余额'),
        align: 'right',
      },
      {
        name: 'operation',
        header: intl.get(`sigl.memberCenter.view.modal.operation`).d('操作'),
        renderer: ({ record: lineRecord }) => (
          <Button onClick={() => this.handleOpenPointsModal(lineRecord, record)} funcType="link">
            {intl.get(`sigl.memberCenter.view.modal.pointsRecord`).d('积分记录')}
          </Button>
        ),
      },
    ];
    const RemoveBtn = observer(({ dataSet }) => {
      const integralBalance = dataSet.reduce((m, n) => m + n.get('integralBalance'), 0);
      return (
        <Button
          onClick={() => this.handleReducePoint(record, ds)}
          funcType="flat"
          icon="remove"
          disabled={integralBalance < 1}
        >
          {intl.get('sigl.memberCenter.view.button.deductionPoints').d('积分扣减')}
        </Button>
      );
    });
    const buttons = [
      <Button onClick={() => this.handleOpenDistributeModal(record, ds)} icon="add">
        {intl.get('sigl.memberCenter.view.button.distributePoints').d('积分发放')}
      </Button>,
      <RemoveBtn dataSet={ds} />,
    ];
    c7nModal({
      title: intl.get(`sigl.memberCenter.view.title.managePointsTitle`).d('管理会员积分'),
      style: { width: 742 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <Table
          className={classNames(styles['point-manage-table'])}
          customizedCode="SIGL.MEMBER_MEMBERMANAGMENT.POINT_MANAGE"
          buttons={buttons}
          columns={columns}
          dataSet={ds}
          style={{ maxHeight: `calc(100vh - 190px)` }}
        />
      ),
    });
  };

  /**
   * 发放积分弹窗
   */
  @Bind()
  handleOpenDistributeModal(record, ds) {
    this.pointsEditDS.loadData([]);
    this.pointsEditDS.create({
      modifyIntegralType: 'GRANT',
      userId: record.get('userId'),
      memberId: record.get('memberId'),
      memberName: record.get('memberName'),
      objectVersionNumber: record.get('objectVersionNumber'),
    });
    const modalPropertys = {
      title: intl.get('sigl.memberCenter.view.button.distributePoints').d('发放积分'),
      drawer: true,
      closable: true,
      style: {
        width: 380,
      },
      key: modalKey2,
      children: <PointsEditModal record={record} dataSet={this.pointsEditDS} />,
      onCancel: () => this.pointsEditDS.reset(),
      onClose: () => this.pointsEditDS.reset(),
      onOk: () => this.handleSavePoints(ds),
    };

    Modal.open(modalPropertys);
  }

  // 扣减积分
  handleReducePoint = (record, outDs) => {
    // 'DEDUCT'
    const ds = new DataSet(PointsReduceDS());
    ds.create({
      ...record.toData(),
      modifyIntegralType: 'DEDUCT',
    });
    return Modal.open({
      drawer: true,
      style: { width: 742 },
      children: <PointsReduceModal memberId={record.get('memberId')} dataSet={ds} />,
      title: intl.get('sigl.memberCenter.view.title.deductionPoints').d('扣减积分'),
      onOk: async () => {
        const isValidate = await ds.validate();
        if (!isValidate) return false;
        const params = ds.current.toData();
        const res = getResponse(await modifyPointsItem(params));
        if (res) {
          notification.success();
          await this.tableDS.query(this.tableDS.currentPage);
          const data =
            this.tableDS.find(
              (tableRecord) => tableRecord.get('memberId') === res?.result?.memberId
            ) || {};
          outDs.loadData(data?.get('memberPointsList'));
        } else {
          return false;
        }
      },
    });
  };

  /**
   * 保存积分信息
   */
  @Bind()
  async handleSavePoints(ds) {
    const isValidate = await this.pointsEditDS.validate();

    if (!isValidate) {
      return false;
    }

    const params = this.pointsEditDS.current.toData();
    const res = await modifyPointsItem(params);

    if (!res.success) {
      notification.error({ message: res.resultMessage });
      return false;
    }

    await this.tableDS.query(this.tableDS.currentPage);
    const data =
      this.tableDS.find((record) => record.get('memberId') === res?.result?.memberId) || {};
    ds.loadData(data?.get('memberPointsList'));
  }

  /**
   * 保存会员信息
   */
  @Bind()
  async handleSaveMember() {
    const isValidate = await this.editFormDS.validate();

    if (!isValidate) {
      return false;
    }

    const res = await this.editFormDS.submit();
    if (getResponse(res) || !res) {
      // 不修改直接保存
      this.editFormDS.data = [];
      this.tableDS.query(this.tableDS.currentPage);
      this.handleQueryTagList();
    } else {
      return false;
    }
    return true;
  }

  /**
   * 打开会员新建或编辑弹窗
   * 存在 recode 即为编辑
   */
  @Bind()
  handleOpenEditModal(record) {
    const { memberTagList } = this.state;
    this.editFormDS.data = [];
    const memberId = record ? record.get('memberId') : '';
    if (memberId) {
      // 主动查询，防止多页面操作未刷新时已禁用标签显示id
      this.editFormDS.setQueryParameter('memberId', memberId);
      this.editFormDS.query();
    } else {
      this.editFormDS.create({ enabledFlag: 1 });
    }

    const modalTitle = memberId
      ? intl.get(`sigl.memberCenter.view.title.changeMember`).d('编辑会员')
      : intl.get(`sigl.memberCenter.view.button.createMember`).d('新建会员');

    const modalPropertys = {
      title: modalTitle,
      drawer: true,
      closable: true,
      destroyOnClose: true,
      style: {
        width: 380,
      },
      key: modalKey,
      children: (
        <EditModal
          record={record}
          tagList={memberTagList}
          dataSet={this.editFormDS}
          // onSelectMember={this.handleSelectMember}
        />
      ),
      onCancel: () => this.handleCancelModal(),
      onClose: () => this.handleCancelModal(),
      onOk: () => this.handleSaveMember(),
    };

    Modal.open(modalPropertys);
  }

  /**
   * 查询会员列表
   */
  @Bind()
  async handleQueryTagList() {
    const lookupData = await fetchTagList({ page: -1, enabledFlag: 1 });
    if (lookupData && lookupData.content && lookupData.content.length) {
      this.setState({
        memberTagList: lookupData.content || [],
      });
    }
  }

  /**
   * 选择值集，封装成对象数组回填到dataSet
   */
  // @Bind()
  // handleSelectMember(record, dataSet) {
  //   const { memberTagList } = this.state;
  //   const dataList = [];

  //   if (Array.isArray(record) && record.length) {
  //     record.forEach((item) => {
  //       memberTagList.forEach((item2) => {
  //         if (item === item2.labelId) {
  //           dataList.push({
  //             labelId: item,
  //             memberId:
  //               dataSet && dataSet.current && dataSet.current.get('memberId')
  //                 ? dataSet.current.get('memberId')
  //                 : '',
  //             tenantId: item2.tenantId,
  //           });
  //         }
  //       });
  //     });
  //   }

  //   if (dataSet.current) {
  //     dataSet.current.set('memberLabelRelationList', dataList); // 数据回填到后端接收的字段
  //   }
  // }

  @Bind()
  handleCancelModal() {
    this.editFormDS.data = [];
    return true;
  }

  /**
   * 打开积分明细弹窗
   * @param {*} record
   */
  @Bind()
  async handleOpenPointsModal(lineRecord, record) {
    this.pointsListDS.queryDataSet.reset();
    this.pointsListDS.setQueryParameter('memberId', lineRecord.get('memberId'));
    this.pointsListDS.setQueryParameter('pointsTypeId', lineRecord.get('pointsTypeId'));
    this.pointsListDS.setQueryParameter('customizeUnitCode', unitCode[1]);
    this.pointsListDS.query();
    const userName = record ? record.get('memberName') : '';

    const modalPropertys = {
      title: `${userName} ${intl
        .get('sigl.memberCenter.view.title.memberPointsDetail')
        .d('的积分明细')}`,
      drawer: true,
      closable: true,
      destroyOnClose: true,
      style: {
        width: 800,
      },
      key: modalKey1,
      okCancel: false,
      okText: intl.get(`hzero.common.button.close`).d('关闭'),
      children: (
        <PointsModal
          record={lineRecord}
          dataSet={this.pointsListDS}
          customizeTable={this.props.customizeTable}
        />
      ),
    };

    Modal.open(modalPropertys);
  }

  @Bind()
  handleBatchImport() {
    openTab({
      key: `/sigl/batch-upload/SIGL.MEMBER`,
      search: queryString.stringify({
        key: `/sigl/batch-upload/SIGL.MEMBER`,
        title: 'hzero.common.title.batchImport',
        backPath: '/sigl/member-centre-memberlist',
        action: intl.get(`sigl.memberCenter.view.title.memberImport`).d('会员导入'),
      }),
    });
  }

  @Bind()
  async saveLabel(memberLabels) {
    const members = this.tableDS.selected.map((m) => m.toData());
    const params = {
      members,
      memberLabels,
    };
    const res = getResponse(await modifyMemberLabel(params));
    if (res) {
      const { selected } = this.tableDS;
      //  取消跨页缓存
      if (selected.length) {
        selected.forEach((record) => {
          this.tableDS.unSelect(record);
        });
      }
      this.tableDS.clearCachedSelected();
      this.tableDS.query(this.tableDS.currentPage);
      notification.success();
      return true;
    }
    return false;
  }

  // 批量维护标签
  @Bind()
  batchEditLabel(selected) {
    const modalPropertys = {
      title: intl.get('sigl.memberCenter.view.button.batchLabel').d('批量编辑标签'),
      width: 600,
      bodyStyle: {
        padding: 0,
      },
      dataSet: selected,
      children: <LabelEditModal handleSave={this.saveLabel} />,
    };
    c7nModal(modalPropertys);
  }

  render() {
    // const { path } = this; // 权限集前缀
    const {
      customizeTable,
      customizeBtnGroup,
      match: { path = '' },
    } = this.props;
    const customizeButtons = [
      {
        name: 'new',
        group: true,
        child: (
          <Button icon="add" color="primary">
            {intl.get('hzero.common.button.create').d('新建')}
            <Icon
              type="expand_more"
              style={{
                marginLeft: 4,
                marginTop: -2,
                fontSize: '16px',
              }}
            />
          </Button>
        ),
        children: [
          {
            name: 'createMember',
            btnType: 'c7n-pro',
            child: intl.get(`sigl.memberCenter.view.button.createMember`).d('新建会员'),
            btnProps: {
              type: 'c7n-pro',
              icon: 'add',
              color: 'primary',
              onClick: () => this.handleOpenEditModal(''),
            },
          },
          {
            name: 'importMembersNew',
            btnComp: MenuItemLinkBtn,
            btnProps: {
              btnComp: ImportButton,
              businessObjectTemplateCode: 'SIGL.MEMBER',
              refreshButton: true,
              buttonText: intl.get('sigl.memberCenter.button.importMembersNew').d('(新)导入会员'),
              prefixPatch: '/sigl',
              successCallBack: () => this.tableDS.query(),
              action: intl.get(`sigl.memberCenter.view.title.memberImport`).d('会员导入'),
              buttonProps: {
                icon: '',
                funcType: 'flat',
                permissionList: [
                  {
                    code: `${path}.button.import-new`,
                    type: 'button',
                    meaning: '会员管理-（新）导入',
                  },
                ],
              },
            },
          },
          {
            name: 'importMembers',
            btnType: 'c7n-pro',
            child: intl.get(`sigl.memberCenter.view.button.importMembers`).d('导入会员'),
            btnProps: {
              type: 'c7n-pro',
              icon: 'archive',
              funcType: 'flat',
              onClick: this.handleBatchImport,
            },
          },
        ],
      },
      {
        name: 'exportNew',
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'SIGL_MEMBER_EXPORT',
          buttonText: intl.get('sigl.memberCenter.button.exportNew').d('(新)导出'),
          otherButtonProps: {
            type: 'c7n-pro',
            icon: 'unarchive',
            funcType: 'flat',
            permissionList: [
              {
                code: `${path}.button.export-new`,
                type: 'button',
                meaning: '会员管理-（新）导出',
              },
            ],
          },
          requestUrl: `/sigl/v1/${currentOrganizationId}/members/export`,
          queryParams: () => filterNullValueObject(this.tableDS.queryDataSet.current.toData()),
        },
      },
      {
        name: 'export',
        btnType: 'c7n-pro',
        btnComp: ExcelExport,
        btnProps: {
          buttonText: intl.get('hzero.common.button.export').d('导出'),
          otherButtonProps: { icon: 'unarchive', type: 'c7n-pro', funcType: 'flat' },
          requestUrl: `/sigl/v1/${currentOrganizationId}/members/export`,
          queryParams: () => filterNullValueObject(this.tableDS.queryDataSet.current.toData()),
        },
      },
      {
        name: 'batchLabel',
        btnComp: ObserverLabelButton,
        btnProps: {
          ds: this.tableDS,
          saveLabel: this.saveLabel,
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get(`sigl.memberCenter.view.title.memberManage`).d('会员管理')}>
          {customizeBtnGroup(
            {
              code: 'SIGL.MEMBER_MEMBERMANAGMENT.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={customizeButtons} />
          )}
        </Header>
        <Content>
          {customizeTable(
            { code: unitCode[0] },
            <SearchBarTable
              className={classNames(styles['base-content'])}
              searchCode={unitCode[3]}
              dataSet={this.tableDS}
              columns={this.columns}
              style={{ maxHeight: `calc(100vh - 186px)` }}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
