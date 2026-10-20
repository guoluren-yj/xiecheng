import React from 'react';
import { isNumber } from 'lodash';
import { observer, Observer } from 'mobx-react-lite';
import { DraggableArea } from 'react-draggable-tags';
import { Form, Tooltip, Button, Select, Icon, DataSet, Modal, TextField } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import Card from '@/components/Card';
import defaultImg from '@/assets/sku_default.svg';
import OverflowTip from '@/components/OverflowTip';
import { sortByOrderSeq } from '../reverseAttrField';
import MoreSelect from '../MoreSelect';

import styles from './index.less';

export default function (props) {
  const {
    dataSet: ds,
    tableDs,
    showSuggestionText,
    isAddSpec,
    deleteSpec = (e) => e,
    addPlacement = 'bottom',
  } = props;

  // 销售规格被引用
  const getSpecIsHas = (record) => {
    const skus = tableDs.toData();
    const customAttrId = record.get('customAttrId');
    return customAttrId && skus.some((s) => s[`spec_${customAttrId}`]);
  };

  // 销售规格该属性值被用到
  const getAttrValIsHas = (record) => {
    const skus = tableDs.toData();
    const customAttrId = record.get('customAttrId') || record.get('attrId');
    const customAttrValueId = record.get('customAttrValueId') || record.get('attrValueId');
    const getSkuAttrValueId = (sku) => sku[`spec_${customAttrId}`]?.customAttrValueId;
    return customAttrId && skus.some((s) => getSkuAttrValueId(s) === customAttrValueId);
  };

  const suggestionText = showSuggestionText
    ? intl.get('smpc.product.model.suggestSaleSpecsNumLimit').d('建议最多添加4种销售属性')
    : intl.get('smpc.product.model.saleSpecsNumLimit').d('最多添加4种销售属性');

  const handleAdd = () => {
    const lastRecord = ds.get(ds.length - 1);
    const attrOrderSeq = lastRecord ? lastRecord.get('attrOrderSeq') || 0 : 0; // 属性序号从0开始， 属性值排序号从1开始
    // customDragId: 新建项拖拽的唯一id, 因为此时无customAttrId
    ds.create({
      attrType: 1,
      attrOrderSeq: attrOrderSeq + 1,
      customDragId: new Date().getMilliseconds(),
    });
  };

  function handleEditSpec(r) {
    const saleSpecs = ds.filter((f) => f.id !== r.id);
    const { attrId, attributeName, attributeCode, attrValLov = [] } = r.toData();
    const specAttrDs = new DataSet({
      fields: [
        {
          name: 'attributeName',
          label: intl.get('smpc.product.model.saleSpecs').d('销售规格'),
          required: true,
          dynamicProps: {
            disabled: ({ record }) => record.get('attributeCode'),
          },
          validator: (value) => {
            if (saleSpecs.some((s) => s.get('attributeName') === value)) {
              return intl.get('smpc.product.view.specsRepeat').d('该销售规格已存在');
            }
          },
        },
      ],
      events: {
        update: ({ record, name, value }) => {
          if (name === 'attributeName') {
            record.set('attrId', value);
            record.set('attrName', value);
          }
        },
      },
    });
    specAttrDs.create({ attrId, attributeName, attributeCode });
    const specValueDs = new DataSet({
      paging: false,
      fields: [
        {
          name: 'attrValueName',
          label: intl.get('smpc.product.model.attrValues').d('属性值'),
          required: true,
          dynamicProps: {
            disabled: ({ record }) => record.get('attrValueCode'),
          },
          validator: (value, _, record) => {
            const otherAttrValueData = attrValLov.filter(
              (f) => f.attrValueName !== record.get('initAttrValueName')
            );
            if (otherAttrValueData.some((s) => s.attrValueName === value)) {
              return intl
                .get('smpc.product.view.specsAttrValueRepeats')
                .d('销售规格下该属性值已存在');
            }
          },
        },
        {
          name: 'initAttrValueName',
          transformResponse: (_, line) => line.attrValueName,
        },
      ],
      events: {
        update: ({ record, name, value }) => {
          if (name === 'attrValueName') {
            record.set('attrValue', value);
            record.set('attrValueId', value);
          }
        },
      },
    });
    specValueDs.loadData(attrValLov);
    Modal.open({
      title: intl.get('smpc.product.view.title.fixSpecs').d('修改销售规格'),
      style: { width: 380 },
      drawer: true,
      children: (
        <>
          <div style={{ paddingLeft: 24 }}>
            <Form dataSet={specAttrDs} labelLayout="float" style={{ marginBottom: 14 }}>
              <TextField name="attributeName" />
            </Form>
          </div>
          <DraggableArea
            isList
            tags={specValueDs.records}
            onChange={(tags) => {
              tags.forEach((tag, idx) => {
                specValueDs.forEach((_r) => {
                  if (_r.get('attrValueId') === tag.get('attrValueId')) {
                    _r.set('valueOrderSeq', idx + 1);
                  }
                });
              });
            }}
            render={({ tag: record }) => (
              <div className={styles['value-sale-specs-line']}>
                <Icon type="baseline-drag_indicator" />
                <Form record={record} labelLayout="float" style={{ marginBottom: 14 }}>
                  <TextField name="attrValueName" />
                </Form>
              </div>
            )}
          />
        </>
      ),
      onOk: async () => {
        const attrFlag = await specAttrDs.validate();
        const valueFlag = await specValueDs.validate();
        if (!attrFlag || !valueFlag) return false;
        const attrInfo = specAttrDs.current.toData();
        const attrValData = sortByOrderSeq(specValueDs.toData(), 'valueOrderSeq');
        const attrValues = attrValData.map((m) => m.attrValueId);
        r.set({
          ...attrInfo,
          attrValLov: attrValData,
          attrValues,
        });
      },
    });
  }

  const SaleSpecsContainer = observer(({ dataSet }) => {
    return (
      <div className={styles['sale-specs-modal']}>
        <DraggableArea
          isList
          tags={dataSet.data}
          onChange={(tags) => {
            tags.forEach((tag, idx) => {
              dataSet.forEach((r) => {
                if (tag.get('customAttrId')) {
                  if (r.get('customAttrId') === tag.get('customAttrId')) {
                    r.set('attrOrderSeq', idx);
                  }
                } else if (r.get('customDragId') === tag.get('customDragId')) {
                  r.set('attrOrderSeq', idx);
                }
              });
            });
          }}
          render={({ tag: record, index }) => {
            const valueCustom = record.get('valueCustom');
            const isCustom = !record.get('attrValueCode') ? 1 : 0;
            const attrValueCustom = isNumber(valueCustom) ? valueCustom : isCustom;
            return (
              <Observer>
                {() => (
                  <div className="sale-specs-line">
                    <Icon type="baseline-drag_indicator" />
                    <Form
                      record={record}
                      labelLayout="float"
                      columns={2}
                      style={{ width: 670, margin: 0 }}
                    >
                      <Select
                        combo
                        searchable
                        name="attrObj"
                        disabled={getSpecIsHas(record)}
                        style={{ width: '100%' }}
                        optionsFilter={(r) => {
                          const attrId = record.get('attrId');
                          const repeat = Array.from(dataSet.records).some((_r) => {
                            return (
                              r.get('attrId') !== attrId && _r.get('attrId') === r.get('attrId')
                            );
                          });
                          return !repeat;
                        }}
                        onChange={(value, oldValue) => {
                          // 自定义的属性值
                          if (value && !value.attrValueCode) {
                            // 其他已经存在该属性值了
                            const isRepeat =
                              dataSet.filter((s) => {
                                return value.attrId === s.get('attrId');
                              }).length > 1;
                            if (isRepeat) {
                              record.set('attrObj', oldValue);
                            }
                          }
                          record.set('attrValues', []);
                          record.set('attrValLov', []);
                        }}
                      />
                      <MoreSelect
                        id={`sale_spec_${index}`}
                        name="attrValues"
                        record={record}
                        searchable
                        style={{ width: '100%' }}
                        custom={attrValueCustom === 1}
                        disabled={!record.get('attrId')}
                        placeholder={
                          attrValueCustom === 1
                            ? intl
                                .get('smpc.product.view.chooseInputValues')
                                .d('可输入或选择属性值')
                            : intl.get('smpc.product.view.chooseValues').d('请选择属性值')
                        }
                        onOption={({ record: r }) => {
                          return { disabled: getAttrValIsHas(r) };
                        }}
                        optionsFilter={(r) => {
                          if (
                            record.get('attributeCode') === '000000000001' &&
                            r.get('brandNameZh')
                          ) {
                            return r
                              .get('brandNameZh')
                              .includes(record.get('attrValLov').brandNameZh);
                          }
                          return true;
                        }}
                      />
                    </Form>
                    {!getSpecIsHas(record) ? (
                      <Icon
                        type="delete"
                        style={{
                          cursor: 'pointer',
                          fontSize: '16px',
                          marginLeft: 16,
                          lineHeight: '35px',
                          color: 'initial',
                        }}
                        onClick={() => deleteSpec(record)}
                      />
                    ) : (
                      <Icon
                        type="mode_edit"
                        style={{
                          cursor: 'pointer',
                          fontSize: '16px',
                          marginLeft: 16,
                          lineHeight: '35px',
                          color: 'initial',
                        }}
                        onClick={() => handleEditSpec(record)}
                      />
                    )}
                  </div>
                )}
              </Observer>
            );
          }}
        />
        {isAddSpec && (
          <div>
            <Tooltip
              placement={addPlacement}
              // hidden={dataSet.data.length < 4}
              title={suggestionText}
            >
              <Button
                disabled={dataSet.data.length >= 4}
                funcType="flat"
                color="primary"
                icon="playlist_add"
                onClick={handleAdd}
              >
                {intl.get('smpc.product.model.addSaleSpecs').d('新增销售规格')}
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    );
  });
  return (
    <>
      <Card title={intl.get('smpc.product.model.saleSpecs').d('销售规格')}>
        <SaleSpecsContainer dataSet={ds} />
      </Card>
      <Card title={intl.get('smpc.workbench.view.mallPreview').d('商城预览')}>
        <div className={styles['dynamic-spec-preview']}>
          <div className="display-image">
            <img className="big-image" src={defaultImg} alt="specView" />
            <div className="small-images">
              <Icon type="navigate_before" />
              <div className="images">
                {[1, 2, 3].map((m) => (
                  <img className="small-image" src={defaultImg} alt="specView" key={m} />
                ))}
              </div>
              <Icon type="navigate_next" />
            </div>
          </div>
          <div className="right-detail">
            <div className="skeleton">
              <div className="item item-1" />
              <div className="item item-2" />
              <div className="item item-3" />
              <div className="item item-4" />
            </div>
            <div className="spec-list">
              <Observer>
                {() =>
                  sortByOrderSeq(
                    ds.toData().filter((f) => f.customAttrId),
                    'attrOrderSeq'
                  ).map((r) => (
                    <div className="spec-item" key={r.attrId}>
                      <span className="label">
                        <OverflowTip style={{ maxWidth: 60 }}>
                          {r.attributeName || r.attrName}
                        </OverflowTip>
                      </span>
                      <div className="values">
                        {(r.attrValLov || []).map((m, idx) => (
                          <span key={m.attrValueId} className={`value ${!idx ? 'active' : ''}`}>
                            <OverflowTip style={{ maxWidth: 120 }}>{m.attrValueName}</OverflowTip>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </Observer>
            </div>
            <div className="cart-area">
              <div className="cart-num">
                5
                <div className="cart-operate">
                  <Icon type="arrow_drop_up" />
                  <Icon type="arrow_drop_down" />
                </div>
              </div>
              <Button disabled color="primary" style={{ width: 160 }}>
                {intl.get('smpc.product.view.button.addCart').d('加入购物车')}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
