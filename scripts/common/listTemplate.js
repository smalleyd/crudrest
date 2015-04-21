function ListTemplate(properties)
{
	this.load(properties);
	if (this.CAN_EDIT || this.CAN_ADD)
		this.EDITOR = new EditTemplate(properties);
	this.CAN_REMOVE = (undefined != this.REMOVE_URL);
	this.OPEN_CHILD = (undefined != this.openChild);
	this.HAS_ROW_ACTIONS = (this.CAN_REMOVE || this.OPEN_CHILD || this.ROW_ACTIONS);

	// Field to use off the record for the GET calls. Defaults to 'id'.
	if (!this.IDENTIFIER)
		this.IDENTIFIER = 'id';

	// If DESC_COLS (or NAV_COLS) is undefined, just split the number of cols in half.
	if (!this.DESC_COLS && this.COLUMNS)
	{
		var cols = this.COLUMNS.length;
		if (this.HAS_ROW_ACTIONS)
			cols++;

		var size = cols / 2;
		this.DESC_COLS = Math.ceil(size);
		this.NAV_COLS = Math.floor(size);
	}

	if (this.SEARCH)
	{
		this.SEARCH_METHOD = 'post';
		this.SEARCH_PATH = this.RESOURCE + '/search';
		this.search = new EditTemplate(this.SEARCH);
		this.search.handleSubmit = function(criteria, form) {
			this.populate(criteria, form);

			// Do NOT call handleCancel since on non-modals it will also call the callback,
			// which duplicates the call below.
			// DLS - 1/21/2011.
			if (criteria.isModal)
				criteria.body.closeMe();

			criteria.callback(criteria.value);
		};
	}

	// If no search form, just all the list/getAll command of the resource. DLS on 4/16/2015.
	else
	{
		this.SEARCH_METHOD = 'get';
		this.SEARCH_PATH = this.RESOURCE;
	}
}

function TextColumn(id, caption, formatter, selectable, highlight, clickHandler, css)
{
	this.id = id;
	this.caption = caption;
	this.formatter = (formatter ? formatter : 'toText');
	this.selectable = selectable;
	this.highlight = highlight;
	this.clickHandler = clickHandler;
	this.css = (highlight ? 'highlight' : css);
}

function EditColumn(id, caption, formatter)
{
	this.id = id;
	this.caption = caption;
	this.formatter = (formatter ? formatter : 'toText');
	this.editable = true;
}

function RowAction(id, caption, css, condition)
{
	this.id = id;
	this.caption = caption;
	this.css = css;
	this.condition = condition;
}

ListTemplate.prototype = new Template();
ListTemplate.prototype.init = function(body) { return this.filter(undefined, body); }
ListTemplate.prototype.filter = function(filter, body) { return this.run({ filter: filter, url: this.SEARCH_PATH }, body, this.SEARCH_METHOD); }

ListTemplate.prototype.doPaging = function(criteria, elem)
{
	criteria.filter.page = elem.nextPage;

	this.run(criteria);
}

ListTemplate.prototype.doSort = function(criteria, elem)
{
	var filter = criteria.filter;
	var value = criteria.value;

	filter.sortOn = elem.sortOn;

	// If current sort, just reverse the direction.
	if (value.sortOn == filter.sortOn)
		filter.sortDir = ('ASC' == value.sortDir) ? 'DESC' : 'ASC';
	else
		delete filter.sortDir;	// Will force the usage of the default on the backend.

	this.run(criteria);
}

ListTemplate.prototype.generate = function(criteria)
{
	var value = criteria.value;

	// For resources without a search call, an array will be returned instead.
	if ($.isArray(value))
		criteria.value = value = { total: value.length, pageSize: value.length, page: 1, pages: 1, records: value };

	var records = value.records;
	if (!records || (0 == records.length))
		return this.createNoRecordsFoundMessage(criteria);

	var e, r, c, o = document.createElement('table');
	this.appendHeader(criteria, o);
	this.appendBody(criteria, o);

	return o;
}

ListTemplate.prototype.createNoRecordsFoundMessage = function(criteria)
{
	var v = criteria.value;
	var msg = (v.message ? v.message : ('No ' + this.PLURAL + ' found.'));	// In case validation error on the search.
	var o = this.createDiv(msg, 'noRecordsFound');
	var me = this;

	// Append an anchor to add records if capable.
	if (this.CAN_ADD)
		o.appendChild(this.createAnchor('Click here to add a new ' + this.SINGULAR + '.',
			function(ev) { me.handleAdd(criteria, this); }));

	if (this.search)
		o.appendChild(this.createAnchor('Click here to apply a different search.',
			function(ev) { me.handleSearch(criteria, this); }));

	return o;
}

ListTemplate.prototype.appendHeader = function(criteria, table)
{
	var r, o = table.createTHead();
	var c, cols = this.COLUMNS;

	this.insertPaging(table, o, criteria);
	r = this.insertRow(o);

	// Empty first column for actions like DELETE.
	if (this.HAS_ROW_ACTIONS)
		r.insertCell(0);

	for (var i = 0; i < cols.length; i++)
	{
		c = cols[i];
		this.insertHeader(r, c.id, c.caption, criteria);
	}

	return o;
}

ListTemplate.prototype.appendBody = function(criteria, table)
{
	var a, text, cell, c, cols = this.COLUMNS;
	var record, records = criteria.value.records;
	var e, v, r, o = document.createElement('tbody');

	table.appendChild(o);

	var me = this;

	for (var i = 0; i < records.length; i++)
	{
		record = records[i];
		r = this.insertRow(o);

		if (this.HAS_ROW_ACTIONS)
		{
			// Need this div to ensure whitespace doesn't wrap.
			e = this.addDiv(this.insertCell(r), undefined, 'rowActions');
			if (this.CAN_REMOVE)
			{
				e.appendChild(a = this.createAnchor('&chi;', function(ev) {
					me.removeRecord(criteria, this); }, 'delete'));
				a.myRecord = record;
			}

			this.addSpace(e);

			if (this.OPEN_CHILD)
			{
				e.appendChild(a = this.createAnchor('&crarr;',
					function(ev) { me.openChild(criteria, this); }, 'drilldown'));
				a.myRecord = record;

				this.decorateOpenChildAnchor(a, record);
			}

			// Custom row actions.
			if (this.ROW_ACTIONS)
			{
				for (var j = 0; j < this.ROW_ACTIONS.length; j++)
				{
					var act = this.ROW_ACTIONS[j];

					// If a record condition is specified, exit if NOT met.
					if (act.condition && !record[act.condition])
						continue;

					this.addSpace(e);
					e.appendChild(a = this.createAnchor(act.caption,
						function(ev) { me[this.myId](criteria, this); }, act.css));
					a.myRecord = record;
					a.myId = act.id;
				}
			}
		}

		for (var j = 0; j < cols.length; j++)
		{
			c = cols[j];
			text = this[c.formatter](v = record[c.id]);

			// Should an anchor be created as the cell element.
			var onSelect = undefined;
			if (c.selectable)
				onSelect = 'handleSelect';
			else if (c.clickHandler)
				onSelect = c.clickHandler;

			if (onSelect)
			{
				cell = this.insertCell(r, c.css, a = this.createAnchor(text,
					function(ev) { me[this.myOnSelect](criteria, this); }));
				a.myOnSelect = onSelect;
				a.myRecord = record;
			}
			else if (this.CAN_EDIT && (undefined != v) && (typeof(v) == 'boolean'))
			{
				cell = this.insertCell(r, c.css, e = this.genCheckBox(c.id, v));
				cell.className+= ' center';
				e.onclick = function(ev) { me.toggleProperty(criteria, this); };
				e.myRecord = record;
			}
			else if (c.editable)
			{
				$(this.insertCell(r, c.css, text)).dblclick({ c: criteria, r: record, f: c, t: text }, function(ev) {
					// Only perform operation for left mouse clicks.
					// KA-19357 - on IE8 the ev.which property comes through as zero (0) for left mouse double clicks. No idea why.
					if (1 < ev.which)
						return;

					ev.preventDefault();
					var data = ev.data;
					var tgt = ev.target;
					var element = me.genTextBox(data.f.id);
					var d = data.r[data.f.id];
					element.style.width = (tgt.clientWidth - 16) + 'px';
					element.value = (d ? d : '');
					tgt.innerHTML = '';
					tgt.appendChild(element);

					element.focus();
					data.cell = tgt;
					$(element).blur(data, function(ev) { if (ev.target.cancelBlur) return; ev.data.cell.innerHTML = ev.data.t; }).change(data, function(ev) {
						ev.target.cancelBlur = true;
						me.updateField(ev.data, ev.target);
					});
				});
			}
			else
				this.insertCell(r, c.css, text);
		}
	}

	return o;
}

ListTemplate.prototype.insertRow = function(table)
{
	var o = table.insertRow(table.rows.length);
	o.className = (0 == (o.rowIndex % 2)) ? 'even' : 'odd';

	return o;
}

ListTemplate.prototype.insertPaging = function(table, header, criteria)
{
	this.insertPaging_(header, criteria);
	this.insertPaging_(table.createTFoot(), criteria);
}

ListTemplate.prototype.insertPaging_ = function(section, criteria)
{
	var me = this;
	var v = criteria.value;
	var o = this.insertRow(section);
	var e, c = o.insertCell(0);
	c.colSpan = this.DESC_COLS;

	if (1 == v.total)
		c.innerHTML = 'Showing only ' + this.SINGULAR;
	else
	{
		var size = v.records.length;
		if (1 == size)
			c.innerHTML = 'Showing one ' + this.SINGULAR;
		else
			c.innerHTML = 'Showing ' + size + ' ' + this.PLURAL;

		c.innerHTML+= ' out of ' + v.total;
	}

	// Place a ADD link in the header if available.
	if (this.CAN_ADD)
		c.appendChild(this.createAnchor('Add Item', function(ev) { me.handleAdd(criteria, this); }, 'action'));

	// Place a Search link in the header if available.
	if (this.search)
		c.appendChild(this.createAnchor('Search', function(ev) { me.handleSearch(criteria, this); }, 'action'));

	// Add custom actions.
	if (this.ACTIONS)
	{
		for (var i = 0; i < this.ACTIONS.length; i++)
		{
			var a, action = this.ACTIONS[i];
			c.appendChild(a = this.createAnchor(action.caption, function(ev) { me[this.myId](criteria, this); }, 'action'));
			a.myId = action.id;
		}
	}

	c = o.insertCell(1);
	c.colSpan = this.NAV_COLS;
	c.className = 'right';

	if (2 > v.pages)
		return;

	if (1 < v.page)
	{
		c.appendChild(e = this.createAnchor('&lArr; prev', function(ev) { me.doPaging(criteria, this); }));
		e.nextPage = v.page - 1;
		c.appendChild(document.createTextNode(' '));
	}

	c.appendChild(e = document.createElement('select'));
	for (var i = 1; i <= v.pages; i++)
		e.options[i - 1] = new Option(i, i, false, i == v.page);

	e.onchange = function(ev) { this.nextPage = this.value; me.doPaging(criteria, this); };

	if (v.pages > v.page)
	{
		c.appendChild(document.createTextNode(' '));
		c.appendChild(e = this.createAnchor('next &rArr;', function(ev) { me.doPaging(criteria, this); }));
		e.nextPage = v.page + 1;
	}
}

ListTemplate.prototype.insertHeader = function(row, field, caption, criteria)
{
	var a, me = this, o = row.insertCell(row.cells.length);
	o.appendChild(a = this.createAnchor(caption, function(ev) { me.doSort(criteria, this); }));
	a.sortOn = field;

	// Place a moniker on the currently selected sort field to see which way it is sorted.
	var v = criteria.value;
	if (field == v.sortOn)
		o.appendChild(this.createSpan(' ' + (('ASC' == v.sortDir) ? '&uarr;' : '&darr;')));

	return o;
}

ListTemplate.prototype.insertCell = function(row, css, value)
{
	var o = row.insertCell(row.cells.length);
	o.className = (css ? css : row.className);

	if (undefined != value)
	{
		if ('string' == typeof(value))
			o.innerHTML = value;
		else
			o.appendChild(value);
	}

	return o;
}

// Can decorate the open child anchor with the number of children. If the record,
// has a property called numberOfChildren then that is used. Otherwise, look to
// see if a COUNT_CHILDREN_URL exists and make the AJAX call to get the count.
ListTemplate.prototype.decorateOpenChildAnchor = function(elem, record)
{
	if (undefined != record.numberOfChildren)
	{
		this.addSpan(elem, ' (' + this.toWhole(record.numberOfChildren) + ')');
		return;
	}

	var me = this;

	// Should we also place the number of children in the anchor?
	if (this.COUNT_CHILDREN_URL)
		Template.post(this.COUNT_CHILDREN_URL, { id: record.id }, function(count) {
			me.addSpan(elem, ' (' + me.toWhole(count) + ')');
		});
}

ListTemplate.prototype.handleAdd = function(criteria, elem)
{
	var me = this;
	var body = this.NO_EDITOR_MODAL ? criteria.body : undefined;
	this.EDITOR.doAdd(function(value) { me.run(criteria, undefined, me.SEARCH_METHOD); }, body);
}

ListTemplate.prototype.handleSelect = function(criteria, elem)
{
	var me = this;
	var record = elem.myRecord;
	var body = this.NO_EDITOR_MODAL ? criteria.body : undefined;
	this.EDITOR.doEdit(record[this.IDENTIFIER], function(value) { me.run(criteria, undefined, me.SEARCH_METHOD); }, body);
}

ListTemplate.prototype.handleSearch = function(criteria, elem)
{
	var me = this;
	var body = this.NO_SEARCH_MODAL ? criteria.body : undefined;
	this.search.doSearch(function(filter) {
		if (filter)
			criteria.filter = filter;
		me.run(criteria);
	}, body);
}

ListTemplate.prototype.removeRecord = function(criteria, elem)
{
	if (!window.confirm('Click OK to confirm and continue with your delete.'))
		return;

	var me = this;
	this.post(this.REMOVE_URL, elem.myRecord, function(value) {
		if (value.isError)
			window.alert(value.message);
		else
			me.run(criteria);
	});
}

ListTemplate.prototype.updateField = function(data, elem)
{
	var me = this;
	var record = data.r;
	var criteria = data.c;
	var f = data.f;

	record[f.id] = elem.value;
	this.put(this.POST_URL, this.toRecord(record), function(value) {
		if (value.isError)
		{
			if (value[f.id])
				window.alert(f.caption + ' ' + value[f.id]);
			else
				window.alert('An unexpected error occurred. Please contact the administrator.');
			elem.focus();
			elem.cancelBlur = false;
		}
		else
		{
			var parent = elem.parentNode;
			parent.innerHTML = data.t = elem.value;
			var bg = parent.style.backgroundColor;
			parent.style.backgroundColor = 'red';
			setTimeout(function() { parent.style.backgroundColor = bg; }, 500);
		}
	});
}

ListTemplate.prototype.toggleProperty = function(criteria, elem)
{
	var me = this;
	var record = elem.myRecord;

	record[elem.name] = elem.checked;
	this.put(this.POST_URL, this.toRecord(record), function(value) {
		if (value.isError)
		{
			if (value[elem.name])
				window.alert(f.caption + ' ' + value[elem.name]);
			else
				window.alert('An unexpected error occurred. Please contact the administrator.');
			record[elem.name] = elem.checked = !elem.checked;	// Reverse the toggle if there is an error.
		}
		else
		{
			var parent = elem.parentNode;
			var bg = parent.style.backgroundColor;
			parent.style.backgroundColor = 'red';
			setTimeout(function() { parent.style.backgroundColor = bg; }, 500);
		}
	});
}
