define([
	"dojo/_base/kernel",
	"../core/_Module",
	"dojo/_base/declare",
	"../support/printer"
], function(kernel, _Module, declare, printer){

	kernel.deprecated('gridx/modules/Printer is deprecated.', 'Please use gridx/support/printer instead.', '2.0');
	/*=====
	declare('__PrinterArgs', __ExporterArgs, {
		// style: String
		//		The CSS string for the printed document
		style: '',

		// styleSrc: URL String
		//		The CSS file url used for the printed document
		styleSrc: '',

		// title: String
		//		The content of the <title> element in the <head> of the printed document
		title: '',

		// description: String
		//		Any HTML content that will be put before the grid in the printed document.
		description: ''

		// customHead: String
		//		Any HTML <head> content that will be put in the <head> of the printed document.
		customHead: ''
	});
	=====*/

	return declare(/*===== "gridx.modules.Printer", =====*/_Module, {
		// summary:
		//		This module provides the API to print grid contents or provide print preview
		// description:
		//		This module relies on the ExportTable module to produce HTML table from grid.
		name: 'printer',

		getAPIPath: function(){
			// tags:
			//		protected extension
			return {
				printer: this
			};
		},
	
		//Public-----------------------------------------------------------------
		print: function(args){
			// summary:
			//		Print grid contents.
			// args: Object
			//		Please refer to `grid.printer.__PrinterArgs`
			// returns:
			//		A deferred object indicating when the export process is completed.
			return printer(this.grid, args);
		},

		toHTML: function(args){
			// summary
			//		Export to printable html, used for preview
			// args: Object
			//		Please refer to `grid.printer.__PrinterArgs`
			// returns:
			//		A deferred object indicating when the export process is completed.
			return printer.toHTML(this.grid, args);
		}
	});
});
