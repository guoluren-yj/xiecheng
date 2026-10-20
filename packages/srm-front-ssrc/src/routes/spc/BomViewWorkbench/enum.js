export const BomDimensionWidgetCode = {
    INPUT: 'INPUT',
    LINK: 'LINK',
    LOV: 'LOV',
    SELECT: 'SELECT',
    INPUT_NUMBER: 'INPUT_NUMBER',
    CHECKBOX: 'CHECKBOX',
    DATE_PICKER: 'DATE_PICKER',
};

export const WidgetFormTypeMap = {
    [BomDimensionWidgetCode.INPUT]: 'TextField',
    [BomDimensionWidgetCode.LINK]: 'Output',
    [BomDimensionWidgetCode.LOV]: 'Lov',
    [BomDimensionWidgetCode.SELECT]: 'Select',
    [BomDimensionWidgetCode.INPUT_NUMBER]: 'NumberField',
    [BomDimensionWidgetCode.CHECKBOX]: 'CheckBox',
    [BomDimensionWidgetCode.DATE_PICKER]: 'DatePicker',
};