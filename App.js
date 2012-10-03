Ext.define('ScopeChange', {
    extend: 'Rally.app.App',
    layout: { type: 'vbox', align: 'stretch' },
    appName:'Story Board',
    componentCls: 'app',

    _filters:undefined,
    _types:['User Story'],

    items:[
        {
            xtype:'container',
            itemId:'header',
            cls:'header'
        },
        {
            xtype:'container',
            itemId:'bodyContainer',
            height:'90%',
            width:'100%',
            autoScroll:true
        }
    ],

    _setFilter:function(iteration) {
        this._filters = [
            {
                property:'Iteration.Name',
                value:iteration
            }
        ];
        this._buildBoard();
    },

    _setTypes:function(box, checked) {
        if(this._types.indexOf(box.inputValue) >= 0 && !checked) {
            this._types.splice(this._types.indexOf(box.inputValue), 1);
        } else if((this._types.indexOf(box.inputValue) < 0) && checked) {
            this._types.push(box.inputValue);
        }
        this._buildBoard();
    },

    _buildBoard:function() {
        if(this._filters === undefined) {
            return;
        }
        this.setLoading();
        if(this._cardBoard !== undefined) {
            this.down('#bodyContainer').remove(this._cardBoard);
        }
        this._cardBoard = Ext.widget('rallycardboard', {
            types: this._types,
            itemId:'cardboard',
            name: 'cardboard',
            attribute:'ScheduleState',
            listeners: {
                    load: function(board, eOpts) {
                        this.setLoading(false);
                    },
                    scope: this
            },
            storeConfig:{
                filters: this._filters
            }
        });
        //this.setLoading(false);
        this.down('#bodyContainer').add(this._cardBoard);
    },

    // addition of the help component is an afterthought...no support for it built into the SDK atm that I see, so this is a quick and dirty for now.
    _buildHelpComponent:function (config) {
        var host = this.context.getWorkspace()._ref.substr(0, this.context.getWorkspace()._ref.indexOf("/slm/"));
        return Ext.create('Ext.Component', Ext.apply({
            renderTpl:'<a href="http://www.rallydev.com/help/story-board?basehost='+host+'" title="Launch Help for Story Board App" target="_blank" ' +
                'class="help"><img id="appHeaderrighthelp" class="appHelp" src="'+host+'/apps/2.0p3/rui/resources/themes/images/default/help/icon_help.png" title="Launch Help" alt="Launch Help" style=""></a>'
        }, config));
    },

    /**
* @override
*/
    launch:function () {
        this.insert(0,this._buildHelpComponent({}));
        this.down('#header').add([
            {
                xtype: 'rallyaddnew',
                recordTypes: ['User Story', 'Defect', 'Defect Suite'],
                cls:'add-new',
                ignoredRequiredFields: ['Name'],
                listeners: {
                    recordadd: function(addNew, result) {
                        this.down('#cardboard').addCard(result.record);
                    },
                    beforerecordadd: function(addNew, result) {
                        result.record.set("Iteration", this.down('#iterationcombobox').getValue());
                    },
                    scope: this
                }
            },
            {
                xtype : 'fieldcontainer',
                fieldLabel : 'Show',
                defaultType: 'checkboxfield',
                layout: 'hbox',
                cls:'checkbox',
                labelWidth: 40,
                width: 300,
                labelAlign: 'right',
                items: [
                    {
                        boxLabel : 'User Stories',
                        inputValue: 'User Story',
                        checked : true,
                        width: 78,
                        listeners:{
                            change:function(box, checked) {
                                this.up('[appName="Story Board"]')._setTypes(box, checked);
                            }
                        },
                        scope: this
                    }, {
                        boxLabel : 'Defects',
                        inputValue: 'Defect',
                        padding: "0 10",
                        width: 56,
                        listeners:{
                            change:function(box, checked) {
                                this.up('[appName="Story Board"]')._setTypes(box, checked);
                            }
                        },
                        scope: this
                    }, {
                        boxLabel : 'Defect Suites',
                        inputValue: 'Defect Suite',
                        padding: "0 20",
                        width: 84,
                        listeners:{
                            change:function(box, checked) {
                                this.up('[appName="Story Board"]')._setTypes(box, checked);
                            }
                        },
                        scope: this
                    }
                ]
            },
            {
                xtype : 'fieldcontainer',
                fieldLabel : 'Iteration',
                pack: 'end',
                labelAlign: 'right',
                cls: 'iteration-picker',
                items: [
                    {
                        xtype:'rallyiterationcombobox',
                        itemId:'iterationcombobox',
                        width: 300,
                        listeners:{
                            change:function(combo) {
                                this._setFilter(combo.getRawValue());
                            },
                            ready:function(combo) {
                                this._setFilter(combo.getRawValue());
                            },
                            scope:this
                        }
                    }
                ]
            }
        ]);
    }
});
