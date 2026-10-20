/**
 * 出入参
 */
import React, { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Collapse } from 'choerodon-ui';
import { Col, Row, Table, Tree } from 'choerodon-ui/pro/lib';
import { SelectionMode, TableMode } from 'choerodon-ui/pro/lib/table/enum';
import {
  constructScripParamDataSet,
  constructParamDataSet,
} from '@/routes/ScriptUtility/datasets/constructEidtScriptUtilityDataSet';

const { Panel } = Collapse;
const { Column } = Table;

export default observer((props: { scriptCode; scriptTypeCode; tenantId }) => {
  const { scriptCode, scriptTypeCode, tenantId } = props;

  const scripParamDataSet = useMemo(() => {
    return constructScripParamDataSet();
  }, []);

  const scriptInputParamDataSet = useMemo(() => {
    return constructParamDataSet();
  }, []);

  const scriptOutputParamDataSet = useMemo(() => {
    return constructParamDataSet();
  }, []);

  useEffect(() => {
    if (!scriptCode || !scriptTypeCode || tenantId === undefined) {
      scriptInputParamDataSet.loadData([]);
      scriptOutputParamDataSet.loadData([]);
      return;
    }
    scripParamDataSet.setQueryParameter('scriptCode', scriptCode);
    scripParamDataSet.setQueryParameter('tenantId', tenantId);
    scripParamDataSet.setQueryParameter('scriptTypeCode', scriptTypeCode);
    scripParamDataSet.query().then((res) => {
      if (scriptTypeCode === 'SCRIPT') {
        scriptInputParamDataSet.loadData(JSON.parse(res?.scriptInputParam)?.datasetData);
        scriptOutputParamDataSet.loadData(JSON.parse(res?.scriptOutputParam)?.datasetData);
      } else {
        scriptInputParamDataSet.loadData(JSON.parse(res?.scriptInputParam));
        scriptOutputParamDataSet.loadData(JSON.parse(res?.scriptOutputParam));
      }
    });
  }, [scriptCode, scriptTypeCode, tenantId]);

  // render //
  return (
    <Row>
      <Col span={12}>
        <Collapse bordered={false}>
          <Panel header="入参" key="scriptInputParam">
            {scriptTypeCode === 'SCRIPT' ? (
              <Table
                dataSet={scriptInputParamDataSet}
                mode={TableMode.tree}
                selectionMode={SelectionMode.none}
              >
                <Column name="code" />
                <Column name="type" />
                <Column name="remark" />
              </Table>
            ) : (
              <Tree
                dataSet={scriptInputParamDataSet}
                showLine={{ showLeafIcon: false }}
                showIcon={false}
                renderer={({ record }) => {
                  return record?.get('inputParamType') === 'custom' &&
                    record?.get('parentId').toString() === '1'
                    ? record?.get('code')
                    : `${
                        record?.get('businessObjectName') ||
                        record?.get('businessObjectFieldName') ||
                        record?.get('code')
                      } (${
                        record?.get('businessObjectCode') ||
                        record?.get('businessObjectFieldCode') ||
                        record?.get('type') ||
                        ''
                      })`;
                }}
              />
            )}
          </Panel>
        </Collapse>
      </Col>
      <Col span={12}>
        <Collapse bordered={false}>
          <Panel header="出参" key="scriptOutputParam">
            {scriptTypeCode === 'SCRIPT' ? (
              <Table
                dataSet={scriptOutputParamDataSet}
                mode={TableMode.tree}
                selectionMode={SelectionMode.none}
              >
                <Column name="code" />
                <Column name="type" />
                <Column name="remark" />
              </Table>
            ) : (
              <Tree
                dataSet={scriptOutputParamDataSet}
                showLine={{ showLeafIcon: false }}
                showIcon={false}
                renderer={({ record }) => {
                  return `${
                    record?.get('businessObjectName') ||
                    record?.get('businessObjectFieldName') ||
                    record?.get('code')
                  } (${
                    record?.get('businessObjectCode') ||
                    record?.get('businessObjectFieldCode') ||
                    record?.get('type')
                  })`;
                }}
              />
            )}
          </Panel>
        </Collapse>
      </Col>
    </Row>
  );
});
