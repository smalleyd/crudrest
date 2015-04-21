function TabTemplate() {}
function Tab(id, caption) { this.id = id; this.caption = caption; }

TabTemplate.prototype = new Template();
TabTemplate.prototype.CSS_MAIN = 'tabber';
TabTemplate.prototype.CSS_TABS = 'tabs';

TabTemplate.prototype.init = function(body)
{
	var me = this;
	var criteria = { anchors: [] };	// Maintains the state.
	var a, aa, b, t, o = document.createElement('div');
	o.className = this.CSS_MAIN;

	// Create the links and tabs.
	o.appendChild(aa = this.createElement('div', undefined, this.CSS_TABS));
	for (var i = 0; i < this.TABS.length; i++)
	{
		t = this.TABS[i];
		aa.appendChild(a = criteria.anchors[i] = this.createAnchor(t.caption,
			function(ev) { me.handleAction(criteria, this); }));
		a.myIndex = i;
		a.myInit = false;
		a.myTab = t;

		o.appendChild(b = document.createElement('div'));
		(a.myBody = $(b)).hide();

		criteria[t.id] = $(a);
	}

	// Show the first tab.
	t = criteria.currentTab = this.TABS[0];
	a = criteria.currentAnchor = criteria.anchors[0];
	(b = a.myBody).show();
	a.myInit = true;
	a.className = 'selected';
	this[t.id](b);

	body.empty();
	body.append(o);

	return criteria;
}

TabTemplate.prototype.handleAction = function(criteria, elem)
{
	var l = criteria.currentTab;
	var a = criteria.currentAnchor;
	a.myBody.hide();
	a.className = '';

	var t = criteria.currentTab = elem.myTab;
	criteria.currentAnchor = elem;

	// Only re-init, if the user has clicked on the selected tab. Otherwise just display.
	if (a.myIndex == elem.myIndex)
		elem.myInit = false;

	// KA-19309: Must show the body first so that focus can be set to generated fields. DLS on 3/17/2011.
	elem.className = 'selected';
	elem.myBody.show();

	if (!elem.myInit)
	{
		elem.myInit = true;
		this[t.id](elem.myBody);
	}
}
