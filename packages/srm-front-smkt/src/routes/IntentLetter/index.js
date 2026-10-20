import React from 'react';
import { DataSet, Modal, Spin } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import FormPro from '@/components/FormPro';
import Card from '@/components/Card';
import { createIntent } from './api';
import { getIntentLetterDsProps } from './ds';
import IntentContent from './IntentContent';

export function createIntentLetter({ record, onSaveSuccess }) {
  const ds = new DataSet(getIntentLetterDsProps());
  const { tenantId, companyId, companyName, companyNum } = record.get('companyInfosVO') || {};
  ds.create({
    receiveTenantId: tenantId,
    receiveCompanyId: companyId,
    receiveCompanyNum: companyNum,
    receiveCompanyName: companyName,
  });
  Modal.open({
    title: intl.get('smkt.supplierManage.view.addIntention').d('发起意向'),
    drawer: true,
    style: { width: 380 },
    onOk: async () => {
      const flag = await ds.validate();
      if (flag) {
        const intentData = ds.current.toJSONData();
        const res = getResponse(await createIntent(intentData));
        if (res) {
          onSaveSuccess();
          return true;
        }
        return false;
      }
      return false;
    },
    children: (
      <FormPro
        dataSet={ds}
        fields={[
          {
            name: 'sendCompanyLov',
            _type: 'Lov',
            modalTitle: intl
              .get('smkt.supplierManage.view.sendCompanyName')
              .d('发起意向方公司名称'),
          },
          { name: 'sendCompanyNum' },
          { name: 'receiveCompanyName' },
          { name: 'receiveCompanyNum' },
          { name: 'sender' },
          { name: 'senderPhone' },
          { name: 'senderEmail', _type: 'EmailField' },
          {
            name: 'intentCatalogs',
            _type: 'Lov',
            modalTitle: intl.get('smkt.supplierManage.view.intentCatalog').d('意向目录'),
          },
          {
            name: 'intentSkus',
            _type: 'Lov',
            modalTitle: intl.get('smkt.supplierManage.view.intentSku').d('意向商品'),
          },
          { name: 'letterRemark', _type: 'TextArea', resize: 'both', rows: 3 },
        ]}
      />
    ),
  });
}

export function viewIntentLetter({ record }) {
  const letterId = record.get('letterId');
  const ds = new DataSet(getIntentLetterDsProps(letterId));
  ds.query();
  Modal.open({
    title: intl.get('smkt.supplierManage.view.viewIntention').d('查看意向单'),
    drawer: true,
    style: { width: 742 },
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: (
      <Spin dataSet={ds}>
        <Card title={intl.get('smkt.supplierManage.view.receiveIntentInfo').d('接收意向方信息')}>
          <FormPro
            readOnly
            columns={3}
            dataSet={ds}
            fields={[{ name: 'receiveCompanyName' }, { name: 'receiveCompanyNum' }]}
          />
        </Card>
        <Card
          title={intl.get('smkt.supplierManage.view.sendIntentInfo').d('发起意向方信息')}
          style={{ marginTop: 32 }}
        >
          <FormPro
            readOnly
            columns={3}
            dataSet={ds}
            fields={[
              {
                name: 'sendCompanyName',
              },
              { name: 'sendCompanyNum' },
              { name: 'sender' },
              { name: 'senderPhone' },
              { name: 'senderEmail' },
            ]}
          />
        </Card>
        <IntentContent dataSet={ds} letterId={letterId} />
      </Spin>
    ),
  });
}
