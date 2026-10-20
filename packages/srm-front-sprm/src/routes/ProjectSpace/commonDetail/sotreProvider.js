import React, { createContext, useMemo, useEffect } from 'react';

import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { ModalProvider, useDataSet } from 'choerodon-ui/pro';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { HeaderDs, TaskDs, PurListDs, SupplierDs, ExcuteLineDs, DetailReqDs } from './store';
import { fetchDoExecute } from '@/services/projectSpaceService.js';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const {
    source, // 来源那个页面
    children,
    listUnitCode,
    headerUnitCode,
    taskUnitCode,
    purListUnitCode,
    supplierListUnitCode,
    customizeTable,
    customizeForm,
    customizeTabPane,
    customizeBtnGroup,
    projectId,
    projectReqHeaderId,
    customizeCollapseForm,
    customizeCollapse,
    history,
    pubPathFlag,
    remote,
  } = props;
  const organizationId = getCurrentOrganizationId();
  const { handleHeaderDsLoad } = remote?.props?.process;

  const taskDs = useDataSet(
    () =>
      TaskDs({
        source,
        projectId,
        projectReqHeaderId,
        organizationId,
        customizeUnitCode: taskUnitCode,
      }),
    [source, projectId, projectReqHeaderId, organizationId, taskUnitCode]
  );
  const supplierDs = useDataSet(
    () =>
      SupplierDs({
        source,
        projectId,
        projectReqHeaderId,
        organizationId,
        customizeUnitCode: supplierListUnitCode,
      }),
    [source, projectId, projectReqHeaderId, organizationId, supplierListUnitCode]
  );
  const purListDs = useDataSet(
    () =>
      PurListDs({
        source,
        projectId,
        projectReqHeaderId,
        organizationId,
        customizeUnitCode: purListUnitCode,
      }),
    [source, projectId, projectReqHeaderId, organizationId, purListUnitCode]
  );

  const excuteLineDs = useDataSet(
    () =>
      ExcuteLineDs({
        source,
        projectId,
        organizationId,
        tableFlat: 'lineTiling',
      }),
    [source, projectId, organizationId]
  );
  // 原单据
  const originLineDs = useDataSet(
    () =>
      ExcuteLineDs({
        source,
        projectId,
        organizationId,
        tableFlat: 'origin',
      }),
    [source, projectId, organizationId]
  );
  // 按头
  const headerLineDs = useDataSet(
    () =>
      ExcuteLineDs({
        source,
        projectId,
        organizationId,
        tableFlat: 'headerTiling',
      }),
    [source, projectId, organizationId]
  );

  const detailReqDs = useDataSet(() => DetailReqDs({ projectReqHeaderId, source }), [
    projectId,
    organizationId,
    projectReqHeaderId,
    source,
  ]);

  const headerDs = useDataSet(
    () =>
      HeaderDs({
        customizeUnitCode: headerUnitCode,
        organizationId,
        projectId,
        taskDs,
        projectReqHeaderId,
        purListDs,
        supplierDs,
        source,
        detailReqDs,
        handleHeaderDsLoad,
      }),
    [
      projectId,
      organizationId,
      taskDs,
      projectReqHeaderId,
      headerUnitCode,
      supplierDs,
      purListDs,
      source,
      handleHeaderDsLoad,
    ]
  );

  useEffect(() => {
    fetchDoExecute([{ fullPathCode: 'SITE.SIEC.PROJECT.PROJECT_AMOUNT_MAINTENANCE_RULE' }]).then(
      res => {
        if (res) {
          const [result] = res;
          headerDs.setState('amountRules', result || 'SELF_MAINTENANCE');
          purListDs.setState('amountRules', result || 'SELF_MAINTENANCE');
          taskDs.setState('amountRules', result || 'SELF_MAINTENANCE');
        }
      }
    );
  }, []);

  // const header = headerDs.current;

  const getAllErrorMsg = async () => {
    const headerValidate = await headerDs.validate();
    const purValidate = await purListDs.validate();
    const supplierValidate = await supplierDs.validate();
    let headerMsg = '';
    if (!headerValidate) {
      const { records } = await headerDs.getAllValidationErrors();
      headerMsg = getHeaderErrorMsg(records);
    }
    const purMsg = getLineErrorMsg(await purListDs.getAllValidationErrors());
    const supplierMsg = getLineErrorMsg(await supplierDs.getAllValidationErrors());

    notification.error({
      message: (
        <div>
          {headerMsg}
          {!purValidate && (
            <div>
              <p style={{ marginBottom: 3, fontWeight: 600 }}>
                {intl.get('sprm.project.title.maintainPurList').d('采购件清单维护')}:
              </p>
              {purMsg?.map(e => e)}
            </div>
          )}
          {!supplierValidate && (
            <div>
              <p style={{ marginBottom: 3, fontWeight: 600 }}>
                {intl.get('sprm.project.title.supplierMaintain').d('供应商维护')}:
              </p>
              {supplierMsg}
            </div>
          )}
        </div>
      ),
    });
  };

  // 头报错信息解析
  const getHeaderErrorMsg = (allErrors = []) => {
    if (allErrors.length > 0) {
      const [{ errors }] = allErrors;
      const allerrorTpye = errors?.map(ele => ele.errors[0].ruleName);
      const allError = errors?.map(ele => ele.errors[0]);
      const filtedErrorType = Array.from(new Set(allerrorTpye));
      let errorMsg = '';
      // eslint-disable-next-line no-unused-expressions
      filtedErrorType?.forEach(e => {
        const classifyType = allError?.filter(item => item.ruleName === e);
        if (e === 'valueMissing') {
          const filedName = Array.from(
            new Set(
              classifyType?.map(item => item.injectionOptions?.label || item.validationProps?.name)
            )
          );
          errorMsg += intl.get('hzero.common.validation.notNull', {
            name: filedName.join('，'),
          });
        } else {
          // eslint-disable-next-line no-unused-expressions
          classifyType?.forEach(item => {
            errorMsg += `${item.validationMessage}，`;
          });
        }
      });
      return errorMsg;
    }
  };

  // 行报错信息解析
  const getLineErrorMsg = ({ records }) => {
    return records?.map(({ errors }) => {
      const allError = errors?.map(ele => ele.errors[0]);
      const allerrorTpye = allError?.map(ele => ele.ruleName);
      const filtedErrorType = Array.from(new Set(allerrorTpye));
      const lineIndex =
        allError[0].validationProps.record.get('virtualLineNum') ||
        allError[0].validationProps.record.index + 1;
      let errorMsg = '';
      // eslint-disable-next-line no-unused-expressions
      filtedErrorType?.forEach(e => {
        const classifyType = allError?.filter(item => item.ruleName === e);
        if (e === 'valueMissing') {
          const filedName = Array.from(
            new Set(
              classifyType?.map(item => item.injectionOptions?.label || item.validationProps?.name)
            )
          );
          errorMsg += intl.get('hzero.common.validation.notNull', {
            name: filedName.join('，'),
          });
        } else {
          classifyType.forEach((item, index) => {
            if (index === classifyType?.length - 1) {
              errorMsg += `${item.validationMessage}`;
            } else {
              errorMsg += `${item.validationMessage}`;
            }
          });
        }
      });
      return allError[0].validationProps.record.get('virtualLineNum') ? (
        <div>{`行号为${lineIndex}，数据校验不通过。具体原因为:${errorMsg}`}</div>
      ) : (
        <div>
          {intl.get('sprm.common.model.intlTips', { value: lineIndex }).d(`第${lineIndex}行`)}
          {`，${errorMsg}`}
        </div>
      );
    });
  };

  useEffect(() => {
    if (projectId) {
      headerDs.query();
    } else if (projectReqHeaderId) {
      headerDs.query();
    } else {
      const defalutData = { attachmentUuId: uuid(), sourcePlatform: 'SRM' };
      headerDs.loadData([]);
      headerDs.create(defalutData);
    }
  }, [projectId, projectReqHeaderId]);

  const value = useMemo(() => {
    return {
      remote,
      source,
      organizationId,
      projectId,
      projectReqHeaderId,
      purListDs,
      supplierDs,
      customizeTable,
      customizeForm,
      customizeTabPane,
      customizeCollapseForm,
      customizeCollapse,
      customizeBtnGroup,
      taskDs,
      headerDs,
      listUnitCode,
      headerUnitCode,
      history,
      pubPathFlag,
      getLineErrorMsg,
      getAllErrorMsg,
      excuteLineDs,
      originLineDs,
      headerLineDs,
      detailReqDs,
      handleHeaderDsLoad,
    };
  }, [
    remote,
    source,
    organizationId,
    customizeTable,
    customizeForm,
    customizeCollapseForm,
    customizeCollapse,
    customizeBtnGroup,
    projectReqHeaderId,
    taskDs,
    headerDs,
    purListDs,
    supplierDs,
    listUnitCode,
    headerUnitCode,
    history,
    excuteLineDs,
    originLineDs,
    headerLineDs,
    pubPathFlag,
    getLineErrorMsg,
    getAllErrorMsg,
    detailReqDs,
    handleHeaderDsLoad,
  ]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default cuxRemote(
  {
    code: 'SPRM_PROJECT_DETAIL_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      handleHeaderDsLoad: undefined,
    },
  }
)(observer(StoreProvider));
