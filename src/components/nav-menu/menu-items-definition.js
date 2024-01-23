import {getMarketingValue} from "../marketing-setting";

const MenuItemsDefinitions = [
    {name: 'all-plans', iconClass: 'fa-chevron-right', show: true, spRouteTransform: spId => `all-plans/${spId}`},
    {
        name: 'profile',
        iconClass: 'fa-chevron-right',
        spRouteTransform: spId => `all-plans/${spId}/profile`,
        showIf: () => getMarketingValue('CFP_HIDE_MY_BIO') !== '1'
    },
    {name: 'tracks_guide', iconClass: 'fa-chevron-right'},
    {name: 'selection_process', iconClass: 'fa-chevron-right'},
];

export default MenuItemsDefinitions;

/*

const MenuItemsDefinitions = [
     {name: 'menuItemName', iconClass: 'fa-users', show: true,
                childs: [
                    {name:'subItemName1', linkUrl:`linkSubItemName1`},
                    {name:'subItemName1', linkUrl:`linkSubItemName1`}
                ]
            }
];

 */
