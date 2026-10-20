import React, { useEffect, useMemo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'hzero-front/lib/components/Page';
import qs from 'querystring';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, TableMode } from 'choerodon-ui/pro/lib/table/enum';
// import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { saveFieldList } from '@/services/businessObjectService';
// import { usePublicBusinessObjects } from '@/routes/BusinessObject/Detail';
// import ImgIcon from '@/utils/ImgIcon';

import { valueList } from '@/routes/BusinessObjectComposition/Detail/FieldInformation/enums';
import { tableDS, treeDS } from '@/stores/BusinessObjectComposition/ExportTemplateFieldsDS';
import FieldSelectModal from './FieldSelectModal';
import styles from './index.less';

const { MASTER } = valueList;
const Index = props => {
  const { history, domainId } = props;
  let _search = props.location.search.split('?')?.[1];
  _search = qs.parse(_search);
  const { businessObjectId, businessObjectName, boExportTplId, tenantId } = _search || {};
  // const { handlePublicObject } = usePublicBusinessObjects({ queryParams: true });
  // const [loading, setLoading] = useState(false);
  const fieldTableDS: DataSet = useMemo(() => new DataSet(tableDS()), []);
  const fieldTreeDS: DataSet = useMemo(() => new DataSet(treeDS()), []);

  useEffect(() => {
    if (boExportTplId) {
      fieldTableDS.setQueryParameter('businessObjectExportTemplateId', boExportTplId);
      fieldTableDS.setQueryParameter('selectedFlag', true);
      fieldTableDS.query();
    }
  }, [boExportTplId]);

  const fieldSelect = () => {
    Modal.open({
      title: intl.get('hmde.bo.exportTemplate.button.selectField').d('字段选择'),
      style: { width: '800px' },
      closable: true,
      destroyOnClose: true,
      children: (
        <FieldSelectModal
          fieldTreeDS={fieldTreeDS}
          businessObjectId={businessObjectId}
          businessObjectExportTemplateId={boExportTplId}
          tenantId={tenantId}
        />
      ),
      onOk: () => {
        const data = fieldTreeDS.selected.map(item => {
          return { ...item.toData(), businessObjectExportTemplateId: boExportTplId };
        });
        saveFieldList({
          body: data,
          query: {
            businessObjectExportTemplateId: boExportTplId,
            tenantId: getCurrentOrganizationId(),
          },
        }).then(res => {
          if (getResponse(res)) {
            fieldTableDS.query();
          }
        });
      },
      okText: intl.get('hzero.common.button.sure').d('确定'),
    });
  };

  const codeRender = record => {
    if (record.get('relateType') !== MASTER) {
      if (record.get('relateType')) {
        return record.get('businessObjectFieldCode');
      }
      return record.get('businessObjectFieldCode');
    }
    return null;
  };

  const columns = [
    { name: 'businessObjectName' },
    {
      name: 'orderSeq',
      align: 'left',
      // editor: record => fieldTableDS.getState('editor') && record?.get('relateType') !== MASTER,
    },
    { name: 'businessObjectFieldName' },
    {
      name: 'displayName',
      // editor: record =>
      //   fieldTableDS.getState('editor') &&
      //   record?.get('tenantId') === getCurrentOrganizationId() &&
      //   record?.get('relateType') !== MASTER,
    },
    {
      name: 'businessObjectFieldCode',
      renderer: ({ record }) => codeRender(record),
    },
    {
      name: 'aliasName',
      // editor: record =>
      //   fieldTableDS.getState('editor') &&
      //   record?.get('tenantId') === getCurrentOrganizationId() &&
      //   record?.get('relateType') !== MASTER,
    },
    // { name: 'remark' },
    {
      name: 'defaultExportFlag',
      align: ColumnAlign.left,
      // editor: record => fieldTableDS.getState('editor') && record?.get('relateType') !== MASTER,
    },
  ] as ColumnProps[];

  const DeleteButtons = (dataSet: any) => {
    const deleteArray = dataSet.selected.map(item => {
      return item.get('tenantId') === getCurrentOrganizationId();
    });
    const isDisabled = dataSet.selected.length === 0 || deleteArray.includes(false);

    return (
      <Button
        icon="delete"
        disabled={isDisabled}
        onClick={() => {
          dataSet.delete(dataSet.selected);
        }}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    );
  };

  const buttons = () => {
    const arr = [
      <Button onClick={fieldSelect} icon="add">
        {intl.get('hmde.bo.exportTemplate.addField').d('添加字段')}
      </Button>,
      DeleteButtons(fieldTableDS),
    ] as Buttons[];
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
          {intl.get('hmde.common.button.batchEdit').d('批量编辑')}
        </Button>
      );
    }
    return arr;
  };

  // const publicObject = () => {
  //   setLoading(true);
  //   handlePublicObject(businessObjectId).then(() => {
  //     setLoading(false);
  //   });
  // };

  // 获取标题
  const getTitle = () => {
    return (
      <>
        <span
          className={styles['head-bo']}
          onClick={() => {
            history.push('/hmde/business-object/list');
            if (domainId) {
              location.hash = domainId;
            }
          }}
        >
          {intl.get('hmde.bo.model.businessObject').d('业务对象')}/
        </span>
        <span
          className={styles['head-title']}
          onClick={() =>
            history.push({
              pathname: `/hmde/business-object/detail/${businessObjectId}`,
              state: { originKey: 'exportTemplate' },
            })
          }
        >
          {businessObjectName}-{intl.get('hmde.bo.view.message.tab.exportTemplate').d('导出模板')}
        </span>
        <>
          /
          <span className={styles['head-title-last']}>
            {intl.get('hmde.bo.model.fieldSelect').d('字段选择')}
          </span>
        </>
      </>
    );
  };

  return (
    <>
      <Header
        // backPath={`/hmde/business-object/detail/${businessObjectId}`}
        // title={intl.get('hmde.bo.view.message.tab.exportTemplate').d('导出模板')}
        // onBack={() => props.history.push({ state: { originKey: 'exportTemplate' } })}
        title={getTitle()}
      >
        {/* <Button
          color={ButtonColor.primary}
          onClick={() => {
            Modal.confirm({
              children: (
                <span>
                  {intl.get('hzero.common.button.releaseConfirm').d('请确认是否发布该业务对象？')}
                </span>
              ),
              okText: intl.get('hzero.common.button.sure').d('确定'),
              onOk: () => {
                publicObject();
              },
            });
          }}
          loading={loading}
        >
          <ImgIcon name="send_publish.svg" size={14} style={{ marginRight: 10 }} />
          {intl.get('hzero.common.button.release').d('发布')}
        </Button> */}
      </Header>
      <Content>
        <h3 style={{ fontSize: 16, color: '#1E1E1E', padding: 0 }}>
          {intl.get('hmde.bo.exportTemplate.field').d('导出模板字段')}
        </h3>
        <Table
          mode={TableMode.tree}
          // selectionMode={'treebox' as any}
          dataSet={fieldTableDS}
          columns={columns}
          // buttons={buttons()}
          useMouseBatchChoose
          defaultRowExpanded
        />
      </Content>
    </>
  );
};
export default formatterCollections({ code: ['hmde.bo', 'hzero.common', 'hmde.common'] })(
  observer(Index)
);
