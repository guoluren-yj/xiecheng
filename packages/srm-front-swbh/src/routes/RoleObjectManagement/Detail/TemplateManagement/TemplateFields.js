import React, { useEffect, useMemo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'hzero-front/lib/components/Page';
import qs from 'querystring';
import { DataSet, Table, Button, Modal, Tooltip } from 'choerodon-ui/pro';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { saveFieldList } from '@/services/roleObjectService';
import { tableDS, treeDS } from '../stores/TemplateFieldsDS';
import { PublishStatus } from '../../../components/utils/common';
import { statusRender } from '../../../components/utils/render';
import FieldSelectModal from './FieldSelectModal';

const Index = (props) => {
  let _search = props?.location?.search.split('?')?.[1];
  _search = qs.parse(_search);
  const { docObjectId, combineId, combineCode, combineName, tenantId, docObjectRelId } = _search || {};
  const fieldTableDS = useMemo(() => new DataSet(tableDS()), []);
  const fieldTreeDS = useMemo(() => new DataSet(treeDS()), []);
  /**
   * @docObjectRelId --关联对象ID
   * @combineName  --对象名称
   */
  useEffect(() => {
    if (docObjectRelId) {
      fieldTableDS.setQueryParameter('docObjectRelId', docObjectRelId);
      fieldTableDS.query();
    }
  }, [docObjectRelId]);

  const fieldSelect = () => {
    Modal.open({
      title: intl.get('swbh.roManagement.templateManagement.button.selectField').d('字段选择'),
      style: { width: '800px' },
      closable: true,
      destroyOnClose: true,
      children: <FieldSelectModal fieldTreeDS={fieldTreeDS} tenantId={tenantId} docObjectRelId={docObjectRelId} />,
      onOk: () => {
        const data = fieldTreeDS.selected.map((item) => {
          return { ...item.toData() };
        });
        saveFieldList({
          body: data,
          query: {
            tenantId: getCurrentOrganizationId(),
          },
        }).then((res) => {
          if (getResponse(res)) {
            fieldTableDS.query();
          }
        });
      },
      okText: intl.get('hzero.common.button.sure').d('确定'),
    });
  };

  const columns = [
    { name: 'relBusinessObjectName', align: ColumnAlign.left },
    { name: 'boFieldCode', align: ColumnAlign.left },
    { name: 'boFieldName', align: ColumnAlign.left },
    {
      name: 'orderSeq',
      align: ColumnAlign.left,
      editor: (record) => fieldTableDS.getState('editor') && record?.get('publishStatus') === 'UNPUBLISHED',
    },
    {
      name: 'indexFlag',
      align: ColumnAlign.center,
      editor: (record) => fieldTableDS.getState('editor') && record?.get('publishStatus') === 'UNPUBLISHED',
    },
    {
      name: 'translateType',
      align: ColumnAlign.left,
      editor: () => fieldTableDS.getState('editor'),
    },
    {
      name: 'publishStatus',
      align: ColumnAlign.center,
      renderer: ({ value }) => {
        const statusList = [
          {
            value: PublishStatus.PUBLISHED,
            status: 'success',
            text: intl.get('swbh.common.status.published').d('已发布'),
          },
          {
            value: PublishStatus.UNPUBLISHED,
            status: 'default',
            text: intl.get('swbh.common.status.unpublished').d('未发布'),
          },
          {
            value: PublishStatus.PENDING,
            status: 'warning',
            text: intl.get('swbh.common.status.pending').d('待发布'),
          },
        ];
        return statusRender(value?.toUpperCase(), statusList);
      },
    },
  ];

  const DeleteButtons = (dataSet) => {
    // const deleteArray = dataSet.selected.map(item => {
    //   return item.get('tenantId') === getCurrentOrganizationId();
    // });
    // const isDisabled = dataSet.selected.length === 0 || deleteArray.includes(false);

    return (
      <Tooltip title={intl.get('swbh.roManagement.templateManagement.button.developed').d('待开发功能')}>
        <Button
          icon="delete"
          disabled
          onClick={() => {
            dataSet.delete(dataSet.selected);
          }}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      </Tooltip>
    );
  };

  const buttons = () => {
    const arr = [
      <Tooltip title={intl.get('swbh.roManagement.templateManagement.button.developed').d('待开发功能')}>
        <Button onClick={fieldSelect} icon="add" disabled>
          {intl.get('swbh.roManagement.templateManagement.button.addField').d('添加字段')}
        </Button>
      </Tooltip>,
      DeleteButtons(fieldTableDS),
    ];
    if (fieldTableDS.getState('editor')) {
      arr.push(
        <Button
          icon="finished"
          onClick={async () => {
            if (await fieldTableDS.validate()) {
              fieldTableDS.submit().then(() => {
                fieldTableDS.setState('editor', false);
                fieldTableDS.query();
              });
            }
          }}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      );
      arr.push(
        <Button
          icon="close"
          onClick={() => {
            fieldTableDS.reset();
            fieldTableDS.setState('editor', false);
          }}
        >
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
      );
    } else {
      arr.push(
        <Button
          icon="mode_edit"
          disabled={fieldTableDS.length === 0}
          onClick={() => fieldTableDS.setState('editor', true)}
        >
          {intl.get('swbh.common.button.batchEdit').d('批量编辑')}
        </Button>
      );
    }
    return arr;
  };
  return (
    <>
      <Header
        backPath={`/swbh/role-object-management/detail/${combineId}?docObjectId=${docObjectId}&combineId=${combineId}&combineName=${combineName}&docObjectRelId=${docObjectRelId}&combineCode=${combineCode}&originKey=templateManagement`}
        title={intl.get('swbh.roManagement.view.message.tab.templateManaget').d('模板管理')}
      />
      <Content>
        <h3 style={{ fontSize: 16, color: '#1E1E1E', padding: 0 }}>
          {intl.get('swbh.common.view.message.field').d('模板字段')}
        </h3>
        <Table
          dataSet={fieldTableDS}
          columns={columns}
          buttons={buttons()}
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
          style={{ maxHeight: `calc(100vh - 400px)` }}
        />
      </Content>
    </>
  );
};
export default formatterCollections({
  code: ['swbh.roManagement', 'swbh.common', 'hzero.common'],
})(observer(Index));
