/*
 * SealGeneration  - 印章生成弹框
 * @date: 2021-09-14
 * @author: HB <xinying.li@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Drawer, Button, Tooltip } from 'hzero-ui';
import { DataSet, Form, TextField, TextArea, Select, Icon, Spin } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { queryHistoryVersion } from '@/services/sealMangeSdatService';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import hTextIMG from '@/assets/hText.png';
import qTextIMG from '@/assets/qText.png';
import successIMG from '@/assets/icon-seal-success.svg';
import failedIMG from '@/assets/icon-seal-failed.svg';

import HistoricVersion from '../HistoricVersion/index';
import styles from './index.less';

const bucketDirectory = 'spfm-comp';
const DEFAULT_BUCKET_NAME = PRIVATE_BUCKET;
const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: ['hzero.common', 'spcm.common', 'spfm.sealmanage', 'spfm.configServer'],
})
export default class SealGeneration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sealStatus: 'form',
      sealFileUrl: '',
      successData: {}, // 用于存储生成印章成功返回的数据
      btnFlag: true, // 控制生成印章按钮的显隐
    };
    this.newDs = new DataSet(this.createDs());
  }

  @Bind()
  createDs() {
    return {
      autoCreate: true,
      fields: [
        {
          name: 'sealCode',
          type: 'string',
          label: intl.get(`spfm.sealmanage.model.sealCode`).d('印章编码'),
          required: true,
          validator: async (value) => {
            if (value) {
              const rules = /^[A-Z|\d]+$/;
              if (!rules.test(value)) {
                return intl
                  .get(`spfm.sealmanage.view.message.title.lettersOrNumbers`)
                  .d('印章编码只能由大写字母或数字组成');
              }
              const res = await queryHistoryVersion({ sealCode: value });
              if (res && res?.content?.length !== 0) {
                return intl
                  .get('spfm.sealmanage.view.message.sealCodeDuplication')
                  .d('印章编码重复，请重新进行填写');
              }
            }
          },
        },
        {
          name: 'templateType',
          type: 'string',
          label: intl.get(`spcm.common.model.templateType`).d('模板类型'),
          textField: 'meaning',
          valueFiled: 'value',
          lookupCode: 'SPFM.GENERATE_STAMP.TEMPLATE_TYPE',
          required: true,
        },
        {
          name: 'sealColor',
          type: 'string',
          label: intl.get(`spfm.sealmanage.model.generateSealColor`).d('生成印章颜色'),
          textField: 'meaning',
          valueFiled: 'value',
          lookupCode: 'SPFM.GENERATE_STAMP.COLOR',
          required: true,
        },
        {
          label: intl.get(`spfm.sealmanage.model.sealType`).d('印章类型'),
          name: 'sealBizType',
          type: 'string',
          lookupCode: 'SPFM.SEAL_BIZ_TYPE',
          dynamicProps: {
            required: ({ record }) => {
              return record && record.get('isValid');
            },
          },
        },
        {
          name: 'isValid',
        },
        {
          name: 'hText',
          type: 'Number',
          label: intl.get(`spfm.sealmanage.model.horizontalSeal`).d('印章横向文'),
          dynamicProps: {
            required: ({ record }) => record.get('templateType') === 'RECT',
          },
        },
        {
          name: 'qText',
          type: 'string',
          label: intl.get(`spfm.sealmanage.model.sealBottomText`).d('印章下弦文'),
        },
        {
          name: 'remark',
          type: 'string',
          label: intl.get(`hzero.common.remark`).d('备注'),
        },
      ],
    };
  }

  /**
   * 关闭模态框
   */
  @Bind()
  handleCancelModal() {
    const { onHandleCancel } = this.props;
    onHandleCancel();
  }

  /**
   * 生成印章
   */
  @Bind()
  async generateSeal() {
    const { dispatch, companyId, partnerTenant } = this.props;
    const isRequire = await this.newDs.validate();
    const list = this.newDs.toData();

    if (isRequire) {
      this.setState({
        sealStatus: 'pending',
        btnFlag: false,
      });
      dispatch({
        type: 'sealMangeSdat/generateSeal',
        payload: {
          ...list?.[0],
          companyId,
          partnerTenant,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            sealStatus: 'success',
            sealFileUrl: res.sealFileUrl,
            successData: res,
          });
        } else {
          this.setState({
            sealStatus: 'failed',
          });
        }
      });
    }
  }

  /**
   * 同步到系统
   */
  @Bind()
  synchronize() {
    const { dispatch, companyId, partnerTenant } = this.props;
    const { successData, sealFileUrl } = this.state;
    const list = this.newDs.toData();
    dispatch({
      type: 'sealMangeSdat/synchronize',
      payload: {
        ...list?.[0],
        companyId,
        sealFileUrl,
        partnerTenant,
        attachmentUuid: successData.attachmentUuid,
      },
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  render() {
    const { visible, otherModalProps, bucketName = DEFAULT_BUCKET_NAME, tenantNum } = this.props;
    const { sealStatus, sealFileUrl, btnFlag } = this.state;

    // 二开埋点
    const isShow = tenantNum === 'SRM-EPPEN';

    if (this.newDs && this.newDs.current) {
      this.newDs.current.set('isValid', !!isShow);
    }

    const modalProps = {
      visible,
      width: 380,
      footer: null,
      onClose: this.handleCancelModal,
      title: intl.get(`spfm.sealmanage.view.message.title.generateStamp`).d('生成印章'),
      ...otherModalProps,
      mask: true,
      placement: 'right',
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      style: {
        height: 'calc(100% - 103px)',
        overflow: 'auto',
        padding: '4px 24px 16px 24px',
      },
      zIndex: 999,
    };

    const obj = {
      // 表单页面
      form: (
        <div className={styles.content}>
          <Form dataSet={this.newDs} labelLayout="float" columns={1}>
            <TextField colSpan={3} name="sealCode" maxLength={13} />
            <div className={styles['modal-form-help-msg']}>
              {intl
                .get('spfm.sealmanage.view.message.sealCodeHelpMsg')
                .d('请填写1-13位数字或大写字母')}
            </div>
            <Select colSpan={3} name="templateType" />
            <Select colSpan={3} name="sealColor" />
            {isShow && <Select colSpan={3} name="sealBizType" required={isShow} />}
            <TextField
              colSpan={3}
              name="hText"
              maxLength={8}
              addonAfter={
                <Tooltip
                  placement="bottomRight"
                  title={
                    <div>
                      <p>
                        {intl.get(`spfm.sealmanage.model.horizontalSealSignal`).d('印章横向文示意')}
                      </p>
                      <img src={hTextIMG} alt="" width="125" height="84" />
                    </div>
                  }
                >
                  <Icon type="help" />
                </Tooltip>
              }
            />
            <TextField
              colSpan={3}
              name="qText"
              maxLength={20}
              addonAfter={
                <Tooltip
                  placement="bottomRight"
                  title={
                    <div>
                      <p>
                        {intl.get(`spfm.sealmanage.model.sealBottomTextSignal`).d('印章下弦文示意')}
                      </p>
                      <img src={qTextIMG} alt="" width="125" height="84" />
                    </div>
                  }
                >
                  <Icon type="help" />
                </Tooltip>
              }
            />
            <TextArea colSpan={3} name="remark" maxLength={50} />
          </Form>
        </div>
      ),
      // 印章成功页面
      success: (
        <div
          style={{
            width: '340px',
            border: '1px dashed rgba(0,0,0,0.20)',
            marginTop: '16.5px',
            borderRadius: '2px',
            background: '#FBFBFC',
          }}
        >
          <div className={styles['generateSeal-message']}>
            <span>
              <img className={styles['icon-style']} src={successIMG} alt="" />
              {intl.get(`spfm.sealmanage.view.message.generateSealSuccess`).d('印章生成成功！')}
            </span>
            <p>
              {intl
                .get(`spfm.sealmanage.view.message.Safekeeping`)
                .d('请妥善保管，作为用户签署印章使用。')}
            </p>
            <img
              src={getAttachmentUrl(sealFileUrl, bucketName, tenantId, bucketDirectory)}
              alt=""
              width="130"
              // height="100"
            />
            <p>
              <a
                style={{ marginRight: '20px' }}
                download=""
                href={getAttachmentUrl(sealFileUrl, bucketName, tenantId, bucketDirectory)}
              >
                <Icon type="get_app" style={{ marginRight: '7px' }} />
                {intl.get(`spfm.sealmanage.view.message.downloadSeal`).d('下载印章')}
              </a>
              <a onClick={this.synchronize}>
                <Icon type="autorenew" style={{ marginRight: '7px' }} />
                {intl.get(`spfm.sealmanage.view.message.synchronizeToSystem`).d('同步到系统')}
              </a>
            </p>
          </div>
        </div>
      ),
      // 印章失败页面
      failed: (
        <div
          style={{
            width: '340px',
            height: '160px',
            border: '1px dashed rgba(0,0,0,0.20)',
            marginTop: '16.5px',
            borderRadius: '2px',
            background: '#FBFBFC',
          }}
        >
          <div className={styles['generateSeal-message']}>
            <span>
              <img className={styles['icon-style']} src={failedIMG} alt="" />
              {intl.get(`spfm.sealmanage.view.message.generateSealFailed`).d('印章生成失败！')}
            </span>
            <p>
              {intl
                .get(`spfm.sealmanage.view.message.contactAdministrator`)
                .d('请联系管理员进行处理。')}
              <a
                onClick={() => {
                  this.setState({ sealStatus: 'form', btnFlag: true });
                }}
              >
                {intl.get(`spfm.sealmanage.view.message.backToEdit`).d('返回编辑信息')}
              </a>
            </p>
          </div>
        </div>
      ),
      // loading页面
      pending: (
        <div
          style={{
            width: '340px',
            height: '206px',
            border: '1px dashed rgba(0,0,0,0.20)',
            marginTop: '16.5px',
            borderRadius: '2px',
            background: '#FBFBFC',
          }}
        >
          <div className={styles['generateSeal-message']} style={{ margin: '70px' }}>
            <p>
              <Spin />
            </p>
            <span>
              {intl.get(`spfm.sealmanage.view.message.waitPatiently`).d('印章生成中，请耐心等待…')}
            </span>
          </div>
        </div>
      ),
    };
    return (
      <Drawer {...modalProps}>
        <div className={styles['drawer-page']}>{obj[sealStatus]}</div>
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'left',
            zIndex: 100,
            display: 'flex',
          }}
        >
          <Button
            type="primary"
            style={{ marginRight: '8px' }}
            onClick={this.generateSeal}
            disabled={!btnFlag}
          >
            {intl.get(`spfm.sealmanage.view.message.title.generateStamp`).d('生成印章')}
          </Button>
          <Button style={{ marginRight: '8px' }} onClick={this.handleCancelModal}>
            {intl.get(`hzero.common.status.closed`).d('关闭')}
          </Button>
          <HistoricVersion />
        </div>
      </Drawer>
    );
  }
}
