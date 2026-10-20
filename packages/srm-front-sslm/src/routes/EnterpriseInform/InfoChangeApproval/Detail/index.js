// 企业信息变更审批 --- SRM（平台级）
import React, { useCallback, useMemo, useEffect, Fragment } from 'react';
import { Spin, Form, Modal } from 'hzero-ui';
import querystring from 'querystring';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import success from '@/assets/authentication-success.svg';
import failed from '@/assets/authentication-failed.svg';
import { connect } from 'dva';

import { compose } from 'lodash';
import { Button } from 'choerodon-ui/pro';
import { useSetState } from '../../utils';

import HeaderInfo from './HeaderInfo';
import InfoDetail from '../../infoDetail';

const Index = ({
  form,
  form: { validateFields, getFieldsValue },
  location,
  history: {
    location: { pathname = '' },
    push,
  },
  dispatch,
  allLoading = false,
}) => {
  const [changeReqId, companyId, partnerTenantId] = useMemo(
    () => (pathname.split('detail/')[1] || '').split('/'),
    [pathname]
  );

  const [state, setState] = useSetState({
    tripartiteState: false,
    authSuccess: false,
    detailHeader: {},
    errorMessage: '',
    settingOneFlag: false,
    settingTwoFlag: false,
    domesticForeignRelation: 1,
    eSignFlag: false, // 平台征信配置是否开启E签宝配置
  });

  useEffect(() => {
    if (changeReqId) {
      queryHaeder();
      // 调用平台登记信息接口，如果三证验证通过则显示认证通过图片
      queryPlatformInfo();
      // 查询征信配置
      querySettings();
    }
  }, []);

  const {
    tripartiteState,
    authSuccess,
    detailHeader,
    errorMessage,
    settingOneFlag,
    settingTwoFlag,
    domesticForeignRelation,
    eSignFlag,
  } = state;

  const queryPlatformInfo = useCallback(() => {
    dispatch({
      type: 'enterpriseInform/queryPlatformInfo',
      payload: {
        changeReqId,
        companyId,
        isPlatform: true,
        url: 'com-basic-req/compare-company-basic',
      },
    }).then(res => {
      if (res && res.newBasic) {
        const {
          errorMessage: newErrorMessage,
          domesticForeignRelation: newDomesticForeignRelation,
        } = res.newBasic;
        setState({
          errorMessage: newErrorMessage,
          domesticForeignRelation: newDomesticForeignRelation,
        });
        if (res.newBasic.certificationStatus === 'PASS') {
          setState({ tripartiteState: true, authSuccess: true });
        } else if (res.newBasic.certificationStatus === 'FAIL') {
          setState({
            tripartiteState: true,
            authSuccess: false,
          });
        }
      }
    });
  }, []);

  const querySettings = useCallback(() => {
    dispatch({
      type: 'enterpriseInform/fetchSettings',
    }).then(res => {
      if (res) {
        // 启信宝配置开启
        const settingOne = res['000105'] === '1';
        // 斯瑞德配置开启
        const settingTwo = res['000101'] === '1';
        // E签宝配置开启
        const eSign = res['000107'] === '1';
        setState({ eSignFlag: eSign, settingOneFlag: settingOne, settingTwoFlag: settingTwo });
      }
    });
  }, []);

  // 查询头信息
  const queryHaeder = useCallback(() => {
    dispatch({
      type: 'enterpriseInform/queryDetailHeader',
      payload: {
        changeReqId,
      },
    }).then(res => {
      if (res) {
        setState({ detailHeader: res });
      }
    });
  }, []);

  const approvalAdopt = useCallback(() => {
    const fieldsValue = getFieldsValue();
    const payload = [{ ...detailHeader, ...fieldsValue }];
    Modal.confirm({
      title: intl.get('sslm.enterpriseInform.view.confirmMsg.approval').d('确认通过？'),
      onOk: () => {
        dispatch({
          type: 'enterpriseInform/approve',
          payload,
        }).then(res => {
          if (res) {
            notification.success();
            push('/sslm/enterprise-inform-approval/list');
          }
        });
      },
    });
  }, [detailHeader]);

  const approvalReject = useCallback(() => {
    validateFields((err, values) => {
      if (!err) {
        const payload = {
          ...detailHeader,
          ...values,
        };
        Modal.confirm({
          title: intl.get('sslm.enterpriseInform.view.confirmMsg.reject').d('确认拒绝？'),
          onOk: () => {
            dispatch({
              type: 'enterpriseInform/reject',
              payload,
            }).then(res => {
              if (res) {
                notification.success();
                push('/sslm/enterprise-inform-approval/list');
              }
            });
          },
        });
      }
    });
  }, [detailHeader]);

  const tripartite = useCallback(() => {
    dispatch({
      type: 'enterpriseInform/tripartiteVerification',
      payload: {
        firmChangeReq: {
          changeReqId,
        },
      },
    }).then(res => {
      if (res === true) {
        // setState({ tripartiteState: true, authSuccess: true });
        notification.success();
        // 三证认证通过自动审批通过返回列表页
        push('/sslm/enterprise-inform-approval/list');
      } else if (res === false) {
        // setState({
        //   tripartiteState: true,
        //   authSuccess: false,
        // });
        notification.warning({
          message: intl
            .get('sslm.enterpriseInform.view.message.approvalRejectedMsg')
            .d('三证验证不通过，审批拒绝！'),
        });
      } else {
        return null;
      }
      queryPlatformInfo();
    });
  }, []);

  // 处理返回路径
  const handleBackPath = () => {
    const routerParams = querystring.parse(location.search.substr(1));
    const { source } = routerParams;
    let backPath = '/sslm/enterprise-inform-approval/list';
    switch (source) {
      case 'message': // 消息中心跳转过来的没有返回箭头
        backPath = '';
        break;
      default:
        break;
    }
    return backPath;
  };

  const domesticFlag = domesticForeignRelation === 0 ? !settingOneFlag : false;
  const buttonDisabled =
    domesticForeignRelation === 2
      ? !eSignFlag
      : (!settingOneFlag && !settingTwoFlag) || domesticFlag;
  const btnFlag = detailHeader.reqStatus !== 'FINISHED';
  return (
    <Fragment>
      <Header
        backPath={handleBackPath()}
        title={intl
          .get('sslm.enterpriseInform.view.title.changeApplicationApproval')
          .d('企业信息变更审批')}
      >
        {btnFlag && (
          <Fragment>
            <Button
              type="primary"
              style={{ marginLeft: 8, display: tripartiteState ? 'none' : 'inline-block' }}
              onClick={tripartite}
              icon="save"
              loading={allLoading}
              disabled={buttonDisabled}
            >
              {intl.get(`hzero.common.button.cardsVerification`).d('三证验证')}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={approvalReject}
              icon="close"
              loading={allLoading}
            >
              {intl.get(`hzero.common.button.approvalRefuse`).d('审批拒绝')}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={approvalAdopt}
              icon="check"
              loading={allLoading}
            >
              {intl.get(`hzero.common.button.approvalAdopt`).d('审批通过')}
            </Button>
          </Fragment>
        )}
      </Header>
      <Content wrapperClassName="enterpriseApprove">
        <Spin spinning={allLoading || false}>
          <HeaderInfo form={form} detailHeader={detailHeader} errorMessage={errorMessage} />
          {tripartiteState ? (
            <img
              src={authSuccess ? success : failed}
              alt="success"
              style={{ width: 100, height: 100, position: 'absolute', right: 50, top: 66 }}
            />
          ) : null}
          <InfoDetail
            changeLevel={detailHeader.changeLevel}
            changeReqId={changeReqId}
            companyId={companyId}
            partnerTenantId={partnerTenantId}
            source="enterpriseApprove"
          />
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ enterpriseInform, loading }) => ({
    enterpriseInform,
    allLoading:
      loading.effects['enterpriseInform/queryInfoChangeApprovalDetail'] ||
      loading.effects['enterpriseInform/queryInvestigate'] ||
      loading.effects['enterpriseInform/reject'] ||
      loading.effects['enterpriseInform/approve'] ||
      loading.effects['enterpriseInform/tripartiteVerification'],
  })),
  formatterCollections({ code: ['sslm.enterpriseInform', 'sslm.common', 'spfm.enterprise'] }),
  Form.create({ fieldNameProp: null })
)(Index);
