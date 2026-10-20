/*
 * @Description: 批量下载
 * @Date: 2022-06-29 10:52:52
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useEffect } from 'react';
import {
  Row,
  Col,
  Modal,
  DataSet,
  TextField,
  Form,
  Select,
  CheckBox,
  Radio,
  Icon,
  Tooltip,
} from 'choerodon-ui/pro';
import { queryUnifyIdpValue } from 'services/api';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';
import { ReactComponent as TypeFile } from '@/assets/typeFile.svg';
import { ReactComponent as ContractFile } from '@/assets/contractFile.svg';
import styles from './index.less';

import { fileDownloadDS } from './FileDownloadDS';

const getPoptips = (title) => (
  <Tooltip placement="top" title={title}>
    <Icon type="help" style={{ color: '#868d9c', marginLeft: '5px', verticalAlign: 'sub' }} />
  </Tooltip>
);

const ModalChildren = (props) => {
  const { fileDownloadDs, attachTypeList } = props;
  const typeFileLang = {
    contract1: intl.get(`spcm.common.view.message.contract`).d('协议') + 1,
    contract2: intl.get(`spcm.common.view.message.contract`).d('协议') + 2,
    contract3: intl.get(`spcm.common.view.message.contract`).d('协议') + 3,
    attachment1: intl.get('hzero.common.upload.modal.title').d('附件') + 1,
    attachment3: intl.get('hzero.common.upload.modal.title').d('附件') + 3,
    purchaserAttachment: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
    electronicSignatureAttachment: intl
      .get(`spcm.common.view.btn.electronicSignatureAttachment`)
      .d('电子签章附件'),
    attachment: intl.get('hzero.common.upload.modal.title').d('附件'),
  };
  useEffect(() => {
    Object.keys(typeFileLang).forEach((key) => {
      const eles = document.querySelectorAll(`[id=${key}]`);
      if (eles.length) {
        eles.forEach((ele) => {
          if (ele.getElementsByTagName('tspan') && ele.getElementsByTagName('tspan')[0]) {
            ele.getElementsByTagName('tspan')[0].innerHTML = typeFileLang[key];
          }
        });
      }
    });
  }, []);
  return (
    <TopSection className={styles.batchFile}>
      <SecondSection title={intl.get(`spcm.common.view.message.basicInformation`).d('基本信息')}>
        <Form
          dataSet={fileDownloadDs}
          columns={2}
          labelLayout="float"
          className={styles.batchFileDownForm}
        >
          <TextField name="contentName" />
          <Select disabled name="exportType" />
          <TextField
            disabled
            name="maxCapacity"
            showHelp="tooltip"
            help={intl
              .get('spcm.common.msg.help.limitFileContainer')
              .d('文件最大容量为1GB，超过最大容量则会下载失败，需减少下载文件的数量后重试')}
          />
          <Select disabled name="isAsync" />
        </Form>
      </SecondSection>
      <SecondSection title={intl.get(`spcm.common.model.attachmentType`).d('附件类型')}>
        <Form
          dataSet={fileDownloadDs}
          columns={2}
          labelLayout="float"
          className={styles.batchFileDownForm}
        >
          {attachTypeList.map((type) => (
            <CheckBox name={type.value} />
          ))}
        </Form>
      </SecondSection>
      <SecondSection title={intl.get('spcm.common.model.downloadDimension').d('下载维度')}>
        <Form dataSet={fileDownloadDs} columns={2} labelLayout="float">
          <Radio name="downloadDimension" value="2">
            {intl.get(`spcm.common.view.title.contract`).d('协议')}
            {getPoptips(
              intl
                .get('spcm.common.msg.tips1.attachmentType')
                .d('按附件类型维度打包，结构可参考图例一')
            )}
          </Radio>
          <Radio name="downloadDimension" value="1">
            {intl.get(`spcm.common.model.attachmentType`).d('附件类型')}
            {getPoptips(
              intl.get('spcm.common.msg.tips2.contractType').d('按协议维度打包，结构可参考图例二')
            )}
          </Radio>
        </Form>
        <Row>
          <Col span={12}>
            <div className={styles.contractFile}>
              <div>
                <ContractFile />
              </div>
              <h4>{intl.get('spcm.common.msg.legend1').d('图例一')}</h4>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.typeFile}>
              <div>
                <TypeFile />
              </div>
              <h4>{intl.get('spcm.common.msg.legend2').d('图例二')}</h4>
            </div>
          </Col>
        </Row>
      </SecondSection>
    </TopSection>
  );
};

export default async function BatchFileDownload(props) {
  const { pcHeaderIds, setState = (e) => e } = props;
  const attachTypeList = await queryUnifyIdpValue('SPCM.ATTACHMENT_FIELD_NAME');
  const fileDownloadDs = new DataSet(fileDownloadDS(pcHeaderIds, attachTypeList));

  attachTypeList.forEach((type) => {
    fileDownloadDs.addField(type.value, { label: type.meaning });
    fileDownloadDs.current.set(type.value, true);
  });

  const modalChildrenProps = {
    ...props,
    attachTypeList,
    fileDownloadDs,
  };

  Modal.open({
    closable: true,
    movable: false,
    drawer: true,
    key: Modal.key(),
    title: intl.get('spcm.purchaseContractView.view.button.fileDownload').d('下载附件'),
    style: {
      width: 742,
    },
    children: <ModalChildren {...modalChildrenProps} />,
    onOk: () => {
      const existChecked = attachTypeList.find((type) => fileDownloadDs.current.get(type.value));
      if (existChecked) {
        setState({ fileDownLoading: true });
        fileDownloadDs
          .submit()
          .then()
          .finally(() => {
            setState({ fileDownLoading: false });
          });
        return true;
      } else {
        notification.warning({
          message: intl.get(`spcm.common.msg.needFieldType`).d('请选择附件类型'),
        });
        return false;
      }
    },
  });
}
