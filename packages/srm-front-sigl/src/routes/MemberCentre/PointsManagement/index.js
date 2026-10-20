/**
 * 积分管理 - 列表
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router';
import intl from 'utils/intl';
import classNames from 'classnames';
import queryString from 'query-string';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';
import DynamicButtons from '_components/DynamicButtons';
import ImportButton from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import SearchBarTable from '_components/SearchBarTable';
import {
  PointsListDS,
  MemberListDS,
  CountFormDS,
  IssuanceListDS,
} from '@/stores/PointsManagementDS';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import PointsIssuanceModal from './PointsIssuanceModal';
import SelectMember from './StepComponent/SelectMember';
import IssuanceTable from './StepComponent/IssuanceTable';

import styles from './index.less';

const currentOrganizationId = getCurrentOrganizationId();
const MenuItemLinkBtn = ({ btnComp, style: myStyle, ...btnProps }) => {
  const BtnComp = btnComp;
  return (
    <div className={styles['drop-down-import-btn-wrapper']} style={myStyle}>
      <BtnComp {...btnProps} isHeadButton={false} />
    </div>
  );
};
@formatterCollections({
  code: ['sigl.memberCenter', 'halt.alertAdvanced', 'hzero.common'],
})
@withCustomize({
  unitCode: [
    'SIGL.PONIT_MANAGE.LIST',
    'SIGL.PONIT_MANAGE.BTNS',
    'SIGL.PONIT_MANAGE.DISTIBUTE_POINT.FORM',
  ],
})
@withRouter
export default class pointsManagement extends Component {
  tableDS = new DataSet({ ...PointsListDS(), autoQuery: true });

  memberListDS = new DataSet({ ...MemberListDS(), autoQuery: true });

  countFormDS = new DataSet({ ...CountFormDS() });

  issuanceListDS = new DataSet({ ...IssuanceListDS() });

  constructor(props) {
    super(props);
    this.tableDS.setQueryParameter('customizeUnitCode', 'SIGL.PONIT_MANAGE.LIST');
    this.state = {
      modal: null,
      current: 0,
    };
  }

  get columns() {
    return [
      {
        name: 'memberCode',
        width: 180,
      },
      {
        name: 'memberName',
        width: 180,
      },
      {
        name: 'operationType',
      },
      {
        name: 'pointsTypeName',
        width: 120,
      },
      {
        name: 'operationIntegralTotal',
      },
      {
        name: 'expirationDate',
        width: 120,
      },
      {
        name: 'remarksMeaning',
      },
      {
        name: 'realName',
      },
      {
        name: 'creationDate',
        width: 180,
      },
    ];
  }

  @Bind()
  getEditModalPops(cur) {
    const commonProps = {
      current: cur,
      steps: this.steps,
    };
    const NextBtn = observer(({ ds, current, steps }) => {
      const unSelected = !ds.selected?.length;
      return (
        current < steps.length - 1 && (
          <Tooltip
            title={
              unSelected
                ? intl.get(`sigl.memberCenter.view.button.nextStepTip`).d('请选择要发放积分的会员')
                : ''
            }
            placement="top"
          >
            <Button color="primary" disabled={unSelected} onClick={() => this.next()}>
              {intl.get(`sigl.memberCenter.view.button.nextStep`).d('下一步')}
            </Button>
          </Tooltip>
        )
      );
    });
    const ConfirmBtn = observer(({ ds, current, steps }) => {
      const distrList = ds.length; // 确认发放列表不为空
      return (
        current === steps.length - 1 && (
          <Button color="primary" disabled={!distrList} onClick={() => this.handleSubmitModal()}>
            {intl.get(`sigl.memberCenter.view.title.confirmDistribute`).d('确认发放')}
          </Button>
        )
      );
    });
    const PrevBtn = observer(({ current }) => {
      return (
        current > 0 && (
          <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
            {intl.get(`sigl.memberCenter.view.button.prevStep`).d('上一步')}
          </Button>
        )
      );
    });
    const children = (
      <div>
        <PointsIssuanceModal
          onCloseModal={this.handleCloseModal}
          memberListDS={this.memberListDS}
          countFormDS={this.countFormDS}
          issuanceListDS={this.issuanceListDS}
          {...commonProps}
        />
      </div>
    );
    const footer = (
      <div>
        <NextBtn ds={this.memberListDS} {...commonProps} />
        <ConfirmBtn ds={this.issuanceListDS} {...commonProps} />
        <PrevBtn {...commonProps} />
        <Button onClick={this.handleCloseModal}>
          {intl.get(`hzero.common.btn.cancel`).d('取消')}
        </Button>
      </div>
    );
    return {
      children,
      footer,
    };
  }

  /**
   * 打开会员新建或编辑弹窗
   * 存在 recode 即为编辑
   */
  @Bind()
  handleOpenEditModal() {
    this.memberListDS.data = [];
    this.memberListDS.query();
    this.setState({ current: 0 });
    const { children, footer } = this.getEditModalPops(0);
    const modal = Modal.open({
      title: intl.get(`sigl.memberCenter.view.button.distributePoints`).d('积分发放'),
      drawer: true,
      onOk: this.handleOk,
      afterClose: this.handleAfterClose,
      className: classNames(styles['points-modal-footer']),
      closable: true,
      destroyOnClose: true,
      style: { width: 742 },
      children,
      footer,
    });
    this.setState({ modal });
  }

  @Bind()
  handleBatchImport() {
    openTab({
      key: `/sigl/batch-upload/SIGL.INTEGRAL_SEND`,
      search: queryString.stringify({
        key: `/sigl/batch-upload/SIGL.INTEGRAL_SEND`,
        title: 'hzero.common.title.batchImport',
        backPath: '/sigl/member-centre-points',
        action: intl.get(`sigl.memberCenter.view.title.pointsDistributeImport`).d('积分发放导入'),
      }),
    });
  }

  @Bind()
  get steps() {
    return [
      {
        title: intl.get(`sigl.memberCenter.view.title.selectedMember`).d('选择会员'),
        content: <SelectMember dataSet={this.memberListDS} />,
      },
      {
        title: intl.get('sigl.memberCenter.view.button.distributePoints').d('发放积分'),
        content: (
          <IssuanceTable
            onRemoveItem={this.handleRemoveMemberItem}
            onAddMember={this.handleAddMember}
            dataSet={this.issuanceListDS}
          />
        ),
      },
    ];
  }

  @Bind()
  async next() {
    const { current } = this.state;
    const currentStep = current + 1;
    this.setState({ current: currentStep });

    this.handlePackTableData();
    this.state.modal.update(this.getEditModalPops(currentStep));
  }

  @Bind()
  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
    this.state.modal.update(this.getEditModalPops(current));
  }

  @Bind()
  handleAddMember() {
    this.setState({ current: 0 });
  }

  /**
   * 包装确认发放积分的数据
   */
  @Bind()
  handlePackTableData() {
    const dataList = this.memberListDS.selected.map((item) => item.toData());
    dataList.forEach((item) => {
      Object.assign(item, {
        modifyIntegralType: 'GRANT',
        _status: 'update',
      });
    });
    this.issuanceListDS.data = dataList;
  }

  /**
   * 确认发放列表删除一条数据，同时会员列表去选此条数据
   */
  @Bind()
  handleRemoveMemberItem(ids) {
    this.memberListDS.batchUnSelect(
      this.memberListDS.selected?.filter((r) => ids.includes(r.get('memberId'))) || []
    );
  }

  // 关闭弹窗
  handleCloseModal = () => {
    this.state.modal.close();
  };

  // 关闭弹窗回调
  handleAfterClose = () => {
    this.memberListDS.unSelectAll();
    this.memberListDS.clearCachedSelected();
    this.issuanceListDS.reset();
    this.memberListDS.reset();
    this.countFormDS.reset();
    this.tableDS.query();
  };

  getQueryParams = () => {
    const queryParams = this.tableDS.queryDataSet?.current?.toData() || {};
    delete queryParams.creationDate;
    const operationIdList = this.tableDS?.selected?.map((s) => s?.get('operationId')) || [];
    return filterNullValueObject({
      operationIdList,
      ...filterNullValueObject(queryParams),
      ...filterNullValueObject(this.tableDS?.queryParameter?.params),
      customizeUnitCode: 'SIGL.PONIT_MANAGE.SEARCHBAR, SIGL.PONIT_MANAGE.LIST',
    });
  };

  /**
   * 确认发放操作
   */
  @Bind()
  async handleSubmitModal() {
    const res = await this.issuanceListDS.submit();
    if (getResponse(res)) {
      this.handleCloseModal();
      notification.success({
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
    }
  }

  render() {
    const {
      match: { path = '' },
      customizeTable,
      customizeBtnGroup,
    } = this.props;
    // const path = 'srm.mall.tenant.member.sigl.integral.ps'; // 权限集前缀

    const BatchExcelExport = observer(({ ds }) => {
      return (
        <ExcelExportPro
          templateCode="SIGL_INTEGRAL_SEND_EXPORT"
          exportAsync
          method='POST'
          allBody
          buttonText={
            !ds?.selected?.length
              ? intl.get('sigl.memberCenter.button.exportNew').d('(新)导出')
              : intl.get('sigl.memberCenter.button.exportNewBatch').d('勾选导出')
          }
          requestUrl={`/sigl/v1/${currentOrganizationId}/member-operations/export`}
          queryParams={() => this.getQueryParams()}
          otherButtonProps={{
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code: `${path}.button.export-new`,
                type: 'button',
                meaning: '积分管理-（新）导出',
              },
            ],
          }}
        />
      );
    });
    const customizeButtons = [
      {
        name: 'distributePoints',
        group: true,
        btnType: 'c7n-pro',
        child: (
          <Button icon="settings" color="primary">
            {intl.get(`sigl.memberCenter.view.title.pointsManage`).d('积分管理')}
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
            name: 'manualCreate',
            child: intl
              .get(`sigl.memberCenter.view.button.manualDistributePoints`)
              .d('手工发放积分'),
            btnProps: {
              type: 'c7n-pro',
              color: 'primary',
              onClick: this.handleOpenEditModal,
            },
          },
          {
            name: 'importPointsNew',
            btnComp: MenuItemLinkBtn,
            btnProps: {
              btnComp: ImportButton,
              businessObjectTemplateCode: 'SIGL.INTEGRAL_SEND_IMPORT',
              refreshButton: true,
              buttonText: intl.get('sigl.memberCenter.button.importPointsNew').d('(新)导入发放'),
              prefixPatch: '/sigl',
              action: intl
                .get(`sigl.memberCenter.view.title.pointsDistributeImport`)
                .d('积分发放导入'),
              buttonProps: {
                icon: '',
                funcType: 'flat',
                permissionList: [
                  {
                    code: `${path}.button.import-new`,
                    type: 'button',
                    meaning: '积分管理-（新）导入',
                  },
                ],
              },
              successCallBack: () => this.tableDS.query(),
            },
          },
          {
            name: 'importPoints',
            btnType: 'c7n-pro',
            child: intl.get(`sigl.memberCenter.view.button.importPoints`).d('导入发放'),
            btnProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              onClick: this.handleBatchImport,
            },
          },
        ],
      },
      {
        name: 'exportNew',
        btnComp: () => <BatchExcelExport ds={this.tableDS} />,
      },
      {
        name: 'oldExport',
        btnComp: ExcelExport,
        btnProps: {
          buttonText: intl.get('hzero.common.button.export').d('导出'),
          otherButtonProps: { icon: 'unarchive', type: 'c7n-pro', funcType: 'flat' },
          requestUrl: `/sigl/v1/${currentOrganizationId}/member-operations/export`,
          queryParams: () => this.getQueryParams(),
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get(`sigl.memberCenter.view.title.pointsManage`).d('积分管理')}>
          {customizeBtnGroup(
            {
              code: 'SIGL.PONIT_MANAGE.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={customizeButtons} />
          )}
        </Header>
        <Content>
          {customizeTable(
            { code: 'SIGL.PONIT_MANAGE.LIST' },
            <SearchBarTable
              searchCode="SIGL.PONIT_MANAGE.SEARCHBAR"
              dataSet={this.tableDS}
              columns={this.columns}
              style={{ maxHeight: 'calc(100vh - 192px)' }}
              searchBarConfig={{
                editorProps: {
                  pointsTypeId: {
                    noCache: true,
                  },
                },
              }}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
