/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/**
 * 法大大 契约锁 认证完成详情页面
 */
import React, { useMemo, useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_IAM } from 'utils/config';
import notification from 'utils/notification';
import CommonImport from 'components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  DataSet,
  Form,
  Output,
  Table,
  Lov,
  Button,
  Dropdown,
  Menu,
  Modal,
  // Switch,
  // TextField,
  // Attachment,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import { createAttachmentUUID } from '@/utils/utils';
import QueryBarMore from '@/components/QueryBarMore';
import {
  fetchSaveSignMember,
  queryAuthorizeDetail,
  fetchOnlySaveSign,
  fetchChangeSignatory,
} from '@/services/supplierElecSignWorkplaceService';
// import { save } from '@/services/certificateAuthorityService';

import {
  OldRouteDetailDS,
  SignListDS,
  SignAttachDS,
  NewMemberListDS,
} from '../stores/supplierSignDS';

import styles from './index.less';
import OperationRecord from '../OperationRecord';
import SealGeneration from '../SealGeneration';
import PeopleTransfer from './PeopleTransfer';
import Upload from './Upload';
import SignEditModal from './SignEditModal';

let canClick = 1;
let lovTabDS = null;

const SignDetail = (props) => {
  const {
    companyCode,
    companyId = '',
    authType = '',
    tenantId = '',
    timeStr,
    onCallBackCompanyDetail = () => {},
  } = props;

  const basicFormDS = useMemo(() => new DataSet({ ...OldRouteDetailDS() }), []);
  const memberListDS = useMemo(() => new DataSet({ ...NewMemberListDS() }), []);
  const signListDS = useMemo(() => new DataSet({ ...SignListDS() }), []);
  const signAttachDS = useMemo(() => new DataSet({ ...SignAttachDS() }), []);
  const lovDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'peopleTree',
            type: 'object',
            lovCode: 'SPFM.ELECTRON_SIGN_WORKPLACE_USER_LIST',
            noCache: true,
            // multiple: true,
            dynamicProps: {
              lovQueryAxiosConfig: () => {
                return {
                  url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/have/company/sign-list?authType=${authType}&companyId=${companyId}`,
                  method: 'GET',
                  transformResponse: (value) => {
                    const obj = JSON.parse(value);
                    if (obj.content && obj.content.length) {
                      obj.content.forEach((item) => {
                        item.statusStr = item.userAuthStatus;
                        item.userAuthStatus =
                          item.userAuthStatus === 'success'
                            ? intl.get('spfm.buyerElectronicSign.view.status.verified').d('已认证')
                            : intl
                                .get('spfm.buyerElectronicSign.view.status.notCertified')
                                .d('未认证');
                      });
                    }
                    return obj;
                  },
                };
              },
            },
          },
        ],
      }),
    [authType, companyId]
  );

  const [authDetail, setAuthDetail] = useState({}); // 当前公司认证信息
  const [userList, setUserList] = useState([]); //
  const [sealGenerationVisible, setVisible] = useState(false); // 印章生成弹窗
  const [refresh, setRefresh] = useState(false); //

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    memberListDS.addEventListener('select', selectEvent);
    memberListDS.addEventListener('unSelect', selectEvent);
    memberListDS.addEventListener('selectAll', selectEvent);
    memberListDS.addEventListener('unSelectAll', selectEvent);
    signListDS.addEventListener('select', selectEvent);
    signListDS.addEventListener('unSelect', selectEvent);
    signListDS.addEventListener('selectAll', selectEvent);
    signListDS.addEventListener('unSelectAll', selectEvent);

    return () => {
      memberListDS.removeEventListener('select', selectEvent);
      memberListDS.removeEventListener('unSelect', selectEvent);
      memberListDS.removeEventListener('selectAll', selectEvent);
      memberListDS.removeEventListener('unSelectAll', selectEvent);
      signListDS.removeEventListener('select', selectEvent);
      signListDS.removeEventListener('unSelect', selectEvent);
      signListDS.removeEventListener('selectAll', selectEvent);
      signListDS.removeEventListener('unSelectAll', selectEvent);
    };
  }, []);

  const selectEvent = () => {
    setRefresh(true);
  };

  useEffect(() => {
    if (!companyId || !authType) return;
    basicFormDS.setQueryParameter('companyId', companyId);
    basicFormDS.setQueryParameter('asyncCountFlag', 'DEFAULT');
    basicFormDS.setQueryParameter('authType', authType);
    basicFormDS.setQueryParameter('tenantId', tenantId);
    basicFormDS.query().then((res) => {
      if (getResponse(res)) {
        onCallBackCompanyDetail({ companyCode, ...res });
        setAuthDetail({ companyCode, ...res });
      }
    });
  }, [timeStr]);

  useEffect(() => {
    if (!companyId) return;

    basicFormDS.setQueryParameter('companyId', companyId);
    basicFormDS.setQueryParameter('asyncCountFlag', 'DEFAULT');
    basicFormDS.setQueryParameter('authType', authType);
    basicFormDS.setQueryParameter('tenantId', tenantId);
    basicFormDS.query().then((res) => {
      if (getResponse(res)) {
        onCallBackCompanyDetail({ companyCode, ...res });
        setAuthDetail({ companyCode, ...res });
      }
    });

    if (authType !== 'QYS') {
      // 成员管理
      memberListDS.setQueryParameter('companyId', companyId);
      memberListDS.setQueryParameter('impowerType', authType);
      memberListDS.query().then((result) => {
        if (result && result.content) {
          setUserList(result?.content ?? []);
        }
        setRefresh(true);
      });

      // 印章管理
      signListDS.setQueryParameter('companyId', companyId);
      signListDS.setQueryParameter('sealType', authType);
      signListDS.query();
    }
  }, [companyId]);

  const authorizeStatus = {
    0: intl.get('spfm.buyerElectronicSign.view.status.unAuthorized').d('未授权'),
    1: intl.get('spfm.buyerElectronicSign.view.status.authorized').d('已授权'),
    2: intl.get('spfm.buyerElectronicSign.view.status.expired').d('已过期'),
    3: intl.get('spfm.buyerElectronicSign.view.status.authorizing').d('授权中'),
  };

  const classMap = {
    0: styles['tag-disEnabled-status'],
    1: styles['tag-enabled-status'],
    2: styles['tag-expired-status'],
    3: styles['tag-pending-status'],
  };

  const rendererStatus = ({ text }, statusMap = {}) => {
    if (text) {
      return <span className={classMap[text]}>{statusMap[text]}</span>;
    } else return '-';
  };

  /**
   * 选择成员列表
   */
  const handleSelect = async () => {
    // if (!record) return false;

    const localRecord = lovTabDS && lovTabDS.selected.length ? lovTabDS.selected[0] : null;

    if (localRecord && localRecord.get('statusStr') !== 'success') {
      // 不是已认证
      notification.error({
        message: intl
          .get('spfm.supplierElectronicSign.model.status.notSuccess')
          .d(
            '添加成员失败，原因是子账户必须经过实名认证才能加入用印成员列表，请提醒该成员前往个人中心完成个人实名认证'
          ),
      });
      return false;
    }

    const userId = localRecord?.get('id') ?? '';
    if (userId && canClick === 1) {
      canClick = 0;
      queryAuthorizeDetail({ impowerType: authType, userId, authType }).then(async (res) => {
        if (getResponse(res)) {
          const { bankPhoneNum, userAuthStatus, authName, serviceId } = res;
          const obj = {
            companyId: authDetail.companyId,
            bankPhoneNum,
            userAuthStatus,
            serviceId,
            userId,
            authName: authName || localRecord?.get('realName'),
            impowerType: authType,
            loginName: localRecord?.get('loginName'),
            tenantId,
          };

          const result = await fetchSaveSignMember({
            paramList: [obj],
            tenantId,
          });
          canClick = 1;
          if (getResponse(result)) {
            notification.success();
            memberListDS.query().then(() => {
              setRefresh(true);
            });
            lovDs.data = [];
            lovDs.clearCachedSelected();
            return true;
          } else {
            return false;
          }
        } else {
          canClick = 1;
          return false;
        }
      });
    } else {
      return false;
    }
  };

  /**
   * 生成印章
   */
  const handleGenerateStamp = (flag) => {
    setVisible(flag);
    signListDS.query();
  };

  /**
   * 上传印章图片
   */
  const handleCreateSign = async (record) => {
    let modal = null;
    let attachmentUuid = null;
    let imageUrl = null;

    if (record) {
      // 编辑
      const sealId = record?.get('sealId') ?? '';
      signAttachDS.setQueryParameter('companyId', companyId);
      signAttachDS.setQueryParameter('impowerType', authType);
      signAttachDS.setQueryParameter('sealType', authType);
      signAttachDS.setQueryParameter('sealId', sealId);
      const res = await signAttachDS.query();
      if (signAttachDS && signAttachDS.current) {
        signAttachDS.current.set('companyId', companyId);
        signAttachDS.current.set('authType', authType);
        signAttachDS.current.set('parTenantId', tenantId);
      }
      attachmentUuid = res?.attachmentUuid ?? '';
      imageUrl = res?.sealFileUrl ?? '';
    } else {
      const { certificateResId = '' } = authDetail;
      // 生成UUID
      attachmentUuid = await createAttachmentUUID();
      signAttachDS.create({
        sealType: authType,
        authType,
        parTenantId: tenantId,
        impowerType: authType,
        companyId,
        enabledFlag: 1,
        customerId: certificateResId,
        certificateResId,
        attachmentUuid,
      });
    }

    const handleCloseModal = () => {
      if (modal) {
        signAttachDS.data = [];
        signAttachDS.reset();
        modal.close();
        signListDS.query();
      }
    };

    const handleSubmit = async () => {
      const sealFileUrl = signAttachDS?.current?.get('sealFileUrl') ?? '';
      if (!sealFileUrl) {
        notification.info({
          message: intl
            .get('spfm.buyerElectronicSign.view.message.mustUploadSealPic')
            .d('印章图片不能为空'),
        });
        return false;
      }
      const isValid = await signAttachDS.validate();

      if (isValid && canClick === 1) {
        canClick = 0;
        signAttachDS
          .submit()
          .then((res) => {
            canClick = 1;
            if (getResponse(res)) {
              handleCloseModal();
            }
          })
          .catch(() => {
            canClick = 1;
          });
      }
    };

    const handleOnlySave = async () => {
      const sealFileUrl = signAttachDS?.current?.get('sealFileUrl') ?? '';
      if (!sealFileUrl) {
        notification.info({
          message: intl
            .get('spfm.buyerElectronicSign.view.message.mustUploadSealPic')
            .d('印章图片不能为空'),
        });
        return false;
      }
      const isValid = await signAttachDS.validate();

      if (isValid && canClick === 1) {
        const param = signAttachDS?.current?.toData() ?? {};
        canClick = 0;
        fetchOnlySaveSign({
          list: [{ ...param }],
          authType,
          companyId,
          tenantId,
        }).then((res) => {
          canClick = 1;
          if (getResponse(res)) {
            handleCloseModal();
          }
        });
      }
    };

    // const handleRemove = () => {
    //   if (signAttachDS && signAttachDS.current) {
    //     signAttachDS.current.set('sealFileUrl', '');
    //   }
    // };

    modal = Modal.open({
      title: record
        ? intl.get(`spfm.buyerElectronicSign.view.button.editSignPic`).d('编辑印章')
        : intl.get(`spfm.buyerElectronicSign.view.button.upSignPic`).d('上传印章图片'),
      children: (
        <div className={styles['buyer-sign-manage-form-basic']}>
          <SignEditModal
            signAttachDS={signAttachDS}
            attachmentUuid={attachmentUuid}
            record={record}
            defaultImageUrl={imageUrl}
            authType={authType}
          />
        </div>
      ),
      key: Modal.key(),
      closable: true,
      drawer: true,
      mask: true,
      style: { width: '372px' },
      footer: (
        <div>
          {authType === 'FDD' ? (
            <>
              {record ? (
                <Button color="primary" onClick={handleSubmit}>
                  {intl.get('spfm.buyerElectronicSign.view.button.syncAgain').d('重新同步')}
                </Button>
              ) : null}
              <Button
                color={record ? '' : 'primary'}
                funcType={record ? '' : 'flat'}
                onClick={record ? handleOnlySave : handleSubmit}
              >
                {intl.get('spfm.buyerElectronicSign.view.button.save').d('保存')}
              </Button>
              <Button onClick={handleCloseModal}>
                {intl.get(`spfm.buyerElectronicSign.view.button.cancel`).d('取消')}
              </Button>
            </>
          ) : null}

          {authType === 'ESIGN' ? (
            <>
              <Button color="primary" onClick={handleSubmit}>
                {intl.get('spfm.buyerElectronicSign.view.button.save').d('保存')}
              </Button>
              <Button onClick={handleCloseModal}>
                {intl.get(`spfm.buyerElectronicSign.view.button.cancel`).d('取消')}
              </Button>
            </>
          ) : null}
        </div>
      ),
    });
  };

  /**
   * 删除印章
   */
  // const handleDeleteSign = (record) => {
  //   if (record && record.get('sealCode')) {
  //     signListDS.delete(record);
  //   }
  // };

  /**
   * 查看操作记录
   */
  const handleViewRecord = () => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get(`spfm.buyerElectronicSign.view.title.operationRecord`).d('操作记录'),
      children: <OperationRecord companyId={companyId} authType={authType} />,
      key: Modal.key(),
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '732px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get('spfm.buyerElectronicSign.view.button.close').d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 授权成员
   */
  // eslint-disable-next-line no-unused-vars
  const handleAuthPeople = async (record) => {
    let modal = null;
    const { sealId, sealCode } = record?.get(['sealId', 'sealCode']) ?? '';

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
        signListDS.query();
      }
    };

    modal = Modal.open({
      title: intl.get('spfm.buyerElectronicSign.view.button.authPeople').d('授权成员'),
      children: (
        <>
          <PeopleTransfer
            companyId={companyId}
            sealId={sealId}
            sealCode={sealCode}
            authType={authType}
            tenantId={tenantId}
          />
        </>
      ),
      key: Modal.key(),
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '732px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get('spfm.buyerElectronicSign.view.button.close').d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  const afterClose = () => {
    lovDs.data = [];
    lovDs.reset();
    lovTabDS = null;
  };

  const lovColumns = () => {
    return [
      { name: 'loginName', width: 150 },
      { name: 'realName', width: 150 },
      { name: 'userAuthStatus', width: 150 },
      { name: 'authName', width: 150 },
      { name: 'bankPhoneNum', width: 150 },
    ];
  };

  const renderQueryBar = (prop) => {
    return <QueryBarMore {...prop} />;
  };

  const viewRenderer = React.useCallback(({ dataSet }) => {
    const tableProps = {
      selectionMode: 'rowbox',
      dataSet,
      multiple: false,
      autoHeight: { type: 'maxHeight', diff: 20 },
      queryFieldsLimit: 2,
      columns: lovColumns(),
      queryBar: renderQueryBar,
    };
    lovTabDS = dataSet;
    return (
      <div className={styles['people-select-lov-body']}>
        <Table {...tableProps} />
      </div>
    );
  }, []);

  const deleteMember = () => {
    if (memberListDS.selected.length) {
      memberListDS.selected.forEach((rcd) => {
        rcd.set('tenantId', tenantId);
      });
      memberListDS
        .delete(memberListDS.selected, {
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <div>
              {intl.get('spfm.buyerElectronicSign.view.confirm.delete').d('是否确认删除？')}
            </div>
          ),
        })
        .then(() => {
          memberListDS.query().then(() => {
            setRefresh(true);
          });
        });
    }
  };

  const buttons = () => {
    const simpleRole = userList.length === 1 && userList[0].simpleRoleFlag; // 简易角色

    return !simpleRole
      ? [
          <Lov
            dataSet={lovDs}
            name="peopleTree"
            mode="button"
            clearButton={false}
            icon="playlist_add"
            viewMode="drawer"
            modalProps={{
              okFirst: true,
              afterClose,
              // onClose: handleSelect,
              bodyStyle: { paddingTop: '0' },
            }}
            onBeforeSelect={handleSelect}
            tableProps={{
              selectionMode: 'rowbox',
              autoHeight: false,
            }}
            viewRenderer={viewRenderer}
          >
            {intl.get('spfm.buyerElectronicSign.view.button.newCreate').d('新增')}
          </Lov>,
          <Button
            icon="delete"
            funcType="flat"
            disabled={!memberListDS.selected.length}
            onClick={deleteMember}
          >
            {intl.get('spfm.buyerElectronicSign.view.status.batchDelete').d('批量删除')}
          </Button>,
          <CommonImport
            data-name="import"
            businessObjectTemplateCode="SPFM_COMPANY_USER_IMPOWER_IMP"
            prefixPatch="/spfm"
            buttonText={intl.get('hzero.common.button.import').d('导入')}
            successCallBack={() =>
              memberListDS.query().then(() => {
                setRefresh(true);
              })
            }
            buttonProps={{
              icon: 'archive',
              type: 'c7n-pro',
              funcType: 'flat',
              style: {
                marginRight: '8px',
                display: authType === 'ESIGN' ? 'inline-block' : 'none',
              },
            }}
            args={{ companyId, impowerType: authType }}
          />,
        ].filter(Boolean)
      : null;
  };

  const menu = () => {
    return (
      <Menu>
        {authDetail && authDetail.caAuthStatus === 'CA_SUCCESS' ? ( // authDetail.userImpowerFlag === 1
          <Menu.Item>
            <a onClick={() => handleGenerateStamp(true)}>
              {intl.get('spfm.buyerElectronicSign.view.button.createSign').d('生成印章')}
            </a>
          </Menu.Item>
        ) : null}
        <Menu.Item>
          <a onClick={() => handleCreateSign(null)} on>
            {intl.get('spfm.buyerElectronicSign.view.button.upSignPic').d('上传图片印章')}
          </a>
        </Menu.Item>
      </Menu>
    );
  };

  const deleteSign = () => {
    if (signListDS.selected.length) {
      signListDS.selected.forEach((rcd) => {
        rcd.set('partnerTenant', tenantId);
      });
      signListDS
        .delete(signListDS.selected, {
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <div>
              {intl.get('spfm.buyerElectronicSign.view.confirm.delete').d('是否确认删除？')}
            </div>
          ),
        })
        .then(() => {
          signListDS.query();
        });
    }
  };

  /**
   * 印章管理
   * @returns
   */
  const signButtons = () => {
    return [
      authType === 'ESIGN' ? (
        <Dropdown overlay={menu()}>
          <Button icon="playlist_add" funcType="flat">
            {intl.get('spfm.buyerElectronicSign.view.button.newCreate').d('新增')}
          </Button>
        </Dropdown>
      ) : (
        <Button icon="playlist_add" funcType="flat" onClick={() => handleCreateSign(null)}>
          {intl.get('spfm.buyerElectronicSign.view.button.newCreate').d('新增')}
        </Button>
      ),
      // 'delete',
      <Button
        icon="delete"
        funcType="flat"
        disabled={!signListDS.selected.length}
        onClick={deleteSign}
      >
        {intl.get('spfm.buyerElectronicSign.view.status.batchDelete').d('批量删除')}
      </Button>,
      <Button icon="operation_service_request" funcType="flat" onClick={handleViewRecord}>
        {intl.get('spfm.buyerElectronicSign.view.button.operationRecord').d('操作记录')}
      </Button>,
    ].filter(Boolean);
  };

  const handleChangeSignatory = (userId, resultId) => {
    fetchChangeSignatory({ userId, resultId }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        memberListDS.query();
      }
    });
  };

  const columns = () => {
    return [
      { name: 'userAuthStatus' },
      { name: 'loginName' },
      {
        name: 'realName',
        width: 350,
        renderer: ({ text, record }) => {
          const show = record?.get('defaultSignatoryFlag') ?? false;
          return authType === 'FDD' ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {text}
              </span>
              {show ? (
                <span className={styles['tag-signatory']}>
                  {intl.get('spfm.buyerElectronicSign.view.tags.signatory').d('默认签署人')}
                </span>
              ) : null}
            </div>
          ) : (
            text
          );
        },
      },
      { name: 'authName' },
      { name: 'bankPhoneNum' },
      { name: 'creationDate' },
      authType === 'FDD' && {
        header: intl.get('hzero.common.button.operator').d('操作'),
        renderer: ({ record }) => {
          const show = record?.get('defaultSignatoryFlag') ?? false;
          const userId = record?.get('userId') ?? '';
          const resultId = record?.get('resultId') ?? '';
          return authType === 'FDD' ? (
            <>
              {!show ? (
                <a onClick={() => handleChangeSignatory(userId, resultId)}>
                  {intl.get('spfm.buyerElectronicSign.view.tags.addSignatory').d('设为签署人')}
                </a>
              ) : null}
            </>
          ) : null;
        },
      },
    ].filter(Boolean);
  };

  /**
   * 企业禁用操作
   */
  // const handleChangeEnabled = (checked) => {
  //   const obj = basicFormDS?.current?.toData() ?? {};
  //   save([
  //     {
  //       ...obj,
  //       enabledFlag: checked,
  //     },
  //   ]).then(() => {
  //     basicFormDS.query();
  //   });
  // };

  const uploadProps = {
    single: true,
    icon: false,
    accept: '.png',
    title: intl.get(`spfm.sealmanage.view.message.title.sealPicture`).d('印章图片'),
    btxText: intl.get('spfm.buyerElectronicSign.view.button.viewAttach').d('查看附件'),
    showFilesNumber: false,
    bucketName: PRIVATE_BUCKET,
    bucketDirectory: 'spfm-sign',
    fileType: 'image/png',
  };

  const signColumns = () => {
    return [
      authType === 'FDD' && { name: 'sealStatus' },
      { name: 'sealCode' },
      { name: 'sealName' },
      authType === 'FDD' && { name: 'sealResMsg' },
      {
        name: 'picStr',
        renderer: ({ record }) => {
          return (
            <Upload
              viewOnly
              showFilesNumber={false}
              attachmentUUID={record && record.get ? record.get('attachmentUuid') : ''}
              localRecord={record && record.toData ? record.toData() : {}}
              {...uploadProps}
            />
          );
        },
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.button.operator').d('操作'),
        renderer: ({ record }) => {
          return (
            <span>
              {(authType === 'FDD' && record.get('sealStatus') === 'APPLY_FAILURE') ||
              authType === 'ESIGN' ? (
                <a style={{ marginRight: '16px' }} onClick={() => handleCreateSign(record)}>
                  {intl.get('spfm.buyerElectronicSign.view.button.edit').d('编辑')}
                </a>
              ) : null}
              {authType === 'FDD' && record.get('sealStatus') === 'SUCCESS' ? (
                <a style={{ marginRight: '16px' }} onClick={() => handleAuthPeople(record)}>
                  {intl.get('spfm.buyerElectronicSign.view.button.authPeople').d('授权成员')}
                </a>
              ) : null}
              {/* <a style={{ marginRight: '16px' }} onClick={() => handleDeleteSign(record)}>
                {intl.get('spfm.buyerElectronicSign.view.button.delete').d('删除')}
              </a> */}
            </span>
          );
        },
      },
    ].filter(Boolean);
  };

  // 印章生成
  const sealGenerationProps = {
    companyId,
    visible: sealGenerationVisible,
    onHandleCancel: () => handleGenerateStamp(false),
  };

  const alertMsg =
    authType === 'ESIGN'
      ? intl
          .get('spfm.buyerElectronicSign.view.message.esignAlert')
          .d(
            '提示：E签宝sdk产品的用印成员管理是维护印章可使用成员，以下维护成员可以在签署页面勾选企业印章进行签署。'
          )
      : intl
          .get('spfm.buyerElectronicSign.view.message.fddAlert')
          .d(
            '提示：用印成员管理是维护待授权印章的企业成员，添加成员后，还需在印章管理操作中点击“授权成员”按钮，完成印章授权。'
          );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
      className={styles['sign-detail-basic']}
    >
      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff',
          border: '1px solid rgba(229, 231, 236, 1)',
        }}
      >
        <div className={styles['auth-done-title']}>
          {intl.get('spfm.buyerElectronicSign.view.title.basicInfo').d('基础信息')}
        </div>
        <div>
          <Form dataSet={basicFormDS} columns={3} labelLayout="float">
            <Output
              name="companyNum"
              renderer={({ text }) => {
                return text || companyCode || '-';
              }}
            />
            <Output name="companyName" />
            <Output
              name="organCode"
              label={
                authDetail?.foreignFlag === 0
                  ? intl
                      .get('spfm.supplierElectronicSign.view.title.registerNo')
                      .d('企业注册登记号/税号')
                  : intl
                      .get(`spfm.buyerElectronicSign.model.socialCreditCode`)
                      .d('统一社会信用代码')
              }
            />
            <Output name="authType" />
            <Output
              name="caAuthStatus"
              // renderer={e => rendererStatus(e, authStatus)}
              renderer={({ text }) => {
                return (
                  <span
                    className={
                      text === 'CA_SUCCESS'
                        ? styles['status-tag-success']
                        : styles['status-tag-failed']
                    }
                  >
                    {text === 'CA_SUCCESS'
                      ? intl.get('spfm.buyerElectronicSign.view.status.verified').d('已认证')
                      : intl.get('spfm.buyerElectronicSign.view.status.notCertified').d('未认证')}
                  </span>
                );
              }}
            />
            <Output name="authenticateTime" />
            {authType === 'FDD' && (
              <Output
                name="certificateStatus"
                renderer={(e) => rendererStatus(e, authorizeStatus)}
              />
            )}
            {authType === 'FDD' && <Output name="certificateTime" />}
            <Output
              name="enabledFlag"
              renderer={({ text }) => {
                return (
                  <span
                    className={
                      text == 1 ? styles['status-tag-success'] : styles['status-tag-failed']
                    }
                  >
                    {text == 1
                      ? intl.get('spfm.buyerElectronicSign.view.status.isEnabled').d('已启用')
                      : intl.get('spfm.buyerElectronicSign.view.status.isDisAbled').d('已禁用')}
                  </span>
                );
              }}
            />
          </Form>
        </div>
      </div>

      {authType !== 'QYS' && (
        <div
          style={{
            marginTop: '8px',
            padding: '20px',
            backgroundColor: '#fff',
            border: '1px solid rgba(229, 231, 236, 1)',
          }}
        >
          <div className={styles['auth-done-title']}>
            {intl.get('spfm.buyerElectronicSign.view.title.signMemberManage').d('用章成员管理')}
          </div>

          <Alert
            style={{ marginBottom: '8px' }}
            message={alertMsg}
            type="info"
            showIcon
            iconType="help"
          />

          <div
            style={{ maxHeight: '400px', paddingBottom: memberListDS.length > 5 ? '20px' : '0' }}
          >
            <Table
              dataSet={memberListDS}
              columns={columns()}
              queryBar="none"
              buttons={buttons()}
              autoHeight={{ type: 'maxHeight', diff: 20 }}
            />
          </div>
        </div>
      )}

      {authType !== 'QYS' && (
        <div
          style={{
            flex: 1,
            marginTop: '8px',
            padding: '20px',
            backgroundColor: '#fff',
            // minHeight: authType === 'FDD' ? '' : 'calc(100vh - 618px)',
            border: '1px solid rgba(229, 231, 236, 1)',
          }}
        >
          <div className={styles['auth-done-title']}>
            {intl.get('spfm.buyerElectronicSign.view.title.sealManagement').d('印章管理')}
          </div>
          <div style={{ maxHeight: '600px', marginBottom: '20px' }}>
            {/*  */}
            <Table
              dataSet={signListDS}
              columns={signColumns()}
              queryBar="none"
              buttons={signButtons()}
              autoHeight={{ type: 'maxHeight', diff: 20 }}
            />
          </div>
        </div>
      )}

      {sealGenerationVisible && <SealGeneration {...sealGenerationProps} />}
    </div>
  );
};

export default formatterCollections({
  code: ['spfm.supplierElectronicSign', 'spfm.buyerElectronicSign'],
})(SignDetail);
