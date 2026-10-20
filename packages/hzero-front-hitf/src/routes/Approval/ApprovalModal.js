import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { DataSet, Form, TextArea } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { approvalFormDS } from '@/stores/Approval/ApprovalDS';
import getLang from '@/langs/approvalLang';

export default class ApprovalModal extends React.Component {
  constructor(props) {
    super(props);

    this.approvalFormDS = new DataSet(approvalFormDS());
  }

  componentDidMount() {
    const { approvalData } = this.props;
    this.approvalFormDS.create(approvalData);
    this.updateModalProps();
  }

  @Bind()
  updateModalProps() {
    const { path } = this.props;
    this.props.modal.update({
      footer: () => (
        <>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.reject`,
                type: 'button',
                meaning: '我的接口申请-拒绝',
              },
            ]}
            type="c7n-pro"
            onClick={() => this.toggleAction('reject')}
          >
            {getLang('REJECT')}
          </ButtonPermission>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.agree`,
                type: 'button',
                meaning: '我的接口申请-同意',
              },
            ]}
            type="c7n-pro"
            color="primary"
            onClick={() => this.toggleAction('approve')}
          >
            {getLang('AGREE')}
          </ButtonPermission>
        </>
      ),
    });
  }

  /**
   * 同意/拒绝
   * @param type: approve/reject
   */
  async toggleAction(type) {
    const validate = await this.approvalFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { onRefresh = () => {} } = this.props;
    this.approvalFormDS.current.set('_requestType', type);
    return this.approvalFormDS.submit().then((res) => {
      if (res && !res.failed) {
        this.props.modal.close();
        onRefresh();
      }
      return false;
    });
  }

  render() {
    return (
      <Form dataSet={this.approvalFormDS}>
        <TextArea name="approvalReason" rows={8} />
      </Form>
    );
  }
}
