import React, { useMemo, useContext, useCallback } from 'react';
import { Table, NumberField, Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { StageAllPrefabInfoCode, StageAllDetailPreLineCode, statusMap } from '../../utils/type';
import StatusTag from '../../../../components/StatusTag';

import Detail from '../index';
import styles from '../../../../common.less';

const PrefabInfo = () => {
  const {
    headerDs,
    customizeForm,
    customizeTable,
    preTableDs,
    viewType,
  } = useContext<StoreValueType>(Store);


  const editorColumns = useMemo(() => {
    return [
      {name: 'prefabPayAmount', disabled: true, editor: NumberField},
      {name: 'prefabApplyAmount', disabled: true, editor: NumberField},
      {name: 'prefabStatus', disabled: true, renderer: ({ text, record }) => (
        <StatusTag value={record?.get('prefabStatusMeaning')} color={statusMap[text]} />
      )},
      'prefabPaymentDate',
      'prefabPaymentDateLast',
    ];
  }, []);

  const handleClickNum = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <Detail recordInfo={record} viewType='STAGE' />,
      cancelButton: false,
    });
  }, []);

  const columns: any = useMemo(() => {
    return [
      viewType === 'STAGE' && {
        name: 'prepSourceMeaning',
        width: 120,
      },
      {
        name: 'documentNum',
        width: 180,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '', documentLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum', 'documentLineNum']) || {};
          return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : `${value}${documentLineNum && '-'}${documentLineNum}`;
        },
      },
      {
        name: 'prepSourceAmount',
        width: 120,
      },
      ...(viewType !== 'STAGE' ? [
        {
          name: 'documentNumAndLineNum',
          width: 180,
          renderer: ({ value, record }) => {
            const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
            return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
          },
        },
        {
          name: 'stageNum',
          width: 140,
          renderer: ({ value, record }) => (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleClickNum(record)}
            >
              {value}
            </Button>
          ),
        },
        {
          name: 'stageDesc',
          width: 180,
        },
        {
          name: 'stageAmount',
          width: 120,
        },
      ] : []),
      {
        name: 'prefabPayAmount',
        width: 120,
      },
      {
        name: 'prefabApplyAmount',
        width: 120,
      },
      {
        name: 'prefabPaymentDate',
        width: 150,
      },
      {
        name: 'createdUserName',
      },
      {
        name: 'creationDate',
        width: 200,
      },
    ];
  }, [viewType, handleClickNum]);

  return (
    <div>
      {
        viewType === 'STAGE' && (
          <EditorForm
            useWidthPercent
            columns={3}
            useColon={false}
            dataSet={headerDs}
            editorFlag={false}
            customizeForm={customizeForm}
            editorColumns={editorColumns}
            customizeOptions={{ code: StageAllPrefabInfoCode, readOnly: true }}
          />
        )
      }
      <div style={{marginTop: '16px'}}>
        {
          customizeTable({
            code: StageAllDetailPreLineCode,
            readOnly: true,
          }, (
            <Table
              dataSet={preTableDs}
              columns={columns}
            />
          ))
        }
      </div>
    </div>
  );
};


export default PrefabInfo;
