function EditTemplate(properties) { this.load(properties); }
function TextField(id, caption, formatter, footnote, includeOnAdds)
{
	this.isText = true;
	this.isEditable = false;
	this.id = id;
	this.caption = caption;
	this.footnote = footnote;
	this.includeOnAdds = includeOnAdds;
	if (formatter)
	{
		if ('function' == typeof(formatter))
			this.custom = formatter;
		else
			this.formatter = formatter;
	}
	else
		this.formatter = 'toText';
}

function BoolField(id, caption, isRequired, footnote)
{
	this.isEditable = this.isBoolean = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.footnote = footnote;
}

function EditField(id, caption, isRequired, isLong, maxLength, size, footnote)
{
	this.isEditable = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.isLong = isLong;
	this.maxLength = maxLength;
	this.size = size;
	this.footnote = footnote;
}

//A text area field that supplies an array of values separated by new lines.
function MultiField(id, caption, isRequired, width, height, footnote)
{
	this.isEditable = true;
	this.isMulti = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.isLong = true;
	this.maxLength = width;
	this.size = height;
	this.footnote = footnote;
}

function RangeField(id, caption, isRequired, maxLength, size, footnote)
{
	this.isEditable = this.isRange = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.maxLength = maxLength;
	this.size = size;
	this.footnote = footnote;
}

function ListField(id, caption, isRequired, options, footnote, header)
{
	this.isEditable = this.isSelectable = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.options = options;
	this.footnote = footnote;
	this.header = header;
}

function PickField(id, caption, isRequired, options, columns, footnote)
{
	this.isEditable = this.isPickable = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.options = options;
	this.columns = columns;
	this.footnote = footnote;
}

function DateField(id, caption, isRequired, selectCallback)
{
	this.isEditable = this.isDate = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.doSelect = selectCallback;
}

function DatesField(id, caption, isRequired, selectCallback)
{
	this.isEditable = this.isDateRange = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.doSelect = selectCallback;
}

function TimeField(id, caption, isRequired, selectCallback)
{
	this.isEditable = this.isTime = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.doSelect = selectCallback;
}

function StampField(id, caption, isRequired, selectCallback)
{
	this.isEditable = this.isTimestamp = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.doSelect = selectCallback;
}

function DropField(id, caption, isRequired, fillCallback, selectCallback, footnote)
{
	this.isEditable = this.isDropdownList = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	if ('function' == typeof(fillCallback))
		this.doFill = fillCallback;
	else
	{
		this.doFill = function(criteria) {
			Template.get(fillCallback + '/find', { name: criteria.field.value }, function(data) {
				criteria.caller.fill(criteria, data); 
			});
		};
	}
	if ('function' == typeof(selectCallback))
		this.doSelect = selectCallback;
	else
	{
		this.doSelect = function(criteria) {
			var s = criteria.selection;
			var msg = s ? s.name + ' (' + s.id + ')' : 'Cleared';
			criteria.extra.texts[selectCallback].innerHTML = msg;
		};
	}
	this.footnote = footnote;
}

function TagField(id, caption, isRequired, fillCallback, selectCallback, footnote, addCallback)
{
	this.isEditable = this.isWidget = this.isTagger = true;
	this.widget = DropdownTagger;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	if ('function' == typeof(fillCallback))
		this.doFill = fillCallback;
	else
	{
		this.doFill = function(criteria) {
			Template.get(fillCallback + '/find', { name: criteria.field.value }, function(data) {
				criteria.caller.fill(criteria, data);
			});
		};
	}
	this.doPostSelect = selectCallback;
	this.footnote = footnote;
	this.addCallback = addCallback;
}

function MediaTagField(id, caption, isRequired, fillCallback, selectCallback, footnote, addCallback)
{
	this.isEditable = this.isWidget = this.isTagger = true;
	this.widget = MediaDropdownTagger;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	if ('function' == typeof(fillCallback))
		this.doFill = fillCallback;
	else
	{
		this.doFill = function(criteria) {
			Template.get(fillCallback, { name: criteria.field.value }, function(data) {
				criteria.caller.fill(criteria, data);
			});
		};
	}
	this.doPostSelect = selectCallback;
	this.footnote = footnote;
	this.addCallback = addCallback;
}

function PassField(id, caption, isRequired, maxLength, size)
{
	this.isEditable = this.isPassword = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
	this.maxLength = maxLength;
	this.size = size;
}

function FileField(id, caption, isRequired)
{
	this.isEditable = this.isFile = true;
	this.id = id;
	this.caption = caption;
	this.isRequired = isRequired;
}

EditTemplate.prototype = new Template();
EditTemplate.prototype.doAdd = function(callback, body, value) { this.run({ value: ((undefined != value) ? value : { active: true }), filter: { isAdd: true }, callback: callback }, body); }
EditTemplate.prototype.doEdit = function(id, callback, body) { this.run({ callback: callback, url: this.RESOURCE + '/' + id }, body, 'get'); }
EditTemplate.prototype.doSearch = function(callback, body, filter) { this.run({ value: {}, filter: (filter ? filter : { isSearch: true, isAdd: false, pageSize: 20 }), callback: callback }, body); }

EditTemplate.prototype.onPostLoad = function(criteria)
{
	if (criteria.isModal)
		this.setFieldsMaxHeight(criteria);

	if (criteria.firstField)
		criteria.firstField.focus();

	if (this.onEditorPostLoad)
		this.onEditorPostLoad(criteria);
}

EditTemplate.prototype.handleCancel = function(criteria)
{
	if (criteria.isModal)
		criteria.body.closeMe();
	else
		criteria.callback();
}

EditTemplate.prototype.handleSubmit = function(criteria, form)
{
	this.populate(criteria, form);

	if (criteria.filter.isSearch)
	{
		criteria.callback(criteria.value, criteria);
		return;
	}

	var me = this;
	this.post(this.RESOURCE, criteria.value, function(v) {
		me.processResponse(v, criteria, form);
	});
}

EditTemplate.prototype.processResponse = function(v, criteria, form)
{
	if (v.isError)
	{
		var e, errs = v.errors;
		if (errs && (0 < errs.length))
			for (var i = 0; i < errs.length; i++)
				if (undefined != (e = form.elements[errs[i].name]))
					break;

		window.alert(v.message);
		if (e)
			e.focus();

		return;
	}

	if (criteria.isModal)
		criteria.body.closeMe();

	var cb = criteria.callback;
	if (cb)
		cb(v, criteria);
}

EditTemplate.prototype.populate = function(criteria, form)
{
	var value = criteria.value;

	for (var i = 0; i < this.FIELDS.length; i++)
	{
		var field = this.FIELDS[i];
		if (!field.isEditable)
			continue;

		var name = field.id;
		if (field.isRange || field.isDateRange)
		{
			value[name + 'From'] = form.elements[name + 'From'].value;
			value[name + 'To'] = form.elements[name + 'To'].value;
			continue;
		}

		var elem = form.elements[name];
		if (!elem)
			continue;


		// Special handling for a list of checkboxes.
		if (field.isPickable)
		{
			var o = [];
			for (var j = 0; j < elem.length; j++)
				if (elem[j].checked)
					o[o.length] = elem[j].value;

			if (0 < o.length)
				value[name] = o;
			else
				delete value[name];
		}
		else if ('checkbox' == elem.type)
			value[name] = elem.checked;
		else if (field.isMulti)	// MUST come before isLong handling because MultiField is both isMulti and isLong.
			value[name] = this.toArray(elem.value);
		else if (field.isLong)
			value[name] = this.encodeHTML(elem.value); // To ensure that non-ASCII characters display.
		else if (field.isTagger)
			value[name] = field.widget.retrieve(criteria.texts[name]).selectedIds;
		else
			value[name] = elem.value;
	}

	this.clean(value);
}

EditTemplate.prototype.generate = function(criteria)
{
	var me = this;
	var isModal = criteria.isModal;
	var e, s, o = criteria.form = this.createElement('form');
	var f = criteria.filter;
	if (undefined == f)
		criteria.filter = f = {};
	var v = (f.isSearch ? f : criteria.value);
	var name, field, value;
	var isAdd = f.isAdd;

	o.className = this.NAME;

	// For file upload forms.
	if (this.FILE_UPLOAD)
	{
		o.appendChild(this.genHidden('id', v.id));

		o.enctype = 'multipart/form-data';
		o.target = 'httpRPC'
		o.action = this.POST_URL;
		o.method = 'POST';
		e = $('#httpRPC')
		e.unbind('load');	// Must clear prior handlers.
		$('#httpRPC').load(function(data) { me.processResponse(eval('(' + data.target.contentWindow.document.body.innerHTML + ')'),
			criteria, o); });
	}

	// Otherwise.
	else
	{
		o.onsubmit = function(ev) {
			try { me.handleSubmit(criteria, this); }
			catch(ex) { if (window.console) console.log(ex); }
			finally { return false; }
		};
	}

	e = criteria.header = this.addHeader(o, (f.isSearch ? 'Search ' + this.PLURAL : ((isAdd ? 'Add' : 'Edit') + ' ' + this.SINGULAR)));
	if (isModal)
	{
		e.appendChild(this.createAnchor('X',
			function(ev) { me.handleCancel(criteria); }));

		this.makeElementDraggable(criteria, e);
	}

	var tx = criteria.texts = {}; // For keeping references to the text fields.
	var fs = criteria.fields = this.addDiv(o, undefined, this.CSS_FIELDS);	// Need section just for fields so that they can be resized.
	for (var i = 0; i < this.FIELDS.length; i++)
	{
		field = this.FIELDS[i];

		// DO NOT show TextField's on adds. The values won't be available yet.
		if (isAdd && field.isText && !field.includeOnAdds)
			continue;

		name = field.id;
		value = v[name];

		s = this.addDiv(fs);
		e = this.addCaption(s, field.caption + (field.isRequired ? '*' : ''));
		if (field.footnote)
			this.addFootnote(e, field.footnote);

		e = undefined;
		if (field.isText)
		{
			if (field.custom)
				tx[name] = this.addValue(s, field.custom(v, value, this));	// Stash the text element in case needed later.
			else
				tx[name] = this.addValue(s, this[field.formatter](value));	// Stash the text element in case needed later.
		}
		else if (field.isSelectable)
			s.appendChild(e = this.genSelect(name, this.getList(field.options), value, field.header));
		else if (field.isDropdownList)
			s.appendChild(DropdownList.create(name, field, value, criteria));
		else if (field.isBoolean)
			s.appendChild(this.genCheckBox(name, value));	// Should NOT be able to be the first field.
		else if (field.isDate)
			s.appendChild(DatePicker.create(name, value, criteria, field));
		else if (field.isTime)
			s.appendChild(TimePicker.create(name, value, criteria, field));
		else if (field.isTimestamp)
			s.appendChild(TimestampPicker.create(name, value, criteria, field));
		else if (field.isDateRange)
		{
			s.appendChild(DatePicker.create(name + 'From', undefined, criteria, field));
			this.addText(s, ' to ');
			s.appendChild(DatePicker.create(name + 'To', undefined, criteria, field));
		}
		else if (field.isRange)
		{
			s.appendChild(e = this.genTextBox(name + 'From', field.maxLength, field.size));
			this.addText(s, ' to ');
			s.appendChild(this.genTextBox(name + 'To', field.maxLength, field.size));
		}
		else if (field.isPassword)
			s.appendChild(e = this.genPassword(name, field.maxLength, field.size));
		else if (field.isPickable)
			s.appendChild(this.genCheckBoxes(name, this.getList(field.options), value, field.columns));
        else if (field.isTagger)
        {
			s.appendChild(e = field.widget.create(name, field, value, criteria))
			tx[name] = e = e.myCriteria;
			e = e.field;
		}
		else if (field.isFile)
			s.appendChild(e = this.genFile(name, 128, 50));
		else
		{
			if (field.isLong)
				s.appendChild(e = this.genTextArea(name, field.maxLength ? field.maxLength : 40, field.size ? field.size : 4));
			else
				s.appendChild(e = this.genTextBox(name, field.maxLength, field.size));

			// If the field is a "Multi" - multiple text items in an array - convert the array to text with each item separated by an new line.
			if (field.isMulti)
				value = this.fromArray(value);

			if (undefined != value) e.value = value;
		}

		// Set the field with initial focus.
		if (e && !criteria.firstField)
			criteria.firstField = e;
	}

	s = criteria.actions = this.addDiv(o, undefined, this.CSS_ACTIONS);
	s.appendChild(this.genSubmit('submitter', 'Submit'));
	this.addSpace(s);
	s.appendChild(this.genButton('canceler', 'Cancel',
		function(ev) { me.handleCancel(criteria); }));

	return o;
}
