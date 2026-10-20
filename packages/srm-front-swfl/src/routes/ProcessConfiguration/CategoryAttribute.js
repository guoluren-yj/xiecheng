/**
 * CategoryAttribute
 * @date: 2022-07-15
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useEffect, useState, useContext } from 'react';
import { Form, Table, Output } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import { Context } from './store';
import { fetchDetailHeader, fetchDetailList } from './processConfigurationService';

const documentModalRowKey = 'documentId';
const currentTenantId = getCurrentOrganizationId();
export default function CategoryAttribute(props = {}) {
  const { currentNode = {} } = props;
  const { categoryAttributeFormDs, categoryAttributeDetailTableDs } = useContext(Context);
  const [documentList, setDocumentList] = useState([]);

  useEffect(() => {
    let formData = {};
    fetchDetailHeader({ categoryId: currentNode.categoryId })
      .then((res) => {
        if (res) {
          formData = res;
          setDocumentList(res.processDocumentList || []);
        }
      })
      .finally(() => {
        categoryAttributeFormDs.create(formData, 0);
        fetchList();
      });
  }, [currentNode]);

  const fetchList = () => {
    const tenantId = categoryAttributeFormDs.current.get('tenantId');
    fetchDetailList({
      sourceId: currentNode.categoryId,
      tenantId,
      sourceType: 'CATEGORY',
    }).then((res) => {
      if (res) {
        categoryAttributeDetailTableDs.loadData(res);
      }
    });
  };

  const rendererSource = ({ record }) => {
    const tenantId = record ? record.get('tenantId') : '';
    return currentTenantId.toString() === tenantId.toString() ? (
      <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
    ) : (
      <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
    );
  };

  const rendererDocument = () => {
    return (
      <>
        <div>
          {documentList.map(
            (item) =>
              item[documentModalRowKey] && (
                <Tag color="blue">{`${item.description}(${item.documentCode})`}</Tag>
              )
          )}
        </div>
      </>
    );
  };

  const rendererDocumentForm = () => {
    return (
      <>
        <Table dataSet={categoryAttributeDetailTableDs} columns={columns} />
      </>
    );
  };

  const columns = [
    {
      name: 'variableName',
      width: 160,
    },
    {
      name: 'variableType',
      width: 120,
    },
    {
      name: 'description',
      minWidth: 120,
    },
    {
      name: 'componentType',
      width: 120,
    },
    {
      name: 'lovCode',
      width: 120,
    },
    {
      name: 'requiredFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];

  return (
    <div className="category-attribute">
      <div className="category-attribute-title-basicInfo">
        {intl.get('hwfp.common.model.approval.baseInfo').d('基本信息')}
      </div>
      <Form
        dataSet={categoryAttributeFormDs}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
        columns={3}
      >
        <Output name="categoryCode" />
        <Output name="description" />
        <Output name="enabledFlag" />
        <Output name="serviceDefinitionSource" renderer={rendererSource} />
        <Output name="document" renderer={rendererDocument} newLine colSpan={3} />

        {/* <Output name="documentForm" label={null} renderer={rendererDocumentForm} newLine colSpan={3} /> */}
      </Form>
      <div className="category-attribute-title-documentForm">
        {intl.get('hwfp.common.view.message.title.variable').d('流程变量')}
      </div>
      {rendererDocumentForm()}
    </div>
  );
}
