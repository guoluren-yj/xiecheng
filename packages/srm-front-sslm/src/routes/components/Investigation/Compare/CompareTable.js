/*
 * @Date: 2022-06-10 11:12:39
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback, memo, useMemo } from 'react';
import { Table, Icon, Modal, DataSet } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';
import intl from 'utils/intl';

import { commonDealForProps } from '../utils';
import { handleCompareRender } from '../../utils';
import AptitudeAttachment from './AptitudeAttachment';
import { getAptitudeAttachmentDS } from '../stores/getAptitudeAttachmentDS';

const Index = ({
  dataSet,
  columns,
  configName,
  tableStyle = {},
  getFieldProps = () => {},
  pageSource = '',
}) => {
  // 处理资质附件
  const handleAptitudeAttachment = useCallback(record => {
    const investgProserviceId = record.get('investgProserviceId');
    const aptitudeAttachmentDs = new DataSet(
      getAptitudeAttachmentDS({ investgProserviceId, editable: false, pageSource })
    );
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 1000 },
      cancelButton: false,
      title: intl.get('hzero.common.upload.text').d('上传附件'),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <AptitudeAttachment record={record} dataSet={aptitudeAttachmentDs} />,
    });
  }, []);

  // 获取列的属性
  const getColumnProps = componentType => {
    const { renderer: cuzRenderer, ...otherProps } = getFieldProps({ type: componentType }) || {};
    let displayField = '';
    switch (componentType) {
      case 'Upload':
        return {
          editor: (record, name) => handleCompareRender({ record, name, type: componentType }),
        };
      default:
        return {
          renderer: ({ value, record, name }) => {
            let type = componentType;
            switch (name) {
              case 'regionId': // 配置的文本，实际类型应是值集
                type = 'Lov';
                displayField = 'regionPathName';
                break;
              case 'attachmentType': // 下拉框||文本框
                type = 'select';
                break;
              default:
                break;
            }
            if (isFunction(cuzRenderer)) {
              return cuzRenderer({ value, record, name, type, displayField });
            }
            return handleCompareRender({ value, record, name, type, displayField });
          },
          ...otherProps,
        };
    }
  };

  const newColumns = useMemo(
    () =>
      columns.map(column => {
        const { fieldCode, fixedCol, colWidth, componentType, fieldType, ...others } = column;
        const lock = fixedCol;
        const configProps = commonDealForProps(column);
        const { isAttachmentUrl } = configProps;
        // 处理产品及服务”资质附件“
        if (
          configName === 'sslmInvestgProservice' &&
          fieldCode === 'attachment' &&
          isAttachmentUrl
        ) {
          return {
            name: fieldCode,
            width: colWidth || 150,
            lock,
            renderer: ({ record }) => {
              // 附件标红
              const { firmChangeBeanStateFlag, attachmentStateFlag } =
                record.get(['firmChangeBeanStateFlag', 'attachmentStateFlag']) || {};
              const redFlag =
                ['insert', 'delete', 'CREATE', 'DELETE'].includes(firmChangeBeanStateFlag) ||
                ['update'].includes(attachmentStateFlag);
              return (
                <a
                  disabled={!['enterpriseInform'].includes(pageSource)}
                  onClick={() => handleAptitudeAttachment(record)}
                  style={{ color: redFlag && 'red' }}
                >
                  <Icon type="attach_file" style={{ fontSize: 14 }} />
                  {intl.get('hzero.common.upload.viewOnlyText').d('查看附件')}
                </a>
              );
            },
          };
        }
        // 自定义列特殊处理
        if (fieldType === 'cuz') {
          return {
            name: fieldCode,
            ...others,
          };
        }
        const columnProps = getColumnProps(componentType);
        return {
          name: fieldCode,
          width: colWidth || 150,
          lock,
          ...columnProps,
        };
      }),
    [configName, pageSource]
  );

  return dataSet ? <Table dataSet={dataSet} columns={newColumns} style={tableStyle} /> : null;
};

export default memo(Index);
