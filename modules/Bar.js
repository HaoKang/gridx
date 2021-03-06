define([
	"require",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dijit/a11y",
	"dojo/dom-construct",
	"../core/_Module",
	"../core/util"
], function(require, declare, lang, array, a11y, domConstruct, _Module, util){

	return _Module.register(
	declare(/*===== "gridx.modules.Bar", =====*/_Module, {
		// summary:
		//		This is a general-purpose bar for gridx. It can be configured to hold various plugins,
		//		such as pager, pageSizer, gotoPageButton, summary, quickFilter, toobar, etc.

		name: 'bar',

		getAPIPath: function(){
			return {
				bar: this
			};
		},

		constructor: function(){
			this.defs = [];
		},

		load: function(args, startup){
			var t = this;
			t._init();
			t.loaded.callback();
			startup.then(function(){
				t._forEachPlugin(function(plugin){
					if(plugin && plugin.startup){
						plugin.startup();
					}
				});
				setTimeout(function(){
					t.grid.vLayout.reLayout();
				}, 10);
			});
		},

		destroy: function(){
			this.inherited(arguments);
			this._forEachPlugin(function(plugin){
				if(plugin.destroy){
					plugin.destroy();
				}
			});
		},

		//Public---------------------------------------------------------

	/*=====
		//top: Array
		//		An array of bar content declarations. Located above grid header.
		//		The top bar is big html table, and every content occupies a cell in it.
		//		If it is a single demension array, then the top bar will contain only one row.
		//		If it is a 2 demension array, then every sub-array represents a row.
		//		For example:
		//		[
		//			gridx.barPlugins.QuickFilter,		//can be the constructor of a bar plugin widget.
		//			"gridx/barPlugins/Summary"			//can also be the MID of a bar plugin widget.
		//			{pluginClass: gridx.barPlugins.LinkSizer, style: "text-align: center;"}		//or an object with attributes
		//		]
		//		or
		//		[
		//			[		//every sub-array is a table row.
		//				{content: "This is <b>a message</b>", style: "backgroun-color: blue;"},	//Can add some html
		//				null	//if null, just an empty cell
		//			],
		//			[
		//				{pluginClass: gridx.barPlugins.LinkPager, 'class': 'myclass'},		//can provide custom class
		//				{colSpan: 2, rowSpan: 2}	//can add colSpan and rowSpan
		//			]
		//		]
		top: null,

		//bottom: Array
		//		An array of bar content declarations. Located below grid horizontal scroller.
		//		Usage is similar to the "top" attribute.
		bottom: null,

		//plugins: [readonly]Object
		//		A place to access to the plugins.
		//		For plugins in top bar, use plugins.top, which is an array of bar rows.
		//		e.g.: plugins.top[0][0] is the first plugin the first row of the top bar.
		//		plugin.bottom is similar.
		plugins: null,
	=====*/

		//Private---------------------------------------------------------
		_init: function(){
			var t = this,
				bar,
				defDict = t._defDict = {},
				sortDefCols = function(row){
					row.sort(function(a, b){
						return a.col - b.col;
					});
				},
				normalize = function(def){
					if(lang.isArray(def) && def.length && !lang.isArray(def[0])){
						def = [def];
					}
					return def;
				},
				top = normalize(t.arg('top')),
				bottom = normalize(t.arg('bottom'));
			array.forEach(t.defs, function(def){
				var barDef = defDict[def.bar] = defDict[def.bar] || [],
					row = barDef[def.row] = barDef[def.row] || [];
				row.push(def);
				barDef.priority = 'priority' in def ? def.priority : barDef.priority || -5;
				barDef.container = def.container ? def.container : barDef.container || 'headerNode';
				barDef.barClass = def.barClass ? def.barClass : barDef.barClass || '';
			});
			for(bar in defDict){
				array.forEach(defDict[bar], sortDefCols);
			}
			if(top){
				defDict.top = top.concat(defDict.top || []);
			}
			if(defDict.top){
				defDict.top.priority = -5;
				defDict.top.container = 'headerNode';
			}
			if(bottom){
				defDict.bottom = (defDict.bottom || []).concat(bottom);
			}
			if(defDict.bottom){
				defDict.bottom.priority = 5;
				defDict.bottom.container = 'footerNode';
			}
			for(bar in defDict){
				var def = defDict[bar],
					nodeName = bar + 'Node',
					node = t[nodeName] = domConstruct.create('div', {
						'class': "gridxBar " + def.barClass || '',
						innerHTML: '<table border="0" cellspacing="0"></table>'
					});
				t.grid.vLayout.register(t, nodeName, def.container, def.priority);
				t._initFocus(bar, def.priority);
				t.plugins = t.plugins || {};
				t.plugins[bar] = t._parse(def, node.firstChild);
			}
		},

		_parse: function(defs, node){
			var plugin,
				plugins = [],
				tbody = domConstruct.create('tbody'),
				setAttr = function(n, def, domAttr, attr){
					if(def[attr]){
						n.setAttribute(domAttr || attr, def[attr]);
						delete def[attr];
					}
				};
			for(var i = 0, rowCount = defs.length; i < rowCount; ++i){
				var pluginRow = [],
					row = defs[i],
					tr = domConstruct.create('tr');
				for(var j = 0, colCount = row.length; j < colCount; ++j){
					var def = this._normalizePlugin(row[j]),
						td = domConstruct.create('td');
					array.forEach(['colSpan', 'rowSpan', 'style'], lang.partial(setAttr, td, def, 0));
					setAttr(td, def, 'class', 'className');
					plugin = null;
					if(def.pluginClass){
						var cls = def.pluginClass;
						delete def.pluginClass;
						try{
							plugin = new cls(def);
							td.appendChild(plugin.domNode);
						}catch(e){
							console.error(e);
						}
					}else if(def.content){
						td.innerHTML = def.content;
					}
					pluginRow.push(plugin || td);
					tr.appendChild(td);
				}
				plugins.push(pluginRow);
				tbody.appendChild(tr);
			}
			node.appendChild(tbody);
			return plugins;
		},

		_normalizePlugin: function(def){
			if(!def || !lang.isObject(def) || lang.isFunction(def)){
				def = {
					pluginClass: def
				};
			}else{
				//Shallow copy, so user's input won't be changed.
				def = lang.mixin({}, def);
			}
			if(lang.isString(def.pluginClass)){
				try{
					def.pluginClass = require(def.pluginClass);
				}catch(e){
					console.error(e);
				}
			}
			if(lang.isFunction(def.pluginClass)){
				def.grid = this.grid;
			}else{
				def.pluginClass = null;
			}
			return def;
		},

		_forEachPlugin: function(callback){
			function forEach(plugins){
				if(plugins){
					for(var i = 0, rowCount = plugins.length; i < rowCount; ++i){
						var row = plugins[i];
						for(var j = 0, colCount = row.length; j < colCount; ++j){
							callback(row[j]);
						}
					}
				}
			}
			var plugins = this.plugins;
			for(var barName in plugins){
				forEach(plugins[barName]);
			}
		},

		//Focus---------------------
		_initFocus: function(barName, priority){
			var t = this,
				f = t.grid.focus,
				node = t[barName + 'Node'];
			if(f && node){
				f.registerArea({
					name: barName + 'bar',
					priority: priority,
					focusNode: node,
					doFocus: lang.hitch(t, t._doFocus, node),
					doBlur: lang.hitch(t, t._doBlur, node)
				});
			}
		},

		_doFocus: function(node, evt, step){
			this.grid.focus.stopEvent(evt);
			var elems = a11y._getTabNavigable(node),
				n = elems[step < 0 ? 'last' : 'first'];
			if(n){
				n.focus();
			}
			return !!n;
		},

		_doBlur: function(node, evt, step){
			var elems = a11y._getTabNavigable(node);
			return evt ? evt.target == (step < 0 ? elems.first : elems.last) : true;
		}
	}));
});
