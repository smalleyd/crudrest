var META_LOGIN = {
	NAME: 'login',
	POST_URL: '/login',
	LOGOUT_URL: '/logout',
	GET_LOGIN_INFO_URL: '/loginInfo',
	SINGULAR: 'Login',
	PLURAL: 'Login',
	FIELDS: [ new EditField('userName', 'User Name', true, false, 50, 30), new PassField('password', 'Password', true, 50, 30) ],
	onEditorPostLoad: function(criteria)
	{
		var h = criteria.header;
		var a = h.lastChild;
		h.innerHTML = 'Login';
		h.appendChild(a);	// Close (X) anchor.
	},
	doLogin: function(cb, body) {
		var me = this;
		var callback = function() {
			me.anchorUp();
			if (cb)
				cb();
		};
		this.run({ filter: { isSearch: true }, value: { value: {} }, callback: callback }, body, 'get');
	},
	doLogout: function() {
		var me = this;
		this.post(this.LOGOUT_URL, {}, function(v) { me.anchorUp(); });
	},
	doStart: function() {
		this.ANCHOR = document.getElementById('loginLink');
		this.LOGIN_INFO = document.getElementById('loginInfo');
		this.anchorUp();
	},
	anchorUp: function()
	{
		var me = this;
		this.get(this.GET_LOGIN_INFO_URL, {}, function(v) {
			var e = me.ANCHOR;
			var a = me.LOGIN_INFO;
			if (null == v)
			{
				a.innerHTML = '';
				a.onclick = a.myRecord = undefined;
				e.innerHTML = 'Login';
				e.onclick = function(ev) { me.doLogin(); return false; };
			}
			else
			{
				a.innerHTML = v.screen_name;
				a.myRecord = v;
				a.onclick = function(ev) { var t = this; UsersHandler.EDITOR.doEdit(this.myRecord.id,
					function(c) { t.innerHTML = c.value.value.screen_name; }); };
				e.innerHTML = 'Logout';
				e.onclick = function(ev) { me.doLogout(); return false; };
			}
		});
	},
};

var LoginHandler = new EditTemplate(META_LOGIN);
