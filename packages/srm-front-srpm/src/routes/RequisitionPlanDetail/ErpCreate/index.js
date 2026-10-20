import { Modal, Attachment, DataSet, Form } from 'choerodon-ui/pro';
import React, { Fragment, useState, useEffect, useRef, useMemo } from 'react'; // useEffect
import intl from 'utils/intl';
import { Spin as ChoerodonSpin, notification } from 'choerodon-ui';
import classnames from 'classnames';
import { Header, Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  // getCurrentOrganizationId,
  // getCurrentTenant,
  getResponse,
} from 'utils/utils';
import querystring from 'querystring';
import { compose, isFunction } from 'lodash';
import uuid from 'uuid/v4';
import cuxRemote from 'hzero-front/lib/utils/remote';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { Button } from 'components/Permission';

import formatterCollections from 'utils/intl/formatterCollections';
import { queryDetail, save, singleSubmit, deleteHeader } from '@/services/RequisitionPlanServices';
import maintainStyles from '../index.less';
import Base from './BaseEdit.js';
import PurchaseLineEdit from './DemandLineEdit.js';
import PurchaseOrgInfo from './PurchaseOrgInfoEdit.js';
import Anchor from '../components/Anchor';
import OperationRecord from '../components/OperationHistory';
import { attachmentDs } from '../indexDS';

// const commonPrompt = 'srpm.common.model.common';

const Index = ({ history, match, customizeTable, customizeForm, custLoading, remote }) => {
  const backFlag = querystring.parse(location.search.substr(1))?.back;
  const [rpHeaderId] = useState(match.params?.id);
  const lineRef = useRef({});
  const baseRef = useRef({});
  const purchaseOrgInfoRef = useRef({});
  const [headerInfo, setHeaderData] = useState({ attachmentUuId: uuid() });
  const [headerLoading, setHeaderLoad] = useState(false);
  const [sourcePlatformObj, setPrSourcePlatform] = useState({ rpSourcePlatform: 'REQUEST_PLAN' });
  const attachDs = useMemo(() => new DataSet(attachmentDs()), []);
  const { handleLineDsUpdate, handleNotRpItemCodeChange } = remote?.props?.process ?? {};

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

    return { ...headerInfo, ...headerDataInfo, ...attachInfo };
  };

  // update头行信息
  const commonUpdate = (currpHeaderId) => {
    setHeaderLoad(true);
    Promise.all([
      queryDetail({
        rpHeaderId,
        customizeUnitCode:
          'SRPM.RP_PLATFORM_ERP_CREATE.BASEINFO,SRPM.RP_PLATFORM_ERP_CREATE.PURCHASEORGINFO,SRPM.RP_PLATFORM_ERP_CREATE.EXTERNALFILE',
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
    const attachInfo = attachDs.toData()[0];
    if (baseFlag && purchaseOrgInfoFlag && rpLineListFlag) {
      const currentHeaderInfo = getHeaderInfo();
      const rpLineList = rpLineListDs.toData();
      setHeaderLoad(true);
      save({
        ...currentHeaderInfo,
        ...attachInfo,
        rpLineList,
        customizeUnitCode:
          'SRPM.RP_PLATFORM_ERP_CREATE.BASEINFO,SRPM.RP_PLATFORM_ERP_CREATE.PURCHASEORGINFO,SRPM.RP_PLATFORM_ERP_CREATE.LINEINFO,SRPM.RP_PLATFORM_ERP_CREATE.ATTACHMENT,SRPM.RP_PLATFORM_ERP_CREATE.EXTERNALFILE',
      }).then((res) => {
        if (res && !res.failed) {
          commonUpdate();
        } else if (res.failed) {
          setHeaderLoad(false);
          notification.error({ message: res.message });
        }
      });
    } else {
      notification.error({
        message: intl.get('srpm.common.model.required').d('当前有必填信息未填写'),
      });
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
    const attachInfo = attachDs.toData()[0];

    if (rpLineListDs.length === 0) {
      notification.warning({
        message: intl.get('srpm.common.view.message.mustHaveLine').d('当前需求计划未维护行信息'),
      });
      setHeaderLoad(false);
      return;
    }

    if (baseFlag && purchaseOrgInfoFlag && rpLineListFlag) {
      const currentHeaderInfo = getHeaderInfo();
      const rpLineList = rpLineListDs.toData();
      setHeaderLoad(true);
      singleSubmit({
        ...currentHeaderInfo,
        ...attachInfo,
        rpLineList,
        customizeUnitCode:
          'SRPM.RP_PLATFORM_ERP_CREATE.BASEINFO,SRPM.RP_PLATFORM_ERP_CREATE.PURCHASEORGINFO,SRPM.RP_PLATFORM_ERP_CREATE.LINEINFO,SRPM.RP_PLATFORM_ERP_CREATE.ATTACHMENT,SRPM.RP_PLATFORM_ERP_CREATE.EXTERNALFILE',
      }).then((res) => {
        if (res && !res.failed) {
          // commonUpdate();
          setHeaderLoad(false);
          history.push(`/srpm/requisition-plan/list`);
        } else if (res.failed) {
          setHeaderLoad(false);
          notification.error({ message: res.message });
        }
      });
    } else {
      notification.error({
        message: intl.get('srpm.common.model.required').d('当前有必填信息未填写'),
      });
      setHeaderLoad(false);
    }
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: `${intl.get('srpm.common.view.message.deleteRP').d('删除需求计划单')} ${
        headerInfo?.displayRpNum
      }`,
      bodyStyle: { padding: '20px' },
      children: <p>{intl.get('srpm.common.view.message.confirmDelete').d('是否确认删除?')}</p>,
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

  const headerBtn = () => {
    const headerButtons = [
      <Button
        onClick={handleSubmit}
        type="c7n-pro"
        icon="done"
        color="primary"
        funcType="raised"
        disabled={headerLoading || !rpHeaderId}
        permissionList={[
          {
            code: `hzero.srm.requirement.requisition.plan.rp-platform.ps.external.submit`,
            type: 'button',
            meaning: '提交',
          },
        ]}
      >
        {intl.get(`hzero.common.button.submit`).d('提交')}
      </Button>,
      <Button
        onClick={handleSave}
        type="c7n-pro"
        icon="save"
        funcType="flat"
        disabled={headerLoading}
        permissionList={[
          {
            code: `hzero.srm.requirement.requisition.plan.rp-platform.ps.external.save`,
            type: 'button',
            meaning: '保存',
          },
        ]}
      >
        {intl.get(`hzero.common.button.save`).d('保存')}
      </Button>,
      <Button
        onClick={handleDelete}
        icon="delete"
        type="c7n-pro"
        funcType="flat"
        disabled={headerLoading || !rpHeaderId}
        permissionList={[
          {
            code: `hzero.srm.requirement.requisition.plan.rp-platform.ps.external.delete`,
            type: 'button',
            meaning: '删除',
          },
        ]}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>,
    ];

    if (rpHeaderId) {
      headerButtons.push(
        <Button onClick={handleActHistory} type="c7n-pro" icon="assignment" funcType="flat">
          {intl.get(`hzero.common.button.operating`).d('操作记录')}
        </Button>
      );
    }

    return headerButtons;
  };

  return (
    <Fragment>
      <Anchor currentAnchorContainer={currentAnchorContainer} />
      <Header
        backPath={
          backFlag === 'read'
            ? `/srpm/requisition-plan/erp-only-read/${rpHeaderId}`
            : '/srpm/requisition-plan/list'
        }
        title={
          rpHeaderId
            ? intl.get(`srpm.common.view.title.requisitionEdit`).d('编辑需求计划提报单')
            : intl.get(`srpm.common.view.title.newRequisition`).d('新建需求计划提报单')
        }
      >
        {headerBtn()}
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
                  ref={purchaseOrgInfoRef}
                  handleDetailField={handleDetailField}
                  customizeForm={customizeForm}
                  onChangeLineUpdate={handleLineUpdate}
                  // lineDs={lineRef ? lineRef.current : null} //    const rpLineListDs = lineRef.current?.saveCurrentData();
                />
              </Content>
            </div>
            <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
              <Content className={maintainStyles['custom-page-content']}>
                <h3
                  id="sprm-workSpace-detail-content-detailInfo"
                  className={maintainStyles['rfx-card-item-title']}
                >
                  {intl.get('srpm.common.title.detailLineInfo').d('需求计划明细信息')}
                </h3>
                <PurchaseLineEdit
                  ref={lineRef}
                  rpHeaderId={rpHeaderId}
                  getHeaderInfo={getHeaderInfo}
                  sourcePlatformObj={sourcePlatformObj}
                  handleDetailField={handleDetailField}
                  updateHeaderDate={updateHeaderDate}
                  commonUpdate={commonUpdate}
                  customizeTable={customizeTable}
                  handleLineDsUpdate={handleLineDsUpdate}
                  handleNotRpItemCodeChange={handleNotRpItemCodeChange}
                />
              </Content>
            </div>
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
                        code: 'SRPM.RP_PLATFORM_ERP_CREATE.ATTACHMENT', // 必传，和unitCode一一对应
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
                        code: 'SRPM.RP_PLATFORM_ERP_CREATE.EXTERNALFILE', // 必传，和unitCode一一对应
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
      'entity.roles',
      'entity.attachment',
      'entity.item',
    ],
  }),
  WithCustomizeC7N({
    unitCode: [
      'SRPM.RP_PLATFORM_ERP_CREATE.BASEINFO',
      'SRPM.RP_PLATFORM_ERP_CREATE.PURCHASEORGINFO',
      'SRPM.RP_PLATFORM_ERP_CREATE.LINEINFO',
      'SRPM.RP_PLATFORM_ERP_CREATE.ATTACHMENT',
      'SRPM.RP_PLATFORM_ERP_CREATE.EXTERNALFILE',
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
        handleLineDsUpdate: undefined,
        handleNotRpItemCodeChange: undefined,
      },
    }
  )(Index)
);
