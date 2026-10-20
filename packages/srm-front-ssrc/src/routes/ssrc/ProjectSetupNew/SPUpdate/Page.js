import React, { useContext, useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Spin, Modal, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';
import DynamicButtons from '_components/DynamicButtons';
import { Header } from 'components/Page';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { getActiveTabKey } from 'utils/menuTab';
import { isEmpty } from 'lodash';

import SupplierBatchAddExpiredModal from '@/routes/ssrc/ProjectSetup/Update/SupplierBatchAddExpiredModal';
import { SupplierBulkExpiredModalDS } from '@/routes/ssrc/ProjectSetup/Update/SupplierExpireDS';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';

import {
  fetchUnit,
  saveEditData,
  projectSetupSubmit,
  deleteProjectSetup,
  fetchQualificationInfo,
  deleteSupplierLines,
  fetchProjectSetupHeader,
  cancelProjectSetup,
} from '@/services/projectSetupService';

import {
  HeaderInfo,
  AttachmentCard,
  ItemLine,
  PurOrganizationAndStaffDemandCmp,
  PurOrganizationAndStaffExecutorCmp,
  RequirementOnSupplier,
  SecAndPacketTable,
  SourceDemand,
  PlanLineTable,
} from './CardList';
import { StoreContext } from './store/StoreProvider';

import Style from './index.less';

const Page = () => {
  const {
    commonDs: {
      headerDs,
      itemLineDs,
      sectionOrPacketInfoDs,
      supplierLineTableDs,
      planLineTableDs,
    } = {},
    getHocInstance,
    getCustomizeUnitCode,
    customizeBtnGroup,
    organizationId,
    history,
    sourceProjectId,
    createFlag,
    setStoreData,
    remote,
  } = useContext(StoreContext);

  // 操作loading
  const [operateLoading, setOperateLoading] = useState(false);

  const {
    subjectMatterRule, // 是否分标段
    sourceMethod, // 寻源方式
    projectFrom, // 立项来源
  } = headerDs?.current?.get(['subjectMatterRule', 'sourceMethod', 'projectFrom']) || {};

  useEffect(() => {
    if (createFlag) {
      // 新建页面查询当前用户部门信息和关联采购员
      fetchCurrentUser();
      return;
    }
    // 维护页面调用刷新
    fetchPageData();
  }, [createFlag]);

  // 设置loading
  const handleSetOperateLoading = (loading) => {
    setOperateLoading(loading ?? !operateLoading);
  };

  // 根据当前用户，查询部门信息带出默认值
  const fetchCurrentUser = () => {
    fetchUnit().then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        const unitDefaultValueFields = {
          unitId: {
            unitId: result.unitId,
            unitName: result.unitName,
          },
        };
        /**
         * 二开埋点
         * @protected
         */
        const remoteUnitDefaultValueFields = remote
          ? remote.process(
              'SSRC_PROJECTSETUP_SP_UPDATE_PROCESS_SET_UNIT_DEFAULT_VALUE',
              unitDefaultValueFields
            )
          : unitDefaultValueFields;
        // eslint-disable-next-line no-unused-expressions
        headerDs?.current?.set(remoteUnitDefaultValueFields || {});
      }
    });
  };

  /**
   * 获取供应商资质信息
   */
  const getQualificationInfo = () => {
    if (!sourceProjectId) return;
    return fetchQualificationInfo(sourceProjectId).then((res) => {
      if (getResponse(res)) {
        setStoreData('qualificationInfo', res);
      }
    });
  };

  /**
   * 头查询
   * @param {Boolean} refreshSectionFieldsFlag - 是否刷新部分字段标识；
   * @param {Array} refreshSectionFields - 需要刷新的头字段
   * @returns 头查询数据结果
   */
  const fetchHeader = ({ refreshSectionFieldsFlag = false, refreshSectionFields = [] } = {}) => {
    if (refreshSectionFieldsFlag || !isEmpty(refreshSectionFields)) {
      // 刷新部分字段标识
      return fetchProjectSetupHeader({
        sourceProjectId,
        organizationId,
        customizeUnitCode: getCustomizeUnitCode([
          'baseInfoForm',
          'purOrgDemandForm',
          'purOrgExecutorForm',
          'sourceDemandForm',
          'sourceMethodForm',
          'attachmentForm',
        ]),
      }).then((res) => {
        if (getResponse(res) && headerDs?.current) {
          const setFieldsObj = {}; // 需要覆盖的字段
          if (!isEmpty(refreshSectionFields)) {
            refreshSectionFields.forEach((field) => {
              setFieldsObj[field] = res[field];
            });
          }
          /**
           * 二开埋点
           * @protected
           */
          const remoteSetFields = remote
            ? remote.process(
                'SSRC_PROJECTSETUP_SP_UPDATE_PROCESS_SET_HEADER_FIELDS',
                setFieldsObj,
                {
                  header: res,
                }
              )
            : setFieldsObj;
          headerDs.current.set({
            objectVersionNumber: res.objectVersionNumber,
            totalEstimatedAmount: res.totalEstimatedAmount,
            ...(remoteSetFields || {}),
          });
        }
        return res;
      });
    }
    return headerDs?.query();
  };

  // 大查询
  const fetchPageData = async ({
    // 请勿去掉 async await，保存之后的刷新有调用
    refreshSectionFieldsFlag = false,
    refreshSectionFields = [],
  } = {}) => {
    try {
      handleSetOperateLoading(true);
      const res = await fetchHeader({ refreshSectionFieldsFlag, refreshSectionFields });

      const supplierQueryList =
        res?.sourceMethod === 'INVITE'
          ? [getQualificationInfo(), supplierLineTableDs?.query()]
          : [false];

      const list = [
        itemLineDs?.query(),
        res?.subjectMatterRule === 'PACK' ? sectionOrPacketInfoDs?.query() : false,
        planLineTableDs?.query(),
        ...supplierQueryList,
      ];
      await Promise.all(list);
      handleSetOperateLoading(false);
    } catch (e) {
      handleSetOperateLoading(false);
      throw e;
    }
  };

  // 校验提交数据
  const validatePageData = () => {
    const list = [
      headerDs?.validate(),
      itemLineDs?.validate(),
      subjectMatterRule === 'PACK' ? sectionOrPacketInfoDs?.validate() : true,
      sourceMethod === 'INVITE' ? supplierLineTableDs?.validate() : true,
      planLineTableDs?.validate(),
    ];
    return Promise.all(list).then((res) => {
      return res?.every((i) => i);
    });
  };

  // 获取页面保存、提交数据
  const getPageData = () => {
    return {
      organizationId,
      projectLineItems: itemLineDs?.toJSONData(),
      projectLinePlans: planLineTableDs?.toJSONData(),
      projectLineSections: sectionOrPacketInfoDs?.toJSONData(),
      projectLineSuppliers: supplierLineTableDs?.toJSONData(),
      sourceProject: headerDs?.toJSONData()?.[0],
      customizeUnitCode: getCustomizeUnitCode([
        'baseInfoForm',
        'purOrgDemandForm',
        'purOrgExecutorForm',
        'sourceDemandForm',
        'sourceMethodForm',
        'attachmentForm',
        'itemLineTable',
        'secAndPacketTable',
        'supplierTable',
        'projectPlanTable',
      ]),
    };
  };

  // 取消
  const handleCancel = () => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('ssrc.projectSetup.view.message.confirm.cancelCurrentProject')
        .d('是否确认取消当前寻源立项'),
      okProps: {
        wait: 1200,
        waitType: 'throttle',
      },
      onOk: () => {
        handleSetOperateLoading(true);
        return cancelProjectSetup({
          sourceProject: getPageData().sourceProject,
          organizationId,
          sourceProjectId,
        })
          .then((res) => {
            const result = getResponse(res);
            if (result && !result.failed) {
              notification.success();
              // 返回列表
              history.push({
                pathname: `${getActiveTabKey()}/list`,
              });
            } else {
              handleSetOperateLoading(false);
            }
          })
          .catch(() => {
            handleSetOperateLoading(false);
          });
      },
    });
  };

  // 删除
  const handleDelete = () => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('ssrc.projectSetup.view.message.confirmDeleteProSet')
        .d('是否确认删除当前寻源立项'),
      okProps: {
        wait: 1200,
        waitType: 'throttle',
      },
      onOk: () => {
        handleSetOperateLoading(true);
        return deleteProjectSetup({
          sourceProject: getPageData().sourceProject,
          organizationId,
          sourceProjectId,
        })
          .then((res) => {
            const result = getResponse(res);
            if (result && !result.failed) {
              notification.success();
              // 返回列表
              history.push({
                pathname: `${getActiveTabKey()}/list`,
              });
            } else {
              handleSetOperateLoading(false);
            }
          })
          .catch(() => {
            handleSetOperateLoading(false);
          });
      },
    });
  };

  // 保存
  const handleSave = async () => {
    const pageData = getPageData();
    handleSetOperateLoading(true);
    try {
      await validatePageData();

      // 处理保存成功后的处理逻辑
      const handlePageAfterSaveOperate = () => {
        notification.success();
        // 刷新页面数据
        fetchPageData();
      };
      return saveEditData(pageData)
        .then((res) => {
          const result = getResponse(res);
          if (!result) {
            handleSetOperateLoading(false);
            return;
          }
          const { sourceProject } = res || {};
          const { sourceProjectId: newSourceProjectId = null } = sourceProject || {};
          if (createFlag && newSourceProjectId) {
            notification.success();
            handleSetOperateLoading(false);
            // 新建页面保存成功之后跳转维护页面
            // 由于有采购员工作台，所以pathname只能写死
            history.push({
              pathname: `/ssrc/new-project-setup/sp-update/${newSourceProjectId}`,
            });
          } else if (sourceProjectId) {
            validatorConfirmModal({
              response: res,
              validatorType: 'highestValidatorType',
              validatorArrName: 'validateResults',
              showErrorType: 'notification',
              onOk: () => {
                handleSetOperateLoading(true);
                return saveEditData({ ...pageData, passFlag: 1 })
                  .then((confirmRes) => {
                    if (confirmRes && getResponse(confirmRes)) {
                      // 二次保存确认通过，处理后续逻辑
                      handlePageAfterSaveOperate();
                    }
                  })
                  .finally(() => {
                    handleSetOperateLoading(false);
                  });
              },
              firstValidateSuccessCallback: handlePageAfterSaveOperate, // 首次保存即校验通过，处理后续逻辑
            });
          }
        })
        .catch(() => {
          // 不放在finally中，防止保存之后数据还没刷新完就又执行了保存
          handleSetOperateLoading(false);
        });
    } catch (e) {
      handleSetOperateLoading(false);
      throw e;
    }
  };

  // 发布
  const handleRelease = async () => {
    const pageData = getPageData();
    handleSetOperateLoading(true);
    try {
      const flag = await validatePageData();
      if (!flag) {
        notification.warning({
          message: intl
            .get('ssrc.projectSetup.view.spChange.submitMessage')
            .d('提交前请填写完整相关信息'),
        });
        handleSetOperateLoading(false);
        return;
      }
      return projectSetupSubmit({
        ...pageData,
        newEditFlag: 1, // 代表新c7n页面
      })
        .then((res) => {
          if (getResponse(res)) {
            // 处理请求成功之后
            handleEventAfterSubmit({
              response: res,
              pageData,
            });
          }
        })
        .finally(() => handleSetOperateLoading(false));
    } catch (e) {
      handleSetOperateLoading(false);
      throw e;
    }
  };

  // 处理提交接口请求之后的一些逻辑
  const handleEventAfterSubmit = ({ response = {}, pageData }) => {
    const qualifyExpiredData = (response.validateResults || []).find(
      (item) => item.code === 'error.ssrc_supplier_qualification_expired'
    );
    const { checkValue } = qualifyExpiredData || {};
    const { expired } = checkValue || {};
    if (expired?.length) {
      handleSupplierQualification(expired);
    } else {
      // 处理发布成功后的逻辑
      const handlePageAfterSubmitOperate = () => {
        notification.success();
        // 返回列表
        // 由于有采购员工作台，所以pathname只能写死
        history.push({
          pathname: `/ssrc/new-project-setup/list`,
        });
      };
      validatorConfirmModal({
        response,
        validatorType: 'highestValidatorType',
        validatorArrName: 'validateResults',
        showErrorType: 'notification',
        onOk: () => {
          handleSetOperateLoading(true);
          return projectSetupSubmit({ ...pageData, passFlag: 1 })
            .then((confirmRes) => {
              if (confirmRes && getResponse(confirmRes)) {
                // 二次提交确认通过，处理后续逻辑
                handlePageAfterSubmitOperate();
              }
            })
            .finally(() => {
              handleSetOperateLoading(false);
            });
        },
        firstValidateSuccessCallback: handlePageAfterSubmitOperate, // 首次提交即校验通过，处理后续逻辑
      });
    }
  };

  // 提交前供应商资质过期处理
  const handleSupplierQualification = (expiredData) => {
    // 解析数据
    let flatData = [];
    const supplierAttachments = expiredData.filter((item) => item.expirAttachmentsDtosLen);
    if (!isEmpty(supplierAttachments)) {
      flatData = flatExpiredDataSource(expiredData);
    }
    const supplierExpireDS = new DataSet(SupplierBulkExpiredModalDS());
    // 加载资质到期行数据
    supplierExpireDS.loadData(flatData);
    const supplierExpiredProps = {
      organizationId,
      supplierBulkExpiredModalDS: supplierExpireDS,
      tip: intl
        .get('ssrc.inquiryHall.view.qualificationWarning')
        .d('以下供应商在供应商360资质认证已到期，无法邀请，是否删除以下供应商'),
      selectionMode: 'none',
    };

    Modal.confirm({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: <SupplierBatchAddExpiredModal {...supplierExpiredProps} />,
      okProps: {
        wait: 1200,
        waitType: 'throttle',
      },
      style: { width: 800 },
      bodyStyle: { maxHeight: 400 },
      onOk: () => handleDeleteSupplierData(expiredData),
    });
  };

  /**
   * 铺平供应商资质到期提醒数据
   */
  const flatExpiredDataSource = (dataSource) => {
    const arrayItem = [];
    const attachmentsItem = dataSource.map((item) => {
      const { expirAttachmentsDtos = [], ...otherItem } = item;
      if (expirAttachmentsDtos && expirAttachmentsDtos.length) {
        const attachmentsElement = expirAttachmentsDtos.map((element, index) => {
          return {
            index: `${otherItem.supplierCompanyId}#${index}`, // 用作唯一主键
            ...otherItem,
            ...element,
            supplierCompanyId: otherItem.supplierCompanyId,
          };
        });
        return attachmentsElement;
      } else {
        return otherItem;
      }
    });
    attachmentsItem.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    return arrayItem;
  };

  // 供应商资质过期删除（和供应商列表删除共用同一接口）
  const handleDeleteSupplierData = (expiredData) => {
    // 待删除数据
    const deleteSupplierData = expiredData.map((item) => {
      const { sourceProjectId: itemSourceProjectId, projectLineSupplierId } = item;
      return {
        sourceProjectId: itemSourceProjectId,
        projectLineSupplierId,
      };
    });
    handleSetOperateLoading(true);
    return deleteSupplierLines({
      remoteDelete: deleteSupplierData,
      organizationId,
    })
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          fetchSupplierInfo();
        }
      })
      .finally(() => handleSetOperateLoading(false));
  };

  // 头按钮
  const getHeaderButtons = useMemo(() => {
    const buttons = [
      {
        name: 'cancel',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        hidden: createFlag || projectFrom !== 'REFERENCE', // 新建、非申请转隐藏
        btnProps: {
          icon: 'cancel',
          funcType: 'flat',
          waitType: 'throttle',
          wait: 1200,
          loading: operateLoading,
          onClick: handleCancel,
        },
      },
      {
        name: 'delete',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.delete').d('删除'),
        hidden: createFlag || projectFrom !== 'MUNUAL', // 新建、非手工新建隐藏
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          waitType: 'throttle',
          wait: 1200,
          loading: operateLoading,
          onClick: handleDelete,
        },
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          funcType: createFlag ? 'raised' : 'flat',
          waitType: 'throttle',
          wait: 1200,
          loading: operateLoading,
          onClick: handleSave,
          color: createFlag ? 'primary' : 'default',
        },
      },
      {
        name: 'release',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.submit').d('提交'),
        hidden: createFlag,
        btnProps: {
          icon: 'done',
          color: 'primary',
          waitType: 'throttle',
          wait: 1200,
          loading: operateLoading,
          onClick: handleRelease,
        },
      },
    ];
    return customizeBtnGroup(
      {
        code: getCustomizeUnitCode('headerButton'),
        pro: true,
      },
      <DynamicButtons buttons={buttons} />
    );
  }, [operateLoading, createFlag, handleSave, handleRelease]);

  // 查询供应商相关信息
  const fetchSupplierInfo = async () => {
    try {
      getQualificationInfo();
      await supplierLineTableDs.query(undefined, undefined, true);
    } catch (e) {
      throw e;
    }
  };

  // 公共传参
  const commonProps = useMemo(
    () => ({
      fetchHeader,
      fetchPageData,
      handleSetOperateLoading,
    }),
    [handleSetOperateLoading, fetchPageData, fetchHeader]
  );

  return (
    <div className={Style['ssrc-sp-wrapper']}>
      <Spin spinning={operateLoading}>
        <Header
          title={intl.get('ssrc.projectSetup.view.spChange.updateSourceProject').d('编辑寻源项目')}
          backPath="/ssrc/new-project-setup/list"
        >
          {getHeaderButtons}
        </Header>
        <div className={Style['ssrc-sp-content-wrapper']}>
          <TopSection
            code={getCustomizeUnitCode('baseInfoCard')}
            getHocInstance={getHocInstance}
            title={intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
            className={Style['sp-common-top-section-card']}
          >
            <HeaderInfo />
          </TopSection>
          <TopSection
            title={intl
              .get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff')
              .d('采购组织及人员')}
            getHocInstance={getHocInstance}
            code={getCustomizeUnitCode('purAndOrgCard')}
            className={`${Style['sp-common-top-section-card']} ${Style['sp-common-top-section-has-child']}`}
          >
            <SecondSection
              title={intl.get('ssrc.inquiryHall.view.inquiryHall.demandSide').d('需求方')}
              code="demand"
            >
              <PurOrganizationAndStaffDemandCmp {...commonProps} />
            </SecondSection>
            <SecondSection
              title={intl.get('ssrc.projectSetup.view.subTitle.spChange.executor').d('执行人')}
              code="executor"
            >
              <PurOrganizationAndStaffExecutorCmp />
            </SecondSection>
          </TopSection>
          <TopSection
            code={getCustomizeUnitCode('itemInfoCard')}
            getHocInstance={getHocInstance}
            title={intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
            className={`${Style['sp-common-top-section-card']} ${Style['sp-common-top-section-has-child']}`}
          >
            <SecondSection
              title={intl.get('ssrc.projectSetup.view.title.spChange.item').d('标的物')}
              code="item"
            >
              <ItemLine {...commonProps} />
            </SecondSection>
            {subjectMatterRule === 'PACK' && (
              <SecondSection
                title={intl
                  .get('ssrc.projectSetup.view.title.spChange.sectionInformation')
                  .d('标段/包信息')}
                code="secAndPacket"
              >
                <SecAndPacketTable {...commonProps} />
              </SecondSection>
            )}
          </TopSection>
          <TopSection
            code={getCustomizeUnitCode('reqOnSupplierCard')}
            getHocInstance={getHocInstance}
            title={intl
              .get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest')
              .d('对供应商要求')}
            className={Style['sp-common-top-section-card']}
          >
            <RequirementOnSupplier fetchSupplierInfo={fetchSupplierInfo} {...commonProps} />
          </TopSection>
          <TopSection
            code={getCustomizeUnitCode('sourceDemandCard')}
            getHocInstance={getHocInstance}
            title={intl
              .get('ssrc.projectSetup.view.title.spChange.sourcingRequirement')
              .d('寻源要求')}
            className={Style['sp-common-top-section-card']}
          >
            <SourceDemand />
          </TopSection>
          <TopSection
            code={getCustomizeUnitCode('projectPlanCard')}
            getHocInstance={getHocInstance}
            title={intl.get('ssrc.projectSetup.view.title.spChange.planList').d('项目计划')}
            className={Style['sp-common-top-section-card']}
          >
            <PlanLineTable {...commonProps} />
          </TopSection>
          <TopSection
            title={intl.get('hzero.common.upload.modal.title').d('附件')}
            getHocInstance={getHocInstance}
            code={getCustomizeUnitCode('attachmentCard')}
            className={Style['sp-common-top-section-card']}
          >
            <AttachmentCard />
          </TopSection>
        </div>
      </Spin>
    </div>
  );
};

export default observer(Page);
