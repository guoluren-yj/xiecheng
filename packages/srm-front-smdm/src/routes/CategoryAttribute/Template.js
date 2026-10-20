/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-08-19 15:12:03
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-08-27 18:32:34
 */
import React, { useMemo } from 'react'; // useEffect
import intl from 'utils/intl';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import SearchBarTable from '@/components/SearchBarTable';
import { assignCategory } from '@/services/categoryAttributeService';
import { categoryAssignListDS } from './stores/listDs';
import { colorRender } from './hook';

const commonPrompt = 'smdm.common.model.common';

const Index = ({ remote, dataSet, handleEdit }) => {
  const handleAssignCategory = (record) => {
    const templateId = record.get('templateId');

    const processDsParams = remote
      ? remote.process('SMDM.CATEGORY_ATTRIBUTE_LIST_CUX.TEMP_ASSIGN_CATEGORY_DS_PARAMS', {}, {})
      : {};
    const { treeSelectFlag } = processDsParams;

    const categoryAssignListDs = new DataSet(categoryAssignListDS({ templateId, treeSelectFlag }));

    const attributeValueColumns = [
      {
        name: 'categoryCode',
        width: 250,
      },
      {
        name: 'categoryName',
        width: 550,
      },
    ];

    Modal.open({
      title: intl.get(`${commonPrompt}.assignCategory`).d('分配品类'),
      style: {
        width: 750,
      },
      closable: true,
      drawer: true,
      children: (
        <div style={{ height: 'calc(100vh - 252px)' }}>
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            virtual
            virtualCell
            mode="tree"
            dataSet={categoryAssignListDs}
            columns={attributeValueColumns}
            searchBarConfig={{
              fuzzyQueryCode: 'categoryCode',
              fuzzyQueryName: intl.get(`${commonPrompt}.categoryCode`).d('品类编码'),
              cacheFlag: true,
              expandable: false,
            }}
          />
        </div>
      ),
      onOk: () => {
        return new Promise(async (resolve) => {
          const { updated } = categoryAssignListDs;

          assignCategory({
            templateId,
            list: updated.map((ele) => ele.toData()),
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              resolve();
            } else {
              resolve(false);
            }
          });
        });
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {cancelBtn}
        </div>
      ),
    });
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'enabledFlag',
        width: 250,
        renderer: ({ value, text }) => colorRender(value, text),
      },
      {
        name: 'templateCode',
        width: 250,
        // renderer: ({ record, value }) => <a onClick={() => handleJumpDetail(record)}>{value}</a>,
      },
      {
        name: 'templateName',
        width: 550,
      },
      {
        name: 'operate',
        width: 150,
        renderer: ({ record }) => (
          <>
            <Button
              type="c7n-pro"
              funcType="link"
              color="primary"
              onClick={() => handleEdit(record)}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
            <Button
              type="c7n-pro"
              funcType="link"
              color="primary"
              onClick={() => handleAssignCategory(record)}
            >
              {intl.get(`${commonPrompt}.assignCategory`).d('分配品类')}
            </Button>
          </>
        ),
      },
    ];
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      <SearchBarTable
        style={{ maxHeight: 'calc(100% - 22px)' }}
        dataSet={dataSet}
        columns={columns}
        searchBarConfig={{
          fuzzyQueryCode: 'templateCode',
          fuzzyQueryName: intl.get(`${commonPrompt}.templateCode`).d('模版编码'),
          cacheFlag: true,
          expandable: false,
        }}
      />
    </div>
  );
};

export default Index;
