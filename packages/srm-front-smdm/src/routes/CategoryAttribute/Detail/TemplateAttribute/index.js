/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-10 15:41:27
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-08-02 15:17:23
 */
import React, { useMemo } from 'react';
import intl from 'utils/intl';
import {
  Button,
  Table,
  DataSet,
  Modal,
  Form,
  Lov,
  Select,
  TextField,
  NumberField,
} from 'choerodon-ui/pro';
import SearchBarTable from '@/components/SearchBarTable';
import { isArray } from 'lodash';
import { templateLineDS, attributeValueLineDS } from '../../stores/detailDs';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const TemplateAttribute = ({ templateLineDs, templateId }) => {
  const handleAttributeModal = (record) => {
    const filterValueIds = templateLineDs.created?.map((ele) => ele.get('attributeId')).join(',');

    const dataSet = new DataSet(templateLineDS({ templateId, filterValueIds }));

    let title = intl.get(`${commonPrompt}.attributeCreate`).d('新增属性');

    if (record) {
      title = intl.get(`${commonPrompt}.attributeEdit`).d('编辑属性');
      dataSet.loadData([
        {
          ...record.toData(),
        },
      ]);
    } else {
      dataSet.create({}, 0);
    }

    Modal.open({
      title,
      style: {
        width: 450,
      },
      closable: true,
      drawer: true,
      children: (
        <div>
          <Form dataSet={dataSet} columns={1} labelLayout="float" useColon={false}>
            <Lov name="attributeCode" />
            <TextField name="attributeName" />
            <Select name="maintenanceMethod" />

            <Select name="requiredFlag" />
            <Select name="customizeFlag" />
            <NumberField name="scale" />
            <NumberField name="sort" />
          </Form>
        </div>
      ),
      onOk: () => {
        return new Promise(async (resolve) => {
          const flag = await dataSet.validate();
          if (flag) {
            if (record) {
              const {
                attributeCode,
                attributeName,
                attributeId,
                ...others
              } = dataSet.current?.toData();
              record.set({
                ...others,
                attributeName,
                attributeId,
                attributeCode: {
                  attributeCode,
                  attributeName,
                  attributeId,
                },
              });
            } else {
              templateLineDs.create({ ...dataSet.current?.toData() }, 0);
            }

            resolve();
          } else {
            resolve(false);
          }
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

  const handleAttributeValueModal = (record) => {
    const dataSet = new DataSet(attributeValueLineDS({ templateId }));

    const categoryAttrTemplatePropertyAssigns =
      record.get('categoryAttrTemplatePropertyAssigns')?.toJS() || [];

    if (categoryAttrTemplatePropertyAssigns.length) {
      for (
        let i = 0;
        i < categoryAttrTemplatePropertyAssigns.length + dataSet.pageSize;
        i += dataSet.pageSize
      ) {
        dataSet.loadData(categoryAttrTemplatePropertyAssigns.slice(i, i + dataSet.pageSize));
        dataSet.selectAll();
      }
    }

    dataSet.query();

    const attributeValueColumns = [
      {
        name: 'valueCode',
        width: 250,
      },
      {
        name: 'valueName',
        width: 550,
      },
    ];

    Modal.open({
      title: intl.get(`${commonPrompt}.maintainAttributeValue`).d('维护属性值'),
      style: {
        width: 750,
      },
      closable: true,
      drawer: true,
      children: (
        <div style={{ height: 'calc(100vh - 252px)' }}>
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            dataSet={dataSet}
            columns={attributeValueColumns}
            searchBarConfig={{
              fuzzyQueryCode: 'valueCode',
              fuzzyQueryName: intl.get(`${commonPrompt}.valueCode`).d('属性值编码'),
              cacheFlag: true,
              expandable: false,
            }}
          />
        </div>
      ),
      onOk: () => {
        return new Promise(async (resolve) => {
          const { selected } = dataSet;

          if (isArray) {
            record.set({
              categoryAttrTemplatePropertyAssigns: selected.map((ele) => ele.toData()),
            });
          } else {
            record.set({
              categoryAttrTemplatePropertyAssigns: null,
            });
          }

          resolve();
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

  const buttons = [
    <Button funcType="flat" icon="playlist_add" onClick={() => handleAttributeModal()}>
      {intl.get(`${commonPrompt}.createAttribute`).d('新建属性')}
    </Button>,
    'delete',
  ];

  const columns = useMemo(() => {
    return [
      {
        name: 'attributeCode',
        width: 150,
      },
      {
        name: 'attributeName',
        width: 200,
      },
      {
        name: 'maintenanceMethod',
        width: 150,
      },
      {
        name: 'requiredFlag',
        width: 150,
      },
      {
        name: 'customizeFlag',
        width: 230,
      },
      {
        name: 'scale',
        width: 150,
      },
      {
        name: 'sort',
        width: 120,
      },
      {
        name: 'operate',
        width: 200,
        renderer: ({ record }) => (
          <>
            <Button
              type="c7n-pro"
              funcType="link"
              color="primary"
              onClick={() => handleAttributeModal(record)}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
            <Button
              type="c7n-pro"
              funcType="link"
              color="primary"
              onClick={() => handleAttributeValueModal(record)}
            >
              {intl.get(`${commonPrompt}.maintainAttributeValue`).d('维护属性值')}
            </Button>
          </>
        ),
      },
    ];
  }, []);

  return (
    <div className="config-right-content">
      <div className="config-right-content-one-title">
        {intl.get(`${commonPrompt}.templateAttribute`).d('模版属性')}
      </div>

      <Table dataSet={templateLineDs} columns={columns} buttons={buttons} />
    </div>
  );
};

export default TemplateAttribute;
