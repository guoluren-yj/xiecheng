/* eslint-disable no-shadow */
import React, { Fragment, useState, memo, useRef, useEffect } from 'react';

import { Tabs } from 'choerodon-ui';
import { DataSet, Modal, Dropdown, Menu, Icon, Button } from 'choerodon-ui/pro';
// import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import { Throttle } from 'lodash-decorators';
import { connect } from 'dva';
import queryString from 'querystring';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import { compose, isArray } from 'lodash';
import cuxRemote from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { checkPermission } from 'services/api';
import {
  mergeItemAuthReq,
  fetchItemCount,
  fetchAwaitAuthItemCount,
  preActionBatch,
  closeAwaitItemReq,
  batchDeleteItemReq,
  batchSubmitItemReq,
} from '@/services/materialCertificationPoolService';
import DynamicButtons from '_components/DynamicButtons';
import {
  awaitAuthsListDS,
  linelListDS,
  wholeListDS,
  prequalificationListDs,
} from './stores/listDs';
import AwaitAuth from './List/AwaitAuth';
import PendingAuth from './List/PendingAuth';
import Certified from './List/Certified';
import CancelList from './List/CancelList';
import Prequalification from './List/Prequalification';
import TestResultEntry from './List/TestResultEntry';
import All from './List/All';
import Remark from './components/Remark';

const { TabPane } = Tabs;
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Index = (props) => {
  const {
    materialCertification,
    awaitAuthsListDs,
    pendingAuthWhloeListDs,
    certifiedWholeListDs,
    testResultEntryWholeListDs,
    testResultEntryLineListDs,
    cancelWholeListDs,
    prequalificationDs,
    pendingAuthLineListDs,
    certifiedLineListDs,
    cancelLineListDs,
    allLineListDs,
    allWholeListDs,
    customizeTable,
    customizeBtnGroup,
    customizeTabPane,
    getHocInstance,
    dispatch,
    tenantId,
    remote,
    location,
  } = props;
  const params = queryString.parse(location.search.substr(1)) || {};
  const { urlType } = params;
  const [headerBtnLoading, setHeaderBtnLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(
    urlType || materialCertification.tabType || 'awaitAuths'
  );
  const [pendingType, setPendingType] = useState(materialCertification.pendingType || 'whole');
  const [certifiedType, setCertifiedType] = useState(
    materialCertification.certifiedType || 'whole'
  );
  const [testResultEntryType, setTestResultEntryType] = useState(
    materialCertification.testResultEntryType || 'whole'
  );
  const [cancelType, setCancelType] = useState(materialCertification.cancelType || 'whole');
  const [allTabType, setAllTabType] = useState(materialCertification.allTabType || 'whole');
  const [permissionsObj, setPermissionsObj] = useState({});
  const [countObj, setCountObj] = useState({});
  const remarkRef = useRef({});
  const [initFlag, setInitFlag] = useState(materialCertification.initFlag || false); // 是否初始化过
  const { handleHeadBtn, CuxMenuItem } = remote?.props?.process ?? {};

  // 跳转明细界面
  const handleJumpDetail = (data, detailTab = '') => {
    const {
      itemAuthReqHeaderId,
      authReqStatusCode,
      nodeCode,
      authFeeStatusCode,
      itemAuthFeeHeaderId,
    } = data;
    const type = [
      'PENDING',
      'REJECTED',
      'TEST_RESULTS_TO_BE_ENTERED',
      'FEEDBACK_REJECTED',
    ].includes(authReqStatusCode)
      ? 'edit'
      : 'read';
    let source = null;
    if (['EARLY_TERMINATION', 'FINAL_AUTHENTICATION_COMPLETE'].includes(authReqStatusCode)) {
      source = 'certified';
    } else if (authReqStatusCode === 'CANCEL') {
      source = 'canceled';
    } else if (
      authFeeStatusCode === 'PREAPPROVAL' &&
      ['prequalification', 'all'].includes(detailTab)
    ) {
      source = 'prequalification';
    } else if (
      authReqStatusCode === 'TEST_RESULTS_TO_BE_ENTERED' &&
      ['testResultEntry', 'all'].includes(detailTab)
    ) {
      source = 'testResultEntry';
    } else {
      source = null;
    }
    const search = {
      node: nodeCode,
      source,
    };
    const linkTofunc = () => {
      dispatch(
        routerRedux.push({
          pathname:
            source === 'prequalification'
              ? `/smdm/material-certification-pool/prequalification/${itemAuthFeeHeaderId}`
              : `/smdm/material-certification-pool/${type}/${itemAuthReqHeaderId}`,
          search: queryString.stringify(filterNullValueObject(search)),
        })
      );
    };
    const { cuxPageForwarding } = remote?.props?.events ?? {};
    if (cuxPageForwarding) {
      remote.event.fireEvent('cuxPageForwarding', { source, detailTab, dispatch, currentTab, routerRedux, itemAuthReqHeaderId, itemAuthFeeHeaderId, type, search, data, linkTofunc });
    } else {
      linkTofunc();
    }
  };

  const handleSelectCreate = () => {
    setHeaderBtnLoading(true);
    return new Promise((reslove) => {
      const { selected } = awaitAuthsListDs;
      const data = selected.map((ele) => ele.toData());

      mergeItemAuthReq(data)
        .then((res) => {
          if (getResponse(res)) {
            // openCreateModal(res);
            window.sessionStorage.setItem('itemAuthCreateFromData', JSON.stringify(res));
            dispatch(
              routerRedux.push({
                pathname: `/smdm/material-certification-pool/create`,
              })
            );
            awaitAuthsListDs.unSelectAll();
            awaitAuthsListDs.clearCachedSelected();
          }
        })
        .finally(() => {
          reslove();
          setHeaderBtnLoading(false);
        });
    });
  };

  const openCreateModal = () => {
    window.sessionStorage.setItem('itemAuthCreateFromData', JSON.stringify({}));
    dispatch(
      routerRedux.push({
        pathname: `/smdm/material-certification-pool/create`,
      })
    );
    awaitAuthsListDs.unSelectAll();
    awaitAuthsListDs.clearCachedSelected();
  };

  const handlePreAction = (result) => {
    const list = prequalificationDs.toJSONData();
    if (list?.length) {
      return Modal.open({
        key: Modal.key(),
        title: intl.get(`${commonPrompt}.preAction`).d('物料认证审批'),
        children: (
          <Remark
            ref={remarkRef}
            required={result === 'REJECTED'}
            remarkLabel={intl.get(`${commonPrompt}.preActionReason`).d('审批原因')}
          />
        ),
        drawer: true,
        closable: true,
        onOk: async () => {
          const remarkCurrent = remarkRef?.current?.saveCurrentData();
          const [{ operationReason, ...other }] = remarkCurrent ? remarkCurrent.toJSONData() : [{}];
          const validateFlag = await remarkCurrent.validate();
          if (validateFlag) {
            await preActionBatch({
              list,
              result,
              approvedRemark: operationReason,
              ...other,
            }).then((res) => {
              if (getResponse(res)) {
                notification.success();
                prequalificationDs.unSelectAll();
                prequalificationDs.clearCachedSelected();
                prequalificationDs.query();
              }
            });
          } else {
            return false;
          }
        },
        movable: false,
        destroyOnClose: true,
        onCancel: () => { },
        style: { width: 380 },
      });
    } else {
      notification.error({
        message: intl.get(`${commonPrompt}.selectDataFirst`).d(`请勾选数据后操作`),
      });
    }
  };

  const handleCloseAwaitAuth = (selected) => {
    const data = selected.map((ele) => ele.toData());
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: (
        <div>{intl.get(`${commonPrompt}.itemAuthClsoeTip`).d(`关闭后不可打开，确认是否关闭`)}</div>
      ),
    }).then((button) => {
      if (button === 'ok') {
        return new Promise((resolve) => {
          closeAwaitItemReq(data)
            .then((res) => {
              if (getResponse(res)) {
                notification.success();
                awaitAuthsListDs.unSelectAll();
                awaitAuthsListDs.clearCachedSelected();
                awaitAuthsListDs.query();
              }
            })
            .finally(() => {
              resolve();
            });
        });
      }
    });
  };

  // 根据ds获取导出传参
  const getParamBySelected = (ds, customizeUnitCode, fieldName) =>
    ds.selected.length === 0
      ? {
        ...(ds?.queryDataSet?.current?.toData() ?? {}),
        customizeUnitCode,
      }
      : {
        [`${fieldName}s`]: ds.selected.map((rec) => rec.get(`${fieldName}`)),
      };

  // handleGetQueryParam: 导出按钮接口传参
  const handleGetQueryParam = () => {
    switch (currentTab) {
      case 'awaitAuths':
        return getParamBySelected(
          awaitAuthsListDs,
          'SMDM.ITEM_AWAIT_AUTH.LIST,SMDM.ITEM_AWAIT_AUTH.SEARCH',
          'awaitAuthenticateId'
        );
      case 'pendingAuths':
        return pendingType === 'whole'
          ? getParamBySelected(
            pendingAuthWhloeListDs,
            'SMDM.ITEM_PENDING_AUTH.LIST,SMDM.ITEM_PENDING_AUTH.SEARCH',
            'itemAuthReqHeaderId'
          )
          : getParamBySelected(
            pendingAuthLineListDs,
            'SMDM.ITEM_PENDING_AUTH.LINE_LIST,SMDM.ITEM_PENDING_AUTH.LINE_SEARCH',
            'itemAuthReqLineId'
          );
      case 'prequalification':
        return getParamBySelected(
          prequalificationDs,
          'SMDM.ITEM_PREQUALIFICATION.FILTER,SMDM.ITEM_PREQUALIFICATION.TABLE',
          'itemAuthFeeHeaderId'
        );
      case 'testResultEntry':
        return testResultEntryType === 'whole'
          ? getParamBySelected(
            testResultEntryWholeListDs,
            'SMDM.ITEM_TEST_RESULT_ENTRY.SEARCH,SMDM.ITEM_TEST_RESULT_ENTRY.LIST',
            'itemAuthReqHeaderId'
          )
          : getParamBySelected(
            testResultEntryLineListDs,
            'SMDM.ITEM_TEST_RESULT_ENTRY.LINE_LIST,SMDM.ITEM_TEST_RESULT_ENTRY.LINE_SEARCH',
            'itemAuthReqLineId'
          );
      case 'certified':
        return certifiedType === 'whole'
          ? getParamBySelected(
            certifiedWholeListDs,
            'SMDM.ITEM_CERTIFIED.LIST,SMDM.ITEM_CERTIFIED.SEARCH',
            'itemAuthReqHeaderId'
          )
          : getParamBySelected(
            certifiedLineListDs,
            'SMDM.ITEM_CERTIFIED.LINE_LIST,SMDM.ITEM_CERTIFIED.LINE_SEARCH',
            'itemAuthReqLineId'
          );
      case 'cancel':
        return cancelType === 'whole'
          ? getParamBySelected(
            cancelWholeListDs,
            'SMDM.ITEM_CANCEL.WHOLE_LIST,SMDM.ITEM_CANCEL.WHOLE_SEARCH',
            'itemAuthReqHeaderId'
          )
          : getParamBySelected(
            cancelLineListDs,
            'SMDM.ITEM_CANCEL.LINE_LIST,SMDM.ITEM_CANCEL.LINE_SEARCH',
            'itemAuthReqLineId'
          );
      case 'all':
        return allTabType === 'whole'
          ? getParamBySelected(
            allWholeListDs,
            'SMDM.ITEM_CERTIFIED.LIST,SMDM.ITEM_CERTIFIED.SEARCH',
            'itemAuthReqHeaderId'
          )
          : getParamBySelected(
            allLineListDs,
            'SMDM.ITEM_CERTIFIED.LINE_LIST,SMDM.ITEM_CERTIFIED.LINE_SEARCH',
            'itemAuthReqLineId'
          );
      default:
        return {};
    }
  };

  // handleGetExportUrl: 导出按钮获取url
  const handleGetExportUrl = () => {
    switch (currentTab) {
      case 'awaitAuths':
        return 'item-await-auths/export-modeler';
      case 'pendingAuths':
        return pendingType === 'whole'
          ? 'item-auth-req-headers/authenticateing/export-modeler'
          : 'item-auth-req-lines/authenticateing/export-modeler';
      case 'prequalification':
        return 'item-auth-fee-headers/preapproval/export-modeler';
      case 'testResultEntry':
        return testResultEntryType === 'whole'
          ? 'item-auth-req-headers/test-results-to-be-entered/export-modeler'
          : 'item-auth-req-lines/test-results-to-be-entered/export-modeler';
      case 'certified':
        return certifiedType === 'whole'
          ? 'item-auth-req-headers/authenticated/export-modeler'
          : 'item-auth-req-lines/authenticated/export-modeler';
      case 'cancel':
        return cancelType === 'whole'
          ? 'item-auth-req-headers/cancel/export-modeler'
          : 'item-auth-req-lines/cancel/export-modeler';
      case 'all':
        return allTabType === 'whole'
          ? 'item-auth-req-headers/all/export-modeler'
          : 'item-auth-req-lines/all/export-modeler';
      default:
        return '';
    }
  };

  // handleGetTemplateCode: 导出按钮获取模板编码
  const handleGetTemplateCode = () => {
    switch (currentTab) {
      case 'awaitAuths':
        return 'SRM_C_SMDM_ITEM_AWAIT_AUTH_EXPORT';
      case 'pendingAuths':
        return pendingType === 'whole'
          ? 'SRM_C_SMDM_ITEM_AUTH_REQ_AUTHENTICATEING_EXPORT'
          : 'SRM_C_SMDM_ITEM_AUTH_REQ_AUTHENTICATEING_LINE_EXPORT';
      case 'prequalification':
        return 'SRM_C_SMDM_ITEM_AUTH_FEE_PREAPPROVAL_EXPORT';
      case 'testResultEntry':
        return testResultEntryType === 'whole'
          ? 'SRM_C_SMDM_ITEM_AUTH_REQ_TEST_RESULTS_INPUT'
          : 'SRM_C_SMDM_ITEM_AUTH_REQ_TEST_RESULTS_INPUT_LINE';
      case 'certified':
        return certifiedType === 'whole'
          ? 'SRM_C_SMDM_ITEM_AUTH_REQ_AUTHENTICATED_EXPORT'
          : 'SRM_C_SMDM_ITEM_AUTH_REQ_AUTHENTICATED_LINE_EXPORT';
      case 'cancel':
        return cancelType === 'whole'
          ? 'SRM_C_SMDM_ITEM_AUTH_REQ_CANCEL_EXPORT'
          : 'SRM_C_SMDM_ITEM_AUTH_REQ_CANCEL_LINE_EXPORT';
      case 'all':
        return allTabType === 'whole'
          ? 'SRM_C_SMDM_ITEM_AUTH_REQ_ALL_EXPORT'
          : 'SRM_C_SMDM_ITEM_AUTH_REQ_ALL_LINE_EXPORT';
      default:
        return '';
    }
  };

  // handleGetBtnTxt: 导出按钮文本
  const handleGetBtnTxt = () => {
    const getTextFromSelected = (ds) =>
      ds.selected.length !== 0
        ? intl.get('hzero.common.button.exports').d('勾选导出')
        : intl.get('hzero.common.export').d('导出');
    let str = '';
    switch (currentTab) {
      case 'awaitAuths':
        str += getTextFromSelected(awaitAuthsListDs);
        break;
      case 'pendingAuths':
        str +=
          pendingType === 'whole'
            ? getTextFromSelected(pendingAuthWhloeListDs)
            : getTextFromSelected(pendingAuthLineListDs);
        break;
      case 'prequalification':
        str += getTextFromSelected(prequalificationDs);
        break;
      case 'testResultEntry':
        str +=
          testResultEntryType === 'whole'
            ? getTextFromSelected(testResultEntryWholeListDs)
            : getTextFromSelected(testResultEntryLineListDs);
        break;
      case 'certified':
        str +=
          certifiedType === 'whole'
            ? getTextFromSelected(certifiedWholeListDs)
            : getTextFromSelected(certifiedLineListDs);
        break;
      case 'cancel':
        str +=
          cancelType === 'whole'
            ? getTextFromSelected(cancelWholeListDs)
            : getTextFromSelected(cancelLineListDs);
        break;
      case 'all':
        str +=
          allTabType === 'whole'
            ? getTextFromSelected(allWholeListDs)
            : getTextFromSelected(allLineListDs);
        break;
      default:
        return '';
    }
    return str;
  };

  // handleGetPmnCode: 导出按钮权限集编码
  const handleGetPmnCode = () => {
    switch (currentTab) {
      case 'awaitAuths':
        return 'srm.smdm.material.certification.pool.button.export';
      case 'pendingAuths':
        return pendingType === 'whole'
          ? 'srm.smdm.material.certification.pool.button.authing-order-export'
          : 'srm.smdm.material.certification.pool.button.authing-line-export';
      case 'prequalification':
        return 'srm.smdm.material.certification.pool.button.pre-approved-export';
      case 'testResultEntry':
        return testResultEntryType === 'whole'
          ? 'srm.smdm.material.certification.pool.button.test-result-export'
          : 'srm.smdm.material.certification.pool.button.test-result-line-export';
      case 'certified':
        return certifiedType === 'whole'
          ? 'srm.smdm.material.certification.pool.button.authed-order-export'
          : 'srm.smdm.material.certification.pool.button.authed-line-export';
      case 'cancel':
        return cancelType === 'whole'
          ? 'srm.smdm.material.certification.pool.button.cancelled-order-export'
          : 'srm.smdm.material.certification.pool.button.cancelled-line-export';
      case 'all':
        return allTabType === 'whole'
          ? 'srm.smdm.material.certification.pool.button.all-order-export'
          : 'srm.smdm.material.certification.pool.button.all-line-export';
      default:
        return '';
    }
  };

  // 批量删除
  const handleBatchDelete = (selected) => {
    if (selected?.length > 100) {
      notification.error({
        message: intl
          .get(`${commonPrompt}.seletedMaxCheck`)
          .d('选中行超过100条数据，请调整后再删除'),
      });
    } else {
      const selectLength = selected?.length;
      const data = selected.map((ele) => ele.toData());
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: (
          <div>
            {intl
              .get(`${commonPrompt}.deleteConfirmLinesCheck`, { length: selectLength })
              .d(`确认删除选中【${selectLength}条】物料认证申请单？`)}
          </div>
        ),
        onOk: async () => {
          const res = await batchDeleteItemReq(data);
          if (getResponse(res)) {
            const errorList = res
              ?.filter((e) => e?.documentNumber)
              ?.map((i) =>
                intl
                  .get(`${commonPrompt}.submitError`, {
                    documentNumber: i.documentNumber,
                    message: i.message,
                  })
                  .d(`物料申请单${i.documentNumber}: ${i.message}`)
              );
            if (errorList?.length > 0) {
              notification.error({ message: errorList.map((i) => <p>{i}</p>) });
              pendingAuthWhloeListDs.unSelectAll();
              pendingAuthWhloeListDs.clearCachedSelected();
              pendingAuthWhloeListDs.query();
            } else {
              notification.success();
              pendingAuthWhloeListDs.unSelectAll();
              pendingAuthWhloeListDs.clearCachedSelected();
              pendingAuthWhloeListDs.query();
            }
          }
        },
      });
    }
  };

  // 批量提交
  const handleBatchSubmit = (selected) => {
    if (selected?.length > 100) {
      notification.error({
        message: intl
          .get(`${commonPrompt}.seletedSubmitMaxCheck`)
          .d('选中行超过50条数据，请调整后再提交'),
      });
    } else {
      const selectLength = selected?.length;
      const data = selected.map((ele) => ele.toData());
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: (
          <div>
            {intl
              .get(`${commonPrompt}.submitConfirmLinesCheck`, { length: selectLength })
              .d(`确认提交选中【${selectLength}条】物料认证申请单？`)}
          </div>
        ),
        onOk: async () => {
          const res = await batchSubmitItemReq(data);
          if (getResponse(res)) {
            const errorList = res
              ?.filter((e) => e?.documentNumber)
              ?.map((i) =>
                intl
                  .get(`${commonPrompt}.submitError`, {
                    documentNumber: i.documentNumber,
                    message: i.message,
                  })
                  .d(`物料申请单${i.documentNumber}: ${i.message}`)
              );
            if (errorList?.length > 0) {
              notification.error({ message: errorList.map((i) => <p>{i}</p>) });
              pendingAuthWhloeListDs.unSelectAll();
              pendingAuthWhloeListDs.clearCachedSelected();
              pendingAuthWhloeListDs.query();
            } else {
              notification.success();
              pendingAuthWhloeListDs.unSelectAll();
              pendingAuthWhloeListDs.clearCachedSelected();
              pendingAuthWhloeListDs.query();
            }
          }
        },
      });
    }
  };

  const HeaderBtn = observer(() => {
    const { selected } = awaitAuthsListDs;
    const { selected: pendingAuthWhloeListSelect } = pendingAuthWhloeListDs;
    const { selected: pendingAuthLineListSelect } = pendingAuthLineListDs;
    const { selected: prequalificationSelect } = prequalificationDs;
    const { selected: testResultEntryWholeSelect } = testResultEntryWholeListDs;
    const { selected: testResultEntryLineSelect } = testResultEntryLineListDs;
    const { selected: certifiedWholeListSelect } = certifiedWholeListDs;
    const { selected: certifiedLineListSelect } = certifiedLineListDs;
    const { selected: cancelWholeListSelect } = cancelWholeListDs;
    const { selected: cancelLineListSelect } = cancelLineListDs;
    const { selected: allWholeListSelect } = allWholeListDs;
    const { selected: allLineListSelect } = allLineListDs;
    const { createFlag, selectCreateFlag } = permissionsObj;
    console.log(CuxMenuItem);
    const headerButtons = [];
    if ((createFlag || selectCreateFlag) && currentTab === 'awaitAuths') {
      headerButtons.push({
        name: 'creatOtherDoc',
        noNest: true,
        child: (text) => (
          <Dropdown
            overlay={
              <Menu>
                {selectCreateFlag && (
                  <Menu.Item
                    key="selectCreate"
                    disabled={
                      !selected?.length ||
                      headerBtnLoading ||
                      selected.some((record) => record.get('authenticateStatusCode') === 'CLOSED')
                    }
                    onClick={() => Throttle(500, handleSelectCreate())}
                  >
                    <span>{intl.get(`${commonPrompt}.selectCreate`).d('勾选单据新建')}</span>
                  </Menu.Item>
                )}
                {/* <CuxMenuItem awaitAuthsListDs={awaitAuthsListDs} dispatch={dispatch} /> */}
                {CuxMenuItem && CuxMenuItem({ awaitAuthsListDs, dispatch })}
                {createFlag && (
                  <Menu.Item
                    key="manuallyCreate"
                    disabled={headerBtnLoading}
                    onClick={() => Throttle(500, openCreateModal())}
                  >
                    <span>{intl.get(`${commonPrompt}.manuallyCreate`).d('手工新建')}</span>
                  </Menu.Item>
                )}
              </Menu>
            }
            trigger={['hover']}
          >
            <Button icon="add" type="c7n-pro" color="primary" funcType="raised">
              {text || intl.get('hzero.common.button.creat').d('新建')}
              <Icon type="expand_more" />
            </Button>
          </Dropdown>
        ),
      });
    } else if (currentTab !== 'awaitAuths' && createFlag) {
      headerButtons.push({
        name: 'creat',
        noNest: true,
        btnProps: { onClick: () => Throttle(500, openCreateModal()) },
        child: (text) => (
          <Button
            icon="add"
            type="c7n-pro"
            color="primary"
            funcType="raised"
            wait={500}
            onClick={() => Throttle(500, openCreateModal())}
          >
            {text || intl.get('hzero.common.button.creat').d('新建')}
          </Button>
        ),
      });
    }

    if (currentTab === 'awaitAuths') {
      headerButtons.push({
        name: 'close',
        // btnComp: PermissionButton,
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'check',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => handleCloseAwaitAuth(selected),
          disabled:
            !selected?.length ||
            headerBtnLoading ||
            selected.some(
              (record) => record.get('authenticateStatusCode') !== 'AWAIT_AUTHENTICATE'
            ),
          permissionList: [
            {
              code: 'srm.smdm.material.certification.pool.button.await_close',
              type: 'button',
              meaning: '关闭',
            },
          ],
        },
        child: intl.get(`hzero.common.btn.close`).d('关闭'),
      });
    }

    if (currentTab === 'prequalification') {
      headerButtons.push(
        {
          name: 'preApprove',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            icon: 'check',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: () => handlePreAction('APPROVED'),
            permissionList: [
              {
                code: 'srm.smdm.material.certification.pool.button.preapproved',
                type: 'button',
                meaning: '预审通过',
              },
            ],
          },
          child: intl.get(`${commonPrompt}.preApprove`).d('预审通过'),
        },
        {
          name: 'preReject',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            icon: 'close',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: () => handlePreAction('REJECTED'),
            permissionList: [
              {
                code: 'srm.smdm.material.certification.pool.api.preapproval.rejected',
                type: 'button',
                meaning: '拒绝',
              },
            ],
          },
          child: intl.get(`${commonPrompt}.preReject`).d('预审拒绝'),
        }
      );
    }

    if (currentTab === 'pendingAuths') {
      headerButtons.push(
        {
          name: 'batchDelete',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            icon: 'delete_sweep',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: () => handleBatchDelete(pendingAuthWhloeListSelect),
            disabled:
              !pendingAuthWhloeListSelect?.length ||
              headerBtnLoading ||
              pendingAuthWhloeListSelect.some(
                (record) => !['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode'))
              ),
            permissionList: [
              {
                code: 'srm.smdm.material.certification.pool.button.batchDelete',
                type: 'button',
              },
            ],
          },
          child: intl.get('hzero.common.button.delete').d('删除'),
        },
        {
          name: 'batchSubmit',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'done',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: () => handleBatchSubmit(pendingAuthWhloeListSelect),
            disabled:
              !pendingAuthWhloeListSelect?.length ||
              headerBtnLoading ||
              pendingAuthWhloeListSelect.some(
                (record) => !['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode'))
              ),
            permissionList: [
              {
                code: 'srm.smdm.material.certification.pool.button.batchSubmit',
                type: 'button',
              },
            ],
          },
          child: intl.get('hzero.common.button.submit').d('提交'),
        },
        {
          name: 'batchImport',
          noNest: true,
          child: (text) => (
            <CommonImport
              prefixPatch={`${SRM_MDM}`}
              name="batchImport"
              buttonProps={{
                funcType: 'flat',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: `srm.smdm.material.certification.pool.button.import`,
                    type: 'button',
                    meaning: '批量导入-新',
                  },
                ],
              }}
              args={{ templateCode: 'SMDM.ITEM_AUTH_REQ' }}
              businessObjectTemplateCode="SMDM.ITEM_AUTH_REQ"
              buttonText={text || intl.get('hzero.common.title.batchImport.new').d('批量导入-新')}
              successCallBack={() => {
                notification.success();
                // eslint-disable-next-line no-unused-expressions
                getCurrentDs()?.query();
              }}
            />
          ),
        }
      );
    }

    headerButtons.push({
      name: 'export',
      noNest: true,
      child: (text) => (
        <ExcelExportPro
          templateCode={handleGetTemplateCode()}
          otherButtonProps={{
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [{ code: handleGetPmnCode(), type: 'button' }],
          }}
          buttonText={text || handleGetBtnTxt()}
          requestUrl={`${SRM_MDM}/v1/${tenantId}/${handleGetExportUrl()}`}
          queryParams={{ ...handleGetQueryParam() }}
          method="POST"
          allBody={
            currentTab === 'awaitAuths'
              ? selected.length !== 0
              : currentTab === 'pendingAuths'
                ? pendingType === 'whole'
                  ? pendingAuthWhloeListSelect.length !== 0
                  : pendingAuthLineListSelect.length !== 0
                : currentTab === 'prequalification'
                  ? prequalificationSelect.length !== 0
                  : currentTab === 'testResultEntry'
                    ? testResultEntryType === 'whole'
                      ? testResultEntryWholeSelect.length !== 0
                      : testResultEntryLineSelect.length !== 0
                    : currentTab === 'certified'
                      ? certifiedType === 'whole'
                        ? certifiedWholeListSelect.length !== 0
                        : certifiedLineListSelect.length !== 0
                      : currentTab === 'cancel'
                        ? cancelType === 'whole'
                          ? cancelWholeListSelect.length !== 0
                          : cancelLineListSelect.length !== 0
                        : currentTab === 'all'
                          ? allTabType === 'whole'
                            ? allWholeListSelect.length !== 0
                            : allLineListSelect.length !== 0
                          : true
          }
        />
      ),
    });

    if (handleHeadBtn && typeof handleHeadBtn === 'function') {
      handleHeadBtn(headerButtons, currentTab, certifiedType, allTabType, certifiedLineListDs, props);
    }

    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SMDM.MATERIAL_CERTIFICATION_POOL.BTNS',
            pro: true,
          },
          <DynamicButtons defaultBtnType="c7n-pro" buttons={headerButtons} maxNum={5} />
        )}
      </>
    );
  });

  const updateType = (value, type) => {
    if (type === 'cancelType') {
      setCancelType(value);
    } else if (type === 'pendingType') {
      setPendingType(value);
    }
    if (type === 'testResultEntryType') {
      setTestResultEntryType(value);
    } else if (type === 'certifiedType') {
      setCertifiedType(value);
    } else if (type === 'allTabType') {
      setAllTabType(value);
    } else {
      setCertifiedType(value);
    }

    dispatch({
      type: 'materialCertification/updateState',
      payload: { [type]: value },
    });
  };

  const getCurrentDs = (currentType) => {
    let currentDs = awaitAuthsListDs || {};
    switch (currentType || currentTab) {
      case 'awaitAuths':
        currentDs = awaitAuthsListDs;
        break;
      case 'pendingAuths':
        currentDs = pendingType === 'whole' ? pendingAuthWhloeListDs : pendingAuthLineListDs;
        break;
      case 'prequalification':
        currentDs = prequalificationDs;
        break;
      case 'testResultEntry':
        currentDs =
          testResultEntryType === 'whole' ? testResultEntryWholeListDs : testResultEntryLineListDs;
        break;
      case 'certified':
        currentDs = certifiedType === 'whole' ? certifiedWholeListDs : certifiedLineListDs;
        break;
      case 'cancel':
        currentDs = cancelType === 'whole' ? cancelWholeListDs : cancelLineListDs;
        break;
      case 'all':
        currentDs = allTabType === 'whole' ? allWholeListDs : allLineListDs;
        break;
      default:
        currentDs = awaitAuthsListDs;
        break;
    }
    return currentDs;
  };

  const getTabCount = () => {
    Promise.all([fetchAwaitAuthItemCount(), fetchItemCount()]).then(([res1, res2]) => {
      const data1 = getResponse(res1);
      const data2 = getResponse(res2);
      setCountObj({
        AWAITAUTH: data1,
        ...data2,
      });
    });
  };

  useEffect(() => {
    getTabCount();
    const code = [
      'srm.smdm.material.certification.pool.button.create',
      'srm.smdm.material.certification.pool.button.select.create',
    ];
    checkPermission(code).then((res) => {
      const checkRes = getResponse(res);
      if (isArray(checkRes)) {
        setPermissionsObj({
          createFlag: checkRes.find((ele) => ele.code === code[0])?.approve || false,
          selectCreateFlag: checkRes.find((ele) => ele.code === code[1])?.approve || false,
        });
      }
    });
  }, []);

  useEffect(() => {
    const currentDs = getCurrentDs(currentTab) || {};
    if (currentDs.getState('initFlag')) {
      currentDs.addEventListener('load', getTabCount);
      return () => {
        currentDs.removeEventListener('load', getTabCount);
      };
      // eslint-disable-next-line no-unreachable
      currentDs.query(currentDs.currentPage, {}, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, cancelType, pendingType, certifiedType, testResultEntryType]);

  return (
    <Fragment>
      <Header title={intl.get(`${commonPrompt}.materialAuthWorkbench`).d('物料认证管理工作台')}>
        <HeaderBtn />
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: 'SMDM.MATERIAL_CERTIFICATION_POOL.TABS',
            custDefaultActive: (activeKey) => {
              console.log(initFlag);
              if (!initFlag) {
                console.log(urlType, activeKey);
                if (urlType || activeKey) {
                  setInitFlag(true);
                  setCurrentTab(urlType || activeKey);
                  dispatch({
                    type: 'materialCertification/updateState',
                    payload: { tabType: urlType || activeKey, initFlag: true },
                  });
                } else {
                  setInitFlag(true);
                  dispatch({
                    type: 'materialCertification/updateState',
                    payload: { initFlag: true },
                  });
                  const setCustTab = getHocInstance?.().cache[
                    'SMDM.MATERIAL_CERTIFICATION_POOL.TABS'
                  ];
                  const { key } = setCustTab?.activeKey || {};
                  if (setCustTab && key && key.__default__ && currentTab) {
                    setCustTab.activeKey.key.__default__ = currentTab;
                  }
                }
              } else {
                const setCustTab = getHocInstance?.().cache[
                  'SMDM.MATERIAL_CERTIFICATION_POOL.TABS'
                ];
                const { key } = setCustTab?.activeKey || {};
                if (setCustTab && key && key.__default__ && currentTab) {
                  setCustTab.activeKey.key.__default__ = currentTab;
                }
              }
            },
          },
          <Tabs
            defaultActiveKey={currentTab}
            activeKey={currentTab}
            onChange={(value) => {
              setCurrentTab(value);
              dispatch({
                type: 'materialCertification/updateState',
                payload: { tabType: value },
              });
            }}
          >
            <TabPane
              count={countObj.AWAITAUTH}
              tab={<>{intl.get(`${commonPrompt}.awaitAuths`).d('待认证')}</>}
              key="awaitAuths"
              forceRender
            >
              <AwaitAuth dataSet={awaitAuthsListDs} customizeTable={customizeTable} />
            </TabPane>
            <TabPane
              tab={<>{intl.get(`${commonPrompt}.pendingAuths`).d('认证中')}</>}
              key="pendingAuths"
              count={countObj.AUTHENTICATEING}
              forceRender
            >
              <PendingAuth
                type={pendingType}
                remote={remote}
                wholeListDs={pendingAuthWhloeListDs}
                linelListDs={pendingAuthLineListDs}
                customizeTable={customizeTable}
                updateType={updateType}
                handleJumpDetail={handleJumpDetail}
              />
            </TabPane>
            <TabPane
              tab={<>{intl.get(`${commonPrompt}.prequalification`).d('预审中')}</>}
              key="prequalification"
              count={countObj.PREAPPROVAL}
              forceRender
            >
              <Prequalification
                remote={remote}
                wholeListDs={prequalificationDs}
                customizeTable={customizeTable}
                handleJumpDetail={handleJumpDetail}
              />
            </TabPane>
            <TabPane
              tab={<>{intl.get(`${commonPrompt}.testResultEntry`).d('检测结果录入')}</>}
              key="testResultEntry"
              count={countObj.TEST_RESULTS_TO_BE_ENTERED}
              forceRender
            >
              <TestResultEntry
                remote={remote}
                updateType={updateType}
                type={testResultEntryType}
                linelListDs={testResultEntryLineListDs}
                wholeListDs={testResultEntryWholeListDs}
                customizeTable={customizeTable}
                handleJumpDetail={handleJumpDetail}
              />
            </TabPane>
            <TabPane
              count={countObj.AUTHENTICATED}
              tab={<>{intl.get(`${commonPrompt}.certified`).d('已认证')}</>}
              key="certified"
              forceRender
            >
              <Certified
                remote={remote}
                type={certifiedType}
                wholeListDs={certifiedWholeListDs}
                linelListDs={certifiedLineListDs}
                customizeTable={customizeTable}
                updateType={updateType}
                handleJumpDetail={handleJumpDetail}
              />
            </TabPane>
            <TabPane
              count={countObj.CANCEL}
              tab={<>{intl.get(`${commonPrompt}.canceled`).d('已取消')}</>}
              key="cancel"
              forceRender
            >
              <CancelList
                remote={remote}
                type={cancelType}
                wholeListDs={cancelWholeListDs}
                linelListDs={cancelLineListDs}
                customizeTable={customizeTable}
                updateType={updateType}
                handleJumpDetail={handleJumpDetail}
              />
            </TabPane>
            <TabPane
              count={countObj.ALL}
              tab={<>{intl.get(`${commonPrompt}.all`).d('全部')}</>}
              key="all"
              forceRender
            >
              <All
                remote={remote}
                type={allTabType}
                wholeListDs={allWholeListDs}
                linelListDs={allLineListDs}
                customizeTable={customizeTable}
                updateType={updateType}
                handleJumpDetail={handleJumpDetail}
              />
            </TabPane>
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ materialCertification }) => ({
    materialCertification,
    tenantId: getCurrentOrganizationId(),
  })),
  formatterCollections({
    code: ['smdm.common', 'sprm.common'],
  }),
  withCustomize({
    unitCode: [
      'SMDM.ITEM_AWAIT_AUTH.LIST',
      'SMDM.ITEM_PENDING_AUTH.LIST',
      'SMDM.ITEM_CERTIFIED.LIST',
      'SMDM.ITEM_CANCEL.WHOLE_LIST',
      'SMDM.ITEM_PENDING_AUTH.LINE_LIST',
      'SMDM.ITEM_CERTIFIED.LINE_LIST',
      'SMDM.ITEM_CANCEL.LINE_LIST',
      'SMDM.ITEM_AUTH_CREATE_MODAL.FORM',
      'SMDM.MATERIAL_CERTIFICATION_POOL.BTNS',
      'SMDM.MATERIAL_CERTIFICATION_POOL.TABS',
      'SMDM.ITEM_PREQUALIFICATION.TABLE',
      'SMDM.ITEM_PREQUALIFICATION.FILTER',
      'SMDM.ITEM_TEST_RESULT_ENTRY.LINE_LIST',
      'SMDM.ITEM_TEST_RESULT_ENTRY.LIST',
      'SMDM.ITEM_ALL.LINE_TABLE',
      'SMDM.ITEM_ALL.WHOLE_LIST',
    ],
  }),
  cuxRemote(
    {
      code: 'SMDM_MATERIAL_CERTIFICATION_POOL', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        handleHeadBtn: undefined, // 二开添加header按钮
        CuxMenuItem: undefined,
      },
    }
  ),
  withProps(
    () => {
      const awaitAuthsListDs = new DataSet(awaitAuthsListDS());
      const pendingAuthWhloeListDs = new DataSet(wholeListDS({ type: 'pending' }));
      const certifiedWholeListDs = new DataSet(wholeListDS({ type: 'certified' }));
      const cancelWholeListDs = new DataSet(wholeListDS({ type: 'cancel' }));
      const testResultEntryWholeListDs = new DataSet(wholeListDS({ type: 'testResult' }));
      const prequalificationDs = new DataSet(prequalificationListDs());
      const pendingAuthLineListDs = new DataSet(linelListDS({ type: 'pending' }));
      const certifiedLineListDs = new DataSet(linelListDS({ type: 'certified' }));
      const testResultEntryLineListDs = new DataSet(linelListDS({ type: 'testResult' }));
      const allWholeListDs = new DataSet(wholeListDS({ type: 'all' }));
      const allLineListDs = new DataSet(linelListDS({ type: 'all' }));

      const cancelLineListDs = new DataSet(linelListDS({ type: 'cancel' }));

      return {
        awaitAuthsListDs,
        pendingAuthWhloeListDs,
        certifiedWholeListDs,
        cancelWholeListDs,
        prequalificationDs,
        pendingAuthLineListDs,
        certifiedLineListDs,
        testResultEntryWholeListDs,
        testResultEntryLineListDs,
        cancelLineListDs,
        allLineListDs,
        allWholeListDs,
      };
    },
    { cacheState: true, keepOriginDataSet: true }
  )
)(memo(Index));
