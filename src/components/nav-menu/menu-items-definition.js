import {getMarketingValue} from "../marketing-setting";

const MenuItemsDefinitions = [
    {name: 'all-plans', iconClass: 'fa-chevron-right', show: true, pathTransform: sp => `all-plans/${sp}`},
    {
        name: 'profile',
        iconClass: 'fa-chevron-right',
        showIf: () => getMarketingValue('CFP_HIDE_MY_BIO') !== '1',
        pathTransform: sp => `all-plans/${sp}/profile`
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
