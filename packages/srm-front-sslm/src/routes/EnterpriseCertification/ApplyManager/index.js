/*
 * ApplyManager - 管理员申请
 * @Date: 2022-06-16 09:57:53
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import React, { Fragment, useCallback, useMemo, useState, useEffect } from 'react';
import { DataSet, Form, TextField, TextArea, Spin, Button, Attachment } from 'choerodon-ui/pro';
import { isEmpty, head, isBoolean, forEach } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';

import styles from '../index.less';
import ValidationSteps from '../components/ValidationSteps';
import { getApplyManagerDS } from '../stores/getApplyManagerDS';

const ApplyManager = ({ location, history, stepsObj = {} }) => {
  const { domesticForeignRelation, secondaryTabConfig } = stepsObj;
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const { changeReqId } = routerParams;
  const dataSet = useMemo(() => new DataSet(getApplyManagerDS()), []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dataSet.query().then(response => {
      if (isEmpty(response)) {
        dataSet.create({});
      } else {
        getResponse(response);
      }
    });
  }, []);

  // 保存
  const handleSave = useCallback(
    (nextFlag = false) => {
      setLoading(true);
      dataSet
        .submit()
        .then(response => {
          if (isBoolean(response) && !response) {
            const errorsMsg = [];
            const { errors = [] } = head(dataSet.getValidationErrors()) || {};
            if (!isEmpty(errors)) {
              forEach(errors, curent => {
                const { validationMessage } = head(curent?.errors) || {};
                if (validationMessage) {
                  errorsMsg.push(<div>{validationMessage}</div>);
                }
              });
              notification.error({
                message: errorsMsg,
              });
            }
            return;
          }
          const res = getResponse(response);
          if (res && nextFlag) {
            // 预览页
            history.push({
              pathname: `/sslm/enterprise-certification/preview`,
              search: querystring.stringify({
                changeReqId,
                domesticForeignRelation,
                source: 'ApplyManager',
              }),
            });
          } else if (res) {
            dataSet.query();
          }
        })
        .finally(() => setLoading(false));
    },
    [domesticForeignRelation]
  );

  // 上一步
  const handleLastStep = useCallback(async () => {
    if (isEmpty(secondaryTabConfig)) {
      history.push({
        pathname: '/sslm/enterprise-certification/main-info',
        search: querystring.stringify({
          changeReqId,
          domesticForeignRelation,
        }),
      });
    } else {
      history.push({
        pathname: '/sslm/enterprise-certification/secondary-info',
        search: querystring.stringify({
          changeReqId,
        }),
      });
    }
  }, []);

  // 下一步
  const handleNext = useCallback(async () => {
    handleSave(true);
  }, [domesticForeignRelation]);

  return (
    <Fragment>
      <Header
        title={intl
          .get('spfm.enterpriseCertification.view.title.enterpriseCertification')
          .d('企业认证')}
      >
        <Button
          icon="arrow_forward"
          color="primary"
          type="primary"
          onClick={handleNext}
          loading={loading}
        >
          {intl.get('sslm.common.view.btn.nextStep').d('下一步')}
        </Button>
        <Button icon="arrow_back" funcType="flat" loading={loading} onClick={handleLastStep}>
          {intl.get('sslm.common.view.btn.lastStep').d('上一步')}
        </Button>
        <Button icon="save" funcType="flat" loading={loading} onClick={() => handleSave()}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>
      <ValidationSteps location={location} stepsObj={stepsObj} />
      <Content wrapperClassName={styles['certification-wrap']}>
        <Spin spinning={loading}>
          <div className={styles['certification-content']}>
            <div className={styles['certification-title']}>
              {intl.get('spfm.enterpriseCertification.view.title.applyManager').d('管理员申请')}
            </div>
            <div className={styles['manual-review-title']}>
              <span />
              {intl.get('spfm.enterpriseCertification.view.title.basicInfo').d('基本信息')}
            </div>
            <Form
              dataSet={dataSet}
              labelLayout="float"
              style={{ width: 300, marginTop: 16, marginBottom: 32 }}
            >
              <TextField name="applicantName" />
              <TextArea name="reason" />
            </Form>
            <div className={styles['manual-review-title']}>
              <span />
              {intl.get('spfm.enterpriseCertification.view.title.attachment').d('附件')}
            </div>
            <div className={styles['certification-title-help']} style={{ marginTop: 4 }}>
              {intl
                .get('spfm.enterpriseCertification.view.message.attachmentMsg')
                .d('请上传可以证明您在该企业中有管理身份的相关附件，如名片/组织架构等信息。')}
            </div>
            <Form dataSet={dataSet} labelLayout="float" style={{ marginTop: 16, width: 300 }}>
              <Attachment
                name="attachmentUuid"
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="spfm-comp"
                beforeUpload={() => setLoading(true)}
                onUploadSuccess={() => setLoading(false)}
                onUploadError={() => setLoading(false)}
              />
            </Form>
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default ApplyManager;
