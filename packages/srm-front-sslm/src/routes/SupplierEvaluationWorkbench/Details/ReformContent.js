import React, { useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { renderStatus } from '@/routes/components/utils';

const ReformContent = ({ customizeTable, dataSet, isEdit, history, customizeCode }) => {
  // const getRectification = value => {
  //   getRectificationItems(value).then(res => {
  //     const response = getResponse(res);
  //     if (response) {
  //       history.push(`/sqam/create8D/detail/${response.externalOrderId}`);
  //       dataSet.query();
  //     }
  //   });
  // };

  const columns = useMemo(
    () =>
      isEdit
        ? [
            {
              name: 'reformContent',
              editor: true,
            },
          ]
        : [
            {
              name: 'reformContent',
              width: 250,
            },
            // {
            //   name: 'opteration',
            //   width: 250,
            //   renderer: ({ record }) => {
            //     return !record.get('problemNum') ? (
            //       <Button
            //         funcType="link"
            //         onClick={() => {
            //           getRectification(record.data);
            //         }}
            //       >
            //         {intl
            //           .get('sslm.purchaserEvaluationDetail.view.button.qualityRectification')
            //           .d('发起质量整改')}
            //       </Button>
            //     ) : (
            //       <span>-</span>
            //     );
            //   },
            // },
            {
              name: 'problemStatusMeaning',
              width: 250,
              renderer: ({ record, value, name }) => {
                return value ? (
                  <span>{renderStatus({ value, name, record })}</span>
                ) : (
                  <span>-</span>
                );
              },
            },
            {
              name: 'problemNum',
              width: 150,
              renderer: ({ value, record }) => {
                const externalOrderId = record.get('externalOrderId');
                return value ? (
                  <Button
                    funcType="link"
                    onClick={() => {
                      history.push({
                        pathname: `/sqam/received8D/detail/${externalOrderId}`,
                      });
                    }}
                  >
                    {value}
                  </Button>
                ) : (
                  <span>-</span>
                );
              },
            },
            {
              name: 'problemTitle',
              width: 150,
            },
          ],
    [isEdit]
  );

  return (
    <>
      {customizeTable(
        { code: customizeCode, readOnly: !isEdit },
        <Table columns={columns} dataSet={dataSet} selectionMode="none" />
      )}
    </>
  );
};

export default ReformContent;
