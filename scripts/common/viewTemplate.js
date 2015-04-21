function ViewTemplate(properties) { this.load(properties); }

ViewTemplate.prototype = new Template();

ViewTemplate.prototype.getTitle = function(criteria) { return SINGULAR; }

ViewTemplate.prototype.open = function(params, body, url)
{
	if (undefined == url)
		url = this.GET_URL;

	this.run({ filter: params, url: url }, body, 'get');
}

ViewTemplate.prototype.openById = function(id, params, body)
{
	this.open(params, body, this.GET_URL + id);
}

ViewTemplate.prototype.onPostLoad = function(criteria)
{
	if (criteria.isModal)
	{
		criteria.body.center();
		criteria.header.style.width = criteria.form.offsetWidth + 'px';	// On IE7 the H1 doesn't do a 100% width. DLS on 3/28/2011.
	}

	if (this.onViewerPostLoad)
		this.onViewerPostLoad(criteria);
}

ViewTemplate.prototype.handleClose = function(criteria)
{
	if (criteria.isModal)
		criteria.body.closeMe();
}

ViewTemplate.prototype.generate = function(criteria)
{
	var me = this;
	var isModal = criteria.isModal;
	var e, s, o = criteria.form = this.createElement('form');
	var value = criteria.value;

	o.className = this.NAME;

	e = criteria.header = this.addHeader(o, this.getTitle(criteria));
	if (isModal)
	{
		e.appendChild(this.createAnchor('X',
			function(ev) { me.handleClose(criteria); }));

		this.makeElementDraggable(criteria, e);
	}

	this.append(criteria, o);

	s = this.addDiv(o, undefined, 'close');
	s.appendChild(this.genButton('closer', 'Close',
		function(ev) { me.handleClose(criteria); }));

	return o;
}

ViewTemplate.prototype.append = function(criteria, o)
{
	var e, s, value = criteria.value;

	s = this.addDiv(o);
	e = this.addCaption(s);
	e.appendChild(this.createImg(value.image_src, value.title));
	this.addSpan(s, value.contents);

	if (!value.is_available)
		this.addDiv(o, 'Thank you for your interest, but I have already been adopted!', 'contact');
	else if (value.contact_name)
	{
		s = this.addDiv(o, 'For more information, please contact ', 'contact');
		s.appendChild(this.createLink(value.contact_name, 'mailto:' + value.contact_email +
			'?subject=Regarding ' + value.name));
	}
}
