
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * CKEditor 4 LTS ("Long Term Support") is available under the terms of the Extended Support Model.
 */

/**
 * @fileOverview Definition for placeholder plugin dialog.
 *
 */

'use strict';

CKEDITOR.dialog.add( 'function_placeholder', function( editor ) {
	var lang = editor.lang.function_placeholder,
		generalLabel = editor.lang.common.generalTab,
		validNameRegex = /^[^\[\]<>]+$/;
	console.log('11')
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
						id: 'functionName',
						type: 'text',
						style: 'width: 100%;',
						label: lang.functionName,
						'default': '',
						required: true,
						setup: function( widget ) {
							this.setValue( widget.data.functionName );
						},
						commit: function( widget ) {
							widget.setData( 'functionName', this.getValue() );
						}
					},
					{
						id: 'functionBody',
						type: 'text',
						style: 'width: 100%;',
						label: lang.functionBody,
						'default': '',
						setup: function( widget ) {
							this.setValue( widget.data.functionBody );
						},
						commit: function( widget ) {
							widget.setData( 'functionBody', this.getValue() );
						}
					},
				]
			}
		]
	};
} );
