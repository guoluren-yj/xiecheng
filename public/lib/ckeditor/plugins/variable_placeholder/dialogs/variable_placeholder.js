
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * CKEditor 4 LTS ("Long Term Support") is available under the terms of the Extended Support Model.
 */

/**
 * @fileOverview Definition for placeholder plugin dialog.
 *
 */

'use strict';

CKEDITOR.dialog.add( 'variable_placeholder', function( editor ) {
	var lang = editor.lang.variable_placeholder,
		generalLabel = editor.lang.common.generalTab,
		validNameRegex = /^[^\[\]<>]+$/;

	return {
		title: lang.title,
		minWidth: 300,
		minHeight: 80,
		contents: [
			{
				id: 'info',
				label: generalLabel,
				title: generalLabel,
				elements: [
					{
						id: 'variableName',
						type: 'text',
						style: 'width: 100%;',
						label: lang.variableName,
						'default': '',
						required: true,
						setup: function( widget ) {
							this.setValue( widget.data.variableName );
						},
						commit: function( widget ) {
							widget.setData( 'variableName', this.getValue() );
						}
					},
				]
			},
		]
	};
} );
