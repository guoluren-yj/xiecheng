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
	CKEDITOR.plugins.add( 'variable_placeholder', {
		requires: 'widget,dialog',
		lang: 'af,ar,az,bg,ca,cs,cy,da,de,de-ch,el,en,en-au,en-gb,eo,es,es-mx,et,eu,fa,fi,fr,fr-ca,gl,he,hr,hu,id,it,ja,km,ko,ku,lv,nb,nl,no,oc,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		icons: 'variable_placeholder', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		onLoad: function() {
			// Register styles for placeholder widget frame.
			CKEDITOR.addCss( '.cke_variable_placeholder{background-color:#ff0}' );
		},

		init: function( editor ) {

			var lang = editor.lang.variable_placeholder;

			// Register dialog.
			CKEDITOR.dialog.add( 'variable_placeholder', this.path + 'dialogs/variable_placeholder.js' );

			// Put ur init code here.
			editor.widgets.add( 'variable_placeholder', {
				// Widget code.
				dialog: 'variable_placeholder',
				pathName: lang.pathName,
				// We need to have wrapping element, otherwise there are issues in
				// add dialog.
				template: '<span class="cke_variable_placeholder">[[]]</span>',

				downcast: function() {
					return new CKEDITOR.htmlParser.text(
						 '${' + this.data.variableName + '}'
					);
				},

				init: function() {
					const reg = /\$\{(.*)\}/;
					const txt = this.element.getText().match(reg);
					// Note that placeholder markup characters are stripped for the name.
					this.setData( 'variableName', (txt && txt[1]) || '');
				},

				data: function() {
					this.element.setText(
						 '${' + this.data.variableName + '}' 
					);
				},

				getLabel: function() {
					return this.editor.lang.widget.label.replace( /%1/, this.data.variableName + ' ' + this.pathName );
				}
			} );

			editor.ui.addButton && editor.ui.addButton( 'CreateVariablePlaceholder', {
				label: lang.toolbar,
				command: 'variable_placeholder',
				toolbar: 'insert,5',
				icon: 'variable_placeholder'
			} );
		},

		afterInit: function( editor ) {
			// var placeholderReplaceRegex = /\[\[([^\[\]])+\]\]/g;
			var placeholderReplaceRegex = /\$\{[^\{]*\}/g;

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
								'class': 'cke_variable_placeholder'
							} );
						// Adds placeholder identifier as innertext.
						innerElement.add( new CKEDITOR.htmlParser.text( match ) );
						widgetWrapper = editor.widgets.wrapElement( innerElement, 'variable_placeholder' );

						// Return outerhtml of widget wrapper so it will be placed
						// as replacement.
						return widgetWrapper.getOuterHtml();
					} );
				}
			} );
		}
	} );

} )();
