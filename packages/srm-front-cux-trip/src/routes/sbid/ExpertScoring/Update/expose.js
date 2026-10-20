import { Modal, Form, CheckBox, DataSet } from 'choerodon-ui/pro';

import { Expose } from 'utils/remote';
import request from 'utils/request';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MARMOT } from '_utils/config';
import intl from 'utils/intl';

const scoreConfirmRequest = (requestConfig) => {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/ThicF2x13ACKRHn77NcT2ofQCG1hByIGb7Rt9iaiaMcIeaRBGP4b6c4gT7pCj21rQta`, requestConfig);
};

export default new Expose({
  events: {
    remoteStartScore: async (eventProps) => {
      const { startScoreFunc, item, that } = eventProps || {};
      const { match } = that.props;
      const {
        expertUserId,
        sourceHeaderId,
      } = match.params;
      // 开始评分、重新评分 前需判断是否需要评分确认提醒
      if ((!item.scoreStatus || item.scoreStatus === 'RESCORING') && sourceHeaderId && expertUserId) {
        try {
          const res = await scoreConfirmRequest({
            method: 'GET',
            query: {
              rfxHeaderId: sourceHeaderId,
              expertUserId,
            },
          });
          if (!getResponse(res)) return;
          if (res && ["0", 0].includes(res.expertConfirmFlag)) {
            const ds = new DataSet({
              autoCreate: true,
              fields: [{
                name: 'checkValue',
                type: 'boolean',
                defaultValue: false,
                validator: (value) => {
                  if (!value) {
                    return intl.get('scux.ssrc.expertScoring.update.trip.confirmCheckedValue').d('请勾选确认框！');
                  };
                },
              }],
            });
            Modal.open({
              key: Modal.key(),
              header: null,
              destroyOnClose: true,
              closable: false,
              cancelButton: false,
              style: { width: 720 },
              children: (
                <div>
                  <div style={{ padding: '0 .08rem' }}>
                    <div>{intl.get('scux.ssrc.expertScoring.update.trip.startScoreConfirm').d('利益冲突承诺确认')}</div>
                    <br />
                    <div>{intl.get('scux.ssrc.expertScoring.update.trip.startScoreConfirmContent1').d('本人已仔细阅读并完全理解《采购制度》和《员工手册》中关于员工利益冲突的全部内容，清楚知晓作为采购人员在执行采购业务过程中需遵守的利益冲突相关规定及违规后果。')}</div>
                    <br />
                    <div>{intl.get('scux.ssrc.expertScoring.update.trip.startScoreConfirmContent2').d('本人郑重承诺，将严格遵守公司制度要求，恪守职业道德，确保采购活动的公正性与廉洁性。')}</div>
                    <br />
                  </div>
                  <Form dataSet={ds} labelLayout="none" columns={1}>
                    <CheckBox name="checkValue">
                      {intl.get('scux.ssrc.expertScoring.update.trip.startScoreConfirmCheck').d('本人确认已知悉并同意以上承诺')}
                    </CheckBox>
                  </Form>
                </div>
              ),
              okText: intl.get('scux.ssrc.expertScoring.update.trip.readAndAgreed').d('我已阅读并同意'),
              onOk: async () => {
                if (await ds.validate()) {
                  await scoreConfirmRequest({
                    method: 'POST',
                    query: {
                      rfxHeaderId: sourceHeaderId,
                      expertUserId,
                    },
                  });
                  if (startScoreFunc) {
                    startScoreFunc();
                  };
                  return true;
                };
                return false;
              },
            });
          } else if (startScoreFunc) {
            startScoreFunc();
          };
        } catch (error) {
          throw error;
        };
        return;
      };
      if (startScoreFunc) {
        startScoreFunc();
      };
    },
    cuxBeforeSwitchDimension: async (eventProps) => {
      const { that } = eventProps || {};
      const { activeKey, supplierDimension } = that.state;
      const { match } = that.props;
      const {
        expertUserId,
        sourceHeaderId,
      } = match.params;
      // 切换为评分要素维度
      if(!supplierDimension[activeKey]) {
        const res = await scoreConfirmRequest({
            method: 'GET',
            query: {
              rfxHeaderId: sourceHeaderId,
              expertUserId,
            },
          });
          if (!getResponse(res)) return false;
          if (res && ["0", 0].includes(res.expertConfirmFlag)) {
            const ds = new DataSet({
              autoCreate: true,
              fields: [{
                name: 'checkValue',
                type: 'boolean',
                defaultValue: false,
                validator: (value) => {
                  if (!value) {
                    return intl.get('scux.ssrc.expertScoring.update.trip.confirmCheckedValue').d('请勾选确认框！');
                  };
                },
              }],
            });
            const promiseRes = await new Promise((resolve) => {
                Modal.open({
                key: Modal.key(),
                header: null,
                destroyOnClose: true,
                closable: false,
                cancelButton: false,
                style: { width: 720 },
                children: (
                  <div>
                    <div style={{ padding: '0 .08rem' }}>
                      <div>{intl.get('scux.ssrc.expertScoring.update.trip.startScoreConfirm').d('利益冲突承诺确认')}</div>
                      <br />
                      <div>{intl.get('scux.ssrc.expertScoring.update.trip.startScoreConfirmContent1').d('本人已仔细阅读并完全理解《采购制度》和《员工手册》中关于员工利益冲突的全部内容，清楚知晓作为采购人员在执行采购业务过程中需遵守的利益冲突相关规定及违规后果。')}</div>
                      <br />
                      <div>{intl.get('scux.ssrc.expertScoring.update.trip.startScoreConfirmContent2').d('本人郑重承诺，将严格遵守公司制度要求，恪守职业道德，确保采购活动的公正性与廉洁性。')}</div>
                      <br />
                    </div>
                    <Form dataSet={ds} labelLayout="none" columns={1}>
                      <CheckBox name="checkValue">
                        {intl.get('scux.ssrc.expertScoring.update.trip.startScoreConfirmCheck').d('本人确认已知悉并同意以上承诺')}
                      </CheckBox>
                    </Form>
                  </div>
                ),
                okText: intl.get('scux.ssrc.expertScoring.update.trip.readAndAgreed').d('我已阅读并同意'),
                onOk: async () => {
                  if (await ds.validate()) {
                    await scoreConfirmRequest({
                      method: 'POST',
                      query: {
                        rfxHeaderId: sourceHeaderId,
                        expertUserId,
                      },
                    });
                    resolve(true);
                    return true;
                  };
                  return false;
                },
                onCancel: () => {
                  resolve(false);
                }
              });
            });
            return promiseRes;
          } 
      }
      return true;
    }
  }
});