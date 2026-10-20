/**
 * 协议工作台-列表index
 */
import React, { Fragment, useEffect, useState, useMemo, useCallback } from 'react';
import { DataSet, Modal, Tooltip, Dropdown, Menu, Attachment } from 'choerodon-ui/pro';
import { Tag, Icon, Tabs } from 'choerodon-ui';
import { compose, isEmpty, debounce, isArray } from 'lodash';
import { observer } from 'mobx-react-lite';
import { stringify, parse } from 'querystring';
import classNames from 'classnames';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import hocRemote from 'utils/remote';
// import moment from 'moment';
// import PropTypes from 'prop-types';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import notification from 'utils/notification';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import {
  getCurrentOrganizationId,
  getResponse,
  isUrl,
  getCurrentUserId,
  filterNullValueObject,
} from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import BudgetModal from 'srm-front-sbud/lib/routes/BudgetOccupiedModal';
import formatterCollections from 'utils/intl/formatterCollections';
// import DoubleTabs from '_components/DoubleTabs';
import IMChatDraggable from '_components/IMChatDraggable';
import { checkPermission } from 'services/api';
import { Button } from 'components/Permission';
import { getSearchBarCache } from '_components/SearchBarTable/util/cache';
import DocFlow from '_components/DocFlow';
import { openTab } from 'utils/menuTab';
import CommonImport from 'hzero-front/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';
import ModalBtn from '@/routes/PurchaseContractView/Modal/CertificateModal/ModalBtn';
import PermissionButton from '_components/PermissionButton';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import { openApproveModal } from '_components/ApproveModal';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import {
  deleteHeader,
  copyContract,
  rollbackContract,
  rollbackToSupplier,
  terminateContract,
  terminateContractValid,
  archiveContract,
  breakOffContract,
  submitContract,
  queryViewCertificateDeposit,
  invalidContract,
  rejectContract,
  revokeWorkflow,
  workbenchCount,
  changeContract,
  fetchHeader,
  fetchContractRebate,
  fetchStage,
  querySealType,
  getExtractConfig,
  queryPreTextFlag,
  createSignTask,
  invalidSignedTask,
  queryLatestTask,
} from '@/services/workspaceService';
import {
  fetchTerm,
  fetchSubject,
  fetchPartner,
  autoChangePo,
  getRelationDocControl,
} from '@/services/contractCommonService';
import {
  renderThousandthNum,
  queryCommonDoubleUomConfig,
  preSubmitValidBudget,
} from '@/utils/util';
import { renderArchiveFlag, renderTransferOrderStatus } from '@/utils/renderer';
import { checkOrderSignContract } from '@/utils/commonCheck';
import { MutlTextFieldSearch } from './Component/MultipleSearch';
import RollBackModal from './Component/Modal/RollBackModal';
import StageTab from './StageTab';
import showTerminateModal from './Component/Modal/ShowTerminateModal';
import { getOperationList } from './util';
import FileModal from './Component/Modal/FileModal';
import Srm77750Modal from './Component/Modal/Srm77750Modal';
import HistoricVersion from './Component/Modal/HistoricalVersion';
import showExectModal from './Component/Modal/ExectModal';
import showManuallyModal from './Component/Modal/ManuallyModal';
import StatusTag from '../components/StatusTag';
import OccupyModal from './Component/Modal/OccupyModal';
import showBachFileDownload from '../components/BachFileDownload';
import showConfirmEffectModal from './Component/Modal/ConfirmEffectModal';

// import { keys } from 'regenerator-runtime';
import ReferenceDocumentButton from './ReferenceDocument/Button';

import {
  toBeSubmited,
  underApproval,
  toBeSigned,
  all,
  detailAll,
  // orderCopy,
  // approvalComments,
} from './store/workSpaceDs';
import { StageAllDS } from './store/StageDS';
// import SealModal from './Component/Modal/SealModal';

// import C7nOperationRecord from '@/routes/components/C7nOperationRecord';
import styles from './index.less';

const { Item } = Menu;
const { TabPane, TabGroup } = Tabs;
let defaultActiveKey = '';
const organizationId = getCurrentOrganizationId();
const tenantId = getCurrentOrganizationId();
const currentUserId = getCurrentUserId();
const modelPrompt = 'spcm.purchaseContractView.model';
const commonPrompt = 'spcm.common.model.common';
const groupDefaultKey = { contract: 'all', detail: 'detailAll', stage: 'stageAll' };
const group = {
  toBeSubmited: 'contract',
  underApproval: 'contract',
  toBeSigned: 'contract',
  all: 'contract',
  detailAll: 'detail',
  stageAll: 'stageAll',
};

const WorkSpaceCom = (props) => {
  const {
    dispatch,
    workSpace,
    history,
    customizeTable,
    customizeTabPane,
    toBeSubmitedDs,
    underApprovalDs,
    toBeSignedDs,
    allDs,
    detailAllDs,
    stageAllDs,
    custConfig,
    customizeForm,
    customizeBtnGroup,
    location,
    remote,
  } = props;
  const { titleAggregate } = workSpace;
  const {
    layoutType,
    toBeSubmitted,
    released,
    detailedAll,
    underApprovaled,
    stageAll,
  } = titleAggregate;
  const { search } = location;
  const { defaultTabIndex } = parse(search.substr(1)); // 此处是配合工作台卡片跳转和采购助手链接跳转参数 固定用defaultTabIndex，勿修改

  // const [aggregation, setAggregation] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState(defaultTabIndex || defaultActiveKey);
  const [aggregationAll, setAggregationAll] = React.useState(false); // 整单全部
  const [aggregationToBeSubmit, setAggregationToBeSubmit] = React.useState(false); // 整单-待提交
  const [aggregationApproval, setAggregationApproval] = React.useState(false); // 整单-待审批
  const [aggregationSigned, setAggregationSigned] = React.useState(false); // 整单-签署
  const [aggregationDetailAll, setAggregationDetailAll] = React.useState(false); // 明细-全部
  const [loadings, setLoadings] = useState({});
  const [permissions, setPermissions] = useState([]);
  const [rollbackPermission, setRollbackPermission] = useState(false); // 退回至供应商按钮权限
  const [doubleUnitEnabled, setDoubleUnitEnabled] = useState(0);
  const [isOpenClearCashed, setIsOpenClearCashed] = useState(true); // 记录是否清楚缓存记录
  const [countData, setCountData] = useState({});
  const [sealType, setSealType] = useState();
  const [relationDoc, setRelationDoc] = useState({});
  const [extractConfig, setExtractConfig] = useState({});
  const { enableSmartContract, enableOnlineAttachmentContract } = extractConfig;

  const pathPart = useMemo(() => (enableSmartContract ? 'intelligent' : 'update'), [
    enableSmartContract,
  ]);

  const editorProps = useMemo(
    () => ({
      // tempKey: {
      //   tableProps: { queryBarProps: { defaultShowMore: true } },
      //   searchFieldProps: {
      //     placeholder: intl.get('spcm.workspace.view.placeholder.supplierId').d('请输入供应商名称'),
      //   },
      // },
    }),
    []
  );

  useEffect(() => {
    fetchPermission();
    fetchTabKey(); // 获取activeKey和groupDefaultKey
    fetchCount();
    fetchDoubleUnitFlag(); // 获取业务规则配置的双单位数据
    fetchSetting(); // 获取配置中心配置参数
    fetchSealType(); // 查询电签套餐
    fetchRelationDocControl(); // 查询单据流、执行单据业务规则是否开启
    fetchExtractConfig(); // 获取配置表是否开启【智能合同提取控制】、是否在【附件合同在线编辑黑名单】
    if (remote?.event) {
      remote.event.fireEvent('handleCuxUseEffect', { eventProps: props, group, groupDefaultKey });
    }
  }, []);
  const loading = (key, value) => {
    setLoadings({ ...loadings, [key]: value });
  };

  const fetchTabKey = () => {
    let defaultActive = activeKey;
    // 判断是否有缓存（defaultActiveKey）是否是从采购助手或者从工作台卡片跳转来（defaultTabIndex）
    if (!activeKey) {
      // 得到个性化的默认key
      const tabListFields = custConfig['SPCM.WORKSPACE_LIST.TABS']?.fields;
      const defaultActiveTab = tabListFields?.filter((item) => {
        return item.defaultActive === 1;
      });
      defaultActive = defaultActiveTab?.[0]?.fieldCode || 'all';
      onTabChange(defaultActive);
    }
    if (group[defaultActive]) {
      groupDefaultKey[group[defaultActive]] = defaultActive;
    }
  };

  const fetchCount = async () => {
    const data = getResponse(await workbenchCount()) || {};
    setCountData(data);
    /* 如下代码注释的原因是UI说：当tab在筛选器上方时，显示数量不应该随筛选结果变化 */
    // toBeSubmitedDs.totalCount = data.toBeSubmittedCount || 0;
    // underApprovalDs.totalCount = data.approvalCount || 0;
    // toBeSignedDs.totalCount = data.toBeSignedCount || 0;
    // allDs.totalCount = data.pcHeaderCount || 0;
    // detailAllDs.totalCount = data.subjectCount || 0;
    // stageAllDs.totalCount = data.stageCount || 0;
  };

  const fetchDoubleUnitFlag = async () => {
    const res = await queryCommonDoubleUomConfig();
    setDoubleUnitEnabled(res);
    detailAllDs.setState({ doubleUnitEnabled: res });
  };

  /**
   * 单据流、执行单据业务规则是否开启
   */
  const fetchRelationDocControl = async () => {
    const res = getResponse(await getRelationDocControl());
    if (res) {
      setRelationDoc(res);
    }
  };

  /**
   * 获取配置表是否开启【智能合同提取控制】、是否在【附件合同在线编辑黑名单】
   */
  const fetchExtractConfig = async () => {
    const res = getResponse(await getExtractConfig());
    if (res) {
      setExtractConfig(res);
    }
  };

  // 获取配置中心配置参数
  const fetchSetting = () => {
    dispatch({
      type: 'workSpace/setting',
    });
  };

  const fetchSealType = async () => {
    const res = await querySealType();
    // 此处不要用getResponse处理，因为‘核企未开通签章套餐’也会作为错误抛出，但是我们不需要将此错误可视化。
    setSealType(res?.sealType);
  };

  const fetchPermission = () => {
    // 请求权限
    const permissionList = [
      'srm.pc-admin.pc-purchaser.workspace2.ps.submit.button', // 提交
      'srm.pc-admin.pc-purchaser.workspace2.ps.delete.button', // 删除
      'srm.pc-admin.pc-purchaser.workspace2.ps.contract-copy', // 复制
      'srm.pc-admin.pc-purchaser.workspace2.button.edit', // 编辑
      'srm.pc-admin.pc-purchaser.workspace2.button.seal', // 用章
      'srm.pc-admin.pc-purchaser.workspace2.ps.back.button', // 退回
      'srm.pc-admin.pc-purchaser.workspace2.button.back.supplier', // 退回至供应商
      'srm.pc-admin.pc-purchaser.workspace2.ps.ps.change', // 变更
      'srm.pc-admin.pc-purchaser.workspace2.ps.stop.button', // 终止
      'srm.pc-admin.pc-purchaser.workspace2.button.terminate', // 解约
      'srm.pc-admin.pc-purchaser.workspace2.ps.archive.contract', // 归档
      'srm.pc-admin.pc-purchaser.workspace2.button.evidence', // 查看存证
      'srm.pc-admin.pc-purchaser.workspace2.button.comfirm.cancel', // 修改
      'srm.pc-admin.pc-purchaser.workspace2.button.comfirm.effect', // 确认生效
      'srm.pc-admin.pc-purchaser.workspace2.ps.invalid.button', // 作废
      'srm.pc-admin.pc-purchaser.workspace2.ps.reference.button', // 引用单据创建
      'srm.pc-admin.pc-purchaser.workspace2.ps.create.button', // 手工创建
      'srm.pc-admin.pc-purchaser.workspace2.ps.pcheader.import', // 批量导入
      'srm.pc-admin.pc-purchaser.workspace2.button.pcheader.import.new', // 新批量导入
      'srm.pc-admin.pc-purchaser.workspace2.button.revoke-approve', // 撤销审批
      'srm.pc-admin.pc-purchaser.workspace2.button.version', // 版本查看
      'srm.pc-admin.pc-purchaser.workspace2.button.approve', // 审批
    ];
    checkPermission(permissionList).then((res) => {
      if (getResponse(res)) {
        setPermissions(res);
        const target = res?.find(
          (item) => item.code === 'srm.pc-admin.pc-purchaser.workspace2.button.back.supplier'
        );
        setRollbackPermission(target?.approve);
      }
    });
  };

  // 打开历史版本
  const openHistoricalVersion = (record) => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get('spcm.common.view.title.versionView').d('版本查看'),
      bodyStyle: { padding: 0 },
      children: <HistoricVersion record={record} goDetail={goDetail} />,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
      destroyOnClose: true,
      style: { width: '742px' },
    });
  };

  const handleBreakOffContract = (record) => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl.get(`spcm.common.view.message.title.breakOffContract`).d('确认发起解约吗？'),
      onOk: async () => {
        const res = await breakOffContract(record.toData());
        if (getResponse(res)) {
          notification.success();
          allDs.query();
        }
      },
    });
  };

  // 归档
  const archiveModel = (records) => {
    const fileModalDS = () => ({
      fields: [
        {
          name: 'pcNum',
          type: 'string',
          label: intl.get(`spcm.common.model.common.pcNum`).d('协议编号'),
        },
        {
          name: 'pcName',
          type: 'string',
          label: intl.get(`spcm.common.model.common.pcName`).d('协议名称'),
        },
        {
          name: 'createByRealName',
          type: 'string',
          label: intl.get(`spcm.common.model.common.createByRealName`).d('创建人'),
        },
        {
          name: 'archiveCode',
          type: 'string',
          label: intl.get(`spcm.common.archiveCode`).d('归档码'),
          maxLength: 32,
        },
        {
          name: 'archiveAttachmentUuid',
          type: 'attachment',
          label: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
        },
      ],
    });
    const archiveDS = new DataSet(fileModalDS());
    archiveDS.create(records.toData());
    Modal.open({
      drawer: true,
      title: intl.get(`spcm.common.view.button.file`).d('填写归档编码'),
      children: <FileModal remote={remote} ds={archiveDS} />,
      style: {
        width: '380px',
      },
      onOk: async () => {
        const status = await archiveDS.validate();
        if (!status) return false;
        if (remote?.event) {
          const preArchiveRes = await remote.event.fireEvent('handleCuxPreArchive', {
            archiveDS,
            records,
            eventProps: props,
            loading,
          });
          if (!preArchiveRes) {
            return false;
          }
        }
        loading('handleLoading', true);
        const res = await archiveContract(archiveDS.toData()[0]);
        loading('handleLoading', false);
        if (getResponse(res)) {
          notification.success();
          if (remote?.event) {
            remote.event.fireEvent('handleCuxArchive', { archiveDS, records, eventProps: props });
          }
          allDs.query();
        } else {
          return false;
        }
      },
      afterClose: () => {
        archiveDS.reset();
      },
    });
  };

  // 归档文件上传成功
  const archiveUploadSuccess = (record, attachment) => {
    // 第一次上传附件
    if (!record.get('archiveAttachmentUuid')) {
      const { attachmentUUID } = attachment;
      dispatch({
        type: 'workSpace/updateArchiveAttachment',
        payload: {
          pcHeaderId: record.get('pcHeaderId'),
          archiveAttachmentUuid: attachmentUUID,
        },
      }).then(() => {
        allDs.query();
      });
    } else {
      allDs.query();
    }
  };

  // 导入协议
  const handleImportContract = () => {
    openTab({
      key: '/spcm/contract-subject/data-import/SPCM.PC_CONTRACT_IMPORT',
      path: '/spcm/contract-subject/data-import/SPCM.PC_CONTRACT_IMPORT',
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: stringify({
        sync: true,
        action: 'hzero.common.title.batchImport',
        backPath: `/spcm/contract-workspace/list`,
        args: JSON.stringify({ workbenchFlag: '1' }),
      }),
    });
  };

  // 跳转手工建协议
  const goCreateManually = (pcHeaderId) => {
    const jumpToCreate = () => {
      if (enableSmartContract || enableOnlineAttachmentContract) {
        showManuallyModal({ remote, dispatch, enableSmartContract, customizeForm });
      } else {
        history.push({
          pathname: `/spcm/contract-workspace/create`,
          search: pcHeaderId ? `?pcHeaderId=${pcHeaderId}` : null,
        });
      }
    };
    if (remote?.event) {
      remote.event.fireEvent('handleCuxCreateManually', {
        pcHeaderId,
        props,
        jumpToCreate,
      });
    } else {
      jumpToCreate();
    }
  };

  // 复制协议
  const handleExpContractCopy = async (pcHeaderId, record) => {
    const pathValue = getRoutePath(record);
    loading('handleLoading', true);
    const res = getResponse(
      await copyContract({
        pcHeaderId,
        customizeUnitCode:
          'SPCM.WORKSPACE_DETAIL.HEADER,SPCM.WORKSPACE_DETAIL.SUBJECT,SPCM.WORKSPACE_DETAIL.STAGE,SPCM.WORKSPACE_DETAIL.PARTNER,SPCM.WORKSPACE_DETAIL.BUSINESSTERMS,SPCM.WORKSPACE_DETAIL.ATTACHMENT_FORM,SPCM.WORKSPACE_DETAIL.REBATE',
      })
    );
    loading('handleLoading', false);
    const hasFailed = res?.toString().indexOf('failed');
    if (hasFailed === -1) {
      notification.success();
      history.push({
        pathname: `/spcm/contract-workspace/${pathValue}/${res}`,
      });
    } else {
      const resObj = JSON.parse(res);
      notification.error({
        message: resObj.message,
      });
      return false;
    }
  };

  // 复制协议
  const handleContractCopy = (pcHeaderId, record) => {
    Modal.confirm({
      key: Modal.key(),
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl.get('spcm.common.view.message.copyOrNot').d('是否确认进行复制协议的操作'),
      onOk: () => handleExpContractCopy(pcHeaderId, record),
    });
  };

  // 退回
  const handleRollback = async (pcHeaderId, rollBackType, record) => {
    if (record) {
      const notAllowedFlag = checkOrderSignContract(record.toData());
      if (notAllowedFlag) {
        return;
      }
    }
    const rollBackDs = () => ({
      fields: [
        {
          name: 'backReason',
          type: 'string',
          label: intl.get('spcm.purchaseContractView.pb.returnCause').d('退回原因'),
        },
      ],
    });
    const RollBackDs = new DataSet(rollBackDs());
    const pcHeaderIds = [pcHeaderId];
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.button.rollback').d('退回'),
      children: <RollBackModal ds={RollBackDs} />,
      style: {
        width: 380,
      },
      onOk: async () => {
        let res = null;
        loading('handleLoading', true);
        if (rollBackType === 'supplier') {
          res = await rollbackToSupplier({
            pcHeaderIds,
            backReason: RollBackDs.toData()[0]?.backReason,
          });
        } else {
          res = await rollbackContract({
            pcHeaderIds,
            backReason: RollBackDs.toData()[0]?.backReason,
          });
        }
        loading('handleLoading', false);
        if (getResponse(res)) {
          notification.success();
          allDs.query();
        } else {
          return false;
        }
      },
      afterClose: () => {
        RollBackDs.reset();
      },
    });
  };

  // 新建下拉框
  const getCreationButton = () => {
    const { setting = {} } = workSpace;
    const {
      dsHcFlag, // 手工创建
      dsPoFlag, // 采购订单
      dsFrFlag, // 寻源结果
      dsPrFlag, // 采购申请
    } = setting;
    const { pcHeaderId } = parse(search.substr(1));
    // { funcType: 'flat' }
    const mainProp = { color: 'primary' };
    const defaultActions = [
      {
        code: 'srm.pc-admin.pc-purchaser.workspace2.ps.reference.button',
        button: (dsPoFlag || dsFrFlag || dsPrFlag) && {
          name: 'referenceCreation',
          child: intl.get('spcm.workspace.view.button.referenceCreation').d('引用单据创建'),
          btnProps: {
            onClick: () => ReferenceDocumentButton({ setting, extractConfig }),
          },
        },
      },
      {
        code: 'srm.pc-admin.pc-purchaser.workspace2.ps.create.button',
        button: dsHcFlag && {
          name: 'createdManually',
          child: intl.get('spcm.workspace.view.button.createdManually').d('手工创建'),
          btnProps: {
            onClick: goCreateManually,
          },
        },
      },
      {
        code: 'srm.pc-admin.pc-purchaser.workspace2.ps.pcheader.import',
        button: {
          name: 'batchImport',
          child: intl.get('hzero.common.title.batchImport').d('批量导入'),
          btnProps: {
            onClick: handleImportContract,
          },
        },
      },
      {
        code: 'srm.pc-admin.pc-purchaser.workspace2.button.pcheader.import.new',
        button: {
          name: 'newBatchImport',
          btnComp: CommonImport,
          btnProps: {
            businessObjectTemplateCode: 'SPCM.PC_CONTRACT_IMPORT',
            prefixPatch: '/spcm',
            buttonText: intl.get('hzero.common.button.newBatchImport').d('(新)批量导入'),
            args: { pcHeaderId, workbenchFlag: '1' },
            buttonProps: {
              icon: '',
              funcType: 'flat',
              className: styles['new-import'],
            },
            successCallBack: () => {
              const { toBeSubmitedDs, allDs, detailAllDs, stageAllDs } = props;
              toBeSubmitedDs.query();
              allDs.query();
              detailAllDs.query();
              stageAllDs.query();
            },
          },
        },
      },
    ];
    const getOverlay = () => {
      let actions = defaultActions.filter((i) => {
        const currenPer = permissions.find((n) => n.code === i.code);
        return currenPer ? currenPer.approve : true;
      });
      actions = remote
        ? remote.process('SPCM_WORKSPACE_LIST_ALL_GET_OVERLAY', actions, {
            props,
            activeKey,
          })
        : actions;
      return actions
        .map((i) => {
          return i.button;
        })
        .filter(Boolean);
    };
    const overlay = getOverlay();
    if (isEmpty(overlay)) return false;
    return {
      name: 'create',
      group: true,
      children: overlay,
      // btnProps:{
      //   permissionList:[
      //   {
      //     code: 'srm.po-admin.po.order-workspace.ps.button.wholetobesubmited.create',
      //     type: 'c7n-pro',
      //     meaning: '订单工作台-列表-新建',
      //   },
      // ]},
      child: (
        <Button {...mainProp} icon="add" type="c7n-pro">
          {intl.get('hzero.common.button.creat').d('新建')}
          <Icon
            type="expand_more"
            style={{
              marginLeft: 4,
              marginTop: -2,
              fontSize: '16px',
            }}
          />
        </Button>
      ) || <span style={{ display: 'none' }} />,
    };
  };

  const extractRecord = (dataSet) => {
    const { selected } = dataSet;
    const otherButtonProps = {
      type: 'c7n-pro',
      funcType: 'flat',
      icon: '',
      className: styles['menu-btn'],
    };
    return [
      {
        name: 'exportExtractionLog',
        btnComp: ExcelExportPro,
        btnType: 'c7n-pro',
        btnProps: {
          allBody: true,
          method: 'POST',
          templateCode: 'SRM_C_SRM_SPCM_PC_HEADER_USAGE_RECORDS',
          otherButtonProps,
          buttonText: intl
            .get('spcm.common.button.exportExtractionLog', {
              checked: selected.length
                ? intl.get(`spcm.common.btn.checkedExport`).d('（勾选导出）')
                : '',
            })
            .d('导出提取使用记录'),
          requestUrl: `${SRM_SPCM}/v1/${organizationId}/contract-extract-usage/export`,
          queryParams: getExportParams({
            dataSet,
            idName: 'pcHeaderId',
            newExportFlag: true,
          }),
        },
      },
      {
        name: 'exportReport',
        btnComp: ExcelExportPro,
        btnType: 'c7n-pro',
        btnProps: {
          allBody: true,
          method: 'POST',
          templateCode: 'SRM_C_SRM_SPCM_PC_HEADER_SMART',
          otherButtonProps,
          buttonText: intl
            .get('spcm.common.button.exportReport', {
              checked: selected.length
                ? intl.get(`spcm.common.btn.checkedExport`).d('（勾选导出）')
                : '',
            })
            .d('导出审查执行报告'),
          requestUrl: `${SRM_SPCM}/v1/${organizationId}/workbench/review-record/export`,
          queryParams: getExportParams({
            dataSet,
            idName: 'pcHeaderId',
            newExportFlag: true,
          }),
        },
      },
      {
        name: 'accuracyExport',
        btnComp: ExcelExportPro,
        btnType: 'c7n-pro',
        btnProps: {
          allBody: true,
          method: 'POST',
          templateCode: 'SRM_C_SRM_SPCM_PC_HEADER_ACCURACY_RESULT',
          otherButtonProps,
          buttonText: intl
            .get('spcm.common.button.accuracyExport', {
              checked: selected.length
                ? intl.get(`spcm.common.btn.checkedExport`).d('（勾选导出）')
                : '',
            })
            .d('提取-提交核验详情'),
          requestUrl: `${SRM_SPCM}/v1/${organizationId}/field-accuracy-results/export`,
          queryParams: getExportParams({
            dataSet,
            idName: 'pcHeaderId',
            newExportFlag: true,
          }),
        },
      },
    ];
  };

  /**
   * 终止协议前置处理
   * @returns
   */
  const terminateContractFunc = async (record) => {
    const notAllowedFlag = checkOrderSignContract(record?.toData());
    if (notAllowedFlag) {
      return;
    }

    const pcHeaderId = record?.get('pcHeaderId');

    const validRes = getResponse(await terminateContractValid([pcHeaderId]));
    if (validRes) {
      // strategy：2，existsDwonStream： Y，显示弱提示：合同存在有效下游订单/物流/预付款，合同不可终止
      if (validRes?.strategy === '2' && validRes?.existsDwonStream === 'Y') {
        const feedback = await Modal.confirm({
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('spcm.common.view.message.cannotTerminate')
            .d('合同存在有效下游订单/物流/预付款，合同不可终止'),
        });
        if (feedback === 'ok') {
          showTerminateModal((ds) => handleTerminate(ds, record), {
            customizeForm,
            headerInfo: record.toData(),
          });
        }
        return false;
      }
      // strategy：0或1，直接终止
      showTerminateModal((ds) => handleTerminate(ds, record), {
        customizeForm,
        headerInfo: record.toData(),
      });
    }
  };

  // 这个可以写进USEcALLBACK里面
  const handleTerminate = async (terminateDs, record) => {
    const selectedRow = record.toData();
    const data = (await terminateDs.toData()[0]) || {};
    const { terminationReason, terminationAttachmentUuid } = data;
    const params = {
      terminationReason,
      pcHeaderStatus: 'TERMINATION_CONFIRM',
      pcHeaderDetailDtos: [
        { ...selectedRow, ...data, terminationReason, terminationAttachmentUuid },
      ],
    };
    loading('handleLoading', true);
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxTerminate', {
        allDs,
        terminateDs,
        record,
      });
      if (!res) {
        return;
      }
    }
    const response = getResponse(await terminateContract(params));
    loading('handleLoading', false);
    if (response) {
      notification.success();
      allDs.query();
    } else {
      return false;
    }
  };

  /**
   * protocolType - 预览编辑render方法
   * @param {!object} record - 行数据
   * @param {any} value - 单元格文本数据
   */
  const protocolType = ({ value, record }) => {
    const { overdueRemindFlag, interRecords, msgNum } = record.toJSONData();
    const isAllSuccuss =
      Array.isArray(interRecords) &&
      interRecords.length > 0 &&
      interRecords.some((i) => i.importStatus === '0');
    const IconCom = isAllSuccuss ? (
      <Tooltip title={intl.get(`spcm.workspace.model.pushsap.status.fail`).d('同步失败')}>
        <Icon className={styles['row-agent-column-icon']} type="cancel" />
      </Tooltip>
    ) : (
      ''
    );
    const msgNumEle =
      msgNum > 0 ? (
        <Tooltip
          title={intl
            .get('spcm.common.view.tooltip.unreadMessages', {
              msgNum: msgNum > 99 ? '99+' : msgNum,
            })
            .d('{msgNum}条在线沟通消息未读')}
        >
          <Icon type="notifications" className={styles['row-agent-column-icon']} />
        </Tooltip>
      ) : null;
    const rendererPcNum = () => (
      <>
        {overdueRemindFlag === 1 ? (
          <a style={{ color: 'red' }} onClick={() => goDetail(record, 'all')}>
            <Tooltip title={intl.get('spcm.common.view.tips.overdueRemindFlag').d('超期协议')}>
              {value}
            </Tooltip>
          </a>
        ) : (
          <a onClick={() => goDetail(record, 'all')}>{value}</a>
        )}
        {IconCom}
        {msgNumEle}
      </>
    );

    return remote
      ? remote.process('SPCM_WORKSPACE_LIST_ALL_RENDERER_PC_NUM', rendererPcNum(), {
          value,
          msgNumEle,
          record,
          renderProps: props,
          IconCom,
          goDetail,
        })
      : rendererPcNum();
  };

  const handlePushSAP = () => {
    dispatch({
      type: 'workSpace/contractPushExternalSystemData',
      payload: allDs?.selected?.map((record) => {
        return record.get('pcHeaderId');
      }),
    }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        allDs.query();
        allDs.unSelectAll();
      }
    });
  };

  const getExportParams = ({ dataSet, idName = 'pcHeaderId', newExportFlag }) => {
    const { selected, queryDataSet } = dataSet;
    const queryParameter = dataSet.queryParameter || {};
    const dsParams = queryDataSet ? queryDataSet.toData()[0] : {};
    const ids = selected.map((i) => i.get(idName));
    const { multiPcNumOrTitle } = dsParams || {};

    if (newExportFlag) {
      return filterNullValueObject({
        ...queryParameter,
        ...(selected.length > 0
          ? { [`${idName}s`]: ids }
          : { ...dsParams, customizeOrderField: null }),
        multiPcNumOrTitle: multiPcNumOrTitle?.split
          ? multiPcNumOrTitle?.split(',')
          : multiPcNumOrTitle,
        pcStatusSet: dsParams?.pcStatusSet?.split && dsParams?.pcStatusSet?.split(','),
      });
    } else {
      const queryParams =
        selected.length > 0
          ? { [`${idName}s`]: ids.join(',') }
          : { ...dsParams, customizeOrderField: null };
      return { ...queryParams, ...queryParameter };
    }
  };

  /**
   * 作废签署任务
   */
  const handleInvalidSignedTask = (pcHeaderId) => {
    const payload = {
      pcHeaderId,
    };
    loading('handleLoading', true);
    return invalidSignedTask(payload)
      .then((res) => {
        if (getResponse(res)) {
          allDs.query();
        }
      })
      .finally(() => loading('handleLoading', false));
  };

  // 按钮
  const getBtns = () => {
    let Buttons;
    const createBtn = getCreationButton();
    switch (activeKey) {
      case 'underApproval':
        return customizeBtnGroup(
          { code: 'SPCM.WORKSPACE_ALL.BUTTONS', pro: true },
          <DynamicButtons key="dynamicButtons" buttons={[createBtn]} />
        );
      case 'toBeSigned': {
        const cuxButtons = remote
          ? remote.process('SPCM_WORKSPACE_LIST_PROCESS_HEADER_BUTTONS', [], {
              activeKey,
              toBeSignedDs,
              allDs,
            })
          : [];
        return customizeBtnGroup(
          { code: 'SPCM.WORKSPACE_ALL.BUTTONS', pro: true },
          <DynamicButtons key="dynamicButtons" buttons={[createBtn].concat(cuxButtons)} />
        );
      }
      case 'all':
        Buttons = observer(({ dataSet }) => {
          const { selected } = dataSet;
          const btnList = [createBtn].concat([
            {
              name: 'pushSap',
              btnType: 'c7n-pro',
              btnComp: PermissionButton,
              btnProps: {
                funcType: 'flat',
                type: 'c7n-pro',
                icon: 'publish2',
                disabled:
                  !selected.length ||
                  !selected.every((record) => {
                    return (
                      record.get('interRecords') &&
                      record.get('interRecords').some((v) => v && v.importStatus === '0')
                    );
                  }),
                onClick: handlePushSAP,
                loading: loading.pushSapLoading,
                permissionList: [
                  {
                    code: 'srm.pc-admin.pc-purchaser.workspace2.button.pushsap',
                    type: 'c7n-pro',
                    meaning: '协议工作台-推送外部系统',
                  },
                ],
              },
              child: intl.get('spcm.purchaseContractView.view.button.pushsap').d('推送外部系统'),
            },
            {
              name: 'fileDownload',
              btnType: 'c7n-pro',
              btnComp: PermissionButton,
              btnProps: {
                funcType: 'flat',
                type: 'c7n-pro',
                icon: 'get_app',
                permissionList: [
                  {
                    code: 'srm.pc-admin.pc-purchaser.workspace2.button.fileDownload',
                    type: 'c7n-pro',
                    meaning: '下载附件',
                  },
                ],
                disabled: !selected.length,
                onClick: () =>
                  showBachFileDownload({
                    pcHeaderIds: selected.map((record) => record.get('pcHeaderId')),
                  }),
              },
              child: intl.get('spcm.purchaseContractView.view.button.fileDownload').d('下载附件'),
            },
            {
              name: 'extractRecord',
              group: true,
              child: (
                <Button icon="export" type="c7n-pro" funcType="flat">
                  {intl.get('spcm.common.view.button.extractRecord').d('导出审查与提取记录')}
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
              btnProps: {
                funcType: 'flat',
              },
              children: extractRecord(dataSet),
            },
          ]);
          const cuxButtons = remote
            ? remote.process('SPCM_WORKSPACE_LIST_PROCESS_HEADER_ALL_BUTTONS', btnList, {
                activeKey,
                allDs,
              })
            : btnList;
          return (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SPCM.WORKSPACE_ALL.BUTTONS', pro: true },
                <DynamicButtons key="dynamicButtons" buttons={cuxButtons} />
              )}
              <ExcelExportPro
                data-name="newExport"
                method="POST"
                allBody
                buttonText={
                  selected.length
                    ? intl.get(`hzero.common.checkedExport`).d('勾选导出')
                    : intl.get(`spcm.common.button.newExport`).d('新版导出')
                }
                otherButtonProps={{
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code: 'srm.pc-admin.pc-purchaser.workspace2.ps.pcheader.export',
                      type: 'button',
                      meaning: '新版导出(协议)',
                    },
                  ],
                }}
                templateCode="SRM_C_SRM_SPCM_PC_HEADER_EXPORT"
                requestUrl={`${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchase-view/excel-export-workbench`}
                queryParams={getExportParams({
                  dataSet,
                  idName: 'pcHeaderId',
                  newExportFlag: true,
                })}
              />
              <ExcelExport
                data-name="export"
                buttonText={intl.get(`hzero.common.button.export`).d('导出')}
                otherButtonProps={{
                  type: 'c7n-pro',
                  icon: 'unarchive',
                  funcType: 'flat',
                  permissionList: [
                    {
                      code: 'srm.pc-admin.pc-purchaser.workspace2.button.pcheader.old.export',
                      type: 'button',
                      meaning: '导出',
                    },
                  ],
                }}
                requestUrl={`${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchase-view/excel-export-workbench`}
                queryParams={getExportParams({
                  dataSet,
                  idName: 'pcHeaderId',
                  newExportFlag: false,
                })}
              />
            </Fragment>
          );
        });
        return <Buttons dataSet={allDs} />;
      case 'detailAll':
      case group.stageAll:
        Buttons = observer(({ dataSet }) => {
          const { selected } = dataSet;
          let custCode = 'SPCM.WORKSPACE_ALL.BUTTONS';
          let exportProUrl = `${SRM_SPCM}/v1/${tenantId}/contract-report/receiving/excel-details-new`;
          let templateCode = 'SRM_C_SRM_SPCM_PC_HEADER_EXPORT_DETAILS';
          let idName = 'pcSubjectId';
          if (activeKey === group.stageAll) {
            custCode = 'SPCM.WORKSPACE_STAGE_ALL.BTN_GROUP';
            templateCode = 'SRM_C_SRM_SPCM_PC_HEADER_EXPORT_STAGE';
            exportProUrl = `${SRM_SPCM}/v1/${tenantId}/workbench/stage/export`;
            idName = 'pcStageId';
          }
          const cuxButtons = remote
            ? remote.process('SPCM_WORKSPACE_LIST_PROCESS_HEADER_SUBJECT_BUTTONS', [createBtn], {
                activeKey,
                custCode,
                dataSet,
              })
            : [createBtn];
          return (
            <Fragment>
              {customizeBtnGroup(
                { code: custCode, pro: true },
                <DynamicButtons key="dynamicButtons" buttons={cuxButtons} />
              )}
              <ExcelExportPro
                method="POST"
                allBody
                buttonText={
                  selected.length
                    ? intl.get(`hzero.common.checkedExport`).d('勾选导出')
                    : intl.get(`spcm.common.button.newExport`).d('新版导出')
                }
                otherButtonProps={{
                  type: 'c7n-pro',
                  icon: 'unarchive',
                  funcType: 'flat',
                  permissionList: [
                    {
                      code: 'srm.pc-admin.pc-purchaser.workspace2.ps.pcheader.export',
                      type: 'button',
                      meaning: '新版导出(协议)',
                    },
                  ],
                }}
                templateCode={templateCode}
                requestUrl={exportProUrl}
                queryParams={getExportParams({ dataSet, idName, newExportFlag: true })}
              />
              {activeKey === 'detailAll' && (
                <ExcelExport
                  data-name="export"
                  buttonText={intl.get(`hzero.common.button.export`).d('导出')}
                  otherButtonProps={{
                    type: 'c7n-pro',
                    icon: 'unarchive',
                    funcType: 'flat',
                    permissionList: [
                      {
                        code: 'srm.pc-admin.pc-purchaser.workspace2.button.pcheader.old.export',
                        type: 'button',
                        meaning: '导出',
                      },
                    ],
                  }}
                  requestUrl={`${SRM_SPCM}/v1/${tenantId}/contract-report/receiving/excel-details`}
                  queryParams={getExportParams({ dataSet, idName, newExportFlag: false })}
                />
              )}
            </Fragment>
          );
        });
        return <Buttons dataSet={activeKey === 'detailAll' ? detailAllDs : stageAllDs} />;
      default:
        Buttons = observer(({ dataSet }) => {
          const btnList = [createBtn].concat([
            {
              name: 'submit',
              btnType: 'c7n-pro',
              btnComp: PermissionButton,
              btnProps: {
                icon: 'check',
                funcType: 'flat',
                type: 'c7n-pro',
                disabled: !dataSet.selected.length,
                onClick: () => {
                  Modal.confirm({
                    title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
                    children: intl
                      .get(`spcm.contractMaintain.view.message.title.confirmSubmit`)
                      .d('是否提交协议'),
                    onOk: async () => {
                      if (remote?.event) {
                        const res = await remote.event.fireEvent('handleCuxSubmit', {
                          dataSet,
                          activeKey,
                        });
                        if (!res) {
                          return;
                        }
                      }
                      const validateBudgetFlag = await preSubmitValidBudget(
                        dataSet.selected.map((item) => {
                          return {
                            ...item.toData(),
                            workbenchFlag: '1',
                          };
                        })
                      );
                      if (!validateBudgetFlag) {
                        return null;
                      }
                      // 获取需要审查的合同
                      const needReviewPcNumStr = dataSet.selected
                        .filter((i) => i.get('reviewTemplateId'))
                        .filter((r, index) => index < 10) // 只取前10条
                        .map((i) => i.get('pcNum'))
                        .join(',');
                      if (needReviewPcNumStr) {
                        notification.error({
                          description: intl
                            .get('spcm.workspace.view.message.pcNumReviewMsg', {
                              pcNum: needReviewPcNumStr,
                            })
                            .d(
                              `合同{${needReviewPcNumStr}}需要进行审查后再提交，请在详情页进入智能审查页面进行提交。`
                            ),
                        });
                        return;
                      }
                      const res = await submitContract({
                        pcHeaderList: dataSet.selected.map((item) => {
                          return {
                            ...item.toData(),
                            workbenchFlag: '1',
                          };
                        }),
                      });
                      if (getResponse(res)) {
                        notification.success();
                        dataSet.query();
                        dataSet.unSelectAll();
                      }
                    },
                  });
                },
                loading: loadings.submitLoading,
                permissionList: [
                  {
                    code: 'srm.pc-admin.pc-purchaser.workspace2.ps.submit.button',
                    type: 'c7n-pro',
                    meaning: '协议工作台-整单待提交-提交',
                  },
                ],
              },
              child: intl.get(`hzero.common.button.submit`).d('提交'),
            },
            {
              name: 'delete',
              btnType: 'c7n-pro',
              btnComp: PermissionButton,
              btnProps: {
                icon: 'delete_sweep',
                funcType: 'flat',
                type: 'c7n-pro',
                disabled: !dataSet.selected.length,
                onClick: () => {
                  Modal.confirm({
                    title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
                    children: intl
                      .get(`spcm.common.view.message.title.deleteContract`)
                      .d('确认要删除当前协议么？'),
                    onOk: async () => {
                      const res = await deleteHeader(
                        dataSet.selected.map((item) => {
                          return item.toData();
                        })
                      );
                      if (getResponse(res)) {
                        notification.success();
                        dataSet.query();
                        dataSet.unSelectAll();
                      }
                    },
                  });
                },
                loading: loadings.submitLoading,
                permissionList: [
                  {
                    code: 'srm.pc-admin.pc-purchaser.workspace2.ps.delete.button',
                    type: 'c7n-pro',
                    meaning: '协议工作台-合同待提交-删除',
                  },
                ],
              },
              child: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
            },
          ]);
          return customizeBtnGroup(
            { code: 'SPCM.WORKSPACE_TOBESUBMITED.BTN_GROUP', pro: true },
            <DynamicButtons key="dynamicButtons" buttons={btnList} />
          );
        });
        return remote ? (
          remote.render(
            'SPCM_WORKSPACE_LIST_RENDER_DEFAULT_BUTTONS',
            <Buttons dataSet={toBeSubmitedDs} />,
            {
              props,
              groupDefaultKey,
              group,
              activeKey,
              loadings,
              extractConfig,
              loading,
            }
          )
        ) : (
          <Buttons dataSet={toBeSubmitedDs} />
        );
    }
  };

  // e签宝查看存证
  const handleJumpViewCertificateDeposit = (record) => {
    const sceneCertificateNo = record.get('sceneCertificateNo');
    const pcHeaderId = record.get('pcHeaderId');
    queryViewCertificateDeposit({
      pcHeaderId,
      sceneCertificateNo,
      tenantId,
    }).then((res) => {
      if (isUrl(res)) {
        window.open(res);
      } else if (res === 'Y') {
        notification.warning({
          message: intl
            .get('spcm.common.view.jurisdiction')
            .d('由于存证查看权限升级，该类历史存证仅能由签署人查看'),
        });
      } else if (res === 'N') {
        notification.warning({
          message: intl.get('spcm.common.view.noViewDepositPermission').d('无查看该存证权限'),
        });
      } else if (res === 'U') {
        notification.warning({
          message: intl
            .get('spcm.common.view.noRealNameCertificationOrCertification')
            .d('无实名认证或认证中'),
        });
      } else {
        notification.warning({
          message: intl.get('spcm.common.view.noQueryViewCertificateDeposit').d('暂未查询到数据！'),
        });
      }
    });
  };

  /**
   * 确认生效
   * @param {*} record 行数据
   */
  const handleComfirmEffect = async (record) => {
    const callBack = () => {
      notification.success();
      allDs.query();
    };
    showConfirmEffectModal({ headerInfo: record.toData(), callBack });
  };

  /**
   * 修改 将状态【待生效】改为【拒绝生效】
   * @param {*} record 行数据
   */
  const handleComfirmCancel = async (record) => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl.get(`spcm.common.view.message.title.comfirmCancel`).d('确认修改协议吗？'),
      onOk: async () => {
        const res = await rejectContract([record.toData()]);
        if (getResponse(res)) {
          notification.success();
          allDs.query();
        }
      },
    });
  };

  /**
   * 作废
   * @param {object} record 行数据
   */
  const handleInvalid = async (record) => {
    const notAllowedFlag = checkOrderSignContract(record?.toData());
    if (notAllowedFlag) {
      return;
    }
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxInvalid', { record, allDs });
      if (!res) {
        return;
      }
    }
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get(`spcm.common.view.message.title.invalidContract`)
        .d('确认要作废该协议吗？'),
      onOk: async () => {
        const res = await invalidContract([record.toData()]);
        if (getResponse(res)) {
          notification.success();
          allDs.query();
        }
      },
    });
  };

  /**
   * 审批
   * @param {object} record 行数据
   */
  const handleApprove = async (record) => {
    const approvalByBusKey = record.get('approvalByBusKey') || {};
    const { taskId, processInstanceId } = approvalByBusKey;
    if (taskId && processInstanceId) {
      openApproveModal({
        taskId,
        processInstanceId,
        closable: true,
        onSuccess: () => {
          if (activeKey === 'underApproval') {
            underApprovalDs.query();
          } else {
            allDs.query();
          }
        },
      });
    }
  };

  /**
   * 撤销审批
   * @param {object} record 行数据
   */
  const handleRevoke = async (record) => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get(`spcm.common.view.message.note.revokeApprove`)
        .d('您确定要撤销审批吗？您可以在撤销后再次提交审批（注意：仅工作流审批发起人可执行撤销）'),
      onOk: async () => {
        const res = await revokeWorkflow({ pcHeaderId: record.get('pcHeaderId') });
        if (getResponse(res)) {
          notification.success();
          if (activeKey === 'underApproval') {
            underApprovalDs.query();
          } else {
            allDs.query();
          }
        }
      },
    });
  };

  // 处理协同按钮
  const handleCoordination = (record) => {
    const pcHeaderId = record.get('pcHeaderId');
    return queryPreTextFlag({ pcHeaderId }).then((res) => {
      if (getResponse(res)) {
        const { pcHeaderWorkbenchPreTextFlag = null, lastUpdatedBy } = res;
        // 没有权限
        if (pcHeaderWorkbenchPreTextFlag === '1') {
          // 修改人为当前操作人，允许进入详情
          if (currentUserId === lastUpdatedBy) {
            goDetail(record, 'Coordination');
            return;
          }
          Modal.confirm({
            key: Modal.key(),
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <span
                style={{ fontSize: '12px', color: '#1d2129', lineHeight: '18px', fontWeight: 400 }}
              >
                {intl
                  .get('spcm.workspace.view.message.title.noCoordinationEditPermission')
                  .d('您的协同编辑权限已被收回，即将重新刷新列表页')}
              </span>
            ),
            okCancel: false,
            onOk: () => {
              allDs.query();
            },
          });
        } else {
          goDetail(record, 'Coordination');
        }
      }
    });
  };

  const getRoutePath = (record) => {
    if (!record) {
      return pathPart;
    }
    const showAttachmentFlag = record.get('showAttachmentFlag');
    return Number(showAttachmentFlag) === 1 ? 'update' : pathPart;
  };

  // 建议操作
  const renderAction = ({ record }) => {
    const {
      pcHeaderId,
      version,
      pcStatusCode,
      revokeByBusKeyFlag,
      approvalByBusKey,
    } = record?.get([
      'pcHeaderId',
      'version',
      'pcStatusCode',
      'revokeByBusKeyFlag',
      'approvalByBusKey',
    ]);
    const createSignTaskFailedFlag = pcStatusCode === 'CREATE_SIGNING_TASK_FAILED';
    // console.log('approvalByBusKey', approvalByBusKey);
    // 是否展示协同按钮
    const coordinationFlag = record.get('coordinationFlag') || null;
    // 协同按钮
    const coordinationBtn = {
      key: 'Coordination',
      code: 'srm.pc-admin.pc-purchaser.workspace2.ps.coordination',
      button: (
        <Button
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={() => handleCoordination(record)}
        >
          {intl.get('spcm.workspace.view.button.coordination').d('协同')}
        </Button>
      ),
    };

    const rollbackSupplier = (
      <Menu>
        <Menu.Item key="purchaser" className={styles['more-option']}>
          <a onClick={() => handleRollback(pcHeaderId, 'purchaser', record)}>
            {intl.get('spcm.common.button.rollback.purchaser').d('退回至采购方拟制')}
          </a>
        </Menu.Item>
        <Menu.Item key="supplier" className={styles['more-option']}>
          <a onClick={() => handleRollback(pcHeaderId, 'supplier', record)}>
            {intl.get('spcm.common.button.rollback.supplier').d('退回至供应商签署')}
          </a>
        </Menu.Item>
      </Menu>
    );

    // 查看存证参数
    const newAuthType = record.get('sceneCertificateNo') ? "ESIGN" :(record?.get('electronicOrderType') || sealType || "");

    const viewCertificateData = {
      ...(record?.toData() || {}),
      authType: newAuthType,
    };

    const { action } = getOperationList(
      record.get('pcStatusCode'),
      record.get('electricSignFlag'),
      record.get('archiveFlag'),
      record
    ); // 后端返回可执行操作
    // 操作按钮
    const defaultActions = [
      !record.get('_childPcHeaderId') && {
        key: 'Copy',
        code: 'srm.pc-admin.pc-purchaser.workspace2.ps.contract-copy',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleContractCopy(pcHeaderId, record)}
          >
            {intl.get('hzero.common.title.copy').d('复制')}
          </Button>
        ),
      },
      {
        key: 'Edit',
        code: 'srm.pc-admin.pc-purchaser.workspace2.button.edit',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => goDetail(record, 'Edit')}
          >
            {intl.get(`hzero.common.button.editor`).d('编辑')}
          </Button>
        ),
      },
      {
        key: 'Delete',
        code: 'srm.pc-admin.pc-purchaser.workspace2.ps.delete.button',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => {
              Modal.confirm({
                title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
                children: intl
                  .get(`spcm.common.view.message.title.deleteContract`)
                  .d('确认要删除当前协议么？'),
                onOk: async () => {
                  const data = record.toData();
                  const res = await deleteHeader([data]);
                  if (getResponse(res)) {
                    allDs.query();
                    notification.success();
                  }
                },
              });
            }}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
        ),
      },
      (pcStatusCode !== 'TERMINATION' ||
        (pcStatusCode === 'TERMINATION' &&
          record?.get('terminateSignStatus') === 'WAIT_PURCHASER_SIGN')) && {
        key: 'Chapter',
        code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => {
              const notAllowedFlag = checkOrderSignContract(record?.toData());
              if (notAllowedFlag) {
                return;
              }
              goDetail(record, 'Chapter');
            }}
          >
            {intl.get(`spcm.contractChapter.view.button.chapter`).d('用章')}
          </Button>
        ),
      },
      (record.get('electricSignOrder') === 'PURCHASE_FIRST' ||
        !rollbackPermission ||
        createSignTaskFailedFlag) && {
        key: 'Rollback',
        code: 'srm.pc-admin.pc-purchaser.workspace2.ps.back.button',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleRollback(pcHeaderId, 'purchaser', record)}
          >
            <Tooltip
              title={intl.get('spcm.common.button.rollback.purchaser').d('退回至采购方拟制')}
            >
              {intl.get('hzero.common.button.rollback').d('退回')}
            </Tooltip>
          </Button>
        ),
      },
      record.get('electricSignOrder') === 'SUPPLIER_FIRST' &&
        !createSignTaskFailedFlag && {
          key: 'Rollback',
          code: 'srm.pc-admin.pc-purchaser.workspace2.button.back.supplier',
          button: (
            <Dropdown overlay={rollbackSupplier} trigger={['hover']}>
              <Button type="c7n-pro" funcType="link" color="primary">
                {intl.get('hzero.common.button.rollback').d('退回')}
                <Icon type="expand_more" style={{ fontSize: '0.16rem' }} />
              </Button>
            </Dropdown>
          ),
        },
      {
        key: 'Change',
        code: 'srm.pc-admin.pc-purchaser.workspace2.ps.ps.change',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={async () => {
              const notAllowedFlag = checkOrderSignContract(record?.toData());
              if (notAllowedFlag) {
                return;
              }
              let res = {};
              const pathValue = getRoutePath(record);
              const onOk = async (otherParams = {}) => {
                if (['CONFIRMED', 'EFFECTED'].includes(pcStatusCode)) {
                  const payload = {
                    ...record.toData(),
                    ...otherParams,
                    mainContractId: pcHeaderId,
                    pcHeaderId: null,
                    amount: null,
                    creationDate: null,
                    // pcNum: null,
                    createdBy: null,
                    electricSignFlag: null,
                    alterationFlag: 1,
                    // attachmentUuid: uuid(),
                  };
                  const res = await changeContract(payload);
                  if (getResponse(res)) {
                    // 无需审批，没启用，需进详情界面
                    // 工作流，功能审批无需进入详情界面
                    notification.success();
                    const { pcHeaderId: headerId } = res;
                    if (res.pcStatusCode === 'CHANGE_TO_APPROVAL') {
                      allDs.query();
                    } else {
                      localStorage.setItem('isReplenishCreate', 'true');
                      dispatch(
                        routerRedux.push({
                          pathname: `/spcm/contract-workspace/${pathValue}/${headerId}`,
                          search: stringify({ hasChanged: 'true' }),
                        })
                      );
                    }
                  }
                } else {
                  const [
                    headerInfo,
                    termDataSource,
                    pcStageDataSource,
                    pcSubjectDataSource,
                    partnerDataSource,
                    pcRebateDataSource,
                  ] = await Promise.all([
                    fetchHeader({
                      pcHeaderId,
                      customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.HEADER',
                    }),
                    fetchTerm({
                      pcHeaderId,
                      customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS',
                    }),
                    fetchStage({
                      pcHeaderId,
                      customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.STAGE',
                    }),
                    fetchSubject({
                      pcHeaderId,
                      customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.SUBJECT',
                    }),
                    fetchPartner({
                      pcHeaderId,
                      customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.PARTNER',
                    }),
                    fetchContractRebate({
                      pcHeaderId,
                      customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.CONTRACTREPLENISH',
                    }),
                  ]);
                  const payload = {
                    ...headerInfo,
                    ...otherParams,
                    pcSubjectDetailDTOList:
                      pcSubjectDataSource?.content ||
                      [].map((n) => {
                        return {
                          ...n,
                          pcHeaderId: null,
                          pcSubjectId: null,
                        };
                      }),
                    pcPartnerDetailDTOList: (partnerDataSource || []).map((n) => {
                      return {
                        ...n,
                        pcHeaderId: null,
                        partnerId: null,
                      };
                    }),
                    pcStageDetailDTOList: (pcStageDataSource?.content || []).map((n) => {
                      return {
                        ...n,
                        pcHeaderId: null,
                        pcStageId: null,
                      };
                    }),
                    pcTermDetailDTOList: termDataSource || [],
                    pcRebateInformationlist: (pcRebateDataSource?.content || []).map((n) => {
                      return {
                        ...n,
                        pcHeaderId: null,
                        rebateInformationId: null,
                      };
                    }),
                    mainContractId: pcHeaderId,
                    pcHeaderId: null,
                    amount: null,
                    creationDate: null,
                    // pcNum: null,
                    createdBy: null,
                    electricSignFlag: null,
                    alterationFlag: 1,
                    // attachmentUuid: uuid(),
                  };
                  const res = await changeContract(payload);
                  if (getResponse(res)) {
                    // 无需审批，没启用，需进详情界面
                    notification.success();
                    const { pcHeaderId: headerId } = res;
                    if (res.pcStatusCode === 'CHANGE_TO_APPROVAL') {
                      allDs.query();
                    } else {
                      localStorage.setItem('isReplenishCreate', 'true');
                      dispatch(
                        routerRedux.push({
                          pathname: `/spcm/contract-workspace/${pathValue}/${headerId}`,
                          search: stringify({ hasChanged: 'true' }),
                        })
                      );
                    }
                  }
                }

                // const res = await deleteHeader([record.toData()]);
                // if (getResponse(res)) {
                //   notification.success();
                //   allDs.query();
                // }
              };
              if (remote?.process) {
                res = await remote.process('SPCM_WORKSPACE_LIST_BEFORE_CHANGE', res, {
                  allDs,
                  record,
                  onOk,
                });
                console.log('res', res);
                if (!res) {
                  return;
                }
              }
              Modal.confirm({
                title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
                children: intl.get(`spcm.contractChange.title.sureChange`).d('确认变更'),
                onOk: () => onOk(res),
              });
            }}
          >
            {intl.get(`spcm.contractChange.view.button.change`).d('变更')}
          </Button>
        ),
      },
      {
        key: 'Terminate',
        code: 'srm.pc-admin.pc-purchaser.workspace2.ps.stop.button',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => terminateContractFunc(record)}
          >
            {intl.get(`spcm.contractChange.view.button.terminate`).d('终止')}
          </Button>
        ),
      },
      // 服务编码含“_SaaS”&协议状态=已终止&协议解约签署状态=未解约&电签标识=1
      record?.get('electricSignFlag') === 1 &&
        record?.get('authType')?.includes('_SAAS') &&
        record?.get('terminateSignStatus') === 'NOT_TERMINATED' && {
          key: 'BreakOff',
          code: 'srm.pc-admin.pc-purchaser.workspace2.button.terminate',
          button: (
            <Button
              type="c7n-pro"
              funcType="link"
              color="primary"
              onClick={() => handleBreakOffContract(record)}
            >
              {intl.get(`spcm.common.view.button.breakOffContract`).d('解约')}
            </Button>
          ),
        },
      {
        key: 'Archive',
        code: 'srm.pc-admin.pc-purchaser.workspace2.ps.archive.contract',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => archiveModel(record)}
          >
            {intl.get(`spcm.purchaseContractView.model.file`).d('归档')}
          </Button>
        ),
      },
      record.get('electricSignFlag') === 1 &&
        (
         // E签宝
        (!(record?.get('orderSignFlag') == 1 && record?.get('orderUnwillingSignFlag') === '1') && record.get('sceneCertificateNo'))
          ||
          // 非E签宝
          (!record.get('sceneCertificateNo') && !newAuthType.includes('_SAAS'))
        ) && (
          ['EFFECTED', 'TERMINATION', 'TERMINATION_CONFIRM', 'ARCHIVE', 'ARCHIVE_TO_APPROVAL', 'TERMINATION_TO_APPROVAL', 'EXPIRED', 'SUPPLEMENT_COMPLETE', 'FIRST_EDITION'].includes(pcStatusCode)
        ) && {
          key: 'Voucher',
          code: 'srm.pc-admin.pc-purchaser.workspace2.button.evidence',
          button: (
            <ModalBtn
              record={viewCertificateData}
              onClickESIGN={() => handleJumpViewCertificateDeposit(record)}
            >
              <Button type="c7n-pro" funcType="link" color="primary">
                {intl.get('spcm.common.view.title.viewCertificate').d('查看存证')}
              </Button>
            </ModalBtn>
          ),
        },
      {
        key: 'ComfirmEffect',
        code: 'srm.pc-admin.pc-purchaser.workspace2.button.comfirm.effect',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleComfirmEffect(record)}
          >
            {intl.get(`spcm.contractChange.view.button.comfirmEffect`).d('确认生效')}
          </Button>
        ),
      },
      {
        key: 'ComfirmCancel',
        code: 'srm.pc-admin.pc-purchaser.workspace2.button.comfirm.cancel',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleComfirmCancel(record)}
          >
            {intl.get(`spcm.contractChange.view.button.comfirmCancel`).d('修改')}
          </Button>
        ),
      },
      {
        key: 'Invalid',
        code: 'srm.pc-admin.pc-purchaser.workspace2.ps.invalid.button',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleInvalid(record)}
          >
            {intl.get(`spcm.contractChange.view.button.invalid`).d('作废')}
          </Button>
        ),
      },
      approvalByBusKey && {
        key: 'Approve',
        code: 'srm.pc-admin.pc-purchaser.workspace2.button.approve',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleApprove(record)}
          >
            {intl.get(`spcm.common.view.button.approve`).d('审批')}
          </Button>
        ),
      },
      revokeByBusKeyFlag && {
        key: 'Revoke',
        code: 'srm.pc-admin.pc-purchaser.workspace2.button.revoke-approve',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleRevoke(record)}
          >
            {intl.get(`spcm.common.view.button.revokeApprove`).d('撤销审批')}
          </Button>
        ),
      },
      {
        key: 'HistoricalVersion',
        code: 'srm.pc-admin.pc-purchaser.workspace2.button.version',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            // disabled={!record.get('sceneCertificateNo')}
            onClick={() => openHistoricalVersion(record)}
          >
            {intl.get('spcm.common.view.title.versionView').d('版本查看')}
          </Button>
        ),
      },
      {
        key: 'InvalidSignedTask',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleInvalidSignedTask(pcHeaderId)}
          >
            {intl.get('spcm.common.view.button.invalidSignedTask').d('作废签署任务')}
          </Button>
        ),
      },
      // {
      //   key: 'updateSignedNode',
      //   button: (
      //     <Button
      //       type="c7n-pro"
      //       funcType="link"
      //       color="primary"
      //       onClick={() => {}}
      //     >
      //       {intl.get('spcm.common.view.button.updateSignedNode').d('修改签署节点')}
      //     </Button>
      //   ),
      // },
    ].filter(Boolean);
    // 过滤鉴权结果为隐藏的操作
    const rmoteActions = remote
      ? remote.process('SPCM_WORKSPACE_LIST_PROCESS_COLUMNS_ACTIONS', defaultActions, {
          pcHeaderId,
          allDs,
        })
      : defaultActions;
    const actions = rmoteActions.filter((i) => {
      const currenPer = permissions.find((n) => n.code === i.code);
      return currenPer ? currenPer.approve : true;
    });
    // const actions = defaultActions;
    const getOverlay = (items = []) => {
      return isEmpty(items) ? (
        false
      ) : (
        <Menu>
          {items.map((i) => (
            <Item className={styles['more-option']} key={i.key}>
              {i.button}
            </Item>
          ))}
        </Menu>
      );
    };

    // 已失效且invalidAllowChangeFlag=1允许变更
    const isExpiredChange = pcStatusCode === 'EXPIRED' && !!record.get('invalidAllowChangeFlag');
    // 剩余能执行操作 (最多展示三个按钮，超过放入更多操作)
    let canActions =
      actions.filter((i) => {
        return (
          action.includes(i.key) ||
          (i.key === 'Change' && isExpiredChange) ||
          (i.key === 'HistoricalVersion' &&
            !record.get('supplementFlag') &&
            (version > 1 || record.get('isExistsSupplementFlag') === '1'))
        );
      }) || [];
    if (remote) {
      canActions = remote.process('SPCM_WORKSPACE_LIST_RENDER_ACTION', canActions, {
        actions,
        record,
        activeKey,
        props,
        loading,
      });
    }
    // 更多操作
    const moreActionArr = canActions.filter((i, index) => ![0, 1].includes(index));
    const overlay = () => getOverlay(moreActionArr);
    const moreAction =
      moreActionArr.length > 1 && overlay ? (
        <Dropdown overlay={overlay} trigger={['hover']}>
          <Button type="c7n-pro" funcType="link" color="primary" className={styles['more-action']}>
            {intl.get('spcm.workspace.view.option.moreAction').d('更多')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      ) : (
        moreActionArr[0]?.button
      );
    // 协同标识为1，只展示协同按钮
    const btns =
      coordinationFlag === '1'
        ? [coordinationBtn.button]
        : [canActions[0]?.button, canActions[1]?.button, moreAction];
    return isEmpty(btns.filter((i) => i)) ? null : btns;
  };

  // 跳转页面
  const goDetail = async (record, key) => {
    // 这里只能单个get取值，不能get([''])，原因是历史记录弹窗中的跳转详情，也会走到这个方法。
    const pcHeaderId = record.get('pcHeaderId');
    const showAttachmentFlag = record.get('showAttachmentFlag');
    const showOnlyDocMode = Number(showAttachmentFlag) === 1;
    // const pathname = `/spcm/contract-workspace/detail/${pcHeaderId}`;
    let pathname = '';
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxGoDetail', {
        key,
        record,
        pathname,
        activeKey,
        history,
      });
      if (!res) {
        return;
      }
    }
    if (key === 'Edit') {
      const pathValue = getRoutePath(record);
      pathname = `/spcm/contract-workspace/${pathValue}/${pcHeaderId}`;
      // 判断跳转去审查详情还是单据详情 todo
      const pathObj = await getEditGotoDatailPath({ oldPathname: pathname, record, pathValue });
      const { path, search = '' } = pathObj || {};
      pathname = path;
      history.push({ pathname, search });
      return '';
    }
    // 协同
    if (key === 'Coordination') {
      pathname = `/spcm/contract-workspace/coordinate/${pcHeaderId}`;
      history.push({ pathname });
      return '';
    }
    if (key === 'Approval') {
      pathname = `/spcm/contract-workspace/approval/${pcHeaderId}`;
      history.push({ pathname });
      return '';
    }
    if (key === 'Chapter') {
      const companyId = record.get('companyId');
      pathname = `/spcm/contract-workspace/chapter/${pcHeaderId}`;
      history.push({ pathname, search: stringify({ pcHeaderId, companyId }) });
      return '';
    }
    pathname = `/spcm/contract-workspace/view/${pcHeaderId}`;
    if (enableSmartContract && !showOnlyDocMode) {
      pathname = `/spcm/contract-workspace/intelligentView/${pcHeaderId}`;
    }
    history.push({ pathname });
  };

  // 获取点击编辑进入详情路径
  const getEditGotoDatailPath = async (params = {}) => {
    const { oldPathname, record, pathValue } = params || {};
    if (isEmpty(record)) {
      return { path: oldPathname };
    }
    const { pcHeaderId, checkDuplicationFlag } =
      record.get(['pcHeaderId', 'checkDuplicationFlag']) || {};
    // 跳转审查等待页
    if (Number(checkDuplicationFlag) === 1) {
      const path = `/spcm/contract-workspace/review-wait/${pcHeaderId}`;
      const search = stringify({ pathParam: pathValue });
      return { path, search };
    } else {
      const { smartFetchFlag, smartTaskId } = (await queryLatestTask({ pcHeaderId })) || {};
      if (Number(smartFetchFlag) === 1 && smartTaskId) {
        const path = `/spcm/contract-workspace/extract-wait/${pcHeaderId}`;
        const search = stringify({ pathParam: pathValue, smartTaskId });
        return { path, search };
      }
    }
    return { path: oldPathname };
  };

  const notExitColumn = {
    name: 'noExit',
    width: 50,
    renderer: ({ record }) => {
      const getIMRequestBody = () => ({
        ...record.data,
      });
      return (
        <IMChatDraggable
          cardCode="CONTRACT_WORKSPACE_DETAIL"
          icon="baseline-drag_indicator"
          tooltip=""
          showDetail
          requestBody={getIMRequestBody}
          dragText={`协议${record.get('pcNum')}`}
        />
      );
    },
  };

  // 重新生成订单
  const handleRegenerateOrder = debounce(async (record) => {
    loading('handleLoading', true);
    const res = await autoChangePo(record.toData());
    if (getResponse(res)) {
      notification.success();
      // 重新刷新完数据后才关闭loading,避免乐观锁
      allDs.query().then(() => {
        loading('handleLoading', false);
      });
    } else {
      loading('handleLoading', false);
    }
  }, 200);

  const transferOrderStatusColumn = [
    {
      name: 'autoTransferOrderFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'transferOrderStatus',
      width: 120,
      renderer: ({ value, record }) => {
        if (!value) return '-';
        const transferOrderStatus = renderTransferOrderStatus(
          value,
          record.get('transferOrderStatusMeaning')
        );
        if (value === 'TRANSFER_FAIL') {
          return <Tooltip title={record.get('transferOrderReason')}>{transferOrderStatus}</Tooltip>;
        } else {
          return transferOrderStatus;
        }
      },
    },
    {
      name: 'regenerateOrder',
      width: 120,
      renderer: ({ record }) => {
        if (record.get('transferOrderStatus') !== 'TRANSFER_FAIL') return '-';
        // 转单失败
        return (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => handleRegenerateOrder(record)}
          >
            {intl.get(`spcm.common.model.common.regenerateOrder`).d('重新生成订单')}
          </Button>
        );
      },
    },
  ];

  // 创建签署任务
  const handleCreateSignTask = (record) => {
    if (!record) {
      return;
    }
    loading('handleLoading', true);
    const pcHeaderId = record.get('pcHeaderId');
    return createSignTask([pcHeaderId])
      .then(async (res) => {
        if (getResponse(res)) {
          notification.success();
          await allDs.query();
        }
      })
      .finally(() => loading('handleLoading', false));
  };

  const getColumns = (key) => {
    switch (key) {
      case 'underApproval': {
        const list = [
          {
            name: 'pcStatusCode',
            width: 150,
            renderer: ({ value, record }) => (
              <StatusTag text={record.get('pcStatusCodeMeaning')} value={value} />
            ),
          },
          {
            name: 'action',
            width: 160,
            renderer: renderAction,
            className: styles['action-columns'],
          },
          {
            title: intl.get('spcm.common.model.common.approvalProgress').d('审批进度'),
            width: 200,
            name: 'approvalProgress',
            renderer: ({ record }) => {
              const data = record.get('approvalProcessByBusKey');
              return data ? <ApproveRecordSimple data={data} /> : '-';
            },
          },
          {
            name: 'pcNum',
            width: 180,
            renderer: ({ value, record }) => {
              return <a onClick={() => goDetail(record, 'Approval')}>{`${value}`}</a>;
            },
          },
          {
            name: 'pcName',
            width: 200,
          },
          {
            name: 'supplierCompanyName',
            width: 200,
            renderer: ({ record }) =>
              record.get('supplierCompanyName') || record.get('supplierName'),
          },
          {
            name: 'companyName',
            width: 200,
          },
          {
            name: 'pcKindCode',
            width: 120,
            renderer: ({ record }) => record.get('pcKindCodeMeaning'),
          },
          {
            name: 'pcTypeId',
            width: 140,
            renderer: ({ record }) => record.get('pcTypeName'),
          },
          {
            name: 'pcTemplateId',
            width: 140,
            renderer: ({ record }) => record.get('templateName'),
          },
          {
            name: 'startDateActive',
            width: 140,
            renderer: ({ record }) => dateRender(record.get('startDateActive')),
          },
          {
            name: 'endDateActive',
            width: 140,
            renderer: ({ record }) => dateRender(record.get('endDateActive')),
          },
          {
            name: 'originalTaxIncludeAmount',
            width: 140,
            align: 'right',
          },
          {
            name: 'originalAmount',
            width: 140,
          },
          {
            name: 'supplierCurrencyCode',
            width: 140,
          },
          {
            name: 'purchaseCurrencyCode',
            width: 140,
          },
          {
            name: 'purchaseOrgId',
            width: 140,
            renderer: ({ record }) => record.get('purchaseOrgName'),
          },
          {
            name: 'ouId',
            width: 140,
            renderer: ({ record }) => record.get('ouName'),
          },
          {
            name: 'purchaseAgentId',
            width: 140,
            renderer: ({ record }) => record.get('purchaseAgentName'),
          },
          {
            name: 'createdBy',
            width: 140,
            renderer: ({ record }) => record.get('createByRealName'),
          },
          {
            label: intl.get(`hzero.common.date.creation`).d('创建时间'),
            name: 'creationDate',
            width: 100,
            renderer: ({ record }) => dateTimeRender(record.get('creationDate')),
          },
          {
            name: 'signDate',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('signDate')),
          },
          {
            name: 'releaseDate',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('releaseDate')),
          },
          {
            name: 'pcSourceCode',
            width: 120,
            renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
          },
          {
            name: 'signatureTypeMeaning',
            width: 120,
            renderer: ({ record }) => {
              const signatureTypeMeaning = record.get('signatureTypeMeaning');
              if (record.get('electricSignFlag') === 1 && record.get('authType') === 'ESIGN') {
                if (
                  ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(record.get('pcKindCode')) &&
                  record.get('signatureType') === 'TEXT_SIGNATURE'
                ) {
                  return '';
                }
                return signatureTypeMeaning;
              }
            },
          },
          {
            name: 'electricSignFlag',
            width: 120,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'archiveFlag',
            width: 120,
            renderer: ({ record }) =>
              renderArchiveFlag(record.get('archiveFlag'), record.get('archiveFlagMeaning')),
          },
          {
            name: 'archiveDate',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('archiveDate')),
          },
        ];
        return remote
          ? remote.process('SPCM_WORKSPACE_LIST_COLUMNS_UNDERAPPROVAL', list, {})
          : list;
      }
      case 'toBeSigned': {
        const list = [
          {
            name: 'pcStatusCode',
            width: 150,
            renderer: ({ value, record }) => (
              <StatusTag text={record.get('pcStatusCodeMeaning')} value={value} />
            ),
          },
          {
            name: 'pcNum',
            width: 180,
            renderer: ({ value, record }) => {
              return <a onClick={() => goDetail(record, 'Chapter')}>{`${value}`}</a>;
            },
          },
          {
            name: 'pcName',
            width: 200,
          },
          {
            name: 'supplierCompanyName',
            width: 200,
            renderer: ({ record }) =>
              record.get('supplierCompanyName') || record.get('supplierName'),
          },
          {
            name: 'companyName',
            width: 200,
          },
          {
            name: 'pcKindCode',
            width: 120,
            renderer: ({ record }) => record.get('pcKindCodeMeaning'),
          },
          {
            name: 'pcTypeId',
            width: 140,
            renderer: ({ record }) => record.get('pcTypeName'),
          },
          {
            name: 'pcTemplateId',
            width: 140,
            renderer: ({ record }) => record.get('templateName'),
          },
          {
            name: 'startDateActive',
            width: 140,
            renderer: ({ record }) => dateRender(record.get('startDateActive')),
          },
          {
            name: 'endDateActive',
            width: 140,
            renderer: ({ record }) => dateRender(record.get('endDateActive')),
          },
          {
            name: 'purchaseOrgId',
            width: 140,
            renderer: ({ record }) => record.get('purchaseOrgName'),
          },
          {
            name: 'ouId',
            width: 140,
            renderer: ({ record }) => record.get('ouName'),
          },
          {
            name: 'purchaseAgentId',
            width: 140,
            renderer: ({ record }) => record.get('purchaseAgentName'),
          },
          {
            name: 'createdBy',
            width: 140,
            renderer: ({ record }) => record.get('createByRealName'),
          },
          {
            name: 'creationDate',
            width: 140,
            renderer: ({ record }) => dateTimeRender(record.get('creationDate')),
          },
          {
            name: 'pcSourceCode',
            width: 120,
            renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
          },
          {
            name: 'originalTaxIncludeAmount',
            width: 140,
            align: 'right',
          },
          {
            name: 'originalAmount',
            width: 140,
            align: 'right',
          },
          {
            name: 'supplierCurrencyCode',
            width: 140,
          },
          {
            name: 'purchaseCurrencyCode',
            width: 140,
          },
          sealType?.includes('_SAAS') && {
            name: 'terminateSignStatus',
            width: 120,
          },
          // {
          //   name: 'signatureTypeMeaning',
          //   width: 120,
          // },
          // {
          //   name: 'electricSignFlag',
          //   width: 120,
          //   renderer: ({ value }) => yesOrNoRender(value),
          // },
          // {
          //   name: 'archiveDate',
          //   width: 120,
          //   renderer: ({ record }) => dateRender(record.get('archiveDate')),
          // },
        ];
        return remote ? remote.process('SPCM_WORKSPACE_LIST_COLUMNS_TOBESIGNED', list, {}) : list;
      }
      case 'toBeSubmited': {
        const list = [
          {
            name: 'pcStatusCode',
            width: 150,
            renderer: ({ value, record }) => (
              <StatusTag text={record.get('pcStatusCodeMeaning')} value={value} />
            ),
          },
          {
            name: 'pcNum',
            width: 180,
            renderer: ({ value, record }) => {
              return <a onClick={() => goDetail(record, 'Edit')}>{`${value}`}</a>;
            },
          },
          {
            name: 'pcName',
            width: 200,
          },
          {
            name: 'supplierCompanyName',
            width: 200,
            renderer: ({ record }) =>
              record.get('supplierCompanyName') || record.get('supplierName'),
          },
          {
            name: 'companyName',
            width: 200,
          },
          {
            name: 'pcKindCode',
            width: 120,
            renderer: ({ record }) => record.get('pcKindCodeMeaning'),
          },
          {
            name: 'pcTypeId',
            width: 140,
            renderer: ({ record }) => record.get('pcTypeName'),
          },
          {
            name: 'pcTemplateId',
            width: 140,
            renderer: ({ record }) => record.get('templateName'),
          },
          {
            name: 'startDateActive',
            width: 140,
            renderer: ({ record }) => dateRender(record.get('startDateActive')),
          },
          {
            name: 'endDateActive',
            width: 140,
            renderer: ({ record }) => dateRender(record.get('endDateActive')),
          },
          {
            name: 'originalTaxIncludeAmount',
            width: 140,
            align: 'right',
          },
          {
            name: 'originalAmount',
            width: 140,
            align: 'right',
          },
          {
            name: 'supplierCurrencyCode',
            width: 140,
          },
          {
            name: 'purchaseCurrencyCode',
            width: 140,
          },
          {
            name: 'purchaseOrgId',
            width: 140,
            renderer: ({ record }) => record.get('purchaseOrgName'),
          },
          {
            name: 'ouId',
            width: 140,
            renderer: ({ record }) => record.get('ouName'),
          },
          {
            name: 'purchaseAgentId',
            width: 140,
            renderer: ({ record }) => record.get('purchaseAgentName'),
          },
          {
            name: 'createdBy',
            width: 140,
            renderer: ({ record }) => record.get('createByRealName'),
          },
          {
            label: intl.get(`hzero.common.date.creation`).d('创建时间'),
            name: 'creationDate',
            width: 100,
            renderer: ({ record }) => dateTimeRender(record.get('creationDate')),
          },
          {
            name: 'signDate',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('signDate')),
          },
          {
            name: 'releaseDate',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('releaseDate')),
          },
          {
            name: 'pcSourceCode',
            width: 120,
            renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
          },
          {
            name: 'signatureTypeMeaning',
            width: 120,
            renderer: ({ record }) => {
              const signatureTypeMeaning = record.get('signatureTypeMeaning');
              if (record.get('electricSignFlag') === 1 && record.get('authType') === 'ESIGN') {
                if (
                  ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(record.get('pcKindCode')) &&
                  record.get('signatureType') === 'TEXT_SIGNATURE'
                ) {
                  return '';
                }
                return signatureTypeMeaning;
              }
            },
          },
          {
            name: 'electricSignFlag',
            width: 120,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'archiveDate',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('archiveDate')),
          },
        ];
        return remote ? remote.process('SPCM_WORKSPACE_LIST_COLUMNS_TOBESUBMITED', list, {}) : list;
      }
      case 'all': {
        const list = [
          {
            // 处理树状结构，字段没对齐
            headerStyle: { paddingLeft: '36px' },
            style: { paddingLeft: 0 },
            name: 'version',
            width: 100,
          },
          notExitColumn,
          {
            name: 'pcStatusCode',
            width: 150,
            renderer: ({ value, record }) => (
              <StatusTag text={record.get('pcStatusCodeMeaning')} value={value} />
            ),
          },
          {
            name: 'archiveAttachmentUuid',
            width: 130,
            renderer: ({ record }) => {
              const {
                pcStatusCode,
                archiveAttachmentUuid,
                enabledArchiveFlag,
                createdBy,
                enableWhiteSettingFlag, // 配置表《协议新功能白名单》增加一项配置【归档后不能上传文件】,0:不在白名单，1:在白名单
              } = record.toData();
              return (
                (pcStatusCode === 'ARCHIVE' || archiveAttachmentUuid) && ( // 已归档文件或者已上传过归档文件
                  <Attachment
                    record={record}
                    name="archiveAttachmentUuid"
                    viewMode="popup"
                    funcType="link"
                    readOnly={
                      enabledArchiveFlag !== 1 ||
                      createdBy !== currentUserId ||
                      enableWhiteSettingFlag !== '0'
                    }
                    onUploadSuccess={(_, attachment) => archiveUploadSuccess(record, attachment)}
                    fileReadOnly={() => pcStatusCode === 'ARCHIVE'}
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="spcm-supplier"
                  />
                )
              );
            },
          },
          {
            name: 'enableCoordination',
            width: 120,
            renderer: ({ value }) => yesOrNoRender(value === '1' ? 1 : 0),
          },
          {
            name: 'action',
            // width: 200,
            minWidth: 200,
            renderer: renderAction,
            tooltip: 'none',
            className: styles['action-columns'],
          },
          {
            title: intl.get('spcm.common.model.common.approvalProgress').d('审批进度'),
            width: 200,
            name: 'approvalProgress',
            renderer: ({ record }) => {
              const data = record.get('approvalProcessByBusKey');
              return data ? <ApproveRecordSimple data={data} /> : '-';
            },
          },
          {
            name: 'pcNum',
            width: 180,
            renderer: ({ value, record }) => {
              const coordinationFlag = record.get('coordinationFlag') || null;
              return coordinationFlag === '1' ? value : protocolType({ value, record });
            },
          },
          {
            name: 'pcName',
            width: 200,
          },
          {
            name: 'supplierCompanyName',
            width: 200,
            renderer: ({ record }) =>
              record.get('supplierCompanyName') || record.get('supplierName'),
          },
          {
            name: 'companyName',
            width: 200,
          },
          {
            name: 'pcKindCode',
            width: 120,
            renderer: ({ record }) => record.get('pcKindCodeMeaning'),
          },
          {
            name: 'pcTypeId',
            width: 140,
            renderer: ({ record }) => record.get('pcTypeName'),
          },
          {
            name: 'pcTemplateId',
            width: 140,
            renderer: ({ record }) => record.get('templateName'),
          },
          {
            name: 'startDateActive',
            width: 140,
            renderer: ({ record }) => dateRender(record.get('startDateActive')),
          },
          {
            name: 'endDateActive',
            width: 140,
            renderer: ({ record }) => dateRender(record.get('endDateActive')),
          },
          {
            name: 'originalTaxIncludeAmount',
            width: 140,
            align: 'right',
          },
          {
            name: 'originalAmount',
            width: 140,
            align: 'right',
          },
          {
            name: 'supplierCurrencyCode',
            width: 140,
          },
          {
            name: 'purchaseCurrencyCode',
            width: 140,
          },
          {
            name: 'purchaseOrgId',
            width: 140,
            renderer: ({ record }) => record.get('purchaseOrgName'),
          },
          {
            name: 'ouId',
            width: 140,
            renderer: ({ record }) => record.get('ouName'),
          },
          {
            name: 'purchaseAgentId',
            width: 140,
            renderer: ({ record }) => record.get('purchaseAgentName'),
          },
          {
            name: 'createdBy',
            width: 140,
            renderer: ({ record }) => record.get('createByRealName'),
          },
          {
            name: 'creationDate',
            width: 140,
            renderer: ({ record }) => dateTimeRender(record.get('creationDate')),
          },
          {
            name: 'signDate',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('signDate')),
          },
          {
            name: 'releaseDate',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('releaseDate')),
          },
          {
            name: 'pcSourceCode',
            width: 120,
            renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
          },
          {
            name: 'signatureTypeMeaning',
            width: 120,
            renderer: ({ record }) => {
              const signatureTypeMeaning = record.get('signatureTypeMeaning');
              if (record.get('electricSignFlag') === 1 && record.get('authType') === 'ESIGN') {
                if (
                  ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(record.get('pcKindCode')) &&
                  record.get('signatureType') === 'TEXT_SIGNATURE'
                ) {
                  return '';
                }
                return signatureTypeMeaning;
              }
            },
          },
          {
            name: 'electricSignFlag',
            width: 120,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'archiveDate',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('archiveDate')),
          },
          {
            name: 'archiveFlag',
            width: 120,
            renderer: ({ record }) =>
              renderArchiveFlag(record.get('archiveFlag'), record.get('archiveFlagMeaning')),
          },
          sealType?.includes('_SAAS') && {
            name: 'terminateSignStatus',
            width: 120,
          },
          sealType?.includes('_SAAS') && {
            name: 'terminateSignFileUuid',
            width: 150,
            renderer: ({ record }) => (
              <Attachment
                name="terminateSignFileUuid"
                record={record}
                viewMode="popup"
                readOnly
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="purchase-contract"
              />
            ),
          },
          {
            name: 'contractStageAndAccept',
            hidden: ![1, '1'].includes(relationDoc?.displayDoc),
            width: 120,
            renderer: ({ record }) => (
              <Srm77750Modal record={record.toData()}>
                {intl.get('spcm.common.model.common.checkTheImplementationView').d('查看')}
              </Srm77750Modal>
            ),
          },
          {
            name: 'interRecords',
            width: 120,
            renderer: ({ record }) => {
              const data = record.toJSONData();
              const interRecords = data?.interRecords;
              if (Array.isArray(interRecords) && interRecords.length > 0) {
                const isSomeFailed = interRecords.some((i) => i.importStatus === '0');
                return (
                  <Tag
                    color={isSomeFailed ? 'red' : 'green'}
                    onClick={() => showExectModal({ data, remote })}
                    style={{ border: 'none' }}
                  >
                    {isSomeFailed
                      ? intl.get(`spcm.workspace.model.pushsap.status.fail`).d('同步失败')
                      : intl.get(`spcm.workspace.model.pushsap.status.success`).d('同步成功')}
                    <Icon className={styles['inter-wysiwyg']} type="wysiwyg" />
                  </Tag>
                );
              }
            },
          },
          {
            name: 'occupancyRecords',
            width: 120,
            // 预算类型,1代表行生成预算，2代表头生成预算，0代表没有生成
            renderer: ({ record }) =>
              record?.get('budgetType') === '2' && (
                <BudgetModal documentType="PC" docLineId={record.get('pcHeaderId')} />
              ),
          },
          ...transferOrderStatusColumn,
          {
            name: 'restartCreateSignTask',
            width: 140,
            renderer: ({ record }) => {
              const { pcStatusCode, createSigningTaskFailedReason } =
                record?.get(['pcStatusCode', 'createSigningTaskFailedReason']) || {};
              if (pcStatusCode !== 'CREATE_SIGNING_TASK_FAILED') return '-';
              return (
                <Button
                  type="c7n-pro"
                  funcType="link"
                  color="primary"
                  onClick={() => handleCreateSignTask(record)}
                >
                  {intl.get('spcm.common.model.createSignTask').d('创建签署任务')}
                  <Tooltip title={createSigningTaskFailedReason || ''}>
                    <Icon type="help" className={styles['btn-help']} />
                  </Tooltip>
                </Button>
              );
            },
          },
          {
            name: 'occupyRecords',
            width: 120,
            renderer: ({ record }) =>
              record.get('amountControlDimension') === 'HEAD' && !record.get('supplementFlag') ? (
                <OccupyModal record={record} />
              ) : (
                '-'
              ),
          },
        ];
        return remote
          ? remote.process('SPCM_WORKSPACE_LIST_COLUMNSALL', list, { ...props, loading })
          : list;
      }
      case 'detailAll':
        return [
          {
            label: intl.get(`${modelPrompt}.pcStatusCode`).d('状态'),
            name: 'pcStatusCode',
            width: 150,
            renderer: ({ value, record }) => (
              <StatusTag text={record.get('pcStatusCodeMeaning')} value={value} />
            ),
          },
          {
            label: intl.get(`${commonPrompt}.purchaseAgreementNum`).d('采购协议编号'),
            name: 'pcNum',
            width: 160,
            renderer: ({ value, record }) => {
              return <a onClick={() => goDetail(record, 'all')}>{`${value}`}</a>;
            },
          },
          {
            label: intl.get(`${commonPrompt}.purchaseAgreementName`).d('采购协议名称'),
            name: 'pcName',
            width: 200,
            renderer: ({ record }) => (
              <Tooltip title={record.get('pcName')}>{record.get('pcName')}</Tooltip>
            ),
          },
          {
            label: intl.get(`spcm.workspace.supplierCompanyName`).d('供应商'),
            name: 'supplierCompanyName',
            width: 165,
            renderer: ({ record }) =>
              record.get('supplierCompanyName') || record.get('supplierName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.unitPriceBatch`).d('每'),
            name: 'unitPriceBatch',
            width: 40,
          },
          {
            label: intl.get(`${commonPrompt}.pcKindCode`).d('协议性质'),
            name: 'pcKindCode',
            width: 100,
            renderer: ({ record }) => record.get('pcKindCodeMeaning'),
          },
          {
            label: intl.get(`${commonPrompt}.pcType`).d('协议类型'),
            name: 'pcTypeId',
            width: 120,
            renderer: ({ record }) => record.get('pcTypeName'),
          },
          {
            name: 'companyName',
            width: 150,
          },
          {
            label: intl.get(`entity.supplier.code`).d('供应商编码'),
            name: 'supplierCompanyNum',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
            name: 'ouId',
            width: 150,
            renderer: ({ record }) => record.get('ouName'),
          },
          {
            label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
            name: 'purchaseOrgId',
            width: 150,
            renderer: ({ record }) => record.get('purchaseOrgName'),
          },
          {
            label: intl.get('spcm.common.model.common.agentName').d('采购员'),
            name: 'purchaseAgentId',
            width: 100,
            renderer: ({ record }) => record.get('purchaseAgentName'),
          },
          {
            label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
            name: 'itemCode',
            width: 180,
          },
          {
            label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
            name: 'itemName',
            width: 130,
          },
          {
            label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
            name: 'categoryId',
            width: 120,
            renderer: ({ record }) => record.get('categoryName'),
          },
          {
            label: intl.get(`spcm.common.model.specifications`).d('规格'),
            name: 'specifications',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.model`).d('型号'),
            name: 'model',
            width: 120,
          },
          {
            label: intl.get(`${commonPrompt}.unit`).d('单位'),
            name: 'uomName',
            width: 140,
            renderer: ({ record }) => record.get('uomCodeAndName') || record.get('uomName'),
          },
          {
            label: intl.get(`${commonPrompt}.quantity`).d('数量'),
            name: 'quantity',
            align: 'right',
            width: 120,
            renderer: ({ value }) => renderThousandthNum(value),
          },
          doubleUnitEnabled && {
            name: 'secondaryUomId',
            width: 140,
            renderer: ({ record }) =>
              record.get('secondaryUomCodeAndName') || record.get('secondaryUomName'),
          },
          doubleUnitEnabled && {
            name: 'secondaryQuantity',
            align: 'right',
            width: 120,
            renderer: ({ value }) => renderThousandthNum(value),
          },
          // {
          //   label: intl.get(`${commonPrompt}.executedQuantity`).d('已执行数量'),
          //   name: 'executedQuantity',
          //   width: 120,
          //   renderer: ({ value }) => renderThousandthNum(value),
          // },
          // {
          //   label: intl.get(`${commonPrompt}.toExecuteQuantity`).d('待执行数量'),
          //   name: 'toExecuteQuantity',
          //   width: 120,
          //   renderer: ({ value }) => renderThousandthNum(value),
          // },
          {
            label: intl.get(`spcm.common.currencyCode`).d('原币币种'),
            name: 'currencyCode',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
            name: 'purchaseCurrencyCode',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
            name: 'exchangeRate',
            width: 160,
            renderer: ({ value }) => (value ? `${value}:1` : ''),
          },
          {
            label: intl.get(`spcm.common.model.unitPrice`).d('原币不含税单价'),
            width: 140,
            name: 'unitPrice',
            align: 'right',
            renderer: ({ value }) => renderThousandthNum(value),
          },
          doubleUnitEnabled && {
            width: 140,
            name: 'secondaryUnitPrice',
            align: 'right',
            renderer: ({ value }) => renderThousandthNum(value),
          },
          {
            label: intl.get(`spcm.common.model.lineAmount`).d('原币不含税行金额'),
            width: 140,
            name: 'lineAmount',
            align: 'right',
            renderer: ({ value }) => renderThousandthNum(value),
          },
          {
            label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币含税单价'),
            width: 140,
            name: 'taxIncludedUnitPrice',
            align: 'right',
            renderer: ({ value }) => renderThousandthNum(value),
          },
          doubleUnitEnabled && {
            width: 140,
            name: 'taxIncludedSecondaryUnitPrice',
            align: 'right',
            renderer: ({ value }) => renderThousandthNum(value),
          },
          {
            label: intl.get(`spcm.common.model.taxIncludedLineAmount`).d('原币含税行金额'),
            width: 120,
            name: 'taxIncludedLineAmount',
            align: 'right',
            renderer: ({ value }) => renderThousandthNum(value),
          },
          // {
          //   label: intl.get(`${commonPrompt}.executedAmount`).d('已执行金额'),
          //   name: 'executedAmount',
          //   width: 120,
          //   renderer: ({ value }) => renderThousandthNum(value),
          // },
          // {
          //   label: intl.get(`${commonPrompt}.toExecuteAmount`).d('待执行金额'),
          //   name: 'toExecuteAmount',
          //   width: 120,
          //   renderer: ({ value }) => renderThousandthNum(value),
          // },
          // {
          //   label: intl.get('spcm.common.model.common.subjectAcceptStatus').d('标的验收状态'),
          //   name: 'subjectAcceptStatus',
          //   width: 150,
          //   renderer: ({ record }) => record.get('subAcceptStatusMeaning'),
          // },
          {
            label: intl.get(`${commonPrompt}.taxType`).d('税种'),
            name: 'taxId',
            width: 120,
            renderer: ({ record }) => record.get('taxCode'),
          },
          {
            label: intl.get(`sodr.common.model.common.taxRate`).d('税率'),
            name: 'taxRate',
            width: 120,
            align: 'right',
          },
          // {
          //   label: intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议'),
          //   name: 'globalFlag',
          //   width: 150,
          //   render: yesOrNoRender,
          // },
          {
            label: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
            name: 'pcSourceCode',
            width: 100,
            renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
          },
          {
            label: intl.get('spcm.workspace.sourceCode-sourceLineNum').d('来源单据编号-行号'),
            name: 'sourceCode',
            width: 120,
            renderer: ({ record }) => {
              const { sourceCode, sourceLineNum, sourceDisplayLineNum, pcSourceCode } =
                record.get([
                  'sourceCode',
                  'sourceLineNum',
                  'sourceDisplayLineNum',
                  'pcSourceCode',
                ]) || {};
              const newSourceLineNum =
                pcSourceCode === 'PURCHASE_NEED' ? sourceDisplayLineNum : sourceLineNum;
              if (!sourceCode && !newSourceLineNum) {
                return null;
              }
              return `${sourceCode || ''}-${newSourceLineNum || ''}`;
            },
          },
          // {
          //   label: intl.get(`${commonPrompt}.sourceLineNum`).d('来源单据行号'),
          //   name: 'sourceLineNum',
          //   width: 120,
          // },
          {
            label: intl.get(`${commonPrompt}.pcTemplateId`).d('协议模板'),
            name: 'pcTemplateId',
            width: 120,
            renderer: ({ record }) => record.get('templateName'),
          },
          {
            label: intl.get(`entity.roles.creator`).d('创建人'),
            name: 'createdBy',
            width: 140,
            renderer: ({ record }) => record.get('createByRealName'),
          },
          {
            label: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
            name: 'signDate',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('signDate')),
          },
          {
            title: intl.get('spcm.common.model.startDateActive').d('协议起始日期'),
            name: 'startDateActive',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('startDateActive')),
          },
          {
            title: intl.get('spcm.common.model.endDateActive').d('协议终止日期'),
            name: 'endDateActive',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('endDateActive')),
          },
          {
            label: intl.get(`hzero.common.date.creation`).d('创建时间'),
            name: 'creationDate',
            width: 100,
            renderer: ({ record }) => dateTimeRender(record.get('creationDate')),
          },
          {
            label: intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码'),
            name: 'mainContractId',
            width: 100,
            renderer: ({ record }) => record.get('mainPcNum'),
          },
          {
            label: intl.get(`spcm.common.model.priceSyncStatus`).d('价格库同步状态'),
            name: 'priceSyncStatus',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.priceSyncMessage`).d('价格库同步失败原因'),
            name: 'priceSyncMessage',
            width: 200,
          },
          // {
          //   label: intl.get(`spcm.common.archiveCode`).d('归档码'),
          //   name: 'archiveCode',
          //   width: 100,
          // },
          // {
          //   label: intl.get(`spcm.common.releaseDate`).d('发布时间'),
          //   name: 'releaseDate',
          //   width: 100,
          // },
          {
            label: intl.get(`spcm.common.documentFlow`).d('单据流'),
            name: 'documentFlow',
            width: 100,
            hidden: ![1, '1'].includes(relationDoc?.displayDocFlow),
            renderer: ({ record }) => {
              return (
                <DocFlow
                  tableName="spcm_pc_subject"
                  tablePk={record.get('pcSubjectId')}
                  buttonType="button"
                />
              );
            },
          },
          {
            name: 'occupancyRecords',
            width: 120,
            // 预算类型,1代表行生成预算，2代表头生成预算，0代表没有生成
            renderer: ({ record }) =>
              ['1', '2'].includes(record?.get('budgetType')) && (
                <BudgetModal
                  documentType="PC"
                  docLineId={
                    record?.get('budgetType') === '1'
                      ? record?.get('pcSubjectId')
                      : record?.get('pcHeaderId')
                  }
                />
              ),
          },
          {
            name: 'occupyRecords',
            width: 120,
            renderer: ({ record }) =>
              record.get('amountControlDimension') === 'LINE' ? (
                <OccupyModal record={record} />
              ) : (
                '-'
              ),
          },
        ];
      default:
        return [];
    }
  };
  const rightColumns = (key) => {
    switch (key) {
      case 'all': {
        const list = [
          {
            headerStyle: { paddingLeft: '36px' },
            style: { paddingLeft: 0 },
            name: 'version',
            width: 100,
          },
          notExitColumn,
          {
            name: 'pcStatusCode',
            width: 150,
            sort: 10,
            renderer: ({ value, record }) => (
              <StatusTag text={record.get('pcStatusCodeMeaning')} value={value} />
            ),
          },
          {
            name: 'enableCoordination',
            width: 120,
            renderer: ({ value }) => yesOrNoRender(value === '1' ? 1 : 0),
          },
          {
            name: 'action',
            minWidth: 200,
            align: 'left',
            sort: 20,
            renderer: renderAction,
            tooltip: 'none',
            className: classNames(styles['aggregation-action-columns']),
          },
          {
            key: 'numInfo',
            width: 200,
            aggregation: true,
            align: 'left',
            sort: 30,
            header: intl.get('spcm.workspace.model.common.numInfo').d('协议信息'),
            children: [
              {
                name: 'pcNum',
                renderer: ({ value, record }) => {
                  const coordinationFlag = record.get('coordinationFlag') || null;
                  return coordinationFlag === '1' ? (
                    value
                  ) : (
                    <a onClick={() => goDetail(record, 'all')}>{`${value}`}</a>
                  );
                },
              },
              {
                name: 'pcName',
              },
              {
                name: 'supplierCompanyName',
                renderer: ({ record }) =>
                  record.get('supplierCompanyName') || record.get('supplierName'),
              },
              {
                name: 'pcTypeId',
                renderer: ({ record }) => record.get('pcTypeName'),
              },
            ],
          },
          {
            key: 'contractStageAndAccept',
            width: 100,
            hidden: ![1, '1'].includes(relationDoc?.displayDoc),
            sort: 40,
            align: 'left',
            header: intl.get('spcm.common.model.common.checkTheImplementation').d('查看执行情况'),
            renderer: ({ record }) => (
              <Srm77750Modal record={record.toData()}>
                {intl.get('spcm.common.model.common.checkTheImplementationView').d('查看')}
              </Srm77750Modal>
            ),
          },
          {
            key: 'organizInfo',
            width: 200,
            align: 'left',
            sort: 50,
            aggregation: true,
            aggregationLimit: 4,
            header: intl.get('spcm.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'purchaseOrgId',
                width: 150,
                renderer: ({ record }) => record.get('purOrganizationName'),
              },
              {
                name: 'companyName',
                width: 150,
              },
              {
                name: 'ouId',
                width: 150,
                renderer: ({ record }) => record.get('ouName'),
              },
            ],
          },
          {
            key: 'amountInfo',
            minWidth: 200,
            align: 'left',
            sort: 60,
            aggregation: true,
            aggregationLimit: 4,
            header: intl.get('spcm.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'originalTaxIncludeAmount',
                width: 150,
              },
              {
                name: 'originalAmount',
                width: 150,
              },
              {
                name: 'supplierCurrencyCode',
                width: 150,
              },
              {
                name: 'purchaseCurrencyCode',
                width: 140,
              },
            ],
          },
          {
            key: 'sourceInfo',
            width: 200,
            align: 'left',
            header: intl.get('spcm.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            sort: 70,
            aggregationLimit: 4,
            children: [
              {
                name: 'pcSourceCode',
                width: 150,
                renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
              },
            ],
          },
          {
            key: 'timeInfo',
            width: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 80,
            header: intl.get('spcm.workspace.model.common.timeInfo').d('时间信息'),
            children: [
              {
                name: 'creationDate',
                width: 150,
                renderer: ({ record }) => dateTimeRender(record.get('creationDate')),
              },
              {
                name: 'signDate',
                width: 150,
              },
              {
                name: 'endDateActive',
                width: 150,
                renderer: ({ record }) => dateRender(record.get('endDateActive')),
              },
              {
                name: 'startDateActive',
                width: 140,
                renderer: ({ record }) => dateRender(record.get('startDateActive')),
              },
            ],
          },
          {
            name: 'interRecords',
            width: 120,
            renderer: ({ record }) => {
              const data = record.toJSONData();
              const interRecords = data?.interRecords;
              if (Array.isArray(interRecords) && interRecords.length > 0) {
                const isSomeFailed = interRecords.some((i) => i.importStatus === '0');
                return (
                  <Tag
                    color={isSomeFailed ? 'red' : 'green'}
                    onClick={() => showExectModal({ data, remote })}
                    style={{ border: 'none' }}
                  >
                    {isSomeFailed
                      ? intl.get(`spcm.workspace.model.pushsap.status.fail`).d('同步失败')
                      : intl.get(`spcm.workspace.model.pushsap.status.success`).d('同步成功')}
                    <Icon className={styles['inter-wysiwyg']} type="wysiwyg" />
                  </Tag>
                );
              }
            },
          },
          ...transferOrderStatusColumn,
          {
            name: 'restartCreateSignTask',
            width: 140,
            renderer: ({ record }) => {
              const { pcStatusCode, createSigningTaskFailedReason } =
                record?.get(['pcStatusCode', 'createSigningTaskFailedReason']) || {};
              if (pcStatusCode !== 'CREATE_SIGNING_TASK_FAILED') return '-';
              return (
                <Button
                  type="c7n-pro"
                  funcType="link"
                  color="primary"
                  onClick={() => handleCreateSignTask(record)}
                >
                  {intl.get('spcm.common.model.createSignTask').d('创建签署任务')}
                  <Tooltip title={createSigningTaskFailedReason || ''}>
                    <Icon type="help" className={styles['btn-help']} />
                  </Tooltip>
                </Button>
              );
            },
          },
          {
            name: 'occupyRecords',
            width: 120,
            renderer: ({ record }) =>
              record.get('amountControlDimension') === 'HEAD' && !record.get('supplementFlag') ? (
                <OccupyModal record={record} />
              ) : (
                '-'
              ),
          },
          {
            name: 'archiveAttachmentUuid',
            width: 130,
            renderer: ({ record }) => {
              const {
                pcStatusCode,
                enabledArchiveFlag,
                createdBy,
                enableWhiteSettingFlag, // 配置表《协议新功能白名单》增加一项配置【归档后不能上传文件】,0:不在白名单，1:在白名单
              } = record.get([
                'pcStatusCode',
                'enabledArchiveFlag',
                'createdBy',
                'enableWhiteSettingFlag',
              ]);

              return (
                pcStatusCode === 'ARCHIVE' && ( // 已归档文件或者已上传过归档文件
                  <Attachment
                    record={record}
                    name="archiveAttachmentUuid"
                    viewMode="popup"
                    funcType="link"
                    readOnly={
                      enabledArchiveFlag !== 1 ||
                      createdBy !== currentUserId ||
                      enableWhiteSettingFlag !== '0'
                    }
                    onUploadSuccess={(_, attachment) => archiveUploadSuccess(record, attachment)}
                    fileReadOnly={() => pcStatusCode === 'ARCHIVE'}
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="spcm-supplier"
                  />
                )
              );
            },
          },
        ];
        return remote
          ? remote.process('SPCM_WORKSPACE_LIST_RIGHT_COLUMNS_ALL', list, { ...props, loading })
          : list;
      }
      case 'detailAll':
        return [
          {
            name: 'pcStatusCode',
            width: 150,
            sort: 10,
            header: intl.get(`hzero.common.status`).d('状态'),
            renderer: ({ value, record }) => (
              <StatusTag text={record.get('pcStatusCodeMeaning')} value={value} />
            ),
          },
          // {
          //   name: 'action',
          //   width: 150,
          //   renderer: renderAction,
          //   className: classNames(styles['aggregation-action-columns']),
          // },
          {
            key: 'numInfo',
            width: 240,
            aggregation: true,
            aggregationLimit: 4,
            sort: 20,
            align: 'left',
            header: intl.get('spcm.workspace.model.common.numInfo').d('协议信息'),
            children: [
              {
                name: 'pcNum',
                renderer: ({ value, record }) => {
                  return <a onClick={() => goDetail(record, 'all')}>{`${value}`}</a>;
                },
              },
              {
                name: 'pcName',
              },
              {
                name: 'supplierCompanyName',
                renderer: ({ record }) =>
                  record.get('supplierCompanyName') || record.get('supplierName'),
              },
              {
                name: 'pcTypeId',
                renderer: ({ record }) => record.get('pcTypeName'),
              },
            ],
          },
          {
            key: 'organizInfo',
            width: 200,
            align: 'left',
            sort: 30,
            header: intl.get('spcm.workspace.model.common.organizInfo').d('组织信息'),
            aggregation: true,
            children: [
              {
                name: 'purchaseOrgId',
                width: 150,
                renderer: ({ record }) => record.get('purOrganizationName'),
              },
              {
                name: 'companyName',
                width: 150,
              },
              {
                name: 'ouId',
                width: 150,
                renderer: ({ record }) => record.get('ouName'),
              },
            ],
          },
          {
            key: 'materialInfo',
            width: 200,
            align: 'left',
            aggregation: true,
            sort: 40,
            aggregationLimit: 4,
            header: intl.get('spcm.workspace.model.common.materialInfo').d('物料信息'),
            children: [
              {
                name: 'itemCode',
              },
              {
                name: 'itemName',
              },
              {
                name: 'categoryId',
                renderer: ({ record }) => record.get('categoryName'),
              },
              // {
              //   name: 'quantity',
              // },
              // {
              //   name: 'uomCodeAndName',
              // },
            ],
          },
          {
            key: 'amountInfo',
            minWidth: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 50,
            header: intl.get('spcm.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'unitPrice',
              },
              {
                name: 'lineAmount',
              },

              {
                name: 'taxIncludedUnitPrice',
              },
              {
                name: 'taxIncludedLineAmount',
              },
            ],
          },
          {
            key: 'sourceInfo',
            width: 200,
            align: 'left',
            sort: 60,
            header: intl.get('spcm.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            aggregationLimit: 4,
            children: [
              {
                name: 'pcSourceCode',
                width: 150,
                renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
              },
            ],
          },
          {
            key: 'timeInfo',
            width: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 70,
            header: intl.get('spcm.workspace.model.common.timeInfo').d('时间信息'),
            children: [
              {
                name: 'creationDate',
                width: 150,
                renderer: ({ record }) => dateRender(record.get('creationDate')),
              },
              {
                name: 'signDate',
                width: 150,
              },
              {
                name: 'endDateActive',
                width: 150,
                renderer: ({ record }) => dateRender(record.get('endDateActive')),
              },
              {
                name: 'startDateActive',
                width: 140,
                renderer: ({ record }) => dateRender(record.get('startDateActive')),
              },
            ],
          },
          {
            name: 'occupyRecords',
            width: 120,
            renderer: ({ record }) =>
              record.get('amountControlDimension') === 'LINE' ? (
                <OccupyModal record={record} />
              ) : (
                '-'
              ),
          },
        ];
      default: {
        const list = [
          {
            name: 'pcStatusCode',
            width: 150,
            align: 'left',
            sort: 10,
            renderer: ({ value, record }) => (
              <StatusTag text={record.get('pcStatusCodeMeaning')} value={value} />
            ),
          },
          // {
          //   name: 'action',
          //   width: 160,
          //   align: 'left',
          //   renderer: renderAction,
          //   // className: classNames(styles['aggregation-action-columns']),
          // },
          {
            key: 'numInfo',
            width: 240,
            aggregation: true,
            align: 'left',
            sort: 30,
            header: intl.get('spcm.workspace.model.common.numInfo').d('协议信息'),
            children: [
              {
                name: 'pcNum',
                renderer: ({ value, record }) => {
                  return <a onClick={() => goDetail(record, 'all')}>{`${value}`}</a>;
                },
              },
              {
                name: 'pcName',
              },
              {
                name: 'supplierCompanyName',
                renderer: ({ record }) =>
                  record.get('supplierCompanyName') || record.get('supplierName'),
              },
              {
                name: 'pcTypeId',
                renderer: ({ record }) => record.get('pcTypeName'),
              },
            ],
          },
          // {
          //   key: 'contractStageAndAccept',
          //   width: 100,
          //   align: 'left',
          //   header: intl.get('spcm.common.model.common.checkTheImplementation').d('查看执行情况'),
          //   renderer: ({ record }) => (
          //     <Srm77750Modal record={record.toData()}>
          //       {intl.get('spcm.common.model.common.checkTheImplementationView').d('查看')}
          //     </Srm77750Modal>
          //   ),
          // },
          {
            key: 'organizInfo',
            width: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 40,
            header: intl.get('spcm.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'purchaseOrgId',
                width: 150,
                renderer: ({ record }) => record.get('purOrganizationName'),
              },
              {
                name: 'companyName',
                width: 150,
              },
              {
                name: 'ouId',
                width: 150,
                renderer: ({ record }) => record.get('ouName'),
              },
            ],
          },
          {
            key: 'amountInfo',
            minWidth: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 50,
            header: intl.get('spcm.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'originalTaxIncludeAmount',
                width: 150,
              },
              {
                name: 'originalAmount',
                width: 150,
              },
              {
                name: 'supplierCurrencyCode',
                width: 150,
              },
              {
                name: 'purchaseCurrencyCode',
                width: 140,
              },
            ],
          },
          {
            key: 'sourceInfo',
            width: 200,
            align: 'left',
            header: intl.get('spcm.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            sort: 60,
            aggregationLimit: 4,
            children: [
              {
                name: 'pcSourceCode',
                width: 150,
                renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
              },
            ],
          },
          {
            key: 'timeInfo',
            width: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 70,
            header: intl.get('spcm.workspace.model.common.timeInfo').d('时间信息'),
            children: [
              {
                name: 'creationDate',
                width: 150,
                renderer: ({ record }) => dateRender(record.get('creationDate')),
              },
              {
                name: 'signDate',
                width: 150,
              },
              {
                name: 'endDateActive',
                width: 150,
                renderer: ({ record }) => dateRender(record.get('endDateActive')),
              },
              {
                name: 'startDateActive',
                width: 140,
                renderer: ({ record }) => dateRender(record.get('startDateActive')),
              },
            ],
          },
          {
            title: intl.get('spcm.common.model.common.approvalProgress').d('审批进度'),
            width: 200,
            name: 'approvalProgress',
            hidden: key !== 'underApproval',
            renderer: ({ record }) => {
              const data = record.get('approvalProcessByBusKey');
              return data ? <ApproveRecordSimple data={data} /> : '-';
            },
          },
        ];
        return remote
          ? remote.process('SPCM_WORKSPACE_LIST_DEFAULT_RIGHT_COLUMNS', list, { tabKey: key })
          : list;
      }
    }
  };

  // 请求接口
  const onQuery = ({ filter: { unitCode }, params, dataSet }, ds) => {
    // 多单号字段转换成string
    const { multiPcNumOrTitle, ...rest } = params || {};
    const pcNumsToStr =
      multiPcNumOrTitle && isArray(multiPcNumOrTitle)
        ? multiPcNumOrTitle.toString()
        : multiPcNumOrTitle;

    const queryDsData = getSearchBarCache(unitCode)?.queryDsData || {};
    const { supplierId } = queryDsData.supplierCompanyId || {};
    const { supplierCompanyId } = params || {};
    const otherParams = supplierCompanyId ? dataSet.getState('params') : null;

    const queryDataDefault = [
      { ...rest, supplierId, supplierCompanyId, ...otherParams, multiPcNumOrTitle: pcNumsToStr },
    ];

    const queryData =
      remote?.process('SPCM_WORKSPACE_LIST_QUERY_DATA', queryDataDefault, {
        props,
        ds,
        activeKey,
      }) || queryDataDefault;

    ds.queryDataSet.loadData(queryData);
    const { state: { _back } = {} } = location;
    if (_back === -1 && isOpenClearCashed) {
      ds.query(ds.currentPage);
      setIsOpenClearCashed(false);
    } else {
      ds.query();
    }
  };

  // 对供应商特别的处理
  const onFieldChange = ({ name, value, dataSet }) => {
    if (name === 'supplierCompanyId') {
      const { supplierCompanyId, supplierId } = value || {};
      dataSet.setState({ params: { supplierId, supplierCompanyId } });
    }
  };

  /**
   * 聚合视图缓存
   */
  const handleViewChart = (val, key) => {
    switch (key) {
      case 'rightAll':
        dispatch({
          type: 'workSpace/updateState',
          payload: { titleAggregate: { ...titleAggregate, layoutType: val } },
        });
        break;
      case 'rightFeedbackUnderReview':
        dispatch({
          type: 'workSpace/updateState',
          payload: { titleAggregate: { ...titleAggregate, approve: val } },
        });
        break;
      case 'righttoBeSigned':
        dispatch({
          type: 'workSpace/updateState',
          payload: { titleAggregate: { ...titleAggregate, released: val } },
        });
        break;
      case 'rightToBeSubmited':
        dispatch({
          type: 'workSpace/updateState',
          payload: { titleAggregate: { ...titleAggregate, toBeSubmitted: val } },
        });
        break;
      case 'rightDetailFeedback':
        dispatch({
          type: 'workSpace/updateState',
          payload: { titleAggregate: { ...titleAggregate, datelApprove: val } },
        });
        break;
      case 'rightDetailAll':
        dispatch({
          type: 'workSpace/updateState',
          payload: { titleAggregate: { ...titleAggregate, detailedAll: val } },
        });
        break;
      case 'rightUnderApproval':
        dispatch({
          type: 'workSpace/updateState',
          payload: { titleAggregate: { ...titleAggregate, underApprovaled: val } },
        });
        break;
      default:
        if (key) {
          dispatch({
            type: 'workSpace/updateState',
            payload: { titleAggregate: { ...titleAggregate, [key]: val } },
          });
        }
        return false;
    }
  };

  // 聚合视图按钮
  const rightRender = (key, callBack = () => {}) => {
    switch (key) {
      case 'rightAll':
        return (
          <div className={styles['search-layout']}>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.flatTableView').d('平铺表视图')}
            >
              <div
                className={layoutType === 'flat' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('flat', 'rightAll');
                  setAggregationAll(false);
                }}
              >
                <Icon type="reorder" />
              </div>
            </Tooltip>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.aggregateTableView').d('聚合表视图')}
            >
              <div
                className={layoutType === 'wide' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('wide', 'rightAll');
                  setAggregationAll(true);
                }}
              >
                <Icon type="view_day" />
              </div>
            </Tooltip>
          </div>
        );
      case 'righttoBeSigned':
        return (
          <div className={styles['search-layout']}>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.flatTableView').d('平铺表视图')}
            >
              <div
                className={released === 'flat' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  setAggregationSigned(false);
                  handleViewChart('flat', 'righttoBeSigned');
                  // setAggregation(false);
                }}
              >
                <Icon type="reorder" />
              </div>
            </Tooltip>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.aggregateTableView').d('聚合表视图')}
            >
              <div
                className={released === 'wide' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('wide', 'righttoBeSigned');
                  setAggregationSigned(true);
                }}
              >
                <Icon type="view_day" />
              </div>
            </Tooltip>
          </div>
        );
      case 'rightToBeSubmited':
        return (
          <div className={styles['search-layout']}>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.flatTableView').d('平铺表视图')}
            >
              <div
                className={toBeSubmitted === 'flat' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('flat', 'rightToBeSubmited');
                  setAggregationToBeSubmit(false);
                }}
              >
                <Icon type="reorder" />
              </div>
            </Tooltip>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.aggregateTableView').d('聚合表视图')}
            >
              <div
                className={toBeSubmitted === 'wide' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('wide', 'rightToBeSubmited');
                  setAggregationToBeSubmit(true);
                }}
              >
                <Icon type="view_day" />
              </div>
            </Tooltip>
          </div>
        );
      case 'rightDetailAll':
        return (
          <div className={styles['search-layout']}>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.flatTableView').d('平铺表视图')}
            >
              <div
                className={detailedAll === 'flat' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('flat', 'rightDetailAll');
                  setAggregationDetailAll(false);
                }}
              >
                <Icon type="reorder" />
              </div>
            </Tooltip>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.aggregateTableView').d('聚合表视图')}
            >
              <div
                className={detailedAll === 'wide' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('wide', 'rightDetailAll');
                  setAggregationDetailAll(true);
                }}
              >
                <Icon type="view_day" />
              </div>
            </Tooltip>
          </div>
        );
      case 'rightUnderApproval':
        return (
          <div className={styles['search-layout']}>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.flatTableView').d('平铺表视图')}
            >
              <div
                className={underApprovaled === 'flat' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('flat', 'rightUnderApproval');
                  setAggregationApproval(false);
                }}
              >
                <Icon type="reorder" />
              </div>
            </Tooltip>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.aggregateTableView').d('聚合表视图')}
            >
              <div
                className={underApprovaled === 'wide' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('wide', 'rightUnderApproval');
                  setAggregationApproval(true);
                }}
              >
                <Icon type="view_day" />
              </div>
            </Tooltip>
          </div>
        );
      default:
        return (
          <div className={styles['search-layout']}>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.flatTableView').d('平铺表视图')}
            >
              <div
                className={titleAggregate[key] === 'flat' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('flat', key);
                  callBack(false);
                }}
              >
                <Icon type="reorder" />
              </div>
            </Tooltip>
            <Tooltip
              title={intl.get('spcm.workspace.model.workspace.aggregateTableView').d('聚合表视图')}
            >
              <div
                className={titleAggregate[key] === 'wide' ? 'isActive' : 'isNormal'}
                onClick={() => {
                  handleViewChart('wide', key);
                  callBack(true);
                }}
              >
                <Icon type="view_day" />
              </div>
            </Tooltip>
          </div>
        );
    }
  };

  // // 聚合视图 状态
  // const handleAggregationChange = (aggregations) => {
  //   setAggregation(aggregations);
  // };

  const letfRender = useCallback((_, ds) => (
    <MutlTextFieldSearch
      style={{ width: '280px' }}
      placeholder={intl
        .get('spcm.workspace.model.common.commonMultiSearch')
        .d('请输入协议编号、协议名称查询')}
      dataSet={ds}
      name="multiPcNumOrTitle"
    />
  ));

  // 得到TABLE
  const getTableRender = useCallback((key) => {
    const cuxSearchBarConfig = remote.process(
      'SPCM_WORKSPACE_LIST_PROCESS_SEARCH_BAR_CONFIG',
      {},
      { ...props, activeKey }
    );
    switch (key) {
      case 'toBeSubmited':
        return customizeTable(
          { code: 'SPCM.WORKSPACE_TOBESUBMITED.LIST' },
          <SearchBarTable
            customizable
            customizedCode="aggregation"
            aggregation={aggregationToBeSubmit}
            style={{ maxHeight: `calc(100vh - 280px)` }}
            onAggregationChange={(a) => {
              setAggregationToBeSubmit(a);
            }}
            cacheState
            searchCode="SPCM.WORKSPACE_TOBESUBMITED.SERARCH"
            dataSet={toBeSubmitedDs}
            columns={
              toBeSubmitted === 'flat' ? getColumns('toBeSubmited') : rightColumns('toBeSubmited')
            }
            searchBarConfig={{
              onQuery: (e) => onQuery(e, toBeSubmitedDs),
              onFieldChange,
              editorProps,
              fieldProps: {
                supplierCompanyId: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                version: {
                  precision: 0,
                },
                // multiPcNumOrTitle: {
                //   multiple: ',',
                // },
              },
              left: {
                render: letfRender,
              },
              right: {
                render: () => rightRender('rightToBeSubmited'),
              },
              ...cuxSearchBarConfig,
            }}
          />
        );
      case 'underApproval':
        return customizeTable(
          { code: 'SPCM.WORKSPACE_UNDERAPPROVAL2.LIST' },
          <SearchBarTable
            customizable
            style={{ maxHeight: `calc(100vh - 280px)` }}
            customizedCode="aggregation"
            aggregation={aggregationApproval}
            onAggregationChange={(a) => {
              setAggregationApproval(a);
            }}
            cacheState
            searchCode="SPCM.WORKSPACE_UNDERAPPROVAL2.SERARCH"
            dataSet={underApprovalDs}
            columns={
              underApprovaled === 'flat'
                ? getColumns('underApproval')
                : rightColumns('underApproval')
            }
            searchBarConfig={{
              onQuery: (e) => onQuery(e, underApprovalDs),
              onFieldChange,
              editorProps,
              fieldProps: {
                supplierCompanyId: {
                  dynamicProps: {
                    lovPara: () => ({
                      tenantId: organizationId,
                    }),
                  },
                },
                version: {
                  precision: 0,
                },
                // multiPcNumOrTitle: {
                //   multiple: ',',
                // },
              },
              left: {
                render: letfRender,
              },
              right: {
                render: () => rightRender('rightUnderApproval'),
              },
              ...cuxSearchBarConfig,
            }}
          />
        );
      case 'toBeSigned':
        return customizeTable(
          { code: 'SPCM.WORKSPACE_TOBERELEASED.LIST3' },
          <SearchBarTable
            customizable
            customizedCode="aggregation"
            aggregation={aggregationSigned}
            onAggregationChange={(a) => {
              setAggregationSigned(a);
            }}
            cacheState
            searchCode="SPCM.WORKSPACE_TOBERELEASED.SERARCH2"
            dataSet={toBeSignedDs}
            style={{ maxHeight: `calc(100vh - 280px)` }}
            columns={released === 'flat' ? getColumns('toBeSigned') : rightColumns('toBeSigned')}
            searchBarConfig={{
              onQuery: (e) => onQuery(e, toBeSignedDs),
              onFieldChange,
              editorProps,
              fieldProps: {
                supplierCompanyId: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                version: {
                  precision: 0,
                },
                // multiPcNumOrTitle: {
                //   multiple: ',',
                // },
              },
              left: {
                render: letfRender,
              },
              right: {
                render: () => rightRender('righttoBeSigned'),
              },
              ...cuxSearchBarConfig,
            }}
          />
        );
      case 'all':
        return customizeTable(
          { code: 'SPCM.WORKSPACE_ALL.LIST' },
          <SearchBarTable
            customizable
            customizedCode="aggregation"
            aggregation={aggregationAll}
            onAggregationChange={(aggregations) => {
              setAggregationAll(aggregations);
            }}
            style={{ maxHeight: `calc(100vh - 280px)` }}
            cacheState
            mode="tree"
            // expandIconAsCell
            // expandIconColumnIndex={1}
            searchCode="SPCM.WORKSPACE_ALL.SERARCH2"
            dataSet={allDs}
            columns={layoutType === 'flat' ? getColumns('all') : rightColumns('all')}
            spin={{ spinning: loadings.handleLoading }}
            searchBarConfig={{
              checkDataSetStatus: false, // 解决操作行展开收起后点击查询，出现【当前操作将会清空变更过的数据，是否继续？】弹框提示
              onQuery: (e) => onQuery(e, allDs),
              onFieldChange,
              editorProps: {
                ...editorProps,
                pcStatusSet: {
                  // 已变更/已拒绝/供应商确认前变更/供应商确认后变更/补充完成。工作台筛选中去掉该值。
                  optionsFilter: (record) =>
                    ![
                      'HAVE_ALTERATION',
                      'REJECT',
                      'AFTER_SUP_CONFIRM',
                      'BEFORE_SUP_CONFIRM',
                      'SUPPLEMENT_COMPLETE',
                    ].includes(record.get('value')),
                },
              },
              fieldProps: {
                supplierCompanyId: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                version: {
                  precision: 0,
                },
                // multiPcNumOrTitle: {
                //   multiple: ',',
                // },
              },
              left: {
                render: letfRender,
              },
              right: {
                render: () => rightRender('rightAll'),
              },
              ...cuxSearchBarConfig,
            }}
          />
        );
      default:
        return customizeTable(
          {
            code: 'SPCM.WORKSPACE_LIST.DETAIL.LIST',
          },
          <SearchBarTable
            customizable
            customizedCode="aggregation"
            aggregation={aggregationDetailAll}
            onAggregationChange={(a) => {
              setAggregationDetailAll(a);
            }}
            cacheState
            style={{ maxHeight: `calc(100vh - 280px)` }}
            searchCode="SPCM.WORKSPACE_LIST.DETAIL.SERARCH2"
            dataSet={detailAllDs}
            columns={detailedAll === 'flat' ? getColumns('detailAll') : rightColumns('detailAll')}
            searchBarConfig={{
              onQuery: (e) => onQuery(e, detailAllDs),
              onFieldChange,
              editorProps: {
                ...editorProps,
                pcStatusSet: {
                  // 已变更/已拒绝/供应商确认前变更/供应商确认后变更/补充完成。工作台筛选中去掉该值。
                  optionsFilter: (record) =>
                    ![
                      'HAVE_ALTERATION',
                      'REJECT',
                      'AFTER_SUP_CONFIRM',
                      'BEFORE_SUP_CONFIRM',
                      'SUPPLEMENT_COMPLETE',
                    ].includes(record.get('value')),
                },
              },
              fieldProps: {
                itemCode: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                supplierCompanyId: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                version: {
                  precision: 0,
                },
                // multiPcNumOrTitle: {
                //   multiple: ',',
                // },
              },
              left: {
                render: letfRender,
              },
              right: {
                render: () => rightRender('rightDetailAll'),
              },
              ...cuxSearchBarConfig,
            }}
          />
        );
    }
  });

  const activeKeys = () => {
    return activeKey;
  };
  const onTabChange = (key) => {
    // 这里用defaultActiveKey变量缓存比用model缓存页面少渲染一次，性能更好
    defaultActiveKey = key;
    setActiveKey(key);
    if (group[key]) {
      groupDefaultKey[group[key]] = key;
    }
  };

  const stageTabProps = {
    modelPrompt,
    commonPrompt,
    customizeTable,
    aggregationDetailAll,
    setAggregationDetailAll,
    stageAll,
    onQuery,
    onFieldChange,
    letfRender,
    rightRender,
    goDetail,
    dataSet: stageAllDs,
  };
  return (
    <Fragment>
      <Header title={intl.get('spcm.workspace.view.title.workSpace').d('协议工作台')}>
        {getBtns()}
      </Header>
      <Content className={classNames(styles['action-content-wide'])}>
        {customizeTabPane(
          { code: 'SPCM.WORKSPACE_LIST.TABS', cascade: true },
          <Tabs keyboard={false} activeKey={activeKeys} onChange={onTabChange}>
            {remote
              ? remote.process('SPCM_WORKSPACE_LIST_RENDER_TABS', null, {
                  props,
                  groupDefaultKey,
                  group,
                  extractConfig,
                })
              : null}
            <TabGroup
              tab={intl.get('spcm.workspace.view.button.wholeorder').d('合同')}
              key="contract"
              defaultActiveKey={groupDefaultKey.contract}
            >
              <TabPane
                key="toBeSubmited"
                count={countData.toBeSubmittedCount}
                tab={intl.get('spcm.workspace.view.tabPane.toBeSubmited').d('待提交')}
              >
                {getTableRender('toBeSubmited')}
              </TabPane>
              <TabPane
                key="underApproval"
                count={countData.approvalCount}
                tab={intl.get('spcm.workspace.view.tabPane.underApproval').d('审批中')}
              >
                {getTableRender('underApproval')}
              </TabPane>
              <TabPane
                key="toBeSigned"
                count={countData.toBeSignedCount}
                tab={intl.get('spcm.workspace.view.tabPane.toBeSigned').d('待签署')}
              >
                {getTableRender('toBeSigned')}
              </TabPane>
              <TabPane
                key="all"
                count={countData.pcHeaderCount}
                tab={intl.get('spcm.workspace.view.tabPane.all').d('全部')}
              >
                {getTableRender('all')}
              </TabPane>
            </TabGroup>
            <TabGroup
              tab={intl.get('spcm.workspace.view.button.detail').d('标的')}
              key="detail"
              defaultActiveKey={groupDefaultKey.detail}
            >
              <TabPane
                key="detailAll"
                count={countData.subjectCount}
                tab={intl.get('spcm.workspace.view.tabPane.all').d('全部')}
              >
                {getTableRender('detailAll')}
              </TabPane>
            </TabGroup>
            <TabGroup
              tab={intl.get('spcm.workspace.view.tab.stage').d('阶段')}
              key={groupDefaultKey.stage}
              defaultActiveKey={groupDefaultKey.stage}
            >
              <TabPane
                key={group.stageAll}
                count={countData.stageCount}
                tab={intl.get('spcm.workspace.view.tabPane.all').d('全部')}
              >
                <StageTab {...stageTabProps} />
              </TabPane>
            </TabGroup>
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
};

// workSpace.contextTypes = {
//   permission: PropTypes.object,
// };

export default compose(
  connect(({ workSpace }) => ({
    workSpace,
  })),
  formatterCollections({
    code: [
      'spcm.workspace',
      'spcm.common',
      'spcm.purchaseContractView',
      'spcm.contractSign',
      'sodr.common',
      'entity.company',
      'spcm.contractMaintain',
      'sodr.sendOrder',
      'ssta.purchaseSettle',
      'sodr.workspace',
      'spcm.contractChange',
      'entity.roles',
      'component.docFlow',
      'spcm.contractChapter',
      'entity.supplier',
      'entity.organization',
      'ssrc.inquiryHall',
      'spcm.amountStrategy',
      'scux.spcm',
    ],
  }),
  withCustomize({
    unitCode: [
      'SPCM.WORKSPACE_ALL.LIST', // 全部-列表
      'SPCM.WORKSPACE_ALL.SERARCH2', // 全部-查询
      'SPCM.WORKSPACE_TOBESUBMITED.LIST', // 待提交-列表
      'SPCM.WORKSPACE_LIST.TABS', // 列表tab页
      'SPCM.WORKSPACE_LIST.DETAIL.LIST', // 标的-全部-列表
      'SPCM.WORKSPACE_UNDERAPPROVAL2.LIST', // 审批中-列表
      'SPCM.WORKSPACE_TOBERELEASED.LIST3', // 待签署-列表
      'SPCM.WORKSPACE_TOBERELEASED.SERARCH2', // 待签署-查询
      'SPCM.WORKSPACE_TOBESUBMITED.SERARCH', // 待提交-查询
      'SPCM.WORKSPACE_UNDERAPPROVAL2.SERARCH', // 审批中-查询
      'SPCM.WORKSPACE_COMMON.TERMINATION', // 协议终止
      'SPCM.WORKSPACE_STAGE_ALL.BTN_GROUP', // 阶段-按钮组
      'SPCM.WORKSPACE_STAGE_ALL.LIST', // 阶段-全部
      'SPCM.WORKSPACE_STAGE_ALL.SEARCH', // 阶段-搜索
      'SPCM.WORKSPACE_ALL.BUTTONS', // 列表页按钮组
      'SPCM.WORKSPACE_TOBESUBMITED.BTN_GROUP', // 全部-待提交-按钮组
      'SPCM.WORKSPACE_COMMON.CREATE_MODAL', // 智能提取新建侧弹窗
    ],
  }),
  withProps(
    () => {
      const toBeSubmitedDs = new DataSet(toBeSubmited());
      const underApprovalDs = new DataSet(underApproval());
      const toBeSignedDs = new DataSet(toBeSigned());
      const allDs = new DataSet(all());
      const detailAllDs = new DataSet(detailAll());
      const stageAllDs = new DataSet(StageAllDS());
      return {
        toBeSubmitedDs,
        underApprovalDs,
        toBeSignedDs,
        allDs,
        detailAllDs,
        stageAllDs,
      };
    },
    { cacheState: true }
  ),
  hocRemote(
    {
      code: 'SPCM_WORKSPACE_LIST',
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        // 文件上传类型监控
        handleCheckFileType: undefined,
        // 文件上传成功回调
        handleCuxGetExtractResult({ response }) {
          return getResponse(response);
        },
      },
      events: {
        // 手工新建
        handleCuxCreateManually(eventProps) {
          const { jumpToCreate = (e) => e } = eventProps;
          jumpToCreate();
        },
        // 跳转到明细页二开
        handleCuxGoDetail() {},
        // 归档前处理
        handleCuxPreArchive() {},
        // 归档处理
        handleCuxArchive() {},
        // 作废处理
        handleCuxInvalid() {},
        // 终止
        handleCuxTerminate() {},
        // 提交前处理
        handleCuxSubmit() {},
        // 处理重新同步
        handleCuxSyncAlignModal() {},
        // 处理二开需要的useEffect
        handleCuxUseEffect() {},
      },
    }
  ),
  observer
)(WorkSpaceCom);
