import React from 'react';
import intl from 'utils/intl';
import { flow } from 'lodash';
import { Modal, DataSet, Form } from 'choerodon-ui/pro';
import { SRM_SPCM } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import FormField from '@/routes/components/GeneralForm/FormField';

const organizationId = getCurrentOrganizationId();
const useInfo = getCurrentUser();

const smartReviewDS = () => {
  return {
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get(`spcm.workspace.model.pushsap.status`).d('同步状态'),
        name: 'importStatus',
      },
      {
        label: intl.get(`spcm.contractTemplate.model.fileName`).d('文件名'),
        name: 'fileName',
      },
      {
        label: intl.get(`spcm.contractTemplate.model.standpoint`).d('合同立场'),
        name: 'standPoint',
        defaultValue: intl.get('spcm.contractTemplate.message.standpoint.default').d('买方'),
        required: true,
      },
      {
        label: intl.get(`spcm.contractTemplate.model.cusCheckContent`).d('自定义审查内容'),
        name: 'message',
      },
      {
        label: intl.get(`spcm.contractTemplate.model.lawyer`).d('审查发起人'),
        name: 'lawyer',
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/smart-review-tasks/create-review`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};

const SmartReview = flow(
  withCustomize({
    unitCode: ['SPCM.CONTRACT.TEMPLATE.SMARTREVIEW'],
  })
)((props) => {
  const { dataSet, customizeForm } = props;

  return (
    <div>
      <div>
        <h4>{intl.get(`spcm.common.view.title.checkBeforeReview`).d('审查须知')}</h4>
        <p>
          {intl.get('spcm.contractTemplate.tips.smartReview1').d('① 结果位置：完成后页面顶部提示')}
        </p>
        <p>
          {intl
            .get('spcm.contractTemplate.tips.smartReview2')
            .d('② 处理时间：约 3-5 分钟，可等待或稍后查看')}
        </p>
        <p>
          {intl
            .get('spcm.contractTemplate.tips.smartReview3')
            .d('③ 多次审查：新任务覆盖进行中结果，历史任务需手动查询获取')}
        </p>
        <p>
          {intl
            .get('spcm.contractTemplate.tips.smartReview4')
            .d('④ 有效期：结果链接自任务创建日 15 天内有效')}
        </p>
      </div>
      <div>
        {customizeForm(
          {
            code: 'SPCM.CONTRACT.TEMPLATE.SMARTREVIEW',
          },
          <Form
            dataSet={dataSet}
            columns={1}
            labelWidth={120}
            labelAlign="left"
            // labelLayout="float"
          >
            <FormField name="fileName" />
            <FormField name="standPoint" isEdit />
            <FormField name="message" isEdit componentType="TEXTAREA" />
            <FormField name="lawyer" />
          </Form>
        )}
      </div>
    </div>
  );
});

export default SmartReview;

export function showSmartReview(props = {}) {
  const { data = {}, startPolling = () => {}, handleWpsSave } = props;
  const smartReviewDs = new DataSet(smartReviewDS());
  smartReviewDs.create({
    lawyer: useInfo?.realName,
    fileName: data?.fileName,
    documentId: data?.pcTemplateFileId,
    fileUrl: data?.fileUrl,
  });

  Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get('spcm.common.view.title.smartReview').d('智能审查'),
    children: <SmartReview {...props} dataSet={smartReviewDs} record={data} />,
    closable: true,
    movable: false,
    destroyOnClose: true,
    okText: intl.get('spcm.common.button.startReview').d('开始审查'),
    style: { width: 380 },
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    okProps: {
      wait: 500,
    },
    onOk: async () => {
      const saveRes = await handleWpsSave(); // 手动保存编辑文档
      if (!saveRes) {
        return false;
      }
      const validFlag = await smartReviewDs.validate(); // 校验表单数据
      if (!validFlag) {
        return false;
      }
      const res = await smartReviewDs.submit(); // 提交审查任务
      if (res) {
        startPolling();
      }
      return res;
    },
  });
}
