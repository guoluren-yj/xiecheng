import React, { useMemo, memo } from 'react';

import intl from 'utils/intl';
import notification from 'utils/notification';
// import { getResponse } from 'utils/utils';
import { getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import { PRIVATE_BUCKET } from '_utils/config';

// import ViewFilter from '@/components/ViewFilter';
import Image from '@/components/Image';
import { renderOptions, renderLabel, statusRenderer, rendermanagementList } from './renderUtlils';
import c7nModal from '@/utils/c7nModal';
import Detail from '../Detail';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();

function TableCom(props) {
  const { ds, searchBarCode, tabKey, tableCode } = props;
  // 聚合
  // const [aggregation, setAggregation] = useState(true);

  const isSrm = tabKey === 'srm-sup';

  const openDetail = (record) => {
    c7nModal({
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      style: { width: 800 },
      title: intl.get('smkt.supplierManage.view.modal.supplierInfo').d('供应商信息'),
      children: <Detail record={record} />,
    });
  };

  const callBack = () => {
    notification.success();
    ds.query(ds.currentPage);
  };

  // const columns = useMemo(() => {
  //   return [
  //     {
  //       name: 'initiationFlag',
  //       width: 110,
  //       renderer: statusRenderer,
  //       show: !isSrm,
  //       align: 'left',
  //     },
  //     {
  //       name: 'logoUrl',
  //       width: 100,
  //       show: !aggregation,
  //       renderer: ({ value }) => {
  //         return <Image className="sku-img" value={value} width={32} height={32} />;
  //       },
  //     },
  //     {
  //       key: 'supplierInfo',
  //       minWidth: 300,
  //       aggregation: true,
  //       align: 'left',
  //       header: intl.get('smkt.supplierManage.view.supplierInfo').d('供应商基本信息'),
  //       children: [
  //         {
  //           name: 'companyName',
  //           minWidth: 170,
  //           renderer: ({ text, record }) => <a onClick={() => openDetail(record)}>{text}</a>,
  //         },
  //         {
  //           name: 'companyNum',
  //           minWidth: 170,
  //         },
  //       ],
  //       renderer: ({ text, record }) => {
  //         const imagePath = record.get('logoUrl');
  //         console.log(imagePath)
  //         return (
  //           <div className={styles['sku-container']}>
  //             <div className="sku-info">
  //               <Image className="sku-img" value={imagePath} width={50} height={50} />
  //               <div className="sku-content">{text}</div>
  //             </div>
  //           </div>
  //         );
  //       },
  //     },
  //     {
  //       name: 'managementList',
  //       width: aggregation ? 160 : 280,
  //       align: 'left',
  //       header: intl.get('smkt.supplierManage.modal.d').d('经营性质'),
  //       tooltip: aggregation ? 'none' : 'overflow',
  //       renderer: (param) => rendermanagementList(param, aggregation),
  //     },
  //     {
  //       name: 'industryList',
  //       width: aggregation ? 160 : 280,
  //       align: 'left',
  //       header: intl.get('smkt.supplierManage.modal.e').d('行业性质'),
  //       tooltip: aggregation ? 'none' : 'overflow',
  //       renderer: (param) => renderLabel(param, ['industryList', 'industryName'], aggregation),
  //     },
  //     {
  //       name: 'industryCategoryList',
  //       width: aggregation ? 160 : 280,
  //       align: 'left',
  //       tooltip: aggregation ? 'none' : 'overflow',
  //       header: intl.get('smkt.supplierManage.modal.f').d('主营品类'),
  //       renderer: (param) =>
  //         renderLabel(param, ['industryCategoryList', 'categoryName'], aggregation),
  //     },
  //     {
  //       name: 'operation',
  //       align: 'left',
  //       tooltip: 'none',
  //       width: aggregation ? 150 : 250,
  //       command: (param) => renderOptions(param, isSrm, callBack),
  //       lock: 'right',
  //     },
  //   ].filter((f) => f.show !== false);
  // }, [aggregation, isSrm]);

  const columns = useMemo(() => {
    return [
      {
        name: 'initiationFlag',
        width: 130,
        renderer: statusRenderer,
        show: !isSrm,
        align: 'left',
        tooltip: 'none',
      },
      {
        name: 'logoUrl',
        width: 100,
        renderer: ({ value }) => {
          const _value = getAttachmentUrl(value, PRIVATE_BUCKET);
          return <Image className="sku-img" value={_value} width={32} height={32} />;
        },
      },
      {
        name: 'companyName',
        minWidth: 170,
        renderer: ({ text, record }) => <a onClick={() => openDetail(record)}>{text}</a>,
      },
      {
        name: 'companyNum',
        minWidth: 160,
      },
      {
        name: 'managementList',
        width: 250,
        align: 'left',
        header: intl.get('smkt.supplierManage.modal.d').d('经营性质'),
        tooltip: 'overflow',
        renderer: (param) => rendermanagementList(param, false),
      },
      {
        name: 'industryList',
        width: 250,
        align: 'left',
        header: intl.get('smkt.supplierManage.modal.e').d('行业性质'),
        tooltip: 'overflow',
        renderer: (param) => renderLabel(param, ['industryList', 'industryName'], false),
      },
      {
        name: 'industryCategoryList',
        width: 250,
        align: 'left',
        tooltip: 'overflow',
        header: intl.get('smkt.supplierManage.modal.f').d('主营品类'),
        renderer: (param) => renderLabel(param, ['industryCategoryList', 'categoryName'], false),
      },
      {
        name: 'operation',
        align: 'left',
        tooltip: 'none',
        minWidth: isSrm ? 120 : 200,
        renderer: (param) => renderOptions(param, isSrm, callBack),
        lock: 'right',
      },
    ].filter((f) => f.show !== false);
  }, [isSrm]);

  const searchBarProps = {
    // aggregation,
    searchBarConfig: {
      fieldProps: {
        supplierId: { lovPara: { tenantId: isSrm ? 0 : organizationId } },
      },
      // right: {
      //   render: () => (
      //     <ViewFilter
      //       aggregation={aggregation}
      //       onAggregationChange={(_aggregation) => {
      //         setAggregation(_aggregation);
      //       }}
      //     />
      //   ),
      // },
    },
    cacheState: true,
    searchCode: searchBarCode,
  };
  return (
    <SearchBarTable
      className={styles['supplier-table']}
      dataSet={ds}
      columns={columns}
      customizedCode={tableCode}
      {...searchBarProps}
      style={{ maxHeight: 'calc(100vh - 400px)' }}
      rowHeight={38}
    />
  );
}

export default memo(TableCom);
