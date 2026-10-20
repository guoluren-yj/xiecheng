import React, { useEffect, useMemo, useState, useImperativeHandle } from 'react';
import {
  Form,
  Table,
  DataSet,
  Output,
  TextField,
  Switch,
  NumberField,
  Select,
  Tooltip,
} from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { queryMapIdpValue } from 'services/api';

import styles from './index.less';

import { attrChildrenTableDataSet } from './indexDS.js';

const promptCode = 'ssrc.quotationTemplate';
const organizationId = getCurrentOrganizationId();

export default function AttrChildren(props) {
  const { remote, quotationColumnId } = props;
  // 暴露子组件的api给父组件使用
  useImperativeHandle(props.attrChildrenRef, () => ({
    tableDs,
  }));

  const [lovCodes, setLovCodes] = useState({});

  const formDs = useMemo(
    () =>
      new DataSet({
        data: [{ columnName: props.columnName, componentDescription: props.componentDescription }],
        fields: [
          {
            label: intl.get(`${promptCode}.model.definition.fieldDesc`).d('字段描述'),
            name: 'columnName',
            disabled: true,
          },
          {
            label: intl.get(`${promptCode}.model.definition.component`).d('组件'),
            name: 'componentDescription',
            disabled: true,
          },
        ],
      }),
    []
  );

  const tableDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SSRC_QUOTATION_TEMPLATE_DETAIL_PROCESS_ATTRCHILDREN_DS',
              attrChildrenTableDataSet({ quotationColumnId }),
              {
                pageProps: props,
                lovCodes,
              }
            )
          : attrChildrenTableDataSet({ quotationColumnId })
      ),
    [quotationColumnId]
  );

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    if (props.type === 'attrs') {
      getResponse(tableDs.query());
      const codes = {
        required: 'SSRC.QUOTATION_INPUT_TYPE',
      };
      const res = getResponse(await queryMapIdpValue(codes));
      if (res && !res.failed) {
        setLovCodes(res);
      }
    } else if (props.type === 'busSAttributes') {
      // 查询编辑和显示值集
      let codes = {
        disabled: 'SSRC_QUOTATION_COLUMN_DISABLED',
        visible: 'SSRC_QUOTATION_COLUMN_VISIBLE',
      };
      codes = remote
        ? remote.process('SSRC_QUOTATION_TEMPLATE_DETAIL_PROCESS_BUSSATTRIBUTES_LOVCODES', codes, {
            pageProps: props,
          })
        : codes;

      const res = getResponse(await queryMapIdpValue(codes));
      if (res && !res.failed) {
        setLovCodes(res);
      }

      // 业务属性时，组装数据
      const data = [
        {
          attributeDescription: intl.get(`${promptCode}.model.attrs.disabled`).d('编辑'),
          attributeName: 'disabled',
          attributeValueType: 'valueList',
          attributeValue: props.disabled,
          objectVersionNumber: 1,
          quotationColumnCmptId: uuid(),
          quotationColumnId,
        },
        {
          attributeDescription: intl.get(`${promptCode}.model.attrs.visible`).d('显示'),
          attributeName: 'visible',
          attributeValueType: 'valueList',
          attributeValue: props.visible,
          objectVersionNumber: props.objectVersionNumber,
          quotationColumnCmptId: uuid(),
          quotationColumnId,
        },
      ];

      const newData = remote
        ? remote.process('SSRC_QUOTATION_TEMPLATE_DETAIL_PROCESS_ATTRCHILDREN_DATA', data, {
            pageProps: props,
            res,
            codes,
          })
        : data;

      tableDs.loadData(newData);
    }
  };

  const renderAttributeValue = (record) => {
    const { attributeValueType, attributeName, componentType } = record.toData();
    let editorField;
    if (attributeName === 'required') {
      editorField = props.editableFlag ? (
        <Select
          name="attributeValue"
          record={record}
          style={{ width: '100%', height: '0.28rem' }}
          clearButton={false}
        >
          {lovCodes[attributeName]?.map((i) => (
            <Select.Option value={i.value}>{i.meaning}</Select.Option>
          ))}
        </Select>
      ) : (
        (
          lovCodes[attributeName]?.find(
            (item) =>
              item.value ===
              (!isNil(record.get('attributeValue'))
                ? String(record.get('attributeValue'))
                : record.get('attributeValue'))
          ) || {}
        ).meaning
      );
      return editorField;
    }

    switch (attributeValueType) {
      case 'String':
        editorField = props.editableFlag ? (
          <TextField
            name="attributeValue"
            record={record}
            required={attributeName === 'bucketName'}
            style={{ width: '100%', height: '0.28rem' }}
          />
        ) : (
          record.get('attributeValue')
        );
        // to do 附件必输
        if (attributeName === 'templateAttachmentUUID' && componentType === 'Upload') {
          editorField = (
            <Upload
              tenantId={organizationId}
              bucketName={
                tableDs.toData().find((i) => i.attributeName === 'bucketName')?.attributeValue
              }
              bucketDirectory={
                tableDs.toData().find((i) => i.attributeName === 'bucketDirectory')?.attributeValue
              }
              viewOnly={!props.editableFlag}
              attachmentUUID={record.toData()?.attributeValue}
              afterOpenUploadModal={(attUuid) => {
                record.set('attributeValue', attUuid);
              }}
              fileSize={FIlESIZE}
              filePreview
            />
          );
        }
        break;
      case 'Tinyint':
        editorField = <Switch name="attributeValue" record={record} unCheckedValue="0" value="1" />;
        break;
      case 'Double':
        editorField = props.editableFlag ? (
          <NumberField
            name="attributeValue"
            disabled={attributeName === 'min' && props?.calculationRule}
            record={record}
            min={0}
            style={{ width: '100%', height: '0.28rem' }}
          />
        ) : (
          record.get('attributeValue')
        );
        break;
      case 'Integer':
        editorField = props.editableFlag ? (
          <NumberField
            name="attributeValue"
            record={record}
            step={1}
            min={0}
            style={{ width: '100%', height: '0.28rem' }}
          />
        ) : (
          record.get('attributeValue')
        );
        break;
      case 'valueList':
        // 只有数值和文本有默认值
        editorField = props.editableFlag ? (
          <Select
            name="attributeValue"
            record={record}
            style={{ width: '100%', height: '0.28rem' }}
            disabled={
              props?.componentType !== 'InputNumber' &&
              props?.componentType !== 'Input' &&
              props?.componentType !== 'ValueList' &&
              props?.componentType !== 'Lov'
            }
            clearButton={false}
          >
            {lovCodes[attributeName]?.map((i) => (
              <Select.Option value={i.value}>{i.meaning}</Select.Option>
            ))}
          </Select>
        ) : (
          (
            lovCodes[attributeName]?.find(
              (item) =>
                item.value ===
                (!isNil(record.get('attributeValue'))
                  ? String(record.get('attributeValue'))
                  : record.get('attributeValue'))
            ) || {}
          ).meaning
        );
        break;
      default:
        editorField = props.editableFlag ? (
          <TextField
            name="attributeValue"
            record={record}
            style={{ width: '100%', height: '0.28rem' }}
          />
        ) : (
          record.get('attributeValue')
        );
        break;
    }
    return editorField;
  };

  const columns = useMemo(
    () => [
      {
        name: 'attributeName',
      },
      {
        name: 'attributeDescription',
        renderer: ({ record, value }) => {
          if (record.get('attributeName') === 'min') {
            return (
              <Tooltip
                title={intl
                  .get('ssrc.quotationTemplate.view.min.toolTips')
                  .d('用于配置用户输入数值的最小值，只读字段不受该配置管控。')}
              >
                {value}
              </Tooltip>
            );
          } else {
            return value;
          }
        },
      },
      {
        name: 'attributeValue',
        className: styles['ssrc-quotation-template-column'],
        renderer: ({ record }) => renderAttributeValue(record),
      },
    ],
    [lovCodes, props]
  );

  const formProps = useMemo(() => {
    if (props.editableFlag) {
      return {
        labelLayout: 'float',
      };
    }
    return {
      labelLayout: 'vertical',
      className: 'c7n-pro-vertical-form-display',
      labelAlign: 'left',
    };
  }, [props.editableFlag]);

  const renderFields = () => {
    if (props.editableFlag) {
      return (
        <>
          <TextField name="columnName" />
          <TextField name="componentDescription" />
        </>
      );
    } else {
      return (
        <>
          <Output name="columnName" />
          <Output name="componentDescription" />
        </>
      );
    }
  };

  return (
    <React.Fragment>
      <Form dataSet={formDs} columns={2} {...formProps}>
        {renderFields()}
      </Form>
      <div style={{ marginTop: '16px' }}>
        <Table dataSet={tableDs} columns={columns} />
      </div>
    </React.Fragment>
  );
}
