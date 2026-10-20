import React from 'react';
import { connect } from 'dva';
import { Button, Form, Tabs, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { agmRecordModal } from '@/utils/c7nModal';
import { PRIVATE_BUCKET } from '_utils/config';

import { BaseInfo, TableList, Authority } from '@/routes/small/Agreements';
import dataChangeReq from './dataChangeReq';
import { protocalUnitCode } from '../const/uniCode';

const customizeUnitCode = protocalUnitCode.view;
@formatterCollections({
  code: ['small.common', 'sagm.common', 'small.freight'],
})
@connect(({ mallAgreementApprove, loading }) => ({
  mallAgreementApprove,
  loading: loading.effects['mallAgreementApprove/fetchDetailHeader'],
  approveLoading: loading.effects['mallAgreementApprove/agreementApprove'],
  rejectLoading: loading.effects['mallAgreementApprove/agreementReject'],
  publishLoading: loading.effects['mallAgreementApprove/agreementPublish'],
}))
@Form.create({ fieldNameProp: null })
export default class HandWork extends React.Component {
  constructor(props) {
    super(props);
    const { agreementId } = props.match.params;
    const { pathname } = props.location;
    this.state = {
      agreementId,
      initData: {},
      path: pathname,
      isApprove: props.location.pathname.indexOf('approve') !== -1,
    };
  }

  componentDidMount() {
    this.fetchDetailHeader();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const isApprove = nextProps.location.pathname.indexOf('approve') !== -1;
    if (isApprove !== prevState.isApprove) {
      return {
        isApprove,
      };
    }
    return null;
  }

  /**
   * 查看操作记录
   */
  @Bind()
  handleShowHistory() {
    const { agreementId } = this.props.match.params;
    const organizationId = getCurrentOrganizationId();
    agmRecordModal(
      {
        params: { agreementId },
        url: `v1/${organizationId}/agreement-records/${agreementId}`,
      },
      'PUR'
    );
  }

  @Bind()
  fetchDetailHeader() {
    const { dispatch } = this.props;
    const { agreementId } = this.state;
    dispatch({
      type: 'mallAgreementApprove/fetchDetailHeader',
      payload: {
        agreementId,
        customizeUnitCode,
      },
    }).then((res) => {
      if (res) {
        const result = res.content || [];
        this.setState({ initData: result[0] || {} });
      }
    });
  }

  @Bind()
  handleApproveAndReject(type) {
    const { dispatch, history } = this.props;
    const { initData, isApprove } = this.state;
    dataChangeReq({ type, dispatch, data: [initData] }, () => {
      const backPath = isApprove
        ? '/small/mall-agreement-approve'
        : '/small/mall-agreement-publish';
      history.push(backPath);
    });
  }

  render() {
    const { loading, approveLoading, rejectLoading, publishLoading } = this.props;
    const { path, agreementId, isApprove, initData } = this.state;
    const uploadModalProps = {
      showFilesNumber: false,
      attachmentUUID: initData.uuid,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'small-received-agreement',
      viewOnly: true,
      btnProps: { icon: '' },
      btnText: intl.get('small.common.model.fileView').d('附件查看'),
    };
    return (
      <React.Fragment>
        <Header
          title={
            isApprove
              ? intl.get('small.common.view.mallAgreementApprove').d('商城协议审批')
              : intl.get('small.common.model.mallAgreementPublish').d('商城协议发布')
          }
          backPath={`/small/mall-agreement-${isApprove ? 'approve' : 'publish'}/list`}
        >
          {isApprove ? (
            <>
              <Button
                icon="check"
                type="primary"
                loading={approveLoading}
                onClick={() => this.handleApproveAndReject('approve')}
              >
                {intl.get('small.common.model.pass').d('通过')}
              </Button>
              <Button
                icon="close"
                loading={rejectLoading}
                onClick={() => this.handleApproveAndReject('reject')}
              >
                {intl.get('hzero.common.button.refuse').d('拒绝')}
              </Button>
            </>
          ) : (
            <Button
              icon="check"
              type="primary"
              loading={publishLoading}
              onClick={() => this.handleApproveAndReject('publish')}
            >
              {intl.get('hzero.common.button.publish').d('发布')}
            </Button>
          )}
          <Button onClick={this.handleShowHistory}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
          <UploadModal {...uploadModalProps} />
        </Header>
        <Content>
          <Spin spinning={loading}>
            <BaseInfo baseInfo={initData} />
          </Spin>
          <Tabs animated={false}>
            <Tabs.TabPane tab={intl.get('small.common.view.agreementLine').d('协议行')} key="1">
              <TableList skuReadOnly path={path} baseInfo={initData} agreementId={agreementId} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={intl.get('sagm.common.view.buyPermisson').d('采买权限')} key="3">
              <Authority
                readOnly
                agreementHeaderId={agreementId}
                agreementHeaderNum={initData.agreementNumber}
                viewSkuBackPath={this.props.location.pathname}
              />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
