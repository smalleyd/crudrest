var DropdownTagger = $.extend(true, {}, DropdownList);

DropdownTagger.CSS_MAIN = DropdownTagger.CSS_MAIN + ' tagger';
DropdownTagger.create_ = DropdownTagger.create;

DropdownTagger.create = function(name, callback, values, extra)
{
	var o = this.create_(name, callback, undefined, extra);
	var c = o.myCriteria;
	c.selectedIds = {};

	// Add the section to hold the list of values.
	c.list = Template.addElem(o, 'ul', undefined, this.CSS_MAIN);
	if (values)
		this.populate(c, values);

	// Replace with tagger selection handler. Can replace after initial create as the doSelect
	// won't call until accessed.
	var me = this;
	callback.doSelect = function(criteria) {
		var v = criteria.selection;
		var a, l = criteria.list;

		Template.addElem(l, 'li', me.toCaption(v)).appendChild(a = Template.createAnchor('x', function(ev) {
			criteria.selectedIds[this.myRecord.id] = false;
			$(this.parentNode).remove();
		}));
		a.myRecord = v;
		criteria.selectedIds[v.id] = true;

		// Empty the text field and reset focus there.
		(a = criteria.field).value = '';
		a.focus();
		
		var cb = criteria.callback;
		if (cb.doPostSelect)
			cb.doPostSelect(criteria);
	};

	return o;
}

DropdownTagger.retrieve = function(criteria)
{
	var s = [];
	var r = [];
	var ids = criteria.selectedIds;

	for (var id in ids)
	{
		if (ids[id])
			s[s.length] = id;
		else
			r[r.length] = id;
	}

	return { selectedIds: s, removedIds: r };
}

DropdownTagger.populate = function(criteria, values)
{
	var ids = criteria.selectedIds;
	var v, a, l = criteria.list;

	for (var i = 0; i < values.length; i++)
	{
		Template.addElem(l, 'li', this.toCaption(v = values[i])).appendChild(a = Template.createAnchor('x', function(ev) {
			criteria.selectedIds[this.myRecord.id] = false;
			$(this.parentNode).remove();
		}));
		a.myRecord = v;
		ids[v.id] = true;
	}
}

DropdownTagger.reset = function(criteria)
{
	criteria.selectedIds = [];
	criteria.list.innerHTML = '';
}

/** Create drop down for media selection. */
var MediaDropdownTagger = $.extend(true, {}, DropdownTagger);
MediaDropdownTagger.toCaption_super = MediaDropdownTagger.toCaption;
MediaDropdownTagger.toCaption = function(v)
{
	return '<img src="' + thumbsPath + v.name + '" width="16" height="16" />&nbsp;' + v.name + ' (' + v.id + ')';
}
