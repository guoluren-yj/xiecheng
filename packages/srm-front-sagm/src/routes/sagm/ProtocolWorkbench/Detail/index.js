import React, { Fragment, useState, useEffect, useMemo } from 'react';
import qs from 'qs';
import { throttle, flowRight } from 'lodash';
import { DataSet, Button, Attachment, Tooltip, Form } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';
import { queryUUID } from 'hzero-front/lib/services/api';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { openApproveModal } from '_components/ApproveModal';
import remoteFunc from 'hzero-front/lib/utils/remote';

import { getPriceInfo } from '@/services/mallProtocolManagementService';
import { agreementApprove, agreementReject } from '@/services/mallAgreementApproveService';
import AnchorPro from '@/components/AnchorPro';
import { DropdownBtns, DropdownBtn } from '@/components/CommonButtons';
import HistoryPop from '@/components/HistoryPop';
import { openTextArea } from '@/utils/modals';
import { confirmBefore } from '@/utils/c7nModal';
import { openRecordTabs } from '@/utils/drawer/commonDrawer';
import { tableDs as authorityDs } from '@/routes/sagm/ProductAuthorityNew/ds';

import { AgreeAuthorityContext } from '../context';
import agmHeaderRender from '../component/Record/agmHeader';
import BaseInfo from './BaseInfo';
import AgreementLine from './AgreementLine';
import Authority from './Authority';
import HeadButton from '../component/HeadButton';
import { fetchAgreementHistory } from '../api';
import { baseInfoDs, lineDs } from './ds';
// import { tableDs as authorityDs } from '../../ProductAuthority/ds';
import { workBenchFormUnitCode } from '../../const/uniCode';
import {
  handleSave,
  handleSubmit,
  handleTerminate,
  handleUpgrade,
  handlePublish,
  handleDelete,
} from './agmHeaderFuncs';
import { handleRevokeApprove } from '../../commonUtils';

import styles from './style.less';

export const SubContent = (props) => {
  const { id, title, icon, showDivide, children, style, hasSubTitle } = props;
  return (
    <>
      {showDivide && <div className={styles['content-divide']} />}
      <div id={id} className={`${styles['sub-content-container']}`} style={style}>
        <div className="sub-content-header" id={id}>
          <span>{title}</span>
          {icon && (
            <Tooltip
              placement="topRight"
              title={intl
                .get('sagm.common.view.editAfterDelayMsg')
                .d('编辑权限后商品更新会存在一定延迟，可能会短暂影响搜索结果')}
            >
              <Icon type={icon} />
            </Tooltip>
          )}
        </div>
        <div className="sub-content-body" style={{ paddingTop: hasSubTitle ? 8 : 16 }}>
          {children}
        </div>
      </div>
    </>
  );
};

const isJson = (res) => {
  let result;
  try {
    result = JSON.parse(res);
  } catch (e) {
    return false;
  }
  return typeof result === 'object' && typeof result !== 'string';
};

function Detail(props) {
  const {
    history: { push },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    match: { params: { status } = {}, path = '' },
    location: { search, state: { quoteData } = {} },
    remote,
  } = props;
  // quoteType: 引用价格库跳转
  // sourceType， 工作台内部跳转，判断个性化code 历史协议（只读） || 普通协议（可读可写） （个性化不同）
  const {
    agreementId = '',
    backPath,
    sourceType,
    quoteType,
    versionNum,
    wflApproveFlag,
    wflRevokeApproveFlag,
    taskId,
    processInstanceId,
    businessKey,
  } = qs.parse(search.substr(1));
  const isHistory = sourceType === 'history';
  // const backBath = `/sagm/sagm-protocol-workbench/list`;

  const [
    {
      sourceFrom,
      companyId,
      companyName,
      agreementStatus = '',
      supplierCompanyId,
      supplierCompanyName,
      supplierTenantId,
      agreementId: agmId,
      agreementNumber,
    },
    setHeaderInfo,
  ] = useState({
    agreementId,
  });
  const [readOnly, setReadOnly] = useState(false);
  const [priceRule, setPriceRule] = useState(false);
  // 基本信息
  const headerDs = useMemo(() => new DataSet(baseInfoDs({ isHistory })), [sourceType]);
  // 协议行
  const agmTableDs = useMemo(() => {
    const ds = new DataSet(lineDs(sourceFrom === 'PRICE', isHistory));
    return ds;
  }, [sourceType, sourceFrom]);

  const authoTableDs = useMemo(() => {
    const ds = new DataSet(authorityDs());
    return ds;
  }, []);

  useEffect(() => {
    let _readOnly = agmId ? status === 'read' : false;
    if (agreementStatus && agreementStatus !== 'NEW') {
      _readOnly = true;
    }
    const code = _readOnly
      ? isHistory
        ? workBenchFormUnitCode.history
        : workBenchFormUnitCode.view
      : workBenchFormUnitCode.edit;
    if (headerDs) {
      headerDs.setQueryParameter('customizeUnitCode', code);
    }

    setReadOnly(_readOnly);
  }, [status, agmId, agreementStatus, isHistory]);

  useEffect(() => {
    // 查看 和 编辑
    if (agreementId && !quoteType) {
      initData();
    }
    // 引用价格库创建的协议
    if (quoteType && quoteData && quoteData.length > 0) {
      initPriceData();
      // 创建协议行
      handleFromPrice(quoteData);
    }
  }, [agreementId, status, sourceType, sourceFrom]);

  useEffect(() => {
    if (companyId && supplierCompanyId) {
      getPriceRule();
    }
  }, [companyId, supplierCompanyId]);

  async function initData() {
    headerDs.setQueryParameter('agreementId', agreementId);
    if (isHistory) headerDs.setQueryParameter('versionNum', versionNum);
    const res = await headerDs.query();
    if (res && headerDs.current) {
      const data = headerDs.current.get([
        'agreementStatus',
        'supplierTenantId',
        'agreementId',
        'agreementNumber',
        'sourceFrom',
        'companyId',
        'companyName',
        'supplierCompanyId',
        'supplierCompanyName',
        'uuid',
      ]);
      const { agreementId: initAgreementId, uuid } = data;
      if (isHistory) {
        agmTableDs.setQueryParameter(
          'customizeUnitCode',
          `SAGM.WORKBENCH.AGREEMENT_LINE,${
            data.sourceFrom === 'PRICE'
              ? 'SMAL.AGREEMENT_MANAGEMENT.PRICE_LIB_LINE_HISTORY'
              : 'SMAL.AGREEMENT_MANAGEMENT.MANUAL_LINE_HISTORY'
          }`
        );
      } else {
        agmTableDs.setQueryParameter(
          'customizeUnitCode',
          `SAGM.WORKBENCH.AGREEMENT_LINE,${
            data.sourceFrom === 'PRICE'
              ? 'SAGM.WORKBENCH.MAIN.LINE.PRICE_LIB_NEW'
              : 'SAGM.WORKBENCH.MAIN.LINE.MANUAL_NEW'
          }`
        );
      }
      setHeaderInfo((prev) => ({ ...prev, ...data }));
      if (initAgreementId && !uuid) {
        // 第一次上传附件需要获取一个uuid
        getAttachmentUUID();
      }
    }
    // 历史协议
    if (isHistory) {
      agmTableDs.setQueryParameter('versionNum', versionNum);
    }
    agmTableDs.setQueryParameter('agreementId', agreementId);
    agmTableDs.setQueryParameter('deleteFlag', agreementStatus === 'DELETED' ? 1 : 0);
    await agmTableDs.query(agmTableDs.currentPage);
  }

  function initPriceData() {
    const initPriceForm = {
      companyId: quoteData[0].companyId,
      companyName: quoteData[0].companyName,
      supplierCompanyId: quoteData[0].supplierCompanyId,
      supplierTenantId: quoteData[0].supplierTenantId,
      supplierCompanyName: quoteData[0].supplierCompanyName,
      sourceFrom: quoteType === 'price' ? 'PRICE' : 'PUR',
      sourceFromNumber:
        quoteType === 'price' ? quoteData[0].matchId : quoteData[0].agreementProductMatchId,
    };
    // 不能用 loadData，无法校验, 删除初始数据，否则校验时有两条
    headerDs.removeAll();
    headerDs.create(initPriceForm);
    // initSupplierTenantId = quoteData[0].supplierTenantId;
    setHeaderInfo((prev) => ({ ...prev, ...initPriceForm }));
  }

  async function getAttachmentUUID() {
    const res = getResponse(
      await queryUUID({
        tenantId: getCurrentOrganizationId(),
      })
    );
    if (res) {
      headerDs.current.set('uuid', res.content);
    }
  }

  function handleFromPrice(line = []) {
    if (agmTableDs && line.length > 0) {
      line.forEach((item) => {
        agmTableDs.create(item, 0);
      });
    }
  }

  async function getPriceRule() {
    const response = getResponse(await getPriceInfo({ companyId, supplierCompanyId }));
    if (response) {
      if (isJson(response) && JSON.parse(response).failed) {
        notification.error({ message: JSON.parse(response).message });
        return false;
      }
      // 根据价格规则判断协议价格（含税||未税）的可编辑性
      setPriceRule(response);
    }
  }

  function handleSupplierChange(data) {
    setHeaderInfo((prev) => ({ ...prev, supplierTenantId: data?.supplierTenantId }));
  }

  function backToOriginTab() {
    push(`/sagm/sagm-protocol-workbench/list`);
  }

  async function refreshData(res) {
    if (!agreementId) {
      push(`/sagm/sagm-protocol-workbench/detail/edit?agreementId=${res?.agreementId}`);
    } else {
      headerDs.query();
      await agmTableDs.query(agmTableDs.currentPage);
      // 触发查询数据校验 - 区域
      agmTableDs.forEach((r) => {
        Object.assign(r, { status: 'add' });
      });
      authoTableDs.query(authorityDs.currentPage);
    }
  }

  /**
   * 审批通过
   */
  const handleAgreementApprove = async () => {
    const data = headerDs.current.toJSONData();
    headerDs.status = 'loading';
    const res = getResponse(await agreementApprove([data]));
    headerDs.status = 'ready';
    if (res) {
      notification.success();
      backToOriginTab();
    }
  };

  /**
   * 审批拒绝
   */
  const handleApproveReject = () => {
    const data = headerDs.current.toJSONData();
    openTextArea({
      title: intl.get('small.common.view.approveReject').d('审批拒绝'),
      name: 'rejectRemark',
      maxLength: 100,
      label: intl.get('small.common.view.rejectReason').d('拒绝原因'),
      onOk: (param) => {
        headerDs.status = 'loading';
        return agreementReject([{ ...data, ...param }]).then((res) => {
          headerDs.status = 'ready';
          if (res) {
            notification.success();
            backToOriginTab();
          }
        });
      },
    });
  };

  function callBackTerminate() {
    initData();
  }

  function callBackUpgrade(res) {
    const { agreementId: _id } = res;
    push(`/sagm/sagm-protocol-workbench/detail/edit?agreementId=${_id}`);
    initData();
    agmTableDs.query();
  }

  function viewOperateRecord(record) {
    const _id = record.get('agreementId');
    // 操作记录
    openRecordTabs({
      haswFlow: record.get('agreementStatus') === 'APPROVING',
      headerRecord: record,
      operateArg: {
        url: `/sagm/v1/${getCurrentOrganizationId()}/agreement-records/${_id}`,
        queryParams: {
          agreementId,
        },
        operateRenderer: agmHeaderRender,
      },
    });
  }

  const recordCallBack = (aId, vNum) => {
    push(
      `/sagm/sagm-protocol-workbench/detail/read?agreementId=${aId}&sourceType=history&versionNum=${vNum}`
    );
  };

  // 标题
  const title = agmId
    ? readOnly
      ? intl.get('small.common.view.agreement.detail').d('查看协议详情')
      : intl.get('small.mallProtocolManagement.view.agreement.editProtocol').d('编辑协议')
    : intl.get('small.mallProtocolManagement.view.agreement.create').d('新建协议');

  const headerBtns = useMemo(() => {
    const _path = path.split('/', 3).join('/');
    const btnColorProps = agreementId ? { funcType: 'flat' } : { color: 'primary' };
    const btns = [
      {
        name: 'wflApprove',
        show: +wflApproveFlag,
        btnText: intl.get('hzero.common.button.approval').d('审批'),
        btnProps: {
          icon: 'authorize',
          color: 'primary',
          onClick: () => {
            openApproveModal({
              modalProps: {
                closable: true,
              },
              taskId,
              processInstanceId,
              onSuccess: () => {
                backToOriginTab();
              },
            });
          },
        },
      },
      {
        name: 'wflRevokeApprove',
        show: +wflRevokeApproveFlag,
        btnText: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
        btnProps: {
          funcType: 'flat',
          icon: 'reply',
          onClick: () => {
            handleRevokeApprove(businessKey, () => backToOriginTab());
          },
        },
      },
      {
        name: 'submit',
        btnText: intl.get('hzero.common.button.submit').d('提交'),
        show: agreementStatus === 'NEW',
        btnComp: HeadButton,
        bindBtns: ['save'],
        dataSet: agmTableDs,
        getDisabled: (ds) => !agreementId || ds.length === 0,
        btnProps: {
          icon: 'check',
          color: 'primary',
          onClick: throttle(
            () => handleSubmit({ headerDs, priceRule, lineDs: agmTableDs }, backToOriginTab),
            1000
          ),
        },
      },
      {
        name: 'save',
        btnText: intl.get('hzero.common.button.save').d('保存'),
        show: !readOnly && (agreementStatus === 'NEW' || !agmId),
        btnComp: HeadButton,
        bindBtns: ['submit'],
        dataSet: agmTableDs,
        getDisabled: () => false,
        btnProps: {
          icon: 'save',
          ...btnColorProps,
          onClick: throttle(
            () => handleSave({ headerDs, priceRule, lineDs: agmTableDs }, refreshData),
            1000
          ),
        },
      },
      // 权限控制
      {
        name: 'publish',
        btnText: intl.get('hzero.common.button.publish').d('发布'),
        show: agreementStatus === 'APPROVED',
        btnComp: HeadButton,
        permission: true,
        permissionList: [
          {
            code: `${_path}.button.operate.publish`,
            type: 'button',
            meaning: '协议工作台 -发布',
          },
        ],
        btnProps: {
          icon: '',
          type: 'c7n-pro',
          color: 'primary',
          onClick: throttle(() => handlePublish(headerDs, backToOriginTab), 1000),
        },
      },
      {
        name: 'upgrade',
        btnText: intl.get('small.mallProtocolManagement.model.agreement.change').d('协议变更'),
        show: ['APPROVED', 'REJECT', 'DISABLED', 'PUBLISHED', 'TERMINATED'].includes(
          agreementStatus
        ),
        btnProps: {
          icon: 'mode_edit',
          color: agreementStatus === 'APPROVED' ? '' : 'primary',
          onClick: () =>
            confirmBefore({
              title: intl.get('small.mallProtocolManagement.model.agreement.change').d('协议变更'),
              type: 'warning',
              message:
                agreementStatus === 'PUBLISHED'
                  ? intl
                      .get('sagm.common.view.confirm.upgradeInfo1')
                      .d('此操作会终止当前协议并生成新版本，请谨慎操作')
                  : intl
                      .get('sagm.common.view.confirm.upgradeInfo2')
                      .d('此操作会生成新版本，请谨慎操作'),
              field: {
                reasonName: 'remark',
                reasonLabel: intl.get('sagm.common.view.confirm.upgradeReason').d('变更原因'),
              },
              customizeForm,
              customizeCode: 'SAGM.WORKBENCH.LINE.UPGRADE_OR_TERMINATE.FORM',
              customFunc: (paramData) => handleUpgrade(headerDs, callBackUpgrade, paramData),
            }),
        },
      },
      {
        name: 'terminate',
        btnText: intl.get('small.mallProtocolManagement.view.agreement.terminate').d('协议终止'),
        show: agreementStatus === 'PUBLISHED',
        btnProps: {
          icon: 'not_interested',
          funcType: 'flat',
          onClick: () =>
            confirmBefore({
              title: intl
                .get('small.mallProtocolManagement.view.agreement.terminate')
                .d('协议终止'),
              type: 'warning',
              message: intl
                .get('sagm.common.view.confirm.terminateInfo')
                .d('此操作会下架该协议内商品，请谨慎操作'),
              field: {
                reasonName: 'remark',
                reasonLabel: intl.get('sagm.common.view.confirm.terminateReason').d('终止原因'),
              },
              customizeForm,
              customizeCode: 'SAGM.WORKBENCH.LINE.UPGRADE_OR_TERMINATE.FORM',
              customFunc: (paramData) => handleTerminate(headerDs, callBackTerminate, paramData),
            }),
        },
      },
      {
        name: 'approved',
        btnComp: HeadButton,
        btnText: intl.get('sagm.common.view.button.approvePass').d('审批通过'),
        show: agreementStatus === 'SUBMITTED',
        permission: true,
        permissionList: [
          {
            code: `${_path}.button.operate.approve`,
            type: 'button',
            meaning: '协议工作台 -审批',
          },
        ],
        btnProps: {
          icon: 'check_circle',
          onClick: handleAgreementApprove,
          color: 'primary',
          type: 'c7n-pro',
        },
      },
      {
        name: 'reject',
        btnComp: HeadButton,
        btnText: intl.get('sagm.common.view.button.approveReject').d('审批拒绝'),
        show: agreementStatus === 'SUBMITTED',
        permission: true,
        permissionList: [
          {
            code: `${_path}.button.operate.approve`,
            type: 'button',
            meaning: '协议工作台 -审批',
          },
        ],
        btnProps: {
          icon: 'cancel',
          onClick: handleApproveReject,
          funcType: 'flat',
          type: 'c7n-pro',
        },
      },
      {
        name: 'edit',
        btnText: intl.get('hzero.common.button.edit').d('编辑'),
        show: readOnly && agreementStatus === 'NEW',
        btnProps: {
          icon: 'mode_edit',
          funcType: 'flat',
          onClick: () =>
            push(
              `/sagm/sagm-protocol-workbench/detail/edit?agreementId=${agmId}&versionNum=${versionNum}`
            ),
        },
      },
      {
        name: 'records',
        btnText: intl.get('hzero.common.button.record').d('操作记录'),
        show: sourceType !== 'history' && agmId,
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: () => viewOperateRecord(headerDs.current),
        },
      },
      {
        name: 'history',
        btnComp: () => (
          <HistoryPop
            icon="schedule"
            btnText={intl.get('sagm.common.model.historyVersion').d('历史版本')}
            fetchApi={fetchAgreementHistory}
            resKey="none"
            field={{
              accountNo: 'submitBy',
              submitDate: 'submitDate',
            }}
            params={{
              agreementId,
              page: 0,
              size: 100, // 之前接口是有分页的，pop模式无， 100模拟全部页数据，足够用
            }}
            onItemClick={({ agreementId, versionNum }) => recordCallBack(agreementId, versionNum)}
          />
        ),
        show: agmId && versionNum > 1,
      },
      {
        name: 'delete',
        btnText: intl.get('hzero.common.button.delete').d('删除'),
        show: agmId && (agreementStatus === 'NEW' || agreementStatus === 'REJECT'),
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          onClick: () => handleDelete(headerDs, backToOriginTab),
        },
      },
    ];
    const cuxBtns = remote.process('SAGM_PROTOCOL_WORKBENCH_DETAIL_BUTTONS', btns);
    const showBtns = cuxBtns.filter((f) => f.show || !('show' in f));
    const showMore = showBtns.length > 5;
    const nomalBtns = showBtns.slice(0, showMore ? 4 : 5).map((f) => {
      const { name, bindBtns = [], btnText, btnComp, btnProps = {}, ...other } = f;
      const Btn = btnComp || Button;
      return (
        <Btn {...btnProps} name={name} bindBtns={bindBtns} {...other}>
          {btnText}
        </Btn>
      );
    });
    if (!showMore) {
      return nomalBtns;
    }
    const moreBtn = (
      <DropdownBtns
        placement="left"
        menus={showBtns.slice(4).map((m) => ({
          text: m.btnText,
          event: m.btnProps?.onClick,
        }))}
      >
        <DropdownBtn icon="more_horiz" hiddenIcon funcType="flat" />
      </DropdownBtns>
    );
    return [...nomalBtns, moreBtn];
  }, [agmId, agreementStatus, agmTableDs, sourceType, readOnly, priceRule]);

  // const _backPath = isHistory
  //   ? '/sagm/sagm-protocol-workbench/history'
  //   : '/sagm/sagm-protocol-workbench/list';

  // 内容区域
  const contents = [
    {
      id: 'sagm_workbench_base',
      title: intl.get('small.common.view.baseInfo').d('基本信息'),
    },
    {
      id: 'sagm_workbench_agreement_line',
      title: intl.get('small.mallProtocolManagement.view.agreementLine').d('协议行'),
    },
    {
      id: 'sagm_workbench_authority',
      title: intl.get('sagm.common.view.buyPermisson').d('采买权限'),
      show: !isHistory,
    },
    {
      id: 'sagm_workbench_attachment',
      title: intl.get('hzero.common.view.title.attachment').d('附件'),
    },
  ].filter((f) => f.show || !('show' in f));

  return (
    <Fragment>
      <Header title={title} backPath={backPath || '/sagm/sagm-protocol-workbench/list'}>
        {isHistory ? null : headerBtns}
      </Header>
      <Content className={styles['sagm-workbench-detail']}>
        <SubContent
          id="sagm_workbench_base"
          title={intl.get('small.common.view.baseInfo').d('基本信息')}
        >
          <BaseInfo
            dataSet={headerDs}
            customizeForm={customizeForm}
            readOnly={readOnly}
            onSupplierChange={handleSupplierChange}
            // sourceType={sourceType}
            isHistory={isHistory}
          />
        </SubContent>
        {(agmId || quoteType === 'price') && (
          <SubContent
            id="sagm_workbench_agreement_line"
            title={intl.get('small.mallProtocolManagement.view.agreementLine').d('协议行')}
            showDivide
          >
            <AgreementLine
              dataSet={agmTableDs}
              authorityDataSet={authoTableDs}
              path={path}
              readOnly={readOnly}
              customizeTable={customizeTable}
              customizeBtnGroup={customizeBtnGroup}
              agreementStatus={agreementStatus}
              agreementId={agmId}
              priceRule={priceRule}
              sourceFrom={sourceFrom}
              supplierTenantId={supplierTenantId}
              isHistory={isHistory}
              priceLibParams={{
                companyId,
                companyName,
                supplierCompanyId,
                supplierCompanyName,
              }}
            />
          </SubContent>
        )}
        {!isHistory && agmId && (
          <SubContent
            id="sagm_workbench_authority"
            // icon="help"
            hasSubTitle={!readOnly}
            showDivide
            title={intl.get('sagm.common.view.buyPermisson').d('采买权限')}
          >
            <AgreeAuthorityContext.Provider value={{ __sourceFrom: 'agreement' }}>
              <Authority
                readOnly={readOnly}
                dataSet={authoTableDs}
                agreementHeaderId={agmId}
                agreementHeaderNum={agreementNumber}
                agreementType="PUR_AGREEMENT"
                deleteFlag={agreementStatus === 'DELETED' ? 1 : 0}
                viewSkuBackPath={`/sagm/sagm-protocol-workbench/detail/edit?agreementId=${agreementId}`}
              />
            </AgreeAuthorityContext.Provider>
          </SubContent>
        )}
        {agmId && (
          <SubContent
            id="sagm_workbench_attachment"
            showDivide
            title={intl.get('hzero.common.view.title.attachment').d('附件')}
          >
            {customizeForm(
              {
                code: workBenchFormUnitCode.attachment,
                readOnly:
                  ['SUBMITTED', 'APPROVED', 'PUBLISHED', 'TERMINATED'].includes(agreementStatus) ||
                  (readOnly && agreementStatus === 'NEW'),
              },
              <Form dataSet={headerDs} style={{ width: '50%' }} labelLayout="float">
                <Attachment
                  name="uuid"
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="small-protocol-manage"
                  accept={['.rar', '.zip', '.doc', '.docx', '.pdf', 'image/*']}
                  help={intl
                    .get('hzero.common.view.title.enableFile')
                    .d('支持文件类型： .rar .zip .doc .docx .pdf image/*')}
                  readOnly={
                    isHistory ||
                    ['SUBMITTED', 'APPROVED', 'PUBLISHED', 'TERMINATED', 'DELETED'].includes(
                      agreementStatus
                    ) ||
                    (readOnly && agreementStatus === 'NEW')
                  }
                />
              </Form>
            )}
          </SubContent>
        )}
      </Content>
      {/* 取父容器 */}
      {readOnly && (
        <AnchorPro
          list={contents}
          container={document.querySelector(`.${styles['sagm-workbench-detail']}`?.parentNode)}
        />
      )}
    </Fragment>
  );
}

export default flowRight(
  remoteFunc({
    code: 'SAGM_PROTOCOL_WORKBENCH_DETAIL',
    name: 'remote',
  }),
  formatterCollections({
    code: [
      'sagm.common',
      'small.common',
      'small.mallProtocolManagement',
      'hzero.common',
      'sagm.protocolManagement',
    ],
  }),
  withCustomize({
    unitCode: [
      workBenchFormUnitCode.edit,
      workBenchFormUnitCode.view,
      workBenchFormUnitCode.history,
      workBenchFormUnitCode.attachment,
      workBenchFormUnitCode.lib_line,
      workBenchFormUnitCode.manual_line,
      workBenchFormUnitCode.line_btns,
      'SAGM.WORKBENCH.LINE.UPGRADE_OR_TERMINATE.FORM',
    ],
  })
)(Detail);
