import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isNull } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Divider } from 'hzero-ui';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { getCurrentOrganizationId } from 'utils/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { PUBLIC_BUCKET } from '_utils/config';
import Spin from 'hzero-ui/es/spin';

@formatterCollections({ code: ['spfm.notice', 'entity.attachment'] })
@connect(({ loading, noticeSite }) => ({
  noticeSite,
  tenantId: getCurrentOrganizationId(),
  queryNoticeLoading: loading.effects['noticeSite/queryNotice'],
}))
export default class NoticeDetail extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      attachmentUuid: uuidv4(),
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { noticeId },
      },
    } = this.props;
    this.queryNoticeDetail({ noticeId }).then((res) => {
      if (res && res.attachmentUuid) {
        this.handleUuid(res);
      }
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'noticeSite/updateState',
      payload: {
        noticeHisotryList: [],
        noticeDetail: {
          noticeContent: {
            noticeBody: '',
          },
        },
        noticeBodyWord: '',
      },
    });
  }

  /**
   * @function fetchNoticeDetail - 查询公告详情
   * @param {object} params - 查询参数
   */
  queryNoticeDetail(params = {}) {
    const {
      dispatch,
      organizationId,
      match: {
        params: { noticeId },
      },
    } = this.props;
    return dispatch({
      type: 'noticeSite/queryNotice',
      payload: { organizationId, noticeId, ...params },
    });
  }

  @Bind()
  renderProcessStatus(actionId, noticeId) {
    switch (actionId) {
      case '1':
        return '/spfm/noticeSite/list';
      case '2':
        return `/spfm/noticeSite/detail/${noticeId}`;
      case '3':
        return '';
      default:
        return '';
    }
    // actionId === '1' ? '/spfm/notices/list' : `/spfm/notices/detail/${noticeId}`;
  }

  /**
   * handleUuid - 获取uuid
   * @param {object} data - 报价模板头数据
   *  @param {string} data.attachmentUuid - 文件上传下载所需的uuid
   */
  @Bind()
  handleUuid(data = {}) {
    if (data.attachmentUuid) {
      this.setState({
        attachmentUuid: data.attachmentUuid,
      });
    }
  }

  render() {
    const {
      noticeSite: {
        noticeDetail,
        noticeDetail: {
          noticeContent: { noticeBody },
        },
      },
      // tenantId,
      match: {
        params: { noticeId, actionId },
      },
      queryNoticeLoading,
    } = this.props;
    const { attachmentUuid } = this.state;
    const uploadModalProps = {
      // tenantId,
      filePreview: true,
      btnProps: {
        disabled: false,
        type: 'primary',
      },
      btnText: intl.get(`entity.attachment.tag`).d('附件'),
      bucketName: PUBLIC_BUCKET,
      bucketDirectory: 'spfm-notice-detail',
      viewOnly: true,
      attachmentUUID:
        isEmpty(noticeDetail.attachmentUuid) || isNull(noticeDetail.attachmentUuid)
          ? attachmentUuid
          : noticeDetail.attachmentUuid,
      onCloseUploadModal: this.handleAttachmentUUID,
      showFilesNumber: false,
    };
    const backAddress = this.renderProcessStatus(actionId, noticeId);
    return (
      <React.Fragment>
        <Header
          title={intl.get('spfm.notice.view.message.title.preview').d('公告预览')}
          backPath={backAddress}
        >
          <UploadModal {...uploadModalProps} />
        </Header>
        <Content>
          <Spin spinning={queryNoticeLoading}>
            <div style={{ textAlign: 'center', fontSize: '24px' }}>{noticeDetail.title}</div>
            <Divider />
            <div dangerouslySetInnerHTML={{ __html: noticeBody }} />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
