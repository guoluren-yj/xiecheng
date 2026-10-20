/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * CKEditor 4 LTS ("Long Term Support") is available under the terms of the Extended Support Model.
 */

/**
 * @fileOverview The "placeholder" plugin.
 *
 */

'use strict';

( function() {
	CKEDITOR.plugins.add( 'function_placeholder', {
		requires: 'widget,dialog',
		lang: 'af,ar,az,bg,ca,cs,cy,da,de,de-ch,el,en,en-au,en-gb,eo,es,es-mx,et,eu,fa,fi,fr,fr-ca,gl,he,hr,hu,id,it,ja,km,ko,ku,lv,nb,nl,no,oc,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		icons: 'function_placeholder', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		onLoad: function() {
			// Register styles for placeholder widget frame.
			CKEDITOR.addCss( '.cke_function_placeholder{background-color:#ff0}' );
		},

		init: function( editor ) {

			var lang = editor.lang.function_placeholder;

			// Register dialog.
			CKEDITOR.dialog.add( 'function_placeholder', this.path + 'dialogs/function_placeholder.js' );

			// Put ur init code here.
			editor.widgets.add( 'function_placeholder', {
				// Widget code.
				dialog: 'function_placeholder',
				pathName: lang.pathName,
				// We need to have wrapping element, otherwise there are issues in
				// add dialog.
				template: '<span class="cke_function_placeholder">[[]]</span>',

				downcast: function() {
					return new CKEDITOR.htmlParser.text(
							'#' + this.data.functionName + '(' + (this.data.functionBody || '') + ')'
					);
				},

				init: function() {
					const reg = /#(.*)\((.*)\)/;
					const txt = this.element.getText().match(reg);
					// Note that placeholder markup characters are stripped for the name.
					this.setData( 'functionName',(txt && txt[1]) || '');
					this.setData( 'functionBody',(txt && txt[2]) || '');
				},

				data: function() {
					this.element.setText(
						'#' + this.data.functionName + '(' + (this.data.functionBody || '') + ')'
					);
				},

				getLabel: function() {
					return this.editor.lang.widget.label.replace( /%1/, this.data.name + ' ' + this.pathName );
				}
			} );

			editor.ui.addButton && editor.ui.addButton( 'CreateFunctionPlaceholder', {
				label: lang.toolbar,
				command: 'function_placeholder',
				toolbar: 'insert,5',
				icon: 'function_placeholder'
			} );
		},

		afterInit: function( editor ) {
			var placeholderReplaceRegex = /#[^(]*\([^)]*\)/g;

			editor.dataProcessor.dataFilter.addRules( {
				text: function( text, node ) {
					var dtd = node.parent && CKEDITOR.dtd[ node.parent.name ];

					// Skip the case when placeholder is in elements like <title> or <textarea>
					// but upcast placeholder in custom elements (no DTD).
					if ( dtd && !dtd.span )
						return;

					return text.replace( placeholderReplaceRegex, function( match ) {
						// Creating widget code.
						var widgetWrapper = null,
							innerElement = new CKEDITOR.htmlParser.element( 'span', {
								'class': 'cke_function_placeholder'
							} );

						// Adds placeholder identifier as innertext.
						innerElement.add( new CKEDITOR.htmlParser.text( match ) );
						widgetWrapper = editor.widgets.wrapElement( innerElement, 'function_placeholder' );

						// Return outerhtml of widget wrapper so it will be placed
						// as replacement.
						return widgetWrapper.getOuterHtml();
					} );
				}
			} );
		}
	} );

} )();
