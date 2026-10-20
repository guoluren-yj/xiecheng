import React, { useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import classnames from 'classnames';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { compose, isNil } from 'lodash';
import {
  handleSave,
  handleCreate,
  realsePriceAdjustment,
  cancelWholeDoc,
  deleteCheck,
  deleteWholeDoc,
  revokeWorkflow,
  operationRevoke,
} from '@/services/priceAdjustmentWorkbenchService';
import { queryBatchApprovaFlag } from 'srm-front-boot/lib/utils/utils';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'hzero-front/lib/utils/utils';
import remote from 'hzero-front/lib/utils/remote';
import querystring from 'querystring';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import ExportBtn from '@/routes/spc/components/OperationRecord/ExportBtn';
import { getRuleDefinition } from '@/routes/ssrc/PriceLibraryNew/util';
import { handleToDetail } from '../utils';
import { getBasicInfoDs, getLineDs } from '../stores/getDetailsDs';
import BasicInfo from '../Detail/components/BasicInfo';
import PriceAdjustmentLine from '../Detail/components/PriceAdjustmentLine';
import OperationRecord from '../../components/OperationRecord';
import styles from '../index.less';

const backPath = '/spc/price-adjustment-workbench/list';

const CardTitle = ({ title }) => (
  <h3 className={styles['card-sub-title']}>
    <div className={styles['card-sub-title-line']} />
    {title}
  </h3>
);

const Index = ({
  history,
  location,
  match = {},
  customizeTable,
  customizeForm,
  custConfig,
  customizeBtnGroup,
  extraParams = {},
  refInstance,
  priceRemote,
}) => {
  const { priceAdjustmentHeaderId, backFlag } = location
    ? querystring.parse(location?.search?.substr(1))
    : extraParams;

  // 获取额外参数
  const {
    isModal = false, // 是否窗口
    showHeader = true,
    basicEditFlag = true, // 基础信息是否可编辑
    lineEditFlag = true, // 行是否可编辑
    cusUnitCode,
  } = extraParams;

  if (refInstance) {
    useImperativeHandle(refInstance, () => ({
      // 导出ref属性字段
      BasicInfoDs,
      LineDs,
    }));
  }

  const { params = {}, path = '' } = match;
  const { status } = params;

  const isPub = path.includes('/pub/');
  // 工作流页面以及，status === 'view', 并且不是窗口模式都是只读页面
  const isEdit = !isPub && status !== 'view' && (basicEditFlag || lineEditFlag);

  const BasicInfoDs = useMemo(
    () => new DataSet(getBasicInfoDs(priceAdjustmentHeaderId, isEdit && basicEditFlag)),
    [priceAdjustmentHeaderId, isEdit]
  );

  const LineDs = useMemo(
    () => new DataSet(getLineDs(priceAdjustmentHeaderId, isEdit && lineEditFlag)),
    [priceAdjustmentHeaderId, isEdit]
  );

  const [saveLoading, setSaveLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [ruleDefinition, setRuleDefinition] = useState([]);
  const [businessKeyRevoke, setBisinessKeyRevoke] = useState({
    revokeByBusKeyFlag: null,
    approvalByBusKey: null,
  });

  useEffect(() => {
    queryRuleDefinition();
    if (priceAdjustmentHeaderId) {
      if (priceRemote?.event) {
        priceRemote.event.fireEvent('remoteRefreshData', {
          priceAdjustmentHeaderId,
          isEdit,
          basicEditFlag,
          lineEditFlag,
          BasicInfoDs,
          LineDs,
          refreshData,
        });
      } else {
        refreshData();
      }
    }
  }, [priceAdjustmentHeaderId]);

  const refreshData = (isLineRefresh) => {
    setQueryLoading(true);
    Promise.all([BasicInfoDs.query(), LineDs.query()]).finally(() => {
      setQueryLoading(false);
      if (!isLineRefresh) {
        // 仅刷新基础信息时，不需要重新查询撤销信息，只有初次加载时需要
        queryOperationRevoke();
      }
    });
  };

  useEffect(() => {
    LineDs.setState('ruleDefinition', ruleDefinition);
  }, [ruleDefinition]);

  // 查询基准价维护的对应规则
  const queryRuleDefinition = () => {
    return getRuleDefinition().then((res) => {
      setRuleDefinition(res);
    });
  };

  const onSave = async () => {
    const basicinfoFlag = await BasicInfoDs.validate();
    const lineInfoFlag = await LineDs.validate();
    const param = {
      ...BasicInfoDs.current?.toData(),
      priceAdjustmentLineList: LineDs.toData(),
    };
    const customizeUnitCode = isEdit
      ? 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_SEARCH,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_EDIT_TABLE'
      : 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_SEARCH,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM_READONLY,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_TABLE_READONLY';
    const saveFunc = priceAdjustmentHeaderId ? handleSave : handleCreate;
    if (basicinfoFlag && lineInfoFlag) {
      setSaveLoading(true);
      return saveFunc(param, customizeUnitCode)
        .then(async (res) => {
          if (getResponse(res)) {
            // 新建
            if (!priceAdjustmentHeaderId) {
              handleToDetail(history, res.priceAdjustmentHeaderId, 'edit');
            } else {
              await BasicInfoDs.query();
              await LineDs.query();
              notification.success();
            }
          }
        })
        .finally(() => {
          setSaveLoading(false);
        });
    }
  };

  const onDelete = async () => {
    setSaveLoading(true);
    const res = getResponse(await deleteCheck([{ priceAdjustmentHeaderId }]));
    if (isNil(res)) {
      setSaveLoading(false);
      return false;
    }
    let feedback = 'ok';
    if (res === 1) {
      feedback = await Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('ssrc.priceAdjustmentWorkBench.view.message.deleteConfirm')
          .d(
            '该调价单中存在部分行数据是从代转池引入，删除后该部分行数据将释放回代转池，是否确认删除？'
          ),
      });
    } else {
      feedback = await Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('ssrc.priceAdjustmentWorkBench.view.message.deleteWhole')
          .d('是否确认整单删除？'),
      });
    }

    if (feedback !== 'ok') {
      setSaveLoading(false);
      return false;
    }
    const delRes = await deleteWholeDoc([{ priceAdjustmentHeaderId }]).finally(() =>
      setSaveLoading(false)
    );
    if (getResponse(delRes)) {
      notification.success();
      history.push({
        pathname: '/spc/price-adjustment-workbench/list',
        search: querystring.stringify({
          activeTabKey: 'ALL',
        }),
      });
    }
  };

  const onCancelWholeDoc = async () => {
    setSaveLoading(true);
    const res = await cancelWholeDoc([{ priceAdjustmentHeaderId }]).finally(() =>
      setSaveLoading(false)
    );
    if (getResponse(res)) {
      notification.success();
      history.push({
        pathname: '/spc/price-adjustment-workbench/list',
        search: querystring.stringify({
          activeTabKey: 'NEW',
        }),
      });
    }
  };

  const onRelease = async () => {
    const basicinfoFlag = await BasicInfoDs.current?.validate();
    const lineInfoFlag = await LineDs.validate();
    const param = {
      ...BasicInfoDs.current?.toData(),
      priceAdjustmentLineList: [...LineDs.toData()],
    };
    const customizeUnitCode = isEdit
      ? 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_SEARCH,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_EDIT_TABLE'
      : 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_SEARCH,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM_READONLY,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_TABLE_READONLY';
    if (basicinfoFlag && lineInfoFlag) {
      setSaveLoading(true);
      return handleSave(param, customizeUnitCode)
        .then(async (res) => {
          if (getResponse(res)) {
            await realsePriceAdjustment([res]).then((response) => {
              if (getResponse(response)) {
                notification.success();
                history.push({
                  pathname: '/spc/price-adjustment-workbench/list',
                });
              }
            });
          }
        })
        .finally(() => {
          setSaveLoading(false);
          refreshData();
        });
    }
  };

  const gotoCalcDetail = (recordLineId) => {
    history.push({
      pathname: `/spc/advanced-pricing-record/detail/${recordLineId}/true`,
    });
  };

  /**
   * 通过businesskey判断流程是否可以撤销
   */
  const queryOperationRevoke = () => {
    const { priceAdjustmentStatus, businessKey } = BasicInfoDs?.current?.get([
      'priceAdjustmentStatus',
      'businessKey',
    ]);
    if (priceAdjustmentStatus === 'APPROVAL' && businessKey) {
      Promise.all([operationRevoke([businessKey]), queryBatchApprovaFlag([businessKey])]).then(
        ([res1, res2]) => {
          const res = getResponse(res1);
          if (res && res2) {
            setBisinessKeyRevoke({
              revokeByBusKeyFlag: res?.[businessKey]?.REVOKE,
              approvalByBusKey: res2?.[businessKey],
            });
          }
        }
      );
    }
  };

  /**
   * 操作记录
   * @returns
   */
  const operateHistory = async () => {
    const businessKey = BasicInfoDs?.current?.get('businessKey');
    if (!priceAdjustmentHeaderId) return;
    let filterBarRef = null;
    const docType = 'PRICE_ADJUSTMENT';
    const modalProps = {
      operateParams: { docType, priceAdjustmentHeaderId, docId: priceAdjustmentHeaderId },
      businessKey,
      showFlag: true,
      onlyOperation: !businessKey,
      fieldParam: {
        realName: 'processUserName',
        actionCode: 'processTypeCode',
        actionId: 'priceAdjustmentActionId',
      },
      onRef: (ref) => {
        filterBarRef = ref;
      },
    };
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      style: {
        width: '742px',
      },
      drawer: true,
      children: <OperationRecord {...modalProps} />,
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
      footer: (okButton) => {
        return (
          <>
            {okButton}
            <ExportBtn
              documentType={docType}
              documentId={priceAdjustmentHeaderId}
              getRef={() => filterBarRef}
            />
          </>
        );
      },
    });
  };

  /**
   * 审批
   */
  const handleApproval = () => {
    const { taskId, processInstanceId } = businessKeyRevoke?.approvalByBusKey || {};
    if (taskId && processInstanceId) {
      openApproveModal({
        taskId,
        processInstanceId,
        closable: true,
        onSuccess: () => {
          history.push({
            pathname: backPath,
            search: querystring.stringify({
              activeTabKey: 'ALL',
            }),
          });
        },
      });
    }
  };

  /**
   * 撤销审批
   */
  const handleRevoke = async () => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get(`ssrc.priceLibraryNew.view.message.note.revokeApprove`)
        .d('您确定要撤销审批吗？您可以在撤销后再次提交审批（注意：仅工作流审批发起人可执行撤销）'),
      onOk: async () => {
        const res = await revokeWorkflow({ priceAdjustmentHeaderId });
        if (getResponse(res)) {
          notification.success();
          history.push({
            pathname: backPath,
            search: querystring.stringify({
              activeTabKey: 'ALL',
            }),
          });
        }
      },
    });
  };

  const HeaderButtons = observer(({ dataSet }) => {
    const { priceAdjustmentStatus, sourceFrom } = dataSet?.current?.get([
      'priceAdjustmentStatus',
      'sourceFrom',
    ]);
    let buttons = [
      {
        name: 'operateHistory',
        child: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: operateHistory,
        },
      },
    ];
    if (isEdit) {
      const editBtns = [
        {
          btnComp: PermissionButton,
          name: 'release',
          hidden: !priceAdjustmentHeaderId,
          child: intl.get('ssrc.priceAdjustmentWorkBench.view.title.publish').d('发布'),
          btnProps: {
            type: 'c7n-pro',
            color: 'primary',
            icon: 'publish2',
            onClick: onRelease,
            loading: saveLoading || queryLoading,
            waitType: 'throttle',
            wait: 200,
            permissionList: [
              {
                code: 'srm.ssrc.price.model.price-adjustment-workbench.button.detail.publish',
                type: 'button',
                meaning: '调价单工作台发布',
              },
            ],
          },
        },
        {
          btnComp: PermissionButton,
          name: 'save',
          child: intl.get('ssrc.priceAdjustmentWorkBench.view.title.save').d('保存'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'save',
            onClick: onSave,
            color: !priceAdjustmentHeaderId ? 'primary' : '',
            funcType: !priceAdjustmentHeaderId ? 'raised' : 'flat',
            loading: saveLoading || queryLoading,
            waitType: 'throttle',
            wait: 200,
            permissionList: [
              {
                code: 'srm.ssrc.price.model.price-adjustment-workbench.button.detail.save',
                type: 'button',
                meaning: '调价单工作台保存',
              },
            ],
          },
        },
        {
          btnComp: PermissionButton,
          name: 'delete',
          // 新建、拒绝且是手工的才允许删除
          hidden: !(
            priceAdjustmentHeaderId &&
            ['REJECTED', 'NEW'].includes(priceAdjustmentStatus) &&
            sourceFrom === 'MANUAL'
          ),
          child: intl.get('ssrc.priceAdjustmentWorkBench.view.title.delete').d('删除'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'delete',
            onClick: onDelete,
            funcType: 'flat',
            loading: saveLoading || queryLoading,
            waitType: 'throttle',
            wait: 200,
            permissionList: [
              {
                code: 'srm.ssrc.price.model.price-adjustment-workbench.button.detail.delete',
                type: 'button',
                meaning: '调价单工作台删除',
              },
            ],
          },
        },
        {
          btnComp: PermissionButton,
          name: 'cancelWholeDoc',
          // 新建，状态不为审批拒绝或者待发布，来源不是快速询价
          hidden:
            !priceAdjustmentHeaderId ||
            !['REJECTED', 'NEW'].includes(priceAdjustmentStatus) ||
            sourceFrom !== 'QUICK_SEARCH_SOURCE',
          child: intl.get('ssrc.priceAdjustmentWorkBench.view.title.cancelWholeDoc').d('整单取消'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'cancel',
            onClick: onCancelWholeDoc,
            funcType: 'flat',
            loading: queryLoading || saveLoading,
            waitType: 'throttle',
            wait: 200,
            // permissionList: [
            //   {
            //     code: 'srm.ssrc.price.model.price-adjustment-workbench.button.detail.cancelWholeDoc',
            //     type: 'button',
            //     meaning: '调价单工作台整单取消',
            //   },
            // ],
          },
        },
      ];
      buttons = buttons.concat(editBtns);
    } else if (!isPub) {
      const { revokeByBusKeyFlag, approvalByBusKey } = businessKeyRevoke || {};
      const viewBtns = [
        approvalByBusKey && {
          name: 'approval',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'authorize',
            funcType: 'flat',
            type: 'c7n-pro',
            wait: 500,
            onClick: handleApproval,
          },
          child: intl.get('ssrc.priceLibraryNew.view.button.approval').d('审批'),
        },
        revokeByBusKeyFlag && {
          name: 'revokeApproval',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'reply',
            funcType: 'flat',
            type: 'c7n-pro',
            wait: 500,
            onClick: handleRevoke,
          },
          child: intl.get('ssrc.priceLibraryNew.view.button.revokeApproval').d('撤销审批'),
        },
      ];
      buttons = buttons.concat(viewBtns);
    }
    return customizeBtnGroup(
      {
        code: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.BUTTONS',
        pro: true,
      },
      <DynamicButtons buttons={buttons} />
    );
  });

  const title = isEdit
    ? intl.get('ssrc.priceAdjustmentWorkBench.view.title.editPriceAdjustment').d('编辑调价单')
    : intl.get('ssrc.priceAdjustmentWorkBench.view.title.viewPriceAdjustment').d('查看调价单');

  const priceAdjustmentLineProps = {
    priceRemote,
    customizeBtnGroup,
    customizeTable,
    customizeForm,
    custConfig,
    onSave,
    gotoCalcDetail,
    ruleDefinition,
    priceAdjustmentHeaderId,
    refreshData,
    isEdit: isEdit && lineEditFlag,
    basicInfoDs: BasicInfoDs,
    dataSet: LineDs,
    cusUnitCode,
  };

  return (
    <>
      {showHeader && (
        <Header
          title={title}
          // backFlag标识为N时，不显示返回按钮；提供给其他模块使用
          // 审批时isPub=true时，不显示返回按钮；
          backPath={backFlag === 'N' || isPub ? '' : '/spc/price-adjustment-workbench'}
        >
          <HeaderButtons dataSet={BasicInfoDs} />
        </Header>
      )}

      {!isModal ? (
        <Content className={classnames('ued-detail-wrapper', styles['update-container'])}>
          <div className={styles['rfx-detail-list-card']}>
            <div className={styles['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                {intl
                  .get('ssrc.priceAdjustmentWorkBench.content.cardTitle.basicInfo')
                  .d('基础信息')}
              </h3>
              <BasicInfo
                dataSet={BasicInfoDs}
                isEdit={isEdit && basicEditFlag}
                customizeForm={customizeForm}
              />
            </div>
            <div className={styles['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                {intl
                  .get('ssrc.priceAdjustmentWorkBench.content.cardTitle.line')
                  .d('调价单明细信息')}
              </h3>
              <PriceAdjustmentLine {...priceAdjustmentLineProps} />
            </div>
          </div>
        </Content>
      ) : (
        <>
          <CardTitle
            title={intl
              .get('ssrc.priceAdjustmentWorkBench.content.cardTitle.basicInfo')
              .d('基础信息')}
          />
          <BasicInfo
            dataSet={BasicInfoDs}
            isEdit={isEdit && basicEditFlag}
            customizeForm={customizeForm}
            cusUnitCode={cusUnitCode}
          />
          <CardTitle
            title={intl
              .get('ssrc.priceAdjustmentWorkBench.content.cardTitle.line')
              .d('调价单明细信息')}
          />
          <PriceAdjustmentLine {...priceAdjustmentLineProps} />
        </>
      )}
    </>
  );
};

const WrapperIndex = compose(
  formatterCollections({
    code: [
      'ssrc.priceAdjustmentWorkBench',
      'spcm.common',
      'spc.advancedPricingRecord',
      'ssrc.priceLibraryNew',
      'ssrc.inquiryHall',
      'ssrc.common',
      'hzero.common',
    ],
  }),
  withCustomize({
    unitCode: [
      'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_SEARCH',
      'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_TABLE_READONLY',
      'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_EDIT_TABLE',
      'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM',
      'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM_READONLY',
      'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.BUTTONS',
      'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_BUTTONS',
      'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINEBATCH',
    ],
  }),
  remote(
    {
      code: 'SSRC_PRICE_ADJUSTMENT_WORKBENCH',
      name: 'priceRemote',
    },
    {
      events: {
        remoteRefreshData(eventProps) {
          const { refreshData } = eventProps || {};
          if (refreshData) {
            refreshData();
          }
        },
        handleCuxBatchPrice() {},
      },
    }
  )
)(Index);

export default WrapperIndex;

const ModalIndex = forwardRef((props, ref) => {
  return <WrapperIndex {...props} refInstance={ref} />;
});

export { ModalIndex, Index };
