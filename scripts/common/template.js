function Template() {}

Template.MODAL_ZINDEX = 100;

Template.prototype.KILO = 1024;
Template.prototype.MEGA = 1024 * 1024;
Template.prototype.GIGA = 1024 * 1024 * 1024;

Template.prototype.LISTS = { documentSources: [ { id: 'dropbox', name: 'DropBox' }, { id: 'email', name: 'Email' }, { id: 'googledocs', name: 'Google Drive' }, { id: 'linkedin', name: 'LinkedIn' }, { id: 'user', name: 'Text Submission' }, { id: 'user_file', name: 'File Upload' } ],
                             documentTypes: [ { id: 'A', name: 'All' }, { id: 'C', name: 'Cover Letter' }, { id: 'O', name: 'Other' }, { id: 'R', name: 'Resume' } ],
                             documentTypesX: [ { id: 'all', name: 'All' }, { id: 'cover_letter', name: 'Cover Letter' }, { id: 'other', name: 'Other' }, { id: 'resume', name: 'Resume' } ],
                             yesNoOptions: [ { id: 'true', name: 'Yes' }, { id: 'false', name: 'No' } ],
                             pageSizes: [ { id: 10, name: '10' }, { id: 20, name: '20' }, { id: 50, name: '50' }, { id: 100, name: '100' } ] };

Template.prototype.REGEX_NEW_LINE = /[\n]+/;

Template.prototype.CSS_ACTIONS = 'actions';
Template.prototype.CSS_FIELDS = 'fields';

Template.prototype.load = function(properties)
{
	if (undefined == properties)
		return;

	for (id in properties)
		this[id] = properties[id];
};

Template.prototype.run = function(criteria, body, method)
{
	var me = this;
	if (body)
		criteria.body = body;

	// Set the default HTTP method.
	if (undefined == method)
		method = 'post';

	// If no BODY exists at all, create a modal dialog.
	// Do NOT include an ELSE section to set "criteria.isModal = false" because the modal body could already exist.
	if (criteria.isModal = (undefined == criteria.body))
	{
		var b = document.body;
		b.insertBefore(body = this.createDiv('Loading ...', 'modalDialog'), b.firstChild);
		body = criteria.body = $(body);
		body.CENTERED = 0;      // Keeps track of how many times the dialog is centered. Same instance could be centered multiple times if re-run.
		body.center = function() {
			var w = $(window);
			
			this.css('top', (this.top = ((w.height() - this.height()) / 2) + w.scrollTop()) + 'px');
			this.css('left', (this.left = ((w.width() - this.width()) / 2) + w.scrollLeft()) + 'px');
			
			body.css('zIndex', Template.MODAL_ZINDEX++);   // Make that follow-up modal dialogs are layered on top.
			this.CENTERED++;
		};
		
		// SHOULD use closeMe to close the modal dialog to ensure that the MODAL_INDEX is decremented.
		body.closeMe = function() {
			Template.MODAL_ZINDEX-= this.CENTERED;
			this.remove();
		};
	}

	ProgressBar.start(criteria);

	// Do NOT check on criteria.value because ListTemplate will have a value while trying to page or sort. DLS on 10/27/2014.
	if (undefined != criteria.url)
	{
		this[method](criteria.url, criteria.filter, function(value) {
			ProgressBar.stop(criteria);
			me.display(criteria, value);
		});
	}
	else
	{
		ProgressBar.stop(criteria);
		me.display(criteria, criteria.value);
	}

	return criteria;
}

Template.prototype.display = function(criteria, value)
{
	criteria.body.empty();
	var me = this;
	var isModal = criteria.isModal;
	if (isModal)
	{
		var e = criteria.header = this.createHeader();
		this.addSpan(e, this.getTitle(criteria));       // Put within SPAN within H1 so that it doesn't overlap the close anchor.
		criteria.body.append($(e));
		e.appendChild(this.createAnchor('X',
			function(ev) { me.handleCancel(criteria); }));

		this.makeElementDraggable(criteria, e);
	}
	criteria.value = value;
	criteria.body.append($(this.generate(criteria)));

	if (this.onPostLoad)
		this.onPostLoad(criteria);

	if (isModal)
		criteria.body.center();
}

Template.prototype.get = Template.get = function(url, params, handler, headers)
{
	// Wrap all GET calls to check for authentication exceptions and force a login.
	// Plus make sure that for IE it's a unique call.
	// Do NOT use convenience method of .get so that can specify to NOT cache.
	var me = this;
	// $.get(REST_PATH + url, params,
	$.ajax(REST_PATH + url, { type: 'GET', data: params, cache: false, dataType: 'json', headers: headers,
		success: function(value) { handler(value); },
		error: function(xhr) { me.handleError(xhr, handler); }});
}

Template.prototype.post = Template.post = function(url, filter, handler)
{
	if (!filter)
		filter = {};

	// Wrap all POST calls to check for authentication exceptions and force a login.
	var me = this;
	$.ajax(REST_PATH + url, { type: 'POST', data: JSON.stringify(filter), dataType: 'json',
		success: function(value) { handler(value); },
		error: function(xhr) { me.handleError(xhr, handler); },
		contentType: 'application/json; charset=UTF-8' });
}

Template.prototype.put = Template.put = function(url, filter, handler, headers)
{
	if (!filter)
		filter = {};

	// Wrap all PUT calls to check for authentication exceptions and force a login.
	var me = this;
	$.ajax(REST_PATH + url, { type: 'PUT', data: JSON.stringify(filter), dataType: 'json', headers: headers,
		success: function(value) { handler(value); },
		error: function(xhr) { me.handleError(xhr, handler); },
		contentType: 'application/json; charset=UTF-8' });
}

Template.prototype.handleError = function(xhr, handler)
{
	if (403 == xhr.status)
		LoginHandler.doLogin(function() { me.put(url, filter, handler); })
	else
	{
		var value = xhr.responseText;
		if (!value)
			value = { message: xhr.statusText };
		else
			value = JSON.parse(value);
		value.isError = true;
		delete value.stackTrace;	// Don't need the stack trace cluttering the error.
		handler(value);
	}
}

/** Gets a list of data from local cache or the specified resource. */
Template.prototype.getList = function(resource)
{
	return this.LISTS[resource];
}

/** Remove empty strings from the object. */
Template.prototype.clean = function(value)
{
	var v;
	for (id in value)
		if ((typeof(v = value[id]) == 'string') && ('' == v))
			delete value[id];
}

/** Used for images external to the current site. */
Template.prototype.createImg = function(url, title)
{
	var o = document.createElement('img');
	o.src = url;

	if (title)
		o.title = title;

	return o;
}

Template.prototype.createImage = function(src, title)
{
	var o = document.createElement('img');
	o.src = IMAGE_PATH + src;

	if (title)
		o.title = title;

	return o;
}

Template.prototype.createAnchor = Template.createAnchor = function(caption, action, css)
{
	var o = document.createElement('a');
	o.href = 'javascript:void(null)';
	o.onclick = action;

	var t = typeof(caption);
	if (('string' == t) || ('number' == t))
		o.innerHTML = caption;
	else if (undefined != caption)
		o.appendChild(caption);

	if (css)
		o.className = css;

	return o;
}

Template.prototype.createLink = Template.createLink = function(caption, href, css)
{
	var o = document.createElement('a');
	o.href = href;

	var t = typeof(caption);
	if (('string' == t) || ('number' == t))
		o.innerHTML = caption;
	else
		o.appendChild(caption);

	if (css)
		o.className = css;

	return o;
}

Template.prototype.createDiv = function(value, css) { return this.createElement('div', value, css); }
Template.prototype.createHeader = function(value, css) { return this.createElement('h1', value, css); }
Template.prototype.createSpan = function(value, css) { return this.createElement('span', value, css); }
Template.prototype.createElement = Template.createElement = function(name, value, css)
{
	var o = document.createElement(name);
	if (value)
		o.innerHTML = value;
	if (css)
		o.className = css;

	return o;
}

Template.prototype.addBreak = function(elem)
{
	var o = document.createElement('br');
	elem.appendChild(o);

	return o;
}

Template.prototype.addSpace = function(elem)
{
	var o = document.createTextNode(' ');
	elem.appendChild(o);

	return o;
}

Template.prototype.addText = function(elem, value)
{
	var o = document.createTextNode(value);
	elem.appendChild(o);

	return o;
}

Template.prototype.addElem = Template.addElem = function(elem, type, value, css)
{
	var o = this.createElement(type, value, css);
	elem.appendChild(o);

	return o;
}

Template.prototype.addDiv = function(elem, value, css) { return this.addElem(elem, 'div', value, css); }
Template.prototype.addSpan = function(elem, value, css) { return this.addElem(elem, 'span', value, css); }
Template.prototype.addValue = function(elem, value, css) { return this.addElem(elem, 'em', value, css); }
Template.prototype.addCaption = function(elem, value, css) { return this.addElem(elem, 'b', value, css); }
Template.prototype.addFootnote = function(elem, value, css) { return this.addElem(elem, 'em', value, css); }
Template.prototype.addHeader = function(elem, value, css) { return this.addElem(elem, 'h1', value, css); }

/** Makes an element the draggable component of a widgets body. Used by modal dialogs to move around
 * by dragging the title bar
 */
Template.prototype.makeElementDraggable = function(criteria, e)
{
	// Add mousedown and mouseup events to facilitate dragging.
	$(e).mousedown(criteria, function(ev) {
		// Only perform dragging for left mouse clicks.
		if (1 != ev.which)
			return;

		ev.preventDefault();

		// Original coordinates of the mousedown for reference point.
		ev.data.pageX = ev.pageX;
		ev.data.pageY = ev.pageY;
		$(document.body).mousemove(ev.data, function(ev) {
			var c = ev.data;
			var b = c.body;
			b.css('top', (c.bodyTop = (b.top + (ev.pageY - c.pageY))) + 'px');
			b.css('left', (c.bodyLeft = (b.left + (ev.pageX - c.pageX))) + 'px');
		});
	});
	$(document.body).mouseup(criteria, function(ev) {
		$(document.body).unbind('mousemove');
		var c = ev.data;
		var b = c.body;
		b.top = c.bodyTop;
		b.left = c.bodyLeft;
	});
}

/** Set the maximum height for the fields section of the form. */
Template.prototype.setFieldsMaxHeight = function(criteria)
{
	var w = $(window);
	var b = criteria.body;
	var f = criteria.fields;
	var os = (b.height() - f.offsetHeight) + 15;    // The offset height (all other sections minus the fields section).
	var maxHeight = w.height() - os;
	if (w.height() < b.height())
	{
		f.style.height = maxHeight + 'px';
		
		// Also make it wider so it doesn't scroll horizontally on account of the vertical scroll bars.
		f.style.width = (f.offsetWidth + 25) + 'px';
	}

	// Just in case the form grows set a body max-height.
	else
		f.style.maxHeight = maxHeight + 'px';
}

/** Formatters. */
Template.prototype.toText = function(value)
{
	if (undefined == value)
		return '';

	var type = typeof(value);
	if (type == 'boolean')
		return value ? 'Yes' : 'No';
	if (type == 'number')
		return this.toNumber(value);

	return value;
}

/** Converts an array into a string with each item separated by a new-lines and/or carriage returns.
 *  
 *  @return empty string if no values found.
 */
Template.prototype.fromArray = function(values)
{
	if ((undefined == values) || (0 == values.length))
		return '';

	var value = values[0];

	// Loop through the values and throw out any empty items.
	for (var i = 1; i < values.length; i++)
		value+= '\n' + values[i];

	return value;
}

/** Converts an array into a string with each item separated by a new-lines and/or carriage returns.
 *  
 *  @return empty string if no values found.
 */
Template.prototype.fromArrayWithComma = function(values)
{
	if ((undefined == values) || (0 == values.length))
		return '';

	var value = values[0];

	// Loop through the values and throw out any empty items.
	for (var i = 1; i < values.length; i++)
		value+= ', ' + values[i];

	return value;
}

/** Converts a string separated by new-lines and/or carriage returns to an array.
 *
 *  @return empty array if no items found.
 */
Template.prototype.toArray = function(value)
{
	if ((undefined == value) || (0 == value.length))
		return [];

	// Split the values.
	var values = value.split(this.REGEX_NEW_LINE);

	// Loop through the values and throw out any empty items.
	for (var i = 0; i < values.length; i++)
		if ('' == (values[i] = $.trim(values[i])))
			values.splice(i--, 1);

	return values;
}

/** Rounds number to the specified digit. */
Template.prototype.round = function(value, places)
{
	var div = Math.pow(10, places);
	
	return (Math.round(value * div) / div);
}

/** Converts a float to a currency. */
Template.prototype.toCurrency = function(value)
{
	if (undefined == value)
		return '';

	return this.toNumber(value, 2);
}

/** Converts a float to a percentage. */
Template.prototype.toPercent = function(value)
{
	if (undefined == value)
		return '';

	return this.toNumber(this.round(value * 100, 2), 2);
}

/** Converts milliseconds to seconds with three decimal places. */
Template.prototype.toSeconds = function(value)
{
	// MUST use full UNDEFINED comparison because the number could be zero (false).
	if (undefined == value)
		return '';

	return this.toNumber(this.round(value / 1000, 3), 3);
}

/** Converts to whole number. */
Template.prototype.toWhole = function(value)
{
	// MUST use full UNDEFINED comparison because the number could be zero (false).
	if (undefined == value)
		return '';

	return this.toNumber(Math.round(value), 0);
}

/** Formats a number with commas. */
Template.prototype.toNumber = function(value, places)
{
	value+= '';
	x = value.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? x[1] : '';

	// If places is defined, make sure pad the decimal with necessary zeros.
	if (undefined != places)
	{
		if (x2.length < places)
		{
	    	while (x2.length < places)
    			x2+= '0';
    	}
    	else if (x2.length > places)
    		x2 = x2.substr(0, places);
	}

	if (0 < x2.length)
    	x2 = '.' + x2;

	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1))
    	x1 = x1.replace(rgx, '$1' + ',' + '$2');

	return x1 + x2;
}

Template.prototype.toBool = function(value)
{
	return ('T' == value) ? 'Yes' : 'No';
}

Template.prototype.toDateTime = function(value)
{
	if (undefined == value)
		return '';

	return (new Date(value)).toLocaleString();
}

Template.prototype.toDate = function(value)
{
	if (undefined == value)
		return '';

	return (new Date(value)).toDateString();
}

Template.prototype.toTime = function(value)
{
	if (undefined == value)
		return '';

	return (new Date(value)).toTimeString();
}

Template.prototype.toSize = function(value)
{
	if (!value)
		return 'N/A';

	if (this.KILO > value)
		return this.toWhole(value) + ' bytes';
	if (this.MEGA > value)
		return this.toNumber(value / this.KILO, 3) + ' KB';
	if (this.GIGA > value)
		return this.toNumber(value / this.MEGA, 3) + ' MB';

	return this.toNumber(value / this.GIGA, 3) + ' GB';
}

Template.prototype.genInput = Template.genInput = function(name, type, checked)
{
	if (document.all)
	{
		var c = checked ? ' checked' : '';
		return document.createElement('<input name="' + name + '" type="' + type + '"' + c + ' />');
	}

	var o = document.createElement('input');
	o.name = name;
	o.type = type;
	o.checked = checked;

	return o;
}

Template.prototype.genButton = function(name, caption, onclick)
{
	var o = this.genInput(name, 'button');
	if (caption) o.value = caption;
	if (onclick) o.onclick = onclick;

	return o;
}

Template.prototype.genCheckBox = function(name, checked)
{
	return this.genInput(name, 'checkbox', checked);
}

Template.prototype.genCheckBoxes = function(name, options, values, cols)
{
	if (!cols)
		cols = 1;

	var opt, checked, e, s, o = this.createDiv(undefined, 'multiselect');
	var c = 'column_' + cols;
	for (var i = 0; i < options.length; i++)
	{
		opt = options[i];
		checked = false;
		if (values)
			for (var j = 0; j < values.length; j++)
				if (checked = (opt.id == values[j]))
					break;

                if ((0 < i) && (0 == (i % cols)))
                        this.addBreak(o);

		(s = this.addSpan(o, opt.name, c)).insertBefore(e = this.genCheckBox(name, checked), s.firstChild);
		e.value = opt.id;
	}

	return o;
}

Template.prototype.genFile = function(name, maxLength, size)
{
	var o = this.genInput(name, 'file');
	if (maxLength)
		o.maxLength = maxLength;
	if (size)
		o.size = size;

	return o;
}

Template.prototype.genHidden = Template.genHidden = function(name, value)
{
	var o = this.genInput(name, 'hidden');
	if (undefined != value)
		o.value = value;

	return o;
}

Template.prototype.genPassword = function(name, maxLength, size)
{
	var o = this.genInput(name, 'password');
	if (maxLength)
		o.maxLength = maxLength;
	if (size)
		o.size = size;

	return o;
}

Template.prototype.genRadio = function(name, checked, value)
{
	var o = this.genInput(name, 'radio', checked);
	if (value)
		o.value = value;

	return o;
}

Template.prototype.genSelect = Template.genSelect = function(name, options, value, header)
{
	var o;
	if (document.all)
		o = document.createElement('<select name="' + name + '" />');
	else
	{
		o = document.createElement('select');
		o.name = name;
	}

	var opt = o.options;
	if (header)
		opt[0] = new Option(header, '');

	if (options)
	{
		for (var i = 0; i < options.length; i++)
		{
			var item = options[i];
			opt[opt.length] = new Option(item.name, item.id);
		}
	}

	if (value)
		o.value = value;

	return o;
}

/** Repopulates a select list with new options from a remote call. */
Template.prototype.repopulateList = Template.repopulateList = function(elem, url, filter, header)
{
	this.post(url, filter, function(data) {
		var d, o = elem.options;
		o.length = 0;

		if (header)
			o[o.length] = new Option(header, '');

		if (data && (0 < data.length))
			for (var i = 0; i < data.length; i++)
				o[o.length] = new Option((d = data[i]).name, d.id);
	});
}

Template.prototype.genSubmit = function(name, caption)
{
	var o = this.genInput(name, 'submit');
	if (caption) o.value = caption;

	return o;
}

Template.prototype.genTextBox = function(name, maxLength, size)
{
	var o = this.genInput(name, 'text');
	if (maxLength)
		o.maxLength = maxLength;
	if (size)
		o.size = size;

	return o;
}

Template.prototype.genTextArea = function(name, cols, rows)
{
	var o;
	if (document.all)
		o = document.createElement('<textarea name="' + name + '" />');
	else
	{
		o = document.createElement('textarea');
		o.name = name;
	}

	if (cols) o.cols = cols;
	if (rows) o.rows = rows;

	return o;
}

/** Converts non-ASCII characters to HTML entities. */
Template.prototype.encodeHTML = Template.encodeHTML = function(value)
{
	if (!value)
		return value;

	var c, o = '';
	var len = value.length;
	for (var i = 0; i < len; i++)
	{
		c = value.charCodeAt(i);
		if (255 < c)
			o+= '&#' + c + ';';
		else
			o+= value.charAt(i);
	}

	return o;
}

Template.prototype.getLocation = Template.getLocation = function(elem)
{
	return $(elem).offset();
}

Template.prototype.getLocationBelow = Template.getLocationBelow = function(elem)
{
	var o = (elem = $(elem)).offset();
	o.top+= elem.outerHeight();

	return o;
}

Template.prototype.getLocationRightBottom = Template.getLocationRightBottom = function(elem)
{
	var o = (elem = $(elem)).offset();
	o.top+= elem.outerHeight();
	o.right = o.left + elem.outerWidth();

	return o;
}

Template.prototype.getLocationRightTop = Template.getLocationRightTop = function(elem)
{
	var o = (elem = $(elem)).offset();
	o.right = o.left + elem.outerWidth();
	o.bottom = o.top + elem.outerHeight();

	return o;
}
