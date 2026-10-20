/**
 * notice - 公告管理-详情页面-工作台进入
 * @date: 2019-10-11
 * @author: lvShuo
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isNull } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Divider } from 'hzero-ui';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { PUBLIC_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import Spin from 'hzero-ui/es/spin';

@formatterCollections({ code: ['spfm.notice', 'entity.attachment'] })
@connect(({ loading, notice }) => ({
  notice,
  tenantId: getCurrentOrganizationId(),
  queryNoticeLoading: loading.effects['notice/queryNoticeOnly'],
}))
export default class NoticeDetail extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      attachmentUuid: uuidv4(),
      noticeDetailOnly: {},
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { noticeId },
      },
      dispatch,
      tenantId,
    } = this.props;
    // const search = window.location.search.substr(1);
    // const params = search.split('&') || [];
    // const noticeId = params[0] || '';
    this.queryNoticeDetail({ noticeId }).then((res) => {
      if (res && res.attachmentUuid) {
        this.handleUuid(res);
      }
    });
    dispatch({
      type: 'notice/fetchNoticeTimes',
      payload: {
        noticeId,
        userId: tenantId,
      },
    });
  }

  componentDidUpdate(PrevProps) {
    const {
      match: {
        params: { noticeId },
      },
    } = this.props;
    if (PrevProps.match.params.noticeId !== noticeId) {
      this.queryNoticeDetail({ noticeId }).then((res) => {
        if (res && res.attachmentUuid) {
          this.handleUuid(res);
        }
      });
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'notice/updateState',
      payload: {
        noticeDetailOnly: {
          noticeContent: {
            noticeBody: '',
          },
        },
        noticeBodyWordOnly: '',
      },
    });
  }

  /**
   * @function fetchNoticeDetail - 查询公告详情
   * @param {object} params - 查询参数
   */
  queryNoticeDetail(params = {}) {
    const { dispatch, organizationId } = this.props;
    return dispatch({
      type: 'notice/queryNoticeOnly',
      payload: { organizationId, ...params },
    }).then((res) => {
      if (res) {
        this.setState({
          noticeDetailOnly: res,
        });
      }
    });
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
    const { queryNoticeLoading } = this.props;
    const { attachmentUuid, noticeDetailOnly } = this.state;
    const noticeBody = isEmpty(noticeDetailOnly.noticeContent)
      ? null
      : noticeDetailOnly.noticeContent.noticeBody;
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
        isEmpty(noticeDetailOnly.attachmentUuid) || isNull(noticeDetailOnly.attachmentUuid)
          ? attachmentUuid
          : noticeDetailOnly.attachmentUuid,
      onCloseUploadModal: this.handleAttachmentUUID,
      // showFilesNumber: false,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('hzero.common.view.title.noticePreviewOnly').d('公告预览')}
          backPath=""
        >
          <UploadModal {...uploadModalProps} />
        </Header>
        <Content>
          <Spin spinning={queryNoticeLoading}>
            <div style={{ textAlign: 'center', fontSize: '24px' }}>{noticeDetailOnly.title}</div>
            <Divider />
            <div dangerouslySetInnerHTML={{ __html: noticeBody }} />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
