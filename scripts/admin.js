var AdminApp = new TabTemplate();

AdminApp.TABS = [ { id: 'doLanguages', caption: 'Languages' } ];

AdminApp.doLanguages = function(body) { LanguagesHandler.init(body); }

var LanguagesHandler = new ListTemplate({
	NAME: 'language',
	SINGULAR: 'Language',
	PLURAL: 'Languages',
	RESOURCE: 'languages',
	CAN_ADD: true,
	CAN_EDIT: true,

	COLUMNS: [ new TextColumn('id', 'ID', undefined, true),
	           new EditColumn('name', 'Name'),
	           new TextColumn('active', 'Active?') ],
	FIELDS: [ new EditField('id', 'ID', true, false, 5, 5),
	          new EditField('name', 'Name', true, false, 64, 50),
	          new BoolField('active', 'Is Active?', true) ] /*,
	SEARCH: {
		NAME: 'language',
		SINGULAR: 'Language',
		PLURAL: 'Languages',
		RESOURCE: 'languages',
		FIELDS: []
	} */
});
