import { Modal, Attachment, DataSet, Form } from 'choerodon-ui/pro';
import React, { Fragment, useState, useEffect, useRef, useMemo } from 'react'; // useEffect
import intl from 'utils/intl';
import { Spin as ChoerodonSpin } from 'choerodon-ui';
import classnames from 'classnames';
import { Header, Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';
import { observer } from 'mobx-react-lite';
import {
  // getCurrentOrganizationId,
  // getCurrentTenant,
  getResponse,
} from 'utils/utils';
import querystring from 'querystring';
import { compose, isFunction } from 'lodash';
import uuid from 'uuid/v4';
import cuxRemote from 'hzero-front/lib/utils/remote';
import notification from 'utils/notification';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import injectGuide from 'srm-front-boot/lib/components/Guide/injectGuideList';
// import { Button } from 'components/Permission';

import formatterCollections from 'utils/intl/formatterCollections';
import { notifyValidErrors } from '@/utils/utils';
import { queryDetail, save, singleSubmit, deleteHeader } from '@/services/RequisitionPlanServices';
import maintainStyles from '../index.less';
import Base from './BaseEdit.js';
import PurchaseLineEdit from './DemandLineEdit.js';
import PurchaseOrgInfo from './PurchaseOrgInfoEdit.js';
import Anchor from '../components/Anchor';
import OperationRecord from '../components/OperationHistory';
import { attachmentDs } from '../indexDS';
// const commonPrompt = 'srpm.common.model.common';

const config = () => {
  return [
    {
      // 该向导组是否启用
      enable: true,
      // 向导组编码
      code: 'SRPM_BATCH_EDIT', // COMMON_IMPORT_EXPORT
      // 向导组类型
      type: 'strong',
      // 向导组优先级，在多个向导同时满足条件时，数值大的优先显示
      priority: 0,
      // 版本，每次向导配置变更时，版本号+1，约定为数字
      version: 1,
      // 向导标题，暂未使用该属性
      title: '批量维护',
      // 延时，在满足条件后多少毫秒显示弹窗，解决部分页面向导元素有过渡效果的问题
      delay: 3000,
      // 是否为可选步骤，当该选项为true时，向导组内的各步骤遵循哪一步满足条件哪一步显示，直到整个向导组均已被阅读过为止
      optionalSteps: true,
      steps: [
        {
          selector: '.srpm-batchedit-modal',
          title: '批量维护',
          htmlText:
            '1.可在个性化中配置批量编辑字段 <br /> 2.不支持物料编码、物料名称、物料分类、单位字段的批量编辑',
          //   preview:
          //     "<img width='228px' height='auto' src='https://isrm-pro-public-bucket.obs.cn-east-2.myhuaweicloud.com/0/d58cd641c3794c45b0245cc57baa5ef7@%E8%81%9A%E5%85%89%E7%81%AF-%E5%AF%BC%E5%87%BA.gif' />",
          placement: 'bottom-left',
        },
      ],
    },
  ];
};

const Index = ({
  history,
  match,
  location,
  customizeTable,
  customizeForm,
  custLoading,
  remote,
}) => {
  const backFlag = querystring.parse(location.search.substr(1))?.back;
  injectGuide(`/srpm/requisition-plan/edit/:id`, config);
  const [rpHeaderId] = useState(match.params?.id);
  const lineRef = useRef({});
  const baseRef = useRef({});
  const purchaseOrgInfoRef = useRef({});
  const [headerInfo, setHeaderData] = useState({ attachmentUuId: uuid() });
  const [headerLoading, setHeaderLoad] = useState(false);
  const [sourcePlatformObj, setPrSourcePlatform] = useState({ rpSourcePlatform: 'REQUEST_PLAN' });
  const attachDs = useMemo(() => new DataSet(attachmentDs()), []);
  const { handleLineDsUpdate } = remote?.props?.process ?? {};

  useEffect(() => {
    if (rpHeaderId) {
      commonUpdate(rpHeaderId);
    } else {
      setHeaderData({
        attachmentUuId: uuid(),
      });
      attachDs.loadData([]);
      attachDs.create({}, 0);
    }
  }, [rpHeaderId]);

  useEffect(() => {
    if (remote && remote.event) {
      const headerDs = baseRef.current?.saveCurrentData();
      console.log(headerDs);
      remote.event.fireEvent('cuxDocInit', {
        rpHeaderId,
        headerInfo,
        sourcePlatformObj,
        headerDs,
      });
    }
  }, [baseRef.current]);

  const handleDetailField = (dsName, detailField) => {
    let fieldValues = '';
    switch (dsName) {
      case 'purchaseOrgInfoRef':
        fieldValues =
          purchaseOrgInfoRef.current && isFunction(purchaseOrgInfoRef.current?.handleGetDeatial)
            ? purchaseOrgInfoRef.current?.handleGetDeatial(detailField)
            : '';
        break;
      case 'baseRef':
        fieldValues =
          baseRef.current && baseRef.current?.handleGetDeatial
            ? baseRef.current?.handleGetDeatial(detailField)
            : '';
        break;
      default:
        fieldValues = undefined;
    }
    return fieldValues;
  };

  const updateHeaderDate = (updateValue) => {
    const baseInfo = baseRef.current?.saveCurrentData();
    // eslint-disable-next-line no-unused-expressions
    baseInfo.current?.set(updateValue);
  };

  // 获取头信息
  const getHeaderInfo = () => {
    const headerDataInfo = {};
    const base = baseRef.current?.saveCurrentData();
    const purchaseOrg = purchaseOrgInfoRef.current?.saveCurrentData();
    const baseInfoFields = base.fields.toJSON();
    const purchaseFields = purchaseOrg.fields.toJSON();
    const baseInfo = base.toData()[0];
    const purchaseOrgInfo = purchaseOrg.toData()[0];
    const attachInfo = attachDs.toData()[0];
    for (const key in baseInfoFields) {
      if ({}.hasOwnProperty.call(baseInfoFields, key)) {
        headerDataInfo[key] = baseInfo[key];
      }
    }
    for (const key in purchaseFields) {
      if ({}.hasOwnProperty.call(purchaseFields, key)) {
        headerDataInfo[key] = purchaseOrgInfo[key];
      }
    }

    return { ...attachInfo, ...headerInfo, ...headerDataInfo };
  };

  // update头行信息
  const commonUpdate = (currpHeaderId) => {
    setHeaderLoad(true);
    // 清除选中
    // eslint-disable-next-line no-unused-expressions
    lineRef.current?.saveCurrentData()?.unSelectAll();
    // eslint-disable-next-line no-unused-expressions
    lineRef.current?.saveCurrentData()?.clearCachedSelected();
    // 清除所有缓存
    // eslint-disable-next-line no-unused-expressions
    lineRef.current?.saveCurrentData()?.clearCachedRecords();
    Promise.all([
      queryDetail({
        rpHeaderId,
        customizeUnitCode:
          'SRPM.RP_PLATFORM_CREATE.BASEINFO,SRPM.RP_PLATFORM_CREATE.PURCHASEORGINFO,SRPM.RP_PLATFORM_CREATE.ATTACHMENT,SRPM.RP_PLATFORM_CREATE.EXTERNALFILE',
      }),
      lineRef.current?.loadLineDate(rpHeaderId || currpHeaderId),
    ])
      .then(([res1]) => {
        if (getResponse(res1)) {
          const { rpSourcePlatform, rpStatus, attachmentUuid, externalAttachmentUuid } = res1;
          setPrSourcePlatform({ rpSourcePlatform, rpStatus });
          setHeaderData(res1);
          // eslint-disable-next-line no-unused-expressions
          baseRef.current?.loadCurrentData(res1);
          // eslint-disable-next-line no-unused-expressions
          purchaseOrgInfoRef.current?.loadCurrentData(res1);
          attachDs.loadData([{ ...res1, attachmentUuid, externalAttachmentUuid }]);
          const base = baseRef.current?.saveCurrentData();
          const lineDs = lineRef.current?.saveCurrentData();
          remote.event.fireEvent('handleUpdateEvent', { attachDs, headerDs: base, lineDs });
        }
      })
      .finally(() => {
        setTimeout(() => {
          setHeaderLoad(false);
        }, 100);
      });
  };

  const handleLineUpdate = (changeItem) => {
    const lineDs = lineRef.current?.saveCurrentData ? lineRef.current?.saveCurrentData() : null;
    lineDs.forEach((record) => record.set(changeItem));
  };

  const currentAnchorContainer = () =>
    document.getElementsByClassName('sprm-creation')[0] || document.body;

  // 保存接口
  const handleSave = async () => {
    const baseInfo = baseRef.current?.saveCurrentData();
    const purchaseOrgInfo = purchaseOrgInfoRef.current?.saveCurrentData();
    const rpLineListDs = lineRef.current?.saveCurrentData();
    const baseFlag = await baseInfo.validate();
    const purchaseOrgInfoFlag = await purchaseOrgInfo.validate();
    const rpLineListFlag = await rpLineListDs.validate();
    const attachInfoFlag = await attachDs.validate();
    const attachInfo = attachDs.toData()[0];
    if (baseFlag && purchaseOrgInfoFlag && rpLineListFlag && attachInfoFlag) {
      const currentHeaderInfo = getHeaderInfo();
      const rpLineList = rpLineListDs.toData();
      setHeaderLoad(true);
      const saveParams =
        remote.process('handleCuxSaveParams', {}, { headerDs: baseInfo, lineDs: rpLineListDs }) ||
        {};
      save({
        ...attachInfo,
        ...currentHeaderInfo,
        rpLineList,
        ...(saveParams || {}),
        customizeUnitCode:
          'SRPM.RP_PLATFORM_CREATE.BASEINFO,SRPM.RP_PLATFORM_CREATE.PURCHASEORGINFO,SRPM.RP_PLATFORM_CREATE.LINEINFO,SRPM.RP_PLATFORM_CREATE.ATTACHMENT,SRPM.RP_PLATFORM_CREATE.EXTERNALFILE',
      }).then((res) => {
        if (res && !res?.failed) {
          if (!rpHeaderId) {
            history.push(`/srpm/requisition-plan/edit/${res.rpHeaderId}`);
          } else {
            commonUpdate();
          }
        } else if (res.failed) {
          setHeaderLoad(false);
          notification.error({ message: res.message });
        }
      });
    } else {
      notifyValidErrors([
        baseRef.current?.ds,
        purchaseOrgInfoRef.current?.ds,
        lineRef.current?.ds,
        attachDs,
      ]);
      setHeaderLoad(false);
    }
  };

  const handleSubmit = async () => {
    const baseInfo = baseRef.current?.saveCurrentData();
    const purchaseOrgInfo = purchaseOrgInfoRef.current?.saveCurrentData();
    const rpLineListDs = lineRef.current?.saveCurrentData();
    const baseFlag = await baseInfo.validate();
    const purchaseOrgInfoFlag = await purchaseOrgInfo.validate();
    const rpLineListFlag = await rpLineListDs.validate();
    const attachInfoFlag = await attachDs.validate();
    const attachInfo = attachDs.toData()[0];

    if (rpLineListDs.length === 0) {
      notification.warning({
        message: intl.get('srpm.common.view.message.mustHaveLine').d('当前需求计划未维护行信息'),
      });
      setHeaderLoad(false);
      return;
    }

    if (baseFlag && purchaseOrgInfoFlag && rpLineListFlag && attachInfoFlag) {
      const currentHeaderInfo = getHeaderInfo();
      const rpLineList = rpLineListDs.toData();
      setHeaderLoad(true);
      singleSubmit({
        ...attachInfo,
        ...currentHeaderInfo,
        rpLineList,
        customizeUnitCode:
          'SRPM.RP_PLATFORM_CREATE.BASEINFO,SRPM.RP_PLATFORM_CREATE.PURCHASEORGINFO,SRPM.RP_PLATFORM_CREATE.LINEINFO,SRPM.RP_PLATFORM_CREATE.ATTACHMENT,SRPM.RP_PLATFORM_CREATE.EXTERNALFILE',
      }).then((res) => {
        if (res && !res?.failed) {
          // commonUpdate();
          notification.success();
          setHeaderLoad(false);
          history.push(`/srpm/requisition-plan/list`);
        } else if (res.failed) {
          setHeaderLoad(false);
          notification.error({ message: res.message });
        }
      });
    } else {
      notifyValidErrors([
        baseRef.current?.ds,
        purchaseOrgInfoRef.current?.ds,
        lineRef.current?.ds,
        attachDs,
      ]);
      setHeaderLoad(false);
    }
  };

  const handleDelete = async () => {
    Modal.confirm({
      bodyStyle: { padding: '20px' },
      children: (
        <p>
          {`${intl.get('srpm.common.view.message.deleteRP').d('是否确认删除需求计划单')} ${
            headerInfo?.displayRpNum
          }`}
        </p>
      ),
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
    }).then((button) => {
      if (button === 'ok') {
        setHeaderLoad(true);
        deleteHeader({ ...headerInfo }).then((res) => {
          setHeaderLoad(false);
          if (res && !res.failed) {
            history.push(`/srpm/requisition-plan/list`);
          }
        });
      }
    });
  };

  // 打开操作记录
  const handleActHistory = () => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <OperationRecord rpHeaderId={rpHeaderId} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const HeaderBtn = observer(() => {
    const headerButtons = [
      {
        name: 'submit',
        btnType: 'c7n-pro',
        hidden: !rpHeaderId,
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'raised',
          icon: 'done',
          loading: headerLoading,
          color: 'primary',
          onClick: handleSubmit,
        },
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          type: 'c7n-pro',
          loading: headerLoading,
          icon: 'save',
          color: !rpHeaderId ? 'primary' : 'default',
          funcType: !rpHeaderId ? 'raised' : 'flat',
          onClick: handleSave,
        },
      },
      {
        name: 'delete',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.delete').d('删除'),
        btnProps: {
          loading: headerLoading,
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'delete',
          disabled: !rpHeaderId,
          onClick: handleDelete,
        },
      },
    ];

    if (rpHeaderId) {
      headerButtons.push({
        name: 'operation',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.operationRecords').d('操作记录'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'assignment',
          onClick: handleActHistory,
        },
      });
    }
    const { createHeaderBtnFc } = remote?.props?.process || {};
    const baseInfo = baseRef.current?.saveCurrentData ? baseRef.current?.saveCurrentData() : null;
    const lineDs = lineRef.current?.saveCurrentData ? lineRef.current?.saveCurrentData() : null;
    if (isFunction(createHeaderBtnFc)) {
      headerButtons.push(...createHeaderBtnFc({ headerInfo, baseInfo }));
    }
    const newHeaderBtn = remote.process
      ? remote.process('cuxHeaderBtnsList', headerButtons, {
          headerDs: baseInfo,
          headerInfo,
          lineDs,
        })
      : headerButtons;

    return (
      <DynamicButtons
        buttons={newHeaderBtn}
        maxNum={5}
        defaultBtnType="c7n-pro"
        permissions={[
          { code: `hzero.srm.requirement.requisition.plan.rp-platform.ps.delete`, name: 'delete' },
          { code: `hzero.srm.requirement.requisition.plan.rp-platform.ps.save`, name: 'save' },
          { code: `hzero.srm.requirement.requisition.plan.rp-platform.ps.submit`, name: 'submit' },
        ]}
      />
    );
  }, [baseRef.current]);

  return (
    <Fragment>
      <Anchor currentAnchorContainer={currentAnchorContainer} />
      <Header
        backPath={
          backFlag === 'read'
            ? `/srpm/requisition-plan/only-read/${rpHeaderId}`
            : '/srpm/requisition-plan/list'
        }
        title={
          rpHeaderId
            ? intl.get(`srpm.common.view.title.requisitionEdit`).d('编辑需求计划提报单')
            : intl.get(`srpm.common.view.title.newRequisition`).d('新建需求计划提报单')
        }
      >
        <HeaderBtn />
      </Header>
      <div
        className={classnames(
          'ued-detail-wrapper',
          maintainStyles['update-container'],
          'sprm-creation'
        )}
        style={{ overflowY: 'auto' }}
      >
        <ChoerodonSpin spinning={headerLoading || false}>
          <div className={maintainStyles['ued-detail-container']}>
            <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
              <Content className={maintainStyles['custom-page-content']}>
                <h3
                  id="sprm-workSpace-detail-content-basicInfo"
                  className={maintainStyles['rfx-card-item-title']}
                >
                  {intl.get('srpm.common.title.baseInfo').d('基本信息')}
                </h3>
                <Base
                  remote={remote}
                  ref={baseRef}
                  custLoading={custLoading}
                  getLineDs={() => lineRef.current?.saveCurrentData()}
                  handleDetailField={handleDetailField}
                  customizeForm={customizeForm}
                />
              </Content>
            </div>
            <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
              <Content className={maintainStyles['custom-page-content']}>
                <h3
                  id="sprm-workSpace-detail-content-organizationInfo"
                  className={maintainStyles['rfx-card-item-title']}
                >
                  {intl.get('srpm.common.title.purchaseOrgInfo').d('交易方及采买组织信息')}
                </h3>
                <PurchaseOrgInfo
                  remote={remote}
                  baseRef={baseRef}
                  ref={purchaseOrgInfoRef}
                  handleDetailField={handleDetailField}
                  customizeForm={customizeForm}
                  onChangeLineUpdate={handleLineUpdate}
                  // lineDs={lineRef ? lineRef.current : null} //    const rpLineListDs = lineRef.current?.saveCurrentData();
                />
              </Content>
            </div>
            {remote?.render('cuxCreatePageOrgInfoLaterRender', null, {
              headerDs: baseRef.current?.saveCurrentData
                ? baseRef.current?.saveCurrentData()
                : null,
              headerInfo,
              rpHeaderId,
            })}
            <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
              <Content className={maintainStyles['custom-page-content']}>
                <h3
                  id="sprm-workSpace-detail-content-detailInfo"
                  className={maintainStyles['rfx-card-item-title']}
                >
                  {intl.get('srpm.common.title.detailLineInfo').d('需求计划明细信息')}
                </h3>
                <PurchaseLineEdit
                  headerDs={
                    baseRef.current?.saveCurrentData ? baseRef.current?.saveCurrentData() : null
                  }
                  ref={lineRef}
                  remote={remote}
                  rpHeaderId={rpHeaderId}
                  getHeaderInfo={getHeaderInfo}
                  sourcePlatformObj={sourcePlatformObj}
                  handleDetailField={handleDetailField}
                  updateHeaderDate={updateHeaderDate}
                  commonUpdate={commonUpdate}
                  customizeForm={customizeForm}
                  customizeTable={customizeTable}
                  handleLineDsUpdate={handleLineDsUpdate}
                  handleSave={handleSave}
                  purchaseOrgInfoRef={purchaseOrgInfoRef}
                />
              </Content>
            </div>
            {remote?.render('cuxCreatePageRender', null, {
              headerDs: baseRef.current?.saveCurrentData
                ? baseRef.current?.saveCurrentData()
                : null,
              headerInfo,
              rpHeaderId,
            })}
            <div
              className={classnames(maintainStyles['rfx-detail-list-card'])}
              style={{ marginBottom: '16px' }}
            >
              <Content
                className={maintainStyles['custom-page-content']}
                style={{ display: 'flex' }}
              >
                <div>
                  <h3
                    id="sprm-workSpace-detail-content-attachmentInfo"
                    className={maintainStyles['rfx-card-item-title']}
                  >
                    {intl.get('hzero.common.upload.modal.title').d('附件')}
                  </h3>
                  <div className={classnames(maintainStyles['sprm-workspace-attachment'])}>
                    {customizeForm(
                      {
                        code: 'SRPM.RP_PLATFORM_CREATE.ATTACHMENT', // 必传，和unitCode一一对应
                        dataSet: attachDs,
                        custLoading: headerLoading,
                      },
                      <Form columns={1} labelLayout="float" dataSet={attachDs}>
                        <Attachment
                          labelLayout="float"
                          help={
                            <span className="attachment-title">
                              {intl
                                .get('sprm.common.view.attachment.supportExtensions')
                                .d('支持扩展名')}
                              : .rar .zip .doc .docx .pdf .jpg...
                            </span>
                          }
                          name="attachmentUuid"
                          bucketName={PRIVATE_BUCKET}
                        />
                      </Form>
                    )}
                  </div>
                </div>
                <div className={maintainStyles['custom-page-content-att-divider']} />
                <div>
                  <h3
                    id="sprm-workSpace-detail-content-attachmentInfo"
                    className={maintainStyles['rfx-card-item-title']}
                  >
                    {intl.get('sprm.common.view.attachment.externalAttachment').d('外部附件')}
                  </h3>
                  <div className={classnames(maintainStyles['sprm-workspace-attachment'])}>
                    {customizeForm(
                      {
                        code: 'SRPM.RP_PLATFORM_CREATE.EXTERNALFILE', // 必传，和unitCode一一对应
                        dataSet: attachDs,
                        custLoading: headerLoading,
                      },
                      <Form columns={1} labelLayout="float" dataSet={attachDs}>
                        <Attachment
                          labelLayout="float"
                          help={
                            <span className="attachment-title">
                              {intl
                                .get('sprm.common.view.attachment.supportExtensions')
                                .d('支持扩展名')}
                              : .rar .zip .doc .docx .pdf .jpg .xlsx...
                            </span>
                          }
                          name="externalAttachmentUuid"
                          bucketName={PRIVATE_BUCKET}
                        />
                      </Form>
                    )}
                  </div>
                </div>
              </Content>
            </div>
          </div>
        </ChoerodonSpin>
      </div>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sprm.common',
      'srpm.common',
      'hzero.common',
      'hzero.c7nProUI',
      'entity.company',
      'entity.business',
      'entity.organization',
      'sprm.purchaseReqCreation',
      'entity.roles',
      'entity.attachment',
      'entity.item',
    ],
  }),
  WithCustomizeC7N({
    unitCode: [
      'SRPM.RP_PLATFORM_CREATE.BASEINFO',
      'SRPM.RP_PLATFORM_CREATE.PURCHASEORGINFO',
      'SRPM.RP_PLATFORM_CREATE.LINEINFO',
      'SRPM.RP_PLATFORM_CREATE.ATTACHMENT',
      'SRPM.RP_PLATFORM_CREATE.BATCH_EDIT',
      'SRPM.RP_PLATFORM_CREATE.EXTERNALFILE',
    ],
  })
)(
  cuxRemote(
    {
      code: 'SRPM_CREATER_REQUISITION_PLAN',
      name: 'remote',
    },
    {
      process: {
        handleSetDsPara: undefined,
        handleLineDsUpdate: undefined,
      },
    }
  )(Index)
);
