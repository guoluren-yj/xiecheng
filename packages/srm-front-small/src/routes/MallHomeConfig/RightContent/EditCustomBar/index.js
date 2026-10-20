import React, { useMemo, useLayoutEffect, useRef } from 'react';
import { connect } from 'dva';
import { compose } from 'lodash';
import {
  Form,
  DataSet,
  Select,
  Icon,
  Lov,
  Table,
  Button as C7nButton,
  IntlField,
  CheckBox,
} from 'choerodon-ui/pro';
import { Button } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import { PUBLIC_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
// import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import { openUnitTree } from '@/components/UnitTreeModal';
import AttachmentItem from '@/components/AttachmentItem';
import CroperModal from '@/routes/Components/CroperModal';

import styles from './index.less';
import formds from './formds';
import tableds from './tableds';
import UploadCrop from '../../common/UploadCrop';
import HotConfig from '../../HotConfig';
import ComContent from '../../common/ComContent';
import { DeleteButton } from '../../common/buttons';
import { deleteCofirmModal } from '../../common/modals';

const UploadButton = observer(({ dataSet, name }) => {
  const croperModal = useRef();
  return dataSet?.get(name) ? (
    <AttachmentItem
      bucketName={PUBLIC_BUCKET}
      handleRemove={() => {
        dataSet.set(name, '');
      }}
      fileUrl={dataSet.get(name)}
    />
  ) : (
    <>
      <Button
        disabled={name === 'imageUrlTwo' && +dataSet.get('moduleType') !== 2}
        onClick={() => {
          if (croperModal?.current?.toggle()) croperModal.toggle();
        }}
        style={{ color: '#333' }}
      >
        <Icon type="file_upload" />
        {intl.get(`small.common.model.attachment.upload`).d('附件上传')}
      </Button>
      <CroperModal
        fn={(ele) => {
          croperModal.current = ele;
        }}
        maxSize={5}
        width={name === 'imageUrlTwo' ? 1190 : 230}
        height={name === 'imageUrlTwo' ? 340 : 113}
        canvasStyle={{
          width: name === 'imageUrlTwo' ? 1190 : 230,
          height: name === 'imageUrlTwo' ? 340 : 113,
        }}
        callback={(e) => dataSet.set(name, e?.url)}
      />
    </>
  );
});

const AddButton = observer(({ dataSet }) => {
  return (
    <C7nButton
      color="primary"
      funcType="flat"
      icon="playlist_add"
      onClick={() => {
        dataSet.create({
          lineNum: dataSet.toData()?.length + 1,
          orderSeq: dataSet.toData()?.length + 1,
        });
      }}
      disabled={dataSet.toData().length >= 5}
    >
      {intl.get('hzero.common.button.add').d('新增')}
    </C7nButton>
  );
});

function EditCustomBar(props) {
  const {
    customBar,
    customBar: { customType },
    mallHome: { currentRole, mallType, purchase },
    mallHome,
    modal,
    dispatch,
  } = props;
  const customBarList = mallHome[`${mallType}customBarList`];

  const formDs = useMemo(() => {
    return new DataSet(formds({ currentRole, unitId: purchase.unitId, mallType }));
  }, []);

  const tableDs = useMemo(() => {
    return new DataSet(tableds({ currentRole, unitId: purchase.unitId, mallType }));
  }, []);

  useLayoutEffect(() => {
    formDs.loadData([
      {
        jumpPage: 0,
        hotZoneFlag: 1,
        ...customBar,
        simpleCustomName: customBar?.simpleCustomName || customBar?.customName?.slice(0, 6),
        ...(customBar?.customTagLineList?.[0] || {}),
        _token: customBar._token, // 行上也有token，会影响多语言查询
        objectVersionNumber: customBar.objectVersionNumber,
      },
    ]);
    formDs.forEach((r) => {
      // eslint-disable-next-line no-param-reassign
      r.status = 'update';
    });
    if (customBar.customType === 4) {
      tableDs.loadData(customBar?.customTagLineList?.map((p, i) => ({ ...p, lineNum: i + 1 })));
    }
  }, []);

  modal.handleOk(() => {
    return handleOk();
  });

  const handleOk = async () => {
    const res = await Promise.all([formDs.validate(), tableDs.validate()]);
    const flag = res?.every((p) => p);
    if (flag) {
      dispatch({
        type: 'mallHome/updateState',
        payload: {
          [`${mallType}customBarList`]: customBarList.map((c) => {
            if ((c.customId || c.uuid) === (customBar.uuid || customBar.customId)) {
              const data = formDs.current.toData();
              let lineList = [];
              if ([1, 2, 3].includes(customBar.customType)) {
                lineList.push({
                  ...customBar?.customTagLineList?.[0],
                  moduleType: data.moduleType || 2,
                  imageUrl: data.imageUrl,
                  imageUrlTwo: data.imageUrlTwo,
                  jumpPage: data.jumpPage,
                  productGroupId: data.productGroupId,
                });
              } else if (customBar.customType === 4) {
                lineList = tableDs.toData().map((p) => {
                  return { ...p, jumpPage: p.imageUrlTwo ? 1 : 0 };
                });
              }
              return {
                ...c,
                ...data,
                updateFlag: c.customId ? 1 : 0,
                unitId: purchase.unitId,
                groupAttribute: mallType === 'sigl' ? 1 : 0,
                customLevel: currentRole === 'tenant' ? '0' : '1',
                tenantId: getCurrentOrganizationId(),
                customTagLineList: lineList,
                pageConfigAuthList: data.pageConfigAuthList?.filter((p) => p.unitId !== 'ALL'),
              };
            } else {
              return c;
            }
          }),
        },
      });
    } else {
      const data = formDs.current.toData();
      if (
        ([2, 3].includes(customType) && !data.imageUrl) ||
        (data.jumpPage === 1 && !data.imageUrlTwo)
      ) {
        notification.warning({
          message: intl.get('small.common.view.noImage.warning').d('请上传图片'),
        });
      } else if (customType === 4) {
        if (tableDs.toData().some((p) => !p?.imageUrl)) {
          notification.warning({
            message: intl.get('small.common.view.noImage.warning').d('请上传图片'),
          });
        }
      }
    }
    return flag;
  };

  const tempMapping = {
    1: {
      title: intl.get('small.common.view.template.moreProduct').d('多品模板'),
      tips: intl.get('small.common.view.apply.allType').d('适用所有类型'),
    },
    2: {
      title: intl.get('small.common.view.template.one.moreProduct').d('一竖图多品模板'),
      tips: intl.get('small.common.view.apply.allType').d('适用所有类型'),
    },
    3: {
      title: intl.get('small.common.view.template.onecome.moreProduct').d('一横图多品模板'),
      tips: intl.get('small.common.view.apply.allType').d('适用所有类型'),
    },
    4: {
      title: intl.get('small.common.view.template.five.moreProduct').d('五图模板'),
      tips: intl
        .get('small.common.view.fiveProduct.tips')
        .d('推荐使用于Logo墙的展示，通过点击Logo进入商品列表页，可自定义1-5个板块。'),
    },
  };

  const columns = [
    {
      name: 'lineNum',
      width: 60,
    },
    {
      name: 'moduleName',
      width: 120,
      label: intl.get('small.mallHomeConfig.model.moduleName').d('板块名称'),
      editor: () => <IntlField />,
    },
    {
      name: 'imageUrl',
      width: 120,
      renderer: ({ record }) => {
        return <UploadButton dataSet={record} name="imageUrl" />;
      },
    },
    {
      name: 'moduleType',
      width: 120,
      editor: (record) => (
        <Select
          onChange={() => {
            record.set('productGroupLov', {});
            record.set('quickLink', '');
          }}
        />
      ),
    },
    {
      name: 'productGroupLov',
      width: 150,
      editor: () => true,
    },
    {
      name: 'quickLink',
      width: 150,
      editor: () => true,
    },
    {
      name: 'imageUrlTwo',
      width: 120,
      renderer: ({ record }) => {
        return <UploadButton dataSet={record} name="imageUrlTwo" />;
      },
    },
  ];

  // 批量删除
  const handleDelete = (records) => {
    deleteCofirmModal({
      onOk: () => {
        tableDs.remove(records, true);
      },
    });
  };

  const UploadBtn = observer(({ dataSet }) => {
    return (
      <div style={{marginTop: 16}}>
        {dataSet.current.get('jumpPage') === 1 && (
          <UploadCrop
            title={intl.get('small.mallHomeConfig.secondPage.banner').d('二级页面Banner图片 ')}
            width={1190}
            height={340}
            imgUrl={dataSet.current.get('imageUrlTwo')}
            handleOk={(data) => {
              dataSet.current.set('imageUrlTwo', data?.url);
            }}
          />
        )}
      </div>
    );
  });

  return (
    <div className={styles.content}>
      <ComContent style={{marginBottom: 16}} title={tempMapping[customType]?.title} desc={tempMapping[customType]?.tips} />
      <Form dataSet={formDs} labelLayout="float" columns={customType === 4 ? 3 : 1}>
        <IntlField name="customName" />
        <Select name="location" />
        {customType !== 4 && (
          <Lov
            name="productGroupLov"
            help={intl
              .get('small.mallHomeConfig.view.chooseProduct.warning')
              .d('如没有符合的商品集合，可至商品推荐列表进行创建')}
            showHelp="tooltip"
          />
        )}
        {currentRole === 'tenant' && mallType !== 'sigl' && (
          <Lov
            name="pageConfigAuthList"
            // readOnly
            colSpan={2}
            onClick={() =>
              openUnitTree({
                record: formDs.current,
                name: 'pageConfigAuthList',
              })
            }
          />
        )}
        <IntlField name="simpleCustomName" />
        {[2, 3].includes(customType) && (
          <UploadCrop
            width={customBar.customType === 2 ? 230 : 1190}
            height={customBar.customType === 2 ? 686 : 340}
            imgUrl={(customBar?.customTagLineList?.[0] || {}).imageUrl}
            handleOk={data => {
              formDs.current.set('imageUrl', data?.url);
            }}
          />
        )}
        {customType !== 4 && (
          <CheckBox
            name="jumpPage"
            help={intl
              .get('small.mallHomeConfig.view.isToSecond.customwarning')
              .d('二级页面是可跳转至该自定义栏所对应的商品列表页，可为其配置所对应的Banner')}
            showHelp="tooltip"
          />
        )}
      </Form>
      {customType !== 4 && <UploadBtn dataSet={formDs} />}
      {[2, 3].includes(customType) && (
        <HotConfig dataSet={formDs} mallType={mallType} hotType="custom" customType={customType} />
      )}
      {customType === 4 && (
        <div style={{ marginTop: 16 }}>
          <Table
            customizedCode="CUSTOM_BAR_TYPE4_TABLE"
            dragDropContextProps={{
              onDragEnd: dataSet => {
                dataSet.forEach((record, index) => {
                  record.set('orderSeq', index);
                });
              },
            }}
            rowDraggable
            dragColumnAlign="left"
            dataSet={tableDs}
            columns={columns}
            buttons={[
              <AddButton dataSet={tableDs} />,
              <DeleteButton dataSet={tableDs} onClick={() => handleDelete(tableDs.selected)} />,
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  }))
)(EditCustomBar);
