/*
 * @Description: 分屏模式-标的和阶段
 * @Date: 2025-01-21 19:19:44
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { flow } from 'lodash';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import NotExtract from '@/routes/components/NotExtract';
import SubjectInfo from './SubjectInfo';
import StageInfo from './StageInfo';
import ContractSubject from '../../ContractSubject';
import ContractStage from '../../ContractStage';

import styles from '../index.less';

const { Panel } = Collapse;

const defaultActiveKey = ['contractSubject', 'contractStage'];

const SubjectAndStage = (props) => {
  const { editable, contractStageListProps, contractSubjectListProps, customizeForm } = props;
  const { pcStageDs } = contractStageListProps;
  const { pcSubjectDs } = contractSubjectListProps;

  const [dirtyFlag, setDirtyFlag] = useState(false);

  useEffect(() => {
    // 初始化校验一下数据，是否有误，用于卡片头标红处理
    // eslint-disable-next-line no-unused-expressions
    pcSubjectDs && pcSubjectDs.validate();
    // eslint-disable-next-line no-unused-expressions
    pcStageDs && pcStageDs.validate();
  }, [pcSubjectDs, pcStageDs]);

  const handleSubject = () => {
    const viewProps = editable
      ? {
          onOk: async () => {
            const validate = await pcSubjectDs.validate();
            if (validate) {
              if (!pcSubjectDs.dirty) {
                return true;
              }
              const res = await pcSubjectDs.submit();
              return !!res;
            }
            return false;
          },
          afterClose: async () => {
            if (pcSubjectDs.dirty) {
              const validate = await pcSubjectDs.validate();
              if (!validate) {
                setDirtyFlag(!dirtyFlag);
              }
            }
          },
        }
      : {
          cancelProps: {
            color: 'primary',
          },
          cancelText: intl.get('hzero.common.button.close').d('关闭'),
          footer: (okBtn, cancelBtn) => cancelBtn,
        };
    Modal.open({
      drawer: true,
      closable: true,
      movable: false,
      key: Modal.key(),
      title: intl.get(`spcm.common.view.message.title.contractSubject`).d('协议标的'),
      style: {
        width: 1080,
      },
      children: (
        <ContractSubject
          custCode={
            editable ? 'SPCM.WORKSPACE_DETAIL.SUBJECT' : 'SPCM.WORKSPACE_DETAIL.SUBJECT.READONLY'
          }
          {...contractSubjectListProps}
        />
      ),
      // onCancel: () => pcSubjectDs.reset(),
      ...viewProps,
    });
  };

  const handleStage = async () => {
    if (pcSubjectDs.length) {
      const validate = await pcSubjectDs.validate();
      if (!validate) {
        notification.warning({
          message: intl
            .get('spcm.common.view.msg.checkSubjectValidate')
            .d('请检查标的信息是否正确'),
        });
        return false;
      }
      // const res = await pcSubjectDs.submit();
      // if (!res) {
      //   return false;
      // }
    }
    const viewProps = editable
      ? {
          onOk: async () => {
            const validate = await pcStageDs.validate();
            if (validate) {
              const res = await pcStageDs.submit();
              return !!res;
            }
            return false;
          },
          afterClose: async () => {
            if (pcStageDs.dirty) {
              const validate = await pcStageDs.validate();
              if (!validate) {
                setDirtyFlag(!dirtyFlag);
              }
            }
          },
        }
      : {
          cancelProps: {
            color: 'primary',
          },
          cancelText: intl.get('hzero.common.button.close').d('关闭'),
          footer: (okBtn, cancelBtn) => cancelBtn,
        };
    Modal.open({
      drawer: true,
      closable: true,
      movable: false,
      key: Modal.key(),
      title: intl.get(`spcm.common.view.message.title.contractStage`).d('协议阶段'),
      style: {
        width: 1080,
      },
      children: (
        <ContractStage
          custCode={
            editable ? 'SPCM.WORKSPACE_DETAIL.STAGE' : 'SPCM.WORKSPACE_DETAIL.STAGE.READONLY'
          }
          {...contractStageListProps}
        />
      ),
      // onCancel: () => pcStageDs.reset(),
      ...viewProps,
    });
  };

  return (
    <div className={styles['spcm-workSpace-contract-extract']} id="spcm-workSpace-contract-extract">
      <Collapse
        trigger="text-icon"
        ghost
        expandIconPosition="text-right"
        defaultActiveKey={defaultActiveKey}
      >
        <Panel
          key="contractSubject"
          id="spcm-workSpace-contract-extract-contractSubject"
          header={intl.get(`spcm.common.view.message.title.contractSubject`).d('协议标的')}
          extra={
            pcSubjectDs?.length ? (
              <Button onClick={handleSubject} size="small" funcType="link" color="primary">
                {intl.get('spcm.common.view.msg.viewAll').d('查看全部')}
              </Button>
            ) : null
          }
        >
          {pcSubjectDs?.length ? (
            <SubjectInfo customizeForm={customizeForm} {...contractSubjectListProps} />
          ) : (
            <NotExtract
              title={intl.get(`spcm.common.view.message.title.contractSubject`).d('协议标的')}
              onNewLine={handleSubject}
            />
          )}
        </Panel>
        <Panel
          key="contractStage"
          id="spcm-workSpace-contract-extract-contractStage"
          header={intl.get(`spcm.common.view.message.title.contractStage`).d('协议阶段')}
          extra={
            pcStageDs?.length ? (
              <Button onClick={handleStage} size="small" funcType="link" color="primary">
                {intl.get('spcm.common.view.msg.viewAll').d('查看全部')}
              </Button>
            ) : null
          }
        >
          {pcStageDs?.length ? (
            <StageInfo customizeForm={customizeForm} {...contractStageListProps} />
          ) : (
            <NotExtract
              title={intl.get(`spcm.common.view.message.title.contractStage`).d('协议阶段')}
              onNewLine={handleStage}
            />
          )}
        </Panel>
      </Collapse>
    </div>
  );
};

export default flow(
  observer,
  withCustomize({
    unitCode: ['SPCM.WORKSPACE_DETAIL.STAGE.EXTRACT', 'SPCM.WORKSPACE_DETAIL.SUBJECT.EXTRACT'],
  })
)(SubjectAndStage);
