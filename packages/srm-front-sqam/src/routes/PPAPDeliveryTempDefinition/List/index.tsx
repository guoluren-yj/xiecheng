import React, { Fragment, useMemo, useCallback } from 'react';
import { Button, DataSet, useModal, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import { flow, isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { observer } from 'mobx-react';

import { ListDS } from './indexDS';
import StatusTag from '../../PPAPTemplate/components/StatusTag';
import DeliveryTempAddModal from './components/DeliveryTempAddModal';
import { useModalOpen } from '../../../utils/hooks';
import { ListTableCustCode, ListSearchCustCode, permissionCodeMap, addCode } from './type';
import { enableTemplate } from './utils/api';
import styles from '../../common.less';
import style from './index.less';
import { permissionDS } from '../../PPAPWorkbench/Detail/stores/indexDS';


interface PayTermsCtrlProps {
  history: any;
  customizeTable: (customizeOptions: object | undefined, tableElement: React.ReactNode) => any;
  customizeForm: (customizeOptions: object | undefined, tableElement: React.ReactNode) => any;
}

const PPAPDeliveryTempDefinitionList = flow(observer, withCustomize({
  unitCode: [ListTableCustCode, ListSearchCustCode, addCode],
}), formatterCollections({ code: ['sqam.deliveryTemplateDefinition', 'sqam.ppap', 'hzero.common'] }))((props: PayTermsCtrlProps) => {
  const { customizeTable, customizeForm } = props;
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const listDs: DataSet = useMemo(() => new DataSet(ListDS()), []);
  const { selected } = listDs;
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;

  const getModalProps = useCallback((type: string, editFlag: boolean, data?: any) => {
    const title = {
      'create': intl.get('sqam.deliveryTemplateDefinition.view.title.addDeliveryTemplateDefinition').d('新建交付物模板'),
      'update': intl.get('sqam.deliveryTemplateDefinition.view.title.editDeliveryTemplateDefinition').d('编辑交付物模板'),
      'view': intl.get('sqam.deliveryTemplateDefinition.view.title.viewDeliveryTemplateDefinition').d('查看交付物模板定义'),
    };
    return {
      editFlag,
      title: title[type],
      drawer: true,
      size: 'small',
      className: styles['sqam-small-modal'],
      children: <DeliveryTempAddModal customizeForm={customizeForm} type={type} data={data} onQueryList={() => listDs.query()} />,
    };
  }, [listDs]);

  const handleEnable = useCallback(async (record) => {
    const enableFlag = record?.get('enableFlag');
    const res = getResponse(await enableTemplate({ ...record?.toData(), enableFlag: enableFlag ? 0 : 1 }));
    if (!res) return;
    notification.success({});
    listDs.query();
  }, [listDs]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'documentNum',
        width: 120,
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            onClick={() => modalOpen(getModalProps('view', false, record?.toData()))}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'enableFlag',
        width: 80,
        renderer: ({ value, text }) => (
          <StatusTag value={text} flag color={value === 1 ? 'green' : 'red'} />
        ),
      },
      {
        name: 'operation',
        width: 100,
        renderer: ({ record }) => (
          <div className={style['sqam-column-btn-wrapper']}>
            {
              permissionMap?.get('edit') && (
                <Button
                  funcType={FuncType.link}
                  color={ButtonColor.primary}
                  onClick={() => modalOpen(getModalProps('update', true, record?.toData()))}
                >
                  {intl.get(`hzero.common.button.editable`).d('编辑')}
                </Button>
              )
            }
            {
              permissionMap?.get('disable') && (
                <Button
                  funcType={FuncType.link}
                  color={ButtonColor.primary}
                  onClick={() => { handleEnable(record); }}
                  wait={1500}
                >
                  {record?.get('enableFlag') === 1
                    ? intl.get('hzero.common.status.disabled').d('禁用')
                    : intl.get(`hzero.common.enable`).d('启用')
                  }
                </Button>
              )
            }
          </div>
        ),
      },
      {
        name: 'documentName',
      },
      {
        name: 'documentAttachmentUuid',
      },
      {
        name: 'camp',
      },
      {
        name: 'documentSupplierFlag',
        width: 150,
        renderer: ({ value, record }) => record?.get('camp') === 'PURCHASER' && yesOrNoRender(Number(value)),
      },
      {
        name: 'supplierVisibleFlag',
        width: 150,
        renderer: ({ value, record }) => record?.get('camp') === 'PURCHASER' && yesOrNoRender(Number(value)),
      },
      {
        name: 'autoReferAttachmentFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'documentUploadPoint',
      },
      {
        name: 'approveMethod',
      },
      {
        name: 'approveType',
      },
      {
        name: 'employeeName',
      },
      {
        name: 'visibleEmployeeName',
      },
    ];
  }, [modalOpen, handleEnable, getModalProps, permissionMap]);

  const handleSync = useCallback(async () => {
    const action = await Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sqam.ppap.view.confirm.confirmSyncPPAPTemplate')
        .d(
          '本次操作将把交付物模板的最新配置全量同步到所有已关联的 PPAP 项目模板，是否确认同步？'
        ),
    });
    if (action !== 'ok') return;
    const res = await listDs.setState('submitType', 'sync').forceSubmit();
    if (!res) return;
    listDs.query();
  }, [listDs]);

  return (
    <Fragment>
      <Header title={intl.get('sqam.deliveryTemplateDefinition.view.title.deliveryTemplateDefinition').d('交付物模板定义')}>
        {
          permissionMap?.get('create') && (
            <Button
              icon="add"
              onClick={() => modalOpen(getModalProps('create', true))}
              wait={1500}
              color={ButtonColor.primary}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )
        }
        {
          permissionMap?.get('syncPPAPTemplate') && (
            <Button
              icon="sync"
              wait={800}
              funcType={FuncType.flat}
              disabled={isEmpty(selected)}
              onClick={handleSync}
            >
              {intl.get('sqam.ppap.view.button.syncPPAPTemplate').d('同步PPAP项目模板')}
            </Button>
          )
        }
      </Header>
      <Content>
        <div
          style={{ height: 'calc(100vh - 200px)' }}
        >
          {customizeTable(
            { code: ListTableCustCode },
            <SearchBarTable
              cacheState
              customizable
              searchCode={ListSearchCustCode}
              dataSet={listDs}
              columns={columns}
              style={{ maxHeight: 'calc(100% - 22px)' }}
              pagination={{ pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
});
export default PPAPDeliveryTempDefinitionList;
