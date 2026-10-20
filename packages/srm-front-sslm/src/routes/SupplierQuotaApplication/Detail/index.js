/*
 * 配额申请单-详情页
 * @date: 2024/01/02
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2024, Hand
 */
import React, { Fragment, useState, useMemo, useEffect } from 'react';
import { compose, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
import { getResponse } from 'utils/utils';
import { Spin, useDataSet, Dropdown, Button, Icon, Modal } from 'choerodon-ui/pro';
import moment from 'moment';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { Header, Content } from 'components/Page';
import { Card } from 'choerodon-ui';
import { Button as PerButton } from 'components/Permission';
import intl from 'utils/intl';
import notification from 'utils/notification';
import styles from '@/routes/index.less';
import { allSave, handleRelease, deleteQuota } from '@/services/supplierQuotaService';
import HistoryVersion from '@/routes/SupplierQuotaMasterData/HistoryVersion';
import {
  queryAllApprovalData,
  handleRevokeApprova,
  handleApprove,
} from '@/routes/components/WorkFlowApproval';

import remote from 'utils/remote';
import HeaderInfo from './HeaderInfo';
import QuotaAllocationInfo from './QuotaAllocationInfo';
import { getBasicsDS, getQuotaAllocationDS } from './stores/index';
import { getHeaderTitle } from '../utils';

const customizeUnitCodeList = [
  'SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.BASIC',
  'SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.AUOTA_ASIGNS',
];

const permissionList = [
  {
    name: 'approval',
    code: 'srm.partner.supplier-quota-manage.quota-application.button.detail.approval',
    meaning: '审批',
  },
  {
    name: 'revokeApproval',
    code: 'srm.partner.supplier-quota-manage.quota-application.button.detail.repeal-approval',
    meaning: '撤销审批',
  },
  {
    name: 'delete',
    code: 'srm.partner.supplier-quota-manage.quota-application.button.single-delete',
    meaning: '删除',
  },
];

const Detail = ({
  dispatch,
  history,
  custLoading,
  customizeTable,
  customizeForm,
  customizeBtnGroup,
  supQuotaApplicationRemote,
  location,
  match: {
    params: { quotaHeaderId },
  },
}) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  /**
   * source: 来源（ 配额申请单｜application; 配额主数据｜masterData; 配额主数据历史版本｜masterDataVersion; 配额主数据详情页历史版本｜masterDataDetailVersion ）
   * entranceSource: 历史版本跳转，区分最初来源页面
   * type: 页面可编辑类型 ( 编辑｜edit; 只读｜view )
   * versionNum: 版本号，历史版本跳转时，显示当前版本信息
   * sourceQuotaHeaderId：详情页跳转历史版本时，需要返回当前进入的详情页
   */
  const { type, source, entranceSource, versionNum, sourceQuotaHeaderId } = routerParams;
  const isCreat = !quotaHeaderId; // 是否新建页面

  const isPub = useMemo(() => !!location.pathname.match('/pub/'), [location]);
  const [isEdit, setIsEdit] = useState(type === 'edit' || isCreat); // 是否编辑页面
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [basicsInfo, setBasicsInfo] = useState({});
  const [approvalBtnInfo, setApprovalBtnInfo] = useState({});

  // 埋点-修改配额行ds的属性值
  const processParams = {
    quotaHeaderId,
    lineDsProps: getQuotaAllocationDS({ quotaHeaderId, isEdit }),
  };
  const basicsDsProps = supQuotaApplicationRemote
    ? supQuotaApplicationRemote.process(
        'SSLM_SUP_QUOTA_APPLICATION_DEFINITION_BASICS_PROCESS',
        getBasicsDS({ quotaHeaderId, isEdit })
      )
    : getBasicsDS({ quotaHeaderId, isEdit });
  const quotaDsProps = supQuotaApplicationRemote
    ? supQuotaApplicationRemote.process(
        'SSLM_SUP_QUOTA_APPLICATION_CREATE_PROCESS',
        getQuotaAllocationDS({ quotaHeaderId, isEdit }),
        processParams
      )
    : getQuotaAllocationDS({ quotaHeaderId, isEdit });

  const basicsDs = useDataSet(() => basicsDsProps, [quotaHeaderId]);
  const quotaAllocationDs = useDataSet(() => quotaDsProps, [quotaHeaderId]);

  const { versionNum: curVersionNum, businessKey: newBusinessKey } = basicsInfo || {};

  quotaAllocationDs.bind(basicsDs, 'supplierQuotaLines'); // 配额分配

  const { approvalDataMap: approvalMap, revokeDataMap: revokeMap } = approvalBtnInfo || {};
  const approvalBtnProps = approvalMap ? approvalMap[newBusinessKey] : {};

  useEffect(() => {
    if (quotaHeaderId) {
      handleQuery();
    }
  }, [quotaHeaderId]);

  const handleQuery = () => {
    setSpinning(true);
    basicsDs.setQueryParameter('customizeUnitCode', 'SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.BASIC');
    quotaAllocationDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.AUOTA_ASIGNS'
    );
    basicsDs
      .query()
      .then(res => {
        if (getResponse(res)) {
          const { evalStatus, businessKey } = res;
          const editFlag =
            isCreat || (type === 'edit' && ['NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus));
          setIsEdit(editFlag);
          setBasicsInfo(res);
          // 查询审批按钮
          handleQueryAllApprovalData({ businessKey });
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  };

  const handleQueryAllApprovalData = ({ businessKey }) => {
    if (businessKey) {
      queryAllApprovalData({ businessKeys: [businessKey], queryHistoryFlag: false }).then(res => {
        if (res) {
          const { approvalDataMap, revokeDataMap } = res;
          setApprovalBtnInfo({
            approvalDataMap,
            revokeDataMap,
          });
        }
      });
    } else {
      setApprovalBtnInfo({});
    }
  };

  // 获取需保存的数据
  const getSaveData = () => {
    const basicsData = basicsDs.current.toData();
    const { effectiveDateFrom: newStartDate, effectiveDateTo: newEndDate } = basicsData;
    const effectiveDateFrom = newStartDate && moment(newStartDate).format(DATETIME_MIN);
    const effectiveDateTo = newEndDate && moment(newEndDate).format(DATETIME_MAX);
    const payload = {
      ...basicsData,
      effectiveDateFrom,
      effectiveDateTo,
      itemId: basicsData.itemId ? basicsData.itemId : null, // 当品类／物料只维护名称时，需给后端传null
      itemCategoryId: basicsData.itemCategoryId ? basicsData.itemCategoryId : null,
      customizeUnitCode: customizeUnitCodeList.join(','),
    };
    return payload;
  };

  // 保存
  const handleSave = () => {
    const payload = getSaveData();
    setLoading(true);
    return allSave(payload)
      .then(res => {
        const response = getResponse(res);
        if (response) {
          const { quotaHeaderId: newQuotaHeaderId } = response;
          if (isCreat && newQuotaHeaderId) {
            history.push({
              pathname: `/sslm/supplier-quota-application/detail/${newQuotaHeaderId}`,
              search: querystring.stringify({
                type: 'edit',
                source: 'application',
              }),
            });
          } else {
            handleQuery();
          }
          notification.success();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 提交
  const handelSubmit = () => {
    const payload = getSaveData();
    setLoading(true);
    return handleRelease(payload)
      .then(res => {
        const response = getResponse(res);
        if (response) {
          const { quotaHeaderId: newQuotaHeaderId } = response;
          if (newQuotaHeaderId) {
            // 如果是变更的单据，提交后返回主数据列表
            const jumpUrl = ['masterData'].includes(source)
              ? `/sslm/supplier-quota-master-data/list`
              : `/sslm/supplier-quota-application/list`;
            history.push({
              pathname: jumpUrl,
            });
          }
          notification.success();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * 保存/提交 回调
   * @param {*} operationType 操作类型 save｜保存、release｜发布
   */
  const handleSaveOrSubmit = async operationType => {
    const basicsValidateFlag = await basicsDs.validate();
    if (basicsValidateFlag) {
      const eventProps = {
        basicsDs,
        onSave: handleSave,
        onSubmit: handelSubmit,
      };
      if (operationType === 'save') {
        // 默认返回true,当返回false时走二开逻辑不走标准逻辑
        const res = await supQuotaApplicationRemote.event.fireEvent('cuxHandleSave', eventProps);
        if (!res) {
          return;
        }
        return handleSave();
      } else if (operationType === 'submit') {
        // 默认返回true,当返回false时走二开逻辑不走标准逻辑
        const res = await supQuotaApplicationRemote.event.fireEvent('cuxHandleSubmit', eventProps);
        if (!res) {
          return;
        }
        return handelSubmit();
      }
    }
  };

  // 删除
  const handleDelete = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.common.model.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        setLoading(true);
        deleteQuota({ quotaHeaderId })
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: '/sslm/supplier-quota-application/list',
                })
              );
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  const buttons = [
    {
      name: 'save',
      btnComp: PerButton,
      btnProps: {
        loading,
        icon: 'save',
        hidden: !isEdit,
        type: 'c7n-pro',
        funcType: isCreat ? 'raised' : 'flat',
        color: isCreat ? 'primary' : 'default',
        onClick: () => handleSaveOrSubmit('save'),
        wait: 200,
        waitType: 'debounce',
      },
      child: intl.get('hzero.common.button.save').d('保存'),
    },
    {
      name: 'submit',
      btnComp: PerButton,
      btnProps: {
        loading,
        icon: 'check',
        type: 'c7n-pro',
        color: 'primary',
        hidden: isCreat || !isEdit,
        onClick: () => handleSaveOrSubmit('submit'),
        wait: 200,
        waitType: 'debounce',
      },
      child: intl.get('hzero.common.button.submit').d('提交'),
    },
    {
      name: 'delete',
      child: intl.get('hzero.common.button.delete').d('删除'),
      btnProps: {
        loading,
        wait: 200,
        icon: 'delete',
        funcType: 'flat',
        waitType: 'throttle',
        hidden: isCreat || !isEdit,
        onClick: () => handleDelete(),
      },
    },
    {
      noNest: true,
      hidden:
        isEdit ||
        !['masterDataVersion', 'masterDataDetailVersion', 'masterData'].includes(source) ||
        !(curVersionNum > 1),
      child: (
        <Dropdown
          overlay={
            <HistoryVersion
              dispatch={dispatch}
              record={basicsDs.current}
              showSubMenuFlag={false}
              type="view"
              source="masterDataDetailVersion"
              entranceSource={entranceSource}
              sourceQuotaHeaderId={sourceQuotaHeaderId}
            />
          }
        >
          <Button icon="schedule" type="c7n-pro" funcType="flat" loading={loading}>
            {intl.get('hzero.common.button.historyVerison').d('历史版本')}
            <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
          </Button>
        </Dropdown>
      ),
    },
    {
      name: 'operation',
      btnComp: PerButton,
      child: intl.get('hzero.common.button.operating').d('操作记录'),
      btnProps: {
        loading,
        icon: 'operation_service_request',
        type: 'c7n-pro',
        funcType: 'flat',
        hidden: isCreat,
        onClick: () => handleOperate(),
      },
    },
    {
      name: 'approval',
      hidden: isEmpty(approvalMap) || isPub,
      child: intl.get('hzero.common.button.approval').d('审批'),
      btnProps: {
        funcType: 'flat',
        icon: 'authorize',
        onClick: () =>
          handleApprove({
            approveProps: {
              ...approvalBtnProps,
              onSuccess: handleQuery,
            },
          }),
      },
    },
    {
      name: 'revokeApproval',
      hidden: isEmpty(revokeMap) || isPub,
      child: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
      btnProps: {
        funcType: 'flat',
        icon: 'reply',
        onClick: () =>
          handleRevokeApprova({
            businessKey: newBusinessKey,
            onSuccess: handleQuery,
          }),
      },
    },
  ];

  // 操作记录
  const handleOperate = () => {
    operationRecordsModal({
      quotaHeaderId,
      documentId: quotaHeaderId,
      documentType: 'QUOTA_APPLICATION',
    });
  };

  const headerBtnRemoteProps = {
    source,
    loading,
    dispatch,
    basicsDs,
    setLoading,
    onQuery: handleQuery,
  };

  // 标题
  const title = isCreat
    ? getHeaderTitle('create', source)
    : isEdit
    ? getHeaderTitle('edit', source)
    : getHeaderTitle('view', source, versionNum);

  // 详情页历史版本返回时传参
  const search = querystring.stringify({
    type: 'view',
    source: 'masterData',
    entranceSource,
    sourceQuotaHeaderId,
  });
  /**
   * 根据来源页面，返回列表页
   * application: 来源是申请单，跳转回申请单列表
   * masterData: 来源是主数据，跳转回主数据列表
   * masterDataVersion：来源是主数据列表历史版本，跳转回主数据列表
   * masterDataDetailVersion：来源是主数据详情页历史版本，根据入口页面来源判断返回页面
   * */
  const backPathPafe = {
    application: '/sslm/supplier-quota-application/list',
    masterData: '/sslm/supplier-quota-master-data/list',
    masterDataVersion: '/sslm/supplier-quota-master-data/list',
    masterDataDetailVersion: ['masterDataVersion'].includes(entranceSource)
      ? '/sslm/supplier-quota-master-data/list'
      : `/sslm/supplier-quota-master-data/detail/${sourceQuotaHeaderId}?${search}`,
  };
  const backPath = isPub
    ? ''
    : source
    ? backPathPafe[`${source}`]
    : '/sslm/supplier-quota-application/list';
  return (
    <Fragment>
      <Header title={title} backPath={backPath}>
        {customizeBtnGroup(
          {
            code: 'SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.HEADER_BTN',
            pro: true,
          },
          <DynamicButtons
            buttons={buttons}
            defaultBtnType="c7n-pro"
            custLoading={custLoading}
            permissions={permissionList}
          />
        )}
        {supQuotaApplicationRemote.render(
          'SSLM_SUP_QUOTA_APPLICATION_DEFINITION_HEADER_BTNS',
          null,
          headerBtnRemoteProps
        )}
      </Header>
      <Content style={{ padding: 0, margin: 0, backgroundColor: 'rgba(0,0,0,0)' }}>
        <Spin spinning={spinning || loading}>
          <div className={styles['card-wrap']} style={{ marginBottom: 8 }}>
            <Content>
              <Card
                id="baseInfo"
                bordered={false}
                style={isCreat ? { minHeight: `calc(100vh - 192px)` } : {}}
              >
                <div className={styles['card-title']}>
                  {intl.get('sslm.supplierQuotaManage.view.message.basicInfo').d('基础信息')}
                </div>
                <HeaderInfo
                  dataSet={basicsDs}
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                  remote={supQuotaApplicationRemote}
                  customizeUnitCode="SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.BASIC"
                  isEdit={isEdit}
                  source={source}
                  basicsInfo={basicsInfo}
                />
              </Card>
            </Content>
            {!isCreat && (
              <Content>
                <Card id="baseInfo" bordered={false}>
                  <div className={styles['card-title']}>
                    {intl.get('sslm.supplierQuotaManage.view.message.auotaAsign').d('配额分配')}
                  </div>
                  <QuotaAllocationInfo
                    isEdit={isEdit}
                    source={source}
                    dataSet={quotaAllocationDs}
                    customizeTable={customizeTable}
                    customizeUnitCode="SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.AUOTA_ASIGNS"
                    customizeBtnGroupCode="SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.AUOTA_ASIGNS_BTN"
                    custLoading={custLoading}
                    remote={supQuotaApplicationRemote}
                  />
                </Card>
              </Content>
            )}
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplierQuotaApplication', 'sslm.supplierQuotaManage'],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.HEADER_BTN', // 头按钮
      'SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.AUOTA_ASIGNS_BTN', // 配额分配-行按钮
      'SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.BASIC', // 基础信息
      'SSLM.SUP_QUOTA_APPLICATIONS_DETAIL.AUOTA_ASIGNS', // 配额分配信息
    ],
  }),
  remote(
    {
      code: 'SSLM_SUP_QUOTA_APPLICATION_DEFINITION', // 对应二开模块暴露的Expose的编码
      name: 'supQuotaApplicationRemote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        cuxHandleSave() {},
        cuxHandleSubmit() {},
      },
    }
  )
)(Detail);
